$(document).ready(function() {
	console.log('let us get static!');

	var $panels = $('.panel');
	var panelCount = $panels.length;
	var currentPanel = 0;

	console.log(panelCount);

	// Keycodes
	$(document).on('keydown', function(e) {
		var code = e.keyCode || e.which;
		
		console.log('keypress!: ' + code)

		// Right arrow
		if (code == 39) {
			// Hide the current Panel:
			$($panels[currentPanel]).addClass('hidden');

			// Increment / fix the currentPanel index:
			if (++currentPanel > panelCount) currentPanel = 0;

			// Unhide the new current Panel:
			$($panels[currentPanel]).removeClass('hidden');
		}
	});
});
