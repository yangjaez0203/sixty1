# Backend

sixty1 백엔드 서버 — NestJS + Fastify 기반 REST API 서버입니다.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** NestJS (Fastify adapter)
- **Database:** PostgreSQL
- **Cache / Queue:** Redis, BullMQ
- **Storage:** S3 + CDN
- **Media:** FFmpeg 워커

## 폴더 구조

```
backend/
├── src/
│   ├── main.ts                  # 엔트리포인트 (포트 3003)
│   ├── app.module.ts            # 루트 모듈
│   ├── common/
│   │   └── dto/
│   │       └── api-response.dto.ts   # 공통 응답 래퍼
│   └── modules/                 # 도메인 모듈
│       └── system/              # 시스템 (헬스체크 등)
│           ├── system.module.ts
│           └── presentation/
│               ├── dto/
│               │   └── health.dto.ts
│               ├── system.controller.ts
│               └── system.controller.spec.ts
├── test/                        # e2e 테스트
│   └── jest-e2e.json
├── package.json
└── tsconfig.json
```

### 모듈 구조 컨벤션

각 도메인 모듈은 레이어드 아키텍처를 따릅니다.

```
modules/{domain}/
├── {domain}.module.ts
├── presentation/        # Controller, DTO (요청/응답)
├── application/         # Service, UseCase
├── domain/              # Entity, Repository 인터페이스
└── infrastructure/      # Repository 구현체, 외부 연동
```

## 컨벤션

### 테스트

- 테스트 설명(`describe`, `it`)은 한글로 작성합니다.

```typescript
describe('유저 서비스', () => {
  it('존재하지 않는 유저 조회 시 예외를 던진다', () => { ... });
});
```

## 시작하기

### 사전 요구사항

- Node.js 22+
- pnpm
- Docker (PostgreSQL, Redis 실행용)

### 의존성 설치

/backend 디렉토리에서 다음 명령어를 실행하여 의존성을 설치합니다.

```bash
pnpm install
```

### 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `PORT` | 서버 포트 | `3003` |
| `DATABASE_URL` | PostgreSQL 연결 문자열 | - |
| `REDIS_URL` | Redis 연결 문자열 | - |

### 개발 서버 실행

```bash
# 개발 서버 (watch 모드)
pnpm start:dev

# 일반 실행
pnpm start
```

서버가 `http://localhost:3003` 에서 실행됩니다.

### Docker Compose로 전체 실행

프로젝트 루트에서 실행합니다.

```bash
docker compose up --build -d
```

Nginx를 통해 `/api/*` 요청이 백엔드(8080)로 라우팅됩니다.

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/system/health` | 헬스체크 |

## 테스트

```bash
# 유닛 테스트
pnpm test

# 유닛 테스트 (watch 모드)
pnpm test:watch

# 커버리지
pnpm test:cov

# e2e 테스트
pnpm test:e2e
```

## 기타 명령어

```bash
# 빌드
pnpm build

# 린트
pnpm lint

# 포맷
pnpm format
```
