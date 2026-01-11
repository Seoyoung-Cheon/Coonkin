# COOKIN - 레시피 앱

React Native + Expo로 만든 레시피 검색 앱입니다.

## 시작하기

### 설치

```bash
npm install
```

### 실행

```bash
# 개발 서버 시작
npm start

# Android에서 실행
npm run android

# iOS에서 실행
npm run ios

# 웹에서 실행
npm run web
```

## 프로젝트 구조

```
recipe_app/
├── App.js                 # 메인 앱 컴포넌트
├── index.js              # 앱 진입점
├── package.json          # 의존성 관리
├── app.json              # Expo 설정
├── assets/               # 이미지, 폰트 등 리소스
│   └── fonts/           # 폰트 파일
└── src/
    └── screens/         # 화면 컴포넌트
        └── HomeScreen.js
```

## 주요 기능

- 레시피 검색
- 레시피 상세 보기
- 즐겨찾기
