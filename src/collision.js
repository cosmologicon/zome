// Collision module

// For the purposes of physics, all collideable objects in the game are circles with a certain
// position, radius, and mass. When two objects overlap, they experience a push that takes into
// account their respective masses.

// As a special case, if an object has mass more than 100x the mass of an object it's colliding
// with, it's considered immobile for the purpose of that collision. This lets us create a
// heirarchy of immobility: the cell is immobile with respect to everything (including bosses), and
// bosses are immobile with respect to smaller enemies and organelles. Enemies and organelles are
// not immobile with respect to each other.

"use strict"

// Given a list of [x, y, r, m] representations of objects, return a list of pairs of indices of the
// objects that overlap. For instance, [0, 4] appearing in the returned list means that objects #0
// and #4 are colliding, which is defined as (x0 - x4)^2 + (y0 - y4)^2 < (r0 + r4)^2.

// This is the reference implementation, which simply checks each pair of objects, and so has
// quadratic runtime in the best case.
function getcollisions0(objs) {
	let N = objs.length
	let ret = []
	for (let j = 0 ; j < N ; ++j) {
		let [x1, y1, r1, m1] = objs[j]
		for (let i = 0 ; i < j ; ++i) {
			let [x0, y0, r0, m0] = objs[i]
			let dx = x0 - x1, dy = y0 - y1, r = r0 + r1
			if (dx * dx + dy * dy < r * r) ret.push([i, j])
		}
	}
	return ret
}

// Divide-and-conquer algorithm. This should return identical results as the reference
// implementation, but perform significantly faster for a typical case with hundreds of objects.
function getcollisions(objs) {
	// collisions will contain the final return value. Each subfunction will append to it.
	// The done object is a way to avoid adding the same pair of indices to the return value more
	// than once (necessary since multiple subfunctions may evaluate the same pair of objects).
	// When a pair of indices [i,j] is added to collisions, done[[i,j]] is set to truthy.
	// Yes, it's okay to index by an array like that. No, it's not possible for two different arrays
	// to result in the same string in this case, because i and j are always integers.
	// I have thought this through.
	let collisions = [], done = {}
	// Base case: fall back to the quadratic checking of each pair of indices, and add each pair
	// that collides to collisions. js is a list of indices (in the objs list), each of which you
	// want to check against each other.
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
	// Recursive quadtree divide-and-conquer. js is a list of indices (into the objs list), each of
	// which you want to check against each other.
	function qcollide(js) {
		// Heuristic: don't even bother dividing and fall back to the base case if there are 4 or
		// fewer objects.
		if (js.length < 5) return qcollide0(js)
		// We're going to split the objects into two groups by drawing a line either in the x
		// direction or the y direction. As a heuristic, we'll choose based on which dimension has
		// a smaller extent.
		// Objects will be divided into two subsets based on which side of the line they fall on. An
		// object that intersects the dividing line will be placed in both subsets.
		let xmin = objs[js[0]][0], ymin = objs[js[0]][1], xmax = xmin, ymax = ymin
		for (let j of js) {
			let [x, y, r, m] = objs[j]
			if (x < xmin) xmin = x
			if (x > xmax) xmax = x
			if (y < ymin) ymin = y
			if (y > ymax) ymax = y
		}

		let xrange = xmax - xmin, yrange = ymax - ymin
		let js1 = [], js2 = []  // Index list for each of the two subsets.
		// Objects are more spread out in the x direction, so divide based on x-coordinate (i.e.
		// with a vertical line).
		if (xrange > yrange) {
			let xc = (xmin + xmax) / 2
			for (let j of js) {
				let [x, y, r, m] = objs[j]
				if (x - r <= xc) js1.push(j)
				if (x + r >= xc) js2.push(j)
			}
		// Objects are more spread out in the y direction, so divide based on y-coordinate (i.e.
		// with a horizontal line).
		} else {
			let yc = (ymin + ymax) / 2
			for (let j of js) {
				let [x, y, r, m] = objs[j]
				if (y - r <= yc) js1.push(j)
				if (y + r >= yc) js2.push(j)
			}
		}
		// Heuristic: divide and conquer only if the sum of squares for the two subsets is less than
		// the square of the original set. Otherwise we're probably not making much progress by
		// dividing, so just go to the base case.
		if (js1.length * js1.length + js2.length * js2.length > js.length * js.length) {
			qcollide0(js)
		} else {
			qcollide(js1)
			qcollide(js2)
		}
	}
	// Similar to qcollide, but instead of dividing into two groups, divide into n^2 cells in a
	// grid in a single pass. This is an improvement when the number of subdivisions we expect is
	// still pretty big. Each cell is then passed to qcollide for further possible divisions.
	function gcollide() {
		// Choose the number of grid cells (ngrid). Roughly speaking we expect this to scale with
		// the square root of the number of objects (N). sqrt(N/5) performed well in profiling tests
		// with dense objects.
		let N = objs.length, ngrid = Math.ceil(Math.sqrt(N / 5))
		if (ngrid <= 1) return qcollide0(objs.map((obj, j) => j))
		// Determine the x and y extent so that we can divide each dimension in ngrid cells.
		let xmin = objs[0][0], ymin = objs[0][1], xmax = xmin, ymax = ymin
		for (let [x, y, r, m] of objs) {
			if (x < xmin) xmin = x
			if (x > xmax) xmax = x
			if (y < ymin) ymin = y
			if (y > ymax) ymax = y
		}
		// x and y size of each grid cell.
		let dxgrid = (xmax - xmin) / ngrid, dygrid = (ymax - ymin) / ngrid
		// Check for the case where all objects are coincident in either x or y. This is going to
		// cause problems with the division, so fall back to the reference implementation.
		if (!dxgrid || !dygrid) return qcollide0(objs.map((obj, j) => j))
		// js[x][y] is the set of indices of all objects in the (x,y) cell. As in qcollide, any
		// object that intersects a grid line will appear in more than one cell. Technically we're
		// treating the objects as squares rather than circles here for deciding which cells they
		// fall into, so there may be some false positives.
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
			// Smallest x-value (leftmost) for a cell in which this object appears.
			let x0 = Math.max(0, Math.floor((x - r) / dxgrid))
			// Largest x-value (rightmost) for a cell in which this object appears.
			let x1 = Math.min(ngrid - 1, Math.floor((x + r) / dxgrid))
			// Smallest y-value (bottommost) for a cell in which this object appears.
			let y0 = Math.max(0, Math.floor((y - r) / dygrid))
			// Largest y-value (topmost) for a cell in which this object appears.
			let y1 = Math.min(ngrid - 1, Math.floor((y + r) / dygrid))
			// Add the object's index to all cells in which it appears.
			for (let xgrid = x0 ; xgrid <= x1 ; ++xgrid) {
				for (let ygrid = y0 ; ygrid <= y1 ; ++ygrid) {
					js[xgrid][ygrid].push(j)
				}
			}
		}
		// Call qcollide for each grid cell.
		for (let xgrid = 0 ; xgrid < ngrid ; ++xgrid) {
			let jxs = js[xgrid]
			for (let ygrid = 0 ; ygrid < ngrid ; ++ygrid) {
				qcollide(jxs[ygrid])
			}
		}
	}
	// Replace the following line with qcollide0(objs.map((obj, j) => j)) to skip the gcollide step.
	gcollide()
	return collisions
}
// Uncomment to use the reference implementation instead of the faster one.
// getcollisions = getcollisions0


// The push factor is the amount of impulse two overlapping objects exert on each other, in units of
// game dimensions per second. This formula is pretty arbitary, just based on feel. Too strong and
// the objects feel too rigid. Too weak and it takes a long time for colliding objects to separate.
function pushfactor(overlap) {
	return clamp(20 * overlap, 50, 200)
}

// Determine the amount by which to shift each object in a list of objects. Pass in a list of
// objects in the form [x, y, r, m], and a timestep in seconds (dt). Returns a list of [dx, dy]
// values, one for each object in the list. Objects that are not colliding with anything will have
// [0, 0].
function getbounce(objs, dt) {
	profiler.start("getcollisions")
	let collisions = getcollisions(objs)
	profiler.stop("getcollisions")
	// Return value: each object starts at [0, 0].
	let ds = objs.map(_ => [0, 0])
	for (let k = 0 ; k < collisions.length ; ++k) {
		// Two objects are colliding, so give them a shift in opposite directions.
		let [i, j] = collisions[k]
		let [x0, y0, r0, m0] = objs[i]
		let [x1, y1, r1, m1] = objs[j]
		// [dx, dy] will be a vector in the direction from obj 0 to obj 1.
		let dx = x1 - x0, dy = y1 - y0
		if (dx == 0 && dy == 0) {
			let a = UFX.random.angle()
			dx = Math.sin(a)
			dy = Math.cos(a)
		}
		let d = Math.sqrt(dx * dx + dy * dy)
		let f = pushfactor(r0 + r1 - d)
		// Total shift amounts. These amounts will be divided between the two objects, based on
		// their relative masses.
		dx *= dt / d * f
		dy *= dt / d * f
		// Cap the shift amount at the size of the overlap of the two objects, so they don't push
		// apart too much in one frame.
		let da = Math.sqrt(dx * dx + dy * dy)
		if (d + da > 1.001 * (r0 + r1)) {
			let db = 1.001 * (r0 + r1) - d
			dx *= db / da
			dy *= db / da
		}
		// The fraction of the total shift that's assigned to each of the two objects. Should sum up
		// to 1.
		let f0, f1
		// As a special case, if one object has more than 100x the mass of the other, it's
		// considered immobile and the smaller object gets all of the shift.
		if (m1 > 100 * m0) [f0, f1] = [1, 0]
		else if (m0 > 100 * m1) [f0, f1] = [0, 1]
		// Otherwise assign so that the fraction of the shift is the fraction of the total mass that
		// the other object has.
		else [f0, f1] = [m1 / (m0 + m1), m0 / (m1 + m0)]
		ds[i][0] -= dx * f0
		ds[i][1] -= dy * f0
		ds[j][0] += dx * f1
		ds[j][1] += dy * f1
	}
	return ds
}

// Do the collisions! Pass in a list of objects that have a collidespec function that return the
// [x, y, r, m] values for that object, and a timestep in seconds (dt). This function will call
// obj.scootch(dx, dy) on each object with the corresponding amounts. (scootch is still called even
// if the object is not colliding.)
function adjust(objs, dt) {
	if (objs.length < 2) return
	profiler.start("adjust")
	let ds = getbounce(objs.map(obj => obj.collidespec()), dt)
	ds.forEach(function(d, j) {
		objs[j].scootch(d[0], d[1])
	})
	profiler.stop("adjust")
}

