// 졸업요건 대시보드 — 홍익대 디자인·예술경영학부 디자인경영전공 (2026학번 기준)
// 과목을 학기/영역별로 담아 이수 현황을 계산합니다.
// 이 브라우저에 자동 저장되고, 로그인하면 기기 간 동기화됩니다.
const STORAGE_KEY = "hd-graduate-v5";

// 실제 졸업요건 영역 (합계 132학점)
const AREAS = [
  "전공필수", "전공선택", "전공기초",
  "교양필수", "특성화교양", "SW·데이터활용", "공통교양",
  "자유선택",
];
const REQ = {
  전공필수: 15, 전공선택: 35, 전공기초: 2,
  교양필수: 6, 특성화교양: 3, "SW·데이터활용": 9, 공통교양: 18,
  자유선택: 44,
}; // 15+35+2+6+3+9+18+44 = 132
const TOTAL = 132;
const SEMS = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];
const AREA_TAG = {
  전공필수: "전필", 전공선택: "전선", 전공기초: "전기",
  교양필수: "교필", 특성화교양: "특교", "SW·데이터활용": "SW", 공통교양: "공교",
  자유선택: "자유",
};
const CYBER_LIMIT = 24; // 사이버강의 재학 중 최대 이수 학점
const AREA_DESC = {
  전공필수: "반드시 듣는 전공 과목",
  전공선택: "골라 듣는 전공 (전공 합 50학점)",
  전공기초: "전공기초영어(Ⅰ/Ⅱ 택1)",
  교양필수: "대학영어·논리적사고와글쓰기",
  특성화교양: "컴퓨팅사고/디자인씽킹/창업과실용법률 중 택1",
  "SW·데이터활용": "SW·데이터 역량 인증 과목",
  공통교양: "7개 영역 중 6개에서 각 1과목",
  자유선택: "나머지 + 졸업논문 (여유분)",
};

// 실제 교과과정 과목 (검색용). k(과목명, 영역, 학점, 학기|null, 사이버여부)
const k = (name, area, credits, semester, cyber = false) => ({ name, area, credits, semester, cyber });
const CATALOG = [
  // 전공필수
  k("경제학원론", "전공필수", 3, "1-1"),
  k("디자인론", "전공필수", 3, "1-1"),
  k("기업과경영", "전공필수", 3, "1-2"),
  k("인간공학", "전공필수", 3, "2-1"),
  k("기업법", "전공필수", 3, "3-2"),
  // 전공기초
  k("전공기초영어(Ⅰ/Ⅱ 택1)", "전공기초", 2, "1-2"),
  // 전공선택 1학년
  k("회계원리", "전공선택", 3, "1-1"),
  k("공연예술사", "전공선택", 3, "1-1"),
  k("디자인프로세스", "전공선택", 3, "1-2"),
  k("서양미술사", "전공선택", 3, "1-2"),
  k("대중문화론", "전공선택", 3, "1-2"),
  // 전공선택 2학년
  k("운영관리", "전공선택", 3, "2-1"),
  k("마케팅", "전공선택", 3, "2-1"),
  k("미시경제학", "전공선택", 3, "2-1"),
  k("법학개론", "전공선택", 3, "2-1"),
  k("한국미술사", "전공선택", 3, "2-1"),
  k("재무관리", "전공선택", 3, "2-2"),
  k("조직행동", "전공선택", 3, "2-2"),
  k("거시경제학", "전공선택", 3, "2-2"),
  k("디자인기획", "전공선택", 3, "2-2"),
  k("광고커뮤니케이션", "전공선택", 3, "2-2"),
  k("법과현대생활", "전공선택", 3, "2-2"),
  // 전공선택 3학년
  k("전략경영", "전공선택", 3, "3-1"),
  k("소비자행동", "전공선택", 3, "3-1"),
  k("법과경영", "전공선택", 3, "3-1"),
  k("투자론", "전공선택", 3, "3-1"),
  k("원가관리회계", "전공선택", 3, "3-1"),
  k("디자인사", "전공선택", 3, "3-1"),
  k("IT와창의융합경영", "전공선택", 3, "3-1"),
  k("재무회계", "전공선택", 3, "3-2"),
  k("벤처창업론", "전공선택", 3, "3-2"),
  k("브랜드디자인전략", "전공선택", 3, "3-2"),
  k("서비스마케팅", "전공선택", 3, "3-2"),
  k("문화예술경영", "전공선택", 3, "3-2"),
  // 전공선택 4학년
  k("인적자원관리", "전공선택", 3, "4-1"),
  k("디자인매니지먼트", "전공선택", 3, "4-1"),
  k("법과분쟁해결", "전공선택", 3, "4-1"),
  k("기업경영과세무", "전공선택", 3, "4-1"),
  k("동양미술사", "전공선택", 3, "4-1"),
  k("사진세미나", "전공선택", 3, "4-1"),
  k("E-비지니스심화(SW)", "전공선택", 3, "4-2"),
  k("지식재산권법", "전공선택", 3, "4-2"),
  k("디자인세미나", "전공선택", 3, "4-2"),
  k("물류경영", "전공선택", 3, "4-2"),
  k("비즈니스디자인현장실습", "전공선택", 3, "4-2"),
  k("박물관학과미술경영", "전공선택", 3, "4-2"),
  // 교양필수
  k("대학영어", "교양필수", 3, "1-1"),
  k("논리적사고와글쓰기(경영)", "교양필수", 3, "1-1"),
  // 특성화교양 (사이버강좌 · 셋 중 택1)
  k("컴퓨팅사고", "특성화교양", 3, null, true),
  k("디자인씽킹", "특성화교양", 3, null, true),
  k("창업과실용법률", "특성화교양", 3, null, true),
  // 공통교양
  k("교양중국어(1)", "공통교양", 3, "1-1"),
  k("문학과창의적사고", "공통교양", 3, "3-1"),
  k("예술과법", "공통교양", 3, "3-2"),
  // 공통교양 · 사이버강의 (디자인경영전공 권장)
  k("언어의이해 (사이버)", "공통교양", 3, null, true),
  k("이미지와상상력 (사이버)", "공통교양", 3, null, true),
  k("사운드와컴퓨터음악 (사이버)", "공통교양", 3, null, true),
  k("인간심리의이해 (사이버)", "공통교양", 3, null, true),
  // 자유선택
  k("졸업논문", "자유선택", 3, null),
];

let courses = load();
let form = { semester: "1-1", area: "전공필수", credits: "3" };

// --- 저장/불러오기 ---
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const obj = raw ? JSON.parse(raw) : null;
    if (obj && Array.isArray(obj.courses)) return obj.courses.filter(isValidCourse);
  } catch {}
  return [];
}
function isValidCourse(c) {
  return (
    c && typeof c.name === "string" && AREAS.includes(c.area) &&
    typeof c.credits === "number" && SEMS.includes(c.semester)
  );
}
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 5, courses }));
  if (window.cloudSave) window.cloudSave(getState());
}
function getState() { return { v: 5, courses }; }

// --- 파생 계산 ---
function earnedByArea() {
  const m = {};
  AREAS.forEach((a) => (m[a] = 0));
  courses.forEach((c) => (m[c.area] += Number(c.credits) || 0));
  return m;
}
function cyberEarned() {
  return courses.filter((c) => c.cyber).reduce((s, c) => s + (Number(c.credits) || 0), 0);
}
function coursesBySemester(sem) {
  return courses.filter((c) => c.semester === sem);
}
function semLabel(sem) {
  const [y, s] = sem.split("-");
  return `${y}학년 ${s}학기`;
}

// --- 렌더 ---
function renderHeader() {
  const totalEarned = courses.reduce((s, c) => s + (Number(c.credits) || 0), 0);
  const pct = Math.min(100, Math.round((totalEarned / TOTAL) * 100));
  const remaining = Math.max(0, TOTAL - totalEarned);

  const circ = 2 * Math.PI * 52;
  const fill = document.getElementById("donutFill");
  fill.style.strokeDasharray = circ;
  fill.style.strokeDashoffset = circ * (1 - pct / 100);

  document.getElementById("donutPct").textContent = pct + "%";
  document.getElementById("donutSub").textContent = `${totalEarned} / ${TOTAL}`;
  document.getElementById("remainTotal").textContent = remaining + "학점";
}

function renderAreas() {
  const grid = document.getElementById("areaGrid");
  const earned = earnedByArea();
  grid.innerHTML = AREAS.map((area) => {
    const e = earned[area];
    const req = REQ[area];
    const pct = req > 0 ? Math.min(100, Math.round((e / req) * 100)) : 0;
    const done = e >= req;
    const badge = done
      ? `<span class="badge done">충족</span>`
      : `<span class="badge">${req - e}학점 남음</span>`;
    return `
      <div class="area-card">
        <div class="area-card-top">
          <span class="area-name">${escapeHtml(area)}</span>
          ${badge}
        </div>
        <div class="area-desc">${escapeHtml(AREA_DESC[area] || "")}</div>
        <div class="area-credits">${e}<span> / ${req}학점</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>`;
  }).join("");
}

function renderCyber() {
  const bar = document.getElementById("cyberBar");
  const used = cyberEarned();
  const pct = Math.min(100, Math.round((used / CYBER_LIMIT) * 100));
  const over = used > CYBER_LIMIT;
  bar.className = "cyber-bar" + (over ? " over" : "");
  bar.innerHTML = `
    <span class="cy-count">🖥 사이버강의 <b>${used}</b> / ${CYBER_LIMIT}학점</span>
    <div class="cy-track"><div class="cy-fill" style="width:${pct}%"></div></div>
    <span class="cy-note">${over ? "한도 초과! 24학점까지만 인정돼요" : "재학 중 최대 24학점까지 인정 (학기당 신청 제한은 공지 확인)"}</span>
  `;
}

function renderRoadmap() {
  const road = document.getElementById("roadmap");
  road.innerHTML = SEMS.map((sem) => {
    const list = coursesBySemester(sem);
    const sum = list.reduce((s, c) => s + (Number(c.credits) || 0), 0);
    const body = list.length
      ? list
          .map(
            (c) => `
        <div class="chip-course">
          <span class="c-tag">${AREA_TAG[c.area] || ""}</span>
          <span class="c-name" title="${escapeAttr(c.name)}">${escapeHtml(c.name)}</span>
          <span class="c-credit">${c.credits}</span>
          <button class="c-del" data-del="${c.id}" title="삭제">×</button>
        </div>`
          )
          .join("")
      : `<div class="sem-empty">담긴 과목 없음</div>`;
    return `
      <div class="sem-col">
        <div class="sem-head">
          <span class="sem-title">${semLabel(sem)}</span>
          <span class="sem-count">${list.length}과목</span>
        </div>
        <div class="sem-body">${body}</div>
        <div class="sem-sum">${sum}학점</div>
      </div>`;
  }).join("");
}

function renderAll() {
  renderHeader();
  renderAreas();
  renderCyber();
  renderRoadmap();
}

function escapeAttr(s) { return String(s).replace(/"/g, "&quot;"); }
function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// ===== 폼 =====
let comboItems = [];
let comboActive = -1;

function initForm() {
  const semSel = document.getElementById("fSemester");
  semSel.innerHTML = SEMS.map((s) => `<option value="${s}">${semLabel(s)}</option>`).join("");
  const areaSel = document.getElementById("fArea");
  areaSel.innerHTML = AREAS.map((a) => `<option value="${a}">${a}</option>`).join("");

  syncFormToUI();

  semSel.addEventListener("change", (e) => (form.semester = e.target.value));
  areaSel.addEventListener("change", (e) => (form.area = e.target.value));
  document.getElementById("fCredits").addEventListener("change", (e) => (form.credits = e.target.value));

  const nameInput = document.getElementById("fName");
  nameInput.addEventListener("input", () => openCombo(nameInput.value));
  nameInput.addEventListener("focus", () => { if (nameInput.value) openCombo(nameInput.value); });
  nameInput.addEventListener("keydown", onComboKey);

  document.getElementById("comboList").addEventListener("mousedown", (e) => {
    const item = e.target.closest(".combo-item");
    if (!item) return;
    e.preventDefault();
    selectCombo(item.dataset.name);
  });

  // 콤보: 콤보 바깥 클릭 시 목록 닫기
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".combo")) closeCombo();
  });

  // 패널 열기/닫기
  document.getElementById("addToggle").addEventListener("click", togglePanel);
  document.getElementById("apClose").addEventListener("click", closePanel);
  document.getElementById("apCancel").addEventListener("click", closePanel);
  document.getElementById("apReset").addEventListener("click", resetForm);
  document.getElementById("addBtn").addEventListener("click", addCourse);

  // 패널 바깥 클릭 시 닫기
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".add-wrap")) closePanel();
  });
}

function syncFormToUI() {
  document.getElementById("fSemester").value = form.semester;
  document.getElementById("fArea").value = form.area;
  document.getElementById("fCredits").value = form.credits;
}

function openPanel() {
  document.getElementById("addPanel").hidden = false;
  document.getElementById("addToggle").classList.add("open");
  setApStatus("");
  document.getElementById("fName").focus();
}
function closePanel() {
  document.getElementById("addPanel").hidden = true;
  document.getElementById("addToggle").classList.remove("open");
  closeCombo();
}
function togglePanel() {
  if (document.getElementById("addPanel").hidden) openPanel();
  else closePanel();
}

function resetForm() {
  form = { semester: "1-1", area: "전공필수", credits: "3" };
  syncFormToUI();
  const nm = document.getElementById("fName");
  nm.value = "";
  closeCombo();
  setApStatus("");
  nm.focus();
}

function setApStatus(text) {
  const el = document.getElementById("apStatus");
  if (el) el.textContent = text;
}

function openCombo(query) {
  const q = query.trim().toLowerCase();
  comboItems = (q
    ? CATALOG.filter((c) => c.name.toLowerCase().includes(q))
    : CATALOG
  ).slice(0, 30);
  comboActive = -1;
  renderCombo();
}

function renderCombo() {
  const list = document.getElementById("comboList");
  if (comboItems.length === 0) {
    list.innerHTML = `<div class="combo-empty">일치하는 과목이 없어요. 그대로 입력해 직접 추가할 수 있어요.</div>`;
    list.hidden = false;
    return;
  }
  list.innerHTML = comboItems
    .map((c, i) => {
      const meta = [AREA_TAG[c.area], `${c.credits}학점`, c.semester ? semLabel(c.semester) : "학기 무관"]
        .filter(Boolean)
        .join(" · ");
      return `<div class="combo-item ${i === comboActive ? "active" : ""}" data-name="${escapeAttr(c.name)}">
        <span class="ci-name">${escapeHtml(c.name)}${c.cyber ? " 💻" : ""}</span>
        <span class="ci-meta">${meta}</span>
      </div>`;
    })
    .join("");
  list.hidden = false;
}

function closeCombo() {
  const list = document.getElementById("comboList");
  if (list) list.hidden = true;
  comboActive = -1;
}

function selectCombo(name) {
  const hit = CATALOG.find((c) => c.name === name);
  const nameInput = document.getElementById("fName");
  nameInput.value = name;
  if (hit) {
    const areaSel = document.getElementById("fArea");
    const credSel = document.getElementById("fCredits");
    const semSel = document.getElementById("fSemester");
    areaSel.value = hit.area; form.area = hit.area;
    credSel.value = String(hit.credits); form.credits = String(hit.credits);
    if (hit.semester) { semSel.value = hit.semester; form.semester = hit.semester; }
  }
  closeCombo();
  nameInput.focus();
}

function onComboKey(e) {
  const list = document.getElementById("comboList");
  const open = list && !list.hidden && comboItems.length > 0;
  if (e.key === "ArrowDown" && open) {
    e.preventDefault();
    comboActive = (comboActive + 1) % comboItems.length;
    renderCombo();
  } else if (e.key === "ArrowUp" && open) {
    e.preventDefault();
    comboActive = (comboActive - 1 + comboItems.length) % comboItems.length;
    renderCombo();
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (open && comboActive >= 0) selectCombo(comboItems[comboActive].name);
    else addCourse();
  } else if (e.key === "Escape") {
    closeCombo();
  }
}

function addCourse() {
  const nameInput = document.getElementById("fName");
  const name = nameInput.value.trim();
  if (!name) return;
  const cat = CATALOG.find((c) => c.name === name);
  courses.push({
    id: "c" + Date.now() + Math.random().toString(36).slice(2, 6),
    name,
    area: form.area,
    credits: Number(form.credits) || 0,
    semester: form.semester,
    cyber: cat ? !!cat.cyber : false,
  });
  nameInput.value = "";
  closeCombo();
  persist();
  renderAll();
  setApStatus(`추가됨 · ${name}`); // 패널은 열어둬 연속 추가 가능
  nameInput.focus();
}

// --- 삭제 ---
document.addEventListener("click", (e) => {
  const del = e.target.closest("[data-del]");
  if (del) {
    courses = courses.filter((c) => c.id !== del.dataset.del);
    persist();
    renderAll();
  }
});

// --- 초기화 ---
document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("담은 과목을 모두 지울까요?")) {
    courses = [];
    resetForm();
    persist();
    renderAll();
  }
});

// --- 클라우드(로그인) 연동 훅 ---
window.getAppData = getState;
window.setAppData = (incoming) => {
  if (!incoming || !Array.isArray(incoming.courses)) return; // 옛 형식/손상 데이터 무시
  courses = incoming.courses.filter(isValidCourse);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 5, courses }));
  renderAll();
};
// 로그아웃 시 화면을 비운다 (클라우드에는 저장하지 않음 — 계정 데이터 보존)
window.clearAppData = () => {
  courses = [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 5, courses }));
  renderAll();
};

initForm();
renderAll();
