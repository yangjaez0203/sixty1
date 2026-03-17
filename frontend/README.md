# Sixty1 프론트엔드 — 개발 환경 셋업 가이드

React Native + Expo 기반 모바일 앱입니다. 이 문서를 따라하면 본인 폰에서 앱을 실행해볼 수 있습니다.

## 사전 요구사항

| 도구 | 설치 방법 |
|------|-----------|
| **Node.js** (v18+) | [nodejs.org](https://nodejs.org) 또는 `brew install node` |
| **Watchman** | `brew install watchman` |
| **Xcode** (iOS) | Mac App Store에서 설치 → Xcode 실행 후 Command Line Tools 설치 동의 |
| **CocoaPods** (iOS) | `sudo gem install cocoapods` 또는 Xcode와 함께 설치됨 |
| **Android Studio** (Android) | [developer.android.com](https://developer.android.com/studio) |

> iOS 테스트는 **macOS에서만** 가능합니다.

## 1. 의존성 설치

```bash
cd frontend
npm install
```

## 2. iOS 셋업

### Apple 개발자 계정 설정 (처음 한 번)

1. Xcode 열기
2. **Xcode → Settings → Accounts** 에서 Apple ID 추가 (무료 계정 OK)
3. `ios/Sixty1.xcworkspace`를 Xcode로 열기
4. 좌측 프로젝트 네비게이터에서 **Sixty1** 선택
5. **Signing & Capabilities** 탭에서:
   - **Team**: 본인 계정 선택
   - **Bundle Identifier**: `com.sixty1.app` 이 중복된다면 고유한 값으로 변경 (예: `com.yourname.sixty1`)

### iOS Pod 설치

```bash
cd ios && pod install && cd ..
```

### 기기에서 실행

1. iPhone을 USB로 Mac에 연결
2. iPhone에서 "이 컴퓨터를 신뢰하시겠습니까?" → **신뢰**
3. 실행:

```bash
npx expo run:ios --device
```

4. 연결된 기기 목록에서 본인 iPhone 선택
5. 처음 실행 시 iPhone에서 **설정 → 일반 → VPN 및 기기 관리 → 개발자 앱** 에서 신뢰 허용

## 3. Android 셋업

### Android Studio 설정 (처음 한 번)

1. Android Studio 설치 후 실행
2. SDK Manager에서 **Android 14 (API 34)** 이상 SDK 설치
3. `~/.zshrc` 또는 `~/.bash_profile`에 환경변수 추가:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

4. 터미널 재시작 또는 `source ~/.zshrc`

### 기기에서 실행

1. Android 폰에서 **설정 → 휴대전화 정보 → 빌드 번호** 7번 탭 → 개발자 모드 활성화
2. **설정 → 개발자 옵션 → USB 디버깅** 활성화
3. USB로 Mac에 연결, "USB 디버깅을 허용하시겠습니까?" → **허용**
4. 실행:

```bash
npx expo run:android --device
```

## 4. 개발 서버 재시작

앱이 기기에 설치된 이후에는 네이티브 빌드 없이 JS 번들만 갱신할 수 있습니다:

```bash
npx expo start --dev-client
```

기기에서 앱을 열면 자동으로 개발 서버에 연결됩니다.

> 폰과 Mac이 **같은 Wi-Fi**에 있어야 합니다.

## 프로젝트 구조

```
frontend/
├── App.tsx                  # 루트 컴포넌트
├── index.ts                 # 엔트리포인트
├── app.json                 # Expo 설정
├── src/
│   ├── navigation/
│   │   └── RootNavigator.tsx    # 인증 상태 기반 네비게이션
│   ├── screens/
│   │   ├── LoginScreen.tsx      # Google 로그인 화면
│   │   └── HomeScreen.tsx       # 홈 화면 (프로필 + 로그아웃)
│   ├── services/
│   │   └── auth.ts              # Google Sign-In 서비스
│   ├── stores/
│   │   └── authStore.ts         # Zustand 인증 상태 관리
│   └── utils/
│       └── storage.ts           # 토큰 보안 저장소
├── ios/                     # iOS 네이티브 프로젝트
└── android/                 # Android 네이티브 프로젝트
```

## 앱 흐름

1. 앱 시작 → 저장된 토큰 확인
2. 토큰 없음 → **LoginScreen** (Google 로그인)
3. 로그인 성공 → 토큰 보안 저장 → **HomeScreen** (프로필 표시)
4. 로그아웃 → 토큰 삭제 → LoginScreen으로 이동

## 트러블슈팅

### `expo run:ios` 빌드 실패

```bash
# Pod 캐시 정리 후 재설치
cd ios && pod deintegrate && pod install && cd ..
```

### 기기를 인식하지 못할 때

- USB 케이블이 **데이터 전송 지원** 케이블인지 확인 (충전 전용 불가)
- Android: `adb devices`로 기기가 보이는지 확인
- iOS: Xcode → Window → Devices and Simulators에서 기기가 보이는지 확인

### Metro 번들러 캐시 문제

```bash
npx expo start --dev-client --clear
```

### Google 로그인이 작동하지 않을 때

- Development build로 실행했는지 확인 (Expo Go에서는 Google Sign-In 미지원)
- iOS: Xcode에서 Bundle Identifier가 Google Cloud Console에 등록된 것과 일치하는지 확인
