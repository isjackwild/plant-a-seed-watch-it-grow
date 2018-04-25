const TerrainMap = () => {
	const setupHeightMap = () => {
	}

	const computeVertexNormals = () => {
	}

	const computeVertexNormal = () => {
	}

	const computeFaceNormals = () => {
	}


	const canvas = document.createElement('canvas');
	canvas.width = window.app.assets.textures['noise'].image.width - 1;
	canvas.height = window.app.assets.textures['noise'].image.height - 1;
	const ctx = canvas.getContext('2d');
	const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);


	ctx.putImageData(imgData, 0, 0);
	const texture = new THREE.Texture(canvas);
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.needsUpdate = true;


	return texture;
}

export default TerrainMap;

