// ── Gemini API ─────────────────────────────────────────────
var GEMINI_KEYS = [
  'AQ.Ab8RN6JJNpr4KTgoJWANqUlpZvDxD353LGOJRN6HMWPoIrH55w',
  'AQ.Ab8RN6L0PvpPhK0pbWEXF1QNsvjCht4K1BlMMrgTEK9et52XmQ'
];

function buildPrompt(industry, sits) {
  return '당신은 콜러스(Kollus) 동영상 솔루션 전문가입니다.\n' +
    '아래 고객이 선택한 조건을 바탕으로 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.\n\n' +
    '응답 형식:\n' +
    '{"title": "50자 이내 핵심 고민 요약", "body": "200자 이내 상황 설명"}\n\n' +
    '[선택 산업] ' + industry + '\n' +
    '[선택 조건] ' + sits.join(', ') + '\n\n' +
    '규칙:\n' +
    '- title: 고객의 핵심 고민을 50자 이내로 압축한 문장\n' +
    '- body: 고객 상황을 200자 이내로 설명. 권유/추천 문구 없이 현황만 서술';
}

function callGemini(industry, sits, onSuccess, onError) {
  var prompt = buildPrompt(industry, sits);
  var tried = 0;

  function tryKey(index) {
    tried++;
    var key = GEMINI_KEYS[index];
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 300 }
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      try {
        var raw = data.candidates[0].content.parts[0].text.trim();
        var clean = raw.replace(/```json|```/g, '').trim();
        var parsed = JSON.parse(clean);
        onSuccess(parsed.title || '', parsed.body || '');
      } catch(e) {
        if(tried < GEMINI_KEYS.length) {
          tryKey((index + 1) % GEMINI_KEYS.length);
        } else {
          onError(e);
        }
      }
    })
    .catch(function(e) {
      if(tried < GEMINI_KEYS.length) {
        tryKey((index + 1) % GEMINI_KEYS.length);
      } else {
        onError(e);
      }
    });
  }

  tryKey(0);
}
