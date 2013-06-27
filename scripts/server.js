var httpd = require("http"),
path = require("path"),
url = require("url"),
fs = require('fs'),
events = require('events'),
mime = require('mime'),
requirejs = require('requirejs'),
serverEmitter = new events.EventEmitter();

var dburl = 'localhost/mongoapp';
var collections = ['players', 'ships', 'characters'];
var db = require('mongojs').connect(dburl, collections);

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
	'model/characterfactory'
	],
	function (Game, CharacterFactory) {
		
		var characterfactory = new CharacterFactory();
		var game = new Game(characterfactory);
		
		io.sockets.on('connection', function(socket) {
			
			// Set global socket var:
			globalSocket = socket;

			// Increment number of total observers
			observerCount++;
			
			// Keep track of the player associated with this socket
			var playerID = null;
			
			
			serverEmitter.on('action', function (data) {
				// this message will be sent to all connected users
				socket.emit(data);
			});
			
			// When client connects, dump game state
			socket.emit('start', {
				state: game.save()
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
				
				// data is an object that comes in with data.name = username ONLY
				console.log('Event: join', data);
				
				// Don't allow more than 2 players:
				if (game.getPlayerCount() >= 2) {
					console.log('Error: too many players! (' + game.getPlayerCount() + ')');
					return;
				}

				// Create player
				playerID = game.join(data);
				console.log(' --- playerID after join: ' + playerID);
				
				playerObj = game.getPlayer(playerID);
				console.log(' --- playerObj after getPlayer: ' + playerObj);
				

				// Look up to see if player exists
				// Note: this function will handle whether to save a new player to the DB
				// or load an existing one. 
				
				dbLookUpPlayer(playerObj);
			
				//dbSavePlayer(playerObj);

			});

			socket.on('loadShips', function(data) {
				console.log('Event: loadShips', data);

				// Look up ship & crew from DB:
				dbLookUpShips(data.playerID);

				// Update game here?
				//game.


			});

			socket.on('loadCrew', function(data) {
				console.log('Event: loadCrew', data);

				// Look up crew from DB:
				dbLookUpCrew(data.playerID);

				// Update game here?
				//game.


			});




			socket.on('chooseShip', function(data) {
				console.log('Event: chooseShip', data);

				// Create the new ship and get back its object data.
				// NEW: creating a ship now provides back the shipID
				//      since the shipID and playerID are no longer 1:1 (i.e., one player could have multiple ships)
				
				shipID = game.addShip(data);
				//console.log(' --- shipID after join: ' + shipID);
				
				shipObj = game.getShip(shipID);
				//console.log(' --- shipObj after getPlayer: ', shipObj);

				dbSaveShip(shipObj);
			});

			socket.on('addCrewMember', function(data) {
				console.log('Event: addCrewMember', data);

				game.addCrewMember(data.shipID, data);

				socket.emit('addCrewMember', data);
				//socket.broadcast.emit('chooseShip', data);
			});

			socket.on('removeCrewMember', function(data) {
				console.log('Event: removeCrewMember', data);

				game.removeCrewMember(data.playerID, data);

				socket.emit('removeCrewMember', data);
			});


			socket.on('chooseTeam', function(data) {
				console.log('Event: chooseTeam', data);

				game.chooseTeam(data.playerID);

				// Save chosen characters to DB:
				var crew = game.getShipsCrew(data.shipID);

				console.log(' -- (server.js) crew: ', crew);

				/*for (var character in characters) {
					dbSaveCharacters(character);
				}*/
				dbSaveCrew(characters);



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
			
			
			socket.on('addCommand', function(data) {
				console.log('Event:  addCommand', data);
				
				// Update the game on the SERVER:
				game.addCommand(data);
				
				// Broadcast action for CLIENTS:
				data.timeStamp = (new Date()).valueOf();
				io.sockets.emit('addCommand', data);
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
				
				setTimeout(function() { executeNextAction(); }, game.getCommandDelay());
				
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
				// Broadcast that client has joined
				io.sockets.emit('leave', data);
			});
		
			socket.on('disconnect', function(data) {
				console.log('Event:  disconnect', data);
				observerCount--;
				game.leave(playerID);
				
				// If this was a player, it just left
				if (playerID) {
					socket.broadcast.emit('leave', {name: playerID, timeStamp: new Date()});
				}
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
		function dbLookUpPlayer(player) {

			var thatPlayer = player;
			
			console.log('--- (server.js) dbLookUpPlayer ', player);

			db.players.find({name:thatPlayer.name}, function(err, players) {
				
				//console.log('holy shit, a response!');
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
						dbSavePlayer(thatPlayer);
					}

					else { 

						// This should be just one record, but it gets returned as an array.
						players.forEach( function (player) {

							console.log("Found player in DB. ", player);
							thatPlayer = player;

							
							var data = {};
							data.playerID = player.playerID;
							//data.hasShips = true;
							data.name = player.name;

							// Hey hey! welcome to the game...
							data.timeStamp = new Date();
							
							// Broadcast that an existing player has joined:
							broadcast('joinexisting', data);
							
						});
					}
				}
			});
		}

		function dbSavePlayer(player) {
			
			var thatPlayer = player;

			console.log('--- (server.js) dbSavePlayer ', player)

			db.players.save(player, function(err, savedPlayer) {
				if (err || !savedPlayer) {
					console.log('Player ' + player.name + ' could not be saved to the DB.', err);
				}
				else {
					console.log('Player ' + savedPlayer.name + ' saved to DB');

					var data = {};
					data.playerID = thatPlayer.playerID;
					data.name = thatPlayer.name;

					// Hey hey! welcome to the game...
					data.timeStamp = new Date();
					
					// Broadcast that a new Player has joined:
					broadcast('joinnew', data);

				}
			});
		}

		function dbLookUpShips(playerID) {
			
			console.log('-- (game.js) Looking up ships for player ' + playerID);

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

						/*ships.forEach(function(ship) {
							dbLookUpCrew(ship.shipID);
						});
						*/


						// Create a return object for the ships
						var data = {};
						data.ships = ships;

						console.log(' --- broadcast loadShipAndCharacters')
						// Broadcast the ships data 
						broadcast('loadShips', data);
						

					}
				}
			});

		}

		function dbLookUpCrew(shipID) {
			console.log('-- (game.js) Looking up crew for ship ' + shipID);

			var lookupShipID = shipID;
			var thatShip, shipCrew = [];

			db.characters.find({shipID: lookupShipID}, function(err, characters) {
				// Check if we had any errors looking up:
				if (err || !characters) {
					console.log('No crew for ship ' + shipID + ' found in the DB.');
				} 

				// No DB errors:
				else {
					console.log('Crew found: ', characters);
					
					// TO DO:
					// build an array of IDs pertaining to this ship
					characters.forEach(function(character) {
						shipCrew.push(character);
					});

					var data = {};
					data.shipID = lookupShipID;
					data.shipCrew = shipCrew;
					data.timeStamp = new Date();
					
					// Broadcast that a player's ships were found
					broadcast('loadCharacters', data);
				}

			});

		}


		function dbSaveShip(ship) {

			var thatShip = ship;

			console.log('--- (server.js) dbSaveShip ', ship)

			db.ships.save(ship, function(err, savedShip) {
				if (err || !savedShip) 
					console.log('Ship ' + ship.name + ' could not be saved to the DB.', err);
				else {
					console.log('Ship ' + savedShip.name + ' saved to DB');

					// Emit chooseShip event
					// On the client side, this will load the character selection screen.
					var data = {};
					data.playerID = thatShip.playerID;
					data.shipID = thatShip.shipID;
					data.teamID = thatShip.teamID;
					data.name = thatShip.name;
					data.timeStamp = new Date();

					broadcast('chooseShip', data);
				}
			});
		}



		function dbSaveCrew(crewArray) {

			var theCrew = crewArray;

			console.log('--- (server.js) dbSaveCrew ', crewArray)

			db.crew.insert(crewArray, function(err, savedCrew) {
				if (err || !savedCrew) 
					console.log('Characters could not be saved to the DB.', err);
				else {
					console.log('Characters saved to DB');

					// Emit chooseShip event
					// On the client side, this will load the character selection screen.
					var data = {};
					data.playerID = crewArray[0].playerID;
					data.timeStamp = new Date();

					broadcast('chooseTeam', data);
				}
			});
		}

		function broadcast(eventName, data) {
			
			console.log(' (broadcast): ', eventName, data);

			globalSocket.broadcast.emit(eventName, data);
			data.isme = true;
			globalSocket.emit(eventName, data);
		}








		
		// TO DO:
		// Move these into a server core file?
		
		function executeNextAction() {
			
			var nextAction = game.getNextAction();
			
			console.log('------ execute next command');
			
			if (nextAction != null) {
				var data = {};
				data.command = nextAction;
				
				// Perform the action for the game instance on the SERVER:
				success = game.performAction(data);
				
				// Broadcast action for CLIENTS:
				data.timeStamp = (new Date()).valueOf();
				data.success = success;
				io.sockets.emit('action', data);
				
				// Set timer to fire next action, as long as its not the last action
				var isLastAction = (game.getMasterCommandQueue().length == 0) ? true : false;
				if (! isLastAction) {
					timer = setTimeout(function() { executeNextAction(); }, game.getCommandDelay());
				} else {
					timer = setTimeout(function() { startNextTurn(); }, 5000);
				}
				
			}
		}
		
		function startNextTurn() {
			
			console.log('------ start next turn.');
			
			// Create data for this turn:
			var data = {currentRound: game.getCurrentRound()+1};
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

