'use strict';

function funcFromString(f) {
    f = f.replace(/\^/g, '**')
        .replace(/(\)|\d|x|y)([a-z]|\()/g, '$1*$2');
    return (x, y) => eval(f);
}

function checkInputTwoVar(funcIn, a1Str, a2Str, a3Str, a4Str, autoZ = true, z0, z1) {
    if (funcIn.length === 0) {
        alert('Введите функцию');
        return null;
    }
    const f = funcFromString(funcIn);
    try {
        eval(a1Str);
        eval(a2Str);
        eval(a3Str);
        eval(a4Str);
        if (!autoZ) {
            eval(z0);
            eval(z1);
        }
    } catch (e) {
        alert('Неверно заданы интервалы');
        return null;
    }

    const a1 = eval(a1Str);
    const a2 = eval(a2Str);
    const a3 = eval(a3Str);
    const a4 = eval(a4Str);

    if (!isFinite(a2) || !isFinite(a1) || a2 <= a1 ||
        !isFinite(a3) || !isFinite(a4) || a4 <= a3 ||
        (!autoZ && (!isFinite(eval(z1)) || !isFinite(eval(z0)) || eval(z1) <= eval(z0)))) {
        alert('Неверно заданы интервалы');
        return null;
    }
    try {
        f(0, 0);
    } catch(error) {
        alert('Проверьте корректность введенных данных и попробуйте снова.');
        return null;
    }
    return true;
}

function start(funcIn, a1, a2, a3, a4, autoZ = true, z0, z1) {
    const f = funcFromString(funcIn);

    const a = a1;
    const b = a2;
    const c = a3;
    const d = a4;

    const n = 250;

    alpha = pi;
    beta = pi / 2.6;
    gamma = 1.4 * pi;

    const dx = Math.min((b - a) / n, 1);
    const dy = Math.min((d - c) / n, 1);

    const arr = [];

    let max = -Infinity;
    let min = Infinity;

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

    if (!autoZ) {
        max = z1;
        min = z0;
    }

    surfacePlot(arr, min, max, a, b, c, d, autoZ);
    isolinesPlot(arr, min, max, a, b, c, d);

    rotateRight = () => {
        gamma += pi / 10;
        if (gamma >= 2 * pi) gamma = 0;
        surfacePlot(arr, min, max, a, b, c, d, autoZ);
    }

    rotateLeft = () => {
        gamma -= pi / 10;
        if (gamma <= 0) gamma = 2 * pi;
        surfacePlot(arr, min, max, a, b, c, d, autoZ);
    }
}

let alpha = 0, beta = 0, gamma = 0;


const offsetX = 300;
const offsetY = 500;

const a11 = () => cos(alpha) * cos(gamma) - sin(alpha) * cos(beta) * sin(gamma);
const a12 = () => -cos(alpha) * sin(gamma) - cos(beta) * sin(alpha) * cos(gamma);
const a13 = () => sin(beta) * sin(alpha);
const a21 = () => sin(alpha) * cos(gamma) + cos(beta) * cos(alpha) * sin(gamma);
const a22 = () => -sin(alpha) * sin(gamma) + cos(beta) * cos(alpha) * cos(gamma);
const a23 = () => -sin(beta) * cos(alpha);


function getCoordinatesConverter(max, min, a, b, c, d) {
    const xScale = 400 / (b - a);
    const yScale = 400 / (d - c);
    const zScale = 400 / (max - min);
    return (point) => {
        const cX = a11() * (point.x - (a + (b - a) / 2)) * xScale +
            a12() * (point.y - (c + (d - c) / 2)) * yScale +
            a13() * ((point.z - min) * zScale);
        const cY = a21() * (point.x - (a + (b - a) / 2)) * xScale +
            a22() * (point.y - (c + (d - c) / 2)) * yScale +
            a23() * ((point.z - min) * zScale);
        return new Point2D(cX, cY);
    }
}


let rotateRight = () => {}
let rotateLeft = () => {}

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

function axis3DPlot(backSide = false, a, b, c, d, min, max) {

    const canvas = document.getElementById('canvas2dFmp');
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    let mainPoint = new Point3D(b, c, min);

    ctx.beginPath();

    const xScale = 400 / (b - a);
    const yScale = 400 / (d - c);

    const toCanvasCoordinates = getCoordinatesConverter(max, min, a, b, c, d);

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

        markLines(mainPoint, a, b, c, d, min, max);
    }

}

function markLines(mainPoint, a, b, c, d, min, max) {
    const addPointY = new Point3D(mainPoint.x, mainPoint.y === c ? mainPoint.y + d - c : mainPoint.y - d + c, mainPoint.z);
    const addPointX = new Point3D(mainPoint.x === a ? mainPoint.x + b - a : mainPoint.x - b + a, mainPoint.y, mainPoint.z);
    const addPointZ = new Point3D(addPointX.x, addPointX.y, mainPoint.z + max - min);

    markLine(mainPoint, addPointX, 10, a, b, c, d, min, max);
    markLine(mainPoint, addPointY, 10, a, b, c, d, min, max);
    markLine(addPointX, addPointZ, 10, a, b, c, d, min, max);
}

function markLine(startPoint, endPoint, amount, a, b, c, d, min, max) {

    const canvas = document.getElementById('canvas2dFmp');
    const ctx = canvas.getContext('2d');

    ctx.font = '10px Arial';
    ctx.fillStyle = 'black';

    const xScale = 400 / (b - a);
    const yScale = 400 / (d - c);

    const v = new Point3D((endPoint.x - startPoint.x) / amount, (endPoint.y - startPoint.y) / amount, (endPoint.z - startPoint.z) / amount);
    const s = new Point3D(startPoint.x + v.x, startPoint.y + v.y, startPoint.z + v.z);

    const toCanvasCoordinates = getCoordinatesConverter(max, min, a, b, c, d);

    if (abs(startPoint.x - endPoint.x) < 0.01) { //vertical line
        const oZ = startPoint.z !== endPoint.z;
        while (abs(s.y - endPoint.y) > 0.1 || abs(s.z - endPoint.z) > 0.1) {
            const leftPoint2D = toCanvasCoordinates(new Point3D(s.x + (b - a) / 50, s.y, s.z));
            const rightPoint2D = toCanvasCoordinates(new Point3D(s.x - (b - a) / 50, s.y, s.z));
            const textPoint2D = toCanvasCoordinates(new Point3D(s.x >= a ? s.x - (b - a) / 10 : s.x + (b - a) / 25, s.y, s.z));
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


function surfacePlot(arr, min, max, a, b, c, d, autoZ) {

    const canvas = document.getElementById('canvas2dFmp');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const heightToColor = getColorizer(min, max);

    axis3DPlot(true, a, b, c, d, min, max);

    const xScale = 400 / (b-a);
    const yScale = 400 / (d - c);

    const toCanvasCoordinates = getCoordinatesConverter(max, min, a, b, c, d);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 0.05;
    

    if (gamma >= 0 && gamma < pi || gamma == 2*pi) {
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
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    }

    axis3DPlot(false, a, b, c, d, min, max);

}

function isolinesPlot(arr, min, max, a, b, c, d) {
    const canvas = document.getElementById('canvasIsolines');
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

    const checkedPoints = new Set();

    gridPlot(canvas, offset, a, b, c, d, xScale, yScale);

    for (let height = min + step; height <= max; height += step) {
        ctx.strokeStyle = heightToColor(height);
        const ms = new MarchingSquare(height, arr, checkedPoints);
        ctx.lineWidth = 1.5;
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
    markAxis(canvas, offset, a, b, c, d);
}
