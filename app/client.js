window.app = window.app || {};

const dat = require('dat-gui');

import { init, renderer } from './experience/loop';
import { camera } from './experience/camera';
import { loadAssets } from './experience/loader';
import _ from 'lodash';



const kickIt = () => {
	if (window.location.search.indexOf('debug') > -1) app.debug = true;
	// if (app.debug) {
	// }
	app.gui = new dat.GUI();
	addEventListeners();
	onResize();
	loadAssets(init);
}

const onResize = () => {
	window.app.width = window.innerWidth;
	window.app.height = window.innerHeight;

	if (renderer) renderer.setSize(window.app.width, window.app.height);
	if (camera) {
		camera.aspect = window.app.width / window.app.height;
		camera.updateProjectionMatrix();
	}
}

const addEventListeners = () => {
	window.addEventListener('resize', _.debounce(onResize, 99));
}


if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', kickIt);
} else {
	window.attachEvent('onload', kickIt);
}