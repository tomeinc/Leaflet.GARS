describe('unit conversions', function(){


  describe('example point', function(){
    it('L.GARSUtil.latLng2GARS coordinates work for converts test data properly', function(){
      //From https://www.uscg.mil/hq/cg5/cg534/nsarc/GARS_BRIEF.ppt
      //Slide 14
      expect(L.GARSUtil.latLng2GARS(41.72,122.36)).toEqual("605LZ42");
    });

    it('GARS2LatLngBounds converts test data properly', function(){
      //This test is validated by http://www.earthpoint.us/Convert.aspx
      //Though that converter has edge case issues, I believe the non-edges are fine.
      expect(L.GARSUtil.GARS2LatLngBounds("605LZ42")).toEqual([ [ 41.666666666666664, 122.33333333333333 ], [ 41.75, 122.41666666666667 ] ]);
    });
  });

  describe('all four corners(except corner in next test set)', function(){
    it('L.GARSUtil.latLng2GARS coordinates work for 001AA37', function(){
      expect(L.GARSUtil.latLng2GARS(-90,-180)).toEqual("001AA37");
    });
    it('L.GARSUtil.latLng2GARS coordinates work for 720AA49', function(){
      expect(L.GARSUtil.latLng2GARS(-90,180)).toEqual("720AA49");
    });
    it('L.GARSUtil.latLng2GARS coordinates work for 720QZ23', function(){
      expect(L.GARSUtil.latLng2GARS(90,180)).toEqual("720QZ23");
    });
  });

  describe('One of each tiny row/col of a a big block', function(){
    it('L.GARSUtil.latLng2GARS coordinates work for 001QZ11', function(){
      expect(L.GARSUtil.latLng2GARS(90,-180)).toEqual("001QZ11");
    });
    it('L.GARSUtil.latLng2GARS coordinates work for 001QZ14', function(){
      expect(L.GARSUtil.latLng2GARS(89.875,-180)).toEqual("001QZ14");
    });
    it('L.GARSUtil.latLng2GARS coordinates work for 001QZ17', function(){
      expect(L.GARSUtil.latLng2GARS(89.76,-180)).toEqual("001QZ17");
    });
    it('L.GARSUtil.latLng2GARS coordinates work for 001QZ31', function(){
      expect(L.GARSUtil.latLng2GARS(89.74,-180)).toEqual("001QZ31");
    });
    it('L.GARSUtil.latLng2GARS coordinates work for 001QZ34', function(){
      expect(L.GARSUtil.latLng2GARS(89.625,-180)).toEqual("001QZ34");
    });
    it('L.GARSUtil.latLng2GARS coordinates work for 001QZ37', function(){
      expect(L.GARSUtil.latLng2GARS(89.51,-180)).toEqual("001QZ37");
    });
    it('L.GARSUtil.latLng2GARS coordinates work for 001QZ38', function(){
      expect(L.GARSUtil.latLng2GARS(89.51,-179.875)).toEqual("001QZ38");
    });
    it('L.GARSUtil.latLng2GARS coordinates work for 001QZ39', function(){
      expect(L.GARSUtil.latLng2GARS(89.51,-179.76)).toEqual("001QZ39");
    });
    it('L.GARSUtil.latLng2GARS coordinates work for 001QZ47', function(){
      expect(L.GARSUtil.latLng2GARS(89.51,-179.74)).toEqual("001QZ47");
    });
    it('L.GARSUtil.latLng2GARS coordinates work for 001QZ48', function(){
      expect(L.GARSUtil.latLng2GARS(89.51,-179.625)).toEqual("001QZ48");
    });
    it('L.GARSUtil.latLng2GARS coordinates work for 001QZ49', function(){
      expect(L.GARSUtil.latLng2GARS(89.51,-179.51)).toEqual("001QZ49");
    });
  });

});

describe('round bounds', function(){
  it('rounds bounds of 42.22,42.22 43.3,43.42 at increment 0.5 to 42,42, 43.5,43.5', function(){
    var bounds = L.latLngBounds(
      L.latLng(42.22, 42.22),
      L.latLng(43.3, 43.42)
    );
    var increment = 0.5;
    var finalBounds = L.latLngBounds(
      L.latLng(42, 42),
      L.latLng(43.5, 43.5)
    );
    var newBounds = L.GARSUtil.roundBounds(bounds, increment);
    expect(newBounds.equals(finalBounds)).toBeTruthy();
  });
});

describe('Instantiates in leaflet properly', function(){
  var map, overlay;
  
  beforeEach(function(){
    map = L.map(document.createElement('div'));
    overlay = L.gars();
    overlay.addTo(map);
  });
  it('exists(can create geo json, at least)', function(){
    //I'm assuming that if there are problems, it can't goto geo json.
    //This is hopefully not a poor assumption.
    var geoJSON = overlay.toGeoJSON();
    expect(geoJSON).toBeDefined();
  });
});
