define(function(){
	
	
	/**
	 * Window Input 
	 * Description: Sets various aspects in the DOM to keep view-related info away from the main core.
	 * TO DO: migrate display Message X to displayMessages(messages, params).
	 */
	
	function WindowInput(game, client, output, sound, socket, $) {
		
		// Create a local reference to WindowInput:
		wi = this;
		
		cn = "[WI]: ";
		this.game = game;
		this.client = client;
		this.output = output;
		this.sound = sound;
		this.socket = socket;
		
		// DOM event handlers:
		
		// Join button:	
		$('#join').click(function() {
			wi.onJoin();
		});

		$('#login').click(function() {
			name = $('#loginname').val();
			console.log('login name: ', name)
			if (name != '') {

				wi.socket.emit('join', {name: name});
			} else {
				alert('Please enter a name to continue.')
			}
		});

		// Chat form
		$('#chat').submit(function(e) { 
			
			e.preventDefault(); // Prevent form from submitting
			
			myMessage = $('#chatinput').val();
			
			// TO DO:
			// scrub the message to protect against injection attacks

			if (myMessage != '') {
				wi.socket.emit('sendchat', {message:myMessage, playerID:wi.client.getMyID()});
				$('#chatinput').val('');
			}
			
		});

		// Hide button
		$('#chat_toggle').click(function() {
			$(this).parent().addClass('panelhidden');
		});

		// Keycodes
		$(document).on('keypress', function(e) {
			var code = e.keyCode || e.which;
			
			//console.log('keypress: ' + code);
			if (document.activeElement.tagName.toLowerCase() == "input")
				return;

			// C - Hide / show chat form
			if (code == 67 || code == 99) {
				if ($('#chat_panel').hasClass('panelhidden')) {
					$('#chat_panel').removeClass('panelhidden');
				} else {
					$('#chat_panel').addClass('panelhidden');
				}
			}
		});


		// Animation test button:	
		$('#animtest').click(function() {
			var testCommand = {};
			testCommand.type = "attack";
			testCommand.target = "character_shaman";
			testCommand.charactername = "shaman";
			testCommand.actionname ="test action";

			
			wi.client.playAnimation(testCommand);	
		});
		
		// General button roll-over sound:
		$(document).on('mouseenter', '.button:not(.disabled):not(.submit)', function() {
			sound.play('cv2_menu_tick');
		});

		// Commands roll-over sound:
		$(document).on('mouseenter', '#commands li:not(.disabled)', function() {
			sound.play('menu_tick');
		});
		
		
		// Execute commands button: 
		$(document).on('click', '#execute:not(.disabled)', function() {
			
			// Send player Ready event to SERVER:
			wi.socket.emit('playerReady', {playerID: wi.client.getMyID()});
			
			//output.disableCommands();
			output.hidePanels('commands');
			//output.showPanels('output');
			
		});

		// Ship Selection Screen:
		$(document).on('mouseover', '#ship_selection:not(.ships_chosen) li', function() {
			var cname = $(this).data('name').trim().replace(/\s/g, '').toLowerCase();
			console.log('set ship: ' + cname);
			output.setShip(cname);
		});

		// Character Selection Screen:
		$(document).on('mouseover', '#character_selection:not(.characters_chosen) li', function() {
			var cname = $(this).data('name').trim().replace(/\s/g, '').toLowerCase();
			console.log('set character: ' + cname);
			output.setCharacter(cname);
		});
		
		// COMMANDS:
		$(document).on('click', '#commands li', function() {
			
			var currentCommand = $(this).data('command');
			
			// TO DO: 
			// These should be assigned on the server
			currentCommand.playerID = wi.client.getMyID();
			currentCommand.targetID = wi.client.getOpponentID();
			
			// TO DO: 
			// Clean this up for healing spells (targetID could be a single character or group of characters....
			
			// Check if this has already been selected:
			if ($(this).hasClass('chosen')) {
				$(this).removeClass('chosen');
				
				// Emit removeCommand event to SERVER:
				wi.socket.emit('removeCommand', {command: currentCommand});
			} else {
				// Break out if no more commands are available:
				if (game.getCommandsAvailable(wi.client.getMyID()) <= 0)
					return;
				
				// Emit addCommand event to SERVER:
				wi.socket.emit('addCommand', {command: currentCommand, playerID: wi.client.getMyID(), targetID: wi.client.getOpponentID()});
				
				// Update DOM:
				$(this).addClass('chosen');
			}

			sound.play('damage_poison');

		});
		
		$(document).on('mouseover', '#commands:not(.commandschosen) li', function() {
			var cname = $(this).data('character').trim().replace(/\s/g, '');;
			output.setCharacter(cname);
		});
		
		
		// add other handlers here...
				
		return this;		
	}
	
	WindowInput.prototype = {
	
		onJoin: function() {

			console.log(' --- (input.js) onJoin. Client ID: ' + this.client.getMyID())

			if (!this.client.getMyID()) {
				
				console.log('hide welcome show login...');

				output.hidePanels('welcome');
				output.showPanels('login');

			}
		},
		
		onLeave: function() {
			wi.socket.emit('leave', {name: playerId});
		},
		

	}
	
	return WindowInput;

});
