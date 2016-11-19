// Shader for blob0 program - draw a single blob.

// Coordinate systems are as follows!

// U (unit-circle coordinates): axis-aligned coordinates centered on the center of the blob, chosen
// such that everything that needs to be drawn to the screen is within the unit circle in this
// coordinate system.

// C (cell coordinates): axis-aligned coordinates centered on the center of the blob, with the same
// scale as game coordinates. Offset from game coordinates by the position of this cell.

// G (game coordinates): Logical coordinate system of the game.

// P (pixel coordinates): axis-aligned, offset from the center of the screen in units of pixels.

// V (viewport coordinates): coordinates of gl_Position.

// S (sampler coordinates): this is a set of 3 different coordinates systems, one for each of the


// Position in U coordinates, i.e. (±1, ±1) at the corners of the drawn triangle.
attribute vec2 pU;

// T-parameter, varying between 0 and 1 over the course of the blob motion cycle.
uniform float T;

// Center of the blob in game coordinates.
uniform vec2 centerG;

// screen center
uniform vec2 scenterG;

// Size of screen in pixels.
uniform vec2 screensizeP;

// Pixels per game unit.
uniform float PconvertG;

const float CconvertU = 1.0;

varying vec2 pS0, pS1, pS2;
varying mat2 dS1, dS2;


// TODO: just placeholders. should be different for different blobs
const float T1 = 0.0;


// Returns the C-to-S conversion matrix.
// Sets dS to the corresponding directional derivative back-conversion matrix.
mat2 xform(float T1, out mat2 dS) {


	float kappa = 1.0;
	float q = 1.0;
	float sigma = 1.0;

	float Ckappa = cos(kappa), Skappa = sin(kappa);
	float Csigma = cos(sigma), Ssigma = sin(sigma):

	mat2 S = mat2(
		q * Csigma * Csigma + Ssigma * Ssigma / q,
		Csigma * Ssigma * (q - 1.0 / q),
		Csigma * Ssigma * (q - 1.0 / q),
		q * Ssigma * Ssigma + Csigma * Csigma / q
	)
	mat2 R = mat2(Ckappa, Skappa, -Skappa, Ckappa);
	mat2 Rinv = mat2(Ckappa, -Skappa, Skappa, Ckappa);

	dS = Rinv * S;
	return S * R;
}


void main() {
	vec2 pC = CconvertU * pU;
	vec2 pG = centerG + pC;
	vec2 pP = PconvertG * (pG - scenterG);
	vec2 VconvertP = 2.0 / screensizeP;
	vec2 pV = VconvertP * pP;
	gl_Position = vec4(pV, 0.0, 1.0);

	mat2 S1convertC = xform(fract(13.0 * T1), dS1);
	mat2 S2convertC = xform(fract(21.0 * T1), dS2);

	pS0 = (pC + 1.0) / 2.0;
	pS1 = (S1convertC * pC + 1.0) / 2.0;
	pS2 = (S2convertC * pC + 1.0) / 2.0;
}
