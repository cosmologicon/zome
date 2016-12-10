"use strict"

const shaders = {
	circle: {},
	organelle: {},
	petri: {},
}

shaders.circle.vert = `
// Simple circle-drawing shader for debugging

attribute vec2 pU;
attribute vec2 centerG;
attribute float RG;
attribute vec3 color;

uniform vec2 scenterG;
uniform vec2 screensizeV;
uniform float VscaleG;

varying vec2 fpU;
varying vec3 fcolor;

void main() {
	vec2 pG = centerG + RG * pU;
	vec2 pV = VscaleG * (pG - scenterG);
	vec2 PscaleV = 2.0 / screensizeV;
	vec2 pP = PscaleV * pV;
	gl_Position = vec4(pP, 0.0, 1.0);
	fpU = pU;
	fcolor = color;
}
`

shaders.circle.frag = `
precision highp float;

varying vec2 fpU;
varying vec3 fcolor;

void main () {
	if (length(fpU) > 1.0) discard;
	vec3 color = length(fpU) > 0.95 ? vec3(0.0) : fcolor;
	gl_FragColor = vec4(color, 1.0);
}
`


shaders.organelle.vert = `
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
`


shaders.organelle.frag = `
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
`


shaders.petri.vert = `
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
`

shaders.petri.frag = `
precision highp float;

// Background color
const vec3 bcolor = vec3(0.0, 0.0, 0.0);

varying vec2 pD;
varying float VscaleD;

void main() {
	float iD = 1.0 - length(pD);
	float alpha = clamp(1.0 - VscaleD * iD, 0.0, 1.0);
	if (alpha == 0.0) discard;
	gl_FragColor = vec4(bcolor, alpha);
}
`
