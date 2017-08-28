let settings = {
	ups: 120,
	maxupf: 20,

	// Organelle colors
	ocolors: {
		X: [1.0, 0.3, 0.1],
		Y: [0.3, 0.4, 1.0],
		Z: [0.8, 1.0, 0.0],
	},
	// Egg colors
	ecolors: {
		X: [0.5, 0.3, 0.0],
		Y: [0.5, 0.3, 0.0],
		Z: [0.5, 0.3, 0.0],
	},

	// Recipe colors
	rcolors: {
		shortgun:  [0.5, 0.0, 0.7],
		mediumgun: [0.6, 0.3, 0.8],
		longgun:   [0.7, 0.5, 0.9],
		laser:     [0.8, 0.5, 0.0],
	},

	gainlevels: 5,
	gainexponent: 1.7,
	// Disabling audio is a one-time thing. This prevents the sound files from even being
	// downloaded, so it can't be re-enabled.
	// Will also be set to true by audio.init() if web audio context is not available.
	AUDIO: !window.location.href.includes("NOAUDIO"),

	DEBUG: window.location.href.includes("DEBUG"),

	xspeed: 1,
	xspeeds: [0.5, 1, 1.5, 2, 3],
}


