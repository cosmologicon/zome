"use strict"

let audio = {
	sfxfiles: [""],
	musictracks: [""],
	defaultfade: 0.5,
	// The actual files corresponding to a given music track
	mlist: {
		X: ["levelX-A", "levelX-B"],
		Y: ["levelY"],
		boss: ["boss-A", "boss-B"],
		menu: ["menu"],
		win: ["win"],
		lose: ["lose"],
	},
	mloops: {
		X: true,
		Y: true,
		boss: true,
		menu: true,
		win: false,
		lose: false,
	},
	// Should be called after view.init.
	init: function () {
		if (!settings.AUDIO) {
			this.disable()
			return
		}
		if (window.AudioContext) {
			this.context = new AudioContext()
		} else if (window.webkitAudioContext) {
			this.context = new webkitAudioContext()
		} else {
			this.fail()
			return
		}

		// Set by user settings.
		this.mastergain = this.context.createGain()
		this.sfxgain = this.context.createGain()
		this.musicgain = this.context.createGain()
		this.dialoggain = this.context.createGain()
		// Used to soften music and sound effects while dialog is playing.
		this.soundgain = this.context.createGain()

		this.mastergain.connect(this.context.destination)
		this.dialoggain.connect(this.mastergain)
		this.soundgain.connect(this.mastergain)
		this.sfxgain.connect(this.soundgain)
		this.musicgain.connect(this.soundgain)

		let sounds = {}
		this.sfxfiles.forEach(sfile => { sounds["abuffer" + sfile] = "data/sfx/" + sfile + ".ogg" })
		this.musictracks.forEach(sfile => this.mlist[sfile].forEach(
			mfile => { sounds["mbuffer" + mfile] = "data/music/" + mfile + ".ogg" }))
		UFX.resource.onaudiobuffererror = () => { this.fail() }
		UFX.resource.loadaudiobuffer(this.context, sounds)
		
		// Currently playing music track and dialog line
		this.musicnode = null
		this.dialognode = null
	},
	// Permanently disable the audio. Cannot be undone without reloading the page.
	disable: function () {
		settings.AUDIO = false
		if (this.context) {
			this.context.close()
		}
		this.context = null
	},
	loadeddialog: {},
	loaddialog: function (dname) {
		if (!settings.AUDIO) return
		let sounds = {}
		UFX.resource.data.transcript[dname].forEach((dinfo) => {
			let filename = dinfo.filename
			if (this.loadeddialog[filename]) return
			this.loadeddialog[filename] = true
			sounds["dbuffer" + filename] = "data/dialog/" + filename + ".ogg"
		})
		UFX.resource.loadaudiobuffer(this.context, sounds)
	},
	dialogready: function (dname) {
		return !settings.AUDIO || UFX.resource.data["dbuffer" + dname]
	},
	fail: function () {
		this.disable()
		UFX.scene.push("noaudio")
	},
	fullpause: function () {
		if (!this.context) return
		this.context.suspend()
	},
	fullresume: function () {
		if (!this.context) return
		this.context.resume()
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
	playmusic: function (mname, dt) {
		if (!this.context) return
		if (this.musicnode) {
			if (dt === undefined) dt = this.defaultfade
			this.fadeoutmusic(dt)
		} else {
			dt = 0
		}
		let node = this.musicnode = this.context.createGain()
		this.musicnode.connect(this.musicgain)
		let files = this.mlist[mname]
		if (files.length == 1) {
			let source = this.context.createBufferSource()
			source.buffer = UFX.resource.data["mbuffer" + files[0]]
			source.loop = this.mloops[mname]
			source.connect(node)
			source.start(this.context.currentTime + dt)
		} else if (files.length == 2) {
			let source0 = this.context.createBufferSource()
			source0.buffer = UFX.resource.data["mbuffer" + files[0]]
			source0.connect(node)
			source0.start(this.context.currentTime + dt)
			let source1 = this.context.createBufferSource()
			source1.buffer = UFX.resource.data["mbuffer" + files[1]]
			source1.loop = this.mloops[mname]
			source1.connect(node)
			source1.start(this.context.currentTime + dt + source0.buffer.duration)
		}
	},
	stopmusic: function () {
		this.fadeoutmusic(0)
	},
	fadeoutmusic: function (dt) {
		if (!this.context) return
		if (dt === undefined) dt = this.defaultfade
		if (this.musicnode) {
			this.musicnode.gain.linearRampToValueAtTime(0, this.context.currentTime + dt)
			let node = this.musicnode
			setTimeout(node.disconnect.bind(node), 1000 * (dt + 1))
			this.musicnode = null
		}
	},
	playdialog: function (fname) {
		if (!this.context) return
		if (this.isplayingdialog()) this.stopdialog()
		let node = this.dialognode = this.context.createGain()
		this.dialognode.connect(this.dialoggain)
		let source = this.context.createBufferSource()
		source.buffer = UFX.resource.data["dbuffer" + fname]
		source.connect(node)
		source.start(this.context.currentTime)
		source.addEventListener("ended", () => {
			if (node === this.dialognode) this.stopdialog()
		})
		this.soundgain.gain.cancelScheduledValues(0)
		this.soundgain.gain.linearRampToValueAtTime(0.4, this.context.currentTime + this.defaultfade)
	},
	stopdialog: function () {
		if (!this.dialognode) return
		this.dialognode.disconnect()
		this.dialognode = null
		this.soundgain.gain.cancelScheduledValues(0)
		this.soundgain.gain.linearRampToValueAtTime(1, this.context.currentTime + this.defaultfade)
	},
	isplayingdialog: function () {
		return this.dialognode !== null
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
		let text = "We were unable to enable HTML5 audio on your web browser. To play with sound, please try a different browser."
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

