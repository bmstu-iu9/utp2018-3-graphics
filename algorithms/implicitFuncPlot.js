'use strict';

let height = 0;

function implicitFuncFromString(funcString) {
    funcString = funcString.replace(/\^/g, '**');
    let i = 0;
    while (funcString[i] !== '=') i++;
    height = eval(funcString.substring(i + 1));
    funcString = funcString.substring(0, i);
    return (x, y) => eval(funcString);
}


function startImpl(funcIn, a1, a2, a3, a4) {
    const f = implicitFuncFromString(funcIn);

    const arr = [];
    const n = 200;
    const a = a1;
    const b = a2;
    const c = a3;
    const d = a4;

    const dx = (b - a) / n;
    const dy = (d - c) / n;

    const offset = 50;

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
    implicitPlot(arr, a, b, c, d, offset);
}


function implicitPlot(arr, a, b, c, d, offset) {

    const canvas = document.getElementById('canvas2dImplicity');
    const ctx = canvas.getContext('2d');

    const canvasSize = canvas.height;
    const xScale = (canvasSize - offset) / abs(b - a);
    const yScale = (canvasSize - offset) / abs(d - c);

    gridPlot(canvas, offset, a, b, c, d, xScale, yScale);

    const ms = new ImplicitMarchingSquare(height, arr);
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

    markAxis(canvas, offset, a, b, c, d);
}

