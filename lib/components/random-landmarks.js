import React from 'react';
import { createStore } from 'redux';
import { connect, Provider } from "react-redux";

import { drawLandmarks, generateLandmarks, generateLandmarksV2, generateLandmarksV3 } from '..';

const ACTION_TYPE_REFRESH = 'refresh';
const ACTION_TYPE_CHANGE_DISTANCE = 'change-distance';

const LANDMARK_COUNT = 5;
const WIDTH = 32;
const HEIGHT = 32;

const CANVAS_RESOLUTION = 1024;

const assignLandmarks = state => Object.assign({}, state, {
    v1: generateLandmarks(LANDMARK_COUNT, WIDTH, HEIGHT, state.distance),
    v2: generateLandmarksV2(LANDMARK_COUNT, WIDTH, HEIGHT, state.distance),
    v3: generateLandmarksV3(LANDMARK_COUNT, WIDTH, HEIGHT, state.distance)
});

const reducer = (state = { distance: 8, generated: Date.now() }, action) => {
    switch (action.type) {
        case ACTION_TYPE_CHANGE_DISTANCE:
            return assignLandmarks(Object.assign({}, state, {
                distance: action.value,
                generated: Date.now()
            }));
        case ACTION_TYPE_REFRESH:
            return assignLandmarks(Object.assign({}, state, {
                generated: Date.now()
            }));
        default:
            return assignLandmarks(state);
    }
};

class RandomLandmarksFigure extends React.Component {
    render() {
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
                    <strong>Figure 2.</strong> Placement of landmarks with simple rules and a minimum
                    distance of {this.props.distance} units between landmarks. Above result generated
                    after {this.props.result.iterations} attempts in {this.props.result.time} ms.
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
        const result = this.props.result;
        const canvas = document.getElementById('random-landmarks-canvas');
        drawLandmarks(WIDTH, CANVAS_RESOLUTION, canvas, result.points);
    }
}

class RandomLandmarksFigureV2 extends React.Component {
    render() {
        return (
            <div>
                <form>
                    <span>
                        <label>Min distance</label>
                        <input type="range" min="1" max="3" name="distance" value={Math.log2(this.props.distance)} onChange={this.props.changeDistance}/>
                    </span>
                    <button onClick={this.props.refresh}>Refresh</button>
                </form>
                <canvas id="random-landmarks-v2-canvas"/>
                <p>
                    <strong>Figure 3.</strong> Placement of landmarks with updated rules and a minimum
                    distance of {this.props.distance} units between landmarks. Above result generated
                    after {this.props.result.iterations} attempts in {this.props.result.time} ms.
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
        const result = this.props.result;
        const canvas = document.getElementById('random-landmarks-v2-canvas');
        drawLandmarks(WIDTH, CANVAS_RESOLUTION, canvas, result.points);
    }
}

class RandomLandmarksFigureV3 extends React.Component {
    render() {
        return (
            <div>
                <form>
                    <span>
                        <label>Min distance</label>
                        <input type="range" min="1" max="3" name="distance" value={Math.log2(this.props.distance)} onChange={this.props.changeDistance}/>
                    </span>
                    <button onClick={this.props.refresh}>Refresh</button>
                </form>
                <canvas id="random-landmarks-v3-canvas"/>
                <p>
                    <strong>Figure 4.</strong> Placement of landmarks by finding the shortest path between the
                    furthest points and a minimum distance of {this.props.distance} units between landmarks.
                    Above result generated after {this.props.result.iterations} attempts in {this.props.result.time} ms.
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
        const result = this.props.result;
        const canvas = document.getElementById('random-landmarks-v3-canvas');
        drawLandmarks(WIDTH, CANVAS_RESOLUTION, canvas, result.points);
    }
}

const store = createStore(reducer);
const dispatch = dispatch => ({
    changeDistance: e => dispatch({ type: ACTION_TYPE_CHANGE_DISTANCE, value: Math.pow(2, e.target.value) }),
    refresh: e => {
        e.preventDefault();
        dispatch({ type: ACTION_TYPE_REFRESH });
    }
});
const RandomLandmarksFigureWithStateStore = connect(
    state => ({
        generated: state.generated,
        distance: state.distance,
        result: state.v1
    }),
    dispatch
)(RandomLandmarksFigure);
const RandomLandmarksFigureV2WithStateStore = connect(
    state => ({
        generated: state.generated,
        distance: state.distance,
        result: state.v2
    }),
    dispatch
)(RandomLandmarksFigureV2);
const RandomLandmarksFigureV3WithStateStore = connect(
    state => ({
        generated: state.generated,
        distance: state.distance,
        result: state.v3
    }),
    dispatch
)(RandomLandmarksFigureV3);

export const RandomLandmarksInteractiveFigure = props => (
    <Provider store={store}>
        <RandomLandmarksFigureWithStateStore/>
    </Provider>
);

export const RandomLandmarksInteractiveFigureV2 = props => (
    <Provider store={store}>
        <RandomLandmarksFigureV2WithStateStore/>
    </Provider>
);

export const RandomLandmarksInteractiveFigureV3 = props => (
    <Provider store={store}>
        <RandomLandmarksFigureV3WithStateStore/>
    </Provider>
);
