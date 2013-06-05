define(function(){
	
	
	/**
	 * Window Sound 
	 * Description: handles loading and playback of sounds
	 */
	
	function WindowSound(createjs) {
		
		// Create a local reference to WindowSound:
		ws = this;
		
		// Private functions: 
		function handleFileLoad(event) {
			// A sound has been preloaded.
			console.log("Preloaded:", event.id, event.src);
			createjs.Sound.play(event.id);			
		}

				
		return this;		
	}
	
	WindowSound.prototype = {
		
		play: function(soundID) {
			createjs.Sound.play(soundID);
		},
	
		evaluateActionTypeAndPlay: function(data, delay) {
			//console.log(' -- (sound.js) evaluateActionTypeAndPlay: ', data);
			
			if (data.command.type == "attack") {				
				createjs.Sound.play("attack_melee", "none", 5);
			} else if (data.command.type == "magic") {
				createjs.Sound.play("magic_cast", "none", delay);
			}
			

		},
		
		evaluateActionSuccessAndPlay:function(data, delay) {
			
			console.log(' -- (sound.js) evaluateActionSuccessAndPlay: ', data, delay);
			
			if (data.success == true) {
				if (data.command.type == "attack") {	
					if(data.isCritical == true) {
						createjs.Sound.play("attack_critical", "none", delay);
					} else {
						createjs.Sound.play("attack_damage", "none", delay);
					}
				}
				else if (data.command.type == "magic") {
					if (data.command.elemental == "fire") {
						createjs.Sound.play("magic_fire", "none", delay);
					} else if (data.command.elemental == "thunder") {
						createjs.Sound.play("magic_thunder", "none", delay);
					} else {
						createjs.Sound.play("attack_damage", "none", delay);
					}
				}
			} 
			else // action was unsuccessful
			{
				if (data.command.type == "attack" || data.command.type == "magic") {
					createjs.Sound.play("attack_dodge", "none", delay);
				}
			}
		},
		
		loadAudio: function() {
			this.loadDQ4Assets();
			this.loadCV2Assets();
			this.loadMiscAssets();
		},
		
		loadDQ4Assets: function() {
			createjs.Sound.registerSound({id:"attack_critical", src:"audio/dq4/attack_critical.mp3"});
			createjs.Sound.registerSound({id:"attack_damage", src:"audio/dq4/attack_damage.mp3"});
			createjs.Sound.registerSound({id:"attack_dodge", src:"audio/dq4/attack_dodge.mp3"});
			createjs.Sound.registerSound({id:"attack_melee", src:"audio/dq4/attack_melee.mp3"});
			createjs.Sound.registerSound({id:"attack_melee2", src:"audio/dq4/attack_melee2.mp3"});
			createjs.Sound.registerSound({id:"magic_cast", src:"audio/dq4/magic_cast.mp3"});
			createjs.Sound.registerSound({id:"magic_fire", src:"audio/dq4/magic_fire.mp3"});
			createjs.Sound.registerSound({id:"magic_thunder", src:"audio/dq4/magic_thunder.mp3"});
			
			//createjs.Sound.addEventListener("fileload", handleFileLoad);
		},
		
		loadCV2Assets: function() {
			createjs.Sound.registerSound({id:"cv2_menu_tick", src:"audio/cv2/menu_tick.mp3"});
			createjs.Sound.registerSound({id:"damage_poison", src:"audio/cv2/menu_tick.mp3"});
			createjs.Sound.registerSound({id:"damage_whip", src:"audio/cv2/damage_whip.mp3"});
			createjs.Sound.registerSound({id:"damage_explosion", src:"audio/cv2/damage_explosion.mp3"});
		},

		loadMiscAssets: function() {
			createjs.Sound.registerSound({id:"menu_tick", src:"audio/misc/menu_tick.mp3"});
		}
		

	}
	
	return WindowSound;

});
