UFX.scenes.levelselect = {
	blobspots: [
		["1", [-1, -1], false],
		["credits", [1, 0], false],
	],
	stagenames: {
		1: "Stage\n1-1",
		"credits": "Credits",
	},
	start: function () {
		audio.playmusic("menu")
		this.t = 0
	},
	think: function (dt) {
		this.t += dt
		let pstate = UFX.pointer(canvas)
		let blobspecs = []
		let Rsmall = 0.05 * view.sV, Rlarge = 0.08 * view.sV
		let ax = view.wV * 0.2, ay = view.hV * 0.2
		this.blobspecs = this.blobspots.map((spec, jspec) => {
			let [name, [x, y], large] = spec
			return {
				name: name,
				pos: [x * ax, y * ay],
				R: 1.8 * (large ? Rlarge : Rsmall),
				Rpoint: large ? Rlarge : Rsmall,
				color: [0, 0.5, 0.5],
				t0: (jspec * phi) % 1,
			}
		}).filter(spec => progress.unlocked[spec.name])
		this.pointed = null
		if (pstate.pos) {
			let [px, py] = pstate.pos
			px *= view.pixelratio
			py *= view.pixelratio
			this.blobspecs.forEach((spec, j) => {
				let dx = px - view.wV / 2 - spec.pos[0]
				let dy = view.hV / 2 - py - spec.pos[1]
				if (dx * dx + dy * dy < spec.Rpoint * spec.Rpoint) {
					this.pointed = spec.name
				}
			})
		}
		canvas.style.cursor = this.pointed ? "pointer" : "default"
		if (this.t > 0.5 && this.pointed && pstate.click) {
			progress.selected = this.pointed
			if (this.pointed == "credits") {
				UFX.scene.push("credits")
			} else {
				UFX.scene.swap("play")
			}
		}
	},
	draw: function () {
		gl.disable(gl.DEPTH_TEST)
		gl.enable(gl.BLEND)
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, 0, 1)
		view.fill([0.5, 0.5, 0, 1])
		drawselectblobs(this.blobspecs)

		gl.progs.text.use()
		let h = view.sV * 0.025
		this.blobspecs.forEach(spec => {
			gl.progs.text.draw(this.stagenames[spec.name], {
				centerx: spec.pos[0] + view.wV / 2,
				centery: spec.pos[1] + view.hV / 2 + 0.2 * h,
				fontsize: h,
				fontname: "Sansita One",
				color: "white",
				shadow: [1, 1],
				scolor: "black",
			})
		})

		h = 0.01 * view.sV
		tracers.title.draw([view.wV - 18 * h, view.hV - 6 * h], 0.06 * h)
	},
}
