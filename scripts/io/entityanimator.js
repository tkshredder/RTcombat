define(function(){

	/**
	 * EntityAnimator class
	 * Description: Provides wrappers for specific animations used by the games characters and entities (ships, weather, items, etc)
	 * Requires: GSAP
	 */
	
	function EntityAnimator(game, $, gsap, sequence) {
		
		ca = this;
		
		// Animation variables (build this out)
		this.slideDuration = 0.3;
		this.timeline;
		this.timelinemax;
		this.tween;

		// Current Animation:
		this.target;
		this.characterName;
		this.actionName;
		this.results;
		
		// Queue of actions:
		this.actions = [];

		// Add the sequencer to the document:
		$(document).sequencer();


		
		return (this);	
	}
	
	// EntityAnimator class methods:
	EntityAnimator.prototype = {
	
		playAnimationSequence: function(action) {
			
			console.log('playAnimationSequence: ', action)

			currentAction = action;
			//isAnimating = true;
			success = action.results.success;

			// TO DO: pop out the previous character class


			// Remove the current character class on the frames
			currentClassName = action.classname;

			$('#frame1').removeClass(this.prevClassName+'1').addClass(currentClassName+'1');
			$('#frame2').removeClass(this.prevClassName+'2').addClass(currentClassName+'2');
			$('#characterWrapper').removeClass(this.prevClassName).addClass(currentClassName);
			
			// Update Ship BG:
			$('#locationBG').removeClass().addClass("abs " + action.shipname);

			// Update action name html:
			$('#action_name').html(action.actionname);

			this.prevClassName = currentClassName;

			// TO DO:
			// Make this dynamic based on the action
			createjs.Sound.play('attack_melee');


			$(document).sequencer('zoom', {element: 'characterWrapper', scalar: 1, duration:0});
			
			$(document).sequencer('zoom', {element: 'characterWrapper', scalar: 1.2, duration:300})
				.sequencer('advanceAnimation', {frame: 2})
				.sequencer('advanceAnimation', {delay:1000, frame: 1})
				.sequencer('callback', {delay: 1000, callback: function() { 
					if (action.success) {
						$(document).sequencer('blast', {duration:1000}).sequencer('shakeScreen');
					} else {
						console.log('fail!');
					}
				}
			});
		},

		updateHealthBar: function(healthbarID, amount) {

			$('.'+healthbarID).healthbar('damage', amount);
			$('.'+healthbarID).healthbar('updateHealthBar');

		},

		play: function() {
			console.log('timeline: ', this.timeline);
			this.timeline.restart();
		},
		
		addAnimation: function(data) {
			
			// Call the set target function:
			ca.setTarget(data.target);
			
			this.characterName = data.charaterName;
			this.actionName = data.actionName;
			this.results = data.results;
		},
		
		addAnimationAndPlay: function(data) {
			this.addAnimation(data);
			
			console.log("making animation div visible: ", data.target);
			
			$('#active_character').removeClass();
			$('#active_character').addClass(data.target).addClass("shadowfilter");
			
			this.play();
		},
		
		displayActionName: function() {
			
			console.log('++ (ca.js) - displayAction Name');
			
			$("#action_name").html(this.actionName);
			//$('#output_panel').toggle();
			//ca.toggleDarkness("#boat_bg");
		},
		
		displayResults: function() {
			$("#action_results").html(this.results);
			//ca.toggleDarkness("#boat_bg");
			
		},
		
		playNext: function() {
			
			console.log('\/\/\/\ ca.js play next');
			
			// Remove the top action from the actions queue:
			//ca.actions.shift();
			
			// NEED TO GET CURRENT CHARACTER NAME, ACTION NAME, and RESULT 
			
			if(ca.actions.length > 0) {
				// Move these into a reset function?
				//$('#output_panel').hide();
				//$('.result_text').empty();
				
				// TO DO: this needs to be made dynamic:
				//$(ca.target).removeClass('character_shaman').addClass('character_centipede');
				
				// Restart the timeline:
				ca.timeline.restart();
			}
		},
		
		toggleDarkness: function(element) {
			$(element).toggleClass("darken");
		},
		
		setTarget: function(element) {
			
			this.target = '#active_character';
			this.timeline = new TimelineLite({paused:true});
			
			console.log(' ------- (entityanimator.js) ', this.timeline, this.target);
			
			// Here's the full animation. Each key part of animation is chained together
			this.timeline
				.from(this.target, this.slideDuration, {x:"-608px", onComplete:this.displayAction})
				.to(this.target, 0, {delay:0.5}).to(this.target, 0, {backgroundPosition: "-608px 0px", delay: 0.2})
				.to(this.target, 0, {backgroundPosition: "0px 0px", delay: 0.2})
				.to(this.target, 0, {backgroundPosition: "-608px 0px", delay: 0.2}) // <-- TO DO: background position needs to be made dynamic!
				.to(this.target, 0, {backgroundPosition: "0px 0px", delay: 0.2,})
				.to(this.target, 0, {backgroundPosition: "0px 0px", delay: 0.5, onComplete:this.displayResults})
				.to(this.target, 0, {delay:3, onComplete:this.playNext});
		
		},

		animateActiveCharacter: function(character) {
			
			this.target = '#active_character';
			if (this.timeline) {
				this.timeline.clear();
			}
			
			this.timeline = new TimelineMax({repeat: -1});
			
			var characterWidth = this.lookupCharacterWidth(character);

			console.log(' ------- (entityanimator.js) animateCharacter. character: ' + character + ', Width: ' + characterWidth);
			
			// Toggle back and forth 
			this.timeline
				.to(this.target, 0, {backgroundPosition: -characterWidth + "px 0px", delay: 0.2})
				.to(this.target, 0, {backgroundPosition: "0px 0px", delay: 0.2})
				.to(this.target, 0, {backgroundPosition: -characterWidth + "px 0px", delay: 0.2})
				.to(this.target, 0, {backgroundPosition: "0px 0px", delay: 0.2})
				.to(this.target, 0, {delay:3})
				
			this.timeline.play();
		
		},

		lookupCharacterWidth: function(character) {
			
			switch (character) {
				case "skeleshark":
					return 697; break;
				case "deadsoldier":
					return 624; break;
				case "centipede":
					return 547; break;
				case "drowarcher":
					return 560; break;
				case "tentacles":
					return 647; break;
				case "shaman":
					return 608; break;
			}
			return 608;

		},


		floatBoat: function () {
			this.target = document.getElementById("active_ship");//'#active_ship';
			this.timelinemax = new TimelineMax({paused:true});
			//console.log(this.target);
			//TweenMax.to(this.target, 3, {y:"50px", repeat:-1, yoyo:true, ease:Power1.easeInOut});
			this.timelinemax.to(this.target, 3, {y:"50px", repeat:-1, yoyo:true, ease:Power1.easeInOut}).to(this.target, 3, {y:"0px", repeat:-1, yoyo:true, ease:Power1.easeInOut});
			this.timelinemax.repeat(-1);
			this.timelinemax.play();
			/*var boat = document.getElementById("boat");
			TweenMax.to(boat, 5, {y:"50px", repeat:-1, repeatDelay:0.5, yoyo:true, ease:Power1.easeInOut});
			*/
		},

		rotateCharacter: function () {
			this.target = document.getElementById("active_character");//'#active_ship';
			this.timelinemax = new TimelineMax({paused:true});
			//console.log(this.target);
			this.tween = TweenMax.to(this.target, 3, {rotation: 5, repeat:-1, yoyo:true, ease:Power1.easeInOut});
			
			//this.timelinemax.to(this.target, 3, {rotation:5, repeat:-1, yoyo:true, ease:Power1.easeInOut}).to(this.target, 3, {rotation:-5, repeat:-1, yoyo:true, ease:Power1.easeInOut});
			//this.timelinemax.repeat(-1);
			//this.timelinemax.play();
			/*var boat = document.getElementById("boat");
			TweenMax.to(boat, 5, {y:"50px", repeat:-1, repeatDelay:0.5, yoyo:true, ease:Power1.easeInOut});
			*/
		},

		startAnimation: function(animationID) {

			console.log('-- (entityanimator.js) startAnimation: ' + animationID);

			switch(animationID) {
				case "character":
					this.rotateCharacter();
					break;
				case "ship":
					this.floatBoat();
			}

		},

		stopAnimation: function(animationID) {
			
			console.log('--- (entityanimator.js) stopAnimation: ' + animationID);

			// TO DO:
			// Flesh this out the animator class with IDs for stored animations

			// Just call the stop timeline command:
			this.timelinemax.stop();

			// Kill the animating character:
			TweenMax.killTweensOf($("#active_character"));
		}





	}
	
	return EntityAnimator;

});
