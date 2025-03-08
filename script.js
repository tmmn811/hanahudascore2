// シンプルなSPA風実装

// アプリ状態管理
const state = {
    screen: 'top',  // top, player, game, result
    mode: null,     // 6または12
    players: ['', ''],
    currentScreenIndex: 0, // プレイヤー入力: 0=player1, 1=player2
    currentMonth: 0,
    scores: [], // 各月の {winner: 0 or 1, score: 数値}
    tempScore: '' // 入力中の得点（文字列）
  };
  
  const monthsAll = ["睦月", "如月", "弥生", "卯月", "皐月", "水無月", "文月", "葉月", "長月", "神無月", "霜月", "師走"];
  
  // DOM操作ヘルパー
  const appDiv = document.getElementById('app');
  
  function render() {
    // 画面ごとにレンダリング
    switch(state.screen) {
      case 'top':
        renderTopScreen();
        break;
      case 'player':
        renderPlayerScreen();
        break;
      case 'game':
        renderGameScreen();
        break;
      case 'result':
        renderResultScreen();
        break;
      default:
        appDiv.innerHTML = '<div class="screen">Unknown Screen</div>';
    }
  }
  
  // トップ画面：6ヶ月 or 12ヶ月選択
  function renderTopScreen() {
    appDiv.innerHTML = `
      <div class="screen">
        <h1>花札得点記録</h1>
        <p>モードを選択してください</p>
        <button class="button" id="mode6">六ヶ月</button>
        <button class="button" id="mode12">十二ヶ月</button>
      </div>
    `;
    document.getElementById('mode6').addEventListener('click', () => {
      state.mode = 6;
      // 使用する月は最初6ヶ月
      state.scores = Array(6).fill(null);
      state.screen = 'player';
      render();
    });
    document.getElementById('mode12').addEventListener('click', () => {
      state.mode = 12;
      state.scores = Array(12).fill(null);
      state.screen = 'player';
      render();
    });
  }
  
  // プレイヤー名入力画面
  function renderPlayerScreen() {
    // プレイヤー1とプレイヤー2を入力
    appDiv.innerHTML = `
      <div class="screen">
        <h2>プレイヤー名を入力</h2>
        <input id="player1" type="text" placeholder="プレイヤー1" value="${state.players[0]}" style="font-size:1.2em; padding:8px; margin:8px; width:80%;">
        <input id="player2" type="text" placeholder="プレイヤー2" value="${state.players[1]}" style="font-size:1.2em; padding:8px; margin:8px; width:80%;">
        <br>
        <button class="button" id="toGame">対局開始</button>
      </div>
    `;
    document.getElementById('toGame').addEventListener('click', () => {
      state.players[0] = document.getElementById('player1').value || 'プレイヤー1';
      state.players[1] = document.getElementById('player2').value || 'プレイヤー2';
      state.screen = 'game';
      state.currentMonth = 0;
      render();
    });
  }
  
  // ゲーム画面：各月の勝者選択と得点入力
  function renderGameScreen() {
    if (state.currentMonth >= state.mode) {
      state.screen = 'result';
      render();
      return;
    }
    // 背景画像を月ごとに変更（assets/images/1.png など）
    document.body.style.backgroundImage = `url('assets/images/${state.currentMonth + 1}.png')`;
  
    // 勝者選択画面と得点入力画面を一画面にまとめる
    appDiv.innerHTML = `
      <div class="screen">
        <h2>${monthsAll[state.currentMonth]}</h2>
        <div id="winnerSelect">
          <p>勝者を選択してください</p>
          <button class="button" id="winner0">${state.players[0]}</button>
          <button class="button" id="winner1">${state.players[1]}</button>
        </div>
        <div id="scoreInput" style="display:none;">
          <p>得点入力</p>
          <div class="display" id="scoreDisplay">${state.tempScore || '0'}</div>
          <div class="keypad" id="keypad"></div>
          <button class="button" id="deleteBtn">消去</button>
          <button class="button" id="submitScore">入力完了</button>
        </div>
        <button class="button" id="backBtn">戻る</button>
      </div>
    `;
  
    // 戻るボタン：前の月またはプレイヤー入力に戻る
    document.getElementById('backBtn').addEventListener('click', () => {
      if(state.currentMonth === 0) {
        state.screen = 'player';
      } else {
        // 前の月に戻る
        state.currentMonth--;
        state.scores[state.currentMonth] = null;
      }
      state.tempScore = '';
      render();
    });
  
    // 勝者選択
    document.getElementById('winner0').addEventListener('click', () => {
      selectWinner(0);
    });
    document.getElementById('winner1').addEventListener('click', () => {
      selectWinner(1);
    });
  }
  
  // 勝者選択後、得点入力画面へ切替え
  function selectWinner(winnerIndex) {
    state.selectedWinner = winnerIndex;
    document.getElementById('winnerSelect').style.display = 'none';
    document.getElementById('scoreInput').style.display = 'block';
    renderKeypad();
  }
  
  // テンキー表示
  function renderKeypad() {
    const keypadDiv = document.getElementById('keypad');
    keypadDiv.innerHTML = ''; // 初期化
    // 漢数字対応（内部はアラビア数字扱い）
    const numbers = [
      { label: '一', value: '1' },
      { label: '二', value: '2' },
      { label: '三', value: '3' },
      { label: '四', value: '4' },
      { label: '五', value: '5' },
      { label: '六', value: '6' },
      { label: '七', value: '7' },
      { label: '八', value: '8' },
      { label: '九', value: '9' },
      { label: '零', value: '0' }
    ];
    numbers.forEach(num => {
      const btn = document.createElement('button');
      btn.className = 'button';
      btn.textContent = num.label;
      btn.addEventListener('click', () => {
        state.tempScore += num.value;
        updateScoreDisplay();
      });
      keypadDiv.appendChild(btn);
    });
  }
  
  // 得点表示更新
  function updateScoreDisplay() {
    document.getElementById('scoreDisplay').textContent = formatToKanji(state.tempScore);
  }
  
  // 送信時処理：得点確定し次月へ
  document.addEventListener('click', function(e) {
    if(e.target && e.target.id === 'submitScore') {
      if(state.tempScore !== '') {
        // 保存：数値に変換して保存
        state.scores[state.currentMonth] = {
          winner: state.selectedWinner,
          score: parseInt(state.tempScore, 10)
        };
        // 次の月へ
        state.currentMonth++;
        state.tempScore = '';
        state.selectedWinner = null;
        render();
      }
    }
  });
  
  // 消去ボタン処理
  document.addEventListener('click', function(e) {
    if(e.target && e.target.id === 'deleteBtn') {
      state.tempScore = state.tempScore.slice(0, -1);
      updateScoreDisplay();
    }
  });
  
  // 結果表示画面
  function renderResultScreen() {
    // 全月の合計得点を計算
    let totals = [0, 0];
    state.scores.forEach(entry => {
      if(entry) totals[entry.winner] += entry.score;
    });
    // 背景は基本画像
    document.body.style.backgroundImage = "url('assets/images/basic.png')";
    appDiv.innerHTML = `
      <div class="screen">
        <h2>対戦結果</h2>
        <p>${state.players[0]}: ${totals[0]}点</p>
        <p>${state.players[1]}: ${totals[1]}点</p>
        <button class="button" id="restart">対局終了</button>
      </div>
    `;
    document.getElementById('restart').addEventListener('click', () => {
      // リセットしてトップ画面へ
      state.screen = 'top';
      state.mode = null;
      state.players = ['', ''];
      state.currentMonth = 0;
      state.scores = [];
      state.tempScore = '';
      document.body.style.backgroundImage = "url('assets/images/basic.png')";
      render();
    });
  }
  
  // 漢数字変換（単純実装：各桁を対応する漢数字に置換）
  function formatToKanji(numStr) {
    const map = { '0': '零', '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九' };
    // 複雑な桁数表記は今回簡易的に、各桁ごとに漢数字に置換
    return numStr.split('').map(d => map[d] || d).join('');
  }
  
  // 初回レンダリング
  render();
  