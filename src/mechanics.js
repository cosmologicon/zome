
var mechanics = {
	cost: {
		X: [5, 0],
		Y: [5, 0],
		Z: [10, 3],
	},
	hatchtime: {
		X: 8,
		Y: 12,
		Z: 20,
	},
	// ANTIBODY FORMULAS

	// Shoot bullets
	X: {
		gun: {
			recharge: 2,
			range: 40,
			strength: 1,
			RNAprob: 0.2,
			DNAprob: 0,
			kick: 0,
			targeting: "frontmost",
		},
	},
	XX: {
		gun: {
			recharge: 4,
			range: 50,
			strength: 10,
			RNAprob: 0.2,
			DNAprob: 0,
			kick: 20,
			targeting: "strongest",
		},
	},
	XXX: {
		gun: {
			recharge: 0.35,
			range: 40,
			strength: 1,
			RNAprob: 0.2,
			DNAprob: 0,
			kick: 0,
			targeting: "weakest",
		},
	},
	XXY: {
		gun: {
			recharge: 5,
			range: 200,
			strength: 10,
			RNAprob: 0.2,
			DNAprob: 0,
			kick: 20,
			targeting: "frontmost",
		},
	},
	XYY: {
		gun: {
			recharge: 2,
			range: 40,
			strength: 1,
			RNAprob: 0.1,
			DNAprob: 0,
			kick: 100,
			targeting: "strongest",
		},
	},
	// Shoot bullets with area of effect (AOE)
	XZ: {
		gun: {
			recharge: 1,
			range: 60,
			strength: 10,
			kick: 0,
			AOEstrength: 3,
			AOEsize: 20,
			AOEkick: 40,
			RNAprob: 0.1,
			DNAprob: 0,
		},
	},
	XXZ: {
		gun: {
			recharge: 3,
			range: 60,
			strength: 20,
			kick: 0,
			AOEstrength: 6,
			AOEsize: 25,
			AOEkick: 40,
			RNAprob: 0,
			DNAprob: 0,
		},
	},
	// Shoot lasers
	ZZ: {
		laser: {
			recharge: 1,
			range: 50,
			strength: 5,
			RNAprob: 0,
			DNAprob: 0,
			kick: 0,
			targeting: "strongest",
		},
	},
	XZZ: {
		laser: {
			recharge: 3,
			range: 70,
			strength: 25,
			RNAprob: 0,
			DNAprob: 0,
			kick: 0,
			targeting: "strongest",
		},
	},
	// Spawn resources
	Y: {
		spawn: {
			recharge: 6,
			kick: 40,
		},
	},
	YYY: {
		spawn: {
			DNA: true,
			recharge: 15,
			kick: 40,
		},
	},
	YZ: {
		spawn: {
			DNA: true,
			recharge: 5,
			kick: 40,
		},
	},
	// Shoot bullets + spawn resources
	XY: {
		gun: {
			recharge: 1.5,
			range: 40,
			strength: 1,
			RNAprob: 1,
			DNAprob: 0,
			kick: 20,
			targeting: "frontmost",
		},
		spawn: {
			recharge: 12,
			kick: 40,
		},
	},
	// Resource collection
	YY: {
		collect: {
			range: 80,
		},
	},
	YYZ: {
		collect: {
			range: 240,
		},
	},
	// Shoot heal rays at disabled antibodies
	Z: {
		heal: {
			recharge: 0.3,
			range: 30,
			strength: 2,
		},
	},
	YZZ: {
		heal: {
			recharge: 0.1,
			range: 30,
			strength: 99999,
		},
	},
	// Bomba
	XYZ: {
		bomb: {
			strength: 100,
			size: 50,
			kick: 0,
		},
	},
	ZZZ: {
		bomb: {
			strength: 200,
			size: 80,
			kick: 0,
		},
	},

	tdoubleclick: 0.6,

	ant: {
		hp: 1,
		speed: 10,
		strength: 1,
		size: 6,
		mass: 10,
	},
	bee: {
		hp: 2,
		speed: 10,
		strength: 2,
		size: 6,
		mass: 10,
		tdisable: 20,
		tretarget: 1,
		targetrange: 50,
	},
	megaant: {
		hp: 20,
		speed: 5,
		size: 12,
		mass: 10,
		strength: 10,
		ncarry: 5,
	},

	// New enemies in JS version.
	tick: {
		hp: 3,
		speed: 20,
		strength: 1,
		size: 4,
		mass: 10,
	},
	katydid: {
		hp: 80,
		speed: 3,
		strength: 10,
		size: 9,
		mass: 25,
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
	X: "Short-range, weak, rapid fire",
	XX: "Medium-range, medium strength",
	XY: "Long-range with kickback",
}

