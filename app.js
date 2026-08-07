// 졸업요건 대시보드 — 홍익대 디자인·예술경영학부 디자인경영전공 (2026학번 기준)
// 이 브라우저에 자동 저장되고, 로그인하면 기기 간 동기화됩니다.
const STORAGE_KEY = "hd-graduate-v6";
const TOTAL = 132;
const CYBER_LIMIT = 24;
const SEMS = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];
const GRAD_OPTIONS = ["졸업논문", "전공성적확인서", "공인어학성적표"];
const GE_AREAS = ["언어와 철학", "예술과 디자인", "과학과 컴퓨터", "사회와 경제", "법과 생활", "역사와 문화", "제2외국어와 한문"];
const SW_MODULES = ["SW소양모듈", "SW기초모듈", "SW상위모듈"];

const GROUPS = [
  {
    key: "major", title: "전공", place: "full", type: "credits", target: 50,
    note: "전공필수 + 전공선택 = 50학점 (전공필수는 전부 이수 · 4년간 5과목 15학점)",
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
    note: "소양·기초·상위 모듈 각 1과목씩 총 9학점 · 상위(심화)모듈을 들으면 하위모듈도 인정돼요 (예: 심화모듈만 3과목 들어도 인증 취득)",
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
      { area: "제2외국어와 한문", label: "제2외국어와 한문", need: 1, mode: "complete", required: true },
    ],
  },
  {
    key: "free", title: "자유선택", place: "full", type: "credits", target: 44,
    note: "위 영역에 미포함되는 자율적 선택 과목",
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
const AREA_TAG = {
  전공필수: "전필", 전공선택: "전선", 전공기초: "전기",
  교양필수: "교필", 특성화교양: "특교",
  SW소양모듈: "소양", SW기초모듈: "기초", SW상위모듈: "상위",
  자유선택: "자유",
};
GE_AREAS.forEach((a) => (AREA_TAG[a] = "공교"));
const GEN_SERIES = ["인문계열", "사회계열", "자연계열", "예체능계열", "영어계열", "제2외국어계열"];

// 과목 선택기 대분류(cat) → 하위(sub). 공통교양·SW·일반교양은 한 단계 더 나뉨.
const CAT_ORDER = ["전공필수", "전공선택", "전공기초", "교양필수", "특성화교양", "SW·데이터활용", "공통교양", "일반교양", "자유선택"];
const DRILL_SUBS = { "공통교양": GE_AREAS, "SW·데이터활용": SW_MODULES, "일반교양": GEN_SERIES };
function isDrill(cat) { return !!DRILL_SUBS[cat]; }

// area(요건 집계용) → [cat, sub] (피커 위치)
function catSubOf(area) {
  if (GE_AREAS.includes(area)) return ["공통교양", area];
  if (SW_MODULES.includes(area)) return ["SW·데이터활용", area];
  return [area, null];
}
// 일반 과목: cat/sub는 area에서 유도
const k = (name, area, credits, semester, cyber = false) => {
  const [cat, sub] = catSubOf(area);
  return { name, area, credits, semester, cyber, cat, sub };
};
// 일반교양: 요건은 자유선택으로 집계하되, 피커에선 [일반교양 > 계열]에 표시
const g = (name, series, credits = 3) => ({ name, area: "자유선택", credits, semester: null, cyber: false, cat: "일반교양", sub: series });
const CATALOG = [
  // 전공필수
  k("경제학원론", "전공필수", 3, "1-1"),
  k("디자인론", "전공필수", 3, "1-1"),
  k("기업과경영", "전공필수", 3, "1-2"),
  k("인간공학", "전공필수", 3, "2-1"),
  k("기업법", "전공필수", 3, "3-2"),
  // 전공기초
  k("전공기초영어Ⅰ", "전공기초", 2, "1-2"),
  k("전공기초영어Ⅱ", "전공기초", 2, "1-2"),
  // 전공선택
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
  // 교양필수
  k("대학영어", "교양필수", 3, "1-1"),
  k("논리적사고와글쓰기(경영)", "교양필수", 3, "1-1"),
  // 특성화교양 (택1) — 사이버/일반 옵션은 아래에서 자동 생성
  k("컴퓨팅사고", "특성화교양", 3, null),
  k("디자인씽킹", "특성화교양", 3, null),
  k("창업과실용법률", "특성화교양", 3, null),
  // SW·데이터활용 — 소양모듈
  k("컴퓨팅사고", "SW소양모듈", 3, null),
  k("컴퓨터소프트웨어개론", "SW소양모듈", 3, null),
  k("체험인공지능", "SW소양모듈", 3, null),
  // SW·데이터활용 — 기초모듈
  k("컴퓨터활용기초", "SW기초모듈", 3, null),
  k("컴퓨터SW기초", "SW기초모듈", 3, null),
  k("빅데이터의이해", "SW기초모듈", 3, null),
  k("컴퓨터응용통계", "SW기초모듈", 3, null),
  k("컴퓨터정보통신공학개론", "SW기초모듈", 3, null),
  k("인터페이스디자인입문", "SW기초모듈", 3, null),
  k("데이터분석의이해", "SW기초모듈", 3, null),
  // SW·데이터활용 — 상위(심화)모듈
  k("파이썬프로그래밍(입문)", "SW상위모듈", 3, null),
  k("파이썬프로그래밍(응용)", "SW상위모듈", 3, null),
  k("파이썬프로그래밍", "SW상위모듈", 3, null),
  k("언어와빅데이터", "SW상위모듈", 3, null),
  k("통계와코딩", "SW상위모듈", 3, null),
  k("데이터시각화와스토리텔링", "SW상위모듈", 3, null),
  k("C-프로그래밍", "SW상위모듈", 3, null),
  k("문제해결과SW프로그래밍", "SW상위모듈", 3, null),
  k("객체지향프로그래밍", "SW상위모듈", 3, null),
  k("MATLAB프로그래밍및실습", "SW상위모듈", 3, null),
  k("웹프로그래밍", "SW상위모듈", 3, null),
  // 공통교양 — 언어와 철학
  k("현대사회와윤리", "언어와 철학", 3, null),
  k("언어의이해", "언어와 철학", 3, null),
  k("논리와사고", "언어와 철학", 3, null),
  k("문학과창의적사고", "언어와 철학", 3, null),
  k("현대인의의사소통", "언어와 철학", 3, null),
  k("서양철학입문", "언어와 철학", 3, null),
  k("동양철학입문", "언어와 철학", 3, null),
  // 공통교양 — 예술과 디자인
  k("미술의이해", "예술과 디자인", 3, null),
  k("현대생활과디자인", "예술과 디자인", 3, null),
  k("대중예술의이해", "예술과 디자인", 3, null),
  k("조형예술과미학", "예술과 디자인", 3, null),
  k("사진예술의이해", "예술과 디자인", 3, null),
  k("디지털디자인입문", "예술과 디자인", 3, null),
  k("시각과이미지", "예술과 디자인", 3, null),
  // 공통교양 — 과학과 컴퓨터
  k("화학과문명", "과학과 컴퓨터", 3, null),
  k("과학사", "과학과 컴퓨터", 3, null),
  k("물리현상의이해", "과학과 컴퓨터", 3, null),
  k("생물학탐구", "과학과 컴퓨터", 3, null),
  k("컴퓨터활용기초", "과학과 컴퓨터", 3, null),
  k("컴퓨터SW기초", "과학과 컴퓨터", 3, null),
  // 공통교양 — 사회와 경제
  k("인간관계론", "사회와 경제", 3, null),
  k("사회학의이해", "사회와 경제", 3, null),
  k("매스컴과현대사회", "사회와 경제", 3, null),
  k("마케팅의이해", "사회와 경제", 3, null),
  k("경제학입문", "사회와 경제", 3, null),
  k("인간심리의이해", "사회와 경제", 3, null),
  k("회계의이해", "사회와 경제", 3, null),
  // 공통교양 — 법과 생활
  k("정보사회와저작권", "법과 생활", 3, null),
  k("현대사회와법", "법과 생활", 3, null),
  k("지식재산과법", "법과 생활", 3, null),
  k("예술과법", "법과 생활", 3, null),
  k("인권과국가", "법과 생활", 3, null),
  k("범죄와사회", "법과 생활", 3, null),
  k("국제관계와법", "법과 생활", 3, null),
  // 공통교양 — 역사와 문화
  k("한국의문화유산", "역사와 문화", 3, null),
  k("문화인류학입문", "역사와 문화", 3, null),
  k("세계시민의식", "역사와 문화", 3, null),
  k("동양사의이해", "역사와 문화", 3, null),
  k("한국사의이해", "역사와 문화", 3, null),
  k("서양사의이해", "역사와 문화", 3, null),
  k("글로벌사회의이해", "역사와 문화", 3, null),
  // 공통교양 — 제2외국어와 한문
  k("교양독일어(1)", "제2외국어와 한문", 3, null),
  k("교양독일어(2)", "제2외국어와 한문", 2, null),
  k("교양프랑스어(1)", "제2외국어와 한문", 3, null),
  k("교양프랑스어(2)", "제2외국어와 한문", 2, null),
  k("교양일본어(1)", "제2외국어와 한문", 3, null),
  k("교양일본어(2)", "제2외국어와 한문", 2, null),
  k("교양중국어(1)", "제2외국어와 한문", 3, null),
  k("교양중국어(2)", "제2외국어와 한문", 2, null),
  k("교양한문(1)", "제2외국어와 한문", 3, null),
  k("교양스페인어(1)", "제2외국어와 한문", 3, null),
  k("교양스페인어(2)", "제2외국어와 한문", 2, null),
  // 일반교양 — 인문계열
  g("한국근현대사", "인문계열", 3),
  g("독일의문화와예술", "인문계열", 3),
  g("일본의문화와예술", "인문계열", 3),
  g("스페인,중남미의문화와예술", "인문계열", 3),
  g("이미지와상상력", "인문계열", 3),
  g("서양고전의이해", "인문계열", 3),
  g("연극의이해", "인문계열", 3),
  g("르네상스의문화와예술", "인문계열", 3),
  g("문학과영화", "인문계열", 3),
  g("글읽기의방법론", "인문계열", 3),
  g("한국문화의이해", "인문계열", 3),
  g("작문의기초와실제", "인문계열", 3),
  g("발표와토론", "인문계열", 3),
  g("현대예술과미학", "인문계열", 3),
  g("이태리사회와문화", "인문계열", 2),
  g("학술적 글읽기와 토론", "인문계열", 3),
  g("학술적 글쓰기와 발표", "인문계열", 3),
  g("한류와엔터테인먼트산업", "인문계열", 3),
  g("언어와빅데이터", "인문계열", 3),
  g("소리와HCI", "인문계열", 3),
  g("신화로배우는문화콘텐츠", "인문계열", 3),
  g("프랑스문화예술의멀티유니버스", "인문계열", 3),
  g("대학실용한국어", "인문계열", 3),
  g("잠언으로배우는삶", "인문계열", 3),
  g("긍정심리워크숍", "인문계열", 3),
  g("AI와함께하는인문학명저탐색", "인문계열", 3),
  g("아동미술심리상담의이해", "인문계열", 3),
  g("문학으로읽는사랑의윤리", "인문계열", 3),
  g("<인문명저읽기>-개인의삶과사회", "인문계열", 3),
  // 일반교양 — 사회계열
  g("보험과현대생활", "사회계열", 3),
  g("결혼학개론", "사회계열", 3),
  g("자기이해와진로탐색", "사회계열", 2),
  g("직업과취업", "사회계열", 2),
  g("소비자보호와법", "사회계열", 3),
  g("광고의이해", "사회계열", 3),
  g("조직과리더쉽", "사회계열", 3),
  g("생활과세무", "사회계열", 3),
  g("영화를통한법의이해", "사회계열", 3),
  g("문화콘텐츠와창의성", "사회계열", 3),
  g("협상의기술", "사회계열", 3),
  g("현대사회의이해", "사회계열", 3),
  g("전공탐색", "사회계열", 2),
  g("창업과경영", "사회계열", 2),
  g("대학생을위한실용금융", "사회계열", 3),
  g("직무이해와취업역량개발", "사회계열", 2),
  g("지속가능경제,사회,경영", "사회계열", 3),
  g("통계와코딩", "사회계열", 3),
  g("데이터시각화와스토리텔링", "사회계열", 3),
  g("홍익서비스러닝", "사회계열", 1),
  g("민법의이해(2)", "사회계열", 3),
  g("갈등관리와해결", "사회계열", 3),
  g("기술혁신과사회과학", "사회계열", 3),
  g("권력과정의", "사회계열", 3),
  g("현대인의영양과건강", "사회계열", 3),
  g("데이터분석의이해", "사회계열", 3),
  g("창업과진로탐색", "사회계열", 3),
  g("산업·데이터공학의이해", "사회계열", 3),
  g("창업과실용법률(LEGAL THINKING)", "사회계열", 3),
  // 일반교양 — 자연계열
  g("자연과환경", "자연계열", 3),
  g("공간과심리", "자연계열", 3),
  g("천문학의이해", "자연계열", 3),
  g("빅데이터의이해", "자연계열", 3),
  g("체험인공지능", "자연계열", 3),
  g("엔지니어링기초", "자연계열", 3),
  g("인터페이스디자인입문", "자연계열", 3),
  g("미래사회와소재", "자연계열", 3),
  g("슬기로운창업생활", "자연계열", 3),
  g("스타트업과창업전략", "자연계열", 3),
  g("전기전자공학개론", "자연계열", 3),
  g("컴퓨팅사고(COMP. THINKING)", "자연계열", 3),
  g("대학물리(1)", "자연계열", 3),
  g("대학물리(2)", "자연계열", 3),
  g("대학물리실험(2)", "자연계열", 1),
  g("대학화학(1)", "자연계열", 3),
  g("대학화학(2)", "자연계열", 3),
  g("대학화학실험(2)", "자연계열", 1),
  g("현대물리", "자연계열", 3),
  g("광학", "자연계열", 3),
  g("생물학(1)", "자연계열", 3),
  g("생물학(2)", "자연계열", 3),
  g("대학수학(1)", "자연계열", 3),
  g("대학수학(2)", "자연계열", 3),
  g("응용수학(1)", "자연계열", 3),
  g("응용수학(2)", "자연계열", 3),
  g("선형대수학", "자연계열", 3),
  g("이산수학", "자연계열", 3),
  g("통계학", "자연계열", 3),
  g("공학컴퓨터입문및실습", "자연계열", 3),
  g("공학CAD및GRAPHICS", "자연계열", 3),
  g("객체지향프로그래밍", "자연계열", 3),
  g("웹프로그래밍", "자연계열", 3),
  g("수치해석", "자연계열", 3),
  g("MATLAB프로그래밍및실습", "자연계열", 3),
  g("R프로그래밍", "자연계열", 3),
  g("C-프로그래밍", "자연계열", 3),
  g("자율주행과공간심리", "자연계열", 3),
  // 일반교양 — 예체능계열
  g("여가생활과레크레이션", "예체능계열", 2),
  g("현대음악의이해", "예체능계열", 3),
  g("예술과종교", "예체능계열", 3),
  g("고전음악의이해", "예체능계열", 3),
  g("미술마케팅", "예체능계열", 3),
  g("농구", "예체능계열", 2),
  g("디자인과법", "예체능계열", 3),
  g("예술과미디어", "예체능계열", 3),
  g("프리핸드드로잉과스케칭(미술계)", "예체능계열", 3),
  g("프리핸드드로잉과스케칭", "예체능계열", 3),
  g("패션조형의이해", "예체능계열", 3),
  g("영화의이해", "예체능계열", 3),
  g("공연예술의이해", "예체능계열", 3),
  g("유럽의미술과문화", "예체능계열", 3),
  g("미학의이해", "예체능계열", 3),
  g("사운드와컴퓨터음악", "예체능계열", 3),
  g("예술과인간", "예체능계열", 3),
  g("패션과테크놀로지", "예체능계열", 3),
  g("미래세상의모빌리티", "예체능계열", 3),
  g("디자인과뉴노멀", "예체능계열", 3),
  g("현대건축:디자인전략과이론", "예체능계열", 3),
  g("동아시아시각문화의이해", "예체능계열", 3),
  g("유럽미국미술명작의이해", "예체능계열", 3),
  g("디자인과문화", "예체능계열", 3),
  g("XR과공간디자인", "예체능계열", 3),
  g("몸의이해와영상미학", "예체능계열", 3),
  g("여자농구", "예체능계열", 2),
  g("AI디자인프로젝트", "예체능계열", 3),
  g("퓨처모빌리티디자인의이해", "예체능계열", 3),
  g("글로컬디자인창업(2)", "예체능계열", 2),
  g("라이프스타일브랜드창업(2)", "예체능계열", 2),
  g("창업기반DEX디자인(2)", "예체능계열", 3),
  g("디자인창업실전", "예체능계열", 2),
  g("실전상업사진창업(2)", "예체능계열", 3),
  g("CLO 3D패션디자인및창직과정(2)", "예체능계열", 2),
  g("글로벌패션전문가실무및창직과정(2)", "예체능계열", 2),
  g("디자인씽킹(DESIGN THINKING)", "예체능계열", 3),
  g("디자인과인간심리", "예체능계열", 3),
  g("한국미술사", "예체능계열", 3),
  g("안전및조직관리사례연구", "예체능계열", 2),
  g("조직리더십사례연구", "예체능계열", 2),
  // 일반교양 — 영어계열
  g("영상영어", "영어계열", 2),
  g("시사영어", "영어계열", 2),
  g("실용영문법", "영어계열", 2),
  g("영어회화", "영어계열", 2),
  g("실용영어", "영어계열", 2),
  g("고급실용영어", "영어계열", 2),
  g("영어토론", "영어계열", 2),
  // 일반교양 — 제2외국어계열
  g("중국어중급회화(1)", "제2외국어계열", 2),
  g("초급일본어(3)", "제2외국어계열", 2),
  g("초급일본어강독", "제2외국어계열", 2),
  g("중급중국어(2)", "제2외국어계열", 2),
  g("중급일본어(1)", "제2외국어계열", 2),
  g("중급일본어강독", "제2외국어계열", 2),
  g("초급중국어(3)", "제2외국어계열", 2),
  g("중급중국어(1)", "제2외국어계열", 2),
  g("초급일본어회화연습", "제2외국어계열", 2),
  g("중국어기초회화(1)", "제2외국어계열", 2),
  g("중국어기초회화(2)", "제2외국어계열", 2),
  g("중급일본어회화연습", "제2외국어계열", 2),
  g("중국어로 배우는 한국문화와예술", "제2외국어계열", 2),
  g("중급일본어한자", "제2외국어계열", 2),
  g("고급일본어회화연습", "제2외국어계열", 2),
  g("영상일본어", "제2외국어계열", 2),
  g("초급이태리어", "제2외국어계열", 2),
  g("일본어작문", "제2외국어계열", 2),
  g("해외어학연수(2)", "제2외국어계열", 2),
];

// 사이버로도 개설되는 과목: (사이버) 버전을 자동 추가.
// 일반강좌로 들으면 사이버 24학점 한도에 포함되지 않도록, 사이버/일반을 따로 담을 수 있게 함.
const CYBER_NAMES = new Set([
  "화학과문명", "생물학탐구", "언어의이해", "인간관계론", "매스컴과현대사회", "인간심리의이해",
  "독일의문화와예술", "이미지와상상력", "결혼학개론", "소비자보호와법", "협상의기술",
  "창업과실용법률", "창업과실용법률(LEGAL THINKING)", "체험인공지능",
  "컴퓨팅사고", "컴퓨팅사고(COMP. THINKING)", "공연예술의이해", "유럽의미술과문화",
  "미학의이해", "패션과테크놀로지", "미래세상의모빌리티", "디자인씽킹", "디자인씽킹(DESIGN THINKING)",
]);
for (const c of [...CATALOG]) {
  if (!c.cyber && CYBER_NAMES.has(c.name)) {
    CATALOG.push({ ...c, name: c.name + " (사이버)", cyber: true });
  }
}

const saved = readSaved();
let courses = Array.isArray(saved.courses) ? saved.courses.filter(isValidCourse) : [];
let gradReq = GRAD_OPTIONS.includes(saved.gradReq) ? saved.gradReq : null;
let form = { semester: "1-1", credits: "3", area: "전공필수", name: "" };
let pickCat = "전공필수", pickSub = null;

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
  const CHECK = `<svg class="go-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>`;
  const opts = g.options
    .map((o) => `
      <button class="grad-opt ${gradReq === o ? "active" : ""}" data-grad="${escapeAttr(o)}" role="radio" aria-checked="${gradReq === o}">
        <span class="go-mark">${gradReq === o ? CHECK : ""}</span>
        <span class="go-body"><span class="go-name">${escapeHtml(o)}</span><span class="go-hint">${escapeHtml(g.hints[o])}</span></span>
      </button>`)
    .join("");
  return `
    <section class="group">
      <div class="group-head">
        <div><h2>${escapeHtml(g.title)}</h2><p class="group-note">${escapeHtml(g.note)}</p></div>
        <span class="group-sum ${done ? "ok" : ""}">${done ? "충족" : "미선택"}</span>
      </div>
      <div class="grad-opts" role="radiogroup">${opts}</div>
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
    </div>
    <div class="cy-track" title="${used} / ${CYBER_LIMIT}"><div class="cy-fill" style="width:${pct}%"></div></div>
    <span class="cy-note">${over ? `⚠ 최대 ${CYBER_LIMIT}학점 초과` : `최대 ${CYBER_LIMIT}학점`}</span>`;
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

function cyberTag(cyber) { return cyber ? ` <span class="cyber-tag">(사이버)</span>` : ""; }
function escapeAttr(s) { return String(s).replace(/"/g, "&quot;"); }
function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// ===== 과목 추가 패널 =====
function initForm() {
  const semSel = document.getElementById("fSemester");
  semSel.innerHTML = SEMS.map((s) => `<option value="${s}">${semLabel(s)}</option>`).join("");
  syncFormToUI();

  semSel.addEventListener("change", (e) => (form.semester = e.target.value));
  document.getElementById("fCredits").addEventListener("change", (e) => (form.credits = e.target.value));

  document.getElementById("pkCats").addEventListener("click", onCatClick);
  document.getElementById("pkSubs").addEventListener("click", onSubClick);
  document.getElementById("pkCourses").addEventListener("click", onCourseClick);

  document.getElementById("addToggle").addEventListener("click", togglePanel);
  document.getElementById("apClose").addEventListener("click", closePanel);
  document.getElementById("apCancel").addEventListener("click", closePanel);
  document.getElementById("apReset").addEventListener("click", resetForm);
  document.getElementById("addBtn").addEventListener("click", addCourse);
  document.addEventListener("mousedown", (e) => { if (!e.target.closest(".add-wrap")) closePanel(); });

  refreshPicker();
}

function syncFormToUI() {
  document.getElementById("fSemester").value = form.semester;
  document.getElementById("fCredits").value = form.credits;
}

function catCount(cat) { return CATALOG.filter((c) => c.cat === cat).length; }
function subCount(cat, sub) { return CATALOG.filter((c) => c.cat === cat && c.sub === sub).length; }
// 현재 선택 위치의 과목 목록 (좌 카테고리 + (드릴다운이면) 하위)
function paneList() {
  return CATALOG.filter((c) => c.cat === pickCat && (!isDrill(pickCat) || c.sub === pickSub));
}
// 담을 요건 영역 (일반교양은 자유선택으로 집계)
function destArea() {
  if (pickCat === "일반교양") return "자유선택";
  return isDrill(pickCat) ? pickSub : pickCat;
}

function onCatClick(e) {
  const b = e.target.closest(".pk-cat"); if (!b) return;
  pickCat = b.dataset.cat;
  pickSub = isDrill(pickCat) ? DRILL_SUBS[pickCat][0] : null;
  form.name = "";
  refreshPicker(); updateSel();
}
function onSubClick(e) {
  const b = e.target.closest(".pk-cat"); if (!b) return;
  pickSub = b.dataset.sub;
  form.name = "";
  refreshPicker(); updateSel();
}
function onCourseClick(e) {
  const b = e.target.closest(".pk-course"); if (!b) return;
  pickCourse(b.dataset.name);
}

function refreshPicker() {
  const drill = isDrill(pickCat);
  document.getElementById("picker2").dataset.cols = drill ? "3" : "2";
  document.getElementById("pkSubs").hidden = !drill;
  renderCats(); renderSubs(); renderCourses();
}

function renderCats() {
  document.getElementById("pkCats").innerHTML = CAT_ORDER
    .map((c) => `<button class="pk-cat ${c === pickCat ? "active" : ""}" data-cat="${escapeAttr(c)}">${escapeHtml(c)}<span>${catCount(c)}</span></button>`)
    .join("");
}
function renderSubs() {
  const subs = DRILL_SUBS[pickCat];
  if (!subs) return;
  document.getElementById("pkSubs").innerHTML = subs
    .map((a) => `<button class="pk-cat ${a === pickSub ? "active" : ""}" data-sub="${escapeAttr(a)}">${escapeHtml(a)}<span>${subCount(pickCat, a)}</span></button>`)
    .join("");
}
function renderCourses() {
  const rows = paneList()
    .map((c) => {
      const meta = [`${c.credits}학점`, c.semester || "학기무관"].join(" · ");
      return `<button class="pk-course ${form.name === c.name ? "active" : ""}" data-name="${escapeAttr(c.name)}">
          <span class="pc-name">${escapeHtml(c.name)}</span>
          <span class="pc-meta">${escapeHtml(meta)}</span>
        </button>`;
    })
    .join("");
  const manual = `
    <div class="pk-manual">
      <input id="manualName" placeholder="✎ 직접 입력 (목록에 없는 과목)" value="${escapeAttr(isManual() ? form.name : "")}" autocomplete="off" />
    </div>`;
  document.getElementById("pkCourses").innerHTML = rows + manual;
  const mi = document.getElementById("manualName");
  mi.addEventListener("input", (e) => {
    form.name = e.target.value;
    form.area = destArea();
    [...document.querySelectorAll(".pk-course.active")].forEach((x) => x.classList.remove("active"));
    updateSel();
  });
}
function isManual() {
  return form.name && !paneList().some((c) => c.name === form.name);
}

function pickCourse(name) {
  const hit = paneList().find((c) => c.name === name) || CATALOG.find((c) => c.name === name);
  form.name = name;
  if (hit) {
    form.area = hit.area;
    form.credits = String(hit.credits);
    document.getElementById("fCredits").value = form.credits;
    if (hit.semester) { form.semester = hit.semester; document.getElementById("fSemester").value = hit.semester; }
  }
  renderCourses();
  updateSel();
}

function updateSel() {
  const el = document.getElementById("selName");
  if (!el) return;
  if (form.name) {
    el.textContent = `${form.name}  ·  ${form.area}`;
    el.classList.add("has");
  } else {
    el.textContent = "먼저 과목을 선택하세요";
    el.classList.remove("has");
  }
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
  form = { semester: "1-1", credits: "3", area: "전공필수", name: "" };
  syncFormToUI();
  pickCat = "전공필수"; pickSub = null;
  refreshPicker(); updateSel();
  setApStatus("");
}
function setApStatus(text) { const el = document.getElementById("apStatus"); if (el) el.textContent = text; }

function addCourse() {
  const name = (form.name || "").trim();
  if (!name) { setApStatus("과목을 선택하거나 직접 입력하세요"); return; }
  const cat = CATALOG.find((c) => c.name === name && c.area === form.area);
  courses.push({
    id: "c" + Date.now() + Math.random().toString(36).slice(2, 6),
    name, area: form.area, credits: Number(form.credits) || 0, semester: form.semester,
    cyber: cat ? !!cat.cyber : false,
  });
  form.name = "";
  persist(); renderAll(); renderCourses(); updateSel();
  setApStatus(`추가됨 · ${name}`);
}

// --- 클릭: 삭제 / 기타졸업요건 ---
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
