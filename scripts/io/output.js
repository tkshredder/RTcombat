define(
	[
	"model/characterfactory"
	],
	function( CharacterFactory ){
		
		/**
		 * Window Output 
		 * Description: Sets various aspects in the DOM to keep view-related info away from the main core.
		 * TO DO: migrate display Message X to displayMessages(messages, params).
		 */
		
		function WindowOutput(game, animator, characterfactory) {
			
			this.game = game;
			this.animator = animator;
			this.characterfactory = characterfactory;
			wo = this;
			
			var updateTimer;
			
			// WindowOutput private class functions:
			
			// Main update loop
			this.update = function() {
				
				$('#remainingtime').html(game.getRemainingTime());
				$('#remainingCommenceTime').html(game.getRemainingCommenceTime());
				setTimeout(function() { wo.update(); }, 100);
			}
			
			// Create Healthbars
			$('#player1healthbar').healthbar();
			$('#player2healthbar').healthbar();

			$('#player1healthbar').healthbar('updateHealthBar');
			$('#player1healthbar').healthbar('updateHealthBar');

			return this;
		}
		
		// WindowOutput public class methods:
		WindowOutput.prototype = {
		
			/*setPlayerNames: function (names) {
				$('#myname').html(game.getPlayerName(names.myID));
				$('#opponentname').html(game.getPlayerName(names.opponentID));
			},*/

			setShip: function(data) {
				
				var shipname = data.name.trim().replace(/\s/g, '').toLowerCase();
				
				// Set the ship name & graphical css class:
				$('#active_entity_label').html(data.name);
				$('#active_ship').removeClass().addClass('ship_'+shipname).addClass('shadowfilter');

				// Check if we need to animate boat:
				if (data.animate == true) {
					wo.animator.floatBoat();
				}

			},

			setCharacter: function(data) {
				
				//console.log('--- output.js setCharacter: ', data)

				//$('#active_character').removeClass().addClass('character_'+charactername).addClass('shadowfilter');
				var charactername = data.name.trim().replace(/\s/g, '').toLowerCase();
				
				// Set character
				$('#active_entity_label').html(data.name);
				$('#active_character').removeClass().addClass('character_'+charactername).addClass('shadowfilter');

				if (data.showStats) {		
					// Write character stats:
					$('#character_stats #attack .label').html(data.params.attack);
					$('#character_stats #defense .label').html(data.params.defense);
					$('#character_stats #courage .label').html(data.params.courage);
					$('#character_stats #dodge .label').html(data.params.dodge);
					$('#character_stats').removeClass('hidden');
				}

				// Animate active character:
				//wo.animator.animateActiveCharacter(charactername);
			},

			setGamesInProgress: function(count) {

				var gameCountAsString;
				if (count == 1) {
					gameCountAsString = "1 game";
				} else {
					gameCountAsString = count + " games in progress.";
				}

				$('#gamecount').html(gameCountAsString);
			},

			chooseCharacter: function(slot, data) {

				// Error check input
				if (typeof(slot) != "number") slot = 1;
				if (!data.hasOwnProperty('name')) data.name = "unknown";

				var charactername = data.name.trim().replace(/\s/g, '').toLowerCase();

				//console.log(' --- (output.js) chooseCharacter: ' + slot, data);
				$('#myteam_'+(slot+1)+' .avatar_image').addClass('character_'+charactername);

			},

			setLoginButtonText: function(value) {
				$('#loginsubmit').val(value);
			},

			displayTurnTimer: function() {
				
				$('#remainingtime').html(game.getRemainingTime());
				
				// start a timer here as well?
				setTimeout(function() { wo.update(); }, 100);
			},

			displayCommenceTimer: function() {
				
				$('#remainingCommenceTime').html(game.getRemainingCommenceTime());
				
				// start a timer here as well?
				setTimeout(function() { wo.update(); }, 100);
			},

			addChatMessage: function (data) {
				$("#chatlog").append('<span class="chatmessage"><span class="playername player' + data.playerID + '">' + game.getPlayerName(data.playerID) + '</span> ' + data.message + '</span>');
			},
			
			displayWaitingMessage: function (isMe) {
				if (isMe) {
					$('#output_headline').html('All Set!');
					$('#output').html('Waiting on another player to join.');
				} else {
					$('#output').html('Your opponent is waiting for you to join!');
				}
			},
			
			displayMessage: function (message) {
				$('#output').html(message);	
			},
			
			displayTurnMessage: function () {
				$('#output').html('Time for battle! Choose your actions below.');
			},
			
			displayTurnWaitingMessage: function () {
				$('#center_panel').removeClass('hidden')
				$('#center_headline').html('Actions Confirmed');
				$('#center_output').html('Preparing for attack!');
			},
			
			activateExecutionButton: function (playerID) {
				if (game.getCommandsAvailable(playerID) == 0) {
					if ($("#execute").hasClass('disabled')) {
						$("#execute").removeClass('disabled');
					}
				}
			},



			enableCreateTeamSubmit: function() {
				$('#createteam_submit').removeClass('disabled')
			},

			
			disableCommandRolloverUpdate: function () {
				console.log('disabling command rollover');
				$('#commands').addClass('commandschosen');
			},

			initHealthBars: function(shipIDs) {
				
				//var ships = game.gameInstances[gameinstanceID]
				var n = 0, currentShip;

				for (var i = 1; i < shipIDs.length + 1; i++) {
					
					currentShip = game.getShip(shipIDs[i-1]);

					// Maybe create an init function for the healthbars?
					$('#player' + i + "healthbar").healthbar('setCurrentHP', currentShip.health);
					$('#player' + i + "healthbar").healthbar('setMaxHP', currentShip.health);
					$('#player' + i + "healthbar").addClass(shipIDs[i-1]);

				}



			},
			
			writeCurrentCommands: function (shipID) {
				
				$("#commands").empty();
				
				console.log('-- (output.js): writeCurrentCommands', shipID)

				var possibleCommands = game.getPossibleCommands(shipID);
				
				console.log('possibleCommands: ', possibleCommands);			
				
				for (var i = 0; i < possibleCommands.length; i++) {
					command = possibleCommands[i];
					$("#commands").append('<li><span class="charactername">'+command.charactername+'</span><span class="name">' + command.actionname + '</span><span class="type">' + command.type + '</span><span class="effect">' + command.effect + '</span><span class="successRate">' + command.successRate + '% success</span><span class="order"></span></li>');
					$('#commands li:last-child').data('command', command);
					$('#commands li:last-child').data('name', command.charactername);
				}
			},
			
			setBoatBG: function (teamID) {
				$('#boat_bg').removeClass().addClass('boatbg_' + teamID);
			},

			setPlayersOnline: function (value) {
				$('#currentPlayerCount').html(value);
			},


			
			/*setCharacter: function (charactername) {
				$('#active_character').removeClass().addClass('character_'+charactername).addClass('shadowfilter');
			},*/
			
			disableCommands: function () {
				$('#commands li').each(function(index, element) {
					$(this).addClass('disabled');
				});
				
				$('#execute').addClass('disabled');
				
			},
			
			showCommands: function () {
				$('#commands_panel').removeClass('hidden');
			},

			hideCommands: function () {
				$('#commands_panel').addClass('hidden');
			},
			hideCharacterCommands: function(charactername) {
				$('#commands li').each(function(i) {
					if ($(this).data('name') == charactername) {
						$(this).addClass('disabled');
					}
				});
			},

			showVitals: function () {
				$('#vitals').removeClass('hidden');
			},

			hideVitals: function () {
				$('#vitals').addClass('hidden');
			},

			hideCharacters: function() {
				$('#active_character').addClass('hidden');
				$('#character_stats').addClass('hidden');
				$('#active_entity_label').addClass('hidden');
			},
			
			hidePanels: function (list) {
				
				// Hide all panels if method is called with a null input:
				if(typeof(list) === 'undefined') {
					$('[id*=panel]').addClass('hidden');
				}

				// Add support for a single string passed in:
				if (typeof(list) === 'string') {
					oldval = list;
					list = [oldval];
				}
				
				for (var key in list) {
					$("#"+list[key]+"_panel").addClass('hidden');
				}
			},

			showPanels: function (list) {
				
				// Add support for a single string passed in:
				if (typeof(list) === 'string') {
					oldval = list;
					list = [oldval];
				}

				for (var key in list) {
					$("#"+list[key]+"_panel").removeClass('hidden');
				}
			},

			startAnimation: function(animationID) {

				console.log('--- (output.js) startAnimation: ' + animationID)
				animator.startAnimation(animationID);
			},

			stopAnimation: function(animationID) {
				animator.stopAnimation(animationID);
			},

			enableElement: function(elementID) {
				$('#' + elementID).removeClass('disabled');
			},

			disableElement: function(elementID) {
				$('#' + elementID).addClass('disabled');
			},

			hideElements: function (list) {
				
				// Add support for a single string passed in:
				if (typeof(list) === 'string') {
					oldval = list;
					list = [oldval];
				}
				
				for (var key in list) {
					$("#"+list[key]).addClass('hidden');
				}
			},

			showElements: function (list) {
				
				// Add support for a single string passed in:
				if (typeof(list) === 'string') {
					oldval = list;
					list = [oldval];
				}
				
				for (var key in list) {
					$("#"+list[key]).removeClass('hidden');
				}
			},

			showChatPanel: function() {
				if ($('#chat_panel').hasClass('panelhidden')){
					$('#chat_panel').removeClass('panelhidden');
				}
			},
			
			updateCommandOrder: function (playerID) {
				$('.order').empty();
				var commandQueue = game.getCommandQueue(playerID);
				
				if (commandQueue.length == 0) {
					console.log('No commands are currently queued up.');
				}
				
				for (var i = 0; i < commandQueue.length; i++) {
					command = commandQueue[i];
					$('#commands li').each(function() {
						
						//console.log('command (element): ', $(this).data('command'));
						//console.log('command (game): ', command);
						//console.log('are equal? : ', $(this).data('command').name == command.name);
						
						if ($(this).data('command').actionname == command.actionname) {
							$(this).children('.order').html(i+1);
						}
					});
				}
			},
			
			updateCommandsAvailable: function (playerID) {
				$("#commandsAvailable").html(game.getCommandsAvailable(playerID));
			},

			writeCharacterSelection: function (teamID) {
				
				//console.log(' --- (output.js) writeCharacterSelection: ', teamID);

				switch (teamID) {
					case 1:
						$('#character_selection').append(this.createCharacterHTML('shaman'));
						$('#character_selection').append(this.createCharacterHTML('drowarcher'));
						$('#character_selection').append(this.createCharacterHTML('centipede'));
						break;
				
					case 2:
						$('#character_selection').append(this.createCharacterHTML('skeleshark'));
						$('#character_selection').append(this.createCharacterHTML('deadsoldier'));
						$('#character_selection').append(this.createCharacterHTML('tentacles'));
						break;
				}
			},

			writeGameInstanceSelection: function () {
				
				var gameInstances = game.getActiveGameInstances();
				console.log(' --- (output.js) writeGameInstanceSelection: ', gameInstances);

				for (var id in gameInstances) {
					var gameInstance = gameInstances[id];
					var startedBy = "Started by " + gameInstance.startedBy;
					
					// Create a new html element to store the gameinstance info
					// TO DO: 
					// add additional data to this			
					var $element = $(document.createElement('li'));
					$element.addClass('gameinstance');
					$element.html(startedBy);
					$element.data('gameinstanceID', gameInstance.gameinstanceID);
					$element.data('params', gameInstance);
					$element.data('showStats', true);
					$('#gameinstance_selection').append($element);
				}
			},

			createCharacterHTML: function (characterType) {
				
				//console.log(' --- (output.js) createCharacterHTML for ' + characterType);
				var $element = $(document.createElement('li'));
				$element.addClass('avatar');
				$element.html('<div class="avatar_image character_'+characterType+'" ></div>');
				
				var characterParams = characterfactory.createCharacterData(characterType);

				//console.log("Create character with data ", characterParams);

				$element.data('name', characterParams.name);
				$element.data('params', characterParams);

				//console.log('returning ', $element)

				return $element;

			}

		};
		
		return WindowOutput;
	}
);