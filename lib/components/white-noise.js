import React from 'react';
import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { drawTerrain, generateRandomHeights } from '..';

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
        this.updateCanvas();
    }

    componentDidUpdate() {
        this.updateCanvas();
    }

    updateCanvas() {
        const size = this.props.size;
        const noise = generateRandomHeights(this.props.size);
        const canvas = document.getElementById('white-noise-interactive-terrain-canvas');
        drawTerrain(canvas, 1024, size, noise);
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