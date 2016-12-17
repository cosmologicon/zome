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
		XX: true,
		XY: true,
		XXX: true,
		XXY: true,
		XYY: true,
		Y: true,
		YYY: true,
		YZ: true,
		XZ: true,
		XXZ: true,
		Z: true,
		YZZ: true,
		XYZ: true,
		ZZZ: true,
		YY: true,
		YYZ: true,
		ZZ: true,
		XZZ: true,
	},
	// dialogs heard
	heard: {},
}

// The state object controls the frame-by-frame positions of characters and stuff. Does not get
// saved in a full save, only in a quicksave.
var state = {
	reset: function (levelname) {
		this.levelname = levelname
		this.hp = 1000
		this.cell = null
		this.organelles = []
		this.antibodies = []
		this.viruses = []
		this.bosses = []
		this.resources = []
		this.shots = []
		this.lasers = []
		this.vcorpses = []
		this.eggs = []
		this.ecorpses = []
		this.tlevel = 0
		this.RNA = 0
		this.DNA = 0
	},
	colliders: function () {
		return [this.cell].concat(this.antibodies, this.viruses, this.bosses)
	},
	thinkers: function () {
		return [this.cell].concat(this.organelles, this.antibodies, this.viruses, this.bosses,
			this.resources, this.shots, this.lasers, this.vcorpses, this.eggs, this.ecorpses)
	},
	pointables: function () {
		return [this.cell].concat(this.organelles, this.antibodies)
	},
	shootables: function () {
		return this.viruses.concat(this.bosses)
	},
	collectibles: function () {
		return this.resources
	},
	// For 2d-context debugging
	drawables: function () {
		var objs = [this.cell].concat(this.antibodies, this.organelles, this.viruses, this.bosses, this.resources, this.shots)
		if (control.cursor) objs.push(control.cursor)
		if (control.cursor && control.cursor.slots) objs = objs.concat(control.cursor.slots)
		return objs
	},
	drawblobs: function () {
		return this.antibodies.concat([this.cell])
	},

	gettype: function (obj) {
		if (obj instanceof Organelle) return "organelles"
		if (obj instanceof Antibody) return "antibodies"
		if (obj instanceof Ant) return "viruses"
		if (obj instanceof Bee) return "viruses"
		if (obj instanceof Bullet) return "shots"
		if (obj instanceof Explosion) return "shots"
		if (obj instanceof HealRay) return "shots"
		if (obj instanceof Laser) return "lasers"
		if (obj instanceof RNA) return "resources"
		if (obj instanceof DNA) return "resources"
		if (obj instanceof VirusCorpse) return "vcorpses"
		if (obj instanceof Injection) return "vcorpses"
		if (obj instanceof Egg) return "eggs"
		if (obj instanceof EggCorpse) return "ecorpses"
	},
	addobj: function (obj) {
		var type = this.gettype(obj)
		this[type].push(obj)
	},
	removeobj: function (obj) {
		var type = this.gettype(obj)
		this[type] = this[type].filter(o => o !== obj)
	},
	harm: function (strength) {
		this.hp -= strength
	},
	think: function (dt) {
		var isalive = obj => obj.alive
		this.organelles = this.organelles.filter(isalive)
		this.antibodies = this.antibodies.filter(isalive)
		this.viruses = this.viruses.filter(isalive)
		this.bosses = this.bosses.filter(isalive)
		this.shots = this.shots.filter(isalive)
		this.lasers = this.lasers.filter(isalive)
		this.resources = this.resources.filter(isalive)
		this.eggs = this.eggs.filter(isalive)
		this.vcorpses = this.vcorpses.filter(isalive)
		this.ecorpses = this.ecorpses.filter(isalive)
	},

	addvirus: function (vtype, theta, step) {
		step = step || UFX.random(30, 60)
		theta *= tau
		var dx = step * Math.sin(theta), dy = step * Math.cos(theta)
		var x = this.cell.x, y = this.cell.y, r2 = (this.Rlevel + 10) * (this.Rlevel + 10)
		while (x * x + y * y < r2) {
			x += dx
			y += dy
		}
		vtype = {
			ant: Ant,
			bee: Bee,
		}[vtype]
		var obj = new vtype({ x: x, y: y })
		obj.target = this.cell
		this.addobj(obj)
	},
	launchwave: function (wavespec) {
		wavespec.forEach(wave => {
			var [vtype, n, theta] = wave
			for (var i = 0 ; i < n ; ++i) this.addvirus(vtype, theta + UFX.random(-0.05, 0.05))
		})
	},
}
state.reset(1)

