const BLADE_COUNT = 10000;
const PATCH_RADIUS = 100;

const BLADE_SEGS = 4; // # of blade segments
const BLADE_VERTS = (BLADE_SEGS + 1) * 2; // # of vertices per blade (1 side)
const BLADE_INDICES = BLADE_SEGS * 12;
const BLADE_WIDTH = 0.15;
const BLADE_HEIGHT_MIN = 2.0;
const BLADE_HEIGHT_MAX = 4.0;

const FOG_COLOR = new THREE.Color(0.92, 0.94, 0.98);
const GRASS_FOG_COLOR = new THREE.Color(0.46, 0.56, 0.38);

const vertexShader = `
	precision highp float;

	#define BLADE_SEGS `+BLADE_SEGS.toFixed(1)+` // # of blade segments
	#define BLADE_DIVS (BLADE_SEGS + 1.0)  // # of divisions
	#define BLADE_VERTS (BLADE_DIVS * 2.0) // # of vertices (per side, so 1/2 total)

	uniform mat4 modelViewMatrix;
	uniform mat4 projectionMatrix;
	uniform float patchSize; // size of grass square area (width & height)
	uniform vec2 drawPos; // centre of where we want to draw
	uniform float time;  // used to animate blades

	attribute float vindex; // Which vertex are we drawing - the main thing we need to know
	attribute vec4 offset; // {x:x, y:y, z:z, w:rot} (blade's position & rotation)
	attribute vec4 shape; // {x:width, y:height, z:lean, w:curve} (blade's shape properties)

	varying vec4 vColor;
	varying vec2 vUv;

	vec2 rotate (float x, float y, float r) {
		float c = cos(r);
		float s = sin(r);
		return vec2(x * c - y * s, x * s + y * c);
	}

	void main() {
		float vi = mod(vindex, BLADE_VERTS); // vertex index for this side of the blade
		float di = floor(vi / 2.0);  // div index (0 .. BLADE_DIVS)
		float hpct = di / BLADE_SEGS;  // percent of height of blade this vertex is at
		float bside = floor(vindex / BLADE_VERTS);  // front/back side of blade
		float xside = mod(vi, 2.0);  // left/right edge (x=0 or x=1)
		float x = shape.x * (xside - 0.5) * (1.0 - pow(hpct, 3.0)); // taper blade as approach tip
		// apply blade's natural curve amount, then apply animated curve amount by time
		float curve = shape.w + 0.4 * (sin(time * 4.0 + offset.x * 0.8) + cos(time * 4.0 + offset.y * 0.8));
		float y = shape.z * hpct + curve * (hpct * hpct); // pow(hpct, 2.0);

		// based on centre of view cone position, what grid tile should
		// this piece of grass be drawn at?
		vec2 gridOffset = vec2(
			floor((drawPos.x - offset.x) / patchSize) * patchSize + patchSize / 2.0,
			floor((drawPos.y - offset.y) / patchSize) * patchSize + patchSize / 2.0
		);

		// rotate this blade vertex by this blade's rotation
		vec4 pos = vec4(
			rotate(x, y, offset.w),
			shape.y * di / BLADE_SEGS + offset.z,
			1.0
		);

		// move to grid position and then to blade position
		pos.x += gridOffset.x + offset.x;
		pos.y += gridOffset.y + offset.y;

		// grass texture coordinate for this vertex
		vec2 uv = vec2(xside, di * 2.0);

		// cheap lighting for now - light based on rotation angle of blade
		// and depending on which side of the blade this vertex is on
		// and depending on how high up the blade we are
		// TODO: calculate normal?
		float c = max(cos(offset.w + bside * 3.14159) - (1.0 - hpct) * 0.4, 0.0);
		c = 0.3 + 0.7 * c * c * c;

		// outputs
		vColor = vec4(
			c * 0.85 + cos(offset.x * 80.0) * 0.05,
			c + sin(offset.y * 140.0) * 0.05,
			c + sin(offset.x * 99.0) * 0.05,
			1.0
		);
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * pos;
	}
`;

const fragmentShader = `
	precision highp float;

	uniform sampler2D map;
	uniform vec3 fogColor;
	uniform float fogNear;
	uniform float fogFar;
	uniform vec3 grassFogColor;
	uniform float grassFogFar;

	varying vec3 vPosition;
	varying vec4 vColor;
	varying vec2 vUv;

	void main() {
		vec4 color = vec4(vColor) * texture2D(map, vec2(vUv.s, vUv.t));
		float depth = gl_FragCoord.z / gl_FragCoord.w;
		// apply 'grass fog' first
		float fogFactor = smoothstep(fogNear, grassFogFar, depth);
		color.rgb = mix(color.rgb, grassFogColor, fogFactor);
		// then apply atmosphere fog
		fogFactor = smoothstep(fogNear, fogFar, depth);
		color.rgb = mix(color.rgb, fogColor, fogFactor);
		// output
		gl_FragColor = color;
	}
`;

const Grass = () => {
	let mesh;

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
			offsets[i*4+1] = (Math.random() * 2.0 - 1.0) * PATCH_RADIUS // y
			offsets[i*4+2] = 0.0 // z
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

		geometry.rotateX(Math.PI * -0.1);
		return geometry;
	};

	const createMesh = (geometry) => {
		const texture = window.app.assets.textures['grass'];
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

		const mat = new THREE.RawShaderMaterial({
			uniforms: {
				time: {type: 'f', value: 0.0},
				map: {type: 't', value: texture},
				patchSize: {type: 'f', value: PATCH_RADIUS * 2.0},
				drawPos: {type: '2f', value: [0.0, 0.0]},
				fogColor: {type: '3f', value: FOG_COLOR.toArray()},
				fogNear: {type: 'f', value: 1.0},
				fogFar: {type: 'f', value: PATCH_RADIUS * 10},
				grassFogColor: {type: '3f', value: GRASS_FOG_COLOR.toArray()},
				grassFogFar: {type: 'f', value: PATCH_RADIUS * 2}
			},
			vertexShader,
			fragmentShader,
		});

		return new THREE.Mesh(geometry, mat);
	};

	const geometry = createGeometry({
		indices: setupBladeIndices(),
		shapes: setupBladeShape(),
		offsets: setupBladeOffsets(),
		indexVerts: setupBladeIndexVerts(),
	});
	mesh = createMesh(geometry);
	mesh.rotation.set(0.5, -0.9, 1.2);
	
	return { mesh };
};

export default Grass;

