const DrawAsText = {
	start: function (opts) {
		this.text = opts.text
		this.rotation = opts.rotation || 0
		this.fontsize = opts.fontsize
		this.fontname = opts.fontname
		this.color = opts.color
		this.ocolor = "black"
	},
	draw: function () {
		let pos = view.VconvertG([this.x, this.y])
		gl.progs.text.draw(this.text, {
			center: this.drawpos(),
			fontsize: this.drawsize(),
			fontname: this.fontname,
			color: this.color,
			ocolor: this.ocolor,
			rotation: this.rotation,
			alpha: this.drawalpha(),
		})
	},
}

const WorldBoundText = {
	drawpos: function () {
		return view.VconvertG([this.x, this.y])
	},
	drawsize: function () {
		return view.VscaleG * this.fontsize
	},
	drawalpha: function () {
		return 0.4 * this.alpha
	},
}

// Background messages, that appear within the gameplay area behind game objects
function Bmessage (text, pos, options) {
	var opts = Object.create(options || {})
	opts.x = pos[0]
	opts.y = pos[1]
	opts.fontname = opts.fontname || "Stint Ultra Condensed"
	opts.fontsize = opts.fontsize || 20
	opts.color = "#FF4F4F"
	opts.text = text
	this.start(opts)
	this.lifetime = opts.lifetime || 9999999
}
Bmessage.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(Lifetime, 0)
	.addcomp(FadesInAndOut)
	.addcomp(WorldBound)
	.addcomp(DrawAsText)
	.addcomp(WorldBoundText)
	

const hud = {
	bmessages: [],
	reset: function () {
		this.bmessages = []
	},

	addbmessage: function (text, pos, options) {
		this.bmessages.push(new Bmessage(text, pos, options))
	},
	think: function (dt) {
		this.bmessages.forEach(obj => obj.think(dt))
		this.bmessages = this.bmessages.filter(obj => obj.alive)
	},
	drawback: function () {
		gl.progs.text.use()
		this.bmessages.forEach(b => b.draw())
	},
}

