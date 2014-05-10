$(document).ready( function(){
  
  // Thank you underscorejs
  var debounce = function(func, wait, immediate) {
		var timeout, result;
		return function() {
			var context = this, args = arguments;
		  	var later = function() {
				timeout = null;
				if (!immediate) result = func.apply(context, args);
		  	};
		  	var callNow = immediate && !timeout;
		  	clearTimeout(timeout);
		  	timeout = setTimeout(later, wait);
		  	if (callNow) result = func.apply(context, args);
		  	return result;
		};
	};
  
  // Resizer function for canvas, container and chart objects
  var resizer = function( c, ct, chart ) {
    	
  		var canvas = $( c );
  		var container = $( ct );
  		var timeout = 125;
      var chart = chart;
  	
  		return debounce( 
  			function resizect( ){ 
  				var w = container.width();
  				var h = Math.round( 500 / 750.0 * w );
  				
  				canvas.attr( 'width', w );
  				canvas.attr( 'height', h );
  				canvas.css( 'width', w );
  				canvas.css( 'height', h );
  				
  				// Redraw the chart here
          // >> chart.redraw or chart = new Chart(cavas.getContext("2d"));
          // >> add the data again
  				
  			}, timeout, false
  		);
  	};
    
    $('canvas.graph').each( function() {
  	
		  var canvas = $( this );
  		var container = canvas.parent();
		
		  // Get your hcart here
      // chart = GetFrom(canvas.attr('id'))
		
  		var resizect = resizer( canvas, container, chart );
	  	$( window ).resize( resizect );
		  resizect();

  	});
    
});