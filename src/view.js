"use strict"

var canvas = null
var gl = null
let pUbuffer = null

var view = {
	xcenterG: 0,
	ycenterG: 0,
	// zoom = 1 is defined such that the lesser dimension of the window is 200 game units.
	Z: 0,
	zoom: 1,
	// Canvas size
	wV: 854,
	hV: 480,

	// pixels per game unit.
	VscaleG: 480 / 200,

	// Global setup of the context. To be called at the beginning of the game.
	init: function () {
		canvas = document.getElementById("canvas")
		// Fullscreen polyfill
		canvas.requestFullscreen = canvas.requestFullscreen
			|| canvas.mozRequestFullScreen
			|| canvas.webkitRequestFullScreen
		window.addEventListener("mozfullscreenchange", UFX.maximize.onfullscreenchange)
		window.addEventListener("webkitfullscreenchange", UFX.maximize.onfullscreenchange)
		UFX.maximize.getfullscreenelement = () => document.fullscreenElement
			|| document.mozFullscreenElement
			|| document.webkitFullscreenElement
		// WebGL context
		gl = UFX.gl(canvas)
		UFX.gltext.init(gl)
		UFX.maximize.onadjust = (canvas, w, h) => {
			this.wV = w
			this.hV = h
			gl.viewport(0, 0, w, h)
			this.setVscaleG()
		}
		canvas.style.background = "#222"
		UFX.maximize(canvas, { aspects: [16/9, 1, 9/16], fillcolor: "#222" })
		pUbuffer = gl.makeArrayBuffer([-1, -1, 1, -1, 1, 1, -1, 1])
		for (let name in shaders) {
			gl.addProgram(name, shaders[name].vert, shaders[name].frag)
		}
		this.xcenterG = 0
		this.ycenterG = 0
		this.Z = 0
		this.zoom = 1
		this.setVscaleG()
		setTimeout((() => window.scrollTo(0, 1)), 1)
	},

	clear: function () {
		gl.clearColor(0, 0.4, 0.4, 1)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
	},

	setVscaleG: function () {
		var s = Math.sqrt(this.wV * this.hV)
		this.VscaleG = this.zoom * s / 250
	},

	VconvertG: function (pG) {
		return [
			this.wV / 2 + this.VscaleG * (pG[0] - this.xcenterG),
			this.hV / 2 - this.VscaleG * (pG[1] - this.ycenterG),
		]
	},

	GconvertV: function (pV) {
		return [
			this.xcenterG + (pV[0] - this.wV / 2) / this.VscaleG,
			this.ycenterG - (pV[1] - this.hV / 2) / this.VscaleG,
		]
	},

	constrain: function () {
		var d = Math.sqrt(this.xcenterG * this.xcenterG + this.ycenterG * this.ycenterG)
		if (d > state.Rlevel) {
			this.xcenterG *= state.Rlevel / d
			this.ycenterG *= state.Rlevel / d
		}
	},

	// Adjust the zoom by an amount dz such that the given game position remains at the same
	// screen position.
	zoomat: function (dz, posG) {
		var posV = posG ? this.VconvertG(posG) : null
		this.Z = clamp(this.Z + dz, -1.5, 1.5)
		this.zoom = Math.exp(this.Z)
		this.setVscaleG()
		if (posG) this.dragto(posG, posV)
		this.constrain()
	},

	// Move the camera such that the given game position is at the given screen position.
	dragto: function (posG, posV) {
		this.xcenterG = posG[0] - (posV[0] - this.wV / 2) / this.VscaleG
		this.ycenterG = posG[1] + (posV[1] - this.hV / 2) / this.VscaleG
		this.constrain()
	},


	// The next click or tap will result in fullscreen being requested.
	readyfullscreen: function () {
		canvas.addEventListener("mousedown", view.reqfs)
		canvas.addEventListener("touchstart", view.reqfs)
	},
	unreadyfullscreen: function () {
		canvas.removeEventListener("mousedown", view.reqfs)
		canvas.removeEventListener("touchstart", view.reqfs)
	},
	reqfs: function () {
		view.unreadyfullscreen()
		UFX.maximize.setoptions({ fullscreen: true })
	},

}


