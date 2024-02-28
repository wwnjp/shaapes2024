class distributionScheme {
	#space = DEFAULT_SPACEBETWEEN;
	#distance = DEFAULT_DISTANCE;
	#type = DEFAULT_DISTRO;
	#docw = DEFAULT_WIDTH;
	#doch = DEFAULT_HEIGHT;
	#rotate = DEFAULT_ROTATION;
	#omega = 1;
	#size = DEFAULT_SIZE;

	#initialPositionX = 0;
	#initialPositionY = 0;
	#numShapes = DEFAULT_NUMSHAPES;
	#numShapesPerPage = DEFAULT_NUMSHAPES;
	#isMultiply = false;

	#isChanged = true;

	constructor(w, h) {
		this.#docw = w;
		this.#doch = h;
	};

	set numShapes(_) {
		this.#numShapes = _;
		this.#numShapesPerPage = _;
		this.#isChanged = true;
	}

	set size(_) {
		this.#size = _;
		this.recalculateNumShapes();
		this.#isChanged = true;
	}

	set rotate(_) {
		let _2 = parseInt(_.toString().replace('deg', ''));
		if (isNaN(_2) || _2 === 0) {
			_2 = 360;
		}

		this.#rotate = _2;
		this.recalculateNumShapes();
		this.#isChanged = true;
	}

	set space(_) {
		this.#space = _;
		this.recalculateNumShapes();
		this.#isChanged = true;
	}

	set distance(_) {
		this.#distance = _;
		this.recalculateNumShapes();
		this.#isChanged = true;
	}

	set type(_) {
		this.#type = _;
		this.recalculateNumShapes();
		this.#isChanged = true;
	}

	set omega(_) {
		this.#omega = _;
		this.#isChanged = true;
	}

	set isMultiply(_) {
		this.#isMultiply = _;
		this.recalculateNumShapes();
		this.#isChanged = true;
	}

	get size() {
		return this.#size;
	}

	get numShapes() {
		return this.#numShapes;
	}

	get type() {
		return this.#type;
	}

	set isChanged(_) {
		this.#isChanged = _;
	}

	get isChanged() {
		return this.#isChanged;
	}

	get omega() {
		return this.#omega;
	}

	isEvenDistro() {
		return ['grid', 'alternate', 'alternateoffset'].includes(this.#type);
	}

	recalculateNumShapes() {
		if (this.isEvenDistro()) {
			const x = Math.ceil(this.#docw / Math.ceil(this.#size * this.#distance)) + 1;
			const y = Math.ceil(this.#doch / Math.ceil(this.#size * this.#space));
			const m = this.#isMultiply ? 360 / this.#rotate : 1;

			this.#numShapesPerPage = x * y;
			this.#numShapes = x * y * m;
		}
	}

	// Return the percentages per @x and @y of the screen.
	// This is specifically used to figure out what color to
	// paint a shape based on its position on the screen.
	getPercentage(x, y) {
		return {
			// The initial position is positive, and x is relative to that, therefore
			// could be negative. That's why it's a plus.
			x: ~~(((x + this.#initialPositionX) / this.#docw) * 100),
			y: ~~(((y + this.#initialPositionY) / this.#doch) * 100)
		};
	};

	// Gets the initial position for the distribution scheme
	// returns an obj as {x: #, y: #}
	getInitialPosition() {
		switch(this.#type) {
			case 'grid':
			case 'random':
			case 'topleft':
			case 'alternate':
				this.#initialPositionX = 0;
				this.#initialPositionY = 0;
				break;
			case 'center':
			case 'centeralt':
			case 'rectangle':
			case 'kaleidoscope':
			case 'spiral':
				this.#initialPositionX = ~~(this.#docw / 2);
				this.#initialPositionY = ~~(this.#doch / 2);
				break;
			default:
				this.#initialPositionX = 0;
				this.#initialPositionY = 0;
				break;
		}

		return {x: this.#initialPositionX, y: this.#initialPositionY};
	}

	calculateGrid() {
		let sx  = this.#size * this.#distance;
		let sy  = this.#size * this.#space;

		const maxSW = sx * Math.ceil(this.#docw / sx);
		const maxSH = sy * Math.ceil(this.#doch / sy);
		const page = ~~(i / this.#numShapesPerPage);

		let y = 0;
		let x = 0;

		// while (y < maxSW) {
		// 	y++;

		// 	if (x > 0) {
		// 		y--;
		// 		x++;
		// 	}
		// }

	}

	// This returns a set of points and rotations for shapeScheme to position things
	// return value is an array of {x:#, y:#, r:#}
	// @i is the shape index, used specifically by spiral to generate position.
	generatePositions(i) {
		let ret = [];
		let sx  = this.#size * this.#distance;
		let sy  = this.#size * this.#space;
		let s = sx;
		let r;

		const maxSW = sx * Math.ceil(this.#docw / sx);
		const maxSH = sy * Math.ceil(this.#doch / sy);
		const page = ~~(i / this.#numShapesPerPage);

		/*

		 0	2	5	9	14	20	27
		 1	4	8	13	19	26	33
		 3	7	12	18	25	32	38
		 6	11	17	24	31	37	42
		 10	16	23	30	36	41	45
		 15	22	29	35	40	44	47
		 21	28	34	39	43	46	48

		x = 0; y = 0;

		start at 0,0
		y + 1 (while y <= maxY),	push
			y - 1; x + 1 (while x <= maxX & y >= 0), push (while y >= 0)
		*/


		if (this.isEvenDistro() && this.#isMultiply) {
			r = PI180 * this.#rotate * page;
		} else {
			r = PI180 * util.random(0, 360, this.#rotate);
		}

		switch(this.#type) {
			case 'grid': 
				ret.push({
					x: ((i % this.#numShapesPerPage) * sx) % maxSW,
					y: ~~(((i % this.#numShapesPerPage) * sx) / maxSW) * sy,
					r: r
				});
				break;

			case 'alternate': 
				var x1 = ((i % this.#numShapesPerPage) * sx) % maxSW;
				var y1 = ~~(((i % this.#numShapesPerPage) * sx) / maxSW) * sy;
				var isEvenLine = Math.round(y1 / sy) % 2 === 0;
				// x1 = isEvenLine ? x1 - (sx / 2) : x1;
				r = isEvenLine ? r + Math.PI : r;

				ret.push({ x: x1, y: y1, r });
				break;

			case 'alternateoffset': 
				var x1 = ((i % this.#numShapesPerPage) * sx) % maxSW;
				var y1 = ~~(((i % this.#numShapesPerPage) * sx) / maxSW) * sy;
				var isEvenLine = Math.round(y1 / sy) % 2 === 0;
				x1 = isEvenLine ? x1 - (sx / 2) : x1;
				r = isEvenLine ? r + Math.PI : r;

				ret.push({ x: x1, y: y1, r });
				break;

			case 'random':
				ret.push({
					x: util.random(0, this.#docw, sx),
					y: util.random(0, this.#doch, sy),
					r:r
				});
				break;

			case 'rectangle':
				ret.push({
					x: util.random(s * -2, s * 2, sx),
					y: util.random(s * -4, s * 4, sy),
					r: r
				});
				break;

			case 'altrandom':
				var s2 = s * this.#distance;
				var x1 = util.random(0, this.#docw, sx);
				var y1 = util.random(0, this.#doch, s2);
				var isEvenLine = Math.round(y1 / s2) % 2 === 0;
				x1 = isEvenLine ? x1 - (s / 2) : x1;
				r = isEvenLine ? r + Math.PI : r;
				
				ret.push({
					x:x1, 
					y:y1,
					r:r
				});
				break;

			case 'topleft':
				var w1 = Math.floor(this.#docw / (2 * this.#distance));
				var h1 = Math.floor(this.#doch / (2 * this.#distance));
				var w2 = util.exprandom(s * -1, w1, s, this.#space);
				var h2 = util.exprandom(s * -1, h1, s, this.#space);
				ret.push({x:w2, y:h2, r:r});
				break;

			case 'center':
				var w1 = Math.floor(this.#docw / (2 * this.#distance));
				var h1 = Math.floor(this.#doch / (2 * this.#distance));
				var w2 = util.exprandom(0, ~~(w1 / 2), s, this.#space);
				var h2 = util.exprandom(0, ~~(h1 / 2), s, this.#space);
				w2 = (Math.random() > 0.5) ? w2 * -1 : w2;
				h2 = (Math.random() > 0.5) ? h2 * -1 : h2;
				ret.push({x:w2, y:h2, r:r});
				break;


			case 'x':
				var w1 = Math.floor(this.#docw / (2 * this.#distance));
				var w2 = util.exprandom(0, ~~(w1 / 2), sx, this.#space);
				// w2 = (Math.random() > 0.5) ? w2 * -1 : w2;
				ret.push({
					x: w2,
					y: this.#doch / 2,
					r: r
				});
				break;

			// TODO FIX ME
			// case 'centeralt':
			// 	var s2 = s * this.#distance;
			// 	var w1 = Math.floor(this.#docw / (2 * this.#distance));
			// 	var h1 = Math.floor(this.#doch / (2 * this.#distance));
			// 	var w2 = util.exprandom(0, w1, s, this.#distance);
			// 	var h2 = util.exprandom(0, h1, s, this.#distance);
			// 	w2 = ((Math.random() > 0.5) && (w2 !== 0)) ? w2 * -1 : w2;
			// 	w2 = (Math.round(h2 / s2) % 2 === 0) ? w2 - (s / 2) : w2;
			// 	h2 = (Math.random() > 0.5) ? h2 * -1 : h2;
			// 	ret.push({x:w2, y:h2, r:r});
			// 	break;
		
			// case 'kaleidoscope':
			// 	var w = Math.floor(this.#docw / 2);
			// 	var h = Math.floor(this.#doch / 2);
			// 	var x1 = util.random(s * -1, w, s);
			// 	var y1 = util.random(s * -1, h, s);
			// 	ret.push({x:x1, y:y1, r:r});
			// 	ret.push({x:-1*x1, y:y1, r:r + Math.PI / 2 });
			// 	ret.push({x:-1*x1, y:-1*y1, r:r + Math.PI});
			// 	ret.push({x:x1, y:-1*y1, r:r + (3 * Math.PI / 2)});
			// 	break;

			case 'spiral':
				var t = PI180 * i * (this.#omega  * this.#distance);
				var d = this.#space * i;
				
				ret.push({
					x:Math.floor(d * Math.cos(t)),
					y:Math.floor(d * Math.sin(t)),
					r: r + t
				});
				break;

			default:
				break;
		}

		return ret;
	};

	toJSON() {
		return {
			space: this.#space,
			distance: this.#distance,
			type: this.#type,
			docw: this.#docw,
			doch: this.#doch,
			rotate: this.#rotate,
			omega: this.#omega,
			size: this.#size,
		
			numShapes: this.#numShapes,
			numShapesPerPage: this.#numShapesPerPage,
			isMultiply: this.#isMultiply
		};
	}

	load(o) {		
		this.space = o.space;
		this.distance = o.distance;
		this.type = o.type;
		this.rotate = o.rotate;
		this.omega = o.omega;
		this.size = o.size;
		this.numShapes = o.numShapes;
		this.numShapesPerPage = o.numShapesPerPage;
		this.isMultiply = o.isMultiply;
	}

	static from(o) {
		return Object.assign(new distributionScheme(), o);
	}
}