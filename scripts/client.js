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
		this.myPlayerID;
		this.myShipID;
		this.opponentPlayerID;
		this.opponentShipID;
		
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
			if (data.playerID == c.myPlayerID) {


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
			if (data.playerID == c.myPlayerID) {
				output.activateExecutionButton(c.myPlayerID);
				//output.disableCommandRolloverUpdate();
				output.updateCommandOrder(c.myPlayerID);
				output.updateCommandsAvailable(c.myPlayerID);
			}
		});
		
		socket.on('removeCommand', function(data) {
			
			console.log('Event: removeCommand', data.command);
			
			// Update Game:
			game.removeCommand(data);
			
			// Update DOM:
			output.updateCommandsAvailable(c.myPlayerID);
			output.updateCommandOrder(c.myPlayerID);
		
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
			game.addPlayer(data.player);

			// Update client vars:
			if (data.isme) {
				c.myPlayerID = data.player.playerID;
				// Set the hash in the address bar:
				window.location.hash = '#' + data.player.name;
			} else {
				// Someone else has joined.
				c.opponentPlayerID = data.player.playerID;
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

			// Add player to the game:
			game.addPlayer(data.player);

			// Look up ships
			console.log(' --- (client.js) emitting loadShips socket', data)
			
			socket.emit('loadShips', data.player);


			// Update client vars:
			if (data.isme) {
				c.myPlayerID = data.playerID;
				// Set the hash in the address bar:
				window.location.hash = '#' + data.player.name;
			} else {
				// Someone else has joined.
				c.opponentPlayerID = data.player.playerID;
			}
			
			// Update DOM:
			if (data.isme) {
				output.hidePanels();
				output.showPanels('output');
				output.displayMessage('loading ship data....');
			}

			/*
			
			if ((game.getPlayerCount() == 2) && data.isme) {
				//socket.emit('startGame', {message:"start"}); //game.getCurrentPlayer()
			} else {
				output.displayWaitingMessage(data.isme);
			}
			*/

		});

		socket.on('loadShips', function(data) {
			
			console.log('Event: loadShips', data);

			// TO DO: 
			// give player an opportunity to choose which ship to load

			// FOR NOW:
			// load up the first ship
			var submitData = {};
			submitData.shipID = data.ships[0].shipID;


			c.myShipID = game.addShip(data.ships[0]);

			// load the crew!
			socket.emit('loadCrew', submitData);

		});

		socket.on('loadCrew', function(data) {
			
			console.log('Event: loadCrew', data);

			data.shipCrew.forEach(function(crewMember) {
				// Add the crew member to the ship:
				game.addCrewMember(crewMember);

			});


			if ((game.getPlayerCount() == 2) && data.isme) {
				//socket.emit('startGame', {message:"start"}); //game.getCurrentPlayer()
			} else {
				output.displayWaitingMessage(data.isme);
			}

		});



		// Ship chosen. Hide Ship Selection, Load Character Selection
		socket.on('chooseShip', function(data) {
			
			console.log('Event: chooseShip', data);

			// Add the ship to the game, and store the shipID in Client:
			c.myShipID = game.addShip(data);

			var theTeamID = game.getTeamID(c.myShipID);
			//console.log('- (client.js) theTeamID: ' + theTeamID);

			// Update DOM
			output.writeCharacterSelection(theTeamID);
			output.hidePanels('chooseship');
			output.hideElements('active_ship');
			output.showPanels(['choosecharacters','myteam']);
			output.showElements('active_character');
			output.stopAnimation('ship');
			//output.startAnimation('character');
		});




		socket.on('addCrewMember', function(newCrewMember) {
			
			console.log('Event: addCrewMember', newCrewMember)

			// Update the game:
			game.addCrewMember(newCrewMember);

			// Update DOM:
			if (game.getShipsCrewSize(newCrewMember.shipID) == 3) {
				
				output.enableCreateTeamSubmit();

				// Debug:
				//game.logPlayersCharacters(data.playerID);
			}
		});

		socket.on('removeCrewMember', function(data) {
			
			console.log('Event: removeCrewMember', data)

			// Update the game:
			game.removeCrewMember(data.playerID, data);

		});

		socket.on('chooseTeam', function(data) {
			
			console.log('Event: chooseTeam', data)

			// Update the game:
			game.chooseTeam(data.playerID);
			
			//console.log(' --- (client.js) calling update crew. Convert to characters --');



			game.updateCrew(data.shipID, data.crew);

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
			
			// (This client only) Set the opponentPlayerID if not already set:
			if (c.opponentPlayerID == null) {
				c.opponentPlayerID = game.getopponentPlayerID(c.myPlayerID);
			}
			
			// Update game:
			game.startGame(data.name);
			
			// Update DOM:
			output.hidePanels(["welcome","login"]);
			output.setNames({myPlayerID: c.myPlayerID, opponentPlayerID: c.opponentPlayerID});
			output.updateCommandsAvailable(c.myPlayerID);
			output.setBoatBG(game.getTeamID(c.myPlayerID));

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
			//game.loadPlayerCommands(c.myPlayerID);
			game.setPossibleCommands(c.myPlayerID);

			// Update DOM:
			output.drawCommands(c.myPlayerID);
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
			if (c.myPlayerID == data.name) {
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
			//console.log("getting info for player " + myPlayerID);
			document.getElementById('myhealth').innerText = game.getHealth(c.myPlayerID) + "HP";
			document.getElementById('opponenthealth').innerText = game.getHealth(c.opponentPlayerID) + "HP";
			document.getElementById('observer-count').innerText = Math.max(data.observerCount - game.getPlayerCount(), 0);
			document.getElementById('player-count').innerText = game.getPlayerCount();
			document.getElementById('average-lag').innerText = Math.abs(updateDelta);
		});
		
		// Server reports that somebody won!
		socket.on('victory', function(data) {
			if (this.myPlayerID) {
				if (data.id == c.myPlayerID) {
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
		
		getMyPlayerID: function() { return this.myPlayerID; },

		getMyShipID: function() { return this.myShipID; },
		
		getOpponentPlayerID: function() { return this.opponentPlayerID; },

		getOpponentShipID: function() { return this.opponentShipID; }, 
		
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




