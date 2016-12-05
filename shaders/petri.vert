// Shader for the black petri dish border

// Double-unit square i.e. (±1, ±1), representing the corners of the viewport.
attribute vec2 pU;

// screen center in game coordinates
uniform vec2 scenterG;

// Size of screen in pixels.
uniform vec2 screensizeV;

// Radius of the play field in game coordinates.
uniform float Rlevel;

// Pixels per game unit (zoom factor).
uniform float VscaleG;

// Dish coordinates, ie, ones in which the petri dish is a unit circle.
varying vec2 pD;
// radius of the petri dish in pixels.
varying float VscaleD;

void main () {
	gl_Position = vec4(pU, 0.0, 1.0);
	vec2 pG = pU * screensizeV * 0.5 / VscaleG + scenterG;
	float DscaleG = 1.0 / Rlevel;
	pD = DscaleG * pG;
	VscaleD = VscaleG * Rlevel;
}
