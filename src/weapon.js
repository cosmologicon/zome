"use strict"

function Bullet(from, to, mechanic) {
	var spec = Object.create(mechanic)
	spec.x = from.x
	spec.y = from.y
	this.start(spec)
	this.target = to
	this.color = "white"
	this.rcollide = Math.sqrt(this.strength)
}
Bullet.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(Lifetime)
	.addcomp(WorldBound)
	.addcomp(Collideable, 3, null)
	.addcomp(TargetsThing, 80)
	.addcomp(HurtsTarget)
	.addcomp(KicksOnArrival)
	.addcomp(DiesOnArrival)


