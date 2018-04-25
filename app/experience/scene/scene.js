import {
	PATCH_RADIUS,
} from '../../CONSTANTS';

import { camera } from '../camera';
import Landscape from './Landscape'
import Grass from './Grass'

export let scene;
let landscape, grass;
let grassCenterPoint = new THREE.Vector3();
let tmp = new THREE.Vector3();

export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);
	scene.add( new THREE.AmbientLight( 0xffffff ) );

	const boxGeometry = new THREE.BoxGeometry( 10, 10, 10 );
	const boxMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } );

	// landscape = new Landscape();
	// scene.add(landscape.mesh);

	grass = new Grass();
	scene.add(grass.mesh);

	scene.add(new THREE.AxesHelper(100));
}

export const update = (correction) => {
	if (grass) {
		const inFrontOfCamera = {
			x: camera.position.x + (Math.sin(camera.rotation.y + Math.PI) * PATCH_RADIUS * 1.1),
			z: camera.position.z + (Math.cos(camera.rotation.y + Math.PI) * PATCH_RADIUS * 1.1),
		}
		grass.update(inFrontOfCamera, correction);
	}
}


