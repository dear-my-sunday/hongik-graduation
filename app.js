// 졸업요건 대시보드 — 홍익대 디자인·예술경영학부 디자인경영전공 (2026학번 기준)
// 이 브라우저에 자동 저장되고, 로그인하면 기기 간 동기화됩니다.
const STORAGE_KEY = "hd-graduate-v6";
const TOTAL = 132;
const CYBER_LIMIT = 24;
const SEMS = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];
const GRAD_OPTIONS = ["졸업논문", "전공성적확인서", "공인어학성적표"];

const GROUPS = [
  {
    key: "major", title: "전공", place: "full", type: "credits", target: 50,
    note: "전공필수 + 전공선택 = 50학점 (전공필수는 전부 이수)",
    subs: [
      { area: "전공필수", label: "전공필수", req: 15, mode: "credits", desc: "반드시 듣는 전공 과목" },
      { area: "전공선택", label: "전공선택", req: 35, mode: "credits", desc: "골라 듣는 전공 과목" },
    ],
  },
  {
    key: "etc", title: "기타 지정과목", place: "L", type: "complete",
    note: "선택지가 적은 필수·지정 과목",
    subs: [
      { area: "전공기초", label: "전공기초영어", req: 2, mode: "complete", hint: "Ⅰ 또는 Ⅱ 중 택1 (2학점)" },
      { area: "교양필수", label: "교양필수", need: 2, mode: "complete", hint: "대학영어 + 논리적사고와글쓰기" },
      { area: "특성화교양", label: "특성화교양", need: 1, mode: "complete", hint: "컴퓨팅사고/디자인씽킹/창업과실용법률 중 택1" },
    ],
  },
  {
    key: "sw", title: "SW·데이터활용역량인증", place: "L", type: "complete", need: 3,
    note: "3개 모듈을 각각 이수 (총 9학점) · 매 학기 인증과목은 공지 확인",
    subs: [
      { area: "SW소양모듈", label: "소양모듈", need: 1, mode: "complete" },
      { area: "SW기초모듈", label: "기초모듈", need: 1, mode: "complete" },
      { area: "SW상위모듈", label: "상위모듈", need: 1, mode: "complete" },
    ],
  },
  {
    key: "ge", title: "공통교양", place: "R", type: "complete", need: 6,
    note: "7개 영역 중 6개만 이수하면 돼요 · ‘예술과 디자인’·‘제2외국어와 한문’은 필수 포함",
    subs: [
      { area: "언어와 철학", label: "언어와 철학", need: 1, mode: "complete" },
      { area: "예술과 디자인", label: "예술과 디자인", need: 1, mode: "complete", required: true },
      { area: "과학과 컴퓨터", label: "과학과 컴퓨터", need: 1, mode: "complete" },
      { area: "사회와 경제", label: "사회와 경제", need: 1, mode: "complete" },
      { area: "법과 생활", label: "법과 생활", need: 1, mode: "complete" },
      { area: "역사와 문화", label: "역사와 문화", need: 1, mode: "complete" },
      { area: "제2외국어와 한문", label: "제2외국어와 한문", need: 2, mode: "complete", required: true },
    ],
  },
  {
    key: "free", title: "자유선택", place: "full", type: "credits", target: 44,
    note: "위 영역에 안 들어가는 나머지 과목 (총 132학점 맞추기) · ‘직접 입력’으로 추가",
    subs: [{ area: "자유선택", label: "자유선택", req: 44, mode: "credits", desc: "나머지 과목" }],
  },
  {
    key: "grad", title: "기타 졸업요건", place: "full", type: "grad",
    note: "졸업논문 요건은 아래 중 하나로 충족돼요 (택1)",
    options: GRAD_OPTIONS,
    hints: {
      졸업논문: "논문 제출·심사 통과 (표절률 15% 미만)",
      전공성적확인서: "전공 50학점 · 평점평균 3.0 이상",
      공인어학성적표: "TOEIC 700 / TOEFL(IBT) 76 등",
    },
  },
];

const AREAS = GROUPS.filter((g) => g.subs).flatMap((g) => g.subs.map((s) => s.area));
const AREA_GROUPS = GROUPS.filter((g) => g.subs).map((g) => ({ label: g.title, areas: g.subs.map((s) => s.area) }));
const GE_AREAS = ["언어와 철학", "예술과 디자인", "과학과 컴퓨터", "사회와 경제", "법과 생활", "역사와 문화", "제2외국어와 한문"];
const AREA_TAG = {
  전공필수: "전필", 전공선택: "전선", 전공기초: "전기",
  교양필수: "교필", 특성화교양: "특교",
  SW소양모듈: "소양", SW기초모듈: "기초", SW상위모듈: "상위",
  자유선택: "자유",
};
GE_AREAS.forEach((a) => (AREA_TAG[a] = "공교"));

const CAT_ORDER = ["전공필수", "전공선택", "전공기초", "교양필수", "특성화교양", "공통교양", "자유선택"];
function catOf(area) { return GE_AREAS.includes(area) ? "공통교양" : area; }

const k = (name, area, credits, semester, cyber = false) => ({ name, area, credits, semester, cyber });
const CATALOG = [
  k("경제학원론", "전공필수", 3, "1-1"),
  k("디자인론", "전공필수", 3, "1-1"),
  k("기업과경영", "전공필수", 3, "1-2"),
  k("인간공학", "전공필수", 3, "2-1"),
  k("기업법", "전공필수", 3, "3-2"),
  k("전공기초영어Ⅰ", "전공기초", 2, "1-2"),
  k("전공기초영어Ⅱ", "전공기초", 2, "1-2"),
  k("회계원리", "전공선택", 3, "1-1"),
  k("공연예술사", "전공선택", 3, "1-1"),
  k("디자인프로세스", "전공선택", 3, "1-2"),
  k("서양미술사", "전공선택", 3, "1-2"),
  k("대중문화론", "전공선택", 3, "1-2"),
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
  k("대학영어", "교양필수", 3, "1-1"),
  k("논리적사고와글쓰기(경영)", "교양필수", 3, "1-1"),
  k("컴퓨팅사고", "특성화교양", 3, null, true),
  k("디자인씽킹", "특성화교양", 3, null, true),
  k("창업과실용법률", "특성화교양", 3, null, true),
  k("교양중국어(1)", "제2외국어와 한문", 3, "1-1"),
  k("문학과창의적사고", "언어와 철학", 3, "3-1"),
  k("예술과법", "법과 생활", 3, "3-2"),
  k("언어의이해 (사이버)", "언어와 철학", 3, null, true),
  k("이미지와상상력 (사이버)", "예술과 디자인", 3, null, true),
  k("사운드와컴퓨터음악 (사이버)", "과학과 컴퓨터", 3, null, true),
  k("인간심리의이해 (사이버)", "사회와 경제", 3, null, true),
];

const saved = readSaved();
let courses = Array.isArray(saved.courses) ? saved.courses.filter(isValidCourse) : [];
let gradReq = GRAD_OPTIONS.includes(saved.gradReq) ? saved.gradReq : null;
let form = { semester: "1-1", area: "전공필수", credits: "3", name: "" };
let pickCat = "전공필수", pickSub = null, pickMode = "cats";

// --- 저장/불러오기 ---
function readSaved() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function isValidCourse(c) {
  return c && typeof c.name === "string" && AREAS.includes(c.area) &&
    typeof c.credits === "number" && SEMS.includes(c.semester);
}
function getState() { return { v: 6, courses, gradReq }; }
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
  if (window.cloudSave) window.cloudSave(getState());
}

// --- 파생 계산 ---
function earnedByArea() {
  const m = {}; AREAS.forEach((a) => (m[a] = 0));
  courses.forEach((c) => { if (m[c.area] !== undefined) m[c.area] += Number(c.credits) || 0; });
  return m;
}
function countByArea(area) { return courses.filter((c) => c.area === area).length; }
function cyberEarned() { return courses.filter((c) => c.cyber).reduce((s, c) => s + (Number(c.credits) || 0), 0); }
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
  const byKey = Object.fromEntries(GROUPS.map((g) => [g.key, g]));
  document.getElementById("groups").innerHTML =
    renderGroup(byKey.major, earned) +
    `<div class="mid-grid">
       <div class="mid-col">${renderGroup(byKey.etc, earned)}${renderGroup(byKey.sw, earned)}</div>
       <div class="mid-col mid-col-fill">${renderGroup(byKey.ge, earned)}</div>
     </div>` +
    renderGroup(byKey.free, earned) +
    gradGroupHtml(byKey.grad);
}

function renderGroup(g, earned) {
  const body = g.subs.map((sub) => (sub.mode === "credits" ? creditCard(sub, earned) : doneRow(sub, earned))).join("");
  let summary, ok = false;
  if (g.type === "credits") {
    const e = g.subs.reduce((s, sub) => s + (earned[sub.area] || 0), 0);
    summary = `${e} / ${g.target}학점`; ok = e >= g.target;
  } else {
    const done = g.subs.filter((sub) => isSubDone(sub, earned)).length;
    const need = g.need || g.subs.length;
    summary = `${done} / ${need} 이수`; ok = done >= need;
  }
  return `
    <section class="group">
      <div class="group-head">
        <div><h2>${escapeHtml(g.title)}</h2>${g.note ? `<p class="group-note">${escapeHtml(g.note)}</p>` : ""}</div>
        <span class="group-sum ${ok ? "ok" : ""}">${summary}</span>
      </div>
      <div class="group-body ${g.type === "credits" ? "req-grid" : "done-list"}">${body}</div>
    </section>`;
}

function gradGroupHtml(g) {
  const done = !!gradReq;
  const opts = g.options
    .map((o) => `
      <button class="grad-opt ${gradReq === o ? "active" : ""}" data-grad="${escapeAttr(o)}">
        <span class="go-mark">${gradReq === o ? "●" : "○"}</span>
        <span class="go-body"><span class="go-name">${escapeHtml(o)}</span><span class="go-hint">${escapeHtml(g.hints[o])}</span></span>
      </button>`)
    .join("");
  return `
    <section class="group">
      <div class="group-head">
        <div><h2>${escapeHtml(g.title)}</h2><p class="group-note">${escapeHtml(g.note)}</p></div>
        <span class="group-sum ${done ? "ok" : ""}">${done ? "충족" : "미선택"}</span>
      </div>
      <div class="grad-opts">${opts}</div>
    </section>`;
}

function creditCard(sub, earned) {
  const e = earned[sub.area] || 0, req = sub.req;
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
  const cnt = countByArea(sub.area), e = earned[sub.area] || 0;
  const tags = sub.required ? `<span class="tag-mini req">필수</span>` : "";
  const sub2 = sub.need ? `${cnt}/${sub.need}과목` : sub.req ? `${e}/${sub.req}학점` : cnt ? `${cnt}과목` : "";
  const pill = done ? `<span class="pill done">완료</span>` : `<span class="pill todo">미이수</span>`;
  const hint = sub.hint ? `<div class="done-hint">${escapeHtml(sub.hint)}</div>` : "";
  return `
    <div class="done-row">
      <div class="done-left">
        <div class="done-top"><span class="done-name">${escapeHtml(sub.label)}</span>${tags}${sub2 ? `<span class="done-sub">${sub2}</span>` : ""}</div>
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
    <span class="cy-note">${over ? "⚠ 한도 초과! 24학점까지만 인정돼요" : `앞으로 ${remain}학점 더 신청 가능 (채우는 게 아니라 한도예요)`}</span>`;
}

function renderRoadmap() {
  const road = document.getElementById("roadmap");
  road.innerHTML = SEMS.map((sem) => {
    const list = coursesBySemester(sem);
    const sum = list.reduce((s, c) => s + (Number(c.credits) || 0), 0);
    const body = list.length
      ? list.map((c) => `
        <div class="chip-course">
          <span class="c-tag">${AREA_TAG[c.area] || ""}</span>
          <span class="c-name" title="${escapeAttr(c.name)}">${escapeHtml(c.name)}</span>
          <span class="c-credit">${c.credits}</span>
          <button class="c-del" data-del="${c.id}" title="삭제">×</button>
        </div>`).join("")
      : `<div class="sem-empty">담긴 과목 없음</div>`;
    return `
      <div class="sem-col">
        <div class="sem-head"><span class="sem-title">${semLabel(sem)}</span><span class="sem-count">${list.length}과목</span></div>
        <div class="sem-body">${body}</div>
        <div class="sem-sum">${sum}학점</div>
      </div>`;
  }).join("");
}

function renderAll() { renderHeader(); renderGroups(); renderCyber(); renderRoadmap(); }

function escapeAttr(s) { return String(s).replace(/"/g, "&quot;"); }
function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// ===== 과목 추가 패널 =====
function initForm() {
  const semSel = document.getElementById("fSemester");
  semSel.innerHTML = SEMS.map((s) => `<option value="${s}">${semLabel(s)}</option>`).join("");
  const areaSel = document.getElementById("fArea");
  areaSel.innerHTML = AREA_GROUPS.map(
    (g) => `<optgroup label="${escapeAttr(g.label)}">${g.areas.map((a) => `<option value="${escapeAttr(a)}">${escapeHtml(a)}</option>`).join("")}</optgroup>`
  ).join("");

  syncFormToUI();
  semSel.addEventListener("change", (e) => (form.semester = e.target.value));
  areaSel.addEventListener("change", (e) => (form.area = e.target.value));
  document.getElementById("fCredits").addEventListener("change", (e) => (form.credits = e.target.value));

  document.getElementById("pkCats").addEventListener("click", onCatClick);
  document.getElementById("pkCourses").addEventListener("click", (e) => {
    const b = e.target.closest(".pk-course"); if (!b) return;
    pickCourse(b.dataset.name);
  });

  document.getElementById("addToggle").addEventListener("click", togglePanel);
  document.getElementById("apClose").addEventListener("click", closePanel);
  document.getElementById("apCancel").addEventListener("click", closePanel);
  document.getElementById("apReset").addEventListener("click", resetForm);
  document.getElementById("addBtn").addEventListener("click", addCourse);
  // 바깥 클릭 닫기: mousedown 사용 (리렌더로 대상이 분리되기 전에 판정)
  document.addEventListener("mousedown", (e) => { if (!e.target.closest(".add-wrap")) closePanel(); });

  renderCats();
  renderCourses();
}

function syncFormToUI() {
  document.getElementById("fSemester").value = form.semester;
  document.getElementById("fArea").value = form.area;
  document.getElementById("fCredits").value = form.credits;
}

function catCount(cat) { return CATALOG.filter((c) => catOf(c.area) === cat).length; }
function geCount(area) { return CATALOG.filter((c) => c.area === area).length; }

function onCatClick(e) {
  const b = e.target.closest(".pk-cat"); if (!b) return;
  if (b.dataset.back) { pickMode = "cats"; pickSub = null; renderCats(); renderCourses(); return; }
  if (b.dataset.sub) { pickSub = b.dataset.sub; renderCats(); renderCourses(); return; }
  const cat = b.dataset.cat;
  if (cat === "공통교양") { pickMode = "ge"; pickSub = GE_AREAS[0]; renderCats(); renderCourses(); return; }
  pickCat = cat; pickMode = "cats"; renderCats(); renderCourses();
}

function renderCats() {
  const box = document.getElementById("pkCats");
  if (pickMode === "ge") {
    box.innerHTML =
      `<button class="pk-cat pk-back" data-back="1">← 뒤로</button>` +
      GE_AREAS.map((a) => `<button class="pk-cat ${a === pickSub ? "active" : ""}" data-sub="${escapeAttr(a)}">${escapeHtml(a)}<span>${geCount(a)}</span></button>`).join("");
    return;
  }
  const cats = CAT_ORDER.filter((c) => catCount(c) > 0);
  box.innerHTML =
    cats.map((c) => `<button class="pk-cat ${c === pickCat && pickMode === "cats" ? "active" : ""}" data-cat="${escapeAttr(c)}">${escapeHtml(c)}<span>${catCount(c)}</span></button>`).join("") +
    `<button class="pk-cat ${pickCat === "__manual" ? "active" : ""}" data-cat="__manual">✎ 직접 입력</button>`;
}

function renderCourses() {
  const box = document.getElementById("pkCourses");
  if (pickCat === "__manual" && pickMode === "cats") {
    box.innerHTML = `<div class="pk-manual">
        <input id="manualName" placeholder="과목명 직접 입력" value="${escapeAttr(form.name || "")}" autocomplete="off" />
        <p>목록에 없는 과목(타 전공 등)은 여기에 입력하고, 위에서 학기·학점·영역을 골라 추가하세요.</p>
      </div>`;
    const mi = document.getElementById("manualName");
    mi.addEventListener("input", (e) => (form.name = e.target.value));
    mi.focus();
    return;
  }
  const list = pickMode === "ge"
    ? CATALOG.filter((c) => c.area === pickSub)
    : CATALOG.filter((c) => catOf(c.area) === pickCat);
  box.innerHTML = list.length
    ? list.map((c) => {
        const meta = [`${c.credits}학점`, c.semester || "학기무관"].join(" · ");
        return `<button class="pk-course ${form.name === c.name ? "active" : ""}" data-name="${escapeAttr(c.name)}">
            <span class="pc-name">${escapeHtml(c.name)}${c.cyber ? " 💻" : ""}</span>
            <span class="pc-meta">${escapeHtml(meta)}</span>
          </button>`;
      }).join("")
    : `<div class="pk-manual"><p>이 분류에 등록된 과목이 없어요. ‘직접 입력’을 이용하세요.</p></div>`;
}

function pickCourse(name) {
  const hit = CATALOG.find((c) => c.name === name);
  form.name = name;
  if (hit) {
    document.getElementById("fArea").value = hit.area; form.area = hit.area;
    document.getElementById("fCredits").value = String(hit.credits); form.credits = String(hit.credits);
    if (hit.semester) { document.getElementById("fSemester").value = hit.semester; form.semester = hit.semester; }
  }
  renderCourses();
  setApStatus(`선택됨 · ${name}`);
}

function openPanel() {
  document.getElementById("addPanel").hidden = false;
  document.getElementById("addToggle").classList.add("open");
  setApStatus("");
  document.getElementById("addPanel").scrollIntoView({ block: "nearest", behavior: "smooth" });
}
function closePanel() {
  document.getElementById("addPanel").hidden = true;
  document.getElementById("addToggle").classList.remove("open");
}
function togglePanel() { document.getElementById("addPanel").hidden ? openPanel() : closePanel(); }

function resetForm() {
  form = { semester: "1-1", area: "전공필수", credits: "3", name: "" };
  syncFormToUI();
  pickCat = "전공필수"; pickMode = "cats"; pickSub = null;
  renderCats(); renderCourses();
  setApStatus("");
}
function setApStatus(text) { const el = document.getElementById("apStatus"); if (el) el.textContent = text; }

function addCourse() {
  const name = (form.name || "").trim();
  if (!name) { setApStatus("과목을 선택하거나 직접 입력하세요"); return; }
  const cat = CATALOG.find((c) => c.name === name);
  courses.push({
    id: "c" + Date.now() + Math.random().toString(36).slice(2, 6),
    name, area: form.area, credits: Number(form.credits) || 0, semester: form.semester,
    cyber: cat ? !!cat.cyber : false,
  });
  form.name = "";
  persist(); renderAll(); renderCourses();
  setApStatus(`추가됨 · ${name}`);
}

// --- 클릭: 삭제 / 기타졸업요건 선택 ---
document.addEventListener("click", (e) => {
  const del = e.target.closest("[data-del]");
  if (del) { courses = courses.filter((c) => c.id !== del.dataset.del); persist(); renderAll(); return; }
  const gd = e.target.closest("[data-grad]");
  if (gd) { const o = gd.dataset.grad; gradReq = gradReq === o ? null : o; persist(); renderAll(); return; }
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("담은 과목과 선택을 모두 지울까요?")) { courses = []; gradReq = null; resetForm(); persist(); renderAll(); }
});

// --- 클라우드 연동 훅 ---
window.getAppData = getState;
window.setAppData = (incoming) => {
  if (!incoming || !Array.isArray(incoming.courses)) return;
  courses = incoming.courses.filter(isValidCourse);
  gradReq = GRAD_OPTIONS.includes(incoming.gradReq) ? incoming.gradReq : null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
  renderAll();
};
window.clearAppData = () => {
  courses = []; gradReq = null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
  renderAll();
};

initForm();
renderAll();
