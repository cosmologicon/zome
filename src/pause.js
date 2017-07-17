let PausesAudio = {
	start: function () {
		audio.fullpause()
	},
	stop: function () {
		audio.fullresume()
	},
}

let MenuText = {
	init: function (text) {
		this.text = text
	},
	start: function () {
		this.t = 0
		this.alpha = 0
	},
	think: function (dt) {
		this.t += dt
		this.alpha = clamp(3 * this.t, 0, 1)
	},
	draw: function () {
		gl.progs.text.use()
		gl.progs.text.draw(this.text, {
			centerx: view.wV / 2,
			centery: view.hV * 0.8,
			width: view.wV * 0.9,
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

let CurtainOverPlayScene = {
	think: function (dt) {
		UFX.scenes.play.hud.think(0)
	},
	draw: function () {
		UFX.scenes.play.draw()
		view.fill([0.2, 0.2, 0.2, 0.85])
	},
}

let MenuHUD = {
	start: function () {
		this.hud = new HUD()
	},
	think: function (dt) {
		this.hud.think(dt)
		let pstate = UFX.pointer(canvas)
		let ppos = view.scaleppos(pstate.pos)
		this.hud.setpointed(ppos)
		if (pstate.down && this.hud.pointed) {
			this.hud.pointed.onclick()
		}
	},
	draw: function () {
		this.hud.draw()
	},
}

UFX.scenes.pause = UFX.Thing()
	.addcomp(CurtainOverPlayScene)
	.addcomp(MenuText, "Paused")
	.addcomp(PausesAudio)
	.addcomp(MenuHUD)
	.addcomp({
		start: function () {
			this.hud.addbuttons([
				new Button("Resume\nGame", (() => UFX.scene.pop()), "lower", [-1, 0]),
				new Button("Quit\nLevel", (() => UFX.scene.push("confirmquit")), "lower", [0, 0]),
				new Button("Full\nscreen", (() => UFX.scene.push("gofull")), "lower", [1, 0]),
			])
		},
	})

UFX.scenes.confirmquit = UFX.Thing()
	.addcomp(CurtainOverPlayScene)
	.addcomp(MenuText, "Really quit?")
	.addcomp(MenuHUD)
	.addcomp({
		start: function () {
			this.hud.addbuttons([
				new Button("Yes", (() => { UFX.scene.pop(3) ; UFX.scene.push("levelselect") }), "lower", [-1, 0]),
				new Button("No", (() => UFX.scene.pop()), "lower", [1, 0]),
			])
		},
	})



