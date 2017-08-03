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

let newquest = function (think) {
	return UFX.Thing()
		.addcomp(QuestSteps)
		.addcomp({ think: think })
}

let Level1Tutorial = newquest(function (dt) {
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
})

let DemoTutorial = newquest(function (dt) {
	if (this.jstep == 0) {
		state.cell.nslot = 0
		dialog.queue.push(new TimedLine("zome", "Have you got what it takes to join my lab?"))
		this.advance()
	} else if (this.jstep == 1) {
		if (dialog.tquiet > 1) {
			this.celllabel = state.addobj(new TutorialLabel("Cell", state.cell))
			let org = state.addobj(new Organelle({
				x: state.cell.x + 1,
				y: state.cell.y - 0.2,
				flavor: "X",
			}))
			state.cell.addobj(org)
			state.cell.ejectall()
			this.antilabel = state.addobj(new TutorialLabel("Antibody", state.antibodies[0]))
			this.advance()
		}
	} else if (this.jstep == 2) {
		this.display("The cell makes antibodies. Move an antibody by dragging it.")
		if (progress.did.drag) this.advance()
	} else if (this.jstep == 3) {
		this.virus = state.addvirus("tick", 0)
		this.viruslabel = state.addobj(new TutorialLabel("Virus", this.virus))
		this.celllabel.fadeout()
		this.advance()
	} else if (this.jstep == 4) {
		if (this.tstep > 2) this.display("Incoming virus! Drop the antibody into its path.")
		if (!this.virus.alive) {
			if (this.virus.arrived) {
				this.jstep = 3
			} else {
//				dialog.queue.push(new TimedLine("zome", "Keep that cell safe if you want to keep your funding!"))
				this.antilabel.fadeout()
				this.advance()
			}
		}
	} else if (this.jstep == 5) {
		this.viruses = [0.9, 0, 0.1].map(d => state.addvirus("tick", d))
		this.advance()
	} else if (this.jstep == 6) {
		if (!this.viruses.some(v => v.alive)) {
			if (this.viruses.some(v => v.arrived)) {
				this.jstep = 5
			} else {
				this.advance()
			}
		}
	} else if (this.jstep == 7) {
		state.cell.addobj(state.addobj(new Organelle({
			x: state.cell.x + 1,
			y: state.cell.y - 1,
			flavor: "X",
		})))
		state.cell.addobj(state.addobj(new Organelle({
			x: state.cell.x - 1,
			y: state.cell.y - 1,
			flavor: "X",
		})))
		state.cell.ejectall()
		this.advance()
	} else if (this.jstep == 8) {
		if (this.tstep > 2) {
			this.viruses = state.launchwave([
				["tick", 6, 0.9],
				["tick", 6, 0.1],
			])
			this.advance()
		}
	} else if (this.jstep == 9) {
		this.display("Keep the cell safe from viruses if you want to keep your funding!")
		if (!this.viruses.some(v => v.alive)) {
			if (this.viruses.some(v => v.arrived)) {
				this.jstep = 8
			} else {
				this.advance()
			}
		}
	} else if (this.jstep == 10) {
		if (this.tstep > 2) {
			this.viruses = state.launchwave([
				["ant", 20, 0],
			])
			this.advance()
		}
	} else if (this.jstep == 11) {
		this.display("Larger viruses require more hits to defeat.")
		if (!this.viruses.some(v => v.alive)) {
			if (this.viruses.some(v => v.arrived)) {
				this.jstep = 10
			} else {
				progress.learned.XX = true
				state.cell.addobj(state.addobj(new Organelle({
					x: state.cell.x - 0.2,
					y: state.cell.y - 1,
					flavor: "X",
				})))
				state.cell.ejectall()
				this.advance()
			}
		}
	} else if (this.jstep == 12) {
		this.display("Make a stronger antibody by dropping one onto another.")
		if (state.antibodies.some(a => a.flavors == "XX")) this.advance()	
	} else if (this.jstep == 13) {
		if (this.tstep > 2) {
			this.viruses = state.launchwave([
				["katydid", 8, 0],
			])
			this.advance()
		}
	} else if (this.jstep == 14) {
		this.display("Stronger antibodies are good for larger viruses.")
		if (!this.viruses.some(v => v.alive)) {
			if (this.viruses.some(v => v.arrived)) {
				this.jstep = 13
			} else {
				this.advance()
			}
		}
	} else if (this.jstep == 15) {
		this.display("Split apart strong antibodies by right-clicking on them.")
		if (!state.antibodies.some(a => a.flavors == "XX")) {
			this.viruses = state.launchwave([
				["tick", 8, -0.1],
				["tick", 8, 0],
				["tick", 8, 0.1],
			])
			this.advance()	
		}
	} else if (this.jstep == 16) {
		if (!this.viruses.some(v => v.alive)) {
			if (this.viruses.some(v => v.arrived)) {
				this.jstep = 15
			} else {
				this.advance()
			}
		}
	} else if (this.jstep == 17) {
		this.viruses = state.launchwave([
			["megatick", 1, 0],
		])
		this.advance()	
	} else if (this.jstep == 18) {
		this.display("Large viruses can carry small viruses. Take them out before they get too close.")
		state.viruses.forEach(v => {
			if (!this.viruses.some(virus => virus === v)) this.viruses.push(v)
		})
		if (!this.viruses.some(v => v.alive)) {
			if (this.viruses.some(v => v.arrived)) {
				this.jstep = 17
			} else {
				this.advance()
			}
		}
	} else if (this.jstep == 19) {
		this.display("Tutorial demo complete.")
	}
})


let quest = {
	init: function (quests) {
		this.quests = quests || [
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


