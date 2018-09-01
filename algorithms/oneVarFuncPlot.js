'use strict';

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
    const canvas = document.getElementById('canvas2dUsually');
    const funcs = functionsFromString(input);
    const a = leftBorder;
    const b = rightBorder;

    const offset = 50;
    if (rightBorder <= leftBorder || (upBorder <= botBorder && !auto)) {
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
        pointSets.push(getPoints(func, a, b, 10, 0.01, auto, botBorder, upBorder));
    }

    const c = !auto ? botBorder : min;
    const d = !auto ? upBorder : max;

    gridPlot(canvas, offset, a, b, c, d, getXScale(offset, a, b), getYScale(offset, max, min, auto));

    for (let i = 0; i < pointSets.length; i++) {
        plot(pointSets[i], colors[i], a, b, offset, auto, c, d);
    }
    markAxis(canvas, offset, a, b, c, d);
}

const canvSize = 650;

const colors = ['blue', 'red', 'green', 'orange', 'black'];
let plotNumber = 0;

function firstDerivative(f, x) {
    const der = (f(x + 0.0001) - f(x)) / 0.0001;
    if (!isNaN(der)) {
        return der;
    } else {
        return (f(x - 0.0001) - f(x)) / -0.0001;
    }
}


function getXScale(offset, a, b) {
    return (canvSize - offset) / (b - a);
}

function getYScale(offset, max, min, autoY) {
    if (autoY) {
        if (max !== min) {
            return (canvSize - offset) / abs(max - min);
        } else {
            return max === 0 ? 0 : 200 / max;
        }
    } else {
        return (canvSize - offset) / (max - min);
    }
}


let upAsympto = false;
let downAsympto = false;

const singularities = [];

let max = -Infinity;
let min = Infinity;


function quadratureFirst(f1, f2, f3) {
    return 5 / 12 * f1 + 2 / 3 * f2 - 1 / 12 * f3;
}

function quadratureSecond(f1, f2, f3, f4) {
    return 3 / 8 * f1 + 19 / 24 * f2 - 5 / 24 * f3 + 1 / 24 * f4;
}


function getPointsSet(func, a, b, depth, epsilon, resultSet, afterRefinement = false, singularities) {

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

    getPointsSet(func, a, m, depth - 1, epsilon * 2, resultSet, afterRefinement, singularities);
    getPointsSet(func, m, b, depth - 1, epsilon * 2, resultSet, afterRefinement, singularities);
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


function getPoints(func, a, b, accuracy, eps, autoY = true, c, d) {


    const delta = Math.min((b - a) / 150, 1);
    const N = abs(delta * 150 - (b - a)) < 0.0001 ? 150 : Math.ceil(b - a);


    const pointSet = new Set();
    const singularities = [];

    upAsympto = false;
    downAsympto = false;

    max = -Infinity;
    min = Infinity;

    for (let i = 1; i <= N; i++) {
        getPointsSet(func, a + (i - 1) * delta, a + i * delta, accuracy, eps, pointSet, false, singularities);
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

    if (autoY && upAsympto && downAsympto) {
        max = abs(top);
        min = -abs(top);
    }

    if (singularities.length > 0) { // Если асимптоты таки есть у нас

        for (let i = 0; i < singularities.length; i++) {
            getPointsSet(func, singularities[i].a, singularities[i].b, accuracy, singularities[i].epsilon, pointSet, true);
        }
    }

    return pointSet;
}

function plot(pointSet, color = 'black', a, b, offset, autoY = true, c, d) {


    const canvas = document.getElementById('canvas2dUsually');
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = color;
    ctx.lineWidth = 0.75;

    ctx.beginPath();


    const pointArr = [...pointSet].sort((a, b) => a.x - b.x);

    const xScale = getXScale(offset, a, b);
    const yScale = getYScale(offset, d, c, autoY);

    for (let i = 0; i < pointArr.length; i++) {
        if (isNaN(pointArr[i].y)) {
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            continue;
        }
        if (pointArr[i].y > max || pointArr[i].y < min) {
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
