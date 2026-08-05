// 졸업요건 정리 — 홍익대 디자인·예술경영학부 디자인경영전공 (2026학번 기준)
// 자료 출처: 2026 교과과정책자(안). 체크 기록은 브라우저(localStorage)에 자동 저장됩니다.
const STORAGE_KEY = "hd-graduate-v2";

// c(과목명, 학수번호, 학점, 학년, 학기)  — 학기 0 = 연중/무관
const c = (name, code, credit, year, sem) => ({ name, code, credit, year, sem, done: false });

const defaultData = [
  {
    name: "전공필수",
    note: "전부 반드시 이수해야 하는 과목",
    required: 15,
    open: true,
    courses: [
      c("경제학원론", "381101", 3, 1, 1),
      c("디자인론", "381102", 3, 1, 1),
      c("기업과경영", "381201", 3, 1, 2),
      c("인간공학", "381402", 3, 2, 1),
      c("기업법", "381401", 3, 3, 2),
    ],
  },
  {
    name: "전공선택",
    note: "전공필수와 합쳐 전공 50학점을 채우세요 (약 35학점 필요)",
    required: 35,
    open: true,
    courses: [
      // 1학년
      c("회계원리", "381301", 3, 1, 1),
      c("공연예술사", "381103", 3, 1, 1),
      c("디자인프로세스", "381202", 3, 1, 2),
      c("서양미술사", "381409", 3, 1, 2),
      c("대중문화론", "381203", 3, 1, 2),
      // 2학년
      c("운영관리", "381308", 3, 2, 1),
      c("마케팅", "381302", 3, 2, 1),
      c("미시경제학", "381303", 3, 2, 1),
      c("법학개론", "381304", 3, 2, 1),
      c("한국미술사", "381410", 3, 2, 1),
      c("재무관리", "381403", 3, 2, 2),
      c("조직행동", "381404", 3, 2, 2),
      c("거시경제학", "381405", 3, 2, 2),
      c("디자인기획", "381407", 3, 2, 2),
      c("광고커뮤니케이션", "381307", 3, 2, 2),
      c("법과현대생활", "381411", 3, 2, 2),
      // 3학년
      c("전략경영", "381503", 3, 3, 1),
      c("소비자행동", "381601", 3, 3, 1),
      c("법과경영", "381507", 3, 3, 1),
      c("투자론", "381807", 3, 3, 1),
      c("원가관리회계", "381413", 3, 3, 1),
      c("디자인사", "381416", 3, 3, 1),
      c("IT와창의융합경영", "381508", 3, 3, 1),
      c("재무회계", "381602", 3, 3, 2),
      c("벤처창업론", "381501", 3, 3, 2),
      c("브랜드디자인전략", "381506", 3, 3, 2),
      c("서비스마케팅", "381414", 3, 3, 2),
      c("문화예술경영", "381415", 3, 3, 2),
      // 4학년 (현재 디자인경영융합학부 과정 기준 · 추후 개편 가능)
      c("인적자원관리", "381703", 3, 4, 1),
      c("디자인매니지먼트", "381706", 3, 4, 1),
      c("법과분쟁해결", "381420", 3, 4, 1),
      c("기업경영과세무", "381417", 3, 4, 1),
      c("동양미술사", "381418", 3, 4, 1),
      c("사진세미나", "381419", 3, 4, 1),
      c("E-비지니스심화(SW)", "381801", 3, 4, 2),
      c("지식재산권법", "381802", 3, 4, 2),
      c("디자인세미나", "381805", 3, 4, 2),
      c("물류경영", "381704", 3, 4, 2),
      c("비즈니스디자인현장실습", "381421", 3, 4, 2),
      c("박물관학과미술경영", "381422", 3, 4, 2),
    ],
  },
  {
    name: "전공기초",
    note: "전공기초영어(Ⅰ) / 전공기초영어(Ⅱ) 중 한 과목 필수",
    required: 2,
    open: true,
    courses: [
      c("전공기초영어(Ⅰ) 또는 (Ⅱ) 중 택1", "007114/007115", 2, 1, 2),
    ],
  },
  {
    name: "교양필수",
    note: "둘 다 이수 (총 6학점)",
    required: 6,
    open: false,
    courses: [
      c("대학영어", "001023", 3, 1, 1),
      c("논리적사고와글쓰기(경영)", "001013", 3, 1, 1),
    ],
  },
  {
    name: "특성화교양",
    note: "컴퓨팅사고 / 디자인씽킹 / 창업과실용법률 중 한 과목 필수",
    required: 3,
    open: false,
    courses: [
      c("컴퓨팅사고", "008754", 3, 1, 0),
      c("디자인씽킹", "", 3, 1, 0),
      c("창업과실용법률", "", 3, 1, 0),
    ],
  },
  {
    name: "SW·데이터활용역량인증",
    note: "총 9학점. E-비지니스심화(SW)는 심화모듈로 대체 인정",
    required: 9,
    open: false,
    courses: [],
  },
  {
    name: "공통교양 (6개 영역)",
    note: "7개 영역 중 6개 영역에서 각 1과목 이상 (‘예술과 디자인’ 제외, ‘외국어와 한문’ 2과목 포함)",
    required: 18,
    open: false,
    courses: [
      c("교양중국어(1) (예시)", "002603", 3, 1, 1),
      c("문학과창의적사고 (예시)", "002585", 3, 3, 1),
      c("예술과법 (예시)", "002559", 3, 3, 2),
    ],
  },
  {
    name: "일반선택 · 졸업논문",
    note: "졸업논문 필수. 나머지는 자유롭게 채워 총 132학점을 맞추세요",
    required: 44,
    open: false,
    courses: [
      c("졸업논문", "002714", 3, 4, 0),
    ],
  },
];

let data = load();
let yearFilter = "all";

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(defaultData);
  } catch {
    return structuredClone(defaultData);
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function earnedCredits(cat) {
  return cat.courses
    .filter((c) => c.done)
    .reduce((sum, c) => sum + (Number(c.credit) || 0), 0);
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

    // 학년 필터: 해당 학년 과목이 하나도 없으면 이 영역은 숨김
    const visibleCourses = cat.courses.filter(
      (co) => yearFilter === "all" || String(co.year) === yearFilter
    );
    if (yearFilter !== "all" && visibleCourses.length === 0) return;

    const el = document.createElement("div");
    el.className = "category";
    el.innerHTML = `
      <div class="category-head" data-toggle="${ci}">
        <div class="category-title">
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
        ${visibleCourses
          .map((co) => courseRow(co, ci, cat.courses.indexOf(co)))
          .join("")}
        <button class="add-course" data-add-course="${ci}">+ 과목 추가</button>
      </div>
    `;
    container.appendChild(el);
  });

  const totalPct = totalRequired > 0 ? Math.min(100, (totalEarned / totalRequired) * 100) : 0;
  document.getElementById("totalProgress").style.width = totalPct + "%";
  document.getElementById("totalSummary").textContent = `${totalEarned} / ${totalRequired} 학점`;
}

function semLabel(sem) {
  if (sem === 1) return "1학기";
  if (sem === 2) return "2학기";
  return "";
}

function courseRow(co, ci, cj) {
  const yb = co.year ? `<span class="year-badge">${co.year}학년</span>` : "";
  const st = semLabel(co.sem) ? `<span class="sem-tag">${semLabel(co.sem)}</span>` : "";
  return `
    <div class="course ${co.done ? "checked" : ""}">
      <input type="checkbox" ${co.done ? "checked" : ""} data-done="${ci}:${cj}" />
      ${yb}
      <input class="course-name" value="${escapeAttr(co.name)}" data-cname="${ci}:${cj}" />
      ${st}
      <input class="course-credit" type="number" min="0" value="${co.credit}" data-credit="${ci}:${cj}" />
      <button class="del" data-del-course="${ci}:${cj}" title="과목 삭제">🗑</button>
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

// --- 이벤트 위임 ---
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

  if (t.dataset.addCourse !== undefined) {
    const ci = +t.dataset.addCourse;
    const y = yearFilter === "all" ? 0 : Number(yearFilter);
    data[ci].courses.push(c("새 과목", "", 3, y, 0));
    save();
    render();
    return;
  }

  if (t.dataset.delCourse !== undefined) {
    const [ci, cj] = t.dataset.delCourse.split(":").map(Number);
    data[ci].courses.splice(cj, 1);
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

document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.done !== undefined) {
    const [ci, cj] = t.dataset.done.split(":").map(Number);
    data[ci].courses[cj].done = t.checked;
    save();
    render();
  }
});

document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.dataset.cname !== undefined) {
    const [ci, cj] = t.dataset.cname.split(":").map(Number);
    data[ci].courses[cj].name = t.value;
    save();
  } else if (t.dataset.credit !== undefined) {
    const [ci, cj] = t.dataset.credit.split(":").map(Number);
    data[ci].courses[cj].credit = Number(t.value) || 0;
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
  data.push({ name: "새 영역", note: "", required: 0, open: true, courses: [] });
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

render();
