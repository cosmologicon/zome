"use strict"

function Cell(spec) {
	this.start(spec)
	this.color = "#006666"
	this.blobcolor = [0.0, 0.4, 0.4]
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
	.addcomp(Disableable)
	.addcomp(Draggable)
	.addcomp(Mouseable)
	.addcomp(SplitsOnRightClick)
	.addcomp(FollowsRecipe)

function Organelle(spec) {
	this.start(spec)
	this.flavor = spec.flavor
	this.color = { X: "#AA4400", Y: "#990099", Z: "#999900" }[this.flavor]
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

function RNA(spec) {
	this.start(spec)
	this.color = "#AA0000"
	this.rcollide = 2
}
RNA.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(Lifetime, 100)
	.addcomp(WorldBound)
	.addcomp(Kickable)
	.addcomp(Mouseable, 24)
	.addcomp(TargetsThing, 300)
	.addcomp(CollectsOnHover)
	.addcomp(DiesOnArrival)
	.addcomp(ResourcesOnArrival, 1, 0)

function DNA(spec) {
	this.start(spec)
	this.color = "#FF7700"
	this.rcollide = 2
}
DNA.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(Lifetime, 100)
	.addcomp(WorldBound)
	.addcomp(Kickable)
	.addcomp(Mouseable, 24)
	.addcomp(TargetsThing, 300)
	.addcomp(CollectsOnHover)
	.addcomp(DiesOnArrival)
	.addcomp(ResourcesOnArrival, 0, 1)

