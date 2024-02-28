class colorScheme {
	#transparency = DEFAULT_TRANS;
	#variance = DEFAULT_COLOR_VARIANCE;
	#colorList = [];
	resetBG = true;
	container = '';
	#mixType = 'source-over';
	#gradient = 0;
	#isChanged = true;
	#ids = [];
	#swatchContainer;
	#swatchTemplate;
	#bgIndex;
	#fgList = [];



	get mixType() {
		return this.#mixType;
	};

	get isChanged() {
		return this.#isChanged;
	}

	get bg() {
		return this.#colorList[this.#bgIndex];
	}

	get __LIST() {
		return this.#colorList.map(c => c.hex);
	}

	get gradient() {
		return this.#gradient;
	}
	
	set variance(_) {
		this.#variance = _;
	}

	set transparency(_) {
		this.#transparency = _;
	}

	set mixType(_) {
		this.#mixType = _;
		this.#isChanged = true;
	}

	set isChanged(_) {
		this.#isChanged = _;
	}

	set gradient(_) {
		this.#gradient = _;
	}

	set variance(_) {
		this.#variance = _;
	}

	set swatchContainer(_) {
		this.#swatchContainer = _;
	}

	set swatchTemplate(_) {
		this.#swatchTemplate = _;
	}

	set bgIndex(_) {
		this.#bgIndex = _;
	}


	addColorSwatch(c, onChange) {
		const swatch = this.#swatchTemplate.content.cloneNode(true);
		const i = swatch.querySelector('.color-val');
		const id = util.generateId('color-swatch');
		swatch.firstElementChild.setAttribute('id', id);
		i.value = c.hex;
		this.#ids.push(id);

		i.addEventListener('change', (ev) => {
			const colorIndex = this.#ids.indexOf(id);

			if (colorIndex === -1) {
				throw new Error('Unable to change color');
			}

			this.update(colorIndex, ev.target.value);
			onChange();
		});
		swatch.querySelector('.color-del-btn').addEventListener('click', () => {
			this.removeColorSwatch(id);
		})

		this.#swatchContainer.appendChild(swatch);
	}

	removeColorSwatch(id) {
		const s = this.#swatchContainer.querySelector('#' + id);
		const col = s.querySelector('.color-val').value;
		const colorIndex = this.#ids.indexOf(id);

		if (colorIndex === -1) {
			throw new Error('Unable to remove color');
		}

		this.remove(colorIndex);
		this.#swatchContainer.removeChild(s);
		this.#ids = this.#ids.filter(i => i !== id);
	}

	update(index, n) {
		this.#colorList[index] = color.fromHex(n);
		this.#isChanged = true;
	}

	remove(index) {
		this.#colorList = this.#colorList.toSpliced(index, 1);
		this.generateBGIndex();
		this.#isChanged = true;
	}

	add(color, onChange) {
		this.#colorList.push(color);
		this.addColorSwatch(color, onChange);
		this.#isChanged = true;
	}

	clearColors() {
		this.#colorList.length = 0;
		this.#ids.forEach(i => this.removeColorSwatch(i));
	};

	setBGSwatch() {
		this.#swatchContainer.querySelectorAll('.col').forEach((c, i) => {
			c.classList.toggle('bg', i === this.#bgIndex);
		});
	}

	// Returns the color meant for the background of the image.
	// This will find a random entry in this.colorList and return it,
	// but at the same time, remove this color from the list so that it won't
	// be used when we call generateColor() later on.
	generateBGIndex() {
		this.#bgIndex = ~~(Math.random() * this.#colorList.length);
		this.#fgList = Array(this.#colorList.length).fill().map((_, i) => i).filter(i => i !== this.#bgIndex);
		this.setBGSwatch();
	};

	generateColorIndex(xperc) {
		// 	return this.#fgList.randomEntry();
		var p = xperc + util.random(this.#variance * -1, this.#variance, 1);
		p = Math.max(0, Math.min(p, 100));
		p = Math.round((p / 100) * (this.#fgList.length - 1));
		return this.#fgList[p];
	}

	// Return a random color in RGBA format.
	generateColor(index) {
		let c = this.#colorList[index];
		c.alpha = this.#transparency;
		return c;
	};

	getAvgBrightness() {
		var avgR = avgG = avgB = 0;

		for (var i = 0; i < this.#colorList.length; i++) {
			var cc = util.hex2rgbValues(this.#colorList[i]);
			avgR += cc[0];
			avgG += cc[1];
			avgB += cc[2];
		}

		avgR = ~~(avgR / this.#colorList.length);
		avgG = ~~(avgG / this.#colorList.length);
		avgB = ~~(avgB / this.#colorList.length);

		return ~~((avgR + avgG + avgB) / 3);
	}

	toJSON() {
		return {
			colorList: this.#colorList.map(c => c.hex),
			transparency: this.#transparency,
			variance: this.#variance,
			mixType: this.#mixType,
			gradient: this.#gradient,
			bgIndex: this.#bgIndex,
			fgList: this.#fgList
		};
	}

	load(o, onChange) {
		this.clearColors();
		
		o.colorList.forEach(c => {
			this.add(color.fromHex(c), onChange);
		});

		this.bgIndex = o.bgIndex;
		this.transparency = o.transparency;
		this.variance = o.variance;
		this.mixType = o.mixType;
		this.gradient = o.gradient;
		this.#fgList = o.fgList;
		this.setBGSwatch();
	}
}