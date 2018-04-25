// LICENSE: MIT
// Copyright (c) 2017 by Mike Linkovich

precision highp float;

const vec3 LIGHT_COLOR = vec3(1.0, 1.0, 0.9);
const vec3 DIRT_COLOR = vec3(0.77, 0.67, 0.45);

uniform sampler2D map;
uniform sampler2D heightMap;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform float grassFogFar;

varying vec2 vUv;
varying vec2 vSamplePos;
varying vec4 vHeightMapValue;


void main() {
	// vec4 hdata = texture2D(heightMap, vSamplePos);
	// float altitude = hdata.r;
	// perturb altitude with some noise using the B channel.
	// float noise = hdata.b;
	vec3 color = texture2D(map, vUv * 1000.0).rgb;

	color = mix(color, vec3(0.0), 0.25 - vHeightMapValue.r);
	// vec3 light = hdata.g * LIGHT_COLOR;
	// float depth = gl_FragCoord.z / gl_FragCoord.w;

	// If terrain is covered by grass geometry, blend color to 'dirt'
	// float dirtFactor = 1.0 - smoothstep(grassFogFar * 0.2, grassFogFar * 0.65, depth);
	// If we're not on a grass terrain type, don't shade it...
	// float dirtShade = (color.r + color.g + color.b) / 3.0;

	// Compute terrain color
	// color = mix(color, DIRT_COLOR * dirtShade, dirtFactor) * light;

	// then apply atmosphere fog
	// float fogFactor = smoothstep(fogNear, fogFar, depth);
	// color = mix(color, fogColor, fogFactor);
	gl_FragColor = vec4(color, 1.0);

	// gl_FragColor = vHeightMapValue;
}
