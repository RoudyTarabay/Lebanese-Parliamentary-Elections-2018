let overlayClick = null;

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

function initializeHistogram() {
  svgdim = {
    width: $(".results").width(),
    height: $(".results").height()
  };
  margin = {
    top: 30,
    right: 50,
    bottom: 30,
    left: (svgdim.width * 5) / 100
  };
  d3.select("#histdiv")
    .append("svg")
    .attr("id", "hist")
    //.attr("class", "hide")
    .attr(
      "viewBox",
      "0 0 " + (svgdim.width / 2 + 100) + " " + (svgdim.height / 2 - 12)
    );

  hist_width = svgdim.width / 2 - margin.left;
  hist_height = svgdim.height / 2 / 1.5;

  x = d3.scale.ordinal().rangeRoundBands([0, hist_width], 0.1);

  y = d3.scale.linear().range([hist_height, 0]);

  xAxis = d3.svg
    .axis()
    .scale(x)
    .orient("bottom");

  yAxis = d3.svg
    .axis()
    .scale(y)
    .orient("left")
    .ticks(5);
  hist_svg = d3
    .select("#hist")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  hist_svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + hist_height + ")")
    .call(xAxis);
  return hist_svg;
}

function update(newData, callback) {
  if (overlayClick != null) {
    console.log("not appending");
    return;
  }
  var data = d3
    .nest()
    .key(function(d) {
      return d.name;
    })
    .rollup(function(d) {
      return d3.sum(d, function(g) {
        return g.total;
      });
    })
    .entries(newData);
  var bar = hist_svg.selectAll(".bar").data(data);
  bar.exit().remove();

  x.domain(
    data.map(function(d) {
      return d.key;
    })
  );

  hist_svg
    .select(".x")
    .transition()
    .duration(1000)
    .call(xAxis);

  bar
    .attr("class", "bar")
    .transition()
    .duration(1000)
    .attr("x", function(d) {
      return x(d.key);
    })
    .transition()
    .call(endall, callback)
    .duration(1000)
    .attr("width", x.rangeBand());
  console.log("update");
}

function drawInfo2(totalDqVotes, totalVotes, seats, callback) {
  if (overlayClick != null) {
    console.log("not appending");
    return;
  }
  d3.select("#threshold").attr("class", "erase");
  if (d3.event && d3.event.target.id.baseVal == "overlay") return;
  var p = document.querySelector("#threshold");
  function temp() {
    d3.select("#threshold").remove();
    let csstyping = d3.select(".css-typing");
    csstyping.append("p").html("Votes of disqualified lists: " + totalDqVotes);
    csstyping
      .append("p")
      .attr("id", "adjustedTotal")
      .html(
        "Adjusted Total: Total Votes - Votes of disqualified list = " +
          (totalVotes - totalDqVotes)
      );
    csstyping
      .append("p")
      .attr("id", "threshold")
      .html(
        "New votes per seat: Adjusted Total / seats = <span style='color:blue'>" +
          parseFloat((totalVotes - totalDqVotes) / seats).toFixed(2) +
          "</span>"
      );
    function temp2() {
      callback();
      this.removeEventListener("animationend", temp2);
    }
    var adjustedTotal = document.querySelector("#threshold");
    adjustedTotal.addEventListener(
      "animationstart",
      function temp3() {
        if (overlayClick != null)
          this.removeEventListener("animationend", temp2);
      },
      false
    );

    adjustedTotal.addEventListener(
      "animationiteration",
      function temp3() {
        if (overlayClick != null)
          this.removeEventListener("animationend", temp2);
      },
      false
    );
    adjustedTotal.addEventListener("animationend", temp2, false);

    this.removeEventListener("animationend", temp);
  }
  p.addEventListener("animationstart", function() {
    if (overlayClick != null) this.removeEventListener("animationend", temp);
  });
  p.addEventListener("animationiteration", function() {
    if (overlayClick != null) {
      this.removeEventListener("animationend", temp);
    }
  });
  p.addEventListener("animationend", temp, false);
}
function drawHistogram(districtResults, callback) {
  if (overlayClick != null) {
    console.log("not appending");
    return;
  }
  var threshold =
    (districtResults["totalVotes"] + districtResults["blank"]) /
    districtResults["seats"]["total"];
  var qualification = findDQ(threshold, districtResults["lists"]);
  var dq = qualification[0];
  var q = qualification[1];

  var totalDqVotes = 0;
  for (var i = 0; i < dq.length; i++) {
    totalDqVotes += dq[i].total;
  }

  var totalVotes = districtResults["totalVotes"];
  var max = 0;
  var data = d3
    .nest()
    .key(function(d) {
      return d.name;
    })
    .rollup(function(d) {
      if (d[0].total > max) max = d[0].total;
      return d3.sum(d, function(g) {
        return g.total;
      });
    })
    .entries(districtResults["lists"]);

  var bar = hist_svg.selectAll(".bar").data(data);
  bar.exit().remove();
  y.domain([0, max]);

  x.domain(
    data.map(function(d) {
      return d.key;
    })
  );

  tip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(function(d) {
      return (
        "<strong>Votes: </strong> <span style='color:red'>" +
        d.values +
        "</span>"
      );
    });

  hist_svg.select(".x").call(xAxis);

  hist_svg
    .select(".x")
    .selectAll("text")
    .attr("class", "histogramLegendX");
  /*.attr("dy",function(d){
              return this.getComputedTextLength()/20+"em";
            });*/

  hist_svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Votes");

  bar
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {
      return x(d.key);
    })
    .attr("width", x.rangeBand())
    .attr("id", function(d) {
      return d.key.replace(/ /g, "");
    })
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)
    .attr("y", y(0))
    .attr("height", 0)
    .transition()
    .call(endall, function() {
      mainChain(
        threshold,
        districtResults,
        dq,
        q,
        totalDqVotes,
        totalVotes,
        max,
        callback
      );
    })

    .duration(1000)
    .attr("height", function(d) {
      return hist_height - y(d.values);
    })
    .attr("y", function(d) {
      return y(d.values);
    })
    .delay(function(d, i) {
      return i * 500;
    });

  hist_svg
    .selectAll(".bar")
    .data(data)
    .exit()
    .remove();

  hist_svg.call(tip);

  if (overlayClick != null) {
    console.log("not appending");
    return;
  }
}
function getWholeVotesSeats(threshold) {
  //returns total number of seats without accounting for decimals.
  let seats = 0;
  d3.selectAll(".bar").each(function() {
    seats += Math.floor(d3.select(this).data()[0].values / threshold);
  });
  return seats;
}
function mainChain(
  threshold,
  districtResults,
  dq,
  q,
  totalDqVotes,
  totalVotes,
  max,
  callback2
) {
  drawInfo1(threshold, districtResults, function() {
    drawThreshold(threshold, "red", "threshold1", "", 0, function dtCallback() {
      disqualify(dq, q, function() {
        drawInfo2(
          totalDqVotes,
          totalVotes,
          districtResults["seats"]["total"],
          function() {
            d3.select("#threshold1")
              .transition()
              .call(endall, function() {
                let threshold2 =
                  (totalVotes - totalDqVotes) /
                  districtResults["seats"]["total"];

                for (let i = 1; i <= Math.floor(max / threshold2); i++) {
                  if (i == Math.floor(max / threshold2)) {
                    drawThreshold(
                      i * threshold2,
                      "blue",
                      "threshold" + i,
                      "Seats secured: " + i,
                      (i - 1) * 1000,
                      function() {
                        fractionsSeat(
                          threshold2,
                          districtResults["seats"]["total"],
                          (bla, flag) => {
                            console.log(bla);
                            d3.select("#histHr").attr("class", "histHr");
                            document
                              .querySelector("#histHr")
                              .addEventListener("animationend", function temp(
                                flag
                              ) {
                                callback2(
                                  districtResults,
                                  q.length,
                                  threshold2,
                                  bla,
                                  flag
                                );

                                this.removeEventListener("animationend", temp);
                              });
                          }
                        );
                      }
                    );
                  } else
                    drawThreshold(
                      i * threshold2,
                      "blue",
                      "threshold" + i,
                      "Seats secured: " + i,
                      (i - 1) * 1000
                    );
                }
              })
              .duration(1000)
              .style("stroke-width", "1px")
              .style("opacity", 0.5);
            d3.select("#redLabel").remove();
          }
        );
      });
    });
  });
}
function getMaxFraction() {
  let maxHeight = 0;
  let maxFraction = null;
  let maxIndex = -1;
  d3.selectAll(".fraction").each(function(d, i) {
    if(this.classList.contains("noExtraSeat")){
      let height = parseInt(d3.select(this).attr("height"));
      if (height > maxHeight) {
        maxHeight = height;
        maxFraction = this;
        maxIndex = i;
      }
    }
    });
    return [maxFraction, maxIndex];
}

function fractionsSeat(threshold, totalSeats, callback) {
  let seatEarnedTotal = 0;
  let remainingSeats =
    parseInt(totalSeats) - parseInt(getWholeVotesSeats(threshold));
  console.log(totalSeats);
  console.log(getWholeVotesSeats(threshold));
  d3.select(".css-typing")
    .append("p")
    .html(
      remainingSeats +
        " seat(s) remaining. Remaining seats distributed based on extra votes"
    )
    .attr("style", "animation-delay:0s")
    .on("animationend", function() {
      d3.selectAll(".bar").each(function(d, i) {
        let selff = this;
        let findThreshold =
          Math.floor(d3.select(this).data()[0].values / threshold) - 1;
        let line = d3.selectAll(".blue_line")[0][findThreshold];
        seatEarnedTotal += findThreshold;

        hist_svg
          .append("rect")
          .attr("class", "fraction noExtraSeat")
          .attr("height", function() {
            let height =
              parseFloat(
                d3
                  .select(line.parentNode)
                  .attr("transform")
                  .split(",")[1]
              ) -
              d3.select(selff).attr("y") -
              2.5;

            return height;
          })
          .attr("x", () => {
            console.log(i);
            console.log(d3.select(this).attr("x"));
            return d3.select(this).attr("x");
          })
          .attr("width", () => {
            return d3.select(this).attr("width");
          })
          .attr("y", () => {
            return d3.select(this).attr("y");
          })

          .attr("fill", "green");
      });

      d3.selectAll(".bar").each(function() {
        let remainingVotes = d3.select(this).data()[0].values % threshold;
        hist_svg
          .append("text")
          .text("Extra votes left:" + Math.floor(remainingVotes))
          .attr("class", "label")
          .attr("y", d3.select(this).attr("y"))
          .attr("dy", "-5px")
          .attr("x", d3.select(this).attr("x"));
      });
      //if (seatEarnedTotal != totalSeats) {
      //d3.selectAll(".fraction").classed("blink", true);
      d3.selectAll(".blue_line")
        .transition()
        .duration(500)
        .style("stroke-width", "2px")
        .style("opacity", 0.3);
      let extraSeatsCount=0;
     extraSeats(remainingSeats,extraSeatsCount);
    });
  // }
  // else{
  //   callback(maxIndex,0)
  // }

  function extraSeats(remainingSeats,extraSeatsCount,indexes) {
    if(extraSeatsCount==0)
      indexes=[];
    setTimeout(function() {
      //d3.selectAll(".fraction").classed("blink", false);
      let maxFraction = getMaxFraction()[0];
      let maxIndex = getMaxFraction()[1];
      d3.select(maxFraction).classed("blink", true);
      indexes.push(maxIndex);
      console.log(indexes);
      setTimeout(function() {
        d3.select(maxFraction)
          .classed("blink", false)
          .classed("noExtraSeat", false);

        /*hist_svg
          .append("text")
          .text("+1 seat")
          .attr("class", "label")
          .attr("y", d3.select(maxFraction).attr("y"))
          .attr("dy", "-5px")
          .attr("x", d3.select(maxFraction).attr("x"))
          .attr("dx", d3.select(maxFraction).attr("width") / 2);*/
        d3.select(
          hist_svg.selectAll(".label:not(.additionalSeat)")[0][maxIndex]
        )
          .text("+1 seat")
          .classed("additionalSeat", true)
          .attr("y", d3.select(maxFraction).attr("y"))
          .attr("dy", "-5px")
          .attr("x", d3.select(maxFraction).attr("x"))
          .attr("dx", d3.select(maxFraction).attr("width") / 2);
        if (extraSeatsCount
          == remainingSeats - 1) {
          setTimeout(function() {
            d3.selectAll(".label:not(.additionalSeat)").remove();
            d3.selectAll(".fraction")
              .transition()
              .duration(3000)
              .call(endall, function() {
                d3.select(this).remove();
                callback(indexes, 1);
              })
              .style("opacity", 0);
          }, 1000);
        }
        else
          extraSeats(remainingSeats,extraSeatsCount+1,indexes);
      }, 5000);
    }, 2000);
  }
}
function disqualify(dq, q, callback) {
  for (var i = 0; i < dq.length; i++)
    d3.select("#" + dq[i].name.replace(/ /g, "")).attr("class", "blink");
  blinkTimeout = setTimeout(function() {
    d3.selectAll(".blink").remove();
    update(q, callback);
  }, 4000);
}
function findDQ(threshold, listVotes) {
  var dq = [];
  var q = [];
  for (var i = 0; i < listVotes.length; i++) {
    if (listVotes[i].total < threshold) dq.push(listVotes[i]);
    else q.push(listVotes[i]);
  }
  return [dq, q];
}
function drawThreshold(threshold, color, id, text, delay, callback) {
  if (overlayClick != null) {
    console.log("not appending");
    return;
  }
  let hist_g = hist_svg
    .append("g")
    .attr("transform", "translate(0, " + y(threshold) + ")");
  if (callback) {
    hist_g
      .append("line")
      .attr("id", id)
      .style("stroke", color)
      .attr("class", color + "_line")
      .style("stroke-width", "5px")
      .attr("x2", 0)

      .transition()
      .delay(delay)
      .duration(1000)
      .call(endall, callback)
      .attr("x2", hist_width);
    if (overlayClick != null) {
      console.log("not appending");
      return;
    }
  } else
    hist_svg
      .append("g")
      .attr("transform", "translate(0, " + y(threshold) + ")")
      .append("line")
      .attr("class", color + "_line")

      .attr("id", id)
      .style("stroke", color)
      .style("stroke-width", "5px")
      .attr("x2", 0)

      .transition()
      .delay(delay)
      .duration(1000)
      .attr("x2", hist_width);

  if (overlayClick != null) {
    console.log("not appending");
    return;
  }
  hist_g
    .append("text")
    .text(text)
    .style("font-size", "10px")
    .style("font-weight", "700")
    .attr("x", hist_width / 2)
    .attr("dy", "1.2em")
    .attr("id", "redLabel")
    .style("opacity", "0")
    .transition()
    .delay(delay)
    .duration(1000)
    .style("opacity", "1");
}

function drawInfo1(threshold, districtResults, callback) {
  console.log("drawInfo1");
  if (overlayClick != null) {
    console.log("not appending");
    return;
  }
  console.log(d3.event);
  console.log("wasn't interrupted");
  var csstyping = d3
    .select("#histdiv")
    .append("div")
    .attr("id", "histInfo")
    .append("div")
    .attr("class", "css-typing");
  csstyping
    .append("p")
    .html(
      "Total valid votes(incl blank): " +
        (districtResults["totalVotes"] + districtResults["blank"])
    );
  csstyping
    .append("p")
    .html("Number of seats: " + districtResults["seats"]["total"]);
  csstyping
    .append("p")
    .attr("id", "threshold")
    .html(
      "Votes required per seat: Total valid votes/Number of seats= <span style='color:red'>" +
        threshold.toFixed(2) +
        "</span>"
    );
  if (d3.event && d3.event.target.id.baseVal == "overlay") return;
  function temp() {
    callback();
    this.removeEventListener("animationend", temp);
  }
  document.querySelector("#threshold").addEventListener(
    "animationstart",
    function temp2() {
      if (overlayClick != null) this.removeEventListener("animationend", temp);
    },
    false
  );
  document.querySelector("#threshold").addEventListener(
    "animationiteration",
    function temp2() {
      if (overlayClick != null) this.removeEventListener("animationend", temp);
    },
    false
  );
  document
    .querySelector("#threshold")
    .addEventListener("animationend", temp, false);
}
function histogram(bigDistrict, callback) {
  overlayClick = null;
  /*document.querySelector("#overlay").addEventListener(
    "click",
    function(e) {
      overlayClick = e.target.id;
      window.clearTimeout(blinkTimeout);
      d3.select("#histHr").attr("class","invisible");

      d3.selectAll(".bar")
        .transition()
        .duration(0);
      d3.selectAll("line")
        .transition()
        .duration(0);
      d3.select("#histdiv")
        .selectAll("*")
        .remove();
    },
    false
  );*/
  d3.json("data/results.json", function(error, data) {
    initializeHistogram();
    console.log(bigDistrict);
    drawHistogram(data[bigDistrict], callback);
  });
}