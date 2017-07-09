// Cutscene

function Cutscene(message, opts) {
	this.message = message
	opts = opts || {}
	this.lifetime = "lifetime" in opts ? opts.lifetime : 2
	this.tfadein = "tfadein" in opts ? opts.tfadein : 0.5
	this.tfadeout = "tfadeout" in opts ? opts.tfadeout : 0.5
	this.darkin = "darkin" in opts ? opts.darkin : false
	this.darkout = "darkout" in opts ? opts.darkout : false
	this.color = opts.color || "yellow"
	this.gcolor = opts.gcolor || "orange"
	this.darkcolor = opts.darkcolor || [0, 0, 0]
	this.curtaincolor = opts.curtaincolor || [0.2, 0.2, 0.2]
	this.curtainmax = "curtainmax" in opts ? opts.curtainmax : 0.7
	this.music = opts.music || null
}
Cutscene.prototype = {
	start: function () {
		this.t = 0
		this.alpha = this.tfadein ? 0 : 1
		this.done = false
		this.completed = false
		if (this.music) audio.playmusic(this.music)
	},
	think: function (dt) {
		this.t += dt
		if (this.t >= this.lifetime) this.done = true
		if (this.done) {
			let dalpha = this.tfadeout ? dt / this.tfadeout : 1
			this.alpha = clamp(this.alpha - dalpha, 0, 1)
			if (this.alpha <= 0) this.complete()
		} else {
			let dalpha = this.tfadein ? dt / this.tfadein : 1
			this.alpha = clamp(this.alpha + dalpha, 0, 1)
		}
	},
	complete: function () {
		if (this.completed) return
		this.completed = true
		UFX.scene.pop()
		UFX.scene.swap("levelselect")
	},
	draw: function () {
		UFX.scenes.play.draw()
		let dark = this.done ? this.darkout : this.darkin
		let curtainalpha = this.curtainmax * this.alpha
		view.fill(this.curtaincolor.slice(0, 3).concat([curtainalpha]))
		let textalpha = dark ? 1 : this.alpha
		gl.progs.text.use()
		gl.progs.text.draw(this.message, {
			centerx: view.wV / 2,
			centery: view.hV * 0.6,
			color: this.color,
			gcolor: this.gcolor,
			ocolor: "black",
			owidth: 3,
			fontname: "Passion One",
			fontsize: 0.16 * view.sV,
			alpha: textalpha,
		})
		if (dark && this.alpha < 1) {
			view.fill(this.darkcolor.slice(0, 3).concat([1 - this.alpha]))
		}
	},
}

UFX.scenes.win = new Cutscene("Level complete", { darkout: true, music: "win" })
UFX.scenes.lose = new Cutscene("Level failed", { darkout: true, music: "lose" })


