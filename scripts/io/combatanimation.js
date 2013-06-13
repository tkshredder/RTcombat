define(function(){

	/**
	 * Window Combat Animation handler
	 * Description: Handles animations.
	 * Requires: GSAP
	 */
	
	function CombatAnimation(game, $, gsap) {
		
		ca = this;
		
		// Animation variables (build this out)
		this.slideDuration = 0.3;
		this.timeline;
		this.timelinemax;
		
		// Current Animation:
		this.target;
		this.characterName;
		this.actionName;
		this.results;
		
		// Queue of actions:
		this.actions = [];
		
		return (this);	
	}
	
	// CombatAnimation class methods:
	CombatAnimation.prototype = {
	
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
			
			//console.log(' ------- (ca.js) ', this.timeline, this.target);
			
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

		stopFloat: function() {
			this.timelinemax.stop();
		},

		stopAnimation: function(animiationID) {
			// TO DO:
			// Flesh this out the animator class with IDs for stored animations

			// Just call the stop float function for now.
			this.stopFloat();

		}





	}
	
	return CombatAnimation;

});
