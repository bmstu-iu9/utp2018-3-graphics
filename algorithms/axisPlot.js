function mouseCoordinates(canvas, evnt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evnt.clientX - rect.left,
        y: evnt.clientY - rect.top
    };
}

function gridPlot(canvas, offset, a, b, c, d, xScale, yScale) {
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

    ctx.fillStyle = 'black';

    if (a < 0 && b > 0) { //рисуем вертикальную линию
        ctx.fillRect(offset, (canvas.height - offset) + c * yScale, canvas.width - offset, 1.5);
    }

    if (c < 0 && d > 0) { // рисуем горизонтальную линию
        ctx.fillRect(offset - a * xScale, 0, 1, canvas.height - offset);
    }
}

function markAxis(canvas, offset, a, b, c, d) {
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, offset, canvas.height);
    ctx.clearRect(0, canvas.height - offset, canvas.width, offset);

    ctx.strokeStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillStyle = 'black';

    const upLeftPoint = new Point2D(offset, 0);
    const bottomLeftPoint = new Point2D(offset, canvas.height - offset);
    const bottomRightPoint = new Point2D(canvas.height, canvas.height - offset);

    ctx.beginPath();
    ctx.moveTo(upLeftPoint.x, upLeftPoint.y);
    ctx.lineTo(bottomLeftPoint.x, bottomLeftPoint.y);
    ctx.lineTo(bottomRightPoint.x, bottomRightPoint.y);
    ctx.stroke();
    ctx.closePath();


    ctx.beginPath();

    const amount = 15;
    const displayDY = (bottomLeftPoint.y - upLeftPoint.y) / amount;
    const dy = (d - c) / amount;
    const pt = new Point2D(upLeftPoint.x, upLeftPoint.y + displayDY);

    let value = d - dy;

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
        const yRatio = (d - c) / (canvas.height - offset);
        ctx.fillText('x: ' + (a + xRatio * (x - offset)).toFixed(2) + '  y: ' +
            (d - y * yRatio).toFixed(2), canvas.width / 1.2, canvas.height - 10);
    }
}, false);

}