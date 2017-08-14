"use strict"

function Cell(spec) {
	this.start(spec)
	this.color = "#006666"
	this.blobcolor = [0.0, 0.4, 0.4]
	this.nslots = progress.nslots
	this.think(0)
}
Cell.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, 20, 100000000)
	.addcomp(Impulsed)
	.addcomp(HasSlots, 3)
	.addcomp(Mouseable, 20)
	.addcomp(EjectsOnRightClick)
	.addcomp(AnimationTicker, 50)

function Antibody(spec) {
	this.start(spec)
	this.color = "#006666"
	this.think(0)
}
Antibody.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, 1, 1)
	.addcomp(Kickable)
	.addcomp(Impulsed)
	.addcomp(HasSlots)
	.addcomp(FitsRecipe)
	.addcomp(ResizesWithSlots)
	.addcomp(Disableable)
	.addcomp(Draggable)
	.addcomp(DraggableProgress)
	.addcomp(Mouseable)
	.addcomp(SplitsOnRightClick)
	.addcomp(FollowsRecipe)
	.addcomp(AnimationTicker, 50)

function Organelle(spec) {
	this.start(spec)
	this.flavor = spec.flavor
	this.color = { X: "#AA4400", Y: "#990099", Z: "#999900" }[this.flavor]
	this.think(0)
}
Organelle.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(WorldBound)
	.addcomp(Collideable, 6, 10)
	.addcomp(Kickable)
	.addcomp(Contained)
	.addcomp(ContainedDraggable)
	.addcomp(Mouseable, 6)
	.addcomp(Jitters, 10)

function Egg(spec) {
	this.start(spec)
	this.flavor = spec.flavor
	this.color = "brown"
	this.lifetime = mechanics.hatchtime[this.flavor]
	this.think(0)
}
Egg.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(Lifetime)
	.addcomp(WorldBound)
	.addcomp(Hatches)
	.addcomp(Collideable, 8, 30)
	.addcomp(Contained)
	.addcomp(Jitters, 10)
	.addcomp(AnimationTicker, 10)

function EggCorpse(obj) {
	this.rcollide0 = obj.rcollide
	this.T = obj.T
	this.start({ x: obj.x, y: obj.y })
	this.flavor = obj.flavor
	this.think(0)
}
EggCorpse.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(Lifetime, 0.5)
	.addcomp(FadesOut)
	.addcomp(Expands, 3)
	.addcomp(WorldBound)

function RNA(spec) {
	this.start(spec)
	this.color = "#AA0000"
	this.rcolor = [0.4, 0.4, 1.0]
	this.rcollide = 2
	this.think(0)
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
	.addcomp(AnimationTicker, 20)

function DNA(spec) {
	this.start(spec)
	this.color = "#FF7700"
	this.rcolor = [1.0, 0.0, 1.0]
	this.rcollide = 2
	this.think(0)
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
	.addcomp(AnimationTicker, 20)

function TutorialLabel(text, obj) {
	this.text = text
	this.obj = obj
	this.start({})
	this.alpha = 1
}
TutorialLabel.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(Lifetime, 10000000)
//	.addcomp(FadesInAndOut, 0.3)
	.addcomp(LabelsThing)

