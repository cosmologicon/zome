// Control module
// Handles the in-game cursor state, i.e. the game object that's being pointed to and dragged, if
// any.

"use strict"

var control = {
	reset: function () {
		// Any kind of interactable object that is part of the game state and which the mouse is
		// currently hovering over.
		this.pointed = null
		// A draggable object (antibody) that is currently being moved by the player and not part of
		// the game state.
		this.cursor = null
		// While the viewport is being dragged, the game position of the drag point.
		this.cursorpos = null
		// Game coordinates of current pointer
		this.pos = [0, 0]
	},

	getpointed: function (objs) {
		var p = null, d2min = 0, pos = this.pos
		objs.forEach(function (obj) {
			if (obj.within(pos)) {
				var dx = pos[0] - obj.x, dy = pos[1] - obj.y
				var d2 = dx * dx + dy * dy
				if (!p || (obj.draggable && !p.draggable) || d2 < d2min) {
					p = obj
					d2min = d2
				}
			}
		})
		return p
	},

	hoverall: function (objs) {
		var pos = this.pos
		objs.forEach(function (obj) {
			if (obj.within(pos)) obj.onhover()
		})
	},
}

control.reset()

