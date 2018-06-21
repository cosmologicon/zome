
// Maintains a certain distance from the cell
let SurroundsMenacingly = {
	init: function (dmenace) {
		this.dmenace = dmenace
	},
	choosetarget: function () {
		let phi = UFX.random(-0.6, 0.6)
		this.target = {
			x: state.cell.x + this.dmenace * Math.sin(phi),
			y: state.cell.y + this.dmenace * Math.cos(phi),
		}
		this.tarrived = 0
	},
	think: function (dt) {
		if (this.tarrived >= 3) this.choosetarget()
	},
}

let SpawnsPeriodically = {
	init: function (spawntime) {
		this.spawntime = spawntime
	},
	start: function () {
		this.tspawn = 0
		this.jspawn = 0
	},
	think: function (dt) {
		this.tspawn += dt
		if (this.tspawn > this.spawntime) {
			if (this.jspawn % 2 == 0) {
				this.spawn("tick", 20)
			} else {
				this.spawn("ant", 10)
			}
			this.tspawn = 0
			this.jspawn++
		}
	},
}



function Wasp(spec) {
	this.start(spec)
	this.color = "#999999"
	this.vcolor0 = [0.8, 0.8, 0.8]
}
Wasp.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, mechanics.wasp.size, mechanics.wasp.mass)
	.addcomp(Kickable)
	.addcomp(Shootable, mechanics.wasp.hp)
	.addcomp(TargetsThing, mechanics.wasp.speed)
	.addcomp(SurroundsMenacingly, 100)
	.addcomp(SpawnsViruses)
	.addcomp(SpawnsPeriodically, 20)
	.addcomp(AnimationTicker, 200)

const BossTypes = {
	wasp: Wasp,
}
