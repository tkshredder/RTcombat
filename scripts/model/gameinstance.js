define(function(){
	
	// GameInstance class constructor
	function GameInstance(params) {
		
		// Allow for empty GameInstances (ie, Server creates a new one from scratch)
		if (params == null) {
			params = {};
			params.gameinstanceID = -1;
			params.isActive = true;
			params.playerIDs = {};
			params.shipIDs = {};
			params.masterCommandQueue = [];
			params.currentRound = 0;
			params.updateCount = 0;
		}

		this.gameinstanceID = params.gameinstanceID;
		this.isActive = params.isActive;
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
	 
	 	getGameInstanceID: function() { return this.gameinstanceID; },
	 	setGameInstanceID: function(value) { this.gameinstanceID = value; },
	 	getIsActive: function() { return this.isActive; },
		setIsActive: function(isActive) { this.isActive = isActive; },
	 	addPlayerID: function(playerID) { this.playerIDs[playerID] = playerID; },
		removePlayerID: function(playerID) { delete this.playerIDs[playerID]; },
		addShipID: function(shipID) { this.shipIDs[shipID] = shipID; },
		removeShipID: function(shipID) { delete this.shipIDs[shipID]; },
		addCommand: function(command) { this.masterCommandQueue.push(command); },
		getCurrentCommand: function() { return this.masterCommandQueue[0]; },
		shiftCommand: function() { this.masterCommandQueue.shift(); },
		getCurrentRound: function() { return this.currentRound; },
		setCurrentRound: function(value) { this.currentRound = value; },
		incrementCurrentRound: function() { this.currentRound++; },

		
	};
	
	return GameInstance;
});

