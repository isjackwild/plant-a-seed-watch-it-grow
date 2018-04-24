export let camera;

export const init = () => {
	camera = new THREE.PerspectiveCamera(45, window.app.width / window.app.height, 1, 10000);
	camera.position.z = -50;
	camera.position.y = 10;
	// camera.rotation.set(0, 0, 0);
	// camera.setFocalLength(40);
}