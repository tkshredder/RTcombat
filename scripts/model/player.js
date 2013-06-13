define(function(){
	
	// Player class constructor 
	function Player(params) {
	
		// console.log(" --- (player.js Constructor) creating a new player with parameters: ", params);
	
		this.playerID = params.playerID;
		this.name = params.name;
		this.shipID = params.shipID;
		this.commandsAvailable = 3;
		this.teamID = params.teamID;
		
		this.teamChosen = false;
		this.playerReady = false;
	
		// Each Player has their own set of commands:
		this.commandQueue = [];
		this.executedCommands = [];
		this.possibleCommands = [];
		
		
		// TO DO: Move this into its own module, actions
		this.action1 = {actionname: "Hull Chomper", charactername: "skeleshark", type: "attack", effect: "4 damage", successRate: 80};
		this.action2 = {actionname: "Line Snapper", charactername: "skeleshark", type: "attack", effect: "6 damage", successRate: 60};
		this.action3 = {actionname: "Shrapnel", charactername: "dead soldier", type: "attack", effect: "8 damage", successRate: 40};
		this.action4 = {actionname: "Shreik", charactername: "dead soldier", type: "attack", effect: "3 damage", successRate: 100};
		this.action5 = {actionname: "Tentacle Face", charactername: "tentacles", type: "attack", effect: "4 damage", successRate: 85};
		this.action6 = {actionname: "Stripper", charactername: "tentacles", type: "attack", effect: "5 damage", successRate: 70};
		
		this.darkaction1 = {actionname: "Arrow", charactername: "drow archer", type: "attack", effect: "10 damage", successRate: 20};
		this.darkaction2 = {actionname: "Arterial Rupture", charactername: "drow archer", type: "attack", effect: "6 damage", successRate: 60};
		this.darkaction3 = {actionname: "100 Legs", charactername: "centipede", type: "attack", effect: "8 damage", successRate: 40};
		this.darkaction4 = {actionname: "Jump Ship", charactername: "centipede", type: "attack", effect: "3 damage", successRate: 100};
		this.darkaction5 = {actionname: "Voodoo Coward", charactername: "shaman", type: "magic", effect: "4 damage", successRate: 85};
		this.darkaction6 = {actionname: "Flamegarden", charactername: "shaman", type: "magic", elemental: "fire", effect: "5 damage", successRate: 70};
		this.darkaction7 = {actionname: "Thunderstood", charactername: "shaman", type: "magic", elemental: "thunder", effect: "8 damage", successRate: 100};
		
		return(this);
	}
	 
	// Player class methods:
	Player.prototype = {
	
		sayHello: function() {
			console.log("Hello, I'm a player named " + this.name);
		},
		
		toJSON: function() { 
			var playerObj = {};
			for (var prop in this) {
				if (this.hasOwnProperty(prop)) {
					playerObj[prop] = this[prop];
				}
			}
			return playerObj;
		},
		
		loadPlayerCommands: function() {
	
			// console.log(" --- load Player Commands. teamID: " + this.teamID);
			
			// Empty the array of possible commands:
			this.possibleCommands.length = 0;
			
			if (this.teamID == 1) {
				this.possibleCommands.push(this.action1);
				this.possibleCommands.push(this.action2);
				this.possibleCommands.push(this.action3);
				this.possibleCommands.push(this.action4);
				this.possibleCommands.push(this.action5);
				this.possibleCommands.push(this.action6);
			} else if (this.teamID == 2) {
				this.possibleCommands.push(this.darkaction1);
				this.possibleCommands.push(this.darkaction2);
				this.possibleCommands.push(this.darkaction3);
				this.possibleCommands.push(this.darkaction4);
				this.possibleCommands.push(this.darkaction5);
				this.possibleCommands.push(this.darkaction6);
			}
		},
		
		addCommand: function(command) {
			//console.log('player.addCommand');
			//console.log(this.commandQueue);
			
			this.commandsAvailable--;
			this.commandQueue.push(command);
			//console.log(this.commandQueue);
		},
		
		removeCommand: function(command) {
	
			// Loop through the commandQueue to find a match on the name
			for (var i = 0; i < this.commandQueue.length; i++) {
				if (this.commandQueue[i].actionname == command.actionname) {
					index = i; break;
				}
			}
			
			if (index > -1) {
				this.commandQueue.splice(index,1);
				this.commandsAvailable++;
			} else {
				console.log('ERROR: Command not found! Can not remove.');
			}
		},
		
		performAction: function(command) {
			console.log(" -- Player perform action - command name, command queue [0] name: ", command.name, this.commandQueue[0].name);
			if (command.name == this.commandQueue[0].name) 
				this.executedCommands.push(this.commandQueue.shift()); // 2 for 1 !
		},
		
		computeState: function(delta) {
			var newPlayer = new this.constructor(this.toJSON());
			return newPlayer;
		},
		
		// Accessor functions:
		getName: function(){ return( this.name ); },
		setName: function(value) { this.name = value; },
		getPlayerID: function(){ return( this.playerID ); },
		setPlayerID: function(value) { this.playerID = value; },
		getShipID: function(){ return( this.shipID ); },
		setShipID: function(value) { this.shipID = value; },
		getTeamID: function(){ return( this.teamID ); },
		setTeamID: function(value) { this.teamID = value; },
		getCommandQueue: function() { return this.commandQueue; },
		setCommandQueue: function(value) { this.commandQueue = value; },
		getExecutedCommands: function() { return this.executedCommands; },
		setExecutedCommands: function(value) { this.executedCommands = value; },
		getPossibleCommands: function() { return this.possibleCommands; },
		setPossibleCommands: function(value) { this.possibleCommands = value; },
		getCommandsAvailable: function() { return this.commandsAvailable; },
		getTeamChosen: function() { return this.teamChosen; },
		setTeamChosen: function(value) { this.teamChosen = value; },
		getPlayerReady: function() { return this.playerReady; },
		setPlayerReady: function(value) { this.playerReady = value; }

	};
	
	return Player;
});

