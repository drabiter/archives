(function(){
	var path = window.location.pathname.split('/');
	console.log(path);
	
	$('a.menu').click(function(e){
		e.preventDefault();
		var ref = $(this).attr('href');
		$('div.active').fadeOut(200, function(){
			$(this).removeClass('active');
			$(this).addClass('inactive');
			$('div#' + ref).fadeIn(200, function(){
				$(this).addClass('active');
				$(this).removeClass('inactive');
			});
		});
	});
})();