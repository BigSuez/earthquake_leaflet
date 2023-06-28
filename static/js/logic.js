const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson';

//Get data and pass to makeMarkers
d3.json(url).then(function (data){
    makeMarkers(data);
});

//Create list of markers
function makeMarkers(data){
    //Create Markers for Earthquakes
    console.log(platesData);
    let quakes = data.features;
    let quakeMarkers = [];
    for (i = 0; i < quakes.length; i++){
        let marker = L.circle([quakes[i].geometry.coordinates[1], quakes[i].geometry.coordinates[0]],
                                {
                                radius: Math.pow(quakes[i].properties.mag*3.25, 4), 
                                color: `rgb(${255-quakes[i].geometry.coordinates[2]/2},${50+quakes[i].geometry.coordinates[2]/4},0)`,
                                stroke:false,
                                fillOpacity: .8
                                }).bindPopup(`<table><text>${quakes[i].properties.place}</text><tr><td>Lat: ${quakes[i].geometry.coordinates[1]}</td><td>Lon: ${quakes[i].geometry.coordinates[0]}</td></tr>
                                        </br><tr><td>Dep: ${quakes[i].geometry.coordinates[2]}</td><td>Mag: ${quakes[i].properties.mag}</td></tr></table>`);
        quakeMarkers.push(marker);
    }
    let quakeLayer = L.layerGroup(quakeMarkers);

    //Create Lines for Techtonic Plates
    platesLayer = L.geoJSON(platesData);
    makeMap(quakeLayer, platesLayer);
}

//Create Map
function makeMap(quakeLayer, platesLayer){
    //Base Layers
    let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    let sat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
    });
    let ter = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});
    //TODO: Additional baseLayers
    var baseMaps = {
        'OpenStreetMap': osm,
        'Satellite': sat,
        'Terrain': ter
    };

    var overlayMaps = {
        'Earthquakes': quakeLayer,
        'Tectonic Plates': platesLayer
    };

    myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [quakeLayer, osm]
    });

    var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    createLegend();
}

//Create Legend
function createLegend(){
    var legend = L.control({ position: 'bottomright' })
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend')
        var limits = [100, 200, 300, 400, 500, 600]
        var colors = [`rgb(255,50,0)`, 'rgb(205,60,0)', 'rgb(155,70,0)', 'rgb(105,80,0)', 'rgb(55,90,0)', 'rgb(5,100,0)']
        var labels = []
    
        div.innerHTML = '<h2 id=legendTitle>Legend:</br><h3 id=legendTitle>Depth</h3></h2>'
        let lastLimit = 0;
        limits.forEach(function (limit, index) {
          labels.push('<li style="background-color: ' + colors[index] + '">' + `<font color="white">${lastLimit}-${limit}</font`+ '</li>')
          lastLimit = limit;
        })
    
        div.innerHTML += '<ul>' + labels.join('') + '</ul>'
        return div
      }
      legend.addTo(myMap)
}
