// Vertex shader for organelles.

// Coordinate systems are as follows!

// U (unit-circle coordinates): coordinates centered on the center of the organelle.

// C (cell coordinates): axis-aligned coordinates centered on the center of the blob, with the same
// scale as game coordinates. Offset from game coordinates by the position of this cell.

// G (game coordinates): Logical coordinate system of the game.

// V (viewport coordinates): axis-aligned, offset from the center of the screen in units of pixels.

// P (clipspace coordinates): coordinates of gl_Position.


// Position in U coordinates, i.e. (±1, ±1) at the corners of the drawn triangle.
attribute vec2 pU;

// Center of the organelle in game coordinates.
attribute vec2 centerG;

// Radius of an organelle in game coordinates.
const float GrU = 6.0;

// screen center
uniform vec2 scenterG;

// Size of screen in pixels.
uniform vec2 screensizeV;

// Pixels per game unit.
uniform float VscaleG;

attribute vec3 color;

varying vec2 tpos, shadepos;
varying vec3 fcolor;
varying float radiusV;

void main() {
	vec2 pG = centerG + GrU * pU;
	vec2 pV = VscaleG * (pG - scenterG);
	vec2 PscaleV = 2.0 / screensizeV;
	vec2 pP = PscaleV * pV;
	gl_Position = vec4(pP, 0.0, 1.0);
	tpos = pU;
	shadepos = 0.4 * (pU - vec2(0.2, 0.4));
	fcolor = color;
	radiusV = VscaleG * GrU;
}

