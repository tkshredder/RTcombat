define(function(){
	
	// GameInstance class constructor
	function GameInstance(){
		
		this.playerIDs = {};
		this.shipIDs = {};
		this.currentRound;
		this.masterCommandQueue = [];
		this.updateCount = 0;
		this.timer = null;
		this.currentRound = 0;
		
		this.turnTimer;
		this.currentTurnTimeRemaining;
		this.lastTimeStamp;

		return(this);
	}
	 
	// GameInstance class methods
	GameInstance.prototype = {
	 
		addPlayerID: function(playerID) { }
	};
	
	return GameInstance;
});

