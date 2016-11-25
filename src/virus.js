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
		state.harm(this.strength)
	},		
}

function Ant(spec) {
	this.start(spec)
	this.color = "#666666"
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

