"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  clickTime: number;      // 실제 클릭 시각(ms)
  clickSimTime: number;   // 가짜 시계 클릭 시각(ms)

  startTimeStr: string;   // 오늘 10:00:00
  leadSeconds: number;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function buildTodayISO(timeOnly: string) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = pad2(now.getMonth() + 1);
  const dd = pad2(now.getDate());
  return `${yyyy}-${mm}-${dd}T${timeOnly}`;
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>("setup");
  const [serverTime, setServerTime] = useState(new Date()); // login 화면에서만 "가짜 시간"로 갱신
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // ✅ 수강신청 시작시간 고정(오늘 10:00:00)
  const START_TIME_ONLY = "10:00:00";
  const startTimeStr = useMemo(() => buildTodayISO(START_TIME_ONLY), []);
  const startMs = useMemo(() => new Date(startTimeStr).getTime(), [startTimeStr]);

  // ✅ 옵션: 몇 초 전부터 시작할지
  const leadOptions = [5, 10, 15, 20, 30] as const;
  const [leadSeconds, setLeadSeconds] = useState<number>(10);

  // ✅ 가짜 시계 기준점(설정완료 순간에 세팅)
  const baseRealMsRef = useRef<number>(0);
  const baseSimMsRef = useRef<number>(0);

  // setup 값들
  const [userCollege, setUserCollege] = useState("-대학선택-");
  const [userDept, setUserDept] = useState("-학과선택-");
  const [userGrade, setUserGrade] = useState("4학년");
  const [studentId, setStudentId] = useState("2026123456");
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

  // ✅ (중요) login 화면에서만 타이머를 돌린다
  useEffect(() => {
    if (step !== "login") return;

    // "설정 완료"로 login 진입한 순간부터 시간이 흘러야 하므로,
    // login 진입 시점의 기준점을 여기서 잡는다.
    baseRealMsRef.current = Date.now();
    baseSimMsRef.current = startMs - leadSeconds * 1000;

    // 즉시 1회 반영
    setServerTime(new Date(baseSimMsRef.current));

    const timer = setInterval(() => {
      const elapsed = Date.now() - baseRealMsRef.current;
      const simNow = baseSimMsRef.current + elapsed;
      setServerTime(new Date(simNow));
    }, 30);

    return () => clearInterval(timer);
  }, [step, startMs, leadSeconds]);

  const handleCompleteSetup = () => {
    // ✅ 여기서 바로 시간을 돌리지 않고, step이 login이 되었을 때 useEffect가 시작됨
    setStep("login");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (userCollege === "-대학선택-" || userDept === "-학과선택-") {
      alert("소속 정보를 정확히 선택해주세요.");
      return;
    }

    const clickReal = Date.now();

    // ✅ 가짜 시계 클릭 시각 계산(기준점이 아직 없을 수 있으니 안전하게)
    const baseReal = baseRealMsRef.current || clickReal;
    const baseSim = baseSimMsRef.current || (startMs - leadSeconds * 1000);
    const clickSim = baseSim + (clickReal - baseReal);

    // ✅ 판정은 "가짜 시계의 클릭 시각"이 10:00:00보다 빠른가
    const isEarlyBird = clickSim < startMs;

    setIsProcessing(true);

    const delay = isEarlyBird ? 5000 : Math.floor(Math.random() * 35000) + 5000;

    setTimeout(() => {
      setIsProcessing(false);

      const userInfo: UserInfo = {
        college: userCollege,
        dept: userDept,
        grade: userGrade,
        name: "수뭉이",
        studentId,
        isEarlyBird,
        clickTime: clickReal,
        clickSimTime: clickSim,
        startTimeStr,
        leadSeconds,
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
                몇 초 전부터 시작할까요? (10:00:00 기준)
              </label>

              <select
                value={String(leadSeconds)}
                onChange={(e) => setLeadSeconds(Number(e.target.value))}
                className="w-full border-2 border-slate-100 bg-slate-50 p-3.5 rounded-xl font-bold text-black outline-none focus:border-[#003d91]"
              >
                {leadOptions.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}초 전부터
                  </option>
                ))}
              </select>
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
            onClick={handleCompleteSetup}
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
    <div className="min-h-screen bg-gradient-to-b from-slate-300 via-slate-100 to-slate-200 flex flex-col items-center justify-center p-6 font-sans">
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
        {/* <div className="flex justify-center mb-12">
          <img src="/logo_login_sugang.png" className="h-14 drop-shadow-lg" alt="logo" />
        </div> */}

        <div className="bg-white shadow-2xl rounded-3xl flex overflow-hidden border border-slate-100 min-h-[600px]">
          <div className="w-2/5 p-12 bg-[#f8fafc] border-r flex flex-col justify-between">
            <div className="text-black">
              <h3 className="text-xl font-black text-[#134ca8] mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#134ca8] rounded-full"></span>
                로그인 유의사항
              </h3>

              <div className="space-y-4">
                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">MY SETUP</p>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700">{userDept}</p>
                    <p className="text-sm font-medium text-slate-500">{userGrade} 재학</p>
                  </div>
                </div>

                <div className="p-5 bg-[#fff7f7] border border-red-100 rounded-2xl shadow-sm">
                  <p className="text-[11px] font-black text-red-400 uppercase tracking-widest mb-1">
                    START TIME
                  </p>
                  <p className="text-lg font-black text-red-600 font-mono">
                    {new Date(startTimeStr).toLocaleTimeString("ko-KR", { hour12: false })}
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 mt-2">
                    가짜 시계: {leadSeconds}초 전부터 표시
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
                CURRENT SERVER TIME
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
