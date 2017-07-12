// The main gameplay scene.
// Push onto the scene stack to start a level.

"use strict"

UFX.scenes.play = {
	start: function () {
		this.level = progress.chosen
		let spec = levelspec[this.level]
		view.reset()
		control.reset()
		hud.reset()
		dialog.reset()
		audio.playmusic(spec.music)
		if (spec.dialog) {
			audio.loaddialog(spec.dialog)
			dialog.play(spec.dialog)
		}

		state.load(this.level)

		this.t = 0
		hud.buttons.push(
			new Button("Pause", (() => UFX.scene.push("pause")), "topright", [0, 1]),
			new Button("Full\nscreen", (() => UFX.scene.push("gofull")), "topright", [0, 2])
		)
		;"XYZ".split("").forEach((flavor, jflavor) => {
			if (state.flavorunlocked(flavor)) {
				hud.buttons.push(GrowButton(flavor, "topleft", [0, jflavor]))
			}
		})
		this.think(0, 0, 1)
	},


	think: function (dt, jframe, nframe) {
		this.t += dt
		if (jframe == 0) this.think0(dt * nframe)
		adjust(state.colliders(), dt)
	},
	think0: function (dt) {
		this.control()
		// TODO: check how bad this gets when nframe gets large.
		// Also profile to see how much of a difference it makes.
		state.thinkers().forEach(obj => obj.think(dt))
		state.antibodies.forEach(obj => obj.constraintoworld())
		if (control.cursor) {
			control.cursor.think(dt)
			control.cursor.reset()
			control.cursor.constraintoworld()
		}
		state.think(dt)
		hud.think(dt)
		dialog.think(dt)
		quest.think(dt)
		this.checkcomplete()
	},
	control: function () {
		if (settings.DEBUG) this.debugcontrol()
		let pstate = UFX.pointer(canvas)
		let ppos = pstate.pos && [pstate.pos[0] * view.pixelratio, pstate.pos[1] * view.pixelratio]
		control.pos = view.GconvertP(ppos)
		control.pointed = control.getpointed(state.pointables())
		if (ppos) {
			hud.pointed = hud.getpointed([ppos[0], view.hV - ppos[1]])
		}

		if (pstate.down && hud.pointed) {
			hud.pointed.onclick()
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
		control.hoverall(state.resources)

		if (control.cursor) {
			if (pstate.hold) {
			} else if (pstate.isdown) {
				control.cursor.scootchto(control.pos[0], control.pos[1])
			} else {
			//if (pstate.up || pstate.cancel) {
				let target = control.pointed
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
	},
	checkcomplete: function () {
		if (state.twon > 2 && !state.lost) {
//			progress.complete(progress.chosen)
//			if progress.chosen == 9:
//				scene.pop()
//				scene.push(cutscene.Final())
//				scene.push(cutscene.FinalWin())
			UFX.scene.push("win")
		} else if (state.tlost > 2) {
			UFX.scene.push("lose")
		} 
	},

	draw: function () {
		drawscene()
		if (control.cursor) drawantibody(control.cursor)

		profiler.start("drawhud")
		hud.drawbuttons()
		gl.progs.text.use()
		let h = 0.01 * Math.sqrt(view.hV * view.wV)
		gl.progs.text.draw("The Laboratory of", {
			fontsize: 3 * h,
			fontname: "Sansita One",
			topright: [view.wV - 1 * h, view.hV - 0 * h],
			ocolor: "black",
			color: "yellow",
			owidth: 1,
		})
		gl.progs.text.draw("Dr. Zome", {
			fontsize: 6 * h,
			fontname: "Sansita One",
			topright: [view.wV - 1 * h, view.hV - 2 * h],
			ocolor: "black",
			color: "yellow",
			owidth: 1,
		})
		profiler.stop("drawhud")

		profiler.start("drawinfo")
		let text = []
		if (settings.DEBUG) {
			let m = Math.floor(this.t / 60), s = this.t % 60
			let demotime = m + "m" + ("0000" + s.toFixed(1)).slice(-4) + "s"
			text = text.concat([
				"control.pointed = " + control.pointed,
				"control.pos = [" + control.pos[0].toFixed(1) + "," + control.pos[1].toFixed(1) + "]",
				"canvas size = " + view.wV.toFixed(1) + "x" + view.hV.toFixed(1) +
					" (ratio = " + view.pixelratio.toPrecision(3) + ")",
				UFX.ticker.getrates(),
				"demo time: " + demotime,
			])
			gl.progs.text.draw(text.join("\n"), {
				fontname: "sans-serif",
				fontsize: 3 * h,
				lineheight: 1.2,
				bottomleft: [1 * h, 22 * h],
				ocolor: "black",
				owidth: 3,
				color: "#AAF",
			})
		}
		text = []
		text = text.concat([
			"RNA: " + state.RNA + "   DNA: " + state.DNA,
			"cell health: " + state.hp + "/" + state.hp0,
		])
		gl.progs.text.draw(text.join("\n"), {
			fontname: "Sansita One",
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

