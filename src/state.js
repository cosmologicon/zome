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
		this.cell = null
		this.organelles = []
		this.antibodies = []
		this.tlevel = 0
	},
	colliders: function () {
		return [this.cell].concat(this.antibodies)
	},
	thinkers: function () {
		return [this.cell].concat(this.organelles, this.antibodies)
	},
	pointables: function () {
		return [this.cell].concat(this.organelles, this.antibodies)
	},
	// For 2d-context debugging
	drawables: function () {
		var objs = [this.cell].concat(this.antibodies, this.organelles)
		if (control.cursor) objs.push(control.cursor)
		if (control.cursor && control.cursor.slots) objs = objs.concat(control.cursor.slots)
		return objs
	},

	gettype: function (obj) {
		if (obj instanceof Organelle) return "organelles"
		if (obj instanceof Antibody) return "antibodies"
	},
	addobj: function (obj) {
		var type = this.gettype(obj)
		this[type].push(obj)
	},
	removeobj: function (obj) {
		var type = this.gettype(obj)
		this[type] = this[type].filter(o => o !== obj)
	},
}
state.reset(1)

