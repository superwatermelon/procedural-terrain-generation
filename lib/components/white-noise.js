import React from 'react';
import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { gradientToRgb } from '..';

const WHITE_NOISE_CHANGE_SIZE = 'change-size';
const WHITE_NOISE_REFRESH = 'refresh';

const whiteNoiseReducer = (state = { size: 16, generated: Date.now() }, action) => {
    switch (action.type) {
        case WHITE_NOISE_CHANGE_SIZE:
            return Object.assign({}, state, { size: action.value, generated: Date.now() });
        case WHITE_NOISE_REFRESH:
            return Object.assign({}, state, { generated: Date.now() });
        default:
            return state;
    }
};

class WhiteNoiseFigure extends React.Component {
    render() {
        return (
            <div>
                <form>
                    <label htmlFor="white-noise-interactive-size">
                        <span>Size</span>
                        <input id="white-noise-interactive-size" type="range" min="1" max="6" name="size" value={Math.log2(this.props.size)} onChange={this.props.changeSize}/>
                    </label>
                    <button onClick={this.props.refresh}>Refresh</button>
                </form>
                <canvas id="white-noise-interactive-terrain-canvas"/>
                <p>
                    <strong>Figure 4.</strong> A {this.props.size} × {this.props.size} heightmap constructed by generating white noise.
                    Generated: <time dateTime={new Date(this.props.generated).toISOString()}>{new Date(this.props.generated).toISOString()}</time>
                </p>
            </div>
        );
    }

    componentDidMount() {
        this.generateNoise();
        // this.updateCanvas();
        this.updateTerrainCanvas();
    }

    componentDidUpdate() {
        this.generateNoise();
        // this.updateCanvas();
        this.updateTerrainCanvas();
    }

    generateNoise() {
        const size = this.props.size;
        const noise = new Float32Array(size * size);
        for (let y = 0; y < size; ++y) {
            for (let x = 0; x < size; ++x) {
                noise[y * size + x] = Math.random();
            }
        }
        this.noise = noise;
    }

    updateCanvas() {
        const size = this.props.size;
        const noise = this.noise;
        const canvas = document.getElementById('white-noise-interactive-canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        const image = context.createImageData(size, size);
        const data = image.data;
        for (let i = 0; i < noise.length; ++i) {
            const height = Math.floor(noise[i] * 256);
            data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = height;
            data[i * 4 + 3] = 255;
        }
        context.putImageData(image, 0, 0);
    }

    updateTerrainCanvas() {
        const size = this.props.size;
        const noise = this.noise;
        const canvas = document.getElementById('white-noise-interactive-terrain-canvas');
        canvas.width = 640;
        canvas.height = 410;
        const ctx = canvas.getContext('2d');
        const xm = 0.85;
        const ym = 0.5;
        const tile = 0.5 * (640 / xm) / (size - 1);
        const height = 40;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.translate(320, height);
        for (let y = 0; y < size - 1; ++y) {
            for (let x = 0; x < size - 1; ++x) {
                const nw = Math.floor(noise[y * size + x] * height);
                const ne = Math.floor(noise[y * size + x + 1] * height);
                const sw = Math.floor(noise[(y + 1) * size + x] * height);
                const se = Math.floor(noise[(y + 1) * size + x + 1] * height);
                const top = x * ym * tile + y * ym * tile;
                const left = x * xm * tile - y * xm * tile;
                ctx.beginPath();
                ctx.fillStyle = gradientToRgb((nw - (ne + sw) / 2) / height);
                ctx.moveTo(left, top - nw);
                ctx.lineTo(left + xm * tile, top - ne + ym * tile);
                ctx.lineTo(left - xm * tile, top - sw + ym * tile);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.fillStyle = gradientToRgb(((ne + sw) / 2 - se) / height);
                ctx.moveTo(left, top - se + 2 * ym * tile);
                ctx.lineTo(left + xm * tile, top - ne + ym * tile);
                ctx.lineTo(left - xm * tile, top - sw + ym * tile);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
    }
}

const WhiteNoiseFigureWithStateStore = connect((state, props) => ({
    size: state.size,
    generated: state.generated
}), dispatch => ({
    changeSize: e => dispatch({ type: WHITE_NOISE_CHANGE_SIZE, value: Math.pow(2, e.target.value) }),
    refresh: e => {
        e.preventDefault();
        dispatch({ type: WHITE_NOISE_REFRESH });
    }
}))(WhiteNoiseFigure);

const whiteNoiseStore = createStore(whiteNoiseReducer);
export const WhiteNoiseInteractiveFigure = props => (
    <Provider store={whiteNoiseStore}>
        <WhiteNoiseFigureWithStateStore/>
    </Provider>
);