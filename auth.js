// 구글 로그인 + Firestore 기기 간 동기화 (설정이 있을 때만 동작)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const box = document.getElementById("authBox");
const cfg = window.FIREBASE_CONFIG || {};

// 설정이 비어 있으면: 로그인 없이 이 기기에만 저장
if (!cfg.apiKey) {
  box.innerHTML = `<button class="auth-btn" id="setupBtn">☁ 기기 간 동기화</button>`;
  document.getElementById("setupBtn").addEventListener("click", () => {
    alert(
      "기기 간 동기화(구글 로그인)를 켜려면 한 번만 Firebase 설정이 필요해요.\n\n" +
        "저장소의 SETUP.md 파일에 단계별 안내가 있어요.\n" +
        "설정을 마치면 이 버튼이 'Google로 로그인'으로 바뀝니다.\n\n" +
        "지금은 이 기기(브라우저)에만 자동 저장되고 있어요."
    );
  });
} else {
  startFirebase();
}

function startFirebase() {
  let app, auth, db;
  try {
    app = initializeApp(cfg);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase 초기화 실패", e);
    box.innerHTML = `<span class="sync-dot">동기화 오류</span>`;
    return;
  }

  const provider = new GoogleAuthProvider();
  let currentUser = null;
  let unsub = null;
  let saveTimer = null;
  let lastRemote = null; // 방금 받은 원격 데이터(피드백 루프 방지)

  renderLoggedOut();

  // 로컬 변경 → 클라우드 저장 (0.8초 디바운스)
  window.cloudSave = (d) => {
    if (!currentUser) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await setDoc(doc(db, "users", currentUser.uid), {
          data: d,
          updatedAt: Date.now(),
        });
      } catch (e) {
        console.error("클라우드 저장 실패", e);
      }
    }, 800);
  };

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (unsub) { unsub(); unsub = null; }

    if (!user) {
      renderLoggedOut();
      return;
    }
    renderLoggedIn(user);

    const ref = doc(db, "users", user.uid);
    try {
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().data) {
        // 원격 기록이 있으면 그걸로 맞춤
        lastRemote = JSON.stringify(snap.data().data);
        window.setAppData(snap.data().data);
      } else {
        // 원격이 비어 있으면 지금 이 기기 데이터를 올림
        const local = window.getAppData();
        lastRemote = JSON.stringify(local);
        await setDoc(ref, { data: local, updatedAt: Date.now() });
      }
    } catch (e) {
      console.error("동기화 불러오기 실패", e);
    }

    // 다른 기기에서 바뀌면 실시간 반영
    unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data().data;
      if (!d) return;
      const s = JSON.stringify(d);
      if (s === lastRemote) return; // 내가 방금 올린 것이면 무시
      lastRemote = s;
      window.setAppData(d);
    });
  });

  function renderLoggedOut() {
    box.innerHTML = `<button class="auth-btn" id="loginBtn">Google로 로그인</button>`;
    document.getElementById("loginBtn").addEventListener("click", async () => {
      try {
        await signInWithPopup(auth, provider);
      } catch (e) {
        console.error("로그인 실패", e);
        alert("로그인에 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  function renderLoggedIn(user) {
    const photo = user.photoURL
      ? `<img src="${user.photoURL}" alt="" referrerpolicy="no-referrer" />`
      : "";
    const name = user.displayName || user.email || "사용자";
    box.innerHTML = `
      <span class="auth-user">${photo}<span>${escape(name)}</span></span>
      <button class="auth-btn" id="logoutBtn">로그아웃</button>
    `;
    document.getElementById("logoutBtn").addEventListener("click", () => signOut(auth));
  }

  function escape(s) {
    return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}
