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
			let mech = mechanics[this.flavors]
			if (mech.gun) recipes.trytoshoot.call(this, mech.gun)
			if (mech.laser) recipes.trytolaser.call(this, mech.laser)
			if (mech.heal) recipes.trytoheal.call(this, mech.heal)
			if (mech.spawn) recipes.spawnresource.call(this, mech.spawn)
			if (mech.collect) recipes.collect.call(this, mech.collect)
		}
	},
	onclick: function () {
		if (!progress.learned[this.flavors]) return
		let mech = mechanics[this.flavors]
		if (mech.bomb) recipes.explode.call(this, mech.bomb)
	},
	getcolor: function () {
		if (this.disabled) return [0.4 + 0.3 * Math.sin(6 * this.disabled), 0, 0]
		if (!progress.learned[this.flavors]) return [30, 30, 30]
		let colorname = mechanics[this.flavors].color
		if (settings.rcolors[colorname]) return settings.rcolors[colorname]
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
	trytoshoot: function (mechanic, laser) {
		if (this.lastshot + mechanic.recharge > this.t) return
		var targeting = recipes.targeting[mechanic.targeting]
		var target = recipes.gettarget.call(this, state.shootables(), mechanic.range, targeting)
		if (!target) return
		var type = laser ? Laser : Bullet
		state.addobj(new type(this, target, mechanic))
		this.lastshot = this.t + UFX.random(-0.2, 0.2)
		if (laser) {
		} else {
			audio.playsfx("shot")
		}
	},
	trytolaser: function (mechanic) {
		recipes.trytoshoot.call(this, mechanic, true)
	},
	spawnresource: function (mechanic) {
		if (this.lastshot + mechanic.recharge > this.t) return
		this.lastangle += tau / phi
		this.lastshot = this.t
		var dx = Math.sin(this.lastangle), dy = Math.cos(this.lastangle)
		var rtype = mechanic.DNA ? DNA : RNA
		var resource = new rtype({x: this.x + 6 * dx, y: this.y + 6 * dy})
		var r = UFX.random(1, 2) * mechanic.kick
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
		if (this.lastshot + mechanic.recharge > this.t) return
		var objs = state.antibodies.filter(obj => obj.disabled)
		var target = recipes.gettarget.call(this, objs, mechanic.range)
		if (!target) return
		state.addobj(new HealRay(this, target, mechanic))
		this.lastshot = this.t + UFX.random(-0.2, 0.2)
	},
	explode: function (mechanic) {
		if (this.lastclick !== null && this.t - this.lastclick < mechanics.tdoubleclick) {
			this.die()
			var obj = new Explosion({ x: this.x, y: this.y,
				strength: mechanic.strength, size: mechanic.size, kick: mechanic.kick })
			state.addobj(obj)
		} else {
			this.lastclick = this.t
		}
	},
}

