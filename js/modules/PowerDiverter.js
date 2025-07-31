{
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
		'p-thru':{type:'system',dir:0,x:10,y:10, link:'use[*|href="#SYSTEM_THRUSTER_0_Layer0_0_FILL"]:nth-of-type(1)', nLink:1 },

		's-core':{type:'power',dir:0,x:8,y:6},
		's-thru':{type:'system',dir:0,x:10,y:6, link:'use[*|href="#SYSTEM_THRUSTER_0_Layer0_0_FILL"]', nLink:0},
		's-stab':{type:'system',dir:0,x:8,y:1, link:'use[*|href="#WingStabiliser_0_Layer0_0_FILL"]', nLink:0},
		's-shield':{type:'system',dir:0,x:5,y:2, link:'use[*|href="#Shield_0_Layer0_0_FILL"]', nLink:0},

		's-cannon':{type:'system',dir:0,x:2,y:6, link:'use[*|href="#SYSTEM_CANNON_0_Layer0_0_FILL"]', nLink:0},
		'p-cannon':{type:'system',dir:0,x:2,y:10, link:'use[*|href="#SYSTEM_CANNON_0_Layer0_0_FILL"]', nLink:1},

		'r-stab':{type:'system',dir:0,x:12,y:8, link:'use[*|href="#SYSTEM_STABILISER_0_Layer0_0_FILL"]', nLink:0},
		'deflector':{type:'system',dir:0,x:3,y:8, link:'use[*|href="#SYSTEM_DEFLECTOR_0_Layer0_0_FILL"]'},
	}

	window.ShipLayout = [
		'******** *******',
		'******  B*******',
		'**** 9  +*******',
		'***  9 AA+******',
		'**+G+9+AA ******',
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

	//from up, clockwise at 45 degree increments
	window.dirs = [
		{x:0,y:-1},
		{x:1,y:-1},
		{x:1,y:0},
		{x:1,y:1},
		{x:0,y:1},
		{x:-1,y:1},
		{x:-1,y:0},
		{x:-1,y:-1},
	]
 
	// Reverse engineer the structure of the rooms and doors
	// We'll use this to determine if rooms are sealed or not
	window.ShipRooms = {};
	
	for(var y=0; y<ShipLayout.length; y++){
		for(var x=0; x<ShipLayout[y].length; x++){
			let id = ShipLayout[y][x];

			if(id!='*' && id!=' ' && id!='+') {
				//this is a room
				if(!ShipRooms[id]) ShipRooms[id] = {nodes:[],doors:[]};
				ShipRooms[id].nodes.push({x:x,y:y});
			}
		}
	}

	for(var s in SYSTEMS){
		if(SYSTEMS[s].type=='door'){
			SYSTEMS[s].open = false;
			let dirA = dirs[SYSTEMS[s].dir];
			let dirB = dirs[(SYSTEMS[s].dir + 4)%dirs.length];
			let a = ShipLayout[SYSTEMS[s].y + dirA.y]?ShipLayout[SYSTEMS[s].y + dirA.y][SYSTEMS[s].x + dirA.x]:undefined;
			let b = ShipLayout[SYSTEMS[s].y + dirB.y]?ShipLayout[SYSTEMS[s].y + dirB.y][SYSTEMS[s].x + dirB.x]:undefined;
			SYSTEMS[s].rooms = [];

			SYSTEMS[s].isAirlock = (a=='*'||b=='*');

			if(a!='*') ShipRooms[a].doors.push(s); 
			if(b!='*') ShipRooms[b].doors.push(s);

			if(a!='*') SYSTEMS[s].rooms.push(a);
			if(b!='*') SYSTEMS[s].rooms.push(b);
		}
	}



	const ARCHIVE = 
	[
		
		
		{
			x:2,y:2,
			includeDoors:true,
			actors:[
				{type:'fire',x:5,y:8,intensity:50},
			]
		},
		
		{

			x:5,y:5,
			actors:[
				'p-core','p-thru',
				's-core','s-thru',
			],
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

	window.PowerDiversionPuzzles = makePuzzles(
		[
			{
				x:5,y:5,
				actors:[
					{type:'damage',x:8,y:6},
					'p-core','s-thru',{type:'diverter',x:7,y:9,dir:0},
				],
			},
			{
				x:5,y:0,
				actors:[
					{type:'damage',x:8,y:3},
					{type:'diverter',x:5,y:3,dir:0},
					{type:'diverter',x:6,y:3,dir:0},
					's-core',
					's-stab',
				],
			},
			{
				x:5,y:4,
				actors:[
					'p-core',
					's-thru','r-stab',
					{type:'power',dir:2,x:8,y:6},
					{type:'damage',x:8,y:8},
					{type:'damage',x:9,y:6},
					{type:'diverter',x:8,y:4,dir:0},
					{type:'diverter',x:10,y:8,dir:0},
					{type:'diverter',x:6,y:8,dir:0},
				]
			},
			{
				x:1,y:2,
				actors:[
					
					{type:'power',dir:6,x:8,y:10},
					's-core',
					'deflector',
					's-shield',
					{type:'diverter',x:3,y:4,dir:2},
					{type:'diverter',x:4,y:6,dir:0},
					{type:'diverter',x:7,y:9,dir:0},
					{type:'diverter',x:7,y:8,dir:0},
					{type:'diverter',x:5,y:4,dir:6},
					{type:'diverter',x:5,y:10,dir:0},
					{type:'diverter',x:8,y:4,dir:6},
					{type:'damage',x:5,y:3},
				]
			},
			{
				x:4,y:5,
				actors:[
					
					{type:'power',dir:6,x:8,y:10},
					{type:'power',dir:6,x:8,y:6},
					's-thru',
					'p-thru',
				
					{type:'diverter',x:8,y:7,dir:6},
					{type:'diverter',x:8,y:12,dir:7},
					{type:'diverter',x:3,y:12,dir:2},
					{type:'diverter',x:5,y:6,dir:2},
					{type:'diverter',x:8,y:4,dir:3},
					{type:'diverter',x:5,y:8,dir:3},
					{type:'diverter',x:4,y:10,dir:3},

					{type:'diverter',x:7,y:5,dir:4},
					{type:'diverter',x:7,y:7,dir:2},
					
					{type:'damage',x:8,y:8},
					{type:'damage',x:9,y:10},
					{type:'damage',x:9,y:7},
					{type:'damage',x:8,y:11},
				]
			},

		]
	);

	window.FireSuppressionPuzzles = makePuzzles(
		[
			{
				x:0,y:0,
				includeDoors:true,
				actors:[
					{type:'fire',x:5,y:3,intensity:50},
				]
			},
			{
				x:0,y:2,
				includeDoors:true,
				actors:[
					{type:'fire',x:5,y:6,intensity:50},
				]
			},
			{
				x:4,y:2,
				includeDoors:true,
				actors:[
					{type:'fire',x:5,y:3,intensity:50},
					{type:'fire',x:10,y:8,intensity:50},
				]
			},
			{
				x:2,y:5,
				includeDoors:true,
				actors:[

					{type:'fire',x:10,y:8,intensity:50},
					{type:'fire',x:5,y:4,intensity:50},
				]
			},
			{
				x:4,y:6,
				includeDoors:true,
				actors:[
					{type:'fire',x:10,y:6,intensity:50},
					{type:'fire',x:7,y:5,intensity:50},
					{type:'fire',x:3,y:12,intensity:50},
				]
			},
			
		]
	)

	function makePuzzles(MAP){

		let puzzles = [];

		for(var l in MAP){

			puzzles[l] = {
				x:MAP[l].x, 
				y:MAP[l].y, 
				actors:{},
			}

			if(MAP[l].includeDoors){
				for(var s in SYSTEMS){
					if(SYSTEMS[s].type=='door'){
						puzzles[l].actors[s] = SYSTEMS[s];
					}
				}
			}

			for(var a in MAP[l].actors){
				
				let iActor = MAP[l].actors[a];

				if(typeof(iActor) == 'string'){
					puzzles[l].actors[iActor] = SYSTEMS[iActor];
				} else {
					puzzles[l].actors['anon-'+Math.random()] = iActor;
				}
				
			}
		}

		return puzzles;
	}

	
}

window.PowerDiverter = function( nLaunchpad, callbackComplete, nPuzzle, isFirePuzzle ){

	let puzzle = isFirePuzzle?
	FireSuppressionPuzzles[nPuzzle%FireSuppressionPuzzles.length]:
	PowerDiversionPuzzles[nPuzzle%PowerDiversionPuzzles.length];

	let self = this;
	self.$el = $('<power>');

	let $scroller = $('<scroller>').appendTo(self.$el);
	let $msg = $('<msg>').appendTo(self.$el).text('ALL SYSTEMS NOMINAL');

	let W = 950/50;
	let H = 850/50;
	const GRID = 40;
	const UNIT = 'px';

	let $svgMap = $(window.FloorplanSVG).css({width:W*GRID+UNIT,height:H*GRID+UNIT});

	let $floorplan = $('<floorplan>').appendTo($scroller);
	$svgMap.appendTo($floorplan);

	let $svg = $(`
		<svg class='power-network' viewbox="-0.5 -0.5 16 16" width=${16*GRID}${UNIT} height=${16*GRID}${UNIT}>
			<path class="laser" vector-effect="non-scaling-stroke" d=""/>
		</svg>`).appendTo($scroller);

	const S = 100;
	const C = 15;

	const audio = new AudioContext();
	audio.add('blip','./audio/sfx-blip.mp3');
	audio.add('error','./audio/sfx-error.mp3');
	audio.add('correct','./audio/sfx-correct.mp3');
	audio.add('vent','./audio/sfx-vent.mp3', 0.5);
	audio.add('powerup','./audio/sfx-powerup.mp3', 1);
	audio.add('good','./audio/sfx-good.mp3', 1);

	$(`<svg class='power-network power-frame' viewbox="0 0 100 100" width=${8*GRID}${UNIT} height=${8*GRID}${UNIT}>
			<g class="frame-group">
			    <path class="frame" "vector-effect="non-scaling-stroke" d="M${0},${C} L${0},${0} L${C},${0}"/>
			    <path class="frame" "vector-effect="non-scaling-stroke" d="M${S},${C} L${S},${0} L${S-C},${0}"/>
			    <path class="frame" "vector-effect="non-scaling-stroke" d="M${0},${S-C} L${0},${S} L${C},${S}"/>
			    <path class="frame" "vector-effect="non-scaling-stroke" d="M${S},${S-C} L${S},${S} L${S-C},${S}"/>
			 </g>
		</svg>`).appendTo(self.$el);

	function connect(path,dir){

		let tip = path[path.length-1];
		let next = undefined;
		let prev = undefined;
		dir = (dir+4)%dirs.length;

		do{
			dir = (dir+1)%dirs.length;
			next = ShipLayout[tip.y+dirs[dir].y]?ShipLayout[tip.y+dirs[dir].y][tip.x+dirs[dir].x]:undefined;
		}
		while( next != '*')
		
		tip = {x:tip.x + dirs[dir].x, y:tip.y + dirs[dir].y};
		path.push(tip);

		if(tip.x != path[0].x || tip.y != path[0].y ) connect(path,dir);
	}

	let hull = [];
	for(var r=0; r<ShipLayout.length; r++){
		let $r = $('<power-row>').appendTo($scroller);

		for(var c=0; c<ShipLayout[r].length; c++){
			let $c = $('<power-cell>').appendTo($r).attr('x',c).attr('y',r).attr('type',ShipLayout[r][c]==' '?'o':ShipLayout[r][c]);
		}
	}
	
	let nRedraw = 0;
	function redraw(){

		window.launchpad.clear( nLaunchpad );

		if(!model) return;

		renderRipples();

		nRedraw++;
		
		let isAllPowered = true;
		let isFire = false;
		
		let paths = [];

		for(var a in model.actors) model.actors[a].poweredWas =  model.actors[a].powered;
		for(var a in model.actors) model.actors[a].powered = false;

		for(var a in model.actors){
			if(model.actors[a].type=='power'){
				
				let n = 0;
				let path = [];
				let hit = false;
				let anchor = model.actors[a];
				let anchors = [anchor];
				
				do{
					x = anchor.x + dirs[anchor.dir].x*n;
					y = anchor.y + dirs[anchor.dir].y*n;
					path.push({x:x, y:y});
					n++;

					for(var b in model.actors){
						if(anchor != model.actors[b] && model.actors[b].x == x && model.actors[b].y == y){
							
							if(model.actors[b].type=='diverter' && !anchors.includes(model.actors[b])){
								anchor = model.actors[b];
								anchor.powered = true;
								anchors.push(anchor);
								
								n = 0;
							} else {
								hit = true;
								if( model.actors[b].type == 'system' || model.actors[b].type == 'diverter'){
									model.actors[b].powered = true;
									if(!model.actors[b].poweredWas){
										//audio.play('powerup',true);
										audio.play('good',true);
									}
								}
							}
						} else if( !ShipLayout[y] || !ShipLayout[y][x] || ShipLayout[y][x] == '*'){
							
							if(!hit) path.pop();
							hit = true;
						}
					}
					
				}
				while(!hit)

				paths.push(path);
			} 
		}

		

		self.$el.find('power-cell').removeClass('powered');


		let d = '';
		for(var n in paths){
			for(var p in paths[n]){
				d += (p==0?'M':'L') + (paths[n][p].x) + ',' + (paths[n][p].y);
				
				self.$el.find('power-cell[x="'+(paths[n][p].x)+'"][y="'+(paths[n][p].y)+'"]').addClass('powered');

				window.launchpad.setXY( nLaunchpad, paths[n][p].x-model.x,paths[n][p].y-model.y,'purple');
			}
		}

		let countPower = 0;

		let isDoorOpen = {};
		for(var a in model.actors){

			let actor = model.actors[a];
			let idLocation = actor.x + '-' +actor.y;

			let icon = (actor.subtype?actor.subtype:actor.type) + (actor.powered?'-powered':'');
			actor.$el.css('background-image','url(./img/icon/icon-'+icon+'.svg)')

			if( actor.type=='door' && actor.open) actor.$el.css('background-image','url(./img/icon/icon-'+icon+'-open.svg)')

			if( actor.$link ) actor.$link.removeClass('powered');

			if( actor.powered){
				if( actor.$link ) actor.$link.addClass('powered');
				countPower++;
			}

			if( actor.type=='fire') isFire = true;
			if ( actor.type == 'system' && actor.powered == false) isAllPowered = false;


			actor.$el.attr( 'powered', actor.powered );
			actor.$el.css({transform:'rotate('+actor.dir*45+'deg)'});

			let color = (actor.type=='power'||actor.powered)?'blue':'red';
			if(actor.type=='fire' || actor.type=='damage') color = 'yellow';
			
			// doors override fires
			if(actor.type=='door') isDoorOpen[ idLocation ] = actor.open; 
			if( isDoorOpen[ idLocation ] != undefined ) color = isDoorOpen[ idLocation ]?'pink':'blue';
			

			window.launchpad.setXY( nLaunchpad, actor.x-model.x,actor.y-model.y,color);
		}

		$svg.find('.laser').attr('d',d);
		
		if(isAllPowered && !isFire){
			model = undefined;
			self.$el.find('power-actor').off();
			setTimeout(doCompleteLevel,700);
		}

		window.launchpad.commit( nLaunchpad );
	}

	
	let model;

	let n = 120;
	let ripples = [];

	function renderRipples(){
		for(var r in ripples){
			ripples[r].size++;
			
		}
	}

	function doCompleteLevel(){

		audio.play('correct',true);
		dumpLevel();
		self.turnOnOff(false);

		if( callbackComplete ) callbackComplete();
	}

	function dumpLevel(){

		$msg.text('ALL SYSTEMS NOMINAL');

		/*$scroller.css({
			'transform':'scale(0.5)',
			'left':'-200px',
			'top':'-250px',
		})*/

		self.$el.find('power-actor').off();
		self.$el.find('power-actor').remove();

		self.$el.find('power-cell').removeClass('powered');
		$svgMap.find('.active').removeClass('active powered');
		
		$svg.find('.laser').attr('d','');

		window.launchpad.clear( nLaunchpad );
		window.launchpad.commit( nLaunchpad );

		model = undefined;
	}

	function doPuzzle( puzzle ){

		dumpLevel();

		model = {
			//iLevel:iLevel,
			x:puzzle.x,
			y:puzzle.y,
			isRoomSealed:{},
			actors:{},
		};

		for(var r in ShipRooms) model.isRoomSealed[r] = true;
		
		for(var n in puzzle.actors ){
			let source = puzzle.actors[n];
			model.actors[n] = {};
			for(var v in source) model.actors[n][v] = source[v];

			if( model.actors[n].link != undefined ) model.actors[n].$link = $svgMap.find( model.actors[n].link );
			if( model.actors[n].nLink != undefined ) model.actors[n].$link = model.actors[n].$link.eq( model.actors[n].nLink );
		}

		$svg.find('g').attr('transform','translate('+model.x+' '+model.y+')');
		$msg.text(`GRID ${model.x}-${model.y}`);
		
		$scroller.css({
			'transform':'scale(1)',
			'left':-model.x*GRID+UNIT,
			'top':-model.y*GRID+UNIT
		});

		for(var a in model.actors) spawnActor(model.actors[a]);

		audio.play('error',true);

		redraw();
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

			audio.play('blip',true);
			$('power-actor').removeClass('selected');``

			let actor = $(this).data('actor');

			if(actor.type=='door'){
				actor.open = !actor.open;
				if(actor.open && actor.isAirlock) audio.play('vent',true);
			}

			if(actor.type=='diverter' || actor.type=='power'){
				actor.dir = (actor.dir + 1)%dirs.length;
				actor.$el.addClass('selected');
			}

			if(actor.type=='fire'){
				//sadly you can't tap on a fire to put it out any more
				//actor.intensity -= 30;
			}

			redraw();
		})

		if(actor.type=='fire') $el.css('transform','scale('+actor.intensity/100+')')

		actor.$el = $el;
		
		if(actor.$link) actor.$link.addClass('active');
		
	}

	self.untriggerXY = function(x,y){

		if(!model) return;

		for(var a in model.actors){
			if( model.actors[a].type == 'door' && 
				model.actors[a].x-model.x == x && 
				model.actors[a].y-model.y == y) return model.actors[a].$el.click();
		}
	}

	self.triggerXY = function(x,y){

		if(!model) return;

		for(var a in model.actors){
			if( model.actors[a].type != 'system' && 
				model.actors[a].x-model.x == x && 
				model.actors[a].y-model.y == y) return model.actors[a].$el.click();
		}
	}

	function ventAirlock(door){

		for(var r in door.rooms){

			let iRoom = door.rooms[r];

			if(!model.isRoomSealed[iRoom]) continue;
			model.isRoomSealed[iRoom] = false;

			let doors = ShipRooms[iRoom].doors;


			for(var d in doors){

				let iDoor = doors[d];

				if( model.actors[iDoor].open ){
					model.actors[iDoor].isSealed = false;
					ventAirlock(model.actors[iDoor]);
				}

				/*if(door.rooms[r].doors[d].open){
					door.rooms[r].doors[d].isSealed = false;
					ventAirlock(door.rooms[r].doors[d]);
				}*/
			}
		}
	}

	function step(){

		if(!model) return;

		for(var r in model.isRoomSealed) model.isRoomSealed[r] = true; //reset all rooms to sealed
		for(var a in model.actors) if(model.actors[a].type=='door') model.actors[a].isSealed = true; //reset all doors to sealed

		//detect unsealed rooms
		for(var a in model.actors) if(model.actors[a].type=='door' && model.actors[a].open && model.actors[a].isAirlock) ventAirlock(model.actors[a]);

		//spread fires
		for(var a in model.actors) if(model.actors[a].type=='fire') stepFire(model.actors[a]);

		//extinguish fires
		for(var a in model.actors){
			if(model.actors[a].type=='fire'){

				if(model.actors[a].intensity<20){
					model.actors[a].$el.remove();
					delete model.actors[a];
				}
			} 
		}

		redraw(); 
	}

	function stepFire( actorSource ){
		let iRoom = ShipLayout[actorSource.y][actorSource.x];

		let isSealedRoom = ( ShipRooms[iRoom] && model.isRoomSealed[iRoom] )?true:false;
		let isSealedDoor = ( actorSource.door && actorSource.door.isSealed )?true:false;

	
		if(isSealedRoom || isSealedDoor) actorSource.intensity += 5;
		else actorSource.intensity -= 5;

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

			let iSpread = ShipLayout[y][x];

			let actorSpread = undefined;
			let actorFire = undefined;
			for(var b in model.actors){
				if(model.actors[b].x == x && model.actors[b].y == y){
					if(model.actors[b].type=='fire') actorFire = model.actors[b];
					else actorSpread = model.actors[b];
				}
			}
			
			let spreadToOwnRoom = (iRoom==iSpread);
			let spreadIntoDoor = ( actorSpread != undefined && actorSpread.type=='door' && actorSpread.open );
			let spreadOutOfDoor = ( iRoom == '+' && iSpread != ' ' && iSpread != '*');

			if( !actorFire && (spreadIntoDoor || spreadToOwnRoom || spreadOutOfDoor)){
				
				let spread = {type:'fire',x:x,y:y,intensity:20};
				if(spreadIntoDoor) spread.door = actorSpread;
				model.actors['anon-'+Math.random()] = spread;
				spawnActor(spread);

				redraw();
			}

			actorSource.intensity = 90;
		} 
	}

	let interval = undefined;
	self.turnOnOff = function(b,params){
		
		clearInterval(interval)
		if(b){
			//if(params && params.severity) doLevel(params.severity-1);
			interval = setInterval(step,100);
			redraw();
		} else {
			//window.synth.triggerRelease();
		}
	}

	if(puzzle){
		doPuzzle(puzzle);
		self.turnOnOff(true);
	}
	
}