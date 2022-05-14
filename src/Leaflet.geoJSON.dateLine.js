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
    onAdd: function (map) {
      map.on('moveend viewreset', this._render, this);

      this._render();
    },

    onRemove: function (map) {
      map.off('moveend viewreset', this._render, this);

      this.eachLayer(marker => {
        if (this._map.hasLayer(marker)) {
          this._map.removeLayer(marker);
        }
      });
    },

    _getCenter: function () {
      return this._map.getCenter().lng;
    },

    _render: function () {
      var center = this._getCenter(),
          options = {
            max: center + 180,
            min: center - 180
          };

      this.eachLayer(marker => {
        this._update(marker, options);

        if (!this._map.hasLayer(marker)) {
          this._map.addLayer(marker);
        }
      });
    },

    _update: function (marker, options) {
      var latLng = marker.getLatLng();

      // set marker within view, accounting for copies of "wrapping" maps
      while (latLng.lng <= options.min) {
        latLng.lng += 360;
      }
      while (latLng.lng > options.max) {
        latLng.lng -= 360;
      }

      marker.setLatLng([latLng.lat, latLng.lng]);
    }
  });


  L.geoJSON.dateLine = function (geojson, options) {
    return new L.GeoJSON.DateLine(geojson, options);
  };
}));
