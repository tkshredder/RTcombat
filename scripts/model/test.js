// Define the Game model class.
define(
	[
	"model/character"
	],
	function( Character ){
	 
	 	function Test() {
			
			this.characters = [];
			this.players = [];
			this.ships = [];
			this.masterCommandQueue = [];
			
			this.updateCount = 0;
			this.timer = null;
			this.currentRound = 0;
			
			// To do -- move this to output?
			this.commandDelay = 2000;
			this.turnFinishDelay = 3000;
			
			return this;
		}
		
		Test.prototype = {
		 	
			/**
			 * DEV ONLY
			 */
			sayHello: function() {
				
				var character = new Character({name:"Jim"});
				
				character.sayHello();
				
				console.log("hello from the Game class!");
			},
			
			/**
			 * Called when adding a player to the game.
			 */
			addPlayer: function(playerID, params) {
				// Check if the playerID already exists
				if (this.players[playerID] != null) {
					// Do whatever you need
				}
				
				// Loop through all the properties in params
				//       and set accordingly.
				// Note: this is coming from a DB request 
				// this.players[playerID].prop = value
				
			},
			
			/**
			 * Called when adding a ship to the game.
			 */
			addShip: function(shipID, params) {
				// Check if the shipID already exists
				if (this.ships[shipID] != null) {
					// Do whatever you need
				}
				
				// Loop through all the properties in params
				//       and set accordingly.
				// Note: this is coming from a DB request 
				// this.ships[shipID].prop = value
				
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
					this.players[data.playerID].removeCommand(data.command);
				} else {
					console.log('Command not found! Can not remove.');
				}
			},
			
			/**
			 * Called when a new player joins
			 */
			join: function(data) {
				
				// Add the player to the game:
				addPlayer(data);
				
				// To Do: make this a function
				// Add the player's ship to the game:
				var ship = new Ship({
					id: data.playerID,
					playerID: data.playerID,
					name: "ship " + data.playerID,
					health: 20
				});
				
				// Add player and ship objects
				this.players[player.id] = player;  
				this.ships[ship.id] = ship;  
				
				return data.playerID;
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
				this.currentRound = data.currentRound;
			},
			
			/**
			 * Called when a player performs an action
			 * @param data contains: command, success
			 */
			performAction: function(data) {
				
				console.log("Event: Perform acction", data.command, "command success: ", data.success, "target: " + data.command.targetID);
				
				command = data.command;
				
				var amount = command.effect.substring(1,0);
				var success;
				
				if (data.success) {
					success = data.success;
				} else {
					success = evaluateSuccess(command.successRate);
				}
				
				console.log("success for this action: ", success);
				
				switch(command.effect.substring(2)) {
					case "damage":
						if (success == true) {
							this.ships[data.command.targetID].health -= amount; 
						}
						break;
				}
				
				// Shift this command off the master queue:
				this.masterCommandQueue.shift();
				
				// Player performs the Action:
				this.players[data.command.playerID].performAction(data.command);
				
				return success;
			},
			
			
			// Accessor functions:
			getPlayerCount: function() { return Object.keys(this.players).length;},
			getOpponentID: function(playerID) {
				var players = this.players;
				for (var pID in players) {
					if (players[pID].id != playerID) {
						return players[pID].id;
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
					timeStamp: this.state.timeStamp
				};
				
				for (id in this.players) {
					var player = this.players[id];
					serialized.players[id] = player.toJSON();
				}
				
				for (id in this.ships) {
					var ship = this.ships[id];
					serialized.ships[id] = ship.toJSON();
				}
				
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
					this.players[player.id] = new Player(player);		
				}
				
				for (id in ships) {
					var ship = ships[id];
					this.ships[ship.id] = new Ship(ship);		
				}
			
			}
			
			
		};
		
		return Test;
	 
	}
);