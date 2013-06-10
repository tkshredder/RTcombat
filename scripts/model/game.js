// Define the Game model class.
define(
	[
	"model/character",
	"model/player",
	"model/ship"
	],
	function( Character, Player, Ship ){
	 
	 	function Game() {
			
			g = this;
			
			this.characters = [];
			this.players = [];
			this.ships = [];
			this.masterCommandQueue = [];
			
			this.updateCount = 0;
			this.timer = null;
			this.currentRound = 0;
			
			this.turnTimer;
			this.currentTurnTimeRemaining;
			this.lastTimeStamp;
			
			// STATIC VARS
			// TO DO -- move this to output?
			this.commandDelay = 2000;
			this.turnFinishDelay = 3000;
			
			this.TURN_TIME = 30;
			this.UPDATE_INTERVAL = Math.round(1000 / 30);
			this.TARGET_LATENCY = 1000; // Maximum latency skew.
			
			// Private functions
			
			
			// Need to figure out a listener for output 
			this.updateRemainingTurnTime = function() {
				
				// Decrement timer and clear interval if needed
				this.currentTurnTimeRemaining -= 1;
				if (this.currentTurnTimeRemaining <= 0) {
					
					clearInterval(this.turnTimer);
					
					// TIME'S UP!
					// Fire event ....
					
					//socket.emit('timerTick', {remainingTime: this.updateRemainingTurnTime});
					
					//console.log('--- (game.js) End of turn timer!');
				}
				
				//console.log('timer event, ' + this.currentTurnTimeRemaining);
				
			}
						
			return this;
		}
		
		Game.prototype = {
		 	
			/**
			 * Say hello from the game class!
			 */
			sayHello: function() {

				console.log("Hello from the Game class!");
								
				// Have all the players say hello:
				for (id in this.players) {
					this.players[id].sayHello();
				}
				
				// Have all the characters say hello:
				for (id in this.characters) {
					this.characters[id].sayHello();
				}
				
			},
			
			/**
			 * Called when adding a player to the game.
			 */
			addPlayer: function(playerID, params) {
				
				// Check if the playerID already exists
				if (this.players[playerID] != null) {
					// Do whatever you need
				}
				
				// Create a new player and add it to the area of players:
				this.players[playerID] = new Player(params);
				
			},
			
			/**
			 * Called when adding a ship to the game.
			 */
			addShip: function(shipID, params) {
				
				//console.log(' -- (game.js) addShip function', params);
				
				// Check if the shipID already exists
				if (this.ships[shipID] != null) {
					// Do whatever you need
				}
				
				// Create a new player and add it to the area of players:
				this.ships[shipID] = new Ship(params);
				
			},

			/**
			 * Called when adding a character to the game.
			 */
			addCharacter: function(characterID, params) {
				
				console.log(' -- (game.js) addCharacter function', params);
				
				// Check if the characterID already exists
				if (this.characters[characterID] != null) {
					// Do whatever you need
				}
				
				// Create a new character and add it to the array of characters:
				this.characters[characterID] = new Character(params);
				
			},
			
			/**
			 * Called when a player leaves the game
			 */
			leave: function(playerID) {
				console.log('player ' + playerID + ' has left the game!');
				
				delete this.players[playerID];
				
			},
			
			/**
			 * Called at the start of a turn to update the possible commands for all players
			 */
			loadPlayerCommands: function() {
				for (id in this.players) {
					var player = this.players[id];
					player.loadPlayerCommands();
				}
			},
			
			/**
			 * Check to see if players are finished choosing actions for their turn:
			 * 
			 */
			waitingOnPlayers: function() {
				
				for (id in this.players) {
					var player = this.players[id];
					
					console.log("player " + id + " ready: " + player.getPlayerReady());
					
					if (player.getPlayerReady() == false) {
						
						// As long as one player is not ready, we confirm that we are waiting on players
						return true;
					}
				}
				// Default: not waiting on anyone
				return false;
			},
			
			/**
			 * Called when a player has selected their actions for the turn:
			 */
			playerReady: function(data) {
				
				if (data.playerID == null) {
					console.log("ERROR: cannot set a null player Ready!!");
					return;
				}
				
				// Add this command to the player's command queue 
				var player = this.players[data.playerID];
				player.setPlayerReady(true);
			},
						
			/**
			 * Called when a player adds a command during their turn:
			 */
			addCommand: function(data) {
				
				if (data.command == null) {
					console.log("ERROR: cannot add a null command!");
					return;
				}
				
				// Update the Master Command queue (ie, all the commands this turn)
				this.masterCommandQueue.push(data.command);
				
				// Add this command to the player's command queue 
				var player = this.players[data.playerID];
				player.addCommand(data.command);
			},
			
			/**
			 * Called when a player removes a command during their turn:
			 */
			removeCommand: function(data) {
				
				var thisCommand = data.command;
				var index;
				
				// Loop through the commandQueue to find a match on the name
				for (var i = 0; i < this.masterCommandQueue.length; i++) {
					if (this.masterCommandQueue[i].name == data.command.name) {
						index = i; break;
					}
				}
				
				if (index > -1) {
					// Extract the command from the master command Queue, at the current index location:
					this.masterCommandQueue.splice(index,1);
					
					// Update the player model that it's using this command:
					console.log(' --- (game.js) remove command for player ' + data.command.playerID)
					this.players[data.command.playerID].removeCommand(data.command);
				} else {
					console.log('Command not found! Can not remove.');
				}
			},
			
			/**
			 * Called when a new player joins
			 */
			join: function(data) {
				
				//console.log(' - (game.js) addPlayer call');
				// Add the player to the game:
				this.addPlayer(data.playerID, data);
				
				// TO DO: 
					// Create a look up for ship and characters, based on player.
				
				return data.playerID;
			},

			chooseShip: function(data) {
				
				console.log(' - (game.js) addShip call');
				
				// Add the player's ship to the game:
				this.addShip(data.playerID, data);
				
			},

			chooseCharacter: function(data) {
				
				console.log(' - (game.js) addShip call');
				
				// Add the player's character to the game:
				this.addCharacter(data.playerID, data);
				
			},


			
			/**
			 * Called when a starting a new game
			 */
			startGame: function() {
			
			
			},
			
			
			
			
			/**
			 * Called when a starting player's turn
			 */
			playerTurn: function(data) {
				
				// Setup timer for the turn:
				this.currentTurnTimeRemaining = this.TURN_TIME;
				this.turnTimer = setInterval(function() { 
					//console.log(g);
					g.updateRemainingTurnTime(); 
					}, 1000);
				
				this.currentRound = data.currentRound;
			},
			
			
			
			
			
			/**
			 * Called when a player performs an action
			 * @param data contains: command, success
			 */
			performAction: function(data) {
				
				console.log("Event: Perform action", data.command, "command success: ", data.success, "target: " + data.command.targetID);
				
				command = data.command;
				
				var amount = command.effect.substring(1,0);
				var success;
				
				if (data.success) {
					success = data.success;
				} else {
					success = this.evaluateSuccess(command.successRate);
				}
				
				console.log("success for this action: ", success);
				
				switch(command.effect.substring(2)) {
					case "damage":
						if (success == true) {
							console.log('dealing damage to target ' + data.command.targetID, this.ships[data.command.targetID]);
							this.ships[data.command.targetID].damage(amount); 
						}
						break;
				}
				
				// Shift this command off the master queue:
				this.masterCommandQueue.shift();
				
				// Player performs the Action:
				this.players[data.command.playerID].performAction(data.command);
				
				return success;
			},
			
			// TO DO: expand this out
			evaluateSuccess: function (successRate) {
				var checkSuccess = Math.floor(Math.random() * 10) * 10;
				if (successRate >= checkSuccess) 
					return true;
				
				return false;
			},
			
			// Accessor functions:
			getTeamID: function(playerID) { return this.players[playerID].getTeamID(); },
			getPlayerCount: function() { return Object.keys(this.players).length;},
			getRemainingTime: function() { return this.currentTurnTimeRemaining; },
			getOpponentID: function(playerID) {
				
				// TO DO:
				// Need to load this information in from database? 
				
				var players = this.players;
				for (var pID in players) {
					if (players[pID].getPlayerID() != playerID) {
						return players[pID].getPlayerID();
					}
				}
				return 0;
			},
			
			getHealth: function(shipID) {
				if (this.ships[shipID]) 
					return this.ships[shipID].health;
			
				return -1;
			},
			
			
			getMasterCommandQueue: function() { return this.masterCommandQueue; },
			setCommandQueue: function(playerID, value) { this.players[playerID].setCommandQueue = value; },
			getCommandQueue: function(playerID) { return this.players[playerID].getCommandQueue(); },			
			
			getExecutedCommands: function(playerID) { return this.players[playerID].getExecutedCommands(); },
			setExecutedCommands: function(value) { this.players[playerID].setExecutedCommands = value; },
			getPossibleCommands: function(playerID) { return this.players[playerID].getPossibleCommands(); },
			setPossibleCommands: function(value) { this.players[playerID].setPossibleCommands = value; },
			getCommandsAvailable: function(playerID) { return this.players[playerID].getCommandsAvailable(); },
			loadPlayerCommands: function(playerID) { this.players[playerID].loadPlayerCommands(); },
			getNextAction: function() { return this.masterCommandQueue[0]; },
			
			// Again -- move these??
			getCommandDelay: function() { return this.commandDelay; },
			setCommandDelay: function(value) { this.commandDelay = value; },
			getTurnFinishDelay: function () { return this.turnFinishDelay; },
			setTurnFinishDelay: function (value) { this.turnFinishDelay = value; },
			getCurrentRound: function() { return this.currentRound; },
			
			getPlayerName: function(playerID){ return this.players[playerID].getName() },			
			setPlayerName: function(playerID, value) { this.players[playerID].setName(value) },
			
			/***********************************************
			 * Loading and saving
			 * TO DO: Evaluate how this handles with saving sessions to / from DB
			 */
			
			/**
			 * Save the game state.
			 * @return {object} JSON of the game state
			 */
			save: function() {
				var serialized = {
					players: {},
					ships: {},
					//timeStamp: this.state.timeStamp
				};
				
				for (id in this.players) {
					console.log(' ----- (game.js) saving player ' + id);
					var player = this.players[id];
					serialized.players[id] = player.toJSON();
				}
				
				for (id in this.ships) {
					
					var ship = this.ships[id];
					
					serialized.ships[id] = ship.toJSON();
				}
				
				console.log('end of save. ', serialized);
				
				return serialized;
			},
			
			/**
			 * Load the game state.
			 * @param {object} gameState JSON of the game state
			 */
			load: function(savedState) {
				
				var players = savedState.players;
				var ships = savedState.ships;
				var actions = savedState.actions;
				
				this.state = {
					players: {},
					ships: {},
					timeStamp: savedState.timeStamp.valueOf()
				}
				
				for (var id in players) {
					var player = players[id];
					
					// console.log(' --- (game.js) loading player ' + id, player);
					
					this.players[player.playerID] = new Player(player);		
				}
				
				for (id in ships) {
					var ship = ships[id];
					
					// console.log(' --- (game.js) loading ship ' + id, ship);
					
					this.ships[ship.shipID] = new Ship(ship);		
				}
			
			},
			
			/**
			 * Retrieve the last time stamp
			 */
			getLastTimeStamp: function() {
				return this.lastTimeStamp;
			},
			
			/**
			 * Set the last time stamp (typically iniated on the server)
			 * @param value the new time stamp
			 */
			setLastTimeStamp: function(value) {
				this.lastTimeStamp = value;
			},
			
			TARGET_LATENCY: function() {
				return this.TARGET_LATENCY;
			}
			
			
			
		};
		
		return Game;
	 
	}
);