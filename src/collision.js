// Collision module

"use strict"

// Reference implementation.

function getcollisions0(objs) {
	var N = objs.length
	var ret = []
	for (var j = 0 ; j < N ; ++j) {
		var [x1, y1, r1, m1] = objs[j]
		for (var i = 0 ; i < j ; ++i) {
			var [x0, y0, r0, m0] = objs[i]
			var dx = x0 - x1, dy = y0 - y1, r = r0 + r1
			if (dx * dx + dy * dy < r * r) ret.push([i, j])
		}
	}
	return ret
}

// TODO: quadtree implementation
var getcollisions = getcollisions0

function getbounce(objs, dt) {
	var ds = objs.map(_ => [0, 0])
	getcollisions(objs).forEach(function (ij) {
		var [i, j] = ij
		var [x0, y0, r0, m0] = objs[i]
		var [x1, y1, r1, m1] = objs[j]
		var dx = x1 - x0, dy = y1 - y0
		if (dx == 0 && dy == 0) {
			var a = UFX.random.angle()
			dx = Math.sin(a)
			dy = Math.cos(a)
		}
		var d = Math.sqrt(dx * dx + dy * dy)
		var f = clamp(20 * (r0 + r1 - d), 50, 200)
		dx *= dt / d * f
		dy *= dt / d * f
		var da = Math.sqrt(dx * dx + dy * dy)
		if (d + da > 1.001 * (r0 + r1)) {
			var db = 1.001 * (r0 + r1) - d
			dx *= db / da
			dy *= db / da
		}
		var f0, f1
		if (m1 > 100 * m0) [f0, f1] = [1, 0]
		else if (m0 > 100 * m1) [f0, f1] = [0, 1]
		else [f0, f1] = [m1 / (m0 + m1), m0 / (m1 + m0)]
		ds[i][0] -= dx * f0
		ds[i][1] -= dy * f0
		ds[j][0] += dx * f1
		ds[j][1] += dy * f1
	})
	return ds
}

function adjust(objs, dt) {
	if (objs.length < 2) return
	var ds = getbounce(objs.map(obj => obj.collidespec()), dt)
	ds.forEach(function(d, j) {
		objs[j].scootch(d[0], d[1])
	})
}


