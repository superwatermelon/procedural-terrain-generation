import React from 'react';
import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { drawTerrain } from '..';

const SINE_WAVE_CHANGE_SIZE = 'change-size';
const SINE_WAVE_CHANGE_FREQUENCY = 'change-frequency';

const sineWaveReducer = (state = { size: 64, frequency: 16, generated: Date.now() }, action) => {
    switch (action.type) {
        case SINE_WAVE_CHANGE_SIZE:
            return Object.assign({}, state, { size: action.value, generated: Date.now() });
        case SINE_WAVE_CHANGE_FREQUENCY:
            return Object.assign({}, state, { frequency: action.value, generated: Date.now() });
        default:
            return state;
    }
};

function generateSineWave(size, f) {
    const heights = new Float32Array(size * size);
    for (let y = 0; y < size; ++y) {
        for (let x = 0; x < size; ++x) {
            heights[y * size + x] = Math.sin((x - 0.5 * Math.PI) / size * f) * Math.sin((y - 0.5 * Math.PI) / size * f) * 0.5 + 0.5;
        }
    }
    return heights;
}

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
        this.updateCanvas();
    }

    componentDidUpdate() {
        this.updateCanvas();
    }

    updateCanvas() {
        const size = this.props.size;
        const f = this.props.frequency;
        const heights = generateSineWave(size, f);
        const canvas = document.getElementById('sine-wave-terrain-canvas');
        drawTerrain(canvas, 1024, size, heights);
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
