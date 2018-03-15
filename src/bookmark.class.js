'use strict';

const STROKE_COLOR = "#FF0000";
const LINE_WIDTH = 1;

// Initialization of a bookmark.
export default class BookMark {
	/**
	 * Constructor.
	 * @param _uniqueId
	 * @param _params
	 * @param _patterns
	 */
	constructor(_uniqueId, _params, _patterns) {
		// Work with textures.
		this.patterns = _patterns;
		this.images = [];
		this.params = _params;
		this.numberOfPairOfTriangles = 3;

		if (!this.params.color) {
			this.params.color = this.getRandomPattern();
		}

		if (!this.params.triangleEvenPattern) {
			this.params.triangleEvenPattern = this.getRandomPattern();
		}

		if (!this.params.triangleOddPattern) {
			this.params.triangleOddPattern = this.getRandomPattern();
		}

		this.el_canvas = this.createCanvas('canva-' + _uniqueId, 'zone-' + _uniqueId, this.params);

		// Show download link if can download picture is set to true.
		if (this.params.canDownload === true) {
			this.createDownloadLink(_uniqueId);
		}

		this.el_ctx = this.el_canvas.getContext('2d');
		this.initPatterns();
	}

	/**
	 * Randomly returns a pattern.
	 * @returns {*}
	 */
	getRandomPattern() {
		return this.patterns[Math.floor(Math.random() * this.patterns.length)];
	}

	/**
	 * Initialize the background.
	 * @param el
	 */
	setBackgroundPattern(el) {
		this.el_ctx.fillStyle = this.images[el];
		this.el_ctx.fillRect(0, 0, this.el_canvas.width, this.el_canvas.height);
	}

	/**
	 * Draw a canvas.
	 * @param elementId
	 * @param zoneId
	 * @param params
	 * @returns {Element}
	 */
	createCanvas(elementId, zoneId, params) {

		let _canvas = document.createElement('canvas');
		_canvas.innerHTML = "Votre navigateur ne supporte pas canvas.<br>Essayez avec Firefox, Safari, Chrome ou Opera.";
		let zone = document.getElementById(zoneId);
		_canvas.id = elementId;
		_canvas.width = params.width;
		_canvas.height = params.height;
		_canvas.showStrokes = params.showStrokes;
		_canvas.colorTriangleEven = params.triangleEvenPattern;
		_canvas.colorTriangleOdd = params.triangleOddPattern;
		zone.appendChild(_canvas);
		this.clearCanvasLayers();
		return _canvas;
	}

	/**
	 * Erase a canvas.
	 */
	clearCanvasLayers() {
		if (this.el_canvas) {
			let w = this.el_canvas.clientWidth;
			let h = this.el_canvas.clientHeight;
			this.el_ctx.clearRect(0, 0, w, h);
		}
	}

	/**
	 * Initialize the patterns, we decrement a variable. When it is zero we continue the loading script of the canvas.
	 */
	initPatterns() {
		let _imagesLoading = this.patterns.length;
		let _this = this;
		this.patterns.forEach(function (pattern) {
			let image = new Image();
			image.onload = function () {
				_this.images[pattern] = _this.el_ctx.createPattern(image, 'repeat');
				--_imagesLoading;
				if (_imagesLoading === 0) {
					_this.workDone();
				}
			};
			image.src = 'images/' + pattern + '.jpg';
		});
	}

	/**
	 * Create a link to download an image of the canvas.
	 * @param uniqueId
	 */
	createDownloadLink(uniqueId) {

		let _zone = document.getElementById("zone-" + uniqueId);
		let _link = document.createElement('a');
		let _this = this;

		_link.innerHTML = 'Télécharger l\'image';
		_link.className = "btn btn-dark";
		_link.href = "#";
		_link.role = "button";
		_link.addEventListener('click', function () {
			_link.href = _this.el_canvas.toDataURL();
			_link.download = "bookmark.jpg";
		}, false);
		_zone.insertBefore(document.createElement('br'), _zone.firstChild);
		_zone.insertBefore(document.createElement('br'), _zone.firstChild);
		_zone.insertBefore(_link, _zone.firstChild);
	}

	/**
	 * Draw the pairs of triangles.
	 * @param params
	 */
	drawTriangles(params) {
		let _triangle_height;
		let _column_width = this.el_canvas.width / params.columnsPerWidth;
		let _half_width = _column_width / 2;

		// Draw each triangle pair.
		for (let j = 1; j <= this.numberOfPairOfTriangles; j++) {
			for (let l = 0; l < params.columnsPerWidth; l++) {

				_triangle_height = this.el_canvas.height / (this.numberOfPairOfTriangles * 2);

				// Thickness of cut lines.
				this.el_ctx.lineWidth = LINE_WIDTH;

				// The offset between each column.
				let _offset = l * _column_width;
				let _first_coef = 2 * (_triangle_height * j - _triangle_height);
				let _second_coef = _first_coef + (2 * _triangle_height);
				let _third_coef = ((_second_coef - _triangle_height) / j) * j;

				// Draw a pair of triangle.
				for (let k = 1; k <= 2; k++) {
					this.el_ctx.beginPath();
					this.el_ctx.moveTo(_half_width + _offset, _third_coef);

					// Draw a triangle with the base at the top or at the bottom.
					if (k % 2 === 1) {
						this.el_ctx.fillStyle = this.images[this.el_canvas.colorTriangleEven];
						this.el_ctx.lineTo(_column_width + _offset, _first_coef);
						this.el_ctx.lineTo(_offset, _first_coef);
					} else {
						this.el_ctx.fillStyle = this.images[this.el_canvas.colorTriangleOdd];
						this.el_ctx.lineTo(_column_width + _offset, _second_coef);
						this.el_ctx.lineTo(_offset, _second_coef);
					}

					this.el_ctx.closePath();
					// If stroke flag is on.
					if (this.el_canvas.showStrokes === true) {
						this.el_ctx.strokeStyle = STROKE_COLOR;
						this.el_ctx.stroke();
					}

					this.el_ctx.fill();
				}
			}
		}
	}

	/**
	 * Function called when all images are loaded.
	 */
	workDone() {
		this.clearCanvasLayers();
		// Draw the triangles.
		this.setBackgroundPattern(this.params.color);
		this.drawTriangles(this.params);
	}
}