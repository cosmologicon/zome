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


	targeting: {
		frontmost: obj => -state.cell.distancetoobj(obj),
		strongest: obj => (state.bosses.includes(obj) ? 10000 : 0) + obj.hp,
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
}

var mechanics = {
	X: {
		recharge: 2,
		range: 400,
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
}

