// Shader for the black petri dish border

// Double-unit square i.e. (±1, ±1), representing the corners of the viewport.
attribute vec2 pU;

// screen center in game coordinates
uniform vec2 scenterG;

// Size of screen in pixels.
uniform vec2 screensizeP;

// Radius of the play field in game coordinates.
uniform float Rlevel;

// Pixels per game unit (zoom factor).
uniform float PconvertG;

// Dish coordinates, ie, ones in which the petri dish is a unit circle.
varying vec2 pD;
// radius of the petri dish in pixels.
varying float VconvertD;

void main () {
	gl_Position = vec4(pU, 0.0, 1.0);
	vec2 pG = pU * screensizeP * 0.5 / PconvertG + scenterG;
	float DconvertG = 1.0 / Rlevel;
	pD = DconvertG * pG;
	VconvertD = PconvertG * Rlevel;
}
