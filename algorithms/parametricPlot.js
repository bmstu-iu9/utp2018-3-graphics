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

    axisPlotParametric(canvas, offset);

    const pointSet = new Set();

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    ctx.strokeStyle = 'blue';

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

    const points = [...pointSet];

    ctx.beginPath();

    for (let elem of points) {
        ctx.lineTo(offset + (elem.x - minX) * xScale, (canvasSize - offset) - (elem.y - minY) * yScale);
    }

    ctx.stroke();
    ctx.closePath();

    markAxisParametric(minX, maxX, minY, maxY, offset, canvas);
}

function axisPlotParametric(canvas, offset) {

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

function markAxisParametric(a, b, c, d, offset, canvas) {

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