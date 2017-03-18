UFX.scenes.demo = {
	start: function () {
		if (settings.DEBUG) {
			UFX.key.init()
			UFX.key.watchlist = "F1 F2 F3 F4 F5 F6 F7 F8 F9 F10".split(" ")
		}
		snapshot.init()
		view.reset()
		control.reset()
		hud.reset()
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
		;"XX".split("").forEach(flavor => {
			let obj = new Organelle({
				x: state.cell.x + UFX.random(-1, 1),
				y: state.cell.y + UFX.random(-1, 1),
				flavor: flavor,
			})
			state.addobj(obj)
			state.cell.addobj(obj)
		})
		this.nextegg = 10
		this.jegg = 2
		hud.buttons.push(
			new Button("Pause", [0.4, 0.4, 0.4], (() => UFX.scene.push("pause")), "topleft", [0, 0]),
			new Button("Full\nscreen", [0.4, 0.4, 0.4], (() => UFX.scene.push("gofull")), "topleft", [0, 1]),
			new Button("Reset\ndemo", [0.4, 0.4, 0.4], (() => UFX.scene.swap("demo")), "topleft", [0, 2])
		)
		this.tlines = [
			[0, "Have you got what it takes to join my lab?"],
			[0, "Drag organelles to defend the cell from viruses!"],
			[70, "Big wave incoming! Don't let them slip through the cracks!"],
			[95, "Stronger viruses incoming! Combine organelles to make a strong antibody."],
			[150, "Large viruses carry smaller viruses. Don't let them get too close!"],
			[230, "A few kickback antibodies behind the cell make a good last line of defense."],
			[300, "The full game has 19 antibody types, 9 stages, boss battles, economy, and endless mode!"],
			[360, "Completely free and open source with no ads or transactions, for mobile or desktop."],
			[480, "Not bad! Thanks for playing and I'll see you in the lab!"],
		]
		this.think(0, 0, 1)

	},


	think: function (dt, jframe, nframe) {
		this.t += dt
		adjust(state.colliders(), dt)
		if (jframe == 0) this.think0(dt * nframe)
	},
	think0: function (dt) {
		this.control()
		this.addwaves()
		this.adddialog()
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
		snapshot.think(dt)
	},
	control: function () {
		if (settings.DEBUG) this.debugcontrol()
		var pstate = UFX.pointer(canvas)
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
			obj.onrdown()
			control.cursor = null
		} else if (pstate.down && control.pointed && !control.cursor) {
			if (control.pointed.draggable && control.pointed.candrag()) {
				control.pointed.drag()
				control.pointed = null
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
			state.antibodies.forEach(obj => {
				obj.x = state.cell.x + UFX.random(-30, 30)
				obj.y = state.cell.y + UFX.random(-30, 30)
			})
			for (let j = 0 ; j < 50 ; j += 0.1) this.think(0.1, 0, 1)
		}
		if (kstate.down.F2) {
			view.pixelratio /= Math.sqrt(2)
			if (view.pixelratio < 1/4) view.pixelratio = 1
		}
	},
	addwaves: function () {
		this.nexts.forEach(nspec => {
			if (this.t > nspec[1]) {
				if (nspec[0] == "final") {
					this.nexts = []
					this.nextegg = 10000000
					return
				}
				let type, n
				if (nspec[0].startsWith("wave")) {
					type = nspec[0].substr(4)
					nspec[1] += 100000000
					n = nspec[2]
				} else {
					type = nspec[0]
					nspec[1] += nspec[2]
					n = 1
				}
				for (let j = 0 ; j < n ; ++j) {
					state.addvirus(type, UFX.random(-0.2, 0.2))
				}
			}
		})
		if (this.t > this.nextegg) {
			if (!state.cell.isfull()) {
				let flavor = "XXY"[this.jegg % 3]
				this.jegg++
				let obj = new Egg({
					x: state.cell.x + UFX.random(-1, 1),
					y: state.cell.y + UFX.random(-1, 1),
					flavor: flavor,
				})
				state.addobj(obj)
				state.cell.addobj(obj)
				this.nextegg = this.t + 13
			}
		}
	},
	adddialog: function () {
		while (this.tlines.length && this.tlines[0][0] < this.t) {
			let line = this.tlines.shift()[1]
			dialog.queue.push(new TimedLine("zome", line))
		}
	},


	draw: function () {
		drawscene()
		if (control.cursor) drawantibody(control.cursor)

		profiler.start("drawhud")
		hud.drawbuttons()
		hud.drawcombos()
		gl.progs.text.use()
		var h = 0.01 * Math.sqrt(view.hV * view.wV)
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
		gl.progs.text.draw("Demo version", {
			fontsize: 3 * h,
			fontname: "Sansita One",
			topright: [view.wV - 1 * h, view.hV - 10 * h],
			ocolor: "black",
			color: "#AA8800",
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
	},
	think: function (dt) {
		hud.think(0)
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

