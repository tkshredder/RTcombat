$(function() {
	
	var showUI = true, healthbar;
	//var avatarOffset = 50, defaultAnimSpeed = animSpeed = 300;
	var avatars = ["drowcruiser", "deadblimp"], avatarIndex = 0;
	
	$('#healthbar').healthbar();
	hb = $('#healthbar').data('plugin_healthbar').options;
	
	initEventHandlers();
	initKeyHandlers();
	
	updateValsFromControls();
	$('#healthbar').healthbar('updateHealthBar');
	
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
			$('#healthbar').setMaxHP(Number($(this).val()));
			updateLabel('maxHP', $('#healthbar').getMaxHP());
		});
		
		$('#currentHPSlider').on('change', function() {
			currentHP = Number($(this).val());
			updateLabel('currentHP', currentHP);			
			animSpeed = 0;
			$('#healthbar').healthbar('setCurrentHP', currentHP).healthbar('updateHealthBar');	
		});
		
		$('#damageAmtSlider').on('change', function() {
			damageAmt = Number($(this).val());
			updateLabel('damageAmt', damageAmt);
		});
		
		$('#animSpeedSlider').on('change', function() {
			defaultAnimSpeed = animSpeed = Number($(this).val());
			updateLabel('animSpeed', animSpeed);
		});
		
		$('#fixAvatarCB').on('change', function() {
			if ($(this).is(':checked')) {
				$('.hb_avatar').addClass('fixed');
			} else {
				$('.hb_avatar').removeClass('fixed');
			}
		});
		
		// COMMANDS:
		$('#damageCommand').click(function() {
			
			animSpeed = defaultAnimSpeed;
			
			var damageAmount = Number($('#damageAmtSlider').val());
			
			$('#healthbar').healthbar('damage', damageAmount);
			var currentHP = hb.currentHP;
			
			$('#currentHPSlider').val(currentHP);
			updateLabel('currentHP', currentHP);			
			
			$('#healthbar').healthbar('updateHealthBar');
	
		});	
		
		$('#resetCommand').click(function() {
			var currentHP = 100;
			$('#healthbar').healthbar('setCurrentHP', currentHP);
			$('#currentHPSlider').val(currentHP);
			updateLabel('currentHP', currentHP);			
			$('#healthbar').healthbar('updateHealthBar');
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