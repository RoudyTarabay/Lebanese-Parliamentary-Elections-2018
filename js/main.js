//initializePie();

var count=0;

function showOverlay(){
    console.log("booooooooooool");
    console.log(document.querySelector("#overlay"))
    document.querySelector("#overlay").classList.remove("invisible");
        //d3.select("#overlay").classed("invisible",false);
}
function hideOverlay(){
    console.log("hide")
    d3.select("#overlay").attr("class","invisible");
}
function mapListener() {
    if (d3.event.target.className.baseVal != "bigDistrict" || d3.event.target.id.baseVal == "overlay") {
        destroy('#histdiv');
        hideOverlay();

        /*d3.selectAll(".hide").each(function(d) {
            d3.select(this).attr("style", function(d) {
                var tempstyle = d3.select(this).attr("style");
                tempstyle += ";visibility:hidden";
                return tempstyle;
            })
        });*/
    }
    return;
}

function destroy(id) {
    let myNode=document.querySelector(id);
    let fc=myNode.firstChild;

    while(fc){
        myNode.removeChild(fc)
        fc=myNode.firstChild
    }
}

function destroyAll() {
    //destroy("#pie");
    //destroy("#hist");
    //destroy("#bubble");

}
function municipalityListener(bigDistrict){
    histogram(bigDistrict);

    /*if(count==0){
        initializePie();
    
        drawPie(city);
        initializeHistogram();
        drawHistogram(city);
        initializeBubble();
        drawBubble(city);
    }

    else{
        changePie(city);
        drawHistogram(city);
        drawBubble(city);
    }
    count++;*/
    //drawHistogram(city);
    //drawBubble(city);

    showOverlay();
    var resultsSvg = d3.selectAll(".results").classed("hide",false);
        d3.selectAll(".hide").each(function(d) {
        d3.select(this).attr("style", function(d) {
            var tempstyle = d3.select(this).attr("style");
            tempstyle += ";visibility:visible";
            return tempstyle;
        })
    });

}
