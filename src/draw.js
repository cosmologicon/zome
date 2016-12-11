// Set up and invoke the shaders for the main gameplay scene.

// Reserved textures:

// TEXTURE0: reserved for gltext
// TEXTURE1: virus kscope texture


"use strict"

function drawscene() {
	gl.disable(gl.DEPTH_TEST)
	gl.enable(gl.BLEND)
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, 0, 1)

	gl.clearColor(0, 0.4, 0.4, 1)
	gl.clear(gl.COLOR_BUFFER_BIT)

	// Non-boss viruses
	let data = [], objs = state.viruses
	objs.forEach(function (obj) {
		const x = obj.x, y = obj.y, R = obj.rcollide * 1.25, T = obj.T
		const [r, g, b] = obj.vcolor0
		data.push(
			T, -1, -1, x, y, R, r, g, b,
			T, -1, 1, x, y, R, r, g, b,
			T, 1, 1, x, y, R, r, g, b,
			T, -1, -1, x, y, R, r, g, b,
			T, 1, 1, x, y, R, r, g, b,
			T, 1, -1, x, y, R, r, g, b
		)
		
	})
	if (data.length) {
		gl.progs.virus.use()
		const ktexture = getkscopetexture(64)
		gl.activeTexture(gl.TEXTURE1)
		gl.bindTexture(gl.TEXTURE_2D, ktexture)
		gl.progs.virus.set({
			scenterG: [view.xcenterG, view.ycenterG],
			screensizeV: [view.wV, view.hV],
			VscaleG: view.VscaleG,
			ktexture: 1,
		})
		gl.makeArrayBuffer(data).bind()
		gl.progs.virus.assignAttribOffsets({
			T: 0,
			pU: 1,
			centerG: 3,
			RG: 5,
			vcolor: 6,
		})
		gl.drawArrays(gl.TRIANGLES, 0, 6*objs.length)
	}


	// cell and state-bound antibodies
	gl.progs.circle.use()
	data = [], objs = state.drawblobs()
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
		const [x, y] = obj.drawpos()
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

const kscopetextures = {}
function getkscopetexture(s) {
	if (kscopetextures[s]) return kscopetextures[s]
	const colors = ["#666", "#AAA", "white"]
	const kimg = document.createElement("canvas")
	kimg.width = kimg.height = s
	const kcontext = kimg.getContext("2d")
	for (var i = 0 ; i < 10 * s ; ++i) {
		UFX.draw(kcontext, "lw", UFX.random(1, 3),
			"ss", UFX.random.choice(colors),
			"b o", UFX.random(0, s), UFX.random(0, s), UFX.random(s / 4),
			"s"
		)
	}
	const ktexture = gl.buildTexture({ source: kimg })
	kscopetextures[s] = ktexture
	return ktexture
}


