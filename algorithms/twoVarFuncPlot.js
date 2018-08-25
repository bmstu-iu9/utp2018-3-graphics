'use strict';

class Point3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    sum(otherPoint) {
        this.x += otherPoint.x;
        this.y += otherPoint.y;
        this.z += otherPoint.z;
    }
}

function funcFromString(f) {
    f = f.replace(/\^/g, '**');
    return (x, y) => eval(f);
}

let f = funcFromString("(e^(-(x^2+y^2)/8))*(sin(x^2) + cos(y^2))");

function start(funcIn, a1, a2, a3, a4) {
  max = -Infinity;
  min = Infinity;
  f = funcFromString(funcIn);
    if (a2 <= a1 || a4 <= a3 || z1 <= z0) {
        alert('Неверно заданы отрезки');
        return;
    }
    try {
        f(0, 0);
    } catch(error) {
        alert('Проверьте корректность введенных данных и попробуйте снова.');
        return;
    }

    a = a1;
    b = a2;
    c = a3;
    d = a4;

    const dx = Math.min((b - a) / n, 1);
    const dy = Math.min((d - c) / n, 1);

    xScale = 400 / abs(b-a);
    yScale = 400 / abs(d - c);

    arr = [];

    for (let i = a, idx = 0; i <= b; i += dx, idx++) {
        arr.push([]);
        for (let j = c, jdx = 0; j <= d; j += dy, jdx++) {
            arr[idx].push(new Point3D(i, j, f(i, j)));
            if (autoZ && !isNaN(arr[idx][jdx].z)) {
                max = Math.max(arr[idx][jdx].z, max);
                min = Math.min(arr[idx][jdx].z, min);
            }
        }
    }

    surfacePlot();
}

const n = 250; //number of pieces
//let a = -10, b = 10;
//let c = -10, d = 10;

const z0 = 4;
const z1 = 20;
const autoZ = true;

//let max = -Infinity;
//let min = Infinity;

let arr = [];

//----------------------------------
const checkedPoints = new Set();
//----------------------------------


let alpha = pi;
let beta = pi / 2.6;
let gamma = 1.4 * pi;


const offsetX = 300;
const offsetY = 500;

let xScale = 1;
let yScale = 1;

const a11 = () => cos(alpha) * cos(gamma) - sin(alpha) * cos(beta) * sin(gamma);
const a12 = () => -cos(alpha) * sin(gamma) - cos(beta) * sin(alpha) * cos(gamma);
const a13 = () => sin(beta) * sin(alpha);
const a21 = () => sin(alpha) * cos(gamma) + cos(beta) * cos(alpha) * sin(gamma);
const a22 = () => -sin(alpha) * sin(gamma) + cos(beta) * cos(alpha) * cos(gamma);
const a23 = () => -sin(beta) * cos(alpha);


function toCanvasCoordinates(point) {
    let zScale = 400 / abs(max - min);
    const cX = a11() * (point.x - (a + (b - a) / 2)) * xScale +
        a12() * (point.y - (c + (d - c) / 2)) * yScale +
        a13() * ((point.z - min) * zScale);
    const cY = a21() * (point.x - (a + (b - a) / 2)) * xScale +
        a22() * (point.y - (c + (d - c) / 2)) * yScale +
        a23() * ((point.z - min) * zScale);

    return new Point2D(cX, cY);
}

function rotateRight() {
    gamma += pi / 10;
    if (gamma > 2 * pi) gamma -= 2 * pi;
}

function rotateLeft() {
    gamma -= pi / 10;
    if (gamma < 0) gamma += 2 * pi;
}

class MarchingSquare {

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

    findStartPoint() { //Ищет для каждого уровня начальные точки для всех линий данного уровня
        for (; this.i < arr.length - 1; this.i++) {
            this.j %= (arr.length - 1);
            if (this.j === 0) {
                this.j = 1;
                this.i++;
            }
            for (; this.j < arr.length - 1; this.j++) {
                if ((arr[this.i][this.j].z <= this.h ||
                        (arr[this.i][this.j].z > this.h &&
                            (arr[this.i - 1][this.j - 1].z <= this.h ||
                                arr[this.i - 1][this.j].z <= this.h || arr[this.i][this.j - 1].z <= this.h))) &&
                    !checkedPoints.has(this.i * arr.length + this.j)) {
                    this.x0 = this.i;
                    this.y0 = this.j;
                    checkedPoints.add(this.i * arr.length + this.j);
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
            checkedPoints.add(x * arr.length + y);
            if (x > 0 && x < arr.length && y > 0 && y < arr.length) {
                let X, Y;
                switch (this.nextStep) { //Линейная интерполяция на основе следующего шага
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
        if (linePoints.length > 0) {
            linePoints.push([linePoints[0][0], linePoints[0][1]]);
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

function getColorizer(min, max) {
    const k = Math.abs(max - min) / 5;
    return (h) => {
        const M = Math.abs(h - min) / k;
        const Mq = Math.ceil(M);
        switch (Mq) {
            case 1:
                return 'rgb(' + Math.floor(255 * (1 - M)) + ',0,255)';
            case 2:
                return 'rgb(0,' + Math.floor(255 * (M - 1)) + ',255)';
            case 3:
                return 'rgb(0,255,' + Math.floor(255 * (3 - M)) + ')';
            case 4:
                return 'rgb(' + Math.floor(255 * (M - 3)) + ',255,0)';
            case 5:
                return 'rgb(255,' + Math.floor(255 * (5 - M)) + ',0)';
        }
    }
}

function mouseCoordinates(canvas, evnt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evnt.clientX - rect.left,
        y: evnt.clientY - rect.top
    };
}

function axisPlot(backSide = false) {

    const canvas = document.getElementById('canvas2dFmp');
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    let mainPoint = new Point3D(b, c, min);

    ctx.beginPath();

    if (backSide) {
        let backPoint = new Point2D(0, 0);
        let additionalPoints = [];
        if (gamma >= pi / 2 && gamma < pi) { // main point (b, c)

            backPoint = toCanvasCoordinates(new Point3D(a, d, min));
            additionalPoints = [new Point3D(b, d, min), new Point3D(a, c, min), new Point3D(a, d, max)]
                .map(point => toCanvasCoordinates(point));

        } else if (gamma >= pi && gamma < 3 * pi / 2) { // main point (a, c)

            backPoint = toCanvasCoordinates(new Point3D(b, d, min));
            additionalPoints = [new Point3D(a, d, min), new Point3D(b, c, min), new Point3D(b, d, max)]
                .map(point => toCanvasCoordinates(point));

        } else if (gamma >= 3 * pi / 2 && gamma < 2 * pi) { // main point (a, d)

            backPoint = toCanvasCoordinates(new Point3D(b, c, min));
            additionalPoints = [new Point3D(a, c, min), new Point3D(b, d, min), new Point3D(b, c, max)]
                .map(point => toCanvasCoordinates(point));

        } else { // main point (b, d)

            backPoint = toCanvasCoordinates(new Point3D(a, c, min));
            additionalPoints = [new Point3D(a, d, min), new Point3D(b, c, min), new Point3D(a, c, max)]
                .map(point => toCanvasCoordinates(point));

        }

        additionalPoints.forEach((point) => {
            ctx.moveTo(offsetX + backPoint.x, offsetY - backPoint.y);
            ctx.lineTo(offsetX + point.x, offsetY - point.y);
            ctx.stroke();
        });

    } else {
        let points = [];
        let backPoint = new Point3D(a, c, min);
        if (gamma >= pi / 2 && gamma < pi) {

            points = [new Point3D(a, c, min), new Point3D(b, c, min), new Point3D(b, d, min)];
            backPoint = new Point3D(a, d, min);

        } else if (gamma >= pi && gamma < 3 * pi / 2) {
            points = [new Point3D(a, d, min), new Point3D(a, c, min), new Point3D(b, c, min)];
            backPoint = new Point3D(b, d, min);

        } else if (gamma >= 3 * pi / 2 && gamma < 2 * pi) {

            points = [new Point3D(a, c, min), new Point3D(a, d, min), new Point3D(b, d, min)];
            backPoint = new Point3D(b, c, min);

        } else {

            points = [new Point3D(a, d, min), new Point3D(b, d, min), new Point3D(b, c, min)];
            //backPoint = new Point3D(a, c, max);

        }

        mainPoint = points[1];

        points.forEach((point) => {
            const point2d = toCanvasCoordinates(point);
            ctx.lineTo(offsetX + point2d.x, offsetY - point2d.y);
            const upperPoint = toCanvasCoordinates(new Point3D(point.x, point.y, max));
            ctx.lineTo(offsetX + upperPoint.x, offsetY - upperPoint.y);
            ctx.moveTo(offsetX + point2d.x, offsetY - point2d.y);
            ctx.stroke();
        });
        ctx.closePath();

        points.push(backPoint);

        ctx.beginPath();
        points.forEach((point) => {
            const upperPoint = toCanvasCoordinates(new Point3D(point.x, point.y, max));
            ctx.lineTo(offsetX + upperPoint.x, offsetY - upperPoint.y);
        });
        ctx.closePath();
        ctx.stroke();

        markLines(mainPoint);
    }

}

function markLines(mainPoint) {
    const addPointY = new Point3D(mainPoint.x, mainPoint.y === c ? mainPoint.y + d - c : mainPoint.y - d + c, mainPoint.z);
    const addPointX = new Point3D(mainPoint.x === a ? mainPoint.x + b - a : mainPoint.x - b + a, mainPoint.y, mainPoint.z);
    const addPointZ = new Point3D(addPointX.x, addPointX.y, mainPoint.z + max - min);

    markLine(mainPoint, addPointX, 10);
    markLine(mainPoint, addPointY, 10);
    markLine(addPointX, addPointZ, 10);
}

function markLine(startPoint, endPoint, amount) {

    const canvas = document.getElementById('canvas2dFmp');
    const ctx = canvas.getContext('2d');

    ctx.font = '10px Arial';
    ctx.fillStyle = 'black';

    const v = new Point3D((endPoint.x - startPoint.x) / amount, (endPoint.y - startPoint.y) / amount, (endPoint.z - startPoint.z) / amount);
    const s = new Point3D(startPoint.x + v.x, startPoint.y + v.y, startPoint.z + v.z);

    if (abs(startPoint.x - endPoint.x) < 0.01) { //vertical line
        const oZ = startPoint.z !== endPoint.z;
        while (abs(s.y - endPoint.y) > 0.1 || abs(s.z - endPoint.z) > 0.1) {
            const leftPoint2D = toCanvasCoordinates(new Point3D(s.x + (b - a) / 50, s.y, s.z));
            const rightPoint2D = toCanvasCoordinates(new Point3D(s.x - (b - a) / 50, s.y, s.z));
            const textPoint2D = toCanvasCoordinates(new Point3D(s.x >= a ? s.x - (b - a) / 25 : s.x + (b - a) / 25, s.y, s.z));
            ctx.beginPath();
            ctx.moveTo(offsetX + leftPoint2D.x, offsetY - leftPoint2D.y);
            ctx.lineTo(offsetX + rightPoint2D.x, offsetY - rightPoint2D.y);
            ctx.fillText(oZ ? s.z.toFixed(3) : s.y.toFixed(3), offsetX + textPoint2D.x, offsetY - textPoint2D.y);
            ctx.stroke();
            ctx.closePath();
            s.sum(v);
        }

    } else { // horizontal line
        while (abs(s.x - endPoint.x) > 0.1) {
            const leftPoint2D = toCanvasCoordinates(new Point3D(s.x, s.y + (d - c) / 50, s.z));
            const rightPoint2D = toCanvasCoordinates(new Point3D(s.x, s.y - (d - c) / 50, s.z));
            const textPoint2D = toCanvasCoordinates(new Point3D(s.x, s.y >= c ? s.y - (d - c) / 25 : s.y + (d - c) / 25, s.z));
            ctx.beginPath();
            ctx.moveTo(offsetX + leftPoint2D.x, offsetY - leftPoint2D.y);
            ctx.lineTo(offsetX + rightPoint2D.x, offsetY - rightPoint2D.y);
            ctx.fillText(s.x.toFixed(3), offsetX + textPoint2D.x, offsetY - textPoint2D.y);
            ctx.stroke();
            ctx.closePath();
            s.sum(v);
        }
    }
}


function surfacePlot() {

    if (!autoZ) {
        max = z1;
        min = z0;
    }

    const canvas = document.getElementById('canvas2dFmp');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const heightToColor = getColorizer(min, max);

    axisPlot(true);

    if (gamma >= 0 && gamma < pi) {
        for (let x = 0; x < arr.length - 1; x++) {
            for (let y = 0; y < arr[0].length - 1; y++) {
                let validPoints = [arr[x][y], arr[x + 1][y], arr[x + 1][y + 1], arr[x][y + 1]]
                    .filter(elem => isFinite(elem.z) && elem.z >= min && elem.z <= max)
                    .map(elem => toCanvasCoordinates(elem));
                let z = arr[x][y].z;
                if (validPoints.length > 2) {
                    ctx.beginPath();
                    ctx.fillStyle = heightToColor(z);
                    validPoints.forEach(elem => ctx.lineTo(offsetX + elem.x, offsetY - elem.y));
                    ctx.fill();
                    ctx.lineWidth = 0.05;
                    ctx.strokeStyle = 'black';
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    } else {
        for (let x = arr.length - 1; x > 0; x--) {
            for (let y = arr[0].length - 1; y > 0; y--) {
                let validPoints = [arr[x][y], arr[x - 1][y], arr[x - 1][y - 1], arr[x][y - 1]]
                    .filter(elem => isFinite(elem.z) && elem.z >= min && elem.z <= max)
                    .map(elem => toCanvasCoordinates(elem));
                let z = arr[x][y].z;
                if (validPoints.length > 2) {
                    ctx.beginPath();
                    ctx.fillStyle = heightToColor(z);
                    validPoints.forEach(elem => ctx.lineTo(offsetX + elem.x, offsetY - elem.y));
                    ctx.fill();
                    ctx.lineWidth = 0.05;
                    ctx.strokeStyle = 'black';
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    }

    axisPlot();

}

function isolinesAxisPlot(offset) {
    const canvas = document.getElementById('canvas2dFmp');
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillStyle = 'black';

    const upPoint = new Point2D(offset, 0);
    const bottomPoint = new Point2D(offset, canvas.height - offset);
    const rightPoint = new Point2D(canvas.width, canvas.height - offset);
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
        ctx.fillText(value.toFixed(2), pt.x - 35, pt.y);
        value -= dy;
        pt.y += displayDY;
    }
    ctx.fillText(value.toFixed(2), pt.x - 35, pt.y);
    //-----------------------------------------------------
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
    ctx.fillText('Y', 4, (canvas.height - offset) / 2);
    ctx.fillText('X', canvas.width / 2, canvas.height - offset / 4);

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
}

function isolinesPlot() {
    const canvas = document.getElementById('canvas2dFmp');
    const ctx = canvas.getContext('2d');

    const offset = 50;

    ctx.fillStyle = 'white';
    ctx.fillRect(offset, 0, canvas.height - offset, canvas.width - offset);

    const clientWidth = canvas.width;
    const clientHeight = canvas.height;


    let step = (max - min) / 30;
    const heightToColor = getColorizer(min, max);

    const xScale = (clientWidth - offset) / abs(b - a);
    const yScale = (clientWidth - offset) / abs(d - c);

    checkedPoints.clear();

    for (let height = min + step; height <= max; height += step) {
        ctx.strokeStyle = heightToColor(height);
        const ms = new MarchingSquare(height);
        while (ms.findStartPoint()) {
            ctx.beginPath();
            const array = ms.buildLine();
            for (let elem of array) {
                if (!isNaN(elem[0])) {
                    ctx.lineTo(offset + (elem[0] - a) * xScale, clientHeight - offset - (elem[1] - c) * yScale);
                } else { //если маршин скуаре уперся в бордер то тип камбекаемся откуда стартовали
                    ctx.moveTo(offset + (array[0][0] - a) * xScale, clientHeight - offset - (array[0][1] - c) * yScale);
                }
            }
            ctx.stroke();
            ctx.closePath();
        }
    }
    isolinesAxisPlot(offset);
}
