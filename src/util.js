"use strict"

function clamp (x, a, b) { return x < a ? a : x > b ? b : x }
var tau = 2 * Math.PI
var phi = (1 + Math.sqrt(5)) / 2
function norm (x, y, r) {
	r = r || 1
	var d2 = x * x + y * y
	if (d2 == 0) return [0, r]
	var f = r / Math.sqrt(d2)
	return [f * x, y * f]
}
