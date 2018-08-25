'use strict';

const sqrt = (x) => Math.sqrt(x);
const sin = (x) => Math.sin(x);
const cos = (x) => Math.cos(x);
const tg = (x) => Math.tan(x);
const tan = tg;
const ctg = (x) => 1 / Math.tan(x);
const abs = (x) => Math.abs(x);
const log = (x) => Math.log(x);
const asin = (x) => Math.asin(x);
const acos = (x) => Math.acos(x);
const atg = (x) => Math.atan(x);
const actg = (x) => Math.PI / 2 - Math.atan(x);
const pi = Math.PI;
const e = Math.E;


class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function functionsFromString(f) {
    let i = 0, j = 0;
    let functions = [];
    while (j < f.length) {
        j++;
        if (j === f.length || f[j] === ',') {
            functions.push(f.substring(i, j));
            j++;
            i = j;
        }
    }
    return functions.map(func => func.replace(/\^/g, '**'))
                    .map(func => {return (x) => eval(func)});
}

let funcs = functionsFromString('sin(x)'); //Когда нибудь здесь будет пользовательский ввод, возможно

function buildAll(input, leftBorder, rightBorder, auto = true, botBorder, upBorder) {
    funcs = functionsFromString(input);
    a = leftBorder;
    b = rightBorder;
    max = -Infinity, min = Infinity;
    autoY = auto;
    if (!auto) {
      c = botBorder;
      d = upBorder;
    }
    if (b <= a || (d <= c && !auto)) {
        alert('Неверно заданы отрезки');
        return;
    }
    if (funcs.length > 5) {
        alert('Максимальное число функций - 5');
    }
    try {
        for (let func of funcs) {
            func(0);
        }
    } catch (e) {
        alert('Проверьте корректность введенных данных и попробуйте снова');
        return;
    }
    const pointSets = [];
    for (let func of funcs) {
        pointSets.push(getPoints(func, a, b));
    }
    gridPlot();
    for (let i = 0; i < pointSets.length; i++) {
        plot(pointSets[i], colors[i]);
    }
    markAxis();
}


let a = -10, b = 10;
let c = -10, d = 10;
let max = -Infinity, min = Infinity;
const offset = 50;
const canvSize = 650;

const colors = ['blue', 'red', 'green', 'orange', 'black'];
let plotNumber = 0;

//TODO here IS AUTO Y
let autoY = true;

function firstDerivative(f, x) {
    const der = (f(x + 0.0001) - f(x)) / 0.0001;
    if (!isNaN(der)) {
        return der;
    } else {
        return (f(x - 0.0001) - f(x)) / -0.0001;
    }
}


function getXScale() {
    return (canvSize - offset) / (b - a);
}

function getYScale() {
    if (autoY) {
        if (max !== min) {
            return (canvSize - offset) / abs(max - min);
        } else {
            return max === 0 ? 0 : 200 / max;
        }
    } else {
        return (canvSize - offset) / (d - c);
    }
}


let upAsympto = false;
let downAsympto = false;

const singularities = [];


function quadratureFirst(f1, f2, f3) {
    return 5 / 12 * f1 + 2 / 3 * f2 - 1 / 12 * f3;
}

function quadratureSecond(f1, f2, f3, f4) {
    return 3 / 8 * f1 + 19 / 24 * f2 - 5 / 24 * f3 + 1 / 24 * f4;
}


function getPointsSet(func, a, b, depth, epsilon, resultSet, afterRefinement = false) {

    const m = (a + b) / 2;

    const points = [a, (a + m) / 2, m, (m + b) / 2, b].map(x => new Point2D(x, func(x)));

    if (points.filter(point => !isNaN(point.y)).length === 0) {
        resultSet.add(new Point2D(m, NaN));
        return;
    }

    let locMin = Infinity;
    let locMax = -Infinity;

    for (let elem of points) {
        if (abs(elem.y) < locMin) {
            locMin = abs(elem.y);
        }
        locMax = Math.max(locMax, abs(elem.y));
    }

    if (depth <= 0) {
        resultSet.add(...points);
        return;
    }

    const refineIsNeeded = checkSmoothness(points[0].y, points[1].y, points[2].y) ||
        checkSmoothness(points[1].y, points[2].y, points[3].y) ||
        checkSmoothness(points[2].y, points[3].y, points[4].y);

    if (!refineIsNeeded) {

        const summaryCurveRatio = abs(quadratureSecond(points[0].y, points[1].y, points[2].y, points[3].y) -
            quadratureFirst(points[2].y, points[3].y, points[4].y));

        if (summaryCurveRatio <= epsilon) {
            resultSet.add(...points);
            return;
        }

    } else if (!afterRefinement) {
        const fd = firstDerivative(func, m);
        if (abs(fd) > 200) {
            const sd = (firstDerivative(func, m + 0.0001) - fd) / 0.0001;
            if (sd < 0) {
                downAsympto = true;
            } else {
                upAsympto = true;
            }

            singularities.push({a: a, b: b, epsilon: epsilon, depth: depth});
            return;
        }

    } else {
        const fd = firstDerivative(func, m);
        if ((locMin > max && fd > 0) || (locMax < min && fd < 0)) {
            resultSet.add(...points);
            return;
        }
    }

    getPointsSet(func, a, m, depth - 1, epsilon * 2, resultSet, afterRefinement);
    getPointsSet(func, m, b, depth - 1, epsilon * 2, resultSet, afterRefinement);
}

function checkSmoothness(a, b, c) {
    return checkCurve(a, b, c) || checkDegCase(a) ||
        checkDegCase(b) || checkDegCase(c);
}

function checkDegCase(a) {
    return isNaN(a) || !isFinite(a);
}

function checkCurve(a, b, c) {
    return (b < a && b < c) || (b > a && b > c);
}

function gridPlot() {
    const canvas = document.getElementById('canvas2dUsually');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 0.5;

    const dx = (canvas.width - offset) / 30;
    const dy = (canvas.height - offset) / 30;

    for (let y = dy; y < canvas.height - offset; y += dy) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        ctx.closePath();
    }

    for (let x = offset; x < canvas.width; x += dx) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        ctx.closePath();
    }

    const xScale = getXScale();
    const yScale = getYScale();

    if (a < 0 && b > 0) { //рисуем вертикальную линию
        ctx.strokeRect(offset, (canvSize - offset) + min * yScale, canvas.width - offset, 1.5);
    }

    if (min < 0 && max > 0) { // рисуем горизонтальную линию
        ctx.strokeRect(offset - a * xScale, 0, 1, canvas.height - offset);
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
    const canvas = document.getElementById('canvas2dUsually');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, offset, canvas.height);
    ctx.clearRect(0, canvas.height - offset, canvas.width, offset);

    ctx.strokeStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillStyle = 'black';

    const upLeftPoint = new Point2D(offset, 0);
    const bottomLeftPoint = new Point2D(offset, canvSize - offset);
    const bottomRightPoint = new Point2D(canvSize, canvSize - offset);

    ctx.beginPath();
    ctx.moveTo(upLeftPoint.x, upLeftPoint.y);
    ctx.lineTo(bottomLeftPoint.x, bottomLeftPoint.y);
    ctx.lineTo(bottomRightPoint.x, bottomRightPoint.y);
    ctx.stroke();
    ctx.closePath();


    ctx.beginPath();

    const amount = 15;
    const displayDY = (bottomLeftPoint.y - upLeftPoint.y) / amount;
    const dy = (max - min) / amount;
    const pt = new Point2D(upLeftPoint.x, upLeftPoint.y + displayDY);

    let value = max - dy;

    while (pt.y < bottomLeftPoint.y) {
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x + 7, pt.y);
        ctx.stroke();
        ctx.fillText(value.toFixed(2), pt.x - 45, pt.y);
        value -= dy;
        pt.y += displayDY;
    }
    ctx.fillText(value.toFixed(2), pt.x - 45, pt.y);

    const displayDX = (bottomRightPoint.x - bottomLeftPoint.x) / amount;
    const dx = (b - a) / amount;

    value = a;

    while (pt.x < bottomRightPoint.x) {
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
            ctx.clearRect(canvas.width / 1.3, canvas.height - 20, 3 * canvas.width / 13, 20);
            ctx.font = '12px Arial';
            ctx.fillStyle = 'black';
            const xRatio = (b - a) / (canvas.width - offset);
            const yRatio = (max - min) / (canvas.height - offset);
            ctx.fillText('x: ' + (a + xRatio * (x - offset)).toFixed(2) + '  y: ' +
                (max - y * yRatio).toFixed(2), canvas.width / 1.2, canvas.height - 10);
        }
    }, false);

}

function getPoints(func, a, b) {

    const delta = Math.min((b - a) / 150, 1);
    const N = delta * 150 === b - a ? 150 : b - a;

    const pointSet = new Set();

    for (let i = 1; i <= N; i++) {
        getPointsSet(func, a + (i - 1) * delta, a + i * delta, 10, 0.01, pointSet);
    }

    if (autoY) {
        for (let elem of pointSet) {
            if (isFinite(elem.y) && !isNaN(elem.y)) {
                if (elem.y > max) max = elem.y;
                if (elem.y < min) min = elem.y;
            }
        }
    } else {
        max = d;
        min = c;
    }

    let top = Math.max(abs(max), abs(min));

    //const oldMin = min;
    if (autoY && upAsympto && downAsympto) {
        max = abs(top);
        min = -abs(top);
    }

    if (singularities.length > 0) { // Если асимптоты таки есть у нас

        console.log(downAsympto, upAsympto);

        for (let i = 0; i < singularities.length; i++) {
            getPointsSet(func, singularities[i].a, singularities[i].b, 10, singularities[i].epsilon, pointSet, true);
        }
    }

    return pointSet;
}

function plot(pointSet, color = 'black') {


    const canvas = document.getElementById('canvas2dUsually');
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = color;
    ctx.lineWidth = 0.75;

    ctx.beginPath();

    console.log('maxmin', max, min);


    const pointArr = [...pointSet].sort((a, b) => a.x - b.x);
    console.log('kek', min, downAsympto, upAsympto);

    const xScale = getXScale();
    const yScale = getYScale();

    for (let i = 0; i < pointArr.length; i++) {
        if (isNaN(pointArr[i].y)) {
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            continue;
        }
        if (pointArr[i].y > max || pointArr[i].y < min) {
            //ctx.lineTo(offset + (pointArr[i].x - a) * xScale, (canvSize - offset) - (pointArr[i].y - oldMin) * yScale);
            ctx.lineTo(offset + (pointArr[i].x - a) * xScale, (canvSize - offset) - (pointArr[i].y - min) * yScale);
            ctx.stroke();
            ctx.closePath();
            while (i < pointArr.length && (pointArr[i].y > max || pointArr[i].y < min)) {
                i++;
            }
            i--;
            ctx.beginPath();
        }
        if (i < pointArr.length) {
            ctx.lineTo(offset + (pointArr[i].x - a) * xScale, (canvSize - offset) - (pointArr[i].y - min) * yScale);
        }

    }

    ctx.stroke();
    ctx.closePath();
}
