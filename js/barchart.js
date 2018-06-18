let yFormulas = [];
let xFormulas = [];
let seatPerSect = {};
let seatPerSmallDistrict = {};
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
function fillSeatPerSect(districtSeats) {
    let keys = Object.keys(districtSeats);
    for (let i = 0; i < keys.length - 1; i++) {
        seatPerSect[keys[i] + "_total"] = [];
        let smallDistricts = Object.keys(districtSeats[keys[i]]);

        for (let j = 0; j < smallDistricts.length - 1; j++) {
            seatPerSect[keys[i] + "_total"][smallDistricts[j]] = [];
            seatPerSect[keys[i] + "_total"][smallDistricts[j]]["seatNum"] =
                districtSeats[keys[i]][smallDistricts[j]];
            seatPerSect[keys[i] + "_total"][smallDistricts[j]]["counter"] = 0;
        }
        seatPerSect[keys[i] + "_total"]["total"] =
            districtSeats[keys[i]]["total"];
        seatPerSect[keys[i] + "_counter"] = 0;
    }
    seatPerSect["total"] = districtSeats["total"];
    seatPerSect["counter"] = 0;
}
function barChart(results, qualifiedNum, threshold2, extraSeatIndex) {
    let data = [];
    smallDistrictsTotal = results["districtTotal"];
    let count = qualifiedNum;
    fillSeatPerSect(results["seats"]);
    for (let i = 0; i < count; i++) {
        if ("candidates" in results["lists"][i])
            if (i == count - 1)
                draw(
                    results["lists"][i]["name"],
                    results["lists"][i]["candidates"],
                    smallDistrictsTotal,
                    qualifiedNum,
                    results["lists"][i]["total"] / threshold2,
                    extraSeatIndex,

                    () => {
                        mainchain2(results["seats"], smallDistrictsTotal);
                    }
                );
            else
                draw(
                    results["lists"][i]["name"],
                    results["lists"][i]["candidates"],
                    smallDistrictsTotal,
                    qualifiedNum,
                    results["lists"][i]["total"] / threshold2,
                    extraSeatIndex
                );
        else count++;
    }
}
function mainchain2(districtSeats, st) {
    d3.select(".css-typing")
        .selectAll("*")
        .attr("class", "erase");
    let eraseNum = d3.selectAll(".erase")[0].length;
    d3.selectAll(".erase").each(function(d, i) {
        d3.select(this).on("animationend", function() {
            this.remove();
        });
        if (i + 1 == eraseNum) {
            drawInfo3(districtSeats, st);
        }
    });
}
function drawInfo3(districtSeats, st) {

    let keys = Object.keys(districtSeats);
    let csstyping = d3.select(".css-typing");
    csstyping
        .append("p")
        .html("Total Number Of Seats: " + districtSeats["total"]);
    csstyping
        .append("p")
        .html(
            "Remaining seats : <span id='remaining'>" +
                districtSeats["total"] +
                "</span>"
        );
    for (let i = 0; i < keys.length - 1; i++) {
        csstyping
            .append("p")
            .html(
                keys[i] +
                    " : <span id='" +
                    keys[i] +
                    "'>" +
                    0 +
                    "</span>/" +
                    districtSeats[keys[i]]["total"]
            );
        let smallDistricts = Object.keys(districtSeats[keys[i]]);

        for (let j = 0; j < smallDistricts.length - 1; j++) {
            csstyping
                .append("p")
                .attr("class",'small-district-counter')
                .html(
                    smallDistricts[j] +
                        " : <span  id='" +
                        smallDistricts[j] +
                        "'>" +
                        0 +
                        "</span>/" +
                        districtSeats[keys[i]][smallDistricts[j]]
                );
        }
        if (i == keys.length - 2) {
            d3.selectAll("#" + keys[i]).each(function(d, i) {
                let parent = this.parentNode;
                parent = d3.select(parent);

                parent.on(
                    "animationend",
                    () => {
                        results(st);
                    },
                    false
                );
            });
        }
    }
}
function getHighestCandidate(st) {
    let max = 0;
    let maxCandidate = null;
    let maxCandidateList = null;
    d3.selectAll(".barSvg").each(function(d, i) {
        let selff = d3.select(this);

        let availableCandidates = d3
            .select(this)
            .selectAll(".available")
            .data();

        let data = d3
            .nest()
            .key(function(d) {
                return d.name;
            })
            .rollup(function(d) {
                if (d[0].votes / st[d[0]["district"]] > max) {
                    maxCandidateList = selff;
                    max = d[0].votes / st[d[0]["district"]];
                    maxCandidate = d[0];
                }
                return d3.sum(d, function(g) {
                    return g.votes;
                });
            })
            .entries(availableCandidates);
    });
    return { max, maxCandidate, maxCandidateList };
}
function results(st) {
    console.log("results");
    let { max, maxCandidate, maxCandidateList } = getHighestCandidate(st);
    let maxCandidateName = maxCandidate["name"].replace(/ /g, "");
    blinkWinner(maxCandidateName);
    setTimeout(function() {
        d3.selectAll("#" + maxCandidateName).classed("blink", false); //stop blinking winner
        let el = d3.selectAll("#" + maxCandidateName);
        el.each(function(d, i) {
            //change percentage to winning sign
            let g = this.parentNode;
            let text = d3.select(g.childNodes[0]);
            text.text("W");
            let remainingListSeats = 0;
            // -- number of seats of that list
            let title = maxCandidateList
                .select(".barChartTitle")
                .text(function() {
                    let title = d3.select(this).text();
                    let splitTitle = title.split(":");
                    let num = parseInt(splitTitle[1]);
                    remainingListSeats = num - 1;
                    return splitTitle[0] + ": " + (num - 1);
                });
            //increment the sects seat

            let sect = maxCandidate["sect"];
            seatPerSect["counter"] = parseInt(seatPerSect["counter"]) + 1;
            seatPerSect[sect + "_counter"] =
                parseInt(seatPerSect[sect + "_counter"]) + 1;
            let smallDistrict=maxCandidate["district"];

            seatPerSect[sect+"_total"][smallDistrict]["counter"]=parseInt(seatPerSect[sect+"_total"][smallDistrict]["counter"]+1)

            let smallDistrictCount=seatPerSect[sect+"_total"][smallDistrict]["counter"]
            let smallDistrictTotal=seatPerSect[sect+"_total"][smallDistrict]["seatNum"]
            console.log(maxCandidate)
            console.log(smallDistrict)
            console.log(seatPerSect)
            console.log(smallDistrictCount)
            console.log(smallDistrictTotal)
            if(smallDistrictCount==smallDistrictTotal){
                console.log('deleted district')
                console.log(maxCandidate)
                d3.selectAll("."+smallDistrict+"."+sect).classed("available", false);
            }

            // remove available class from winning candidate to not pick it again
            d3.select(this).classed("available", false);
            //remove available from seat if no more seats secured
            if (remainingListSeats == 0) {
                console.log("deleted list");
                maxCandidateList.selectAll("rect").classed("available", false);
            }
            //remove available from candidates with sect thta has no more seats
            if ( 
                seatPerSect[sect + "_counter"] == seatPerSect[sect + "_total"]
            ) {
                console.log("deleted sect");
                d3.selectAll("." + sect).classed("available", false);
            }
            let html = parseInt(d3.select("#" + sect).html());
            d3.select("#" + sect).html((html + 1).toString());

            if (seatPerSect["counter"] < seatPerSect["total"]) results(st);
        });
    }, 2000);
}
function blinkWinner(name) {
    d3.selectAll("#" + name).classed("blink", true);
}
//sort bars based on value

//set up svg using margin conventions - we'll need plenty of room on the left for labels
function draw(
    listName,
    data,
    sT,
    qualifiedNum,
    seatsSecured,
    extraSeatIndex,
    callback
) {
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
    let width = svgdim2.width / qualifiedNum - margin.left - margin.right,
        height = svgdim2.height - margin.top - margin.bottom;
    let extraSeat = function() {
        console.log(d3.selectAll(".barSvg")[0].length);
        console.log(extraSeatIndex);
        if (d3.selectAll(".barSvg")[0].length == extraSeatIndex + 1) return 1;
        else return 0;
    };
    let svg = d3
        .select("#barchart")
        .append("svg")
        .attr("class", "barSvg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("text")
        .attr("class", "barChartTitle")
        .attr("dy", "-0.5vw")
        .text(
            listName + "- seats : " + (Math.floor(seatsSecured) + extraSeat())
        );
    let x = d3.scale
        .linear()
        .range([0, width])
        .domain([
            0,
            d3.max(data, function(d) {
                return (d.votes / sT[d.district]).toFixed(2) * 100;
            })
        ]);

    let y = d3.scale
        .ordinal()
        .rangeRoundBands([height, 0], 0.1)
        .domain(
            data.map(function(d) {
                return d.name;
            })
        );

    //make y axis to show bar names
    let yAxis = d3.svg
        .axis()
        .scale(y)
        //no tick marks
        .tickSize(0)
        .orient("left");

    let gy = svg
        .append("g")
        .attr("class", "y axis")
        .call(yAxis);

    let bars = svg
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
                return  "available barChartBar " + d["sect"] + " " + d["district"]
            })
            .attr("y", function(d) {
                return y(d.name);
            })
            .attr("id", function(d) {
                return d.name.replace(/ /g, "");
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

                return (
                    "available barChartBar " + d["sect"] + " " + d["district"]
                );
            })
            .attr("y", function(d) {
                return y(d.name);
            })
            .attr("id", function(d) {
                return d.name.replace(/ /g, "");
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