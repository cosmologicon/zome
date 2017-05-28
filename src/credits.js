UFX.scenes.credits = {
	lines: [
		[60, "yellow", "The Laboratory of"],
		[120, "yellow", "Dr. Zome"],
		null,
		[60, "#7F7FFF", "Universe Factory Games"],
		null,
		[40, "yellow", "Christopher Night"],
		[40, "white", "Team lead"],
		[40, "white", "Programming"],
		[40, "white", "Design"],
		[40, "white", "Writing"],
		null,
		[40, "yellow", "Charles McPillan"],
		[40, "white", "Design"],
		[40, "white", "Production"],
		[40, "white", "Story Lead"],
		null,
		[40, "yellow", "Mary Bichner"],
		[40, "white", "Music"],
		null,
		[40, "yellow", "Randy Parcel"],
		[40, "white", "Voice"],
		null,
		[40, "yellow", "Pat Bordenave"],
		[40, "white", "Voice"],
		null,
		[40, "yellow", "Samantha Thompson"],
		[40, "white", "Character Art"],
		null,
		[40, "yellow", "Jordan Thomas Gray"],
		[40, "white", "Sound Effects"],
		null,
		[60, "#7F7FFF", "Thank you for playing!"],
	],
	start: function () {
		this.t = 0
		//audio.playmusic("menu")
		this.fading = true
		this.fade = 0
	},
	think: function (dt) {
		this.t += dt
		this.fade = clamp(this.fade + 3 * dt * (this.fading ? 1 : -1), 0, 1) 
		let pstate = UFX.pointer(canvas)
		if (this.t > 0.5 && pstate.down) {
			this.fading = false
		}
		if (!this.fading && this.fade == 0) {
			UFX.scene.pop()
		}
	},
	draw: function () {
		UFX.scenes.levelselect.draw()
		view.fill([0.3, 0.3, 0.3, this.fade])
		let h = 0.001 * view.wV
		let y = -50 + 200 * Math.sqrt(view.hV / view.wV) * this.t
		let zbounce = 8 * Math.abs(Math.sin(2 * tau * this.t)) - 4
		drawimg("zome", [view.wV / 2 - 260 * h, (y - 1160 - zbounce) * h], 120 * h, 0, this.fade)
		drawimg("simon", [view.wV / 2 + 260 * h, (y - 1320) * h], 120 * h, 0.25 * Math.sin(2 * tau * this.t), this.fade)
		gl.progs.text.use()
		this.lines.forEach(line => {
			if (line === null) {
				y -= 60
				return
			}
			let [lineheight, color, text] = line
			if (y >= 0) {
				gl.progs.text.draw(text, {
					centerx: view.wV / 2,
					top: h * y,
					fontsize: h * lineheight,
					fontname: "Sansita One",
					color: color,
					shadow: [1, 1],
					scolor: "black",
					alpha: this.fade,
				})
			}
			y -= lineheight * 1.2
		})
		if (y * h > view.hV) this.fading = false
	},
}
