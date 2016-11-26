"use strict"

var ExplodesOnArrival = {
	start: function (spec) {
		this.AOEstrength = spec.AOEstrength || 0
		this.AOEsize = spec.AOEsize || 0
		this.AOEkick = spec.AOEkick || 0
	},
	arrive: function () {
		if (!this.target.alive || !this.AOEstrength) return
		var obj = new Explosion({ x: this.x, y: this.y,
			strength: this.AOEstrength, size: this.AOEsize, kick: this.AOEkick })
		state.addobj(obj)
	},
}

var ExplodesIntoViruses = {
	start: function (spec) {
		this.strength = spec.strength || 0
		this.size = spec.size || 0
		this.kick = spec.kick || 0
		this.rcollide = 0
		this.hits = []
	},
	think: function (dt) {
		this.rcollide = this.f * this.size
		state.shootables().forEach(obj => {
			if (this.hits.includes(obj) || !obj.alive) return
			if (!this.colliding(obj)) return
			this.hits.push(obj)
			obj.shoot(this.strength, 0, 0)
			var [ix, iy] = norm(obj.x - this.x, obj.y - this.y, this.kick)
			obj.kick(ix, iy)
		})
	},
}

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
	.addcomp(Lifetime, 5)
	.addcomp(WorldBound)
	.addcomp(Collideable, 3, null)
	.addcomp(TargetsThing, 80)
	.addcomp(ExplodesOnArrival)
	.addcomp(HurtsTarget)
	.addcomp(KicksOnArrival)
	.addcomp(DiesOnArrival)

function Explosion(spec) {
	this.start(spec)
	this.color = "red"
}
Explosion.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(Lifetime, 0.5)
	.addcomp(WorldBound)
	.addcomp(Collideable, 3, null)
	.addcomp(ExplodesIntoViruses)

function HealRay(from, to, mechanic) {
	var spec = Object.create(mechanic)
	spec.x = from.x
	spec.y = from.y
	this.start(spec)
	this.target = to
	this.color = "blue"
}
HealRay.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(Lifetime, 5)
	.addcomp(WorldBound)
	.addcomp(Collideable, 1, null)
	.addcomp(TargetsThing, 120)
	.addcomp(HealsOnArrival)
	.addcomp(DiesOnArrival)

