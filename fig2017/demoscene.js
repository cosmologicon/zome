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
		quest.init([DemoTutorial1, DemoTutorial2, DemoTutorial3, DemoTutorial4, DemoTutorial5, DemoTutorialEnd])
		resetprogress()

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
			new Button("Options", (() => UFX.scene.push("options")), anchors.topleft, [0.5, -0.5]),
			new Button("Full\nscreen", (() => UFX.scene.push("gofull")), anchors.topleft, [0.5, -1.5]),
			new Button("Reset\ndemo", (() => UFX.scene.push("reset")), anchors.topleft, [0.5, -2.5]),
		])
		this.think(0, 0, 1)

		this.tfinal = 0
	},


	think: function (dt, jframe, nframe) {
		let dt0 = dt
		dt *= quest.slowfactor()
		this.t += dt
		adjust(state.colliders(), dt)
		if (jframe == 0) this.think0(dt * nframe)
		snapshot.think(dt0)
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
		quest.think(dt)
		audio.think(dt)
		if (DemoTutorialEnd.done) this.tfinal += dt
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
		if (kstate.down.F9) {
			if (!DemoTutorial1.done) DemoTutorial1.done = true
			else if (!DemoTutorial2.done) DemoTutorial2.done = true
			else if (!DemoTutorial3.done) DemoTutorial3.done = true
			else if (!DemoTutorial4.done) DemoTutorial4.done = true
			else if (!DemoTutorial5.done) DemoTutorial5.done = true
			dialog.reset()
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
					"F9: advance tutorial stage",
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

		if (this.tfinal) {
			view.fill([0, 0, 0, 0.6])
		}

		quest.draw()
		profiler.start("drawdialog")
		dialog.draw()
		profiler.stop("drawdialog")

		if (this.tfinal) {
			let text = [
				"Demo complete",
				"Your score: " + (this.hp0 - state.hp) + " damage",
				"Full version coming soon!",
				"More than double the number of antibodies!",
				"9 level story mode!",
				"Endless mode!",
				"Voiceover audio!",
			].join("\n")
			gl.progs.text.use()
			gl.progs.text.draw(text, {
				centerx: view.wV / 2,
				centery: view.hV * 0.65,
				width: view.wV * 0.85,
				fontname: "Sansita One",
				fontsize: 5 * h,
				lineheight: 1.2,
				ocolor: "black",
				color: "#AAF",
				gcolor: "#66A",
				owidth: 3,
			})
			tracers.title.draw([view.wV - 18 * h, view.hV - 6 * h], 0.06 * h)
		}

	
	},
}
UFX.scenes.options = UFX.Thing()
	.addcomp(CurtainOverPlayScene, "demo")
	.addcomp(MenuText, "Options")
	.addcomp(PausesAudio)
	.addcomp(MenuHUD)
	.addcomp({
		start: function () {
			let anchor = [[0.5, 0.15, 1.4], [0.5, 0.15, 1.8], [0.5, 0.15, 2]]
			this.hud.addbuttons([
				new Button("Resume\nGame", (() => UFX.scene.pop()), anchor, [-1, 0]),
				new Button("Reset\nDemo", (() => UFX.scene.swap("reset")), anchor, [0, 0]),
				new Button("Full\nscreen", (() => UFX.scene.push("gofull")), anchor, [1, 0]),
			])
			let anchor0 = [[0.3, 0.45, 0.7], [0.5, 0.55, 0.8], [0.5, 0.6, 0.9]]
			let anchor1 = [[0.7, 0.45, 0.7], [0.5, 0.35, 0.8], [0.5, 0.4, 0.9]]
			this.hud.addbuttons([
				new Button("-", (() => audio.adjustgain("sfx", -1)), anchor0, [-2, 0], {fontscale: 6}),
				new Button("+", (() => audio.adjustgain("sfx", 1)), anchor0, [2, 0], {fontscale: 6}),
				new Button("-", (() => audio.adjustgain("music", -1)), anchor1, [-2, 0], {fontscale: 6}),
				new Button("+", (() => audio.adjustgain("music", 1)), anchor1, [2, 0], {fontscale: 6}),
			])
			this.hud.addlabels([
				new HUDLabel("sfx", anchor0, [0, 0], {fontscale: 4, gettext:
					() => "sfx\n" + (audio.gainlevels.sfx / settings.gainlevels * 100).toFixed(0) + "%"
				}),
				new HUDLabel("music", anchor1, [0, 0], {fontscale: 4, gettext:
					() => "music\n" + (audio.gainlevels.music / settings.gainlevels * 100).toFixed(0) + "%"
				}),
			])
		},
	})
UFX.scenes.reset = UFX.Thing()
	.addcomp(CurtainOverPlayScene, "demo")
	.addcomp(MenuText, "Reset the demo?")
	.addcomp(PausesAudio)
	.addcomp(MenuHUD)
	.addcomp({
		start: function () {
			let anchor = [[0.5, 0.25, 2], [0.5, 0.25, 2], [0.5, 0.25, 2]]
			this.hud.addbuttons([
				new Button("Reset", (() => { UFX.scene.pop() ; UFX.scene.swap("demo") }), anchor, [-0.6, 0]),
				new Button("Resume\nGame", (() => UFX.scene.pop()), anchor, [0.6, 0]),
			])
		},
	})

