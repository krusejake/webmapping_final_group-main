//declare map var in global scope
var map1, map2, pcp;
var attributes = ["population", "D_votes", "R_votes"]
var proposals = ["current", "effGap", "compactness", "modularity", "pmc"] // the same as the checkbox class (cb-xx) and file names
var curAttribute = attributes[0], // variable for symbolization
    curProp1 = proposals[0], // proposals to show on the map, left one
    curProp2 = proposals[1]; // right on, change default curProp1 and curProp2 to the "standard" ones on loading
var propCount = 0; // at most 2 proposals can be chosen
var zoomLevel = 5; // make sure two maps zoom in to the same level
var geoJson1, geoJson2; // data files loaded

var extents =  { 'population': [723, 750],
            '18+_Pop': [559, 597],
            'PISLAND18': [0.2, 0.3],
            'WHITE18': [303, 532],
            'BLACK18': [3.2, 165],
            'HISPANIC18': [6.9, 62],
            'ASIAN18': [6.791, 19.6],
            'AMINDIAN18': [2.0, 19.2],
            'PISLAND': [0.2, 0.4],
            'White': [336, 678],
            'Black': [5.7, 238],
            'HISPANIC': [12.1, 105],
            'Asian': [12.4, 37.1],
            'AmIndian': [2.0, 26.3],
            'D_votes': [120, 271.6],
            'D_percents': [0.33, 0.86],
            'R_votes': [44.7, 254.8],
            'R_percents': [0.14, 0.67],
            'intra_flows': [1.65, 5.23],
            'inter_flows': [1.93, 5.54],
                }

function initialize(){
    createProposal();
    pcp = createPCP(); // empty chart
    map1 = createMap("map1", curProp1)
    map2 = createMap("map2", curProp2)
};

function createProposal(){ //Jake
    var container = document.querySelector("#proposalPanel")
    console.log(container)
    //insert text of categories
    
    // insert proposal checkboxes
    for (var i=1; i<proposals.length; i++){
        // insert button
 
    }
    // add checkbox listener
    //1. add proposal selection checkbox
        // change curProp1
        // change curProp2
        // update propCount, 
         //if propCount==2, disable other check boxes
         // if uncheck one box, enable other checkboxes
         // transition settings?

}

function createPCP(){
    // create container with an empty svg
    // add control for attribute selection
    // resymbolize
    return pcp
}


function createMap(panel, curProp){
    //create the map
    map = L.map(panel, {
        center: [38.8610, 71.2761], // change to WI
        zoom: 6,
        zoomControl: false
    });

    //add OSM base tilelayer
    var osm = L.tileLayer('https://{s}.tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=fqi6cfeSKDgbxmTFln7Az50KH80kQ9XiendFp9kY5i3IR5yzHuAOqNSeNaF7DGxs', {
    attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 6,
    maxZoom: 10,
    subdomains: "abcd",
    accessToken: "fqi6cfeSKDgbxmTFln7Az50KH80kQ9XiendFp9kY5i3IR5yzHuAOqNSeNaF7DGxs"
    }).addTo(map);

    // modify to limit to WI
    var southWest = L.latLng(43, -90),
    northEast = L.latLng(45, -89);
    var bounds = L.latLngBounds(southWest, northEast);

    map.setMaxBounds(bounds);
    map.on("drag", function() {
        map.panInsideBounds(bounds, { animate: false });
    });

    L.control.zoom({
        position: "bottomright"
    }).addTo(map);

    // add layer control
    var baselayer = {
        
        // "water color": watercolor,
    }
    
    var overlayers = {
        "osm": osm,
        // "Mudflow": mf,
        // "Landslide": ls
    }
    
    L.control.layers(baselayer, overlayers).addTo(map)

    // setTimeout(function () { map.invalidateSize() }, 50);

    //call getData function
    getData(map, curProp);

    createTitle(map, curProp); 

    return map
}

//function to retrieve the data and place it on the map
function getData(map, curProp){
    //load the data
    // var geojson = new L.GeoJSON.AJAX("data/"+ curProp + ".geojson");
    // geojson.on("data:loaded", function() { 
    // map.fitBounds(geojson.getBounds()); geojson.addTo(map); }.bind(this));
    fetch("data/"+curProp+".geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            console.log(json)
            var choroLayer = createChoropleth(json, map); // initialize with curAttribute
            // set legend, later

            //create layers for reexpression, Yuhan
                // var propLayer = createPropSymbol(choroLayer);
                // var histLayer = createChart(choroLayer, propLayer)
                // add reexpression control
            
            // create Layers for overlay, Jake
            // add overlay control
            var curBoundLayer;
            var hisBoundLayer;
            var osmLayer;
            var textureLayer

            // create PCP plots and control Yuhan
            // console.log(map)
            setPCP(json, map.boxZoom._container.id)

            // create info label, only activate when cbgOn=1
            // createInfoBox()


            //    })

                    

        })

};



// choropleth by attribute
// !!!! need to modify symbolization by the same scales
function createChoropleth(json, map){
    var layer = L.choropleth(json, {
            valueProperty: curAttribute, // which property in the features to use
            scale: ['#f1eef6', '#bdc9e1', '#74a9cf', '#2b8cbe', '#045a8d'], // chroma.js scale - include as many as you like
            steps: 5, // number of breaks or steps in range
            mode: 'q', // q for quantile, e for equidistant, k for k-means
            style: {
                color: '#fff', // border color
                weight: 2,
                fillOpacity: 0.8,
            },
            onEachFeature: function(feature, layer) {
                console.log(layer)
                layer.setStyle({
                    className: "polygon "+map.boxZoom._container.id+'-'+layer.feature.properties.assignment_0
                });
                layer.on({
                    mouseover: function(event){
                        highlight("."+map.boxZoom._container.id+'-'+event.target.feature.properties.assignment_0)
                    },
                    mouseout: function(event){
                        dehighlight("."+map.boxZoom._container.id+'-'+event.target.feature.properties.assignment_0)
                    },
                });
            }
        }).addTo(map)

    d3.selectAll('.polygon').append("desc")
        .text('{"stroke": "#fff", "weight": "2", "fillOpacity": "0.8"}');

    return layer
};



function setPCP(json, mapid){
    if (mapid=="map1"){
        color = "#74a9cf"
    } else{
        color = "#fc8d59"
    }

    //chart frame dimensions
    var margin = { top: 20, right: 10, bottom: 20, left: 30 },
        chartWidth = 550 - margin.left - margin.right,
        chartHeight = 210 - margin.top - margin.bottom;

    // console.log(d3.select(".pcp")._groups[0][0]==null) 
    // if no pcp created, set PCP first
    if (d3.select(".pcp")._groups[0][0]==null){
        //create a second svg element to hold the histogram
        var chart = d3.select("#pcpPlot")
            .append("svg")
            .attr("width", chartWidth + margin.left + margin.right)
            .attr("height", chartHeight + margin.top + margin.bottom)
            .append("g")
            .attr("class", "pcp")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    } else{
        var chart = d3.select(".pcp")
    }

      // For each attr, build a linear scale. I store all in a y object
    var y = {}
    for (i in attributes) {
        attr = attributes[i]
        y[attr] = d3.scaleLinear()
        .domain(extents[attr])
        //     d3.extent(json.features, function(d) { 
        //     console.log(d)
        //     return +d.properties[attr]; 
        // }) )
        .range([chartHeight, 0])
    }

      // Build the X scale -> it find the best position for each Y axis
    var x = d3.scalePoint()
        .range([0, chartWidth-10])
        .padding(0.4)
        .domain(attributes);
    
    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(attributes.map(function(p) {
            return [x(p), y[p](d.properties[p])]; }));
    }

    var lines = chart.selectAll(".lines-"+mapid)
        .data(json.features)
        .enter()
        .append("path")
        .attr("class", function(d){    
            console.log(d)       
            return "lines "  + mapid + '-' + d.properties.assignment_0;        
        })     
        .attr("d", path)   
        .style("fill", "none")
        .style("stroke", color)  
        .style("stroke-width", 1.2)
        .style("opacity", .9)
        .on("mouseover", function(event, d){
            highlight('.' + mapid + '-' + d.properties.assignment_0);
        })
        .on("mouseout", function(event, d){
            dehighlight('.' + mapid + '-' + d.properties.assignment_0);
        })
        // .on("mousemove", moveLabel);

    //add style descriptor to each rect
    var desc = lines.append("desc")
                .text('{"stroke": "'+ color+'", "stroke-width": "1.2px", "opcaity": ".9"}');

    // Draw the axis:
    if (d3.selectAll(".pcpAxis")._groups[0][0]==null){
        chart.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(attributes)
        .enter()
        // .attr("class", "pcpAxis")
        .append("g")
        .attr("class", "pcpAxis")
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function(d) { 
            // console.log(this);
            d3.select(this).call(d3.axisLeft().scale(y[d])); })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")        
    }

    // console.log(d3.selectAll(".pcpAxis"))

}

//function to highlight enumeration units and bars
function highlight(className){
    d3.selection.prototype.bringToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
        };
    //change stroke
    var selected = d3.selectAll(className)
        .style("stroke", "#0FC2C0")
        .style("stroke-width", "2.5")
        .bringToFront();
    // console.log(selected)
    // setLabel(props)
};

//function to reset the element style on mouseout
function dehighlight(className){
    // console.log(props)
    var selected = d3.selectAll(className)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        });

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    };

    d3.select(".infolabel")
    .remove();
};

function resymbolize(){ // Yuhan

}

//add the title to the map
function createTitle(map, curProp){
	//add a new control to the map to show the text content
    var TitleControl = L.Control.extend({
        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create("div", "title-container "+curProp);
            // container.style.position = "absolute";
            // container.style.left = "100px";
			
			//specify the title content
			var content = "<h3>" + curProp + " map</h3>";
			container.insertAdjacentHTML("beforeend", content)
			
			//disable click inside the container
			L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });
    map.addControl(new TitleControl());
}

document.addEventListener("DOMContentLoaded",initialize)