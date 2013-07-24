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
				setTimeout(function() { wo.update(); }, 100);
			}
					
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
				//$('#active_character').removeClass().addClass('character_'+charactername).addClass('shadowfilter');
				var charactername = data.name.trim().replace(/\s/g, '').toLowerCase();
				
				$('#active_entity_label').html(data.name);
				$('#active_character').removeClass().addClass('character_'+charactername).addClass('shadowfilter');
				
				this.writeCharacterStats(data);
				$('#character_stats').removeClass('hidden');

			},

			writeCharacterStats: function(data) {
				console.log('writeCharacterStats: ', data.params)
				$('#character_stats #attack .label').html(data.params.attack);
				$('#character_stats #defense .label').html(data.params.defense);
				$('#character_stats #courage .label').html(data.params.courage);
				$('#character_stats #dodge .label').html(data.params.dodge);
					
			},

			setGamesInProgress: function(count) {

				var gameCountAsString;
				if (count == 1) {
					gameCountAsString = "There is currently 1 game in progress.";
				} else {
					gameCountAsString = "There are currently " + count + " games in progress.";
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
			
			writeCurrentCommands: function (playerID) {
				
				$("#commands").empty();
				
				var possibleCommands = game.getPossibleCommands(playerID);
				
				console.log('possibleCommands: ', possibleCommands);			
				
				for (var i = 0; i < possibleCommands.length; i++) {
					command = possibleCommands[i];
					$("#commands").append('<li><span class="charactername">'+command.charactername+'</span><span class="name">' + command.actionname + '</span><span class="type">' + command.type + '</span><span class="effect">' + command.effect + '</span><span class="successRate">' + command.successRate + '% success</span><span class="order"></span></li>');
					$('#commands li:last-child').data('command', command);
					$('#commands li:last-child').data('character', command.charactername);
				}
			},
			
			setBoatBG: function (teamID) {
				$('#boat_bg').removeClass().addClass('boatbg_' + teamID);
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
			showVitals: function () {
				$('#vitals').removeClass('hidden');
			},

			hideVitals: function () {
				$('#vitals').addClass('hidden');
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
					$element.data('params', gameInstance)
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