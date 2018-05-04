// LICENSE: MIT
// Copyright (c) 2017 by Mike Linkovich

precision highp float;

const vec3 LIGHT_COLOR = vec3(1.0, 1.0, 1.0);
const vec3 AMBIENT_LIGHT = vec3(0.8, 0.8, 0.8);
const vec3 DIRT_COLOR = vec3(0.77, 0.67, 0.45);

uniform sampler2D map1;
uniform sampler2D map2;
uniform sampler2D heightMap;
uniform vec3 fogColor;
uniform vec3 sandColor;
uniform float fogNear;
uniform float fogFar;
uniform float grassFogFar;

varying vec2 vUv;
varying vec2 vSamplePos;
varying vec4 vHeightMapValue;

// NOISE STUFF
float random (in vec2 st) {
	return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Value noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/lsf3WH
float valNoise (vec2 st) {
	vec2 i = floor(st);
	vec2 f = fract(st);
	vec2 u = f * f * (3.0 - 2.0 * f);

	return mix(
		mix(
			random(i + vec2(0.0, 0.0)),
			random(i + vec2(1.0, 0.0)),
			u.x
		),
		mix(
			random(i + vec2(0.0, 1.0)),
			random(i + vec2(1.0, 1.0)),
			u.x
		),
		u.y
	);
}

mat2 rotate2d (float angle) {
	return mat2(
		cos(angle),
		sin(angle) * -1.0,
		sin(angle),
		cos(angle)
	);
	// return mat2(1.0);
}

float lines (in vec2 pos, float b) {
	float scale = 10.0;
	pos *= scale;
	return smoothstep(
		0.0,
		0.5 + b * 0.5,
		abs((sin(pos.x * 3.1415) + b * 2.0)) * 0.5
	);
}

float waves (in vec2 pos) {
	float scale = 10.0;
	return mod(pos.x * scale, 1.0);
}

float blendColorBurn(float base, float blend) {
	return (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);
}

vec3 blendColorBurn(vec3 base, vec3 blend) {
	return vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));
}

vec3 blendColorBurn(vec3 base, vec3 blend, float opacity) {
	return (blendColorBurn(base, blend) * opacity + base * (1.0 - opacity));
}


void main() {
	vec4 hdata = texture2D(heightMap, vSamplePos);
	vec3 color = sandColor;
	vec3 sand = texture2D(map1, vUv * 2050.0).rgb * 0.2;
	vec3 grass = texture2D(map2, vUv * 250.0).rgb;

	float depth = gl_FragCoord.z / gl_FragCoord.w;

	vec2 resolution = vec2(100.0, 23.0);
	vec2 st = vUv.xy * resolution;
	st.y *= resolution.y / resolution.x;

	vec2 pos = st.yx * vec2(10.0, 3.0);
	// float pattern = pos.x;
	float n = valNoise(pos * 0.3);
	pos = rotate2d(n) * pos;
	float linesOut = lines(pos, 0.9);
	float wavesOut = waves(pos);
	float pattern = linesOut * 1.0 - (wavesOut * 0.5);
	pattern = wavesOut * 1.0 - (linesOut * 0.5);
	pattern = wavesOut * linesOut;
	pattern = wavesOut;

	// vec3 color = texture2D(map, vUv * 500.0).rgb;

	// color = mix(color, vec3(0.0), 0.25 - vHeightMapValue.r);
	vec3 light = (hdata.g * LIGHT_COLOR) + AMBIENT_LIGHT;

	// If terrain is covered by grass geometry, blend color to 'dirt'
	
	// If we're not on a grass terrain type, don't shade it...
	// float dirtShade = (color.r + color.g + color.b) / 3.0;

	// Compute terrain color
	// color = mix(color, DIRT_COLOR * dirtShade, dirtFactor) * light;

	// then apply atmosphere fog
	
	float fogFactor = smoothstep(fogNear, fogFar, depth);
	color = blendColorBurn(color, vec3(1.0 - (pattern * 0.6 * (1.0 - fogFactor))), 0.5);	
	color -= sand;

	float grassFactor = smoothstep(0.0, grassFogFar * 1.0, depth) * 0.66;
	color = mix(color, grass, grassFactor);

	color *= light;

	// float fogFactor = smoothstep(fogNear, fogFar, depth);
	color = mix(color, fogColor, fogFactor);

	gl_FragColor = vec4(color, 1.0);
}
