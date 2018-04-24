const Landscape = () => {
	let mesh;

	const createGeometry = () => {
		const geometry = new THREE.PlaneBufferGeometry(30000, 30000, 128 - 1, 128 - 1);
		geometry.rotateX(Math.PI * -0.5);
		return geometry;
	};

	const createMesh = (geometry) => {
		const material = new THREE.MeshStandardMaterial({
			color: 0xff0000,
			bumpScale: 1,
			metalness: 0,
			roughness: 0.5,
			wireframe: true,
		});
		return new THREE.Mesh(geometry, material);
	};

	const geometry = createGeometry();
	mesh = createMesh(geometry);

	return { mesh };
};

export default Landscape;
