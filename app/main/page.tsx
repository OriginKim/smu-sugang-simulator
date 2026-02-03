"use client";

import { useState, useEffect, useMemo } from "react";
import ALL_COURSES from "../../data/courses.json";

type UserInfo = {
  college: string;
  dept: string;
  grade: string;
  name: string;
  studentId: string;
  isEarlyBird: boolean;
  clickTime: number;
  targetTimeStr: string;
};

type Course = {
  id: number;
  dept: string;
  grade: string;
  classification: string;
  code: string;
  credit: number;
  name: string;
  professor: string;
  time_location: string;
};

type AppliedCourse = Course & { apply_date: string };

export default function SugangMainPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [viewMode, setViewMode] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);

  const [liberalClass, setLiberalClass] = useState("교선");
  const [liberalArea, setLiberalArea] = useState("선택");
  const [filterCollege, setFilterCollege] = useState("-대학선택-");
  const [filterDept, setFilterDept] = useState("-학과선택-");

  const [appliedCourses, setAppliedCourses] = useState<AppliedCourse[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("userInfo");
    if (saved) setUserInfo(JSON.parse(saved));
  }, []);

  const startProcessing = (min: number, max: number) => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    setIsProcessing(true);
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        setIsProcessing(false);
        resolve(true);
      }, delay)
    );
  };

  // 장바구니 생성
  const cartCourses = useMemo<Course[]>(() => {
    if (!userInfo) return [];

    const myDeptCourses = (ALL_COURSES as Course[]).filter((c) => c.dept === userInfo.dept);
    const targetGrade = userInfo.grade.replace("학년", "");

    const priorityMajor = myDeptCourses.filter((c) => c.grade === targetGrade);
    const otherMajor = myDeptCourses.filter((c) => c.grade !== targetGrade);

    const majorPool = [...priorityMajor.sort(() => Math.random() - 0.5), ...otherMajor.sort(() => Math.random() - 0.5)];
    const liberalPool = (ALL_COURSES as Course[]).filter((c) => c.classification.startsWith("교")).sort(() => Math.random() - 0.5);

    const selectedMajors = majorPool.slice(0, 7);
    const neededLiberalCount = 14 - selectedMajors.length;

    const majorIds = new Set(selectedMajors.map((m) => m.id));
    const uniqueLiberals = liberalPool.filter((l) => !majorIds.has(l.id)).slice(0, neededLiberalCount);

    return [...selectedMajors, ...uniqueLiberals].sort(() => Math.random() - 0.5);
  }, [userInfo]);

  const colleges = useMemo(
    () => ["-대학선택-", "인문사회과학대학", "사범대학", "경영경제대학", "융합공과대학", "문화예술대학"],
    []
  );

  const deptsInCollege = useMemo(() => {
    if (filterCollege === "-대학선택-") return ["-학과선택-"];
    const filtered = (ALL_COURSES as Course[]).filter((c) => c.dept.startsWith(filterCollege));
    return ["-학과선택-", ...Array.from(new Set(filtered.map((c) => c.dept)))];
  }, [filterCollege]);

  // 리스트 필터
  const filteredCourses = useMemo<Course[]>(() => {
    let list = [...(ALL_COURSES as Course[])];

    if (viewMode === "default") list = cartCourses;
    else if (viewMode === "myDept") list = list.filter((c) => c.dept === userInfo?.dept);
    else if (viewMode === "liberal") {
      list = list.filter((c) => c.classification === liberalClass);
      if (liberalArea !== "선택") list = list.filter((c) => c.dept.includes(liberalArea) || c.name.includes(liberalArea));
    } else if (viewMode === "teaching") list = list.filter((c) => c.classification === "교직");
    else if (viewMode === "byDept") {
      if (filterCollege !== "-대학선택-") list = list.filter((c) => c.dept.startsWith(filterCollege));
      if (filterDept !== "-학과선택-") list = list.filter((c) => c.dept === filterDept);
    } else if (viewMode === "general") list = list.filter((c) => c.classification === "일선");

    if (searchTerm) list = list.filter((c) => c.name.includes(searchTerm) || c.code.includes(searchTerm));

    return list;
  }, [viewMode, cartCourses, userInfo, liberalClass, liberalArea, filterCollege, filterDept, searchTerm]);

  const handleApply = async (course: Course) => {
    if (appliedCourses.find((ac) => ac.id === course.id)) {
      alert("이미 수강신청된 과목입니다.");
      return;
    }
    if (appliedCourses.find((ac) => ac.name === course.name)) {
      alert("이미 다른 분반을 신청하였습니다.");
      return;
    }

    await startProcessing(1500, 8000);

    const now = new Date();
    const applyTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${now.toLocaleTimeString(
      "ko-KR",
      { hour12: false }
    )}`;

    setAppliedCourses((prev) => [...prev, { ...course, apply_date: applyTime }]);
    alert(`[${course.name}] 신청되었습니다.`);
  };

  const handleCancel = (courseId: number) => {
    if (confirm("정말로 수강신청을 취소하시겠습니까?")) {
      setAppliedCourses((prev) => prev.filter((c) => c.id !== courseId));
    }
  };

  const changeView = async (mode: string) => {
    await startProcessing(300, 1200);
    setViewMode(mode);
    setIsPopupOpen(false);
    setSearchTerm("");
  };

  if (!userInfo) return null;

  const totalCredits = appliedCourses.reduce((s, c) => s + Number(c.credit ?? 0), 0);

  return (
    <div className="w-full h-screen flex flex-col bg-[#eff3f6] font-['Malgun_Gothic',sans-serif] overflow-hidden text-[#333]">
  {isProcessing && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10">
      <div className="bg-white border-2 border-[#1A2962] p-6 shadow-2xl flex items-center gap-5 min-w-[300px]">
        
        <img src="/progress.gif" alt="처리중"  />

        
      </div>
    </div>
  )}


      <header className="h-[42px] bg-[#1A2962] flex items-center justify-between px-3 shrink-0 border-b border-black z-50">
        <span className="text-white font-bold text-[14px]">SANGMYUNG UNIVERSITY</span>
        <div className="text-white text-[11px] font-bold">
          {userInfo.dept} | {userInfo.grade} | {userInfo.name} ▶▶▶
          <button
            onClick={() => (window.location.href = "/")}
            className="ml-3 bg-red-600 px-2 py-[2px] rounded text-white text-[10px] font-bold"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden text-black">
        <aside className="w-[230px] border-r border-[#cbd5e1] flex flex-col p-1 space-y-1 shrink-0 overflow-y-auto bg-white shadow-inner">
          <div className="border border-[#cbd5e1] p-2 mb-2 bg-[#f8f9fa] text-[10px] space-y-1 rounded-sm">
            <p className="font-bold text-[#1A2962] text-[11px] border-b pb-1 mb-1">■ 사용자정보</p>
            <p>소속: {userInfo.dept}</p>
            <p>학년: {userInfo.grade}</p>
            <p className="text-red-600 font-bold">신청가능학점: 9~22학점</p>
          </div>

          <div className="space-y-[1px]">
            <MenuRow name="장바구니조회" onClick={() => changeView("default")} active={viewMode === "default"} />
            <MenuRow name="나의주전공강좌" onClick={() => changeView("myDept")} active={viewMode === "myDept"} />

            <div className="border border-[#cbd5e1] bg-white">
              <div
                onClick={() => changeView("liberal")}
                className={`flex justify-between items-center px-2 h-7 cursor-pointer hover:bg-blue-50 ${
                  viewMode === "liberal" ? "bg-blue-100 font-bold" : ""
                }`}
              >
                <span className="text-[11px] text-[#1A2962]">■ 교양강좌</span>
                <span className="bg-[#41518b] text-white text-[9px] px-1 rounded-sm shadow-sm">조회</span>
              </div>

              <div className="p-2 bg-[#f2f6f9] space-y-1 border-t text-[9px]">
                <div className="flex items-center gap-1">
                  <span className="text-red-500">*</span>
                  <span>이수구분</span>
                  <select
                    value={liberalClass}
                    onChange={(e) => {
                      setLiberalClass(e.target.value);
                      setLiberalArea("선택");
                    }}
                    className="flex-1 border h-5 outline-none bg-white"
                  >
                    <option value="교필">교필</option>
                    <option value="교선">교선</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-red-500">*</span>
                  <span>영역</span>
                  <select
                    value={liberalArea}
                    onChange={(e) => setLiberalArea(e.target.value)}
                    className="w-[130px] border h-5 outline-none bg-white truncate"
                  >
                    <option value="선택">선택</option>
                    {liberalClass === "교선" ? (
                      <>
                        <option value="교양과인성">기초(교양과인성)</option>
                        <option value="균형(인문)">균형(인문)</option>
                        <option value="균형(사회)">균형(사회)</option>
                        <option value="균형(자연)">균형(자연)</option>
                        <option value="균형(공학)">균형(공학)</option>
                        <option value="균형(예술)">균형(예술)</option>
                      </>
                    ) : (
                      <>
                        <option value="컴퓨팅사고">기초(컴퓨팅사고와데이터의이해)</option>
                        <option value="다양성존중">핵심(다양성존중역량)</option>
                        <option value="윤리실천">핵심(윤리실천역량)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <MenuRow name="교직강좌" onClick={() => changeView("teaching")} active={viewMode === "teaching"} />

            <div className="border border-[#cbd5e1] bg-white">
              <div
                onClick={() => changeView("byDept")}
                className={`flex justify-between items-center px-2 h-7 cursor-pointer hover:bg-blue-50 ${
                  viewMode === "byDept" ? "bg-blue-100 font-bold" : ""
                }`}
              >
                <span className="text-[11px] text-[#1A2962]">■ 학과별강좌</span>
                <span className="bg-[#41518b] text-white text-[9px] px-1 rounded-sm shadow-sm">조회</span>
              </div>

              <div className="p-2 bg-[#f2f6f9] space-y-1 border-t text-[9px]">
                <select
                  value={filterCollege}
                  onChange={(e) => {
                    setFilterCollege(e.target.value);
                    setFilterDept("-학과선택-");
                  }}
                  className="w-full border h-5 outline-none bg-white"
                >
                  {colleges.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full border h-5 outline-none bg-white"
                >
                  {deptsInCollege.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <MenuRow name="일반선택강좌" onClick={() => changeView("general")} active={viewMode === "general"} />
            <MenuRow name="재수강과목" onClick={() => {}} />
            <MenuRow name="취득학점" onClick={() => {}} />
          </div>
        </aside>

        <main className="flex-1 p-1 gap-1 flex flex-col overflow-hidden relative">
          {isPopupOpen && (
            <div className="absolute top-2 left-2 right-2 bottom-4 bg-white border border-[#1A2962] z-40 shadow-xl flex flex-col rounded-sm">
              <div className="bg-[#1A2962] text-white px-3 py-2 flex justify-between items-center text-[11px] font-bold">
                <span>[수강신청 공지사항]</span>
                <button onClick={() => setIsPopupOpen(false)}>✖</button>
              </div>

              <div className="p-5 text-[11px] leading-[1.7] max-h-[450px] overflow-y-auto text-black font-medium flex-1">
                <p className="mb-4 text-sm font-bold text-blue-800 underline">
                  ※ 실제 상황 시뮬레이션: 로그인 지연 최대 40초 / 신청 지연 최대 8초 적용 중.
                </p>

                {/* ✅ 조기 로그인 감지 문구(팝업 안에 정상 위치) */}
                {userInfo.isEarlyBird && (
                  <p className="mb-4 text-sm font-black text-red-600 underline italic">
                    ※ 시작시간 이전 로그인 감지: 신청 기능이 비활성화되었습니다. 로그아웃 후 다시 로그인하세요.
                  </p>
                )}

                <p className="font-bold text-blue-700 mb-1">[수강신청 시스템] 문의처: 02-2287-5235</p>
                <ul className="list-decimal pl-4 mb-4">
                  <li className="text-red-600 font-bold underline">2개 이상 PC에서 동시 로그인 불가.</li>
                  <li className="text-red-600 font-black underline italic">항상 최종적으로 접속한 서비스가 활성화 됩니다.</li>
                  <li className="text-red-600 font-bold">시작시간 이전 로그인 시 신청버튼이 보이지 않으므로 재로그인 바랍니다.</li>
                </ul>

                <p className="font-bold text-blue-700 mb-1">[수강신청 유의사항] 문의처: 02-2287-5012</p>
                <ul className="list-disc pl-4 mb-4">
                  <li className="text-red-600 font-bold underline">캠퍼스별 시작시간을 반드시 확인 바랍니다.</li>
                  <li className="text-red-600 font-bold italic">마지막날(2/6) 제한인원 재설정: 11:30~12:00 / 14:30~15:00 / 16:30~17:00</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex-[6] bg-white border border-[#cbd5e1] flex flex-col overflow-hidden shadow-sm">
            <div className="bg-[#f8f9fa] p-1 border-b text-[11px] font-bold flex justify-between px-3 text-[#1A2962]">
              <span>■ 개설강좌 리스트 [{viewMode === "default" ? "장바구니" : viewMode.toUpperCase()}]</span>
              <span className="text-blue-600 font-bold">조회되었습니다.</span>
            </div>

            <div className="flex-1 overflow-auto bg-white text-black">
              <table className="w-full text-[10px] text-center border-collapse">
                <thead className="bg-[#f2f4f7] sticky top-0 border-b border-[#bbb] z-10 shadow-sm">
                  <tr className="h-8">
                    <th className="border-r w-10 font-normal">No</th>
                    <th className="border-r w-14 text-blue-700 font-bold font-normal">신청</th>
                    <th className="border-r w-16 font-normal">이수구분</th>
                    <th className="border-r w-28 font-normal font-bold">학수번호</th>
                    <th className="border-r w-8 font-normal text-red-600 font-bold">학점</th>
                    <th className="border-r font-normal font-bold">교과목명</th>
                    <th className="border-r w-20 font-normal">담당교수</th>
                    <th className="font-normal px-2 text-left">강의시간(강의실)</th>
                  </tr>
                </thead>

                <tbody className="text-black">
                  {filteredCourses.map((c, idx) => (
                    <tr key={c.id} className="h-8 border-b hover:bg-[#eef3f9] bg-white">
                      <td className="border-r text-gray-400 font-mono">{idx + 1}</td>

                      <td className="border-r px-1">
                        {/* ✅ 핵심: 조기 로그인(isEarlyBird=true)면 신청 버튼 “아예 안 보이게” */}
                        {!userInfo.isEarlyBird ? (
                          <button
                            onClick={() => handleApply(c)}
                            className="bg-[#1A2962] text-white w-full py-[2px] rounded-sm font-bold text-[9px] active:scale-95 shadow-sm"
                          >
                            신청
                          </button>
                        ) : (
                          <span className="text-gray-300 text-[9px] font-bold">-</span>
                        )}
                      </td>

                      <td className="border-r">{c.classification}</td>
                      <td className="border-r font-mono text-blue-700">{c.code}</td>
                      <td className="border-r font-bold text-red-600">{c.credit}</td>
                      <td className="border-r text-left px-2 font-bold text-[#1A2962] truncate">{c.name}</td>
                      <td className="border-r">{c.professor}</td>
                      <td className="text-left px-2 text-[#777] truncate font-mono text-[9px]">{c.time_location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!isPopupOpen && (
            <div className="flex-[4] bg-white border border-[#cbd5e1] flex flex-col overflow-hidden shadow-inner text-black">
              <div className="bg-[#f8f9fa] p-1 border-b text-[11px] font-bold text-red-600 flex justify-between px-3">
                <span>■ 수강신청내역 [신청: {appliedCourses.length}건]</span>
                <span className="text-[#1A2962]">신청학점 계: {totalCredits}</span>
              </div>

              <div className="flex-1 overflow-auto bg-[#fdfdfd] text-black">
                <table className="w-full text-[10px] text-center border-collapse text-black">
                  <thead className="bg-[#f2f4f7] border-b border-[#bbb]">
                    <tr className="h-8">
                      <th className="border-r w-8 font-normal">No</th>
                      <th className="border-r w-12 font-normal text-red-600 font-bold">취소</th>
                      <th className="border-r">교과목명</th>
                      <th className="border-r w-8 font-normal text-red-600">학점</th>
                      <th>신청일시</th>
                    </tr>
                  </thead>

                  <tbody>
                    {appliedCourses.map((ac, i) => (
                    <tr key={`${ac.id}-${ac.apply_date}`} className="h-8 border-b bg-[#fff9e6] text-black">
                        <td className="border-r text-gray-400">{i + 1}</td>
                        <td className="border-r px-1">
                        <button
                            onClick={() => handleCancel(ac.id)}
                            className="bg-red-500 text-white w-full py-[1px] rounded-sm font-bold text-[9px] active:scale-95 shadow-md shadow-red-200"
                        >
                            취소
                        </button>
                        </td>
                        <td className="border-r text-left px-2 font-bold">{ac.name}</td>
                        <td className="border-r font-bold text-red-600">{ac.credit}</td>
                        <td className="text-[9px] text-gray-500 font-mono">{ac.apply_date}</td>
                    </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function MenuRow({
  name,
  onClick,
  active = false,
  noBorder = false,
}: {
  name: string;
  onClick: () => void;
  active?: boolean;
  noBorder?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex justify-between items-center px-2 h-7 cursor-pointer hover:bg-blue-50 ${
        !noBorder ? "border border-[#cbd5e1]" : ""
      } ${active ? "bg-blue-100 font-bold" : "bg-white"}`}
    >
      <span className="text-[11px] text-[#1A2962]">■ {name}</span>
      <button className="bg-[#41518b] text-white text-[9px] px-1 rounded-sm shadow-sm">조회</button>
    </div>
  );
}
