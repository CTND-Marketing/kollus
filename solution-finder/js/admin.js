// ═══════════════════════════════════════════════════════════
//  솔루션 파인더 Admin — 전용 JS
// ═══════════════════════════════════════════════════════════

// ── 상수 ─────────────────────────────────────────────────
var CFG_KEY='sf_admin_cfg', DATA_KEY='sf_admin_data', CHANGED_KEY='sf_changed';

// 인라인 초기 데이터 (data.js 기준)
var INLINE_INDUSTRIES = [
  {id:"edu",   label:"온라인 교육",             col:"blue"},
  {id:"corp",  label:"기업 · 공공 교육",         col:"green"},
  {id:"bcast", label:"기업 방송 · 커뮤니케이션",  col:"amber"},
  {id:"comm",  label:"비디오 커머스",             col:"pink"},
  {id:"live",  label:"라이브 스트리밍",           col:"teal"},
  {id:"ott",   label:"OTT 서비스",               col:"purple"},
  {id:"event", label:"공연 · 행사",              col:"coral"},
];
var INLINE_UC = [
  /* ── 온라인 교육 (edu) ── */
  {id:"uc01",ind:"edu",mode:"both",name:"입시·어학 이러닝 스트리밍 서비스",
   sitVod:[{cat:"보안",txt:"콘텐츠 불법 유출 / 녹화 방지가 필요해요"},{cat:"데이터/개발",txt:"강사 정산을 위한 정확한 진도율 데이터가 필요해요"},{cat:"플레이어",txt:"AI 자막으로 운영 리소스를 줄이고 싶어요"}],
   sitLive:[{cat:"스트리밍",txt:"수험 시즌 대규모 동시 접속이 걱정돼요"},{cat:"보안",txt:"라이브 강의 / 웨비나 중 콘텐츠 유출을 방지해야 해요"}],
   sitBoth:[],
   features:{"보안":["콘텐츠 암호화 (DRM)","녹화 차단","기기 대수 제한","계정 공유 차단","동시 시청 제한","워터마킹"],"스트리밍":["대규모 트래픽 / CDN","VOD / 다시보기"],"플레이어":["배속 재생 / 이어보기","모바일 최적화"],"데이터/개발":["진도율 정밀 데이터","통계 / 리포트"]},
   product:"Kollus DRM / Multi DRM",
   situation:"스타 강사 IP 보호 최우선. 불법 녹화·계정 공유로 매출 손실. 수능·방학 시즌 수만 명 동시 접속. OTT 수준 플레이어 경험 요구.",
   position:"스타 강사의 IP를 지키고 수능 당일 수만 명이 몰려도 끊기지 않는 안정성, AI 자막으로 운영 비용까지 절감",
   customers:"메가스터디교육, 이투스에듀, 제우스교육, 단꿈아이, 하이테커, 린치핀에듀, 마스터프랩(글로벌), 강남인강, 경선식에듀, 야나두, 하위잉글리시, 아이비김영, 시사아카데미, YBMnet"},
  {id:"uc02",ind:"edu",mode:"vod",name:"학원 온오프라인 통합 스트리밍 서비스",
   sitVod:[{cat:"스트리밍",txt:"오프라인 수업을 빠르게 VOD로 제공해야 해요"},{cat:"보안",txt:"콘텐츠 불법 유출 / 녹화 방지가 필요해요"},{cat:"데이터/개발",txt:"강사 정산을 위한 정확한 진도율 데이터가 필요해요"}],
   sitLive:[],sitBoth:[],
   features:{"보안":["콘텐츠 암호화 (DRM)","녹화 차단","기기 대수 제한"],"스트리밍":["VOD / 다시보기","대규모 트래픽 / CDN"],"플레이어":["배속 재생 / 이어보기","모바일 최적화"],"데이터/개발":["진도율 정밀 데이터"]},
   product:"Kollus DRM",
   situation:"오프라인 수업 직후 결석생·복습 영상 즉시 제공 필요. 수동 공유로는 외부 유출 통제 불가. 운영 인력 개입 최소화.",
   position:"수업 직후 업로드 → 자동 인코딩 → 학원 앱 즉시 게시. 보안 유지하면서 운영 인력 개입 제로",
   customers:"시대인재, 대교(러닝센터), 메가스터디 러셀, 이투스에듀, 디쉐어, 한국경찰학원, 와우고시, 그레이프씨드 코리아"},
  {id:"uc03",ind:"edu",mode:"vod",name:"도서 연계 동영상 제공 서비스",
   sitVod:[{cat:"스트리밍",txt:"도서 부록 영상을 안전하게 배포하고 싶어요"},{cat:"스트리밍",txt:"학기 초 / 시험 기간 트래픽 급증이 걱정돼요"},{cat:"플레이어",txt:"다국어 또는 오디오 모드 학습이 필요해요"}],
   sitLive:[],sitBoth:[],
   features:{"보안":["콘텐츠 암호화 (DRM)","녹화 차단"],"스트리밍":["링크 기반 스트리밍","VOD / 다시보기","대규모 트래픽 / CDN"],"플레이어":["다국어 자막","오디오 모드"],"데이터/개발":[]},
   product:"Kollus DRM",
   situation:"도서 부록 영상 불법 유출 빈번. 학기 초·시험기간 트래픽 급증. 오디오 단독 스트리밍·다국어 자막 복합 요구.",
   position:"교재 구매자 전용 콘텐츠를 클릭 한 번에 안전하게. 오디오 모드·다국어 자막으로 학습 효율까지",
   customers:"키출판사, 개념원리, 아이지니(HLS)"},
  {id:"uc04",ind:"edu",mode:"both",name:"진로진학 커뮤니케이션 서비스",
   sitVod:[],
   sitLive:[{cat:"플레이어",txt:"실시간 라이브 강의 + 채팅 Q&A가 필요해요"},{cat:"스트리밍",txt:"수험 시즌 대규모 동시 접속이 걱정돼요"},{cat:"보안",txt:"라이브 강의 / 웨비나 중 콘텐츠 유출을 방지해야 해요"}],
   sitBoth:[{cat:"스트리밍",txt:"라이브 종료 후 VOD 다시보기를 바로 제공해야 해요"}],
   features:{"보안":["콘텐츠 암호화 (DRM)","녹화 차단"],"스트리밍":["저지연 라이브 (LIVE)","ABR 자동 화질 전환","대규모 트래픽 / CDN","VOD / 다시보기"],"플레이어":["라이브 채팅 / Q&A","모바일 최적화"],"데이터/개발":["통계 / 리포트","전담 헬프데스크"]},
   product:"Kollus DRM / 미디어인증",
   situation:"학교 방송실에서 전국 고교생 대상 실시간 진로 강의. 1시간 강의 + 30분 Q&A 구조. 실시간 채팅 양방향 소통 필수.",
   position:"전국 어디서나 접속해도 끊기지 않는 라이브 강의. 실시간 Q&A로 현장감 있는 진로 교육",
   customers:"강동구청(진로진학), 유니브"},
  {id:"uc05",ind:"edu",mode:"vod",name:"사이버대학교·평생교육원 이러닝 서비스",
   sitVod:[{cat:"플레이어",txt:"시청각 장애 학습자도 동등하게 수강할 수 있어야 해요"},{cat:"데이터/개발",txt:"강사 정산을 위한 정확한 진도율 데이터가 필요해요"},{cat:"보안",txt:"링크 기반으로 외부 시스템에 영상을 제공해야 해요"}],
   sitLive:[],sitBoth:[],
   features:{"보안":["콘텐츠 암호화 (DRM)"],"스트리밍":["링크 기반 스트리밍","VOD / 다시보기"],"플레이어":["장애인 학습자용 웹접근성 플레이어","스크린 리더 연동","AI 자동 자막","다국어 자막","360VR 플레이어"],"데이터/개발":["진도율 정밀 데이터"]},
   product:"Kollus DRM + Help Desk",
   situation:"강의 100% VOD. 장애인 학생 수천 명 웹접근성 법적 요구. 컨소시엄 대학 영상 제공. 콜센터 CS 50명+.",
   position:"장애인 포함 모든 학습자가 동등하게 수강. 웹접근성 품질인증 마크 획득 지원",
   customers:"한국열린사이버대학교, 남서울대학교 원격평생교육원, 인천인재평생교육진흥원"},
  {id:"uc06",ind:"edu",mode:"vod",name:"공무원·전문직 이러닝 스트리밍 서비스",
   sitVod:[{cat:"보안",txt:"콘텐츠 불법 유출 / 녹화 방지가 필요해요"},{cat:"데이터/개발",txt:"강사 정산을 위한 정확한 진도율 데이터가 필요해요"},{cat:"스트리밍",txt:"학기 초 / 시험 기간 트래픽 급증이 걱정돼요"}],
   sitLive:[],sitBoth:[],
   features:{"보안":["콘텐츠 암호화 (DRM)","워터마킹","동시 시청 제한"],"스트리밍":["대규모 트래픽 / CDN","VOD / 다시보기"],"플레이어":["배속 재생 / 이어보기","모바일 최적화"],"데이터/개발":["진도율 정밀 데이터","통계 / 리포트"]},
   product:"Kollus DRM",
   situation:"고가 수험 강의 콘텐츠 보안 최우선. 시험 시즌 대규모 동시 접속. 강사 정산을 위한 정교한 진도율 데이터 필요.",
   position:"합격을 향한 고가 강의, 보안은 기본 — 대규모 수험 트래픽에도 끊기지 않는 안정성",
   customers:"메가엠디/랜드, ST Unitas, 경찰단기, 한솔아카데미, 지스쿨, 올배움, 모아소방전문학원, 프라임에듀넷, 시대교육, 지안에듀, 링커리어"},
  {id:"uc07",ind:"edu",mode:"both",name:"직무 관련 이러닝 스트리밍 서비스 (국내)",
   sitVod:[{cat:"보안",txt:"콘텐츠 불법 유출 / 녹화 방지가 필요해요"},{cat:"데이터/개발",txt:"강사 정산을 위한 정확한 진도율 데이터가 필요해요"}],
   sitLive:[{cat:"보안",txt:"라이브 강의 / 웨비나 중 콘텐츠 유출을 방지해야 해요"}],
   sitBoth:[{cat:"데이터/개발",txt:"기존 LMS / 인트라넷과 API로 연동해야 해요"}],
   features:{"보안":["콘텐츠 암호화 (DRM)","녹화 차단","패턴 차단"],"스트리밍":["VOD / 다시보기","링크 기반 스트리밍"],"플레이어":["배속 재생 / 이어보기","멀티디바이스 지원"],"데이터/개발":["진도율 정밀 데이터","통계 / 리포트","API / LMS 연동"]},
   product:"Kollus DRM",
   situation:"강사 IP 보호 최우선. 강사별 수익 배분 정산을 위한 정교한 진도율 필요. API 기반 자동 업로드·트랜스코딩 워크플로우.",
   position:"강사의 저작권을 DRM으로 보호하고, 수익 배분 정산의 근거가 되는 초 단위 진도율 데이터 제공",
   customers:"탈잉, 디쉐어, 링커리어, 아이지엠세계경영연구원, 윌비스, YBMNet, 렛유인, 데이원컴퍼니, 데이원컴퍼니(비보안), ECK교육, 덴탈빈, 메디스트림, 데니어, 메디칼타임즈"},
  {id:"uc08",ind:"edu",mode:"vod",name:"직무 관련 이러닝 스트리밍 서비스 (글로벌)",
   sitVod:[{cat:"스트리밍",txt:"글로벌 수강생에게 서비스를 제공해야 해요"},{cat:"플레이어",txt:"AI 자막으로 운영 리소스를 줄이고 싶어요"}],
   sitLive:[],sitBoth:[],
   features:{"보안":["콘텐츠 암호화 (DRM)"],"스트리밍":["글로벌 CDN","ABR 자동 화질 전환","VOD / 다시보기"],"플레이어":["HTML5 표준 플레이어","다국어 자막"],"데이터/개발":["통계 / 리포트","채널 / 계정 관리","복수 담당자 로그인"]},
   product:"Multi DRM + 글로벌 CDN",
   situation:"국내 B2C → B2B → 글로벌 B2C 성장. 글로벌 CDN·다국어 자막이 핵심. 광고 삽입 기능 검토 중.",
   position:"국내에서 글로벌로 확장할 때 화질·자막·보안 모두 국제 표준으로",
   customers:"데이원컴퍼니(콜로소), 웅진컴퍼스"},
  {id:"uc09",ind:"edu",mode:"vod",name:"투자·재테크·헬스케어 스트리밍 서비스",
   sitVod:[{cat:"보안",txt:"콘텐츠 불법 유출 / 녹화 방지가 필요해요"},{cat:"보안",txt:"멀티 디바이스 사용과 계정 공유를 차단하고 싶어요"}],
   sitLive:[],sitBoth:[],
   features:{"보안":["콘텐츠 암호화 (DRM)","녹화 차단","기기 대수 제한","계정 공유 차단","동시 시청 제한","워터마킹"],"스트리밍":["VOD / 다시보기","대규모 트래픽 / CDN"],"플레이어":["모바일 최적화"],"데이터/개발":[]},
   product:"Kollus DRM",
   situation:"고가 투자 강의 불법 유출 시 매출 직접 타격. 아이디 공유 빈번. 투자 이슈 시 접속 폭주. 멀티디바이스 화면 캡처 차단 필수.",
   position:"재테크 강의의 핵심 자산을 DRM + 캡처 차단으로 완벽 보호. 계정 공유 원천 차단으로 매출 누수 방지",
   customers:"월급쟁이부자들, 3ProTV, KB증권방송, 로프트아일랜드, 용감한컴퍼니"},

  /* ── 기업 / 공공 교육 (corp) ── */
  {id:"uc11",ind:"corp",mode:"both",name:"기업 내부 교육 (HRD)",
   sitVod:[{cat:"보안",txt:"사내 교육 영상에 기밀 정보가 포함되어 보안이 중요해요"},{cat:"플레이어",txt:"AI 자막으로 운영 리소스를 줄이고 싶어요"}],
   sitLive:[],
   sitBoth:[{cat:"데이터/개발",txt:"기존 LMS / 인트라넷과 API로 연동해야 해요"}],
   features:{"보안":["콘텐츠 암호화 (DRM)","녹화 차단","내부망 접근 제한"],"스트리밍":["VOD / 다시보기","링크 기반 스트리밍","대규모 트래픽 / CDN"],"플레이어":["HTML5 표준 플레이어"],"데이터/개발":["진도율 정밀 데이터","API / LMS 연동","CMS API 연동"]},
   product:"미디어인증(재생URL) + API",
   situation:"사내 교육 영상에 기밀·신제품 정보 포함. 외부 유출 시 막대한 손실. 기존 보안 솔루션과 플레이어 충돌 방지.",
   position:"기업 기밀을 지키는 DRM. 기존 LMS와 충돌 없는 매끄러운 연동",
   customers:"삼성전자판매, CJ올리브영, KOICA, 한국컴패션"},
  {id:"uc12",ind:"corp",mode:"vod",name:"프랜차이즈·가맹점주 교육",
   sitVod:[{cat:"데이터/개발",txt:"가맹점주가 모바일로 간편하게 교육받게 하고 싶어요"},{cat:"기타",txt:"링크 하나로 교육 영상을 간편하게 공유하고 싶어요"}],
   sitLive:[],
   sitBoth:[{cat:"데이터/개발",txt:"기존 LMS / 인트라넷과 API로 연동해야 해요"}],
   features:{"보안":[],"스트리밍":["링크 기반 스트리밍","VOD / 다시보기"],"플레이어":["모바일 최적화"],"데이터/개발":["진도율 정밀 데이터","API / LMS 연동"]},
   product:"Kollus API + 미디어링크 콜백",
   situation:"매장에서 매뉴얼·레시피를 시청할 PC 환경 부재. 가맹점주 포털 로그인 후 모바일로 간편 학습.",
   position:"본사 포털 API 연동으로 가맹점주가 스마트폰 하나로 모든 교육 자료를 학습",
   customers:"F&B·유통 프랜차이즈 본사(노랑푸드, 투썸), 한솔교육(강사역량)"},
  {id:"uc13",ind:"corp",mode:"both",name:"전문 협회·단체 보수 교육",
   sitVod:[{cat:"데이터/개발",txt:"협회 회원 보수 교육을 비용 효율적으로 운영해야 해요"},{cat:"데이터/개발",txt:"CS 전담 인력 없이 안정적으로 운영할 수 있어야 해요"},{cat:"플레이어",txt:"AI 자막으로 운영 리소스를 줄이고 싶어요"}],
   sitLive:[{cat:"스트리밍",txt:"별도 IT 인력 없이 라이브 방송을 안정적으로 운영해야 해요"}],
   sitBoth:[],
   features:{"보안":["원타임 URL"],"스트리밍":["VOD / 다시보기","저지연 라이브 (LIVE)","링크 기반 스트리밍"],"플레이어":["HTML5 표준 플레이어","장애인 학습자용 웹접근성 플레이어"],"데이터/개발":[]},
   product:"Multi DRM or Not (종량제)",
   situation:"CS 전담 인력 없어 안정성·Help Desk 최우선. 회비 운영 조직 특성상 종량제 과금 선호.",
   position:"IT 담당자 없이도 안정적으로 운영. 시청 데이터만큼만 과금하는 합리적 구조",
   customers:"대한법무사협회, 한국세무사회, 개인정보보호협회, 미국골프지도자연맹, 한국식품산업협회, 건설산업교육원, 한국베터리산업협회"},

  /* ── 기업 방송 / 커뮤니케이션 (bcast) ── */
  {id:"uc10",ind:"bcast",mode:"both",name:"법정·안전 의무 교육",
   sitVod:[{cat:"데이터/개발",txt:"법정 의무 교육 진도율을 법적 증빙으로 활용해야 해요"},{cat:"플레이어",txt:"AI 자막으로 운영 리소스를 줄이고 싶어요"}],
   sitLive:[{cat:"스트리밍",txt:"분기말·연말 대규모 동시 접속에도 끊김 없이 서비스되어야 해요"}],sitBoth:[],
   features:{"보안":["콘텐츠 암호화 (DRM)"],"스트리밍":["대규모 트래픽 / CDN","VOD / 다시보기"],"플레이어":[],"데이터/개발":["진도율 정밀 데이터"]},
   product:"Kollus DRM (VOD)",
   situation:"분기말·연말 전 직원 동시 접속. 버퍼링 시 담당자 업무 마비. 진도율 오류 → 과태료 리스크.",
   position:"진도율 1%도 틀리지 않는 정확한 데이터. 연말 전 직원 동시 접속에도 흔들리지 않는 인프라",
   customers:"현대자동차, 한국가스안전공사, 한국해양수산연수원, 국민연금공단, 노사발전재단, 대한체육회, 모트라스, 사학진흥재단, 건설산업교육원"},
  {id:"uc14",ind:"bcast",mode:"both",name:"타운홀 등 기업 커뮤니케이션",
   sitVod:[],
   sitLive:[{cat:"플레이어",txt:"전 직원 타운홀 방송을 안정적으로 송출해야 해요"},{cat:"플레이어",txt:"오프라인 행사와 온라인 스트리밍을 함께 운영해야 해요"},{cat:"보안",txt:"내부 임직원에게만 라이브 접근을 제한해야 해요"}],
   sitBoth:[{cat:"데이터/개발",txt:"방송 후 VOD 아카이브를 내부망에서만 볼 수 있어야 해요"},{cat:"플레이어",txt:"AI 자막으로 운영 리소스를 줄이고 싶어요"}],
   features:{"보안":["콘텐츠 암호화 (DRM)","내부망 접근 제한"],"스트리밍":["저지연 라이브 (LIVE)","대규모 트래픽 / CDN","VOD / 다시보기"],"플레이어":["라이브 채팅 / Q&A","퀴즈 / 설문"],"데이터/개발":[]},
   product:"미디어인증(재생URL)",
   situation:"평소 수백 명 → 타운홀 당일 수천 명 급증. 오프라인 송출 파트너사와 턴키 제안 구조.",
   position:"타운홀 당일 수천 명이 몰려도 끊기지 않는 안정성. 내부망 제한으로 외부 유출 원천 차단",
   customers:"아모레퍼시픽, KTCS, 삼성전자판매"},
  {id:"uc15",ind:"bcast",mode:"live",name:"주주총회 · 민감 정보 공유",
   sitVod:[],
   sitLive:[{cat:"보안",txt:"주주총회 / 민감 정보를 인가된 대상에게만 공유해야 해요"},{cat:"스트리밍",txt:"저지연 라이브로 오프라인과 실시간 동기화가 필요해요"},{cat:"플레이어",txt:"글로벌 시청자에게 다국어 자막과 함께 송출해야 해요"},{cat:"보안",txt:"라이브 중 비인가자 접근 및 녹화를 차단해야 해요"}],
   sitBoth:[],
   features:{"보안":["콘텐츠 암호화 (DRM)","사번 / 회원 인증","내부망 접근 제한","녹화 차단"],"스트리밍":["저지연 라이브 (LIVE)","대규모 트래픽 / CDN"],"플레이어":["다국어 자막","라이브 채팅 / Q&A","퀴즈 / 설문"],"데이터/개발":[]},
   product:"Kollus DRM / Multi DRM",
   situation:"전자주총 의무화로 수요 급증. 수십~수백 개 방송 동시 생성 필요. 저지연 라이브 + 비인가자 차단.",
   position:"주총 시즌 수백 개 방송 동시 송출. 저지연으로 오프라인과 실시간 동기화",
   customers:"LG에너지솔루션, 메먼트"},
  {id:"uc16",ind:"bcast",mode:"vod",name:"기업·공공 홍보 영상 서비스",
   sitVod:[{cat:"스트리밍",txt:"홍보 영상을 설치·로그인 없이 즉시 재생되게 하고 싶어요"},{cat:"플레이어",txt:"공공기관 구형 브라우저에서도 재생되어야 해요"},{cat:"데이터/개발",txt:"영상의 구간별 시청 현황과 지역 데이터를 분석하고 싶어요"}],
   sitLive:[],sitBoth:[],
   features:{"보안":[],"스트리밍":["링크 기반 스트리밍","VOD / 다시보기"],"플레이어":["HTML5 표준 플레이어","장애인 학습자용 웹접근성 플레이어","모바일 최적화"],"데이터/개발":["시청 통계 / 지역 분석"]},
   product:"Kollus 동영상 호스팅",
   situation:"홍보 목적 → 로그인·설치 없이 클릭 즉시 재생 필수. 구형 관공서 브라우저 호환 필요.",
   position:"설치도 로그인도 없이 클릭 한 번에 재생. 구형 브라우저에서도 동일한 화질 보장",
   customers:"현대카드, 기획재정부, 안양시청, 의정부시청, 한국여성인권진흥원, 신세계아이앤씨(POS)"},

  /* ── 비디오 커머스 (comm) ── */
  {id:"uc17",ind:"comm",mode:"live",name:"라이브 커머스 서비스",
   sitVod:[],
   sitLive:[{cat:"스트리밍",txt:"끊김 없는 실시간 라이브커머스 방송이 필요해요"},{cat:"플레이어",txt:"SMB 고객이 핸드폰으로 간편하게 방송을 시작하게 해야 해요"},{cat:"데이터/개발",txt:"대기업 D2C 자사몰에 라이브를 API로 연동해야 해요"}],
   sitBoth:[],
   features:{"보안":[],"스트리밍":["저지연 라이브 (LIVE)","대규모 트래픽 / CDN"],"플레이어":["라이브 채팅 / Q&A","모바일 최적화"],"데이터/개발":["API / LMS 연동"]},
   product:"Kollus Live Commerce",
   situation:"SMB는 핸드폰 방송 즉시 시작 선호. 대기업은 D2C 자사몰 API 연동 턴키 필요.",
   position:"핸드폰으로 즉시 시작하는 SMB 라이브부터 대기업 D2C 자사몰 완전 연동까지",
   customers:"노랑풍선"},
  {id:"uc18",ind:"comm",mode:"vod",name:"상품 영상 / 후기 서비스",
   sitVod:[{cat:"플레이어",txt:"고화질 상품 영상으로 구매 전환율을 높이고 싶어요"},{cat:"스트리밍",txt:"빠른 인코딩과 안정적인 영상 호스팅이 필요해요"},{cat:"플레이어",txt:"짧은 영상을 웹페이지에 넣고 싶어요"}],
   sitLive:[],sitBoth:[],
   features:{"보안":[],"스트리밍":["링크 기반 스트리밍","VOD / 다시보기","ABR 자동 화질 전환"],"플레이어":["웹페이지 삽입","모바일 최적화"],"데이터/개발":[]},
   product:"찰나(Charlla)",
   productAlt:"Kollus Live Commerce",
   charllaSits:["짧은 영상을 웹페이지에 넣고 싶어요"],
   charllaFeats:["웹페이지 삽입"],
   situation:"상품 상세페이지 영상 품질이 구매 전환율에 직결. 빠른 인코딩·안정적 호스팅으로 운영 리소스 절감. 짧은 영상 웹페이지 삽입 수요 증가.",
   position:"상품 영상 하나가 구매 전환율을 가른다. 짧은 영상부터 고화질 상품 영상까지, 찰나(Charlla)로 운영 부담 제로",
   customers:"신성통상, 아난티"},

  /* ── 라이브 스트리밍 (live) ── */
  {id:"uc19",ind:"live",mode:"both",name:"방송 채널 웹 서비스 (24/7)",
   sitVod:[{cat:"스트리밍",txt:"방송 콘텐츠를 VOD로 아카이브해 다시 볼 수 있어야 해요"}],
   sitLive:[{cat:"스트리밍",txt:"24시간 방송 채널을 끊김 없이 운영해야 해요"},{cat:"스트리밍",txt:"글로벌 시청자에게 안정적으로 송출해야 해요"},{cat:"보안",txt:"라이브 스트림 URL을 외부에서 무단 사용하지 못하게 해야 해요"},{cat:"스트리밍",txt:"TV · 웹 · 모바일 앱 멀티채널을 동시에 운영해야 해요"}],
   sitBoth:[],
   features:{"보안":["원타임 URL","재생 URL 암호화"],"스트리밍":["글로벌 CDN","저지연 라이브 (LIVE)","24/7 안정 운영","ABR 자동 화질 전환"],"플레이어":[],"데이터/개발":[]},
   product:"Multi DRM + 글로벌 CDN",
   situation:"글로벌 시청자 대상 24시간 라이브. '항상 끊기지 않는 방송'이 최우선. 웹·모바일·스마트TV 멀티채널.",
   position:"24시간, 전 세계 어디서나 — 단 한 번의 끊김도 허용하지 않는 라이브 인프라",
   customers:"아리랑TV, 바둑TV"},
  {id:"uc20",ind:"live",mode:"both",name:"온라인 홈쇼핑 서비스",
   sitVod:[],
   sitLive:[{cat:"스트리밍",txt:"동시 접속자 수만 명을 처리해야 해요"},{cat:"스트리밍",txt:"TV · 웹 · 모바일 앱 멀티채널을 동시에 운영해야 해요"}],
   sitBoth:[],
   features:{"보안":[],"스트리밍":["대규모 트래픽 / CDN","저지연 라이브 (LIVE)","ABR 자동 화질 전환"],"플레이어":["HTML5 표준 플레이어","라이브 채팅 / Q&A","모바일 최적화"],"데이터/개발":["통계 / 리포트","구매 페이지 연동"]},
   product:"미디어인증(재생URL)",
   situation:"TV·PC웹·모바일앱 채널 동시 운영. 효자상품 방송 시 동시 접속자 1만~7만 명 급증. 비설치형 HTML5 플레이어 선호.",
   position:"동시 접속 7만 명에도 흔들리지 않는 CDN. TV에서 모바일까지 동일한 시청 경험",
   customers:"공영홈쇼핑, 우리홈쇼핑"},

  /* ── OTT (ott) ── */
  {id:"uc21",ind:"ott",mode:"vod",name:"영화·드라마 구독형 OTT 서비스",
   sitVod:[{cat:"플레이어",txt:"다양한 디바이스에서 고화질 스트리밍을 제공해야 해요"},{cat:"데이터/개발",txt:"OTT 서비스를 빠르게 론칭하고 싶어요"},{cat:"보안",txt:"멀티 디바이스 사용과 계정 공유를 차단하고 싶어요"}],
   sitLive:[],sitBoth:[],
   features:{"보안":["콘텐츠 암호화 (DRM)","원타임 URL","동시 시청 제한"],"스트리밍":["ABR 자동 화질 전환","글로벌 CDN","VOD / 다시보기"],"플레이어":["HTML5 표준 플레이어","플레이어 커스텀 (브랜드 컬러)","배속 재생 / 이어보기"],"데이터/개발":[]},
   product:"Multi DRM + ABR 스트리밍",
   situation:"멀티 비트레이트 자동 변환·ABR 스트리밍. 브랜드 컬러 플레이어 커스텀. 요금제별 동시 재생 기기 수 제어.",
   position:"원본 업로드 하나로 멀티 비트레이트 변환, 브랜드 플레이어, Multi DRM까지 — OTT 론칭 기술 장벽 제거",
   customers:"아시아N(moa-play), 미디어엘리트(채널W)"},
  {id:"uc22",ind:"ott",mode:"vod",name:"UGC / 리뷰 스트리밍 서비스",
   sitVod:[{cat:"스트리밍",txt:"사용자 업로드 영상을 자동으로 인코딩·배포해야 해요"},{cat:"스트리밍",txt:"대용량 영상을 빠르게 처리하고 안정적으로 스트리밍해야 해요"}],
   sitLive:[],sitBoth:[],
   features:{"보안":[],"스트리밍":["대규모 트래픽 / CDN","링크 기반 스트리밍","VOD / 다시보기"],"플레이어":[],"데이터/개발":["API / LMS 연동"]},
   product:"Kollus API + 트랜스코딩",
   situation:"대량 사용자 업로드 영상을 API로 자동 수집·트랜스코딩·배포. 안정적 스트리밍과 API 유연성이 핵심.",
   position:"대량 UGC를 API 하나로 자동 수집·인코딩·배포. 운영 인력 개입 없는 자동화 파이프라인",
   customers:"스마일게이트홀딩스"},
  {id:"uc23",ind:"ott",mode:"vod",name:"콘텐츠 배급 / 심사 서비스 (글로벌)",
   sitVod:[{cat:"보안",txt:"글로벌 배급 / 콘텐츠 심사 환경이 필요해요"}],
   sitLive:[],sitBoth:[],
   features:{"보안":["사번 / 회원 인증"],"스트리밍":["글로벌 CDN","ABR 자동 화질 전환","VOD / 다시보기"],"플레이어":["HTML5 표준 플레이어","장애인 학습자용 웹접근성 플레이어"],"데이터/개발":[]},
   product:"글로벌 CDN + 웹 표준 플레이어",
   situation:"전 세계 감독·심사위원 분산. 대용량 영상 글로벌 업로드·시청 필요. 국가별 네트워크 차이 문제.",
   position:"전 세계 어디서나 설치 없이 웹 브라우저로 즉시 고화질 심사 가능",
   customers:"부산국제영화제"},
  {id:"uc24a",ind:"ott",mode:"vod",name:"성인 콘텐츠 (AV) 스트리밍 서비스",
   sitVod:[{cat:"보안",txt:"콘텐츠 불법 유출 / 녹화 방지가 필요해요"},{cat:"보안",txt:"멀티 디바이스 사용과 계정 공유를 차단하고 싶어요"},{cat:"스트리밍",txt:"글로벌 수강생에게 서비스를 제공해야 해요"}],
   sitLive:[],sitBoth:[],
   features:{"보안":["콘텐츠 암호화 (DRM)","녹화 차단","기기 대수 제한","계정 공유 차단","동시 시청 제한","워터마킹"],"스트리밍":["글로벌 CDN","VOD / 다시보기","ABR 자동 화질 전환"],"플레이어":[],"데이터/개발":[]},
   product:"Kollus DRM / Multi DRM",
   situation:"AV 배우·콘텐츠 라이선스 계약 기반으로 저작권 보호가 최우선. 개발 전담 인력 없이 안정적 배포와 운영 컨설팅 필요. 글로벌 스트리밍 인프라 필수.",
   position:"DRM + 워터마킹 + 녹화 차단으로 배우·콘텐츠 저작권을 철저히 보호. 글로벌 CDN으로 국내외 어디서나 안정적 스트리밍",
   customers:"카브엔터테인먼트, 문화스테이, 리디파인미디어, MIB, 씨투비스, PlayboyTV"},

  /* ── 공연 / 행사 (event) ── */
  {id:"uc24",ind:"event",mode:"both",name:"공연 중계형 서비스 (유료)",
   sitVod:[{cat:"보안",txt:"불법 캡처 / 녹화를 원천 차단해야 해요"},{cat:"플레이어",txt:"유료 콘텐츠에 다국어 자막이 필요해요"}],
   sitLive:[{cat:"스트리밍",txt:"공연 / 콘서트를 유료로 온라인 실시간 중계하고 싶어요"},{cat:"보안",txt:"유료 라이브 중 불법 녹화 / 캡처를 차단해야 해요"}],
   sitBoth:[{cat:"스트리밍",txt:"라이브 종료 후 VOD 다시보기를 바로 제공해야 해요"}],
   features:{"보안":["콘텐츠 암호화 (DRM)","원타임 URL","녹화 차단","사번 / 회원 인증"],"스트리밍":["저지연 라이브 (LIVE)","VOD / 다시보기"],"플레이어":["다국어 자막"],"데이터/개발":[]},
   product:"Multi DRM + 원타임 URL",
   situation:"오프라인 공연 온라인 유료 수익화. VOD 중심·편성 라이브 혼합. 유료 콘텐츠 불법 유출에 매우 민감.",
   position:"유료 관람객의 화면 캡처를 원천 차단. 오프라인 공연의 가치를 온라인으로 완전히 확장",
   customers:"티켓링크, 국립극단"},
  {id:"uc25",ind:"event",mode:"both",name:"MICE / 학술대회 온라인 중계",
   sitVod:[],
   sitLive:[{cat:"스트리밍",txt:"학술대회 / 컨퍼런스를 온라인으로 실시간 진행해야 해요"},{cat:"보안",txt:"등록 참가자에게만 라이브 시청 접근을 제한해야 해요"}],
   sitBoth:[{cat:"스트리밍",txt:"라이브 종료 후 VOD 다시보기를 바로 제공해야 해요"}],
   features:{"보안":["사번 / 회원 인증"],"스트리밍":["저지연 라이브 (LIVE)","VOD / 다시보기"],"플레이어":["HTML5 표준 플레이어","장애인 학습자용 웹접근성 플레이어","라이브 채팅 / Q&A","퀴즈 / 설문"],"데이터/개발":[]},
   product:"Kollus LIVE + VOD",
   situation:"설치 없는 웹 기반 접속 선호. 행사 당일 라이브 + 즉시 VOD 다시보기. 실시간 Q&A 채팅 연동.",
   position:"설치 없이 링크 클릭으로 즉시 입장. 라이브 채팅 Q&A로 오프라인 현장과 온라인이 하나로",
   customers:"학회, 이벤트 기획사"},
  {id:"uc26",ind:"event",mode:"both",name:"종교 예배 / 행사 정기 중계",
   sitVod:[],
   sitLive:[{cat:"스트리밍",txt:"종교 예배 / 행사를 정기적으로 실시간 중계해야 해요"},{cat:"스트리밍",txt:"주말에도 운영 지원을 받을 수 있어야 해요"},{cat:"스트리밍",txt:"글로벌 교인에게 안정적으로 송출해야 해요"},{cat:"보안",txt:"라이브 스트림 URL을 외부에서 무단 사용하지 못하게 해야 해요"}],
   sitBoth:[{cat:"스트리밍",txt:"라이브 종료 후 VOD 다시보기를 바로 제공해야 해요"}],
   features:{"보안":["재생 URL 암호화"],"스트리밍":["저지연 라이브 (LIVE)","VOD / 다시보기","글로벌 CDN","24/7 안정 운영"],"플레이어":[],"데이터/개발":[]},
   product:"Kollus LIVE + VOD (미디어인증)",
   situation:"코로나19 이후 온라인 예배 일반화. 글로벌 교인 CDN 필요. 특정 시간 집중 트래픽. 주말 운영 지원 필수.",
   position:"주말 예배도 끊김 없이. 글로벌 교인까지 커버하는 CDN, 주말 운영 지원 체계",
   customers:"scj교회, 공생(단월드)"},
];
var DEFAULT_TEXTS = {
  "heroTitle": "우리 비즈니스에 꼭 맞는<br><em>동영상 솔루션</em>,<br>지금 찾아보세요",
  "heroDesc": "산업·운영 방식·상황을 선택하면,<br><b>콜러스를 도입한 기업들의 유스케이스와 솔루션</b>을 바로 확인할 수 있습니다.",
  "step1Title": "어떤 산업에서 서비스를 운영하고 계신가요?",
  "step1Sub": "산업을 선택하면 해당 분야에 맞는 상황이 <b>자동으로 필터링</b>됩니다.",
  "step2Title": "현재 어떤 상황이나 니즈가 있으신가요?",
  "step2Sub": "운영 방식 탭을 먼저 선택하고, 상황을 골라주세요. <b>복수 선택 가능</b>합니다.",
  "step3Title": "선택하신 조건에 맞는 솔루션입니다",
  "step3Sub": "카드를 클릭하면 자세한 내용과 주요 기능을 확인할 수 있습니다.",
  "inqTitle": "관심 있는 솔루션을 발견하셨나요?<br>견적과 도입 상담을 신청해 보세요."
};

var TEXT_FIELDS = [
  {key:'heroTitle',  label:'히어로 타이틀',    step:'Hero',   cls:'pv-h1'},
  {key:'heroDesc',   label:'히어로 설명',       step:'Hero',   cls:'pv-desc'},
  {key:'step1Title', label:'Step 1 타이틀',     step:'Step 1', cls:'pv-title'},
  {key:'step1Sub',   label:'Step 1 서브타이틀', step:'Step 1', cls:'pv-sub'},
  {key:'step2Title', label:'Step 2 타이틀',     step:'Step 2', cls:'pv-title'},
  {key:'step2Sub',   label:'Step 2 서브타이틀', step:'Step 2', cls:'pv-sub'},
  {key:'step3Title', label:'Step 3 타이틀',     step:'Step 3', cls:'pv-title'},
  {key:'step3Sub',   label:'Step 3 서브타이틀', step:'Step 3', cls:'pv-sub'},
  {key:'inqTitle',   label:'문의 섹션 타이틀',  step:'문의',   cls:'pv-inq'}
];

// ── 설정 ─────────────────────────────────────────────────
function loadCfg(){
  var d={token:'',repo:'CTND-Marketing/kollus',path:'kollus/solution-finder/js/data.js',branch:'main',adminId:'admin',adminPw:'admin1234'};
  try{return Object.assign(d,JSON.parse(localStorage.getItem(CFG_KEY)||'{}'));}catch(e){return d;}
}
function saveCfg(c){localStorage.setItem(CFG_KEY,JSON.stringify(c));}

// ── 작업 데이터 ───────────────────────────────────────────
var WD={industries:null,uc:null,texts:null};

function initWD(){
  var saved=null;
  try{saved=JSON.parse(localStorage.getItem(DATA_KEY)||'null');}catch(e){}
  if(saved){
    WD.industries=saved.industries;
    WD.uc=saved.uc;
    WD.texts=saved.texts;
  }else{
    WD.industries=JSON.parse(JSON.stringify(INLINE_INDUSTRIES));
    WD.uc=JSON.parse(JSON.stringify(INLINE_UC));
    WD.texts=Object.assign({},DEFAULT_TEXTS);
  }
}

function persistWD(){
  localStorage.setItem(DATA_KEY,JSON.stringify({industries:WD.industries,uc:WD.uc,texts:WD.texts}));
  localStorage.setItem(CHANGED_KEY,'1');
  document.getElementById('deploy-banner').style.display='flex';
}

// ── 로그인 ────────────────────────────────────────────────
function doLogin(){
  var cfg=loadCfg();
  var id=document.getElementById('login-id').value.trim();
  var pw=document.getElementById('login-pw').value;
  if(id===cfg.adminId&&pw===cfg.adminPw){
    localStorage.setItem('sf_logged_in',id);
    showApp(id);
  }else{
    document.getElementById('login-error').style.display='block';
  }
}

function showApp(id){
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='flex';
  document.getElementById('header-user').textContent=id;
  initWD();
  loadSettingsForm();
  renderTexts();
  renderIndTable();
  renderUcFilter();
  renderUcTable();
  if(localStorage.getItem(CHANGED_KEY)){
    document.getElementById('deploy-banner').style.display='flex';
  }
}

function doLogout(){
  localStorage.removeItem('sf_logged_in');
  document.getElementById('login-screen').style.display='flex';
  document.getElementById('app').style.display='none';
}

// ── 탭 ───────────────────────────────────────────────────
var TABS=['text','industry','uc','deploy','settings'];
function showTab(name){
  TABS.forEach(function(t){
    document.getElementById('pane-'+t).style.display=t===name?'block':'none';
    document.getElementById('tab-'+t).classList.toggle('active',t===name);
  });
}

// ── 텍스트 탭 (Quill) ────────────────────────────────────
var quillEditors={};

function renderTexts(){
  var steps={};
  TEXT_FIELDS.forEach(function(f){
    if(!steps[f.step])steps[f.step]=[];
    steps[f.step].push(f);
  });
  var html='';
  Object.keys(steps).forEach(function(step){
    html+='<div class="card" style="margin-bottom:20px">';
    html+='<div class="card-hd"><span class="card-hd-title">'+step+'</span></div>';
    html+='<div class="card-body">';
    steps[step].forEach(function(f){
      html+='<div style="margin-bottom:28px">';
      html+='<div class="text-card-label" style="margin-bottom:8px">'+f.label+'</div>';
      html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start">';
      html+='<div><div style="font-size:11px;color:#94A3B8;margin-bottom:4px">✏️ 편집</div>';
      html+='<div id="quill-'+f.key+'"></div></div>';
      html+='<div><div style="font-size:11px;color:#94A3B8;margin-bottom:4px">👁 실제 화면 미리보기</div>';
      html+='<div class="pv-box"><div class="'+(f.cls||'pv-sub')+'" id="pv-'+f.key+'"></div></div></div>';
      html+='</div></div>';
    });
    html+='</div></div>';
  });
  document.getElementById('text-panes').innerHTML=html;

  quillEditors={};
  var toolbar=[['bold','italic','underline'],[{'color':[]},{'background':[]}],[{'size':['small',false,'large','huge']}],['link','clean']];
  TEXT_FIELDS.forEach(function(f){
    if(!document.getElementById('quill-'+f.key))return;
    var q=new Quill('#quill-'+f.key,{theme:'snow',modules:{toolbar:toolbar},placeholder:'내용을 입력하세요...'});
    q.root.innerHTML=WD.texts[f.key]||'';
    function updatePv(){
      var pv=document.getElementById('pv-'+f.key);
      if(!pv)return;
      var c=q.root.innerHTML;
      pv.innerHTML=(!c||c==='<p><br></p>')?'<span class="pv-empty">내용을 입력하면 표시됩니다</span>':c;
    }
    updatePv();
    q.on('text-change',updatePv);
    quillEditors[f.key]=q;
  });
}

function saveTexts(){
  TEXT_FIELDS.forEach(function(f){
    var q=quillEditors[f.key];
    if(q){
      var h=q.root.innerHTML;
      WD.texts[f.key]=(h==='<p><br></p>')?'':h;
    }
  });
  persistWD();
  toast('텍스트 저장 완료','success');
}

// ── 산업 탭 ──────────────────────────────────────────────
var COLORS={blue:'#2563EB',green:'#16A34A',amber:'#D97706',pink:'#DB2777',teal:'#0D9488',purple:'#7C3AED',coral:'#EA580C'};

function renderIndTable(){
  var tb=document.getElementById('ind-tbody');
  tb.innerHTML=WD.industries.map(function(ind,i){
    var cnt=WD.uc.filter(function(u){return u.ind===ind.id;}).length;
    var col=COLORS[ind.col]||'#888';
    return '<tr>'+
      '<td><button class="btn btn-ghost btn-sm" onclick="moveInd('+i+',-1)" '+(i===0?'disabled':'')+'>↑</button> '+
      '<button class="btn btn-ghost btn-sm" onclick="moveInd('+i+',1)" '+(i===WD.industries.length-1?'disabled':'')+'>↓</button></td>'+
      '<td><code style="font-size:12px;background:#F3F4F6;padding:2px 6px;border-radius:4px">'+ind.id+'</code></td>'+
      '<td>'+ind.label+'</td>'+
      '<td><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:'+col+';vertical-align:middle;margin-right:6px"></span>'+ind.col+'</td>'+
      '<td>'+cnt+'개</td>'+
      '<td><button class="btn btn-ghost btn-sm" onclick="editInd('+i+')">수정</button> '+
      '<button class="btn btn-danger btn-sm" onclick="deleteInd('+i+')">삭제</button></td>'+
    '</tr>';
  }).join('');
}

function moveInd(i,dir){
  var j=i+dir;
  if(j<0||j>=WD.industries.length)return;
  var tmp=WD.industries[i];WD.industries[i]=WD.industries[j];WD.industries[j]=tmp;
  persistWD();renderIndTable();
}

var editingIndIdx=-1;
function openIndModal(idx){
  editingIndIdx=idx!==undefined?idx:-1;
  document.getElementById('modal-ind-title').textContent=editingIndIdx>=0?'산업 수정':'산업 추가';
  if(editingIndIdx>=0){
    var ind=WD.industries[editingIndIdx];
    document.getElementById('ind-id').value=ind.id;
    document.getElementById('ind-id').disabled=true;
    document.getElementById('ind-label').value=ind.label;
    document.getElementById('ind-col').value=ind.col;
  }else{
    document.getElementById('ind-id').value='';
    document.getElementById('ind-id').disabled=false;
    document.getElementById('ind-label').value='';
    document.getElementById('ind-col').value='blue';
  }
  openModal('modal-ind');
}
function editInd(i){openIndModal(i);}

function saveInd(){
  var id=document.getElementById('ind-id').value.trim();
  var label=document.getElementById('ind-label').value.trim();
  var col=document.getElementById('ind-col').value;
  if(!id||!label){toast('ID와 산업명을 입력하세요','error');return;}
  if(editingIndIdx<0&&WD.industries.find(function(x){return x.id===id;})){toast('이미 존재하는 ID입니다','error');return;}
  if(editingIndIdx>=0){WD.industries[editingIndIdx]=Object.assign({},WD.industries[editingIndIdx],{label:label,col:col});}
  else{WD.industries.push({id:id,label:label,col:col});}
  persistWD();renderIndTable();renderUcFilter();closeModal('modal-ind');
  toast(editingIndIdx<0?'산업 추가 완료':'산업 수정 완료','success');
}

function deleteInd(i){
  if(!confirm('삭제하시겠습니까?'))return;
  WD.industries.splice(i,1);persistWD();renderIndTable();
  toast('삭제 완료');
}

// ── 유스케이스 탭 ─────────────────────────────────────────
function renderUcFilter(){
  var sel=document.getElementById('uc-filter');
  var cur=sel.value;
  sel.innerHTML='<option value="">전체 산업</option>'+
    WD.industries.map(function(ind){
      return '<option value="'+ind.id+'"'+(cur===ind.id?' selected':'')+'>'+ind.label+'</option>';
    }).join('');
}

function renderUcTable(){
  var filter=document.getElementById('uc-filter').value;
  var list=filter?WD.uc.filter(function(u){return u.ind===filter;}):WD.uc;
  document.getElementById('uc-tbody').innerHTML=list.map(function(uc){
    var idx=WD.uc.indexOf(uc);
    var ind=WD.industries.find(function(x){return x.id===uc.ind;});
    var badge=uc.mode==='vod'?'<span class="badge badge-vod">VOD</span>':uc.mode==='live'?'<span class="badge badge-live">LIVE</span>':'<span class="badge badge-both">VOD+LIVE</span>';
    return '<tr>'+
      '<td><code style="font-size:11px;color:#9CA3AF">'+uc.id+'</code></td>'+
      '<td style="font-size:12px">'+(ind?ind.label:uc.ind)+'</td>'+
      '<td>'+badge+'</td>'+
      '<td style="font-weight:500;max-width:240px">'+uc.name+'</td>'+
      '<td style="font-size:12px;color:#4B5563">'+((uc.product||'').substring(0,30))+'</td>'+
      '<td><button class="btn btn-ghost btn-sm" onclick="editUc('+idx+')">수정</button> '+
      '<button class="btn btn-danger btn-sm" onclick="deleteUc('+idx+')">삭제</button></td>'+
    '</tr>';
  }).join('');
}

var editingUcIdx=-1;
function openUcModal(idx){
  editingUcIdx=idx!==undefined?idx:-1;
  document.getElementById('modal-uc-title').textContent=editingUcIdx>=0?'유스케이스 수정':'유스케이스 추가';
  var sel=document.getElementById('uc-ind');
  sel.innerHTML=WD.industries.map(function(ind){return '<option value="'+ind.id+'">'+ind.label+'</option>';}).join('');
  if(editingUcIdx>=0){
    var uc=WD.uc[editingUcIdx];
    sel.value=uc.ind;
    document.getElementById('uc-mode').value=uc.mode;
    document.getElementById('uc-name').value=uc.name||'';
    document.getElementById('uc-product').value=uc.product||'';
    document.getElementById('uc-situation').value=uc.situation||'';
    document.getElementById('uc-position').value=uc.position||'';
    document.getElementById('uc-customers').value=uc.customers||'';
  }else{
    sel.selectedIndex=0;
    document.getElementById('uc-mode').value='vod';
    ['uc-name','uc-product','uc-situation','uc-position','uc-customers'].forEach(function(id){document.getElementById(id).value='';});
  }
  openModal('modal-uc');
}
function editUc(i){openUcModal(i);}

function saveUc(){
  var name=document.getElementById('uc-name').value.trim();
  if(!name){toast('유스케이스명을 입력하세요','error');return;}
  var base=editingUcIdx>=0?WD.uc[editingUcIdx]:{id:'uc'+String(Date.now()).slice(-4),sitVod:[],sitLive:[],sitBoth:[],features:{"보안":[],"스트리밍":[],"플레이어":[],"데이터/개발":[]}};
  var obj=Object.assign({},base,{
    ind:document.getElementById('uc-ind').value,
    mode:document.getElementById('uc-mode').value,
    name:name,
    product:document.getElementById('uc-product').value.trim(),
    situation:document.getElementById('uc-situation').value.trim(),
    position:document.getElementById('uc-position').value.trim(),
    customers:document.getElementById('uc-customers').value.trim()
  });
  if(editingUcIdx>=0)WD.uc[editingUcIdx]=obj;
  else WD.uc.push(obj);
  persistWD();renderUcTable();closeModal('modal-uc');
  toast(editingUcIdx<0?'유스케이스 추가 완료':'유스케이스 수정 완료','success');
}

function deleteUc(i){
  if(!confirm('"'+WD.uc[i].name+'"을(를) 삭제하시겠습니까?'))return;
  WD.uc.splice(i,1);persistWD();renderUcTable();
  toast('삭제 완료');
}

// ── 배포 ─────────────────────────────────────────────────
function buildDataJs(){
  return '// ── Admin 자동생성 — 직접 수정하지 마세요 ──\n'+
    'var SF_TEXTS = '+JSON.stringify(WD.texts,null,2)+';\n\n'+
    'const INDUSTRIES='+JSON.stringify(WD.industries,null,2)+';\n\n'+
    'const UC='+JSON.stringify(WD.uc,null,2)+';\n';
}

async function doDeploy(){
  var cfg=loadCfg();
  if(!cfg.token){toast('GitHub Token을 설정 탭에서 입력해 주세요','error');return;}
  var btn=document.getElementById('deploy-btn');
  var log=document.getElementById('deploy-log');
  btn.disabled=true;btn.textContent='⏳ 배포 중...';
  log.style.display='block';log.textContent='';
  function addLog(m){log.textContent+=m+'\n';}
  var apiUrl='https://api.github.com/repos/'+cfg.repo+'/contents/'+cfg.path;
  var headers={'Authorization':'token '+cfg.token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  addLog('▶ '+cfg.repo+' / '+cfg.path);
  try{
    addLog('\n1. SHA 조회...');
    var r=await fetch(apiUrl+'?ref='+cfg.branch+'&_='+Date.now(),{headers:headers,cache:'no-store'});
    var sha='';
    if(r.status===200){var d=await r.json();sha=d.sha;addLog('   SHA: '+sha.slice(0,8)+'... ✅');}
    else if(r.status===404){addLog('   신규 파일 ✅');}
    else{addLog('   ❌ 실패('+r.status+')');toast('SHA 조회 실패','error');return;}
    addLog('\n2. data.js 생성...');
    var content=buildDataJs();
    addLog('   '+content.length+' bytes ✅');
    addLog('\n3. 커밋...');
    var body={message:'[Admin] 솔루션 파인더 업데이트 ('+new Date().toLocaleString('ko')+')',content:btoa(unescape(encodeURIComponent(content))),branch:cfg.branch};
    if(sha)body.sha=sha;
    var pr=await fetch(apiUrl,{method:'PUT',headers:Object.assign({'Content-Type':'application/json'},headers),body:JSON.stringify(body),cache:'no-store'});
    var pj=await pr.json();
    if(pr.status===200||pr.status===201){
      addLog('\n✅ 배포 완료! (1~2분 후 반영)');
      localStorage.removeItem(CHANGED_KEY);
      document.getElementById('deploy-banner').style.display='none';
      toast('배포 완료!','success');
    }else{
      addLog('\n❌ 실패('+pr.status+'): '+pj.message);
      toast('배포 실패: '+pj.message,'error');
    }
  }catch(e){addLog('\n❌ 오류: '+e.message);toast('오류 발생','error');}
  finally{btn.disabled=false;btn.textContent='🚀 GitHub에 배포';}
}

// ── 설정 ─────────────────────────────────────────────────
function loadSettingsForm(){
  var cfg=loadCfg();
  document.getElementById('cfg-token').value=cfg.token||'';
  document.getElementById('cfg-repo').value=cfg.repo||'';
  document.getElementById('cfg-path').value=cfg.path||'';
  document.getElementById('cfg-branch').value=cfg.branch||'';
  document.getElementById('cfg-admin-id').value=cfg.adminId||'';
  document.getElementById('cfg-admin-pw').value='';
}

function saveSettings(){
  var cfg=loadCfg();
  cfg.token=document.getElementById('cfg-token').value.trim();
  cfg.repo=document.getElementById('cfg-repo').value.trim();
  cfg.path=document.getElementById('cfg-path').value.trim();
  cfg.branch=document.getElementById('cfg-branch').value.trim();
  var newId=document.getElementById('cfg-admin-id').value.trim();
  var newPw=document.getElementById('cfg-admin-pw').value;
  if(newId)cfg.adminId=newId;
  if(newPw)cfg.adminPw=newPw;
  saveCfg(cfg);
  toast('설정 저장 완료','success');
}

async function testGithub(){
  var cfg=loadCfg();
  var st=document.getElementById('github-status');
  st.textContent='테스트 중...';st.style.color='#9CA3AF';
  try{
    var r=await fetch('https://api.github.com/repos/'+cfg.repo,{headers:{'Authorization':'token '+cfg.token}});
    if(r.ok){st.textContent='✅ 연결 성공';st.style.color='#16A34A';}
    else{st.textContent='❌ 실패('+r.status+')';st.style.color='#DC2626';}
  }catch(e){st.textContent='❌ 네트워크 오류';st.style.color='#DC2626';}
}

// ── 모달 유틸 ────────────────────────────────────────────
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-overlay').forEach(function(el){
  el.addEventListener('click',function(e){if(e.target===el)el.classList.remove('open');});
});

// ── 토스트 ───────────────────────────────────────────────
function toast(msg,type){
  var el=document.getElementById('toast');
  el.textContent=msg;
  el.className='toast show'+(type?' '+type:'');
  setTimeout(function(){el.classList.remove('show');},2500);
}

// ── 자동 로그인 ──────────────────────────────────────────
(function(){
  var id=localStorage.getItem('sf_logged_in');
  if(id)showApp(id);
})();

// ── 엔터키 로그인 ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('login-id').addEventListener('keydown',function(e){if(e.key==='Enter')doLogin();});
  document.getElementById('login-pw').addEventListener('keydown',function(e){if(e.key==='Enter')doLogin();});
});
