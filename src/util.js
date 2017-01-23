"use strict"

function clamp (x, a, b) { return x < a ? a : x > b ? b : x }
function ease(f) {
	f = clamp(f, 0, 1)
	return f * f * (3 - 2 * f)
}
const tau = 2 * Math.PI
const phi = (1 + Math.sqrt(5)) / 2
function norm (x, y, r) {
	r = r || 1
	const d2 = x * x + y * y
	if (d2 == 0) return [0, r]
	const f = r / Math.sqrt(d2)
	return [f * x, y * f]
}
let profiler = {
	t0s: {},
	records: {},
	start: function (tname) {
		if (!settings.DEBUG) return
		this.t0s[tname] = Date.now()
	},
	stop: function (tname) {
		if (!settings.DEBUG) return
		let dt = Date.now() - this.t0s[tname]
		if (!this.records[tname]) this.records[tname] = []
		this.records[tname].push(dt)
		while (this.records[tname].length > 20) this.records[tname].shift()
	},
	get: function (tname) {
		let record = this.records[tname]
		if (!record || !record.length) return null
		return record.reduce((a, b) => a + b) / record.length
	},
	report: function () {
		let tnames = Object.keys(this.records)
		tnames.sort()
		return tnames.map(tname => {
			let value = this.get(tname)
			return `${tname}: ${value ? value.toFixed(1) : value}`
		})
	},
}
