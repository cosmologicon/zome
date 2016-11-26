"use strict"

var Shootable = {
	init: function (hp0) {
		this.hp0 = hp0 || 1
		this.hp = this.hp0
	},
	shoot: function (strength, RNAprob, DNAprob) {
		if (this.hp <= 0) return
		this.hp -= strength
		if (this.hp <= 0) {
			this.die()
			if (RNAprob && UFX.random.flip(RNAprob)) {
				state.addobj(new RNA({ x: this.x, y: this.y }))
			}
			if (DNAprob && UFX.random.flip(DNAprob)) {
				state.addobj(new DNA({ x: this.x, y: this.y }))
			}
		}
	},
}

var HarmsOnArrival = {
	init: function (strength) {
		this.strength = strength
	},
	arrive: function () {
		if (this.target === state.cell) state.harm(this.strength)
	},
}

var DisablesOnArrival = {
	init: function (tdisable) {
		this.tdisable = tdisable
	},
	arrive: function () {
		if (this.target !== state.cell) {
			this.target.disabled = Math.max(this.target.disabled, this.tdisable)
		}
	},
}

var TargetsAntibodies = {
	init: function (tretarget, targetrange) {
		this.tretarget = tretarget
		this.targetrange = targetrange
	},
	think: function (dt) {
		if (UFX.random(this.tretarget) >= dt) return
		this.target = null
		var r = this.targetrange
		state.antibodies.forEach(obj => {
			var d = this.distancetoobj(obj)
			if (d < r) {
				this.target = obj
				r = d
			}
		})
		if (!this.target) this.target = state.cell
	},
}

function Ant(spec) {
	this.start(spec)
	this.color = "#999999"
}
Ant.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, mechanics.ant.size, mechanics.ant.mass)
	.addcomp(Kickable)
	.addcomp(Shootable, mechanics.ant.hp)
	.addcomp(HarmsOnArrival, mechanics.ant.strength)
	.addcomp(DiesOnArrival)
	.addcomp(TargetsThing, mechanics.ant.speed, 0.3)

function Bee(spec) {
	this.start(spec)
	this.color = "#AAAA44"
}
Bee.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, mechanics.bee.size, mechanics.bee.mass)
	.addcomp(Kickable)
	.addcomp(Shootable, mechanics.bee.hp)
	.addcomp(HarmsOnArrival, mechanics.bee.strength)
	.addcomp(DisablesOnArrival, mechanics.bee.tdisable)
	.addcomp(DiesOnArrival)
	.addcomp(TargetsThing, mechanics.bee.speed, 0.3)
	.addcomp(TargetsAntibodies, mechanics.bee.tretarget, mechanics.bee.targetrange)


