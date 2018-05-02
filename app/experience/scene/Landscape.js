import { 
	FOG_COLOR,
	PATCH_RADIUS,
} from '../../CONSTANTS';

const Landscape = (terrainMap) => {
	let mesh;

	const createGeometry = () => {
		const geometry = new THREE.PlaneBufferGeometry(10000, 10000, 512, 512);
		geometry.rotateX(Math.PI * -0.5);
		return geometry;
	};

	const createMesh = (geometry) => {
		const material = new THREE.RawShaderMaterial({
			uniforms: {
				offset: {type: '2f', value: [0.0, 0.0]},
				uvOffset: {type: '2f', value: [0.0, 0.0]},
				map: {type: 't', value: window.app.assets.textures['ground']},
				heightMap: {type: 't', value: terrainMap},
				// heightMapScale: {type: '3f', value: [0.00001, 0.000025, 900.0]},
				heightMapScale: {type: '3f', value: [0.0001, 0.00025, 300.0]},
				fogColor: {type: '3f', value: FOG_COLOR.toArray()},
				fogNear: {type: 'f', value: 1.0},
				fogFar: {type: 'f', value: PATCH_RADIUS * 10},
				grassFogFar: {type: 'f', value: PATCH_RADIUS * 2}
			},
			vertexShader: window.app.assets.shaders['landscape.vert'],
			fragmentShader: window.app.assets.shaders['landscape.frag'],
		});

		// const material = new THREE.MeshBasicMaterial({
		// 	// color: 0xdb7923,
		// 	// bumpScale: 1,
		// 	// metalness: 0,
		// 	// roughness: 0.5,
		// 	// wireframe: true,
		// 	map: window.app.assets.textures['ground'],
		// });
		return new THREE.Mesh(geometry, material);
	};

	const geometry = createGeometry();
	mesh = createMesh(geometry);

	return { mesh };
};

export default Landscape;
