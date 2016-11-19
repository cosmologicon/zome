var Lives = {
	start: function () {
		this.alive = true
		this.t = 0
	},
	think: function (dt) {
		this.t += dt
	},
	die: function () {
		this.alive = false
	},
}

var Lifetime = {
	init: function (lifetime) {
		this.lifetime = lifetime || 1
	},
	start: function () {
		this.f = 0
	},
	think: function (dt) {
		this.f = clamp(this.t / this.lifetime, 0, 1)
		if (this.f == 1) this.die()
	},
}

var WorldBound = {
	start: function (obj) {
		this.x = obj.x || 0
		this.y = obj.y || 0
	},
	scootch: function (dx, dy) {
		this.x += dx
		this.y += dy
	},
	distanceto: function (p) {
		var dx = p[0] - this.x, dy = p[1] - this.y
		return Math.sqrt(dx * dx + dy * dy)
	},
}

var Collideable = {
	init: function (r, m) {
		this.rcollide = r
		this.mcollide = m
	},
	collidespec: function () {
		return [this.x, this.y, this.rcollide, this.mcollide]
	},
}

var Kickable = {
	start: function () {
		this.ix = 0
		this.iy = 0
	},
	kick: function (ix, iy) {
		this.ix += ix
		this.iy += iy
	},
	think: function (dt) {
		if (this.ix || this.iy) {
			this.scootch(this.ix * dt, this.iy * dt)
			var f = Math.exp(-2 * dt)
			this.ix *= f
			this.iy *= f
		}
	},
}

