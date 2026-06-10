// ── Gemini API ─────────────────────────────────────────────
var GEMINI_KEYS = [
  'AQ.Ab8RN6Jv2gxYm3Ql3k28Z_MVUJf2OCYLKSl9G5uC5U9kuUf4_w',
  'AQ.Ab8RN6LHkvMm3A3FvKxi3U2zmfxO1Rnp7idts1KyRpclCzx0hw'
];
var geminiKeyIndex = 0;

function getGeminiKey() {
  var key = GEMINI_KEYS[geminiKeyIndex];
  geminiKeyIndex = (geminiKeyIndex + 1) % GEMINI_KEYS.length;
  return key;
}

function buildPrompt(industry, sits) {
  return '당신은 콜러스(Kollus) 동영상 솔루션 전문가입니다.\n' +
    '아래 고객이 선택한 조건을 바탕으로 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.\n\n' +
    '응답 형식:\n' +
    '{"title": "50자 이내 핵심 고민 요약", "body": "200자 이내 상황 설명"}\n\n' +
    '[선택 산업] ' + industry + '\n' +
    '[선택 조건] ' + sits.join(', ') + '\n\n' +
    '- title: 고객의 핵심 고민을 50자 이내로 압축한 문장\n' +
    '- body: 고객 상황을 200자 이내로 설명 (권유/추천 문구 없이 현황만)';
}

function callGemini(industry, sits, onSuccess, onError) {
  var prompt = buildPrompt(industry, sits);
  var key = getGeminiKey();
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
      // 파싱 실패 시 첫 번째 키로 재시도
      if (geminiKeyIndex !== 0) {
        geminiKeyIndex = 0;
        callGemini(industry, sits, onSuccess, onError);
      } else {
        onError(e);
      }
    }
  })
  .catch(function(e) {
    // 네트워크 오류 시 다른 키로 재시도
    if (geminiKeyIndex !== 0) {
      geminiKeyIndex = 0;
      callGemini(industry, sits, onSuccess, onError);
    } else {
      onError(e);
    }
  });
}
