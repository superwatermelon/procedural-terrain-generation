import React from 'react';
import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { gradientToRgb } from '..';

const SINE_WAVE_CHANGE_SIZE = 'change-size';
const SINE_WAVE_CHANGE_FREQUENCY = 'change-frequency';

const sineWaveReducer = (state = { size: 16, frequency: 16, generated: Date.now() }, action) => {
    switch (action.type) {
        case SINE_WAVE_CHANGE_SIZE:
            return Object.assign({}, state, { size: action.value, generated: Date.now() });
        case SINE_WAVE_CHANGE_FREQUENCY:
            return Object.assign({}, state, { frequency: action.value, generated: Date.now() });
        default:
            return state;
    }
};

class SineWaveFigure extends React.Component {
    render() {
        return (
            <div>
                <form>
                    <label htmlFor="sine-wave-interactive-size">
                        <span>Size</span>
                        <input id="sine-wave-interactive-size" type="range" min="1" max="6" name="size" value={Math.log2(this.props.size)} onChange={this.props.changeSize}/>
                    </label>
                    <label htmlFor="sine-wave-interactive-frequency">
                        <span>Frequency</span>
                        <input id="sine-wave-interactive-frequency" type="range" min="1" max="40" name="frequency" value={this.props.frequency} onChange={this.props.changeFrequency}/>
                    </label>
                </form>
                <canvas id="sine-wave-terrain-canvas"/>
                <p>A {this.props.size} × {this.props.size} heightmap constructed from a sine wave of frequency {this.props.frequency}.</p>
                <time dateTime={new Date(this.props.generated).toISOString()}>Generated: {new Date(this.props.generated).toISOString()}</time>
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
        const f = this.props.frequency;
        const noise = new Float32Array(size * size);
        for (let y = 0; y < size; ++y) {
            for (let x = 0; x < size; ++x) {
                noise[y * size + x] = Math.sin((x - 0.5 * Math.PI) / size * f) * Math.sin((y - 0.5 * Math.PI) / size * f) * 0.5 + 0.5;
            }
        }
        this.noise = noise;
    }

    updateCanvas() {
        const size = this.props.size;
        const f = this.props.frequency;
        const canvas = document.getElementById('sine-wave-canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        const image = context.createImageData(size, size);
        const data = image.data;
        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % size;
            const y = Math.floor((i / 4) / size);
            const height = Math.round((Math.sin(x / size * f) * Math.sin(y / size * f) * 0.5 + 0.5) * 255);
            data[i] = data[i + 1] = data[i + 2] = height;
            data[i + 3] = 255;
        }
        context.putImageData(image, 0, 0);
    }

    updateTerrainCanvas() {
        const size = this.props.size;
        const noise = this.noise;
        const canvas = document.getElementById('sine-wave-terrain-canvas');
        canvas.width = 640;
        canvas.height = 410;
        const ctx = canvas.getContext('2d');
        const xm = 0.85;
        const ym = 0.5;
        const tile = 0.5 * (640 / xm) / (size - 1);
        const height = 40;
        ctx.translate(320, height);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        for (let y = 0; y < size - 1; ++y) {
            for (let x = 0; x < size - 1; ++x) {
                const nw = noise[y * size + x] * height;
                const ne = noise[y * size + x + 1] * height;
                const sw = noise[(y + 1) * size + x] * height;
                const se = noise[(y + 1) * size + x + 1] * height;
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

const SineWaveFigureWithStateStore = connect((state, props) => ({
    size: state.size,
    frequency: state.frequency,
    generated: state.generated
}), dispatch => ({
    changeSize: e => dispatch({ type: SINE_WAVE_CHANGE_SIZE, value: Math.pow(2, e.target.value) }),
    changeFrequency: e => dispatch({ type: SINE_WAVE_CHANGE_FREQUENCY, value: e.target.value })
}))(SineWaveFigure);

const sineWaveStore = createStore(sineWaveReducer);
export const SineWaveInteractiveFigure = props => (
    <Provider store={sineWaveStore}>
        <SineWaveFigureWithStateStore/>
    </Provider>
);
