define(
	[
	"model/gameinstance"
	],
	function(GameInstance){
	
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
		this.myGameInstanceID;
		this.opponentPlayerID;
		this.opponentShipID;

		// Start loading audio:
		sound.loadAudio();
		createjs.Sound.setMute(true);
		
		// TO DO:
		// Move this?
		function callback() {
			var t = window.setTimeout(function() { 
				executeNextCommand(); 
			}, game.getCommandDelay());
		}

		////////////////////////////////////////////////////////////////////
		// SOCKET EVENTS

		// Get the initial game state
		socket.on('start', function(data) {
			
			console.log('Event: start', data);
			
			if (data.state.timeStamp == null) {
			  data.state.timeStamp = new Date();
			}
			
			//console.log(' --- (client) loading game from current state');
			//console.log(' ------ here is the current state: ', data.state);
			game.load(data.state);
			
			// Update nav bar:
			output.setPlayersOnline(Object.keys(data.state.players).length);
			output.setGamesInProgress(game.getActiveGameInstancesCount());

			// Check if there's a name specified
			if (window.location.hash) {
				var name = window.location.hash.slice(1);
				socket.emit('join', {name: name});
				$('#join').hide();
			}
			
		});


		socket.on('createGameInstance', function(data) {
			
			console.log('Event: createGameInstance ', data.gameinstance); 
			
			// Add gameinstance to the main game:
			game.addGameInstance(new GameInstance(data.gameinstance));

			// Set game instance on Client:
			c.myGameInstanceID = data.gameinstance.gameinstanceID;

			//////////////////////////////
			// Player is ready. Ship is ready. Game Instance is ready. 
			
			// Add Player to Game Instance
			socket.emit('addPlayerToGameInstance', {playerID: c.myPlayerID, gameinstanceID: c.myGameInstanceID, startedBy: game.getPlayerName(c.myPlayerID)});
			
			// Add Ship to Game Instance
			socket.emit('addShipToGameInstance', {shipID: c.myShipID, gameinstanceID: c.myGameInstanceID});


			// Update DOM:
			// TO DO: 
			// Add an option to method showPanels to hide all other panels if true (default false aka leave panels showing)
			output.hidePanels();
			output.showPanels('output');
			output.displayWaitingMessage(true);

		});

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
				output.hidePanels();
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
				//output.activateExecutionButton(c.myPlayerID);
				//output.disableCommandRolloverUpdate();
				//output.updateCommandOrder(c.myPlayerID);
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
				output.hidePanels(['login', 'welcome', 'graphics']);
				output.showPanels('chooseship');
				output.setShip({name:'Drow Cruiser', animate: false});
			}			
		});

		socket.on('joinexisting', function(data) {
			console.log('Event: joinexisting', data);

			// Add player to the game:
			game.addPlayer(data.player);

			// Update client vars:
			c.myPlayerID = data.player.playerID;
			
			// Set the hash in the address bar:
			window.location.hash = '#' + data.player.name;
			/*if (data.isme) {
				c.myPlayerID = data.player.playerID;
				// Set the hash in the address bar:
				window.location.hash = '#' + data.player.name;
			} else {
				// Someone else has joined.
				c.opponentPlayerID = data.player.playerID;
			}*/
			
			// Update DOM:
			//if (data.isme) {
				output.hidePanels();
				output.showPanels('output');
				output.displayMessage('loading ship data....');
			//}

			socket.emit('loadShips', data.player);


			/*
			
			if ((game.getPlayerCount() == 2) && data.isme) {
				//socket.emit('startGame', {message:"start"}); //game.getCurrentPlayer()
			} else {
				output.displayWaitingMessage(data.isme);
			}
			*/

		});

		socket.on('addPlayer', function(playerData) {

			// Add player to the game:
			game.addPlayer(playerData);

		});

		socket.on('addPlayerToGameInstance', function(data) {
			
			console.log('Event: addPlayerToGameInstance', data);

			// Add playerID to target GameInstance:
			game.addPlayerToGameInstance(data.playerID, data.gameinstanceID);

		});

		socket.on('chooseGameInstance', function(data) {
			console.log('Event: chooseGameInstance', data);

			// Update gameinstanceID for client if just joined:
			if (data.isme) {
				c.myGameInstanceID = data.gameinstanceID;
			}

			// Add player and ship only if relevant:
			// This prevents other browsers from getting bogged down with unrelated game data.
			if (c.myGameInstanceID == data.gameinstanceID) {
				
				// Set opponent ID:
				if (!data.isme) {
					c.opponentPlayerID = data.playerID;
					c.opponentShipID = data.shipID;
				}
				else {
					
					c.opponentPlayerID = game.gameinstances[data.gameinstanceID].getOpponentID(data.playerID);
					c.opponentShipID = game.gameinstances[data.gameinstanceID].getOpponentShipID(data.shipID);
				}

				game.addPlayerToGameInstance(data.playerID, data.gameinstanceID);
				game.addShipToGameInstance(data.shipID, data.gameinstanceID);
			}
		});

		// SHIP EVENTS

		socket.on('addShip', function(shipData) {

			console.log(' -- (client.js) addShip ', shipData);
	
			// Add ship to the game:
			game.addShip(shipData);

		});

		socket.on('addShipToGameInstance', function(data) {
						
			console.log('Event: addShipToGameInstance', data);

			// Add shipID to target GameInstance:
			game.addShipToGameInstance(data.shipID, data.gameinstanceID);

		});

		socket.on('loadShips', function(data) {
			
			console.log('Event: loadShips', data);

			// TO DO: 
			// give player an opportunity to choose which ship to load

			// FOR NOW:
			// load up the first ship
			var submitData = {};
			submitData.shipID = data.ships[0].shipID;

			// Add Ship to game and save ID:
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

			// Next piece
			c.handleGameSelection();
		});



		// Ship chosen. Hide Ship Selection, Load Character Selection
		socket.on('chooseShip', function(data) {
			
			console.log('Event: chooseShip', data);

			// Add the ship to the game, and store the shipID in Client:
			c.myShipID = game.addShip(data);

			// Update player model:
			game.setPlayerShipID(data.playerID, data.shipID);

			var theTeamID = game.getTeamID(c.myShipID);
			//console.log('- (client.js) theTeamID: ' + theTeamID);

			// Update DOM
			if (data.isme) {
				output.writeCharacterSelection(theTeamID);
				output.hidePanels('chooseship');
				output.hideElements('active_ship');
				output.showPanels(['choosecharacters','myteam']);
				output.showElements('active_character');
				output.stopAnimation('ship');
				//output.startAnimation('character');
			}
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
			game.updateCrew(data.shipID, data.crew);

			// Next Logical Handler
			// Handle game selection only if we are the new client
			if (data.isme) {
				c.handleGameSelection();
			}
		});
		
		// Event: startGame
		// Description: Fires when a new game starts. Updates client, game, output
		socket.on('startGame', function(data) {
			
			console.log('Event: startGame', data);
			
			// Update game:
			game.startGame(data.name);
			
			// Update DOM:
			output.hidePanels();
			output.showPanels('startcombat');
			output.displayCommenceTimer();
			
			output.updateCommandsAvailable(c.myPlayerID);
			output.setBoatBG(game.getTeamID(c.myShipID));

		});
		
		// Event: playerTurn
		// Description: Fires when its the player's turn
		socket.on('playerTurn', function(data) {
			
			console.log('Event: playerTurn', data);
			
			// Update game:
			game.playerTurn(data);
			
			// Update DOM:
			output.hidePanels();
			output.showPanels('output', 'commands');
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
			game.setPossibleCommands(c.myPlayerID, c.myShipID);

			// Update DOM:
			output.writeCurrentCommands(c.myShipID);
			output.showCommands();
			
		});
		
		// A client performs an action
		socket.on('action', function(data) {

			output.hidePanels();
			output.showPanels('graphics');
			output.hideCharacters();



			console.log('Event: action', data);
			//console.log(' --- action was successful: ', data.success);
			
			// Execute the action.
			// Maybe pass in just the command? ie data.command
			game.performAction(data);
			
			// Evaluate current action and play sound(s)
			sound.evaluateActionTypeAndPlay(data);
			
			command = data.command;
			command.success = data.success;

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
			console.log("Event: playerTurnFinish", data);
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
			
			// Update HUD:
			// TO DO: Move this into a render function?
			//console.log("getting info for player " + myPlayerID);
			//document.getElementById('myhealth').innerText = game.getHealth(c.myPlayerID) + "HP";
			//document.getElementById('opponenthealth').innerText = game.getHealth(c.opponentPlayerID) + "HP";
			//document.getElementById('observer-count').innerText = Math.max(data.observerCount - game.getPlayerCount(), 0);
			
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
		
		playAnimation: function(command) {
			var anim = {};

			anim.target = command.charactername.replace(" ", "").toLowerCase();
			//anim.target = "character_" + command.charactername.trim();
			anim.charactername = command.charactername;
			anim.actionname = command.actionname;
			anim.shipname = game.getShipName(command.shipID);

			//anim.results = successText;
			//animator.addAnimationAndPlay(anim);

			animator.playAnimationSequence(anim);

		},

		handleGameSelection: function() {

			// Look up the active games
			c.lookUpActiveGames();
			
			// Update DOM:
			output.hidePanels();
			output.hideCharacters();
			output.showPanels('choosegame')
			
		},

		lookUpActiveGames: function() {

			// look up active games
			var activeGames = game.getActiveGameInstances();
			var activeGameCount = Object.keys(activeGames).length;

			//console.log('--- (client.js) lookUpActiveGames. Count: ' + activeGameCount)

			// Check if no active games:
			if (activeGameCount == 0) {
				
				// DO NOTHING. Player must create a new game instance.

			} else {

				// Update DOM
				output.enableElement('joinBtn');
				output.writeGameInstanceSelection(); // hidden by default
				output.setGamesInProgress(activeGameCount);

				// Load up active games:
				//socket.emit('loadActiveGameInstances');

			}
		},

		///////////////////////////////////////////////////////
		// Accessor Functions
		getMyPlayerID: function() { return this.myPlayerID; },
		getMyShipID: function() { return this.myShipID; },
		getMyGameInstanceID: function() { return this.myGameInstanceID; },
		getOpponentPlayerID: function() { return this.opponentPlayerID; },
		getOpponentShipID: function() { return this.opponentShipID; }, 

	}
	
	return Client;

});