"use strict"

let audio = {
	sfxfiles: [""],
	// Should be called after view.init.
	init: function () {
		if (window.AudioContext) {
			this.context = new AudioContext()
		} else if (window.webkitAudioContext) {
			this.context = new webkitAudioContext()
		} else {
			this.fail()
			return
		}
		this.mastergain = this.context.createGain()
		this.sfxgain = this.context.createGain()
		this.musicgain = this.context.createGain()
		this.dialoggain = this.context.createGain()
		this.mastergain.connect(this.context.destination)
		this.sfxgain.connect(this.mastergain)
		this.musicgain.connect(this.mastergain)
		this.dialoggain.connect(this.mastergain)

		let sounds = {}
		this.sfxfiles.forEach(sfile => { sounds["abuffer" + sfile] = "data/sfx/" + sfile + ".ogg" })
		UFX.resource.loadaudiobuffer(this.context, sounds)
	},
	fail: function () {
		this.context = null
		UFX.scene.push("noaudio")
	},
	playsfx: function (sname) {
		if (!this.context) return
		if (!UFX.resource.data["abuffer" + sname]) {
			console.warn("Missing sound effect: " + sname)
			return
		}
		let source = this.context.createBufferSource()
		source.buffer = UFX.resource.data["abuffer" + sname]
		source.connect(this.sfxgain)
		source.start(0)
	},
}

UFX.scenes.noaudio = {
	start: function () {
		this.t = 0
		this.buttons = [
			new Button("Learn\nmore", (() => window.location.href = "noaudio"), "bottom", [-0.7, 0.2]),
			new Button("Play\nwithout\nsound", (() => UFX.scene.pop()), "bottom", [0.7, 0.2], { fontscale: 0.4 }),
		]
	},
	think: function (dt) {
		this.t += dt
		let bsize = 0.13 * view.sV
		this.buttons.forEach(button => button.setsize(bsize))
		let pstate = UFX.pointer(canvas)
		if (this.t < 1) return
		if (!pstate.pos) return
		let ppos = [pstate.pos[0] * view.pixelratio, view.hV - pstate.pos[1] * view.pixelratio]
		canvas.style.cursor = "default"
		this.buttons.forEach(b => {
			if (b.within(ppos)) {
				if (pstate.down) b.onclick()
				canvas.style.cursor = "pointer"
			}
		})
	},
	draw: function () {
		gl.clearColor(0.5, 0, 0.5, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.progs.text.use()
		let text = "It looks like your web browser does not support HTML5 audio. To play with sound, please try a different browser."
		gl.progs.text.draw(text, {
			centerx: view.wV / 2,
			centery: view.hV / 2 + 0.2 * view.sV,
			color: "white",
			gcolor: "#bbb",
			ocolor: "black",
			fontname: "Sansita One",
			fontsize: 0.055 * view.sV,
			width: 0.8 * view.wV,
			lineheight: 1.2,
		})
		hud.drawbuttons(this.buttons)
	},
}

