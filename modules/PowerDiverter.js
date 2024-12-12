

window.PowerDiverter = function(){

	
	let self = this;

	self.$el = $('<power>');

	

	let $scroller = $('<scroller>').appendTo(self.$el);
	let $msg = $('<msg>').appendTo(self.$el).text('GRID');
	let $svgMap = $('<floorplan>'+window.FloorplanSVG+'</floorplan>').appendTo($scroller);

	

	let $svg = $(`
		<svg class='power-network' viewbox="-0.5 -0.5 16 16" width=800 height=800>
			<path class="laser" vector-effect="non-scaling-stroke" d="M0,0 L7,7"/>
		</svg>`).appendTo($scroller);


	$(`
		<svg class='power-network power-frame' viewbox="-0.5 -0.5 16 16" width=800 height=800>
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
		'******** *******',
		'******  B*******',
		'**** 9  +*******',
		'***  9 AA+******',
		'**+A+9+AA ******',
		'**  3+ 555******',
		'** 333+5557*****',
		'**  3+ 555+*****',
		'** 0+1111+222***',
		'**  4+ 666+*****',
		'** 444+6668*****',
		'**  4+ 666******',
		'**+C+F+DD+******',
		'***  F DD*******',
		'**** F  +*******',
		'******  E*******',
		'******** *******',
	]

	

	const SYSTEMS = {

		'd-s-core':{type:'door',dir:2,x:6,y:6},
		'd-s-pass':{type:'door',dir:0,x:5,y:7},
		'd-s-wing':{type:'door',dir:0,x:5,y:5},
		'd-s-scoo':{type:'door',dir:2,x:4,y:4},
		'd-s-scoo-airl':{type:'door',dir:2,x:2,y:4},
		'd-s-rear':{type:'door',dir:2,x:6,y:4},
		'd-s-rear-airl':{type:'door',dir:2,x:9,y:3},
		'd-s-rear-stab':{type:'door',dir:0,x:8,y:2},
		'd-s-thru-stab':{type:'door',dir:0,x:10,y:7},
		
		'd-brid':{type:'door',dir:2,x:4,y:8},
		'd-tail':{type:'door',dir:2,x:9,y:8},

		'd-p-core':{type:'door',dir:2,x:6,y:10},
		'd-p-pass':{type:'door',dir:0,x:5,y:9},
		'd-p-wing':{type:'door',dir:0,x:5,y:11},
		'd-p-scoo':{type:'door',dir:2,x:4,y:12},
		'd-p-scoo-airl':{type:'door',dir:2,x:2,y:12},
		'd-p-rear':{type:'door',dir:2,x:6,y:12},
		'd-p-rear-airl':{type:'door',dir:2,x:9,y:13},
		'd-p-rear-stab':{type:'door',dir:0,x:8,y:14},
		'd-p-thru-stab':{type:'door',dir:0,x:10,y:9},
		

		'p-core':{type:'power',dir:0,x:8,y:10},
		'p-thru':{type:'system',dir:0,x:10,y:10, $link:$svgMap.find('use[*|href="#SYSTEM_THRUSTER_0_Layer0_0_FILL"]').eq(1)},

		's-core':{type:'power',dir:0,x:8,y:6},
		's-thru':{type:'system',dir:0,x:10,y:6, $link:$svgMap.find('use[*|href="#SYSTEM_THRUSTER_0_Layer0_0_FILL"]').eq(0)},

		's-cannon':{type:'system',dir:0,x:2,y:6, $link:$svgMap.find('use[*|href="#SYSTEM_CANNON_0_Layer0_0_FILL"]').eq(0)},
		'p-cannon':{type:'system',dir:0,x:2,y:10, $link:$svgMap.find('use[*|href="#SYSTEM_CANNON_0_Layer0_0_FILL"]').eq(1)},

		'r-stab':{type:'system',dir:0,x:12,y:8, $link:$svgMap.find('use[*|href="#SYSTEM_STABILISER_0_Layer0_0_FILL"]')},

		's-dive-1':{type:'diverter',x:7,y:7,dir:0},
		'p-dive-1':{type:'diverter',x:7,y:9,dir:0},
		'c-dive':{type:'diverter',x:6,y:8,dir:0},
	}

	// Reverse engineer the structure of the rooms and doors
	// We'll use this to determine if rooms are sealed or not
	const ROOMS = {};
	
	for(var y in map){
		for(var x=0; x<map[y].length; x++){
			let id = map[y][x];

			if(id!='*' && id!=' ' && id!='+') {
				//this is a room
				if(!ROOMS[id]) ROOMS[id] = {nodes:[],doors:[],isSealed:true};
				ROOMS[id].nodes.push({x:x,y:y});
			}
		}
	}

	for(var s in SYSTEMS){
		if(SYSTEMS[s].type=='door'){
			SYSTEMS[s].open = false;
			let dirA = dirs[SYSTEMS[s].dir];
			let dirB = dirs[(SYSTEMS[s].dir + 4)%dirs.length];
			let a = map[SYSTEMS[s].y + dirA.y]?map[SYSTEMS[s].y + dirA.y][SYSTEMS[s].x + dirA.x]:undefined;
			let b = map[SYSTEMS[s].y + dirB.y]?map[SYSTEMS[s].y + dirB.y][SYSTEMS[s].x + dirB.x]:undefined;
			SYSTEMS[s].rooms = [];

			SYSTEMS[s].isAirlock = (a=='*'||b=='*');

			if(a!='*') ROOMS[a].doors.push(SYSTEMS[s]); 
			if(b!='*') ROOMS[b].doors.push(SYSTEMS[s]);

			if(a!='*') SYSTEMS[s].rooms.push(ROOMS[a]);
			if(b!='*') SYSTEMS[s].rooms.push(ROOMS[b]);
		}
	}



	let levels = 
	[
		{
			x:5,y:5,
			actors:[
				'p-core','p-thru',
				's-core','s-thru',
			],
		},
		{
			x:2,y:2,
			includeDoors:true,
			actors:[
				{type:'fire',x:5,y:4,intensity:50},
			]
		},
		{
			x:1,y:5,
			actors:[
				's-cannon','p-cannon',
				'p-core','s-core',
				
			],
		},
		{
			x:5,y:4,
			actors:[
				'p-core','s-core',
				's-thru','r-stab',
				'p-dive-1',
				's-dive-1',
				'c-dive',
				
				
			]
		},
		{
			x:0,y:0,
			actors:[],
		}
	]

	for(var l in levels){
		if( !levels[l].actors ) levels[l].actors = [];

		if(levels[l].includeDoors){
			for(var s in SYSTEMS){
				if(
					SYSTEMS[s].type=='door' && 
					SYSTEMS[s].x >= levels[l].x &&
					SYSTEMS[s].x < levels[l].x+8 && 
					SYSTEMS[s].y >= levels[l].y && 
					SYSTEMS[s].y < levels[l].y+8
					){
					levels[l].actors.push( SYSTEMS[s] )
				}
			}
		}

		for(var a in levels[l].actors) if(SYSTEMS[levels[l].actors[a]]) levels[l].actors[a] = SYSTEMS[levels[l].actors[a]];
	}




	function connect(path,dir){

		let tip = path[path.length-1];
		let next = undefined;
		let prev = undefined;
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
		let $r = $('<power-row>').appendTo($scroller);

		for(var c=0; c<map[r].length; c++){
			let $c = $('<power-cell>').appendTo($r).attr('x',c).attr('y',r).attr('type',map[r][c]==' '?'o':map[r][c]);
		}
	}
	
	let nRedraw = 0;
	let tones = ['C2','D2','E2','F2','G2','A2','C3','D3','E3','F3','G3','A3','C4','D4','E4','F4','G4','A4','C5','D5','E5','F5','G5','A5','C6'];
	function redraw(){

		nRedraw++;
		
		let isAllPowered = true;
		let isFire = false;
		
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
					x = anchor.x + dirs[anchor.dir].x*n;
					y = anchor.y + dirs[anchor.dir].y*n;
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
						} else if( !map[y] || !map[y][x] || map[y][x] == '*'){
							
							if(!hit) path.pop();
							hit = true;
						}
					}
					
				}
				while(!hit)

				paths.push(path);
			} 
		}

		window.launchpad.clear();

		self.$el.find('power-cell').removeClass('powered');


		let d = '';
		for(var n in paths){
			for(var p in paths[n]){
				d += (p==0?'M':'L') + (paths[n][p].x) + ',' + (paths[n][p].y);
				
				self.$el.find('power-cell[x="'+(paths[n][p].x)+'"][y="'+(paths[n][p].y)+'"]').addClass('powered');

				window.launchpad.setXY(paths[n][p].x-level.x,paths[n][p].y-level.y,'purple');
			}
		}

		let countPower = 0;
		for(var a in actors){

			actors[a].$el.attr( 'powered', actors[a].powered );
			actors[a].$el.css({transform:'rotate('+actors[a].dir*45+'deg)'});

			let icon = (actors[a].subtype?actors[a].subtype:actors[a].type) + (actors[a].powered?'-powered':'');
			actors[a].$el.css('background-image','url(./icon-'+icon+'.svg)')

			if(actors[a].type=='door' && actors[a].open) actors[a].$el.css('background-image','url(./icon-'+icon+'-open.svg)')

			if( actors[a].$link ) actors[a].$link.removeClass('powered');

			if(actors[a].powered){
				if( actors[a].$link ) actors[a].$link.addClass('powered');
				countPower++;
			}

			if(actors[a].type=='fire') isFire = true;

			if (actors[a].type == 'system' && actors[a].powered == false) isAllPowered = false;

			let color = (actors[a].type=='power'||actors[a].powered)?'blue':'red';
			if(actors[a].type=='fire') color = 'yellow';
			if(actors[a].type=='door') color = (actors[a].open)?'pink':'blue';

			
			window.launchpad.setXY(actors[a].x-level.x,actors[a].y-level.y,color);
		}

		$svg.find('.laser').attr('d',d);
		
		if(isAllPowered && !isFire){
			$('power-actor').off();
			actorSelected = undefined;
			setTimeout(doNextLevel,700);
		}

		//if(window.synth) window.synth.triggerAttack(tones[countPower+(nRedraw%2)+(isAllPowered?2:0)]);
		//if(isAllPowered) window.synth.triggerAttackRelease(tones[countPower+(nRedraw%2)+4], 0.1, Tone.now()+0.2);
	}

	let iLevel = -1;
	let actorSelected;
	let actors = [];
	let level;

	function doNextLevel(){

		$svgMap.find('.active').removeClass('active powered');

		$('power-actor').remove();

		iLevel++;
		level = levels[iLevel];
		actors = levels[iLevel].actors;

		$svg.find('g').attr('transform','translate('+level.x+' '+level.y+')');

		$msg.text(`GRID ${level.x}-${level.y}`);
		$scroller.css('transform','translate('+(-level.x*50)+'px,'+(-level.y*50)+'px)');

		for(var a in actors) spawnActor(actors[a]);

		redraw()
	}

	function spawnActor(actor){
		let icon = actor.subtype?actor.subtype:actor.type;

		let $el = $('<power-actor>')
		.appendTo(self.$el.find('power-cell[x="'+(actor.x)+'"][y="'+(actor.y)+'"]'))
		.attr('type',actor.type)
		.data('actor',actor)
		.css('background-image','url(icon-'+icon+'.svg)')
		.click(function(e){

			e.preventDefault();

			$('power-actor').removeClass('selected');``

			let actor = $(this).data('actor');

			if(actor.type=='door'){
				actor.open = !actor.open;
			}

			if(actor.type=='diverter' || actor.type=='power'){
				actor.dir = (actor.dir + 1)%dirs.length;
				actorSelected = actor;
				actor.$el.addClass('selected');
			}

			if(actor.type=='fire'){
				actor.intensity -= 30;
			}

			redraw();
		})

		if(actor.type=='fire') $el.css('transform','scale('+actor.intensity/100+')')

		actor.$el = $el;
		
		if(actor.$link) actor.$link.addClass('active');
		
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

	window.launchpad.listen(function(x,y){

		//for(var d in dirs) particles.push({x:x,y:y,dir:d,life:3});
		for(var a in actors) if(actors[a].type != 'system' && actors[a].x-level.x == x && actors[a].y-level.y == y) actors[a].$el.click();
	})

	// TO DO fix venting effecting all rooms
	function ventAirlock(door){

		for(var r in door.rooms){

			if(!door.rooms[r].isSealed) continue;
			door.rooms[r].isSealed = false;

			for(var d in door.rooms[r].doors){
				if(door.rooms[r].doors[d].open){
					door.rooms[r].doors[d].isSealed = false;
					ventAirlock(door.rooms[r].doors[d]);
				}
			}
		}
	}

	function step(){

		for(var r in ROOMS) ROOMS[r].isSealed = true; //reset all rooms to sealed
		for(var a in actors) if(actors[a].type=='door') actors[a].isSealed = true; //reset all doors to sealed

		//detect unsealed rooms
		for(var a in actors) if(actors[a].type=='door' && actors[a].open && actors[a].isAirlock) ventAirlock(actors[a]);

		//spread fires
		for(var a in actors) if(actors[a].type=='fire') stepFire(actors[a]);

		for(var a=0; a<actors.length; a++){

			if(actors[a].type=='fire'){
				stepFire(actors[a]);
				if(actors[a].intensity<20){
					actors[a].$el.remove();
					actors.splice(a,1);
					a--;
				}
			} 
		} 
	}

	function stepFire( actorSource ){
		let iRoom = map[actorSource.y][actorSource.x];

		let isSealedRoom = ROOMS[iRoom] && ROOMS[iRoom].isSealed;
		let isSealedDoor = actorSource.door && actorSource.door.isSealed;

		// TODO put out fires in doorways (somehow)
		// probably adding an isSealed property to the doors as well
		if(isSealedRoom || isSealedDoor) actorSource.intensity += 5;
		else actorSource.intensity--;

		actorSource.$el.css('transform','scale('+actorSource.intensity/100+')');

		if(actorSource.intensity>100){
			
			let iDir = Math.floor(Math.random()*dirs.length);
			
			if(actorSource.door){
				//fire in a door can only spread foward of back
				iDir = actorSource.door.dir;
				if(Math.random()>0.5) iDir = (actorSource.door.dir+4)%dirs.length;
			}

			let dir = dirs[iDir];
			let x = actorSource.x+dir.x;
			let y = actorSource.y+dir.y;

			let iSpread = map[y][x];

			let actorSpread = undefined;
			let actorFire = undefined;
			for(var b in actors){
				if(actors[b].x == x && actors[b].y == y){
					if(actors[b].type=='fire') actorFire = actors[b];
					else actorSpread = actors[b];
				}
			}
			
			let spreadToOwnRoom = (iRoom==iSpread);
			let spreadIntoDoor = ( actorSpread != undefined && actorSpread.type=='door' && actorSpread.open );
			let spreadOutOfDoor = ( iRoom == '+' && iSpread != ' ' && iSpread != '*');

			if( !actorFire && (spreadIntoDoor || spreadToOwnRoom || spreadOutOfDoor)){
				
				let spread = {type:'fire',x:x,y:y,intensity:20};
				if(spreadIntoDoor) spread.door = actorSpread;
				actors.push(spread);
				spawnActor(spread);

				redraw();
			}

			actorSource.intensity = 90;
		} 
	}

	let interval = undefined;
	self.turnOnOff = function(b){
		

		clearInterval(interval)
		if(b){
			interval = setInterval(step,100);
			redraw();
		} else {
			window.synth.triggerRelease();
		}
	}



	
}