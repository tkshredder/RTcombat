// Define the Game model class.
define(
	[
	"model/character",
	"model/player",
	"model/ship",
	"model/gameinstance",
	"model/characterfactory"
	],
	function( Character, Player, Ship, GameInstance, CharacterFactory ){
	 
	 	function Game(CharacterFactory) {
			
			g = this;
			
			this.players = {};
			this.ships = {};
			this.gameinstances = {};
			cfactory = CharacterFactory;

			this.updateCount = 0;
			this.timer = null;
			this.currentRound = 0;
			
			this.turnTimer;
			this.commenceTimer;
			this.currentTurnTimeRemaining;
			this.currentCommenceTimeRemaining;
			this.lastTimeStamp;
			
			// STATIC VARS
			// TO DO -- move this to output?
			this.commandDelay = 5000;
			this.turnFinishDelay = 3000;
			
			this.COMMENCE_TIME = 10;
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
				
			},

			// Need to figure out a listener for output 
			this.updateRemainingCommenceTime = function() {
				
				// Decrement timer and clear interval if needed
				this.currentCommenceTimeRemaining -= 1;
				if (this.currentCommenceTimeRemaining <= 0) {
					
					clearInterval(this.commenceTimer);
					
					socket.emit('commenceCombat', {});
				}				
			}

						
			return this;
		}
		
		Game.prototype = {
			
			/**
			 * Retrieve active game instances
			 */
			getActiveGameInstances: function() {

				//console.log(' -- (game.js) getActiveGameInstances -- all game instances: ', this.gameinstances);

				// Check if there are any game instances:
				var activeGameCount = Object.keys(this.gameinstances).length;
				var activeGames = {};

				//console.log(' -- (game.js) getActiveGameInstances. count: ' + activeGameCount);

				if (activeGameCount > 0) {
					
					// Build an object of active game instances:
					for (var key in this.gameinstances) {
						if (this.gameinstances[key].getIsActive() == true) 
							activeGames[key] = this.gameinstances[key];
					}
				}

				return activeGames;
			},

			getActiveGameInstancesCount: function() {
				var activeGameCount = 0;

				for (var gid in this.gameinstances) {
					if (this.gameinstances[gid].getIsActive()) {
						activeGameCount++;
					}
				}

				return activeGameCount;
			},

			/**
			 * Add a game instance to the game.
			 */
			addGameInstance: function(gameinstance) {

				//console.log(' - (game.js) addGameInstance', gameinstance);

				if (gameinstance.getGameInstanceID() == null) {
					console.log('ERROR! Attempting to add a game instance without gameinstanceID!');
				} else {
					this.gameinstances[gameinstance.getGameInstanceID()] = gameinstance; // Need to cast?
				}
			},

			/**
			 * Called when a new player joins
			 */
			addPlayer: function(player) {
				
				//console.log(' - (game.js) addPlayer', player);
				
				// Check if we have a playerID (e.g., loading a saved game)
				if (player.playerID == null) {
					
					console.log('ERROR! Attempting to add a player to the game without a playerID!');
				} 
				else {
					
					// Update the game model:
					this.players[player.playerID] = new Player(player);
				}

				return player.playerID;
			},


			/**
			 * Description: Called when adding a player to an existing game instance
			 * Prerequisite: gameinstances[gameinstanceID] must be a valid GameInstance
			 */
			addPlayerToGameInstance: function(playerID, gameinstanceID, startedBy) {
				
				//console.log(' - (game.js) addPlayerToGameInstance: ', playerID +" to " + gameinstanceID);
				
				// Check if we have playerID & gameinstanceID 
				if (playerID == null || gameinstanceID == null) {
					console.log('ERROR! Attempting to add a player to a gameinstance without a playerID or gameinstanceID!');
					return false;
				} 
				else {

					// Update game instance if possible:
					if (this.gameinstances[gameinstanceID] != null) {
						this.gameinstances[gameinstanceID].addPlayerID(playerID);

						if (this.gameinstances[gameinstanceID].getStartedBy() == "") {
							this.gameinstances[gameinstanceID].setStartedBy(startedBy);
						}

					} else { 
						return false;
					}
				}

				return true;
			},

			addShipToGameInstance: function(shipID, gameinstanceID) {
				
				console.log(' - (game.js) addShipToGameInstance: ', shipID +" to " + gameinstanceID);
				
				// Check if we have shipID & gameinstanceID 
				if (shipID == null || gameinstanceID == null) {
					console.log('ERROR! Attempting to add a player to a gameinstance without a shipID or gameinstanceID!');
					return false;
				} 
				else {

					// Update game instance if possible:
					if (this.gameinstances[gameinstanceID] != null) {
						this.gameinstances[gameinstanceID].addShipID(shipID);
					} else { 
						return false;
					}
				}

				return true;
			},


			/**
			 * Called when adding a ship to the game.
			 */
			addShip: function(ship) {
				
				//console.log(' -- (game.js) addShip function', ship);
				
				//console.log('Adding ship at shipID ' + ship.shipID);

				// Add the ship to the array of ships:
				this.ships[ship.shipID] = new Ship(ship);

				//console.log('this.ships: ', this.ships);

				return ship.shipID;
			},

			/**
			 * Called when adding a crew member to the game.
			 */
			addCrewMember: function(crewMember) {
				
				//console.log(' --- (game.js) addCrewMember', crewMember);

				// Add the crew member to the ship:
				this.ships[crewMember.shipID].addCrewMember(crewMember);				
			},

			/**
			 * Called when removing a crew member from the game.
			 */
			removeCrewMemberByID: function(shipID, crewID) {
				
				console.log(' --- (game.js) removeCrewMemberByID', shipID, crewID);
				
				
				// Remove the crew member
				this.ships[shipID].removeCrewMemberByID(crewID);
				
			},


			/**
			 * Called when a player chooses their team
			 */
			chooseTeam: function(playerID) {
				
				console.log(' --- (game.js) chooseTeam', playerID);
				
				// TO DO:
				// Add error checking for size of team (this.crew[playerID].length) vs max team size
				
				// Set the player's team chosen flag:
				this.players[playerID].setTeamChosen(true);
				
			},

			/**
			 * Called when a player chooses a game instance to join
			 */
			chooseGameInstance: function(gameinstanceID) {
				
				console.log(' --- (game.js) chooseGameInstance', gameinstanceID);
				
				// TO DO:
				// Add error checking for size of team (this.crew[playerID].length) vs max team size
				
				// Set the player's team chosen flag:
				this.players[playerID].setTeamChosen(true);
				
			},

			updateCrew: function(shipID, crewObject) {
				
				//console.log('updateCrewIDs -- ', crewObject);
				var tempCrewMember, tempCrew = {};

				// Convert each crewMember object to Character class:
				for (var crewMember in crewObject) {
					tempCrewMember = new Character(crewObject[crewMember]);
					tempCrew[tempCrewMember.getCrewID()] = tempCrewMember;
				}

				this.ships[shipID].setCrew(tempCrew);
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
				

				/*for (id in this.players) {
					var player = this.players[id];
					player.loadPlayerCommands();
				}
				*/

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

				var allCommandsSelected = false;
				
				// Update the Master Command queue (ie, all the commands this turn)
				//console.log('--- (game.js) addCommand in gameinstance ' + data.gameinstanceID);
				//console.log(this.gameinstances[data.gameinstanceID]);

				// Add the command to this game instance's command queue:
				this.gameinstances[data.gameinstanceID].addCommand(data.command);
				
				// Check if the command queue is full:
				// Get active crew  --
				var activeCrewCount = 0, shipCrew, shipIDs = this.gameinstances[data.gameinstanceID].getShipIDs();
			 	
			 	//console.log(' --- (game.js) addCommand. ship IDs: ', shipIDs)
			 	for (var shipID in shipIDs) {

			 		//console.log('getting crew for ship ' + shipID)

			 		shipCrew = this.ships[shipID].getCrew();
			 		for (var crewMember in shipCrew) {

			 			//console.log('crewMember: ', crewMember)

			 			if (shipCrew[crewMember].getIsActive()) {
			 				activeCrewCount++;
			 			}
			 		}
			 	}

			 	//console.log("Active crew count: " + activeCrewCount);
			 	//console.log('current command queue size: ' + this.gameinstances[data.gameinstanceID].getCommandQueueSize());
			 	//console.log('allCommandsSelected: ' + allCommandsSelected);

			 	// Check if the current queue size is equal to the activeCrewCount:
				if (this.gameinstances[data.gameinstanceID].getCommandQueueSize() == activeCrewCount) {
					allCommandsSelected = true;
				}

				console.log(' -- (game.js) addCommand. allCommandsSelected: ' + allCommandsSelected);

				// Add this command to the player's command queue 
				var player = this.players[data.playerID];
				player.addCommand(data.command);

				return allCommandsSelected;
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
			
			
			loadShip: function(data) {
				console.log(' -- (game.js) loadShip', data);



			},

			chooseShip: function(data) {
				
				console.log(' - (game.js) addShip call');
				
				// Add the player's ship to the game:
				this.addShip(data.playerID, data);
				
				// Update the player's character's ship ID to this ship.
				this.setPlayerShipID(data.playerID, data.shipID);

			},

			chooseCrewMember: function(data) {
				
				// console.log(' - (game.js) chooseCrewMember call');
				
				// Add the player's crew member to the ship:
				this.addCrewMember(data.shipID, data);
				
			},

			getNextAvailableCrewID: function(shipID) {
				console.log(' --- (game.js) getNextAvailableCrewID for ship ' + shipID, this.ships[shipID]);
				return this.ships[shipID].getNextAvailableCrewID();
			},
			
			/**
			 * Called when a starting a new game
			 */
			startGame: function() {
			
			
			},
			
			setPlayerShipID: function(playerID, shipID) {
				this.players[playerID].setShipID(shipID);
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
			 * Called when a starting combat
			 */
			combatCommence: function(data) {
				
				// Setup timer for the turn:
				this.currentCommenceTimeRemaining = this.COMMENCE_TIME;
				this.commenceTimer = setInterval(function() { 
					//console.log(g);
					g.updateRemainingCommenceTime(); 
					}, 1000);
			},
			
			/**
			 * Called when a player performs an action
			 * @param data contains: command, success
			 */
			performAction: function(data) {
				
				console.log("Event: Perform action", data.command, "command success: ", data.success, "target: " + data.command.targetID);
				
				command = data.command;
				
				var results = {};
				results.amount = command.effect.substring(1,0);
				
				if (data.success) {
					results.success = data.success;
				} else {
					results.success = this.evaluateSuccess(command.successRate);
				}
				
				console.log("success for this action: ", results.success);
				
				switch(command.effect.substring(2)) {
					case "damage":
						if (results.success == true) {
							console.log('dealing damage to target ' + data.command.targetShipID);
							this.ships[data.command.targetShipID].damage(results.amount); 
						}
						break;
				}
				
				// Shift this command off the master queue:
				this.gameinstances[data.gameinstanceID].shiftCommand();
				
				// Player performs the Action:
				this.players[data.command.playerID].performAction(data.command);
				
				return results;
			},
			
			// TO DO: expand this out
			evaluateSuccess: function (successRate) {
				var checkSuccess = Math.floor(Math.random() * 10) * 10;
				if (successRate >= checkSuccess) 
					return true;
				
				return false;
			},
			
			// Accessor functions:
			/*
			setShip: function(data) {
				console.log(" -- (game.js) setShip ", data);

				//this.ships[data.playersID].setName(data.name);

				// Create an object for the new ship:
				var newShipObj = {};
				newShipObj.name = data.name;
				newShipObj.playerID = data.playerID;
				newShipObj.shipID = data.shipID;
				newShipObj.teamID = data.teamID;

				// Add the new ship:
				this.addShip(newShipObj);
			},
			*/

			getShipsCrew: function(shipID) {
				console.log(' --- (game.js) getShipsCrew for ship ' + shipID, this.ships[shipID]);

				return this.ships[shipID].getCrew();
			},

			getShipsCrewSize: function(shipID) {
				
				var shipCrewSize = this.ships[shipID].getCrewSize();

				return shipCrewSize;
			},

			getPlayer: function(playerID) { return this.players[playerID]; },
			getShip: function(shipID) { return this.ships[shipID]; },
			getTeamID: function(shipID) { 
				console.log(' -- (game.js) getTeamID for ship ' + shipID, this.ships[shipID]);
				return this.ships[shipID].getTeamID(); 
			},
			getGameInstancePlayerCount: function(gameinstanceID) {
				return this.gameinstances[gameinstanceID].getPlayerCount();
			},
			getPlayerCount: function() { return Object.keys(this.players).length;},
			getRemainingTime: function() { return this.currentTurnTimeRemaining; },
			getRemainingCommenceTime: function() { return this.currentCommenceTimeRemaining; },
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
			
			getPlayerTeamChosen: function(playerID) { return this.players[playerID].getTeamChosen(); },
			getMasterCommandQueue: function() { return this.masterCommandQueue; },
			getCommandQueueSize: function(gameinstanceID) { return this.gameinstances[gameinstanceID].getCommandQueueSize(); },
			setCommandQueue: function(playerID, value) { this.players[playerID].setCommandQueue = value; },
			getCommandQueue: function(playerID) { return this.players[playerID].getCommandQueue(); },			
			
			getExecutedCommands: function(playerID) { return this.players[playerID].getExecutedCommands(); },
			setExecutedCommands: function(value) { this.players[playerID].setExecutedCommands = value; },
			
			getPossibleCommands: function(shipID) { 
				
				// TO DO:
				// Factor in disabled / busy crew.
				// For now, all actions are available.

				var charActions, allActions = [];
				var shipCrew = this.ships[shipID].getCrew();
				
				console.log('--- (game.js) getPossibleCommands for ship ', shipID);

				// Loop through crew
				for (crewID in shipCrew) {
					
					// Get the crew available actions:
					//console.log(shipCrew[crewID]);

					charActions = shipCrew[crewID].getActions();

					//console.log('--- (game.js) char actions for crew member ' + crewID + ': ', charActions);

					// Loop through the crew array of actions and add them to the master array:
					for (actionID in charActions) {
						allActions.push(charActions[actionID]);						
					}

				}

				return allActions;
			
			},

			setPossibleCommands: function(playerID, shipID) { 
				
				// Build a composite list of available commands:
				var availableActions = this.getPossibleCommands(shipID);

				console.log('--- (game.js) setPossibleCommands: ', availableActions);

				// Set the player's possible commands:
				this.players[playerID].setPossibleCommands = availableActions; 
			},

			getCommandsAvailable: function(playerID) { return this.players[playerID].getCommandsAvailable(); },
			
			getNextAction: function(gameinstanceID) { return this.gameinstances[gameinstanceID].getCurrentAction(); },
			
			// Again -- move these??
			getCommandDelay: function() { return this.commandDelay; },
			setCommandDelay: function(value) { this.commandDelay = value; },
			getTurnFinishDelay: function () { return this.turnFinishDelay; },
			setTurnFinishDelay: function (value) { this.turnFinishDelay = value; },
			getCurrentRound: function(gameinstanceID) { return this.gameinstances[gameinstanceID].getCurrentRound(); },
			
			getPlayerName: function(playerID){ if (this.players[playerID]) return this.players[playerID].getName() },			
			setPlayerName: function(playerID, value) { this.players[playerID].setName(value) },
			getShipName: function(shipID){ if (this.ships[shipID]) return this.ships[shipID].getName() },			
			setShipName: function(shipID, value) { this.ships[shipID].setName(value) },
			
			/*getPlayersCrewActions: function(playerID) {
				var actions;
				for (crewID in this.crew[playerID]) {
					actions = this.crew[playerID][crewID].getActions();
					console.log(actions);
				}
				
				//return
			},*/


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
					gameinstances: {}
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

				for (id in this.gameinstances) {
					
					var gameinstance = this.gameinstances[id];	
					serialized.gameinstances[id] = gameinstance.toJSON();
				}
				
				console.log(' --- (game.js) end of save. ', serialized);
				
				return serialized;
			},
			
			/**
			 * Load the game state.
			 * @param {object} gameState JSON of the game state
			 */
			load: function(savedState) {
				
				var players = savedState.players;
				var ships = savedState.ships;
				var gameinstances = savedState.gameinstances;
				//var actions = savedState.actions;
				
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

				for (id in gameinstances) {
					
					var gameinstance = gameinstances[id];	
					this.gameinstances[gameinstance.gameinstanceID] = new GameInstance(gameinstance);
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