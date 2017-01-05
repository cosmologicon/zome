
var mechanics = {
	hatchtime: {
		X: 8,
		Y: 12,
		Z: 20,
	},

	// Weak short-range
	X: {
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
		gun: {
			recharge: 4,
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
		gun: {
			recharge: 1,
			range: 80,
			strength: 5,
			RNAprob: 0,
			DNAprob: 0,
			kick: 90,
			targeting: "frontmost",
		},
	},
	// Strong laser
	YYY: {
		laser: {
			recharge: 0.3,
			range: 60,
			strength: 4,
			RNAprob: 0,
			DNAprob: 0,
			kick: 0,
			targeting: "strongest",
		},
	},


	tdoubleclick: 0.6,

	ant: {
		hp: 5,
		speed: 10,
		strength: 1,
		size: 6,
		mass: 10,
	},
	tick: {
		hp: 20,
		speed: 20,
		strength: 1,
		size: 4,
		mass: 10,
	},
	megaant: {
		hp: 20,
		speed: 5,
		size: 12,
		mass: 10,
		strength: 10,
		ncarry: 5,
	},
}


let comboinfo = {
	X: "Weak short-range",
	Y: "Medium range/strength",
	XX: "Strong short-range",
	XY: "Long-range with kickback",
	YY: "Weak laser",
	XXX: "Powerful long-range",
	XXY: "Medium range, strong",
	XYY: "Strong kickback",
	YYY: "Strong laser",
}


mechanics.bee = mechanics.ant
