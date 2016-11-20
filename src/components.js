"use strict"

// BASIC EXISTENCE

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

// POSITION IN THE GAME AND COLLISION

var WorldBound = {
	start: function (obj) {
		this.x = obj.x || 0
		this.y = obj.y || 0
	},
	scootch: function (dx, dy) {
		this.x += dx
		this.y += dy
	},
	scootchto: function (x, y) {
		this.scootch(x - this.x, y - this.y)
	},
	distanceto: function (p) {
		var dx = p[0] - this.x, dy = p[1] - this.y
		return Math.sqrt(dx * dx + dy * dy)
	},
}

var Collideable = {
	init: function (r, m) {
		this.rcollide = r
		this.mass = m
	},
	collidespec: function () {
		return [this.x, this.y, this.rcollide, this.mass]
	},
	constraintoworld: function () {
		var d = Math.sqrt(this.x * this.x + this.y * this.y)
		var r = state.R - this.rcollide
		if (d > 0) {
			var f = r / d - 1
			this.scootch(this.x * f, this.y * f)
		}
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

// CONTAINER RELATIONSHIP BETWEEN ORGANELLES AND ANTIBODIES/CELL

var HasSlots = {
	init: function (nslot) {
		this.nslot = nslot || 3
	},
	start: function (spec) {
		this.slots = []
	},
	isfull: function () {
		return this.slots.length >= this.nslot
	},
	cantake: function (obj) {
		return !this.disabled && obj.slots.length + this.slots.length <= this.nslot
	},
	addobj: function (obj) {
		this.slots.push(obj)
		obj.container = this
	},
	removeobj: function (obj) {
		this.slots = this.slots.filter(o => o !== obj)
	},
	ejectall: function () {
		this.slots.forEach(obj => {
			this.removeobj(obj)
			var antibody = obj.toantibody()
			var [ix, iy] = norm(obj.x - this.x, obj.y - this.y, 30)
			antibody.kick(ix, iy)
			state.addobj(antibody)
		})
	},
	splitall: function () {
		if (this.slots.length < 2) return
		state.removeobj(this)
		this.slots.forEach(obj => {
			var antibody = obj.toantibody()
			var [ix, iy] = norm(obj.x - this.x, obj.y - this.y, 10)
			antibody.kick(ix, iy)
			state.addobj(antibody)
		})
	},
	scootch: function (dx, dy) {
		this.slots.forEach(obj => obj.scootch(dx, dy))
	},
	flavors: function () {
		return this.slots.map(obj => obj.flavor).sort().join("")
	},
	think: function (dt) {
		var f = 1 - Math.exp(-dt), x = this.x, y = this.y
		this.slots.forEach(function (obj) {
			obj.x += (x - obj.x) * f
			obj.y += (y - obj.y) * f
		})
		adjust(this.slots, dt)
	},
}

// Antibody resizing
var ResizesWithSlots = {
	start: function () {
		this.resize()
	},
	addobj: function () {
		this.resize()
	},
	removeobj: function () {
		this.resize()
	},
	resize: function () {
		this.mass = 4
		if (this.slots.length > 0) {
			// TODO: better resizing algorithm
			var n = 1.8
			var s = this.slots.map(obj => Math.pow(obj.rcollide, n)).reduce((a, b) => a + b)
			var r = 2 + Math.pow(s, 1 / n)
			this.mass += this.slots.map(obj => obj.mass).reduce((a, b) => a + b)
		} else {
			r = 4
		}
		this.rcollide = 1.2 * r
		this.rmouse = this.rcollide
	},
}

var Contained = {
	toantibody: function () {
		var obj = new Antibody({x: this.x, y: this.y})
		obj.addobj(this)
		return obj
	},
	die: function () {
		this.container.removeobj(this)
	},
}

// CONTROL

var Mouseable = {
	init: function (rmouse) {
		this.rmouse = rmouse
		this.definemethod("onhover")
		this.definemethod("onmousedown")
		this.definemethod("onclick")
		this.definemethod("onrdown")
	},
	within: function (p) {
		var grabfactor = 1.3  // TODO: make a setting
		var dx = p[0] - this.x, dy = p[1] - this.y, r = this.rmouse * grabfactor
		return dx * dx + dy * dy < r * r
	},
}

var Draggable = {
	init: function () {
		// this.draggable means this type of object is in principle draggable. There may be
		// reasons this particular object is not currently draggable, which is reflected by candrag.
		this.draggable = true
	},
	candrag: function () {
		return !this.disabled
	},
	drag: function () {
		control.cursor = this
		state.removeobj(this)
		if (this.slots) this.slots.forEach(obj => state.removeobj(obj))
	},
	drop: function (target) {
		control.cursor = null
		if (target && target.cantake(this)) {
			this.slots.forEach(obj => target.addobj(obj))
		} else {
			state.addobj(this)
		}
		if (this.slots) this.slots.forEach(obj => state.addobj(obj))
	},
}

// If an organelle is within a draggable container (i.e. an antibody), then dragging the organelle
// results in dragging the container. If its container is undraggable (i.e. the cell), then dragging
// the organelle results in the creation of an antibody containing it.
var ContainedDraggable = {
	init: function () {
		this.draggable = true
	},
	candrag: function () {
		return this.container.draggable ? this.container.candrag() : true
	},
	drag: function () {
		if (this.container.draggable) {
			this.container.drag()
		} else {
			this.container.removeobj(this)
			state.removeobj(this)
			var obj = this.toantibody()
			control.cursor = obj
		}
	},
	onclick: function () {
		this.container.onclick()
	},
	onrdown: function () {
		this.container.onrdown()
	},
}

var EjectsOnRightClick = {
	onrdown: function () {
		this.ejectall()
	},
}

var SplitsOnRightClick = {
	onrdown: function () {
		if (!this.disabled) this.splitall()
	},
}



