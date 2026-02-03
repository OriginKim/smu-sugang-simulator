"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ALL_COURSES from "../data/courses.json";

type Step = "setup" | "login";

type UserInfo = {
  college: string;
  dept: string;
  grade: string;
  name: string;
  studentId: string;
  isEarlyBird: boolean;
  clickTime: number;     // 클릭 순간(판별 기준)
  targetTimeStr: string; // 설정한 목표 시간 문자열(표시/디버깅용)
};

export default function LoginPage() {
  const [step, setStep] = useState<Step>("setup");
  const [serverTime, setServerTime] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const [targetTimeStr, setTargetTimeStr] = useState("2026-02-05T10:00:00");
  const [userCollege, setUserCollege] = useState("-대학선택-");
  const [userDept, setUserDept] = useState("-학과선택-");
  const [userGrade, setUserGrade] = useState("4학년");
  const [studentId, setStudentId] = useState("202612345");
  const [password, setPassword] = useState("12345678");

  const colleges = [
    "-대학선택-",
    "인문사회과학대학",
    "사범대학",
    "경영경제대학",
    "융합공과대학",
    "문화예술대학",
  ];

  const deptList = useMemo(() => {
    if (userCollege === "-대학선택-") return ["-학과선택-"];
    const filtered = ALL_COURSES.filter((c: any) => c.dept.startsWith(userCollege));
    return ["-학과선택-", ...Array.from(new Set(filtered.map((c: any) => c.dept)))];
  }, [userCollege]);

  // 시계
  useEffect(() => {
    const timer = setInterval(() => setServerTime(new Date()), 30);
    return () => clearInterval(timer);
  }, []);

  // ✅ 로그인 클릭 시점 판별(딜레이로 시간 도달해도 판정 안 바뀜)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (userCollege === "-대학선택-" || userDept === "-학과선택-") {
      alert("소속 정보를 정확히 선택해주세요.");
      return;
    }

    const clickTime = Date.now();
    const targetTime = new Date(targetTimeStr).getTime();

    // 1ms라도 빠르면 조기 로그인
    const isEarlyBird = clickTime < targetTime;

    setIsProcessing(true);

    // ✅ 조기 로그인: 5초 고정 / 정상 로그인: 5~40초 랜덤
    const delay = isEarlyBird
      ? 5000
      : Math.floor(Math.random() * 35000) + 5000;

    setTimeout(() => {
      setIsProcessing(false);

      const userInfo: UserInfo = {
        college: userCollege,
        dept: userDept,
        grade: userGrade,
        name: "수뭉이",
        studentId,
        isEarlyBird,
        clickTime,
        targetTimeStr,
      };

      sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
      router.push("/main");
    }, delay);
  };

  // ===== setup 화면 =====
  if (step === "setup") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4 font-sans text-slate-800">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-[480px] border border-slate-200">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-1 bg-[#003d91] rounded-full mb-4"></div>
            <h2 className="text-2xl font-black text-[#003d91] tracking-tight text-center">
              시뮬레이션 환경 설정
            </h2>
          </div>

          <div className="space-y-6 text-black">
            <div>
              <label className="text-[12px] font-bold text-slate-500 ml-1 mb-2 block">
                수강신청 목표 시간 (초까지 정확히)
              </label>
              <input
                type="datetime-local"
                step="1"
                value={targetTimeStr}
                onChange={(e) => setTargetTimeStr(e.target.value)}
                className="w-full border-2 border-slate-100 bg-slate-50 p-3.5 rounded-xl font-bold text-black outline-none focus:border-[#003d91]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-bold text-slate-500 ml-1 mb-2 block">단과대학</label>
                <select
                  value={userCollege}
                  onChange={(e) => {
                    setUserCollege(e.target.value);
                    setUserDept("-학과선택-");
                  }}
                  className="w-full border-2 border-slate-100 bg-slate-50 p-3.5 rounded-xl text-black"
                >
                  {colleges.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-500 ml-1 mb-2 block">학년</label>
                <select
                  value={userGrade}
                  onChange={(e) => setUserGrade(e.target.value)}
                  className="w-full border-2 border-slate-100 bg-slate-50 p-3.5 rounded-xl text-black"
                >
                  {["1학년", "2학년", "3학년", "4학년"].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-500 ml-1 mb-2 block">소속(학과)</label>
              <select
                value={userDept}
                onChange={(e) => setUserDept(e.target.value)}
                className="w-full border-2 border-slate-100 bg-slate-50 p-3.5 rounded-xl text-black"
              >
                {deptList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setStep("login")}
            className="w-full bg-[#003d91] text-white py-4 rounded-xl font-bold mt-10 hover:bg-[#002d6b] shadow-lg"
          >
            설정 완료
          </button>
        </div>
      </div>
    );
  }

  // ===== login 화면 =====
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-2xl shadow-2xl flex flex-col items-center gap-6 min-w-[320px] border-2 border-[#1A2962]">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1A2962] rounded-full animate-spin"></div>
            <div className="text-center text-black">
              <p className="text-lg font-black text-[#1A2962] mb-1">로그인 처리 중</p>
              <p className="text-slate-400 text-sm font-medium">잠시만 기다려주세요...</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1100px]">
        <div className="flex justify-center mb-12">
          <img src="/logo_login_sugang.png" className="h-14 drop-shadow-sm" alt="logo" />
        </div>

        <div className="bg-white shadow-2xl rounded-3xl flex overflow-hidden border border-slate-100 min-h-[600px]">
          <div className="w-2/5 p-12 bg-[#f8fafc] border-r flex flex-col justify-between">
            <div className="text-black">
              <h3 className="text-xl font-black text-[#134ca8] mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#134ca8] rounded-full"></span>
                로그인 유의사항
              </h3>

              <div className="space-y-4">
                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">My Setup</p>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700">{userDept}</p>
                    <p className="text-sm font-medium text-slate-500">{userGrade} 재학</p>
                  </div>
                </div>

                <div className="p-5 bg-[#fff7f7] border border-red-100 rounded-2xl shadow-sm">
                  <p className="text-[11px] font-black text-red-400 uppercase tracking-widest mb-1">Target Time</p>
                  <p className="text-lg font-black text-red-600 font-mono">
                    {new Date(targetTimeStr).toLocaleTimeString("ko-KR", { hour12: false })}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep("setup")}
              className="text-[13px] text-slate-400 font-bold hover:text-[#003d91] self-start"
            >
              ← 정보 수정
            </button>
          </div>

          <div className="w-3/5 p-16 flex flex-col justify-center">
            <div className="mb-10 text-black">
              <h2 className="text-5xl font-black text-[#134ca8] tracking-tighter italic">LOGIN</h2>
              <p className="text-slate-400 font-medium font-bold">상명대학교 수강신청 시스템 시뮬레이터</p>
            </div>

            <div className="bg-slate-900 rounded-3xl border-[6px] border-slate-200 mb-10 h-[160px] flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <p className="text-[11px] font-black text-slate-500 mb-2 uppercase tracking-[0.3em] z-10">
                Current Server Time
              </p>
              <p className="text-[#ff4d4d] font-mono text-5xl font-black tracking-tighter tabular-nums z-10">
                {serverTime.getHours()}시 {serverTime.getMinutes()}분 {serverTime.getSeconds()}초
                <span className="text-2xl opacity-60 ml-1">
                  .{String(Math.floor(serverTime.getMilliseconds() / 10)).padStart(2, "0")}
                </span>
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full h-16 border-2 border-slate-100 bg-slate-50 px-6 text-black font-black rounded-2xl text-lg outline-none focus:border-[#134ca8]"
                placeholder="학번 입력"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-16 border-2 border-slate-100 bg-slate-50 px-6 text-black font-black rounded-2xl text-lg outline-none focus:border-[#134ca8]"
                placeholder="비밀번호 입력"
              />
              <button className="bg-[#134ca8] text-white w-full h-[68px] font-black text-xl hover:bg-[#0c357a] active:scale-[0.98] transition-all rounded-2xl shadow-xl mt-4">
                로그인
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
