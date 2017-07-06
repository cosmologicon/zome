// Manage the hill textures. These are textures that contain the data used in the blob shader.
// Each hill texture contains a scalar-valued function z(x, y) in its b channel, and the components
// of grad(z) in its r and g channels.

// Within the blob shader, the textures will be rotated and scaled, then their z-values will be
// added together. The total z will be used to make the shape of the blob. The gradient of the
// transformed, summed value will also be computed and used for shading and outline effects.

// Texture targets TEXTURE1, TEXTURE2, and TEXTURE3 should be reserved for the hill textures, which
// will remain permanently bound to those targets.

// They're called hill textures because the function is a sum of 2-D Gaussians that look like hills.

"use strict"

const hill = {
	// Array of N values between a0 and a1. The values are centered in the range and spaced
	// (a1 - a0) / N apart.
	range: function (N, a0, a1) {
		return new Array(N).fill(0).map((_, j) => (j + 0.5) / N * (a1 - a0) + a0)
	},

	// A gaussian function G(x, y) is separable into G(x, y) = X(x) Y(y). As an optimization, we
	// precompute X(x) and Y(y), along with their first derivatives dX/dx and dY/dy, for each pixel
	// in the texture.

	// Combine a list of gaussian precomputations into a data array containing the sum of the
	// gaussians, along with the gradient of this sum, at each point in the corresponding grid.
	// The input is an Array of length-2 Arrays, of the form [[XdX0s, YdY0s], [XdX1s, YdY1s], ... ].
	// XdX0s is an Array containing the values of [X0(x), dX0/dx(0)] for each x in the grid.
	// The output is a data Array consisting of a length-3 Array for each pixel in the grid. Each
	// length-3 Array contains the sum of the gaussians at that pixel, and the two components of
	// this sum's gradient.
	joinXYs: function (XYs) {
		const N = XYs.length, Nx = XYs[0][0].length, Ny = XYs[0][1].length
		let data = new Array(Nx * Ny).fill(0).map(_ => [0, 0, 0])
		for (let k = 0 ; k < N ; ++k) {
			const [Xs, Ys] = XYs[k]
			for (let j = 0, a = 0 ; j < Ny ; ++j) {
				const [Y, dYdy] = Ys[j]
				for (let i = 0 ; i < Nx ; ++i) {
					const [X, dXdx] = Xs[i]
					let d = data[a++]
					d[0] += X * Y     // G(x, y) = X(x) Y(y)
					d[1] += dXdx * Y  // dG/dx(x, y) = dX/dx(x) Y(y)
					d[2] += X * dYdy  // dG/dy(x, y) = X(x) dY/dy(y)
				}
			}
		}
		return data
	},
	// Generate [XdXs, YdYs], defined the same as in joinXYs, for the specified gaussian over the
	// range [-1, 1] for both x and y. Arguments are:
	//   Nx: number of x-values to generate.
	//   Ny: number of y-values to generate.
	//   h: maximum height of the gaussian.
	//   (x0, y0): peak center
	//   r: scale factor of the gaussian (radius, in a sense)
	hillXYs: function (Nx, Ny, h, x0, y0, r) {
		// X(x) = exp(-((x-x0)/r)^2)
		// dX/dx(x) = -2(x-x0)/r^2 X(x)
		// Similarly with y.

		// Define a as (x - x0) / r. This function returns X(a) and dX/dx(a) (or similarly with y).
		// Note that dX/dx = dX/da da/dx = 1/r dX/da.
		function hdh(a, h) {
			const e = h * Math.exp(-a * a)
			return [e, -2 * a * e / r]
		}
		return [
			// In order to scale the whole thing by h, we multiply the X's (but not the Y's) by a
			// factor of h.
			this.range(Nx, (-1 - x0) / r, (1 - x0) / r).map(a => hdh(a, h)),
			this.range(Ny, (-1 - y0) / r, (1 - y0) / r).map(a => hdh(a, 1)),
		]
	},
	// XY data for an "isohill". This is a hill whose height decreases depending on its distance
	// from the center, and which is laid out at some multiple of tau x phi radians. This gives us a
	// roughly even distribution of hills around the edge of the blob, with smaller features further
	// out.
	// [Nx, Ny] is the grid size. R is the distance from the center for this hill and ktheta is an
	// integer indicating its angular position.
	isohilldata: function (Nx, Ny, R, ktheta) {
		const theta = ktheta * tau * 0.618034
		const r = 0.16, A = 6 * Math.exp(-4 * R)
		return this.hillXYs(Nx, Ny, A, R * Math.cos(theta), R * Math.sin(theta), r)
	},

	// Data for hill texture 0. This is just a single large gaussian in the center that gives the
	// blob its overall shape. This texture will not undergo any rotation or stretching.
	h0data: function (Nx, Ny) {
		return this.joinXYs([
			this.hillXYs(Nx, Ny, 2, 0, 0, 0.3),
		])
	},
	// Data for hill textures 1 and 2. These are each a set of smaller features around the edge of
	// the blob.
	h1data: function (Nx, Ny) {
		return this.joinXYs([0,1,2,3,4,5].map(j => this.isohilldata(Nx, Ny, 0.3 + 0.02 * j, j)))
	},
	h2data: function (Nx, Ny) {
		return this.joinXYs([0,1,2].map(j => this.isohilldata(Nx, Ny, 0.4 + 0.01 * j, j)))
	},

	// Create the hill image (on a HTML5 canvas) to be loaded into the texture. The r channel is the
	// value of z at each point in the texture, scaled such that the channel range [0, 1]
	// corresponds to z-values of [0, zmax]. The g and b channels contain the value of dz/dx and
	// dz/dy, scaled such that the channel range [0, 1] corresponds to [-dzmax, +dzmax]. The values
	// of zmax and dzmax are automatically computed and returned along with the image itself.
	// Arguments are hdata, a callback that returns the hill data, and s, the desired size of the
	// image in pixels.
	gethillimg: function (hdata, s) {
		const adata = hdata.call(this, s, s)
		let zmax = adata.map(a => a[0]).reduce((a, b) => Math.max(a, b))
		// TODO: shouldn't I also check for the min value?
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
		// Value of z = G(x,y) corresponding to the edge of the blob. Anything with z > z0 is
		// considered to be inside the blob.
		let z0 = 0.3
		// Array of 3 images to be loaded into the hill textures.
		this.imgs = []
		// Scale factors for each of the 3 hill textures. At any given point:
		// z = A[0] + A[1] * t0.z + A[2] * t1.z + A[3] * t2.z
		// dz/dx = Ad[0] * t0.x + Ad[1] * t1.x + Ad[2] * t2.x (and similarly for dz/dy).
		// Here t0.rgb is the color in hill texture 0, and simliarly for t1 and t2.
		// Color values are in the range [0, 1].
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
	// Loads the images into textures, and bind them to the corresponding texture targets.
	init: function () {
		if (!this.imgs) this.initdata()
		this.textures = this.imgs.map(img =>
			gl.buildTexture({
				source: img,
				wrap: gl.CLAMP_TO_EDGE,
				// Linear is preferable to mipmapping here. Having the gradient available lets us do
				// subpixel aliasing in the shader, so a mipmap would just make things fuzzier.
				filter: gl.LINEAR,
			})
		)
		this.textures.forEach(function (texture, j) {
			gl.activeTexture(gl.TEXTURE1 + j)
			gl.bindTexture(gl.TEXTURE_2D, texture)
		})
	},
}
