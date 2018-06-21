"use strict"

// The progress object is the overall game progress state, that gets saved whenever you save your
// game, and is updated when you complete a level or unlock a new ability.
let progress0 = {
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
	// actions performed, for the sake of tutorials
	did: {}
}

let progress
function resetprogress() {
	progress = JSON.parse(JSON.stringify(progress0))
}
resetprogress()

function unlockallcombos() {
	;"X Y Z XX XY XZ YY YZ ZZ XXX XXY XXZ XYY XYZ XZZ YYY YYZ YZZ ZZZ".split(" ").forEach(flavors => {
		progress.learned[flavors] = true
	})
}

// The state object controls the frame-by-frame positions of characters and stuff. Does not get
// saved in a full save, only in a quicksave.
let state = {
	reset: function () {
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
		this.wavespecs = []
		this.wavespecs0 = []
		this.twaveticks = []
		this.RNA = 0
		this.DNA = 0
		this.RNArate = 0
		this.DNArate = 0
		this.won = false
		this.lost = false
		this.twon = 0
		this.tlost = 0
	},
	load: function (level) {
		this.reset()
		this.levelname = level
		let spec = levelspec[level]
		this.Rlevel = spec.R
		this.hp0 = this.hp = spec.hp
		this.cell = new Cell({ x: spec.cellpos[0], y: spec.cellpos[1] })
		this.RNA = spec.RNA || 0
		this.DNA = spec.DNA || 0
		this.RNArate = spec.RNArate || 0
		this.DNArate = spec.DNArate || 0
		this.wavespecs = spec.wavespecs.slice()
		this.wavespecs0 = this.wavespecs.slice()
		let flatten = arrs => [].concat.apply([], arrs)
		let uniq = (x, j, arr) => j == 0 || x != arr[j-1]
		this.twaveticks = flatten(this.wavespecs.map(wave => wave[0]).map(t => [t, t - 1, t - 2]))
			.sort((a, b) => a - b).filter(uniq)
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
		let objs = [this.cell].concat(this.antibodies, this.organelles, this.viruses, this.bosses, this.resources, this.shots)
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
		for (let s in VirusTypes) {
			if (obj instanceof VirusTypes[s]) return "viruses"
		}
		for (let s in BossTypes) {
			if (obj instanceof BossTypes[s]) return "bosses"
		}
	},
	addobj: function (obj) {
		let type = this.gettype(obj)
		this[type].push(obj)
		return obj
	},
	removeobj: function (obj) {
		let type = this.gettype(obj)
		this[type] = this[type].filter(o => o !== obj)
	},
	harm: function (strength) {
		this.hp -= strength
	},
	think: function (dt) {
		if (dialog.quiet()) {
			this.tlevel += dt
		}
		let isalive = obj => obj.alive
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
		this.spawnwaves(dt)
		this.spawnresources(dt)
		this.checkwin(dt)
	},
	spawnwaves: function (dt) {
		while (this.wavespecs.length && this.wavespecs[0][0] < this.tlevel) {
			let wave = this.wavespecs.shift()
			this.launchwave([wave.slice(1)])
		}
	},
	spawnresources: function (dt) {
		while (this.twaveticks.length && this.tlevel >= this.twaveticks[0]) {
			this.twaveticks.shift()
			audio.playsfx("tick")
		}
		let randompos = () => {
			while (true) {
				let [x, y] = UFX.random.rdisk()
				x *= this.Rlevel
				y *= this.Rlevel
				if (this.cell.distanceto([x, y]) < 2 * this.cell.rcollide) continue
				return [x, y]
			}
		}
		if (UFX.random.flip(this.RNArate * dt)) {
			let [x, y] = randompos()
			this.addobj(new RNA({x: x, y: y}))
		}
		if (UFX.random.flip(this.DNArate * dt)) {
			let [x, y] = randompos()
			this.addobj(new DNA({x: x, y: y}))
		}
	},
	checkwin: function (dt) {
		if (this.bossbattle) {
			if (this.bosses.length == 0) this.won = true
		} else {
			if (this.wavespecs.length == 0 && this.viruses.length == 0) this.won = true
		}
		if (this.hp <= 0) this.lost = true
		if (this.won) this.twon += dt
		if (this.lost) this.tlost += dt
	},

	outstep: function (theta, step) {
		theta *= tau
		let dx = step * Math.sin(theta), dy = step * Math.cos(theta)
		let x = this.cell.x, y = this.cell.y, r2 = (this.Rlevel + 10) * (this.Rlevel + 10)
		while (x * x + y * y < r2) {
			x += dx
			y += dy
		}
		return [x, y]
	},
	addvirus: function (vtype, theta, step) {
		step = step || UFX.random(30, 60)
		let [x, y] = this.outstep(theta, step)
		vtype = VirusTypes[vtype]
		let obj = new vtype({ x: x, y: y })
		obj.target = this.cell
		return this.addobj(obj)
	},
	launchwave: function (wavespec) {
		let viruses = []
		wavespec.forEach(wave => {
			let [vtype, n, theta] = wave
			for (let i = 0 ; i < n ; ++i) {
				viruses.push(this.addvirus(vtype, theta + UFX.random(-0.05, 0.05)))
			}
		})
		return viruses
	},

	flavorunlocked: function (flavor) {
		return Object.keys(progress.learned).some(flavors => progress.learned[flavors] && flavors.includes(flavor))
	},
	cangrow: function (flavor) {
		if (this.cell.isfull() || !this.flavorunlocked(flavor)) return false
		let [RNA, DNA] = mechanics.cost[flavor]
		if (this.RNA < RNA || this.DNA < DNA) return false
		return true
	},
	grow: function (flavor) {
		if (!this.cangrow(flavor)) return
		let [RNA, DNA] = mechanics.cost[flavor]
		this.RNA -= RNA
		this.DNA -= DNA
		let obj = new Egg({
			x: this.cell.x + UFX.random(-1, 1),
			y: this.cell.y + UFX.random(-1, 1),
			flavor: flavor,
		})
		this.addobj(obj)
		this.cell.addobj(obj)
	},
	instagrow: function (flavor, dx, dy) {
		if (dx === undefined) {
			dx = UFX.random(-1, 1)
			dy = UFX.random(-1, 1)
		}
		let org = this.addobj(new Organelle({
			x: this.cell.x + dx,
			y: this.cell.y + dy,
			flavor: flavor,
		}))
		this.cell.addobj(org)
	},
	drawwaves: function () {
		let drawn = {}
		gl.progs.text.use()
		this.wavespecs0.forEach(wave => {
			let t = this.tlevel - wave[0]
			let angle = wave[3]
			let text, alpha
			if (t < -10) {
				return
			} else if (t < 0) {
				text = "Wave\nincoming\nin:\n" + (-t).toFixed(0) + " sec"
				alpha = clamp(t + 10, 0, 1)
			} else if (t < 10) {
				text = "Wave\nincoming"
				alpha = clamp(10 - t, 0, 1)
			} else {
				return
			}
			if (drawn[angle]) return
			drawn[angle] = true
			let fontsize = Math.ceil(20 * view.VscaleG)
			let [x, y] = this.outstep(angle, 20)
			x += 0.2 * (this.cell.x - x)
			y += 0.2 * (this.cell.y - y)
			gl.progs.text.draw(text, {
				midtop: view.VconvertG([x, y]),
				rotation: -360 * angle,
				fontsize: fontsize,
				fontname: "Stint Ultra Condensed",
				lineheight: 0.85,
				color: "#FF4F4F",
				outline: 2,
				ocolor: "black",
				alpha: 0.4 * alpha,
			})
		})
	},
}
state.reset()

