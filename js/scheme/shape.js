class shapeScheme {
	shapeList = [];
	size = DEFAULT_SIZE;
	generatedNum = 0;
	sizeRand = DEFAULT_SIZERAND;
	maxW = 500;
	maxH = 500;
	iconSize = 32;
	iconColor = 'rgb(0,0,0)';
	positions = [];

	#scaleFactor = 1;
	#shape = [];
	#isChanged = true;
	#isStroke = false;
	#stroke = 0;
	#rotateOnAxis = true;
	#randomizeScale = false;
	#isScaleChanged = false;

	#baseRotation = 0;
	#baseOffsetX = 0;
	#baseOffsetY = 0;

	// Adds a selected shapes from the form to the list of
	// 'active' shapes to use.
	addShape(type) {
		this.shapeList.push(type);
	};

	// Resets the 'active' shapes list
	resetShapeList() {
		this.generatedNum = 0;
		this.shapeList = [];
	};

	static #SHAPE_RENDERERS = {
		circle: function(ctx, size, scale, isOnAxis) {
			const x = size * (scale + 0.5);
			const x2 = x / 2;
			ctx.beginPath();
			// isOnAxis && ctx.translate(size / -2, size / -2);

			ctx.beginPath();
			if (isOnAxis) {
				ctx.arc(0, 0, x, Math.PI * 2, 0, true);
			} else {
				ctx.arc(x / 2, x / 2, x, Math.PI * 2, 0, true);
			}
		},
		righttriangle: function(ctx, size) {
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(0, size);
			ctx.lineTo(size, size);
			ctx.closePath();
		},
		equitriangle: function(ctx, size, scale, isOnAxis) {
			const x = size * (scale + 0.5);
			const s2 = x / 2;
			const h = (Math.sqrt(3) / 2) * x;

			ctx.beginPath();
			isOnAxis && ctx.translate(size / -2, size / -2);

			ctx.moveTo(0, 0);
			ctx.lineTo(0, x);
			ctx.lineTo(x, s2);
			ctx.lineTo(0, 0);
			ctx.closePath();
		},
		leaf: function(ctx, size) {
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.arc(0, size, size, 3 * Math.PI / 2, 0, false);
			ctx.arc(size, 0, size, Math.PI / 2, Math.PI, false);
			ctx.closePath();
		},
		halfleaf: function(ctx, size) {
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(size, size);
			ctx.arc(size, 0, size, Math.PI / 2, Math.PI, false);
			ctx.closePath();
		},
		quartercircle: function(ctx, size) {
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(0, size);
			ctx.arc(0, size, size, 0, 3 * Math.PI / 2, true);
			ctx.closePath();
		},
		halfcircle: function(ctx, size) {
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.arc(size / 2, 0, size / 2, Math.PI, 2 * Math.PI, true);
			ctx.closePath();
		},
		arc: function(ctx, size, scale) {
			ctx.beginPath();
			// ctx.moveTo(0, size / 2);
			const c = size * (scale + 1);
			ctx.arc(0, 0, c, Math.PI / 2, 0, true);
			ctx.lineTo(c - (size / 2), 0);
			ctx.arc(0, 0, c - (size / 2), 0, Math.PI / 2, false);
			ctx.closePath();
		},
		square: function(ctx, size, scale, isOnAxis) {
			const x = size * (scale + 0.5);
			ctx.beginPath();
			isOnAxis && ctx.translate(x / -2, x / -2);

			ctx.moveTo(0, 0);
			ctx.lineTo(0, x);
			ctx.lineTo(x, x);
			ctx.lineTo(x, 0);
			ctx.closePath();
		},
		
		trapezoid: function(ctx, size) {
			ctx.beginPath();
			ctx.moveTo(0, size / 2);
			ctx.lineTo(0, size);
			ctx.lineTo(size, 0);
			ctx.lineTo(size / 2, 0);
			ctx.closePath();
		},
		rectangle: function(ctx, size) {
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(0, size * 2);
			ctx.lineTo(size, size * 2);
			ctx.lineTo(size, 0);
			ctx.closePath();
		},

		roundedrect: function(ctx, size, scale, isOnAxis) {
			const s2 = size / 2;
			const x = size * (scale + 0.5);

			ctx.beginPath();
			isOnAxis && ctx.translate(s2 * -1, (x + s2) / -2);

			ctx.moveTo(0, s2);
			ctx.lineTo(0, x);
			ctx.arc(s2, x, s2, Math.PI, 0, true);
			ctx.lineTo(size, s2);
			ctx.arc(s2, s2, s2, 0, Math.PI, true);
			ctx.closePath();
		},

		dogbone: function(ctx, size, scale) {
			ctx.beginPath();
			const s4 = size / 4;
			ctx.arc(s4, s4, s4,  Math.PI / 2, 0, true);
			ctx.arc(s4 * 3, s4, s4, Math.PI, Math.PI / 2, false);
			ctx.arc(s4 * 3, s4 * 3, s4, (3 * Math.PI) / 2, Math.PI, true);
			ctx.arc(s4, s4 * 3, s4, 0, (3* Math.PI) / 2, false);
			ctx.closePath();
		},

		swirl: function(ctx, size, scale) {
			ctx.beginPath();
			const s4 = size / 4;
			const s2 = size / 2;
			const pi32 = 3 * Math.PI / 2;
			const pi12 = Math.PI / 2;
			ctx.arc(0, 0, size, pi32, pi12, true);
			ctx.arc(0, s4 * -2, s2, pi32, pi12, false);
			ctx.arc(0, s4 * 2, s2, pi12, pi32, false);
			ctx.closePath();
		},

		noop: function(ctx, size, scale) {
			ctx.beginPath();
			ctx.closePath();
		}
	};


	set shape(_) {
		this.#shape.length = 0;
		if (typeof _ === 'object') {
			this.#shape.push(..._);
		} else {
			this.#shape.push(_);
		}
		this.#isChanged = true;
	}

	set scale(_) {
		this.#scaleFactor = _;
		this.#isScaleChanged = true;
		this.#isChanged = true;
	}

	set isChanged(_) {
		this.#isChanged = _;
	}

	set isScaleChanged(_) {
		this.#isScaleChanged = _;
	}

	set isStroke(_) {
		this.#isStroke = _;
		this.#isChanged = true;
	}

	set stroke(_) {
		this.#stroke = _;
		this.#isChanged = true;
	}

	set rotateOnAxis(_) {
		this.#rotateOnAxis = _;
		this.#isChanged = true;
	}

	set randomizeScale(_) {
		this.#randomizeScale = _;
		this.#isScaleChanged = true;
	}

	set baseRotation(_) {
		this.#baseRotation = _;
		this.#isChanged = true;
	}

	set baseOffsetX(_) {
		this.#baseOffsetX = _;
		this.#isChanged = true;
	}

	set baseOffsetY(_) {
		this.#baseOffsetY = _;
		this.#isChanged = true;
	}

	get shape() {
		return this.#shape.randomEntry();
	}

	get scale() {
		return this.#scaleFactor;
	}

	get isChanged() {
		return this.#isChanged;
	}

	get isScaleChanged() {
		return this.#isScaleChanged;
	}

	get isStroke() {
		return this.#isStroke;
	}
	
	get stroke() {
		return this.#stroke;
	}

	get rotateOnAxis() {
		return this.#rotateOnAxis;
	}

	get randomizeScale() {
		return this.#randomizeScale;
	}

	get baseRotation() {
		return this.#baseRotation;
	}

	get baseOffsetX() {
		return this.#baseOffsetX;
	}

	get baseOffsetY() {
		return this.#baseOffsetY;
	}

	toJSON() {
		return {
			scaleFactor: this.#scaleFactor,
			shape: this.#shape,
			isStroke: this.#isStroke,
			stroke: this.#stroke,
			rotateOnAxis: this.#rotateOnAxis,
			randomizeScale: this.#randomizeScale,
			
			baseRotation: this.#baseRotation,
			baseOffsetX: this.#baseOffsetX,
			baseOffsetY: this.#baseOffsetY

		}
	}

	// TODO: Remove 2-way dependency of shapeList to Shape Obj
	static getRenderFunc(shape) {
		return shape ? shapeScheme.#SHAPE_RENDERERS[shape] : this.#SHAPE_RENDERERS.noop;
	}

	load(o) {
		this.scale = o.scaleFactor;
		this.shape = o.shape;
		this.isStroke = o.isStroke;
		this.stroke = o.stroke;
		this.rotateOnAxis = o.rotateOnAxis;
		this.randomizeScale = o.randomizeScale;
		this.baseRotation = o.baseRotation;
		this.baseOffsetX = o.baseOffsetX;
		this.baseOffsetY = o.baseOffsetY;
	}

	static from(o) {
		return Object.assign(new shapeScheme(), o);
	}
}