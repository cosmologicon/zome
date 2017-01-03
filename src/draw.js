// Set up and invoke the shaders for the main gameplay scene.

// Reserved textures:

// TEXTURE0: reserved for gltext
// TEXTURE1-3: blob hill texture
// TEXTURE4: virus kscope texture
// TEXTURE5: mote texture


"use strict"

// Add the given values to the data array 6x, along with corresponding pU's.
function addpU(data, vals) {
	return data.concat(
		[-1, -1], vals, [1, -1], vals, [1, 1], vals,
		[-1, -1], vals, [1, 1], vals, [-1, 1], vals
	)
}
function builddata(objs, fvals) {
	let data = []
	objs.forEach(obj => data = addpU(data, fvals(obj)))
	data.nvert = 6 * objs.length
	return data
}


function drawscene() {
	gl.disable(gl.DEPTH_TEST)
	gl.enable(gl.BLEND)
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, 0, 1)

	gl.clearColor(0, 0.4, 0.4, 1)
	gl.clear(gl.COLOR_BUFFER_BIT)

	hud.drawback()

	// cell and state-bound antibodies
	let data = builddata(state.drawblobs(), obj => {
		const x = obj.x, y = obj.y, R = obj.rcollide * 1.8, T = obj.T, t0 = 0.1
		const ix = obj.impulsex, iy = obj.impulsey
		const [r, g, b] = obj.blobcolor
		return [x, y, R, r, g, b, ix, iy, t0, T]
	})
	if (data.length) {
		gl.progs.blob.use()
		gl.progs.blob.set({
			screensizeV: [view.wV, view.hV],
			scenterG: [view.xcenterG, view.ycenterG],
			VscaleG: view.VscaleG,
			hilltextures: [1, 2, 3],
			A: hill.A,
			Ad: hill.Ad,
		})
		hill.textures.forEach(function (texture, j) {
			gl.activeTexture(gl.TEXTURE1 + j)
			gl.bindTexture(gl.TEXTURE_2D, texture)
		})
		gl.makeArrayBuffer(data).bind()
		gl.progs.blob.assignAttribOffsets({
			pU: 0,
			centerG: 2,
			GradiusU: 4,
			color: 5,
			impulse: 8,
			t0: 10,
			T: 11,
		})
		gl.drawArrays(gl.TRIANGLES, 0, data.nvert)
	}

	// state-bound organelles
	data = builddata(state.organelles.concat(state.eggs, state.ecorpses), obj => {
		const [x, y] = obj.drawpos ? obj.drawpos() : [obj.x, obj.y], R = obj.rcollide
		const [r, g, b] = (obj instanceof Organelle ? settings.ocolors : settings.ecolors)[obj.flavor]
		const T = obj.T || 0
		const alpha = "alpha" in obj ? obj.alpha : 1
		return [x, y, R, r, g, b, T, alpha]
	})
	if (data.length) {
		gl.progs.organelle.use()
		gl.progs.organelle.set({
			scenterG: [view.xcenterG, view.ycenterG],
			screensizeV: [view.wV, view.hV],
			VscaleG: view.VscaleG,
		})
		gl.makeArrayBuffer(data).bind()
		gl.progs.organelle.assignAttribOffsets({
			pU: 0,
			centerG: 2,
			GradiusU: 4,
			color: 5,
			T: 8,
			alpha: 9,
		})
		gl.drawArrays(gl.TRIANGLES, 0, data.nvert)
	}

	// Non-boss viruses
	data = builddata(state.viruses, obj => {
		const x = obj.x, y = obj.y, R = obj.rcollide * 1.25, T = obj.T
		const [r, g, b] = obj.vcolor0
		return [x, y, R, r, g, b, T]
	})
	if (data.length) {
		gl.progs.virus.use()
		const ktexture = getkscopetexture(64)
		gl.activeTexture(gl.TEXTURE4)
		gl.bindTexture(gl.TEXTURE_2D, ktexture)
		gl.progs.virus.set({
			scenterG: [view.xcenterG, view.ycenterG],
			screensizeV: [view.wV, view.hV],
			VscaleG: view.VscaleG,
			ktexture: 4,
			alpha: 1,
		})
		gl.disableVertexAttribArray(gl.progs.virus.attribs.alpha)
		gl.makeArrayBuffer(data).bind()
		gl.progs.virus.assignAttribOffsets({
			pU: 0,
			centerG: 2,
			RG: 4,
			vcolor: 5,
			T: 8,
		}, {stride: 9})
		gl.drawArrays(gl.TRIANGLES, 0, data.nvert)
	}

	// DNA and RNA
	data = builddata(state.resources, obj => {
		const x = obj.x, y = obj.y, T = obj.T
		const [r, g, b] = obj.rcolor
		return [x, y, r, g, b, T]
	})
	if (data.length) {
		gl.progs.dna.use()
		gl.progs.dna.set({
			scenterG: [view.xcenterG, view.ycenterG],
			screensizeV: [view.wV, view.hV],
			VscaleG: view.VscaleG,
		})
		gl.makeArrayBuffer(data).bind()
		gl.progs.dna.assignAttribOffsets({
			pU: 0,
			centerG: 2,
			color: 4,
			T: 7,
		}, {stride: 8})
		gl.drawArrays(gl.TRIANGLES, 0, data.nvert)
	}

	// Bullets
	data = builddata(state.shots, obj => [obj.x, obj.y, obj.T])
	if (data.length) {
		gl.progs.bullet.use()
		gl.progs.bullet.set({
			scenterG: [view.xcenterG, view.ycenterG],
			screensizeV: [view.wV, view.hV],
			VscaleG: view.VscaleG,
		})
		gl.makeArrayBuffer(data).bind()
		gl.progs.bullet.assignAttribOffsets({
			pU: 0,
			centerG: 2,
			T: 4,
		}, {stride: 5})
		gl.drawArrays(gl.TRIANGLES, 0, data.nvert)
	}

	// lasers
	data = []
	function subdivide(x0, y0, x1, y1) {
		let dx = x1 - x0, dy = y1 - y0, d = Math.sqrt(dx * dx + dy * dy)
		if (d < 5) {
			data.push(x0, y0, x1, y1)
			return
		}
		let f = UFX.random.choice([1/phi, 1 - 1/phi])
		let x = x0 + dx * f + UFX.random(-0.3, 0.3) * d
		let y = y0 + dy * f + UFX.random(-0.3, 0.3) * d
		subdivide(x0, y0, x, y)
		subdivide(x, y, x1, y1)
	}
	state.lasers.forEach(function (obj) {
		subdivide(obj.x0, obj.y0, obj.x1, obj.y1)
	})
	if (data.length) {
		let width = 3 * view.VscaleG
		gl.lineWidth(Math.ceil(width))
		gl.progs.laser.use()
		gl.progs.laser.set({
			scenterG: [view.xcenterG, view.ycenterG],
			screensizeV: [view.wV, view.hV],
			VscaleG: view.VscaleG,
			alpha: width / Math.ceil(width),
		})
		gl.makeArrayBuffer(data).bind()
		gl.progs.laser.assignAttribOffsets({
			pG: 0,
		}, {stride: 2})
		gl.drawArrays(gl.LINES, 0, data.length / 2)
	}


	// Non-boss virus corpses
	data = builddata(state.vcorpses, obj => {
		const x = obj.x, y = obj.y, R = obj.rcollide * 1.25, T = obj.T
		const [r, g, b] = obj.vcolor0, alpha = obj.alpha
		return [x, y, R, r, g, b, T, alpha]
	})
	if (data.length) {
		gl.progs.virus.use()
		const ktexture = getkscopetexture(64)
		gl.activeTexture(gl.TEXTURE4)
		gl.bindTexture(gl.TEXTURE_2D, ktexture)
		gl.progs.virus.set({
			scenterG: [view.xcenterG, view.ycenterG],
			screensizeV: [view.wV, view.hV],
			VscaleG: view.VscaleG,
			ktexture: 4,
		})
		gl.makeArrayBuffer(data).bind()
		gl.progs.virus.assignAttribOffsets({
			pU: 0,
			centerG: 2,
			RG: 4,
			vcolor: 5,
			T: 8,
			alpha: 9,
		}, {stride: 10})
		gl.drawArrays(gl.TRIANGLES, 0, data.nvert)
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

	// Motes
	gl.progs.mote.use()
	const Nmote = 60
	const mtexture = getmotetexture()
	gl.activeTexture(gl.TEXTURE5)
	gl.bindTexture(gl.TEXTURE_2D, mtexture)
	getmotebuffer(Nmote).bind()
	gl.progs.mote.set({
		T: Date.now() * 0.001 / 80 % 1,
		offsetV: [view.VscaleG * view.xcenterG, view.VscaleG * view.ycenterG],
		screensizeV: [view.wV, view.hV],
		mtexture: 5,
	})
	gl.progs.mote.assignAttribOffsets({
		pU: 0,
		fR: 2,
		pos0: 3,
		Nmove: 5,
	})
	gl.drawArrays(gl.TRIANGLES, 0, 6 * Nmote)

}

// Draw a single antibody - you know, for cursors.
function drawantibody(obj) {
	// TODO: can make some of these constant attributes
	let data = builddata([obj], obj => {
		const x = obj.x, y = obj.y, R = obj.rcollide * 1.8, T = obj.T, t0 = 0.1
		const ix = obj.impulsex, iy = obj.impulsey
		const [r, g, b] = obj.blobcolor
		return [x, y, R, r, g, b, ix, iy, t0, T]
	})
	gl.progs.blob.use()
	gl.progs.blob.set({
		screensizeV: [view.wV, view.hV],
		scenterG: [view.xcenterG, view.ycenterG],
		VscaleG: view.VscaleG,
		hilltextures: [1, 2, 3],
		A: hill.A,
		Ad: hill.Ad,
	})
	hill.textures.forEach(function (texture, j) {
		gl.activeTexture(gl.TEXTURE1 + j)
		gl.bindTexture(gl.TEXTURE_2D, texture)
	})
	gl.makeArrayBuffer(data).bind()
	gl.progs.blob.assignAttribOffsets({
		pU: 0,
		centerG: 2,
		GradiusU: 4,
		color: 5,
		impulse: 8,
		t0: 10,
		T: 11,
	})
	gl.drawArrays(gl.TRIANGLES, 0, data.nvert)


	// state-bound organelles
	data = builddata(obj.slots, obj => {
		const [x, y] = obj.drawpos ? obj.drawpos() : [obj.x, obj.y], R = obj.rcollide
		const [r, g, b] = (obj instanceof Organelle ? settings.ocolors : settings.ecolors)[obj.flavor]
		const T = obj.T || 0
		const alpha = 1
		return [x, y, R, r, g, b, T, alpha]
	})
	if (data.length) {
		gl.progs.organelle.use()
		gl.progs.organelle.set({
			scenterG: [view.xcenterG, view.ycenterG],
			screensizeV: [view.wV, view.hV],
			VscaleG: view.VscaleG,
		})
		gl.makeArrayBuffer(data).bind()
		gl.progs.organelle.assignAttribOffsets({
			pU: 0,
			centerG: 2,
			GradiusU: 4,
			color: 5,
			T: 8,
			alpha: 9,
		})
		gl.drawArrays(gl.TRIANGLES, 0, data.nvert)
	}
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

let motetexture = null
function getmotetexture() {
	if (motetexture) return motetexture
	const s = 128
	const img = document.createElement("canvas")
	img.width = s
	img.height = s
	const context = img.getContext("2d")
	const idata = context.createImageData(s, s)
	for (let py = 0, j = 0 ; py < s ; ++py) {
		let y = (py + 0.5) / s * 2 - 1
		for (let px = 0 ; px < s ; ++px) {
			let x = (px + 0.5) / s * 2 - 1
			let a = 0.06 * (1 - ease(Math.sqrt(x * x + y * y))) - UFX.random(0.03)
			idata.data[j++] = 0
			idata.data[j++] = 0
			idata.data[j++] = 0
			idata.data[j++] = 255 * a
		}
	}
	context.putImageData(idata, 0, 0)
	motetexture = gl.buildTexture({ source: img, filter: gl.NEAREST })
	return motetexture
}

const motebuffer = {}
function getmotebuffer(n) {
	let N = 2
	while (N < n) N <<= 1
	if (motebuffer[N]) return motebuffer[N]
	const data = []
	for (let j = 0 ; j < N ; ++j) {
		const s = UFX.random(1, 2)
		const x0 = UFX.random(), y0 = UFX.random()
		const Nx = UFX.random.choice([-1, 1]) * UFX.random.rand(5, 15)
		const Ny = UFX.random.choice([-1, 1]) * UFX.random.rand(5, 15)
		data.push(
			-1, -1, s, x0, y0, Nx, Ny,
			-1, 1, s, x0, y0, Nx, Ny,
			1, 1, s, x0, y0, Nx, Ny,
			-1, -1, s, x0, y0, Nx, Ny,
			1, 1, s, x0, y0, Nx, Ny,
			1, -1, s, x0, y0, Nx, Ny
		)
	}
	const buffer = gl.makeArrayBuffer(data)
	motebuffer[N] = buffer
	return buffer
}





