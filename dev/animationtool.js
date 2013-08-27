$(document).ready(function() {
	
	var shakeCount, shakeMax = 10, speed = 5, top, left, distance = -5, currentFrame = 0, charZoomDuration, currentZoom = 110, blastDuration = 2000;
	var previewMode, isAnimating = false;
	
	var crew = ["centipede", "shaman", "deadsoldier", "tentacles", "skeleshark", "drowarcher"], crewIndex = 0;
	var blasts = ["arch", "slash", "wave", "arrow"], blastIndex = 0;
	var badges = ['trunkfin', 'egyptian', 'crown'], badgeIndex = 0;
	var locations = ["drowcruiser", "deadblimp", "sunset"], locationIndex = 0;
	
	var fg, fgTM, bg, bgTM, ch, chTM;
	
	var actions = [
		{character:"centipede", location:"drowcruiser", blast:"arch"}, 
		{character:"shaman", location:"deadblimp", blast:"slash"}, 
		{character:"tentacles", location:"sunset", blast:"wave"}, 
		{character:"deadsoldier", location:"deadblimp", blast:"wave"}, 
		{character:"skeleshark", location:"deadblimp", blast:"arch"}, 
		{character:"drowarcher", location:"drowcruiser", blast:"arrow"}];
	var completedActions = [];
		
	// Update labels:
	$('#charname').html(crew[0]);
	$('#blastname').html(blasts[0]);
	$('#locname').html(locations[0]);
	
	charZoomDuration = $('#charZoomDuration').val();
	
	// Start the float animation:
	// NOTE: this makes grabbing elements from the DOM difficult to grab
	if ($('#floating').is(":checked")) {
		floatBoat(true);
	}
	
	initEventHandlers();
	initKeyHandlers();
	initAudio();
	
	function initEventHandlers() {
		
		// MENU NAV
		$('.tabs li').click(function() {
			var currentItem = $(this).data('menuitem');
			$('.tabs li').removeClass(); 
			$(this).addClass('active');
			$('.panel').addClass('hidden');
			$('#'+currentItem+'_panel').removeClass('hidden');
		});
		
		// CHARACTER PANEL:
		$('#charZoomDuration').on('change', function() {
			charZoomDuration = $(this).val();
			$('#charZoomLabel').html(charZoomDuration);
		});
		
		$('#zoommin').on('change', function() {
			zoomMin = $(this).val();
			$('#zoomminlabel').html(zoomMin);
		});
		
		$('#zoommax').on('change', function() {
			zoomMax = $(this).val();
			$('#zoommaxlabel').html(zoomMax);
		});
		
		$('#soundCB').on('change', function() {
			soundOn = $(this).attr("checked");
			
		});
		
		$('#floating').change(function() {
			($('#floating').is(":checked")) ? floatBoat(true) : floatBoat(false);
		});
		
		// COMMANDS:
		$('#charZoomInOutCommand').click(function() {
			zoomAmount = (currentZoom == 110) ? 120 : 110;
			zoomEffect(zoomAmount, charZoomDuration);
			if (currentZoom == 110) {
				$('#charZoomInOut').html('Crew Zoom In');
			} else {
				$('#charZoomInOut').html('Crew Zoom Out');
			}
		});
		
		$('#blastCommand').click(function() {
			blastIt();
		});
		
		$('#shakeCommand').click(function() {
			shakeCount = shakeMax;
			moveIt();
		});
		
		$('#animateCommand').click(function() {
			if (isAnimating) return; 
			
			startAnimation();
			
			previewMode = "single";
		});
		
		$('#fullsequenceCommand').click(function() {
			
			previewMode = "full";
			
			// Reset, if needed.
			if (actions.length == 0)
				actions = completedActions;
			
			animateNextItemInQ();
		});
		
		
	}
	
	function initKeyHandlers() {
		$(document).on('keydown', function(e) {
			var code = e.keyCode || e.which;
			
			console.log('keypress: ' + code);
			
			// Up arrow key:
			if (code == 38) {
				
				// Get the attribute we need to update:
				var activePanelID = $('.panel:not(.hidden)').attr('id');
				var attributeToChange = activePanelID.substr(0, activePanelID.length - 6);
				
				targetIndex = getTargetIndex(attributeToChange);
				targetArray = getTargetArray(attributeToChange);
				
				oldIndex = targetIndex;
				targetIndex++;
				if (targetIndex >= targetArray.length) 
					targetIndex = 0;
				updateClass(attributeToChange, oldIndex, targetIndex);
			}
			
			// Down arrow key:
			if (code == 40) {
				
				// Get the attribute we need to update:
				var activePanelID = $('.panel:not(.hidden)').attr('id');
				var attributeToChange = activePanelID.substr(0, activePanelID.length - 6);
				
				targetIndex = getTargetIndex(attributeToChange);
				targetArray = getTargetArray(attributeToChange);
				
				oldIndex = targetIndex;
				targetIndex--;
				if (targetIndex < 0) 
					targetIndex = (targetArray.length-1) 
				updateClass(attributeToChange, oldIndex, targetIndex);
			}
			
			/*
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
			*/
			
		});
	}
	
	
	function initAudio() {
		createjs.Sound.registerSound({id:"summon_chirp", src:"../audio/som/summon_chirp.mp3"});
		createjs.Sound.registerSound({id:"magic_blast", src:"../audio/som/magic_blast.mp3"});
	}
	
	function getTargetIndex(attribute) {
		switch (attribute) {
			case "crew":
				return crewIndex; break;
			case "badges":
				return badgeIndex; break;
			case "blasts":
				return blastIndex; break;
			case "locations":
				return locationIndex; break;
		}
		return -1;
	}
	
	function getTargetArray(attribute) {
		switch (attribute) {
			case "crew":
				return crew; break;
			case "badges":
				return badges; break;
			case "blasts":
				return blasts; break;
			case "locations":
				return locations; break;
		}
		return -1;
	}
	
	function startAnimation() {
		isAnimating = true; 
		$.playSound('../audio/dq4/attack_melee.mp3');
		zoomMax = $('#zoommax').val();
		zoomEffect(zoomMax);
		setTimeout(advanceCharacterAnimation, 200);
		setTimeout(resolve, 500);
	}
	
	function animateNextItemInQ() {
		var currentAction = actions.shift(); // "pops" off 1st element of array
		completedActions.push(currentAction); // push the currentAction into the completeActions queue
		
		if (currentAction != null) {
			var newCharIndex = crew.indexOf(currentAction.character);
			var newLocationIndex = locations.indexOf(currentAction.location);
			var newBlastIndex = blasts.indexOf(currentAction.blast);
		} else {
			return;
		}
		
		if ((newCharIndex != -1) && newLocationIndex != -1) {		
			updateCharacterClass(crewIndex, newCharIndex);
			updateBlastClass(blastIndex, newLocationIndex);
			updateBGClass(locrewIndex, newLocationIndex);
			
			startAnimation();
		}
	}
	
	function updateClass(attributeToChange, oldIndex, newIndex) {
		switch(attributeToChange) {
			case "crew":
				updateCharacterClass(oldIndex, newIndex); break;
			case "blasts":
				updateBlastClass(oldIndex, newIndex); break;
			case "locations":
				updateLocationClass(oldIndex, newIndex); break;
			case "badges":
				updateBadgeClass(oldIndex, newIndex); break;
		}
	}
	
	function updateCharacterClass(oldIndex, newIndex) {
		$('#frame1').removeClass(crew[oldIndex]+"1").addClass(crew[newIndex]+"1");
		$('#frame2').removeClass(crew[oldIndex]+"2").addClass(crew[newIndex]+"2");
		$('#characterWrapper').removeClass(crew[oldIndex]).addClass(crew[newIndex]);
		$('#charname').html(crew[newIndex]);
		crewIndex = newIndex;
	}
	function updateBadgeClass(oldIndex, newIndex) {
		$('#badgeIcon').removeClass(badges[oldIndex]).addClass(badges[newIndex]);
		$('#badgeRing').removeClass(badges[oldIndex]).addClass(badges[newIndex]);
		$('#badgename').html(badges[newIndex]);
		badgeIndex = newIndex;
	}
	function updateBlastClass(oldIndex, newIndex) {
		$('#blast').removeClass(blasts[oldIndex]).addClass(blasts[newIndex]);
		$('#blastname').html(blasts[newIndex]);
		blastIndex = newIndex;
	}
	function updateLocationClass(oldIndex, newIndex) {
		$('#locationBG').removeClass(locations[oldIndex]).addClass(locations[newIndex]);
		$('#locationFG').removeClass(locations[oldIndex]).addClass(locations[newIndex]);
		$('#locname').html(locations[newIndex]);
		locationIndex = newIndex;
	}
	
	function floatBoat(value){
		
		if (value == false) {
			if (fgTM) fgTM.stop();
			if (bgTM) bgTM.stop();
			if (chTM) chTM.stop();
			
			return;
		} 
		
		fg = document.getElementById("locationFG");
		fgTM = new TimelineMax({paused:true});		
		fgTM.to(fg, 3, {y:"50px", ease:Power1.easeInOut}).to(fg, 3, {y:"0px", ease:Power1.easeInOut});
		fgTM.repeat(-1);
		fgTM.play();
		
		bg = document.getElementById("locationBG");
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
		leftAmount = (percent >= 100) ? (percent-100) / 2 : 0;
		currentZoom = percent;
		
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
		$('#blast').removeClass('hidden').css({opacity: 1}).animate({opacity:0}, blastDuration, function() { 
			/*isAnimating = false; 
			if (previewMode == "full") { 
				animateNextItemInQ();
			}*/
		});
	}
	
	
});