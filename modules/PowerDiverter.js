window.PowerDiverter = function(){

	
	let self = this;

	self.$el = $('<power>');




	self.turnOnOff = function(b){
		
		if(b) redraw();
		else window.synth.triggerRelease();
		
	}

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
		'******   *******',
		'****     *******',
		'***      *******',
		'**        ******',
		'**  333555******',
		'** 33335557*****',
		'**  3335557*****',
		'** 0011112222***',
		'**  4446668*****',
		'** 44446668*****',
		'**  444666******',
		'**        ******',
		'***      *******',
		'****     *******',
		'******   *******',
		'******** *******',
	]

	let levels = 
	[
		
		{
			x:5,y:7,
			actors:[
				
				{type:'power',dir:0,x:3,y:3},
				{type:'system',dir:0,x:5,y:3, link:'.thruster-starboard'},
			]
		},
		{
			x:1,y:5,
			actors:[
				{type:'fire',x:4,y:1,intensity:50},
				{type:'power',dir:0,x:7,y:1},
				{type:'power',dir:0,x:7,y:5},
				{type:'system',dir:0,x:1,y:1, link:'.cannon-starboard'},
				{type:'system',dir:0,x:1,y:5, link:'.cannon-port'},
			],
		},
		{
			x:5,y:4,
			actors:[
				{type:'power',dir:0,x:3,y:2},
				{type:'power',dir:0,x:3,y:6},
				{type:'diverter',x:2,y:5,dir:0},
				{type:'diverter',x:1,y:4,dir:0},
				{type:'system',dir:0,x:5,y:2, link:'.thruster-port'},
				{type:'system',dir:0,x:7,y:4, link:'.stabiliser'},
			]
		},
		{
			x:0,y:0,
			actors:[],
		}
	]



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
				d += (p==0?'M':'L') + (level.x + paths[n][p].x) + ',' + (level.y + paths[n][p].y);
				
				self.$el.find('power-cell[x="'+(level.x+paths[n][p].x)+'"][y="'+(level.y+paths[n][p].y)+'"]').addClass('powered');

				if( paths[n][p].x >= 0 && 
					paths[n][p].x < 8 && 
					paths[n][p].y >= 0 && 
					paths[n][p].y < 8 ){
						window.launchpad.setXY(paths[n][p].x,paths[n][p].y,'purple');
				}
			}
		}

		let countPower = 0;
		for(var a in actors){

			actors[a].$el.attr( 'powered', actors[a].powered );
			actors[a].$el.css({transform:'rotate('+actors[a].dir*45+'deg)'});

			let icon = (actors[a].subtype?actors[a].subtype:actors[a].type) + (actors[a].powered?'-powered':'');
			actors[a].$el.css('background-image','url(./icon-'+icon+'.svg)')

			if( actors[a].link ) $svgMap.find(actors[a].link).removeClass('powered');

			if(actors[a].powered){
				if( actors[a].link ) $svgMap.find(actors[a].link).addClass('powered');
				countPower++;
			}

			if (actors[a].type == 'system' && actors[a].powered == false) isAllPowered = false;

			window.launchpad.setXY(actors[a].x,actors[a].y,(actors[a].type=='power'||actors[a].powered)?'blue':'red');
		}



		$svg.find('.laser').attr('d',d);
		
		if(isAllPowered){
			$('power-actor').off();
			actorSelected = undefined;
			setTimeout(doNextLevel,700);
		}

		//if(window.synth) window.synth.triggerAttack(tones[countPower+(nRedraw%2)+(isAllPowered?2:0)]);
		if(isAllPowered) window.synth.triggerAttackRelease(tones[countPower+(nRedraw%2)+4], 0.1, Tone.now()+0.2);
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
		.appendTo(self.$el.find('power-cell[x="'+(level.x+actor.x)+'"][y="'+(level.y+actor.y)+'"]'))
		.attr('type',actor.type)
		.data('actor',actor)
		.css('background-image','url(icon-'+icon+'.svg)')
		.click(function(e){

			e.preventDefault();

			$('power-actor').removeClass('selected');

			let actor = $(this).data('actor');

			if(actor.type=='diverter' || actor.type=='power'){
				actor.dir = (actor.dir + 1)%dirs.length;
				actorSelected = actor;
				actor.$el.addClass('selected');
			}

			if(actor.type=='fire'){
				actor.intensity -= 30;
				
				if(actor.intensity<20){
					actors.splice(actors.indexOf(actor),1);
					actor.$el.remove();
				}
			}

			redraw();
		})

		if(actor.type=='fire') $el.css('transform','scale('+actor.intensity/100+')')

		actor.$el = $el;
		
		if(actor.link) $svgMap.find(actor.link).addClass('active');
		
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

		for(var d in dirs) particles.push({x:x,y:y,dir:d,life:3});
		for(var a in actors) if(actors[a].type != 'system' && actors[a].x == x && actors[a].y == y) actors[a].$el.click();
	})

	function step(){
		for(var a in actors){
			if(actors[a].type=='fire'){
				actors[a].intensity++;
				actors[a].$el.css('transform','scale('+actors[a].intensity/100+')');

				if(actors[a].intensity>100){
					let iRoom = map[actors[a].y+level.y][actors[a].x + level.x];
					let dir = dirs[Math.floor(Math.random()*dirs.length)];
					let iSpread = map[actors[a].y+level.y+dir.y][actors[a].x + level.x+dir.x];
					let x = actors[a].x+dir.x;
					let y = actors[a].y+dir.y;

					let alreadyFire = false;
					for(var b in actors) if(actors[b].x == x && actors[b].y == y) alreadyFire = true;			

					actors[a].intensity = 90;

					if(iRoom==iSpread && !alreadyFire){
						let spread = {type:'fire',x:x,y:y,intensity:20};
						actors.push(spread);
						spawnActor(spread);
						redraw();
					}
				}
			}
		}
	}

	setInterval(step,100);
}