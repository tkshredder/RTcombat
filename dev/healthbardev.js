$(function() {
	
	var showUI = true;
	var maxHP, currentHP, damageAmt, avatarOffset = 50, defaultAnimSpeed = animSpeed = 300;
	var avatars = ["drowcruiser", "deadblimp"], avatarIndex = 0;
	
	initEventHandlers();
	initKeyHandlers();
	
	updateValsFromControls();
	updateHealthBar();
	
	function initEventHandlers() {
		
		// MENU NAV
		$('.tabs li:not(.disabled)').click(function() {
			var currentItem = $(this).data('menuitem');
			$('.tabs li').removeClass('active'); 
			$(this).addClass('active');
			$('.panel').addClass('hidden');
			$('#'+currentItem+'_panel').removeClass('hidden');
		});
		
		// HEALTHBAR PANEL:
		$('#maxHPSlider').on('change', function() {
			maxHP = Number($(this).val());
			updateLabel('maxHP', maxHP);
		});
		
		$('#currentHPSlider').on('change', function() {
			currentHP = Number($(this).val());
			updateLabel('currentHP', currentHP);			
			animSpeed = 0;
			updateHealthBar();		
		});
		
		$('#damageAmtSlider').on('change', function() {
			damageAmt = Number($(this).val());
			updateLabel('damageAmt', damageAmt);
		});
		
		$('#animSpeedSlider').on('change', function() {
			defaultAnimSpeed = animSpeed = Number($(this).val());
			updateLabel('animSpeed', animSpeed);
		});
		
		// COMMANDS:
		$('#damageCommand').click(function() {
			currentHP -= Number($('#damageAmtSlider').val());
			
			animSpeed = defaultAnimSpeed;
			
			if (currentHP < 0) currentHP = 0;
			
			$('#currentHPSlider').val(currentHP);
			updateLabel('currentHP', currentHP);			
			updateHealthBar();	
		});	
		
		$('#resetCommand').click(function() {
			currentHP = 100;
			$('#currentHPSlider').val(currentHP);
			updateLabel('currentHP', currentHP);			
			updateHealthBar();	
		});
		
	}
	
	function updateValsFromControls() {
		// Preset vars based on control values:
		maxHP = Number($('#maxHPSlider').val());
		currentHP = Number($('#currentHPSlider').val());
		damageAmt = Number($('#damageAmtSlider').val());
		animSpeed = defaultAnimSpeed = Number($('#animSpeedSlider').val());
		updateLabel('maxHP', maxHP);
		updateLabel('currentHP', currentHP);
		updateLabel('damageAmt', damageAmt);
	}
	
	function updateLabel(prop, value) {
		$('#'+prop+'Label').html(value);
	}
	
	function updateHealthBar() { 
		var hpRatio = currentHP / maxHP;
		var hbWidth = $('.hb_gauge').width();
		var offset = -(hbWidth - (hpRatio * hbWidth));
		$('.hb_gauge').stop(true).animate({left: offset}, animSpeed);
		$('.hb_avatar').stop(true).animate({left: offset+hbWidth-avatarOffset}, animSpeed);
	}
	
	function initKeyHandlers() {
		$(document).on('keydown', function(e) {
			var code = e.keyCode || e.which;
			
			// Up arrow key:
			if (code == 38) {

				oldIndex = avatarIndex;
				avatarIndex++;
				if (avatarIndex >= avatars.length) 
					avatarIndex = 0;
				updateAvatarClass(oldIndex, avatarIndex);
			}
			
			// Down arrow key:
			if (code == 40) {
				
				oldIndex = avatarIndex;
				avatarIndex--;
				if (avatarIndex < 0) 
					avatarIndex = (avatars.length-1) 
				updateAvatarClass(oldIndex, avatarIndex);
			}
			
		});
	}
	
	function updateAvatarClass(oldIndex, newIndex) {
		$('.hb_avatar').removeClass(avatars[oldIndex]).addClass(avatars[newIndex]);
		avatarIndex = newIndex;
	}

});