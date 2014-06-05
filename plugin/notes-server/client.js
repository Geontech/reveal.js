(function() {
	// don't emit events from inside the previews themselves
	if ( window.location.search.match( /receiver/gi ) ) { return; }

	var socket = io.connect(window.location.origin);
	var socketId = Math.random().toString().slice(2);
	
	// FIXME: Adding feedback from the slide notes window
	socket.on('reveal', function(direction) {
	    switch(direction) {
	        case 'next':
	            Reveal.next();
	            break;
	        case 'prev':
	            Reveal.prev();
	            break;
	        case 'up':
	            Reveal.up();
	            break;
	        case 'down':
	            Reveal.down();
	            break;
	        default:
	            break;
	    }
	});
	
	// FIXME: Path and leading / removed from notes -- Reason: follow path hierarchy.
	var path = window.location.origin + window.location.pathname;
	console.log('View slide notes at ' + path + 'notes/' + socketId);
	window.open(path + 'notes/' + socketId, 'notes-' + socketId);

	// Fires when a fragment is shown
	Reveal.addEventListener( 'fragmentshown', function( event ) {
		var fragmentData = {
			fragment : 'next',
			socketId : socketId
		};
		socket.emit('fragmentchanged', fragmentData);
	} );

	// Fires when a fragment is hidden
	Reveal.addEventListener( 'fragmenthidden', function( event ) {
		var fragmentData = {
			fragment : 'previous',
			socketId : socketId
		};
		socket.emit('fragmentchanged', fragmentData);
	} );

	// Fires when slide is changed
	Reveal.addEventListener( 'slidechanged', function( event ) {
		var nextindexh;
		var nextindexv;
		var slideElement = event.currentSlide;

		if (slideElement.nextElementSibling && slideElement.parentNode.nodeName == 'SECTION') {
			nextindexh = event.indexh;
			nextindexv = event.indexv + 1;
		} else {
			nextindexh = event.indexh + 1;
			nextindexv = 0;
		}

		var notes = slideElement.querySelector('aside.notes');
		var slideData = {
			notes : notes ? notes.innerHTML : '',
			indexh : event.indexh,
			indexv : event.indexv,
			nextindexh : nextindexh,
			nextindexv : nextindexv,
			socketId : socketId,
			markdown : notes ? typeof notes.getAttribute('data-markdown') === 'string' : false

		};

		socket.emit('slidechanged', slideData);
	} );
}());
