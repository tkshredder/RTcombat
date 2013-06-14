// Set up requirejs configuration:
requirejs.config({
	shim: {
		soundjs: { 
			exports: 'createjs'
		},
		gsap: {
			exports: 'gsap'
		}
	},
	paths: {
		'gsap'   : 'http://cdnjs.cloudflare.com/ajax/libs/gsap/1.9.6/TweenMax.min',
		'jquery' : 'https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min',
		'soundjs': 'http://code.createjs.com/soundjs-0.4.1.min'
	}
});

// Set our main variables available across the document for quick access:
// Ideally these should go into the main function below
var game, actionlibrary, client, socket, output, input, sound, animator, createjs;

// Load the main application and all required files:
require(
	[
	"model/game",
	"model/actionlibrary",
	"lib/socket.io",
	"io/combatanimation",
	"io/input",
	"io/output",
	"io/sound",
	"client",
	"jquery",
	"gsap",
	"soundjs"
	],
	function(Game, ActionLibrary, SocketIO, CombatAnimation, Input, Output, Sound, Client, $, GSAP, SoundJS){
		
		
		// Testing audio...
		createjs = SoundJS;
		
		// Create an instance of our socket class:
		socket = io.connect('http://localhost:5050');
		//socket = io.connect('http://ec2-54-234-252-103.compute-1.amazonaws.com:5050');
		
		// Create instances of all classes
		actionlibrary = new ActionLibrary(),
		game = new Game(actionlibrary),
		sound = new Sound(SoundJS),
		animator = new CombatAnimation(game, $, GSAP),
		output = new Output(game, animator),
		client = new Client(game, socket, output, sound, animator),
		input = new Input(game, client, output, sound, socket, $);
		
		//game.sayHello();
		
		//output.hidePanels(["commands","vitals"]);
	}
);