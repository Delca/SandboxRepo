var game = new Phaser.Game(380, 260, Phaser.AUTO, null, null, null, null, false);

var main_state = {preload: preload, create: create, update: update};

function preload() {
game.load.spritesheet('runner', 'assets/runner.png', 18, 18);
game.load.tilemap('default', 'map/makethejump.json', null, Phaser.Tilemap.TILED_JSON);
game.load.image('tiles', 'assets/tiles.png');
game.load.image('particle', 'assets/particle.png');
game.load.image('particleBar', 'assets/particleBar.png'); 

game.load.audio('jump', 'sound/jump.wav');
}

var player;
var map;
var cursors;
var soundJump;
var slideEmitter;
var climbingBar;
var climbingMax = 50;
var climbingUse = climbingMax;
var climbingRegen = 1.6;
var text;

function create() {
game.physics.startSystem(Phaser.Physics.ARCADE);

map = game.add.tilemap('default');
map.addTilesetImage('tiles', 'tiles');
map.setCollision([41, 42, 43,
				  49, 50, 51,
				  57, 58, 59,
				  55, 56,
				  63, 64]);
layer = map.createLayer('layer1');
layer.resizeWorld();
layer.debug = true;

player = game.add.sprite(64, 64, 'runner');
game.physics.enable(player, Phaser.Physics.ARCADE);
game.physics.arcade.gravity.y = 400;
player.body.collideWorldBounds = true;
player.body.maxVelocity.x = 230;
player.body.maxVelocity.y = 300;
game.camera.follow(player);
player.animations.add();

player.body.gravity.y = 200;

soundJump = game.add.audio('jump');

slideEmitter = game.add.emitter(player.x, player.y, 50);
slideEmitter.makeParticles('particle');
slideEmitter.gravity = 200;
slideEmitter.lifespan = 200;
slideEmitter.emitX = 2;

climbingBar = game.add.sprite(game.camera.width - 48, 24, 'particleBar');
climbingBar.fixedToCamera = true;

text = game.add.text(20, 20, 'TEXT');
text.fixedToCamera = true;

cursors = game.input.keyboard.createCursorKeys();
}

function update() {
playerAI(player);
UIUpdate();
text.text = 'climbingUse: ' + Math.floor(climbingUse);
game.debug.body(player);
}

function playerAI(player) {
game.physics.arcade.collide(player, layer);
stickEmitter(player, slideEmitter);

// X-Velocity on the ground
if (player.body.blocked.down) {
player.body.velocity.x = 0;
climbingUse += climbingRegen;
}

// Jump mechanics
if (cursors.up.isDown) {

// Climbing mechanics
if (player.body.blocked.right || player.body.blocked.left) {
climbingUse -= 2 + climbingRegen;
if ((cursors.left.isDown || cursors.right.isDown) && climbingUse > 0) {
player.body.velocity.y = -180;
}
}

if (player.body.blocked.down){
player.body.velocity.y = -240;
}

}

// Accelerated fall
if(cursors.down.isDown) {
player.body.velocity.y = 400;
}

// X-movement
if(cursors.left.isDown) {
if (player.body.blocked.down) {
player.body.velocity.x = -180;
}
else {
player.body.velocity.x += -8;
}
}

if(cursors.right.isDown) {
if (player.body.blocked.down) {
player.body.velocity.x = 180;
}
else {
player.body.velocity.x += 8;
}
}

// WallSlide mechanics
if ( (  (player.body.blocked.left && cursors.left.isDown) 
	 || (player.body.blocked.right && cursors.right.isDown))
	  && player.body.velocity.y > 0) {
player.body.maxVelocity.y = 60;
slideEmitter.on = true;
}
else {
player.body.maxVelocity.y = 400;
slideEmitter.on = false;
}

// Climb ability mechanics
climbingUse = between(0, climbingUse, climbingMax);


}

function UIUpdate() {
climbingBar.alpha = (climbingUse / climbingMax);
}

function stickEmitter(sprite, emitter) {
if (player.body.blocked.left){
emitter.x = sprite.x;
}
else if (player.body.blocked.right){
emitter.x = sprite.x + sprite.body.width;
}
emitter.y = sprite.y + sprite.body.height;
}

function between(a, b, c) {
return Math.max(Math.min(b, c), a);
}

game.state.add('main', main_state);
game.state.start('main');
