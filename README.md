# MultiDapp Frontend

Next.js 기반의 DEX 스왑 액션 요청 대시보드입니다.

## 기능

- 📊 **데이터 테이블**: 스왑 액션 요청 데이터를 테이블 형태로 표시
- 🔍 **검색 기능**: 지갑 주소, DEX, 체인 등으로 검색
- 🗂️ **필터링**: DEX, 체인, 토큰, 국가, 상태별 필터링
- 📅 **날짜 필터**: 시작일/종료일을 선택하여 특정 기간의 데이터만 조회
- ⬆️⬇️ **정렬 기능**: 모든 컬럼에 대해 오름차순/내림차순 정렬 지원
- 📄 **페이지네이션**: 대량의 데이터를 효율적으로 탐색

## 기술 스택

- **Next.js 15**: React 프레임워크 (App Router)
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 스타일링
- **shadcn/ui**: UI 컴포넌트 라이브러리
- **date-fns**: 날짜 처리
- **Radix UI**: 접근성 있는 UI 프리미티브

## 시작하기

### 1. 의존성 설치

```bash
npm install
# 또는
pnpm install
```

### 2. 환경 변수 설정 (선택사항)

`.env.local` 파일을 생성하고 API URL을 설정할 수 있습니다:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

기본값은 `http://localhost:3001/api`입니다.

### 3. 개발 서버 실행

```bash
npm run dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. 빌드

```bash
npm run build
npm start
```

## Vercel 배포

1. [Vercel](https://vercel.com)에 프로젝트를 연결합니다.
2. 환경 변수가 필요한 경우 Vercel 대시보드에서 설정합니다.
3. 자동으로 배포가 시작됩니다.

또는 Vercel CLI를 사용할 수 있습니다:

```bash
npm i -g vercel
vercel
```

## API 엔드포인트

기본적으로 다음 엔드포인트에서 데이터를 가져옵니다:

```
http://localhost:3001/api/api/v2/dex/swap-action-requests
```

환경 변수 `NEXT_PUBLIC_API_URL`을 설정하여 다른 API 서버를 사용할 수 있습니다.

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 페이지
│   └── globals.css         # 전역 스타일
├── components/             # React 컴포넌트
│   ├── ui/                 # shadcn/ui 컴포넌트
│   ├── swap-table.tsx      # 메인 테이블 컴포넌트
│   └── data-loader.tsx     # 데이터 로더 컴포넌트
├── lib/                    # 유틸리티 및 API 함수
│   ├── utils.ts            # 유틸리티 함수
│   └── api.ts              # API 페칭 로직
└── types/                  # TypeScript 타입 정의
    └── swap-action-request.ts
```

## 라이선스

MIT
