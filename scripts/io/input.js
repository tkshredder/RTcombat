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
		
		// Register & Login
		$('#registerBtn').click(function() {
			wi.onRegisterOrLogin();
			//wi.output.setLoginButtonText('Register');
		});

		$('#loginBtn').click(function() {
			wi.onRegisterOrLogin();
		});

		// Create button:	
		$('#createBtn').click(function() {
			wi.onCreate();
		});

		// Join button:	
		$('#joinBtn').click(function() {
			wi.onJoin();
		});


		$('#login').submit(function(e) {
			
			e.preventDefault(); // Prevent form from submitting
			
			name = $('#loginname').val();
			
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
				wi.socket.emit('sendchat', {message:myMessage, playerID:wi.client.getMyPlayerID()});
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
			wi.socket.emit('playerReady', {playerID: wi.client.getMyPlayerID()});
			
			//output.disableCommands();
			output.hidePanels('commands');
			//output.showPanels('output');
			
		});


		// SHIP SELECTION ///////////////////////////////////////////////////////////////

		// Ship Selection Screen:
		$(document).on('mouseover', '#ship_selection:not(.ships_chosen) li:not(.unknown)', function() {
			//console.log($(this).data());
			//console.log('set ship: ' + cname);
			output.setShip($(this).data());
			sound.play('menu_tick');
		});

		$(document).on('click', '#ship_selection li:not(.unknown)', function() {
			
			//console.log('clicked on a ship! myID: ', wi.client.getMyID());
			//console.log($(this).data('name'), $(this).data('team'));

			var shipname = $(this).data('name').trim().replace(/\s/g, '').toLowerCase();
			var teamID = $(this).data('team');

			wi.socket.emit('chooseShip', {playerID:wi.client.getMyPlayerID(), name:shipname, teamID:teamID});
			sound.play('cv2_menu_tick');
		});




		// CHARACTER SELECTION ///////////////////////////////////////////////////////////////

		// Character Selection Screen:
		$(document).on('mouseover', '#character_selection:not(.characters_chosen) li:not(.unknown)', function() {
			
			// Set character
			output.setCharacter($(this).data());
			
			sound.play('menu_tick');
		});

		// Add character:
		$(document).on('click', '#character_selection li:not(.unknown)', function() {
			
			//console.log('clicked on a character! myID: ', wi.client.getMyID());
			var charactername = $(this).data('name').trim().replace(/\s/g, '').toLowerCase();
			
			

			// Send message to server:
			wi.socket.emit('addCrewMember', {playerID:wi.client.getMyPlayerID(), shipID: wi.client.getMyShipID(), name:charactername});
			
			// Update DOM:
			output.chooseCharacter(wi.game.getShipsCrewSize(wi.client.getMyShipID()), $(this).data());
			sound.play('cv2_menu_tick');

		});	

		// Submit (create) team:
		$('#createteam').submit(function(e) { 
			
			//console.log('createTeam form submit');
			e.preventDefault(); // Prevent form from submitting
			
			wi.socket.emit('chooseTeam', {playerID:wi.client.getMyPlayerID(), shipID:wi.client.getMyShipID()});
			
		});

		// GAME INSTANCE SELECTION ///////////////////////////////////////////////////////////////

		// Character Selection Screen:
		$(document).on('mouseover', '#gameinstance_selection li', function() {
			
			// Show game details
			//output.setCharacter($(this).data());
			sound.play('menu_tick');
		});

		// Choose game instance:
		$(document).on('click', '#gameinstance_selection li', function() {
			
			var gameinstanceID = $(this).data('gameinstanceID');

			console.log('clicked on a gameinstance! giID: ', gameinstanceID);
			
			// Send message to server:
			wi.socket.emit('chooseGameInstance', {gameinstanceID: gameinstanceID, playerID: wi.client.getMyPlayerID(), shipID: wi.client.getMyShipID()});
			
			// Update DOM:
			sound.play('cv2_menu_tick');

		});	

		
		// COMMANDS:
		$(document).on('click', '#commands li', function() {
			
			var currentCommand = $(this).data('command');
			
			// TO DO: 
			// These should be assigned on the server
			currentCommand.playerID = wi.client.getMyPlayerID();
			currentCommand.targetID = wi.client.getOpponentPlayerID();
			currentCommand.shipID = wi.client.getMyShipID();
			currentCommand.targetShipID = wi.client.getOpponentShipID();

			// TO DO: 
			// Clean this up for healing spells (targetID could be a single character or group of characters....
			
			// Check if this has already been selected:
			if ($(this).hasClass('chosen')) {
				$(this).removeClass('chosen');
				
				// Emit removeCommand event to SERVER:
				wi.socket.emit('removeCommand', {command: currentCommand});
			} else {
				// Break out if no more commands are available:
				//if (game.getCommandsAvailable(wi.client.getMyPlayerID()) <= 0)
				//	return;
				
				// Emit addCommand event to SERVER:
				wi.socket.emit('addCommand', {command: currentCommand, gameinstanceID: wi.client.getMyGameInstanceID(), playerID: wi.client.getMyPlayerID(), targetID: wi.client.getOpponentPlayerID()});
				
				// Update DOM:
				$(this).addClass('chosen');
				output.hideCharacterCommands(currentCommand.charactername);
				//console.log('');

			}

			sound.play('damage_poison');

		});
		
		$(document).on('mouseover', '#commands:not(.commandschosen) li', function() {
			//var cname = $(this).data('character').trim().replace(/\s/g, '');;
			output.setCharacter($(this).data());
		});
		
		
		// add other handlers here...
				
		return this;		
	}
	
	WindowInput.prototype = {
		
		onRegisterOrLogin: function() {

			//console.log(' --- (input.js) onCreate. Client ID: ' + wi.client.getMyPlayerID());

			if (!this.client.getMyPlayerID()) {
				
				//console.log('hide welcome show login...');

				output.hidePanels('welcome');
				output.showPanels('login');

			}
		},

		onCreate: function() {

			wi.socket.emit('createGameInstance', {message: 'User creating a new game.'});
		},

		onJoin: function() {

			//console.log(' --- (input.js) onJoin. Client ID: ' + this.client.getMyID())
			output.hidePanels();
			output.showPanels('choosegameinstances');
		},
		
		onLeave: function() {
			wi.socket.emit('leave', {playerID: this.client.getMyPlayerID()});
		},
		
	}
	
	return WindowInput;

});
