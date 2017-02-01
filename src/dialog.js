
function TimedLine(who, text) {
	this.who = who
	this.text = text
	this.t = 0
	this.alive = true
	this.lifetime = 0.5 + 0.08 * text.length
}
TimedLine.prototype = {
	think: function (dt) {
		this.t += dt
		this.alive = this.t < this.lifetime
	},
	draw: function () {
		let x0, y0, r, tx, ty, w, f
		if (view.wV > 1.1 * view.hV) {  // 16:9
			x0 = 24
			y0 = 13
			r = 20
			tx = 40
			ty = 5
			w = 50
			f = 4
		} else if (view.wV > 0.9 * view.hV) {  // 1:1
			x0 = 18
			y0 = 16
			r = 24
			tx = 36
			ty = 5
			w = 60
			f = 5
		} else {  // 9:16
			x0 = 16
			y0 = 16
			r = 24
			tx = 32
			ty = 5
			w = 64
			f = 6
		}
		
		let h = view.wV * 0.01
		drawimg(this.who, [x0 * h, y0 * h], r * h, 0, 1)
		gl.progs.text.use()
		gl.progs.text.draw(this.text, {
			bottomleft: [tx * h, ty * h],
			width: w * h,
			fontsize: f * h,
			fontname: "Sansita One",
			color: "rgb(100,255,255)",
			ocolor: "black",
			owidth: 4,
			lineheight: 1.2,
		})
	},
}

let dialog = {
	reset: function () {
		this.queue = []
	},
	think: function (dt) {
		if (!this.queue.length) return
		this.queue[0].think(dt)
		if (!this.queue[0].alive) this.queue.shift()
	},
	draw: function () {
		if (!this.queue.length) return
		this.queue[0].draw()
	},
}

dialog.reset()

