# 구글 로그인 · 기기 간 동기화 켜기 (한 번만)

지금 사이트는 로그인 없이 **이 기기에만** 저장돼요.
아래 설정을 한 번 마치면 **구글 로그인**이 켜지고, 회사 노트북·집 노트북·핸드폰 어디서 체크해도 **기록이 똑같이 동기화**돼요.

무료 서비스(Firebase)를 쓰고, 약 10분이면 끝나요.

---

## 1. Firebase 프로젝트 만들기
1. https://console.firebase.google.com 접속 → 구글 로그인 (dear.my.sundayy@gmail.com)
2. **프로젝트 만들기** 클릭 → 이름 아무거나 (예: `hongik-graduation`) → 애널리틱스는 꺼도 됨 → 생성

## 2. 웹 앱 등록 + 설정값 복사
1. 프로젝트 첫 화면에서 **웹(`</>`) 아이콘** 클릭
2. 앱 닉네임 입력 (예: `web`) → 등록
3. 화면에 나오는 `firebaseConfig` 값(apiKey, authDomain 등)을 복사
4. 이 저장소의 **`firebase-config.js`** 파일을 열어 그 값들을 붙여넣기

예시:
```js
window.FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "hongik-graduation.firebaseapp.com",
  projectId: "hongik-graduation",
  storageBucket: "hongik-graduation.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234...:web:abcd...",
};
```

## 3. 구글 로그인 켜기
1. 왼쪽 메뉴 **빌드 → Authentication** → **시작하기**
2. **Sign-in method** 탭 → **Google** 선택 → 사용 설정 → 저장

## 4. 접속 허용 도메인 추가
1. Authentication → **Settings → 승인된 도메인**
2. **도메인 추가** → `dear-my-sunday.github.io` 입력 → 추가
   (로컬 테스트용 `localhost`는 보통 이미 들어 있어요)

## 5. 데이터 저장소(Firestore) 만들기
1. 왼쪽 메뉴 **빌드 → Firestore Database** → **데이터베이스 만들기**
2. 위치는 기본값, 우선 **테스트 모드**로 시작 → 만들기
3. **규칙(Rules)** 탭에서 아래로 바꾸고 게시(본인 데이터만 접근하도록):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## 6. 올리기
`firebase-config.js`를 저장한 뒤 GitHub에 push 하면 끝:
```bash
git add firebase-config.js && git commit -m "동기화 설정" && git push
```

이제 사이트 오른쪽 위 버튼이 **‘Google로 로그인’** 으로 바뀌어요.
로그인하면 다른 기기에서도 같은 기록이 보입니다. 🎉

---

### 참고
- `firebase-config.js`의 값들은 **공개돼도 안전한 웹용 공개키**라 GitHub에 올라가도 괜찮아요. (5번 보안 규칙이 남의 접근을 막아줍니다.)
- 처음 로그인할 때 기기에 있던 기록이 클라우드에 올라가고, 이후에는 클라우드 기록이 기준이 돼요.
