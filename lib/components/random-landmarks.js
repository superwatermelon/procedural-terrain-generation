import React from 'react';
import { createStore } from 'redux';
import { connect, Provider } from "react-redux";

import { drawLandmarks, generatePoints } from '..';

const ACTION_TYPE_REFRESH = 'refresh';
const ACTION_TYPE_CHANGE_SIZE = 'change-size';
const ACTION_TYPE_CHANGE_DISTANCE = 'change-distance';

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
        drawLandmarks(size, 1024, canvas, result.points);
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
