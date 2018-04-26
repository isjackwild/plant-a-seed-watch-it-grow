const MAX_HEIGHT = 300;

const TerrainMap = () => {
	const inputImage = window.app.assets.textures['noise'].image;
	const w = inputImage.width;
	const h = inputImage.height;
	const xCount = w - 1;
	const yCount = h - 1;

	const generateHeights = () => {
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
		return height;
	}

	const computeVertexNormals = () => {
		const vertexNormals = new Float32Array(0);
		let tmp = new THREE.Vector3();
		const computeVertexNormal = () => {
			return tmp;
		}

		let i = 0;
		for (let y = 0; y < h; ++y) {
			for (let x = 0; x < w; ++x) {
				const vertexNormal = computeVertexNormal(hf, x, y);
				i = (y * w + x) * 3;
				vertexNormals[i++] = vertexNormal.x;
				vertexNormals[i++] = vertexNormal.y;
				vertexNormals[i++] = vertexNormal.z;
			}
		}
		tmp = undefined;
		return vertexNormals;
	}

	const computeFaceNormals = () => {
		const faceNormals = new Float32Array(0);
	}

	const computeShade = () => {		
	}

	const packData = () => {
		const canvas = document.createElement('canvas');
		canvas.width = window.app.assets.textures['noise'].image.width - 1;
		canvas.height = window.app.assets.textures['noise'].image.height - 1;
		const ctx = canvas.getContext('2d');
		const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		ctx.putImageData(imgData, 0, 0);
		return new THREE.Texture(canvas);
	}



	const heights = generateHeights();
	const vertexNormals = computeVertexNormals();
	const faceNormals = computeFaceNormals();
	const shade = computeShade();

	

	const texture = packData();
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.needsUpdate = true;
	return texture;
}

export default TerrainMap;

