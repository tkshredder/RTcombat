define(function(){
	
	// ActionLibrary class constructor
	function ActionLibrary( ){
		
		// Main library to store actions
		this.actions = [];

		this.loadActions();


		return(this);
	}
	 
	// ActionLibrary class methods
	ActionLibrary.prototype = {

		loadActions: function() {

			// TO DO: 
			// Develop a way to automate this.
			
			console.log(' --- (ActionLibrary) loading Actions .....')

			// 1. Set up arrays for each character:
			this.actions['skeleshark'] = [];
			this.actions['deadsoldier'] = [];
			this.actions['tentacles'] = [];
			this.actions['drowarcher'] = [];
			this.actions['centipede'] = [];
			this.actions['shaman'] = [];

			// 2. Push in actions
			this.actions['skeleshark'].push({actionname: "Hull Chomper", type: "attack", effect: "4 damage", successRate: 80});
			this.actions['skeleshark'].push({actionname: "Line Snapper", type: "attack", effect: "6 damage", successRate: 60});
			this.actions['deadsoldier'].push({actionname: "Shrapnel", type: "attack", effect: "8 damage", successRate: 40});
			this.actions['deadsoldier'].push({actionname: "Shreik", type: "attack", effect: "3 damage", successRate: 100});
			this.actions['tentacles'].push({actionname: "Tentacle Face", type: "attack", effect: "4 damage", successRate: 85});
			this.actions['tentacles'].push({actionname: "Stripper", type: "attack", effect: "5 damage", successRate: 70});
			this.actions['drowarcher'].push({actionname: "Arrow", type: "attack", effect: "10 damage", successRate: 20});
			this.actions['drowarcher'].push({actionname: "Arterial Rupture", type: "attack", effect: "6 damage", successRate: 60});
			this.actions['centipede'].push({actionname: "100 Legs", type: "attack", effect: "8 damage", successRate: 40});
			this.actions['centipede'].push({actionname: "Jump Ship", type: "attack", effect: "3 damage", successRate: 100});
			this.actions['shaman'].push({actionname: "Voodoo Coward", type: "magic", effect: "4 damage", successRate: 85});
			this.actions['shaman'].push({actionname: "Flamegarden", type: "magic", elemental: "fire", effect: "5 damage", successRate: 70});
			this.actions['shaman'].push({actionname: "Thunderstood",type: "magic", elemental: "thunder", effect: "8 damage", successRate: 100});
			
		},

		addAction: function (index, action) {
			
			// Check input for errors, bail if problematic
			if (typeof index !== "string" || index == "" || typeof action !== 'object')
				return;

			console.log(' --- (actionlibrary.js) addActions', index, action)

			// TO DO:
			// Further process action to ensure its not an object array. 
			// If so, break out into multiple actions 
			this.actions[index].push(action);

		},

		// TO DO:
		// removeAction: function (index, actionname) { },

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

