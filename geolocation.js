(function() {

    'use strict';

    function updateLocationDetails(data) {
        var now = new Date();

        $('#location').html(window.locationTemplate(data));
        $('#location').delegate('.help', 'click', function (e) {
            var fieldName = $(e.currentTarget).closest('tr').find('td:nth-child(1)').text();
            alert('This is your ' + fieldName + ' from ISP ' + data.isp + ' at ' + now);
            return false;
        });
        $('#locationTable').removeClass('empty');
    }

    function resetLocation() {
        $('#location').html(window.locationTemplate({
            query: '0.0.0.0'
        }));
        $('#txtWebsite').val('http://');
        $('#googleMap').empty().css('background-color', 'inherit');
        window.map = null;
    }

    function displayMyLocation(address) {
        address = address || '';

        $.getJSON('http://ip-api.com/json/' + address)
        .success(function(locationData) {
            updateLocationDetails(locationData);

            markOnMap(locationData.lat, locationData.lon);
        })
        .error(function() {
            $('#messageCenter').append(window.messageTemplate({
                message:'Location unavailable!'
            }));
        });
    }

    function markOnMap(lat, lon) {
        if (!window.map) {
            window.map = new GMaps({
                el: '#googleMap',
                lat: lat,
                lng: lon
            });
        }
        window.map.markers = [];
        window.map.addMarker({
            lat: lat,
            lng: lon
        });
        window.map.fitZoom();
    }

    function displayWebsiteLocation(e) {
        e.preventDefault();

        var data = $(e.currentTarget).serializeArray();
        storeData();
        getSiteLocationbyURL(data[0].value.replace('http://', ''));
    }


    function populateHistoryTable(sessionStorage){

    	var tableId = document.getElementById('historyTable'),
    		tableArea = document.getElementById('historyTableArea'),
    		table;

    	if(!tableId){
    		table = document.createElement('table');
    		table.id = 'historyTable';
    		table.setAttribute('class','table table-striped');
    	}else{
    		table = document.getElementById('historyTable');
    		while(table.rows.length > 0){
    			table.deleteRow(0);
    		}
    	}

    	for(var i=0; i < sessionStorage.length; i++){
    		var tr = document.createElement('tr');
    		tr.setAttribute('class','clickable-row');
    		tr.addEventListener("click",historyFunc);
    		var a = document.createElement('a');
    		tr.appendChild(a);
    		a.href = sessionStorage.getItem(i);
    		a.innerHTML = sessionStorage.getItem(i);
    		table.appendChild(tr);
    	}
    	tableArea.appendChild(table);
    }

    function historyFunc(e) {
    	e.preventDefault();
    	getSiteLocationbyURL(($(this).context.innerText).replace('http://', ''));
    }

    function storeData() {
    	//Create a new key for session storage each time button is clicked
    	for (var index = 0; index >= sessionStorage.key(index); index++) {
		    if (sessionStorage.key(index) === null) {
		        sessionStorage.setItem(index, $('#txtWebsite').val());
		        break;
		    } else if (index > sessionStorage.key(index)) {
		        sessionStorage.setItem(index, $('#txtWebsite').val());
		        break;
		    }
    	}
    	populateHistoryTable(sessionStorage);
    	console.log(sessionStorage);
    }

    function getSiteLocationbyURL(websiteURL) {

        try {
            $.getJSON('http://freegeoip.net/json/' + websiteURL)
            .success(function (hostData) {
                //get the IP address of the website
                var siteIPAddress;
                updateLocationDetails(hostData);
                markOnMap(hostData.latitude, hostData.longitude);
            })
            .error(function (xhr, ajaxOptions, thrownError) {
                $('#messageCenter').append(window.messageTemplate({
                    message:'Site unavailable!'
                }));
            })
        } catch (e) {
            $('#messageCenter').append(window.messageTemplate({
                message:'Location unavailable!'
            }));
        }

    }

    function initialize() {
        window.locationTemplate = Handlebars.compile($('#locationTemplate').html());
        window.messageTemplate = Handlebars.compile($('#messageTemplate').html());

        resetLocation();

        $('#btnGetMyLocation').click(function() {
            displayMyLocation();
        });
        $('#formGeoLocation').submit(displayWebsiteLocation);
        $('#btnResetLocation').click(resetLocation);
    }

    $(document).ready(initialize);
})();
