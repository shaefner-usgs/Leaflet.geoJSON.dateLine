/**
 * This class extends L.GeoJSON to plot point data on both sides of the
 * International Date Line at the same time.
 */
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['leaflet'], factory);
  } else if (typeof module !== 'undefined') {
    // Node/CommonJS
    module.exports = factory(require('leaflet'));
  } else {
    // Browser globals
    if (typeof window.L === 'undefined') {
      throw new Error('Leaflet must be loaded first');
    }
    factory(window.L);
  }
}(function (L) {
  L.GeoJSON.DateLine = L.GeoJSON.extend({
    /**
     * Override addLayer from L.FeatureGroup.
     */
    addLayer: function (layer) {
      L.FeatureGroup.prototype.addLayer.call(this, layer);

      if (this._map) {
        this._render(); // ensure initial render plots on both sides of IDL
      }
    },

    /**
     * Override onAdd from L.LayerGroup.
     */
    onAdd: function (map) {
      map.on('moveend viewreset', this._render, this);

      this._render();
    },

    /**
     * Override onRemove from L.LayerGroup.
     */
    onRemove: function (map) {
      map.off('moveend viewreset', this._render, this);

      this.eachLayer(layer => {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
    },

    /**
     * Get the map's center.
     *
     * @return {Number}
     *     longitude value of map's center
     */
    _getCenter: function () {
      return this._map.getCenter().lng;
    },

    /**
     * Render the markers on both sides of the IDL.
     */
    _render: function () {
      var center = this._getCenter(),
          options = {
            max: center + 180,
            min: center - 180
          };

      this.eachLayer(layer => {
        this._update(layer, options);

        if (!this._map.hasLayer(layer)) {
          this._map.addLayer(layer);
        }
      });
    },

    /**
     * Update the given marker's position to be rendered in the visible map
     * area, accounting for copies of "wrapping" maps.
     *
     * @param layer {L.Layer}
     * @param options {Object}
     */
    _update: function (layer, options) {
      var latLng, status;

      if (layer.feature.geometry.type !== 'Point') return; // only update markers
          
      latLng = layer.getLatLng();

      while (latLng.lng <= options.min) {
        latLng.lng += 360;
        status = 'updated';
      }
      while (latLng.lng > options.max) {
        latLng.lng -= 360;
        status = 'updated';
      }

      if (status === 'updated') {
        layer.setLatLng(latLng);
      }
    }
  });


  L.geoJSON.dateLine = function (geojson, options) {
    return new L.GeoJSON.DateLine(geojson, options);
  };
}));
