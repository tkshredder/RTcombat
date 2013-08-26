$(document).ready(function() {
	
	var shakeCount, shakeMax = 10, speed = 5, top, left, distance = -5, currentFrame = 0, soundOn;
	var badges = ['trunkfin', 'egyptian', 'crown'], badgeIndex = 0;
	var locations = ['drowcruiser', 'deadblimp', 'sunset'], locIndex = 0;
	var fg, fgTM, bg, bgTM, ch, chTM;
	var rotationDuration, zoomMin, zoomMax;
	//var actions = [{character:"centipede", location:"drowcruiser", blast:"arch"}, {character:"shaman", location:"deadblimp", blast:"slash"}, {character:"tentacles", location:"sunset", blast:"wave"}, {character:"deadsoldier", location:"deadblimp", blast:"wave"}, {character:"skeleshark", location:"deadblimp", blast:"arch"}, {character:"drowarcher", location:"drowcruiser", blast:"arrow"}];
	var previewMode, isAnimating = false;
	
	// Update labels:
	$('#badgename').html(badges[0]);
	$('#locname').html(locations[0]);
	
	initAudio();
	
	// Assign vars based off existing UI values:
	rotationDuration = $('#rotationduration').val();
	zoomMin = $('#zoommin').val();
	zoomMax = $('#zoommax').val();

	// Add slider callbacks:
	$('#rotationduration').on("change", function() {
		rotationDuration = $(this).val();
		$('#rottimelabel').html(rotationDuration);
	});
	
	$('#zoommin').on("change", function() {
		zoomMin = $(this).val();
		$('#zoomminlabel').html(zoomMin);
	});
	
	$('#zoommax').on("change", function() {
		zoomMax = $(this).val();
		$('#zoommaxlabel').html(zoomMax);
	});
	
	$('#soundCB').on('change', function() {
		soundOn = $(this).attr("checked");
		
	});
	
	// Start the float animation:
	// NOTE: this makes grabbing elements from the DOM difficult to grab
	if ($('#floating').is(":checked")) {
		floatBoat(true);
	}
	
	/* Click handlers */
	
	$('#rotate').click(function() {
		rotate();
	});
	
	$('#explode').click(function() {
		explode();
	});
	
	$('#reset').click(function() {
		reset();
	});
	
	$('#animate').click(function() {
		if (isAnimating) return; 
		
		startAnimation();
		
		previewMode = "single";
	});
		
	$('#floating').change(function() {
		($('#floating').is(":checked")) ? floatBoat(true) : floatBoat(false);
	});
	
	// Key Press Handlers
	$(document).on('keydown', function(e) {
		var code = e.keyCode || e.which;
		
		console.log('keypress: ' + code);
		
		// Left shift key:
		if (code == 16) {
			resetBadge();
		}
		
		// Up arrow key:
		if (code == 38) {
			oldIndex = badgeIndex;
			badgeIndex++;
			if (badgeIndex >= badges.length) badgeIndex = 0;
			updateBadgeClass(oldIndex, badgeIndex);
		}
		// Down arrow key:
		if (code == 40) {
			oldIndex = badgeIndex;
			badgeIndex--;
			if (badgeIndex < 0) badgeIndex = (badges.length-1);
			updateBadgeClass(oldIndex, badgeIndex);
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
		
		// [r] key:
		if (code == 82) {
			rotate(); 
		}
		
		// [e] key:
		if (code == 69) {
			explode();
		}
		
		// BACKSPACE or DEL key:
		if (code == 8 || code == 46) {
			reset();
		}
		
		// ENTER or SPACE:
		if (code == 13 || code == 32) {
			explode();
		}
		
	});
	
	function initAudio() {
		createjs.Sound.registerSound({id:"summon_chirp", src:"../audio/som/summon_chirp.mp3"});
		createjs.Sound.registerSound({id:"magic_blast", src:"../audio/som/magic_blast.mp3"});
	}
	
	function reset() {
		TweenLite.to($('#badgeIcon'), 0, {rotationY:"0deg", transformPerspective:1000, scale: 1, autoAlpha: 1});
		TweenLite.to($('#badgeRing'), 0, {rotationY:"0deg", transformPerspective:1000, scale: 1, autoAlpha: 1});
	}
	
	function rotate() {
		TweenLite.to($('#badgeIcon'), 0, {rotationY:"0deg", transformPerspective:1000});
		TweenLite.to($('#badgeIcon'), (rotationDuration/1000), {rotationY:"360deg", transformPerspective:1000});
		TweenLite.to($('#badgeRing'), 0, {rotationY:"0deg", transformPerspective:1000});
		TweenLite.to($('#badgeRing'), (rotationDuration/1000), {rotationY:"360deg", transformPerspective:1000});
		//$.playSound('../audio/som/summon_chirp.mp3');
		
		createjs.Sound.play("summon_chirp");
	}
	
	function explode() {
		TweenLite.to($('#badgeIcon'), 0, {scale: 1, autoAlpha: 1});
		TweenLite.to($('#badgeIcon'), 2, {scale: 10, autoAlpha: 0});
		TweenLite.to($('#badgeRing'), 0, {scale: 1});
		TweenLite.to($('#badgeRing'), 2, {scale: 10});
		
		//$.playSound('../audio/som/magic_blast.mp3');
		createjs.Sound.play("magic_blast");
	}
	
	function animateNextItemInQ() {
		var currentAction = actions.shift(); // "pops" off 1st element of array
		completedActions.push(currentAction); // push the currentAction into the completeActions queue
		
		if (currentAction != null) {
			var newCharIndex = characters.indexOf(currentAction.character);
			var newLocationIndex = locations.indexOf(currentAction.location);
			var newBlastIndex = blasts.indexOf(currentAction.blast);
		} else {
			return;
		}
		
		if ((newCharIndex != -1) && newLocationIndex != -1) {		
			updateCharacterClass(cIndex, newCharIndex);
			updateBlastClass(bIndex, newLocationIndex);
			updateBGClass(locIndex, newLocationIndex);
			
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
	function updateBadgeClass(oldIndex, newIndex) {
		$('#badgeIcon').removeClass(badges[oldIndex]).addClass(badges[newIndex]);
		$('#badgeRing').removeClass(badges[oldIndex]).addClass(badges[newIndex]);
		$('#badgename').html(badges[newIndex]);
		badgeIndex = newIndex;
	}
	function updateBGClass(oldIndex, newIndex) {
		$('#shipBG').removeClass(locations[oldIndex]).addClass(locations[newIndex]);
		$('#shipFG').removeClass(locations[oldIndex]).addClass(locations[newIndex]);
		$('#locname').html(locations[newIndex]);
		locIndex = newIndex;
	}
	
	function floatBoat(value){
		
		if (value == false) {
			if (fgTM) fgTM.stop();
			if (bgTM) bgTM.stop();
			if (chTM) chTM.stop();
			
			return;
		} 
		
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
	}
	
	function zoomEffect(percent, duration) {
		leftAmount = (percent>=100) ? (percent-100) / 2 : 0;
		
		//$('#wrapper').css({width:percent+'%', left:'-'+leftAmount+'%'});
		$('#wrapper').animate({width:percent+'%', left:'-'+leftAmount+'%'}, duration);
	}
	
	function resolve() {
		//$.playSound('../audio/crunch_comp1b.mp3');
		zoomEffect(110, 0);
		//advanceCharacterAnimation();
		
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
	
	
	
});