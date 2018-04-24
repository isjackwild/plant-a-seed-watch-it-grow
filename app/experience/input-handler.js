import _ from 'lodash';
import PubSub from 'pubsub-js';

import { camera } from './camera.js';
import { targets } from './scene.js';

const mouseVector = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
export const ray = raycaster.ray;
export const intersectableObjects = [];
const zeroVec = new THREE.Vector2(0, 0);
let focusedObject = null;


export const init = () => {
	addEventListeners();
}

const addEventListeners = () => {
	if (window.mobile) {
		window.addEventListener('deviceorientation', _.throttle(onDeviceOrientation, 33.333));
	} else {
		window.addEventListener('mousemove', _.throttle(onMouseMove, 16.666));
		window.addEventListener('click', onClick);
	}
}

const onMouseMove = ({ clientX, clientY }) => {
	const x = 2 * (clientX / window.innerWidth) - 1;
	const y = 1 - 2 * (clientY / window.innerHeight);
	mouseVector.set(x, y, camera.position.z);
	raycaster.setFromCamera(mouseVector, camera);
	castFocus();
}

export const onDeviceOrientation = () => {
	raycaster.setFromCamera(zeroVec, camera);
	castFocus();
}

const onClick = ({ clientX, clientY, touches }) => {
	let x, y;
	if (touches) {
		x = 2 * (touches[0].clientX / window.innerWidth) - 1;
		y = 1 - 2 * (touches[0].clientY / window.innerHeight);
	} else {
		x = 2 * (clientX / window.innerWidth) - 1;
		y = 1 - 2 * (clientY / window.innerHeight);
	}
	mouseVector.set(x, y, camera.position.z);
	raycaster.setFromCamera(mouseVector, camera);
	castClick();
}

export const castFocus = () => {
	const intersects = raycaster.intersectObjects(intersectableObjects);
	if (intersects.length) {
		if (intersects[0].object.isActive) document.body.classList.add('pointer'); 
		if (focusedObject != intersects[0].object) {
			if (focusedObject) focusedObject.onBlur();
			focusedObject = intersects[0].object;
			focusedObject.onFocus();
		}
	} else {
		document.body.classList.remove('pointer');
		if (focusedObject) focusedObject.onBlur();
		focusedObject = null;
	}
}

const castClick = () => {
	const intersects = raycaster.intersectObjects( intersectableObjects, false );
	if (intersects.length) intersects[0].object.onClick();
}
