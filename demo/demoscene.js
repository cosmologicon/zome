UFX.scenes.demo = {
	start: function () {
		view.reset()
		control.reset()
		hud.reset()
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
			["wavetick", 350, 30],
			["wavetick", 340, 30],
			["waveant", 320, 10],
			["wavekatydid", 300, 6],
			["wavemegaant", 300, 6],

			["katydid", 350, 15],
			["megaant", 350, 15],
			["megatick", 330, 15],
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
		this.bmessage0 = hud.addbmessage("Drag organelles\nfrom the cell", [0, 0],
			{ rotation: 10, fontsize: 20, lifetime: 7, })
		hud.buttons.push(
			new Button("Pause", [0.4, 0.4, 0.4], (() => UFX.scene.push("pause")), "topleft", [0, 0]),
			new Button("Full\nscreen", [0.4, 0.4, 0.4], (() => UFX.scene.push("gofull")), "topleft", [0, 1]),
			new Button("Reset\ndemo", [0.4, 0.4, 0.4], (() => UFX.scene.swap("demo")), "topleft", [0, 2])
		)
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
		state.thinkers().forEach(obj => obj.think(dt))
		state.antibodies.forEach(obj => obj.constraintoworld())
		if (control.cursor) {
			control.cursor.think(dt)
			control.cursor.reset()
			control.cursor.constraintoworld()
		}
		state.think(dt)
		hud.think(dt)
	},
	control: function () {
		var pstate = UFX.pointer(canvas), kstate = UFX.key.state()
		control.pos = view.GconvertP(pstate.pos)
		control.pointed = control.getpointed(state.pointables())
		if (pstate.pos) {
			hud.pointed = hud.getpointed([pstate.pos[0], view.hV - pstate.pos[1]])
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
				view.dragto(control.cursorpos, pstate.pos)
			} else if (pstate.dmove) {
				view.dragto(control.cursorpos, pstate.pos)
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
	addwaves: function () {
		this.nexts.forEach(nspec => {
			if (this.t > nspec[1]) {
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
				this.nextegg = this.t + 10 + 0.5 * this.jegg
			}
		}
	},


	draw: function () {
		drawscene()
		if (control.cursor) drawantibody(control.cursor)

		hud.drawbuttons()
		hud.drawcombos()
		gl.progs.text.use()
		var h = 0.01 * Math.sqrt(view.hV * view.wV)
		gl.progs.text.draw("Dr. Zome's Laboratory", {
			fontsize: 5 * h,
			fontname: "Sansita One",
			topright: [view.wV - 1 * h, view.hV - 0 * h],
			ocolor: "black",
			color: "yellow",
			owidth: 1,
		})
		gl.progs.text.draw("Demo version", {
			fontsize: 3 * h,
			fontname: "Sansita One",
			topright: [view.wV - 1 * h, view.hV - 6 * h],
			ocolor: "black",
			color: "yellow",
			owidth: 1,
		})

		let text = []
		if (window.location.href.includes("DEBUG")) {
			let m = Math.floor(this.t / 60), s = this.t % 60
			let demotime = m + "m" + ("0000" + s.toFixed(1)).slice(-4) + "s"
			text = text.concat([
				"control.pointed = " + control.pointed,
				"control.pos = [" + control.pos[0].toFixed(1) + "," + control.pos[1].toFixed(1) + "]",
				"canvas size = " + view.wV + "x" + view.hV,
				UFX.ticker.getrates(),
				"demo time: " + demotime,
				"",
			])
		}
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

