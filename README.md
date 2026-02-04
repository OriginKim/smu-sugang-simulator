# 🎓 SMU Sugang Simulator (상명대 수강신청 시뮬레이터)

상명대학교 수강신청 시스템의 **실제 UX 흐름과 시간 압박감**을 최대한 비슷하게 구현한  
수강신청 연습용 시뮬레이터 웹사이트입니다.

> ✅ 이 프로젝트는 **연습용 시뮬레이터**이며, 실제 수강신청 서버와는 연결되지 않습니다.

---

## 🔗 Demo (Vercel)

- **Production:** https://smu-sugang-trainer.vercel.app/

---

## 📌 왜 만들었나요?

수강신청을 할 때 실제로 자주 발생하는 상황들이 있습니다.

- 너무 일찍 로그인해서 버튼이 안 뜨는 경우
- 정각에 눌렀는데도 로딩 때문에 늦게 들어간 느낌이 드는 경우
- 신청 버튼을 눌러도 처리 시간이 랜덤하게 걸려서 긴장되는 경우

이 프로젝트는 단순한 UI 복제보다, “실전 흐름을 연습할 수 있는 경험”을 만드는 데 집중했습니다.

---

## 📊 Analytics (Vercel)

배포 후 Vercel Analytics를 통해 다음 지표를 확인했습니다.

| 👥 Visitors | 👀 Page Views | 📉 Bounce Rate |
| :---: | :---: | :---: |
| **1,655** | **5,215** | **37%** |
<img width="1094" height="545" alt="image" src="https://github.com/user-attachments/assets/cb695127-f643-43bf-84e2-a9c43a5b381e" />


---

## 🧩 주요 기능

### ✅ 1) 목표 시간(Target Time) 설정
- 수강신청 목표 시간을 지정할 수 있습니다 (기본: 오늘 10:00:00)
- 로그인 성공 판정은 **로그인 버튼을 누른 시각(시뮬레이션 시계 기준)**으로 고정됩니다

### ✅ 2) 조기 로그인 감지 (Early Bird Mode)
- 목표 시간보다 빠르게 로그인 버튼을 누르면 조기 로그인으로 판정됩니다
- 조기 로그인 상태에서는 “신청” 버튼이 표시되지 않아  
  실제 수강신청에서 겪는 당혹감을 체험할 수 있습니다

### ✅ 3) 로그인 지연(로딩) 시뮬레이션
- 로그인 과정에서 로딩/딜레이가 발생합니다
- 목표 시간 이후 로그인은 랜덤 딜레이로 지연감을 체험할 수 있도록 했습니다

### ✅ 4) 신청 처리 지연(Apply Delay) 시뮬레이션
- “신청” 버튼 클릭 시 처리 시간이 랜덤하게 발생합니다
- 신청 완료 후 신청내역/시각 기록/학점 합계를 업데이트합니다

### ✅ 5) 중복 신청 방지
- 동일 과목 ID 중복 신청 불가
- 동일 과목명(다른 분반) 중복 신청 불가

---

## 📦 기술 스택

| 구분 | 사용 기술 |
|------|----------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data | JSON 기반 과목 데이터 (`data/courses.json`) |
| Analytics | Vercel Analytics |
| Deploy | Vercel |

---

## ⚙️ 실행 방법 (로컬)

1) 설치
```bash
npm install
```
2) 개발 서버 실행
```bash
npm run dev
```
3) 접속

[http://localhost:3000](http://localhost:3000)


## 📁 프로젝트 구조
```bash
smu-sugang-practice/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx
│   ├── main/
│   │   └── page.tsx
│   └── favicon.ico
├── data/
│   └── courses.json
├── public/
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```
## 👤 제작자
- **김기원**
- GitHub: https://github.com/OriginKim


---
