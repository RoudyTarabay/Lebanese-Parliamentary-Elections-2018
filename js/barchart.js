
function barChart(bigDistrict,qualifiedNum){

  d3.json("data/results.json", function(error, datat) {
    let data=[];
    smallDistrictsTotal=datat["Mount-Lebanon-1"]["districtTotal"]; 

    for (let i=0;i<qualifiedNum;i++){
        if ('candidates' in datat[bigDistrict]["lists"][i])
            draw(datat[bigDistrict]["lists"][i]['candidates'],smallDistrictsTotal);
        else
            qualifiedNum++;
    }
  });


}

//sort bars based on value

//set up svg using margin conventions - we'll need plenty of room on the left for labels
function draw(data,sT){
console.log(data)
data = data.sort(function(a, b) {
    return d3.ascending(((a.votes/sT[a.district])),((b.votes/sT[b.district])));
});

  margin = {
    top: 30,
    right: 50,
    bottom: 30,
    left: 90
  };
  svgdim2 = {
    width: $(".results").width(),
    height: $(".results").height()/2
  };
var width = svgdim2.width/3 - margin.left - margin.right,
    height = svgdim2.height - margin.top - margin.bottom;

var svg = d3.select("#barchart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var x = d3.scale
    .linear()
    .range([0, width])
    .domain([
        0,
        d3.max(data, function(d) {
            return ((d.votes/sT[d.district])).toFixed(2)*100;
        })
    ]);

var y = d3.scale
    .ordinal()
    .rangeRoundBands([height, 0], 0.1)
    .domain(
        data.map(function(d) {
            return d.name;
        })
    );

//make y axis to show bar names
var yAxis = d3.svg
    .axis()
    .scale(y)
    //no tick marks
    .tickSize(0)
    .orient("left");

var gy = svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);

var bars = svg
    .selectAll(".barChartBar")
    .data(data)
    .enter()
    .append("g");
bars.append("text")
    .attr("class", "label")
    //y position of the label is halfway down the bar
    .attr("y", function(d) {
        return y(d.name) + y.rangeBand() / 2 + 4;
    })    
    .attr("dx","1em")

    //x position is 3 pixels to the right of the bar
    .attr("x", function(d) {
        return x(((d.votes/sT[d.district])*100).toFixed(2));
    })
    .text(function(d) {
        return ((d.votes/sT[d.district])*100).toFixed(2) +"%";
    })
    .style("opacity",0)
   .transition().duration(1000)
    .style("opacity",1);
//append rects
bars.append("rect")
    .attr("class", function(d){ 
        console.log(d)
        return "barChartBar "+d["sect"];
    })
    .attr("y", function(d) {
        return y(d.name);
    })
    .attr("height", y.rangeBand())
    .attr("x", 0)
        .attr("width", 0)
        .transition().duration(1000)

    .attr("width", function(d) {
        return x(((d.votes/sT[d.district])).toFixed(2)*100);
    });

//add a value label to the right of each bar

}