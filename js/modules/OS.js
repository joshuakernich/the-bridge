

window.OS = function(){

	window.setupTone = async function(){
		await Tone.start()

		window.meter = new Tone.Meter();
		window.mic = new Tone.UserMedia().connect(meter);
		window.sampleRate = Tone.getContext().sampleRate;
		window.waveform = new Tone.Waveform();
		
		mic.open().then(() => {
			console.log("mic open");
			window.mic.connect(meter).connect(waveform);
		}).catch(e => {
			console.log("mic not open",e);
		});
	}

	window.setupTone();

	const GRID = 40;
	const WIDTH = 4000;

	window.launchpad = new LaunchpadController();
	window.socket = new HASocket();

	let colors = ['yellow','cyan','purple','pink'];

	let boxes = [undefined,undefined];

	function OSPanel( c, label ){
		let self = this;
		self.$el = $(`
			<ospanel>
				<osvert>
					<ossegment bg=${c}></ossegment>
					<ossegment bg=${c} style="opacity:0.8; margin: var(--border) 0px var(--border)"></ossegment>
					<ossegment bg=${c}></ossegment>
				</osvert>		
				<osmiddle>
					<oshorz padded size=${label?'thicc':'thin'} bg=${c}>
						${label?`<osh color=${c}>${label}</osh>`:``}
					</oshorz>
					<osinner>
						<osframe border=${c}></osframe>
					</osinner>
					<oshorz>
						<ossegment bg=${c}></ossegment>
						<ossegment></ossegment>
						<ossegment bg=${c}></ossegment>
					</oshorz>
				</osmiddle>	
				<osvert>
					<ossegment bg=${c}></ossegment>
					<ossegment bg=${c} style="opacity:0.8; margin: var(--border) 0px var(--border)"></ossegment>
					<ossegment bg=${c}></ossegment>
				</osvert>			
			</ospanel>
		`);

		self.$inner = self.$el.find('osinner');

		self.reskin = function(c){
			self.$el.find('[bg]').attr('bg',c);
			self.$el.find('[border]').attr('border',c);
		}

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
	let $center = $container.find('[position="center"]');
	let $left = $container.find('[position="left"]');
	let $right = $container.find('[position="right"]');

	let frame = new OSPanel( );
	frame.$el.appendTo($bg).css({position:'absolute', top:'0px', left:'0px', right:'0px', bottom: '0px', margin:GRID });
	
	
	let $debug = $('<debug>').appendTo("body");
	

	window.launchpad.$el.appendTo($debug);

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
		//audio.play('alarm');
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

		frame.reskin('red');

		
		for(var b in boxes) if(!boxes[b]) doNextQueue();
	}

	function getOpenSlot(){
		for(var b=0; b<boxes.length; b++) if(!boxes[b]) return b;
		return -1;
	}

	function doNextQueue(){

		if(!queue.length) return;

		let tiedTo = queue.shift();

		let n = getOpenSlot();
		
		console.log(n);

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
				if(isCrisisOver){
					frame.reskin('');
					audio.stop('alarm');
				}
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

		let panel = new OSPanel(color, header);
		panel.$el.appendTo($el);

		self.$el = $el;

		self.$toy = $('<toy>').appendTo(panel.$inner);

		//janky way of passing params
		if(!params) params = [];

		let instance = new toy(nBox,function(){
			sendEvent(n++,'fix_'+type);
			onCompleteBox(nBox);
		},params[0],params[1],params[2]);
		instance.$el.appendTo(self.$toy);

		

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

	//for iterating puzzles
	let N = {};

	function addDebug( type, fn ){
		$(`<button>${type}</button>`).appendTo($debug).click(fn);
		window.socket.on( type, fn );
	}

	function addToy( type, nameIssue, nameResolution, typeToy, color ){
		N[type] = 0;
		//iterate severity on click
		$(`<button>warn_${type}</button>`).appendTo($debug).click(function(){
			doDamage(nameIssue, { 
				type:type, 
				color:color, 
				name:nameResolution, 
				toy:typeToy, 
				params:[N[type]++] } );
		});
		//otherwise capture severity from message
		window.socket.on( 'warn_'+type, function(e){
			doDamage(nameIssue, { 
				type:type, 
				color:color, 
				name:nameResolution, 
				toy:typeToy, 
				params:[e.severity] } );
		} );
	}

	addDebug( 'reset', reset );
	addDebug( 'init', init );
	addDebug( 'msg', doSentence );
	addDebug( 'trans', doTransmission );

	addToy( 'circuit', 'CIRCUIT<br>DAMAGE', 'POWER DIVERTER', PowerDiverter, 'yellow' );
	addToy( 'fire', 'PLASMA<br>FIRE', 'FIRE SUPRESSION', FireSuppression, 'pink' );
	addToy( 'fragment', 'DATA<br>FRAGMENTATION', 'DEFRAGGLETISER', Rubix, 'blue' );
	addToy( 'whale', 'PHONIC<br>TRANSMISSION', 'PHONICULATOR', MelodyMatch, 'blue' );

	function doTransmission(){
		let panel = new OSPanel('blue', 'INCOMING TRANSMISSION');
		panel.$el.appendTo($center);
		panel.$el.css({margin:GRID});
		$('<video src="./video/klingon.mp4" autoplay/>').appendTo(panel.$inner)[0].addEventListener('ended',function(){
			panel.$el.remove();
		},false);
	};
	
	/*$('<button>INITIATE WORMHOLE</button>').appendTo($debug).click(function(){
		
		audio.add('music','./audio/music-wormhole.mp3',0.5,true);

		$(`<video autoplay loop muted>
		  <source src="./video/video-wormhole.mp4" type="video/mp4">
		</video>`).appendTo('bg');

		setTimeout( function(){ audio.play('music') } );
		setTimeout( function(){ showChapter(2,'THE WORMHOLE'); }, 1000 );
	})*/

	
	function reset(){
		window.location = window.location;
	}

	function init(){
		if( !window.meter ) window.setupTone();
	}

	function msg(e){
		let txt = e.text;
		let arr = txt.split(' ');

		let $msg = $('<osmsg>').appendTo($center);

		for(var n=0; n<arr.length; n++){
			$('<osmsgword>').text(arr[n]).appendTo($msg)
			.css({opacity:0,top:50})
			.delay(n*250)
			.animate({opacity:1,top:0})
			.delay(3000)
			.animate({opacity:0,top:-50});
		}

		setTimeout(function(){
			$msg.remove();
		}, 4000 + n*250);
	}

	function doSentence(){
		msg({text:'Song friend home burned. Metal friend flee metal hunter.'})
	}

	window.launchpad.listen(function(n,x,y,b){


		if(!boxes[n]) return;

		//ripples.push({x:x,y:y,size:0,color:[255,255,255]});


		if(b) boxes[n].instance.triggerXY(x,y);
		if(!b && boxes[n].instance.untriggerXY )  boxes[n].instance.untriggerXY(x,y);
		
	})
}