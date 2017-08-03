let tracers = {
	init: function () {
		let font = "Irish Grover"
		let lines = [
			{ h: 60, x: 0, y: -58, text: "The Laboratory of", },
			{ h: 140, x: -186, y: 25, text: "Dr", },
			{ h: 140, x: 94, y: 25, text: "Zome", },
			{ h: 140, x: -111, y: 25, text: ".", },
		]
		if (settings.subtitle) {
			lines.push({ h: 50, x: 90, y: 105, text: settings.subtitle })
		}
		lines.forEach(line => {
			line.text = line.text.replace(/ /g, "~")
			line.font = "font " + line.h + "px~'" + font.replace(/ /g, "~") + "'"
			line.fill = UFX.draw.lingrad(0, -line.h/5, 0, line.h/2, 0, "yellow", 1, "#F84")
		})
		function wid(w0, h) {
			return w0 * Math.pow(h / 140, 0.4)
		}
		let ymax = settings.subtitle ? 155 : 110
		this.title = UFX.gltracer(gl, [-300, -100, 300, ymax], (context, scale) => {
			context.lineJoin = "round"
			UFX.draw(context, "tab center middle")

			lines.forEach(line => UFX.draw(context,
				"[ ss", "#222", "lw", wid(35, line.h), "sh", "#222", 0, 9 * scale, 4 * scale,
				"t", line.x, line.y, line.font, "st0", line.text, "]"
			))

			lines.forEach(line => UFX.draw(context,
				"ss #fff lw", wid(22, line.h),
				"[ t", line.x, line.y, line.font, "st0", line.text, "]",
				"ss #fff lw", wid(16, line.h),
				"[ t", line.x, line.y, line.font, "st0", line.text, "]"
			))

			lines.forEach(line => UFX.draw(context,
				"ss", "#840", "lw", wid(8, line.h),
				"[ t", line.x, line.y, line.font, "st0", line.text, "]"
			))

			lines.forEach(line => UFX.draw(context,
				"[ fs", line.fill, "t", line.x, line.y, line.font, "ft0", line.text, "]"
			))

		}, {debug: false, pot: true})
	},

}
