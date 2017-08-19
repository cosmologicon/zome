UFX.scenes.demo = {
	start: function () {
		if (settings.DEBUG) {
			UFX.key.init()
			UFX.key.watchlist = "F1 F2 F3 F4 F5 F6 F7 F8 F9 F10".split(" ")
			settings.debugmenu = 1
		}
		audio.playmusic("X")
		snapshot.init()
		view.reset()
		control.reset()
		this.hud = new HUD()
		dialog.reset()
		state.reset()

		state.Rlevel = 100
		state.hp = this.hp0 = 10000000
		state.cell = new Cell({ x: 0, y: -50 })
		this.t = 0
		this.nexts = [
			["ant", 5, 3],
			["tick", 20, 1],
			["wavetick", 80, 30],
			["waveant", 70, 10],

			["katydid", 90, 15],
			["tick", 110, 1],
			["megaant", 110, 30],

			["wavetick", 210, 20],
			["wavetick", 200, 20],
			["waveant", 190, 20],
			["wavekatydid", 180, 6],

			["katydid", 240, 15],
			["megaant", 240, 30],

			["wavetick", 350, 20],
			["wavetick", 340, 20],
			["waveant", 320, 20],
			["wavekatydid", 300, 4],
			["wavemegaant", 300, 4],

			["katydid", 360, 25],
			["megaant", 350, 25],
			["megatick", 330, 25],

			["wavetick", 450, 30],
			["wavetick", 440, 30],
			["waveant", 430, 20],
			["wavemegaant", 420, 6],
			["wavemegatick", 410, 6],
			["wavekatydid", 400, 6],

			["final", 460]
		]
		this.nextgrow = 2
		this.jgrow = 0
		this.hud.addbuttons([
			new Button("Pause", (() => UFX.scene.push("pause")), "topleft", [0, 0]),
			new Button("Full\nscreen", (() => UFX.scene.push("gofull")), "topleft", [0, 1]),
//			new Button("Reset\ndemo", (() => UFX.scene.swap("demo")), "topleft", [0, 2]),
		])
		this.think(0, 0, 1)

	},


	think: function (dt, jframe, nframe) {
		this.t += dt
		adjust(state.colliders(), dt)
		if (jframe == 0) this.think0(dt * nframe)
	},
	think0: function (dt) {
		this.control()
		state.thinkers().forEach(obj => obj.think(dt))
		state.antibodies.forEach(obj => obj.constraintoworld())
		if (control.cursor) {
			control.cursor.think(dt)
			control.cursor.reset()
			control.cursor.constraintoworld()
		}
		state.think(dt)
		this.hud.think(dt)
		dialog.think(dt)
		snapshot.think(dt)
		quest.think(dt)
		audio.think(dt)
	},
	control: function () {
		if (settings.DEBUG) this.debugcontrol()
		var pstate = UFX.pointer(canvas)
		let ppos = pstate.pos && [pstate.pos[0] * view.pixelratio, pstate.pos[1] * view.pixelratio]
		control.pos = view.GconvertP(ppos)
		control.pointed = control.getpointed(state.pointables())
		if (ppos) {
			this.hud.pointed = this.hud.getpointed([ppos[0], view.hV - ppos[1]])
		}

		if (pstate.down && this.hud.pointed) {
			this.hud.pointed.onclick()
		} else if (pstate.rdown && control.pointed && !control.cursor) {
			control.pointed.onrdown()
		} else if (pstate.click && UFX.pointer.touch && control.pointed && !control.cursor) {
			control.pointed.onrdown()
		} else if (pstate.click && UFX.pointer.touch && !control.pointed && control.cursor) {
			let obj = control.cursor
			obj.drop()
			audio.playsfx("blobdown1")
			obj.onrdown()
			control.cursor = null
		} else if (pstate.down && control.pointed && !control.cursor) {
			if (control.pointed.draggable && control.pointed.candrag()) {
				control.pointed.drag()
				control.pointed = null
				if (control.cursor) audio.playsfx("blobup1")
			}
		} else if (pstate.down && !UFX.pointer.touch) {
			control.cursorpos = control.pos
		} else if (pstate.ddown) {
			control.cursorpos = control.pos
		}

		if (control.cursor) {
			if (pstate.hold) {
			} else if (pstate.isdown) {
				control.cursor.scootchto(control.pos[0], control.pos[1])
			} else {
			//if (pstate.up || pstate.cancel) {
				var target = control.pointed
				if (target && target.container) target = target.container
				audio.playsfx("blobdown1")
				control.cursor.drop(target)
				control.cursor = null
			}
		} else if (control.cursorpos) {
			if (pstate.move && !UFX.pointer.touch) {
				view.dragto(control.cursorpos, ppos)
			} else if (pstate.dmove) {
				view.dragto(control.cursorpos, ppos)
			} else if (!pstate.isdown && !pstate.disdown) {
				control.cursorpos = null
			}
		}

		if (pstate.wheel && pstate.wheel.dy) {
			view.zoomat(-pstate.wheel.dy / 1024, control.pos)
		}
		if (pstate.pinch) {
			view.zoomat(pstate.pinch.dlogsep, control.pos)
		}
	},
	debugcontrol: function () {
		let kstate = UFX.key.state()
		if (kstate.down.F1) {
			settings.debugmenu = (settings.debugmenu + 1) % 3
		}
		if (kstate.down.F2) state.instagrow("X")
		if (kstate.down.F3) state.instagrow("Y")
		if (kstate.down.F4) state.instagrow("Z")
		if (kstate.down.F8) {
			view.pixelratio /= Math.sqrt(2)
			if (view.pixelratio < 1/4) view.pixelratio = 1
		}
	},

	draw: function () {
		drawscene(this.hud)
		if (control.cursor) drawantibody(control.cursor)
		let h = 0.01 * view.sV

		profiler.start("drawhud")
		this.hud.draw()
		this.hud.drawcombos()
		tracers.title.draw([view.wV - 18 * h, view.hV - 6 * h], 0.06 * h)
		profiler.stop("drawhud")

		gl.progs.text.use()
		profiler.start("drawinfo")
		let text = []
		if (settings.DEBUG) {
			let m = Math.floor(this.t / 60), s = this.t % 60
			let demotime = m + "m" + ("0000" + s.toFixed(1)).slice(-4) + "s"
			text = ["F1: cycle debug menu"]
			if (settings.debugmenu == 1) {
				text = text.concat([
					"playback ID = " + snapshot.id,
					"control.pointed = " + control.pointed,
					"control.pos = [" + control.pos[0].toFixed(1) + "," + control.pos[1].toFixed(1) + "]",
					"canvas size = " + view.wV.toFixed(1) + "x" + view.hV.toFixed(1) +
						" (ratio = " + view.pixelratio.toPrecision(3) + ")",
					UFX.ticker.getrates(),
					"demo time: " + demotime,
				])
			} else if (settings.debugmenu == 2) {
				text = text.concat([
					"F2: insta-grow X",
					"F3: insta-grow Y",
					"F4: insta-grow Z",
					"F8: cycle pixel device ratio",
				])
			}
			gl.progs.text.draw(text.join("\n"), {
				fontname: "sans-serif",
				fontsize: 3 * h,
				lineheight: 1.2,
				topleft: [1 * h, view.hV - 1 * h],
				ocolor: "black",
				owidth: 3,
				color: "#AAF",
			})
		}
		text = []
		text = text.concat([
			"total damage taken: " + (this.hp0 - state.hp),
			"",
		])
		if (UFX.pointer.touch) {
			text = text.concat([
				"2-finger drag to pan",
				"pinch to zoom",
				"tap antibody to split",
			])
		} else {
			text = text.concat([
				"drag background to pan",
				"mouse wheel to zoom",
				"right-click antibody to split",
			])
		}
		gl.progs.text.draw(text.join("\n"), {
			fontname: "Architects Daughter",
			fontsize: 3 * h,
			lineheight: 1.2,
			bottomleft: [1 * h, 3 * h],
			ocolor: "black",
			owidth: 3,
			color: "white",
		})
		profiler.stop("drawinfo")

		quest.draw()
		profiler.start("drawdialog")
		dialog.draw()
		profiler.stop("drawdialog")
	
	},
}
UFX.scenes.pause = {
	start: function () {
		this.t = 0
		this.lastdims = null
		this.alpha = 0
		audio.fullpause()
	},
	stop: function () {
		audio.fullresume()
	},
	think: function (dt) {
		UFX.scenes.demo.hud.think(0)
		var pstate = UFX.pointer(canvas)
		this.t += dt
		this.alpha = clamp(3 * this.t, 0, 1)
		if (this.t > 0.5 && pstate.up) UFX.scene.pop()
	},
	draw: function () {
		let dims = [view.wV, view.hV, this.alpha]
		if ("" + dims == this.lastdims) return
		this.lastdims = dims
		UFX.scenes.demo.draw()
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

