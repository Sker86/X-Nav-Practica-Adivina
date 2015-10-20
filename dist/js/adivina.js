$(document).ready(function(){
    initMapa(25,0,1);	
   	
   	
});

var imagenes;

function initMapa(x, y, zoom){
	var map = L.map("map").setView([x, y], zoom);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18
    }).addTo(map);
}

function getImagen(tag){
	$.getJSON("https://api.flickr.com/services/feeds/photos_public.gne?tags="+tag+"&tagmode=any&format=json&jsoncallback=?",function(data){
		imagenes = data.items;
		//data.items[i].media.m+" >";
	});
}