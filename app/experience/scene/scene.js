const dat = require('dat-gui');

import {
	PATCH_RADIUS,
} from '../../CONSTANTS';

import { camera } from '../camera';
import Landscape from './Landscape'
import Grass from './Grass'
import Skybox from './Skybox'
import TerrainMap from './TerrainMap';

export let scene;
let landscape, grass, sky, sunSphere;
let grassCenterPoint = new THREE.Vector3();
let tmp = new THREE.Vector3();

function initSky() {
	// Add Sky
	sky = new THREE.Sky();
	sky.scale.setScalar( 450000 );
	scene.add( sky );
	// Add Sun Helper
	sunSphere = new THREE.Mesh(
		new THREE.SphereBufferGeometry( 20000, 16, 8 ),
		new THREE.MeshBasicMaterial( { color: 0xffffff } )
	);
	sunSphere.position.y = - 700000;
	sunSphere.visible = false;
	scene.add( sunSphere );
	/// GUI
	var effectController  = {
		turbidity: 10,
		rayleigh: 4,
		mieCoefficient: 0.062,
		mieDirectionalG: 1,
		luminance: 1.84,
		inclination: 0.3, // elevation / inclination
		azimuth: 0.16, // Facing front,
		sun: ! true
	};
	var distance = 400000;
	function guiChanged() {
		var uniforms = sky.material.uniforms;
		uniforms.turbidity.value = effectController.turbidity;
		uniforms.rayleigh.value = effectController.rayleigh;
		uniforms.luminance.value = effectController.luminance;
		uniforms.mieCoefficient.value = effectController.mieCoefficient;
		uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
		var theta = Math.PI * ( effectController.inclination - 0.5 );
		var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );
		sunSphere.position.x = distance * Math.cos( phi );
		sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
		sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
		sunSphere.visible = effectController.sun;
		uniforms.sunPosition.value.copy( sunSphere.position );
		// renderer.render( scene, camera );
	}
	var gui = new dat.GUI();
	gui.add( effectController, "turbidity", 1.0, 20.0, 0.1 ).onChange( guiChanged );
	gui.add( effectController, "rayleigh", 0.0, 4, 0.001 ).onChange( guiChanged );
	gui.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
	gui.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
	gui.add( effectController, "luminance", 0.0, 2 ).onChange( guiChanged );
	gui.add( effectController, "inclination", 0, 1, 0.0001 ).onChange( guiChanged );
	gui.add( effectController, "azimuth", 0, 1, 0.0001 ).onChange( guiChanged );
	gui.add( effectController, "sun" ).onChange( guiChanged );
	guiChanged();
}

export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);
	scene.add( new THREE.AmbientLight( 0xffffff ) );

	const boxGeometry = new THREE.BoxGeometry( 10, 10, 10 );
	const boxMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } );

	const terrainMap = TerrainMap();

	landscape = new Landscape(terrainMap);
	scene.add(landscape.mesh);

	grass = new Grass(terrainMap);
	scene.add(grass.mesh);

	initSky();
	// scene.add(new THREE.AxesHelper(100));
}

export const update = (correction) => {
	if (grass) {
		const inFrontOfCamera = {
			x: camera.position.x + (Math.sin(camera.rotation.y + Math.PI) * PATCH_RADIUS),
			z: camera.position.z + (Math.cos(camera.rotation.y + Math.PI) * PATCH_RADIUS),
		}
		grass.update(inFrontOfCamera, correction);
	}
}


