// ---------------------------------------------------------------------
// 共用工具：host.html 跟 index.html 都會載入這個檔案。
// 即時連線用的是 ntfy.sh（https://ntfy.sh），一個免費、不用註冊帳號的
// 公開推播服務：誰發訊息到某個「頻道」（topic），所有訂閱那個頻道的
// 瀏覽器都會立刻收到。主持人跟參與者只要用同一個頻道，就能即時同步。
//
// 隱私小提醒：ntfy.sh 的頻道基本上是「知道名字就能用」，沒有帳號密碼。
// 下面的 TOPIC_PREFIX 是一串隨機字串，加上 6 位數房間代碼組成頻道名稱，
// 外人要剛好猜到這組字串幾乎不可能，但如果想要更保險，
// 可以把 TOPIC_PREFIX 換成你自己亂打的另一串英數字（部署前改一次就好）。
// ---------------------------------------------------------------------
(function (global) {
  'use strict';

  var CODE_LEN = 6;
  var POINTS_MIN = 500, POINTS_MAX = 1000;
  var TILE_CLASS = ['tile-a', 'tile-b', 'tile-c', 'tile-d'];
  var SHAPE_CLASS = ['shape-tri', 'shape-dia', 'shape-cir', 'shape-sq'];
  var TOPIC_PREFIX = 'wtoquiz-k92jd8f3-'; // 可自行改成其他亂碼字串

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function uid() {
    try { return crypto.randomUUID(); } catch (e) { return 'c' + Date.now() + Math.random().toString(16).slice(2); }
  }
  function getClientId() {
    try {
      var id = sessionStorage.getItem('qa_client_id_v1');
      if (!id) { id = uid(); sessionStorage.setItem('qa_client_id_v1', id); }
      return id;
    } catch (e) { return uid(); }
  }
  function genCode() {
    var c = '';
    for (var i = 0; i < CODE_LEN; i++) c += Math.floor(Math.random() * 10);
    return c;
  }
  function topicFor(code) { return TOPIC_PREFIX + code; }
  function ntfyBase(code) { return 'https://ntfy.sh/' + topicFor(code); }
  function ntfySseUrl(code) { return ntfyBase(code) + '/sse?since=12h'; }

  // 發佈一則訊息到頻道，失敗會自動重試幾次。
  function publish(code, payload) {
    var url = ntfyBase(code);
    var body = JSON.stringify(payload);
    function attempt(triesLeft) {
      return fetch(url, { method: 'POST', body: body }).then(function (r) {
        if (!r.ok) throw new Error('ntfy status ' + r.status);
        return true;
      }).catch(function (err) {
        if (triesLeft <= 0) { console.warn('publish failed', err); return false; }
        return new Promise(function (resolve) { setTimeout(resolve, 700); }).then(function () {
          return attempt(triesLeft - 1);
        });
      });
    }
    return attempt(2);
  }

  // 解析 ntfy 的 SSE event：外層是 ntfy 的信封，真正內容在 .message 裡
  // （我們發佈時把自己的 JSON 又包了一層字串，所以要 parse 兩次）。
  function parseEnvelope(raw) {
    try {
      var envelope = JSON.parse(raw);
      if (!envelope || typeof envelope.message !== 'string') return null;
      return JSON.parse(envelope.message);
    } catch (e) { return null; }
  }

  function shapeSvg(i) { return '<span class="shape ' + SHAPE_CLASS[i] + '" aria-hidden="true"></span>'; }

  function questionProgress(qIndex) {
    var num = 0, total = 0;
    var qs = (global.QUIZ && global.QUIZ.questions) || [];
    for (var i = 0; i < qs.length; i++) {
      if (qs[i].type !== 'announcement') {
        total++;
        if (i <= qIndex) num = total;
      }
    }
    return { num: num, total: total };
  }

  function computeGain(correct, elapsedMs, durationSec) {
    if (!correct) return 0;
    var total = durationSec * 1000;
    var ratio = clamp(1 - elapsedMs / total, 0, 1);
    return Math.round(POINTS_MIN + (POINTS_MAX - POINTS_MIN) * ratio);
  }

  function leaderboardRows(scores, meId, limit) {
    var list = Object.keys(scores || {}).map(function (cid) {
      return { cid: cid, name: scores[cid].name, score: scores[cid].score };
    });
    list.sort(function (a, b) { return b.score - a.score; });
    if (limit) list = list.slice(0, limit);
    var html = '<div class="board">';
    if (!list.length) html += '<p style="color:var(--muted)">還沒有人得分</p>';
    list.forEach(function (row, i) {
      html += '<div class="board-row' + (row.cid === meId ? ' me' : '') + '">' +
        '<span class="rank">#' + (i + 1) + '</span>' +
        '<span class="nm">' + esc(row.name || '玩家') + '</span>' +
        '<span class="sc">' + row.score + '</span>' +
        '</div>';
    });
    html += '</div>';
    return html;
  }

  function renderTally(qIndex, tally) {
    var q = global.QUIZ.questions[qIndex];
    tally = tally || [0, 0, 0, 0];
    var maxN = Math.max(1, tally[0], tally[1], tally[2], tally[3]);
    var html = '<div class="tally">';
    q.options.forEach(function (opt, i) {
      var isCorrect = i === q.correctIndex;
      var w = Math.round(tally[i] / maxN * 100);
      html += '<div class="tally-row">' + shapeSvg(i) +
        '<span style="flex:1;font-weight:600;' + (isCorrect ? 'color:var(--good)' : '') + '">' + esc(opt) + (isCorrect ? ' ✓' : '') + '</span>' +
        '<div class="tally-bar"><div style="width:' + w + '%;background:var(' + (isCorrect ? '--good' : '--accent-soft') + ')"></div></div>' +
        '<span class="tally-n">' + tally[i] + '</span>' +
        '</div>';
    });
    html += '</div>';
    return html;
  }

  function renderPodium(scores, meId) {
    var list = Object.keys(scores || {}).map(function (cid) {
      return { cid: cid, name: scores[cid].name, score: scores[cid].score };
    });
    list.sort(function (a, b) { return b.score - a.score; });
    var top3 = list.slice(0, 3);
    var order = [1, 0, 2];
    var html = '<div class="card stack">' +
      '<p class="eyebrow center" style="width:100%">最終結果</p>' +
      '<h2 class="center">' + esc(global.QUIZ.title) + '</h2>';
    if (top3.length) {
      html += '<div class="podium">';
      order.forEach(function (idx) {
        var row = top3[idx];
        if (!row) return;
        var cls = idx === 0 ? 'n1' : (idx === 1 ? 'n2' : 'n3');
        html += '<div class="step ' + cls + '">' +
          '<div class="nm">' + esc(row.name || '玩家') + '</div>' +
          '<div class="bar">' + (idx + 1) + '</div>' +
          '</div>';
      });
      html += '</div>';
    }
    html += leaderboardRows(scores, meId, 30);
    html += '</div>';
    return html;
  }

  global.QA = {
    CODE_LEN: CODE_LEN, POINTS_MIN: POINTS_MIN, POINTS_MAX: POINTS_MAX,
    TILE_CLASS: TILE_CLASS, SHAPE_CLASS: SHAPE_CLASS,
    esc: esc, clamp: clamp, uid: uid, getClientId: getClientId, genCode: genCode,
    topicFor: topicFor, ntfyBase: ntfyBase, ntfySseUrl: ntfySseUrl,
    publish: publish, parseEnvelope: parseEnvelope, shapeSvg: shapeSvg,
    questionProgress: questionProgress, computeGain: computeGain,
    leaderboardRows: leaderboardRows, renderTally: renderTally, renderPodium: renderPodium
  };
})(window);
