'use strict';

let height = 0;

function implicitFuncFromString(funcString) {
    funcString = funcString.replace(/\^/g, '**')
        .replace(/(\)|\d|x|y)(\w)/g, '$1*$2');
    let i = 0;
    while (i < funcString.length && funcString[i] !== '=') i++;
    const heightValue = eval(funcString.substring(i + 1));
    if (!isFinite(heightValue)) {
        return null;
    }
    height = heightValue;
    funcString = funcString.substring(0, i);
    return (x, y) => eval(funcString);
}


function checkInputImplicit(funcIn, a1Str, a2Str, a3Str, a4Str) {
    if (funcIn.length === 0) {
        alert('Введите равенство, неявно задающее функцию');
        return null;
    }
    try {
        eval(a1Str);
        eval(a2Str);
        eval(a3Str);
        eval(a4Str);
    } catch (e) {
        alert('Неверно заданы интервалы');
        return null;
    }

    const a1 = eval(a1Str);
    const a2 = eval(a2Str);
    const a3 = eval(a3Str);
    const a4 = eval(a4Str);

    if (!isFinite(a2) || !isFinite(a1) || a2 <= a1 ||
        !isFinite(a3) || !isFinite(a4) || a4 <= a3) {
        alert('Неверно заданы интервалы');
        return null;
    }

    try {
        const f = implicitFuncFromString(funcIn);
        f(0, 0);
    } catch (e) {
        alert('Проверьте корректность введенных данных и попробуйте снова');
        return null;
    }

    return true;
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

