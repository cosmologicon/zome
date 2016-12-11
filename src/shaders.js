"use strict"

const shaders = {
	circle: {},
	organelle: {},
	petri: {},
	virus: {},
	mote: {},
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


shaders.virus.vert = `
// Kaleidoscope effect, vertex shader for viruses

attribute float T;  // Animation ticker 0 <= T < 1
attribute vec2 pU;
attribute vec2 centerG;
attribute float RG;
attribute vec3 vcolor;

uniform vec2 scenterG;
uniform vec2 screensizeV;
uniform float VscaleG;

varying vec3 fvcolor;
varying vec2 tpos0;
varying vec2 tdpos;
varying float Rd, drx, dry;
varying float VscaleU;

const float tau = 6.283185307179586;

void main() {
	float k = 1.0 * tau * T + 0.4 + 3.0 * sin(1.0 * tau * T), Sk = sin(k), Ck = cos(k);
	mat2 Mtilt = mat2(Ck, -Sk, Sk, Ck);

	vec2 pG = centerG + RG * Mtilt * pU;
	vec2 pV = VscaleG * (pG - scenterG);
	vec2 PscaleV = 2.0 / screensizeV;
	vec2 pP = PscaleV * pV;
	gl_Position = vec4(pP, 0.0, 1.0);
	fvcolor = vcolor;

	float dx = sin(4.0 * tau * T + 0.1);
	float dy = sin(7.0 * tau * T + 0.2);
	float dr = 3.0 * tau * T + 0.3 + 2.0 * sin(2.0 * tau * T);

	tpos0 = vec2(0.5) + 0.2 * vec2(dx, dy);
	tdpos = pU;
	Rd = 0.2;
	drx = sin(dr);
	dry = cos(dr);
	VscaleU = VscaleG * RG;
}
`


shaders.virus.frag = `
precision highp float;

uniform sampler2D ktexture;

varying vec3 fvcolor;
varying vec2 tpos0, tdpos;
varying float Rd, drx, dry;
varying float VscaleU;

const float s3 = sqrt(3.0);

const vec3 color0 = vec3(0.5, 0.5, 1.0);
const vec3 color1 = vec3(1.0, 0.8, 0.3);

const vec2 Dp = normalize(vec2(1.0, 0.8));
const float D0 = 0.74;

const vec3 bordercolor = vec3(0.0, 0.0, 0.0);
const float borderwidth = 0.01;

//const float KscaleV = 400.0;
//uniform float R;

void main() {
	vec2 dpos = tdpos;
	dpos = abs(dpos);
	if (false) {  // 4x symmetry
		if (dpos.x < dpos.y) dpos = dpos.yx;
	} else {  // 6x symmetry
		if (dpos.y > (1.0 / s3) * dpos.x) {
			dpos = mat2(0.5, 0.5 * s3, 0.5 * s3, -0.5) * dpos;
		}
		dpos.y = abs(dpos.y);
	}
//	vec3 dcolor = mix(color0, color1, smoothstep(0.4, 0.7, length(dpos)));
//	vec3 dcolor = mix(color0, color1, smoothstep(0.8, 1.9, dpos.x + 6.0 * dpos.y));
	vec3 dcolor = fvcolor;
	float D = dot(dpos, Dp) - D0;
	dpos = sqrt(dpos);
	float a = dpos.x + 0.2 * dpos.y;
	dpos = mat2(dry, -drx, drx, dry) * dpos;
	// color is the non-outline color, either equal to the kaleidoscope color within the boundary
	// of the virus, or transparent outside the boundary.
	vec2 tpos = tpos0 + dpos * Rd;
	vec4 color = D < 0.0 ?
		texture2D(ktexture, tpos) * vec4(dcolor, 1.0) :
		vec4(bordercolor, 0.0);
	// Subpixel border anti-aliasing. The m factor is 0.0 at the center of the border, and 1.0 at
	// either edge of the border.
	float m = clamp((abs(D) - borderwidth) * VscaleU, 0.0, 1.0);
	gl_FragColor = mix(vec4(bordercolor, 1.0), color, m);
}
`



shaders.mote.vert = `
uniform float T;
uniform vec2 offsetV;
uniform vec2 screensizeV;

attribute float fR;
attribute vec2 pU, pos0, Nmove;

varying vec2 tpos;

void main() {
	// Minimum mote radius in pixels
	float r0V = 0.08 * min(screensizeV.x, screensizeV.y);
	
	vec2 Tpos = mod(pos0 + Nmove * T + offsetV * (2.0 * fR), 1.0);
	vec2 centerV = Tpos * (4.0 * r0V + screensizeV) - 2.0 * r0V;
	
	vec2 pV = centerV + pU * fR * r0V;

	gl_Position = vec4((pV / screensizeV) * 2.0 - 1.0, 0.0, 1.0);

	tpos = pU * 0.5 + 0.5;
}
`
shaders.mote.frag = `
precision highp float;
uniform sampler2D mtexture;
varying vec2 tpos;
void main() {
	gl_FragColor = texture2D(mtexture, tpos);
}
`
