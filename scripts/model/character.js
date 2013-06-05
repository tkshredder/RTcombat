define(function(){
	
	// Character class constructor
	function Character(params){
		
		this.name = params.name;
		// Other properties to go here...
		
		return(this);
	}
	 
	// Character class methods
	Character.prototype = {
	 
		// I return the instance ID for this instance.
		getName: function(){
			return( this.name );
		},
		setName: function(value) {
			this.name = value;
		},
		sayHello: function() {
			console.log("Hello, I'm a character named " + this.name);
		}
	};
	
	return Character;
});

