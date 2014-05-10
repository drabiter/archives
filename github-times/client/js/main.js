var COLOR_MAP = {};
var JSONdata = {};

$(function(){
	$.ajaxSetup({
		beforeSend: function(xhr){
			if (xhr.overrideMimeType){
				xhr.overrideMimeType("application/json");
			}
		}
	});

	$.getJSON('colors.json', function(data){
		COLOR_MAP = data;
	}).fail(function(jqXHR, textStatus, errorThrown) {
		console.log("error " + textStatus);
		console.log("incoming " + jqXHR.responseText);
		console.log("thrown " + errorThrown);
	});

	// $.getJSON('http://github-times.herokuapp.com/?data='+getParameterByName('data'), function(data){
	$.getJSON('http://localhost:1337/?data='+getParameterByName('data'), function(data){
		JSONdata = data;

		$('#langCnt').parent().attr('data-title', JSONdata.langSum + ' languages');
		$('#eventCnt').parent().attr('data-title', JSONdata.eventSum + ' events');
		$('#langEvent1').parent().attr('data-title', 'languages X events');
		$('#langEvent2').parent().attr('data-title', 'languages X events');
		$('#langEvent3').parent().attr('data-title', 'languages X events');

		$('#loading').hide();
		$('article').show();

        draw1(); draw2(); draw3(); draw4(); draw5();
	}).fail(function(jqXHR, textStatus, errorThrown) {
		console.log("error " + textStatus);
		console.log("incoming " + jqXHR.responseText);
		console.log("thrown " + errorThrown);
	});

});

function clear(id){
	// $('#' + id + '> div').html('');
}

function draw(index){
	// switch (index){
	// 	case 1: draw1(); break;
	// 	case 2: draw2(); break;
	// 	case 3: draw3(); break;
	// 	case 4: draw4(); break;
	// 	case 5: draw5(); break;
	// 	default: break;
	// }
}

function draw1(){
	$.each(JSONdata.langCnt, function(i, k){
		k['color'] = COLOR_MAP[k.name];
	});
	$('#langCnt').highcharts({
		chart: { type: 'bar', backgroundColor: null },
        title: { text: null },
        xAxis: { 
        	type: 'category',
        	labels: { style: { color: '#ffffff' } } 
        },
        yAxis: {
            min: 0,
            title: { text: null, align: 'high' },
            labels: { style: { color: '#ffffff' } }
        },
        plotOptions: {
            bar: {
                dataLabels: { enabled: false },
                tooltip : { pointFormat: '<b>{point.y}</b><br/>' }
            }
        },
        legend:{ enabled: false },
        series: [
        	{ name: null, data: JSONdata.langCnt }
        ]
	});
}

function draw2(){
	$('#eventCnt').highcharts({
		chart: {
			type: 'pie',
			backgroundColor: null,
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: { text: null },
        tooltip: { pointFormat: '{series.name}: <b>{point.y}</b> times' },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: { enabled: true, color: '#fff', formatter: function() {
                            return '<b>'+ this.point.name +'</b>: '+ this.y +'';
                        } }
            }
        },
        series: [
        	{ name: 'Occured', data: JSONdata.eventCnt }
        ]
	});
}

function draw3(){
	$('#langEvent1').highcharts({
            chart: {
                type: 'line', backgroundColor: null,
                marginRight: 130,
                marginBottom: 25
            },
            title: { text: null },
            xAxis: {
                categories: JSONdata.eventOrder1, labels: { style: { color: '#ffffff' } } 
            },
            yAxis: {
                title: {
                    text: 'times'
                },
                labels: { style: { color: '#ffffff' } } ,
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#000'
                }]
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -10,
                y: 100,
                borderWidth: 0
            },
            series: JSONdata.langEvent1
        });
}

function draw4(){
	$('#langEvent2').highcharts({
            chart: {
                type: 'line', backgroundColor: null,
                marginRight: 130,
                marginBottom: 25
            },
            title: { text: null },
            xAxis: {
                categories: JSONdata.eventOrder2, labels: { style: { color: '#ffffff' } } 
            },
            yAxis: {
                title: {
                    text: 'times'
                }, labels: { style: { color: '#ffffff' } } ,
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#000'
                }]
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -10,
                y: 100,
                borderWidth: 0
            },
            series: JSONdata.langEvent2
        });
}

function draw5(){
	$('#langEvent3').highcharts({
            chart: {
                type: 'line', backgroundColor: null,
                marginRight: 130,
                marginBottom: 25
            },
            title: { text: null },
            xAxis: {
                categories: JSONdata.eventOrder3, labels: { style: { color: '#ffffff' } } 
            }, 
            yAxis: {
                title: {
                    text: 'times'
                }, labels: { style: { color: '#ffffff' } } ,
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#000'
                }]
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -10,
                y: 100,
                borderWidth: 0
            },
            series: JSONdata.langEvent3
        });
}

function getParameterByName(name){
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}