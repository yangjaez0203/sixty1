-- sixty1 database schema
-- Prisma migrations 대신 이 파일로 스키마를 관리한다.
-- RDS 연결 이후부터는 Prisma migration으로 전환한다.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE');

CREATE TABLE "user" (
    "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
    "email"      TEXT        NOT NULL,
    "name"       TEXT        NOT NULL,
    "picture"    TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- FK는 코드 레벨에서만 관리 (DB 레벨 FK 미사용)
CREATE TABLE "provider_account" (
    "id"          UUID          NOT NULL DEFAULT gen_random_uuid(),
    "provider"    "OAuthProvider" NOT NULL,
    "provider_id" TEXT          NOT NULL,
    "user_id"     UUID          NOT NULL,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at"  TIMESTAMP(3),

    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "provider_account_provider_provider_id_key" ON "provider_account"("provider", "provider_id");

-- FK는 코드 레벨에서만 관리 (DB 레벨 FK 미사용)
CREATE TABLE "refresh_token" (
    "id"         UUID         NOT NULL DEFAULT gen_random_uuid(),
    "token_hash" TEXT         NOT NULL,
    "user_id"    UUID         NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "refresh_token_token_hash_key" ON "refresh_token"("token_hash");
