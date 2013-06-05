define(function(){
	 
	// Ship class constructor
	function Ship(params) {
		
		// console.log(" --- (ship.js Constructor) Creating a new ship with parameters: ", params);
		
		this.shipID = params.shipID;
		this.name = params.name;
		this.playerID = params.playerID;
		this.teamID = params.teamID; // TO DO: clan instead of team? e.g., Dark Elves, Dead Team
		this.health = 20; // TO DO: set this based on the ship's size etc.
		
		return(this);
	}
	 
	// Ship class methods
	Ship.prototype = {
		
		toJSON: function() { 
			var shipObj = {};
			for (var prop in this) {
				if (this.hasOwnProperty(prop)) {
					shipObj[prop] = this[prop];
				}
			}
			return shipObj;
		},
		
		damage: function (amount) {
			this.health -= amount;
		},
		
		// Accessor functions:
		getName: function(){ return( this.name ); },
		setName: function(value) { this.name = value; },
		getID: function(){ return( this.ID ); },
		setID: function(value) { this.ID = value; },
		getPlayerID: function(){ return( this.playerID ); },
		setPlayerID: function(value) { this.playerID = value; },
		getTeamID: function(){ return( this.teamID ); },
		setTeamID: function(value) { this.teamID = value; }
	};
	
	return Ship;
	
});

