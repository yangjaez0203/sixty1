# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**sixty1** — 모노레포 구조의 웹 애플리케이션. NestJS 백엔드 + 프론트엔드(미정).

## Architecture

```
backend/                    # NestJS (Fastify) 서버 — 포트 8080
├── src/
│   ├── main.ts             # 엔트리포인트
│   ├── app.module.ts       # 루트 모듈
│   ├── config/             # 환경 설정
│   ├── modules/            # 도메인 모듈 (auth, room, track 등)
│   └── workers/            # FFmpeg 워커 (영상 처리)
├── test/                   # e2e 테스트
└── package.json
frontend/          # 모바일 앱 (React Native / Expo)
nginx/             # Nginx 리버스 프록시 설정
docs/              # API 문서 (OpenAPI 3.0 + Redocly)
```

### 라우팅 (Nginx)

- `/api/*` → backend:8080 (prefix 제거)

## Build & Run

```bash
# Docker Compose로 전체 실행
docker compose up --build -d

# 백엔드 의존성 설치
cd backend && pnpm install

# 백엔드 개발 서버 실행 (포트 3003)
cd backend && pnpm start:dev

# 백엔드 테스트
cd backend && pnpm test

# e2e 테스트
cd backend && pnpm test:e2e

# 린트
cd backend && pnpm lint

# API 문서 미리보기
cd docs && npx @redocly/cli preview -p 4000
```

## Commit Convention

**형식:** `[{노션아이디}] {타입}: {설명}`

- 브랜치명이 노션 태스크 ID (예: `TSK-17`)
- 타입: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- 예시: `[TSK-17] feat: 로그인 기능 추가`
- 기능별 커밋 분리를 위해 `/commit-by-feature` 커스텀 명령어 사용 가능
- `/docs`로 API 문서 미리보기 실행 가능

## Tech Stack

- **Backend:** Node.js, NestJS, Fastify adapter
- **Database:** PostgreSQL
- **Cache / Queue:** Redis, BullMQ
- **Storage:** S3 + CDN
- **Media:** FFmpeg 워커, MP4 출력 (HLS 확장 예정)
- **Frontend:** TBD

## Branch Strategy

```
prod         # 배포 브랜치 (태그 기반 배포)
main         # 통합 브랜치
├── backend  # 백엔드 장기 개발 브랜치
│    └── TSK-xx  # 백엔드 피처 브랜치
└── frontend # 프론트엔드 장기 개발 브랜치
     └── TSK-xx  # 프론트엔드 피처 브랜치
```

**흐름:**
1. 피처 브랜치(`TSK-xx`) → `backend` 또는 `frontend`로 PR 머지
2. 일정 시점에 `backend` / `frontend` → `main`으로 머지
3. `main` → `prod` 배포 태그 push → 자동 배포

**공통 설정 변경 시 (루트 package.json, docker-compose, nginx 등):**
- `TSK-xx` → `main` 직접 PR
- 머지 후 `backend`, `frontend` 브랜치에도 즉시 반영
  ```bash
  git checkout backend && git merge main
  git checkout frontend && git merge main
  ```

## CI/CD

### PR Check (`.github/workflows/pr-check.yml`)
- PR 오픈 시 변경 경로 기반 조건부 빌드
- `backend/**` → Node.js 빌드 + 테스트 (pnpm install → pnpm build → pnpm test)
- `docs/**` → Redocly lint + 문서 빌드
- `frontend/**` → 미설정 (프레임워크 선택 후 추가)

### Deploy (`.github/workflows/deploy.yml`)
- prod 브랜치에서 서비스별 태그 push 시 배포
- 태그 형식: `backend/v1.0.0`, `frontend/v1.0.0`
- 파이프라인: verify (prod 브랜치 검증) → build (빌드 + 테스트) → deploy (SSM)
- 서버 경로: `/sixty1`
