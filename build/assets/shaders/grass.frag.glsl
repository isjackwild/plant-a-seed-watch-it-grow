precision highp float;

const vec3 LIGHT_COLOR = vec3(1.0, 1.0, 0.9);
const vec3 AMBIENT_LIGHT = vec3(0.3, 0.3, 0.3);

uniform sampler2D map;
uniform sampler2D heightMap;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform vec3 grassFogColor;
uniform float grassFogFar;

varying vec3 vPosition;
varying vec4 vColor;
varying vec2 vUv;
varying vec2 vSamplePos;

void main() {
	vec4 color = vec4(vColor) * texture2D(map, vec2(vUv.s, vUv.t));
	float depth = gl_FragCoord.z / gl_FragCoord.w;
	// apply 'grass fog' first
	float fogFactor = smoothstep(fogNear, grassFogFar, depth);
	// color.rgb = mix(color.rgb, grassFogColor, fogFactor);
	// then apply atmosphere fog
	// float fogFactor = smoothstep(fogNear, fogFar, depth);
	// color.rgb = mix(color.rgb, fogColor, fogFactor);

	vec4 hdata = texture2D(heightMap, vSamplePos);

	vec3 light = (hdata.g * LIGHT_COLOR) + AMBIENT_LIGHT;
	color.rgb *= light;
	// output
	gl_FragColor = vec4(color.rgb, 1.0 - fogFactor);
}