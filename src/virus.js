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
			// TODO: drop DNA
		}
	},
}

function Ant(spec) {
	this.start(spec)
	this.color = "#666666"
}
Ant.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, 6, 10)
	.addcomp(Kickable)
	.addcomp(Shootable, 5)
	.addcomp(DiesOnArrival)
	.addcomp(TargetsThing, 10, 0.3)

