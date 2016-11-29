Leaflet.GARS
------------

Display a GARS(Global Area Reference System) overlay on a Leaflet 0.7.7 map.

Usage
-----
```
      map = new L.Map('map');

      // create the tile layer with correct attribution
      var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
      var osm = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 20, attribution: osmAttrib});

      map.setView(new L.LatLng(47.11922345184392, -88.54714393615723),11);
      map.addLayer(osm);

      var gars = L.gars().addTo(map);

      L.control.layers({
          'osm': osm
        }, {
          'GARS': gars
        }).addTo(map);
```
You can pass an optional `options` argument to `L.gars`, and it will overide any of the options shown at the top of `L.GARS.js`.

```
  var options = {
    bigStyle: {
      fill: true,
      fillOpacity: 0.42,
      fillColor: "#ccc",
      labelPos: {
        x: 0.25,
        y: 0.25,
      },
    },
    //and whatever else you want to change
  };
  var gars = L.gars(options).addTo(map);
```
Additionally, there are three css classes for styling the label text, `bigLabel`, `quadLabel`, and `tinyLabel`
