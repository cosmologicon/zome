precision highp float;

// Background color
const vec3 bcolor = vec3(0.0, 0.0, 0.0);

varying vec2 pD;
varying float VconvertD;

void main() {
	float iD = 1.0 - length(pD);
	float iV = VconvertD * iD;
	float alpha = clamp(1.0 - VconvertD * iD, 0.0, 1.0);
	if (alpha == 0.0) discard;
	gl_FragColor = vec4(bcolor, alpha);
}

