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
├── prisma/
│   └── schema.prisma            # Prisma 스키마 (모델 정의)
├── src/
│   ├── main.ts                  # 엔트리포인트 (포트 3003)
│   ├── app.module.ts            # 루트 모듈
│   ├── common/
│   │   ├── dto/
│   │   │   └── api-response.dto.ts   # 공통 응답 래퍼
│   │   └── prisma/
│   │       ├── prisma.module.ts      # PrismaModule (@Global)
│   │       └── prisma.service.ts     # PrismaClient 래퍼
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
├── prisma.config.ts             # Prisma 연결 설정
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
- Docker

### 1. 의존성 설치

`/backend` 디렉토리에서 실행합니다.

```bash
pnpm install
```

### 2. 환경 변수 확인

| 파일 | 용도 | Git |
|------|------|-----|
| `.env.local` | 로컬 개발용 | 포함 |
| `.env` | 서버 배포용 | 제외 |

| 변수명 | 설명 |
|--------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 |

### 3. 로컬 DB 실행

프로젝트 루트에서 실행합니다.

```bash
docker compose -f docker-compose.local.yml up -d
```

| 서비스 | 포트 | 설명 |
|--------|------|------|
| PostgreSQL | 5432 | `sixty1` DB, user/password: `sixty1` |

### 4. DB 마이그레이션

`prisma/schema.prisma`에 모델을 작성하거나 변경한 후 `/backend` 디렉토리에서 아래 명령어로 테이블에 반영합니다.

```bash
pnpm prisma:migrate
```

### 5. 개발 서버 실행

```bash
pnpm start:dev
```

서버가 `http://localhost:3003` 에서 실행됩니다.

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

# Prisma 클라이언트 생성
pnpm prisma:generate

# 스키마 변경 후 DB에 반영
pnpm prisma:migrate
```
