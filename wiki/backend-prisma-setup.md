# Prisma 설정 가이드

- **작성일:** 2026-03-17
- **요약:** NestJS 백엔드의 Prisma ORM 설정 구조 및 사용법

---

## 구조

```
backend/
├── prisma/
│   ├── schema.prisma       # 모델 정의
│   ├── migrations/         # 마이그레이션 파일 (자동 생성)
│   └── seed/
│       └── index.ts        # 초기 데이터 시드
└── src/
    └── common/
        └── prisma/
            ├── prisma.module.ts    # @Global() 모듈 — 앱 전역 제공
            └── prisma.service.ts   # PrismaClient 래퍼
```

---

## PrismaService

`PrismaClient`를 NestJS 생명주기에 통합한 싱글톤 서비스.

```typescript
// src/common/prisma/prisma.service.ts
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() { await this.$connect(); }   // 앱 시작 시 연결 (fail-fast)
  async onModuleDestroy() { await this.$disconnect(); } // 앱 종료 시 연결 해제

  async runInTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction((tx) => callback(tx));
  }
}
```

`PrismaModule`은 `@Global()`로 등록되어 있어 어느 모듈에서든 별도 import 없이 주입 가능합니다.

---

## 도메인에서 사용하기

```typescript
@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

  // 단순 쿼리
  findById(id: string) {
    return this.prisma.room.findUnique({ where: { id } });
  }

  // 트랜잭션
  async createWithTrack(roomData, trackData) {
    return this.prisma.runInTransaction(async (tx) => {
      const room = await tx.room.create({ data: roomData });
      await tx.track.create({ data: { ...trackData, roomId: room.id } });
      return room;
    });
  }
}
```

---

## 환경 변수

로컬 개발 환경은 `backend/.env.local`에서 관리합니다 (git 포함).

```env
DATABASE_URL="postgresql://sixty1:sixty1@localhost:5432/sixty1"
```

Docker Compose로 실행 시 호스트를 `postgres`로 변경합니다:

```env
DATABASE_URL="postgresql://sixty1:sixty1@postgres:5432/sixty1"
```

---

## 주요 명령어

```bash
# Prisma Client 생성 (schema 변경 후)
pnpm prisma:generate

# 마이그레이션 생성 및 적용
pnpm prisma:migrate

# 초기 데이터 시드
pnpm prisma:seed
```

---

## 스키마 변경 워크플로우

1. `prisma/schema.prisma` 수정
2. `pnpm prisma:migrate` — 마이그레이션 파일 생성 및 DB 반영
3. `pnpm prisma:generate` — PrismaClient 타입 재생성 (빌드 시 자동 실행)

> `pnpm build` 실행 시 `prisma generate`가 자동으로 포함됩니다.

---

## Docker 관련

- 기본 이미지: `node:22-slim` (Debian 기반 — Prisma 네이티브 바이너리 호환)
- Alpine 이미지는 musl libc 기반으로 Prisma 바이너리와 호환되지 않아 사용하지 않습니다.
- `binaryTargets`에 `linux-arm64-openssl-3.0.x` 명시 (`prisma/schema.prisma`)
