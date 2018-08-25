'use strict';

let height = 0;

function funcFromString(funcString) {
    funcString = funcString.replace(/\^/g, '**');
    let i = 0;
    while (funcString[i] !== '=') i++;
    height = eval(funcString.substring(i + 1));
    funcString = funcString.substring(0, i);
    return (x, y) => eval(funcString);
}

f = funcFromString("x^2 - y^2 = 1");

function startImpl(funcIn, a1, a2, a3, a4) {
    let f = funcFromString(funcIn);

    arr = [];

    a = a1;
    b = a2;
    c = a3;
    d = a4;

    for (let i = a, idx = 0; i <= b; i += dx, idx++) {
        arr.push([]);
        for (let j = c, jdx = 0; j <= d; j += dy, jdx++) {
            arr[idx].push(new Point3D(i, j, f(i, j)));
        }
    }

    if (a2 <= a1 || a4 <= a3) {
        alert('Неверно заданы отрезки');
        return;
    }

    try {
        f(0, 0);
    } catch (e) {
        alert('Проверьте корректность введенных данных и попробуйте снова');
        return;
    }
    plot(f);
}

n = 200; //number of pieces
a = -8; //X borders
b = 8;
c = -8; //Y borders
d = 8;

const dx = (b - a) / n;
const dy = (d - c) / n;
offset = 50;


class ImplicitMarchingSquare {

    constructor(h) {
        this.h = h;
        this.NONE = 0;
        this.UP = 1;
        this.LEFT = 2;
        this.DOWN = 3;
        this.RIGHT = 4;

        this.borderFound = false;

        this.nextStep = this.NONE;

        this.i = 1;
        this.j = 1;

        this.x0 = 0;
        this.y0 = 0;
    }

    findStartPoint() {
        for (; this.i < arr.length - 1; this.i++) {
            this.j %= (arr.length - 1);
            if (this.j === 0) {
                this.j = 1;
                this.i++;
            }
            for (; this.j < arr.length - 1; this.j++) {
                if (arr[this.i][this.j].z <= this.h ||
                    (arr[this.i][this.j].z > this.h &&
                        (arr[this.i - 1][this.j - 1].z <= this.h ||
                            arr[this.i - 1][this.j].z <= this.h || arr[this.i][this.j - 1].z <= this.h))) {
                    this.x0 = this.i;
                    this.y0 = this.j;
                    this.j++;
                    return true;
                }
            }
        }
        return false;
    }


    buildLine() {
        let border = 0;
        const linePoints = [];
        let x = this.x0, y = this.y0;
        for (; ;) {
            this.moveNext(x, y);

            if (x !== this.x0 || y !== this.y0) {
                if (x === 0 || y === 0 || x === arr.length - 1 || y === arr.length - 1) {
                    border++;
                    if (border === 2) {
                        this.borderFound = false;
                        return linePoints;
                    }
                    x = this.x0;
                    y = this.y0;
                    this.nextStep = this.NONE;
                    this.borderFound = true;
                    linePoints.push([NaN, NaN]);
                    continue;
                }
            }

            if (x > 0 && x < arr.length && y > 0 && y < arr.length) {
                let X, Y;
                switch (this.nextStep) { //Линейная интерполяция на основе направления следующего шага
                    case this.UP:
                        Y = arr[x][y].y;
                        X = arr[x - 1][y].x +
                            (arr[x][y].x - arr[x - 1][y].x) * (this.h - arr[x - 1][y].z) / (arr[x][y].z - arr[x - 1][y].z);
                        linePoints.push([X, Y]);
                        break;
                    case this.DOWN:
                        X = arr[x - 1][y - 1].x +
                            (arr[x][y - 1].x - arr[x - 1][y - 1].x) * (this.h - arr[x - 1][y - 1].z) / (arr[x][y - 1].z - arr[x - 1][y - 1].z);
                        Y = arr[x][y - 1].y;
                        linePoints.push([X, Y]);
                        break;
                    case this.RIGHT:
                        Y = arr[x][y - 1].y +
                            (arr[x][y].y - arr[x][y - 1].y) * (this.h - arr[x][y - 1].z) / (arr[x][y].z - arr[x][y - 1].z);
                        X = arr[x][y].x;
                        linePoints.push([X, Y]);
                        break;
                    case this.LEFT:
                        Y = arr[x - 1][y - 1].y +
                            (arr[x - 1][y].y - arr[x - 1][y - 1].y) * (this.h - arr[x - 1][y - 1].z) / (arr[x - 1][y].z - arr[x - 1][y - 1].z);
                        X = arr[x - 1][y].x;
                        linePoints.push([X, Y]);
                        break;
                }
            }

            switch (this.nextStep) {
                case this.UP:
                    y++;
                    break;
                case this.LEFT:
                    x--;
                    break;
                case this.DOWN:
                    y--;
                    break;
                case this.RIGHT:
                    x++;
                    break;
                default:
                    break;
            }

            if (x === this.x0 && y === this.y0) break;
        }

        return linePoints;
    }

    check(x, y) {
        if (x < 0 || y < 0 || x >= arr.length || y >= arr.length) return false;
        return arr[x][y].z <= this.h;
    }

    moveNext(x, y) {

        let state = 0;

        const leftTop = this.check(x - 1, y - 1);
        const rightTop = this.check(x, y - 1);
        const bottomLeft = this.check(x - 1, y);
        const bottomRight = this.check(x, y);


        if (leftTop) state |= 1;
        if (rightTop) state |= 2;
        if (bottomLeft) state |= 4;
        if (bottomRight) state |= 8;

        if (this.borderFound) {
            state = 15 - state;
        }

        switch (state) {
            case 1:
            case 5:
            case 13:
                this.nextStep = this.DOWN;
                break;
            case 2:
            case 3:
            case 7:
                this.nextStep = this.RIGHT;
                break;
            case 4:
            case 12:
            case 14:
                this.nextStep = this.LEFT;
                break;
            case 6:
                if (this.nextStep === this.DOWN) {
                    this.nextStep = this.LEFT;
                } else {
                    this.nextStep = this.RIGHT;
                }
                break;
            case 8:
            case 10:
            case 11:
                this.nextStep = this.UP;
                break;
            case 9:
                if (this.nextStep === this.RIGHT) {
                    this.nextStep = this.DOWN;
                } else {
                    this.nextStep = this.UP;
                }
                break;
            default:
                this.nextStep = this.NONE;
                break;
        }
    }
}

function plot() {

    const canvas = document.getElementById('canvas2dImplicity');
    const ctx = canvas.getContext('2d');

    const canvasSize = canvas.height;
    const xScale = (canvasSize - offset) / abs(b - a);
    const yScale = (canvasSize - offset) / abs(d - c);

    axisPlot();

    const ms = new ImplicitMarchingSquare(height);
    while (ms.findStartPoint()) {
        ctx.beginPath();
        const array = ms.buildLine();
        for (let elem of array) {
            if (!isNaN(elem[0])) {
                ctx.lineTo(offset + (elem[0] - a) * xScale, canvasSize - offset - (elem[1] - c) * yScale);
            } else { //если маршин скуаре уперся в бордер то возвращаемся назад
                ctx.moveTo(offset + (array[0][0] - a) * xScale, canvasSize - offset - (array[0][1] - c) * yScale);
            }
        }
        ctx.stroke();
        ctx.closePath();
    }

    markAxis();
}

function axisPlot() {

    const canvas = document.getElementById('canvas2dImplicity');
    const ctx = canvas.getContext('2d');

    const canvHeight = canvas.height;
    const canvWidth = canvas.width;

    ctx.fillStyle = 'white';
    ctx.fillRect(offset, 0, canvHeight - offset, canvWidth - offset);

    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 0.5;

    const dx = (canvWidth - offset) / 30;
    const dy = (canvHeight - offset) / 30;

    for (let y = 0; y < canvHeight - offset; y += dy) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvWidth, y);
        ctx.stroke();
        ctx.closePath();
    }

    for (let x = offset; x < canvWidth; x += dx) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvHeight);
        ctx.stroke();
        ctx.closePath();
    }
}

function mouseCoordinates(canvas, evnt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (evnt.clientX - rect.left),
        y: (evnt.clientY - rect.top)
    };
}

function markAxis() {

    const canvas = document.getElementById('canvas2dImplicity');
    const ctx = canvas.getContext('2d');

    const canvHeight = canvas.height;
    const canvWidth = canvas.width;

    ctx.clearRect(0, 0, offset, canvHeight);
    ctx.clearRect(0, canvHeight - offset, canvWidth, offset);

    ctx.strokeStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillStyle = 'black';

    const upPoint = new Point2D(offset, 0);
    const bottomPoint = new Point2D(offset, canvHeight - offset);
    const rightPoint = new Point2D(canvWidth, canvHeight - offset);

    ctx.beginPath();
    ctx.moveTo(upPoint.x, upPoint.y);
    ctx.lineTo(bottomPoint.x, bottomPoint.y);
    ctx.lineTo(rightPoint.x, rightPoint.y);
    ctx.stroke();
    ctx.closePath();

    //-------------------------------------------
    ctx.beginPath();
    //----------------------------------------------

    const amount = 15;
    const displayDY = (bottomPoint.y - upPoint.y) / amount;
    const dy = (d - c) / amount;
    let value = d - dy;
    const pt = new Point2D(upPoint.x, upPoint.y + displayDY);

    while (pt.y < bottomPoint.y) {
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x + 7, pt.y);
        ctx.stroke();
        ctx.fillText(value.toFixed(2), pt.x - 30, pt.y);
        value -= dy;
        pt.y += displayDY;
    }
    //-----------------------------------------------------

    ctx.fillText(value.toFixed(2), pt.x - 30, pt.y);
    const displayDX = (rightPoint.x - bottomPoint.x) / amount;
    const dx = (b - a) / amount;
    value = a;

    while (pt.x < rightPoint.x) {
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x, pt.y - 7);
        ctx.stroke();
        ctx.fillText(value.toFixed(2), pt.x, pt.y + 15);
        value += dx;
        pt.x += displayDX;
    }

    ctx.closePath();

    ctx.font = '18px Arial';
    ctx.fillText('Y', 4, (canvHeight - offset) / 2);
    ctx.fillText('X', canvWidth / 2, canvHeight - offset / 4);

    canvas.addEventListener('mousemove', (evnt) => {
        const coordinates = mouseCoordinates(canvas, evnt);
        const x = coordinates.x;
        const y = coordinates.y;
        if (x >= offset && y <= canvas.height - offset) {
            ctx.clearRect(canvas.width / 1.2, canvas.height - 20, canvas.width / 6, 20);
            ctx.font = '12px Arial';
            ctx.fillStyle = 'black';
            const xRatio = (b - a) / (canvas.width - offset);
            const yRatio = (d - c) / (canvas.height - offset);
            ctx.fillText('x: ' + (a + xRatio * (x - 40)).toFixed(2) + '  y: ' +
                (d - y * yRatio).toFixed(2), canvas.width / 1.2, canvas.height - 10);
        }
    }, false);

    const xScale = (canvWidth - offset) / abs(b - a);
    const yScale = (canvHeight - offset) / abs(d - c);

    if (a < 0 && b > 0) { //рисуем вертикальную линию
        ctx.fillRect(offset, (canvWidth - offset) + c * yScale, canvas.width - offset, 1.5);
    }

    if (c < 0 && d > 0) { // рисуем горизонтальную линию
        ctx.fillRect(offset - a * xScale,0,1,canvas.height - offset);
    }
}
