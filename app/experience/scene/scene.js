export let scene, boxMesh;
import { camera } from '../camera';
import Landscape from './Landscape'
import Grass from './Grass'

let landscape, grass;

export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);
	scene.add( new THREE.AmbientLight( 0xffffff ) );

	const boxGeometry = new THREE.BoxGeometry( 10, 10, 10 );
	const boxMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } );
	boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
	scene.add( boxMesh );

	landscape = new Landscape();
	scene.add(landscape.mesh);

	grass = new Grass();
	scene.add(grass.mesh);
}

export const update = (delta) => {
	boxMesh.rotation.y += 0.01 * delta;
	boxMesh.rotation.x += 0.01 * delta;
}