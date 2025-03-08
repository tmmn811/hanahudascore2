// アプリの状態管理
const state = {
    screen: 'top',       // 'top' | 'player1' | 'player2' | 'game' | 'result'
    mode: null,          // 6 or 12
    player1: '',
    player2: '',
    currentMonth: 1,     // 1 〜 mode
    scores: [],          // [ {winner: 0 or 1, score: number}, ... ]
    selectedWinner: null,
    tempScore: ''
  };
  
  const app = document.getElementById('app');
  
  // 月名が背景に含まれるのでテキスト表示はしない
  // 画像は1.png, 2.png ... 12.png
  function setMonthBackground(month) {
    // month: 1〜12
    document.body.style.backgroundImage = `url('assets/images/${month}.png')`;
  }
  
  // 各プレイヤーの合計得点を返す
  function getTotals() {
    let total1 = 0, total2 = 0;
    state.scores.forEach((entry, idx) => {
      if (entry) {
        if (entry.winner === 0) total1 += entry.score;
        else total2 += entry.score;
      }
    });
    return [total1, total2];
  }
  
  function render() {
    switch (state.screen) {
      case 'top':
        renderTopScreen();
        break;
      case 'player1':
        renderPlayer1Screen();
        break;
      case 'player2':
        renderPlayer2Screen();
        break;
      case 'game':
        renderGameScreen();
        break;
      case 'result':
        renderResultScreen();
        break;
    }
  }
  
  // トップ画面
  function renderTopScreen() {
    // 背景をbasic.pngに
    document.body.style.backgroundImage = "url('assets/images/basic.png')";
    app.innerHTML = `
      <div class="screen">
        <h1 class="title">花札得点帳</h1>
        <button class="button btn-6" id="btn6">六ヶ月</button>
        <button class="button btn-12" id="btn12">十二ヶ月</button>
      </div>
    `;
    document.getElementById('btn6').onclick = () => {
      state.mode = 6;
      state.scores = Array(6).fill(null);
      state.screen = 'player1';
      render();
    };
    document.getElementById('btn12').onclick = () => {
      state.mode = 12;
      state.scores = Array(12).fill(null);
      state.screen = 'player1';
      render();
    };
  }
  
  // 一人目入力
  function renderPlayer1Screen() {
    // 背景はbasic.png
    document.body.style.backgroundImage = "url('assets/images/basic.png')";
    app.innerHTML = `
      <div class="screen">
        <h2 class="subtitle">一人目の名前</h2>
        <input type="text" class="input-field" id="p1Input" placeholder="一人目の名前を入力" />
        <br/>
        <button class="button" id="nextBtn">次へ</button>
        <button class="button" id="backBtn">戻る</button>
      </div>
    `;
    document.getElementById('nextBtn').onclick = () => {
      const val = document.getElementById('p1Input').value.trim();
      state.player1 = val || '一人目';
      state.screen = 'player2';
      render();
    };
    document.getElementById('backBtn').onclick = () => {
      state.screen = 'top';
      render();
    };
  }
  
  // 二人目入力
  function renderPlayer2Screen() {
    // 背景はbasic.png
    document.body.style.backgroundImage = "url('assets/images/basic.png')";
    app.innerHTML = `
      <div class="screen">
        <h2 class="subtitle">二人目の名前</h2>
        <input type="text" class="input-field" id="p2Input" placeholder="二人目の名前を入力" />
        <br/>
        <button class="button" id="startBtn">対局開始</button>
        <button class="button" id="backBtn">戻る</button>
      </div>
    `;
    document.getElementById('startBtn').onclick = () => {
      const val = document.getElementById('p2Input').value.trim();
      state.player2 = val || '二人目';
      state.currentMonth = 1;
      state.screen = 'game';
      render();
    };
    document.getElementById('backBtn').onclick = () => {
      state.screen = 'player1';
      render();
    };
  }
  
  // ゲーム画面：勝者選択 → テンキー入力
  function renderGameScreen() {
    if (state.currentMonth > state.mode) {
      state.screen = 'result';
      render();
      return;
    }
    // 月ごとの背景に切り替え
    setMonthBackground(state.currentMonth);
  
    // 前月までの合計得点
    const [total1, total2] = getTotals();
  
    app.innerHTML = `
      <div class="screen">
        <!-- 月名は背景に描かれているので非表示 -->
        <div class="score-info">
          <p>${state.player1}：${total1}点</p>
          <p>${state.player2}：${total2}点</p>
        </div>
        <p>勝者を選択</p>
        <div>
          <button class="button winner-btn" id="winner1">${state.player1}</button>
          <button class="button winner-btn" id="winner2">${state.player2}</button>
        </div>
        <div id="scoreSection" style="display: none; margin-top: 10px;">
          <p>得点入力</p>
          <div class="display-score" id="scoreDisplay">0</div>
          <div class="keypad" id="keypad"></div>
          <button class="button" id="delBtn">消去</button>
          <button class="button" id="okBtn">入力完了</button>
        </div>
        <button class="button" id="backBtn" style="margin-top:10px;">戻る</button>
      </div>
    `;
  
    // 戻るボタン
    document.getElementById('backBtn').onclick = () => {
      if (state.currentMonth === 1) {
        state.screen = 'player2';
      } else {
        // 1ヶ月戻る
        state.currentMonth--;
        state.scores[state.currentMonth - 1] = null;
      }
      state.tempScore = '';
      state.selectedWinner = null;
      render();
    };
  
    // 勝者選択
    document.getElementById('winner1').onclick = () => {
      state.selectedWinner = 0;
      showScoreInput();
    };
    document.getElementById('winner2').onclick = () => {
      state.selectedWinner = 1;
      showScoreInput();
    };
  }
  
  // 勝者選択後にテンキー表示
  function showScoreInput() {
    const scoreSection = document.getElementById('scoreSection');
    scoreSection.style.display = 'block';
    renderKeypad();
  }
  
  // テンキーを漢数字にする
  function renderKeypad() {
    const keypad = document.getElementById('keypad');
    keypad.innerHTML = '';
    const kanjiNums = [
      { label: '一', val: '1' },
      { label: '二', val: '2' },
      { label: '三', val: '3' },
      { label: '四', val: '4' },
      { label: '五', val: '5' },
      { label: '六', val: '6' },
      { label: '七', val: '7' },
      { label: '八', val: '8' },
      { label: '九', val: '9' },
      { label: '零', val: '0' }
    ];
  
    kanjiNums.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'key-btn';
      btn.textContent = item.label;
      btn.onclick = () => {
        state.tempScore += item.val;
        updateScoreDisplay();
      };
      keypad.appendChild(btn);
    });
  
    // イベントリスナー
    document.getElementById('delBtn').onclick = () => {
      state.tempScore = state.tempScore.slice(0, -1);
      updateScoreDisplay();
    };
    document.getElementById('okBtn').onclick = () => {
      if (state.tempScore) {
        state.scores[state.currentMonth - 1] = {
          winner: state.selectedWinner,
          score: parseInt(state.tempScore, 10)
        };
        state.tempScore = '';
        state.selectedWinner = null;
        state.currentMonth++;
        render();
      }
    };
  }
  
  function updateScoreDisplay() {
    document.getElementById('scoreDisplay').textContent = toKanji(state.tempScore);
  }
  
  // 簡易的な漢数字変換（各桁を置き換えるのみ）
  function toKanji(numStr) {
    const map = {
      '0': '零','1': '一','2': '二','3': '三','4': '四',
      '5': '五','6': '六','7': '七','8': '八','9': '九'
    };
    return numStr.split('').map(d => map[d] || d).join('');
  }
  
  // 結果画面
  function renderResultScreen() {
    // 最終合計
    const [total1, total2] = getTotals();
    // 背景はbasic.png
    document.body.style.backgroundImage = "url('assets/images/basic.png')";
    app.innerHTML = `
      <div class="screen">
        <h2 class="subtitle">対戦結果</h2>
        <p>${state.player1}：${total1}点</p>
        <p>${state.player2}：${total2}点</p>
        <button class="button" id="endBtn" style="margin-top:10px;">対局終了</button>
      </div>
    `;
    document.getElementById('endBtn').onclick = () => {
      // 全部リセットしてトップに戻る
      state.screen = 'top';
      state.mode = null;
      state.player1 = '';
      state.player2 = '';
      state.currentMonth = 1;
      state.scores = [];
      state.tempScore = '';
      render();
    };
  }
  
  // 初期表示
  render();
  