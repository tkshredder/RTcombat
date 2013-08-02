// Add playSound function to jquery:
(function($){
  $.extend({
    playSound: function(){
      return $("<embed src='"+arguments[0]+"' hidden='true' autostart='true' loop='false' class='playSound' style='height: 0'>").appendTo('#wrapper');
    }
  });
})(jQuery);

$(document).ready(function() {
	
	var shakeCount, shakeMax = 10, speed = 5, top, left, distance = -5, currentFrame = 0;
	var characters = ["centipede", "shaman", "deadsoldier", "tentacles", "skeleshark", "drowarcher"], cIndex = 0;
	var blasts = ["arch", "slash", "wave", "arrow"], bIndex = 0;
	
	// Update labels:
	$('#charname').html(characters[0]);
	$('#blastname').html(blasts[0]);
	
	// Click handlers:
	$('#start').click(function() {
		shakeCount = shakeMax;
		moveIt();
	});
	
	$('#animate').click(function() {
		startAnimation();
	});
	
	// Keycodes
	$(document).on('keydown', function(e) {
		var code = e.keyCode || e.which;
		
		console.log('keypress: ' + code);
		
		// Left arrow key:
		if (code == 37) {
			oldIndex = cIndex;
			cIndex--;
			if (cIndex < 0) cIndex = (characters.length-1);
			updateCharacterClass(oldIndex, cIndex);
		}
		// Right arrow key:
		if (code == 39) {
			oldIndex = cIndex;
			cIndex++;
			if (cIndex >= characters.length) cIndex = 0;
			updateCharacterClass(oldIndex, cIndex);
		}
		// Up arrow key:
		if (code == 38) {
			oldIndex = bIndex;
			bIndex++;
			if (bIndex >= blasts.length) bIndex = 0;
			updateBlastClass(oldIndex, bIndex);
		}
		// Down arrow key:
		if (code == 40) {
			oldIndex = bIndex;
			bIndex--;
			if (cIndex < 0) bIndex = (blasts.length-1);
			updateBlastClass(oldIndex, cIndex);
		}
		// ENTER or SPACE:
		if (code == 13 || code == 32) {
			startAnimation();
		}
		
	});
	
	function startAnimation() {
		$.playSound('../audio/dq4/attack_melee.mp3');
		advanceCharacterAnimation();
		setTimeout(resolve, 300);
	}
	
	function updateCharacterClass(oldIndex, newIndex) {
		$('#frame1').removeClass(characters[oldIndex]+"1").addClass(characters[newIndex]+"1");
		$('#frame2').removeClass(characters[oldIndex]+"2").addClass(characters[newIndex]+"2");
		$('#characterWrapper').removeClass(characters[oldIndex]).addClass(characters[newIndex]);
		$('#charname').html(characters[newIndex]);
	}
	function updateBlastClass(oldIndex, newIndex) {
		$('#blast').removeClass(blasts[oldIndex]).addClass(blasts[newIndex]);
		$('#blastname').html(blasts[newIndex]);
	}
	
	function resolve() {
		$.playSound('../audio/crunch_comp1b.mp3');
		
		advanceCharacterAnimation();
		shakeCount = shakeMax;
		moveIt();
		blastIt();	
	}
	
	function advanceCharacterAnimation() {
		currentFrame += 1;
		if (currentFrame > 1) currentFrame = 0;
		
		setAnimationFrame(currentFrame);
	}
	
	function setAnimationFrame(frame) {
		if (frame == 1) {
			$('#frame1').addClass('hidden');
			$('#frame2').removeClass('hidden');
			
		} else {
			$('#frame2').addClass('hidden');
			$('#frame1').removeClass('hidden');

		}
	}
	
	function moveIt() {
		shakeCount--;
		if (shakeCount > 0) {
			top = (Math.random() * distance) +"%", 
			left = (Math.random() * distance) + "%";

			$('#wrapper').animate({top: top, left:left}, speed, function() { moveIt(); });
		} else {
			$('#wrapper').animate({top: "-5%", left:"-5%"}, speed);
		}
	}
	
	function blastIt() {
		$('#blast').removeClass('hidden').css({opacity: 1}).animate({opacity:0}, 2000);
	}
	
	
});