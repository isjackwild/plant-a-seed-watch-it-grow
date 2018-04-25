export const textureLoader = new THREE.TextureLoader();
window.app = window.app || {};
window.app.assets = {};

export const ShaderLoader = (vertexUrl, fragmentUrl, onLoad, onProgress, onError) => {
	const vertexLoader = new THREE.XHRLoader(THREE.DefaultLoadingManager);
	vertexLoader.setResponseType('text');
	vertexLoader.load(vertexUrl, vertexText => {
		const fragmentLoader = new THREE.XHRLoader(THREE.DefaultLoadingManager);
		fragmentLoader.setResponseType('text');
		fragmentLoader.load(fragmentUrl, fragmentText => {
			onLoad(vertexText, fragmentText);
		});
	}, onProgress, onError);
}


export const loadAssets = (onComplete) => {
	THREE.DefaultLoadingManager.onLoad = onComplete;

	textureLoader.load('assets/maps/grass.jpg', (texture) => {
		window.app.assets.textures = window.app.assets.textures || [];
		window.app.assets.textures['grass'] = texture;
	});

	textureLoader.load('assets/maps/grass-landscape.jpg', (texture) => {
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(250, 250);
		window.app.assets.textures = window.app.assets.textures || [];
		window.app.assets.textures['ground'] = texture;
	});

	textureLoader.load('assets/maps/noise.png', (texture) => {
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		// texture.repeat.set(1000, 1000);
		window.app.assets.textures = window.app.assets.textures || [];
		window.app.assets.textures['noise'] = texture;
	});

	ShaderLoader('assets/shaders/grass.vert.glsl', 'assets/shaders/grass.frag.glsl', (vert, frag) => {
		window.app.assets.shaders = window.app.assets.shaders || [];
		window.app.assets.shaders['grass.vert'] = vert;
		window.app.assets.shaders['grass.frag'] = frag;
	});

	ShaderLoader('assets/shaders/landscape.vert.glsl', 'assets/shaders/landscape.frag.glsl', (vert, frag) => {
		window.app.assets.shaders = window.app.assets.shaders || [];
		window.app.assets.shaders['landscape.vert'] = vert;
		window.app.assets.shaders['landscape.frag'] = frag;
	});
}