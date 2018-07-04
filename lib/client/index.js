import React from 'react';
import ReactDOM from 'react-dom';

import { HeroComponent } from '../components/hero';
import { RandomLandmarksInteractiveFigure } from '../components/random-landmarks';
import { WhiteNoiseInteractiveFigure } from '../components/white-noise';
import { SineWaveInteractiveFigure } from '../components/sine-wave';
import { DiamondSquareInteractiveFigure } from '../components/diamond-square';

if (document.getElementById('hero'))
    ReactDOM.render(<HeroComponent/>, document.getElementById('hero'));
if (document.getElementById('random-landmarks-interactive-figure'))
    ReactDOM.render(<RandomLandmarksInteractiveFigure/>, document.getElementById('random-landmarks-interactive-figure'));
if (document.getElementById('white-noise-interactive-figure'))
    ReactDOM.render(<WhiteNoiseInteractiveFigure/>, document.getElementById('white-noise-interactive-figure'));
if (document.getElementById('sine-wave-interactive-figure'))
    ReactDOM.render(<SineWaveInteractiveFigure/>, document.getElementById('sine-wave-interactive-figure'));
if (document.getElementById('diamond-square-interactive-figure'))
    ReactDOM.render(<DiamondSquareInteractiveFigure/>, document.getElementById('diamond-square-interactive-figure'));