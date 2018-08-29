'use strict';

function parametricFuncFromString(f) {
    f = f.replace(/\^/g, '**');
    return (t) => eval(f);
}

function polarToParametricFunc(r) {
    return['(' + r + ')*cos(t)', '(' + r + ')*sin(t)'];
}


function startParametric(xString, yString, t0, t1, isPolar = false) {

    const fX = parametricFuncFromString(xString);
    const fY = parametricFuncFromString(yString);

    if (t1 <= t0) {
        alert('Неверно задан отрезок');
        return;
    }
    try {
        fX(0);
        fY(0);
    } catch (e) {
        alert('Проверьте корректность введенных данных и попробуйте снова');
        return;
    }
    if (isPolar) {
        parametricPlot(fX, fY, t0, t1, document.getElementById('canvas2dPolar'));
    } else {
        parametricPlot(fX, fY, t0, t1, document.getElementById('canvas2dParametr'));
    }
}

function startPolar(rString, t0, t1) {
    const parametricFuncs = polarToParametricFunc(rString);
    startParametric(parametricFuncs[0], parametricFuncs[1], t0*pi/180, t1*pi/180, true);
}


function parametricPlot(fX, fY, t0, t1, canvas) {

    const ctx = canvas.getContext('2d');

    const canvasSize = canvas.height;

    const n = 10000;
    const dt = (t1 - t0) / n;
    const offset = 50;

    const pointSet = new Set();

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (let t = t0; t <= t1; t+=dt) {

        const x = fX(t);
        const y = fY(t);

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        pointSet.add(new Point2D(x, y));
    }

    const xScale = (canvasSize - offset) / abs(maxX - minX);
    const yScale = (canvasSize - offset) / abs(maxY - minY);

    gridPlot(canvas, offset, minX, maxX, minY, maxY, xScale, yScale);

    const points = [...pointSet];

    ctx.beginPath();

    ctx.strokeStyle = 'blue';

    for (let elem of points) {
        ctx.lineTo(offset + (elem.x - minX) * xScale, (canvasSize - offset) - (elem.y - minY) * yScale);
    }

    ctx.stroke();
    ctx.closePath();

    markAxis(canvas, offset, minX, maxX, minY, maxY);
}
