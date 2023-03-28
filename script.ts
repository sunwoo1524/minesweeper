const board: HTMLCanvasElement | null = document.querySelector("#board");
const ctx: CanvasRenderingContext2D | null | undefined = board?.getContext("2d");

const flagsEl: HTMLSpanElement | null = document.querySelector(".flags span");
const timerEl: HTMLSpanElement | null = document.querySelector(".timer span");
const restartImg: HTMLImageElement | null = document.querySelector(".restart img");

const restartBtn: HTMLDivElement | null = document.querySelector(".restart");

const numberImg: HTMLImageElement[] = [];

for (let i: number = 1; i < 9; i++) {
    numberImg[i - 1] = new Image();
    numberImg[i - 1].src = `img/${i}.png`;
}

const normalImg: HTMLImageElement = new Image();
const flagImg: HTMLImageElement = new Image();
const mineImg: HTMLImageElement = new Image();
const notMineImg: HTMLImageElement = new Image();

normalImg.src = "img/normal.png";
flagImg.src = "img/flag.png";
mineImg.src = "img/mine.png";
notMineImg.src = "img/notmine.png";

let grid: number[][] = [];
let view: number[][] = [];
let mines: number;
let mines_pos: number[][];
let board_width: number;
let board_height: number;
let size: number = 25;
let flags: number = 0;
let time: number = 0;
let timer_id: number;
let is_timer_running: boolean = false;
let playing: boolean = true;

function initGame(width: number, height: number, minenum: number): void {
    clearInterval(timer_id);

    if (restartImg != null) {
        restartImg.src = "img/smile.png";
    }

    playing = true;
    mines = minenum;
    flags = minenum;
    if (flagsEl != null) flagsEl.innerHTML = String(flags);
    time = 0;
    if (timerEl != null) timerEl.innerHTML = "0";
    board_width = width;
    board_height = height;

    if (board != null) {
        board.width = width * size;
        board.height = height * size;
    }

    grid = [];
    view = [];

    for (let i: number = 0; i < height; i++) {
        grid.push([]);
        view.push([]);

        for (let j: number = 0; j < width; j++) {
            grid[i].push(0);
            view[i].push(0);
        }
    }

    let temp: number[][] = [];
    let mine: number[][] = [];

    for (let i: number = 0; i < height; i++)
        for (let j: number = 0; j < width; j++)
            temp.push([j, i]);
    
    for (let i: number = 0; i < minenum; i++) {
        let j: number = Math.floor(Math.random() * temp.length);

        mine.push(temp[j])
        temp.splice(j, 1);
    }

    mines_pos = mine;

    mine.forEach(el => {
        grid[el[1]][el[0]] = -1;
    });

    grid.forEach((row, y) => {
        row.forEach((el, x) => {
            let around: number = 0;

            if (grid[y][x] != -1) {
                for (let i: number = y - 1; i <= y + 1; i++) {
                    for (let j: number = x - 1; j <= x + 1; j++) {
                        if (
                            i >= 0 &&
                            i < board_height &&
                            j >= 0 &&
                            j < board_width &&
                            grid[i][j] == -1 &&
                            !(i == y && j == x)
                        ) {
                            around ++;
                        }
                    }
                }

                grid[y][x] = around;
            }
        });
    });
}

function dig(x: number, y: number): void {
    if (grid[y][x] == -1) {
        mines_pos.forEach(el => {
            if (view[el[1]][el[0]] != 10) view[el[1]][el[0]] = -1;
        });
        
        view.forEach((r, y) => r.forEach((el, x) => {
            if (el == 10 && grid[y][x] != -1) {
                view[y][x] = 11;
            }
        }));

        if (restartImg != null) restartImg.src = "img/bad.png";

        endGame();
    } else {
        view[y][x] = grid[y][x] == 0 ? 9 : grid[y][x];

        if (grid[y][x] == 0) {
            let empty: number[][] = [];

            for (let i: number = y - 1; i <= y + 1; i++) {
                for (let j: number = x - 1; j <= x + 1; j++) {
                    if (
                        i >= 0 &&
                        i < board_height &&
                        j >= 0 &&
                        j < board_width &&
                        grid[i][j] != -1 &&
                        view[i][j] == 0 &&
                        !(i == y && j == x)
                    ) {
                        if (grid[i][j] == 0) {
                            empty.push([j, i]);
                        } else {
                            view[i][j] = grid[i][j];
                        }
                    }
                }
            }

            while (empty.length != 0) {
                let temp: number[][] = [];

                empty.forEach(el => {
                    view[el[1]][el[0]] = 9;

                    for (let i: number = el[1] - 1; i <= el[1] + 1; i++) {
                        for (let j: number = el[0] - 1; j <= el[0] + 1; j++) {
                            if (
                                i >= 0 &&
                                i < board_height &&
                                j >= 0 &&
                                j < board_width &&
                                grid[i][j] != -1 &&
                                view[i][j] == 0 &&
                                !(i == y && j == x)
                            ) {
                                if (grid[i][j] == 0) {
                                    temp.push([j, i]);
                                } else {
                                    view[i][j] = grid[i][j];
                                }
                            }
                        }
                    }
                });

                empty = temp;
            }
        }
    }
}

function isCleared(): boolean {
    let not_digged: number = 0;

    view.forEach((row, y) => {
        row.forEach((el, x) => {
            if (el == 10 || el == 0) {
                not_digged++;
            }
        })
    })

    if (not_digged == mines) {
        return true;
    } else {
        return false;
    }
}

function timer(): void {
    time++;
    if (timerEl != null) timerEl.innerHTML = String(time);
}

function endGame(): void {
    playing = false;
    is_timer_running = false;
    clearInterval(timer_id);
}

function draw(): void {
    if (board != null) ctx?.clearRect(0, 0, board.width, board.height);

    view.forEach((row, y) => {
        row.forEach((el, x) => {
            if (el == 0) {
                ctx?.drawImage(normalImg, x * size, y * size, size, size);
            } else if (el == 10) {
                ctx?.drawImage(flagImg, x * size, y * size, size, size);
            } else if (el == -1) {
                ctx?.drawImage(mineImg, x * size, y * size, size, size);
            } else if (el == 11) {
                ctx?.drawImage(notMineImg, x * size, y * size, size, size);
            } else if (el != 9) {
                ctx?.drawImage(numberImg[el - 1], x * size, y * size, size, size);
            }
        });
    });

    for (let i: number = 0; i < board_height; i++){
        for (let j: number = 0; j < board_width; j++){
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

initGame(15, 10, 30);
draw();

if (board != null) {
    board.onmousedown = e => {
        if (playing) {
            if (!is_timer_running) {
                timer_id = setInterval(timer, 1000);
                is_timer_running = true;
            }

            let x: number = e.offsetX;
            let y: number = e.offsetY;

            x = Math.floor(x / size);
            y = Math.floor(y / size);

            if (e.button == 0) {
                if (view[y][x] == 0) dig(x, y);
                else if (view[y][x] != 10) {
                    let flags: number = 0;

                    for (let i: number = y - 1; i <= y + 1; i++) {
                        for (let j: number = x - 1; j <= x + 1; j++) {
                            if (
                                i >= 0 &&
                                i < board_height &&
                                j >= 0 &&
                                j < board_width &&
                                view[i][j] == 10 &&
                                !(i == y && j == x)
                            ) {
                                flags ++;
                            }
                        }
                    }

                    if (flags == view[y][x]) {
                        for (let i: number = y - 1; i <= y + 1; i++) {
                            for (let j: number = x - 1; j <= x + 1; j++) {
                                if (
                                    i >= 0 &&
                                    i < board_height &&
                                    j >= 0 &&
                                    j < board_width &&
                                    view[i][j] == 0 &&
                                    !(i == y && j == x)
                                ) {
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
            } else if (e.button == 2) {
                if (view[y][x] == 0) {
                    view[y][x] = 10;
                    flags--;
                } else if (view[y][x] == 10) {
                    view[y][x] = 0;
                    flags++;
                }

                if (flagsEl != null) flagsEl.innerHTML = String(flags);
            }
        }
    };
}

if (restartBtn != null) {
    restartBtn.onclick = () => {
        initGame(board_width, board_height, mines);
    }
}