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
	var locations = ["drowcruiser", "deadblimp", "sunset"], locIndex = 0;
	var fg, fgTM, bg, bgTM, ch, chTM;
	var actions = [{character:"centipede", location:"drowcruiser"}, {character:"shaman", location:"deadblimp"}, {character:"tentacles", location:"sunset"}, {character:"deadsoldier", location:"deadblimp"}, {character:"skeleshark", location:"deadblimp"}, {character:"drowarcher", location:"drowcruiser"}];
	
	// Update labels:
	$('#charname').html(characters[0]);
	$('#blastname').html(blasts[0]);
	$('#locname').html(locations[0]);
	
	// Start the float animation:
	// NOTE: this makes grabbing elements from the DOM difficult to grab
	//floatBoat();
	
	// Click handlers:
	$('#shake').click(function() {
		shakeCount = shakeMax;
		moveIt();
	});
	
	$('#animate').click(function() {
		startAnimation();
	});
	
	$('#fullsequence').click(function() {
		animateNextItemInQ();
	});
	
	// Key Press Handlers
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
		
		// [+] key:
		if (code == 187) {
			oldIndex = locIndex;
			locIndex++;
			if (locIndex >= locations.length) locIndex = 0;
			updateBGClass(oldIndex, locIndex);
		}
		
		// [-] key:
		if (code == 189) {
			oldIndex = locIndex;
			locIndex--;
			if (locIndex < 0) locIndex = (locations.length-1);
			updateBGClass(oldIndex, locIndex);
		}
		
		// [[] key:
		if (code == 221) {
			zoomMax = $('#zoommax').val();
			zoomEffect(zoomMax, 1000);
		}
		// []] key:
		if (code == 219) {
			zoomMin = $('#zoommin').val();
			zoomEffect(zoomMin, 1000);
		}
		
		// ENTER or SPACE:
		if (code == 13 || code == 32) {
			startAnimation();
		}
		
	});
	
	function startAnimation() {
		$.playSound('../audio/dq4/attack_melee.mp3');
		zoomMax = $('#zoommax').val();
		zoomEffect(zoomMax);
		setTimeout(advanceCharacterAnimation, 200);
		setTimeout(resolve, 500);
	}
	
	function animateNextItemInQ() {
		var currentAction = actions.shift(); // "pops" off 1st element of array
		
		if (currentAction != null) {
			var newCharIndex = characters.indexOf(currentAction.character);
			var newLocationIndex = locations.indexOf(currentAction.location);
		} else {
			return;
		}
		
		if ((newCharIndex != -1) && newLocationIndex != -1) {		
			updateCharacterClass(cIndex, newCharIndex);
			updateBGClass(bIndex, newLocationIndex);
			
			startAnimation();
		}
	}
	
	function updateCharacterClass(oldIndex, newIndex) {
		$('#frame1').removeClass(characters[oldIndex]+"1").addClass(characters[newIndex]+"1");
		$('#frame2').removeClass(characters[oldIndex]+"2").addClass(characters[newIndex]+"2");
		$('#characterWrapper').removeClass(characters[oldIndex]).addClass(characters[newIndex]);
		$('#charname').html(characters[newIndex]);
		cIndex = newIndex;
	}
	function updateBlastClass(oldIndex, newIndex) {
		$('#blast').removeClass(blasts[oldIndex]).addClass(blasts[newIndex]);
		$('#blastname').html(blasts[newIndex]);
		bIndex = newIndex;
	}
	function updateBGClass(oldIndex, newIndex) {
		$('#shipBG').removeClass(locations[oldIndex]).addClass(locations[newIndex]);
		$('#shipFG').removeClass(locations[oldIndex]).addClass(locations[newIndex]);
		$('#locname').html(locations[newIndex]);
		locIndex = newIndex;
	}
	
	function floatBoat(){
		
		fg = document.getElementById("shipFG");
		fgTM = new TimelineMax({paused:true});		
		fgTM.to(fg, 3, {y:"50px", ease:Power1.easeInOut}).to(fg, 3, {y:"0px", ease:Power1.easeInOut});
		fgTM.repeat(-1);
		fgTM.play();
		
		bg = document.getElementById("shipBG");
		bgTM = new TimelineMax({paused:true});
		bgTM.to(bg, 3, {y:"-20px", ease:Power1.easeInOut}).to(bg, 3, {y:"0px", ease:Power1.easeInOut});
		bgTM.repeat(-1);
		bgTM.play();
		
		ch = document.getElementById("characterWrapper");
		chTM = new TimelineMax({paused:true});
		chTM.to(ch, 3, {y:"20px", ease:Power1.easeInOut}).to(ch, 3, {y:"0px", ease:Power1.easeInOut});
		chTM.repeat(-1);
		chTM.play();
	}
	
	function zoomEffect(percent, duration) {
		leftAmount = (percent>=100) ? (percent-100) / 2 : 0;
		
		//$('#wrapper').css({width:percent+'%', left:'-'+leftAmount+'%'});
		$('#wrapper').animate({width:percent+'%', left:'-'+leftAmount+'%'}, duration);
	}
	
	function resolve() {
		$.playSound('../audio/crunch_comp1b.mp3');
		zoomEffect(110, 0);
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
		$('#blast').removeClass('hidden').css({opacity: 1}).animate({opacity:0}, 2000, function() { animateNextItemInQ() });
	}
	
	
});