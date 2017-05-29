UFX.scenes.pause = {
	start: function () {
		this.t = 0
		this.alpha = 0
		audio.fullpause()
	},
	stop: function () {
		audio.fullresume()
	},
	think: function (dt) {
		hud.think(0)
		var pstate = UFX.pointer(canvas)
		this.t += dt
		this.alpha = clamp(3 * this.t, 0, 1)
		if (this.t > 0.5 && pstate.up) UFX.scene.pop()
	},
	draw: function () {
		UFX.scene.top(1).draw()
		view.fill([0.2, 0.2, 0.2, 0.85])
		gl.progs.text.use()
		gl.progs.text.draw("Paused", {
			centerx: view.wV / 2,
			centery: view.hV * 0.6,
			color: "yellow",
			gcolor: "orange",
			ocolor: "black",
			owidth: 3,
			fontname: "Sansita One",
			fontsize: 0.16 * view.sV,
			alpha: this.alpha,
		})
	},
}
