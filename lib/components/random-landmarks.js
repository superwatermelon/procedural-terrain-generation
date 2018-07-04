import React from 'react';
import { createStore } from 'redux';
import { connect, Provider } from "react-redux";

import { permutations } from '..';

const FONT = '30px Roboto';
const BACKGROUND_COLOR = '#39D';
const FOREGROUND_COLOR = '#FFF';

const ACTION_TYPE_REFRESH = 'refresh';
const ACTION_TYPE_CHANGE_SIZE = 'change-size';
const ACTION_TYPE_CHANGE_DISTANCE = 'change-distance';

// If we were unable to produce a suitable result within this many attempts
// simply return the last attempt.
const GENERATE_ITERATION_LIMIT = 999;

const generatePoints = (count, width, height, distance) => {
    let iterations = 0;
    while (++iterations) {
        const points = [];
        for (let i = 0; i < count; ++i) {
            points.push([Math.floor(Math.random() * width), Math.floor(Math.random() * height)]);
        }
        const result = assignPoints(points, distance);
        if (result.score > 1 || iterations >= GENERATE_ITERATION_LIMIT) {
            return Object.assign({}, result, {
                iterations
            });
        }
    }
};

const validateMidPointsCloser = points => {
    if (points.length < 3) {
        return true;
    }
    const start = points[0];
    const end = points[points.length - 1];
    const pivot = Math.floor(points.length / 2);
    const selected = points[pivot];
    const ax = Math.abs(start[0] - end[0]);
    const ay = Math.abs(start[1] - end[1]);
    const bx = Math.abs(start[0] - selected[0]);
    const by = Math.abs(start[1] - selected[1]);
    const cx = Math.abs(selected[0] - end[0]);
    const cy = Math.abs(selected[1] - end[1]);
    const a = ax * ax + ay * ay;
    const b = bx * bx + by * by;
    const c = cx * cx + cy * cy;
    if (a < b || a < c) {
        return false;
    }
    for (let i = 0; i < points.length - pivot; ++i) {
        if (!validateMidPointsCloser(points.slice(i, i + pivot + 1))) {
            return false;
        }
    }
    return true;
};

const validateMinSeparation = (points, d) => {
    for (let i = 0; i < points.length; ++i) {
        for (let j = i + 1; j < points.length; ++j) {
            const a = points[i];
            const b = points[j];
            const dx = Math.abs(a[0] - b[0]);
            const dy = Math.abs(a[1] - b[1]);
            if ((dx * dx + dy * dy) < d * d) {
                return false;
            }
        }
    }
    return true;
};

const shuffle = (arr) => {
    for (let i = 0; i < arr.length; ++i) {
        arr.splice(i, 0, arr.splice(i + Math.floor(Math.random() * (arr.length - i)), 1)[0]);
    }
};

const assignPoints = (points, distance) => {
    const perms = permutations(points);
    const scored = perms.map(points => {
        return ({
            points,
            score: validateMidPointsCloser(points) * 1 + validateMinSeparation(points, distance) * 1
        })
    });
    shuffle(scored);
    scored.sort((a, b) => b.score - a.score);
    return scored[0];
};

const reducer = (state = { size: 64, distance: 8, generated: Date.now() }, action) => {
    switch (action.type) {
        case ACTION_TYPE_CHANGE_SIZE:
            return Object.assign({}, state, { size: action.value, generated: Date.now() });
        case ACTION_TYPE_CHANGE_DISTANCE:
            return Object.assign({}, state, { distance: action.value, generated: Date.now() });
        case ACTION_TYPE_REFRESH:
            return Object.assign({}, state, { generated: Date.now() });
        default:
            return state;
    }
};

function drawLandmarkMarker(ctx, y, x, xScale, tileSize, yScale, points, i) {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo((-y + x) * xScale * tileSize, (y + x) * yScale * tileSize - 10);
    ctx.arc((-y + x) * xScale * tileSize, (y + x) * yScale * tileSize - 70, 40, 3 * Math.PI / 4, Math.PI / 4, false);
    ctx.closePath();

    ctx.fillStyle = FOREGROUND_COLOR;
    ctx.shadowColor = BACKGROUND_COLOR;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fill();

    ctx.restore();

    ctx.save();

    ctx.font = FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillText(points[i].name, (-y + x) * xScale * tileSize, (y + x) * yScale * tileSize - 70)

    ctx.restore();
}

function drawPath(ctx, result, xScale, tileSize, yScale) {
    ctx.save();

    ctx.beginPath();
    for (let i = 0; i < result.points.length; ++i) {
        const x = result.points[i][0];
        const y = result.points[i][1];
        if (i === 0) {
            ctx.moveTo((-y + x) * xScale * tileSize, (y + x) * yScale * tileSize);
        } else {
            ctx.lineTo((-y + x) * xScale * tileSize, (y + x) * yScale * tileSize);
        }
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = BACKGROUND_COLOR;
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.strokeStyle = FOREGROUND_COLOR;
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.restore();
}

function drawBoundary(ctx, yScale, xScale, canvasWidth, boundary) {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(0, yScale / xScale);
    ctx.lineTo(canvasWidth - boundary, (-boundary + canvasWidth) * yScale / xScale);
    ctx.lineTo(0, (-boundary + canvasWidth) * 2 * yScale / xScale);
    ctx.lineTo(-canvasWidth + boundary, (-boundary + canvasWidth) * yScale / xScale);
    ctx.closePath();

    ctx.strokeStyle = FOREGROUND_COLOR;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
}

function drawGrid(ctx, size, xScale, tileSize, yScale) {
    ctx.save();

    ctx.strokeStyle = FOREGROUND_COLOR;
    ctx.lineWidth = 1;

    for (let y = 0; y < size; ++y) {
        for (let x = 0; x < size; ++x) {
            ctx.beginPath();
            ctx.moveTo((-y + x) * xScale * tileSize, (y + x) * yScale * tileSize);
            ctx.lineTo((-y + x + 1) * xScale * tileSize, (y + x + 1) * yScale * tileSize);
            ctx.lineTo((-y + x) * xScale * tileSize, (y + x + 2) * yScale * tileSize);
            ctx.lineTo((-y + x - 1) * xScale * tileSize, (y + x + 1) * yScale * tileSize);
            ctx.closePath();
            ctx.stroke();
        }
    }

    ctx.restore();
}

function drawArea(ctx, boundary, yScale, xScale, canvasWidth) {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(0, -boundary * yScale / xScale);
    ctx.lineTo(canvasWidth, (-boundary + canvasWidth) * yScale / xScale);
    ctx.lineTo(0, (-boundary + canvasWidth * 2) * yScale / xScale);
    ctx.lineTo(-canvasWidth, (-boundary + canvasWidth) * yScale / xScale);
    ctx.closePath();

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fill();

    ctx.restore();
}

class RandomLandmarksFigure extends React.Component {
    render() {
        this.size = 32;
        const distance = this.props.distance;
        this.result = generatePoints(5, this.size, this.size, distance);
        return (
            <div>
                <form>
                    <span>
                        <label>Min distance</label>
                        <input type="range" min="1" max="3" name="distance" value={Math.log2(this.props.distance)} onChange={this.props.changeDistance}/>
                    </span>
                    <button onClick={this.props.refresh}>Refresh</button>
                </form>
                <canvas id="random-landmarks-canvas"/>
                <p>
                    <strong>Figure 3.</strong> Placement of landmarks with rules and score threshold with a minimum
                    distance of {this.props.distance} units between landmarks. Above result generated
                    after {this.result.iterations} attempts.
                </p>
            </div>
        );
    }

    componentDidMount() {
        this.updateCanvas();
    }

    componentDidUpdate() {
        this.updateCanvas();
    }

    updateCanvas() {
        const size = this.size;
        const result = this.result;
        const canvas = document.getElementById('random-landmarks-canvas');
        const canvasWidth = 1024;
        const xScale = 0.85;
        const yScale = 0.5;
        const boundary = 160;
        const top = 80;
        const tileSize = (canvasWidth - boundary) / (size * xScale);

        canvas.width = canvasWidth;
        canvas.height = top + canvasWidth * yScale / xScale;

        const ctx = canvas.getContext('2d');

        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.strokeStyle = FOREGROUND_COLOR;

        ctx.scale(0.5, 0.5);
        ctx.translate(canvasWidth, top + boundary * yScale / xScale);

        drawArea(ctx, boundary, yScale, xScale, canvasWidth);
        drawGrid(ctx, size, xScale, tileSize, yScale);
        drawBoundary(ctx, yScale, xScale, canvasWidth, boundary);
        drawPath(ctx, result, xScale, tileSize, yScale);

        const points = result.points.map((point, i) => ({ point, name: String.fromCharCode(65 + i) }));
        points.sort((a, b) => (a.point[0] + a.point[1]) - (b.point[0] + b.point[1]));

        for (let i = 0; i < result.points.length; ++i) {
            const x = points[i].point[0];
            const y = points[i].point[1];

            drawLandmarkMarker(ctx, y, x, xScale, tileSize, yScale, points, i);
        }
    }
}

const store = createStore(reducer);
const RandomLandmarksFigureWithStateStore = connect(
    state => ({
        generated: state.generated,
        size: state.size,
        distance: state.distance
    }),
    dispatch => ({
        changeSize: e => dispatch({ type: ACTION_TYPE_CHANGE_SIZE, value: Math.pow(2, e.target.value) }),
        changeDistance: e => dispatch({ type: ACTION_TYPE_CHANGE_DISTANCE, value: Math.pow(2, e.target.value) }),
        refresh: e => {
            e.preventDefault();
            dispatch({ type: ACTION_TYPE_REFRESH });
        }
    })
)(RandomLandmarksFigure);

export const RandomLandmarksInteractiveFigure = props => (
    <Provider store={store}>
        <RandomLandmarksFigureWithStateStore/>
    </Provider>
);
