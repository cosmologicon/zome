"use strict"

// The progress object is the overall game progress state, that gets saved whenever you save your
// game, and is updated when you complete a level or unlock a new ability.
var progress = {
	// levels completed
	completed: {},
	// levels available
	unlocked: {
		1: true,
		"credits": true,
	},
	// number of available organelle slots
	nslots: 3,
	// most recently selected level
	chosen: 1,
	// towers available
	learned: {
		X: true,
	},
	// dialogs heard
	heard: {},
}

// The state object controls the frame-by-frame positions of characters and stuff. Does not get
// saved in a full save, only in a quicksave.
var state = {
	reset: function (levelname) {
		this.levelname = levelname
		this.colliders = []
		this.tlevel = 0
	},

	addobj: function (obj) {
		this.colliders.add(obj)
	},
	removeobj: function (obj) {
		var isntobj = o => o !== obj
		this.colliders = this.colliders.filter(isntobj)
	},
}
state.reset(1)

