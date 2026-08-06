// 졸업요건 대시보드 — 홍익대 디자인·예술경영학부 디자인경영전공 (2026학번 기준)
// 과목을 학기/영역별로 담아 이수 현황을 계산합니다.
// 이 브라우저에 자동 저장되고, 로그인하면 기기 간 동기화됩니다.
const STORAGE_KEY = "hd-graduate-v6";
const TOTAL = 132;
const CYBER_LIMIT = 24; // 사이버강의 재학 중 최대 이수 가능 학점(한도)
const SEMS = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];

// 요건을 큰 묶음(그룹)으로 표현. mode: credits(학점 채우기) / complete(수강 완료)
const GROUPS = [
  {
    title: "전공",
    type: "credits",
    target: 50,
    note: "전공필수 + 전공선택 = 50학점 (전공필수는 전부 이수)",
    subs: [
      { area: "전공필수", label: "전공필수", req: 15, mode: "credits", desc: "반드시 듣는 전공 과목" },
      { area: "전공선택", label: "전공선택", req: 35, mode: "credits", desc: "골라 듣는 전공 과목" },
    ],
  },
  {
    title: "기타 지정과목",
    type: "complete",
    note: "선택지가 적은 필수·지정 과목",
    subs: [
      { area: "전공기초", label: "전공기초", req: 2, mode: "complete", hint: "전공기초영어(Ⅰ/Ⅱ 택1)" },
      { area: "교양필수", label: "교양필수", need: 2, mode: "complete", hint: "대학영어 + 논리적사고와글쓰기" },
      { area: "특성화교양", label: "특성화교양", need: 1, mode: "complete", hint: "컴퓨팅사고/디자인씽킹/창업과실용법률 중 택1" },
    ],
  },
  {
    title: "SW·데이터활용역량인증",
    type: "complete",
    need: 3,
    note: "3개 모듈을 각각 이수 (총 9학점) · 매 학기 인증과목은 공지 확인",
    subs: [
      { area: "SW소양모듈", label: "소양모듈", need: 1, mode: "complete" },
      { area: "SW기초모듈", label: "기초모듈", need: 1, mode: "complete" },
      { area: "SW상위모듈", label: "상위모듈", need: 1, mode: "complete" },
    ],
  },
  {
    title: "공통교양",
    type: "complete",
    need: 6,
    note: "7개 영역 중 6개만 이수하면 돼요 · ‘예술과 디자인’은 제외 가능 · ‘제2외국어와 한문’은 필수 포함",
    subs: [
      { area: "언어와 철학", label: "언어와 철학", need: 1, mode: "complete" },
      { area: "예술과 디자인", label: "예술과 디자인", need: 1, mode: "complete", optional: true },
      { area: "과학과 컴퓨터", label: "과학과 컴퓨터", need: 1, mode: "complete" },
      { area: "사회와 경제", label: "사회와 경제", need: 1, mode: "complete" },
      { area: "법과 생활", label: "법과 생활", need: 1, mode: "complete" },
      { area: "역사와 문화", label: "역사와 문화", need: 1, mode: "complete" },
      { area: "제2외국어와 한문", label: "제2외국어와 한문", need: 2, mode: "complete", required: true },
    ],
  },
  {
    title: "자유선택 · 졸업논문",
    type: "credits",
    target: 44,
    note: "나머지 학점 + 졸업논문 (총 132학점 맞추기)",
    subs: [{ area: "자유선택", label: "자유선택", req: 44, mode: "credits", desc: "나머지 + 졸업논문" }],
  },
];

// 파생 상수
const AREAS = GROUPS.flatMap((g) => g.subs.map((s) => s.area));
const AREA_GROUPS = GROUPS.map((g) => ({ label: g.title, areas: g.subs.map((s) => s.area) }));
const AREA_TAG = {
  전공필수: "전필", 전공선택: "전선", 전공기초: "전기",
  교양필수: "교필", 특성화교양: "특교",
  SW소양모듈: "소양", SW기초모듈: "기초", SW상위모듈: "상위",
  "언어와 철학": "공교", "예술과 디자인": "공교", "과학과 컴퓨터": "공교",
  "사회와 경제": "공교", "법과 생활": "공교", "역사와 문화": "공교", "제2외국어와 한문": "공교",
  자유선택: "자유",
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
  k("교양중국어(1)", "제2외국어와 한문", 3, "1-1"),
  k("문학과창의적사고", "언어와 철학", 3, "3-1"),
  k("예술과법", "법과 생활", 3, "3-2"),
  // 공통교양 · 사이버강의 (디자인경영전공 권장)
  k("언어의이해 (사이버)", "언어와 철학", 3, null, true),
  k("이미지와상상력 (사이버)", "예술과 디자인", 3, null, true),
  k("사운드와컴퓨터음악 (사이버)", "과학과 컴퓨터", 3, null, true),
  k("인간심리의이해 (사이버)", "사회와 경제", 3, null, true),
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 6, courses }));
  if (window.cloudSave) window.cloudSave(getState());
}
function getState() { return { v: 6, courses }; }

// --- 파생 계산 ---
function earnedByArea() {
  const m = {};
  AREAS.forEach((a) => (m[a] = 0));
  courses.forEach((c) => { if (m[c.area] !== undefined) m[c.area] += Number(c.credits) || 0; });
  return m;
}
function countByArea(area) {
  return courses.filter((c) => c.area === area).length;
}
function cyberEarned() {
  return courses.filter((c) => c.cyber).reduce((s, c) => s + (Number(c.credits) || 0), 0);
}
function isSubDone(sub, earned) {
  const cnt = countByArea(sub.area);
  if (sub.need) return cnt >= sub.need;
  if (sub.req) return (earned[sub.area] || 0) >= sub.req;
  return cnt >= 1;
}
function coursesBySemester(sem) { return courses.filter((c) => c.semester === sem); }
function semLabel(sem) { const [y, s] = sem.split("-"); return `${y}학년 ${s}학기`; }

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

function renderGroups() {
  const earned = earnedByArea();
  document.getElementById("groups").innerHTML = GROUPS.map((g) => renderGroup(g, earned)).join("");
}

function renderGroup(g, earned) {
  const body = g.subs
    .map((sub) => (sub.mode === "credits" ? creditCard(sub, earned) : doneRow(sub, earned)))
    .join("");

  let summary, ok = false;
  if (g.type === "credits") {
    const e = g.subs.reduce((s, sub) => s + (earned[sub.area] || 0), 0);
    summary = `${e} / ${g.target}학점`;
    ok = e >= g.target;
  } else {
    const done = g.subs.filter((sub) => isSubDone(sub, earned)).length;
    const need = g.need || g.subs.length;
    summary = `${done} / ${need} 이수`;
    ok = done >= need;
  }

  return `
    <section class="group">
      <div class="group-head">
        <div>
          <h2>${escapeHtml(g.title)}</h2>
          ${g.note ? `<p class="group-note">${escapeHtml(g.note)}</p>` : ""}
        </div>
        <span class="group-sum ${ok ? "ok" : ""}">${summary}</span>
      </div>
      <div class="group-body ${g.type === "credits" ? "req-grid" : "done-list"}">${body}</div>
    </section>`;
}

function creditCard(sub, earned) {
  const e = earned[sub.area] || 0;
  const req = sub.req;
  const pct = req > 0 ? Math.min(100, Math.round((e / req) * 100)) : 0;
  const done = e >= req;
  const badge = done ? `<span class="badge done">충족</span>` : `<span class="badge">${req - e}학점 남음</span>`;
  return `
    <div class="area-card">
      <div class="area-card-top"><span class="area-name">${escapeHtml(sub.label)}</span>${badge}</div>
      ${sub.desc ? `<div class="area-desc">${escapeHtml(sub.desc)}</div>` : ""}
      <div class="area-credits">${e}<span> / ${req}학점</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>`;
}

function doneRow(sub, earned) {
  const done = isSubDone(sub, earned);
  const cnt = countByArea(sub.area);
  const e = earned[sub.area] || 0;
  const tags = [];
  if (sub.required) tags.push(`<span class="tag-mini req">필수</span>`);
  if (sub.optional) tags.push(`<span class="tag-mini">제외 가능</span>`);
  const sub2 = sub.need
    ? `${cnt}/${sub.need}과목`
    : sub.req
    ? `${e}/${sub.req}학점`
    : cnt
    ? `${cnt}과목`
    : "";
  const pill = done ? `<span class="pill done">완료</span>` : `<span class="pill todo">미이수</span>`;
  const hint = sub.hint ? `<div class="done-hint">${escapeHtml(sub.hint)}</div>` : "";
  return `
    <div class="done-row">
      <div class="done-left">
        <div class="done-top">
          <span class="done-name">${escapeHtml(sub.label)}</span>
          ${tags.join("")}
          ${sub2 ? `<span class="done-sub">${sub2}</span>` : ""}
        </div>
        ${hint}
      </div>
      ${pill}
    </div>`;
}

function renderCyber() {
  const bar = document.getElementById("cyberBar");
  const used = cyberEarned();
  const remain = Math.max(0, CYBER_LIMIT - used);
  const pct = Math.min(100, Math.round((used / CYBER_LIMIT) * 100));
  const over = used > CYBER_LIMIT;
  bar.className = "cyber-bar" + (over ? " over" : "");
  bar.innerHTML = `
    <div class="cy-main">
      <span class="cy-count">🖥 사이버강의 <b>${used}</b>학점 사용</span>
      <span class="cy-limit">최대 ${CYBER_LIMIT}학점까지만 수강 가능</span>
    </div>
    <div class="cy-track" title="${used} / ${CYBER_LIMIT}"><div class="cy-fill" style="width:${pct}%"></div></div>
    <span class="cy-note">${over ? "⚠ 한도 초과! 24학점까지만 인정돼요" : `앞으로 ${remain}학점 더 신청 가능 (채우는 게 아니라 한도예요)`}</span>
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
  renderGroups();
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
  areaSel.innerHTML = AREA_GROUPS.map(
    (g) => `<optgroup label="${escapeAttr(g.label)}">${g.areas
      .map((a) => `<option value="${escapeAttr(a)}">${escapeHtml(a)}</option>`)
      .join("")}</optgroup>`
  ).join("");

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
  document.addEventListener("click", (e) => { if (!e.target.closest(".combo")) closeCombo(); });

  document.getElementById("addToggle").addEventListener("click", togglePanel);
  document.getElementById("apClose").addEventListener("click", closePanel);
  document.getElementById("apCancel").addEventListener("click", closePanel);
  document.getElementById("apReset").addEventListener("click", resetForm);
  document.getElementById("addBtn").addEventListener("click", addCourse);
  document.addEventListener("click", (e) => { if (!e.target.closest(".add-wrap")) closePanel(); });
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
  document.getElementById("addPanel").scrollIntoView({ block: "nearest", behavior: "smooth" });
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
  comboItems = (q ? CATALOG.filter((c) => c.name.toLowerCase().includes(q)) : CATALOG).slice(0, 30);
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
    document.getElementById("fArea").value = hit.area; form.area = hit.area;
    document.getElementById("fCredits").value = String(hit.credits); form.credits = String(hit.credits);
    if (hit.semester) { document.getElementById("fSemester").value = hit.semester; form.semester = hit.semester; }
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
  setApStatus(`추가됨 · ${name}`);
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
  if (!incoming || !Array.isArray(incoming.courses)) return;
  courses = incoming.courses.filter(isValidCourse);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 6, courses }));
  renderAll();
};
window.clearAppData = () => {
  courses = [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 6, courses }));
  renderAll();
};

initForm();
renderAll();
