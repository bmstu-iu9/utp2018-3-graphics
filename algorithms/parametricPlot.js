'use strict';

function parametricFuncFromString(f) {
    f = f.replace(/\^/g, '**');
    return (t) => eval(f);
}

function polarToParametricFunc(r) {
    return['(' + r + ')*cos(t)', '(' + r + ')*sin(t)'];
}

function checkInputParametric(xString, yString, t0, t1) {
    const fX = parametricFuncFromString(xString);
    const fY = parametricFuncFromString(yString);

    if (t1 <= t0) {
        alert('Неверно задан интервал');
        return null;
    }
    try {
        fX(0);
        fY(0);
    } catch (e) {
        alert('Проверьте корректность введенных данных и попробуйте снова');
        return null;
    }
    return true;
}

function checkInputPolar(rString, t0, t1) {
    const parametricFuncs = polarToParametricFunc(rString);
    return checkInputParametric(parametricFuncs[0], parametricFuncs[1], t0*Math.PI/180, t1*Math.PI/180);
}

function startParametric(xString, yString, t0, t1, isPolar = false) {

    const fX = parametricFuncFromString(xString);
    const fY = parametricFuncFromString(yString);

    if (isPolar) {
        parametricPlot(fX, fY, t0, t1, document.getElementById('canvas2dPolar'));
    } else {
        parametricPlot(fX, fY, t0, t1, document.getElementById('canvas2dParametr'));
    }
}

function startPolar(rString, t0, t1) {
    const parametricFuncs = polarToParametricFunc(rString);
    startParametric(parametricFuncs[0], parametricFuncs[1], t0*Math.PI/180, t1*Math.PI/180, true);
}


function parametricPlot(fX, fY, t0, t1, canvas) {

    const ctx = canvas.getContext('2d');

    const offset = 50;

    const pointsX = [...getPoints(fX, t0, t1, 9, 0.00001)].sort((a, b) => a.x - b.x);
    const a = min;
    const b = max;
    const pointsY = [...getPoints(fY, t0, t1, 9, 0.00001)].sort((a, b) => a.x - b.x);
    const c = min;
    const d = max;


    const xScale = (canvas.width - offset) / abs(b - a);
    const yScale = (canvas.height - offset) / abs(d - c);

    gridPlot(canvas, offset, a, b, c, d, xScale, yScale);


    ctx.beginPath();

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 0.75;

    let i = 0, j = 0;
    while (i < pointsX.length && j < pointsY.length) {
        if (pointsX[i].x < pointsY[j].x) {
            const pt = new Point2D(pointsX[i].x, fX(pointsX[i].x));
            if (isFinite(pt.y) && isFinite(pointsY[j].y)) {
                ctx.lineTo(offset + (pt.y - a) * xScale, (canvas.height - offset) - (pointsY[j].y - c) * yScale);
            } else {
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
            }
            i++;
        } else if (pointsX[i].x > pointsY[j].x) {
            const pt = new Point2D(pointsY[j].x, fY(pointsY[j].x));
            if (isFinite(pt.y) && isFinite(pointsX[i].y)) {
                ctx.lineTo(offset + (pointsX[i].y - a) * xScale, (canvas.height - offset) - (pt.y - c) * yScale);
            } else {
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
            }
            j++;
        } else {
            if (isFinite(pointsX[i].y) && isFinite(pointsY[j].y)) {
                ctx.lineTo(offset + (pointsX[i].y - a) * xScale, (canvas.height - offset) - (pointsY[j].y - c) * yScale);
            } else {
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
            }
            i++;
            j++;
        }
    }

    ctx.stroke();
    ctx.closePath();

    markAxis(canvas, offset, a, b, c, d);
}
