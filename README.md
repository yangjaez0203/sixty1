# 🎬 Sixty1 (Sixty-One)

> **"1초의 로그(Log)가 모여 만드는 리캡(Recap)"**
> 

**Sixty1**은 나의 소중한 일상(라이브포토)을 짧게 로깅하고, 모아서 리캡으로 기록하는 **아카이빙 SNS**입니다.

---

## 💡 Project Concept

- **Low Fatigue:** 완벽해야 한다는 강박에서 벗어나, 1초씩 가볍게 일상을 로깅합니다.
- **Authenticity:** '지금 이 순간'의 기록에 집중하기 위해 바로 지금 촬영해주세요.
- **Personal Archive:** 나만의 캘린더와 피드를 통해 한 달간의 기록을 하나의 영상으로 요약합니다.

---

## 🛠 Key Features

### 1. 기록 및 업로드 (Capture)

- **Real-time Short Clips:** 1~3초 내외의 짧은 사진 및 영상 로그를 찍습니다.
- **Daily Feed:** 내가 올린 데일리 로그들은 친구들과 피드에서 공유할 수 있습니다.

### 2. 영상 제작 및 요약 (Video Maker / Recap)

- **Date Range:** 최근 1달 이내의 기간을 지정하여 리캡을 제작합니다. (최대 31일)
- **Source Selection:** 지정한 기간 내의 소스를 최대 31개까지 선택할 수 있습니다.
- **Sequence Editing:** 선택한 소스들의 순서를 자유롭게 조정하고 길이를 수정합니다.
- **Batch Filtering:** 영상 전체에 일괄 적용되는 보정 필터로 편집의 번거로움을 줄입니다.
- **Decoration:** * 기간 표시, 유저 정보 표시, 소스 사운드 사용 여부 등을 설정합니다.

### 3. 소셜 및 보안 (Social & Privacy)

- **Closed Network:** 구글 로그인을 통한 간편 가입 후, 닉네임 또는 메일을 통해 팔로우/팔로잉 기반의 폐쇄형 네트워크를 형성합니다.
- **Management:** 본인이 업로드한 소스 및 영상만 삭제 가능합니다.

### 4. 알림 및 저장 (Notification & Export)

- **Rendering Notification:** 영상 제작 완료 시 앱 푸시 알림을 발송합니다.
- **Download:** 완성된 영상은 기기에 직접 다운로드하여 간직할 수 있습니다.
- **Validity Period:** 결과물 영상은 서버 부하 방지 및 희소성을 위해 일정 기간의 유효기간을 가집니다.

---

## 📅 Optional Roadmap

- **Calendar View:** 여러 날짜의 소스 분포를 한눈에 확인하고 관리하는 캘린더 UI 제공.
- **Advanced Camera:** 갤러리 접근을 완전히 배제하고 오직 '지금'의 기록만 허용하는 모드 검토.
- **Social Interaction:** 다른 친구의 로그 혹은 리캡에 메시지를 보내세요!

---

## 🏃 User Flow

1. **로그인:** 구글 계정으로 간편 가입.
2. **기록:** 하루 중 기억하고 싶은 순간을 1~3초간 촬영하여 업로드.
3. **조합:** 한 달이 지나거나 기록이 쌓이면 '영상 만들기' 진입.
4. **편집:** 기간 선택 → 소스 선택 → 일괄 필터 적용 → 꾸미기.
5. **완료:** 알림을 받고 영상을 확인한 후 다운로드하거나 친구들과 공유.

---

---

## 🚀 Getting Started

### API 문서 미리보기

```bash
cd docs && npx @redocly/cli preview -p 4000
```

실행 후 http://localhost:4000 에서 API 문서를 확인할 수 있습니다.

### 전체 서비스 실행 (Docker Compose)

```bash
docker compose up --build -d
```

---

# 주요 용어

- 로그
    - 유저가 기록하는 단위
- 리캡
    - 유저가 로그를 모아 생성한 기록 결과물
