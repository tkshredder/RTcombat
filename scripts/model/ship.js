define(
	[
	"model/character"
	],
	function(Character){
	 
	// Ship class constructor
	function Ship(params) {
		
		//console.log(" --- (ship.js Constructor) Creating a new ship with parameters: ", params);
		
		this.shipID = params.shipID;
		this.name = params.name;
		this.playerID = params.playerID;
		this.teamID = params.teamID; // TO DO: clan instead of team? e.g., Dark Elves, Dead Team
		this.health = 20; // TO DO: set this based on the ship's size etc.
		this.crew = {};

		if (params.crew) {
			for (var crewID in params.crew) {
				this.crew[crewID] = new Character(params.crew[crewID]);
			}
		}


		return(this);
	}
	 
	// Ship class methods
	Ship.prototype = {

		
		addCrewMember: function(crewMember) {
			//console.log(' --- (ship.js) addCrewMember', crewMember)
			this.crew[crewMember.crewID] = new Character(crewMember);
		},

		removeCrewMember: function(character) {
			var index = this.crew.indexOf(character);
			this.crew.splice(index, 1);
		},

		getCrewSize: function() {
			var size = Object.keys(this.crew).length;
			//console.log(' --- (ship.js) getCrewSize: ' + size)
			return size;
		},

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
		getCrew: function() { return this.crew; },
		setCrew: function(value) { this.crew = value; },
		getHealth: function() { return this.health; },
		setHealth: function(value) { this.health = value; },
		getName: function(){ return this.name; },
		setName: function(value) { this.name = value; },
		getID: function(){ return( this.ID ); },
		setID: function(value) { this.ID = value; },
		getShipID: function(){ return( this.shipID ); },
		setShipID: function(value) { this.shipID = value; },
		getPlayerID: function(){ return( this.playerID ); },
		setPlayerID: function(value) { this.playerID = value; },
		getTeamID: function(){ return( this.teamID ); },
		setTeamID: function(value) { this.teamID = value; }
	};
	
	return Ship;
	
});

