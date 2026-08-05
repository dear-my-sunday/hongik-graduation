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
const saveBar = document.getElementById("saveBar");
const cfg = window.FIREBASE_CONFIG || {};

// 설정이 비어 있으면: 로그인 없이 이 기기에만 저장
if (!cfg.apiKey) {
  box.innerHTML = `<button class="auth-btn" id="setupBtn">☁ 기기 간 동기화</button>`;
  document.getElementById("setupBtn").addEventListener("click", () => {
    alert(
      "기기 간 동기화(구글 로그인)를 켜려면 한 번만 Firebase 설정이 필요해요.\n" +
        "저장소의 SETUP.md 안내를 따라 설정하면 이 버튼이 'Google로 로그인'으로 바뀝니다.\n\n" +
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
  let lastRemote = null;

  const refFor = (uid) => doc(db, "users", uid);

  renderLoggedOut();
  renderSaveBar();

  // 로컬 변경 → 클라우드 자동 저장 (0.8초 디바운스)
  window.cloudSave = (state) => {
    if (!currentUser) return;
    setStatus("저장 중…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => pushToCloud(state), 800);
  };

  async function pushToCloud(state) {
    if (!currentUser) return;
    try {
      lastRemote = JSON.stringify(state);
      await setDoc(refFor(currentUser.uid), { data: state, updatedAt: Date.now() });
      setStatus("저장됨 · " + timeNow());
    } catch (e) {
      console.error("클라우드 저장 실패", e);
      setStatus("저장 실패");
    }
  }

  onAuthStateChanged(auth, async (user) => {
    const wasSignedIn = !!currentUser;
    currentUser = user;
    if (unsub) { unsub(); unsub = null; }

    if (!user) {
      if (wasSignedIn && window.clearAppData) window.clearAppData(); // 로그아웃 → 화면 초기화
      renderLoggedOut();
      renderSaveBar();
      return;
    }

    renderLoggedIn(user);

    const ref = refFor(user.uid);
    try {
      const snap = await getDoc(ref);
      const remote = snap.exists() ? snap.data().data : null;
      const local = window.getAppData();
      const localHas = local && local.courses && local.courses.length > 0;

      if (remote && Array.isArray(remote.courses)) {
        // 계정에 저장된 내용이 있음
        if (localHas && JSON.stringify(remote) !== JSON.stringify(local)) {
          const useCloud = confirm(
            "계정에 저장된 내용이 있어요.\n\n" +
              "확인 = 계정에 저장된 내용으로 보기\n" +
              "취소 = 이 기기에서 방금 작업한 내용 유지 (아래 ‘지금 저장’으로 계정에 저장 가능)"
          );
          if (useCloud) {
            lastRemote = JSON.stringify(remote);
            window.setAppData(remote);
          } else {
            // 로컬 유지 → 자동으로 클라우드에 반영하지 않고, 사용자가 저장 버튼 누를 때 반영
            lastRemote = null;
          }
        } else {
          lastRemote = JSON.stringify(remote);
          window.setAppData(remote);
        }
      } else {
        // 계정이 비어 있으면 이 기기 내용을 올림
        await pushToCloud(local);
      }
    } catch (e) {
      console.error("동기화 불러오기 실패", e);
    }

    renderSaveBar();
    setStatus("동기화됨");

    // 다른 기기에서 바뀌면 실시간 반영
    unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data().data;
      if (!d) return;
      const s = JSON.stringify(d);
      if (s === lastRemote) return;
      lastRemote = s;
      window.setAppData(d);
    });
  });

  // --- UI ---
  function renderLoggedOut() {
    box.innerHTML = `<button class="auth-btn" id="loginBtn">Google로 로그인</button>`;
    document.getElementById("loginBtn").addEventListener("click", login);
  }

  function renderLoggedIn(user) {
    const photo = user.photoURL
      ? `<img src="${user.photoURL}" alt="" referrerpolicy="no-referrer" />`
      : "";
    const name = user.displayName || user.email || "사용자";
    box.innerHTML = `
      <span class="auth-user">${photo}<span>${esc(name)}</span></span>
      <button class="auth-btn" id="logoutBtn">로그아웃</button>`;
    document.getElementById("logoutBtn").addEventListener("click", () => signOut(auth));
  }

  function renderSaveBar() {
    if (!saveBar) return;
    if (currentUser) {
      saveBar.innerHTML = `
        <div class="save-info">
          <b>기기 간 동기화 켜짐</b>
          <span class="save-status" id="saveStatus">동기화됨</span>
        </div>
        <button class="btn accent" id="saveNowBtn">지금 저장</button>`;
      document.getElementById("saveNowBtn").addEventListener("click", () => {
        pushToCloud(window.getAppData());
      });
    } else {
      saveBar.innerHTML = `
        <div class="save-info">
          <b>로그인하면 기기 간에 이어서 볼 수 있어요</b>
          <span class="save-status">지금은 이 기기에만 저장돼요</span>
        </div>
        <button class="btn accent" id="loginSaveBtn">Google로 로그인하고 저장</button>`;
      document.getElementById("loginSaveBtn").addEventListener("click", login);
    }
  }

  async function login() {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("로그인 실패", e);
      alert("로그인에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  function setStatus(text) {
    const el = document.getElementById("saveStatus");
    if (el) el.textContent = text;
  }
  function timeNow() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  function esc(s) {
    return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}
