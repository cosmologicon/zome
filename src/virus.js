"use strict"

var Shootable = {
	init: function (hp0) {
		this.hp0 = hp0 || 1
	},
	start: function () {
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
			this.killed()
		}
	},
	// Called when object is removed by virtue of being shot to death.
	killed: function () {
		state.addobj(new VirusCorpse(this))
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

var InjectsOnArrival = {
	arrive: function () {
		state.addobj(new Injection(this))
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

const CarriesViruses = {
	init: function (carrytype, ncarry) {
		this.carrytype = carrytype
		this.ncarry = ncarry || 3
	},
	killed: function () {
		let theta = UFX.random.angle(), dtheta = tau / this.ncarry
		let ctype = VirusTypes[this.carrytype]
		for (let j = 0 ; j < this.ncarry ; ++j, theta += dtheta) {
			let dx = Math.sin(theta), dy = Math.cos(theta)
			let virus = new ctype({
				x: this.x + 2 * dx,
				y: this.y + 2 * dy,
			})
			virus.kick(50 * dx, 50 * dy)
			virus.target = state.cell
			state.addobj(virus)
		}
	},
}

const EntersTarget = {
	start: function () {
		this.x0 = this.x
		this.y0 = this.y
	},
	think: function (dt) {
		const f = this.f
		this.x = this.target.x * f + this.x0 * (1 - f)
		this.y = this.target.y * f + this.y0 * (1 - f)
	},
}

function Ant(spec) {
	this.start(spec)
	this.color = "#999999"
	this.vcolor0 = [0.8, 0.8, 0.8]
}
Ant.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, mechanics.ant.size, mechanics.ant.mass)
	.addcomp(Kickable)
	.addcomp(Shootable, mechanics.ant.hp)
	.addcomp(HarmsOnArrival, mechanics.ant.strength)
	.addcomp(InjectsOnArrival)
	.addcomp(DiesOnArrival)
	.addcomp(TargetsThing, mechanics.ant.speed, 0.3)
	.addcomp(AnimationTicker, 100)

function Katydid(spec) {
	this.start(spec)
	this.color = "lightgreen"
	this.vcolor0 = [0.3, 0.8, 0.3]
}
Katydid.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, mechanics.katydid.size, mechanics.katydid.mass)
	.addcomp(Kickable)
	.addcomp(Shootable, mechanics.katydid.hp)
	.addcomp(HarmsOnArrival, mechanics.katydid.strength)
	.addcomp(InjectsOnArrival)
	.addcomp(DiesOnArrival)
	.addcomp(TargetsThing, mechanics.katydid.speed, 0.3)
	.addcomp(AnimationTicker, 100)

function Tick(spec) {
	this.start(spec)
	this.color = "lightblue"
	this.vcolor0 = [0.1, 0.6, 1.0]
}
Tick.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, mechanics.tick.size, mechanics.tick.mass)
	.addcomp(Kickable)
	.addcomp(Shootable, mechanics.tick.hp)
	.addcomp(HarmsOnArrival, mechanics.tick.strength)
	.addcomp(InjectsOnArrival)
	.addcomp(DiesOnArrival)
	.addcomp(TargetsThing, mechanics.tick.speed, 0.3)
	.addcomp(AnimationTicker, 100)

function Bee(spec) {
	this.start(spec)
	this.color = "#AAAA44"
	this.vcolor0 = [1.0, 1.0, 0.3]
}
Bee.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, mechanics.bee.size, mechanics.bee.mass)
	.addcomp(Kickable)
	.addcomp(Shootable, mechanics.bee.hp)
	.addcomp(HarmsOnArrival, mechanics.bee.strength)
	.addcomp(DisablesOnArrival, mechanics.bee.tdisable)
	.addcomp(InjectsOnArrival)
	.addcomp(DiesOnArrival)
	.addcomp(TargetsThing, mechanics.bee.speed, 0.3)
	.addcomp(TargetsAntibodies, mechanics.bee.tretarget, mechanics.bee.targetrange)
	.addcomp(AnimationTicker, 100)


function MegaAnt(spec) {
	this.start(spec)
	this.color = "#999999"
	this.vcolor0 = [0.8, 0.8, 0.8]
}
MegaAnt.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, mechanics.megaant.size, mechanics.megaant.mass)
	.addcomp(Kickable)
	.addcomp(Shootable, mechanics.megaant.hp)
	.addcomp(HarmsOnArrival, mechanics.megaant.strength)
	.addcomp(InjectsOnArrival)
	.addcomp(CarriesViruses, "ant", mechanics.megaant.ncarry)
	.addcomp(DiesOnArrival)
	.addcomp(TargetsThing, mechanics.megaant.speed, 0.3)
	.addcomp(AnimationTicker, 100)

function MegaTick(spec) {
	this.start(spec)
	this.color = "lightblue"
	this.vcolor0 = [0.1, 0.6, 1.0]
}
MegaTick.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, mechanics.megatick.size, mechanics.megatick.mass)
	.addcomp(Kickable)
	.addcomp(Shootable, mechanics.megatick.hp)
	.addcomp(HarmsOnArrival, mechanics.megatick.strength)
	.addcomp(InjectsOnArrival)
	.addcomp(CarriesViruses, "tick", mechanics.megatick.ncarry)
	.addcomp(DiesOnArrival)
	.addcomp(TargetsThing, mechanics.megatick.speed, 0.3)
	.addcomp(AnimationTicker, 100)


function VirusCorpse(obj) {
	this.rcollide0 = obj.rcollide
	this.vcolor0 = obj.vcolor0
	this.T = obj.T
	this.start({ x: obj.x, y: obj.y })
	this.kick(obj.ix, obj.iy)
}
VirusCorpse.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(Lifetime, 0.5)
	.addcomp(FadesOut)
	.addcomp(Expands, 3)
	.addcomp(WorldBound)
	.addcomp(Kickable, 0.5)

function Injection(obj) {
	this.rcollide0 = obj.rcollide
	this.vcolor0 = obj.vcolor0
	this.T = obj.T
	this.start({ x: obj.x, y: obj.y })
	this.target = obj.target
}
Injection.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(Lifetime, 1)
	.addcomp(FadesOut)
	.addcomp(Expands, 0)
	.addcomp(WorldBound)
	.addcomp(EntersTarget)


const VirusTypes = {
	ant: Ant,
	katydid: Katydid,
	tick: Tick,
	bee: Bee,
	megaant: MegaAnt,
	megatick: MegaTick,
}
