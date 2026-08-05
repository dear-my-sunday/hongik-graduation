// 졸업요건 대시보드 — 홍익대 디자인·예술경영학부 디자인경영전공 (2026학번 기준)
// 과목을 학기/영역별로 담아 이수 현황을 계산합니다.
// 이 브라우저에 자동 저장되고, 로그인하면 기기 간 동기화됩니다.
const STORAGE_KEY = "hd-graduate-v4";

const AREAS = ["전공필수", "전공선택", "교양", "자유선택"];
const REQ = { 전공필수: 15, 전공선택: 35, 교양: 50, 자유선택: 32 }; // 합계 132
const TOTAL = 132;
const SEMS = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];
const AREA_TAG = { 전공필수: "전필", 전공선택: "전선", 교양: "교양", 자유선택: "자유" };

// 실제 교과과정 과목 (자동완성용). k(과목명, 영역, 학점, 학기|null)
const k = (name, area, credits, semester) => ({ name, area, credits, semester });
const CATALOG = [
  // 전공필수
  k("경제학원론", "전공필수", 3, "1-1"),
  k("디자인론", "전공필수", 3, "1-1"),
  k("기업과경영", "전공필수", 3, "1-2"),
  k("인간공학", "전공필수", 3, "2-1"),
  k("기업법", "전공필수", 3, "3-2"),
  // 전공기초 (전공선택으로 분류)
  k("전공기초영어(Ⅰ/Ⅱ 택1)", "전공선택", 2, "1-2"),
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
  // 교양필수 / 특성화 / 공통교양 / 사이버
  k("대학영어", "교양", 3, "1-1"),
  k("논리적사고와글쓰기(경영)", "교양", 3, "1-1"),
  k("컴퓨팅사고", "교양", 3, null),
  k("디자인씽킹", "교양", 3, null),
  k("창업과실용법률", "교양", 3, null),
  k("교양중국어(1)", "교양", 3, "1-1"),
  k("문학과창의적사고", "교양", 3, "3-1"),
  k("예술과법", "교양", 3, "3-2"),
  k("언어의이해 (사이버)", "교양", 3, null),
  k("이미지와상상력 (사이버)", "교양", 3, null),
  k("사운드와컴퓨터음악 (사이버)", "교양", 3, null),
  k("인간심리의이해 (사이버)", "교양", 3, null),
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 4, courses }));
  if (window.cloudSave) window.cloudSave(getState());
}
function getState() { return { v: 4, courses }; }

// --- 파생 계산 ---
function earnedByArea() {
  const m = { 전공필수: 0, 전공선택: 0, 교양: 0, 자유선택: 0 };
  courses.forEach((c) => (m[c.area] += Number(c.credits) || 0));
  return m;
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
          <span class="area-name">${area}</span>
          ${badge}
        </div>
        <div class="area-credits">${e}<span> / ${req}학점</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>`;
  }).join("");
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
          <span class="c-tag">${AREA_TAG[c.area]}</span>
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
  renderRoadmap();
}

function escapeAttr(s) { return String(s).replace(/"/g, "&quot;"); }
function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// --- 폼 초기화 ---
function initForm() {
  const semSel = document.getElementById("fSemester");
  semSel.innerHTML = SEMS.map((s) => `<option value="${s}">${semLabel(s)}</option>`).join("");
  const areaSel = document.getElementById("fArea");
  areaSel.innerHTML = AREAS.map((a) => `<option value="${a}">${a}</option>`).join("");
  document.getElementById("courseList").innerHTML = CATALOG.map(
    (c) => `<option value="${escapeAttr(c.name)}"></option>`
  ).join("");

  semSel.value = form.semester;
  areaSel.value = form.area;
  document.getElementById("fCredits").value = form.credits;

  semSel.addEventListener("change", (e) => (form.semester = e.target.value));
  areaSel.addEventListener("change", (e) => (form.area = e.target.value));
  document.getElementById("fCredits").addEventListener("change", (e) => (form.credits = e.target.value));

  // 과목명 입력 시 실제 과목이면 영역/학점/학기 자동 채움
  const nameInput = document.getElementById("fName");
  nameInput.addEventListener("input", (e) => {
    const hit = CATALOG.find((c) => c.name === e.target.value);
    if (hit) {
      areaSel.value = hit.area; form.area = hit.area;
      document.getElementById("fCredits").value = String(hit.credits); form.credits = String(hit.credits);
      if (hit.semester) { semSel.value = hit.semester; form.semester = hit.semester; }
    }
  });
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); addCourse(); }
  });

  document.getElementById("addBtn").addEventListener("click", addCourse);
}

function addCourse() {
  const nameInput = document.getElementById("fName");
  const name = nameInput.value.trim();
  if (!name) return;
  courses.push({
    id: "c" + Date.now() + Math.random().toString(36).slice(2, 6),
    name,
    area: form.area,
    credits: Number(form.credits) || 0,
    semester: form.semester,
  });
  nameInput.value = ""; // 과목명만 비우고 학기/영역/학점은 유지
  persist();
  renderAll();
  nameInput.focus();
}

// --- 삭제 (이벤트 위임) ---
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
    form = { semester: "1-1", area: "전공필수", credits: "3" };
    initForm();
    persist();
    renderAll();
  }
});

// --- 클라우드(로그인) 연동 훅 ---
window.getAppData = getState;
window.setAppData = (incoming) => {
  if (!incoming || !Array.isArray(incoming.courses)) return; // 옛 형식/손상 데이터 무시
  courses = incoming.courses.filter(isValidCourse);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 4, courses }));
  renderAll();
};

initForm();
renderAll();
