var window_width = $(window).width(),
window_height = $(window).height();
var color = d3.scale.category20()

function drawMap() {
    d3.select("#overlay")
    .on("click",mapListener);
    var mapsvg = d3.select("#mapContainer").append("svg")
    .attr("id", "mapsvg")
    .on("click", mapListener)
    .attr("viewBox", "0 0 " + window_width + " " + window_height )
    .attr("preserveAspectRatio", "xMinYMin");


    d3.json("Coordinates/2009_districts_topojson.json", function(error, Lebanon) {
        if (error) throw error;
        var projection = d3.geo.mercator()
        .scale(window_width*12)
        .center([36, 34])

        .translate([window_width / 2, window_height / 2]);

        var map_path = d3.geo.path()
        .projection(projection);
        bigDistricts=['Mount-Lebanon-1','Mount-Lebanon-2','Mount-Lebanon-3','Mount-Lebanon-4','North-1','North-2','North-3','South-1','South-2','South-3','Bekaa-1','Bekaa-2','Bekaa-3','Beirut-1','Beirut-2']
        mapsvg.selectAll('.district')
        .data(topojson.feature(Lebanon, Lebanon.objects['2009_districts']).features.filter(function(d){
            if(d.properties.DISTRICT!=="Beirut-three")
                return true;
            else
                return false;
        }))
        .enter().append('path')
        .attr('class', 'smallDistrict')
        .attr('d', map_path)

        for (var i=0;i<bigDistricts.length;i++){
            var save_d=null
            let save_i=i;
            let district=bigDistricts[i];
            var bigDistrictgroup=mapsvg.append("g")
            .attr("name",bigDistricts[i])


            var bigDistrict=bigDistrictgroup.append("path").datum(topojson.merge(Lebanon, Lebanon.objects['2009_districts'].geometries.filter(function(d,q){
   // console.log(d) 

                if (d.properties.Combined==bigDistricts[i]){
                    save_d=Lebanon.objects['2009_districts']

                    return true;
                }
                else
                    return false
            })))
            .style('fill', function(d, j) { return color(i) })
            .attr('class', "bigDistrict")
            .attr("d", map_path)
            .on("click",function(d,j){
                console.log(save_i);
                console.log(j)
                console.log(d)
                console.log(i)
                console.log(district)
                municipalityListener(district);
            })
    //drawDistrictNames(bigDistrict,bigDistrictgroup,map_path,save_d)
}
  /* mapsvg.append("path").datum(topojson.merge(Lebanon, Lebanon.objects['2009_districts'].geometries))
    .attr('class', "entireCountry")
    .attr("d", map_path)
    

    /*
      mapsvg.append("path")
          .datum(topojson.mesh(Lebanon, Lebanon.objects['2009_districts']))
          .attr("class", "all")
          .attr("d", map_path); */
/*
districts = mapsvg.selectAll('.district')
      .data(topojson.feature(Lebanon, Lebanon.objects['2009_districts']).features)
    .enter().append('path')
      .attr('class', 'district')
      .attr('d', map_path)*/
      /* var map_g = mapsvg.selectAll(".subunit-boundary")
            .data(topojson.feature(Lebanon,Lebanon.objects['2009_districts']).features)
           /* .data(topojson.mesh(Lebanon,Lebanon.features,function(a,b){
                console.log(Lebanon)
                console.log(Lebanon.features)

            }))*/
        /*    .enter().append("g").attr("class", "districtContainer");

        map_g.append("path")
            .attr("d", map_path)
            .attr("fill-opacity", 0)
            .transition().duration(3000)
            .attr("fill-opacity", 1)
            .attr("class", function(d, i) {
                return "smalldistrictContainer" 
            })
            .attr("id", function(d, i) {
                return "province" + i
            })*/

/*mapsvg.append("path")
      .datum(topojson.feature(Lebanon, Lebanon.objects['2009_districts']))
      .attr("class", "state")
      .attr("d", map_path);
      console.log(Lebanon.objects['2009_districts'] )
  mapsvg.append("path")
      .datum(topojson.mesh(Lebanon, Lebanon.objects['2009_districts'], function(a, b) {
        console.log(a)
        console.log(b)
       return true }))
      .attr("class", "subunit-boundary")
      .attr("d", map_path);
      */



      drawDistrictNames2(mapsvg,map_path);
        //drawMunicipalities(mapsvg,map_g,map_path,projection);
    });

}

function drawDistrictNames2(mapsvg,map_path){
    mapsvg.selectAll(".bigDistrict").each(function (a, b) {
        var bigDistrictgroup=d3.select(this.parentNode);
        var path=d3.select(this);
        bigDistrictgroup        
        .append("text")
        .attr("font-size", "0.5vw")
        .attr("class", "districtName")
        .attr("transform", function(d) {
              return "translate(" + map_path.centroid(path.datum()) + ")";
      })
        .text(function(d) {
            if (bigDistrictgroup.attr("name").indexOf("Beirut") < 0 && bigDistrictgroup.attr("name").indexOf("Saida") < 0){
                return bigDistrictgroup.attr("name")
            }

        })

        .attr("dx", function(d) {
            var disName = bigDistrictgroup.attr("name");

            if (disName.indexOf("South-1") >= 0)
                return "1em"
        })
        .attr("dy", function(d) {
            var disName = bigDistrictgroup.attr("name");
            if (disName == "Mount-Lebanon-3" || disName == "Batroun")
                return "0.5em";
            else
                return "0em"
        })

        bigDistrictgroup.append("line")
        .attr("x1", function(d) {
            if (bigDistrictgroup.attr("name").indexOf("Beirut") >= 0 || bigDistrictgroup.attr("name").indexOf("Saida") >= 0){
                console.log('x1')
                return map_path.centroid(path.datum())[0];
            }

        })
        .attr("y1", function(d) {
            if (bigDistrictgroup.attr("name").indexOf("Beirut") >= 0 || bigDistrictgroup.attr("name").indexOf("Saida") >= 0){
                console.log('y1')

                return map_path.centroid(path.datum())[1];
            }
        })
        .attr("x2",
            function(d, i) {
                if (bigDistrictgroup.attr("name").indexOf("Beirut") >= 0 || bigDistrictgroup.attr("name").indexOf("Saida") >= 0){
                    console.log('x2')
                    return map_path.centroid(path.datum())[0] - 30;
                }

            })


        .attr("y2", function(d, i) {
            if (bigDistrictgroup.attr("name").indexOf("Beirut") >= 0 || bigDistrictgroup.attr("name").indexOf("Saida") >= 0) {
                
                if(bigDistrictgroup.attr("name").indexOf("Beirut-1")>=0)
                    return map_path.centroid(path.datum())[1]-30;
                else

                    return map_path.centroid(path.datum())[1];

            }

        })
        .attr("style", "stroke:black;stroke-width:1");

        bigDistrictgroup.append("text")
        .attr("font-size", "0.5vw")
        .attr("class", "districtName")
        .text(function(d) {
            if (bigDistrictgroup.attr("name").indexOf("Beirut") >= 0 || bigDistrictgroup.attr("name").indexOf("Saida") >= 0) {
                //if (bigDistrictgroup.attr("name").indexOf("Beirut") >= 0)
                    //return "Beirut"
                return bigDistrictgroup.attr("name");
            }
        }).attr("transform", function(d, i) {
            if (bigDistrictgroup.attr("name").indexOf("Beirut") >= 0 ||bigDistrictgroup.attr("name").indexOf("Saida") >= 0) {
                let xt = map_path.centroid(path.datum())[0] - 50;
                let yt = map_path.centroid(path.datum())[1] ;

                if(bigDistrictgroup.attr("name").indexOf("Beirut-1") >= 0 )
                    yt=yt-30
                return "translate(" + xt + "," + yt + ")";
            }
        })
    });

}
function makeZoomable(mapsvg,map_g,map_path,projection,save_d){

    var zoom = d3.behavior.zoom().on("zoom", function() {
        mapsvg.selectAll('.fontawesomeContainer').attr("transform", "translate(" + d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");

        map_g.attr("transform", "translate(" + d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
            //g.selectAll("circle")
            //.attr("r", nodeRadius / d3.event.scale);
            map_g.selectAll("path")
            .style('stroke-width', 0.5 / d3.event.scale)
            .attr("d", map_path.projection(projection));

            mapsvg.selectAll(".env").attr("style", function() {
                if (d3.event.scale != 1)
                    return "font-size:" + (12 / d3.event.scale) + 1 + "px";
            })

        }).scaleExtent([1, 1000]);

    mapsvg.call(zoom);
}
function drawDistrictNames(map_g, group, map_path,save_d) {
    group.append("text")
    .attr("font-size", "0.5vw")
    .attr("class", "districtName")
        .attr("transform", function(d) {/*
            if (d.properties.DISTRICT == "Zgharta")
                return "translate(" + map_path.centroid(d) + ") rotate(45)";*/
            console.log(d.properties.DISTRICT)
            if (d.properties.DISTRICT.indexOf("Beirut-one") >= 0){
                console.log("ini")
                return "translate(" + map_path.centroid(d) + ") rotate(-25)";
            }
            else if (d.properties.DISTRICT.indexOf("Beirut-two") >= 0)
                return "translate(" + map_path.centroid(d) + ") rotate(25)";
            else
              return "translate(" + map_path.centroid(map_g.datum()) + ")";
      })
        .text(function(d) {
            if (group.attr("name").indexOf("Beirut") < 0 && group.attr("name").indexOf("Saida") < 0){
                return group.attr("name")
            }

        })

        .attr("dx", function(d) {
            var disName = group.attr("name");

            if (disName.indexOf("Miniyeh") >= 0)
                return "0.5em"
        })
        .attr("dy", function(d) {
            var disName = group.attr("name");
            if (disName == "Zgharta" || disName == "Batroun")
                return "0.5em";
            else
                return "0em"
        })

        group.append("line")
        .attr("x1", function(d) {
            if (group.attr("name").indexOf("Beirut-one") >= 0 || group.attr("name").indexOf("Saida") >= 0)
                return map_path.centroid(save_d)[0];

        })
        .attr("y1", function(d) {
            if (group.attr("name").indexOf("Beirut-one") >= 0 || group.attr("name").indexOf("Saida") >= 0)
                return map_path.centroid(save_d)[1];

        })
        .attr("x2",
            function(d, i) {
                if (group.attr("name").indexOf("Beirut-one") >= 0 || group.attr("name").indexOf("Saida") >= 0)
                    return map_path.centroid(save_d)[0] - 30;

            })


        .attr("y2", function(d, i) {
            if (group.attr("name").indexOf("Beirut-one") >= 0 || group.attr("name").indexOf("Saida") >= 0) {

                return map_path.centroid(save_d)[1];

            }

        })
        .attr("style", "stroke:black;stroke-width:1");

        group.append("text")
        .attr("font-size", "0.5vw")
        .attr("class", "districtName")
        .text(function(d) {
            if (group.attr("name").indexOf("Beirut-three") >= 0 || group.attr("name").indexOf("Saida") >= 0) {
                if (group.attr("name").indexOf("Beirut-three") >= 0)
                    return "Beirut"
                return group.attr("name");
            }
        })
       /* .attr("transform", function(d, i) {
            d=map_g
            console.log(map_g)
            console.log(d)
            if (group.attr("name").indexOf("Beirut") >= 0 ||group.attr("name").indexOf("Saida") >= 0) {
                var xt = map_path.centroid(save_d)[0] - 60;
                var yt = map_path.centroid(save_d)[1] + Math.pow(-1, i) * 20;
                if (group.attr("name").indexOf("three") < 0 && group.attr("name").indexOf("Saida") < 0)
                    yt = map_path.centroid(save_d)[1] + Math.pow(-1, i) * 20;
                else {
                    yt = map_path.centroid(save_d)[1];
                }


                return "translate(" + xt + "," + yt + ")";
            }
        })*/
    }