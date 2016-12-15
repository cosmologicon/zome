"use strict"

const shaders = {
	circle: {},
	organelle: {},
	petri: {},
	virus: {},
	mote: {},
	blob: {},
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



shaders.blob.vert = `
// Screen parameters
uniform vec2 scenterG;
uniform vec2 screensizeV;
uniform float VscaleG;

attribute vec2 pU;

// Animation ticker, in the range [0, 1)
attribute float T;

// Blob constants
attribute vec2 centerG;
attribute float GradiusU;
attribute float t0;
attribute vec3 color;

// Impulse vector, used to determine the "dragging" effect when a blob is in motion. This should
// be 0 when the blob is motionless, and have a maximum length of 1.
attribute vec2 impulse;

// The main purpose of this shader is to determine the posH texture positions, and the J inverse
// transformation matrices. posH is the location on the hill texture from which the z-value and
// the grad(z)-value will be read. J is the inverse transformation matrix to be applied to the
// grad(z) value after it's read from the texture. That is, J is the Jacobian from posH1/posH2
// coordinates back to posH0 coordinates.
varying vec2 posH[3];
varying vec4 Jv1, Jv2;

// Base color
varying vec3 fcolor;
varying float GscaleU;

const float tau = 6.283185307179586;

void applyS(float omega, float toff, inout vec2 pos, inout mat2 J) {
	float theta = omega * tau * T + toff;
	float sigma = 1.0 + 0.1 * sin(theta);
	pos = vec2(sigma, 1.0 / sigma) * pos;
	J = J * mat2(sigma, 0.0, 0.0, 1.0 / sigma);
}

void applyI(vec2 impulse, inout vec2 pos, inout mat2 J) {
	vec2 isqueeze = 1.0 + abs(impulse).yx;
	pos *= isqueeze;
	pos += impulse;
	J = J * mat2(1.0 / isqueeze.x, 0.0, 0.0, 1.0 / isqueeze.y);
}

void applyR(float omega, float toff, inout vec2 pos, inout mat2 J) {
	float theta = omega * tau * T + toff;
	float S = sin(theta), C = cos(theta);
	pos = mat2(C, S, -S, C) * pos;
	J = J * mat2(C, -S, S, C);
}

void main() {
	vec2 pG = centerG + GradiusU * pU;
	vec2 pV = VscaleG * (pG - scenterG);
	vec2 PscaleV = 2.0 / screensizeV;
	vec2 pP = PscaleV * pV;
	gl_Position = vec4(pP, 0.0, 1.0);

	// Texture #0 is simply a single peak that never gets skewed or stretched.
	posH[0] = (pU + 1.0) / 2.0;

	vec2 pos1 = pU;
	mat2 J1 = mat2(1.0, 0.0, 0.0, 1.0);
	applyS(7.0, t0 + 0.567, pos1, J1);
	applyI(0.3 * impulse, pos1, J1);
	applyR(-3.0, t0, pos1, J1);
	posH[1] = (pos1 + 1.0) / 2.0;

	vec2 pos2 = pU;
	mat2 J2 = mat2(1.0, 0.0, 0.0, 1.0);
	applyS(2.0, t0 + 0.678, pos2, J2);
	applyI(0.2 * impulse, pos2, J2);
	applyR(5.0, t0 + 0.123, pos2, J2);
	posH[2] = (pos2 + 1.0) / 2.0;

	// Convert the transformation matrices to vec4 for transit. For some reason Chrome on Android
	// lost it when they were matrices.
	Jv1 = vec4(J1);
	Jv2 = vec4(J2);
	fcolor = color;
	GscaleU = GradiusU;
}
`

shaders.blob.frag = `
precision highp float;
const int Nhill = 3;  // number of hill textures
uniform float A[Nhill + 1], Ad[Nhill];

// Basic blob color, before any lighting effect applied
varying vec3 fcolor;

uniform float VscaleG;
uniform sampler2D hilltextures[Nhill];
varying vec2 posH[Nhill];
varying vec4 Jv1, Jv2;
varying float GscaleU;

const vec3 bordercolor = vec3(0.0, 0.0, 0.0);
const float borderwidthG = 0.1;

const float shadewidthU = 0.1;
const float shadefactor = 0.4;

// lighting direction
const vec2 L = normalize(vec2(0.2, 0.4));

void main() {
	mat2 J1 = mat2(Jv1), J2 = mat2(Jv2);

	// The values of the vector-valued function z(pU) are stored in the z channel of the three hill
	// textures. The values of grad(z) = <dz/dxU, dz/dyU> are stored in the x and y channels. In
	// each case the stored value is transformed to its actual value by a scaling parameter A or Ad.
	// grad(z) values are stored such that a value of 0.5 corresponds to an actual value of 0.

	// Get z and grad(z) from the hill textures, applying the J-transformations to grad(z).
	vec3 h0 = texture2D(hilltextures[0], posH[0]).xyz;
	vec3 h1 = texture2D(hilltextures[1], posH[1]).xyz;
	vec3 h2 = texture2D(hilltextures[2], posH[2]).xyz;
	float z = A[0] + h0.z * A[1] + h1.z * A[2] + h2.z * A[3];
	vec2 gradz = (h0.xy - 0.5) * Ad[0] + J1 * (h1.xy - 0.5) * Ad[1] + J2 * (h2.xy - 0.5) * Ad[2];

	// The m factor estimates how far we are from the edge (defined as z = 0), using a first-order
	// approximation, ie, assuming grad z is constant over the local area. The approximation gets
	// much worse far from the edge, but fortunately we don't need it there.
	
	// z is unitless, and gradz in this case is the derivative with respect to pU.
	// Thus |z| / |grad(z)| has units of U's.
	float mU = abs(z) / length(gradz);
	float mG = GscaleU * mU;
	float mV = VscaleG * mG;

	// Lighting factor for the edge shading effect. Higher means facing in the direction of the
	// light (i.e. the gradient is in the direction opposite the light).
	float lfactor = -shadefactor * dot(gradz, L);
	lfactor *= 2.0 - smoothstep(0.0, 2.0 * shadewidthU, mU);  // Makes it better around the edges.
	lfactor = clamp(lfactor, -1.0, 1.0);
	lfactor *= 1.0 - smoothstep(shadewidthU, 2.0 * shadewidthU, mU);
	vec3 lcolor = fcolor * (1.0 + 0.4 * lfactor);  // Apply lighting factor.

	// Black border effect. The a value is used for subpixel anti-aliasing, like the m value in the
	// virus fragment shader.
	vec4 color1 = z > 0.0 ? vec4(lcolor, 1.0) : vec4(bordercolor, 0.0);
	float borderwidthV = VscaleG * borderwidthG;
	float a = clamp(0.5 * mV - borderwidthV, 0.0, 1.0);  // Not sure why 0.5 here?
	gl_FragColor = mix(vec4(bordercolor, 1.0), color1, a);
}
`

