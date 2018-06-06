data=[]

function barChart(bigDistrict){

  d3.json("data/results.json", function(error, datat) {
    console.log(datat["Mount-Lebanon-1"]["lists"]);
    console.log(datat["Mount-Lebanon-1"]["lists"][0])
    console.log(error)
    data=datat["Mount-Lebanon-1"]["lists"][0]['candidates'];
    draw();
    //let formatData=[]

    //drawBarchart(data["Mount-Lebanon-1"], initializeHistogram());
  });


}
barChart();

//sort bars based on value

//set up svg using margin conventions - we'll need plenty of room on the left for labels
function draw(){
console.log(data)
data = data.sort(function(a, b) {
    return d3.ascending(a.votes, b.votes);
});

var margin = {
    top: 0,
    right: 50,
    bottom: 0,
    left: 150
};

var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#graphic")
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
            return d.votes;
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
    .selectAll(".bar")
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
        return x(d.votes);
    })
    .text(function(d) {
        return d.votes;
    });
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
    .attr("width", function(d) {
        return x(d.votes);
    });

//add a value label to the right of each bar

}