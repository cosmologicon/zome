let snapshot = {
	version: 3,
	init: function () {
		this.id = UFX.random.word(5)
		this.send("zomesetup", {
			id: this.id,
			timestamp: Date.now(),
			version: this.version,
			support: UFX.support,
			url: window.location.href,
		})
		this.t = 0
		this.nextsnapshot = 0
	},
	send: function (type, obj) {
		let req = new XMLHttpRequest()
		req.open("POST", "http://universefactory.net/tools/dump/", true)
		req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
		req.send("project=" + type + "&data=" + encodeURIComponent(JSON.stringify(obj)))
	},
	take: function () {
		let odata = obj => ({
			x: obj.x,
			y: obj.y,
			r: obj.rcollide,
			flavor: obj.flavor,
		})
		let adata = obj => ({
			x: obj.x,
			y: obj.y,
			r: obj.rcollide,
			flavors: obj.flavors,
		})
		let vdata = obj => ({
			x: obj.x,
			y: obj.y,
			r: obj.rcollide,
			color: obj.color,
			hp: obj.hp,
		})
		let sdata = obj => ({
			x: obj.x,
			y: obj.y,
		})
		let obj = {
			id: this.id,
			t: this.t,
			hp: state.hp,
			qmessages: quest.messages,
			dialog: dialog.queue.length > 0 ? dialog.queue[0].text : null,
			cell: adata(state.cell),
//			organelles: state.organelles.map(odata),
			antibodies: state.antibodies.map(adata),
			viruses: state.viruses.map(vdata),
			shots: state.shots.map(sdata),
			cursor: control.cursor && adata(control.cursor),
			screensize: [view.wV, view.hV],
			pos: control.pos,
			view: [view.xcenterG, view.ycenterG, view.VscaleG, view.pixelratio],
			rates: UFX.ticker.getrates(),
		}
		this.send("zomesnap-" + this.id, obj)
	},
	think: function (dt) {
		this.t += dt
		while (this.t < 1000 && this.t >= this.nextsnapshot) {
			this.take()
			this.nextsnapshot += 0.25
		}
	},
}

// Disable snapshot. Server side broken as of Dec 2021. TODO: re-enable
snapshot = {
	version: -1,
	init: function () {},
	send: function () {},
	think: function () {},
}
