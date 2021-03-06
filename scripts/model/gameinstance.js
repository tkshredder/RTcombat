define(function(){
	
	// GameInstance class constructor
	function GameInstance(params) {
		
		// Allow for empty GameInstances (ie, Server creates a new one from scratch)
		if (params == null) {
			params = {};
			params.gameinstanceID = -1;
			params.isActive = true;
			params.startedBy = "";
			params.playerIDs = {};
			params.shipIDs = {};
			params.masterCommandQueue = [];
			params.currentRound = 0;
			params.updateCount = 0;
		}

		this.gameinstanceID = params.gameinstanceID;
		this.isActive = params.isActive;
		this.startedBy = params.startedBy;
		this.playerIDs = params.playerIDs;
		this.shipIDs = params.shipIDs;
		this.masterCommandQueue = params.masterCommandQueue;
		this.currentRound = params.currentRound;
		this.updateCount = params.updateCount;
		
		// TBD variables:
		this.timer = null;	
		this.turnTimer;
		this.currentTurnTimeRemaining;
		this.lastTimeStamp;

		return(this);
	}
	 
	// GameInstance class methods
	GameInstance.prototype = {
	 
	 	// Class methods:
		toJSON: function() { 
			var gameInstanceObj = {};
			for (var prop in this) {
				if (this.hasOwnProperty(prop)) {
					gameInstanceObj[prop] = this[prop];
				}
			}
			return gameInstanceObj;
		},

	 	// Accessor functions:
	 	getGameInstanceID: function() { return this.gameinstanceID; },
	 	setGameInstanceID: function(value) { this.gameinstanceID = value; },
	 	getOpponentID: function(playerID) { 
	 		// TO DO: expand this for 1:N combat
	 		for (var pid in this.playerIDs) {
	 			if (pid != playerID)
	 				return pid;
	 		}

	 		return -1;	 		
	 	},
	 	getOpponentShipID: function(shipID) { 
	 		// TO DO: expand this for 1:N combat
	 		
	 		for (var sid in this.shipIDs) {
	 			if (sid != shipID)
	 				return sid;
	 		}

	 		return -1;	 	 		
	 	},
	 	
		getPlayerCount: function() { return Object.keys(this.playerIDs).length},
	 	getIsActive: function() { return this.isActive; },
		setIsActive: function(isActive) { this.isActive = isActive; },
		getStartedBy: function() { return this.startedBy; },
		setStartedBy: function(value) { this.startedBy = value;},
	 	addPlayerID: function(playerID) { this.playerIDs[playerID] = playerID; },
		removePlayerID: function(playerID) { delete this.playerIDs[playerID]; },
		addShipID: function(shipID) { this.shipIDs[shipID] = shipID; },
		removeShipID: function(shipID) { delete this.shipIDs[shipID]; },
		getShipIDs: function() { return this.shipIDs; },
		addCommand: function(command) { this.masterCommandQueue.push(command); },
		getCurrentAction: function() { return this.masterCommandQueue[0]; },
		getCommandQueueSize: function() { return this.masterCommandQueue.length; },
		shiftCommand: function() { this.masterCommandQueue.shift(); },
		getCurrentRound: function() { return this.currentRound; },
		setCurrentRound: function(value) { this.currentRound = value; },
		incrementCurrentRound: function() { this.currentRound++; },
	};
	
	return GameInstance;
});

