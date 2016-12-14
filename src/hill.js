// Manage the hill textures. These are textures that contain the data used in the blob shader.
// Each hill texture contains a scalar-valued function z(x, y) in its b channel, and the components
// of grad(z) in its r and g channels.

// They're called hill textures because the function is a sum of 2-D Gaussians that look like hills.

"use strict"

const hill = {
	range: function (N, a0, a1) {
		return new Array(N).fill(0).map((_, j) => (j + 0.5) / N * (a1 - a0) + a0)
	},
	joinxys: function (xys) {
		const N = xys.length, Nx = xys[0][0].length, Ny = xys[0][1].length
		let data = new Array(Nx * Ny).fill(0).map(_ => [0, 0, 0])
		for (let k = 0 ; k < N ; ++k) {
			const xs = xys[k][0], ys = xys[k][1]
			for (let j = 0, a = 0 ; j < Ny ; ++j) {
				const [y, dy] = ys[j]
				for (let i = 0 ; i < Nx ; ++i) {
					const [x, dx] = xs[i]
					let d = data[a++]
					d[0] += x * y
					d[1] += dx * y
					d[2] += x * dy
				}
			}
		}
		return data
	},
	hillxys: function (Nx, Ny, h, x0, y0, r) {
		function hdh(a, h) {
			const e = h * Math.exp(-a * a)
			return [e, -2 * a * e / r]
		}
		return [
			this.range(Nx, (-1 - x0) / r, (1 - x0) / r).map(a => hdh(a, h)),
			this.range(Ny, (-1 - y0) / r, (1 - y0) / r).map(a => hdh(a, 1)),
		]
	},
	isohilldata: function (Nx, Ny, R, ktheta) {
		const theta = ktheta * tau * 0.618034
		const r = 0.16, A = 6 * Math.exp(-4 * R)
		return this.hillxys(Nx, Ny, A, R * Math.cos(theta), R * Math.sin(theta), r)
	},

	h0data: function (Nx, Ny) {
		return this.joinxys([
			this.hillxys(Nx, Ny, 2, 0, 0, 0.3),
		])
	},
	h1data: function (Nx, Ny) {
		return this.joinxys([0,1,2,3,4,5].map(j => this.isohilldata(Nx, Ny, 0.3 + 0.02 * j, j)))
	},
	h2data: function (Nx, Ny) {
		return this.joinxys([0,1,2].map(j => this.isohilldata(Nx, Ny, 0.4 + 0.01 * j, j)))
	},

	gethillimg: function (hdata, s) {
		const adata = hdata.call(this, s, s)
		let zmax = adata.map(a => a[0]).reduce((a, b) => Math.max(a, b))
		let dzdxmax = adata.map(a => a[1]).reduce((a, b) => Math.max(a, b))
		let dzdymax = adata.map(a => a[2]).reduce((a, b) => Math.max(a, b))
		let dzmax = Math.max(dzdxmax, dzdymax)
		const img = document.createElement("canvas")
		img.width = s
		img.height = s
		const context = img.getContext("2d")
		const idata = context.createImageData(s, s)
		for (let i = 0, j = 0 ; i < adata.length ; ++i) {
			let [z, dzdx, dzdy] = adata[i]
			idata.data[j++] = 255 * (dzdx / dzmax + 1) / 2
			idata.data[j++] = 255 * (dzdy / dzmax + 1) / 2
			idata.data[j++] = 255 * z / zmax
			idata.data[j++] = 255
		}
		context.putImageData(idata, 0, 0)
		return [img, zmax, dzmax]
	},

	imgs: null,
	// Can be called before the GL context is initalized - will do most of the setup work.
	initdata: function () {
		let z0 = 0.3
		this.imgs = []
		this.A = [-z0]
		this.Ad = []
		;[this.h0data, this.h1data, this.h2data].forEach((hdata, j) => {
			let [img, zmax, dzmax] = this.gethillimg(hdata, 64)
			this.A.push(zmax)
			this.Ad.push(dzmax)
			this.imgs.push(img)
		})
	},
	// Call once the GL context is set.
	init: function () {
		if (!this.imgs) this.initdata()
		this.textures = this.imgs.map(img =>
			gl.buildTexture({
				source: img,
				wrap: gl.CLAMP_TO_EDGE,
				filter: gl.LINEAR,
			})
		)
		this.textures.forEach(function (texture, j) {
			gl.activeTexture(gl.TEXTURE1 + j)
			gl.bindTexture(gl.TEXTURE_2D, texture)
		})
	},
}
