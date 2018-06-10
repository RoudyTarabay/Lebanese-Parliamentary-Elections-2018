
var count=0;

function showOverlay(){
    document.querySelector("#overlay").classList.remove("invisible");
}
function hideOverlay(){
    d3.select("#overlay").attr("class","invisible");
}
function clearInner(node) {
  while (node.hasChildNodes()) {
    clear(node.firstChild);
  }
}

function clear(node) {
    console.log(node)
  while (node.hasChildNodes()) {
    clear(node.firstChild);
  }
  node.parentNode.removeChild(node);
  console.log(node, "cleared!");
}

function mapListener() {
    if (d3.event.target.className.baseVal != "bigDistrict" || d3.event.target.id.baseVal == "overlay") {

       // clearInner(document.getElementById("histdiv"));
        
        hideOverlay();
        d3.select("#results").classed('invisible',true)
        overlayClick = d3.event.target.id;
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
      window.clearTimeout(blinkTimeout);
      d3.select("#barchart")
        .selectAll("*")
        .remove();
        
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
    console.log(barChart)
    histogram(bigDistrict,barChart)
    

    showOverlay();

    var resultsSvg = d3.selectAll(".results").classed("invisible",false);
        

}
