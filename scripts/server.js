var httpd = require("http"),
path = require("path"),
url = require("url"),
fs = require('fs'),
events = require('events'),
mime = require('mime'),
requirejs = require('requirejs'),
serverEmitter = new events.EventEmitter();

var dburl = 'localhost/mongoapp';
var collections = ['players', 'ships', 'crew', 'gameinstances'];
var db = require('mongojs').connect(dburl, collections);
var ObjectId = db.ObjectId;

initDBRules();

console.log('Starting RTcombat....');

httpd.createServer(function(request,response){
	var my_path = url.parse(request.url).pathname;
	
	// Quick fix because I got tired of manually typing this:
	if (my_path == "/") 
		my_path = "index.html";
	
	var full_path = path.join(process.cwd(),"/../" + my_path);
	path.exists(path.resolve(full_path),function(exists){
		if(!exists){
			response.writeHeader(404, {"Content-Type": "text/plain"});  
			response.write("404 Not Found\n");  
			response.end();
		}
		else{
			fs.readFile(full_path, "binary", function(err, file) {  
			     if(err) {  
			         response.writeHeader(500, {"Content-Type": "text/plain"});  
			         response.write(err + "\n");  
			         response.end();  
			   
			     }  
				 else{
					response.setHeader("Content-Type", mime.lookup(full_path)); // Set the MIME type!
					response.writeHeader(200);  
			        response.write(file, "binary");  
			        response.end();
				}
					 
			});
		}
	});
}).listen(8124);
console.log("HTTP Server Running on 8124");

var io = require('socket.io').listen(5050, {log: false});
console.log("Socket Server Running on 5050");



// Server variables
var observerCount = 0;
var timer;
var globalSocket;

requirejs.config({nodeRequire: require});
requirejs(
	[
	'model/game',
	'model/gameinstance',
	'model/player',
	'model/ship',
	'model/characterfactory'
	],
	function (Game, GameInstance, Player, Ship, CharacterFactory) {
		
		var characterfactory = new CharacterFactory();
		var game = new Game(characterfactory);
		
		io.sockets.on('connection', function(socket) {
			
			// Set global socket var:
			globalSocket = socket;

			// Increment number of total observers
			observerCount++;
			
			serverEmitter.on('action', function (data) {
				// this message will be sent to all connected users
				socket.emit(data);
			});
			
			// When client connects, save the game state
			socket.emit('start', {state: game.save()} );

			// Client wants to create a new game instance
			socket.on('createGameInstance', function(data) {
				
				console.log('Event: createGameInstance', data);
				if (data.message != null) {
					console.log('-- (server.js) ' + data.message);
				}

				dbCreateGameInstance();

			});

			socket.on('sendchat', function(data) {
				console.log('Event: sendchat', data);

				// Don't need to save the chat on the server...
				//io.sockets.emit('sendchat', data);
				socket.emit('sendchat', data);
				socket.broadcast.emit('sendchat', data);
			});

			// Client joins the game
			socket.on('join', function(data) {
				
				// data is an object that comes in with data.name = username
				console.log('Event: join', data);
				
				// Don't allow more than 2 players:
				/*if (game.getPlayerCount() >= 2) {
					console.log('Error: too many players! (' + game.getPlayerCount() + ')');
					return;
				}*/

				// Create a new player object:
				//  ... all we know is the player username
				var newPlayer = new Player(data);

				//console.log("new player: ", newPlayer);

				//console.log('|||| socket connected to: ', socket.id)

				// Look up to see if player exists
				// Note: this function will automatically save a new player if no record is found.
				dbLookUpPlayer(newPlayer);
				
			});

			


			// PLAYER EVENTS
			socket.on('addPlayerToGameInstance', function(data) {
							
				console.log('Event: addPlayerToGameInstance', data);

				// Add playerID to target GameInstance:
				game.addPlayerToGameInstance(data.playerID, data.gameinstanceID, data.startedBy);

				socket.emit('addPlayerToGameInstance', data);

			});

			socket.on('chooseTeam', function(data) {
				console.log('Event: chooseTeam', data);

				game.chooseTeam(data.playerID);

				// Save chosen characters to DB:
				var crew = game.getShipsCrew(data.shipID);

				//console.log(' -- (server.js) crew: ', crew);

				dbSaveCrew(crew);

				/*socket.emit('chooseTeam', data);
				//socket.broadcast.emit('chooseShip', data);


				// Check if we have two players and both players are ready:
				if (game.getPlayerCount() == 2) {
					

					console.log('player 1 team chosen: ' + game.getPlayerTeamChosen(1));
					console.log('player 2 team chosen: ' + game.getPlayerTeamChosen(2));
					
					// TO DO:
					// Determine which playerIDs are being used for this game.

					if (game.getPlayerTeamChosen(1) == true && game.getPlayerTeamChosen(2) == true) {
						game.startGame();
						socket.emit('startGame', {message:"start"});
						socket.broadcast.emit('startGame', {message:"start"});
						
						startNextTurn();
					}
				}
				*/


			});


			

			socket.on('playerReady', function(data) {
				console.log('Event: playerReady', data);
				
				// Update the game on the SERVER:
				game.playerReady(data);
				
				// Broadcast action for CLIENTS:
				data.timeStamp = (new Date()).valueOf();
				io.sockets.emit('playerReady', data);
				
				// Check if both players are ready:
				if (game.waitingOnPlayers() == false) {
					
					console.log("Not waiting on players! Ready to start actions.");
					
					// io.sockets.emit('executeActions', data);
					executeNextAction();
				} else {
					
					console.log("Still waiting on a player to choose actions.");
				}
			});

			socket.on('chooseGameInstance', function(data) {
				console.log('Event: chooseGameInstance', data);

				// Add player and ship to the game:
				game.addPlayerToGameInstance(data.playerID, data.gameinstanceID);
				game.addShipToGameInstance(data.shipID, data.gameinstanceID);

				// Update DB instance:			
				// TO DO
				
				player = game.getPlayer(data.playerID);
				ship = game.getShip(data.shipID);

				// Get clients a copy of this ship and player:
				socket.broadcast.emit('addPlayer', player);
				socket.broadcast.emit('addShip', ship);
				socket.broadcast.emit('chooseGameInstance', data);

				// Update player who just selected a game instance:
				data.isme = true;
				//socket.emit('addPlayer', data);
				//socket.emit('addShip', data);
				socket.emit('chooseGameInstance', data);

				// TO DO --
				// resolve this. Currently, the second client will have all existing players available to him
				// this will get very large if there are several people online.
				
				// Check if we have two players and both players are ready:
				if (game.getGameInstancePlayerCount(data.gameinstanceID) == 2) {
					
					// Send notice the game is starting
					socket.emit('startGame', {message:"start"});
					socket.broadcast.emit('startGame', {message:"start"});
					
					// Start the next (first) turn of combat:
					timer = setTimeout(function() { startNextTurn(data.gameinstanceID); }, 2000);
					
				}
			});


			// SHIP EVENTS
			socket.on('addShipToGameInstance', function(data) {
							
				console.log('addShipToGameInstance', data);

				// Add shipID to target GameInstance:
				game.addShipToGameInstance(data.shipID, data.gameinstanceID);

				socket.emit('addShipToGameInstance', data);

			});

			socket.on('loadShips', function(data) {
				console.log('Event: loadShips', data);

				// Look up ship & crew from DB:
				dbLookUpShips(data.playerID);

				// Update game here?
				//game.
			});

			socket.on('chooseShip', function(data) {
				console.log('Event: chooseShip', data);

				// Create the new ship and get back its object data.
				// NEW: creating a ship now provides back the shipID
				//      since the shipID and playerID are no longer 1:1 (i.e., one player could have multiple ships)
				
				var newShip = new Ship(data);

				console.log('uh oh');
				console.log(game);
				console.log(newShip);

				// Update player model:
				game.setPlayerShipID(data.playerID, data.shipID);

				//shipID = game.addShip(data);
				//console.log(' --- shipID after join: ' + shipID);
				
				//shipObj = game.getShip(shipID);
				//console.log(' --- shipObj after getPlayer: ', shipObj);

				dbInsertShip(newShip);
			});


			// CREW EVENTS:
			socket.on('addCrewMember', function(data) {
				console.log('Event: addCrewMember', data);

				// Add a temp crewID since we don't want to update the DB just yet
				// returns 0, 1, 2 etc...
				data.crewID = game.getShipsCrewSize(data.shipID);

				// Create the new crew member:
				var newCrewMember = cfactory.createCharacter(data.name, data);

				// Update the game
				game.addCrewMember(newCrewMember);

				socket.emit('addCrewMember', newCrewMember);
			});


			socket.on('removeCrewMember', function(data) {
				console.log('Event: removeCrewMember', data);

				game.removeCrewMember(data.shipID, data);

				socket.emit('removeCrewMember', data);
			});


			socket.on('loadCrew', function(data) {
				console.log('Event: loadCrew', data);

				// Look up crew from DB:
				dbLookUpCrew(data.shipID);

			});

			
			
			socket.on('addCommand', function(data) {
				console.log('Event:  addCommand', data);
				
				// Update the game on the SERVER:
				var allCommandsSelected = game.addCommand(data);
				
				// Broadcast action for CLIENTS:
				data.timeStamp = (new Date()).valueOf();
				io.sockets.emit('addCommand', data);

				// If allCommands have been selected, we are ready for combat to resolve.
				if (allCommandsSelected == true) {
					executeNextAction(data.gameinstanceID);
				}

			});
			
			socket.on('removeCommand', function(data) {
				console.log('Event:  removeCommand', data);
				
				// Update the game on the SERVER:
				game.removeCommand(data);
				
				// Broadcast action for CLIENTS:
				data.timeStamp = (new Date()).valueOf();
				io.sockets.emit('removeCommand', data);
			});
			
			// Client performs an action
			socket.on('action', function(data) {
				console.log('Event:  action', data);
				
				// Update the game on the SERVER.
				// This returns back if this was successful or not
				success = game.performAction(data);
				
				// Broadcast action for CLIENTS:
				data.timeStamp = (new Date()).valueOf();
				data.success = success;
				io.sockets.emit('action', data);
				
				setTimeout(function() { executeNextAction(data.gameinstanceID); }, game.getCommandDelay());
				
				//io.sockets.emit('playerTurnFinish', {playerID: playerID, message: "player " + playerID + "'s turn is over."});
				
			});
		
			socket.on('state', function(data) {
				socket.emit('state', {
					state: game.save()
				});
			});



		
			
		  
			socket.on('startGame', function(data) {
				
				console.log('Event: startGame', data);		
				
				socket.broadcast.emit('startGame', data);
				socket.emit('startGame', data);
				
				// Call start next turn:
				startNextTurn();
			});
			
			socket.on('playerTurn', function(data) {
				
				// Fire the game's start turn, which turns on the timer.
				game.startTurn();
				
				socket.broadcast.emit('playerTurn', data);
				console.log('server Event:  playerTurn', data);
			});
			
			
			// TO DO: figure this part out
			
			
			socket.on('timerTick', function(data) {
				socket.emit('startGame', data);
			});
			
			
			socket.on('playerTurnFinish', function(data) {
				
				console.log('server Event:  playerTurnFinish', data);
				
				// Finalize this turn on SERVER instance of game
				game.playerTurnFinish(data);
				
				// Update the CLIENTS of the playerTurnFinish:
				data.timeStamp = new Date();
				io.sockets.emit('playerTurnFinish', data);
				
				// Set a timer on the SERVER to send out the start of the next turn:
				timer = setTimeout(function() { startNextTurn(); }, game.getTurnFinishDelay());
				
					
			});
		
			// Client leaves the game
			socket.on('leave', function(data) {
				console.log('Event:  leave', data);
				observerCount--;
				game.leave(playerID);
				data.timeStamp = new Date();
				// Broadcast that client has left
				io.sockets.emit('leave', data);
			});
		
			socket.on('disconnect', function(data) {
				console.log('Event:  disconnect', data);
				
				// TO DO:
				// Figure out who just left the game!

				/*
				//game.leave(playerID);
				
				// If this was a player, it just left
				if (playerID) {
					socket.broadcast.emit('leave', {name: playerID, timeStamp: new Date()});
				}*/
			});
		
			// Periodically emit time sync commands
			var timeSyncTimer = setInterval(function() {
				socket.emit('time', {
					timeStamp: (new Date()).valueOf(),
					//lastUpdate: game.getLastUpdate(),
					observerCount: observerCount
				});
			}, 2000);
		});
		

		

		// DB Functions

		function dbCreateGameInstance() {
			
			var newGameInstance = new GameInstance();

			db.gameinstances.save(newGameInstance, function(err, savedGameInstance) {
				if (err || !savedGameInstance) {
					console.log('GameInstance could not be saved to the DB.', err);
				}
				else {
					console.log('-- (server.js) savedGameInstance saved to DB');
					
					// Update gameInstance ID of the original game instance object:
					newGameInstance.setGameInstanceID("gameinstance"+makePrettyID(savedGameInstance._id));
					
					// Add gameinstance to the main game:
					game.addGameInstance(newGameInstance);	

					// Broadcast that a new Player has joined:
					broadcast('createGameInstance', {gameinstance:newGameInstance});

					// Update this player record to set the playerID (it's the _id)
					db.gameinstances.findAndModify({ 
						query: { _id: savedGameInstance._id}, 
						update: { $set: { gameinstanceID:newGameInstance.gameinstanceID } }}, 
						function (err, updatedPlayer) {
							// nothing
						}
					);
				}
			});
		}

		function dbUpdateGameInstance(data) {

			db.gameinstances.findAndModify({
				query: { gameinstanceID: data.gameinstanceID},
				update: { $set: { playerIDs: data.playerIDs, shipIDs: data.shipIDs}}},
				function (err, updatedGameInstance) {
					// Game Instance updated!
				}
			);

			

		}

		function dbLookUpPlayer(player) {

			var thatPlayer = player;
			
			console.log('--- (server.js) dbLookUpPlayer ', player);

			db.players.find({name:thatPlayer.name}, function(err, players) {
				
				//console.log('holy shit, a response for players.find!');
				//console.log(err, players);
				
				// Check if we had any errors looking up:
				if (err || !players) {
					console.log('No player named ' + thatPlayer.name + ' was found in the DB.');
				}

				// No DB errors 
				else { 

					// Check if the players array is an empty set:
					if (players.length == 0 ) {
						// Add this player to DB:
						dbInsertPlayer(thatPlayer);
					}

					else { 

						// This should be just one record, but it gets returned as an array.
						players.forEach( function (player) {

							//console.log("Found player in DB. ", player);
							thatPlayer = player;

							// Update game on server:
							game.addPlayer(thatPlayer);

							var data = {};
							data.player = thatPlayer;
							
							// Broadcast that an existing player has joined:
							broadcast('joinexisting', data);
							
						});
					}
				}
			});
		}

		function dbInsertPlayer(player) {
			
			var thatPlayer = player;

			//console.log('--- (server.js) dbInsertPlayer ', player)

			// Save the player into the DB:
			db.players.save(player, function(err, savedPlayer) {
				if (err || !savedPlayer) {
					console.log('Player ' + player.name + ' could not be saved to the DB.', err);
				}
				else {
					console.log('Player ' + savedPlayer.name + ' saved to DB');
					
					// Update player ID of the original player object:
					thatPlayer.setPlayerID("player"+makePrettyID(savedPlayer._id));
					
					// Add player to the main game:
					game.addPlayer(thatPlayer);	

					// Broadcast that a new Player has joined:
					broadcast('joinnew', {player:thatPlayer});

					// Update this player record to set the playerID (it's the _id)
					db.players.findAndModify({ 
						query: { name: savedPlayer.name}, 
						update: { $set: { playerID:thatPlayer.playerID } }}, 
						function (err, updatedPlayer) {
							// nothing
						}
					);


				}
			});
		}

		function dbLookUpShips(playerID) {
			
			console.log('-- (server.js) Looking up ships for player ' + playerID);

			var lookupPlayerID = playerID;
			var thatShip, shipCrew = [];

			// Look Up player's ship:
			db.ships.find({playerID:lookupPlayerID}, function(err, ships) {
				// Check if we had any errors looking up:
				if (err || !ships) {
					console.log('No ships found in the DB.');
				} 
				// No DB errors:
				else {
					if (ships.length > 0) {
						console.log("Found ship(s) in DB. ", ships);

						// Create a return object for the ships
						var data = {};
						data.ships = ships;


						// Load the first ship into memory:
						// TO DO: 
						// Make this a selectable action
						game.addShip(data.ships[0]);


						// Broadcast the ships data 
						broadcast('loadShips', data);

						
					}
				}
			});

		}

		function dbInsertShip(ship) {

			var thatShip = ship;

			//console.log('--- (server.js) dbSaveShip ', ship)

			db.ships.save(ship, function(err, savedShip) {
				if (err || !savedShip) 
					console.log('Ship ' + thatShip.name + ' could not be saved to the DB.', err);
				else {
					//console.log('Ship ' + savedShip.name + ' saved to DB');
					console.log(savedShip);

					
					// Emit chooseShip event
					// On the client side, this will load the character selection screen.
					thatShip.setShipID("ship"+makePrettyID(savedShip._id));

					// Add ship to game
					game.addShip(thatShip);

					// Broadcast the chooseShip event.
					// TO DO:
					// Control where this gets broadcast!!!
					broadcast('chooseShip', thatShip);

					// Update this ship record to set the shipID (it's the _id)
					db.ships.findAndModify({ 
						query: { _id: savedShip._id}, 
						update: { $set: { shipID:thatShip.shipID } }}, 
						function (err, updateShip) {
							//nothing
						}
					);


				}
			});
		}

		function dbLookUpCrew(shipID) {
			console.log('-- (game.js) Looking up crew for ship ' + shipID);

			var lookupShipID = shipID;
			var thatShip, shipCrew = [];

			db.crew.find({shipID: lookupShipID}, function(err, crew) {
				// Check if we had any errors looking up:
				if (err || !crew) {
					console.log('No crew for ship ' + shipID + ' found in the DB.');
				} 

				// No DB errors:
				else {
					console.log('Crew found for ship ' + lookupShipID + '. ');
					
					crew.forEach(function(crewMember) {
						shipCrew.push(crewMember);

						// Add the crew member to the ship:
						game.addCrewMember(crewMember);

					});

					var data = {};
					data.shipID = lookupShipID;
					data.shipCrew = shipCrew;
					data.timeStamp = new Date();

					// Broadcast that a player's ships were found
					broadcast('loadCrew', data);

				}

			});

		}

		function dbSaveCrew(crewObject) {

			var theCrew = crewObject;
			var theCrewArray = [];
			var crewMember;
			var counter = 0;

			//console.log('--- (server.js) dbSaveCrew ', crewObject);

			// TODO:
			// Convert crewObject to an Array

			for (var key in theCrew) {
				theCrewArray[counter++] = theCrew[key];
			}

			//console.log('--- (server.js) dbSaveCrew as Array: ', theCrewArray)

			db.crew.insert(theCrewArray, function(err, savedCrew) {
				if (err || !savedCrew) 
					console.log('Characters could not be saved to the DB.', err);
				else {
					console.log('Characters saved to DB');

					// This should be just one record, but it gets returned as an array.
					for (var key in theCrew) {

						crewMember = theCrew[key];
						crewMember.setCrewID("crew"+makePrettyID(crewMember._id));

						// Update this crewMembers record to set the crewID
						db.crew.findAndModify({ 
							query: { _id: crewMember._id}, 
							update: { $set: { crewID:crewMember.crewID } }}, 
							function (err, updateShip) {
								//nothing
							}
						);
					};

					// Crew is now updated with correct crew IDs

					// Emit chooseTeam event:
					broadcast('chooseTeam', {crew:theCrew, playerID:crewMember.getPlayerID(), shipID:crewMember.getShipID()});
				}
			});
		}

		function broadcast(eventName, data) {
			
			//console.log(' (broadcast): ', eventName, data);

			//globalSocket.broadcast.emit(eventName, data);
			//data.isme = true;

			//console.log('Broadcast event ' + eventName, globalSocket)
			data.isme = true;
			globalSocket.emit(eventName, data);

		}

		function makePrettyID(mongoObjectID) {
			//return String(mongoObjectID).substr(-5);
			return String(mongoObjectID);
		}








		
		// TO DO:
		// Move these into a server core file?
		
		function executeNextAction(gameinstanceID) {
			
			var nextAction = game.getNextAction(gameinstanceID);
			
			console.log('||------ execute next command for game instance ' + gameinstanceID);
			
			if (nextAction != null) {
				
				var data = {};
				data.command = nextAction;
				data.gameinstanceID = gameinstanceID;

				// Perform the action for the game instance on the SERVER:
				success = game.performAction(data);
				
				// Broadcast action for CLIENTS:
				data.timeStamp = (new Date()).valueOf();
				data.success = success;
				io.sockets.emit('action', data);
				
				// Set timer to fire next action, as long as its not the last action
				var isLastAction = (game.getCommandQueueSize(gameinstanceID).length == 0) ? true : false;

				if (! isLastAction) {
					timer = setTimeout(function() { executeNextAction(gameinstanceID); }, game.getCommandDelay());
				} else {
					timer = setTimeout(function() { startNextTurn(gameinstanceID); }, 5000);
				}
				
			}
		}
		
		function startNextTurn(gameinstanceID) {
			
			console.log('------ start next turn for game instance ' + gameinstanceID);
			
			// Create data for this turn:
			var data = {currentRound: game.getCurrentRound(gameinstanceID)+1};
			game.playerTurn(data);
			
			data.timeStamp = new Date();
			io.sockets.emit('playerTurn', data); console.log(' -- 1 emit playerTurn');
			io.sockets.emit('chooseCommands', data); console.log(' -- 2 emit chooseCommands');
		}
		
	}
);

function initDBRules() {
	
	// Set up Database rules
	db.players.ensureIndex({name:1}, {unique:true});
	//db.ships.ensureIndex({name:1}, {unique:true});

	// additional rules go here...

}

