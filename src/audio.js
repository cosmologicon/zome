// Manage the Web audio context.
// To permanetly disable audio, call audio.disable(), or set settings.AUDIO to false before calling
// audio.init. This cannot be undone without reloading the page.

// audio.context is the context object itself. It will be null if audio is disabled (or undefined if
// audio.init has not yet been called).

// Music and sound effects are loaded with audio.init. For performance, no dialog is loaded by
// default. Use audio.loaddialog as necessary.

"use strict"

let audio = {
	// Set audio.sfxfiles to the names of the sfx files you want to load, before calling audio.init.
	// e.g. audio.sfxfiles = ["blobup1", "blobdown1"].
	// Names should appear in the data/sfx subdirectory with .ogg extensions.
	sfxfiles: [],
	// Set audio.musictracks to the names of the music tracks you want to load, before calling
	// audio.init. e.g. audio.musictracks = ["X", "boss"].
	// Names should appear in audio._mlist and audio._mloops below.
	musictracks: [],
	// Time to fade music in/out unless otherwise specified, in seconds.
	defaultfade: 0.5,
	// The actual list of filenames corresponding to a given music track. These should appear in the
	// data/music subdirectory with .ogg extensions.
	// For two-element values, the first one is the intro clip that plays once, and the second is
	// the main track loop that repeats.
	_mlist: {
		X: ["levelX-A", "levelX-B"],
		Y: ["levelY"],
		boss: ["boss-A", "boss-B"],
		menu: ["menu"],
		win: ["win"],
		lose: ["lose"],
	},
	// Whether the corresponding music track loops.
	_mloops: {
		X: true,
		Y: true,
		boss: true,
		menu: true,
		win: false,
		lose: false,
	},
	// Create the web audio context.
	// Set up the volume control gains.
	// Add the necessary resources to UFX.resaurce.
	// Push the noaudio scene on failure.
	// Should be called after view.init.
	init: function () {
		this.noticeshown = false
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

		// Volume levels set by user settings.
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
		this.musictracks.forEach(sfile => this._mlist[sfile].forEach(
			mfile => { sounds["mbuffer" + mfile] = "data/music/" + mfile + ".ogg" }))
		UFX.resource.onaudiobuffererror = () => { this.fail() }
		UFX.resource.loadaudiobuffer(this.context, sounds)
		
		// Currently playing music track and dialog line
		this.musicnode = null
		this.dialognode = null
	},
	// Permanently disable the audio. Cannot be undone without reloading the page. Safe to call
	// multiple times.
	disable: function () {
		settings.AUDIO = false
		if (this.context) {
			this.context.close()
		}
		this.context = null
	},
	// Call with the name of a dialog sequence, e.g. "C01". All of the correspoinding tracks will be
	// loaded.
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
	_loadeddialog: {},
	// Whether the given dialog track (e.g. "C0101") is loaded and ready to play. Also returns true
	// if audio is disabled.
	dialogready: function (dname) {
		return !settings.AUDIO || UFX.resource.data["dbuffer" + dname]
	},
	// Permanetly disable audio and push the noaudio scene.
	fail: function () {
		this.disable()
		if (!this.noticeshown) {
			UFX.scene.push("noaudio")
			this.noticeshown = true
		}
	},
	// Pause all audio tracks (e.g. for the pause screen).
	fullpause: function () {
		if (!this.context) return
		this.context.suspend()
	},
	// Resume all audio tracks.
	fullresume: function () {
		if (!this.context) return
		this.context.resume()
	},

	// Immediately play the given sound effect name, e.g. "blobup1". Sends a warning to the console
	// if the track is not ready.
	// A no-op if audio is disabled.
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
	// Play the given music track name, e.g. "X", from the beginning, stopping the current music
	// track as necessary. You can also set a crossfade time (dt) in seconds, which defaults to
	// audio.defaultfade.
	// A no-op if audio is disabled.
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
		let files = this._mlist[mname]
		if (files.length == 1) {
			let source = this.context.createBufferSource()
			source.buffer = UFX.resource.data["mbuffer" + files[0]]
			source.loop = this._mloops[mname]
			source.connect(node)
			source.start(this.context.currentTime + dt)
		} else if (files.length == 2) {
			let source0 = this.context.createBufferSource()
			source0.buffer = UFX.resource.data["mbuffer" + files[0]]
			source0.connect(node)
			source0.start(this.context.currentTime + dt)
			let source1 = this.context.createBufferSource()
			source1.buffer = UFX.resource.data["mbuffer" + files[1]]
			source1.loop = this._mloops[mname]
			source1.connect(node)
			source1.start(this.context.currentTime + dt + source0.buffer.duration)
		}
	},
	// Immediately stop the current music track.
	// A no-op if audio is disabled.
	stopmusic: function () {
		this.fadeoutmusic(0)
	},
	// Fade the current music track out, and don't replace it with anything. You can specify a
	// fadeout time (dt) in seconds, which defaults to audio.defaultfade.
	// A no-op if audio is disabled.
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
	// Play the given dialog track name, e.g. "C0101". Lowers the volume for music and sound effects
	// to its 
	// Stops the currently playing dialog track, if
	// any. Should not be called until audio.dialogready for the same track name returns true.
	// A no-op if audio is disabled.
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
	// Immediately stop the currently-playing dialog track, if any.
	// A no-op if audio is disabled.
	stopdialog: function () {
		if (!this.dialognode) return
		this.dialognode.disconnect()
		this.dialognode = null
		this.soundgain.gain.cancelScheduledValues(0)
		this.soundgain.gain.linearRampToValueAtTime(1, this.context.currentTime + this.defaultfade)
	},
	// Returns whether there is currently a dialog track playing.
	isplayingdialog: function () {
		return this.dialognode !== null
	},
}

// The noaudio scene.
// A simple screen that informs the user that audio is unavailable, recommends using a different
// browser, and gives two options: a link to read more about web audio, and the option to play
// without sound.
// Pushing this scene does not disable the audio. That should be done separately at the same time.
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

