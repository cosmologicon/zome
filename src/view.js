// G: game coodinates
// V: viewport coordinates - [0, 0] in bottom left, [wV, hV] in top right
// P: pointer coordinates - [0, 0] in *top* left, [wV, hV] in *bottom* right

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
	// (Approximate) geometric mean of wV and hV
	sV: 640,

	// pixels per game unit.
	VscaleG: 480 / 200,

	// Global setup of the context. To be called at the beginning of the game.
	init: function () {
		this.pixelratio = window.devicePixelRatio || 1
		canvas = document.getElementById("canvas")
		// Fullscreen polyfill
		canvas.requestFullscreen = canvas.requestFullscreen
			|| canvas.mozRequestFullScreen
			|| canvas.webkitRequestFullScreen
		document.exitFullscreen = document.exitFullscreen
			|| document.webkitExitFullscreen
			|| document.mozCancelFullScreen
			|| document.msExitFullscreen
		window.addEventListener("mozfullscreenchange", UFX.maximize.onfullscreenchange)
		window.addEventListener("webkitfullscreenchange", UFX.maximize.onfullscreenchange)
		UFX.maximize.getfullscreenelement = (() => document.fullscreenElement
			|| document.mozFullScreenElement
			|| document.webkitFullscreenElement
			|| document.msFullscreenElement)
		// WebGL context
		try {
			gl = UFX.gl(canvas)
			if (!gl) {
				this.failgl()
				return
			}
		} catch (error) {
			this.failgl()
			return
		}
		UFX.gltext.init(gl)
		UFX.maximize.onadjust = (canvas, w, h) => {
			this.wV = canvas.width = w * this.pixelratio
			this.hV = canvas.height = h * this.pixelratio
			canvas.style.width = w + "px"
			canvas.style.height = h + "px"
			this.sV = Math.sqrt(this.wV * this.hV)
			gl.viewport(0, 0, this.wV, this.hV)
			this.setVscaleG()
		}
		canvas.style.background = "#222"
		UFX.maximize(canvas, { aspects: [16/9, 1, 9/16], fillcolor: "#222" })
		pUbuffer = gl.makeArrayBuffer([-1, -1, 1, -1, 1, 1, -1, 1])
		for (let name in shaders) {
			gl.addProgram(name, shaders[name].vert, shaders[name].frag)
		}
		setTimeout((() => window.scrollTo(0, 1)), 1)
		this.reset()
	},
	
	failgl: function () {
		document.body.innerHTML = `
			<h1>WebGL error</h1>
			<p>WebGL is required to run this game.
			See <a href="https://get.webgl.org/">get.webgl.org</a> for more information.
		`
	},

	reset: function () {
		this.xcenterG = 0
		this.ycenterG = 0
		this.Z = 0
		this.zoom = 1
		this.setVscaleG()
	},

	clear: function () {
		gl.clearColor(0, 0.4, 0.4, 1)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
	},

	// RGBA color or RGB color
	fill: function (color) {
		if (color.length == 3 || color[3] == 1) {
			gl.clearColor(color[0], color[1], color[2], 1)
			gl.clear(gl.COLOR_BUFFER_BIT)
		} else {
			gl.progs.fill.use()
			gl.progs.fill.set.color(color)
			pUbuffer.bind()
			gl.progs.fill.assignAttribOffsets({ pU: 0 })
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
		}
	},

	setVscaleG: function () {
		var s = Math.sqrt(this.wV * this.hV)
		this.VscaleG = this.zoom * s / 250
	},

	VconvertG: function (pG) {
		return [
			this.wV / 2 + this.VscaleG * (pG[0] - this.xcenterG),
			this.hV / 2 + this.VscaleG * (pG[1] - this.ycenterG),
		]
	},

	GconvertV: function (pV) {
		return [
			this.xcenterG + (pV[0] - this.wV / 2) / this.VscaleG,
			this.ycenterG + (pV[1] - this.hV / 2) / this.VscaleG,
		]
	},

	PconvertG: function (pG) {
		return [
			this.wV / 2 + this.VscaleG * (pG[0] - this.xcenterG),
			this.hV / 2 - this.VscaleG * (pG[1] - this.ycenterG),
		]
	},

	// As a special case, maps null to [0, 0]
	GconvertP: function (pP) {
		return pP ? [
			this.xcenterG + (pP[0] - this.wV / 2) / this.VscaleG,
			this.ycenterG - (pP[1] - this.hV / 2) / this.VscaleG,
		] : [0, 0]
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
		var posP = posG ? this.PconvertG(posG) : null
		this.Z = clamp(this.Z + dz, -1.5, 1.5)
		this.zoom = Math.exp(this.Z)
		this.setVscaleG()
		if (posG) this.dragto(posG, posP)
		this.constrain()
	},

	// Move the camera such that the given game position is at the given pointer position.
	dragto: function (posG, posP) {
		posP = posP || [0, 0]
		this.xcenterG = posG[0] - (posP[0] - this.wV / 2) / this.VscaleG
		this.ycenterG = posG[1] + (posP[1] - this.hV / 2) / this.VscaleG
		this.constrain()
	},


	// The next click or tap will result in fullscreen being requested.
	readyfullscreen: function () {
		canvas.addEventListener("mouseup", view.reqfs, { passive: false })
		canvas.addEventListener("touchend", view.reqfs, { passive: false })
	},
	unreadyfullscreen: function () {
		canvas.removeEventListener("mouseup", view.reqfs)
		canvas.removeEventListener("touchend", view.reqfs)
		if (UFX.scene.top() === UFX.scenes.gofull) UFX.scene.pop()
	},
	reqfs: function (event) {
		view.unreadyfullscreen()
		UFX.maximize.setoptions({ fullscreen: true })
	},
}

// UFX.scene.push("gofull") will pause and give the player 3 seconds to confirm going fullscreen.
UFX.scenes.gofull = {
	start: function () {
		if (UFX.maximize.getfullscreenelement() === canvas) {
			UFX.maximize.setoptions({ fullscreen: false })
			document.exitFullscreen()
			UFX.scene.pop()
			return
		}
		view.readyfullscreen()
		this.t = 0
		this.paused = false
	},
	stop: function () {
		audio.fullresume()
	},
	think: function (dt) {
		this.t += dt
		if (!this.paused && this.t > 0.4) {
			this.paused = true
			audio.fullpause()
		}
		if (this.t > 3) view.unreadyfullscreen()
	},
	draw: function () {
		if (!this.paused) return
		gl.clearColor(0.5, 0, 0.5, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.progs.text.use()
		let text = (UFX.pointer.touch ? "Tap" : "Click") + "\nto enter\nfullscreen\nmode"
		gl.progs.text.draw(text, {
			centerx: view.wV / 2,
			centery: view.hV / 2,
			color: "white",
			ocolor: "black",
			fontname: "Sansita One",
			fontsize: 0.1 * view.sV,
		})
	},
}

