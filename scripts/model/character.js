define(function(){
	
	// Character class constructor
	function Character(params){
		
		//console.log('Creating a new character: ', params)

		this.name = params.name;
		this.class = params.class;
		this.crewID = params.crewID;
		this.playerID = params.playerID;
		this.shipID = params.shipID;
		this.attack = params.attack;
		this.defense = params.defense;
		this.courage = params.courage;
		this.dodge = params.dodge;
		this.actions = params.actions;
		this.isActive = params.isActive;

		return(this);
	}
	 
	// Character class methods
	Character.prototype = {
	 
		getName: function() {return( this.name ); },
		setName: function(value) { this.name = value; },
		getClass: function() {return( this.class ); },
		setClass: function(value) { this.class = value; },
		getPlayerID: function() {return( this.playerID ); },
		setPlayerID: function(value) { this.playerID = value; },
		getShipID: function() {return( this.shipID ); },
		setShipID: function(value) { this.shipID = value; },
		getCrewID: function() {return( this.crewID ); },
		setCrewID: function(value) { this.crewID = value; },
		getAttack: function() {return( this.attack ); },
		setAttack: function(value) { this.attack = value; },
		getDefense: function() {return( this.defense ); },
		setDefense: function(value) { this.defense = value; },
		getCourage: function() {return( this.courage ); },
		setCourage: function(value) { this.courage = value; },
		getDodge: function() {return( this.dodge ); },
		setDodge: function(value) { this.dodge = value; },
		getActions: function() { return this.actions; },
		setActions: function(actions) { this.actions = actions; },
		getIsActive: function() { return this.isActive; },
		setIsActive: function(value) { this.isActive = value;}
	};
	
	return Character;
});

