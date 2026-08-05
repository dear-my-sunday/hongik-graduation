// 졸업요건 정리 — 홍익대 디자인·예술경영학부 디자인경영전공 (2026학번 기준)
// 자료 출처: 2026 교과과정책자(안) 및 학과 공지.
// 체크 기록은 이 브라우저에 자동 저장되고, 로그인하면 기기 간 동기화됩니다.
const STORAGE_KEY = "hd-graduate-v3";

// course(과목명, 학수번호, 학점, 학년, 학기)  — 학기 0 = 무관
const co = (name, code, credit, year, sem) => ({ name, code, credit, year, sem, done: false });

const defaultData = [
  {
    name: "전공필수",
    note: "전부 반드시 이수해야 하는 과목",
    required: 15,
    open: true,
    picker: false,
    catalog: [],
    added: [
      co("경제학원론", "381101", 3, 1, 1),
      co("디자인론", "381102", 3, 1, 1),
      co("기업과경영", "381201", 3, 1, 2),
      co("인간공학", "381402", 3, 2, 1),
      co("기업법", "381401", 3, 3, 2),
    ],
  },
  {
    name: "전공선택",
    note: "아래에서 골라 담으세요. 전공필수와 합쳐 전공 50학점(전공선택 약 35학점).",
    required: 35,
    open: true,
    picker: true,
    added: [],
    catalog: [
      // 1학년
      co("회계원리", "381301", 3, 1, 1),
      co("공연예술사", "381103", 3, 1, 1),
      co("디자인프로세스", "381202", 3, 1, 2),
      co("서양미술사", "381409", 3, 1, 2),
      co("대중문화론", "381203", 3, 1, 2),
      // 2학년
      co("운영관리", "381308", 3, 2, 1),
      co("마케팅", "381302", 3, 2, 1),
      co("미시경제학", "381303", 3, 2, 1),
      co("법학개론", "381304", 3, 2, 1),
      co("한국미술사", "381410", 3, 2, 1),
      co("재무관리", "381403", 3, 2, 2),
      co("조직행동", "381404", 3, 2, 2),
      co("거시경제학", "381405", 3, 2, 2),
      co("디자인기획", "381407", 3, 2, 2),
      co("광고커뮤니케이션", "381307", 3, 2, 2),
      co("법과현대생활", "381411", 3, 2, 2),
      // 3학년
      co("전략경영", "381503", 3, 3, 1),
      co("소비자행동", "381601", 3, 3, 1),
      co("법과경영", "381507", 3, 3, 1),
      co("투자론", "381807", 3, 3, 1),
      co("원가관리회계", "381413", 3, 3, 1),
      co("디자인사", "381416", 3, 3, 1),
      co("IT와창의융합경영", "381508", 3, 3, 1),
      co("재무회계", "381602", 3, 3, 2),
      co("벤처창업론", "381501", 3, 3, 2),
      co("브랜드디자인전략", "381506", 3, 3, 2),
      co("서비스마케팅", "381414", 3, 3, 2),
      co("문화예술경영", "381415", 3, 3, 2),
      // 4학년 (현행 디자인경영융합학부 과정 기준 · 추후 개편 가능)
      co("인적자원관리", "381703", 3, 4, 1),
      co("디자인매니지먼트", "381706", 3, 4, 1),
      co("법과분쟁해결", "381420", 3, 4, 1),
      co("기업경영과세무", "381417", 3, 4, 1),
      co("동양미술사", "381418", 3, 4, 1),
      co("사진세미나", "381419", 3, 4, 1),
      co("E-비지니스심화(SW)", "381801", 3, 4, 2),
      co("지식재산권법", "381802", 3, 4, 2),
      co("디자인세미나", "381805", 3, 4, 2),
      co("물류경영", "381704", 3, 4, 2),
      co("비즈니스디자인현장실습", "381421", 3, 4, 2),
      co("박물관학과미술경영", "381422", 3, 4, 2),
    ],
  },
  {
    name: "전공기초",
    note: "전공기초영어(Ⅰ) / (Ⅱ) 중 한 과목 필수",
    required: 2,
    open: false,
    picker: false,
    catalog: [],
    added: [co("전공기초영어(Ⅰ) 또는 (Ⅱ) 중 택1", "007114/007115", 2, 1, 2)],
  },
  {
    name: "교양필수",
    note: "둘 다 이수 (총 6학점)",
    required: 6,
    open: false,
    picker: false,
    catalog: [],
    added: [
      co("대학영어", "001023", 3, 1, 1),
      co("논리적사고와글쓰기(경영)", "001013", 3, 1, 1),
    ],
  },
  {
    name: "특성화교양",
    note: "사이버강좌. 셋 중 1과목 필수 이수. (사이버 교양은 재학 중 최대 2과목·24학점 이내)",
    required: 3,
    open: false,
    picker: true,
    added: [],
    catalog: [
      co("컴퓨팅사고", "008754", 3, 1, 0),
      co("디자인씽킹", "008751", 3, 1, 0),
      co("창업과실용법률", "008752", 3, 1, 0),
    ],
  },
  {
    name: "SW·데이터활용역량인증",
    note: "인증과목 총 9학점. ‘E-비지니스심화(SW)’는 심화모듈 대체 인정. 매 학기 개설과목을 확인해 담으세요.",
    required: 9,
    open: false,
    picker: true,
    added: [],
    catalog: [co("E-비지니스심화(SW)", "381801", 3, 4, 2)],
  },
  {
    name: "공통교양 (6개 영역)",
    note: "7개 영역 중 6개 영역에서 각 1과목 이상 (‘예술과 디자인’ 제외, ‘외국어와 한문’ 2과목 포함). ‘(사이버)’ 표시는 온라인 강의 — 매 학기 개설과목은 클래스넷에서 확인하세요.",
    required: 18,
    open: false,
    picker: true,
    added: [],
    catalog: [
      co("교양중국어(1)", "002603", 3, 1, 1),
      co("문학과창의적사고", "002585", 3, 3, 1),
      co("예술과법", "002559", 3, 3, 2),
      // 디자인경영전공 권장 사이버강의 (교과과정책자 기준)
      co("언어의이해 (사이버)", "002173", 3, 0, 0),
      co("이미지와상상력 (사이버)", "002213", 3, 0, 0),
      co("사운드와컴퓨터음악 (사이버)", "002620", 3, 0, 0),
      co("인간심리의이해 (사이버)", "002529", 3, 0, 0),
    ],
  },
  {
    name: "일반선택 · 졸업논문",
    note: "졸업논문 통과 필수 — 택1: ① 전공성적확인서(전공 50학점, 평점 3.0 이상) ② 공인어학성적표(TOEIC 700 등) ③ 졸업논문 제출(표절률 15% 미만). 나머지는 자유롭게 채워 총 132학점을 맞추세요.",
    required: 44,
    open: false,
    picker: true,
    added: [],
    catalog: [co("졸업논문", "002714", 3, 4, 0)],
  },
];

let data = load();
let yearFilter = "all";

function load() {
  let saved;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    saved = raw ? JSON.parse(raw) : null;
  } catch {
    saved = null;
  }
  if (!saved) return structuredClone(defaultData);
  return refreshCatalog(saved);
}

// 저장된 진행상황(체크·담은 과목·순서)은 그대로 두고,
// 과목 목록(catalog)과 안내문(note)은 코드에서 최신으로 갱신한다.
function refreshCatalog(saved) {
  const defByName = {};
  defaultData.forEach((c) => (defByName[c.name] = c));
  saved.forEach((cat) => {
    const def = defByName[cat.name];
    if (def) {
      cat.catalog = structuredClone(def.catalog);
      cat.note = def.note;
    }
  });
  return saved;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // 로그인 상태면 클라우드에도 저장 (auth.js가 등록)
  if (window.cloudSave) window.cloudSave(data);
}

function earnedCredits(cat) {
  return cat.added
    .filter((c) => c.done)
    .reduce((sum, c) => sum + (Number(c.credit) || 0), 0);
}

function inYear(c) {
  return yearFilter === "all" || String(c.year) === yearFilter;
}

// 카탈로그에서 아직 담지 않은 항목 (학년 필터 적용)
function availableCatalog(cat) {
  return cat.catalog
    .map((c, idx) => ({ c, idx }))
    .filter(({ c }) => inYear(c))
    .filter(({ c }) => !cat.added.some((a) => sameCourse(a, c)));
}

function sameCourse(a, b) {
  if (a.code && b.code) return a.code === b.code;
  return a.name === b.name;
}

function semLabel(sem) {
  if (sem === 1) return "1학기";
  if (sem === 2) return "2학기";
  return "";
}

function render() {
  const container = document.getElementById("categories");
  container.innerHTML = "";

  let totalEarned = 0;
  let totalRequired = 0;

  data.forEach((cat, ci) => {
    const earned = earnedCredits(cat);
    totalEarned += earned;
    totalRequired += Number(cat.required) || 0;
    const pct = cat.required > 0 ? Math.min(100, (earned / cat.required) * 100) : 0;

    const visibleAdded = cat.added
      .map((c, idx) => ({ c, idx }))
      .filter(({ c }) => inYear(c));
    const avail = cat.picker ? availableCatalog(cat) : [];

    // 학년 필터 시, 이 학년과 관련된 게 아무것도 없으면 영역 숨김
    if (yearFilter !== "all" && visibleAdded.length === 0 && avail.length === 0) return;

    const el = document.createElement("div");
    el.className = "category";
    el.innerHTML = `
      <div class="category-head" data-toggle="${ci}">
        <div class="category-title">
          <span class="caret ${cat.open ? "open" : ""}">▶</span>
          <input class="name" value="${escapeAttr(cat.name)}" data-name="${ci}" />
        </div>
        <div class="category-meta">
          <span class="chip">${earned} / ${cat.required || 0}</span>
          <div class="mini-bar"><div class="mini-fill" style="width:${pct}%"></div></div>
          <button class="del-category" data-del-cat="${ci}" title="영역 삭제">×</button>
        </div>
      </div>
      <div class="courses" style="display:${cat.open ? "block" : "none"}">
        ${cat.note ? `<p class="cat-note">${escapeHtml(cat.note)}</p>` : ""}
        <div class="cat-target">
          목표 학점
          <input class="credits-input" type="number" min="0" value="${cat.required || 0}" data-required="${ci}" />
        </div>
        ${cat.picker ? pickerUI(cat, ci, avail) : ""}
        ${
          visibleAdded.length === 0 && !cat.picker
            ? `<p class="empty-hint">담긴 과목이 없어요.</p>`
            : ""
        }
        ${visibleAdded.map(({ c, idx }) => courseRow(c, ci, idx, cat.picker)).join("")}
      </div>
    `;
    container.appendChild(el);
  });

  const totalPct = totalRequired > 0 ? Math.min(100, (totalEarned / totalRequired) * 100) : 0;
  document.getElementById("totalProgress").style.width = totalPct + "%";
  document.getElementById("totalSummary").textContent = `${totalEarned} / ${totalRequired} 학점`;
}

function pickerUI(cat, ci, avail) {
  const options = avail
    .map(
      ({ c, idx }) =>
        `<option value="${idx}">${c.year ? c.year + "학년 · " : ""}${escapeHtml(c.name)}${
          c.credit ? " (" + c.credit + "학점)" : ""
        }</option>`
    )
    .join("");
  const selectHtml = avail.length
    ? `<select data-picker="${ci}"><option value="">과목 선택…</option>${options}</select>
       <button class="btn-add" data-add-picked="${ci}">추가</button>`
    : `<span class="empty-hint" style="flex:1">담을 수 있는 과목을 모두 담았어요.</span>`;
  return `
    <div class="picker">
      ${selectHtml}
      <button class="btn-manual" data-add-manual="${ci}">직접 추가</button>
    </div>
  `;
}

function courseRow(c, ci, cj, removable) {
  const yb = c.year ? `<span class="year-badge">${c.year}학년</span>` : "";
  const st = semLabel(c.sem) ? `<span class="sem-tag">${semLabel(c.sem)}</span>` : "";
  const delBtn = `<button class="del" data-del-course="${ci}:${cj}" title="${
    removable ? "빼기" : "삭제"
  }">${removable ? "×" : "🗑"}</button>`;
  return `
    <div class="course ${c.done ? "checked" : ""}">
      <input type="checkbox" ${c.done ? "checked" : ""} data-done="${ci}:${cj}" />
      ${yb}
      <input class="course-name" value="${escapeAttr(c.name)}" data-cname="${ci}:${cj}" />
      ${st}
      <input class="course-credit" type="number" min="0" value="${c.credit}" data-credit="${ci}:${cj}" />
      ${delBtn}
    </div>
  `;
}

function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}
function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// --- 학년 필터 ---
document.getElementById("yearFilter").addEventListener("click", (e) => {
  const btn = e.target.closest(".fchip");
  if (!btn) return;
  yearFilter = btn.dataset.year;
  document.querySelectorAll(".fchip").forEach((b) => b.classList.toggle("active", b === btn));
  render();
});

// --- 클릭 이벤트 ---
document.addEventListener("click", (e) => {
  const t = e.target;

  const toggle = t.closest("[data-toggle]");
  if (toggle && !t.matches("input, button")) {
    const ci = +toggle.dataset.toggle;
    data[ci].open = !data[ci].open;
    save();
    render();
    return;
  }

  if (t.dataset.addPicked !== undefined) {
    const ci = +t.dataset.addPicked;
    const sel = document.querySelector(`select[data-picker="${ci}"]`);
    if (sel && sel.value !== "") {
      const item = data[ci].catalog[+sel.value];
      data[ci].added.push({ ...item, done: false });
      if (!data[ci].open) data[ci].open = true;
      save();
      render();
    }
    return;
  }

  if (t.dataset.addManual !== undefined) {
    const ci = +t.dataset.addManual;
    const y = yearFilter === "all" ? 0 : Number(yearFilter);
    data[ci].added.push(co("새 과목", "", 3, y, 0));
    save();
    render();
    return;
  }

  if (t.dataset.delCourse !== undefined) {
    const [ci, cj] = t.dataset.delCourse.split(":").map(Number);
    data[ci].added.splice(cj, 1);
    save();
    render();
    return;
  }

  if (t.dataset.delCat !== undefined) {
    if (confirm("이 영역을 삭제할까요?")) {
      data.splice(+t.dataset.delCat, 1);
      save();
      render();
    }
    return;
  }
});

// --- 체크박스 ---
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.done !== undefined) {
    const [ci, cj] = t.dataset.done.split(":").map(Number);
    data[ci].added[cj].done = t.checked;
    save();
    render();
  }
});

// --- 텍스트/숫자 입력 ---
document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.dataset.cname !== undefined) {
    const [ci, cj] = t.dataset.cname.split(":").map(Number);
    data[ci].added[cj].name = t.value;
    save();
  } else if (t.dataset.credit !== undefined) {
    const [ci, cj] = t.dataset.credit.split(":").map(Number);
    data[ci].added[cj].credit = Number(t.value) || 0;
    save();
    updateTotals();
  } else if (t.dataset.name !== undefined) {
    data[+t.dataset.name].name = t.value;
    save();
  } else if (t.dataset.required !== undefined) {
    data[+t.dataset.required].required = Number(t.value) || 0;
    save();
    updateTotals();
  }
});

function updateTotals() {
  let te = 0, tr = 0;
  data.forEach((cat) => { te += earnedCredits(cat); tr += Number(cat.required) || 0; });
  const pct = tr > 0 ? Math.min(100, (te / tr) * 100) : 0;
  document.getElementById("totalProgress").style.width = pct + "%";
  document.getElementById("totalSummary").textContent = `${te} / ${tr} 학점`;
}

document.getElementById("addCategoryBtn").addEventListener("click", () => {
  data.push({ name: "새 영역", note: "", required: 0, open: true, picker: true, catalog: [], added: [] });
  save();
  render();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("모든 기록을 지우고 처음 상태로 되돌릴까요?")) {
    data = structuredClone(defaultData);
    save();
    render();
  }
});

// --- 클라우드(로그인) 연동용 훅 ---
window.getAppData = () => data;
window.setAppData = (incoming) => {
  if (!incoming) return;
  data = incoming;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  render();
};

render();
