// Fragment shader for organelles.

precision highp float;

uniform float PconvertG;

varying vec2 tpos, shadepos;
varying vec3 fcolor;
varying float radiusV;

void main () {
	if (length(tpos) > 1.0) discard;
	vec3 color = fcolor;
	float alpha = clamp((1.0 - length(tpos)) * radiusV, 0.0, 1.0);
	float shade = clamp(1.0 - length(shadepos), 0.0, 1.0);
	gl_FragColor = vec4(color * shade, alpha);
}
