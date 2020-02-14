"use strict";
/* exported ClippedQuadric */

class ClippedQuadric extends UniformProvider {
	constructor(id, ...programs) {
		super(`clippedQuadrics[${id}]`);
	
		this.addComponentsAndGatherUniforms(...programs);
	}

	makeUnitCylinder() {
		this.surface.set(1, 0, 0, 0,
						 0, 0, 0, 0,
						 0, 0, 1, 0,
						 0, 0, 0, -1);
		this.clipper.set(0, 0, 0, 0,
						 0, 1, 0, 0,
						 0, 0, 0, 0,
						 0, 0, 0, -1);
	}

	makeUnitSphere() {
		this.surface.set(1, 0, 0, 0,
						 0, 1, 0, 0,
						 0, 0, 1, 0,
						 0, 0, 0, -1);
		this.clipper.set(1, 0, 0, 0,
						 0, 0, 0, 0,
						 0, 0, 0, 0,
						 0, 0, 0, -1);
	}

	makeUnitCone() {
		this.surface.set(1, 0, 0, 0,
						 0, -1, 0, 0,
						 0, 0, 1, 0,
						 0, 0, 0, 0);
		this.clipper.set(0, 0, 0, 0,
						 0, 1, 0, -2,
						 0, 0, 0, 0,
						 0, 0, 0, 0);
	}

	makeInfiniteSurface() {
		this.surface.set(0, 0, 0, 0,
						 0, 1, 0, 0,
						 0, 0, 0, 0,
						 0, 0, 0, -1);
		this.clipper.set(0, 0, 0, 0,
						 0, 0, 0, 0,
						 0, 0, 0, 0,
						 0, 0, 0, 0);
	}

	transform(t) {
		var tempT = t.clone();
		tempT.invert(); // t is now T^-1
		this.surface.premul(tempT); // A is now T^-1 * A
		tempT.transpose(); // T is now T^-1T
		this.surface.mul(tempT); // A is now A'

		tempT = t.clone();
		tempT.invert();
		this.clipper.premul(tempT);
		tempT.transpose();
		this.clipper.mul(tempT);
	}
}