

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
	label: function (otype, n) {
		quest.labels[otype] = Math.max(quest.labels[otype] || 0, n || 99999)
	},
}

let QuestStateInteractions = {
	instagrow: function (dx, dy, flavor) {
		let org = state.addobj(new Organelle({
			x: state.cell.x + dx,
			y: state.cell.y + dy,
			flavor: flavor,
		}))
		state.cell.addobj(org)
		state.cell.ejectall()
	},
	checkarrival: function () {
		if (!this.viruses.some(v => v.alive)) {
			if (this.viruses.some(v => v.arrived)) {
				this.jstep -= 1
			} else {
				this.advance()
			}
		}
	},
	followallviruses: function () {
		state.viruses.forEach(v => {
			if (!this.viruses.some(virus => virus === v)) this.viruses.push(v)
		})
	},
	clearorganelles: function () {
		state.organelles.forEach(o => o.die())
		state.antibodies.forEach(a => a.die())
	},
	advance: function () {
		this.steadywaves = []
	},
	addsteadywave: function (vtype, t0, t1, dt) {
		this.steadywaves.push({
			vtype: vtype,
			t: t0,
			tmax: t1,
			dt: dt,
		})
	},
	runsteadywaves: function () {
		this.steadywaves.forEach(wave => {
			if (this.tstep < wave.t || wave.t > wave.tmax) return
			wave.t += wave.dt
			state.launchwave([[wave.vtype, 1, UFX.random(-0.2, 0.2)]])
		})
	},
	buildtostate: function (nX, nY, nZ) {
		;[["X", nX || 0], ["Y", nY || 0], ["Z", nZ || 0]].forEach(flavorn => {
			let [flavor, n] = flavorn
			while (state.organelles.filter(o => o.flavor == flavor).length < n) {
				this.instagrow(UFX.random(-1, 1), UFX.random(-1, 1), flavor)
			}
		})
	},
}


let newquest = function (think) {
	return UFX.Thing()
		.addcomp(QuestSteps)
		.addcomp(QuestStateInteractions)
		.addcomp({ think: think })
}

let Level1Tutorial = newquest(function (dt) {
	if (!state.levelname == 1) return
	if (this.jstep == 0) {
		if (dialog.tquiet > 3) this.display(paction("Click", "Tap") + " on the Grow button to grow an organelle.")
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


// Covers basics of antibodies and viruses. Introduces X antibody, ticks, and ants.
let DemoTutorial1 = newquest(function (dt) {
	if (this.jstep == 0) {
		state.cell.nslot = 0
		dialog.queue.push(new TimedLine("zome", "Have you got what it takes to join my lab?"))
		this.advance()
	} else if (this.jstep == 1) {
		if (dialog.tquiet > 1) {
//			this.celllabel = state.addobj(new TutorialLabel("Cell", state.cell))
			this.instagrow(1, -0.2, "X")
//			this.antilabel = state.addobj(new TutorialLabel("Rapid-fire\nAntibody", state.antibodies[0]))
			this.advance()
		}
	} else if (this.jstep == 2) {
		this.display("The cell makes antibodies. Move an antibody by dragging it.")
		this.label("cell")
		this.label("X")
		if (progress.did.drag) this.advance()
	} else if (this.jstep == 3) {
		this.viruses = [state.addvirus("tick", 0)]
		this.label("cell")
		this.label("X")
		this.advance()
	} else if (this.jstep == 4) {
		if (this.tstep > 2) this.display("Incoming virus! Drop the antibody into its path.")
		this.label("cell")
		this.label("X")
		this.label("tick")
		this.checkarrival()
	} else if (this.jstep == 5) {
		this.viruses = [0.9, 0, 0.1].map(d => state.addvirus("tick", d))
		this.label("cell")
		this.label("X")
		this.label("tick")
		this.advance()
	} else if (this.jstep == 6) {
		this.label("cell")
		this.label("X")
		this.label("tick")
		this.checkarrival()
	} else if (this.jstep == 7) {
		this.label("X")
		this.label("tick", 3)
		this.instagrow(1, -1, "X")
		this.instagrow(-1, -1, "X")
		this.advance()
	} else if (this.jstep == 8) {
		this.label("X")
		this.label("tick", 3)
		if (this.tstep > 2) {
			this.viruses = state.launchwave([
				["tick", 6, 0.9],
				["tick", 6, 0.1],
			])
			this.advance()
		}
	} else if (this.jstep == 9) {
		this.label("X")
		this.label("tick", 3)
		this.display("Keep the cell safe from viruses if you want to keep your funding!")
		this.checkarrival()
	} else if (this.jstep == 10) {
		this.label("X")
		this.label("ant", 3)
		if (this.tstep > 2) {
			this.viruses = state.launchwave([
				["ant", 20, 0],
			])
			this.advance()
		}
	} else if (this.jstep == 11) {
		this.display("Larger viruses require more hits to defeat.")
		this.label("ant", 3)
		this.checkarrival()
	} else if (this.jstep == 12) {
		this.instagrow(-0.2, -1, "X")
		this.advance()
	} else if (this.jstep == 13) {
		this.advance()
		this.addsteadywave("ant", 0, 20, 1.2)
		this.addsteadywave("tick", 15, 30, 0.6)
	} else if (this.jstep == 14) {
		this.runsteadywaves()
		if (this.tstep >= 30) this.advance()
	} else if (this.jstep == 15) {
		if (!state.viruses.length) this.advance()
	} else if (this.jstep == 16) {
		this.done = true
	}
})


let DemoTutorial2 = newquest(function (dt) {
	if (this.jstep == 0) {
		if (DemoTutorial1.done) this.advance()
	} else if (this.jstep == 1) {
		state.cell.nslot = 0
		progress.learned.XX = true
		this.buildtostate(4)
		dialog.queue.push(new TimedLine("zome", "Looks like you discovered a new type of antibody! How fascinating!"))
		this.advance()
	} else if (this.jstep == 2) {
		if (dialog.tquiet > 1) {
			this.advance()
		}
	} else if (this.jstep == 3) {
		this.display("Make a stronger antibody by dropping one onto another.")
		this.label("X", 1)
		this.label("XX", 1)
		if (state.antibodies.some(a => a.flavors == "XX")) this.advance()	
	} else if (this.jstep == 4) {
		this.label("X", 1)
		this.label("XX", 1)
		if (this.tstep > 2) {
			this.viruses = state.launchwave([
				["katydid", 8, 0],
			])
			this.advance()
		}
	} else if (this.jstep == 5) {
		this.display("Stronger antibodies are good for larger viruses.")
		this.label("katydid", 2)
		this.label("X", 1)
		this.label("XX", 1)
		this.checkarrival()
	} else if (this.jstep == 6) {
		this.display("Split apart strong antibodies by " + paction("right-clicking", "tapping") + " on them.")
		if (!state.antibodies.some(a => a.flavors == "XX")) {
			this.viruses = state.launchwave([
				["tick", 8, -0.1],
				["tick", 8, 0],
				["tick", 8, 0.1],
			])
			this.advance()	
		}
	} else if (this.jstep == 7) {
		this.checkarrival()
	} else if (this.jstep == 8) {
		this.viruses = state.launchwave([
			["megatick", 1, 0],
		])
		this.advance()	
	} else if (this.jstep == 9) {
		this.display("Large viruses can carry small viruses. Take them out before they get too close.")
		this.label("megatick")
		this.followallviruses()
		this.checkarrival()
	} else if (this.jstep == 10) {
		this.done = true
	}
})

let DemoTutorial3 = newquest(function (dt) {
	if (this.jstep == 0) {
		if (DemoTutorial2.done) this.advance()
	} else if (this.jstep == 1) {
		state.cell.nslot = 0
		this.clearorganelles()
		progress.learned.XX = true
		progress.learned.Y = true
		this.instagrow(0, 1, "Y")
		dialog.queue.push(new TimedLine("zome", "Keep it up!"))
		this.advance()
	} else if (this.jstep == 2) {
		this.label("Y")
		if (dialog.tquiet > 1) this.advance()
	} else if (this.jstep == 3) {
		this.label("Y")
		this.viruses = state.launchwave([
			["ant", 1, -0.1],
			["ant", 1, 0],
			["ant", 1, 0.1],
		])
		this.advance()
	} else if (this.jstep == 4) {
		this.display("Kickback antibodies buy you some time.")
		this.label("Y")
		this.checkarrival()
	} else if (this.jstep == 5) {
		this.label("Y", 2)
		this.instagrow(0, 1, "Y")
		this.instagrow(1, 1, "Y")
		this.instagrow(-1, 1, "Y")
		this.advance()
		this.addsteadywave("ant", 0, 20, 1)
		this.addsteadywave("katydid", 0, 1, 3)
	} else if (this.jstep == 6) {
		this.label("Y", 2)
		this.runsteadywaves()
		if (this.tstep > 40) this.advance()
	} else if (this.jstep == 7) {
		this.label("Y", 2)
		if (!state.viruses.length) this.advance()
	} else if (this.jstep == 8) {
		this.done = true
	}
})

let DemoTutorial4 = newquest(function (dt) {
	if (this.jstep == 0) {
		if (DemoTutorial3.done) this.advance()
	} else if (this.jstep == 1) {
		state.cell.nslot = 0
		progress.learned.XX = true
		progress.learned.Y = true
		progress.learned.XY = true
		this.buildtostate(3, 3)
		dialog.queue.push(new TimedLine("zome", "Recombining antibodies is the name of the game!"))
		this.advance()
	} else if (this.jstep == 2) {
		if (dialog.tquiet > 1) this.advance()
	} else if (this.jstep == 3) {
		this.display("Combine two different colors to make a strong antibody.")
		if (state.antibodies.filter(a => a.flavors == "XY").length) this.advance()	
	} else if (this.jstep == 4) {
		this.viruses = state.launchwave([
			["katydid", 10, 0],
		])
		this.advance()
	} else if (this.jstep == 5) {
		this.label("XY", 1)
		this.checkarrival()
	} else if (this.jstep == 6) {
		this.advance()
		this.buildtostate(5, 3)
		this.addsteadywave("tick", 15, 60, 1)
		this.addsteadywave("ant", 0, 40, 2)
		this.addsteadywave("katydid", 0, 25, 5)
		this.addsteadywave("megatick", 30, 40, 10)
	} else if (this.jstep == 7) {
		this.label("X", 1)
		this.label("Y", 1)
		this.label("XX", 1)
		this.label("XY", 1)
		this.label("megatick", 1)
		this.runsteadywaves()
		if (this.tstep > 40 && !state.viruses.length) this.advance()
		if (this.tstep < 10) {
//			this.display()
		}
	} else if (this.jstep == 8) {
		this.done = true
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
		this.labels = {}
		this.quests.forEach(q => q.think(dt))
		this.quests = this.quests.filter(q => !q.done)
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
	getlabels: function () {
		let ls = []
		if (this.labels.cell) {
			ls.push(new TutorialLabel("Cell", state.cell))
		}
		let antibodylabels = {
			X: "Weak\nAntibody",
			XX: "Medium\nAntibody",
			Y: "Kickback\nAntibody",
			XY: "Strong\nAntibody",
			YY: "Electric\nAntibody",
		}
		for (let flavor in antibodylabels) {
			if (this.labels[flavor]) {
				let objs = state.antibodies.filter(a => a.flavors == flavor).filter((a, j) => j < this.labels[flavor])
				if (objs.length) ls = ls.concat(objs.map(a => new TutorialLabel(antibodylabels[flavor], a)))
			}
		}
		let viruslabels = {
			tick: "Small\nVirus",
			ant: "Medium\nVirus",
			katydid: "Large\nVirus",
			megatick: "Carrier\nVirus",
		}
		for (let vtype in viruslabels) {
			if (this.labels[vtype]) {
				let objs = state.viruses.filter(v => v instanceof VirusTypes[vtype]).filter((v, j) => j < this.labels[vtype])
				if (objs.length) ls = ls.concat(objs.map(v => new TutorialLabel(viruslabels[vtype], v)))
			}
		}
		return ls
	},
}
quest.init()


