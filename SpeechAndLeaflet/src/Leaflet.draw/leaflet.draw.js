L.drawVersion = "0.2.3-dev";
L.drawLocal = {
	draw: {
		toolbar: {
			actions: {
				title: "Cancel drawing",
				text: "Cancel"
			},
			buttons: {
				polyline: "Draw a polyline",
				polygon: "Draw a polygon",
				rectangle: "Draw a rectangle",
				circle: "Draw a circle",
				marker: "Draw a marker"
			}
		},
		handlers: {
			circle: {
				tooltip: {
					start: "Click and drag to draw circle."
				}
			},
			marker: {
				tooltip: {
					start: "Click map to place marker."
				}
			},
			polygon: {
				tooltip: {
					start: "Click to start drawing shape.",
					cont: "Click to continue drawing shape.",
					end: "Click first point to close this shape."
				}
			},
			polyline: {
				error: "<strong>Error:</strong> shape edges cannot cross!",
				tooltip: {
					start: "Click to start drawing line.",
					cont: "Click to continue drawing line.",
					end: "Click last point to finish line."
				}
			},
			rectangle: {
				tooltip: {
					start: "Click and drag to draw rectangle."
				}
			},
			simpleshape: {
				tooltip: {
					end: "Release mouse to finish drawing."
				}
			}
		}
	},
	edit: {
		toolbar: {
			actions: {
				save: {
					title: "Save changes.",
					text: "Save"
				},
				cancel: {
					title: "Cancel editing, discards all changes.",
					text: "Cancel"
				}
			},
			buttons: {
				edit: "Edit layers.",
				editDisabled: "No layers to edit.",
				remove: "Delete layers.",
				removeDisabled: "No layers to delete."
			}
		},
		handlers: {
			edit: {
				tooltip: {
					text: "Drag handles, or marker to edit feature.",
					subtext: "Click cancel to undo changes."
				}
			},
			remove: {
				tooltip: {
					text: "Click on a feature to remove"
				}
			}
		}
	}
};
L.Draw = {};
L.Draw.Feature = L.Handler.extend({
	includes: L.Mixin.Events,
	initialize: function(a, b) {
		this._map = a;
		this._container = a._container;
		this._overlayPane = a._panes.overlayPane;
		this._popupPane = a._panes.popupPane;
		b && b.shapeOptions && (b.shapeOptions = L.Util.extend({}, this.options.shapeOptions, b.shapeOptions));
		L.Util.extend(this.options, b)
	},
	enable: function() {
		this._enabled || (L.Handler.prototype.enable.call(this), this.fire("enabled", {
			handler: this.type
		}), this._map.fire("draw:drawstart", {
			layerType: this.type
		}))
	},
	disable: function() {
		this._enabled &&
			(L.Handler.prototype.disable.call(this), this.fire("disabled", {
			handler: this.type
		}), this._map.fire("draw:drawstop", {
			layerType: this.type
		}))
	},
	addHooks: function() {
		var a = this._map;
		a && (L.DomUtil.disableTextSelection(), a.getContainer().focus(), this._tooltip = new L.Tooltip(this._map), L.DomEvent.addListener(this._container, "keyup", this._cancelDrawing, this))
	},
	removeHooks: function() {
		this._map && (L.DomUtil.enableTextSelection(), this._tooltip.dispose(), this._tooltip = null, L.DomEvent.removeListener(this._container,
			"keyup", this._cancelDrawing))
	},
	setOptions: function(a) {
		L.setOptions(this, a)
	},
	_fireCreatedEvent: function(a) {
		this._map.fire("draw:created", {
			layer: a,
			layerType: this.type
		})
	},
	_cancelDrawing: function(a) {
		27 === a.keyCode && this.disable()
	}
});
L.Draw.Polyline = L.Draw.Feature.extend({
	statics: {
		TYPE: "polyline"
	},
	Poly: L.Polyline,
	options: {
		allowIntersection: !0,
		repeatMode: !1,
		drawError: {
			color: "#b00b00",
			timeout: 2500
		},
		icon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: "leaflet-div-icon leaflet-editing-icon"
		}),
		guidelineDistance: 20,
		shapeOptions: {
			stroke: !0,
			color: "#f06eaa",
			weight: 4,
			opacity: 0.5,
			fill: !1,
			clickable: !0
		},
		metric: !0,
		showLength: !0,
		zIndexOffset: 2E3
	},
	initialize: function(a, b) {
		this.options.drawError.message = L.drawLocal.draw.handlers.polyline.error;
		b && b.drawError && (b.drawError = L.Util.extend({}, this.options.drawError, b.drawError));
		this.type = L.Draw.Polyline.TYPE;
		L.Draw.Feature.prototype.initialize.call(this, a, b)
	},
	addHooks: function() {
		L.Draw.Feature.prototype.addHooks.call(this);
		this._map && (this._markers = [], this._markerGroup = new L.LayerGroup, this._map.addLayer(this._markerGroup), this._poly = new L.Polyline([], this.options.shapeOptions), this._tooltip.updateContent(this._getTooltipText()), this._mouseMarker || (this._mouseMarker = L.marker(this._map.getCenter(), {
			icon: L.divIcon({
				className: "leaflet-mouse-marker",
				iconAnchor: [20, 20],
				iconSize: [40, 40]
			}),
			opacity: 0,
			zIndexOffset: this.options.zIndexOffset
		})), this._mouseMarker.on("click", this._onClick, this).addTo(this._map), this._map.on("mousemove", this._onMouseMove, this).on("zoomend", this._onZoomEnd, this))
	},
	removeHooks: function() {
		L.Draw.Feature.prototype.removeHooks.call(this);
		this._clearHideErrorTimeout();
		this._cleanUpShape();
		this._map.removeLayer(this._markerGroup);
		delete this._markerGroup;
		delete this._markers;
		this._map.removeLayer(this._poly);
		delete this._poly;
		this._mouseMarker.off("click", this._onClick, this);
		this._map.removeLayer(this._mouseMarker);
		delete this._mouseMarker;
		this._clearGuides();
		this._map.off("mousemove", this._onMouseMove, this).off("zoomend", this._onZoomEnd, this)
	},
	_finishShape: function() {
		var a = this._poly.newLatLngIntersects(this._poly.getLatLngs()[0], !0);
		!this.options.allowIntersection && a || !this._shapeIsValid() ? this._showErrorTooltip() : (this._fireCreatedEvent(), this.disable(), this.options.repeatMode &&
			this.enable())
	},
	_shapeIsValid: function() {
		return !0
	},
	_onZoomEnd: function() {
		this._updateGuide()
	},
	_onMouseMove: function(a) {
		var b = a.layerPoint,
			c = a.latlng;
		this._currentLatLng = c;
		this._updateTooltip(c);
		this._updateGuide(b);
		this._mouseMarker.setLatLng(c);
		L.DomEvent.preventDefault(a.originalEvent)
	},
	_onClick: function(a) {
		a = a.target.getLatLng();
		0 < this._markers.length && !this.options.allowIntersection && this._poly.newLatLngIntersects(a) ? this._showErrorTooltip() : (this._errorShown && this._hideErrorTooltip(), this._markers.push(this._createMarker(a)),
			this._poly.addLatLng(a), 2 === this._poly.getLatLngs().length && this._map.addLayer(this._poly), this._updateFinishHandler(), this._vertexAdded(a), this._clearGuides(), this._updateTooltip())
	},
	_updateFinishHandler: function() {
		var a = this._markers.length;
		if (1 < a) this._markers[a - 1].on("click", this._finishShape, this);
		2 < a && this._markers[a - 2].off("click", this._finishShape, this)
	},
	_createMarker: function(a) {
		a = new L.Marker(a, {
			icon: this.options.icon,
			zIndexOffset: 2 * this.options.zIndexOffset
		});
		this._markerGroup.addLayer(a);
		return a
	},
	_updateGuide: function(a) {
		var b = this._markers.length;
		0 < b && (a = a || this._map.latLngToLayerPoint(this._currentLatLng), this._clearGuides(), this._drawGuide(this._map.latLngToLayerPoint(this._markers[b - 1].getLatLng()), a))
	},
	_updateTooltip: function(a) {
		var b = this._getTooltipText();
		a && this._tooltip.updatePosition(a);
		this._errorShown || this._tooltip.updateContent(b)
	},
	_drawGuide: function(a, b) {
		var c = Math.floor(Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))),
			d, e, f;
		this._guidesContainer || (this._guidesContainer =
			L.DomUtil.create("div", "leaflet-draw-guides", this._overlayPane));
		for (d = this.options.guidelineDistance; d < c; d += this.options.guidelineDistance) e = d / c, e = {
			x: Math.floor(a.x * (1 - e) + e * b.x),
			y: Math.floor(a.y * (1 - e) + e * b.y)
		}, f = L.DomUtil.create("div", "leaflet-draw-guide-dash", this._guidesContainer), f.style.backgroundColor = this._errorShown ? this.options.drawError.color : this.options.shapeOptions.color, L.DomUtil.setPosition(f, e)
	},
	_updateGuideColor: function(a) {
		if (this._guidesContainer)
			for (var b = 0, c = this._guidesContainer.childNodes.length; b <
				c; b++) this._guidesContainer.childNodes[b].style.backgroundColor = a
	},
	_clearGuides: function() {
		if (this._guidesContainer)
			for (; this._guidesContainer.firstChild;) this._guidesContainer.removeChild(this._guidesContainer.firstChild)
	},
	_getTooltipText: function() {
		var a = this.options.showLength;
		0 === this._markers.length ? a = {
			text: L.drawLocal.draw.handlers.polyline.tooltip.start
		} : (a = a ? this._getMeasurementString() : "", a = 1 === this._markers.length ? {
			text: L.drawLocal.draw.handlers.polyline.tooltip.cont,
			subtext: a
		} : {
			text: L.drawLocal.draw.handlers.polyline.tooltip.end,
			subtext: a
		});
		return a
	},
	_getMeasurementString: function() {
		var a = this._currentLatLng,
			b = this._markers[this._markers.length - 1].getLatLng(),
			a = this._measurementRunningTotal + a.distanceTo(b);
		return L.GeometryUtil.readableDistance(a, this.options.metric)
	},
	_showErrorTooltip: function() {
		this._errorShown = !0;
		this._tooltip.showAsError().updateContent({
			text: this.options.drawError.message
		});
		this._updateGuideColor(this.options.drawError.color);
		this._poly.setStyle({
			color: this.options.drawError.color
		});
		this._clearHideErrorTimeout();
		this._hideErrorTimeout = setTimeout(L.Util.bind(this._hideErrorTooltip, this), this.options.drawError.timeout)
	},
	_hideErrorTooltip: function() {
		this._errorShown = !1;
		this._clearHideErrorTimeout();
		this._tooltip.removeError().updateContent(this._getTooltipText());
		this._updateGuideColor(this.options.shapeOptions.color);
		this._poly.setStyle({
			color: this.options.shapeOptions.color
		})
	},
	_clearHideErrorTimeout: function() {
		this._hideErrorTimeout && (clearTimeout(this._hideErrorTimeout), this._hideErrorTimeout = null)
	},
	_vertexAdded: function(a) {
		this._measurementRunningTotal =
			1 === this._markers.length ? 0 : this._measurementRunningTotal + a.distanceTo(this._markers[this._markers.length - 2].getLatLng())
	},
	_cleanUpShape: function() {
		1 < this._markers.length && this._markers[this._markers.length - 1].off("click", this._finishShape, this)
	},
	_fireCreatedEvent: function() {
		var a = new this.Poly(this._poly.getLatLngs(), this.options.shapeOptions);
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, a)
	}
});
L.Draw.Polygon = L.Draw.Polyline.extend({
	statics: {
		TYPE: "polygon"
	},
	Poly: L.Polygon,
	options: {
		showArea: !1,
		shapeOptions: {
			stroke: !0,
			color: "#f06eaa",
			weight: 4,
			opacity: 0.5,
			fill: !0,
			fillColor: null,
			fillOpacity: 0.2,
			clickable: !0
		}
	},
	initialize: function(a, b) {
		L.Draw.Polyline.prototype.initialize.call(this, a, b);
		this.type = L.Draw.Polygon.TYPE
	},
	_updateFinishHandler: function() {
		var a = this._markers.length;
		if (1 === a) this._markers[0].on("click", this._finishShape, this);
		2 < a && (this._markers[a - 1].on("dblclick", this._finishShape, this),
			3 < a && this._markers[a - 2].off("dblclick", this._finishShape, this))
	},
	_getTooltipText: function() {
		var a, b;
		0 === this._markers.length ? a = L.drawLocal.draw.handlers.polygon.tooltip.start : 3 > this._markers.length ? a = L.drawLocal.draw.handlers.polygon.tooltip.cont : (a = L.drawLocal.draw.handlers.polygon.tooltip.end, b = this._getMeasurementString());
		return {
			text: a,
			subtext: b
		}
	},
	_getMeasurementString: function() {
		var a = this._area;
		return a ? L.GeometryUtil.readableArea(a, this.options.metric) : null
	},
	_shapeIsValid: function() {
		return 3 <=
			this._markers.length
	},
	_vertexAdded: function() {
		if (!this.options.allowIntersection && this.options.showArea) {
			var a = this._poly.getLatLngs();
			this._area = L.GeometryUtil.geodesicArea(a)
		}
	},
	_cleanUpShape: function() {
		var a = this._markers.length;
		0 < a && (this._markers[0].off("click", this._finishShape, this), 2 < a && this._markers[a - 1].off("dblclick", this._finishShape, this))
	}
});
L.SimpleShape = {};
L.Draw.SimpleShape = L.Draw.Feature.extend({
	options: {
		repeatMode: !1
	},
	initialize: function(a, b) {
		this._endLabelText = L.drawLocal.draw.handlers.simpleshape.tooltip.end;
		L.Draw.Feature.prototype.initialize.call(this, a, b)
	},
	addHooks: function() {
		L.Draw.Feature.prototype.addHooks.call(this);
		this._map && (this._map.dragging.disable(), this._container.style.cursor = "crosshair", this._tooltip.updateContent({
			text: this._initialLabelText
		}), this._map.on("mousedown", this._onMouseDown, this).on("mousemove", this._onMouseMove, this))
	},
	removeHooks: function() {
		L.Draw.Feature.prototype.removeHooks.call(this);
		this._map && (this._map.dragging.enable(), this._container.style.cursor = "", this._map.off("mousedown", this._onMouseDown, this).off("mousemove", this._onMouseMove, this), L.DomEvent.off(document, "mouseup", this._onMouseUp), this._shape && (this._map.removeLayer(this._shape), delete this._shape));
		this._isDrawing = !1
	},
	_onMouseDown: function(a) {
		this._isDrawing = !0;
		this._startLatLng = a.latlng;
		L.DomEvent.on(document, "mouseup", this._onMouseUp, this).preventDefault(a.originalEvent)
	},
	_onMouseMove: function(a) {
		a = a.latlng;
		this._tooltip.updatePosition(a);
		this._isDrawing && (this._tooltip.updateContent({
			text: this._endLabelText
		}), this._drawShape(a))
	},
	_onMouseUp: function() {
		this._shape && this._fireCreatedEvent();
		this.disable();
		this.options.repeatMode && this.enable()
	}
});
L.Draw.Rectangle = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: "rectangle"
	},
	options: {
		shapeOptions: {
			stroke: !0,
			color: "#f06eaa",
			weight: 4,
			opacity: 0.5,
			fill: !0,
			fillColor: null,
			fillOpacity: 0.2,
			clickable: !0
		}
	},
	initialize: function(a, b) {
		this.type = L.Draw.Rectangle.TYPE;
		this._initialLabelText = L.drawLocal.draw.handlers.rectangle.tooltip.start;
		L.Draw.SimpleShape.prototype.initialize.call(this, a, b)
	},
	_drawShape: function(a) {
		this._shape ? this._shape.setBounds(new L.LatLngBounds(this._startLatLng, a)) : (this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng,
			a), this.options.shapeOptions), this._map.addLayer(this._shape))
	},
	_fireCreatedEvent: function() {
		var a = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, a)
	}
});
L.Draw.Circle = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: "circle"
	},
	options: {
		shapeOptions: {
			stroke: !0,
			color: "#f06eaa",
			weight: 4,
			opacity: 0.5,
			fill: !0,
			fillColor: null,
			fillOpacity: 0.2,
			clickable: !0
		},
		showRadius: !0,
		metric: !0
	},
	initialize: function(a, b) {
		this.type = L.Draw.Circle.TYPE;
		this._initialLabelText = L.drawLocal.draw.handlers.circle.tooltip.start;
		L.Draw.SimpleShape.prototype.initialize.call(this, a, b)
	},
	_drawShape: function(a) {
		this._shape ? this._shape.setRadius(this._startLatLng.distanceTo(a)) : (this._shape = new L.Circle(this._startLatLng,
			this._startLatLng.distanceTo(a), this.options.shapeOptions), this._map.addLayer(this._shape))
	},
	_fireCreatedEvent: function() {
		var a = new L.Circle(this._startLatLng, this._shape.getRadius(), this.options.shapeOptions);
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, a)
	},
	_onMouseMove: function(a) {
		var b = a.latlng;
		a = this.options.showRadius;
		var c = this.options.metric;
		this._tooltip.updatePosition(b);
		this._isDrawing && (this._drawShape(b), b = this._shape.getRadius().toFixed(1), this._tooltip.updateContent({
			text: this._endLabelText,
			subtext: a ? "Radius: " + L.GeometryUtil.readableDistance(b, c) : ""
		}))
	}
});
L.Draw.Marker = L.Draw.Feature.extend({
	statics: {
		TYPE: "marker"
	},
	options: {
		icon: new L.Icon.Default,
		repeatMode: !1,
		zIndexOffset: 2E3
	},
	initialize: function(a, b) {
		this.type = L.Draw.Marker.TYPE;
		L.Draw.Feature.prototype.initialize.call(this, a, b)
	},
	addHooks: function() {
		L.Draw.Feature.prototype.addHooks.call(this);
		this._map && (this._tooltip.updateContent({
			text: L.drawLocal.draw.handlers.marker.tooltip.start
		}), this._mouseMarker || (this._mouseMarker = L.marker(this._map.getCenter(), {
			icon: L.divIcon({
				className: "leaflet-mouse-marker",
				iconAnchor: [20, 20],
				iconSize: [40, 40]
			}),
			opacity: 0,
			zIndexOffset: this.options.zIndexOffset
		})), this._mouseMarker.on("click", this._onClick, this).addTo(this._map), this._map.on("mousemove", this._onMouseMove, this))
	},
	removeHooks: function() {
		L.Draw.Feature.prototype.removeHooks.call(this);
		this._map && (this._marker && (this._marker.off("click", this._onClick, this), this._map.off("click", this._onClick, this).removeLayer(this._marker), delete this._marker), this._mouseMarker.off("click", this._onClick, this), this._map.removeLayer(this._mouseMarker),
			delete this._mouseMarker, this._map.off("mousemove", this._onMouseMove, this))
	},
	_onMouseMove: function(a) {
		a = a.latlng;
		this._tooltip.updatePosition(a);
		this._mouseMarker.setLatLng(a);
		this._marker ? this._marker.setLatLng(a) : (this._marker = new L.Marker(a, {
			icon: this.options.icon,
			zIndexOffset: this.options.zIndexOffset
		}), this._marker.on("click", this._onClick, this), this._map.on("click", this._onClick, this).addLayer(this._marker))
	},
	_onClick: function() {
		this._fireCreatedEvent();
		this.disable();
		this.options.repeatMode &&
			this.enable()
	},
	_fireCreatedEvent: function() {
		var a = new L.Marker(this._marker.getLatLng(), {
			icon: this.options.icon
		});
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, a)
	}
});
L.Edit = L.Edit || {};
L.Edit.Poly = L.Handler.extend({
	options: {
		icon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: "leaflet-div-icon leaflet-editing-icon"
		})
	},
	initialize: function(a, b) {
		this._poly = a;
		L.setOptions(this, b)
	},
	addHooks: function() {
		this._poly._map && (this._markerGroup || this._initMarkers(), this._poly._map.addLayer(this._markerGroup))
	},
	removeHooks: function() {
		this._poly._map && (this._poly._map.removeLayer(this._markerGroup), delete this._markerGroup, delete this._markers)
	},
	updateMarkers: function() {
		this._markerGroup.clearLayers();
		this._initMarkers()
	},
	_initMarkers: function() {
		this._markerGroup || (this._markerGroup = new L.LayerGroup);
		this._markers = [];
		var a = this._poly._latlngs,
			b, c, d;
		b = 0;
		for (c = a.length; b < c; b++) d = this._createMarker(a[b], b), d.on("click", this._onMarkerClick, this), this._markers.push(d);
		b = 0;
		for (a = c - 1; b < c; a = b++)
			if (0 !== b || L.Polygon && this._poly instanceof L.Polygon) a = this._markers[a], d = this._markers[b], this._createMiddleMarker(a, d), this._updatePrevNext(a, d)
	},
	_createMarker: function(a, b) {
		var c = new L.Marker(a, {
			draggable: !0,
			icon: this.options.icon
		});
		c._origLatLng = a;
		c._index = b;
		c.on("drag", this._onMarkerDrag, this);
		c.on("dragend", this._fireEdit, this);
		this._markerGroup.addLayer(c);
		return c
	},
	_removeMarker: function(a) {
		var b = a._index;
		this._markerGroup.removeLayer(a);
		this._markers.splice(b, 1);
		this._poly.spliceLatLngs(b, 1);
		this._updateIndexes(b, -1);
		a.off("drag", this._onMarkerDrag, this).off("dragend", this._fireEdit, this).off("click", this._onMarkerClick, this)
	},
	_fireEdit: function() {
		this._poly.edited = !0;
		this._poly.fire("edit")
	},
	_onMarkerDrag: function(a) {
		a =
			a.target;
		L.extend(a._origLatLng, a._latlng);
		a._middleLeft && a._middleLeft.setLatLng(this._getMiddleLatLng(a._prev, a));
		a._middleRight && a._middleRight.setLatLng(this._getMiddleLatLng(a, a._next));
		this._poly.redraw()
	},
	_onMarkerClick: function(a) {
		a = a.target;
		this._poly._latlngs.length < (L.Polygon && this._poly instanceof L.Polygon ? 4 : 3) || (this._removeMarker(a), this._updatePrevNext(a._prev, a._next), a._middleLeft && this._markerGroup.removeLayer(a._middleLeft), a._middleRight && this._markerGroup.removeLayer(a._middleRight),
			a._prev && a._next ? this._createMiddleMarker(a._prev, a._next) : a._prev ? a._next || (a._prev._middleRight = null) : a._next._middleLeft = null, this._fireEdit())
	},
	_updateIndexes: function(a, b) {
		this._markerGroup.eachLayer(function(c) {
			c._index > a && (c._index += b)
		})
	},
	_createMiddleMarker: function(a, b) {
		var c = this._getMiddleLatLng(a, b),
			d = this._createMarker(c),
			e, f, g;
		d.setOpacity(0.6);
		a._middleRight = b._middleLeft = d;
		f = function() {
			var f = b._index;
			d._index = f;
			d.off("click", e, this).on("click", this._onMarkerClick, this);
			c.lat = d.getLatLng().lat;
			c.lng = d.getLatLng().lng;
			this._poly.spliceLatLngs(f, 0, c);
			this._markers.splice(f, 0, d);
			d.setOpacity(1);
			this._updateIndexes(f, 1);
			b._index++;
			this._updatePrevNext(a, d);
			this._updatePrevNext(d, b)
		};
		g = function() {
			d.off("dragstart", f, this);
			d.off("dragend", g, this);
			this._createMiddleMarker(a, d);
			this._createMiddleMarker(d, b)
		};
		e = function() {
			f.call(this);
			g.call(this);
			this._fireEdit()
		};
		d.on("click", e, this).on("dragstart", f, this).on("dragend", g, this);
		this._markerGroup.addLayer(d)
	},
	_updatePrevNext: function(a, b) {
		a && (a._next =
			b);
		b && (b._prev = a)
	},
	_getMiddleLatLng: function(a, b) {
		var c = this._poly._map,
			d = c.project(a.getLatLng()),
			e = c.project(b.getLatLng());
		return c.unproject(d._add(e)._divideBy(2))
	}
});
L.Polyline.addInitHook(function() {
	this.editing || (L.Edit.Poly && (this.editing = new L.Edit.Poly(this), this.options.editable && this.editing.enable()), this.on("add", function() {
		this.editing && this.editing.enabled() && this.editing.addHooks()
	}), this.on("remove", function() {
		this.editing && this.editing.enabled() && this.editing.removeHooks()
	}))
});
L.Edit = L.Edit || {};
L.Edit.SimpleShape = L.Handler.extend({
	options: {
		moveIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: "leaflet-div-icon leaflet-editing-icon leaflet-edit-move"
		}),
		resizeIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: "leaflet-div-icon leaflet-editing-icon leaflet-edit-resize"
		})
	},
	initialize: function(a, b) {
		this._shape = a;
		L.Util.setOptions(this, b)
	},
	addHooks: function() {
		this._shape._map && (this._map = this._shape._map, this._markerGroup || this._initMarkers(), this._map.addLayer(this._markerGroup))
	},
	removeHooks: function() {
		if (this._shape._map) {
			this._unbindMarker(this._moveMarker);
			for (var a = 0, b = this._resizeMarkers.length; a < b; a++) this._unbindMarker(this._resizeMarkers[a]);
			this._resizeMarkers = null;
			this._map.removeLayer(this._markerGroup);
			delete this._markerGroup
		}
		this._map = null
	},
	updateMarkers: function() {
		this._markerGroup.clearLayers();
		this._initMarkers()
	},
	_initMarkers: function() {
		this._markerGroup || (this._markerGroup = new L.LayerGroup);
		this._createMoveMarker();
		this._createResizeMarker()
	},
	_createMoveMarker: function() {},
	_createResizeMarker: function() {},
	_createMarker: function(a, b) {
		var c =
			new L.Marker(a, {
				draggable: !0,
				icon: b,
				zIndexOffset: 10
			});
		this._bindMarker(c);
		this._markerGroup.addLayer(c);
		return c
	},
	_bindMarker: function(a) {
		a.on("dragstart", this._onMarkerDragStart, this).on("drag", this._onMarkerDrag, this).on("dragend", this._onMarkerDragEnd, this)
	},
	_unbindMarker: function(a) {
		a.off("dragstart", this._onMarkerDragStart, this).off("drag", this._onMarkerDrag, this).off("dragend", this._onMarkerDragEnd, this)
	},
	_onMarkerDragStart: function(a) {
		a.target.setOpacity(0)
	},
	_fireEdit: function() {
		this._shape.edited = !0;
		this._shape.fire("edit")
	},
	_onMarkerDrag: function(a) {
		a = a.target;
		var b = a.getLatLng();
		a === this._moveMarker ? this._move(b) : this._resize(b);
		this._shape.redraw()
	},
	_onMarkerDragEnd: function(a) {
		a.target.setOpacity(1);
		this._fireEdit()
	},
	_move: function() {},
	_resize: function() {}
});
L.Edit = L.Edit || {};
L.Edit.Rectangle = L.Edit.SimpleShape.extend({
	_createMoveMarker: function() {
		var a = this._shape.getBounds().getCenter();
		this._moveMarker = this._createMarker(a, this.options.moveIcon)
	},
	_createResizeMarker: function() {
		var a = this._getCorners();
		this._resizeMarkers = [];
		for (var b = 0, c = a.length; b < c; b++) this._resizeMarkers.push(this._createMarker(a[b], this.options.resizeIcon)), this._resizeMarkers[b]._cornerIndex = b
	},
	_onMarkerDragStart: function(a) {
		L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, a);
		var b = this._getCorners();
		a = a.target._cornerIndex;
		this._oppositeCorner = b[(a + 2) % 4];
		this._toggleCornerMarkers(0, a)
	},
	_onMarkerDragEnd: function(a) {
		var b = a.target,
			c;
		b === this._moveMarker && (c = this._shape.getBounds(), c = c.getCenter(), b.setLatLng(c));
		this._toggleCornerMarkers(1);
		this._repositionCornerMarkers();
		L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this, a)
	},
	_move: function(a) {
		for (var b = this._shape.getLatLngs(), c = this._shape.getBounds().getCenter(), d, e = [], f = 0, g = b.length; f < g; f++) d = [b[f].lat - c.lat, b[f].lng - c.lng], e.push([a.lat +
			d[0], a.lng + d[1]
		]);
		this._shape.setLatLngs(e);
		this._repositionCornerMarkers()
	},
	_resize: function(a) {
		this._shape.setBounds(L.latLngBounds(a, this._oppositeCorner));
		a = this._shape.getBounds();
		this._moveMarker.setLatLng(a.getCenter())
	},
	_getCorners: function() {
		var a = this._shape.getBounds(),
			b = a.getNorthWest(),
			c = a.getNorthEast(),
			d = a.getSouthEast(),
			a = a.getSouthWest();
		return [b, c, d, a]
	},
	_toggleCornerMarkers: function(a) {
		for (var b = 0, c = this._resizeMarkers.length; b < c; b++) this._resizeMarkers[b].setOpacity(a)
	},
	_repositionCornerMarkers: function() {
		for (var a =
			this._getCorners(), b = 0, c = this._resizeMarkers.length; b < c; b++) this._resizeMarkers[b].setLatLng(a[b])
	}
});
L.Rectangle.addInitHook(function() {
	L.Edit.Rectangle && (this.editing = new L.Edit.Rectangle(this), this.options.editable && this.editing.enable())
});
L.Edit = L.Edit || {};
L.Edit.Circle = L.Edit.SimpleShape.extend({
	_createMoveMarker: function() {
		var a = this._shape.getLatLng();
		this._moveMarker = this._createMarker(a, this.options.moveIcon)
	},
	_createResizeMarker: function() {
		var a = this._shape.getLatLng(),
			a = this._getResizeMarkerPoint(a);
		this._resizeMarkers = [];
		this._resizeMarkers.push(this._createMarker(a, this.options.resizeIcon))
	},
	_getResizeMarkerPoint: function(a) {
		var b = this._shape._radius * Math.cos(Math.PI / 4);
		a = this._map.project(a);
		return this._map.unproject([a.x + b, a.y - b])
	},
	_move: function(a) {
		var b =
			this._getResizeMarkerPoint(a);
		this._resizeMarkers[0].setLatLng(b);
		this._shape.setLatLng(a)
	},
	_resize: function(a) {
		a = this._moveMarker.getLatLng().distanceTo(a);
		this._shape.setRadius(a)
	}
});
L.Circle.addInitHook(function() {
	L.Edit.Circle && (this.editing = new L.Edit.Circle(this), this.options.editable && this.editing.enable());
	this.on("add", function() {
		this.editing && this.editing.enabled() && this.editing.addHooks()
	});
	this.on("remove", function() {
		this.editing && this.editing.enabled() && this.editing.removeHooks()
	})
});
L.LatLngUtil = {
	cloneLatLngs: function(a) {
		for (var b = [], c = 0, d = a.length; c < d; c++) b.push(this.cloneLatLng(a[c]));
		return b
	},
	cloneLatLng: function(a) {
		return L.latLng(a.lat, a.lng)
	}
};
L.GeometryUtil = {
	geodesicArea: function(a) {
		var b = a.length,
			c = 0,
			d = L.LatLng.DEG_TO_RAD,
			e, f;
		if (2 < b) {
			for (var g = 0; g < b; g++) e = a[g], f = a[(g + 1) % b], c += (f.lng - e.lng) * d * (2 + Math.sin(e.lat * d) + Math.sin(f.lat * d));
			c = 40680631590769 * c / 2
		}
		return Math.abs(c)
	},
	readableArea: function(a, b) {
		var c;
		b ? c = 1E4 <= a ? (1E-4 * a).toFixed(2) + " ha" : a.toFixed(2) + " m&sup2;" : (a *= 0.836127, c = 3097600 <= a ? (a / 3097600).toFixed(2) + " mi&sup2;" : 4840 <= a ? (a / 4840).toFixed(2) + " acres" : Math.ceil(a) + " yd&sup2;");
		return c
	},
	readableDistance: function(a, b) {
		var c;
		b ?
			c = 1E3 < a ? (a / 1E3).toFixed(2) + " km" : Math.ceil(a) + " m" : (a *= 1.09361, c = 1760 < a ? (a / 1760).toFixed(2) + " miles" : Math.ceil(a) + " yd");
		return c
	}
};
L.Util.extend(L.LineUtil, {
	segmentsIntersect: function(a, b, c, d) {
		return this._checkCounterclockwise(a, c, d) !== this._checkCounterclockwise(b, c, d) && this._checkCounterclockwise(a, b, c) !== this._checkCounterclockwise(a, b, d)
	},
	_checkCounterclockwise: function(a, b, c) {
		return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x)
	}
});
L.Polyline.include({
	intersects: function() {
		var a = this._originalPoints,
			b = a ? a.length : 0,
			c, d;
		if (this._tooFewPointsForIntersection()) return !1;
		for (b -= 1; 3 <= b; b--)
			if (c = a[b - 1], d = a[b], this._lineSegmentsIntersectsRange(c, d, b - 2)) return !0;
		return !1
	},
	newLatLngIntersects: function(a, b) {
		return this._map ? this.newPointIntersects(this._map.latLngToLayerPoint(a), b) : !1
	},
	newPointIntersects: function(a, b) {
		var c = this._originalPoints,
			d = c ? c.length : 0,
			c = c ? c[d - 1] : null,
			d = d - 2;
		return this._tooFewPointsForIntersection(1) ? !1 : this._lineSegmentsIntersectsRange(c,
			a, d, b ? 1 : 0)
	},
	_tooFewPointsForIntersection: function(a) {
		var b = this._originalPoints,
			b = b ? b.length : 0;
		return !this._originalPoints || 3 >= b + (a || 0)
	},
	_lineSegmentsIntersectsRange: function(a, b, c, d) {
		var e = this._originalPoints,
			f;
		d = d || 0;
		for (var g = c; g > d; g--)
			if (c = e[g - 1], f = e[g], L.LineUtil.segmentsIntersect(a, b, c, f)) return !0;
		return !1
	}
});
L.Polygon.include({
	intersects: function() {
		var a = this._originalPoints,
			b;
		if (this._tooFewPointsForIntersection()) return !1;
		if (L.Polyline.prototype.intersects.call(this)) return !0;
		b = a.length;
		return this._lineSegmentsIntersectsRange(a[b - 1], a[0], b - 2, 1)
	}
});
L.Control.Draw = L.Control.extend({
	options: {
		position: "topright",
		draw: {},
		edit: !1
	},
	initialize: function(a) {
		if ("0.5.1" >= L.version) throw Error("Leaflet.draw 0.2.0+ requires Leaflet 0.6.0+. Download latest from https://github.com/Leaflet/Leaflet/");
		L.Control.prototype.initialize.call(this, a);
		var b;
		this._toolbars = {};
		L.DrawToolbar && this.options.draw && (b = new L.DrawToolbar(this.options.draw), a = L.stamp(b), this._toolbars[a] = b, this._toolbars[a].on("enable", this._toolbarEnabled, this));
		L.EditToolbar && this.options.edit &&
			(b = new L.EditToolbar(this.options.edit), a = L.stamp(b), this._toolbars[a] = b, this._toolbars[a].on("enable", this._toolbarEnabled, this))
	},
	onAdd: function(a) {
		var b = L.DomUtil.create("div", "leaflet-draw"),
			c = !1,
			d, e;
		for (e in this._toolbars) this._toolbars.hasOwnProperty(e) && (d = this._toolbars[e].addToolbar(a), c || (L.DomUtil.hasClass(d, "leaflet-draw-toolbar-top") || L.DomUtil.addClass(d.childNodes[0], "leaflet-draw-toolbar-top"), c = !0), b.appendChild(d));
		return b
	},
	onRemove: function() {
		for (var a in this._toolbars) this._toolbars.hasOwnProperty(a) &&
			this._toolbars[a].removeToolbar()
	},
	setDrawingOptions: function(a) {
		for (var b in this._toolbars) this._toolbars[b] instanceof L.DrawToolbar && this._toolbars[b].setOptions(a)
	},
	_toolbarEnabled: function(a) {
		a = "" + L.stamp(a.target);
		for (var b in this._toolbars) this._toolbars.hasOwnProperty(b) && b !== a && this._toolbars[b].disable()
	}
});
L.Map.mergeOptions({
	drawControlTooltips: !0,
	drawControl: !1
});
L.Map.addInitHook(function() {
	this.options.drawControl && (this.drawControl = new L.Control.Draw, this.addControl(this.drawControl))
});
L.Toolbar = L.Class.extend({
	includes: [L.Mixin.Events],
	initialize: function(a) {
		L.setOptions(this, a);
		this._modes = {};
		this._actionButtons = [];
		this._activeMode = null
	},
	enabled: function() {
		return null !== this._activeMode
	},
	disable: function() {
		this.enabled() && this._activeMode.handler.disable()
	},
	removeToolbar: function() {
		for (var a in this._modes) this._modes.hasOwnProperty(a) && (this._disposeButton(this._modes[a].button, this._modes[a].handler.enable), this._modes[a].handler.disable(), this._modes[a].handler.off("enabled",
			this._handlerActivated, this).off("disabled", this._handlerDeactivated, this));
		this._modes = {};
		a = 0;
		for (var b = this._actionButtons.length; a < b; a++) this._disposeButton(this._actionButtons[a].button, this._actionButtons[a].callback);
		this._actionButtons = [];
		this._actionsContainer = null
	},
	_initModeHandler: function(a, b, c, d, e) {
		var f = a.type;
		this._modes[f] = {};
		this._modes[f].handler = a;
		this._modes[f].button = this._createButton({
			title: e,
			className: d + "-" + f,
			container: b,
			callback: this._modes[f].handler.enable,
			context: this._modes[f].handler
		});
		this._modes[f].buttonIndex = c;
		this._modes[f].handler.on("enabled", this._handlerActivated, this).on("disabled", this._handlerDeactivated, this)
	},
	_createButton: function(a) {
		var b = L.DomUtil.create("a", a.className || "", a.container);
		b.href = "#";
		a.text && (b.innerHTML = a.text);
		a.title && (b.title = a.title);
		L.DomEvent.on(b, "click", L.DomEvent.stopPropagation).on(b, "mousedown", L.DomEvent.stopPropagation).on(b, "dblclick", L.DomEvent.stopPropagation).on(b, "click", L.DomEvent.preventDefault).on(b, "click", a.callback, a.context);
		return b
	},
	_disposeButton: function(a, b) {
		L.DomEvent.off(a, "click", L.DomEvent.stopPropagation).off(a, "mousedown", L.DomEvent.stopPropagation).off(a, "dblclick", L.DomEvent.stopPropagation).off(a, "click", L.DomEvent.preventDefault).off(a, "click", b)
	},
	_handlerActivated: function(a) {
		this._activeMode && this._activeMode.handler.enabled() && this._activeMode.handler.disable();
		this._activeMode = this._modes[a.handler];
		L.DomUtil.addClass(this._activeMode.button, "leaflet-draw-toolbar-button-enabled");
		this._showActionsToolbar();
		this.fire("enable")
	},
	_handlerDeactivated: function() {
		this._hideActionsToolbar();
		L.DomUtil.removeClass(this._activeMode.button, "leaflet-draw-toolbar-button-enabled");
		this._activeMode = null;
		this.fire("disable")
	},
	_createActions: function(a) {
		for (var b = L.DomUtil.create("ul", "leaflet-draw-actions"), c = a.length, d, e = 0; e < c; e++) d = L.DomUtil.create("li", "", b), d = this._createButton({
			title: a[e].title,
			text: a[e].text,
			container: d,
			callback: a[e].callback,
			context: a[e].context
		}), this._actionButtons.push({
			button: d,
			callback: a[e].callback
		});
		return b
	},
	_showActionsToolbar: function() {
		var a = this._activeMode.buttonIndex,
			b = this._lastButtonIndex;
		this._actionsContainer.style.top = 26 * a + 1 * a - 1 + "px";
		0 === a && (L.DomUtil.addClass(this._toolbarContainer, "leaflet-draw-toolbar-notop"), L.DomUtil.addClass(this._actionsContainer, "leaflet-draw-actions-top"));
		a === b && (L.DomUtil.addClass(this._toolbarContainer, "leaflet-draw-toolbar-nobottom"), L.DomUtil.addClass(this._actionsContainer, "leaflet-draw-actions-bottom"));
		this._actionsContainer.style.display = "block"
	},
	_hideActionsToolbar: function() {
		this._actionsContainer.style.display = "none";
		L.DomUtil.removeClass(this._toolbarContainer, "leaflet-draw-toolbar-notop");
		L.DomUtil.removeClass(this._toolbarContainer, "leaflet-draw-toolbar-nobottom");
		L.DomUtil.removeClass(this._actionsContainer, "leaflet-draw-actions-top");
		L.DomUtil.removeClass(this._actionsContainer, "leaflet-draw-actions-bottom")
	}
});
L.Tooltip = L.Class.extend({
	initialize: function(a) {
		this._map = a;
		this._popupPane = a._panes.popupPane;
		this._container = a.options.drawControlTooltips ? L.DomUtil.create("div", "leaflet-draw-tooltip", this._popupPane) : null;
		this._singleLineLabel = !1
	},
	dispose: function() {
		this._container && (this._popupPane.removeChild(this._container), this._container = null)
	},
	updateContent: function(a) {
		if (!this._container) return this;
		a.subtext = a.subtext || "";
		0 !== a.subtext.length || this._singleLineLabel ? 0 < a.subtext.length && this._singleLineLabel &&
			(L.DomUtil.removeClass(this._container, "leaflet-draw-tooltip-single"), this._singleLineLabel = !1) : (L.DomUtil.addClass(this._container, "leaflet-draw-tooltip-single"), this._singleLineLabel = !0);
		this._container.innerHTML = (0 < a.subtext.length ? '<span class="leaflet-draw-tooltip-subtext">' + a.subtext + "</span><br />" : "") + "<span>" + a.text + "</span>";
		return this
	},
	updatePosition: function(a) {
		a = this._map.latLngToLayerPoint(a);
		var b = this._container;
		this._container && (b.style.visibility = "inherit", L.DomUtil.setPosition(b,
			a));
		return this
	},
	showAsError: function() {
		this._container && L.DomUtil.addClass(this._container, "leaflet-error-draw-tooltip");
		return this
	},
	removeError: function() {
		this._container && L.DomUtil.removeClass(this._container, "leaflet-error-draw-tooltip");
		return this
	}
});
L.DrawToolbar = L.Toolbar.extend({
	options: {
		polyline: {},
		polygon: {},
		rectangle: {},
		circle: {},
		marker: {}
	},
	initialize: function(a) {
		for (var b in this.options) this.options.hasOwnProperty(b) && a[b] && (a[b] = L.extend({}, this.options[b], a[b]));
		L.Toolbar.prototype.initialize.call(this, a)
	},
	addToolbar: function(a) {
		var b = L.DomUtil.create("div", "leaflet-draw-section"),
			c = 0;
		this._toolbarContainer = L.DomUtil.create("div", "leaflet-draw-toolbar leaflet-bar");
		this.options.polyline && this._initModeHandler(new L.Draw.Polyline(a, this.options.polyline),
			this._toolbarContainer, c++, "leaflet-draw-draw", L.drawLocal.draw.toolbar.buttons.polyline);
		this.options.polygon && this._initModeHandler(new L.Draw.Polygon(a, this.options.polygon), this._toolbarContainer, c++, "leaflet-draw-draw", L.drawLocal.draw.toolbar.buttons.polygon);
		this.options.rectangle && this._initModeHandler(new L.Draw.Rectangle(a, this.options.rectangle), this._toolbarContainer, c++, "leaflet-draw-draw", L.drawLocal.draw.toolbar.buttons.rectangle);
		this.options.circle && this._initModeHandler(new L.Draw.Circle(a,
			this.options.circle), this._toolbarContainer, c++, "leaflet-draw-draw", L.drawLocal.draw.toolbar.buttons.circle);
		this.options.marker && this._initModeHandler(new L.Draw.Marker(a, this.options.marker), this._toolbarContainer, c++, "leaflet-draw-draw", L.drawLocal.draw.toolbar.buttons.marker);
		this._lastButtonIndex = --c;
		this._actionsContainer = this._createActions([{
			title: L.drawLocal.draw.toolbar.actions.title,
			text: L.drawLocal.draw.toolbar.actions.text,
			callback: this.disable,
			context: this
		}]);
		b.appendChild(this._toolbarContainer);
		b.appendChild(this._actionsContainer);
		return b
	},
	setOptions: function(a) {
		L.setOptions(this, a);
		for (var b in this._modes) this._modes.hasOwnProperty(b) && a.hasOwnProperty(b) && this._modes[b].handler.setOptions(a[b])
	}
});
L.EditToolbar = L.Toolbar.extend({
	options: {
		edit: {
			selectedPathOptions: {
				color: "#fe57a1",
				opacity: 0.6,
				dashArray: "10, 10",
				fill: !0,
				fillColor: "#fe57a1",
				fillOpacity: 0.1
			}
		},
		remove: {},
		featureGroup: null
	},
	initialize: function(a) {
		a.edit && ("undefined" === typeof a.edit.selectedPathOptions && (a.edit.selectedPathOptions = this.options.edit.selectedPathOptions), a.edit = L.extend({}, this.options.edit, a.edit));
		a.remove && (a.remove = L.extend({}, this.options.remove, a.remove));
		L.Toolbar.prototype.initialize.call(this, a);
		this._selectedFeatureCount =
			0
	},
	addToolbar: function(a) {
		var b = L.DomUtil.create("div", "leaflet-draw-section"),
			c = 0,
			d = this.options.featureGroup;
		this._toolbarContainer = L.DomUtil.create("div", "leaflet-draw-toolbar leaflet-bar");
		this._map = a;
		this.options.edit && this._initModeHandler(new L.EditToolbar.Edit(a, {
			featureGroup: d,
			selectedPathOptions: this.options.edit.selectedPathOptions
		}), this._toolbarContainer, c++, "leaflet-draw-edit", L.drawLocal.edit.toolbar.buttons.edit);
		this.options.remove && this._initModeHandler(new L.EditToolbar.Delete(a, {
			featureGroup: d
		}), this._toolbarContainer, c++, "leaflet-draw-edit", L.drawLocal.edit.toolbar.buttons.remove);
		this._lastButtonIndex = --c;
		this._actionsContainer = this._createActions([{
			title: L.drawLocal.edit.toolbar.actions.save.title,
			text: L.drawLocal.edit.toolbar.actions.save.text,
			callback: this._save,
			context: this
		}, {
			title: L.drawLocal.edit.toolbar.actions.cancel.title,
			text: L.drawLocal.edit.toolbar.actions.cancel.text,
			callback: this.disable,
			context: this
		}]);
		b.appendChild(this._toolbarContainer);
		b.appendChild(this._actionsContainer);
		this._checkDisabled();
		d.on("layeradd layerremove", this._checkDisabled, this);
		return b
	},
	removeToolbar: function() {
		L.Toolbar.prototype.removeToolbar.call(this);
		this.options.featureGroup.off("layeradd layerremove", this._checkDisabled, this)
	},
	disable: function() {
		this.enabled() && (this._activeMode.handler.revertLayers(), L.Toolbar.prototype.disable.call(this))
	},
	_save: function() {
		this._activeMode.handler.save();
		this._activeMode.handler.disable()
	},
	_checkDisabled: function() {
		var a = 0 !== this.options.featureGroup.getLayers().length,
			b;
		this.options.edit && (b = this._modes[L.EditToolbar.Edit.TYPE].button, a ? L.DomUtil.removeClass(b, "leaflet-disabled") : L.DomUtil.addClass(b, "leaflet-disabled"), b.setAttribute("title", a ? L.drawLocal.edit.toolbar.buttons.edit : L.drawLocal.edit.toolbar.buttons.editDisabled));
		this.options.remove && (b = this._modes[L.EditToolbar.Delete.TYPE].button, a ? L.DomUtil.removeClass(b, "leaflet-disabled") : L.DomUtil.addClass(b, "leaflet-disabled"), b.setAttribute("title", a ? L.drawLocal.edit.toolbar.buttons.remove : L.drawLocal.edit.toolbar.buttons.removeDisabled))
	}
});
L.EditToolbar.Edit = L.Handler.extend({
	statics: {
		TYPE: "edit"
	},
	includes: L.Mixin.Events,
	initialize: function(a, b) {
		L.Handler.prototype.initialize.call(this, a);
		this._selectedPathOptions = b.selectedPathOptions;
		this._featureGroup = b.featureGroup;
		if (!(this._featureGroup instanceof L.FeatureGroup)) throw Error("options.featureGroup must be a L.FeatureGroup");
		this._uneditedLayerProps = {};
		this.type = L.EditToolbar.Edit.TYPE
	},
	enable: function() {
		!this._enabled && this._hasAvailableLayers() && (L.Handler.prototype.enable.call(this),
			this._featureGroup.on("layeradd", this._enableLayerEdit, this).on("layerremove", this._disableLayerEdit, this), this.fire("enabled", {
				handler: this.type
			}), this._map.fire("draw:editstart", {
				handler: this.type
			}))
	},
	disable: function() {
		this._enabled && (this.fire("disabled", {
			handler: this.type
		}), this._map.fire("draw:editstop", {
			handler: this.type
		}), this._featureGroup.off("layeradd", this._enableLayerEdit, this).off("layerremove", this._disableLayerEdit, this), L.Handler.prototype.disable.call(this))
	},
	addHooks: function() {
		var a =
			this._map;
		a && (a.getContainer().focus(), this._featureGroup.eachLayer(this._enableLayerEdit, this), this._tooltip = new L.Tooltip(this._map), this._tooltip.updateContent({
			text: L.drawLocal.edit.handlers.edit.tooltip.text,
			subtext: L.drawLocal.edit.handlers.edit.tooltip.subtext
		}), this._map.on("mousemove", this._onMouseMove, this))
	},
	removeHooks: function() {
		this._map && (this._featureGroup.eachLayer(this._disableLayerEdit, this), this._uneditedLayerProps = {}, this._tooltip.dispose(), this._tooltip = null, this._map.off("mousemove",
			this._onMouseMove, this))
	},
	revertLayers: function() {
		this._featureGroup.eachLayer(function(a) {
			this._revertLayer(a)
		}, this)
	},
	save: function() {
		var a = new L.LayerGroup;
		this._featureGroup.eachLayer(function(b) {
			b.edited && (a.addLayer(b), b.edited = !1)
		});
		this._map.fire("draw:edited", {
			layers: a
		})
	},
	_backupLayer: function(a) {
		var b = L.Util.stamp(a);
		this._uneditedLayerProps[b] || (this._uneditedLayerProps[b] = a instanceof L.Polyline || a instanceof L.Polygon || a instanceof L.Rectangle ? {
				latlngs: L.LatLngUtil.cloneLatLngs(a.getLatLngs())
			} :
			a instanceof L.Circle ? {
				latlng: L.LatLngUtil.cloneLatLng(a.getLatLng()),
				radius: a.getRadius()
			} : {
				latlng: L.LatLngUtil.cloneLatLng(a.getLatLng())
			})
	},
	_revertLayer: function(a) {
		var b = L.Util.stamp(a);
		a.edited = !1;
		this._uneditedLayerProps.hasOwnProperty(b) && (a instanceof L.Polyline || a instanceof L.Polygon || a instanceof L.Rectangle ? a.setLatLngs(this._uneditedLayerProps[b].latlngs) : a instanceof L.Circle ? (a.setLatLng(this._uneditedLayerProps[b].latlng), a.setRadius(this._uneditedLayerProps[b].radius)) : a.setLatLng(this._uneditedLayerProps[b].latlng))
	},
	_toggleMarkerHighlight: function(a) {
		a._icon && (a = a._icon, a.style.display = "none", L.DomUtil.hasClass(a, "leaflet-edit-marker-selected") ? (L.DomUtil.removeClass(a, "leaflet-edit-marker-selected"), this._offsetMarker(a, -4)) : (L.DomUtil.addClass(a, "leaflet-edit-marker-selected"), this._offsetMarker(a, 4)), a.style.display = "")
	},
	_offsetMarker: function(a, b) {
		var c = parseInt(a.style.marginTop, 10) - b,
			d = parseInt(a.style.marginLeft, 10) - b;
		a.style.marginTop = c + "px";
		a.style.marginLeft = d + "px"
	},
	_enableLayerEdit: function(a) {
		a = a.layer ||
			a.target || a;
		var b = a instanceof L.Marker,
			c;
		if (!b || a._icon) this._backupLayer(a), this._selectedPathOptions && (c = L.Util.extend({}, this._selectedPathOptions), b ? this._toggleMarkerHighlight(a) : (a.options.previousOptions = a.options, a instanceof L.Circle || a instanceof L.Polygon || a instanceof L.Rectangle || (c.fill = !1), a.setStyle(c))), b ? (a.dragging.enable(), a.on("dragend", this._onMarkerDragEnd)) : a.editing.enable()
	},
	_disableLayerEdit: function(a) {
		a = a.layer || a.target || a;
		a.edited = !1;
		this._selectedPathOptions && (a instanceof L.Marker ? this._toggleMarkerHighlight(a) : (a.setStyle(a.options.previousOptions), delete a.options.previousOptions));
		a instanceof L.Marker ? (a.dragging.disable(), a.off("dragend", this._onMarkerDragEnd, this)) : a.editing.disable()
	},
	_onMarkerDragEnd: function(a) {
		a.target.edited = !0
	},
	_onMouseMove: function(a) {
		this._tooltip.updatePosition(a.latlng)
	},
	_hasAvailableLayers: function() {
		return 0 !== this._featureGroup.getLayers().length
	}
});
L.EditToolbar.Delete = L.Handler.extend({
	statics: {
		TYPE: "remove"
	},
	includes: L.Mixin.Events,
	initialize: function(a, b) {
		L.Handler.prototype.initialize.call(this, a);
		L.Util.setOptions(this, b);
		this._deletableLayers = this.options.featureGroup;
		if (!(this._deletableLayers instanceof L.FeatureGroup)) throw Error("options.featureGroup must be a L.FeatureGroup");
		this.type = L.EditToolbar.Delete.TYPE
	},
	enable: function() {
		!this._enabled && this._hasAvailableLayers() && (L.Handler.prototype.enable.call(this), this._deletableLayers.on("layeradd",
			this._enableLayerDelete, this).on("layerremove", this._disableLayerDelete, this), this.fire("enabled", {
			handler: this.type
		}), this._map.fire("draw:editstart", {
			handler: this.type
		}))
	},
	disable: function() {
		this._enabled && (L.Handler.prototype.disable.call(this), this._deletableLayers.off("layeradd", this._enableLayerDelete, this).off("layerremove", this._disableLayerDelete, this), this.fire("disabled", {
			handler: this.type
		}), this._map.fire("draw:editstop", {
			handler: this.type
		}))
	},
	addHooks: function() {
		var a = this._map;
		a && (a.getContainer().focus(),
			this._deletableLayers.eachLayer(this._enableLayerDelete, this), this._deletedLayers = new L.layerGroup, this._tooltip = new L.Tooltip(this._map), this._tooltip.updateContent({
				text: L.drawLocal.edit.handlers.remove.tooltip.text
			}), this._map.on("mousemove", this._onMouseMove, this))
	},
	removeHooks: function() {
		this._map && (this._deletableLayers.eachLayer(this._disableLayerDelete, this), this._deletedLayers = null, this._tooltip.dispose(), this._tooltip = null, this._map.off("mousemove", this._onMouseMove, this))
	},
	revertLayers: function() {
		this._deletedLayers.eachLayer(function(a) {
				this._deletableLayers.addLayer(a)
			},
			this)
	},
	save: function() {
		this._map.fire("draw:deleted", {
			layers: this._deletedLayers
		})
	},
	_enableLayerDelete: function(a) {
		(a.layer || a.target || a).on("click", this._removeLayer, this)
	},
	_disableLayerDelete: function(a) {
		a = a.layer || a.target || a;
		a.off("click", this._removeLayer, this);
		this._deletedLayers.removeLayer(a)
	},
	_removeLayer: function(a) {
		a = a.layer || a.target || a;
		this._deletableLayers.removeLayer(a);
		this._deletedLayers.addLayer(a)
	},
	_onMouseMove: function(a) {
		this._tooltip.updatePosition(a.latlng)
	},
	_hasAvailableLayers: function() {
		return 0 !==
			this._deletableLayers.getLayers().length
	}
});