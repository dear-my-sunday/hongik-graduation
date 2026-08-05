// 졸업요건 정리 — 데이터는 브라우저(localStorage)에 자동 저장됩니다.
const STORAGE_KEY = "hd-graduate-v1";

// 처음 실행 시 보여줄 예시 데이터 (자유롭게 수정/삭제하세요)
const defaultData = [
  {
    name: "전공필수",
    required: 30,
    open: true,
    courses: [
      { name: "예시: 전공기초1", credit: 3, done: false },
      { name: "예시: 전공기초2", credit: 3, done: false },
    ],
  },
  {
    name: "전공선택",
    required: 30,
    open: true,
    courses: [{ name: "예시: 전공심화", credit: 3, done: false }],
  },
  {
    name: "교양필수",
    required: 15,
    open: false,
    courses: [{ name: "예시: 글쓰기", credit: 3, done: false }],
  },
  {
    name: "교양선택 / 기타",
    required: 15,
    open: false,
    courses: [],
  },
];

let data = load();

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

// 이수 학점 = 완료 체크된 과목의 학점 합
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
        <div style="display:flex;align-items:center;gap:8px;margin:4px 0 10px;color:var(--muted);font-size:12px">
          목표 학점
          <input class="credits-input" type="number" min="0" value="${cat.required || 0}" data-required="${ci}" />
        </div>
        ${cat.courses.map((c, cj) => courseRow(c, ci, cj)).join("")}
        <button class="add-course" data-add-course="${ci}">+ 과목 추가</button>
      </div>
    `;
    container.appendChild(el);
  });

  // 전체 진행률
  const totalPct = totalRequired > 0 ? Math.min(100, (totalEarned / totalRequired) * 100) : 0;
  document.getElementById("totalProgress").style.width = totalPct + "%";
  document.getElementById("totalSummary").textContent = `${totalEarned} / ${totalRequired} 학점`;
}

function courseRow(c, ci, cj) {
  return `
    <div class="course ${c.done ? "checked" : ""}">
      <input type="checkbox" ${c.done ? "checked" : ""} data-done="${ci}:${cj}" />
      <input class="course-name" value="${escapeAttr(c.name)}" data-cname="${ci}:${cj}" />
      <input class="course-credit" type="number" min="0" value="${c.credit}" data-credit="${ci}:${cj}" />
      <button class="del" data-del-course="${ci}:${cj}" title="과목 삭제">🗑</button>
    </div>
  `;
}

function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}

// --- 이벤트 위임 ---
document.addEventListener("click", (e) => {
  const t = e.target;

  // 영역 펼치기/접기 (입력창 클릭은 제외)
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
    data[ci].courses.push({ name: "새 과목", credit: 3, done: false });
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

// 학점만 바뀔 땐 전체 다시 그리지 않고 요약만 갱신 (입력 포커스 유지)
function updateTotals() {
  let te = 0, tr = 0;
  data.forEach((cat) => { te += earnedCredits(cat); tr += Number(cat.required) || 0; });
  const pct = tr > 0 ? Math.min(100, (te / tr) * 100) : 0;
  document.getElementById("totalProgress").style.width = pct + "%";
  document.getElementById("totalSummary").textContent = `${te} / ${tr} 학점`;
}

// 영역 추가
document.getElementById("addCategoryBtn").addEventListener("click", () => {
  data.push({ name: "새 영역", required: 0, open: true, courses: [] });
  save();
  render();
});

// 초기화
document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("모든 기록을 지우고 처음 상태로 되돌릴까요?")) {
    data = structuredClone(defaultData);
    save();
    render();
  }
});

render();
