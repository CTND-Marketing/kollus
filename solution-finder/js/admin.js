/* =========================================================
   KOLLUS 솔루션 파인더 — Admin 전용 스크립트
   index 의 app.js / data.js 와 절대 섞이지 않는 독립 파일입니다.
   - data.js(TEXTS/INDUSTRIES/UC/IND_ICONS)를 읽어 편집
   - 실제 index 자산을 합성한 라이브 미리보기
   - '저장' → '배포'(GitHub 커밋) → index 반영
   ========================================================= */
(function(){
'use strict';

/* ----------------------------------------------------------
   0. 상수 / 기본값
---------------------------------------------------------- */
var CATS = ['보안','스트리밍','플레이어','데이터/개발','기타'];
var CAT_COLORS = {'보안':'#EF4444','스트리밍':'#3B82F6','플레이어':'#8B5CF6','데이터/개발':'#059669','기타':'#94A3B8'};
var FEAT_CATS = ['보안','스트리밍','플레이어','데이터/개발'];
var COLORS = [
  {v:'blue',t:'파란색'},{v:'green',t:'초록색'},{v:'amber',t:'황색'},{v:'pink',t:'분홍색'},
  {v:'teal',t:'청록색'},{v:'purple',t:'보라색'},{v:'coral',t:'코랄'}
];
var ICON_SUGGEST = ['🎓','🏢','📡','🛒','🔴','🎬','🎭','📚','🎥','💼','🏫','🏛️','⛪','🏥','🎮','📺','🎤','🌐','🔒','📊','⚡','💡','🚀','🎯','🛠️','📱'];

var DEFAULT_TEXTS = {
  hero:{
    badge:'KOLLUS · Solution Finder',
    h1:'우리 비즈니스에 꼭 맞는<br><em>동영상 솔루션</em>,<br>지금 찾아보세요',
    desc:'산업·운영 방식·상황을 선택하면,<br><b>콜러스를 도입한 기업들의 유스케이스와 솔루션</b>을 바로 확인할 수 있습니다.',
    chips:['🎬 VOD 서비스','📡 라이브 스트리밍','⚡ VOD + LIVE','🔒 DRM 보안','🌐 글로벌 CDN','📊 진도율 데이터'],
    progress:['산업 선택','상황 / 니즈','솔루션 확인']
  },
  step1:{ tag:'Step 1', title:'어떤 산업에서 서비스를 운영하고 계신가요?', sub:'산업을 선택하면 해당 분야에 맞는 상황이 <b>자동으로 필터링</b>됩니다.' },
  step2:{
    tag:'Step 2', title:'현재 어떤 상황이나 니즈가 있으신가요?', sub:'운영 방식 탭을 먼저 선택하고, 상황을 골라주세요. <b>복수 선택 가능</b>합니다.',
    tabs:{
      vod:{lb:'VOD', sl:'녹화·다시보기 영상'},
      live:{lb:'LIVE', sl:'실시간 방송·스트리밍'},
      both:{lb:'VOD + LIVE', sl:'두 방식을 함께 운영'}
    },
    desc:{
      vod:'미리 촬영·편집된 영상을 원하는 시간에 반복 시청하는 서비스입니다. 이러닝, 강의 다시보기, 도서 부록 영상, OTT 등이 해당합니다.',
      live:'실시간으로 방송하고 시청자가 동시에 접속하는 서비스입니다. 라이브 강의, 타운홀, 공연 중계, 라이브커머스 등이 해당합니다.',
      both:'라이브 방송과 VOD 다시보기를 함께 운영하거나, 라이브 종료 후 자동으로 VOD로 전환이 필요한 경우입니다.'
    }
  },
  step3:{ tag:'Step 3', title:'선택하신 조건에 맞는 솔루션입니다', sub:'카드를 클릭하면 자세한 내용과 주요 기능을 확인할 수 있습니다.', headline:'담당자님을 위한 동영상 솔루션 매칭 결과가 나왔어요!' },
  inquiry:{ title:'관심 있는 솔루션을 발견하셨나요?<br>견적과 도입 상담을 신청해 보세요.', sub:'선택하신 조건이 자동으로 정리됩니다. 아래 내용을 복사해서 <b>문의 내용</b>란에 붙여넣어 주세요.' },
  footer:{ txt:'국내 No.1 동영상 플랫폼 콜러스' }
};

var DEFAULT_SETTINGS = {
  token:'', repo:'ctnd-marketing/kollus', path:'solution-finder/js/data.js', branch:'main',
  adminId:'admin', adminHash: hash32('kollus1234')
};

var LS = { settings:'sf_admin_settings', draft:'sf_admin_draft' };
var SS = { auth:'sf_admin_auth' };

/* ----------------------------------------------------------
   1. 유틸
---------------------------------------------------------- */
function $(id){ return document.getElementById(id); }
function el(sel,root){ return (root||document).querySelector(sel); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
function hash32(str){ var h=5381,i=str.length; while(i) h=(h*33)^str.charCodeAt(--i); return (h>>>0).toString(16); }

function getSettings(){
  var raw=localStorage.getItem(LS.settings);
  var s = raw ? JSON.parse(raw) : {};
  return Object.assign({}, DEFAULT_SETTINGS, s);
}

var toastTimer=null;
function toast(msg, type){
  var t=$('toast'); if(!t) return;
  t.textContent=msg; t.className='toast on'+(type?(' '+type):'');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){ t.className='toast'; },2600);
}

/* ----------------------------------------------------------
   2. 상태 / 모델
---------------------------------------------------------- */
var model = { texts:null, industries:null, icons:null, uc:null };
var dirty = false;
var curTab = 'text';
var editInd = null;     // 산업 편집 임시 객체
var editIndOrig = null; // 편집 중인 원본 id (null = 신규)
var editUc = null;
var editUcOrig = null;

function loadModel(){
  var draft = localStorage.getItem(LS.draft);
  if(draft){
    try{ model = JSON.parse(draft); normalizeModel(); return; }catch(e){}
  }
  // data.js 원본에서 시드
  model.texts      = (typeof TEXTS!=='undefined' && TEXTS) ? clone(TEXTS) : clone(DEFAULT_TEXTS);
  model.industries = (typeof INDUSTRIES!=='undefined') ? clone(INDUSTRIES) : [];
  model.icons      = (typeof IND_ICONS!=='undefined') ? clone(IND_ICONS) : {};
  model.uc         = (typeof UC!=='undefined') ? clone(UC) : [];
  normalizeModel();
}
function normalizeModel(){
  if(!model.texts) model.texts = clone(DEFAULT_TEXTS);
  // 누락 텍스트 키 보강
  deepDefault(model.texts, DEFAULT_TEXTS);
  if(!Array.isArray(model.industries)) model.industries=[];
  if(!model.icons) model.icons={};
  if(!Array.isArray(model.uc)) model.uc=[];
  // 산업에 아이콘 누락 시 기본값
  model.industries.forEach(function(i){ if(!model.icons[i.id]) model.icons[i.id]='📁'; });
}
function deepDefault(target, def){
  for(var k in def){
    if(def[k] && typeof def[k]==='object' && !Array.isArray(def[k])){
      if(!target[k] || typeof target[k]!=='object') target[k]={};
      deepDefault(target[k], def[k]);
    } else if(target[k]===undefined){
      target[k]=clone(def[k]);
    }
  }
}
function saveDraft(){ localStorage.setItem(LS.draft, JSON.stringify(model)); }
function markDirty(){
  dirty=true; saveDraft();
  $('deploy-banner').classList.add('on');
}
function clearDirty(){ dirty=false; $('deploy-banner').classList.remove('on'); }

/* ----------------------------------------------------------
   3. 텍스트 자동 적용 함수
   (미리보기 + 배포되는 data.js 양쪽에서 동일하게 사용)
   ⚠ 외부 헬퍼 의존 없이 자기완결적으로 작성 — data.js 에 toString() 으로 삽입됨
---------------------------------------------------------- */
function applyTexts(doc, T){
  if(!doc || !T) return;
  function q(s){ return doc.querySelector(s); }
  function txt(s,v){ var e=q(s); if(e!=null && v!=null) e.textContent=v; }
  function html(s,v){ var e=q(s); if(e!=null && v!=null) e.innerHTML=v; }
  function tag(s,v){ var e=q(s); if(e!=null && v!=null) e.innerHTML='<span class="step-tag-dot"></span>'+v; }
  var h=T.hero||{};
  txt('.hero-badge', h.badge);
  html('.hero h1', h.h1);
  html('.hero-desc', h.desc);
  if(h.chips){ var cs=doc.querySelectorAll('.hero-chips .h-chip'); for(var i=0;i<cs.length&&i<h.chips.length;i++){ cs[i].textContent=h.chips[i]; } }
  if(h.progress){ for(var j=0;j<3;j++){ var pl=q('#pl'+(j+1)); if(pl&&h.progress[j]!=null) pl.textContent=h.progress[j]; } }
  var s1=T.step1||{}; tag('#s1 .step-tag', s1.tag); txt('#s1 .step-title', s1.title); html('#s1 .step-sub', s1.sub);
  var s2=T.step2||{}; tag('#s2 .step-tag', s2.tag); txt('#s2 .step-title', s2.title); html('#s2 .step-sub', s2.sub);
  if(s2.tabs){
    if(s2.tabs.vod){ txt('#tv .t-lb', s2.tabs.vod.lb); txt('#tv .t-sl', s2.tabs.vod.sl); }
    if(s2.tabs.live){ txt('#tl .t-lb', s2.tabs.live.lb); txt('#tl .t-sl', s2.tabs.live.sl); }
    if(s2.tabs.both){ txt('#tb .t-lb', s2.tabs.both.lb); txt('#tb .t-sl', s2.tabs.both.sl); }
  }
  if(s2.desc){ html('#dv', s2.desc.vod); html('#dl', s2.desc.live); html('#db', s2.desc.both); }
  var s3=T.step3||{}; tag('#s3 .step-tag', s3.tag); txt('#s3 .step-title', s3.title); html('#s3 .step-sub', s3.sub);
  var iq=T.inquiry||{}; html('.inq-title', iq.title); html('.inq-sub', iq.sub);
  var ft=T.footer||{}; txt('.foot-txt', ft.txt);
}

/* ----------------------------------------------------------
   4. data.js 직렬화 (배포 대상)
---------------------------------------------------------- */
function buildDataJs(){
  function P(o){ return JSON.stringify(o, null, 2); }
  var out='';
  out += '// =========================================================\n';
  out += '// 콜러스 솔루션 파인더 데이터 — Admin 에서 자동 생성\n';
  out += '// 생성 시각: ' + new Date().toISOString() + '\n';
  out += '// 직접 수정하지 마세요. Admin 페이지에서 편집 후 배포하세요.\n';
  out += '// =========================================================\n\n';
  out += 'const TEXTS = ' + P(model.texts) + ';\n\n';
  out += 'const INDUSTRIES = ' + P(model.industries) + ';\n\n';
  out += 'const UC = ' + P(model.uc) + ';\n\n';
  out += '// ── 런타임 상태 ──\n';
  out += 'var st = { ind: null, sits: [] };\n';
  out += 'var curTab = "vod";\n';
  out += 'var IND_ICONS = ' + P(model.icons) + ';\n\n';
  out += '// ── 텍스트 자동 적용 (솔루션 파인더 페이지에서만 동작, index 파일 수정 불필요) ──\n';
  out += applyTexts.toString() + '\n';
  out += '(function(){function boot(){if(typeof document==="undefined")return;if(!document.querySelector(".hero"))return;try{applyTexts(document, TEXTS);}catch(e){}}'
       + 'if(typeof document!=="undefined"){if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",boot);}else{boot();}}})();\n';
  return out;
}

/* ----------------------------------------------------------
   5. 라이브 미리보기 엔진
---------------------------------------------------------- */
var PV = { ready:false, mode:'compose', assets:null, step:1, ind:null, sits:[], composeTimer:null, srcLoaded:false, notedInline:false };

async function fetchText(url){
  try{ var r=await fetch(url,{cache:'no-store'}); if(!r.ok) return null; return await r.text(); }
  catch(e){ return null; }
}
function extractBody(htmlText){
  var m = htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  var inner = m ? m[1] : htmlText;
  inner = inner.replace(/<script[\s\S]*?<\/script>/gi, ''); // 원본 스크립트 제거(데이터 중복 선언 방지)
  return inner;
}
function extractStyle(htmlText){
  var m = htmlText.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  return m ? m[1] : '';
}
function safeJs(s){ return String(s||'').replace(/<\/script>/gi,'<\\/script>'); }

async function loadPreviewAssets(){
  var idx = await fetchText('index.html');
  if(idx==null){ PV.mode='fail'; showPreviewError('index.html 을 불러올 수 없습니다.'); return false; }
  var css = await fetchText('css/style.css');
  if(css==null) css = extractStyle(idx);
  var app = await fetchText('js/app.js');
  if(app==null) app = await fetchText('js/api.js');
  if(app!=null){
    // 모듈형: 실제 자산을 합성해 완전한 라이브 미리보기 (텍스트+산업+UC)
    PV.mode='compose';
    PV.assets = { body: extractBody(idx), css: css||'', app: app };
  } else {
    // 인라인형: index.html 을 그대로 로드하고 텍스트/단계만 라이브 반영
    PV.mode='src';
    PV.assets = { css: css||'' };
  }
  PV.ready = true;
  return true;
}
function showPreviewError(msg){
  var box=$('pv-error'); if(!box) return;
  box.classList.add('on');
  box.innerHTML = '<b>미리보기를 표시할 수 없습니다.</b><br>'+esc(msg)
    + '<br><br>· 이 페이지는 <b>웹 서버</b>(GitHub Pages 또는 로컬 서버)에서 열어야 미리보기가 동작합니다.'
    + '<br>· <code>file://</code> 로 직접 열면 브라우저 보안 정책으로 자산을 불러오지 못합니다.'
    + '<br>· 같은 폴더에 <code>index.html</code> 이 있어야 합니다.';
  var f=$('pv-frame'); if(f) f.style.display='none';
}

function composePreview(){
  if(!PV.ready) return;
  if(PV.mode==='src'){ composeSrc(); return; }
  var a=PV.assets;
  var dataJs = buildDataJs();
  var boot = ''
    + '(function(){function go2(){try{'
    +   'var step='+PV.step+';'
    +   'var ind='+JSON.stringify(PV.ind)+';'
    +   'var sits='+JSON.stringify(PV.sits)+';'
    +   'if(ind){st.ind=ind;st.sits=sits||[];}'
    +   'if(typeof go==="function"){ if(step===2){if(typeof renderS2==="function")renderS2();go(2);} else if(step===3){go(3);} else {go(1);} }'
    + '}catch(e){console.error(e);}}'
    + 'if(document.readyState==="complete")go2();else window.addEventListener("load",go2);})();';

  var html = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    + '<style>'+a.css+'</style></head><body>'
    + a.body
    + '<script>'+safeJs(dataJs)+'<\/script>'
    + '<script>'+safeJs(a.app)+'<\/script>'
    + '<script>'+safeJs(boot)+'<\/script>'
    + '</body></html>';

  var f=$('pv-frame');
  if(f) f.srcdoc = html;
}
function schedulePreview(){
  clearTimeout(PV.composeTimer);
  PV.composeTimer=setTimeout(composePreview, 220);
}
/* 인라인형: 실제 index.html 을 로드하고 텍스트/단계만 라이브 반영 */
function composeSrc(){
  var f=$('pv-frame'); if(!f) return;
  if(!PV.srcLoaded){
    f.addEventListener('load', function(){
      PV.srcLoaded=true;
      try{
        var w=f.contentWindow, d=f.contentDocument;
        if(d && d.querySelector('.hero')) applyTexts(d, model.texts);
        if(w && typeof w.go==='function') w.go(PV.step);
      }catch(e){}
    });
    f.src='index.html';
    return;
  }
  // 이미 로드됨 → 텍스트 패치 + 단계 이동
  try{
    var w=f.contentWindow, d=f.contentDocument;
    if(d && d.querySelector('.hero')) applyTexts(d, model.texts);
    if(w && typeof w.go==='function'){
      if(PV.step===3 && PV.ind){ w.st={ind:PV.ind,sits:PV.sits||[]}; w.go(3); }
      else w.go(PV.step);
    }
  }catch(e){}
}
/* 텍스트만 즉시 반영 (iframe 리로드 없이) */
function livePatchTexts(){
  var f=$('pv-frame');
  if(!f) return;
  try{
    var d=f.contentDocument;
    if(d && d.querySelector('.hero')) applyTexts(d, model.texts);
    else schedulePreview();
  }catch(e){ schedulePreview(); }
}
function setPreviewStep(n, ind, sits){
  // 텍스트 탭에서 Step2·3 로 이동 시, 비어 보이지 않도록 기본 산업/상황 채움
  if(n>=2 && !ind && model.industries[0]){
    ind = model.industries[0].id;
    if(n===3){
      var u0 = model.uc.filter(function(x){return x.ind===ind;})[0];
      sits = u0 ? [].concat(u0.sitVod||[],u0.sitLive||[],u0.sitBoth||[]).map(function(s){return s.txt;}) : [];
    } else { sits = []; }
  }
  PV.step=n; PV.ind=ind||null; PV.sits=sits||[];
  document.querySelectorAll('.pv-steps button').forEach(function(b){
    b.classList.toggle('on', parseInt(b.dataset.s,10)===n);
  });
  composePreview();
}
/* 산업/UC 편집 시 호출 — 모듈형은 즉시 반영, 인라인형은 배포 후 반영 안내 */
function refreshStructuralPreview(){
  if(PV.mode==='compose'){ composePreview(); }
  else if(PV.mode==='src' && !PV.notedInline){
    PV.notedInline=true;
    toast('산업·유스케이스 미리보기는 배포 후 반영됩니다 (모듈형 index 권장)');
  }
}

/* ----------------------------------------------------------
   6. 로그인
---------------------------------------------------------- */
function doLogin(){
  var s=getSettings();
  var id=$('login-id').value.trim();
  var pw=$('login-pw').value;
  if(id===s.adminId && hash32(pw)===s.adminHash){
    sessionStorage.setItem(SS.auth,'1');
    enterApp();
  } else {
    $('login-error').classList.add('on');
  }
}
function doLogout(){
  sessionStorage.removeItem(SS.auth);
  location.reload();
}
function enterApp(){
  $('login-screen').style.display='none';
  $('app').classList.add('on');
  var s=getSettings();
  $('header-user').textContent='👤 '+s.adminId;
  boot();
}

/* ----------------------------------------------------------
   7. 탭 전환
---------------------------------------------------------- */
function showTab(name){
  curTab=name;
  ['text','industry','step2','uc','deploy','settings'].forEach(function(t){
    var pane=$('pane-'+t), btn=$('tab-'+t);
    if(pane) pane.style.display = (t===name)?'block':'none';
    if(btn) btn.classList.toggle('active', t===name);
  });
  // 배포/설정 탭에서는 미리보기 숨김
  var ws=$('workspace');
  if(ws) ws.classList.toggle('no-preview', !(name==='text'||name==='industry'||name==='step2'||name==='uc'));
  if(name==='text'){ setPreviewStep(1, null, []); }
  if(name==='industry'){ renderIndTable(); setPreviewStep(1, null, []); }
  if(name==='step2') renderStep2Tab();          // 내부에서 Step 2 로 이동
  if(name==='uc'){ fillUcFilter(); renderUcTable(); setPreviewStep(3, null, []); }
  if(name==='deploy') renderDeployPreview();
  if(name==='settings') fillSettings();
}

/* ----------------------------------------------------------
   8. 텍스트 탭
---------------------------------------------------------- */
var TEXT_GROUPS = [
  {key:'hero', step:1, num:'H', title:'히어로 (상단 영역)', fields:[
    {path:'hero.badge', label:'배지', type:'input'},
    {path:'hero.h1', label:'메인 헤드라인', type:'textarea', html:true},
    {path:'hero.desc', label:'설명 문구', type:'textarea', html:true},
    {path:'hero.chips', label:'키워드 칩 (6개)', type:'chips'},
    {path:'hero.progress', label:'진행 단계 라벨 (3개)', type:'progress'}
  ]},
  {key:'step1', step:1, num:'1', title:'Step 1 · 산업 선택', fields:[
    {path:'step1.tag', label:'태그', type:'input'},
    {path:'step1.title', label:'타이틀', type:'input'},
    {path:'step1.sub', label:'서브타이틀', type:'textarea', html:true}
  ]},
  {key:'step2', step:2, num:'2', title:'Step 2 · 상황 / 니즈', fields:[
    {path:'step2.tag', label:'태그', type:'input'},
    {path:'step2.title', label:'타이틀', type:'input'},
    {path:'step2.sub', label:'서브타이틀', type:'textarea', html:true},
    {path:'step2.tabs.vod.lb', label:'VOD 탭 이름', type:'input'},
    {path:'step2.tabs.vod.sl', label:'VOD 탭 설명', type:'input'},
    {path:'step2.tabs.live.lb', label:'LIVE 탭 이름', type:'input'},
    {path:'step2.tabs.live.sl', label:'LIVE 탭 설명', type:'input'},
    {path:'step2.tabs.both.lb', label:'VOD+LIVE 탭 이름', type:'input'},
    {path:'step2.tabs.both.sl', label:'VOD+LIVE 탭 설명', type:'input'},
    {path:'step2.desc.vod', label:'VOD 모드 설명', type:'textarea'},
    {path:'step2.desc.live', label:'LIVE 모드 설명', type:'textarea'},
    {path:'step2.desc.both', label:'VOD+LIVE 모드 설명', type:'textarea'}
  ]},
  {key:'step3', step:3, num:'3', title:'Step 3 · 솔루션 결과', fields:[
    {path:'step3.tag', label:'태그', type:'input'},
    {path:'step3.title', label:'타이틀', type:'input'},
    {path:'step3.sub', label:'서브타이틀', type:'textarea', html:true},
    {path:'step3.headline', label:'결과 헤드라인', type:'input'}
  ]},
  {key:'inquiry', step:3, num:'Q', title:'문의 영역', fields:[
    {path:'inquiry.title', label:'문의 타이틀', type:'textarea', html:true},
    {path:'inquiry.sub', label:'문의 설명', type:'textarea', html:true}
  ]},
  {key:'footer', step:3, num:'F', title:'푸터', fields:[
    {path:'footer.txt', label:'푸터 문구', type:'input'}
  ]}
];

function getByPath(obj, path){ return path.split('.').reduce(function(o,k){ return (o==null)?undefined:o[k]; }, obj); }
function setByPath(obj, path, val){
  var ks=path.split('.'), last=ks.pop();
  var t=ks.reduce(function(o,k){ if(o[k]==null) o[k]={}; return o[k]; }, obj);
  t[last]=val;
}

function renderTextTab(){
  var wrap=$('text-panes'); if(!wrap) return;
  wrap.innerHTML='';
  TEXT_GROUPS.forEach(function(g){
    var box=document.createElement('div');
    box.className='txt-group'+(g.key!=='hero'?' collapsed':'');
    var head='<div class="txt-group-hd"><span class="gnum">'+g.num+'</span><h3>'+esc(g.title)+'</h3>'
      +'<span class="chev">▾</span></div>';
    var body='<div class="txt-group-body">';
    g.fields.forEach(function(fd){ body += renderField(fd); });
    body+='</div>';
    box.innerHTML=head+body;
    // 그룹 접기/펼치기 + 미리보기 step 이동
    box.querySelector('.txt-group-hd').addEventListener('click', function(){
      box.classList.toggle('collapsed');
      if(!box.classList.contains('collapsed')) setPreviewStep(g.step, null, []);
    });
    wrap.appendChild(box);
  });
  bindTextFields();
}
function renderField(fd){
  var val=getByPath(model.texts, fd.path);
  var htmlBadge = fd.html ? '<span class="allow-html">HTML 허용</span>' : '';
  if(fd.type==='chips'){
    var arr=val||[]; var rows='';
    for(var i=0;i<6;i++){
      rows+='<input data-chip="'+i+'" data-path="'+fd.path+'" value="'+esc(arr[i]||'')+'" placeholder="칩 '+(i+1)+'">';
    }
    return '<div class="field"><label>'+esc(fd.label)+'</label><div class="chips-row">'+rows+'</div></div>';
  }
  if(fd.type==='progress'){
    var pa=val||[]; var pr='';
    for(var j=0;j<3;j++){
      pr+='<input data-prog="'+j+'" data-path="'+fd.path+'" value="'+esc(pa[j]||'')+'" placeholder="단계 '+(j+1)+'">';
    }
    return '<div class="field"><label>'+esc(fd.label)+'</label><div class="chips-row" style="grid-template-columns:1fr 1fr 1fr">'+pr+'</div></div>';
  }
  var input = fd.type==='textarea'
    ? '<textarea data-path="'+fd.path+'">'+esc(val)+'</textarea>'
    : '<input type="text" data-path="'+fd.path+'" value="'+esc(val)+'">';
  return '<div class="field"><label>'+esc(fd.label)+htmlBadge+'</label>'+input+'</div>';
}
function bindTextFields(){
  $('text-panes').querySelectorAll('[data-path]').forEach(function(inp){
    inp.addEventListener('input', function(){
      var path=inp.dataset.path;
      if(inp.dataset.chip!=null){
        var arr=getByPath(model.texts, path)||[]; arr[parseInt(inp.dataset.chip,10)]=inp.value; setByPath(model.texts,path,arr);
      } else if(inp.dataset.prog!=null){
        var pa=getByPath(model.texts, path)||[]; pa[parseInt(inp.dataset.prog,10)]=inp.value; setByPath(model.texts,path,pa);
      } else {
        setByPath(model.texts, path, inp.value);
      }
      markDirty();
      livePatchTexts();
    });
  });
}
function saveTexts(){ saveDraft(); markDirty(); toast('텍스트가 저장되었습니다. 반영하려면 배포하세요.','ok'); }

/* ----------------------------------------------------------
   9. 산업 탭
---------------------------------------------------------- */
function ucCountFor(indId){ return model.uc.filter(function(u){ return u.ind===indId; }).length; }

function renderIndTable(){
  var tb=$('ind-tbody'); if(!tb) return;
  tb.innerHTML='';
  model.industries.forEach(function(ind, idx){
    var tr=document.createElement('tr');
    tr.innerHTML =
      '<td><div class="ord-btns"><button '+(idx===0?'disabled':'')+' data-up="'+idx+'">▲</button>'
        +'<button '+(idx===model.industries.length-1?'disabled':'')+' data-down="'+idx+'">▼</button></div></td>'
      +'<td><span class="ico-cell">'+esc(model.icons[ind.id]||'📁')+'</span></td>'
      +'<td class="t-id">'+esc(ind.id)+'</td>'
      +'<td><b>'+esc(ind.label)+'</b></td>'
      +'<td>'+esc(ind.col||'-')+'</td>'
      +'<td>'+ucCountFor(ind.id)+'개</td>'
      +'<td><div class="t-actions">'
        +'<button class="btn btn-sm" data-edit="'+esc(ind.id)+'">수정</button>'
        +'<button class="btn btn-sm btn-danger" data-del="'+esc(ind.id)+'">삭제</button></div></td>';
    tb.appendChild(tr);
  });
  tb.querySelectorAll('[data-up]').forEach(function(b){ b.onclick=function(){ moveInd(+b.dataset.up,-1); }; });
  tb.querySelectorAll('[data-down]').forEach(function(b){ b.onclick=function(){ moveInd(+b.dataset.down,1); }; });
  tb.querySelectorAll('[data-edit]').forEach(function(b){ b.onclick=function(){ openIndModal(b.dataset.edit); }; });
  tb.querySelectorAll('[data-del]').forEach(function(b){ b.onclick=function(){ deleteInd(b.dataset.del); }; });
}
function moveInd(idx, dir){
  var ni=idx+dir; if(ni<0||ni>=model.industries.length) return;
  var t=model.industries[idx]; model.industries[idx]=model.industries[ni]; model.industries[ni]=t;
  markDirty(); renderIndTable(); setPreviewStep(1,null,[]);
}
function openIndModal(id){
  if(id){
    var src=model.industries.filter(function(i){return i.id===id;})[0];
    editIndOrig=id; editInd=clone(src||{id:'',label:'',col:'blue'});
    editInd.icon = model.icons[id]||'📁';
    $('modal-ind-title').textContent='산업 수정';
  } else {
    editIndOrig=null; editInd={id:'',label:'',col:'blue',icon:'📁'};
    $('modal-ind-title').textContent='산업 추가';
  }
  renderIndModal();
  $('modal-ind').classList.add('on');
}
function renderIndModal(){
  var colOpts=COLORS.map(function(c){ return '<option value="'+c.v+'"'+(c.v===editInd.col?' selected':'')+'>'+c.t+'</option>'; }).join('');
  var sug=ICON_SUGGEST.map(function(e){ return '<button type="button" data-ic="'+e+'">'+e+'</button>'; }).join('');
  $('modal-ind-body').innerHTML =
    '<div class="form-grid">'
      +'<div class="form-row"><label>ID *</label><input type="text" id="ind-id" value="'+esc(editInd.id)+'" '+(editIndOrig?'disabled':'')+' placeholder="영문 소문자 (예: edu)"><div class="form-hint">영문 소문자·고유값'+(editIndOrig?' (수정 불가)':'')+'</div></div>'
      +'<div class="form-row"><label>컬러</label><select id="ind-col">'+colOpts+'</select></div>'
    +'</div>'
    +'<div class="form-row"><label>산업명 *</label><input type="text" id="ind-label" value="'+esc(editInd.label)+'" placeholder="표시될 이름"></div>'
    +'<div class="form-row"><label>아이콘 (이모지)</label>'
      +'<div class="icon-pick"><span class="cur" id="ind-ic-cur">'+esc(editInd.icon)+'</span>'
      +'<input type="text" id="ind-icon" value="'+esc(editInd.icon)+'" maxlength="4" placeholder="이모지 1개"></div>'
      +'<div class="icon-suggest">'+sug+'</div></div>';
  var icInput=$('ind-icon'), icCur=$('ind-ic-cur');
  icInput.addEventListener('input', function(){ icCur.textContent=icInput.value||'📁'; });
  $('modal-ind-body').querySelectorAll('[data-ic]').forEach(function(b){
    b.onclick=function(){ icInput.value=b.dataset.ic; icCur.textContent=b.dataset.ic; };
  });
}
function saveInd(){
  var id=(editIndOrig|| $('ind-id').value.trim());
  var label=$('ind-label').value.trim();
  var col=$('ind-col').value;
  var icon=$('ind-icon').value.trim()||'📁';
  if(!id){ toast('ID를 입력하세요.','err'); return; }
  if(!/^[a-z0-9_]+$/.test(id)){ toast('ID는 영문 소문자/숫자만 가능합니다.','err'); return; }
  if(!label){ toast('산업명을 입력하세요.','err'); return; }
  if(!editIndOrig && model.industries.some(function(i){return i.id===id;})){ toast('이미 존재하는 ID입니다.','err'); return; }
  if(editIndOrig){
    var t=model.industries.filter(function(i){return i.id===id;})[0];
    if(t){ t.label=label; t.col=col; }
  } else {
    model.industries.push({id:id,label:label,col:col});
  }
  model.icons[id]=icon;
  markDirty(); closeModal('modal-ind'); renderIndTable(); setPreviewStep(1,null,[]);
  toast('산업이 저장되었습니다.','ok');
}
function deleteInd(id){
  var n=ucCountFor(id);
  if(n>0){
    if(!confirm('이 산업에 연결된 유스케이스 '+n+'개가 있습니다.\n산업을 삭제하면 해당 유스케이스도 함께 삭제됩니다. 계속할까요?')) return;
    model.uc = model.uc.filter(function(u){ return u.ind!==id; });
  } else {
    if(!confirm('이 산업을 삭제할까요?')) return;
  }
  model.industries = model.industries.filter(function(i){ return i.id!==id; });
  delete model.icons[id];
  markDirty(); renderIndTable(); setPreviewStep(1,null,[]);
  toast('산업이 삭제되었습니다.','ok');
}

/* ----------------------------------------------------------
   9-b. 상황/니즈 탭 (Step 2 전용)
   - Step 2 상황은 각 UC 의 sitVod/sitLive/sitBoth 를 산업별로 합쳐 자동 생성됨
   - 여기서 수정하면 같은 txt 를 가진 모든 UC 에 일괄 반영
---------------------------------------------------------- */
var s2Industry = null;
var SIT_KEYS = [{k:'sitVod',label:'VOD',cls:'vod'},{k:'sitLive',label:'LIVE',cls:'live'},{k:'sitBoth',label:'VOD+LIVE',cls:'both'}];

function renderStep2Tab(){
  if(!s2Industry || !model.industries.some(function(i){return i.id===s2Industry;})){
    s2Industry = model.industries[0] ? model.industries[0].id : null;
  }
  var sel=$('s2-ind'); if(!sel) return;
  sel.innerHTML = model.industries.map(function(i){
    return '<option value="'+esc(i.id)+'"'+(i.id===s2Industry?' selected':'')+'>'+esc(i.label)+'</option>';
  }).join('');
  sel.onchange=function(){ s2Industry=sel.value; renderStep2List(); setPreviewStep(2, s2Industry, []); };
  renderStep2List();
  setPreviewStep(2, s2Industry, []);
}
/* 산업별 상황 풀 집계: [{cat, txt, ucs:[id...]}] */
function aggSits(indId, tabKey){
  var pool=[];
  model.uc.filter(function(u){return u.ind===indId;}).forEach(function(u){
    (u[tabKey]||[]).forEach(function(s){
      var ex=pool.filter(function(p){return p.txt===s.txt;})[0];
      if(ex){ if(ex.ucs.indexOf(u.id)<0) ex.ucs.push(u.id); }
      else pool.push({cat:s.cat, txt:s.txt, ucs:[u.id]});
    });
  });
  var order=['보안','스트리밍','플레이어','데이터/개발','기타'];
  pool.sort(function(a,b){ return order.indexOf(a.cat)-order.indexOf(b.cat); });
  return pool;
}
function renderStep2List(){
  var wrap=$('s2-list'); if(!wrap) return;
  if(!s2Industry){ wrap.innerHTML='<div class="sit-empty" style="padding:14px">먼저 산업을 추가하세요.</div>'; return; }
  wrap.innerHTML='';
  SIT_KEYS.forEach(function(t){
    var pool=aggSits(s2Industry, t.k);
    var block=document.createElement('div'); block.className='sit-block';
    var inner='<div class="sit-block-hd '+t.cls+'">'+t.label+' 상황 <span style="opacity:.7;font-weight:600">· '+pool.length+'개</span>'
      +'<button class="add" data-adds2="'+t.k+'">＋ 추가</button></div>';
    if(!pool.length){
      inner+='<div class="sit-empty" style="padding:10px 13px">등록된 상황이 없습니다.</div>';
    } else {
      inner+='<div class="sit-rows">'+pool.map(function(p){ return s2Row(t.k,p); }).join('')+'</div>';
    }
    block.innerHTML=inner;
    wrap.appendChild(block);
  });
  bindStep2List();
}
function s2Row(tabKey, p){
  var opts=CATS.map(function(c){ return '<option value="'+esc(c)+'"'+(c===p.cat?' selected':'')+'>'+esc(c)+'</option>'; }).join('');
  return '<div class="s2-row" data-tab="'+tabKey+'" data-old="'+esc(p.txt)+'">'
    +'<select data-f="cat">'+opts+'</select>'
    +'<input data-f="txt" value="'+esc(p.txt)+'">'
    +'<span class="s2-ucs" title="이 상황이 연결된 유스케이스 수">UC '+p.ucs.length+'</span>'
    +'<button class="del" data-dels2 title="모든 UC 에서 이 상황 제거">✕</button></div>';
}
function bindStep2List(){
  var wrap=$('s2-list');
  wrap.querySelectorAll('[data-adds2]').forEach(function(b){
    b.onclick=function(){ openS2Modal(b.dataset.adds2); };
  });
  wrap.querySelectorAll('.s2-row').forEach(function(row){
    var tabKey=row.dataset.tab, oldTxt=row.dataset.old;
    row.querySelector('[data-f="cat"]').onchange=function(e){ s2Recat(tabKey, oldTxt, e.target.value); markDirty(); refreshStructuralPreview(); };
    row.querySelector('[data-f="txt"]').onchange=function(e){
      var nv=e.target.value.trim();
      if(!nv){ e.target.value=oldTxt; return; }
      s2Rename(tabKey, oldTxt, nv); row.dataset.old=nv; markDirty(); renderStep2List(); refreshStructuralPreview();
    };
    row.querySelector('[data-dels2]').onclick=function(){
      var cnt=aggSits(s2Industry,tabKey).filter(function(p){return p.txt===oldTxt;})[0];
      var n=cnt?cnt.ucs.length:0;
      if(!confirm('"'+oldTxt+'" 상황을 삭제할까요?\n이 산업의 연결된 유스케이스 '+n+'개에서 함께 제거됩니다.')) return;
      s2Delete(tabKey, oldTxt); markDirty(); renderStep2List(); refreshStructuralPreview();
      toast('상황이 삭제되었습니다.','ok');
    };
  });
}
function s2Rename(tabKey, oldTxt, newTxt){
  model.uc.filter(function(u){return u.ind===s2Industry;}).forEach(function(u){
    (u[tabKey]||[]).forEach(function(s){ if(s.txt===oldTxt) s.txt=newTxt; });
  });
}
function s2Recat(tabKey, txt, cat){
  model.uc.filter(function(u){return u.ind===s2Industry;}).forEach(function(u){
    (u[tabKey]||[]).forEach(function(s){ if(s.txt===txt) s.cat=cat; });
  });
}
function s2Delete(tabKey, txt){
  model.uc.filter(function(u){return u.ind===s2Industry;}).forEach(function(u){
    u[tabKey]=(u[tabKey]||[]).filter(function(s){ return s.txt!==txt; });
  });
}
/* 상황 추가 모달 — 어떤 UC 에 연결할지 선택 (상황은 UC 에 속해야 Step2 에 노출됨) */
var s2AddTab=null;
function openS2Modal(tabKey){
  s2AddTab=tabKey;
  var ucs=model.uc.filter(function(u){return u.ind===s2Industry;});
  var label=SIT_KEYS.filter(function(t){return t.k===tabKey;})[0].label;
  var catOpts=CATS.map(function(c){ return '<option value="'+esc(c)+'">'+esc(c)+'</option>'; }).join('');
  var ucList = ucs.length ? ucs.map(function(u){
    return '<label class="s2-uc-check"><input type="checkbox" value="'+esc(u.id)+'"> <b>'+esc(u.id)+'</b> · '+esc(u.name)+'</label>';
  }).join('') : '<div class="form-hint">이 산업에 유스케이스가 없습니다. 먼저 유스케이스를 추가하세요.</div>';
  $('modal-s2-title').textContent=label+' 상황 추가';
  $('modal-s2-body').innerHTML=
    '<div class="form-row"><label>카테고리</label><select id="s2-add-cat">'+catOpts+'</select></div>'
    +'<div class="form-row"><label>상황 문구 *</label><input type="text" id="s2-add-txt" placeholder="예: 콘텐츠 불법 유출 방지가 필요해요"></div>'
    +'<div class="form-row"><label>연결할 유스케이스 *<span class="hint" style="font-weight:500;color:#9CA3AF"> · 선택한 UC 의 결과에 이 상황이 매칭됩니다</span></label>'
    +'<div class="s2-uc-list">'+ucList+'</div></div>';
  $('modal-s2').classList.add('on');
}
function saveS2(){
  var cat=$('s2-add-cat').value;
  var txt=$('s2-add-txt').value.trim();
  if(!txt){ toast('상황 문구를 입력하세요.','err'); return; }
  var checked=Array.prototype.slice.call($('modal-s2-body').querySelectorAll('.s2-uc-list input:checked')).map(function(c){return c.value;});
  if(!checked.length){ toast('연결할 유스케이스를 1개 이상 선택하세요.','err'); return; }
  model.uc.filter(function(u){return checked.indexOf(u.id)>-1;}).forEach(function(u){
    if(!Array.isArray(u[s2AddTab])) u[s2AddTab]=[];
    if(!u[s2AddTab].some(function(s){return s.txt===txt;})) u[s2AddTab].push({cat:cat, txt:txt});
  });
  markDirty(); closeModal('modal-s2'); renderStep2List(); refreshStructuralPreview();
  toast('상황이 추가되었습니다.','ok');
}

/* ----------------------------------------------------------
   10. 유스케이스 탭
---------------------------------------------------------- */
function fillUcFilter(){
  var sel=$('uc-filter'); if(!sel) return;
  var cur=sel.value;
  sel.innerHTML='<option value="">전체 산업</option>'+
    model.industries.map(function(i){ return '<option value="'+esc(i.id)+'">'+esc(i.label)+'</option>'; }).join('');
  sel.value=cur;
}
function indLabel(id){ var i=model.industries.filter(function(x){return x.id===id;})[0]; return i?i.label:id; }
function modeLabel(m){ return m==='vod'?'VOD':m==='live'?'LIVE':'VOD+LIVE'; }

function renderUcTable(){
  var tb=$('uc-tbody'); if(!tb) return;
  var filter=$('uc-filter')?$('uc-filter').value:'';
  tb.innerHTML='';
  model.uc.filter(function(u){ return !filter||u.ind===filter; }).forEach(function(u){
    var tr=document.createElement('tr');
    tr.innerHTML =
      '<td class="t-id">'+esc(u.id)+'</td>'
      +'<td>'+esc(indLabel(u.ind))+'</td>'
      +'<td><span class="pillm '+esc(u.mode)+'">'+modeLabel(u.mode)+'</span></td>'
      +'<td><b>'+esc(u.name)+'</b></td>'
      +'<td>'+esc(u.product||'-')+'</td>'
      +'<td><div class="t-actions">'
        +'<button class="btn btn-sm" data-pv="'+esc(u.id)+'">미리보기</button>'
        +'<button class="btn btn-sm" data-edit="'+esc(u.id)+'">수정</button>'
        +'<button class="btn btn-sm btn-danger" data-del="'+esc(u.id)+'">삭제</button></div></td>';
    tb.appendChild(tr);
  });
  tb.querySelectorAll('[data-edit]').forEach(function(b){ b.onclick=function(){ openUcModal(b.dataset.edit); }; });
  tb.querySelectorAll('[data-del]').forEach(function(b){ b.onclick=function(){ deleteUc(b.dataset.del); }; });
  tb.querySelectorAll('[data-pv]').forEach(function(b){ b.onclick=function(){ previewUc(b.dataset.pv); }; });
}
function previewUc(id){
  var u=model.uc.filter(function(x){return x.id===id;})[0]; if(!u) return;
  var sits=[].concat(u.sitVod||[],u.sitLive||[],u.sitBoth||[]).map(function(s){return s.txt;});
  setPreviewStep(3, u.ind, sits);
  toast('Step 3 결과에서 이 유스케이스를 확인하세요.');
}
function nextUcId(){
  var max=0;
  model.uc.forEach(function(u){ var m=(u.id||'').match(/(\d+)/); if(m){ var n=parseInt(m[1],10); if(n>max) max=n; } });
  var n=(max+1); return 'uc'+(n<10?'0'+n:n);
}
function blankUc(){
  return { id:nextUcId(), ind:(model.industries[0]?model.industries[0].id:''), mode:'vod', name:'',
    sitVod:[], sitLive:[], sitBoth:[],
    features:{'보안':[],'스트리밍':[],'플레이어':[],'데이터/개발':[]},
    product:'', situation:'', position:'', customers:'' };
}
function openUcModal(id){
  if(id){
    var src=model.uc.filter(function(u){return u.id===id;})[0];
    editUcOrig=id; editUc=clone(src);
    ensureUcShape(editUc);
    $('modal-uc-title').textContent='유스케이스 수정';
  } else {
    editUcOrig=null; editUc=blankUc();
    $('modal-uc-title').textContent='유스케이스 추가';
  }
  renderUcModal();
  $('modal-uc').classList.add('on');
}
function ensureUcShape(u){
  ['sitVod','sitLive','sitBoth'].forEach(function(k){ if(!Array.isArray(u[k])) u[k]=[]; });
  if(!u.features) u.features={};
  FEAT_CATS.forEach(function(c){ if(!Array.isArray(u.features[c])) u.features[c]=[]; });
}
function renderUcModal(){
  var indOpts=model.industries.map(function(i){ return '<option value="'+esc(i.id)+'"'+(i.id===editUc.ind?' selected':'')+'>'+esc(i.label)+'</option>'; }).join('');
  var modeOpts=['vod','live','both'].map(function(m){ return '<option value="'+m+'"'+(m===editUc.mode?' selected':'')+'>'+modeLabel(m)+'</option>'; }).join('');
  var html=''
    +'<div class="form-grid">'
      +'<div class="form-row"><label>산업 *</label><select id="uc-ind">'+indOpts+'</select></div>'
      +'<div class="form-row"><label>운영 방식 *</label><select id="uc-mode">'+modeOpts+'</select></div>'
    +'</div>'
    +'<div class="form-grid">'
      +'<div class="form-row"><label>ID</label><input type="text" id="uc-id" value="'+esc(editUc.id)+'" '+(editUcOrig?'disabled':'')+'></div>'
      +'<div class="form-row"><label>솔루션 제품명</label><input type="text" id="uc-product" value="'+esc(editUc.product||'')+'"></div>'
    +'</div>'
    +'<div class="form-row"><label>유스케이스명 *</label><input type="text" id="uc-name" value="'+esc(editUc.name||'')+'"></div>'
    +'<div class="form-row"><label>고객 상황</label><textarea id="uc-situation">'+esc(editUc.situation||'')+'</textarea></div>'
    +'<div class="form-row"><label>포지셔닝 메시지</label><textarea id="uc-position">'+esc(editUc.position||'')+'</textarea></div>'
    +'<div class="form-row"><label>주요 고객사</label><input type="text" id="uc-customers" value="'+esc(editUc.customers||'')+'" placeholder="쉼표로 구분"></div>'
    // ── 상황 / 니즈 (Step 2 선택 조건) ──
    +'<div class="uc-sub"><h4>Step 2 · 선택 조건 (상황/니즈)</h4><span class="tag">탭별로 표시</span></div>'
    + sitBlock('vod','VOD')
    + sitBlock('live','LIVE')
    + sitBlock('both','VOD+LIVE')
    // ── 제공 기능 ──
    +'<div class="uc-sub"><h4>제공 기능 (상세 모달 표시)</h4></div>'
    +'<div class="feat-grid">'+ FEAT_CATS.map(featCol).join('') +'</div>';
  $('modal-uc-body').innerHTML=html;
  bindUcModal();
}
function sitBlock(key, label){
  var arr = editUc[key==='vod'?'sitVod':key==='live'?'sitLive':'sitBoth'];
  var rows = arr.length ? arr.map(function(s,i){ return sitRow(key,i,s); }).join('')
    : '<div class="sit-empty">등록된 항목이 없습니다.</div>';
  return '<div class="sit-block"><div class="sit-block-hd '+key+'">'+label+' 상황'
    +'<button class="add" data-addsit="'+key+'">＋ 추가</button></div>'
    +'<div class="sit-rows" data-sitrows="'+key+'">'+rows+'</div></div>';
}
function sitRow(key, i, s){
  var opts=CATS.map(function(c){ return '<option value="'+esc(c)+'"'+(c===s.cat?' selected':'')+'>'+esc(c)+'</option>'; }).join('');
  return '<div class="sit-row" data-sit="'+key+'" data-i="'+i+'">'
    +'<select data-f="cat">'+opts+'</select>'
    +'<input data-f="txt" value="'+esc(s.txt||'')+'" placeholder="상황 문구 (예: 콘텐츠 불법 유출 방지가 필요해요)">'
    +'<button class="del" data-delsit="'+key+'" data-i="'+i+'">✕</button></div>';
}
function featCol(cat){
  var color=CAT_COLORS[cat]||'#94A3B8';
  var tags=(editUc.features[cat]||[]).map(function(f,i){
    return '<span class="feat-tag">'+esc(f)+'<button data-delfeat="'+esc(cat)+'" data-i="'+i+'">✕</button></span>';
  }).join('');
  return '<div class="feat-col"><h5><span class="cdot" style="background:'+color+'"></span>'+esc(cat)+'</h5>'
    +'<div class="feat-tags" data-feattags="'+esc(cat)+'">'+tags+'</div>'
    +'<div class="feat-add"><input data-featinput="'+esc(cat)+'" placeholder="기능 입력 후 Enter"><button data-featadd="'+esc(cat)+'">추가</button></div></div>';
}
function sitArrKey(key){ return key==='vod'?'sitVod':key==='live'?'sitLive':'sitBoth'; }
function bindUcModal(){
  var body=$('modal-uc-body');
  // 상황 추가
  body.querySelectorAll('[data-addsit]').forEach(function(b){
    b.onclick=function(){ editUc[sitArrKey(b.dataset.addsit)].push({cat:'보안',txt:''}); renderUcModal(); };
  });
  body.querySelectorAll('[data-delsit]').forEach(function(b){
    b.onclick=function(){ editUc[sitArrKey(b.dataset.delsit)].splice(+b.dataset.i,1); renderUcModal(); };
  });
  body.querySelectorAll('.sit-row').forEach(function(row){
    var key=row.dataset.sit, i=+row.dataset.i, arr=editUc[sitArrKey(key)];
    row.querySelector('[data-f="cat"]').onchange=function(e){ arr[i].cat=e.target.value; };
    row.querySelector('[data-f="txt"]').oninput=function(e){ arr[i].txt=e.target.value; };
  });
  // 기능 추가/삭제
  body.querySelectorAll('[data-featadd]').forEach(function(b){
    var cat=b.dataset.featadd;
    b.onclick=function(){ addFeat(cat); };
  });
  body.querySelectorAll('[data-featinput]').forEach(function(inp){
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); addFeat(inp.dataset.featinput); } });
  });
  body.querySelectorAll('[data-delfeat]').forEach(function(b){
    b.onclick=function(){ editUc.features[b.dataset.delfeat].splice(+b.dataset.i,1); renderUcModal(); };
  });
}
function addFeat(cat){
  var inp=$('modal-uc-body').querySelector('[data-featinput="'+cssEsc(cat)+'"]');
  if(!inp) return;
  var v=inp.value.trim(); if(!v) return;
  editUc.features[cat].push(v); renderUcModal();
}
function cssEsc(s){ return s.replace(/([^\w-])/g,'\\$1'); }
function saveUc(){
  editUc.ind=$('uc-ind').value;
  editUc.mode=$('uc-mode').value;
  editUc.name=$('uc-name').value.trim();
  editUc.product=$('uc-product').value.trim();
  editUc.situation=$('uc-situation').value.trim();
  editUc.position=$('uc-position').value.trim();
  editUc.customers=$('uc-customers').value.trim();
  if(!editUcOrig) editUc.id=$('uc-id').value.trim()||editUc.id;
  if(!editUc.name){ toast('유스케이스명을 입력하세요.','err'); return; }
  if(!editUc.ind){ toast('산업을 선택하세요.','err'); return; }
  // 빈 상황 행 제거
  ['sitVod','sitLive','sitBoth'].forEach(function(k){
    editUc[k]=editUc[k].filter(function(s){ return s.txt && s.txt.trim(); });
  });
  if(editUcOrig){
    var idx=model.uc.findIndex(function(u){return u.id===editUcOrig;});
    if(idx>-1) model.uc[idx]=editUc;
  } else {
    if(model.uc.some(function(u){return u.id===editUc.id;})){ toast('이미 존재하는 ID입니다.','err'); return; }
    model.uc.push(editUc);
  }
  markDirty(); closeModal('modal-uc'); renderUcTable();
  previewUc(editUc.id);
  toast('유스케이스가 저장되었습니다.','ok');
}
function deleteUc(id){
  if(!confirm('이 유스케이스를 삭제할까요?')) return;
  model.uc=model.uc.filter(function(u){return u.id!==id;});
  markDirty(); renderUcTable();
  toast('유스케이스가 삭제되었습니다.','ok');
}

/* ----------------------------------------------------------
   11. 배포 (GitHub)
---------------------------------------------------------- */
function renderDeployPreview(){
  var box=$('deploy-preview'); if(!box) return;
  box.innerHTML='<pre>'+esc(buildDataJs())+'</pre>';
}
function logLine(msg, type){
  var box=$('deploy-log'); if(!box) return;
  var d=document.createElement('div');
  d.className='log-line '+(type||'info');
  d.textContent=msg;
  box.appendChild(d);
  box.scrollTop=box.scrollHeight;
  return d;
}
function utf8b64(str){
  var bytes=new TextEncoder().encode(str), bin='';
  for(var i=0;i<bytes.length;i++) bin+=String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function parseRepo(){
  var s=getSettings(); var parts=(s.repo||'').split('/');
  return {owner:parts[0], repo:parts[1], path:s.path, branch:s.branch, token:s.token};
}
async function gh(method, url, body){
  var s=getSettings();
  var headers={'Accept':'application/vnd.github+json','Authorization':'Bearer '+s.token,'X-GitHub-Api-Version':'2022-11-28'};
  if(body) headers['Content-Type']='application/json';
  return fetch(url,{method:method,headers:headers,body:body?JSON.stringify(body):undefined});
}
async function doDeploy(){
  var box=$('deploy-log'); if(box) box.innerHTML='';
  var s=getSettings();
  if(!s.token){ logLine('✗ GitHub Token 이 설정되지 않았습니다. [설정] 탭에서 입력하세요.','err'); return; }
  var r=parseRepo();
  if(!r.owner||!r.repo){ logLine('✗ Repository 형식이 올바르지 않습니다 (owner/repo).','err'); return; }
  var btn=$('deploy-btn'); if(btn) btn.disabled=true;
  var apiBase='https://api.github.com/repos/'+r.owner+'/'+r.repo+'/contents/'+encodeURIComponent(r.path).replace(/%2F/g,'/');
  try{
    logLine('→ 현재 파일 정보 확인 중...','run');
    var sha=null;
    var getRes=await gh('GET', apiBase+'?ref='+encodeURIComponent(r.branch));
    if(getRes.status===200){ var info=await getRes.json(); sha=info.sha; logLine('✓ 기존 파일 발견 (덮어쓰기)','info'); }
    else if(getRes.status===404){ logLine('✓ 신규 파일 생성','info'); }
    else { var et=await getRes.text(); logLine('✗ 파일 조회 실패 ('+getRes.status+'): '+et.slice(0,120),'err'); if(btn)btn.disabled=false; return; }

    logLine('→ data.js 커밋 중...','run');
    var content=utf8b64(buildDataJs());
    var put=await gh('PUT', apiBase, {
      message:'chore(solution-finder): update data.js via admin ['+new Date().toISOString()+']',
      content:content, sha:sha||undefined, branch:r.branch
    });
    if(put.status===200||put.status===201){
      var pj=await put.json();
      logLine('✓ 배포 완료! 커밋: '+(pj.commit&&pj.commit.sha?pj.commit.sha.slice(0,7):''),'ok');
      logLine('  GitHub Pages 반영까지 약 1~2분 소요될 수 있습니다.','info');
      clearDirty();
      toast('배포가 완료되었습니다.','ok');
    } else {
      var pt=await put.text();
      logLine('✗ 배포 실패 ('+put.status+'): '+pt.slice(0,160),'err');
    }
  }catch(e){
    logLine('✗ 오류: '+e.message,'err');
  }
  if(btn) btn.disabled=false;
}

/* ----------------------------------------------------------
   12. 설정
---------------------------------------------------------- */
function fillSettings(){
  var s=getSettings();
  $('cfg-token').value=s.token||'';
  $('cfg-repo').value=s.repo||'';
  $('cfg-path').value=s.path||'';
  $('cfg-branch').value=s.branch||'';
  $('cfg-admin-id').value=s.adminId||'';
  $('cfg-admin-pw').value='';
  $('github-status').textContent='';
}
function saveSettings(){
  var s=getSettings();
  s.token=$('cfg-token').value.trim();
  s.repo=$('cfg-repo').value.trim();
  s.path=$('cfg-path').value.trim();
  s.branch=$('cfg-branch').value.trim()||'main';
  s.adminId=$('cfg-admin-id').value.trim()||'admin';
  var pw=$('cfg-admin-pw').value;
  if(pw){ s.adminHash=hash32(pw); }
  saveSettings_(s);
  toast('설정이 저장되었습니다.','ok');
}
function saveSettings_(s){ localStorage.setItem(LS.settings, JSON.stringify(s)); }
async function testGithub(){
  var st=$('github-status'); st.textContent='연결 확인 중...'; st.style.color='#9CA3AF';
  // 입력값 우선 저장
  saveSettings();
  var r=parseRepo();
  if(!r.token){ st.textContent='✗ Token 이 비어 있습니다'; st.style.color='#DC2626'; return; }
  try{
    var res=await gh('GET','https://api.github.com/repos/'+r.owner+'/'+r.repo);
    if(res.status===200){ var j=await res.json(); st.textContent='✓ 연결됨 — '+j.full_name+' (권한 OK)'; st.style.color='#059669'; }
    else if(res.status===404){ st.textContent='✗ 저장소를 찾을 수 없거나 접근 권한이 없습니다'; st.style.color='#DC2626'; }
    else if(res.status===401){ st.textContent='✗ 인증 실패 — Token 을 확인하세요'; st.style.color='#DC2626'; }
    else { st.textContent='✗ 연결 실패 ('+res.status+')'; st.style.color='#DC2626'; }
  }catch(e){ st.textContent='✗ 네트워크 오류: '+e.message; st.style.color='#DC2626'; }
}

/* ----------------------------------------------------------
   13. 모달 공통 / 부트
---------------------------------------------------------- */
function closeModal(id){ var m=$(id); if(m) m.classList.remove('on'); }

async function boot(){
  loadModel();
  renderTextTab();
  showTab('text');
  // 미리보기 자산 로드 후 첫 렌더
  var ok=await loadPreviewAssets();
  if(ok){
    setPreviewStep(1,null,[]);
    if(PV.mode==='src'){
      setTimeout(function(){ toast('인라인 index 감지 — 텍스트는 즉시, 산업·UC는 배포 후 반영됩니다'); }, 800);
    }
  }
}

function bindPreviewBar(){
  document.querySelectorAll('.pv-steps button').forEach(function(b){
    b.onclick=function(){ setPreviewStep(parseInt(b.dataset.s,10), PV.ind, PV.sits); };
  });
  var rl=$('pv-reload'); if(rl) rl.onclick=function(){ composePreview(); };
}

/* ----------------------------------------------------------
   14. 전역 노출 (HTML onclick 연동)
---------------------------------------------------------- */
window.doLogin=doLogin;
window.doLogout=doLogout;
window.showTab=showTab;
window.saveTexts=saveTexts;
window.openIndModal=openIndModal;
window.saveInd=saveInd;
window.openUcModal=openUcModal;
window.saveUc=saveUc;
window.doDeploy=doDeploy;
window.saveSettings=saveSettings;
window.testGithub=testGithub;
window.closeModal=closeModal;
window.renderUcTable=renderUcTable;
window.saveS2=saveS2;

/* ----------------------------------------------------------
   15. 시작
---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function(){
  bindPreviewBar();
  // 로그인 엔터 키
  ['login-id','login-pw'].forEach(function(id){
    var e=$(id); if(e) e.addEventListener('keydown',function(ev){ if(ev.key==='Enter') doLogin(); });
  });
  $('login-error') && $('login-pw') && $('login-pw').addEventListener('input',function(){ $('login-error').classList.remove('on'); });
  // 이미 로그인된 세션이면 바로 진입
  if(sessionStorage.getItem(SS.auth)==='1'){ enterApp(); }
});

})();
