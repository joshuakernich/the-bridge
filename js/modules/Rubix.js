window.Rubix = function( nLaunchpad, callbackComplete, nPuzzle ){

	const audio = new AudioContext();
	audio.add('blip','./audio/sfx-blip.mp3');
	audio.add('correct','./audio/sfx-correct.mp3');

	let colors = ['red','orange','yellow','green','blue','pink','purple'];
	colors = ['yellow','pink','green','purple'];
	
	let self = this;
	self.$el = $('<rubix>');

	let isComplete = false;
	let isOn = nPuzzle!=undefined;
	let map = [];

	let grid = 3 + (nPuzzle==undefined?1:nPuzzle)%4; 
	
	for(var y=0; y<grid+1; y++){
		let $r = $('<row>').appendTo(self.$el);
		if(y>0) map[y-1] = [];
		for(var x=0; x<grid+1; x++){	
			let $c = $('<cell>').appendTo($r).attr('x',x-1).attr('y',y-1);
			if(y>0&&x>0) map[y-1][x-1] = x-1;
		}
	}

	function repaint(){

		if(isComplete) return;

		let by = true;
		let bx = true;

		if(isOn) launchpad.clear( nLaunchpad );
		for(var y=0; y<map.length; y++){

			if(isOn){
				launchpad.setXY(nLaunchpad,0,y+1,'blue');
				launchpad.setXY(nLaunchpad,y+1,0,'blue');
			}

			for(var x=0; x<map[y].length; x++){
				let c = colors[map[y][x]%colors.length];
				self.$el.find(`cell[x=${x}][y=${y}]`).attr('bg',c);

				by = by && map[y][x]%colors.length == map[0][x]%colors.length;
				bx = bx && map[y][x]%colors.length == map[y][0]%colors.length;

				if(isOn) launchpad.setXY(nLaunchpad, x+1,y+1,c);
			}
		}

		if(isOn){
			launchpad.setXY(nLaunchpad,0,0,'white');
			launchpad.commit(nLaunchpad);
		}

		if(bx || by && isOn){
			isComplete = true;
			setTimeout(function(){
				audio.play('correct');
				callbackComplete();
				launchpad.clear(nLaunchpad);
				launchpad.commit(nLaunchpad);
			},750);
		}
	}

	//self.$el.find('[type="arrow"]').click(onShuffle);
	self.$el.find('[x=-1]').attr('type','arrow').click(onShuffle);
	self.$el.find('[y=-1]').attr('type','arrow').click(onShuffle);
	self.$el.find('[x=-1][y=-1]').off().attr('type','reset').click(onReset);
	//self.$el.find('[y=-1]]');

	function onShuffle(e){

		audio.play('blip');

		let x = $(this).attr('x');
		let y = $(this).attr('y');

		shuffle(x,y);
		repaint();
	}

	let record = [];
	function shuffle(x,y,bRecord){

		if( x == -1 ){
			map[y].unshift(map[y][map[y].length-1]);
			map[y].pop();
		}

		if( y == -1 ){
			//clone column
			let was = [];
			for( let i=0; i<map.length; i++ ) was[i] = map[i][x];
			//rotate column
			was.unshift(was.pop())
			//rewrite column
			for( let i=0; i<map.length; i++ ) map[i][x] = was[i];
		}

		if(bRecord) record.push([x,y]);
	}

	function shuffleOffset(){
		for(var i=0; i<map.length; i++){
			let n = i;
			while(n-->=0) shuffle(-1,i);
		}
	}

	function shuffleRandom(iterations){

		for(var i=0; i<iterations; i++){
			shuffle(-1,Math.floor(Math.random()*map.length),true);
			shuffle(Math.floor(Math.random()*map.length),-1,true);
		}
	}

	if(nPuzzle != undefined ) shuffleRandom(1);
	let mapReset = [];
	for(var y=0; y<map.length; y++){
		mapReset[y] = [];
		for(var x=0; x<map[y].length; x++) mapReset[y][x] = map[y][x];
	}
	repaint();

	function reverse(){
		
		let move = record.pop();
		
		shuffle(move[0],move[1])
		shuffle(move[0],move[1]);
		repaint();
	}

	function onReset(){
		audio.play('blip');

		for(var y=0; y<map.length; y++){
			for(var x=0; x<map[y].length; x++) map[y][x] = mapReset[y][x];
		}

		repaint();
	}

	
	//self.$el.find('[x=-1][y=-1]').attr('type','reset').click(reset);
	
	self.triggerXY = function(x,y){
		let $c = self.$el.find(`cell[x=${x-1}][y=${y-1}]`);
		if($c.length) $c.click();
	}

	self.turnOnOff = function(b,params){
		isOn = b;

		if(b){
			
		} else {
			
		}
	}
}