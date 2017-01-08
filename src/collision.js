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

function getcollisions(objs) {
	let collisions = [], done = {}
	function qcollide0(js) {
		for (let k1 = 1 ; k1 < js.length ; ++k1) {
			let j1 = js[k1], [x1, y1, r1, m1] = objs[j1]
			for (let k0 = 0 ; k0 < k1 ; ++k0) {
				let j0 = js[k0], [x0, y0, r0, m0] = objs[j0]
				let dx = x0 - x1, dy = y0 - y1, dr = r0 + r1
				if (dx * dx + dy * dy < dr * dr && !done[[j0,j1]]) {
					collisions.push([j0,j1])
					done[[j0,j1]] = 1
				}
			}
		}
	}
	function qcollide(js) {
		if (js.length < 5) return qcollide0(js)
		let xmin = objs[js[0]][0], ymin = objs[js[0]][1], xmax = xmin, ymax = ymin
		for (var k = 1 ; k < js.length ; ++k) {
			let [x, y, r, m] = objs[js[k]]
			if (x < xmin) xmin = x
			if (x > xmax) xmax = x
			if (y < ymin) ymin = y
			if (y > ymax) ymax = y
		}

		let xrange = xmax - xmin, yrange = ymax - ymin
		let js1 = [], js2 = []
		if (xrange > yrange) {
			let xc = (xmin + xmax) / 2
			for (var k = 0 ; k < js.length ; ++k) {
				let j = js[k], [x, y, r, m] = objs[j]
				if (x - r <= xc) js1.push(j)
				if (x + r >= xc) js2.push(j)
			}
		} else {
			let yc = (ymin + ymax) / 2
			for (var k = 0 ; k < js.length ; ++k) {
				let j = js[k], [x, y, r, m] = objs[j]
				if (y - r <= yc) js1.push(j)
				if (y + r >= yc) js2.push(j)
			}
		}
		if (js1.length * js1.length + js2.length * js2.length > js.length * js.length) {
			qcollide0(js)
		} else {
			qcollide(js1)
			qcollide(js2)
		}
	}
	function gcollide() {
		// 5 performed best in dense profiling tests
		let N = objs.length, ngrid = Math.ceil(Math.sqrt(N / 5))
		if (ngrid <= 1) return qcollide0(objs.map((obj, j) => j))
		let xmin = objs[0][0], ymin = objs[0][1], xmax = xmin, ymax = ymin
		for (var k = 1 ; k < objs.length ; ++k) {
			let [x, y, r, m] = objs[k]
			if (x < xmin) xmin = x
			if (x > xmax) xmax = x
			if (y < ymin) ymin = y
			if (y > ymax) ymax = y
		}
		let dxgrid = (xmax - xmin) / ngrid, dygrid = (ymax - ymin) / ngrid
		if (!dxgrid || !dygrid) return qcollide0(objs.map((obj, j) => j))
		let js = []
		for (let xgrid = 0 ; xgrid < ngrid ; ++xgrid) {
			js.push([])
			for (let ygrid = 0 ; ygrid < ngrid ; ++ygrid) {
				js[xgrid].push([])
			}
		}
		for (let j = 0 ; j < objs.length ; ++j) {
			let [x, y, r, m] = objs[j]
			x -= xmin
			y -= ymin
			let x0 = Math.max(0, Math.floor((x - r) / dxgrid))
			let x1 = Math.min(ngrid - 1, Math.floor((x + r) / dxgrid))
			let y0 = Math.max(0, Math.floor((y - r) / dygrid))
			let y1 = Math.min(ngrid - 1, Math.floor((y + r) / dygrid))
			for (let xgrid = x0 ; xgrid <= x1 ; ++xgrid) {
				for (let ygrid = y0 ; ygrid <= y1 ; ++ygrid) {
					js[xgrid][ygrid].push(j)
				}
			}
		}
		for (let xgrid = 0 ; xgrid < ngrid ; ++xgrid) {
			let jxs = js[xgrid]
			for (let ygrid = 0 ; ygrid < ngrid ; ++ygrid) {
				qcollide(jxs[ygrid])
			}
		}
	}
	gcollide()
	return collisions
}
// getcollisions = getcollisions0

function getbounce(objs, dt) {
	var ds = objs.map(_ => [0, 0])
	profiler.start("getcollisions")
	let collisions = getcollisions(objs)
	profiler.stop("getcollisions")
	for (let k = 0 ; k < collisions.length ; ++k) {
		let ij = collisions[k]
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
	}
	return ds
}

function adjust(objs, dt) {
	if (objs.length < 2) return
	profiler.start("adjust")
	var ds = getbounce(objs.map(obj => obj.collidespec()), dt)
	ds.forEach(function(d, j) {
		objs[j].scootch(d[0], d[1])
	})
	profiler.stop("adjust")
}


