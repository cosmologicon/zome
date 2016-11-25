// The recipe component - controls how antibodies behave depending on the organelles they're
// currently holding.

"use strict"

var FollowsRecipe = {
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
		if (!progress.learned[this.flavors]) return
		if (this.disabled) {
			this.disabled = Math.max(this.disabled - dt, 0)
		} else {
			recipes[this.flavors].call(this, dt)
		}
	},
}

var recipes = {
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
	Y: function (dt) {
		recipes.spawnresource.call(this, mechanics.Y)
	},
	YYY: function (dt) {
		recipes.spawnresource.call(this, mechanics.YYY)
	},
	YZ: function (dt) {
		recipes.spawnresource.call(this, mechanics.YZ)
	},
	XZ: function (dt) {
		recipes.trytoshoot.call(this, mechanics.XZ, recipes.targeting.strongest)
	},
	XXZ: function (dt) {
		recipes.trytoshoot.call(this, mechanics.XXZ, recipes.targeting.strongest)
	},

	targeting: {
		frontmost: obj => -state.cell.distancetoobj(obj),
		strongest: obj => (state.bosses.includes(obj) ? 10000 : 0) + obj.hp,
		weakest: obj => -((state.bosses.includes(obj) ? 10000 : 0) + obj.hp),
	},
	gettarget: function (objs, rmax, targeting) {
		var target = null, tscore = 0
		state.shootables().forEach(obj => {
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
		var target = recipes.gettarget.call(this, mechanic.range, targeting)
		if (!target) return
		state.addobj(new Bullet(this, target, mechanic))
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
}

var mechanics = {
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


	ant: {
		hp: 1,
		speed: 10,
		strength: 1,
		size: 6,
		mass: 10,
	},
}

