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
window.onerror = function (message, url, line, col, errorobj) {
	let stack = errorobj === undefined ? undefined : errorobj.stack
	document.body.innerHTML = `
		<p>Error in: ${url}
		<p>line ${line}
		<pre>${message}
		
${stack}</pre>
	`
}

