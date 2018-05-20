//initializePie();

var count=0;

function showOverlay(){
    console.log("bol");
    d3.select("#overlay").attr("style","visibility:visible");
}
function hideOverlay(){

    d3.select("#overlay").attr("style","visibility:hidden");
}
function mapListener() {
    if (d3.event.target.className.baseVal != "env" || d3.event.target.id.baseVal == "overlay") {
        destroyAll();
        hideOverlay();

        d3.selectAll(".hide").each(function(d) {
            d3.select(this).attr("style", function(d) {
                var tempstyle = d3.select(this).attr("style");
                tempstyle += ";visibility:hidden";
                return tempstyle;
            })
        });
    }
    return;
}

function destroy(id) {
    d3.select(id).selectAll("*").remove();
}

function destroyAll() {
    //destroy("#pie");
    //destroy("#hist");
    //destroy("#bubble");

}
function municipalityListener(city){

    console.log("listner")
    if(count==0){
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
    count++;
    //drawHistogram(city);
    //drawBubble(city);

    showOverlay();
    var resultsSvg = d3.selectAll(".results");
    d3.selectAll(".hide").each(function(d) {
        d3.select(this).attr("style", function(d) {
            var tempstyle = d3.select(this).attr("style");
            tempstyle += ";visibility:visible";
            return tempstyle;
        })
    });

}
