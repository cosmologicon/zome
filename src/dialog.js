
let DrawSpeakerWithLine = {
	draw: function () {
//		if (!this.played) return
		let x0, y0, r, tx, ty, w, f
		if (view.wV > 1.1 * view.hV) {  // 16:9
			x0 = 24
			y0 = 13
			r = 16
			tx = 40
			ty = 5
			w = 50
			f = 4
		} else if (view.wV > 0.9 * view.hV) {  // 1:1
			x0 = 18
			y0 = 16
			r = 19
			tx = 36
			ty = 5
			w = 60
			f = 5
		} else {  // 9:16
			x0 = 16
			y0 = 16
			r = 19
			tx = 32
			ty = 5
			w = 64
			f = 6
		}
		
		let h = view.wV * 0.01, angle = 0
		let right = this.who == "simon"
		if (right) {
			x0 = 100 - x0
			tx = 100 - tx - w
		}
		if (this.spec.bounce) {
			let freq = this.spec.bounce
			y0 += 4 * Math.abs(Math.sin(freq * tau * this.t)) - 2
		}
		if (this.spec.rock) {
			let freq = this.spec.rock
			angle = 0.17 * Math.sin(freq * tau * this.t)
		}
		if (this.spec.sink) {
			y0 -= 2 * Math.sqrt(this.t)
		}

		drawimg(this.who, [x0 * h, y0 * h], r * h, angle, 1)

		let fontname = this.who == "zome" ? "Sansita One" : "Patrick Hand"
		let color = this.who == "zome" ? "rgb(100,255,255)" : "rgb(255,100,255)"
		gl.progs.text.use()
		gl.progs.text.draw(this.text, {
			bottomleft: [tx * h, ty * h],
			width: w * h,
			fontsize: f * h,
			fontname: fontname,
			color: color,
			ocolor: "black",
			owidth: 4,
			lineheight: 1.2,
		})
	},
}

function TimedLine(who, text, opts) {
	opts = opts || {}
	this.who = who
	this.text = text
	this.t = 0
	this.alive = true
	this.lifetime = opts.lifetime || 0.5 + 0.08 * text.length
	this.spec = opts
}
TimedLine.prototype = UFX.Thing()
	.addcomp(DrawSpeakerWithLine)
	.addcomp({
		think: function (dt) {
			this.t += dt
			this.alive = this.t < this.lifetime
		},
	})

function DialogLine(lspec) {
	this.who = lspec.who
	this.text = lspec.text
	this.audiofile = lspec.filename
	this.spec = lspec
	this.t = 0
	this.alive = true
	this.played = false
	// Only used is audio is disabled.
	this.lifetime = lspec.lifetime || 0.5 + 0.08 * this.text.length
}
DialogLine.prototype = UFX.Thing()
	.addcomp(DrawSpeakerWithLine)
	.addcomp({
		think: function (dt) {
			if (dt && !this.played && audio.dialogready(this.audiofile)) {
				this.played = true
				audio.playdialog(this.audiofile)
			}
			this.t += dt
			if (this.played && this.complete()) this.alive = false
		},
		complete: function () {
			if (audio.context) return !audio.isplayingdialog()
			return this.t >= this.lifetime
		},
	})

let dialog = {
	reset: function () {
		this.queue = []
		this.tquiet = 0
	},
	play: function (dname) {
		let lines = UFX.resource.data.transcript[dname]
		lines.forEach((lspec) => {
			this.queue.push(new DialogLine(lspec))
		})
	},
	think: function (dt) {
		this.tquiet = this.quiet() ? this.tquiet + dt : 0
		if (!this.queue.length) return
		this.queue[0].think(dt)
		if (!this.queue[0].alive) this.queue.shift()
	},
	draw: function () {
		if (!this.queue.length) return
		this.queue[0].draw()
	},
	quiet: function () {
		return !this.queue.length
	},
}

dialog.reset()
UFX.resource.loadjson({ transcript: "data/transcript.json" })


