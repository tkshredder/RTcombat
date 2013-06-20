define(
	
	function(){
	
	/**
	 * Client
	 * Description: sets up the socket listeners and sends calls for all I/O operations
	 */
	
	function Client(game, socket, output, sound, animator) {
		
		//console.log(sound);
		
		// Set a master reference to this class:
		c = this;
		
		// Client class referenced classes:
		this.game = game;
		this.socket = socket;
		
		// Client class private variables:
		this.myID;
		this.opponentID;
		
		// TO DO:
		// Move this?
		function callback() {
			var t = window.setTimeout(function() { 
				executeNextCommand(); 
			}, game.getCommandDelay());
		}

		socket.on('playerReady', function(data) {
			
			console.log('Event: playerReady for player', data.playerID); 
			
			// Update Game:
			game.playerReady(data);
			
			// Update DOM, if applicable:
			if (data.playerID == c.myID) {


				if (game.waitingOnPlayers()) {
					output.displayTurnWaitingMessage();
				}
				// Hide my commands -- because I'm done.
				output.hideCommands();
			}

			if (game.waitingOnPlayers() == false) {
				output.hidePanels('center');
				output.showPanels('output');
			}

		});
		
		socket.on('sendchat', function(data) {
			
			console.log('Event: sendchat for player', data); 
			
			output.showChatPanel();
			output.addChatMessage(data);
			
		});

		socket.on('addCommand', function(data) {
			
			console.log('Event: addCommand for player', data.playerID, data.command); 
			
			// Update Game:
			game.addCommand(data);
			
			// Update DOM, if applicable:
			if (data.playerID == c.myID) {
				output.activateExecutionButton(c.myID);
				//output.disableCommandRolloverUpdate();
				output.updateCommandOrder(c.myID);
				output.updateCommandsAvailable(c.myID);
			}
		});
		
		socket.on('removeCommand', function(data) {
			
			console.log('Event: removeCommand', data.command);
			
			// Update Game:
			game.removeCommand(data);
			
			// Update DOM:
			output.updateCommandsAvailable(c.myID);
			output.updateCommandOrder(c.myID);
		
		});
		
		// Get the initial game state
		socket.on('start', function(data) {
			console.log('Event: start', data);
			
			if (data.state.timeStamp == null) {
			  data.state.timeStamp = new Date();
			}
			
			//console.log(' --- (client) loading game from current state');
			game.load(data.state);
			
			// Get the initial time to calibrate synchronization.
			var startDelta = new Date().valueOf() - data.state.timeStamp;
			// Setup the game progress loop
			//game.updateEvery(Game.UPDATE_INTERVAL, startDelta);
			
			// Check if there's a name specified
			if (window.location.hash) {
				var name = window.location.hash.slice(1);
				socket.emit('join', {name: name});
				$('#join').hide();
			}
			
			// Start loading audio:
			sound.loadAudio();
			
		});
		
		socket.on('state', function(data) {
			//console.log('Event: state', data);
			game.load(data.state);
		});

		// A new player joins.
		socket.on('joinnew', function(data) {
			
			console.log('Event: joinnew', data);
			
			// Update Game:
			game.join(data);

			// Update client vars:
			if (data.isme) {
				c.myID = data.playerID;
				// Set the hash in the address bar:
				window.location.hash = '#' + data.name;
			} else {
				// Someone else has joined.
				c.opponentID = data.myID;
			}
			
			// Update DOM:
			if ((game.getPlayerCount() == 2) && data.isme) {
				//socket.emit('startGame', {message:"start"}); //game.getCurrentPlayer()
			
			} else {
				// Update DOM for ???
				output.displayWaitingMessage(data.isme);
			}

			// Update DOM for me:
			if (data.isme) {
				output.hidePanels(['login', 'welcome']);
				output.showPanels('chooseship');
				output.setShip({name:'Drow Cruiser', animate: true});
			}			
		});

		socket.on('joinexisting', function(data) {
			console.log('Event: joinexisting', data);

			// Update Game:
			game.join(data);

			// Update client vars:
			if (data.isme) {
				c.myID = data.playerID;
				// Set the hash in the address bar:
				window.location.hash = '#' + data.name;
			} else {
				// Someone else has joined.
				c.opponentID = data.myID;
			}
			
			// Update DOM:
			if (data.isme) {
				output.hidePanels();
				output.showPanels('output');
			}

			if ((game.getPlayerCount() == 2) && data.isme) {
				//socket.emit('startGame', {message:"start"}); //game.getCurrentPlayer()
			} else {
				output.displayWaitingMessage(data.isme);
			}

		});


		// Ship chosen. Hide Ship Selection, Load Character Selection
		socket.on('chooseShip', function(data) {
			
			console.log('Event: chooseShip', data);
			data.playerID = c.myID;


			// Update the game:
			game.addShip(data);

			var theTeamID = game.getTeamID(c.myID);
			console.log('- (client.js) theTeamID: ' + theTeamID);

			// Update DOM
			output.writeCharacterSelection(theTeamID);
			output.hidePanels('chooseship');
			output.hideElements('active_ship');
			output.showPanels(['choosecharacters','myteam']);
			output.showElements('active_character');
			output.stopAnimation('ship');
			//output.startAnimation('character');
		});




		socket.on('addCharacter', function(data) {
			
			console.log('Event: addCharacter', data)

			// Update the game:
			game.addCharacter(data.playerID, data);

			// Update DOM:
			if (game.getPlayerCharacterCount(data.playerID) == 3) {
				
				output.enableCreateTeamSubmit();

				// Debug:
				//game.logPlayersCharacters(data.playerID);
			}
		});

		socket.on('removeCharacter', function(data) {
			
			console.log('Event: removeCharacter', data)

			// Update the game:
			game.removeCharacter(data.playerID, data);

			// Debug:
			console.log('Player '+data.playerID+' characters post removal: ')
			game.logPlayersCharacters(data.playerID);
		});





		socket.on('chooseTeam', function(data) {
			
			console.log('Event: chooseTeam', data)

			// Update the game:
			game.chooseTeam(data.playerID);

			// Debug:
			//console.log('Player '+data.playerID+' team chosen.');

			// Update DOM:
			output.hidePanels(['choosecharacters', 'myteam']);
			output.showPanels('output');
			output.stopAnimation('character');

		});












		
		// Event: startGame
		// Description: Fires when a new game starts. Updates client, game, output
		socket.on('startGame', function(data) {
			
			console.log('Event: startGame', data);
			
			// (This client only) Set the opponentID if not already set:
			if (c.opponentID == null) {
				c.opponentID = game.getOpponentID(c.myID);
			}
			
			// Update game:
			game.startGame(data.name);
			
			// Update DOM:
			output.hidePanels(["welcome","login"]);
			output.setNames({myID: c.myID, opponentID: c.opponentID});
			output.updateCommandsAvailable(c.myID);
			output.setBoatBG(game.getTeamID(c.myID));

		});
		
		// Event: playerTurn
		// Description: Fires when its the player's turn
		socket.on('playerTurn', function(data) {
			
			console.log('Event: playerTurn', data);
			
			// Update game:
			game.playerTurn(data);
			
			// Update DOM:
			output.displayTurnMessage();
			
			output.displayTurnTimer();
			
		});
		
		
		
		
		
		
		
		// Event: chooseCommands
		// Description: Fires when a player is given commands to choose.
		socket.on('chooseCommands', function(data) {
			
			console.log('Event: chooseCommands', data);
			
			// Update game:
			// To do: need to process this on the server?
			//game.loadPlayerCommands(c.myID);
			game.setPossibleCommands(c.myID);

			// Update DOM:
			output.drawCommands(c.myID);
			output.showCommands();
			
		});
		
		// A client performs an action
		socket.on('action', function(data) {
			console.log('Event: action', data);
			console.log(' --- action was successful: ', data.success);
			
			// Execute the action.
			// Maybe pass in just the command? ie data.command
			game.performAction(data);
			
			// Evaluate current action and play sound(s)
			sound.evaluateActionTypeAndPlay(data);
		
			// Update DOM:
			var successText = (data.success) ? "success! " : "unsuccessful";
			var html = '<div class="command"><p>Executed <span class="name">'+ command.actionname +'</span>.... ' + successText+'</p></span>';
			$("#output").append(html);
			$('.command').fadeIn("slow");
			
			
			// Evaluate current action success play sound(s)
			console.log(' --- call to sound.evaluateActionSuccessAndPlay() ');
			sound.evaluateActionSuccessAndPlay(data, 400);
			
			// Add to animator:
			c.playAnimation(command);
			

			// Evaluate current action and play sound(s)
			//createjs.Sound.play("attack_damage");
			
		});
		
		socket.on('playerTurnFinish', function (data) {
			console.log("recv playerTurnFinish", data);
			$('#output').html('Turn finished.');
			game.playerTurnFinish(data);
		});
		
		// A client leaves.
		socket.on('leave', function(data) {
			console.log('Event: leave', data);
			if (c.myID == data.name) {
				gameover('you were absorbed. play again?');
			}
			game.leave(data.name);
		});
		
		// Get a time sync from the server
		socket.on('time', function(data) {
			// Compute how much we've skewed from the server since the last tick.
			var updateDelta = data.lastUpdate - game.getLastTimeStamp();
			
			// Add to the cumulative skew offset.
			c.totalSkew += updateDelta;
			
			// If the skew offset is too large in either direction, get the real state from the server:
			
			if (Math.abs(this.totalSkew) > game.TARGET_LATENCY) {
				// Fetch the new truth from the server.
				socket.emit('state');
				c.totalSkew = 0;
			}
			
			// Set the true timestamp anyway now.
			//game.state.timeStamp = data.lastUpdate;
			
			// Update HUD:
			// TO DO: Move this into a render function?
			//console.log("getting info for player " + myID);
			document.getElementById('myhealth').innerText = game.getHealth(c.myID) + "HP";
			document.getElementById('opponenthealth').innerText = game.getHealth(c.opponentID) + "HP";
			document.getElementById('observer-count').innerText = Math.max(data.observerCount - game.getPlayerCount(), 0);
			document.getElementById('player-count').innerText = game.getPlayerCount();
			document.getElementById('average-lag').innerText = Math.abs(updateDelta);
		});
		
		// Server reports that somebody won!
		socket.on('victory', function(data) {
			if (this.myID) {
				if (data.id == c.myID) {
					gameover('you win! play again?');
				} else {
					gameover(data.id + ' won and you lost! play again?');
				}
				} else {
					gameover('game over. ' + data.id + ' won! play again?');
			}
		});
		
		return this;
	}
	
	Client.prototype = {
		
		getMyID: function() {
			return this.myID;
		},
		
		getOpponentID: function() {
			return this.opponentID;
		},
		
		playAnimation: function(command) {
			var anim = {};
			anim.target = "character_" + command.charactername.trim();
			anim.charactername = command.charactername;
			anim.actionname = command.actionname;
			//anim.results = successText;
			animator.addAnimationAndPlay(anim);
		}
	}
	
	return Client;

});




