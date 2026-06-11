// ── 유틸 ──────────────────────────────────────────────────
function $(id){ return document.getElementById(id); }

function sitsByTab(ind, tab) {
  var s = [];
  UC.filter(function(u){ return u.ind === ind; }).forEach(function(u){
    var arr = tab==='vod' ? u.sitVod : tab==='live' ? u.sitLive : u.sitBoth;
    arr.forEach(function(x){ if(s.findIndex(function(i){return i.txt===x.txt;})===-1) s.push(x); });
  });
  return s;
}

function sitTab(sit) {
  for(var i=0;i<UC.length;i++){
    var u=UC[i];
    if(u.ind!==st.ind) continue;
    if(u.sitVod.some(function(x){return x.txt===sit;})) return 'vod';
    if(u.sitLive.some(function(x){return x.txt===sit;})) return 'live';
    if(u.sitBoth.some(function(x){return x.txt===sit;})) return 'both';
  }
  return 'vod';
}

function scoreUC(u) {
  if(u.ind !== st.ind) return -1;
  if(st.sits.length > 0) {
    var allSits = u.sitVod.concat(u.sitLive).concat(u.sitBoth).map(function(x){return x.txt;});
    var hasAny = st.sits.some(function(s){ return allSits.indexOf(s) > -1; });
    if(!hasAny) return -1;
  }
  var score = 0;
  st.sits.forEach(function(s){
    var all = u.sitVod.concat(u.sitLive).concat(u.sitBoth).map(function(x){return x.txt;});
    if(all.indexOf(s) > -1) score += 3;
  });
  return score;
}

// ── 진행 표시 ──────────────────────────────────────────────
function updateProg(n) {
  for(var i=1;i<=3;i++){
    var hs=$('hs'+i), pn=$('pn'+i);
    if(!hs||!pn) continue;
    hs.className = i<n ? 'h-step done' : i===n ? 'h-step on' : 'h-step';
    pn.textContent = i<n ? '✓' : i;
  }
}

// ── 컨텍스트 바 ────────────────────────────────────────────
function updateCtx(n) {
  var bar=$('ctx'), chip=$('ctx-chip');
  if(!bar||!chip) return;
  if(!st.ind || n===1) { bar.className='ctx'; return; }
  bar.className='ctx on';
  var ind = INDUSTRIES.filter(function(i){ return i.id===st.ind; })[0];
  if(ind) chip.textContent = ind.label;
}

// ── 탭 전환 ────────────────────────────────────────────────
function switchTab(t) {
  curTab = t;
  ['vod','live','both'].forEach(function(x){
    var tab = x==='vod'?$('tv'):x==='live'?$('tl'):$('tb');
    var desc = x==='vod'?$('dv'):x==='live'?$('dl'):$('db');
    var panel = x==='vod'?$('pv'):x==='live'?$('pl'):$('pb');
    if(tab) tab.className = 'tab '+x+(x===t?' on':'');
    if(desc) desc.className = 'mdesc '+x+(x===t?' on':'');
    if(panel) panel.className = 'sit-panel'+(x===t?' on':'');
  });
}

// ── 탭 카운트 ──────────────────────────────────────────────
function updateCounts() {
  if(!st.ind) return;
  ['vod','live','both'].forEach(function(t){
    var el = t==='vod'?$('cv'):t==='live'?$('cl'):$('cb');
    if(el) el.textContent = sitsByTab(st.ind, t).length;
  });
}

// ── 선택 strip ─────────────────────────────────────────────


function updateStrip() {
  var el=$('strip');
  if(!el) return;
  while(el.firstChild) el.removeChild(el.firstChild);
  if(!st.sits.length) {
    var none=document.createElement('span');
    none.className='strip-none';
    none.textContent='아직 선택한 상황이 없습니다';
    el.appendChild(none);
    return;
  }
  // 탭별 그룹화
  var groups = { vod:[], live:[], both:[] };
  st.sits.forEach(function(s){
    var t = sitTab(s);
    if(groups[t]) groups[t].push(s);
  });
  var tabInfo = {
    vod:  { label:'VOD',      cls:'vod'  },
    live: { label:'LIVE',     cls:'live' },
    both: { label:'VOD+LIVE', cls:'both' }
  };
  ['vod','live','both'].forEach(function(t){
    if(!groups[t].length) return;
    // 탭 라벨 뱃지
    var badge = document.createElement('span');
    badge.className = 'strip-tab-badge ' + t;
    badge.textContent = tabInfo[t].label;
    el.appendChild(badge);
    // 항목 pill들
    groups[t].forEach(function(s){
      var pill = document.createElement('span');
      pill.className = 'spill ' + t;
      var txt = document.createElement('span');
      txt.textContent = s;
      var x = document.createElement('span');
      x.className = 'spill-x';
      x.textContent = '×';
      (function(sit){ x.onclick = function(){ removeSit(sit); }; })(s);
      pill.appendChild(txt);
      pill.appendChild(x);
      el.appendChild(pill);
    });
    // 구분선 (마지막 그룹 제외)
    var sep = document.createElement('span');
    sep.className = 'strip-sep';
    el.appendChild(sep);
  });
  // 마지막 구분선 제거
  var lastChild = el.lastChild;
  if(lastChild && lastChild.className === 'strip-sep') el.removeChild(lastChild);
}

function removeSit(s) {
  var idx=st.sits.indexOf(s);
  if(idx>-1) st.sits.splice(idx,1);
  renderS2();
  if($('btn2')) $('btn2').disabled = st.sits.length===0;
}

// ── 상황 항목 빌드 ─────────────────────────────────────────
function buildSit(sitObj) {
  var s = sitObj.txt;
  var cat = sitObj.cat;
  var t = sitTab(s);
  var isSel = st.sits.indexOf(s) > -1;
  var catColors = {'보안':'#EF4444','스트리밍':'#3B82F6','플레이어':'#8B5CF6','데이터/개발':'#059669'};
  var catColor = catColors[cat] || '#94A3B8';
  var el = document.createElement('div');
  el.className = 'sit' + (isSel ? ' '+t : '');
  el.innerHTML = '<div class="sit-box"><svg viewBox="0 0 9 7" fill="none"><polyline points="1,3.5 3.5,6 8,1" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
    + '<span class="sit-txt">'+s+'</span>'
    ;
  el.onclick = function() {
    var idx = st.sits.indexOf(s);
    if(idx > -1) {
      st.sits.splice(idx, 1);
      el.className = 'sit';
    } else {
      st.sits.push(s);
      el.className = 'sit ' + sitTab(s);
    }
    updateStrip();
    if($('btn2')) $('btn2').disabled = st.sits.length === 0;
  };
  return el;
}

// ── Step 2 렌더 ────────────────────────────────────────────
function renderS2() {
  if(!st.ind) return;
  var tabs = ['vod','live','both'];
  var listIds = { vod:'lv', live:'ll', both:'lb' };
  tabs.forEach(function(t){
    var el = $(listIds[t]);
    if(!el) return;
    el.innerHTML = '';
    var sits = sitsByTab(st.ind, t);
    if(!sits.length) {
      var d=document.createElement('div');
      d.className='sit-empty';
      d.textContent = '이 산업에는 해당 상황이 없습니다';
      el.appendChild(d);
    } else {
      var catOrder = ['보안','스트리밍','플레이어','데이터/개발'];
      catOrder.forEach(function(cat){
        var group = sits.filter(function(s){ return s.cat===cat; });
        if(!group.length) return;
        var hd = document.createElement('div');
        var catClass = 'cat-' + cat.replace('/','');
        hd.className = 'sit-cat-hd ' + catClass;
        hd.textContent = cat;
        el.appendChild(hd);
        group.forEach(function(s){ el.appendChild(buildSit(s)); });
      });
    }
  });
  updateCounts();
  updateStrip();
  switchTab(curTab);
  if($('btn2')) $('btn2').disabled = st.sits.length === 0;
}

// ── Step 3 렌더 ────────────────────────────────────────────
function pill(mode) {
  var cls = mode==='vod'?'pv':mode==='live'?'pl':'pb';
  var lbl = mode==='vod'?'VOD':mode==='live'?'LIVE':'VOD+LIVE';
  return '<span class="ac-pill '+cls+'">'+lbl+'</span>';
}

function getDisplayProduct(u) {
  if(u.id==='uc18') {
    var hcs = u.charllaSits && u.charllaSits.some(function(s){ return st.sits.indexOf(s)>-1; }); // charllaSits는 문자열 배열 유지
    return hcs ? '찰나(Charlla)' : 'Kollus Live Commerce';
  }
  return u.product;
}

function buildResultCard(u, i, isTop) {
  var dp = getDisplayProduct(u);
  var allF = [].concat(u.features['보안']||[]).concat(u.features['스트리밍']||[]).concat(u.features['플레이어']||[]).concat(u.features['데이터/개발']||[]).filter(Boolean);
  // 카드에는 상위 6개 태그만 표시
  var topF = allF.slice(0, 6);
  var tagHtml = topF.map(function(f){ return '<span class="rc-tag">'+f+'</span>'; }).join('');
  if(allF.length > 6) tagHtml += '<span class="rc-tag" style="color:var(--gray-400)">+' + (allF.length-6) + '</span>';
  var badge = isTop ? '<span class="rc-badge">추천</span>' : '';
  var cardCls = 'rc' + (isTop ? ' top' : ' rc-rest');
  var modePill = '<span class="rc-pill ' + (u.mode==='vod'?'pv':u.mode==='live'?'pl':'pb') + '">'
    + (u.mode==='vod'?'VOD':u.mode==='live'?'LIVE':'VOD+LIVE') + '</span>';
  return '<div class="'+cardCls+'" onclick="openModal(\''+u.id+'\')">'
    + '<div class="rc-rank">'+(i+1)+'</div>'
    + '<div class="rc-head">' + modePill + badge + '</div>'
    + '<div class="rc-name">'+u.name+'</div>'
    + '<div class="rc-prod">'+dp+'</div>'
    + '<div class="rc-tags">'+tagHtml+'</div>'
    + '<div class="rc-btn">상세보기 →</div>'
  + '</div>';
}

function renderResults() {
  var area = $('results');
  if(!area) return;
  var indLabel = '';
  var indObj = INDUSTRIES.filter(function(i){ return i.id===st.ind; })[0];
  if(indObj) indLabel = indObj.label;
  var scored = UC.map(function(u){ return {u:u, s:scoreUC(u)}; })
    .filter(function(x){ return x.s >= 0; })
    .sort(function(a,b){ return b.s - a.s; });
  if(!scored.length) {
    area.innerHTML = '<div style="padding:4rem 2rem;text-align:center;color:var(--gray-400);border:1.5px dashed var(--gray-200);border-radius:var(--r-xl);background:var(--white)">선택한 조건과 일치하는 유스케이스가 없습니다.</div>';
    setInquiry(indObj);
    return;
  }
  var top3 = scored.slice(0, 3);
  var rest = scored.slice(3);
  var html = '<div class="r-meta"><div class="r-dot"></div>' + indLabel + ' 영역에서 <b>' + scored.length + '개</b>의 유스케이스가 매칭되었습니다.</div>';
  html += '<div class="r-sec">추천 매칭 Top ' + Math.min(3, top3.length) + '</div>';
  html += '<div class="rc-grid">';
  top3.forEach(function(x, i){ html += buildResultCard(x.u, i, true); });
  html += '</div>';
  if(rest.length) {
    html += '<button class="r-more" id="more-btn" onclick="toggleMore()">▾ 그 외 '+rest.length+'개 유스케이스 더 보기</button>';
    html += '<div class="r-rest" id="r-rest"><div class="rc-grid rest-grid">';
    rest.forEach(function(x, i){ html += buildResultCard(x.u, i+3, false); });
    html += '</div></div>';
  }
  area.innerHTML = html;
  setInquiry(indObj);
}

function setInquiry(ind2) {
  if(!ind2) { var tmp=INDUSTRIES.filter(function(i){ return i.id===st.ind; })[0]; if(tmp) ind2=tmp; }
  var sitGroups = { vod:[], live:[], both:[] };
  st.sits.forEach(function(s){ var t=sitTab(s); if(sitGroups[t]) sitGroups[t].push(s); });
  var sitLines = '';
  if(sitGroups.vod.length)  sitLines += '[VOD]\n'  + sitGroups.vod.map(function(s){ return '- '+s; }).join('\n') + '\n\n';
  if(sitGroups.live.length) sitLines += '[LIVE]\n' + sitGroups.live.map(function(s){ return '- '+s; }).join('\n') + '\n\n';
  if(sitGroups.both.length) sitLines += '[VOD+LIVE]\n' + sitGroups.both.map(function(s){ return '- '+s; }).join('\n') + '\n\n';
  if(!sitLines) sitLines = '(선택 없음)\n';
  var pre = '[선택 산업]\n'+(ind2?ind2.label:'')+' \n\n[선택 상황 / 니즈]\n'+sitLines.trim();
  var pe=$('pre-txt'); if(pe) pe.textContent=pre;
  var inqEl=$('inq'); if(inqEl) inqEl.classList.add('on');
}

function openModal(ucId) {
  var u = UC.filter(function(x){ return x.id===ucId; })[0];
  if(!u) return;
  var dp = getDisplayProduct(u);
  // 순위 계산
  var scored = UC.map(function(x){ return {u:x, s:scoreUC(x)}; })
    .filter(function(x){ return x.s >= 0; })
    .sort(function(a,b){ return b.s - a.s; });
  var rank = scored.findIndex(function(x){ return x.u.id===ucId; }) + 1;
  var isTop = rank <= 3;
  var modePill = '<span class="rc-pill ' + (u.mode==='vod'?'pv':u.mode==='live'?'pl':'pb') + '" style="font-size:11px;padding:3px 10px">'
    + (u.mode==='vod'?'VOD':u.mode==='live'?'LIVE':'VOD+LIVE') + '</span>';
  // 헤더
  var metaHtml = '<span class="mo-rank' + (isTop?'':' rest') + '">' + rank + '</span>'
    + modePill
    + (isTop ? '<span class="mo-badge">추천</span>' : '');
  $('mo-meta').innerHTML = metaHtml;
  $('mo-title').textContent = u.name;
  $('mo-prod').textContent = dp;
  // 본문
  var featCats = ['보안','스트리밍','플레이어','데이터/개발'];
  var featHtml = '<div class="mo-feat-grid">';
  featCats.forEach(function(cat){
    var items = u.features[cat] || [];
    if(!items.length) return;
    featHtml += '<div class="mo-feat-group">'
      + '<div class="mo-feat-cat">' + cat + '</div>'
      + '<div class="mo-feat-tags">'
      + items.map(function(f){ return '<span class="mo-feat-tag">'+f+'</span>'; }).join('')
      + '</div></div>';
  });
  featHtml += '</div>';
  $('mo-body').innerHTML =
    '<div class="mo-section">'
    + '<div class="mo-lbl">고객 상황</div>'
    + '<div class="mo-txt">' + u.situation + '</div>'
    + '</div>'
    + '<div class="mo-section">'
    + '<div class="mo-lbl">콜러스가 제공하는 가치</div>'
    + '<div class="mo-pos">' + u.position + '</div>'
    + '</div>'
    + '<div class="mo-section">'
    + '<div class="mo-lbl">제공 기능</div>'
    + featHtml
    + '</div>'
    + '<div class="mo-section">'
    + '<div class="mo-lbl">주요 고객사</div>'
    + '<div class="mo-cust">' + u.customers + '</div>'
    + '</div>';
  var ov = $('mo-overlay');
  ov.classList.add('on');
  document.body.classList.add('mo-open');
  document.documentElement.classList.add('mo-open');
}

function closeModal(e) {
  if(e && e.target !== $('mo-overlay')) return;
  var ov = $('mo-overlay');
  ov.classList.remove('on');
  document.body.classList.remove('mo-open');
  document.documentElement.classList.remove('mo-open');
}

// ESC key to close modal
document.addEventListener('keydown', function(e){
  if(e.key==='Escape') closeModal(null);
});

function toggleMore() {
  var el=$('r-rest'), btn=$('more-btn');
  if(!el||!btn) return;
  var isOpen = el.classList.contains('on');
  el.classList.toggle('on', !isOpen);
  var inner = el.querySelector('.rc-grid');
  var n = inner ? inner.querySelectorAll('.rc').length : 0;
  btn.textContent = isOpen ? '▾ 그 외 '+n+'개 유스케이스 더 보기' : '▴ 접기';
}

// ── Step 이동 ──────────────────────────────────────────────
function go(n) {
  for(var i=1;i<=3;i++){
    var el=$('s'+i);
    if(el) el.className = 'step' + (i===n ? ' on' : '');
  }
  updateProg(n);
  updateCtx(n);
  if(n===2) renderS2();
  if(n===3) { showAiLoading(); var s3=document.getElementById('s3'); if(s3) s3.scrollIntoView({behavior:'smooth',block:'start'}); }
  if(n!==3) { var inqEl=$('inq'); if(inqEl) inqEl.classList.remove('on'); }
}

// ── Step 1 렌더 ────────────────────────────────────────────
function renderS1() {
  var grid=$('ind-grid');
  if(!grid) return;
  grid.innerHTML='';
  INDUSTRIES.forEach(function(ind){
    var el=document.createElement('div');
    el.className='ind-card'+(st.ind===ind.id?' sel':'');
    el.innerHTML='<span class="ic">'+IND_ICONS[ind.id]+'</span>'
      +'<span class="lb">'+ind.label+'</span>'
      +'<div class="ind-chk">✓</div>';
    el.onclick=function(){
      st.ind=ind.id; st.sits=[];
      document.querySelectorAll('.ind-card').forEach(function(c){ c.classList.remove('sel'); });
      el.classList.add('sel');
      setTimeout(function(){ go(2); }, 180);
    };
    grid.appendChild(el);
  });
}

// ── 초기화 함수들 ──────────────────────────────────────────
function clearSits() {
  st.sits=[];
  curTab='vod';
  renderS2();
}

function resetPipedriveForm() {
  var wrap = document.querySelector('.pd-wrap');
  if(!wrap) return;
  var url = 'https://webforms.pipedrive.com/f/1tgdA9o87kotVaCRBf8cDwNi0X9oUUMVHOWcVzKi1KgnqdCbGH0spcWwxsQPufFfB';
  wrap.innerHTML = '<div class="pipedriveWebForms" data-pd-webforms="'+url+'"></div>';
  var s = document.createElement('script');
  s.src = 'https://webforms.pipedrive.com/f/loader';
  s.onload = function(){};
  wrap.appendChild(s);
}

function reset() {
  st={ind:null,sits:[]};
  curTab='vod';
  var inqEl=$('inq'); if(inqEl) inqEl.classList.remove('on');
  var ctx=$('ctx'); if(ctx) ctx.className='ctx';
  resetPipedriveForm();
  renderS1();
  window.scrollTo(0,0);
  go(1);
}

function copyPre() {
  var el=$('pre-txt');
  if(!el) return;
  navigator.clipboard.writeText(el.textContent).then(function(){
    var ok=$('pre-ok'); if(ok){ok.style.display='block'; setTimeout(function(){ok.style.display='none';},2500);}
  }).catch(function(){
    var r=document.createRange(); r.selectNode(el);
    window.getSelection().removeAllRanges(); window.getSelection().addRange(r);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    var ok=$('pre-ok'); if(ok){ok.style.display='block'; setTimeout(function(){ok.style.display='none';},2500);}
  });
}

// ── 시작 ──────────────────────────────────────────────────
(function(){
  function init(){
  // ── SF_TEXTS 반영 ──────────────────────────────────────
  if (typeof SF_TEXTS !== 'undefined') {
    var sfMap = {
      'sf-heroTitle':'heroTitle','sf-heroDesc':'heroDesc',
      'sf-step1Title':'step1Title','sf-step1Sub':'step1Sub',
      'sf-step2Title':'step2Title','sf-step2Sub':'step2Sub',
      'sf-step3Title':'step3Title','sf-step3Sub':'step3Sub',
      'sf-inqTitle':'inqTitle'
    };
    Object.keys(sfMap).forEach(function(id) {
      var el = document.getElementById(id);
      var val = SF_TEXTS[sfMap[id]];
      if (el && val) el.innerHTML = val;
    });
  }
    var g=$('ind-grid');
    if(!g){ setTimeout(init,50); return; }
    window.scrollTo(0,0);
    renderS1();
    go(1);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
// ── AI 로딩 + Gemini 연동 ───────────────────────────────────
function showAiLoading() {
  var area = $('results');
  if(!area) return;
  area.innerHTML =
    '<div class="ai-summary-box" id="ai-box">' +
      '<div class="ai-headline">담당자님을 위한 동영상 솔루션 매칭 결과가 나왔어요!</div>' +
      '<div id="ai-loading-wrap">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
          '<div class="ai-spinner"></div>' +
          '<span style="font-size:16px;font-weight:700;color:#1E40AF">산업분야 및 조건 분석 중</span>' +
        '</div>' +
        '<div style="font-size:13px;color:#3B82F6;padding-left:26px">담당자님의 분야와 필요한 조건에 맞는 솔루션을 찾고 있습니다.</div>' +
      '</div>' +
      '<div id="ai-result-text" style="display:none">' +
        '<div id="ai-title-text" style="font-size:17px;font-weight:700;color:#1E40AF;line-height:1.4;margin-bottom:.625rem"></div>' +
        '<div id="ai-body-text" style="font-size:14px;color:#1E3A5F;line-height:1.85"></div>' +
      '</div>' +
    '</div>' +
    '<div id="result-cards" style="display:none"></div>';

  var indObj = INDUSTRIES.filter(function(i){ return i.id===st.ind; })[0];

  if(typeof callGemini === 'function') {
    callGemini(
      indObj ? indObj.label : '',
      st.sits,
      function(title, body) {
        $('ai-loading-wrap').style.display = 'none';
        $('ai-result-text').style.display = 'block';
        typeAiText($('ai-title-text'), title, function() {
          typeAiText($('ai-body-text'), body, function() {
            renderResultCards(indObj);
          });
        });
      },
      function() {
        $('ai-loading-wrap').style.display = 'none';
        $('ai-result-text').style.display = 'block';
        $('ai-title-text').textContent = '선택하신 조건에 맞는 솔루션을 찾았습니다.';
        renderResultCards(indObj);
      }
    );
  } else {
    setTimeout(function() {
      $('ai-loading-wrap').style.display = 'none';
      $('ai-result-text').style.display = 'block';
      $('ai-title-text').textContent = '선택하신 조건에 맞는 솔루션을 찾았습니다.';
      renderResultCards(indObj);
    }, 1500);
  }
}

function typeAiText(el, text, cb) {
  if(!el || !text) { if(cb) cb(); return; }
  var i = 0;
  el.textContent = '';
  var iv = setInterval(function() {
    i += 4;
    el.textContent = text.slice(0, i) + (i < text.length ? '▍' : '');
    if(i >= text.length) { clearInterval(iv); el.textContent = text; if(cb) cb(); }
  }, 16);
}

function renderResultCards(indObj) {
  var cardsArea = $('result-cards');
  if(!cardsArea) return;
  var indLabel = indObj ? indObj.label : '';
  var scored = UC.map(function(u){ return {u:u, s:scoreUC(u)}; })
    .filter(function(x){ return x.s >= 0; })
    .sort(function(a,b){ return b.s - a.s; });
  if(!scored.length) {
    cardsArea.innerHTML = '<div style="padding:4rem 2rem;text-align:center;color:var(--gray-400);border:1.5px dashed var(--gray-200);border-radius:var(--r-xl)">선택한 조건과 일치하는 유스케이스가 없습니다.</div>';
    cardsArea.style.display = 'block';
    setInquiry(indObj);
    return;
  }
  var top3 = scored.slice(0, 3);
  var rest = scored.slice(3);
  var html = '<div class="r-meta"><div class="r-dot"></div>' + indLabel + ' 영역에서 <b>' + scored.length + '개</b>의 유스케이스가 매칭되었습니다.</div>';
  html += '<div class="r-sec">추천 매칭 Top ' + Math.min(3, top3.length) + '</div>';
  html += '<div class="rc-grid">';
  top3.forEach(function(x, i){ html += buildResultCard(x.u, i, true); });
  html += '</div>';
  if(rest.length) {
    html += '<button class="r-more" id="more-btn" onclick="toggleMore()">▾ 그 외 '+rest.length+'개 유스케이스 더 보기</button>';
    html += '<div class="r-rest" id="r-rest"><div class="rc-grid rest-grid">';
    rest.forEach(function(x, i){ html += buildResultCard(x.u, i+3, false); });
    html += '</div></div>';
  }
  cardsArea.innerHTML = html;
  cardsArea.style.display = 'block';
  setInquiry(indObj);
}
