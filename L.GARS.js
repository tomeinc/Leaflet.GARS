/*
 * L.GARS displays the Global Area Reference System on the map.
 */
(function(){
  "use strict";

  L.GARS = L.LayerGroup.extend({
    options: {
      // Path style for the grid lines
      bigStyle: {
        labelPos: {
          x: 0.5,
          y: 0.5,
        },
        stroke: true,
        color: '#111',
        opacity: 0.6,
        fill: false,
        fillOpacity: 0.42,
        fillColor: "#ccc",
        weight: 3
      },
      quadStyle: {
        labelPos: {
          x: 0.5,
          y: 0.5,
        },
        stroke: true,
        color: '#333',
        opacity: 0.6,
        fill: false,
        fillOpacity: 0.42,
        fillColor: "#ccc",
        weight: 2
      },
      tinyStyle: {
        labelPos: {
          x: 0.5,
          y: 0.5,
        },
        stroke: true,
        color: '#666',
        opacity: 0.6,
        fill: false,
        fillOpacity: 0.42,
        fillColor: "#ccc",
        weight: 1
      },

      //What zoom level each type of line shows up at
      zoom: {
        big: 7,
        quad: 9,
        tiny: 11,
        max: 20,
      },

      // Redraw on move or moveend
      // Can be any leaflet event, but move and moveend are the sensible ones.
      // Will also be called on viewreset.
      redraw: 'move'
    },

    initialize: function (options) {
      L.LayerGroup.prototype.initialize.call(this);
      L.Util.setOptions(this, options);
    },

    onAdd: function (map) {
      this._map = map;

      map.on('viewreset ' + this.options.redraw, this.redraw, this);
      this.redraw();
    },


    onRemove: function (map) {
      this.eachLayer(this.removeLayer, this);
      map.off('viewreset ' + this.options.redraw, this.redraw, this);
    },

    GARSclickMouseover: function(e){
      //var newStyle = e.target.options;
      //if(e.type == "mouseout"){
      //  newStyle.fill = false;
      //}else{
      //  newStyle.fill = true;
      //}
      //e.target.setStyle(newStyle);

    },

    redraw: function () {
      var bigBounds =  L.GARSUtil.roundBounds(this._map.getBounds(), 0.5);
      var quadBounds = L.GARSUtil.roundBounds(this._map.getBounds(), 0.25);
      var tinyBounds = L.GARSUtil.roundBounds(this._map.getBounds(), 0.25/3);

      //Bounds are now alligned with the big section piece thingy...
      var bigBlocks = [];
      var quadBlocks = [];
      var tinyBlocks = [];

      var zoom = this._map.getZoom();
      var zoomLevels = this.options.zoom;
      var drawLabel;//Do you draw the label

      if(zoom > zoomLevels.big){
        //Big blocks are 0.5x0.5 lat/lng squares
        drawLabel = this.zoomInRange(zoom, zoomLevels.big, zoomLevels.quad);
        bigBlocks = this.calculateBlocks(bigBounds, 0.5, this.options.bigStyle, drawLabel, 'bigLabel', 5);

        if(zoom > zoomLevels.quad){
          //quadBlocks are .25 degree squares, 4 per bigBlock
          drawLabel = this.zoomInRange(zoom, zoomLevels.quad, zoomLevels.tiny);
          quadBlocks = this.calculateBlocks(quadBounds, 0.25, this.options.quadStyle, drawLabel, 'quadLabel', 6);

          if(zoom > zoomLevels.tiny){
            //tinyBlocks are .25/3 degrees, nine per quadBlock
            drawLabel = this.zoomInRange(zoom, zoomLevels.tiny, zoomLevels.max);
            tinyBlocks = this.calculateBlocks(tinyBounds, 0.25/3, this.options.tinyStyle, drawLabel, 'tinyLabel', 7);
          }
        }
      }

      this.eachLayer(this.removeLayer, this);
      var i;
      for (i in bigBlocks) {
        this.addLayer(bigBlocks[i]);
      }
      for (i in quadBlocks) {
        this.addLayer(quadBlocks[i]);
      }
      for (i in tinyBlocks) {
        this.addLayer(tinyBlocks[i]);
      }
      return this;
    },

    calculateBlocks: function(bounds, increment, style, drawLabel, labelClass, labelLen){
      var labelPos = style.labelPos;
      var ret = [];
      //For every west side
      for(var bw = bounds.getWest(); bw < bounds.getEast(); bw += increment){
        //For every south side
        for(var bs = bounds.getSouth(); bs < bounds.getNorth(); bs += increment){
          //every southWest corner
          var rect = L.rectangle([[bs,bw],[bs+increment,bw+increment]],style);//.on("mouseover mouseout click", this.GARSclickMouseover)
          ret.push(rect);
          if(drawLabel){
            ret.push(L.marker(L.latLng(bs+labelPos.x*increment,bw+labelPos.y*increment), {
              icon: L.divIcon({
                iconSize: [39, 18],
                iconAnchor: [15,9],//hardcodes because that's how big the font is for me....
                className: 'leaflet-grid-label',
                //TODO: Maybe don't use labelPos...
                html: '<div class="' + labelClass + '">' + L.GARSUtil.latLng2GARS(bs+labelPos.x*increment,bw+labelPos.y*increment).substr(0,labelLen) + '</div>'
              })
            }));
          }
        }
      }//end block calculation
      return ret;
    },

    zoomInRange: function(zoom, min, max){
      return min <= zoom && zoom <= max;
    },

  });

  L.GARSUtil = {
    //Round bounds to the next biggest increment
    roundBounds: function(bounds, increment){
      var sw = bounds.getSouthWest();
      var ne = bounds.getNorthEast();
      if(sw.lat > 0){
        sw.lat -= sw.lat % increment;
      }else if(sw.lat < 0){
        sw.lat -= increment + (sw.lat % increment);
      }//else it's 0, good enough
      if(sw.lng > 0){
        sw.lng -= sw.lng % increment;
      }else if(sw.lng < 0){
        sw.lng -= increment + (sw.lng % increment);
      }//else it's 0, good enough

      if(ne.lat > 0){
        ne.lat += increment - (ne.lat % increment);
      }else if(ne.lat < 0){
        ne.lat -= ne.lat % increment;
      }//else it's 0, good enough
      if(ne.lng > 0){
        ne.lng += increment - (ne.lng % increment);
      }else if(ne.lng < 0){
        ne.lng -= ne.lng % increment;
      }//else it's 0, good enough
      bounds.extend(sw);
      bounds.extend(ne);
      return bounds;
    },

    //Pass in a lat/lng, get out a GARS string. Shorten it yourself
    latLng2GARS: function(lat,lng){
      var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";//Missing I and O. 24 chars.
      //Lat [-90,90]
      //lng [-180,180]
      if(lat < -90 || lat > 90 || lng < -180 || lng > 180){
        console.error("arguments to latLng2GARS out of bounds");
        return -1;
      }
      //Adjust lat/lng to a better range
      var aLat = (lat+90)*2;
      var aLng = (lng+180)*2;
      var adjNumber = 0.0000001;//TODO better number
      if(aLat === 360) aLat -= adjNumber;
      if(aLat === 0)   aLat += adjNumber;
      if(aLng === 0)   aLng += adjNumber;
      if(aLng === 720) aLng -= adjNumber;
      //aLat (0,360)
      //aLng (0,720)
      //Variable names of a number are what characters in the final return they represent
      var firstThree = Math.ceil(aLng);
      var fourFiveValue = Math.floor(aLat);
      firstThree = "000" + firstThree;//000 and up to three more digits, now trim to three...
      firstThree = firstThree.substr(firstThree.length-3);//Now have the first three chars, or firstThree but zero padded.
      var fourFive = chars[Math.floor(fourFiveValue / 24)];
      fourFive += chars[fourFiveValue % 24];
      var subLat = Math.round((aLat-Math.floor(aLat))*5);
      var subLng = Math.round((aLng-Math.floor(aLng))*5);
      //subLat [0,5]
      //subLng [0,5]
      // 1 sub lat/lng represent the .5 degree squares, or bigBlocks
      var six;
      var seven;
      if(subLng >= 3){
        six = 2;
      }else{
        six = 1;
      }
      seven = subLng % 3 + 1;
      if(subLat < 3){
        six += 2;
      }
      seven += (2-subLat%3)*3;

      return firstThree + fourFive + six + seven;
    },

    //Pass in a GARS string, get back the [sw,ne] lat/lng points.
    GARS2LatLngBounds: function(gars){
      var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";//Missing I and O. 24 chars.
      //[SW,NE]
      var bounds = [[0,0],[0,0]];
      if(gars.length < 5){
        alert("bad");
        return -1;
      }
      var firstThree = parseInt(gars.substr(0,3));
      var fourFive = chars.indexOf(gars[3])*24 + chars.indexOf(gars[4]);
      bounds[0][0] = fourFive/2 - 90;
      bounds[1][0] = fourFive/2 - 90 + 0.5;
      bounds[0][1] = firstThree/2 - 180 - 0.5;
      bounds[1][1] = firstThree/2 - 180;

      if(gars.length > 5){
        //Got precision
        var six = parseInt(gars[5]);
        if(six%2){
          //odd, is 1 or 3
          bounds[1][1] -= 0.25;
        }else{
          //even, is 2 or 4
          bounds[0][1] += 0.25;
        }
        if(six >= 3){
          //Bottom
          bounds[1][0] -= 0.25;
        }else{
          bounds[0][0] += 0.25;
        }
        if(gars.length > 6){
          //Tiny thing!
          var seven = parseInt(gars[6]);
          bounds[0][0] += (2-Math.floor((seven-1)/3)) * 0.25/3;
          bounds[1][0] -= Math.floor((seven-1)/3)     * 0.25/3;

          bounds[0][1] += (seven-1)%3*0.25/3;
          bounds[1][1] -= (2-(seven-1)%3)*0.25/3;
        }
      }
      return bounds;
    },
  };

  L.gars = function (options) {
    return new L.GARS(options);
  };
})();



//TODO: put these back in module and test by results of http://stackoverflow.com/q/40848962/2423187

