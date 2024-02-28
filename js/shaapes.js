
// Variable Defaults (may be overridden later)
const DEFAULT_SPEED = 50,
	DEFAULT_REPLAY_DELAY = 10,
	DEFAULT_WIDTH = 1024,
	DEFAULT_HEIGHT = 768,
	DEFAULT_NUMSHAPES = 200,
	DEFAULT_SIZE = 50,
	DEFAULT_SPACEBETWEEN = 1,
	DEFAULT_SIZERAND = 1,
	DEFAULT_DISTANCE = 1,
	DEFAULT_TRANS = 100,
	DEFAULT_DISTRO = 'even',
	DEFAULT_ROTATION = 'none',
	DEFAULT_COLOR_VARIANCE = 10,
	DEFAULT_MIX_TYPE = 'source-over';
	BRIGHTNESS_THRESHOLD = 150,
	IMAGE_TYPE = 'image/png',
	HASH_SEPARATOR = '$',
	RESET_COLOR_BUTTON = '#reset-color-sel';
	COLOR_CONTAINER_SELECTOR = '.color-container';
	COLOR_SWATCH_TEMPLATE = '#color-swatch-template';
	PI180 = Math.PI / 180;

class generator {
	#el;
	#ctx;
	#w = 0;
	#h = 0;
	#shaapes = [];
	#bg;
	#currentbg;
	#renderCount = 0;
	#isFinished = false;
	#distroScheme;
	#colorScheme;
	#shapeScheme;

	#replaySpeed = DEFAULT_SPEED;
	#replayDelay = DEFAULT_REPLAY_DELAY;
	#autoplayTimer;
	#isAutoplay = false;

	set replaySpeed(_) {
		this.#replaySpeed = _;
		console.log('SPEED', this.#replaySpeed);
	}

	set replayDelay(_) {
		this.#replayDelay = parseInt(_) * 1000;
	}

	set isAutoplay(_) {
		this.#isAutoplay = _ === true;

		if (this.#isAutoplay) {
			this.autoRefresh();
		} else {
			this.resetAutoplayTimer();
		}
	}

	constructor(el, distroScheme, colorScheme, shapeScheme) {
		this.#el = el;
		this.#ctx = el.getContext('2d');
		this.#w = window.screen.width;
		this.#h = window.screen.height;
		this.#bg = this.#currentbg = new color(255, 255, 255);
		this.#el.setAttribute('width', this.#w);
		this.#el.setAttribute('height', this.#h);
		this.#distroScheme = distroScheme;
		this.#colorScheme = colorScheme;
		this.#shapeScheme = shapeScheme;
	}

	static create(container, distro, color, shape) {
		const c = document.createElement('canvas');
		c.classList.add('img');
		container.appendChild(c);
		return new generator(c, distro, color, shape);
	}

	updateShapeList() {
		const diff = this.#distroScheme.numShapes - this.#shaapes.length;
		
		if (diff !== 0) {
			const resetPos = this.#distroScheme.getInitialPosition();
	
			if (diff > 0) {
				for (let i = 0; i < diff; i++) {
					this.#shaapes.push(new shaape(this.#shapeScheme.shape, resetPos.x, resetPos.y, 0));
				}
			}
	
			if (diff < 0) {
				for (let i = 0; i < Math.abs(diff); i++) {
					this.#shaapes.pop();
				}
			}
		}
	}

	update() {
		this.#renderCount = 0;
		this.#isFinished = false;

		if (!document.querySelector('#lock-bg').checked && this.#colorScheme.isChanged) {
			this.#colorScheme.generateBGIndex();
		} 

		const resetPos = this.#distroScheme.getInitialPosition();

		this.#shaapes.forEach((s, i) => {
			const isNew = s.index === -1;
			s.index = i;

			if (this.#distroScheme.isChanged || isNew) {
				const fff = this.#distroScheme.generatePositions(i);
				s.rotation = fff[0].r;
				s.x = fff[0].x + resetPos.x;
				s.y = fff[0].y + resetPos.y;
				s.size = this.#distroScheme.size;
			}
			if (this.#shapeScheme.isScaleChanged || isNew) {
				s.scaleFactor = this.#shapeScheme.randomizeScale ? util.random(0, this.#shapeScheme.scale, 0.5) : this.#shapeScheme.scale;
			}

			if (this.#shapeScheme.isChanged || isNew) {
				s.shape = this.#shapeScheme.shape;
				s.isStroke = this.#shapeScheme.isStroke;
				s.stroke = this.#shapeScheme.stroke;
				s.rotateOnAxis = this.#shapeScheme.rotateOnAxis;
				s.baseRotation = this.#shapeScheme.baseRotation;
				s.baseOffsetX = this.#shapeScheme.baseOffsetX;
				s.baseOffsetY = this.#shapeScheme.baseOffsetY;
			}

			if (this.#colorScheme.isChanged || isNew) {
				s.colorIndex = this.#colorScheme.generateColorIndex(s.x / this.#w * 100);
				s.colorIndex2 = this.#colorScheme.generateColorIndex(s.x / this.#w * 100);
				s.compositeOperation = this.#colorScheme.mixType;
				s.gradient = this.#colorScheme.gradient;
			}

			s.color = this.#colorScheme.generateColor(s.colorIndex);
			s.color2 = this.#colorScheme.generateColor(s.colorIndex);
		});
	}

	renderBG() {
		const c = util.lerpColor(this.#currentbg, this.#colorScheme.bg, this.#renderCount / this.#replaySpeed);
		this.#ctx.fillStyle = c.hex;
		this.#ctx.fillRect(0, 0, this.#w, this.#h);
		document.body.style.backgroundColor = c.hex;
	}

	render() {
		if (!this.#isFinished) {
			this.renderBG();
			this.#shaapes.forEach(s => s.render(this.#ctx, this.#renderCount, this.#replaySpeed));
			requestAnimationFrame(() => this.render());
			this.#renderCount++;
			this.#isFinished = this.#shaapes.filter(s => !s.isFinished).length === 0;
		} else {
			this.#currentbg = this.#colorScheme.bg;
		}
	}

	// TODO, remove direct DOM check
	checkLocks() {
		this.#colorScheme.isChanged = !document.querySelector('#lock-color').checked;
		this.#distroScheme.isChanged = !document.querySelector('#lock-distro').checked;
		this.#shapeScheme.isChanged = !document.querySelector('#lock-shape').checked;
	};

	refresh() {
		this.updateShapeList();
		this.update();
		this.render();
		this.#colorScheme.isChanged = false;
		this.#distroScheme.isChanged = false;
		this.#shapeScheme.isChanged = false;
		this.#shapeScheme.isScaleChanged = false;
	};

	autoRefresh() {
		this.checkLocks();
		this.refresh();
		this.#autoplayTimer = setTimeout(this.autoRefresh.bind(this), this.#replayDelay);
	};

	resetAutoplayTimer() {
		clearTimeout(this.#autoplayTimer);
	}

	save() {
		let s = {
			shaapes: this.#shaapes,
			colorScheme: this.#colorScheme,
			distroScheme: this.#distroScheme,
			shapeScheme: this.#shapeScheme
		};

		console.dir(s);

		localStorage.setItem('s', JSON.stringify(s));
	}

	load() {
		const _ = JSON.parse(localStorage.getItem('s'));

		this.#distroScheme.load(_.distroScheme);
		this.#shapeScheme.load(_.shapeScheme);
		this.#colorScheme.load(_.colorScheme, this.refresh.bind(this));

		this.#shaapes.length = 0;
		this.#shaapes = _.shaapes.map(s => {
			let _s = shaape.from(s);
			_s.color = this.#colorScheme.generateColor(_s.colorIndex);
			_s.color2 = this.#colorScheme.generateColor(_s.colorIndex);
			return _s;
		});


		this.#colorScheme.isChanged = false;
		this.#distroScheme.isChanged = false;
		this.#shapeScheme.isChanged = false;
		this.#shapeScheme.isScaleChanged = false;
		this.#isFinished = false;

		console.log(this.#shaapes);

		this.render();
	}
}


/*

TODO TODO TODO TODO

- Store shaapes in localstorage
	- Replay / Save
	- Presets
- @scale root on origin
- Redraw all shaapes
- Grid should not jump, new placement calculation
- Fix/Compute Alternate Grid of Triangles

- New visuals
- Clean up UI Options (show/hide options depending on distro)
- Mobile Support (HOW)

DONE
- Clean mix mode list
- Fix scale of base offset to be in line with @size 
- Autoplay speed/timeout
- RGB Circles (Fix circle draw)

*/

//////////////
const init = ((doc) => {
	const _distroScheme = new distributionScheme(window.screen.width, window.screen.height);
	const _colorScheme = new colorScheme();
	const _shapeScheme = new shapeScheme();
	const _g = generator.create(doc.getElementById('img-container'), _distroScheme, _colorScheme, _shapeScheme);

	_colorScheme.swatchContainer = document.querySelector(COLOR_CONTAINER_SELECTOR);
	_colorScheme.swatchTemplate = document.querySelector(COLOR_SWATCH_TEMPLATE);
	// let autoplayTimer;

	// ////////

	const updateSliderValue = (sliderEl) => {
		let o;

		switch (sliderEl.dataset.obj) {
			case 'distro': 
				o = _distroScheme;
				break;

			case 'shape':
				o = _shapeScheme;
				break;

			case 'color':
				o = _colorScheme;
				break;

			case 'base':
				o = _g;
				break;

			default:
				break;
		};

		document.querySelector(`.range-num[data-value=${sliderEl.getAttribute('name')}]`).innerHTML = sliderEl.value;
		if (o) {
			o[sliderEl.getAttribute('name')] = parseFloat(sliderEl.value);
			o['isChanged'] = true;
		}
	}

	const randomizeColors = () => {
		_colorScheme.clearColors();
		_colorScheme.add(color.random(), _g.refresh.bind(this));
		_colorScheme.add(color.random(), _g.refresh.bind(this));
		_colorScheme.add(color.random(), _g.refresh.bind(this));
		_colorScheme.add(color.random(), _g.refresh.bind(this));
		_colorScheme.generateBGIndex();
		_colorScheme.isChanged = true;
	}

	document.querySelector('.btn.refresh').addEventListener('click', () => {
		_g.checkLocks();
		_g.refresh();
	});

	document.querySelector('#changeColors').addEventListener('click', () => {
		randomizeColors();
		_g.refresh();
	});

	document.querySelector('#addColor').addEventListener('click', () => {
		_colorScheme.add(color.fromHex('#000000'), refresh.bind(this));
		_g.refresh();
	});

	document.querySelector('#type').addEventListener('change', (ev) => {
		_distroScheme.type = ev.target.value;
		if (_distroScheme.isEvenDistro()) {
			document.querySelector('#numShapes').value = _distroScheme.numShapes;
		}
		_g.refresh();
	});

	document.querySelectorAll('[name=shapes]').forEach((i, _, a) => {
		i.addEventListener('change', () => {
			_shapeScheme.shape = [...a].filter(i => i.checked).map(i => i.value);
			_g.refresh();
		});
	});

	document.querySelector('#rotate').addEventListener('change', () => {
		_distroScheme.rotate = document.querySelector('#rotate').value;
		_g.refresh();
	});

	document.querySelector('#mixType').addEventListener('change', () => {
		_colorScheme.mixType = document.querySelector('#mixType').value;
		_g.refresh();
	});

	document.querySelector('#stroke').addEventListener('change', () => {
		_shapeScheme.isStroke = document.querySelector('#stroke').checked;
		_g.refresh();
	});

	document.querySelector('#multiply').addEventListener('change', () => {
		_distroScheme.isMultiply = document.querySelector('#multiply').checked;
		_g.refresh();
	});

	document.querySelectorAll('.val-container-toggle').forEach(t => t.addEventListener('click', (ev) => {
		const isOpen = ev.target.getAttribute('aria-expanded') === 'true';
		ev.target.setAttribute('aria-expanded', (!isOpen).toString());
	}));

	document.querySelectorAll('.range-slider').forEach(r => {
		updateSliderValue(r);

		r.addEventListener('input', (ev) => {
			updateSliderValue(r);
			_g.refresh();
		});
	});

	document.querySelector('#rotateOnAxis').addEventListener('change', (ev) => {
		_shapeScheme.rotateOnAxis = ev.target.checked;
		_g.refresh();
	});

	document.querySelector('#randomizeScale').addEventListener('change', (ev) => {
		_shapeScheme.randomizeScale = ev.target.checked;
		_g.refresh();
	});

	document.querySelector('#autoplay').addEventListener('change', () => {
		_g.isAutoplay = document.querySelector('#autoplay').checked;
	});

	document.querySelector('#save').addEventListener('click', () => {
		_g.save();
	});

	document.querySelector('#load').addEventListener('click', () => {
		_g.load();
	});

	(() => {
		_distroScheme.distance = 1;
		_distroScheme.space = 1;
		_distroScheme.type = document.querySelector('#type').value;
		_distroScheme.rotate = 'none';
		_distroScheme.numShapes = parseInt(document.querySelector('#numShapes').value);
	
		_shapeScheme.shape = [...document.querySelectorAll('[name=shapes]')].filter(i => i.checked).map(i => i.value);
		_shapeScheme.scale = parseInt(document.querySelector('#scale').value);
		_shapeScheme.rotateOnAxis = document.querySelector('#rotateOnAxis').checked;
		_shapeScheme.randomizeScale = document.querySelector('#randomizeScale').checked;

		_colorScheme.transparency = parseInt(document.querySelector('#transparency').value);
		randomizeColors();
		_g.refresh();
	})();

})(document);


/*
var SHAAPES = (function($, document) {
	var __shapeScheme,
		__colorScheme,
		__distributionScheme,
		__imageGenerator,

	/////////////////////////////////
	// Shapes
	// This manages which shapes the user selected and handles the button
	// creation and drawing on the context.
	__shapeScheme = function() {
		this.shapeList = [];
		this.size = DEFAULT_SIZE;
		this.numShapes = DEFAULT_NUMSHAPES;
		this.generatedNum = 0;
		this.sizeRand = DEFAULT_SIZERAND;
		this.maxW = 500;
		this.maxH = 500;
		this.iconSize = 32;
		this.iconColor = 'rgb(0,0,0)';

		this.positions = [];

		// Adds a selected shapes from the form to the list of
		// 'active' shapes to use.
		this.addShape = function(type) {
			this.shapeList.push(type);
		};

		// Resets the 'active' shapes list
		this.resetShapeList = function() {
			this.generatedNum = 0;
			this.shapeList = [];
		};

		// Used by the initial load of the page, read all the shapes above
		// and populate the list of shapes with the corresponding <a> tags
		this.appendShapeButtons = function($container) {
			for (var i in SVG.SHAPES) {
				if (SVG.SHAPES.hasOwnProperty(i)) {
					var s = SVG.SHAPES[i].replace(/_S_/g, this.iconSize).replace(/_C_/g, this.iconColor);
					var $a = $("<a/>", { href: '#', id: 'shape-button-' + i });
					var src = SVG.DOC_HEADER + SVG.DOC_BEGIN.replace(/_DOCX_|_DOCY_/g, this.iconSize) + s + SVG.DOC_END;
					var $img = $('<img />', { src: SVG.MIME_HEADER + util.base64_encode(src) });

					$a.click(function() {
						$(this).toggleClass('selected');
					});
					$img.appendTo($a);
					$container.append($a);
				}
			}

		};

		// This is clearly the most important function of the whole app:
		// actually draws the shape with the given @color and @position to
		// the canvas (via @ctx).
		this.generateShape = function(ctx, colorObj, distroObj, index) {
			let thisShapesSize,
				newShapeGuy,
				circleRadii = 4,
				position,
				percObj,
				color;

			if (this.shapeList.length > 0) {
				thisShapesSize = this.size * util.random(1, this.sizeRand);
				newShapeGuy = this.shapeList.randomEntry();
				position = distroObj.generatePositions(index);

				for (var p = 0; p < position.length; p++) {
					percObj = distroObj.getPercentage(position[p].x, position[p].y);
					ctx.save();
					ctx.translate(position[p].x, position[p].y);
					ctx.rotate(position[p].r);
					ctx.fillStyle = ctx.strokeStyle = colorObj.generateColor(percObj, thisShapesSize);

					if (this.positions.find(_ => _[0] === position[p].x && _[1] === position[p].y)) {
						ctx.globalCompositeOperation = colorObj.getMixType();
					}

					this.positions.push([position[p].x, position[p].y]);

					// ctx.shadowOffsetX = 0;
					// ctx.shadowOffsetY = 0;
					// ctx.shadowBlur = thisShapesSize / 2;
					// ctx.shadowColor = ctx.fillStyle;

					ctx.beginPath();

					switch (newShapeGuy) {
						case 'circle':
							ctx.arc(thisShapesSize / 2, thisShapesSize / 2, thisShapesSize / 2, Math.PI * 2, 0, true);
							ctx.fill();
							break;
						case 'circle2':
							ctx.arc(thisShapesSize / 2, thisShapesSize / 2, thisShapesSize / 4, Math.PI * 2, 0, true);
							ctx.fill();
							break;
						case 'circle3':
							ctx.lineWidth = circleRadii;
							ctx.arc(thisShapesSize / 2, thisShapesSize / 2, (thisShapesSize / 2) - (circleRadii / 2), Math.PI * 2, 0, true);
							ctx.stroke();
							break;
						case 'circle4':
							ctx.lineWidth = circleRadii;
							ctx.arc(thisShapesSize / 2, thisShapesSize / 2, (thisShapesSize / 4) - (circleRadii / 2), Math.PI * 2, 0, true);
							ctx.stroke();
							break;
						case 'quartercircle':
							ctx.moveTo(0, 0);
							ctx.lineTo(0, thisShapesSize);
							ctx.arc(0, thisShapesSize, thisShapesSize, 0, 3 * Math.PI / 2, true);
							ctx.fill();
							break;
						case 'halfcircle1':
							ctx.moveTo(0, 0);
							ctx.arc(thisShapesSize / 2, 0, thisShapesSize / 2, Math.PI, 2 * Math.PI, true);
							ctx.fill();
							break;
						case 'halfcircle2':
							ctx.moveTo(0, thisShapesSize);
							ctx.arc(thisShapesSize / 2, thisShapesSize, thisShapesSize / 2, Math.PI, 2 * Math.PI, false);
							ctx.fill();
							break;
						case 'filledarc':
							var s2 = thisShapesSize / 2;
							ctx.moveTo(0, 0);
							ctx.arc(s2, s2, s2, 3 * Math.PI / 2, Math.PI, true);
							ctx.lineTo(0, 0);
							ctx.fill();
							break;
						case 'triangle':
							ctx.moveTo(0, 0);
							ctx.lineTo(0, thisShapesSize);
							ctx.lineTo(thisShapesSize, thisShapesSize);
							ctx.fill();
							break;
						case 'triangle2':
							ctx.moveTo(0, 0);
							ctx.lineTo(0, thisShapesSize);
							ctx.lineTo(~~(thisShapesSize * (Math.sqrt(3) / 2)), thisShapesSize / 2);
							ctx.fill();
							break;
						case 'triangle3':
							ctx.moveTo(0, 0);
							ctx.lineTo(0, thisShapesSize);
							ctx.lineTo(thisShapesSize, thisShapesSize / 2);
							ctx.fill();
							break;
						case 'square':
							ctx.moveTo(0, 0);
							ctx.lineTo(0, thisShapesSize);
							ctx.lineTo(thisShapesSize, thisShapesSize);
							ctx.lineTo(thisShapesSize, 0);
							ctx.fill();
							break;
						case 'square2':
							var s3 = Math.floor(thisShapesSize / 3);
							ctx.moveTo(s3, s3);
							ctx.lineTo(s3 * 2, s3);
							ctx.lineTo(s3 * 2, s3 * 2);
							ctx.lineTo(s3, s3 * 2);
							ctx.fill();
							break;
						case 'square3':
							ctx.lineWidth = thisShapesSize / 20;
							ctx.moveTo(0, 0);
							ctx.lineTo(0, thisShapesSize);
							ctx.lineTo(thisShapesSize, thisShapesSize);
							ctx.lineTo(thisShapesSize, 0);
							ctx.closePath();
							ctx.stroke();
							break;
						case 'square4':
							ctx.lineWidth = thisShapesSize / 20;
							var s3 = Math.floor(thisShapesSize / 3);
							ctx.moveTo(s3, s3);
							ctx.lineTo(s3 * 2, s3);
							ctx.lineTo(s3 * 2, s3 * 2);
							ctx.lineTo(s3, s3 * 2);
							ctx.closePath();
							ctx.stroke();
							break;
						case 'dline':
							ctx.lineWidth = 1;
							ctx.moveTo(0, 0);
							ctx.lineCap = 'square';
							ctx.lineTo(thisShapesSize, thisShapesSize);
							ctx.stroke();
							break;
						case 'dline2':
							ctx.lineWidth = 2;
							ctx.moveTo(0, 0);
							ctx.lineCap = 'square';
							ctx.lineTo(thisShapesSize, thisShapesSize / 2);
							ctx.stroke();
							break;
						case 'vline':
							ctx.lineWidth = 1;
							ctx.lineCap = 'square';
							ctx.moveTo(0,0);
							ctx.lineTo(0, thisShapesSize);
							ctx.stroke();
							break;
						case 'vline2':
							ctx.lineWidth = 3;
							ctx.lineCap = 'square';
							ctx.moveTo(0,0);
							ctx.lineTo(0, thisShapesSize);
							ctx.stroke();
							break;
						case 'vline3':
							ctx.lineWidth = 5;
							ctx.lineCap = 'square';
							ctx.moveTo(0,0);
							ctx.lineTo(0, thisShapesSize);
							ctx.stroke();
							break;
						case 'vline4':
							ctx.lineWidth = thisShapesSize / 5;
							ctx.lineCap = 'square';
							ctx.moveTo(0,0);
							ctx.lineTo(0, thisShapesSize);
							ctx.stroke();
							break;
						case 'leaf':
							ctx.moveTo(0, 0);
							ctx.arc(0, thisShapesSize, thisShapesSize, 3 * Math.PI / 2, 0, false);
							ctx.arc(thisShapesSize, 0, thisShapesSize, Math.PI / 2, Math.PI, false);
							ctx.fill();
							break;
						case 'halfleaf':
							ctx.moveTo(0, 0);
							ctx.lineTo(thisShapesSize, thisShapesSize);
							ctx.arc(thisShapesSize, 0, thisShapesSize, Math.PI / 2, Math.PI, false);
							ctx.fill();
							break;
						case 'arc':
							// ctx.lineWidth = thisShapesSize / 2;
							// ctx.lineCap = 'butt';
							ctx.moveTo(0, 0);
							ctx.lineTo(0, thisShapesSize / 3);
							// ctx.lineTo(thisShapesSize - (thisShapesSize / 3), thisShapesSize);
							ctx.arc(0, thisShapesSize, thisShapesSize - (thisShapesSize / 3), Math.PI / -2, 0, false);
							ctx.lineTo(thisShapesSize, thisShapesSize);
							// ctx.stroke();
							// ctx.lineTo(0, 0);
							ctx.arc(0, thisShapesSize, thisShapesSize, 0, Math.PI / -2, true);
							ctx.fill();
							break;
						case 'diamond':
							var s2 = thisShapesSize / 2;
							ctx.moveTo(s2, 0);
							ctx.lineTo(0, s2);
							ctx.lineTo(s2, thisShapesSize);
							ctx.lineTo(thisShapesSize, s2);
							ctx.fill();
							break;
						case 'hexagon':
							var s4 = thisShapesSize / 4;
							var s2 = thisShapesSize / 2;
							ctx.moveTo(0, s4);
							ctx.lineTo(0, s4 + s2);
							ctx.lineTo(s2, thisShapesSize);
							ctx.lineTo(thisShapesSize, s4 + s2);
							ctx.lineTo(thisShapesSize, s4);
							ctx.lineTo(s2, 0);
							ctx.fill();
						default:
							break;
					}

					ctx.restore();
					ctx.globalCompositeOperation = 'source-over';
				}
			}
		};
	},

	/////////////////////////////////
	// Colors
	// Handles the generation of the color buttons, handles the interface
	// to ColourLovers, and handles the weighted values from the CL list.
	__colorScheme = function() {
		this.transparency = DEFAULT_TRANS;
		this.variance = DEFAULT_COLOR_VARIANCE;
		this.colorList = [];
		this.resetBG = true;
		this.isGradient = false;
		this.container = '';
		this.$clresults = '';
		this.mixType = 'source-over',
		this.CLURL = 'https://colourlovers.com/api/palettes';
		this.CLURLParams = {'format': 'json', 'numResults': 50, 'orderCol': 'score', 'sortBy': 'DESC', 'showPaletteWidths':1};

		// Function that will take in @search and use the ColourLovers API
		// to get their search terms and create the relevent buttons to display.
		this.getCLResults = function(search) {
			var p = this.CLURLParams;
			if (search) {
				p['keywords'] = search;
			}

			var _this = this;
			$.ajax({
				url: this.CLURL,
				dataType: 'jsonp',
				data: p,
				jsonp: 'jsonCallback',
				success: function(results) {
					_this.$clresults.removeClass('hide').empty();

					for (var i in results) if (results.hasOwnProperty(i)) {
						var r = results[i];
						$a = $("<a />", {'class': 'clpal', href: '#', title: r.title}).data({'colors': r.colors, 'weights': r.colorWidths});
						$a.append($('<div />').html(r.title).addClass('title'));
						var $colorBlock = $('<div />').addClass('color-block color-adjust');

						for (var c in r.colors) {
							$colorBlock.append($('<span />').css({'background-color': '#' + r.colors[c], 'width': (r.colorWidths[c] * 100) + '%'}));
						}
						$a.append($colorBlock);

						$a.click(function() {
							_this.resetColorList();
							var c = $(this).data('colors');
							var w = $(this).data('weights');
							for (var j in c) {
								if (typeof c[j] === 'string') {
									_this.appendColorButton(c[j], w[j]);
								}
							}
							// TODO: change this to a "selected".
							$('#alltheshapesthatsshapelyshape').submit();
						});
						$a.appendTo(_this.$clresults);
					}
				}
			})
		}

		// Handles colors in hex format (we'll process them via util.hex2rgba).
		this.addColor = function(c, w) {
			var count = w ? w * 100 : 1
			for (var i = 0; i < count; i++) {
				this.colorList.push(c);
			}
		}

		this.clearColors = function() {
			this.colorList.length = 0;
		};

		this.getMixType = function() {
			return this.mixType;
		};

		// Pretty self-explanatory, resets the list (either from
		// new scheme selection, reset button or form submission.
		this.resetColorList = function() {
			//$(".colorpicker").remove();
			this.container.empty();
			this.clearColors();
		}

		// Add the color button to the main form so that when
		// submitted, it will be able to pull those values.
		this.appendColorButton = function(color, weight) {
			const d = document.createElement('div');
			d.classList.add('color-container');
			
			const i = document.createElement('input');
			i.setAttribute('type', 'color');
			i.dataset.weight = weight;
			i.value = '#' + color;
			
			const b = document.createElement('button');
			b.setAttribute('type', 'button');
			b.setAttribute('aria-label', 'Remove Color');
			b.classList.add('color-close-btn');
			b.addEventListener('click', () => {
				d.parentNode.removeChild(d);
			});
			
			d.appendChild(i);
			d.appendChild(b);
			this.container.append(d);
		}

		// Returns the color meant for the background of the image.
		// This will find a random entry in this.colorList and return it,
		// but at the same time, remove this color from the list so that it won't
		// be used when we call generateColor() later on.
		this.generateBGColor = function(isRemove) {
			const col = this.colorList.randomEntry();
			if (isRemove) {
				this.colorList = this.colorList.filter(c => c !== col);
			}

			return util.hex2rgba(col, 1);
		};

		// Return a random color in RGBA format.
		this.generateColor = function(percObj, shapeSize) {
			var c = this.colorList.randomEntry();
			if (percObj.x) {
				var p = percObj.x + util.random(this.variance * -1, this.variance, 1);
				p = (p < 0) ? 0 : p;
				p = (p > this.colorList.length) ? Math.abs(this.colorList.length - p): p;
				c = this.colorList[p] || this.colorList[0];
			}

			if (this.isGradient) {
				const g = ctx.createLinearGradient(0, 0, shapeSize, shapeSize);
				g.addColorStop(0, util.hex2rgba(c, this.transparency));
				g.addColorStop(1, util.hex2rgba(util.lightenColor(c, 40), this.transparency));
				return g;
			} else {
				return util.hex2rgba(c, this.transparency);
			}
		};

		this.getAvgBrightness = function() {
			var avgR = avgG = avgB = 0;

			for (var i = 0; i < this.colorList.length; i++) {
				var cc = util.hex2rgbValues(this.colorList[i]);
				avgR += cc[0];
				avgG += cc[1];
				avgB += cc[2];
			}

			avgR = ~~(avgR / this.colorList.length);
			avgG = ~~(avgG / this.colorList.length);
			avgB = ~~(avgB / this.colorList.length);

			return ~~((avgR + avgG + avgB) / 3);
		}
	},

	/////////////////////////////////
	// Distribution Scheme
	// This handles the positioning and rotation of the elements on the field.
	// The schemes for the different distributions are calculated in this class.
	__distributionScheme = function() {
		this.space = DEFAULT_SPACEBETWEEN;
		this.distance = DEFAULT_DISTANCE;
		this.type = DEFAULT_DISTRO;
		this.docw = DEFAULT_WIDTH;
		this.doch = DEFAULT_HEIGHT;
		this.shapeSize = DEFAULT_SIZE;
		this.rotate = DEFAULT_ROTATION;
		this.initialPositionX = 0;
		this.initialPositionY = 0;

		// Easy wrapper that is called from the submit so
		// that we can use these values in this class.
		this.setDocSize = function(w, h, shapeSize) {
			this.docw = w;
			this.doch = h;
			this.shapeSize = shapeSize;
		};

		// Return the percentages per @x and @y of the screen.
		// This is specifically used to figure out what color to
		// paint a shape based on its position on the screen.
		this.getPercentage = function(x, y) {
			return {
				// The initial position is positive, and x is relative to that, therefore
				// could be negative. That's why it's a plus.
				x: ~~(((x + this.initialPositionX) / this.docw) * 100),
				y: ~~(((y + this.initialPositionY) / this.doch) * 100)
			};
		};

		// Gets the initial position for the distribution scheme
		// returns an obj as {x: #, y: #}
		this.getInitialPosition = function() {
			switch(this.type) {
				case 'even':
				case 'topleft':
				case 'alternate':
					this.initialPositionX = this.shapeSize;
					this.initialPositionY = this.shapeSize;
					break;
				case 'center':
				case 'centeralt':
				case 'kaleidoscope':
				case 'spiral':
					this.initialPositionX = ~~(this.docw / 2);
					this.initialPositionY = ~~(this.doch / 2);
					break;
				default:
					this.initialPositionX = 0;
					this.initialPositionY = 0;
					break;
			}

			return {x: this.initialPositionX, y: this.initialPositionY};
		}

		// This returns a set of points and rotations for shapeScheme to position things
		// return value is an array of {x:#, y:#, r:#}
		// @i is the shape index, used specifically by spiral to generate position.
		this.generatePositions = function(i) {
			var ret = [];
			var s  = Math.floor(this.shapeSize * this.space);
			var r;

			switch(this.rotate) {
				case 'leftright':
					r = Math.PI / 180 * util.random(0, 180, 180);
					break;
				case 'deg30':
					r = Math.PI / 180 * util.random(0, 360, 30);
					break;
				case 'deg45':
					r = Math.PI / 180 * util.random(0, 360, 45);
					break;
				case 'deg60':
					r = Math.PI / 180 * util.random(0, 360, 60);
					break;
				case 'deg90':
					r = Math.PI / 180 * util.random(0, 270, 90);
					break;
				case 'deg120':
					r = Math.PI / 180 * util.random(0, 360, 120);
					break;
				case 'deg180':
					r = Math.PI / 180 * (util.random(0, 180, 180) + 90);
					break;
				case 'full':
					r = Math.PI / 180 * util.random(0, 360);
					break;
				case 'none':
				default:
					r = 0;
					break;
			}

			switch(this.type) {
				case 'even':
					ret.push({x: util.random(0, this.docw, s), y: util.random(0, this.doch, s), r:r});
					break;

				case 'alternate':
					var s2 = s * this.distance;
					var x1 = util.random(0, this.docw, s);
					var y1 = util.random(0, this.doch, s2);
					x1 = (Math.round(y1 / s2) % 2 == 0) ? x1 - (s / 2) : x1;
					// y1 = ((x1 / s) % 2 == 0) ? y1 + (s / 2) : y1;
					ret.push({x:x1, y:y1, r:r});
					break;

				case 'topleft':
					var w1 = Math.floor(this.docw / (2 * this.distance));
					var h1 = Math.floor(this.doch / (2 * this.distance));
					var w2 = util.exprandom(s * -1, w1, s, this.space);
					var h2 = util.exprandom(s * -1, h1, s, this.space);
					ret.push({x:w2, y:h2, r:r});
					break;

				case 'center':
					var w1 = Math.floor(this.docw / (2 * this.distance));
					var h1 = Math.floor(this.doch / (2 * this.distance));
					var w2 = util.exprandom(0, w1, s, this.space);
					var h2 = util.exprandom(0, h1, s, this.space);
					w2 = (Math.random() > 0.5) ? w2 * -1 : w2;
					h2 = (Math.random() > 0.5) ? h2 * -1 : h2;
					ret.push({x:w2, y:h2, r:r});
					break;

				case 'centeralt':
					var s2 = s * this.distance;
					var w1 = Math.floor(this.docw / (2 * this.distance));
					var h1 = Math.floor(this.doch / (2 * this.distance));
					var w2 = util.exprandom(0, w1, s, this.distance);
					var h2 = util.exprandom(0, h1, s, this.distance);
					w2 = ((Math.random() > 0.5) && (w2 !== 0)) ? w2 * -1 : w2;
					console.log(w2, h2, s2, Math.round(h2 / s2));
					w2 = (Math.round(h2 / s2) % 2 === 0) ? w2 - (s / 2) : w2;
					h2 = (Math.random() > 0.5) ? h2 * -1 : h2;
					ret.push({x:w2, y:h2, r:r});
					break;
			
				case 'kaleidoscope':
					var w = Math.floor(this.docw / 2);
					var h = Math.floor(this.doch / 2);
					var x1 = util.random(s * -1, w, s);
					var y1 = util.random(s * -1, h, s);
					ret.push({x:x1, y:y1, r:r});
					ret.push({x:-1*x1, y:y1, r:r + Math.PI / 2 });
					ret.push({x:-1*x1, y:-1*y1, r:r + Math.PI});
					ret.push({x:x1, y:-1*y1, r:r + (3 * Math.PI / 2)});
					break;

				case 'spiral':
					var t = Math.PI / 180 * i * (222.4 * this.distance);
					var d = this.space * i;
					var x1 = Math.floor(d * Math.cos(t));
					var y1 = Math.floor(d * Math.sin(t));
					ret.push({x:x1, y:y1, r:r + t});
					break;

				default:
					break;
			}
			return ret;
		};
	},


	/////////////////////////////////
	// Generator
	// The master of ceremonies, this will aggregate all of the objects
	// and render the image based on those parameters.
	__imageGenerator = function(w,h, shapeGenObj, colorSchemeObj, distroSchemeObj) {
		this.w = w;
		this.h = h;
		this.shapes = shapeGenObj;
		this.colorScheme = colorSchemeObj;
		this.distroScheme = distroSchemeObj;

		// Draw a Background Field with a BG Color
		// (which will remove that color from the list of colors)
		this.refresh = function(ctx) {
			ctx.fillStyle = this.colorScheme.generateBGColor(true);
			ctx.fillRect(0, 0, this.w, this.h);
		}

		this.createCanvas = function() {
			var $canv = $("<canvas></canvas>").addClass('img');
			return $canv;
		}

		// Generate the whole image.  Loop through the Shape Generator and
		// add the shapes based on the Distribution Scheme and Color Scheme
		this.generate = function() {
			var ip = this.distroScheme.getInitialPosition(),
				$canvas = this.createCanvas(),
				cso = this.colorScheme;
				ctx = $canvas.get(0).getContext('2d');

			// For some reason, this is needed to prevent the image from zooming
			$canvas.attr('width', this.w).attr('height', this.h);

			this.refresh(ctx);

			ctx.translate(ip.x, ip.y);

			for (var i = 0; i < this.shapes.numShapes; i++) {
				this.shapes.generateShape(ctx, this.colorScheme, this.distroScheme, i);
			}

			$(".color-adjust").removeClass('black white').addClass(function() {
				return (cso.getAvgBrightness() > BRIGHTNESS_THRESHOLD) ? 'black' : 'white';
			});

			$canvas.appendTo('.img-container').fadeIn(SPEED, function() {
				$(".img").not(":last").remove();
			});
		}
	};

	return {
		shapeScheme			: __shapeScheme,
		colorScheme			: __colorScheme,
		distributionScheme	: __distributionScheme,
		imageGenerator		: __imageGenerator
	};
})(jQuery, document, undefined);
*/



// Onload, do this.
/*

$(function() {
	var shapeScheme = new SHAAPES.shapeScheme(),
		colorScheme = new SHAAPES.colorScheme(),
		distroScheme = new SHAAPES.distributionScheme();

	// Since we can reasonably assume that the user is making
	// a background image for this computer, we can grab the screen
	// resolution and populate the sizes respectively
	$('#docw').val(window.screen.width * (window.devicePixelRatio || 1));
	$('#doch').val(window.screen.height * (window.devicePixelRatio || 1));

	// Initialze Shapes
	shapeScheme.appendShapeButtons($('#shape-button-area'));

	// Initialize Colors
	colorScheme.container = $('#color-sel-area');
	colorScheme.$clresults = $("#cl-results");

	const resetColorList = () => {
		colorScheme.resetColorList();
		colorScheme.appendColorButton('444444', .5);
		colorScheme.appendColorButton('f3f3f3', .5);
	}

	document.querySelector(RESET_COLOR_BUTTON).addEventListener('click', resetColorList);
	
	$("#add-color-sel").click(function(ev) {
		ev.preventDefault();
		colorScheme.appendColorButton('FFFFFF', 1);
	});


	$("#btn--download").click(function(ev) {
		ev.preventDefault();
		var p = $('.img').last().get(0).toDataURL($("#output-format").val(), 1.0);
		$('#omgimgdl').attr('src', p);
		$('#shaapes--download').removeClass('hide');
	});

	$('.btn-close').click(function(ev) {
		ev.preventDefault();
		$(".popup").addClass('hide');
	});

	$(".dock-btn").click(function(ev) {
		ev.preventDefault();
		var id = $(this).attr('id'),
			$block = $("#" + id.replace('btn', 'shaapes'))

		$('.dock-btn').not(this).removeClass('selected');
		$(this).toggleClass('selected');

		$('.block-wrapper').not($block).addClass('hide');
		$block.toggleClass('hide');

		return false;
	});

	$("#btn--refresh").click(function(ev) {
		$(".hint").addClass("invisible");
		setTimeout(function() {
			$(".hint").addClass('hide');
		}, 1000);
		$("#alltheshapesthatsshapelyshape").submit();
	});

	// On submit of the form, RUN ALL THE THINGS!
	$("#alltheshapesthatsshapelyshape").submit(function(ev) {
		var w = parseInt($('#docw').val()) || DEFAULT_WIDTH,
			h = parseInt($('#doch').val()) || DEFAULT_HEIGHT,
			colorHashArr = [];

		ev.preventDefault();

		colorScheme.transparency = parseFloat($('#trans').val()) || DEFAULT_TRANS;
		colorScheme.transparency = colorScheme.transparency > 1 ? 1 : colorScheme.transparency;
		colorScheme.variance = parseFloat($('#variance').val()) || DEFAULT_COLOR_VARIANCE;
		colorScheme.mixType = document.getElementById('mix-type').value ?? DEFAULT_MIX_TYPE;
		colorScheme.isResetBG = true;
		colorScheme.isGradient = true;
		colorScheme.clearColors();
	

		document.querySelectorAll('.color-container input').forEach(i => {
			colorHashArr.push(i.value + 'W' + i.dataset.weight);
			colorScheme.addColor(i.value, i.dataset.weight);
		});


		// Process all the shape selections
		shapeScheme.resetShapeList();
		shapeScheme.size = parseInt($('#shapesize').val()) || DEFAULT_SIZE;
		// shapeScheme.numShapes = ~~((w / shapeScheme.size) * (h / shapeScheme.size)) * 10;
		shapeScheme.numShapes = parseInt($('#numshapes').val()) || DEFAULT_NUMSHAPES;
		shapeScheme.sizeRand = $('#sizerand').val();

		var shapeHashArr = [];
		$('#shape-button-area').children('a').each(function(i) {
			if ($(this).hasClass('selected')) {
				shapeHashArr.push(i);
				shapeScheme.addShape(this.id.replace('shape-button-', ''));
			}
		});

		/ Process distribution options
		distroScheme.setDocSize(w, h, shapeScheme.size);
		distroScheme.type = $('#distribution').val();
		distroScheme.space = $("#space").val() || DEFAULT_SPACEBETWEEN;
		distroScheme.distance = parseFloat($("#distance").val()) || DEFAULT_DISTANCE;
		distroScheme.rotate = $('#rotate').val();

		// hashStr.push(shapeHashArr.generateBitmask());
		// hashStr.push(shapeScheme.numShapes);
		// hashStr.push(shapeScheme.sizeRand);
		// hashStr.push(shapeScheme.size);
		// hashStr.push(distroScheme.rotate);
		// hashStr.push(colorHashArr.join(','));
		// hashStr.push(colorScheme.transparency);
		// hashStr.push(colorScheme.variance);
		// hashStr.push(distroScheme.type);
		// hashStr.push(distroScheme.space);
		// hashStr.push(distroScheme.distance);

		_canG = new SHAAPES.imageGenerator(w, h, shapeScheme, colorScheme, distroScheme);
		_canG.generate();

		// var hhhh = util.base64_encode(hashStr.join(HASH_SEPARATOR));

		// generate hash string and set it
		// $("#share-url").attr('href', location.href.split('#')[0] + '#' + hhhh);
		// document.cookie = 'lastVal=' + hhhh;
		return false;
	});

	$("#cl-search").keypress(function(ev) {
		if (ev.keyCode == 13) {
			ev.preventDefault();
			colorScheme.getCLResults(this.value);
		}
	});

	$("#cl-submit").click(function(ev) {
		ev.preventDefault();
		colorScheme.getCLResults($("#cl-search").val());
	});


	const init = (() => {
		resetColorList();
	})();


	// Pull any valid arguments out of the hash tag
	// var processHashValues = function(h) {
	// 	var shapeArr, colorArr,
	// 		optArr = util.base64_decode(h.replace('#', '')).split(HASH_SEPARATOR);

	// 	if (optArr.length > 1) {
	// 		shapeArr = util.parseBitmask(optArr[0]);
	// 		$('#shape-button-area').children('a').removeClass('selected');
	// 		for (var j = 0; j < shapeArr.length; j++) {
	// 			$('#shape-button-area').children('a').eq(shapeArr[j]).addClass('selected');
	// 		}

	// 		colArr = optArr[5].split(',');
	// 		colorScheme.resetColorList();
	// 		for (var j = 0; j < colArr.length; j++) {
	// 			colorScheme.appendColorButton(colArr[j].split('W')[0], colArr[j].split('W')[1]);
	// 		}
	// 		$("#numshapes").val(optArr[1]);
	// 		$("#sizerand").val(optArr[2]);
	// 		$("#shapesize").val(optArr[3]);
	// 		$("#rotate").val(optArr[4]);
	// 		$('#trans').val(optArr[6]);
	// 		$("#variance").val(optArr[7]);
	// 		$('#distribution').val(optArr[8]);
	// 		$('#space').val(optArr[9]);
	// 		$('#distance').val(optArr[10]);
	// 	}

	// 	// Kick the form off here, even if the values
	// 	// weren't set above
	// 	$("#alltheshapesthatsshapelyshape").submit();
	// };


});
*/


