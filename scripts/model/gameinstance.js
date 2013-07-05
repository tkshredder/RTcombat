define(function(){
	
	// GameInstance class constructor
	function GameInstance() {
		
		this.gameinstanceID;
		this.isActive = true;
		this.playerIDs = {};
		this.shipIDs = {};
		this.masterCommandQueue = [];
		this.currentRound = 0;
		this.updateCount = 0;
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

