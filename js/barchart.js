let yFormulas = [];
let xFormulas = [];
let seatPerSect = {};
let seatPerSmallDistrict = {};
let districtColors = d3.scale
    .ordinal()
    .range([
        "white",
        "black",
        "purple",

    ]);

function endall(transition, callback) {
    //on d3 transition end
    if (overlayClick != null) {
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
    generatePatterns(results["seats"]);

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
            if (i + 1 == eraseNum) {
                drawInfo3(districtSeats, st);
            }
        });
    });
}
function generatePatterns(districtSeats) {
    let sects = Object.keys(districtSeats);

    for (let i = 0; i < sects.length - 1; i++) {
        let districts = Object.keys(districtSeats[sects[i]]);
        for (let j = 0; j < sects.length - 1; j++) {
            d3.select("body")
                .append("svg")
                .attr("width", "120")
                .attr("height", "120")
                .attr("viewBox", "0 0 120 120")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .attr("version", "1.1")
                .append("defs")
                .append("pattern")
                .attr("id", sects[i] + "_" + districts[j] + "_oblique")
                .attr("patternUnits", "userSpaceOnUse")
                .attr("width", "4")
                .attr("height", "4")
                .append("path")
                .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
                .attr(
                    "style",
                    "stroke:" +
                        districtColors(sects[i] + districts[j]) +
                        ";   stroke-width:1"
                );
        }
    }
}
function drawInfo3(districtSeats, st) {
    let keys = Object.keys(districtSeats);
    let csstyping = d3.select(".css-typing");

    csstyping
        .append("p")
        .html("Total Number Of Seats: " + districtSeats["total"]);

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
            )
            .append("svg")
            .attr("class", keys[i] + " sectLegend")

            .append("rect")
            .attr("class", keys[i] + " sectLegend");
        let smallDistricts = Object.keys(districtSeats[keys[i]]);

        for (let j = 0; j < smallDistricts.length - 1; j++) {
            csstyping
                .append("p")
                .attr("class", "small-district-counter")
                .html(
                    smallDistricts[j] +
                        " : <span  id='" +
                        smallDistricts[j] +
                        keys[i] +
                        "'>" +
                        0 +
                        "</span>/" +
                        districtSeats[keys[i]][smallDistricts[j]]
                )
                .append("svg")
                .attr("class", keys[i] + " sectLegend")

                .append("rect")
                .attr("class", keys[i] + " sectLegend")
                .attr("style", function() {

                    return (
                        "fill:url(#" +
                        keys[i] +
                        "_" +
                        smallDistricts[j] +
                        "_oblique)!important"
                    );
                });
            if (j == smallDistricts.length - 2) {
                csstyping
                    .selectAll(".small-district-counter")[0]
                    [
                        csstyping.selectAll(".small-district-counter")[0]
                            .length - 1
                    ].addEventListener(
                        "animationend",
                        function() {
                            if (i == keys.length - 2) {
                                d3.selectAll("#" + keys[i]).each(function(
                                    d,
                                    i
                                ) {
                                    let parent = this.parentNode.parentNode;
                                    parent = d3.select(parent);
                                    parent.on(
                                        "animationend",
                                        () => {
                                            console.log('c')
                                            results(st);
                                        },
                                        false
                                    );
                                });
                            }
                        },
                        false
                    );
            }
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

function winnerAnimation(maxCandidateList, callback) {
    let remainingListSeats = 0;
    let title = maxCandidateList.select(".barChartTitle").text();
    let splitTitle = title.split(":");
    let remainingSeats = parseInt(splitTitle[1]);
    blinkText(maxCandidateList.select(".barChartTitle").select("tspan"));
    setTimeout(() => {
        maxCandidateList
            .select(".barChartTitle")
            .select("tspan")
            .text(remainingSeats - 1);
        stopBlinking(maxCandidateList.select(".barChartTitle").select("tspan"));
        if (remainingSeats - 1 == 0) clearList(maxCandidateList, callback);
        else callback();
    }, 5000);
}
function blinkText(element) {
    element.classed("blink", true);
}
function stopBlinking(element) {
    element.classed("blink", false);
}
function results(st) {
    console.log('b')
    let { max, maxCandidate, maxCandidateList } = getHighestCandidate(st);
    let maxCandidateName = maxCandidate["name"].replace(/ /g, "");
    blinkWinner(maxCandidateName);
    setTimeout(function() {
        d3.selectAll("." + maxCandidateName).classed("blink", false); //stop blinking winner
        let el = d3.selectAll("#" + maxCandidateName);
        el.each(function(d, i) {
            //change percentage to winning sign
            let g = this.parentNode;
            let text = d3.select(g.childNodes[0]);
            text.attr("font-family", "FontAwesome")
                .attr("font-size", function(d) {
                    return d.size + "em";
                })
                .attr("class", "")
                .attr("style", "fill:green")
                .text(function() {
                    return "\uf00c";
                });
            let remainingListSeats =
                parseInt(
                    maxCandidateList
                        .select(".barChartTitle")
                        .select("tspan")
                        .text()
                ) - 1;
            // -- number of seats of that list

            //increment the sects seat

            let sect = maxCandidate["sect"];
            seatPerSect["counter"] = parseInt(seatPerSect["counter"]) + 1;
            seatPerSect[sect + "_counter"] =
                parseInt(seatPerSect[sect + "_counter"]) + 1;
            let smallDistrict = maxCandidate["district"];

            seatPerSect[sect + "_total"][smallDistrict]["counter"] = parseInt(
                seatPerSect[sect + "_total"][smallDistrict]["counter"] + 1
            );

            let smallDistrictCount =
                seatPerSect[sect + "_total"][smallDistrict]["counter"];
            let smallDistrictTotal =
                seatPerSect[sect + "_total"][smallDistrict]["seatNum"];
            d3.selectAll("." + d3.select(this).attr("id")).classed(
                "available",
                false
            );

            /* if (smallDistrictCount == smallDistrictTotal) {
                d3.selectAll(".available." + smallDistrict + "." + sect).each(function(d,u){
                    let g = this.parentNode;
                    let text = d3.select(g.childNodes[0]).attr("style","text-decoration:line-through"); 
                })
                 d3.selectAll(".available." + smallDistrict + "." + sect).classed("unavailable",true);
                d3.selectAll("." + smallDistrict + "." + sect).classed(
                    "available",
                    false
                );
            }*/

            // remove available class from winning candidate to not pick it again

            //remove available from seat if no more seats secured
            /*if (remainingListSeats == 0) {
                maxCandidateList.selectAll(".available").each(function(d, i) {
                    let g = this.parentNode;
                    let text = d3
                        .select(g.childNodes[0])
                        .attr("style", "text-decoration:line-through");
                });
                maxCandidateList
                    .selectAll(".available")
                    .classed("unavailable", true);

                maxCandidateList.selectAll("rect").classed("available", false);
            }*/
            //remove available from candidates with sect thta has no more seats
            if (
                seatPerSect[sect + "_counter"] == seatPerSect[sect + "_total"]
            ) {
                d3.selectAll(".available." + sect).classed("unavailable", true);

                d3.selectAll("." + sect).classed("available", false);
            }
            let sectCount = parseInt(d3.select("#" + sect).html());
            let sectDistrictCount = parseInt(
                d3.select("#" + smallDistrict + sect).html()
            );

            winnerAnimation(maxCandidateList, function() {
                console.log('a')
                incrementSmallDistrictAnimation(
                    smallDistrict,
                    sect,
                    sectDistrictCount,
                    function() {
                        console.log(smallDistrictCount);
                        console.log(smallDistrictTotal);
                        console.log(smallDistrictTotal==smallDistrictCount)
                        if (smallDistrictCount == smallDistrictTotal)
                            smallDistrictFull(smallDistrict, sect, function() {
                                incrementSectAnimation(
                                    sect,
                                    sectCount,
                                    function() {
                                        if (
                                            seatPerSect[sect + "_counter"] ==
                                            seatPerSect[sect + "_total"][
                                                "total"
                                            ]
                                        ) {
                                            d3.select(
                                                document.querySelector(
                                                    "#" + sect
                                                ).parentNode
                                            ).style(
                                                "text-decoration",
                                                "line-through"
                                            );
                                        }

                                        if (
                                            seatPerSect["counter"] <
                                            seatPerSect["total"]
                                        )
                                            results(st);
                                    }
                                );
                            });
                        else
                            incrementSectAnimation(sect, sectCount, function() {
                                if (
                                    seatPerSect[sect + "_counter"] ==
                                    seatPerSect[sect + "_total"]["total"]
                                ) {
                                    d3.select(
                                        document.querySelector("#" + sect)
                                            .parentNode
                                    ).style("text-decoration", "line-through");
                                }

                                if (
                                    seatPerSect["counter"] <
                                    seatPerSect["total"]
                                )
                                    results(st);
                            });
                    }
                );
            });
        });
    }, 2000);
}
function clearList(maxCandidateList, callback) {
    //make the remaining list unavailable

    maxCandidateList.selectAll(".available").classed("blink", true);
    setTimeout(function() {
        maxCandidateList.selectAll(".available").classed("blink", false);

        maxCandidateList.selectAll(".available").each(function(d, i) {
            let g = this.parentNode;
            let text = d3
                .select(g.childNodes[0])
                .attr("style", "text-decoration:line-through");
        });
        maxCandidateList.selectAll(".available").classed("unavailable", true);

        maxCandidateList.selectAll("rect").classed("available", false);

        callback();
    }, 2000);
}
function incrementSmallDistrictAnimation(
    smallDistrict,
    sect,
    sectDistrictCount,
    callback
) {
    blinkText(d3.select("#" + smallDistrict + sect));

    setTimeout(function() {
        d3.select("#" + smallDistrict + sect).html(
            (sectDistrictCount + 1).toString()
        );
        stopBlinking(d3.select("#" + smallDistrict + sect));

        callback();
    }, 5000);
}
function incrementSectAnimation(sect, sectCount, callback) {
    blinkText(d3.select("#" + sect));

    setTimeout(function() {
        d3.select("#" + sect).html((sectCount + 1).toString());

        stopBlinking(d3.select("#" + sect));
        callback();
    }, 5000);
}
function smallDistrictFull(smallDistrict, sect, callback) {
    let districtSectParagraph = document.querySelector(
        "#" + smallDistrict + sect
    ).parentNode;

    d3.select(districtSectParagraph).style("text-decoration", "line-through");
    setTimeout(function() {
        d3.selectAll(".available." + smallDistrict + "." + sect).classed(
            "blink",
            true
        );
        setTimeout(function() {
            d3.selectAll(".available." + smallDistrict + "." + sect).classed(
                "blink",
                false
            );

            d3.selectAll(".available." + smallDistrict + "." + sect).each(
                function(d, u) {
                    let g = this.parentNode;
                    let text = d3
                        .select(g.childNodes[0])
                        .attr("style", "text-decoration:line-through");
                }
            );
            d3.selectAll(".available." + smallDistrict + "." + sect).classed(
                "unavailable",
                true
            );
            d3.selectAll("." + smallDistrict + "." + sect).classed(
                "available",
                false
            );
            callback();
        }, 2000);
    }, 2000);
}
function blinkWinner(name) {
    d3.selectAll("." + name).classed("blink", true);
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
        .text(listName + "- seats : ")
        .append("tspan")
        .text(Math.floor(seatsSecured) + extraSeat());
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
    if (callback){

        bars.append("rect")
            .attr("class", function(d, i) {
                d3.select(svg.selectAll(".tick")[0][i]).classed(
                    " candidateName available " +
                        d["sect"] +
                        " " +
                        d["district"] +
                        " " +
                        d.name.replace(/ /g, ""),
                    true
                );
                return (
                    "available barChartBar " +
                    d["sect"] +
                    " " +
                    d["district"] +
                    " " +
                    d.name.replace(/ /g, "")
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

        bars.append("rect")
            .attr("class", function(d, i) {
                d3.select(svg.selectAll(".tick")[0][i]).classed(
                    " candidateName available " +
                        d["sect"] +
                        " " +
                        d["district"] +
                        " " +
                        d.name.replace(/ /g, ""),
                    true
                );
                return (
                    "available barChartBar " +
                    d["sect"] +
                    " " +
                    d["district"] +
                    " " +
                    d.name.replace(/ /g, "")
                );
            })
            .attr("y", function(d) {
                return y(d.name);
            })
    
            .attr("height", y.rangeBand())
            .attr("x", 0)
            .attr("width", 0)
            .transition()
            .style("fill",function(d){

                return "url(#" +d["sect"] +"_" +d["district"] + "_oblique)";
                    })            .call(endall, callback)
            .duration(1000)

            .attr("width", function(d) {
                return x((d.votes / sT[d.district]).toFixed(2) * 100);
            });
    }
    else{
                bars.append("rect")
            .attr("class", function(d, i) {
                d3.select(svg.selectAll(".tick")[0][i]).classed(
                    "candidateName available " +
                        d["sect"] +
                        " " +
                        d["district"] +
                        " " +
                        d.name.replace(/ /g, ""),
                    true
                );

                return (
                    "available barChartBar " +
                    d["sect"] +
                    " " +
                    d["district"] +
                    " " +
                    d.name.replace(/ /g, "")
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
        bars.append("rect")
            .attr("class", function(d, i) {
                d3.select(svg.selectAll(".tick")[0][i]).classed(
                    "candidateName available " +
                        d["sect"] +
                        " " +
                        d["district"] +
                        " " +
                        d.name.replace(/ /g, ""),
                    true
                );

                return (
                    "available barChartBar " +
                    d["sect"] +
                    " " +
                    d["district"] +
                    " " +
                    d.name.replace(/ /g, "")
                );
            })
            .attr("y", function(d) {
                return y(d.name);
            })

            .attr("height", y.rangeBand())
            .attr("x", 0)
            .attr("width", 0)
            .style("fill",function(d){

                return "url(#" +d["sect"] +"_" +d["district"] + "_oblique)";
                    })
            .transition()

            .duration(1000)

            .attr("width", function(d) {
                return x((d.votes / sT[d.district]).toFixed(2) * 100);
            });


    }

    //add a value label to the right of each bar
}