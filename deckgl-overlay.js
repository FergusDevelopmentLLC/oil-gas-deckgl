/* global window */
import React, {Component} from 'react';
import DeckGL, {HexagonLayer} from 'deck.gl';

import {chroma} from 'chroma-js';

export const tint = color => n => chroma.scale([ '#fff', color ])(n).hex();
console.log(tint[0]);

// export const green = '#27C93F';
// export const yellow = '#FFBD2E';
// export const red = '#FF5F56';
// export const blue = '#50E3C2';
//
// const travelTimeScale = chroma.scale([red, yellow, green]).domain([10, 1000]);
//
// export const getTravelTimeColor = n => travelTimeScale(n).hex();


const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const colorRange = [

  // [1, 152, 189],
  // [73, 227, 206],
  // [216, 254, 181],
  // [254, 237, 177],
  // [254, 173, 84],
  // [209, 55, 78]

  [255,255,212],
  [254,227,145],
  [254,196,79],
  [254,153,41],
  [217,95,14],
  [153,52,4]
  
];

const elevationScale = {min: 1, max: 50};

const defaultProps = {
  radius: 12500,
  upperPercentile: 100,
  coverage: .5
};

export default class DeckGLOverlay extends Component {

  static get defaultColorRange() {
    return colorRange;
  }

  //41.094638, -110.921747
  //longitude: -1.4157267858730052,
  //latitude: 52.232395363869415,

  static get defaultViewport() {
    return {
      longitude: -110,
      latitude: 40,
      zoom: 4.9,
      minZoom: 5,
      maxZoom: 15,
      pitch: 20.5,
      bearing: 0
    };
  }

  constructor(props) {
    super(props);
    this.startAnimationTimer = null;
    this.intervalTimer = null;
    this.state = {
      elevationScale: elevationScale.min
    };

    this._startAnimate = this._startAnimate.bind(this);
    this._animateHeight = this._animateHeight.bind(this);

  }

  componentDidMount() {
    this._animate();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.length !== this.props.data.length) {
      this._animate();
    }
  }

  componentWillUnmount() {
    this._stopAnimate();
  }

  _animate() {
    this._stopAnimate();

    // wait 1.5 secs to start animation so that all data are loaded
    this.startAnimationTimer = window.setTimeout(this._startAnimate, 1500);
  }

  _startAnimate() {
    this.intervalTimer = window.setInterval(this._animateHeight, 20);
  }

  _stopAnimate() {
    window.clearTimeout(this.startAnimationTimer);
    window.clearTimeout(this.intervalTimer);
  }

  _animateHeight() {
    if (this.state.elevationScale === elevationScale.max) {
      this._stopAnimate();
    } else {
      this.setState({elevationScale: this.state.elevationScale + 1});
    }
  }

  render() {
    const {viewport, data, radius, coverage, upperPercentile} = this.props;

    if (!data) {
      return null;
    }

    const layers = [
      new HexagonLayer({
        id: 'heatmap',
        colorRange,
        coverage,
        data,
        elevationRange: [0, 25000],
        elevationScale: this.state.elevationScale,
        extruded: true,
        getPosition: d => d,
        lightSettings: LIGHT_SETTINGS,
        onHover: this.props.onHover,
        opacity: 1,
        pickable: Boolean(this.props.onHover),
        radius,
        upperPercentile
      })
    ];

    return <DeckGL {...viewport} layers={layers} initWebGLParameters />;
  }
}

DeckGLOverlay.displayName = 'DeckGLOverlay';
DeckGLOverlay.defaultProps = defaultProps;
//
