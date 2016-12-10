// Set up and invoke the shaders for the main gameplay scene.

"use strict"

function drawscene() {
	gl.disable(gl.DEPTH_TEST)
	gl.enable(gl.BLEND)
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, 0, 1)

	gl.clearColor(0, 0.4, 0.4, 1)
	gl.clear(gl.COLOR_BUFFER_BIT)

	// cell and state-bound antibodies
	gl.progs.circle.use()
	let data = [], objs = state.drawblobs()
	objs.forEach(function (obj) {
		const x = obj.x, y = obj.y, R = obj.rcollide
		const [r, g, b] = obj.blobcolor
		data.push(
			-1, -1, x, y, R, r, g, b,
			-1, 1, x, y, R, r, g, b,
			1, 1, x, y, R, r, g, b,
			-1, -1, x, y, R, r, g, b,
			1, 1, x, y, R, r, g, b,
			1, -1, x, y, R, r, g, b
		)
	})
	if (data.length) {
		gl.progs.circle.set({
			scenterG: [view.xcenterG, view.ycenterG],
			screensizeV: [view.wV, view.hV],
			VscaleG: view.VscaleG,
		})
		gl.makeArrayBuffer(data).bind()
		gl.progs.circle.assignAttribOffsets({
			pU: 0,
			centerG: 2,
			RG: 4,
			color: 5,
		})
		gl.drawArrays(gl.TRIANGLES, 0, 6*objs.length)
	}

	// state-bound organelles
	gl.progs.organelle.use()
	let N = state.organelles.length
	data = []
	state.organelles.forEach(function (obj) {
		const x = obj.x, y = obj.y
		const [r, g, b] = settings.ocolors[obj.flavor]
		data.push(
			-1, -1, x, y, r, g, b,
			-1, 1, x, y, r, g, b,
			1, 1, x, y, r, g, b,
			-1, -1, x, y, r, g, b,
			1, 1, x, y, r, g, b,
			1, -1, x, y, r, g, b
		)
	})
	if (data.length) {
		gl.progs.organelle.set({
			scenterG: [view.xcenterG, view.ycenterG],
			screensizeV: [view.wV, view.hV],
			VscaleG: view.VscaleG,
		})
		gl.makeArrayBuffer(data).bind()
		gl.progs.organelle.assignAttribOffsets({
			pU: 0,
			centerG: 2,
			color: 4,
		})
		gl.drawArrays(gl.TRIANGLES, 0, 6*N)
	}

	// Petri dish
	gl.progs.petri.use()
	gl.progs.petri.set({
		scenterG: [view.xcenterG, view.ycenterG],
		screensizeV: [view.wV, view.hV],
		VscaleG: view.VscaleG,
		Rlevel: state.Rlevel,
	})
	pUbuffer.bind()
	gl.progs.petri.assignAttribOffsets({ pU: 0 })
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)

}
