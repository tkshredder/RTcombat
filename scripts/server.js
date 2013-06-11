var httpd = require("http"),
path = require("path"),
url = require("url"),
fs = require('fs'),
events = require('events'),
mime = require('mime'),
requirejs = require('requirejs'),
serverEmitter = new events.EventEmitter();

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


requirejs.config({nodeRequire: require});
requirejs(
	['model/game'],
	function (Game) {
		
		var game = new Game();
		
		//game.addPlayer(1, {name:"Albatross"});
		//game.addPlayer(2, {name:"Zod"});
		
		//game.sayHello();
		
		io.sockets.on('connection', function(socket) {
	
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





			socket.on('chooseShip', function(data) {
				console.log('Event: chooseShip', data);

				game.setShip(data);

				socket.emit('chooseShip', data);
				socket.broadcast.emit('chooseShip', data);
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
		
			// Client joins the game as a player
			socket.on('join', function(data) {
				
				// data is an object that comes in with data.name = username ONLY
				console.log('Event: join', data);
				
				// Don't allow more than 2 players:
				if (game.getPlayerCount() >= 2) {
					console.log('Error: too many players! (' + game.getPlayerCount() + ')');
					return;
				}
				
				data.playerID = game.getPlayerCount() + 1; // Assigns a 1 to first user, 2 to second...
				data.shipID = data.playerID;	
				
				// TO DO: Make the Team ID depend on what the user chose! 
				data.teamID = game.getPlayerCount() + 1;
				
				// Create player and ship object on the SERVER:
				playerID = game.join(data);
				
				data.timeStamp = new Date();
				
				// Broadcast that client has joined:
				socket.broadcast.emit('join', data);
				data.isme = true;
				socket.emit('join', data);
				
				//console.log("Current number of players: " + game.getPlayerCount());
				
				if (game.getPlayerCount() == 2) {
					game.startGame();
					socket.emit('startGame', {message:"start"});
					socket.broadcast.emit('startGame', {message:"start"});
					
					startNextTurn();
				}
			
			});
		 
			/* Custom functions */
			 
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









