define(function(){
	
	// ActionLibrary class constructor
	function ActionLibrary( ){
		
		// Main library to store actions
		this.actions = [];

		return(this);
	}
	 
	// ActionLibrary class methods
	ActionLibrary.prototype = {
	 
		getActions: function (index) {
			
			// Return an empty object if the index does not exist:
			if (this.actions[index] == null)
				return {};

			// (else) Return the actions for this index
			return this.actions[index];

		}
			
	};
	
	return ActionLibrary;
});

