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

// Requires a member anchor, which is a length-3 list of [fx, fy, scale].
const UsesAnchorPoint = {
	drawposV: function () {
		let layout = this.anchor[view.jaspect]
		let x0 = layout[0], y0 = layout[1]
		let [dx, dy] = this.offset
		let scaleV = this.drawscaleV()
		return [
			x0 * view.wV + 2.1 * dx * scaleV,
			y0 * view.hV + 2.1 * dy * scaleV,
		]
	},
	// Roughly, the radius.
	drawscaleV: function () {
		let ascale = this.anchor[view.jaspect][2] || 1
		return 0.05 * view.sV * ascale * this.scale
	},
}
let anchors = {
	topleft: [[0, 1], [0, 1], [0, 1]],
}



const RoundDrawable = {
	// x, y, R, r, g, b, T, alpha
	rounddrawspec: function () {
		let [xV, yV] = this.drawposV()
		let rV = this.drawscaleV()
		let [r, g, b] = this.color
		return [xV, yV, rV, r, g, b, 0, 1]
	},
	within: function (pV) {
		let [xV, yV] = this.drawposV(), rV = this.drawscaleV()
		let dxV = pV[0] - xV, dyV = pV[1] - yV
		return dxV * dxV + dyV * dyV < rV * rV
	},
}
	
const HUDDrawText = {
	drawtext: function () {
		let [xV, yV] = this.drawposV()
		let scaleV = this.drawscaleV()
		let fontsize = 0.4 * scaleV * this.fontscale
		let text = this.gettext ? this.gettext() : this.text
		gl.progs.text.draw(text, {
			center: [xV, yV + 0.2 * fontsize],
			fontsize: fontsize,
			fontname: "Sansita One",
			ocolor: "black",
		})
	},
}


function Button(text, onclick, anchor, offset, opts) {
	opts = opts || {}
	this.text = text
	this.onclick = onclick
	this.anchor = anchor
	this.offset = offset || [0, 0]
	this.color = opts.color || [0.4, 0.4, 0.4]
	this.scale = opts.scale || 1
	this.fontscale = opts.fontscale || 1
}
Button.prototype = UFX.Thing()
	.addcomp(UsesAnchorPoint)
	.addcomp(RoundDrawable)
	.addcomp(HUDDrawText)

function HUDLabel(text, anchor, offset, opts) {
	opts = opts || {}
	this.text = text
	this.onclick = onclick
	this.anchor = anchor
	this.offset = offset || [0, 0]
	this.scale = opts.scale || 1
	this.fontscale = opts.fontscale || 1
	this.gettext = opts.gettext
}
HUDLabel.prototype = UFX.Thing()
	.addcomp(UsesAnchorPoint)
	.addcomp(HUDDrawText)


function GrowButton(flavor, anchor, offset, opts) {
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
	return new Button(text, onclick, anchor, offset, opts)
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
		this.labels = []
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
	addlabels: function (labels) {
		this.labels.push.apply(this.labels, labels)
	},
	think: function (dt) {
		this.bmessages.forEach(obj => obj.think(dt))
		this.bmessages = this.bmessages.filter(obj => obj.alive)
	},
	getpointed: function (pV) {
		for (var j = 0 ; j < this.buttons.length ; ++j) {
			if (this.buttons[j].within(pV)) return this.buttons[j]
		}
		return null
	},
	setpointed: function (ppos) {
		if (!ppos) return this.pointed
		let pV = [ppos[0], view.hV - ppos[1]]
		this.pointed = this.getpointed(pV)
		return this.pointed
	},
	drawback: function () {
		gl.progs.text.use()
		this.bmessages.forEach(b => b.draw())
	},
	drawbuttons: function (buttons) {
		buttons = buttons || this.buttons
		let data = builddata(buttons, button => button.rounddrawspec())
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
		this.labels.forEach(label => label.drawtext())
	},
	drawcombos: function () {
		let combos = Object.keys(comboinfo).filter(combo => progress.learned[combo])
		let h = 0.02 * view.sV
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
		gl.progs.text.draw("Unlocked\nantibodies", {
			fontname: "Architects Daughter",
			fontsize: 1.2 * h,
			centerx: view.wV - 5 * h,
			centery: ((combos.length + 1) * 2.5 - 0.5) * h,
			color: "white",
			ocolor: "black",
			owidth: 6,
		})
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

