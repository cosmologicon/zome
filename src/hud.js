// HUD, or generally all on-screen controls.
// Different scenes can have their own HUD.

const DrawAsText = {
	start: function (opts) {
		this.text = opts.text
		this.rotation = opts.rotation || 0
		this.fontsize = opts.fontsize
		this.fontname = opts.fontname
		this.color = opts.color
		this.ocolor = "black"
	},
	draw: function () {
		let pos = view.VconvertG([this.x, this.y])
		gl.progs.text.draw(this.text, {
			center: this.drawpos(),
			fontsize: this.drawsize(),
			fontname: this.fontname,
			color: this.color,
			ocolor: this.ocolor,
			rotation: this.rotation,
			alpha: this.drawalpha(),
		})
	},
}

const WorldBoundText = {
	drawpos: function () {
		return view.VconvertG([this.x, this.y])
	},
	drawsize: function () {
		return view.VscaleG * this.fontsize
	},
	drawalpha: function () {
		return 0.4 * this.alpha
	},
}

// Background messages, that appear within the gameplay area behind game objects
function Bmessage (text, pos, options) {
	var opts = Object.create(options || {})
	opts.x = pos[0]
	opts.y = pos[1]
	opts.fontname = opts.fontname || "Stint Ultra Condensed"
	opts.fontsize = opts.fontsize || 20
	opts.color = "#FF4F4F"
	opts.text = text
	this.start(opts)
	this.lifetime = opts.lifetime || 9999999
}
Bmessage.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(Lifetime, 0)
	.addcomp(FadesInAndOut)
	.addcomp(WorldBound)
	.addcomp(DrawAsText)
	.addcomp(WorldBoundText)
	

function Button(text, onclick, corner, offset, opts) {
	opts = opts || {}
	this.text = text
	this.color = opts.color || [0.4, 0.4, 0.4]
	this.onclick = onclick
	this.fontscale = opts.fontscale || 0.5
	this.fontsize = 10
	this.rV = 10
	this.pV = [0, 0]
	this.corner = corner
	this.offset = offset
}
Button.prototype = {
	setsize: function (bsize) {
		this.rV = bsize
		this.fontsize = this.fontscale * bsize
		let [x0, y0] = {
			topleft: [0, 1],
			topright: [1, 1],
			bottom: [0.5, 0],
		}[this.corner]
		let [dx0, dx] = { 0: [1, 1], 0.5: [0, 1], 1: [-1, -1] }[x0]
		let [dy0, dy] = { 0: [1, 1], 0.5: [0, 1], 1: [-1, -1] }[y0]
		this.pV = [
			x0 * view.wV + (dx0 * 1.1 + dx * 2.1 * this.offset[0]) * bsize,
			y0 * view.hV + (dy0 * 1.1 + dy * 2.1 * this.offset[1]) * bsize,
		]
	},
	within: function (pV) {
		var dx = pV[0] - this.pV[0], dy = pV[1] - this.pV[1]
		return dx * dx + dy * dy < this.rV * this.rV
	},
	drawtext: function () {
		gl.progs.text.draw(this.text, {
			center: [this.pV[0], this.pV[1] + 0.2 * this.fontsize],
			fontsize: this.fontsize,
			fontname: "Sansita One",
			ocolor: "black",
		})
	},
}
function GrowButton(flavor, corner, offset, opts) {
	let [RNA, DNA] = mechanics.cost[flavor]
	let text = "Grow\n" + (DNA && RNA ? RNA + " RNA + " + DNA + " DNA" : DNA ? DNA + " DNA" : RNA + " RNA")
	let onclick = function () {
		if (state.cangrow(flavor)) {
			state.grow(flavor)
			audio.playsfx("yes")
		} else {
			audio.playsfx("no")
		}
	}
	opts = Object.create(opts || {})
	opts.color = settings.ocolors[flavor]
	return new Button(text, onclick, corner, offset, opts)
}
function SpeedControlButton(corner, offset, opts) {
	let onclick = function () {
		let index = (settings.xspeeds.indexOf(settings.xspeed) + 1) % settings.xspeeds.length
		settings.xspeed = settings.xspeeds[index]
		this.text = "" + settings.xspeed + "x"
	}
	opts = Object.create(opts || {})
	let button = new Button("" + settings.xspeed + "x", onclick, corner, offset, opts)
	return button
}

function HUD() {
	this.reset()
}
HUD.prototype = {
	reset: function () {
		this.bmessages = []
		this.buttons = []
		this.pointed = null
	},

	addbmessage: function (text, pos, options) {
		let bmessage = new Bmessage(text, pos, options)
		this.bmessages.push(bmessage)
		return bmessage
	},
	addbutton: function (button) {
		this.buttons.push(button)
	},
	addbuttons: function (buttons) {
		this.buttons.push.apply(this.buttons, buttons)
	},
	think: function (dt) {
		this.bmessages.forEach(obj => obj.think(dt))
		this.bmessages = this.bmessages.filter(obj => obj.alive)
		let bsize = 0.05 * view.sV
		this.buttons.forEach(button => button.setsize(bsize))
	},
	getpointed: function (pV) {
		for (var j = 0 ; j < this.buttons.length ; ++j) {
			if (this.buttons[j].within(pV)) return this.buttons[j]
		}
		return null
	},
	drawback: function () {
		gl.progs.text.use()
		this.bmessages.forEach(b => b.draw())
	},
	drawbuttons: function (buttons) {
		buttons = buttons || this.buttons
		let data = builddata(buttons, button => {
			const [r, g, b] = button.color
			return [button.pV[0], button.pV[1], button.rV, r, g, b, 0, 1]
		})
		if (data.length) {
			gl.progs.organelle.use()
			gl.progs.organelle.set({
				scenterG: [view.wV / 2, view.hV / 2],
				screensizeV: [view.wV, view.hV],
				VscaleG: 1,
			})
			gl.makeArrayBuffer(data).bind()
			gl.progs.organelle.assignAttribOffsets({
				pU: 0,
				centerG: 2,
				GradiusU: 4,
				color: 5,
				T: 8,
				alpha: 9,
			})
			gl.drawArrays(gl.TRIANGLES, 0, data.nvert)
		}
		gl.progs.text.use()
		buttons.forEach(button => button.drawtext())
	},
	draw: function () {
		this.drawbuttons()
	},
	drawcombos: function () {
		let combos = Object.keys(comboinfo), h = 0.02 * view.sV
		combos.sort((a, b) => a.length - b.length || a.localeCompare(b))
		gl.progs.text.use()
		combos.forEach((combo, j) => gl.progs.text.draw(comboinfo[combo], {
			fontname: "Architects Daughter",
			fontsize: h,
			width: 8 * h,
			left: view.wV - 8 * h,
			centery: ((combos.length - j) * 2.5 - 0.5) * h,
			color: "white",
			ocolor: "black",
			owidth: 6,
		}))
		let data = [], nvert = 0
		combos.forEach((combo, jcombo) => {
			let y = ((combos.length - jcombo) * 2.5 - 0.7) * h
			combo.split("").forEach((flavor, jflavor) => {
				let x = view.wV - (8.4 + 0.7 * (combo.length - jflavor)) * h
				let R = 0.6 * h
				let [r, g, b] = settings.ocolors[flavor]
				data = addpU(data, [x, y, 1.1 * R, 0, 0, 0, 0, 1])
				data = addpU(data, [x, y, R, r, g, b, 0, 1])
				nvert += 12
			})
		})
		if (data.length) {
			gl.progs.organelle.use()
			gl.progs.organelle.set({
				scenterG: [view.wV / 2, view.hV / 2],
				screensizeV: [view.wV, view.hV],
				VscaleG: 1,
			})
			gl.makeArrayBuffer(data).bind()
			gl.progs.organelle.assignAttribOffsets({
				pU: 0,
				centerG: 2,
				GradiusU: 4,
				color: 5,
				T: 8,
				alpha: 9,
			})
			gl.drawArrays(gl.TRIANGLES, 0, nvert)
		}


	},
}

