var imagenes;
var game = null;
var difficult = null;
var dificultad = null;
var datosJuego;
var numJuego;
var map;
var posicionclick;
var timestart;
var timestop;
var distancia;
var tiempo;
var puntos;
var continuar = true;
var stop = true;
var intervalo;
var fotosMostradas;
var ronda;
var puntuacion = 0;
var historial = 0;
var actual = 0;
var historico = [];

$(document).ready(function(){
    initMapa(25,0,1);	
    $("#juego").hide();
    $("#continuar").hide();
    $("#finalizar").hide();
    $("#abandonar").hide();
    $("#historial1").hide();
    // Gestión del localStorage
    leerLocal();
    mostrarHistorial(historico, "entradaHistorial");/*
    if (localStorage.length>0){
      for(i=1;i<=Number(localStorage.getItem("jugadas"));i++){
      historico.push({  nombre: localStorage.getItem("nombre"+i),
                        dificultad: localStorage.getItem("dificultad"+i),
                        puntos: localStorage.getItem("puntos"+i),
                        fecha: localStorage.getItem("fecha"+i), 
                        actual: localStorage.getItem("actual"+i)
                      });
      }
      var salida = "";
      if (history.state!=null){
        for (i=0;i<historico.length;i++){
          salida=salida.concat('<tr><th scope="row">',(i+1),'</th><td><a href="javascript:historyGo(',historico[i].actual,')" >',historico[i].nombre,'</td></a><td>',historico[i].dificultad,'</td><td>',historico[i].puntos,'</td><td>',((historico[i].fecha.toString()).split("GMT"))[0],'</td></tr>');
        }
      }else{
        //duplicado en linea 291
        for (i=0;i<historico.length;i++){
          game = historico[i].nombre;
          dificultad = historico[i].dificultad;
          peti1= 'document.location.assign("?';
          peti= peti1.concat(game,'-',dificultad,'"');
          salida=salida.concat('<tr><th scope="row">',(i+1),'</th><td><a href=\'javascript:');
          salida=salida.concat(peti,')\' >',historico[i].nombre,'</td></a><td>',historico[i].dificultad,'</td><td>',historico[i].puntos,'</td><td>',((historico[i].fecha.toString()).split("GMT"))[0],'</td></tr>');
        //sobre esta linea de html el href="javascript:"document.location.assign('?"+historico[i].nombre+"-"+historico[i].dificultad+"')";
        }
      }  
      console.log(salida);                                            
      $("#entradaHistorial").append(salida);
    }*/
    actual = history.length;
    historial = actual;
    if(location.search!=""){
      selectJuego(location.search.split('-')[0].split('?')[1]);
      dificultad = decodeURI(location.search.split('-')[1]);
      getDificultad();
      /*switch(dificultad) {
          case 'Fácil':
              difficult=3000;
              break;
          case 'Media':
              difficult=2000;
              break;
          case 'Difícil':
              difficult=1000;
              break;
          default:
              alert("error de dificultad");
      } */
      
    }
    if(historico.length>0){
      $("#historial1").show();
    }
});


// Coordenadas --> datosJuego.features[numJuego].geometry.coordinates
// Nombre --> datosJuego.features[numJuego].properties.name
// Tag --> datosJuego.features[numJuego].properties.tag

function initMapa(x, y, zoom){
	map = L.map("map").setView([x, y], zoom);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        //attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18
    }).addTo(map);
  map.on("click", onMapClick);
}

function onMapClick(e) {
       if(stop){ 
        stop = false;
        posicionclick =e.latlng;
        distancia = calcularDistancia();
        continuar = false;
        var linea = L.polygon([
          [posicionclick.lat, posicionclick.lng],
          [datosJuego.features[numJuego].geometry.coordinates[1], datosJuego.features[numJuego].geometry.coordinates[0]]
        ]).addTo(map);
        var tstop = new Date();
        tiempo = Math.round((tstop-tiempo)/1000);
        puntos = Math.round(fotosMostradas * distancia);  
        puntuacion+=puntos;  
        document.getElementById("ronda"+ronda).innerHTML=puntos;   
        linea.bindPopup("Distancia: "+distancia+"\nPuntos: "+puntos).openPopup();
        if (ronda!=3){
          $("#continuar").show();
        }else{
          $("#finalizar").show();
        }
      }

}


function resetMap(){
  map.remove();
  initMapa(25,0,1);
}

//http://www.mapanet.eu/Resources/Script-Distance.htm
function calcularDistancia(){
    var lat1 = posicionclick.lat;
    var lon1 = posicionclick.lng;
    var lat2 = datosJuego.features[numJuego].geometry.coordinates[1];
    var lon2 = datosJuego.features[numJuego].geometry.coordinates[0];
    rad = function(x) {return x*Math.PI/180;}
    var R     = 6378.137;                          //Radio de la tierra en km
    var dLat  = rad( lat2 - lat1 );
    var dLong = rad( lon2 - lon1 );
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d.toFixed(3);                      //Retorna tres decimales
}

function getImagen(tag){
	var borrarImagen = document.getElementById('foto');
  if(borrarImagen!=undefined){
    document.getElementById('escaparate').removeChild(borrarImagen);
  };
  var flickerAPI="http://api.flickr.com/services/feeds/photos_public.gne?tags="+tag+"& tagmode=any&format=json&jsoncallback=?";
  $.getJSON(flickerAPI)
  .done(function( data ) {
    imagenes=data;
    contLanzarJuego();
  });//end función
} //end getImagen

function selectJuego(juego){
  document.getElementById("selJuego").innerHTML=juego;
  game=juego;
  leerGeo();
}

function selectDificultad(difi, dif){
  document.getElementById("selDificultad").innerHTML=difi;
  dificultad=difi;
  difficult=dif;
}

function getDificultad(){
  switch(dificultad) {
      case 'Fácil':
          difficult=3000;
          break;
      case 'Media':
          difficult=2000;
          break;
      case 'Difícil':
          difficult=1000;
          break;
      default:
          alert("error de dificultad");
  } 
  selectDificultad(dificultad,difficult);
}

function empezarJuego(){
  if(game!=null && difficult!=null){
    $("#inicio").fadeOut("fast");
    $("#juego").fadeIn("slow");
    $("#empezar").hide();
    $("#abandonar").show();
    document.getElementById("selJuego").removeAttribute('data-toggle');
    document.getElementById("selDificultad").removeAttribute('data-toggle');
    ronda=0;
    continuar=true;
    mostrarHistorial(historico, "entradaHistorialJuego");
    lanzarJuego();
  }else{
    alert("Hay que seleccionar un juego y su dificultad");
  }
}

function lanzarJuego(){
  ronda++;  
  imagenes=undefined;
  continuar=true;
  var old = numJuego;
  numJuego=Math.floor((Math.random() * 1000) + 1) % datosJuego.features.length;
  if (old==numJuego) 
    numJuego=Math.floor((Math.random() * 1000) + 1) % datosJuego.features.length;
  resetMap();
  tiempo = new Date();
  getImagen(datosJuego.features[numJuego].properties.tag);
}  

function contLanzarJuego(){
  if(imagenes!=undefined){
    $("#escaparate").append("<img id='foto' src="+imagenes.items[0].media.m+" alt='Ciudad "+0+"' ' class='img-responsive center-block'>");
    $("#juego").fadeIn("slow");
    fotosMostradas=1;
    setTimeout(function() {mostrarImagenes()}, difficult);
  }else{
    alert("DEPURAR: no carga imagenes, refresacar")
  }
}
function continuarJuego(){
  $("#continuar").hide();
  stop=true;
  lanzarJuego();
}

function mostrarImagenes(){
  if(continuar){
    var borrarImagen = document.getElementById('foto');
    if(borrarImagen!=undefined){
      document.getElementById('escaparate').removeChild(borrarImagen);
    };
    $("#escaparate").append("<img id='foto' src="+imagenes.items[fotosMostradas].media.m+" alt='Ciudad "+fotosMostradas+"' ' class='img-responsive center-block'>");
    fotosMostradas++;
    if(fotosMostradas!=imagenes.items.length&&continuar)
      intervalo = setTimeout(function() {mostrarImagenes(fotosMostradas)}, difficult);
  }
}

function finalizarJuego(){
  //guardar datos
  actualizarHistorial();
  abandonarJuego();
  for(i=1; i<4; i++){
    document.getElementById("ronda"+i).innerHTML=0;
  }
}
function abandonarJuego(){
  stop=true;
  $("#juego").fadeOut("slow");
  document.getElementById("selJuego").setAttribute("data-toggle","dropdown");
  document.getElementById("selDificultad").setAttribute("data-toggle","dropdown");
  $("#continuar").hide();
  $("#finalizar").hide();
  $("#abandonar").hide();
  $("#empezar").show();
  $("#inicio").fadeIn("slow");
  if(historico.length>0){
    $("#historial1").show();
  }
}

function leerGeo(){
    $.getJSON("./dist/GeoJson/"+game+".json", function(datos) {
      datosJuego = datos;
    });
}

function historyGo(pagina){
    var meta = pagina - actual;
    if(meta!=0){
        actual = pagina;
        history.go(meta);
        selectJuego(history.state.nombre);
        dificultad=history.state.dificultad;
        getDificultad();
    }
}

function mostrarHistorial(historico, donde){
  var salida = "";
  if (history.state!=null){
    for (i=0;i<historico.length;i++){
      salida=salida.concat('<tr><th scope="row">',(i+1),'</th><td><a href="javascript:historyGo(',historico[i].actual,')" >',historico[i].nombre,'</td></a><td>',historico[i].dificultad,'</td><td>',historico[i].puntos,'</td><td>',((historico[i].fecha.toString()).split("GMT"))[0],'</td></tr>');
    }
  }else{
    for (i=0;i<historico.length;i++){
      game = historico[i].nombre;
      dificultad = historico[i].dificultad;
      peti1= 'document.location.assign("?';
      peti= peti1.concat(game,'-',dificultad,'"');
      salida=salida.concat('<tr><th scope="row">',(i+1),'</th><td><a href=\'javascript:');
      salida=salida.concat(peti,')\' >',historico[i].nombre,'</td></a><td>',historico[i].dificultad,'</td><td>',historico[i].puntos,'</td><td>',((historico[i].fecha.toString()).split("GMT"))[0],'</td></tr>');
    }
  }
  document.getElementById(donde).innerHTML=salida;
}



function actualizarHistorial(){
    if(actual != historial){
        var meta = historial - actual;
        history.go(meta);
        actual = historial;
    }
    actual++;
    historial++;
    var estado = {  nombre: game,
                    dificultad: dificultad,
                    puntos: puntuacion,
                    fecha: new Date(), 
                    actual: actual }
    history.pushState(estado,'¿Dónde estarías?','?'+estado.nombre + '-' + estado.dificultad);
    if(historico==null)
      historico=[];
    historico.push(estado);
    if (historico.length>3) {
      historico.shift();
      resetLocal();
    }else{
      guardarLocal(estado);
    }
    mostrarHistorial(historico, "entradaHistorial");
    puntuacion = 0;
}

function resetLocal(){
  localStorage.clear(); 
  for(i=0;i<historico.length;i++){
    guardarLocal(historico[i]);
  }
}

function guardarLocal(estado){
  if (localStorage.length==0){
    localStorage.setItem("jugadas", 0);
  }
  var elem = Number(localStorage.getItem("jugadas"))+1;
  localStorage.setItem("jugadas", elem);
  localStorage.setItem("nombre"+elem, estado.nombre);
  localStorage.setItem("dificultad"+elem, estado.dificultad);
  localStorage.setItem("puntos"+elem, estado.puntos);
  localStorage.setItem("fecha"+elem, estado.fecha);
  localStorage.setItem("actual"+elem, estado.actual);
}

function leerLocal(){
  if (localStorage.length>0)
    for(i=1;i<=Number(localStorage.getItem("jugadas"));i++){
      historico.push({  nombre: localStorage.getItem("nombre"+i),
                        dificultad: localStorage.getItem("dificultad"+i),
                        puntos: localStorage.getItem("puntos"+i),
                        fecha: localStorage.getItem("fecha"+i), 
                        actual: localStorage.getItem("actual"+i)
                      });
    } 
}
