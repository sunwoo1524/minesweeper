var board = document.querySelector("#board");
var ctx = board === null || board === void 0 ? void 0 : board.getContext("2d");
var flagsEl = document.querySelector(".flags span");
var timerEl = document.querySelector(".timer span");
var restartImg = document.querySelector(".restart img");
var restartBtn = document.querySelector(".restart");
var numberImg = [];
for (var i = 1; i < 9; i++) {
    numberImg[i - 1] = new Image();
    numberImg[i - 1].src = "img/".concat(i, ".png");
}
var normalImg = new Image();
var flagImg = new Image();
var mineImg = new Image();
var notMineImg = new Image();
normalImg.src = "img/normal.png";
flagImg.src = "img/flag.png";
mineImg.src = "img/mine.png";
notMineImg.src = "img/notmine.png";
var grid = [];
var view = [];
var mines;
var mines_pos;
var board_width;
var board_height;
var size = 25;
var flags = 0;
var time = 0;
var timer_id;
var is_timer_running = false;
var playing = true;
function initGame(width, height, minenum) {
    clearInterval(timer_id);
    if (restartImg != null) {
        restartImg.src = "img/smile.png";
    }
    playing = true;
    mines = minenum;
    flags = minenum;
    if (flagsEl != null)
        flagsEl.innerHTML = String(flags);
    time = 0;
    if (timerEl != null)
        timerEl.innerHTML = "0";
    board_width = width;
    board_height = height;
    if (board != null) {
        board.width = width * size;
        board.height = height * size;
    }
    grid = [];
    view = [];
    for (var i = 0; i < height; i++) {
        grid.push([]);
        view.push([]);
        for (var j = 0; j < width; j++) {
            grid[i].push(0);
            view[i].push(0);
        }
    }
    var temp = [];
    var mine = [];
    for (var i = 0; i < height; i++)
        for (var j = 0; j < width; j++)
            temp.push([j, i]);
    for (var i = 0; i < minenum; i++) {
        var j = Math.floor(Math.random() * temp.length);
        mine.push(temp[j]);
        temp.splice(j, 1);
    }
    mines_pos = mine;
    mine.forEach(function (el) {
        grid[el[1]][el[0]] = -1;
    });
    grid.forEach(function (row, y) {
        row.forEach(function (el, x) {
            var around = 0;
            if (grid[y][x] != -1) {
                for (var i = y - 1; i <= y + 1; i++) {
                    for (var j = x - 1; j <= x + 1; j++) {
                        if (i >= 0 &&
                            i < board_height &&
                            j >= 0 &&
                            j < board_width &&
                            grid[i][j] == -1 &&
                            !(i == y && j == x)) {
                            around++;
                        }
                    }
                }
                grid[y][x] = around;
            }
        });
    });
}
function dig(x, y) {
    if (grid[y][x] == -1) {
        mines_pos.forEach(function (el) {
            if (view[el[1]][el[0]] != 10)
                view[el[1]][el[0]] = -1;
        });
        view.forEach(function (r, y) { return r.forEach(function (el, x) {
            if (el == 10 && grid[y][x] != -1) {
                view[y][x] = 11;
            }
        }); });
        if (restartImg != null)
            restartImg.src = "img/bad.png";
        endGame();
    }
    else {
        view[y][x] = grid[y][x] == 0 ? 9 : grid[y][x];
        if (grid[y][x] == 0) {
            var empty = [];
            for (var i = y - 1; i <= y + 1; i++) {
                for (var j = x - 1; j <= x + 1; j++) {
                    if (i >= 0 &&
                        i < board_height &&
                        j >= 0 &&
                        j < board_width &&
                        grid[i][j] != -1 &&
                        view[i][j] == 0 &&
                        !(i == y && j == x)) {
                        if (grid[i][j] == 0) {
                            empty.push([j, i]);
                        }
                        else {
                            view[i][j] = grid[i][j];
                        }
                    }
                }
            }
            var _loop_1 = function () {
                var temp = [];
                empty.forEach(function (el) {
                    view[el[1]][el[0]] = 9;
                    for (var i = el[1] - 1; i <= el[1] + 1; i++) {
                        for (var j = el[0] - 1; j <= el[0] + 1; j++) {
                            if (i >= 0 &&
                                i < board_height &&
                                j >= 0 &&
                                j < board_width &&
                                grid[i][j] != -1 &&
                                view[i][j] == 0 &&
                                !(i == y && j == x)) {
                                if (grid[i][j] == 0) {
                                    temp.push([j, i]);
                                }
                                else {
                                    view[i][j] = grid[i][j];
                                }
                            }
                        }
                    }
                });
                empty = temp;
            };
            while (empty.length != 0) {
                _loop_1();
            }
        }
    }
}
function isCleared() {
    var not_digged = 0;
    view.forEach(function (row, y) {
        row.forEach(function (el, x) {
            if (el == 10 || el == 0) {
                not_digged++;
            }
        });
    });
    if (not_digged == mines) {
        return true;
    }
    else {
        return false;
    }
}
function timer() {
    time++;
    if (timerEl != null)
        timerEl.innerHTML = String(time);
}
function endGame() {
    playing = false;
    is_timer_running = false;
    clearInterval(timer_id);
}
function draw() {
    if (board != null)
        ctx === null || ctx === void 0 ? void 0 : ctx.clearRect(0, 0, board.width, board.height);
    view.forEach(function (row, y) {
        row.forEach(function (el, x) {
            if (el == 0) {
                ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(normalImg, x * size, y * size, size, size);
            }
            else if (el == 10) {
                ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(flagImg, x * size, y * size, size, size);
            }
            else if (el == -1) {
                ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(mineImg, x * size, y * size, size, size);
            }
            else if (el == 11) {
                ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(notMineImg, x * size, y * size, size, size);
            }
            else if (el != 9) {
                ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(numberImg[el - 1], x * size, y * size, size, size);
            }
        });
    });
    for (var i = 0; i < board_height; i++) {
        for (var j = 0; j < board_width; j++) {
            if (ctx instanceof CanvasRenderingContext2D && board != null) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#616161";
                ctx.beginPath();
                ctx.moveTo(j * size, 0);
                ctx.lineTo(j * size, board.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * size);
                ctx.lineTo(board.width, i * size);
                ctx.stroke();
                ctx.strokeRect(0, 0, board.width, board.height);
            }
        }
    }
    requestAnimationFrame(draw);
}
initGame(9, 9, 10);
draw();
if (board != null) {
    board.onmousedown = function (e) {
        if (playing) {
            if (!is_timer_running) {
                timer_id = setInterval(timer, 1000);
                is_timer_running = true;
            }
            var x = e.offsetX;
            var y = e.offsetY;
            x = Math.floor(x / size);
            y = Math.floor(y / size);
            if (e.button == 0) {
                if (view[y][x] == 0)
                    dig(x, y);
                else if (view[y][x] != 10) {
                    var flags_1 = 0;
                    for (var i = y - 1; i <= y + 1; i++) {
                        for (var j = x - 1; j <= x + 1; j++) {
                            if (i >= 0 &&
                                i < board_height &&
                                j >= 0 &&
                                j < board_width &&
                                view[i][j] == 10 &&
                                !(i == y && j == x)) {
                                flags_1++;
                            }
                        }
                    }
                    if (flags_1 == view[y][x]) {
                        for (var i = y - 1; i <= y + 1; i++) {
                            for (var j = x - 1; j <= x + 1; j++) {
                                if (i >= 0 &&
                                    i < board_height &&
                                    j >= 0 &&
                                    j < board_width &&
                                    view[i][j] == 0 &&
                                    !(i == y && j == x)) {
                                    dig(j, i);
                                }
                            }
                        }
                    }
                }
                if (isCleared()) {
                    alert("Clear!");
                    endGame();
                }
            }
            else if (e.button == 2) {
                if (view[y][x] == 0) {
                    view[y][x] = 10;
                    flags--;
                }
                else if (view[y][x] == 10) {
                    view[y][x] = 0;
                    flags++;
                }
                if (flagsEl != null)
                    flagsEl.innerHTML = String(flags);
            }
        }
    };
}
if (restartBtn != null) {
    restartBtn.onclick = function () {
        initGame(board_width, board_height, mines);
    };
}
