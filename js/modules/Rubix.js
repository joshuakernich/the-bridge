window.Rubix = function(){



	let colors = ['red','orange','yellow','green','blue','pink','purple'];
	colors = ['yellow','green','pink','purple'];
	
	let self = this;
	self.$el = $('<rubix>');

	let map = [];

	let grid = 3; 
	for(var y=0; y<grid+1; y++){
		let $r = $('<row>').appendTo(self.$el);
		if(y>0) map[y-1] = [];
		for(var x=0; x<grid+1; x++){	
			let $c = $('<cell>').appendTo($r).attr('x',x-1).attr('y',y-1);
			if(x!=y && (x==0||y==0)) $c.attr('color','blue');
			if(y>0&&x>0) map[y-1][x-1] = x-1;
		}
	}

	function repaint(){
		launchpad.clear();
		for(var y=0; y<map.length; y++){

			launchpad.setXY(0,y+1,'blue');
			launchpad.setXY(y+1,0,'blue');

			for(var x=0; x<map[y].length; x++){
				self.$el.find(`cell[x=${x}][y=${y}]`).attr('bg',colors[map[y][x]]);
				launchpad.setXY(x+1,y+1,colors[map[y][x]]);
			}
		}


	}

	repaint();

	self.$el.find('[color=blue]').click(onShuffle);
	self.$el.find('[x=-1][color=blue]').text('→');
	self.$el.find('[y=-1][color=blue]').text('↓');

	function onShuffle(e){

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

	shuffleRandom(map.length);
	repaint();

	function reverse(){
		
		let move = record.pop();
		
		shuffle(move[0],move[1])
		shuffle(move[0],move[1]);
		repaint();
	}

	
	//self.$el.find('[x=-1][y=-1]').click(reverse);
	
	self.triggerXY = function(x,y){
		let $c = self.$el.find(`cell[x=${x-1}][y=${y-1}]`);
		if($c.length) $c.click();
	}
}