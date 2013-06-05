define(function(){
	/**
	 * Window Output 
	 * Description: Sets various aspects in the DOM to keep view-related info away from the main core.
	 * TO DO: migrate display Message X to displayMessages(messages, params).
	 */
	
	function WindowOutput(gameInstance) {
		
		game = gameInstance;
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
	
		setNames: function (names) {
			$('#myname').html(game.getPlayerName(names.myID));
			$('#opponentname').html(game.getPlayerName(names.opponentID));
		},
		
		displayTurnTimer: function() {
			$('#remainingtime').html(game.getRemainingTime());
			
			// start a timer here as well?
			setTimeout(function() { wo.update(); }, 100);
			
			
		},
		
		displayWaitingMessage: function (isMe) {
			if (isMe) {
				$('#output').html('Waiting on another player to join.');
			} else {
				$('#output').html('Your opponent is waiting for you to join!');
			}
		},
		
		displayMessage: function ( message, params ) {
			$('#output').html(message);	
		},
		
		displayTurnMessage: function () {
			$('#output').html('Time for battle! Choose your actions below.');
		},
		
		displayTurnWaitingMessage: function () {
			$('#output').html('Waiting on other player to finish...');
		},
		
		activateExecutionButton: function (playerID) {
			if (game.getCommandsAvailable(playerID) == 0) {
				if ($("#execute").hasClass('disabled')) {
					$("#execute").removeClass('disabled');
				}
			}
		},
		
		disableCommandRolloverUpdate: function () {
			console.log('disabling command rollover');
			$('#commands').addClass('commandschosen');
		},
		
		drawCommands: function (playerID) {
			
			$("#commands").empty();
			
			var possibleCommands = game.getPossibleCommands(playerID);
			
			//console.log('possibleCommands: ', possibleCommands);			
			
			for (var i = 0; i < possibleCommands.length; i++) {
				command = possibleCommands[i];
				$("#commands").append('<li><span class="type">'+command.charactername+'</span><span class="name">' + command.actionname + '</span><span class="type">' + command.type + '</span><span class="effect">' + command.effect + '</span><span class="successRate">' + command.successRate + '% success</span><span class="order"></span></li>');
				$('#commands li:last-child').data('command', command);
				$('#commands li:last-child').data('character', command.charactername);
			}
		},
		
		setBoatBG: function (teamID) {
			$('#boat_bg').removeClass().addClass('boatbg_' + teamID);
		},
		
		setCharacter: function (charactername) {
			$('#active_character').removeClass().addClass('character_'+charactername).addClass('shadowfilter');
		},
		
		disableCommands: function () {
			$('#commands li').each(function(index, element) {
				$(this).addClass('disabled');
			});
			
			$('#execute').addClass('disabled');
			
		},
		
		showCommands: function () {
			$('#commands_panel').show();
		},

		hideCommands: function () {
			$('#commands_panel').hide();
		},
		showVitals: function () {
			$('#vitals').show();
		},

		hideVitals: function () {
			$('#vitals').hide();
		},
		
		hidePanels: function (list) {
			for (var key in list) {
				$("#"+list[key]+"_panel").hide();
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
			console.log('----- update commands available');
			$("#commandsAvailable").html(game.getCommandsAvailable(playerID));
		}
	}
	
	return WindowOutput;
	
});
