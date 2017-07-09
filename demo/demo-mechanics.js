
let mechanics = {
	hatchtime: {
		X: 8,
		Y: 12,
		Z: 20,
	},

	// Weak short-range
	X: {
		color: "shortgun",
		gun: {
			recharge: 0.5,
			range: 20,
			strength: 1,
			RNAprob: 0,
			DNAprob: 0,
			kick: 5,
			targeting: null,
		},
	},
	// Medium range/strength
	Y: {
		color: "mediumgun",
		gun: {
			recharge: 2,
			range: 40,
			strength: 3,
			RNAprob: 0,
			DNAprob: 0,
			kick: 10,
			targeting: null,
		},
	},
	// Strong short-range
	XX: {
		color: "shortgun",
		gun: {
			recharge: 2,
			range: 20,
			strength: 30,
			RNAprob: 0,
			DNAprob: 0,
			kick: 20,
			targeting: "strongest",
		},
	},
	// Long-range with kickback
	XY: {
		color: "longgun",
		gun: {
			recharge: 2,
			range: 100,
			strength: 10,
			RNAprob: 0,
			DNAprob: 0,
			kick: 60,
			targeting: "frontmost",
		},
	},
	// Weak laser
	YY: {
		color: "laser",
		laser: {
			recharge: 0.3,
			range: 40,
			strength: 1,
			RNAprob: 0,
			DNAprob: 0,
			kick: 0,
			targeting: "weakest",
		},
	},
	// Powerful long-range
	XXX: {
		color: "longgun",
		gun: {
			recharge: 10,
			range: 100,
			strength: 100,
			RNAprob: 0,
			DNAprob: 0,
			kick: 20,
			targeting: "strongest",
		},
	},
	// Medium-range, strong
	XXY: {
		color: "mediumgun",
		gun: {
			recharge: 6,
			range: 40,
			strength: 100,
			RNAprob: 0,
			DNAprob: 0,
			kick: 20,
			targeting: "strongest",
		},
	},
	// Strong kickback
	XYY: {
		color: "longgun",
		gun: {
			recharge: 1,
			range: 80,
			strength: 10,
			RNAprob: 0,
			DNAprob: 0,
			kick: 90,
			targeting: "frontmost",
		},
	},
	// Strong laser
	YYY: {
		color: "laser",
		laser: {
			recharge: 0.6,
			range: 60,
			strength: 10,
			RNAprob: 0,
			DNAprob: 0,
			kick: 0,
			targeting: "strongest",
		},
	},


	tdoubleclick: 0.6,

	ant: {
		hp: 5,
		speed: 6,
		strength: 2,
		size: 6,
		mass: 10,
	},
	katydid: {
		hp: 80,
		speed: 3,
		strength: 10,
		size: 9,
		mass: 25,
	},
	tick: {
		hp: 1,
		speed: 20,
		strength: 1,
		size: 3,
		mass: 10,
	},
	megaant: {
		hp: 40,
		speed: 5,
		size: 12,
		mass: 30,
		strength: 20,
		ncarry: 5,
	},
	megatick: {
		hp: 80,
		speed: 5,
		size: 9,
		mass: 30,
		strength: 20,
		ncarry: 16,
	},
}


let comboinfo = {
	X: "Weak rapid short-range",
	Y: "Medium range/strength",
	XX: "Strong short-range",
	XY: "Long-range with kickback",
	YY: "Rapid laser",
	XXX: "Powerful long-range",
	XXY: "Medium range, strong",
	XYY: "Strong kickback",
	YYY: "Strong laser",
}


mechanics.bee = mechanics.ant
