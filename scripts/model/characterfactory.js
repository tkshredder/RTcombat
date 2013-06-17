define(
	[
	"model/character"
	],
	function (Character) {
	
		// CharacterFactory class constructor
		function CharacterFactory( ){
			
			// No props... ?


			return(this);
		}
		 
		// CharacterFactory class methods
		CharacterFactory.prototype = {

			createCharacter: function (characterType) {
				
				// Generate the character's data
				characterParams = this.createCharacterData(characterType);
				
				// Create a new character based on the character data:
				newCharacter = new Character(characterParams);

				return newCharacter;

			},

			createCharacterData: function (characterType) {
				
				//console.log('---- (characterfactory.js) createCharacterData: ', characterType)

				var characterParams = {};

				// TO DO: 
				// Move this into an external file?
				switch (characterType) {

					case "shaman":
						characterParams.name = "Shaman";
						characterParams.class = "shaman";
						characterParams.strength = 5;
						characterParams.defense = 3;
						characterParams.courage = 0;
						characterParams.dodge = 6;

						// Add actions:
						characterParams.actions = [];
						characterParams.actions.push({actionname: "Voodoo Coward", type: "magic", effect: "4 damage", successRate: 85});
						characterParams.actions.push({actionname: "Flamegarden", type: "magic", elemental: "fire", effect: "5 damage", successRate: 70});
						characterParams.actions.push({actionname: "Thunderstood",type: "magic", elemental: "thunder", effect: "8 damage", successRate: 100});
			
						break;
					case "drowarcher":
						characterParams.name = "Drow Archer";
						characterParams.class = "drowarcher";
						characterParams.strength = 5;
						characterParams.defense = 3;
						characterParams.courage = 0;
						characterParams.dodge = 6;

						// Add actions:
						characterParams.actions = [];
						characterParams.actions.push({actionname: "Arrow", type: "attack", effect: "10 damage", successRate: 20});
						characterParams.actions.push({actionname: "Arterial Rupture", type: "attack", effect: "6 damage", successRate: 60});
			
						break;
					case "centipede":
						characterParams.name = "Centipede";
						characterParams.class = "centipede";
						characterParams.strength = 5;
						characterParams.defense = 3;
						characterParams.courage = 0;
						characterParams.dodge = 6;

						// Add actions:
						characterParams.actions = [];
						characterParams.actions.push({actionname: "100 Legs", type: "attack", effect: "8 damage", successRate: 40});
						characterParams.actions.push({actionname: "Jump Ship", type: "attack", effect: "3 damage", successRate: 100});
			
						break;
					case "tentacles":
						characterParams.name = "Tentacles";
						characterParams.class = "tentacles";
						characterParams.strength = 5;
						characterParams.defense = 3;
						characterParams.courage = 0;
						characterParams.dodge = 6;

						// Add actions:
						characterParams.actions = [];
						characterParams.actions.push({actionname: "Tentacle Face", type: "attack", effect: "4 damage", successRate: 85});
						characterParams.actions.push({actionname: "Stripper", type: "attack", effect: "5 damage", successRate: 70});
			
						break;
					case "deadsoldier":
						characterParams.name = "Dead Soldier";
						characterParams.class = "deadsoldier";
						characterParams.strength = 5;
						characterParams.defense = 3;
						characterParams.courage = 0;
						characterParams.dodge = 6;

						// Add actions:
						characterParams.actions = [];
						characterParams.actions.push({actionname: "Shrapnel", type: "attack", effect: "8 damage", successRate: 40});
						characterParams.actions.push({actionname: "Shreik", type: "attack", effect: "3 damage", successRate: 100});
			
						break;
					case "skeleshark":
						characterParams.name = "Skeleshark";
						characterParams.class = "skeleshark";
						characterParams.strength = 5;
						characterParams.defense = 3;
						characterParams.courage = 0;
						characterParams.dodge = 6;

						// Add actions:
						characterParams.actions = [];
						characterParams.actions.push({actionname: "Hull Chomper", type: "attack", effect: "4 damage", successRate: 80});
						characterParams.actions.push({actionname: "Line Snapper", type: "attack", effect: "6 damage", successRate: 60});
			
						break;

				} // end of switch

				return characterParams;

			}

		};
		return CharacterFactory;
	}
);