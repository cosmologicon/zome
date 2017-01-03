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
	

function Button(text, color, onclick, corner, offset) {
	this.text = text
	this.color = color
	this.onclick = onclick
	this.fontsize = 5
	this.rV = 10
	this.pV = [0, 0]
	this.corner = corner
	this.offset = offset
}
Button.prototype = {
	setsize: function (bsize) {
		this.rV = bsize
		this.fontsize = 0.5 * bsize
		if (this.corner == "topleft") {
			this.pV = [
				(1.1 + 2.1 * this.offset[0]) * bsize,
				view.hV - (1.1 + 2.1 * this.offset[1]) * bsize,
			]
		}
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

const hud = {
	bmessages: [],
	buttons: [],
	pointed: null,

	reset: function () {
		this.bmessages = []
		this.buttons = []
		this.pointed = null
	},

	addbmessage: function (text, pos, options) {
		this.bmessages.push(new Bmessage(text, pos, options))
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
	draw: function () {
		let data = builddata(this.buttons, button => {
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
		this.buttons.forEach(button => button.drawtext())
	},
}

