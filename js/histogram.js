
  function initializeHistogram(){
    margin = {
        top: 30,
        right: 50,
        bottom: 30,
        left: 100
    };
    svgdim = {
      width: $('.results').width(),
      height: $('.results').height()
    };

    d3.select("#histdiv")
        .append("svg")
        .attr("id", "hist")
        //.attr("class", "hide")
        .attr("viewBox", "0 0 " +(svgdim.width)+" "+ ((svgdim.height/2)-12));

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
      hist_svg.selectAll(".bar").data(data).exit().remove();
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
              

          hist_svg.selectAll(".bar")
              .data(data)
              .enter().append("rect")
              .attr("class", "bar")
              .attr("x", function(d) {
              
                  return x(d.key);
              })
              .attr("width", x.rangeBand())

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
              });
         /* var threshold=(districtResults["totalVotes"]+districtResults["blank"])/districtResults["seats"]["total"]
          hist_svg.selectAll(".textInfo")
                  .append("g")
                  .attr("class","textInfo")
                  .append("text")*/
            hist_svg.call(tip);


  }
d3.json("data/results.json",  function(error, data) {
  console.log(error)
    drawHistogram(data['Mount-Lebanon-1'],  initializeHistogram())
});
