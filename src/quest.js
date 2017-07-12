let QuestSteps = {
	init: function () {
		this.t = 0
		this.jstep = 0
		this.tstep = 0
		this.done = false
	},
	think: function (dt) {
		if (this.done) return
		this.t += dt
		this.tstep += dt
	},
	advance: function () {
		this.jstep += 1
		this.tstep = 0
	},
	display: function (message) {
		if (!quest.message) quest.message = message
	},
}

let Level1Tutorial = UFX.Thing()
	.addcomp(QuestSteps)
	.addcomp({
		think: function (dt) {
			if (!state.levelname == 1) return
			if (this.jstep == 0) {
				if (dialog.tquiet > 3) this.display("Click on the Grow button to grow an organelle.")
				if (state.cell.slots.length) this.advance()
			} else if (this.jstep == 1) {
				if (dialog.tquiet > 3 && this.tstep > 2 + mechanics.hatchtime.X) {
					this.display("Drag an organelle out of the cell to make a defensive antibody.")
				}
				if (state.antibodies.length) this.advance()
			} else if (this.jstep == 2) {
				if (dialog.tquiet > 3 && this.tstep > 8) {
					this.display("Drag an antibody to reposition it.")
				}
				if (this.tstep > 16) this.advance()
			} else if (this.jstep == 3) {
				if (dialog.tquiet > 3 && this.tstep > 8) {
					this.display("Use the mouse wheel to zoom.")
				}
				if (this.tstep > 16) this.advance()
			}
		},
	})



let quest = {
	init: function () {
		this.quests = [
			Level1Tutorial,
		]
		this.message = null
	},
	think: function (dt) {
		this.message = null
		this.quests.forEach(q => q.think(dt))
	},
	draw: function () {
		if (!this.message) return
		gl.progs.text.use()
		gl.progs.text.draw(this.message, {
			centerx: view.wV * 0.5,
			centery: view.hV * 0.7,
			width: view.wV * 0.85,
			color: "#FF6",
			gcolor: "#BB2",
			scolor: "black",
			shadow: [2, 2],
			fontname: "Permanent Marker",
			fontsize: 0.04 * view.sV,
		})
	},
}
quest.init()


