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

class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    sum(otherPoint) {
        this.x += otherPoint.x;
        this.y += otherPoint.y;
    }
}

class ImplicitMarchingSquare {

    constructor(h, arr) {
        this.h = h;
        this.NONE = 0;
        this.UP = 1;
        this.LEFT = 2;
        this.DOWN = 3;
        this.RIGHT = 4;

        this.borderFound = false;

        this.nextStep = this.NONE;

        this.arr = arr;

        this.i = 1;
        this.j = 1;

        this.x0 = 0;
        this.y0 = 0;
    }

    findStartPoint() {
        for (; this.i < this.arr.length - 1; this.i++) {
            this.j %= (this.arr[0].length - 1);
            if (this.j === 0) {
                this.j = 1;
                this.i++;
            }
            for (; this.j < this.arr[0].length - 1; this.j++) {
                if (this.arr[this.i][this.j].z <= this.h ||
                    (this.arr[this.i][this.j].z > this.h &&
                        (this.arr[this.i - 1][this.j - 1].z <= this.h ||
                            this.arr[this.i - 1][this.j].z <= this.h || this.arr[this.i][this.j - 1].z <= this.h))) {
                    this.x0 = this.i;
                    this.y0 = this.j;
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
                if (x === 0 || y === 0 || x === this.arr.length - 1 || y === this.arr[0].length - 1) {
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

            if (x > 0 && x < this.arr.length && y > 0 && y < this.arr[0].length) {
                let X, Y;
                switch (this.nextStep) {
                    case this.UP:
                        Y = this.arr[x][y].y;
                        X = this.arr[x - 1][y].x +
                            (this.arr[x][y].x - this.arr[x - 1][y].x) * (this.h - this.arr[x - 1][y].z) / (this.arr[x][y].z - this.arr[x - 1][y].z);
                        linePoints.push([X, Y]);
                        break;
                    case this.DOWN:
                        X = this.arr[x - 1][y - 1].x +
                            (this.arr[x][y - 1].x - this.arr[x - 1][y - 1].x) * (this.h - this.arr[x - 1][y - 1].z) / (this.arr[x][y - 1].z - this.arr[x - 1][y - 1].z);
                        Y = this.arr[x][y - 1].y;
                        linePoints.push([X, Y]);
                        break;
                    case this.RIGHT:
                        Y = this.arr[x][y - 1].y +
                            (this.arr[x][y].y - this.arr[x][y - 1].y) * (this.h - this.arr[x][y - 1].z) / (this.arr[x][y].z - this.arr[x][y - 1].z);
                        X = this.arr[x][y].x;
                        linePoints.push([X, Y]);
                        break;
                    case this.LEFT:
                        Y = this.arr[x - 1][y - 1].y +
                            (this.arr[x - 1][y].y - this.arr[x - 1][y - 1].y) * (this.h - this.arr[x - 1][y - 1].z) / (this.arr[x - 1][y].z - this.arr[x - 1][y - 1].z);
                        X = this.arr[x - 1][y].x;
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

        return linePoints;
    }

    check(x, y) {
        if (x < 0 || y < 0 || x >= this.arr.length || y >= this.arr[0].length) return false;
        return this.arr[x][y].z <= this.h;
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

class MarchingSquare {

    constructor(h, arr, checkedPoints = new Set()) {
        this.h = h;
        this.NONE = 0;
        this.UP = 1;
        this.LEFT = 2;
        this.DOWN = 3;
        this.RIGHT = 4;

        this.arr = arr;

        this.borderFound = false;

        this.nextStep = this.NONE;

        this.i = 1;
        this.j = 1;

        this.x0 = 0;
        this.y0 = 0;

        this.N = Math.max(arr.length, arr[0].length);

        this.checkedPoints = checkedPoints;
    }

    findStartPoint() {
        for (; this.i < this.arr.length - 1; this.i++) {
            this.j %= (this.arr[0].length - 1);
            if (this.j === 0) {
                this.j = 1;
                this.i++;
            }
            for (; this.j < this.arr[0].length - 1; this.j++) {
                if ((this.arr[this.i][this.j].z <= this.h ||
                        (this.arr[this.i][this.j].z > this.h &&
                            (this.arr[this.i - 1][this.j - 1].z <= this.h ||
                                this.arr[this.i - 1][this.j].z <= this.h || this.arr[this.i][this.j - 1].z <= this.h))) &&
                    !this.checkedPoints.has(this.i * this.N + this.j)) {
                    this.x0 = this.i;
                    this.y0 = this.j;
                    this.checkedPoints.add(this.i * this.N + this.j);
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
                if (x === 0 || y === 0 || x === this.arr.length - 1 || y === this.arr[0].length - 1) {
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
            this.checkedPoints.add(x * this.N + y);
            if (x > 0 && x < this.arr.length && y > 0 && y < this.arr[0].length) {
                let X, Y;
                switch (this.nextStep) {
                    case this.UP:
                        Y = this.arr[x][y].y;
                        X = this.arr[x - 1][y].x +
                            (this.arr[x][y].x - this.arr[x - 1][y].x) * (this.h - this.arr[x - 1][y].z) /
                            (this.arr[x][y].z - this.arr[x - 1][y].z);
                        linePoints.push([X, Y]);
                        break;
                    case this.DOWN:
                        X = this.arr[x - 1][y - 1].x +
                            (this.arr[x][y - 1].x - this.arr[x - 1][y - 1].x) * (this.h - this.arr[x - 1][y - 1].z) /
                            (this.arr[x][y - 1].z - this.arr[x - 1][y - 1].z);
                        Y = this.arr[x][y - 1].y;
                        linePoints.push([X, Y]);
                        break;
                    case this.RIGHT:
                        Y = this.arr[x][y - 1].y +
                            (this.arr[x][y].y - this.arr[x][y - 1].y) * (this.h - this.arr[x][y - 1].z) /
                            (this.arr[x][y].z - this.arr[x][y - 1].z);
                        X = this.arr[x][y].x;
                        linePoints.push([X, Y]);
                        break;
                    case this.LEFT:
                        Y = this.arr[x - 1][y - 1].y +
                            (this.arr[x - 1][y].y - this.arr[x - 1][y - 1].y) * (this.h - this.arr[x - 1][y - 1].z) /
                            (this.arr[x - 1][y].z - this.arr[x - 1][y - 1].z);
                        X = this.arr[x - 1][y].x;
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
        if (x < 0 || y < 0 || x >= this.arr.length || y >= this.arr[0].length) return false;
        return this.arr[x][y].z <= this.h;
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