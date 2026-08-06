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

  // 이 기기 + 계정 내용을 합침 (같은 과목은 한 번만 · 로그인 시 자동 병합)
  function mergeStates(local, remote) {
    const key = (c) => `${c.name}||${c.area}||${c.semester}`;
    const seen = new Set();
    const courses = [];
    for (const c of [...((remote && remote.courses) || []), ...((local && local.courses) || [])]) {
      const kk = key(c);
      if (seen.has(kk)) continue;
      seen.add(kk);
      courses.push(c);
    }
    const gradReq = (remote && remote.gradReq) || (local && local.gradReq) || null;
    return { v: 6, courses, gradReq };
  }

  if (saveBar) saveBar.style.display = "none"; // 동기화 섹션 제거 (자동 저장이라 불필요)
  renderLoggedOut();

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
      return;
    }

    renderLoggedIn(user);

    const ref = refFor(user.uid);
    try {
      const snap = await getDoc(ref);
      const remote = snap.exists() ? snap.data().data : null;
      const local = window.getAppData();
      // 이 기기 내용과 계정 내용을 합쳐서 보여주고, 합친 걸 계정에도 저장
      const merged = mergeStates(local, remote);
      lastRemote = JSON.stringify(merged);
      window.setAppData(merged);
      await pushToCloud(merged);
    } catch (e) {
      console.error("동기화 실패", e);
    }

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
