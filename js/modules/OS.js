

window.OS = function(){

	const GRID = 40;
	const WIDTH = 4000;

	window.launchpad = new LaunchpadController();
	window.socket = new HASocket();

	let colors = ['yellow','cyan','purple','pink'];

	let boxes = [undefined,undefined];

	/*let toysLeft = [
		{ title:"DIVERT POWER", color:'yellow', instance:new PowerDiverter() },
		{ title:"DECODER", color:'pink', instance:new Unscramble() },
		{ title:"SYNTH SIGNAL", color:'pink', instance:new Sequencer() },
		{ title:"VOCAL SIGNAL", color:'blue', instance:new PitchRecorder() },
		{ title:"TRANSLATOR", color:'blue', instance:new BrokenChat() },

	]*/

	function OSPanel( c ){
		let self = this;
		self.$el = $(`
			<ospanel>
				<osvert bg=${c}></osvert>		
				<osmiddle>
					<oshorz bg=${c}></oshorz>
					<osinner>
						<osframe border=${c}></osframe>
					</osinner>
					<oshorz bg=${c}></oshorz>
				</osmiddle>	
				<osvert bg=${c}></osvert>			
			</ospanel>
		`);

		self.$inner = self.$el.find('osinner');
	}

	let $container = $(`<oscontainer>
		<osbg>
			<osgradient></osgradient>
		</osbg>
		<osfg>
			<osscreen position='left'></osscreen><osscreen position='center'>
				<osalerts></osalerts>
			</osscreen><osscreen position='right'></osscreen>
		</osfg>
	</oscontainer>`).appendTo('body');


	let $bg = $container.find('osbg');
	let $fg = $container.find('osfg');
	let $alerts = $container.find('osalerts');
	let $left = $container.find('[position="left"]');
	let $right = $container.find('[position="right"]');

	let frame = new OSPanel();
	frame.$el.appendTo($bg).css({position:'absolute', top:'0px', left:'0px', right:'0px', bottom: '0px', margin:GRID })
	1
	let $debug = frame.$inner;
	$debug.css({
		
		'z-index':'1',
	});

	window.launchpad.$el.appendTo($debug);



	/* function makeTable(w,h,hasInner){

		let $t = $('<table>');

		for(var r=0; r<h; r++ ){
			let $tr = $('<tr>').appendTo($t);
			for(let c=0; c<w; c++){
				let $td = $('<td>').appendTo($tr).attr('c',c).attr('r',r);
			}
		}

		//outer corners
		$t.find(`[c=0][r=0]`).attr('corner','tl');
		$t.find(`[c=${w-1}][r=0]`).attr('corner','tr');
		$t.find(`[c=${w-1}][r=${h-1}]`).attr('corner','br');
		$t.find(`[c=0][r=${h-1}]`).attr('corner','bl');

		if(hasInner){
			//inner corners
			$t.find(`[c=1][r=1]`).attr('cornice','tl');
			$t.find(`[c=${w-2}][r=1]`).attr('cornice','tr');
			$t.find(`[c=${w-2}][r=${h-2}]`).attr('cornice','br');
			$t.find(`[c=1][r=${h-2}]`).attr('cornice','bl');

			$t.find(`
			[c=${w-2}][r=1], 
			[c=${w-2}][r=${h-2}],
			[c=1][r=${h-2}]`).attr('paint','true');
		}
		

		$t.find(`[c=0], [r=0], [c=${w-1}], [r=${h-1}],
			[c=1][r=1]`).attr('paint','true');

		return $t;
	}*/

	let audio = new AudioContext();
	audio.add('alert','./audio/sfx-alert.mp3',0.5);
	audio.add('alarm','./audio/sfx-alarm.mp3',0.1,true);
	audio.add('boom','./audio/sfx-boom.mp3',0.5);

	function showChapter(n,title){
		$('chapterline').eq(0).text('CHAPTER '+n);
		$('chapterline').eq(1).text(title);

		$('chapter')
		.css({'opacity':0})
		.animate({'opacity':1},100)
		.delay(3000)
		.animate({'opacity':0},1000);

		audio.play('boom',true);
	}

	let queue = [];

	function doDamage( whatKind, tiedTo ){

		audio.play('boom',true);
		audio.play('alert',true);
		audio.play('alarm');
		let warning = new OSWarning(whatKind);
		warning.$el.appendTo($alerts);

		if(tiedTo){
			tiedTo.warning = warning;
			queue.push(tiedTo);
		}
		
		$($container)
		.animate({bottom:-10,left:-10},20)
		.animate({bottom:10,left:10},20)
		.animate({bottom:-20,left:-50},20)
		.animate({bottom:-20,left:-10},20)
		.animate({bottom:0,left:0},20);

		
		for(var b in boxes) if(!boxes[b]) doNextQueue();
	}

	function doNextQueue(){

		if(!queue.length) return;

		let tiedTo = queue.shift();

		let n = -1;
		for(var b=0; b<boxes.length; b++) if(!boxes[b]) n = b;

		let box = new OSBox( n, tiedTo.type, tiedTo.color, tiedTo.name, tiedTo.toy, tiedTo.params );
		box.$el.css({bottom:-800}).animate({bottom:GRID});
		box.$el.appendTo(n==0?$left:$right);
		box.warning = tiedTo.warning;

		boxes[n] = box;
	}

	function onCompleteBox(n){
		
		if(!boxes[n]) return;

		boxes[n].$el.delay(500).animate({top:800},{ duration:500, complete:function(){ 
			boxes[n].$el.remove(); 
			boxes[n].warning.$el.remove();
			boxes[n] = undefined;

			if( queue.length ){
				doNextQueue();
			} else {
				let isCrisisOver = true;
				for(var b in boxes) if(boxes[b]) isCrisisOver = false;
				if(isCrisisOver) audio.stop('alarm');
			}
		}});
		
	}

	let OSWarning = function(text){
		let self = this;
		self.$el = $('<oswarning>').html(text);
	}

	let n = 1000;
	let OSBox = function(nBox,type,color,header,toy,params){
		
		let self = this;
		let w = 14;
		let h = 14;

		let $el = $('<osbox>');

		let panel = new OSPanel(color);
		panel.$el.appendTo($el);

		//let $t = makeTable(w,h,true).appendTo($el);

		self.$el = $el;

		$('<h1>').appendTo($el.find('[c=2][r=0]'));
		
		/*$(`[r=6][c=${w-1}]`).attr('bordered','vert');
		$(`[r=7][c=${w-1}]`).attr('bordered','vert');

		self.reskin = function(title,color){
			$el.find('[paint]').attr('bg',color);
			$el.find('h1').attr('color',color).text(title);
		}

		self.reskin(header,color);*/
		self.$toy = $('<toy>').appendTo(panel.$inner);

		//janky way of passing params
		if(!params) params = [];

		let instance = new toy(nBox,params[0],params[1],params[2]);
		instance.$el.appendTo(self.$toy);

		instance.callbackComplete = function(){
			sendEvent(n++,'fix_'+type);
			onCompleteBox(nBox);
		}

		self.instance = instance;
	}

	function sendEvent(id,evt){

		window.socket.send({
			"id": id,
			type:'fire_event',
			event_type:evt
		});
	}
	
	



	
	setInterval(function(){

		let w = $('body').width();
		if(w<WIDTH){
			let scale = w/WIDTH;
			
			$($container).css('transform','scale('+scale+')');
		} else {
			$($container).css('transform','scale(1)');
		}
	
	},1000);


	$('<button>RESET EVERYTHING</button>').appendTo('debug').click(reset);
	
	$('<button>INITIATE WORMHOLE</button>').appendTo('debug').click(function(){
		
		audio.add('music','./audio/music-wormhole.mp3',0.5,true);

		$(`<video autoplay loop muted>
		  <source src="./video/video-wormhole.mp4" type="video/mp4">
		</video>`).appendTo('bg');

		setTimeout( function(){ audio.play('music') } );
		setTimeout( function(){ showChapter(2,'THE WORMHOLE'); }, 1000 );
	})

	let N = {circuit:0,fire:0,defrag:0,decrypt:0,melody:0};

	$('<button>CIRCUIT DAMAGE</button>').appendTo($debug).click(doCircuitDamage);
	$('<button>PLASMA FIRE</button>').appendTo($debug).click(doPlasmaFire);
	$('<button>DATA FRAGMENTATION</button>').appendTo($debug).click(doDataFrag);
	$('<button>ENCRYPTED TRANSMISSION</button>').appendTo($debug).click(doEncryptedTransmission);
	$('<button>WHALE SONG</button>').appendTo($debug).click(doMelodyMatch);

	window.socket.on('reset', reset );
	window.socket.on('warn_circuit', doCircuitDamage );
	window.socket.on('warn_fire', doPlasmaFire );
	window.socket.on('warn_fragment', doDataFrag );
	window.socket.on('warn_encrypt', doEncryptedTransmission );
	window.socket.on('warn_whale', doMelodyMatch );
	
	function reset(){
		window.location = window.location;
	}

	function doCircuitDamage(){
		doDamage('CIRCUIT<br>DAMAGE', { type:'circuit', color:'yellow', name:'POWER DIVERTER', toy:PowerDiverter, params:[N.circuit++] } );
	}

	function doPlasmaFire(){
		doDamage('PLASMA<br>FIRE', { type:'fire', color:'pink', name:'FIRE SUPRESSION', toy:PowerDiverter, params:[N.fire++, true] } );
	}

	function doDataFrag(){
		doDamage('DATA<br>FRAGMENTATION', { type:'fragment', color:'blue', name:'DEFRAGGLETISER', toy:Rubix, params:[N.defrag++] } );
	}

	function doEncryptedTransmission(){
		doDamage('ENCRYPTED<br>TRANSMISSION', { type:'encrypt', color:'blue', name:'UNCRYPTONATOR', toy:Unscramble, params:[N.decrypt++] } );
	}

	function doMelodyMatch(){
		doDamage('PHONIC<br>TRANSMISSION', { type:'echo', color:'blue', name:'PHONICULATOR', toy:MelodyMatch, params:[N.melody++] } );
	}

	window.launchpad.listen(function(n,x,y,b){


		if(!boxes[n]) return;

		//ripples.push({x:x,y:y,size:0,color:[255,255,255]});


		if(b) boxes[n].instance.triggerXY(x,y);
		if(!b && boxes[n].instance.untriggerXY )  boxes[n].instance.untriggerXY(x,y);
		
	})
}