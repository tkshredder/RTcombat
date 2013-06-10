define(function(){
	
	// Character class constructor
	function Character(params){
		
		this.name = params.name;
		this.class = params.class;
		this.playerID = params.playerID;
		this.shipID = params.playerID;
		this.attack = params.attack;
		this.defense = params.defense;
		this.courage = params.courage;
		this.dodge = params.dodge;

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
		getAttack: function() {return( this.attack ); },
		setAttack: function(value) { this.attack = value; },
		getDefense: function() {return( this.defense ); },
		setDefense: function(value) { this.defense = value; },
		getCourage: function() {return( this.courage ); },
		setCourage: function(value) { this.courage = value; },
		getDodge: function() {return( this.dodge ); },
		setDodge: function(value) { this.dodge = value; },
			
	};
	
	return Character;
});

