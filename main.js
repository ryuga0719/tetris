/*
 * 定数
 */
// ステージ
var BLOCK_SIZE = 24;		// 1ブロックのサイズ
var BLOCK_RAWS = 22;	// ステージの高さ（20ライン分をステージとして使用し、上下1ラインはあたり判定とブロックコピー用に使用）22列ある
var BLOCK_COLS = 12;	// ステージの幅 12行ある
var SCREEN_WIDTH = BLOCK_SIZE * BLOCK_COLS;	// キャンバスの幅 24 * 12
var SCREEN_HEIGHT = BLOCK_SIZE * BLOCK_RAWS;	// キャンバスの高さ 24 * 22
// ゲームの状態
var GAME = 1;			// ゲーム中
var GAMEOVER = 0;		// ゲームオーバー時
var EFFECT = 2;			// ブロックを消すときのエフェクトモード
// ブロックの状態
var NON_BLOCK = 0;		// ブロックが存在しない
var NORMAL_BLOCK = 1;	// 通常のブロック（動かせる）
var LOCK_BLOCK = 2;		// ロックした（動かせない）ブロック
var CLEAR_BLOCK = 3;	// 消去するブロック（1ライン揃ったとき）
var WALL = 9;			// 壁
// エフェクト
var EFFECT_ANIMATION = 2;	// エフェクト時のちかちかする回数
// 色
var BACK_COLOR = "#ddd";			// 背景色
var GAMEOVER_COLOR = "#fff";			// ゲームオーバー時のブロックの色
var BLOCK_COLOR = "#000";			// 操作ブロックの色
var LOCK_COLOR = "#333";			// ロックしたブロックの色
var WALL_COLOR = "#666";			// 壁の色
var ERROR_COLOR = "#f00";			// エラーブロックの色
var EFFECT_COLOR1 = "#fff";			// エフェクト時の色1
var EFFECT_COLOR2 = "#000";			// エフェクト時の色2
// ゲーム要素
var NEXTLEVEL = 10;					// 次のレベルまでの消去ライン数

/*
 * グローバル変数
 */
var canvas = null;						// キャンバス取得
var g = null;							// コンテキスト取得
var stage = new Array(BLOCK_COLS);	// ゲームのステージ枠（壁の情報のみ、変化しない）BLOCK_COLS数分の空の配列を用意する
var field = new Array(BLOCK_COLS);		// ゲーム中のステージ枠とブロック表示用（変化する）
var bs;								// ブロックサイズ
var speed;							// 落下速度
var frame;							// ゲームフレーム番号
var block = new Array();				// 落ちてくるブロックの種類（７種類）
var oBlock = new Array();				// 操作中のブロック
var blockType;						// ブロックの種類番号
var x, y;								// ブロックの現在位置
var sx, sy;							// ブロックの元位置
var mode;							// ゲームの状態  GAME/GAMEOVER/EFFECT
var timer1;							// ゲームループ用のタイマー
var FPS;								// 描画書き換え速度
var clearLine;							// 消去したライン数
// エフェクト時（色の反転/エフェクトスピード/エフェクト回数）
var effectState = {flipFlop: 0, speed: 0, count: 0};


/*
 * 初期化
 */
 //イニシャル関数 別名初期化関数
function init(){
	clearTimeout(timer1); //setTimeout()でセットしたタイマーを解除する
	FPS = 30;
	clearLine = 0; //消去したライン数リセット
	// キャンバスの設定
	canvas = document.getElementById("canvas"); //id:canvas取得
	canvas.width = SCREEN_WIDTH; //id:canvasの横幅をSCREEN_WIDTHにする。
	canvas.height = SCREEN_HEIGHT; //id:canvasの縦幅をSCREEN_HEIGHTにする。
	g = canvas.getContext("2d");  //canvasの描画機能を有効にする
	// エフェクト設定
	effectState.flipFlop = 0;
	effectState.speed = 4;
	effectState.count = 0;
	// ブロックの設定
	bs = BLOCK_SIZE;
	// ブロックを設定
  //4*4のグリッドの配列を組んでブロックを作る。
  //1のとこが視覚化されたブロック
	block =	 [[	[0, 0, 0, 0],
				[0, 1, 1, 0],
				[0, 1, 1, 0],
				[0, 0, 0, 0]],

			[	[0, 1, 0, 0],
				[0, 1, 0, 0],
				[0, 1, 0, 0],
				[0, 1, 0, 0]],

			[	[0, 0, 1, 0],
				[0, 1, 1, 0],
				[0, 1, 0, 0],
				[0, 0, 0, 0]],

			[	[0, 1, 0, 0],
				[0, 1, 1, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 0]],

			[	[0, 0, 0, 0],
				[0, 1, 1, 0],
				[0, 1, 0, 0],
				[0, 1, 0, 0]],

			[	[0, 0, 0, 0],
				[0, 1, 1, 0],
				[0, 0, 1, 0],
				[0, 0, 1, 0]],

			[	[0, 0, 0, 0],
				[0, 1, 0, 0],
				[1, 1, 1, 0],
				[0, 0, 0, 0]]
			];
	// ステージを設定
  //ステージのマスを配列にする。
	stage = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],	// ←表示しない
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
			[9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];	// ←表示しない
}

/*
 * ステージ設定
 */
function setStage(){
	// 表示するための配列
  // 初期は全てのマスで何もないため0とする。
	for(var i=0; i<BLOCK_RAWS; i++){
		field[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	}
	// 操作ブロックための配列
	oBlock = [	[0,0,0,0],
				[0,0,0,0],
				[0,0,0,0],
				[0,0,0,0]
			];
	// ステージデータをコピーする
	for(i=0; i<BLOCK_RAWS; i++){
		for(j=0; j<BLOCK_COLS; j++){
			field[i][j] = stage[i][j];
		}
	}
}

/*
 * ゲーム開始処理
 */
function newGame(){
	setStage(); //gameが始まったと同時にステージ生成
	mode = GAME; //modeをゲーム中にする(1)
	frame = 1;
	speed = 30;
	clearTimeout(timer1); //timer1のタイマー解除
	createBlock(); //newGame()が読み込まれたときにブロック生成
	mainLoop();
}


/*
 * 新しいブロックを作成
 */
function createBlock(){
	if(mode == EFFECT) return; //EFFECT == 2 ブロックを消すためのエフェクトモード
	x = sx = Math.floor(BLOCK_COLS / 3);
	y = sy = 0;
  //Math.random()は0~1の浮動小数点
  //7倍して切り捨て 0,1,2,3,4,5,6のどれかになる
	blockType = Math.floor(Math.random()*7); //ブロック7種類をランダムに生成
	// ブロックをコピー
	for(i=0; i<4; i++){ //0,1,2,3
		for(j=0; j<4; j++){ //0,1,2,3
			oBlock[i][j] = block[blockType][i][j];
		}
	}

  //hitCheck()に引っ掛かったらゲームオーバー
	if(hitCheck()){
		mode = GAMEOVER;
		console.log("GAMEOVER!");
	}
	putBlock();
}

/*
 * ブロックをロック（動かせないように）する
 */
function lockBlock(){
	if(mode == EFFECT) return;
	for(var i=0; i<4; i++){
		for(var j=0; j<4; j++){
			if(oBlock[i][j]) field[i+y][j+x] = LOCK_BLOCK; //LOCK_BLOCK == 2
		}
	}
}

/*
 * ブロックをステージにセットする
 */
function putBlock(){
	if(mode == EFFECT) return;
	for(var i=0; i<4; i++){
		for(var j=0; j<4; j++){
			if(oBlock[i][j])	field[i+y][j+x] = oBlock[i][j];
		}
	}
}

/*
 * ブロックを消去する
 */
function clearBlock(){
	if(mode == EFFECT) return;
	for(var i=0; i<4; i++){
		for(var j=0; j<4; j++){
			if(oBlock[i][j]) field[i+y][j+x] = NON_BLOCK; //NON_BLOCK == 0;
		}
	}
}


/*
 * ブロックの回転処理
 */
function rotateBlock(){
	if(mode == EFFECT) return;
	clearBlock();
	// 回転ブロック退避の配列
	var tBlock = [	[0,0,0,0],
				[0,0,0,0],
				[0,0,0,0],
				[0,0,0,0]
			];
	// ブロックを退避
	for(var i=0; i<4; i++){
		for(var j=0; j<4; j++){
			tBlock[i][j] = oBlock[i][j];
		}
	}
	// ブロックを回転
	for(var i=0; i<4; i++){
		for(var j=0; j<4; j++){
			oBlock[i][j] = tBlock[3-j][i];
		}
	}
	if(hitCheck()){
		// 元に戻す
		for(var i=0; i<4; i++){
			for(var j=0; j<4; j++){
				oBlock[i][j] = tBlock[i][j];
			}
		}
	}
	putBlock();
	return 0;
}

/*
 * ブロックの当たり判定処理（移動できるか？落下できるか？）
 */
function hitCheck(){
	if(mode == EFFECT) return;
	for(var i=0; i<4; i++){
		for(var j=0; j<4; j++){
			if(field[i+y][j+x] && oBlock[i][j])		return 1;
		}
	}
	return 0;
}

/*
 * ラインが揃ったかチェックする
 */
function lineCheck(){
	if(mode == EFFECT) return;
	var count;
	var lineCount = 0;			// 何ライン揃ったか？
	for(i=1; i<BLOCK_RAWS-2; i++){
		count = 0;	// 1ライン上に揃ったブロックの数
		for(j=0; j<BLOCK_COLS; j++){		// 右端からチェック
			if(field[i][j]) count++;
			else break;
		}
		if(count >= BLOCK_COLS){		// 1ライン揃った！
			lineCount++;
			clearLine++;
			for(j=1; j<BLOCK_COLS-1; j++) field[i][j] = CLEAR_BLOCK;		// 消去ブロックにする
			console.log("lineCount = " + lineCount);
			console.log("clearLine = " + clearLine);
		}
	}
	return lineCount;		// 消去ライン数を返す（現在、この戻り値は未使用）
}

/*
 * そろったラインを消去する
 */
function deleteLine(){
	if(mode == EFFECT) return;
	for(var i=BLOCK_RAWS-1; i>=1; i--){		// 下のラインから消去する
		for(var j=1; j<BLOCK_COLS-1; j++){	// 右端からチェック
			if(field[i][j] == CLEAR_BLOCK){
				field[i][j] = field[i-1][j];			// 一段落とす
				for(var above=i-1; above>=1; above--){	// 	そこからまた上を一段ずつおとしていく
					field[above][j] = field[above-1][j];
				}
				i++;		// 落としたラインもまた、消去ラインだったときの対処
			}
		}
	}
}


/*
 * ゲーム画面クリア
 */
function clearWindow(){
	g.fillStyle = BACK_COLOR;
	g.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
};

/*
 * 描画処理
 */
function draw(){
	clearWindow();

	for(var i=0; i<BLOCK_RAWS; i++){
		for(var j=0; j<BLOCK_COLS; j++){
			switch(field[i][j]){
				case NON_BLOCK:		// なにもない
					g.fillStyle = BACK_COLOR;
					break;
				case NORMAL_BLOCK:		// ブロック
					g.fillStyle = BLOCK_COLOR;
					break;
				case LOCK_BLOCK:		// ブロック（ロック）
					g.fillStyle = LOCK_COLOR;
					break;
				case CLEAR_BLOCK:		// 消去ブロック
					g.fillStyle = BLOCK_COLOR;
					break;
				case WALL:		// 壁
					g.fillStyle = WALL_COLOR;
					break;
				default:		// 重なったときの色
					g.fillStyle = ERROR_COLOR;
			}
			g.fillRect(j*bs, i*bs, bs-1, bs-1);    // 1引いているのはブロック同士の隙間を入れるため
		}
	}
}

/*
 * ラインを消去するときのエフェクト
 */
function effect(){
	var colors = [ EFFECT_COLOR1, EFFECT_COLOR2 ];

	g.fillStyle = colors[effectState.flipFlop];
	for(var i=0; i<BLOCK_RAWS; i++){
		for(var j=0; j<BLOCK_COLS; j++){
			if(field[i][j] == CLEAR_BLOCK){		// 消去ブロックならエフェクト表示
				g.fillRect(j*bs, i*bs, bs-1, bs-1);
			}
		}
	}
	effectState.flipFlop = 1 - effectState.flipFlop;	// エフェクト色を交互に切り替え

	if(effectState.count > EFFECT_ANIMATION){
		mode = GAME;
		effectState.count = 0;
		effectState.flipFlop = 0;
		deleteLine();
		createBlock();
	}
	effectState.count++;
}

/*
 * ゲームオーバー処理
 */
function gameOver(){
	for(var i=0; i<BLOCK_RAWS; i++){
		for(var j=0; j<BLOCK_COLS; j++){
			if(field[i][j] && field[i][j] != WALL){	// ブロックのみ色を変える
				g.fillStyle = GAMEOVER_COLOR;
				g.fillRect(j*bs, i*bs, bs-1, bs-1);
			}
		}
	}
}
/*
 * ゲームメイン
 */
function mainLoop(){
	if(mode == GAME){
		sx = x; sy = y;		// 元の位置を保存
		if(frame % speed == 0){	// ブロックが落下する間隔
			clearBlock();
			y++;
			if(hitCheck()){
				y = sy;
				lockBlock();
				if(lineCheck() > 0){
					mode = EFFECT;
				}
				createBlock();
			}
			putBlock();
		}
		draw();
	}
	else if(mode == GAMEOVER){
		gameOver();
	}
	else if(mode == EFFECT){
		if(frame % effectState.speed == 0){
			effect();
		}
	}
	frame++;
	// 落下スピードアップ
	if(clearLine >= NEXTLEVEL){
		clearLine = 0;
		speed--;
		console.log("speedUP! : " + speed);
	}
	if(speed < 1) speed = 1;
	timer1 = setTimeout(mainLoop, 1000/FPS);
}


/*
 * キーボードイベント
 */
window.onkeydown = keyDownFunc;

/*
 * 操作
 */
function keyDownFunc(e){
	if(mode == EFFECT) return;
	if(mode == GAME){
		clearBlock();
		sx = x; sy = y;
		if(e.keyCode == 32){
			rotateBlock();
		}
		else if(e.keyCode == 37){
			x--;
		}
		else if(e.keyCode == 39){
			x++;
		}
		else if(e.keyCode == 40){
			y++;
		}
		if(hitCheck()){
			x = sx; y = sy;
		}
		putBlock();
	}
	else if(mode == GAMEOVER){
		if(e.keyCode == 13){
			newGame();
		}
	}
}
/*
 * 起動処理
 */
window.onload = function(){
	init();
	newGame();
}
