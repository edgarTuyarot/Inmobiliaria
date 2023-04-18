
(function() {
    const lat = document.querySelector('#lat').value || -27.46056;
    const lng = document.querySelector('#lng').value || -58.98389;
    const mapa = L.map('mapa').setView([lat, lng ], 13);
    let marker;

    //utilizar Provider y Geocode
    const geocodeService = L.esri.Geocoding.geocodeService();


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //Pin
    marker = new L.marker([lat,lng],{
        draggable:true,
        autoPan:true
    })
    .addTo(mapa)

    //detectar el pin y obtener lt y lg
    marker.on('moveend',function(e){

        marker= e.target
        const posicion = marker.getLatLng()
        //centrar pin en nuevas LT LG
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng))

        //Obtener nombre de las calles
        geocodeService.reverse().latlng(posicion,13).run(function(error,resultado){
        console.log(resultado)
        marker.bindPopup(resultado.address.LongLabel)

        //llenar los campos input para pasar los datos al formulario
        document.querySelector('.calle').textContent = resultado?.address?.Address ?? "";
        document.querySelector('#calle').value = resultado?.address?.Address ?? "";
        document.querySelector('#lat').value = resultado?.latlng?.lat ?? "";
        document.querySelector('#lng').value = resultado?.latlng?.lng ?? "";

        })

    })
})()