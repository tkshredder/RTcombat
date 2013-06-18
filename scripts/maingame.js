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
var game, characterfactory, client, socket, output, input, sound, animator, createjs;

// Load the main application and all required files:
require(
	[
	"model/game",
	"model/characterfactory",
	"lib/socket.io",
	"io/entityanimator",
	"io/input",
	"io/output",
	"io/sound",
	"client",
	"jquery",
	"gsap",
	"soundjs"
	],
	function(Game, CharacterFactory, SocketIO, EntityAnimator, Input, Output, Sound, Client, $, GSAP, SoundJS){
		
		// Create an instance of our socket class:
		socket = io.connect('http://localhost:5050');
		//socket = io.connect('http://ec2-54-234-252-103.compute-1.amazonaws.com:5050');
		
		// Create instances of all classes
		characterfactory = new CharacterFactory(),
		game = new Game(characterfactory),
		sound = new Sound(SoundJS),
		animator = new EntityAnimator(game, $, GSAP),
		output = new Output(game, animator, characterfactory),
		client = new Client(game, socket, output, sound, animator),
		input = new Input(game, client, output, sound, socket, $);

		// Stub code for anything that needs to run post init()		
		//game.sayHello();
		//output.hidePanels(["commands","vitals"]);
	}
);