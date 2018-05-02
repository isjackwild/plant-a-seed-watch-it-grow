const MAX_HEIGHT = 300;
const LANDSCAPE_SIZE = 3072.0;
const LIGHT_DIR = new THREE.Vector3(0.3, 1.0, 1).normalize();

/**  Always positive modulus */
const pmod =  (n, m) => ((n % m + m) % m);

const TerrainMap = () => {
	const tmp = new THREE.Vector3();
	const inputImage = window.app.assets.textures['noise'].image;
	const w = inputImage.width;
	const h = inputImage.height;
	const xCount = w - 1;
	const yCount = h - 1;
	const cellSize = LANDSCAPE_SIZE / w;

	const generateHeights = () => {
		console.log('generate heights');
		let canvas = document.createElement('canvas');
		
		canvas.width = w;
		canvas.height = h;
		let ctx = canvas.getContext('2d');
		ctx.drawImage(inputImage, 0, 0, w, h);

		let data = ctx.getImageData(0, 0, w, h).data;
		const heights = new Float32Array(w * h);

		for (let y = 0; y < h; ++y) {
			for (let x = 0; x < w; ++x) {
				// flip vertical because textures are Y+
				const i = (x + (h-y-1) * w) * 4;

				const height = data[i] / 255.0;
				heights[x + y * w] = height * MAX_HEIGHT;
			}
		}

		canvas = ctx = data = undefined;
		return heights;
	}

	const computeFaceNormals = (heights) => {
		console.log('compute face normals');
		const faceNormals = new Float32Array(3 * 2 * xCount * yCount);

		const hxc = xCount + 1;

		const v0 = new THREE.Vector3();
		const v1 = new THREE.Vector3();
		const n = tmp;
		let i = 0;

		for (let iy = 0; iy < yCount; ++iy) {
			for (let ix = 0; ix < xCount; ++ix) {
				i = 6 * (ix + iy * xCount);
				const ih = ix + iy * hxc;
				const z = heights[ih];

				// 2 vectors of top-left tri
				v0.x = cellSize;
				v0.y = cellSize;
				v0.z = heights[ih + hxc + 1] - z;

				v1.x = 0.0;
				v1.y = cellSize;
				v1.z = heights[ih + hxc] - z;

				// Vec3.cross(v0, v1, n);
				n.crossVectors(v0, v1);
				n.normalize();
				faceNormals[i+0] = n.x;
				faceNormals[i+1] = n.y;
				faceNormals[i+2] = n.z;

				// 2 vectors of bottom-right tri
				v0.x = cellSize;
				v0.y = 0.0;
				v0.z = heights[ih + 1] - z;

				v1.x = cellSize;
				v1.y = cellSize;
				v1.z = heights[ih + hxc + 1] - z;
				
				n.crossVectors(v0, v1);
				n.normalize();
				faceNormals[i+3] = n.x;
				faceNormals[i+4] = n.y;
				faceNormals[i+5] = n.z;
			}
		}

		return faceNormals;
	}

	const computeVertexNormals = (faceNormals) => {
		const vertexNormals = new Float32Array(3 * w * h);
		console.log('compute vertext normals');

		const computeVertexNormal = (x, y, log) => {
			const vm = { x: 0, y: 0, z: 0 };
			// console.log('compute vertext normal');
			// This vertex is belongs to 4 quads
			// Do the faces this vertex is the 1st point of for this quad.
			// This is the quad up and to the right
			let qx = x % xCount;
			let qy = y % yCount;
			let ni = (qy * xCount + qx) * 3 * 2;

			vm.x = faceNormals[ni+0];
			vm.y = faceNormals[ni+1];
			vm.z = faceNormals[ni+2];
			ni += 3;
			vm.x += faceNormals[ni+0];
			vm.y += faceNormals[ni+1];
			vm.z += faceNormals[ni+2];

			// 2nd tri of quad up and to the left
			qx = pmod(qx - 1, xCount);
			ni = (qy * xCount + qx) * 3 * 2 + 3;
			vm.x += faceNormals[ni+0];
			vm.y += faceNormals[ni+1];
			vm.z += faceNormals[ni+2];

			// both tris of quad down and to the left
			qy = pmod(qy - 1, yCount);
			ni = (qy * xCount + qx) * 3 * 2;

			vm.x += faceNormals[ni+0];
			vm.y += faceNormals[ni+1];
			vm.z += faceNormals[ni+2];

			ni += 3;
			vm.x += faceNormals[ni+0];
			vm.y += faceNormals[ni+1];
			vm.z += faceNormals[ni+2];

			// 1st tri of quad down and to the right
			qx = (qx + 1) % xCount;
			ni = (qy * xCount + qx) * 3 * 2;
			vm.x += faceNormals[ni+0];
			vm.y += faceNormals[ni+1];
			vm.z += faceNormals[ni+2];

			// Normalize to 'average' the result normal
			tmp.x = vm.x;
			tmp.y = vm.y;
			tmp.z = vm.z;
			tmp.normalize();

			return tmp;
		}

		let i = 0;
		for (let y = 0; y < h; ++y) {
			for (let x = 0; x < w; ++x) {
				const vertexNormal = computeVertexNormal(x, y, (i === 0));
				i = (y * w + x) * 3;
				vertexNormals[i++] = vertexNormal.x;
				vertexNormals[i++] = vertexNormal.y;
				vertexNormals[i++] = vertexNormal.z;
			}
		}

		return vertexNormals;
	}

	const computeData = (heights, vertexNormals, buffer) => {
		console.log('compute data');
		const lightLength = LIGHT_DIR.length();
		const computeShade = (ix, iy) => {
			// console.log('compute shade');
			// Make a normalized 2D direction vector we'll use to walk horizontally
			// toward the lightsource until z reaches max height
			const shadGradRange = 5.0;
			// const hdir = { x: 0 y: 0 z: 0 };
			const w = xCount + 1;
			const h = yCount + 1;
			let i = iy * w + ix;
			let height = heights[i]; // height at this point
			
			// hdir.x = LIGHT_DIR.x * -1;
			// hdir.y = LIGHT_DIR.y * -1;
			// hdir.normalize();

			const zstep = (1 / lightLength) * (LIGHT_DIR.z * -1)
			let x = ix;
			let y = iy;
			// Walk along the direction until we discover this point
			// is in shade or the light vector is too high to be shaded
			return 1.0;

			while (height < MAX_HEIGHT) {
				x += LIGHT_DIR.x * -1
				y += LIGHT_DIR.y * -1
				height += zstep
				const qx = pmod(Math.round(x), w);
				const qy = pmod(Math.round(y), h);
				const sampleHeight = heights;
				if (sampleHeight > height) {
					if (sampleHeight - height > shadGradRange) return 0.7;
					return 0.7 + 0.3 * (shadGradRange - (sampleHeight - height)) / shadGradRange;
				}
			}
			return 1.0
		}

		const n = { x: 0, y: 0, z: 0 };

		for (let y = 0; y < h; ++y) {
			for (let x = 0; x < w; ++x) {
				let iSrc = y * w + x;
				let iDst = (h - y - 1) * w + x;
				// Get height, scale & store in R component
				buffer[iDst * 4 + 0] = Math.round(heights[iSrc] / MAX_HEIGHT * 255.0);
				
				// Get normal at this location to compute light
				let ni = iSrc * 3;
				n.x = vertexNormals[ni++];
				n.y = vertexNormals[ni++];
				n.z = vertexNormals[ni++];

				// if (y === 0) console.log(n);
				// Compute light & store in G component
				// let light = 1;
				let light = Math.max(tmp.set(n.x, n.y, n.z).dot(LIGHT_DIR), 0.0);
				// light *= computeShade(x, y);
				// if (y === 0) console.log(light);

				buffer[iDst * 4 + 1] = Math.round(light * 255.0);
				buffer[iDst * 4 + 2] = 0;
				buffer[iDst * 4 + 3] = 255;
			}
		}
		return buffer;
	}

	const heights = generateHeights();
	const faceNormals = computeFaceNormals(heights);
	const vertexNormals = computeVertexNormals(faceNormals);

	// console.log(faceNormals, vertexNormals);

	const canvas = document.createElement('canvas');
	canvas.style.border = '2px solid red';
	canvas.width = window.app.assets.textures['noise'].image.width - 1;
	canvas.height = window.app.assets.textures['noise'].image.height - 1;
	const ctx = canvas.getContext('2d');
	const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	document.body.appendChild(canvas);
	canvas.style.position = 'absolute';
	canvas.style.top = '0px';
	canvas.style.left = '0px';
	canvas.style.zIndex = 1111;

	computeData(heights, vertexNormals, imgData.data);
	ctx.putImageData(imgData, 0, 0);
	console.log(imgData);
	const texture = new THREE.Texture(canvas);
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.needsUpdate = true;
	return texture;
}

export default TerrainMap;

