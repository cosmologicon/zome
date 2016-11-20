"use strict"

function Cell(spec) {
	this.start(spec)
	this.color = "#006666"
}
Cell.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, 20, 100000000)
	.addcomp(HasSlots, 7)
	.addcomp(Mouseable, 20)
	.addcomp(EjectsOnRightClick)
	.definemethod("think")

function Antibody(spec) {
	this.start(spec)
	this.color = "#006666"
}
Antibody.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, 1, 1)
	.addcomp(Kickable)
	.addcomp(HasSlots)
	.addcomp(ResizesWithSlots)
	.addcomp(Draggable)
	.addcomp(Mouseable)
	.addcomp(SplitsOnRightClick)
	.definemethod("think")

function Organelle(spec) {
	this.start(spec)
	this.color = "#660066"
}
Organelle.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, 6, 10)
	.addcomp(Kickable)
	.addcomp(Contained)
	.addcomp(ContainedDraggable)
	.addcomp(Mouseable, 6)
	.definemethod("think")

