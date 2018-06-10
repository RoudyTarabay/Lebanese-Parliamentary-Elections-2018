function endall(transition, callback) {
    //on d3 transition end
    if (overlayClick != null) {
        console.log("not appending");
        return;
    }
    if (typeof callback !== "function")
        throw new Error("Wrong callback in endall");
    if (transition.size() === 0) {
        callback();
    }
    var n = 0;
    transition
        .each(function() {
            ++n;
        })
        .each("end", function() {
            if (!--n) callback.apply(this, arguments);
        });
}

function barChart(results, qualifiedNum, threshold2) {
    let data = [];
    smallDistrictsTotal = results["districtTotal"];
    console.log(smallDistrictsTotal);
    let count = qualifiedNum;
    for (let i = 0; i < count; i++) {
        if ("candidates" in results["lists"][i])
            if (i == count - 1)
                draw(
                    results["lists"][i]["name"],
                    results["lists"][i]["candidates"],
                    smallDistrictsTotal,
                    qualifiedNum,
                    results["lists"][i]["total"] / threshold2,
                    () => {
                        mainchain2(results["seats"]);
                    }
                );
            else
                draw(
                    results["lists"][i]["name"],
                    results["lists"][i]["candidates"],
                    smallDistrictsTotal,
                    qualifiedNum,
                    results["lists"][i]["total"] / threshold2
                );
        else count++;
    }
}
function mainchain2(districtSeats) {
    console.log(districtSeats);
    d3.select(".css-typing")
        .selectAll("*")
        .attr("class", "erase");
    let eraseNum = d3.selectAll(".erase")[0].length;
    console.log(d3.selectAll(".erase"));
    console.log(eraseNum);
    d3.selectAll(".erase").each(function(d, i) {
        console.log(d);
        console.log(i);
        console.log(this);
        d3.select(this).on("animationend", function() {
            this.remove();
        });
        if (i + 1 == eraseNum) {
            drawInfo3(districtSeats);
        }
    });
}
function drawInfo3(districtSeats) {
    let keys=Object.keys(districtSeats)
    let csstyping = d3.select(".css-typing");
    csstyping
        .append("p")
        .html("Total Number Of Seats: " + districtSeats["total"]);
    csstyping
        .append("p")
        .html("<span id='remaining'" + districtSeats["total"] + "</span>");
    for ( let i=0;i<keys.length-1;i++)
    csstyping
        .append("p")
        .attr("id", keys[i])
        .html(keys[i]+" : 0/"+districtSeats[keys[i]]);




}
//sort bars based on value

//set up svg using margin conventions - we'll need plenty of room on the left for labels
function draw(listName, data, sT, qualifiedNum, seatsSecured, callback) {
    console.log(data);
    data = data.sort(function(a, b) {
        return d3.ascending(a.votes / sT[a.district], b.votes / sT[b.district]);
    });

    margin = {
        top: 30,
        right: 50,
        bottom: 30,
        left: 90
    };
    svgdim2 = {
        width: $(".results").width(),
        height: $(".results").height() / 2
    };
    var width = svgdim2.width / qualifiedNum - margin.left - margin.right,
        height = svgdim2.height - margin.top - margin.bottom;

    var svg = d3
        .select("#barchart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("text")
        .attr("class", "barChartTitle")
        .attr("dy", "-0.5vw")
        .text(listName + "- seats : " + Math.floor(seatsSecured));
    var x = d3.scale
        .linear()
        .range([0, width])
        .domain([
            0,
            d3.max(data, function(d) {
                return (d.votes / sT[d.district]).toFixed(2) * 100;
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
        .attr("dx", "1em")

        //x position is 3 pixels to the right of the bar
        .attr("x", function(d) {
            return x(((d.votes / sT[d.district]) * 100).toFixed(2));
        })
        .text(function(d) {
            return ((d.votes / sT[d.district]) * 100).toFixed(2) + "%";
        })
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);
    //append rects
    if (callback)
        bars.append("rect")
            .attr("class", function(d) {
                console.log(d);
                return "barChartBar " + d["sect"];
            })
            .attr("y", function(d) {
                return y(d.name);
            })
            .attr("height", y.rangeBand())
            .attr("x", 0)
            .attr("width", 0)
            .transition()
            .call(endall, callback)
            .duration(1000)

            .attr("width", function(d) {
                return x((d.votes / sT[d.district]).toFixed(2) * 100);
            });
    else
        bars.append("rect")
            .attr("class", function(d) {
                console.log(d);
                return "barChartBar " + d["sect"];
            })
            .attr("y", function(d) {
                return y(d.name);
            })
            .attr("height", y.rangeBand())
            .attr("x", 0)
            .attr("width", 0)
            .transition()

            .duration(1000)

            .attr("width", function(d) {
                return x((d.votes / sT[d.district]).toFixed(2) * 100);
            });

    //add a value label to the right of each bar
}