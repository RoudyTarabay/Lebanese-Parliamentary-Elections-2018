
function initializeHistogram(){
  margin = {
    top: 30,
    right: 50,
    bottom: 30,
    left: 40
  };
  svgdim = {
    width: $('.results').width(),
    height: $('.results').height()
  };

  d3.select("#histdiv")
  .append("svg")
  .attr("id", "hist")
        //.attr("class", "hide")
        .attr("viewBox", "0 0 " +(((svgdim.width)/2)+40)+" "+ ((svgdim.height/2)-12));

        hist_width = (svgdim.width/2) ;
        hist_height = (svgdim.height/2) / 1.5;

        x = d3.scale.ordinal()
        .rangeRoundBands([0, hist_width], .1);

        y = d3.scale.linear()
        .range([hist_height, 0]);

        xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

        yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5);
        hist_svg = d3.select("#hist")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        hist_svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + hist_height + ")")
        .call(xAxis);
        return hist_svg

      }

      function update(newData){
        var bar=hist_svg.selectAll(".bar")
        .data(newData);
        bar.exit().remove()

        x.domain(newData.map(function(d) {

          return d.key;
        }));

        hist_svg.select(".x")        .transition().duration( 1000)
        .call(xAxis);

        bar.attr("class", "bar")
        .transition().duration(1000)
        .attr("x", function(d) {

          


          return x(d.key);
        }).transition().duration(1000)
        .attr("width", x.rangeBand())

      }
      function drawHistogram(districtResults) {

        var totalVotes = districtResults['totalVotes'];
        var max=0;
        var data = d3.nest()
        .key(function(d) {
          return d.name;
        })
        .rollup(function(d) {
          console.log(d[0].total)
          if(d[0].total>max)
            max=d[0].total;
          return d3.sum(d, function(g) {
            return g.total;
          });
        }).entries(districtResults['lists']);

        var bar=hist_svg.selectAll(".bar")
        .data(data);
        bar.exit().remove()
        y.domain([0, max]);

        x.domain(data.map(function(d) {

          return d.key;
        }));

        tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return "<strong>Votes: </strong> <span style='color:red'>" + d.values + "</span>"
        });

        hist_svg.select(".x").call(xAxis);


        hist_svg.select(".x").selectAll("text").attr("class","histogramLegendX")
        .attr("style","text-anchor:start")
            /*.attr("dy",function(d){
              return this.getComputedTextLength()/20+"em";
            });*/


            hist_svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Value");


            bar.enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {

              return x(d.key);
            })
            .attr("width", x.rangeBand())
            .attr("id",function(d){

             return (d.key).replace(' ','');


           })
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide)
            .attr("y",y(0))
            .attr("height",0)
            .transition().duration(1000)
            .attr("height", function(d) {
              return hist_height- y(d.values);
            })
            .attr("y", function(d) {
              return y(d.values);
            }).delay(function(d,i){
              return i*500;
            })

            hist_svg.selectAll(".bar").data(data).exit().remove();

            hist_svg.call(tip);

            var threshold=(districtResults["totalVotes"]+districtResults["blank"])/districtResults["seats"]["total"]
            var dq=findDQ(threshold,districtResults['lists'])         

            setTimeout(function(){
              drawInfo1(threshold,districtResults,function(){
                drawThreshold(threshold,function(){
                  disqualify(dq);
                })

              })
            }
            ,4000)


          }

          function disqualify(dq){
            for(var i=0;i<dq.length;i++)
              d3.select("#"+dq[i].replace(' ','')).attr("class","blink");
            setTimeout(function(){
              d3.selectAll(".blink").remove();
              update([
                {"key":"Altaghyeer AlAkid","values":26980},
                {"key":"Loubnan Alkawiy","values":54544},
                {"key":"3enna Alqarar","values":18553}

                ])
            },2000)
          }
          function findDQ(threshold,listVotes){
            var dq=[]
            for(var i=0;i<listVotes.length;i++){
              if(listVotes[i].total<threshold)
                dq.push(listVotes[i].name);
            }
            return dq
          }
          function drawThreshold(threshold,callback){
            hist_svg.append("g")
            .attr("transform", "translate(0, "+y(threshold)+")")
            .append("line")
            .style("stroke", "red")
            .style("stroke-width", "5px")       
            .attr("x2", 0)

            .transition().duration(1000)

            .attr("x2", hist_width)
            setTimeout(callback,2000)

          }

          function drawInfo1(threshold,districtResults,callback){
           var csstyping=d3.select("#histdiv")
           .append("div")
           .attr("id", "histInfo")
           .append("div")
           .attr("class","css-typing")
           csstyping.append("p")
           .html("Total valid votes(incl blank): "+(districtResults["totalVotes"]+districtResults["blank"]))
           csstyping.append("p")
           .html("Number of seats: "+ districtResults["seats"]["total"])
           csstyping.append("p")
           .html("Threshold: Total valid votes/Number of seats= <span style='color:red'>"+threshold+"</span>")

           setTimeout(callback,7000)
         }
         d3.json("data/results.json",  function(error, data) {
          console.log(error)
          drawHistogram(data['Mount-Lebanon-1'],  initializeHistogram())
        });
