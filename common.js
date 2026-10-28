// ---------------------------------------------------------------------
// 共用工具：host.html 跟 index.html 都會載入這個檔案。
// 即時連線用的是 Firebase Realtime Database：主持人把目前的遊戲狀態寫進
// 資料庫裡的一個「房間」節點，參與者監聽同一個節點，資料一變就會立刻
// 收到——不需要任何人登入 Firebase 帳號，瀏覽器只要能連上網路就能同步。
//
// 隱私小提醒：下面的 FIREBASE_CONFIG 對應到你自己的 Firebase 專案，
// Realtime Database 的「規則(rules)」目前是開放讀寫（用房間代碼當作唯一
// 防護，概念上跟原本 ntfy.sh 版本一樣——知道代碼才找得到房間）。
// 詳細的建議規則內容在 README 裡。
// ---------------------------------------------------------------------
(function (global) {
  'use strict';

  var CODE_LEN = 6;
  var POINTS_MIN = 500, POINTS_MAX = 1000;
  var TILE_CLASS = ['tile-a', 'tile-b', 'tile-c', 'tile-d'];
  var SHAPE_CLASS = ['shape-tri', 'shape-dia', 'shape-cir', 'shape-sq'];

  // ---- Firebase 設定 ----
  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyCULOYEdD6UizGWKhQTgpKHw98kaB9yODk",
    authDomain: "kahoot-ns.firebaseapp.com",
    databaseURL: "https://kahoot-ns-default-rtdb.firebaseio.com",
    projectId: "kahoot-ns",
    storageBucket: "kahoot-ns.firebasestorage.app",
    messagingSenderId: "216347197052",
    appId: "1:216347197052:web:aac956cc343e3cc900d3f9",
    measurementId: "G-ZE1D6YHGMR"
  };
  // 資料都放在這個路徑前綴底下，跟專案裡其他可能的用途分開
  var ROOT = 'quizArena/rooms/';

  var _app = null;
  function ensureFirebase() {
    if (!_app) _app = global.firebase.initializeApp(FIREBASE_CONFIG);
    return global.firebase.database();
  }
  function roomRef(code) { return ensureFirebase().ref(ROOT + code); }

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

  // 主持人廣播目前完整狀態：覆蓋寫入同一個節點，大家永遠讀到「最新的一份」。
  function publishState(code, stateObj) {
    return roomRef(code).child('state').set(stateObj).catch(function (e) {
      console.warn('publishState failed', e);
    });
  }
  // 訂閱狀態：一連上就會立刻收到目前值（房間不存在時收到 null），
  // 之後每次主持人更新都會再收到一次最新的完整狀態。
  // 回傳一個取消訂閱用的函式。
  function subscribeState(code, cb) {
    var ref = roomRef(code).child('state');
    var handler = ref.on('value', function (snap) { cb(snap.val()); }, function (err) {
      console.warn('subscribeState error', err);
    });
    return function () { try { ref.off('value', handler); } catch (e) {} };
  }

  // 參與者送一則訊息給主持人（加入／作答）。用 push 讓多人同時送出也不會互相覆蓋。
  function sendToHost(code, msg) {
    return roomRef(code).child('inbox').push(msg).catch(function (e) {
      console.warn('sendToHost failed', e);
    });
  }
  // 主持人訂閱收件匣：一連上就會收到目前所有歷史訊息（等同原本 ntfy 版的
  // since=12h 補播機制），之後新送來的訊息會持續即時送達。
  // 回傳一個取消訂閱用的函式。
  function subscribeInbox(code, cb) {
    var ref = roomRef(code).child('inbox');
    var handler = ref.on('child_added', function (snap) { cb(snap.val()); }, function (err) {
      console.warn('subscribeInbox error', err);
    });
    return function () { try { ref.off('child_added', handler); } catch (e) {} };
  }
  // 遊戲結束時清掉這個房間在資料庫裡的資料，避免房間代碼越積越多。
  function deleteRoom(code) {
    return roomRef(code).remove().catch(function (e) { console.warn('deleteRoom failed', e); });
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
    publishState: publishState, subscribeState: subscribeState,
    sendToHost: sendToHost, subscribeInbox: subscribeInbox, deleteRoom: deleteRoom,
    shapeSvg: shapeSvg, questionProgress: questionProgress, computeGain: computeGain,
    leaderboardRows: leaderboardRows, renderTally: renderTally, renderPodium: renderPodium
  };
})(window);
