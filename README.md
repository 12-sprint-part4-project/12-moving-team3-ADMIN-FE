# 무빙 (Moving) Admin Frontend

이사 견적 매칭 서비스 **무빙**의 관리자 프론트엔드입니다.

서비스 현황을 확인하고 회원·기사, 견적 요청·완료 건, 채팅, 신고, 리뷰를 관리할 수 있는 화면을 제공합니다.

## Team

|                     [추명곤](https://github.com/hogu-giriboy)                     |                   [김남진](https://github.com/knj980425)                   |
| :-------------------------------------------------------------------------------: | :------------------------------------------------------------------------: |
|            <img src="https://github.com/hogu-giriboy.png" width="80"/>            |          <img src="https://github.com/knj980425.png" width="80"/>          |
| **관리자 인증**<br/>**회원·기사·채팅·신고·리뷰 관리**<br/>**다국어·공통 목록 UX** | **대시보드·통계**<br/>**견적 요청·완료 건 관리**<br/>**공통 상세 탐색 UX** |

## Features

- **대시보드**: 핵심 지표, 견적 요청 추세·상태, 최근 신고·가입 회원·완료 건 조회
- **회원·기사 관리**: 검색·필터·정렬, 상세 조회, 계정 정지·활성화
- **견적 요청·완료 건 관리**: 상태별 통계와 목록, 요청·견적·확정 기사 상세 조회
- **채팅 관리**: 채팅방 검색, 참여자·메시지 내역 조회
- **신고 관리**: 신고 원문과 대상 정보 확인, 처리·반려, 회원 정지·콘텐츠 삭제
- **리뷰 관리**: 리뷰 통계와 삭제 상태 조회, 관리자 삭제
- **관리자 UX**: URL 쿼리 기반 목록 상태 유지, 상세 드로어 이전·다음 탐색
- **다국어**: 한국어, 영어, 중국어 간체 지원

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)
<br/>
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-EC5990?style=flat-square&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=flat-square&logo=chartdotjs&logoColor=white)
![i18next](https://img.shields.io/badge/i18next-26A69A?style=flat-square&logo=i18next&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=flat-square&logo=storybook&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)

## Getting Started

Node.js `22.6.0` 이상이 필요합니다.

```bash
git clone https://github.com/12-sprint-part4-project/fs12-part4-team3-admin-fe.git
cd fs12-part4-team3-admin-fe
npm install
```

프로젝트 루트에 `.env.local`을 만들고 다음 값을 설정합니다.

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_S3_BUCKET_NAME=your-s3-bucket
NEXT_PUBLIC_AWS_REGION=ap-northeast-2
```

```bash
npm run dev
```

기본 주소는 [http://localhost:3000](http://localhost:3000)입니다.

Storybook:

```bash
npm run storybook
```

기본 주소는 [http://localhost:6006](http://localhost:6006)입니다.

## Architecture

```text
Page (App Router) → Components → Hooks → Services → API
```

- **Page**: 관리자 라우팅과 화면 조합 (`src/app/`)
- **Components**: 공통 UI와 관리 화면 렌더링 (`src/components/`)
- **Hooks**: TanStack Query 기반 서버 상태와 목록·상세 상태 관리 (`src/hooks/`)
- **Services**: 관리자 API 요청 함수 (`src/services/`)
- **API**: Axios 인스턴스, 인증 인터셉터, 엔드포인트 경로 (`src/api/`)
- **Utils**: 쿼리 파라미터, 날짜·표시 형식 등 순수 함수 (`src/utils/`)

## Folder Structure

```text
src
├── app
│   ├── (admin)         # 관리자 보호 라우트와 관리 페이지
│   └── login           # 관리자 로그인
├── api                 # Axios 인스턴스와 API 경로
├── assets              # 아이콘 등 정적 자산
├── components          # 공통 UI 컴포넌트
├── constants           # Query Key 등 상수
├── hooks               # API Query·Mutation 및 화면 상태 훅
├── i18n                # 한국어·영어·중국어 번역 리소스
├── lib                 # 관리자 Access Token 등 공통 로직
├── providers           # Query·i18n Provider
├── services            # 관리자 API 요청 함수
├── test                # React 테스트 설정
├── types               # 관리자 도메인 타입
└── utils               # 검색·필터·표시 형식 유틸
public
```

## Routes

| Path                 | 설명            |
| -------------------- | --------------- |
| `/login`             | 관리자 로그인   |
| `/`                  | 관리자 대시보드 |
| `/members`           | 회원 관리       |
| `/drivers`           | 기사 관리       |
| `/estimate-requests` | 견적 요청 관리  |
| `/completed`         | 완료 건 관리    |
| `/chats`             | 채팅 관리       |
| `/reports`           | 신고 관리       |
| `/reviews`           | 리뷰 관리       |

`/login`을 제외한 관리자 라우트는 `AdminAuthGuard`로 보호됩니다.

## Scripts

| Command                   | 설명                     |
| ------------------------- | ------------------------ |
| `npm run dev`             | 개발 서버 실행           |
| `npm run build`           | 프로덕션 빌드            |
| `npm run start`           | 프로덕션 서버 실행       |
| `npm run lint`            | ESLint 검사              |
| `npm run format:check`    | Prettier 포맷 검사       |
| `npm run test`            | 유틸·상태 로직 테스트    |
| `npm run test:react`      | React 컴포넌트 테스트    |
| `npm run test:all`        | 전체 테스트 실행         |
| `npm run storybook`       | Storybook 개발 서버 실행 |
| `npm run build-storybook` | 정적 Storybook 빌드      |

## Commit Convention

`type: 커밋 메시지`

| Type       | 설명              |
| ---------- | ----------------- |
| `feat`     | 기능 추가 ✨      |
| `fix`      | 버그 수정 🐛      |
| `refactor` | 리팩토링 ♻️       |
| `style`    | UI/스타일 수정 🎨 |
| `docs`     | 문서 수정 📝      |
| `test`     | 테스트 추가 ✅    |
| `chore`    | 설정 변경 🔨      |
| `perf`     | 성능 개선 ⚡      |
| `remove`   | 기능 삭제 🔥      |
