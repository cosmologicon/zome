// The recipe component - controls how antibodies behave depending on the organelles they're
// currently holding.

"use strict"

const FollowsRecipe = {
	start: function () {
		this.fullreset()
	},
	addobj: function () {
		this.fullreset()
	},
	reset: function () {
		this.lastshot = this.t
		this.lastangle = UFX.random.angle()
	},
	fullreset: function () {
		this.reset()
		this.lastclick = null
	},
	think: function (dt) {
		const [r, g, b] = this.blobcolor = this.getcolor()
		this.color = "rgb(" + r * 256 + "," + g * 256 + "," + b * 256 + ")"
		if (!progress.learned[this.flavors]) return
		if (this.disabled) {
			this.disabled = Math.max(this.disabled - dt, 0)
		} else {
			recipes[this.flavors].call(this, dt)
		}
	},
	onclick: function () {
		if (this.flavors == "XYZ" && progress.learned.XYZ) recipes.explode.call(this, mechanics.XYZ)
		if (this.flavors == "ZZZ" && progress.learned.ZZZ) recipes.explode.call(this, mechanics.ZZZ)
	},
	getcolor: function () {
		if (this.disabled) return [0.4 + 0.3 * Math.sin(6 * this.disabled), 0, 0]
		if (!progress.learned[this.flavors]) return [30, 30, 30]
		switch (this.flavors) {
			case "X": case "XX": case "XY": case "XXX": case "XXY": case "XYY":
				return [0.6, 0.0, 0.8]
			case "XZ": case "XXZ":
				return [0.8, 0.0, 0.6]
			case "ZZ": case "XZZ":
				return [0.8, 0.8, 0.0]
			case "Y": case "YYY": case "YZ":
				return [0.2, 0.8, 0.2]
			case "XYZ": case "ZZZ":
				return [0.2, 0.2, 0.8]
			case "Z": case "YZZ":
				return [0.0, 0.8, 0.8]
			case "YY": case "YYZ":
				return [0.0, 0.8, 0.0]
		}
	},
}

const recipes = {
	X: function (dt) {
		recipes.trytoshoot.call(this, mechanics.X, recipes.targeting.frontmost)
	},
	XX: function (dt) {
		recipes.trytoshoot.call(this, mechanics.XX, recipes.targeting.strongest)
	},
	XY: function (dt) {
		recipes.trytoshoot.call(this, mechanics.XY, recipes.targeting.frontmost)
		recipes.spawnresource.call(this, mechanics.XY)
	},
	XXX: function (dt) {
		recipes.trytoshoot.call(this, mechanics.XXX, recipes.targeting.weakest)
	},
	XXY: function (dt) {
		recipes.trytoshoot.call(this, mechanics.XXY, recipes.targeting.frontmost)
	},
	XYY: function (dt) {
		recipes.trytoshoot.call(this, mechanics.XYY, recipes.targeting.strongest)
	},
	ZZ: function (dt) {
		recipes.trytoshoot.call(this, mechanics.ZZ, recipes.targeting.strongest)
	},
	XZZ: function (dt) {
		recipes.trytoshoot.call(this, mechanics.XZZ, recipes.targeting.strongest)
	},
	Y: function (dt) {
		recipes.spawnresource.call(this, mechanics.Y)
	},
	YYY: function (dt) {
		recipes.spawnresource.call(this, mechanics.YYY)
	},
	YZ: function (dt) {
		recipes.spawnresource.call(this, mechanics.YZ)
	},
	YY: function (dt) {
		recipes.collect.call(this, mechanics.YY)
	},
	YYZ: function (dt) {
		recipes.collect.call(this, mechanics.YYZ)
	},
	XZ: function (dt) {
		recipes.trytoshoot.call(this, mechanics.XZ, recipes.targeting.strongest)
	},
	XXZ: function (dt) {
		recipes.trytoshoot.call(this, mechanics.XXZ, recipes.targeting.strongest)
	},
	Z: function (dt) {
		recipes.trytoheal.call(this, mechanics.Z)
	},
	YZZ: function (dt) {
		recipes.trytoheal.call(this, mechanics.YZZ)
	},
	// Bombs don't do anything on their own.
	XYZ: function (dt) { },
	ZZZ: function (dt) { },

	targeting: {
		frontmost: obj => -state.cell.distancetoobj(obj),
		strongest: obj => (state.bosses.includes(obj) ? 10000 : 0) + obj.hp,
		weakest: obj => -((state.bosses.includes(obj) ? 10000 : 0) + obj.hp),
	},
	gettarget: function (objs, rmax, targeting) {
		var target = null, tscore = 0
		objs.forEach(obj => {
			var dx = obj.x - this.x, dy = obj.y - this.y, r = rmax + obj.rcollide
			if (dx * dx + dy * dy > r * r) return
			var score = targeting ? targeting(obj) : -(dx * dx + dy * dy)
			if (target === null || score > tscore) {
				target = obj
				tscore = score
			}
		})
		return target
	},
	trytoshoot: function (mechanic, targeting) {
		if (this.lastshot + mechanic.recharge > this.t) return
		var target = recipes.gettarget.call(this, state.shootables(), mechanic.range, targeting)
		if (!target) return
		var type = mechanic.laser ? Laser : Bullet
		state.addobj(new type(this, target, mechanic))
		this.lastshot = this.t + UFX.random(-0.2, 0.2)
	},
	spawnresource: function (mechanic) {
		if (this.lastshot + mechanic.spawnrecharge > this.t) return
		this.lastangle += tau / phi
		this.lastshot = this.t
		var dx = Math.sin(this.lastangle), dy = Math.cos(this.lastangle)
		var rtype = mechanic.spawnsDNA ? DNA : RNA
		var resource = new rtype({x: this.x + 6 * dx, y: this.y + 6 * dy})
		var r = UFX.random(1, 2) * mechanic.spawnkick
		resource.kick(r * dx, r * dy)
		state.addobj(resource)
	},
	collect: function (mechanic) {
		state.resources.forEach(obj => {
			if (obj.distancetoobj(this) <= mechanic.range) {
				obj.collectto(this)
			}
		})
	},
	trytoheal: function (mechanic) {
		if (this.lastshot + mechanic.healrecharge > this.t) return
		var objs = state.antibodies.filter(obj => obj.disabled)
		var target = recipes.gettarget.call(this, objs, mechanic.healrange)
		if (!target) return
		state.addobj(new HealRay(this, target, mechanic))
		this.lastshot = this.t + UFX.random(-0.2, 0.2)
	},
	explode: function (mechanic) {
		if (this.lastclick !== null && this.t - this.lastclick < mechanics.tdoubleclick) {
			this.die()
			var obj = new Explosion({ x: this.x, y: this.y,
				strength: mechanic.AOEstrength, size: mechanic.AOEsize, kick: mechanic.AOEkick })
			state.addobj(obj)
		} else {
			this.lastclick = this.t
		}
	},
}

var mechanics = {
	// ANTIBODY FORMULAS

	// Shoot bullets
	X: {
		recharge: 2,
		range: 40,
		strength: 1,
		RNAprob: 0.2,
		DNAprob: 0,
		kick: 0,
	},
	XX: {
		recharge: 4,
		range: 50,
		strength: 10,
		RNAprob: 0.2,
		DNAprob: 0,
		kick: 20,
	},
	XXX: {
		recharge: 0.35,
		range: 40,
		strength: 1,
		RNAprob: 0.2,
		DNAprob: 0,
		kick: 0,
	},
	XXY: {
		recharge: 5,
		range: 200,
		strength: 10,
		RNAprob: 0.2,
		DNAprob: 0,
		kick: 20,
	},
	XYY: {
		recharge: 2,
		range: 40,
		strength: 1,
		RNAprob: 0.1,
		DNAprob: 0,
		kick: 100,
	},
	// Shoot bullets with area of effect (AOE)
	XZ: {
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
	XXZ: {
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
	// Shoot lasers
	ZZ: {
		laser: true,
		recharge: 1,
		range: 50,
		strength: 5,
		RNAprob: 0,
		DNAprob: 0,
		kick: 0,
	},
	XZZ: {
		laser: true,
		recharge: 3,
		range: 70,
		strength: 25,
		RNAprob: 0,
		DNAprob: 0,
		kick: 0,
	},
	// Spawn resources
	Y: {
		spawnrecharge: 6,
		spawnkick: 40,
	},
	YYY: {
		spawnsDNA: true,
		spawnrecharge: 15,
		spawnkick: 40,
	},
	YZ: {
		spawnsDNA: true,
		spawnrecharge: 5,
		spawnkick: 40,
	},
	// Shoot bullets + spawn resources
	XY: {
		recharge: 1.5,
		range: 40,
		strength: 1,
		RNAprob: 1,
		DNAprob: 0,
		kick: 20,
		spawnrecharge: 12,
		spawnkick: 40,
	},
	// Resource collection
	YY: {
		range: 80,
	},
	YYZ: {
		range: 240,
	},
	// Shoot heal rays at disabled antibodies
	Z: {
		healrecharge: 0.3,
		healrange: 30,
		healstrength: 2,
	},
	YZZ: {
		healrecharge: 0.1,
		healrange: 30,
		healstrength: 99999,
	},
	// Bomba
	XYZ: {
		AOEstrength: 100,
		AOEsize: 50,
		AOEkick: 0,
	},
	ZZZ: {
		AOEstrength: 200,
		AOEsize: 80,
		AOEkick: 0,
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
}

