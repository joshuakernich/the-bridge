window.PowerDiverter = function(){

	return;
	let self = this;

	self.$el = $('<power>');

	const synth = new Tone.Synth().toDestination();
	synth.envelope.attack = 0.05;
	synth.envelope.release = 0.5;
	synth.volume.value = -100;

	const vibrato = new Tone.Vibrato().toDestination();
	synth.connect(vibrato);



	self.turnOnOff = function(b){
		synth.volume.value = b?0:-100;
		if(b) redraw();
	}

	let $svg = $(`
		<svg viewbox="-0.5 -0.5 16 16" width=800 height=800>
			<path class="hull" vector-effect="non-scaling-stroke" d="M0,0 L7,7" />
			<path class="hull" vector-effect="non-scaling-stroke" d="M0,0 L7,7" />
			<path class="laser" vector-effect="non-scaling-stroke" d="M0,0 L7,7"/>
			<g class="frame-group" >
			    <path class="frame" transform="translate(-0.5 -0.5)"vector-effect="non-scaling-stroke" d="M0,0.5 L0,0 L0.5,0 M7.5,0 L8,0 L8,0.5 M 8,7.5 L 8,8 L 7.5,8 M 0,7.5 L 0,8 L 0.5,8"/>
			 </g>
		</svg>`).appendTo(self.$el);

	//from up, clockwise at 45 degree increments
	let dirs = [
		{x:0,y:-1},
		{x:1,y:-1},
		{x:1,y:0},
		{x:1,y:1},
		{x:0,y:1},
		{x:-1,y:1},
		{x:-1,y:0},
		{x:-1,y:-1},
	]

	let map = [
		'    ********    ',
		'   *        *   ',
		'   *        *   ',
		'   *        *   ',
		'    *      *    ',
		' **  *    *  ** ',
		'*  * *    * *  *',
		'*  * *    * *  *',
		'*   *      *   *',
		'*              *',
		'*              *',
		'*   *      *   *',
		'*  * *    * *  *',
		' **  ******  ** ',
		'                ',
	]


	let levels = 
	[
		{
			x:4,y:7,
			actors:[
				{type:'power',dir:0,x:2,y:2},
				{type:'system',subtype:'engine',dir:0,x:2,y:6},
			]
		},
		{
			x:4,y:7,
			actors:[
				{type:'power',dir:0,x:5,y:1},
				{type:'system',subtype:'engine',dir:0,x:5,y:6},
				{type:'power',dir:0,x:6,y:4},
				{type:'system',subtype:'oxygen',dir:0,x:2,y:4},
			],
		},
		{
			x:1,y:7,
			actors:[
				{type:'power',dir:0,x:2,y:2},
				{type:'diverter',x:5,y:2,dir:0},
				{type:'system',subtype:'engine',dir:0,x:5,y:6},
			],
		},
		{
			x:5,y:8,
			actors:[
				{type:'power',dir:0,x:7,y:1},
				{type:'power',dir:0,x:1,y:4},
				{type:'diverter',x:5,y:3,dir:0},
				{type:'diverter',x:1,y:2,dir:0},
				{type:'system',subtype:'engine',dir:0,x:4,y:5},
				{type:'system',subtype:'oxygen',dir:0,x:4,y:2},
			],
		},
		{
			x:3,y:6,
			actors:[
				{type:'power',dir:0,x:0,y:4},
				{type:'damage',dir:0,x:3,y:3},
				{type:'system',subtype:'oxygen',dir:0,x:6,y:2},
				{type:'diverter',x:3,y:1,dir:0},
				{type:'diverter',x:4,y:1,dir:0},
				{type:'diverter',x:7,y:5,dir:0},
				{type:'diverter',x:3,y:5,dir:0},
			],
		},
		{
			x:4,y:6,
			actors:[
				{type:'power',dir:0,x:2,y:0},
				{type:'power',dir:0,x:3,y:1},
				{type:'diverter',x:4,y:0,dir:0},
				{type:'diverter',x:5,y:1,dir:0},
				{type:'diverter',x:2,y:4,dir:0},
				{type:'diverter',x:5,y:3,dir:0},
				{type:'system',subtype:'engine',x:2,y:7},
				{type:'system',subtype:'engine',x:5,y:7},
				{type:'damage',x:2,y:3},
			],
		},
		{
			x:0,y:0,
			actors:[],
		}
	]

	function connect(path,dir){

		let tip = path[path.length-1];
		let next = undefined;
		dir = (dir+4)%dirs.length;


		do{
			dir = (dir+1)%dirs.length;
			next = map[tip.y+dirs[dir].y]?map[tip.y+dirs[dir].y][tip.x+dirs[dir].x]:undefined;
		}
		while( next != '*')

		
		tip = {x:tip.x + dirs[dir].x, y:tip.y + dirs[dir].y};
		path.push(tip);

		if(tip.x != path[0].x || tip.y != path[0].y ) connect(path,dir);
	}

	let hull = [];
	for(var r=0; r<map.length; r++){
		let $r = $('<power-row>').appendTo(self.$el);

		for(var c=0; c<map[r].length; c++){
			let $c = $('<power-cell>').appendTo($r).attr('x',c).attr('y',r).attr('type',map[r][c]);

			if(!hull.length && map[r][c] == '*'){

				hull.push({x:c,y:r});
				connect(hull,4);
			}
		}
	}

	let d = '';
	for(var n in hull){
		d += (n==0?'M':'L') + hull[n].x + ',' + hull[n].y;
	}

	$svg.find('.hull').attr('d',d+'Z');

	

	/*for(var r=0; r<8; r++){
		let $r = $('<power-row>').appendTo(self.$el);
		for(var c=0; c<8; c++){
			let $c = $('<power-cell>').appendTo($r).attr('x',c).attr('y',r);
		}
	}*/

	
	let nRedraw = 0;
	let tones = ['C2','D2','E2','F2','G2','A2','C3','D3','E3','F3','G3','A3','C4','D4','E4','F4','G4','A4','C5','D5','E5','F5','G5','A5','C6'];
	function redraw(){

		nRedraw++;
		
		let isAllPowered = true;
		
		let paths = [];

		for(var a in actors) actors[a].powered = false;

		for(var a in actors){
			if(actors[a].type=='power'){
				
				let n = 0;
				let path = [];
				let hit = false;
				let anchor = actors[a];
				let anchors = [anchor];
				
				do{
					x = anchor.x+dirs[anchor.dir].x*n;
					y = anchor.y+dirs[anchor.dir].y*n;
					path.push({x:x, y:y});
					n++;

					for(var b in actors){
						if(anchor != actors[b] && actors[b].x == x && actors[b].y == y){
							
							if(actors[b].type=='diverter' && !anchors.includes(actors[b])){
								anchor = actors[b];
								anchor.powered = true;
								anchors.push(anchor);
								
								n = 0;
							} else {
								hit = true;
								if( actors[b].type == 'system' || actors[b].type == 'diverter') actors[b].powered = true;
							}
						} else if( !map[level.y+y] || !map[level.y+y][level.x+x] || map[level.y+y][level.x+x] == '*'){
							hit = true;
						}
					}
					
				}
				while(!hit)
				paths.push(path);
			}
		}

		//draw the hull
		/*for(var r=0; r<8; r++){
			for(var c=0; c<8; c++){

				let colour = 'off';
				//if(map[r+level.y] && map[r+level.y][c+level.x] == '*') colour = 'purple';
				window.launchpad.set(''+c+''+r,colour);
			}
		}*/

		let d = '';
		for(var n in paths){
			for(var p in paths[n]){
				d += (p==0?'M':'L') + (level.x + paths[n][p].x) + ',' + (level.y + paths[n][p].y);
				
				if( paths[n][p].x >= 0 && 
					paths[n][p].x < 8 && 
					paths[n][p].y >= 0 && 
					paths[n][p].y < 8 ){
						window.launchpad.set(''+paths[n][p].x+''+paths[n][p].y,'purple');
				}
			}
		}

		

		let countPower = 0;
		for(var a in actors){
			actors[a].$el.attr( 'powered', actors[a].powered );
			actors[a].$el.css({transform:'rotate('+actors[a].dir*45+'deg)'});

			let icon = (actors[a].subtype?actors[a].subtype:actors[a].type) + (actors[a].powered?'-powered':'');
			actors[a].$el.css('background-image','url(icon-'+icon+'.svg)')

			if(actors[a].powered) countPower++;

			if (actors[a].type == 'system' && actors[a].powered == false) isAllPowered = false;

			window.launchpad.set(''+actors[a].x+''+actors[a].y,(actors[a].type=='power'||actors[a].powered)?'blue':'red');
		}



		$svg.find('.laser').attr('d',d);
		
		if(isAllPowered){
			$('power-actor').off();
			actorSelected = undefined;
			setTimeout(doNextLevel,700);
		}

		synth.triggerAttack(tones[countPower+(nRedraw%2)+(isAllPowered?2:0)]);

		//synth.triggerAttackRelease(tones[countPower+(nRedraw%2)+(isAllPowered?2:0)], 0.05);
		if(isAllPowered) synth.triggerAttackRelease(tones[countPower+(nRedraw%2)+4], 0.1, Tone.now()+0.2);
	}

	let iLevel = -1;
	let actorSelected;
	let actors = [];
	let level;
	function doNextLevel(){

		$('power-actor').remove();

		iLevel++;
		level = levels[iLevel];
		actors = levels[iLevel].actors;

		$svg.find('g').attr('transform','translate('+level.x+' '+level.y+')')

		for(var a in actors){

			let icon = actors[a].subtype?actors[a].subtype:actors[a].type;

			let $el = $('<power-actor>')
			.appendTo(self.$el.find('power-cell[x="'+(level.x+actors[a].x)+'"][y="'+(level.y+actors[a].y)+'"]'))
			.attr('type',actors[a].type)
			.data('actor',actors[a])
			.css('background-image','url(icon-'+icon+'.svg)')
			.click(function(e){
				e.preventDefault();

				$('power-actor').removeClass('selected');

				let actor = $(this).data('actor');
				if(actor.type=='diverter' || actor.type=='power'){
					//actor.dir = (actor.dir + 1)%dirs.length;

					actorSelected = actor;
					actor.$el.addClass('selected');
				}
				//redraw();
			})



			
			//let $icon = $('<object data="./icon-'+icon+'.svg" type="image/svg+xml">').appendTo($el);

			actors[a].$el = $el;
			
		}

		redraw()
	}
	
	doNextLevel();

	let keyWas = undefined;
	let cntClick = 0;
	const CLICKS_PER_CLICK = 2;

	$(window).keydown(function(e){

		if (keyWas == e.which) cntClick ++;
		else cntClick = 1;

		keyWas = e.which;
		if(cntClick>=CLICKS_PER_CLICK && actorSelected){

			if(e.which==39) actorSelected.dir = (actorSelected.dir + 1)%dirs.length;
			if(e.which==37) actorSelected.dir = (actorSelected.dir - 1 + dirs.length)%dirs.length;

			redraw();
			keyWas = undefined;
		}
	});

	window.launchpad.listen(function(d){
		let x = parseInt(d[0]);
		let y = parseInt(d[1]);
		for(var d in dirs) particles.push({x:x,y:y,dir:d,life:3});
		for(var a in actors) if(actors[a].type != 'system' && actors[a].x == x && actors[a].y == y) actors[a].$el.click();
	})

	let particles = [];

	let splash = [];
	while(splash.length<64) splash[splash.length] = 0;

	function step(){
		
		for(var s in splash) splash[s] = 0;

		for(var p=0; p<particles.length; p++){
			
			if(particles[p].life <= 0){
				particles.splice(p,1);
				p--;
				continue;
			}

			splash[particles[p].y*8+particles[p].x] = Math.max(splash[particles[p].y*8+particles[p].x],particles[p].life);

			particles[p].x += dirs[particles[p].dir].x;
			particles[p].y += dirs[particles[p].dir].y;
			particles[p].life --;
			

		}



		for(var s=0; s<splash.length; s++) console.log(''+(s%8)+''+(Math.floor(s/8)),splash[s]);
		for(var s=0; s<splash.length; s++) window.launchpad.set(''+(s%8)+''+(Math.floor(s/8)),splash[s]);
	}

	//setInterval(step,150);
}