
class shaape {
	#index = 0;
	#shape;
	
	#x = 0;
	#y = 0;
	
	#color;
	#color2;
	#currentX = 0;
	#currentY = 0;
	#currentColor;
	#currentColor2;
	#currentSize = 0;
	#currentRotation = 0;

	#rotation = 0;
	#size = 0;
	#colorIndex = 0;
	#colorIndex2 = 0;
	#isStroke = false;
	#stroke = 0;

	#shapeFunc;
	#compositeOperation = '';
	#isFinished = false;
	#scaleFactor = 1;
	#rotateOnAxis = true;
	#isGradient = false;
	#gradient = 0;

	#baseRotation = 0;
	#baseOffsetX = 0;
	#baseOffsetY = 0;

	constructor(shape, x, y, size = 100, r = 0) {
		this.#index = -1;
		this.#color = this.#currentColor = new color(0, 0, 0);
		this.#color2 = this.#currentColor2 = new color(0, 0, 0);
		this.#colorIndex = 0;
		this.#colorIndex2 = 0;
		this.shape = shape;
		
		this.#x = this.#currentX = x;
		this.#y = this.#currentY = y;

		this.#size = this.#currentSize = size;
		this.#rotation = this.#currentRotation = r;
		this.#scaleFactor = 1;
		this.#isFinished = false;
	}

	get index() {
		return this.#index;
	}

	get size() {
		return this.#size;
	}

	get isFinished() {
		return this.#isFinished;
	}

	get x() {
		return this.#x;
	}

	get colorIndex() {
		return this.#colorIndex;
	}

	get colorIndex2() {
		return this.#colorIndex2;
	}

	set index(_) {
		this.#index = _;
		this.#isFinished = false;
	}

	set colorIndex(_) {
		this.#colorIndex = _;
		this.#isFinished = false;
	}

	set colorIndex2(_) {
		this.#colorIndex2 = _;
		this.#isFinished = false;
	}

	set x(_) {
		this.#x = _;
		this.#isFinished = false;
	}

	set y(_) {
		this.#y = _;
		this.#isFinished = false;
	}

	set size(_) {
		this.#size = _;
		this.#isFinished = false;
	}

	set scaleFactor(_) {
		this.#scaleFactor = _;
		this.#isFinished = false;
	}

	set rotation(_) {
		this.#rotation = _;
		this.#isFinished = false;
	}

	set color(c) {
		this.#color = c;
	}

	set color2(c) {
		this.#color2 = c;
	}

	set shape(s) {
		this.#shape = s;
		this.#shapeFunc = shapeScheme.getRenderFunc(this.#shape);
		this.#isFinished = false;
	}

	set compositeOperation(c) {
		this.#compositeOperation = c;
	}

	set gradient(_) {
		this.#gradient = _;
		this.#isFinished = false;
	}

	set isStroke(_) {
		this.#isStroke = _;
		this.#isFinished = false;
	}

	set stroke(_) {
		this.#stroke = _;
		this.#isFinished = false;
	}

	set rotateOnAxis(_) {
		this.#rotateOnAxis = _;
		this.#isFinished = false;
	}

	set baseRotation(_) {
		this.#baseRotation = _ * PI180;
		this.#isFinished = false;
	}

	set baseOffsetX(_) {
		this.#baseOffsetX = _;
		this.#isFinished = false;
	}
	
	set baseOffsetY(_) {
		this.#baseOffsetY = _;
		this.#isFinished = false;
	}

	toJSON() {
		return {
			index: this.#index,
			shape: this.#shape,
			x: this.#x,
			y: this.#y,
			rotation: this.#rotation,
			size: this.#size,
			colorIndex: this.#colorIndex,
			colorIndex2: this.#colorIndex2,
			isStroke: this.#isStroke,
			stroke: this.#stroke,
			currentX: this.#currentX,
			currentY: this.#currentY,
			currentColor: this.#currentColor,
			currentColor2: this.#currentColor2,
			currentSize: this.#currentSize,
			currentRotation: this.#currentRotation,
		

			compositeOperation: this.#compositeOperation,
			scaleFactor: this.#scaleFactor,
			rotateOnAxis: this.#rotateOnAxis,
			isGradient: this.#isGradient,
			gradient: this.#gradient,

			baseRotation: this.#baseRotation,
			baseOffsetX: this.#baseOffsetX,
			baseOffsetY: this.#baseOffsetY
		};
	}

	static from(o) {
		let s = Object.assign(new shaape(o.shape, o.x, o.y, o.size, o.rotation), o);
		s.finalize();
		return s;
	}

	finalize() {
		this.#isFinished = true;
		this.#currentColor = this.#color;
		this.#currentRotation = this.#rotation;
		this.#currentSize = this.#size;
		this.#currentX = this.#x;
		this.#currentY = this.#y;
	}

	render(ctx, currentFrame, lastFrame) {
		const p = currentFrame / lastFrame;
		const x = util.lerp(this.#currentX, this.#x, p);
		const y = util.lerp(this.#currentY, this.#y, p);
		const r = util.lerp(this.#currentRotation, this.#rotation, p);
		const size = util.lerp(this.#currentSize, this.#size, p);
		const col = util.lerpColor(this.#currentColor, this.#color, p);
		
		col.alpha = this.#color.alpha;
		ctx.save();
		ctx.translate(x, y);

		ctx.rotate(this.#baseRotation + r);
		
		// if (this.#rotateOnAxis) {
		// 	// ctx.translate(-1 * ~~(this.#size / 2), -1 * ~~(this.#size / 2));
		// 	ctx.translate(~~(this.#size / 2), ~~(this.#size / 2));
		// }
		// ctx.rotate(r);
		// if (this.#rotateOnAxis) {
		// 	ctx.translate(-1 * ~~(this.#size / 2), -1 * ~~(this.#size / 2));
		// }

		ctx.translate((this.#baseOffsetX / 100) * this.#size, (this.#baseOffsetY / 100) * this.#size);

		if (this.#gradient !== 0) {
			const g = ctx.createLinearGradient(0, 0, 0, size);
			g.addColorStop(0, col.rgba);
			g.addColorStop(1, col.adjust(this.#gradient).rgba);

			if (this.#isStroke) {
				ctx.strokeStyle = g;
			} else {
				ctx.fillStyle = g;
			}
		} else {
			ctx.fillStyle = ctx.strokeStyle = col.rgba;
		}

		ctx.globalCompositeOperation = this.#compositeOperation;
		// ctx.fillRect(0, 0, size, size);
		// ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
		// ctx.fill();
		this.#shapeFunc(ctx, size, this.#scaleFactor, this.#rotateOnAxis);

		if (this.#isStroke) {
			ctx.lineWidth = this.#stroke;
			ctx.lineJoin ='round';
			ctx.stroke();
		} else {
			ctx.fill();
		}

		ctx.restore();

		if (currentFrame === lastFrame) {
			this.finalize();
		}
	}
}
