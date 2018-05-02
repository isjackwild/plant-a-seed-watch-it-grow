import { 
	BLADE_COUNT,
	PATCH_RADIUS,
	BLADE_SEGS,
	BLADE_WIDTH,
	BLADE_HEIGHT_MIN,
	BLADE_HEIGHT_MAX,
	FOG_COLOR,
	GRASS_FOG_COLOR,
} from '../../CONSTANTS';

const BLADE_VERTS = (BLADE_SEGS + 1) * 2;
const BLADE_INDICES = BLADE_SEGS * 12;


const Grass = (terrainMap) => {
	let mesh;
	let time = 0;

	const setupBladeIndices = () => {
		const indices = new Uint16Array(BLADE_INDICES);
		let i = 0;
		let vertexOffsetFront = 0;
		let vertexOffsetBack = BLADE_VERTS;

		for (let seg = 0; seg < BLADE_SEGS; ++seg) {
			indices[i++] = vertexOffsetFront + 0;
			indices[i++] = vertexOffsetFront + 1;
			indices[i++] = vertexOffsetFront + 2;
			indices[i++] = vertexOffsetFront + 2;
			indices[i++] = vertexOffsetFront + 1;
			indices[i++] = vertexOffsetFront + 3;
			vertexOffsetFront += 2;
		}

		for (let seg = 0; seg < BLADE_SEGS; ++seg) {
			indices[i++] = vertexOffsetBack + 2;
			indices[i++] = vertexOffsetBack + 1;
			indices[i++] = vertexOffsetBack + 0;
			indices[i++] = vertexOffsetBack + 3;
			indices[i++] = vertexOffsetBack + 1;
			indices[i++] = vertexOffsetBack + 2;
			vertexOffsetBack += 2;
		}

		return indices;
	};

	const setupBladeShape = () => {
		const shapes = new Float32Array(4 * BLADE_COUNT);

		for (let i = 0; i < BLADE_COUNT; ++i) {
			shapes[i*4+0] = BLADE_WIDTH + Math.random() * BLADE_WIDTH * 0.5 // width
			shapes[i*4+1] = BLADE_HEIGHT_MIN + Math.pow(Math.random(), 4.0) * (BLADE_HEIGHT_MAX - BLADE_HEIGHT_MIN) // height
			shapes[i*4+2] = 0.0 + Math.random() * 0.7 // lean
			shapes[i*4+3] = 0.2 + Math.random() * 0.8 // curve
		}

		return shapes;
	};

	const setupBladeOffsets = () => {
		const offsets = new Float32Array(4 * BLADE_COUNT);

		for (let i = 0; i < BLADE_COUNT; ++i) {
			offsets[i*4+0] = (Math.random() * 2.0 - 1.0) * PATCH_RADIUS // x
			offsets[i*4+1] = 0 // y
			offsets[i*4+2] = (Math.random() * 2.0 - 1.0) * PATCH_RADIUS // z
			offsets[i*4+3] = Math.PI * 2.0 * Math.random() // rot
		}

		return offsets;
	};

	const setupBladeIndexVerts = () => {
		const indexVerts = new Float32Array(BLADE_VERTS * 2 * 1);
		for (let i = 0; i < indexVerts.length; ++i) {
			indexVerts[i] = i;
		}
		return indexVerts;
	};

	const createGeometry = ({ indices, shapes, offsets, indexVerts }) => {
		const geometry = new THREE.InstancedBufferGeometry();
		// Make a giant bounding sphere so the mesh never goes out of view.
		// Also, because there are no position vertices, we must create our own bounding sphere.
		geometry.boundingSphere = new THREE.Sphere(
			new THREE.Vector3(0,0,0), Math.sqrt(PATCH_RADIUS * PATCH_RADIUS * 2.0) * 10000.0
		);
		geometry.addAttribute('vindex', new THREE.BufferAttribute(indexVerts, 1));
		geometry.addAttribute('shape', new THREE.InstancedBufferAttribute(shapes, 4));
		geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 4));
		geometry.setIndex(new THREE.BufferAttribute(indices, 1));

		geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI * 0.5));
		return geometry;
	};

	const createMesh = (geometry) => {
		const texture = window.app.assets.textures['grass'];
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

		const material = new THREE.RawShaderMaterial({
			uniforms: {
				time: {type: 'f', value: 0.0},
				map: {type: 't', value: texture},
				heightMap: {type: 't', value: terrainMap},
				heightMapScale: {type: '3f', value: [0.0001, 0.00025, 300.0]},
				patchSize: {type: 'f', value: PATCH_RADIUS * 2.0},
				drawPos: {type: '2f', value: [0.0, 0.0]},
				fogColor: {type: '3f', value: FOG_COLOR.toArray()},
				fogNear: {type: 'f', value: 1.0},
				fogFar: {type: 'f', value: PATCH_RADIUS * 10},
				grassFogColor: {type: '3f', value: GRASS_FOG_COLOR.toArray()},
				grassFogFar: {type: 'f', value: PATCH_RADIUS * 2.0}
			},
			vertexShader: window.app.assets.shaders['grass.vert'].replace('${BLADE_SEGS}', BLADE_SEGS.toFixed(1)),
			fragmentShader: window.app.assets.shaders['grass.frag'],
		});

		return new THREE.Mesh(geometry, material);
	};

	const update = ({ x, z }, correction) => {
		time += 1 * correction * 0.006;
		mesh.material.uniforms.time.value = time;
		mesh.material.uniforms.drawPos.value[0] = x;
		mesh.material.uniforms.drawPos.value[1] = z;
	};

	const geometry = createGeometry({
		indices: setupBladeIndices(),
		shapes: setupBladeShape(),
		offsets: setupBladeOffsets(),
		indexVerts: setupBladeIndexVerts(),
	});
	mesh = createMesh(geometry);

	return { mesh, update };
};

export default Grass;



