  function endall(transition, callback) { //on d3 transition end
    console.trace()
    if (typeof callback !== "function") throw new Error("Wrong callback in endall");
    if (transition.size() === 0) { 

      callback() 

    }
      var n = 0; 
    transition 
    .each(function() { ++n; }) 
    .each("end", function() { 
      if (!--n) 
        callback.apply(this, arguments); 
    }); 
  } 
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

      function update(newData,callback){
        var data = d3.nest()
        .key(function(d) {
          return d.name;
        })
        .rollup(function(d) {
          return d3.sum(d, function(g) {
            return g.total;
          });
        }).entries(newData);
        var bar=hist_svg.selectAll(".bar")
        .data(data);
        bar.exit().remove()

        x.domain(data.map(function(d) {

          return d.key;
        }));

        hist_svg.select(".x")        
        .transition().duration( 1000)
        .call(xAxis);

        bar.attr("class", "bar")
        .transition().duration(1000)
        .attr("x", function(d) {




          return x(d.key);
        }).transition()
        .call(endall,callback)
        .duration(1000)
        .attr("width", x.rangeBand())
        console.log("update")

      }

      function drawInfo2(totalDqVotes,totalVotes,seats,callback){
        console.log('drawInfo2')
        d3.select('#threshold').attr('class','erase')
        var p = document.querySelector("#threshold");
        console.log('aaas')
        console.log(p)
       p.addEventListener("animationend", function temp(){
         d3.select("#threshold").remove();
         var csstyping=d3.select(".css-typing");
         csstyping.append('p')
         .html('Votes of disqualified lists: '+totalDqVotes)
         csstyping.append('p')
         .attr('id','adjustedTotal')
         .html('Adjusted Total: Total Votes - Votes of disqualified list = '+ (totalVotes-totalDqVotes) );
         csstyping.append('p')
         .attr('id','threshold')
         .html("New Threshold: Adjusted Total / seats = <span style='color:blue'>"+ (totalVotes-totalDqVotes)/seats+"</span>")
         var adjustedTotal=document.querySelector("#threshold");
         adjustedTotal.addEventListener("animationend",
          function temp2(){
          callback();
          this.removeEventListener("animationend",temp2);
        },false);
        this.removeEventListener("animationend",temp)


       }, false);







      }
      function drawHistogram(districtResults) {

       var threshold=(districtResults["totalVotes"]+districtResults["blank"])/districtResults["seats"]["total"]
       var qualification=findDQ(threshold,districtResults['lists']) 
       var dq=qualification[0];
       var q=qualification[1];

       var totalDqVotes=0
       for (var i=0;i<dq.length;i++){
        totalDqVotes+=dq[i].total;
      }




      var totalVotes = districtResults['totalVotes'];
      var max=0;
      var data = d3.nest()
      .key(function(d) {
        return d.name;
      })
      .rollup(function(d) {
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
            .transition()
            .call(endall,function(){
              mainChain(threshold,districtResults,dq,q,totalDqVotes,totalVotes)
            })

            .duration(1000)
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


          }
          function mainChain(threshold,districtResults,dq,q,totalDqVotes,totalVotes){
            console.log('mainChain')
            drawInfo1(threshold,districtResults,function(){
              console.log('1111')
                drawThreshold(threshold,"red","threshold1",
                function dtCallback(){
                disqualify(dq,q,function(){
                  drawInfo2(totalDqVotes,totalVotes,districtResults["seats"]["total"],function(){
                    d3.select('#threshold1')
                    .transition()
                    .call(endall,function(){
                      drawThreshold((totalVotes-totalDqVotes)/districtResults["seats"]["total"],"blue","threshold2");

                    })
                    .duration(1000)
                    .style('stroke-width','1px').style('opacity',0.5);

                  })
                });

             })

            })
          }
          function disqualify(dq,q,callback){
            console.log('disqualify')
            for(var i=0;i<dq.length;i++)
              d3.select("#"+dq[i].name.replace(' ','')).attr("class","blink");
            setTimeout(function(){
              d3.selectAll(".blink").remove();
              update(q,callback)
            },4000)
          }
          function findDQ(threshold,listVotes){
            var dq=[]
            var q=[]
            for(var i=0;i<listVotes.length;i++){
              if(listVotes[i].total<threshold)
                dq.push(listVotes[i]);
              else 
                q.push(listVotes[i]);
            }
            return [dq,q];
          }
          function drawThreshold(threshold,color,id,callback){
            console.log('drawing threshold')
            console.log(color);
            if (callback){
              hist_svg.append("g")
              .attr("transform", "translate(0, "+y(threshold)+")")
              .append("line")
              .attr("id",id)
              .style("stroke", color)
              .style("stroke-width", "5px")       
              .attr("x2", 0)

              .transition().duration(1000)
              .call(endall,callback)
              .attr("x2", hist_width)

            }
            else 
                hist_svg.append("g")
              .attr("transform", "translate(0, "+y(threshold)+")")
              .append("line")
              .attr("id",id)
              .style("stroke", color)
              .style("stroke-width", "5px")       
              .attr("x2", 0)

              .transition().duration(1000)
              .attr("x2", hist_width)

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
           .attr('id','threshold')
           .html("Threshold: Total valid votes/Number of seats= <span style='color:red'>"+threshold+"</span>")

           document.querySelector("#threshold").addEventListener("animationend",function temp(){
            callback();
            this.removeEventListener("animationend",temp);

          },false);

         }
         d3.json("data/results.json",  function(error, data) {
          console.log(error)
          drawHistogram(data['Mount-Lebanon-1'],  initializeHistogram())
        });
