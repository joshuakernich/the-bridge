window.Undocker = function( nLaunchpad, callbackComplete, nPuzzle ){

	let self = this;
	self.$el = $('<undocker>');

	let W = 950/50 * 0.6;
	let H = 850/50 * 0.6;
	const GRID = 40;
	const UNIT = 'px';

	let $floorplan = $('<floorplan>').appendTo(self.$el);

	let $svgMap = $(window.FloorplanSVG).css({width:W*GRID+UNIT,height:H*GRID+UNIT});
	$svgMap.appendTo($floorplan);

	const DOCKERS = [
		{x:0,y:1},
		{x:7,y:1},
		{x:7,y:6},
		{x:0,y:6},
	]

	const audio = new AudioContext();
	audio.add('blip','./audio/sfx-blip.mp3');
	audio.add('correct','./audio/sfx-correct.mp3');

	for(var i=0; i<4; i++){
		$('<clamp>').appendTo(self.$el).css({
			left: (DOCKERS[i].x + 0.5) *  GRID + 'px',
			top: (DOCKERS[i].y + 0.5) *  GRID + 'px',
			transform: 'rotate('+i*90+'deg)'
		}).click(onClamp).attr('x',DOCKERS[i].x).attr('y',DOCKERS[i].y);

		if( nPuzzle != undefined ) launchpad.setXY(nLaunchpad,DOCKERS[i].x,DOCKERS[i].y,'red');
	}

	if( nPuzzle != undefined ) launchpad.commit(nLaunchpad);

	function onClamp(){
		$(this).toggleClass('open');
		let bOpen = $(this).hasClass('open');
		audio.play('blip');

		let x = $(this).attr('x');
		let y = $(this).attr('y');
		launchpad.setXY(nLaunchpad,x,y,bOpen?'blue':'red');
		launchpad.commit(nLaunchpad);

		let isAllOpen = self.$el.find('clamp:not(.open)').length == 0;
		if(isAllOpen){
			self.$el.find('clamp').off();
			setTimeout(function(){
				audio.play('correct');
				launchpad.clear(nLaunchpad);
				launchpad.commit(nLaunchpad);
				callbackComplete();
			},500);
		}
	}

	self.triggerXY = function(x,y) {
		
		self.$el.find('[x='+x+'][y='+y+']').click();
	}

}