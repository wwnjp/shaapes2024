
class util {
	//
	// Base 64 Encode a string (if window.btoa doesn't exist)
	// Basically, it works like so:
	// take 3 8-bit ASCII vals and repurpose the bits as
	// 4 6-bit vals.  Assign alphanums to each val and go
	//
	__BASE64_BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	static base64_encode(str) {
		let o = '',
			i = 0;

		if (typeof str === 'string' && str.length) {
			while (i < str.length) {
				let c1 = str.charCodeAt(i++);
				let c2 = str.charCodeAt(i++) || 0;
				let c3 = str.charCodeAt(i++) || 0;

				let b1 = c1 >> 2;
				let b2 = (((c1 << 8) | c2) & 1008) >> 4;
				let b3 = (((c2 << 8) | c3) & 4032) >> 6;
				let b4 = c3 & 63;

				o += this.__BASE64_BASE.charAt(b1);
				o += this.__BASE64_BASE.charAt(b2);
				o += this.__BASE64_BASE.charAt(b3);
				o += this.__BASE64_BASE.charAt(b4);
			}

			return o;
		}
		else {
			throw new Error('Invalid string');
		}
	}


	static base64_decode(str) {
		let o = '',
			i = 0;

		if (typeof str === 'string' && str.length) {
			while (i < str.length) {
				let c1 = this.__BASE64_BASE.indexOf(str[i++]);
				let c2 = this.__BASE64_BASE.indexOf(str[i++]) ?? 0;
				let c3 = this.__BASE64_BASE.indexOf(str[i++]) ?? 0;
				let c4 = this.__BASE64_BASE.indexOf(str[i++]) ?? 0;
				
				let b1 = (c1 << 2) | (c2 >> 4);
				let b2 = ((c2 & 15) << 4) | (c3 >> 2);
				let b3 = ((c3 & 3) << 6) | c4;
				
				o += String.fromCharCode(b1);
	
				if (c3 < 64) {
					o += String.fromCharCode(b2);
				}
				if (c4 < 64) {
					o += String.fromCharCode(b3);
				}
			}
	
			return o;
		}
		else {
			throw new Error('Invalid string');
		}
	}

	static random(min = 0, max = 100, step = 1) {
		return (Math.round(Math.random() * ((max - min)/step)) * step) + min;
	}

	// Exponentially-weighted random number generator
	static exprandom(min, max, step, weight) {
		var r = Math.log(1 - Math.random()) / (weight * -1);
		return (Math.round(r * ((max - min) / step)) * step) + min;
	}

	// Convert from Hex colors to RGBA color.
	static hex2rgba(h = '', opacity) {
		return 'rgba(' + util.hex2rgbValues(h).join(',') + ',' + opacity + ')';
	}

	// Return the raw RGB values of a given color
	static hex2rgbValues(c) {
		var cols = c.replace('#', '').match(/.{2}/g);

		// If we can't parse the color, then throw something back
		if (!cols || cols.length !== 3) {
			return 'rgba(0, 0, 0, 1)';
		}

		// Otherwise, go through the parsed list and convert to dec.
		for (var i in cols) {
			cols[i] = parseInt(cols[i], 16);
		}

		return cols;
	}

	static generateId(base) {
		return base + '-' + ~~(Math.random() * 999);
	}

	static lerp(a, b, t) {
		const easeInOut = t =>  t > 0.5 ? 4 * Math.pow((t - 1), 3) + 1 : 4 * t * t * t;
		const easeIn = t => t * t * t;
		const easeOut = t => Math.sqrt(t);
		const linear = t => t;

		return a + (b - a) * easeInOut(t);
	}

	static lerpColor(c1, c2, t) {
		// const easeInOut = t =>  t > 0.5 ? 4 * Math.pow((t - 1), 3) + 1 : 4 * t * t * t;
		// const easeIn = t => t * t * t;
		// const easeOut = t => Math.sqrt(t);
		// const linear = t => t;

		const r = ~~util.lerp(c1.r, c2.r, t);
		const g = ~~util.lerp(c1.g, c2.g, t);
		const b = ~~util.lerp(c1.b, c2.b, t);

		return new color(r, g, b);
	}

	// From a bitmasked number, generate an array of which bits are active.
	// static parseBitmask(i) {
	// 	let a = [];
	// 	let c = 0;

	// 	while (i > 0) {
	// 		if ((i & 1) === 1) {
	// 			a.push(c);
	// 		}
	// 		++c;
	// 		i >>= 1;
	// 	}
	// 	return a;
	// }
}


class color {
	#r = 0;
	#g = 0;
	#b = 0;
	#a = 100;

	constructor(r, g, b) {
		this.#r = r;
		this.#g = g;
		this.#b = b;
	}

	static fromHex(hex) {
		const cols = hex.replace('#', '').match(/.{2}/g);
		
		if (!cols || cols.length !== 3) {
			console.warn('Invalid Hex Code', hex);
			return new color(0, 0, 0);
		} else {
			const [r, g, b] = cols.map(c => parseInt(c, 16));
			return new color(r, g, b);
		}
	}

	static random() {
		return new color(util.random(0, 255), util.random(0, 255), util.random(0, 255));
	}

	set alpha(val) {
		// TODO: Handle values between 0-255 or 0-1 or %
		this.#a = val;
	}

	get r() {
		return this.#r;
	}
	get g() {
		return this.#g;
	}
	get b() {
		return this.#b;
	}
	get alpha() {
		return this.#a;
	}

	get hex() {
		return '#' + this.#r.toString(16).padStart(2, '0') + this.#g.toString(16).padStart(2, '0') + this.#b.toString(16).padStart(2, '0');
	}

	get rgb() {
		return `rgb(${this.#r},${this.#g},${this.#b})`;
	}

	get rgba() {
		return `rgba(${this.#r},${this.#g},${this.#b},${(this.#a / 100)})`;
	}

	lighten(amount = 10) {
		this.#r = Math.min(this.#r + amount, 255);
		this.#g = Math.min(this.#g + amount, 255);
		this.#b = Math.min(this.#b + amount, 255);
		return this;
	}

	darken(amount = 10) {
		this.#r = Math.max(this.#r - amount, 0);
		this.#g = Math.max(this.#g - amount, 0);
		this.#b = Math.max(this.#b - amount, 0);
		return this;
	}

	adjust(amount = 0) {
		return amount > 0 ? this.lighten(amount) :
			   amount < 0 ? this.darken(Math.abs(amount)) :
			   this;
	}
}



// Useful bit to be able to get a random entry from an array
// (we do that a lot here).
Array.prototype.randomEntry = function() {
	return this[util.random(0, this.length - 1)];
}

// Array.prototype.generateBitmask = function() {
// 	var b = 0;
// 	for (var i = 0; i < this.length; i++) {
// 		b += 1 << this[i];
// 	}

// 	return b;
// }

