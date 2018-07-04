import React from 'react';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { diamondSquareGenerate, drawTerrain } from '..';

const DIAMOND_SQUARE_CHANGE_SIZE = 'change-size';
const DIAMOND_SQUARE_CHANGE_POWER = 'change-power';
const DIAMOND_SQUARE_REFRESH = 'refresh';

const typeFromPower = power =>
    power <= -2 ? 'red' : power < 0 ? 'pink' : power >= 2 ? 'violet' : power > 0 ? 'blue' : 'white';

const diamondSquareReducer = (state = { size: 6, power: -1, generated: Date.now() }, action) => {
    switch (action.type) {
        case DIAMOND_SQUARE_CHANGE_SIZE:
            return Object.assign({}, state, { size: action.value, generated: Date.now() });
        case DIAMOND_SQUARE_CHANGE_POWER:
            return Object.assign({}, state, {
                power: action.value,
                generated: Date.now()
            });
        case DIAMOND_SQUARE_REFRESH:
            return Object.assign({}, state, { generated: Date.now() });
        default:
            return state;
    }
};

class DiamondSquareFigure extends React.Component {

    render() {
        return (
            <div>
                <form>
                <label htmlFor="diamond-square-interactive-size">
                        <span>Size</span>
                        <input id="diamond-square-interactive-size" type="range" min="1" max="6" name="size" value={this.props.size} onChange={this.props.changeSize}/>
                    </label>
                    <label htmlFor="diamond-square-interactive-power">
                        <span>Power</span>
                        <input id="diamond-square-interactive-power" type="range" min="-3" max="3" name="power" step="0.1" value={this.props.power} onChange={this.props.changePower}/>
                    </label>
                    <button onClick={this.props.refresh}>Refresh</button>
                </form>
                <canvas id="diamond-square-interactive-canvas"/>
                <p>
                    Terrain heightmap generated with {typeFromPower(this.props.power)} noise (<math><msup><mi>f</mi><mn>{this.props.power}</mn></msup></math>). Generated at:
                    <time dateTime={new Date(this.props.generated).toISOString()}>{new Date(this.props.generated).toISOString()}</time>
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
        const size = Math.pow(2, this.props.size) + 1;
        const power = this.props.power;
        const noise = diamondSquareGenerate(size, f => Math.pow(f, power));
        const canvas = document.getElementById('diamond-square-interactive-canvas');
        drawTerrain(canvas, 1024, size, noise);
    }
}

const DiamondSquareFigureWithStateStore = connect(
    state => ({
        size: state.size,
        power: state.power,
        type: state.type,
        generated: state.generated
    }),
    dispatch => ({
        changeSize: e => dispatch({ type: DIAMOND_SQUARE_CHANGE_SIZE, value: e.target.value }),
        changePower: e => dispatch({ type: DIAMOND_SQUARE_CHANGE_POWER, value: e.target.value }),
        refresh: e => {
            e.preventDefault();
            dispatch({ type: DIAMOND_SQUARE_REFRESH })
        }
    })
)(DiamondSquareFigure);

const diamondSquareStore = createStore(diamondSquareReducer);
export const DiamondSquareInteractiveFigure = props => (
    <Provider store={diamondSquareStore}>
        <DiamondSquareFigureWithStateStore/>
    </Provider>
);