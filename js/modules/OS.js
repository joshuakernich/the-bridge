window.OSPanel = function( c, label ){
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

	self.reskin = function(c,label){
		self.$el.find('ossegment[bg],oshorz[bg]').attr('bg',c);
		self.$el.find('osframe[border]').attr('border',c);
		self.$el.find('osh[color]').attr('color',c);
		if(label) self.$el.find('osh').text(label);
	}
}

window.OSMenu = function(list){
	let self = this;
	self.$el = $('<osmenu>');

	for(var i in list){
		$('<osmenuitem>')
		.appendTo(self.$el)
		.text(list[i].name)
		.attr('bg',list[i].color)
		.attr('n',i)
		.click(doSelect);
	}

	function doSelect() {
		let n = $(this).attr('n');
		self.callbackSelect(n);
	}
}

window.OSBox = function(nBox,color,header){
	let self = this;
	let w = 14;
	let h = 14;

	let $el = $('<osbox>');

	let panel = new OSPanel(color, header);
	panel.$el.appendTo($el);

	self.$el = $el;

	let $inner = $('<osboxinner>').appendTo(panel.$inner);

	const MENU = [
		{type:'docker', 	toy:Undocker,			name:'UNDOCKER', 	color:'yellow'},
		{type:'circuit', 	toy:PowerDiverter,		name:'REPOWER', 	color:'yellow'},
		{type:'fire', 		toy:FireSuppression,	name:'UNFLAMER', 	color:'pink'},
		{type:'fragment', 	toy:Rubix,				name:'DEFRAGGER', 	color:'blue'},
		{type:'whale', 		toy:MelodyMatch,		name:'UPTONER', 	color:'blue'},
	]

	let menu = new OSMenu(MENU);
	menu.$el.appendTo($inner);
	menu.callbackSelect = function(n){
		let selection = MENU[n];
		$inner.attr('mode','toy');
		self.retoy(
			selection.type,
			selection.color,
			selection.name,
			selection.toy,
		)

		panel.reskin(selection.color, selection.name);

		setTimeout(self.reset,2000);
	}

	self.$toy = $('<ostoy>').appendTo($inner);

	self.retoy = function(type,color,header,toy,params){

		self.$toy.empty();

		//janky way of passing params
		if(!params) params = [];

		let instance = new toy(nBox,function(){
			sendEvent(n++,'fix_'+type);
			onCompleteBox(nBox);
		},params[0],params[1],params[2]);
		instance.$el.appendTo(self.$toy);

		self.instance = instance;
	}

	self.reset = function(){
		$inner.attr('mode','menu');
		panel.reskin(color, header);
	}
}

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
	
	let $center = $container.find('[position="center"]');
	let $left = $container.find('[position="left"]');
	let $right = $container.find('[position="right"]');

	let frame = new OSPanel('black');
	frame.$el.appendTo($bg).css({position:'absolute', top:'0px', left:'0px', right:'0px', bottom: '0px', margin:GRID });
	
	


	let $debug = $(`
		<debug>
			<debuglaunchpads></debuglaunchpads>
			<debugevents></debugevents>
			<debugqueue></debugqueue>
		</debug>
	`).appendTo("body");

	window.launchpad.$el.appendTo($debug.find('debuglaunchpads'));

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
		warning.$el.appendTo($debug.find('debugqueue'));

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

		//frame.reskin('red');


		//doNextQueue();
		
		//for(var b in boxes) if(!boxes[b]) doNextQueue();
	}

	function getOpenSlot(){
		for(var b=0; b<boxes.length; b++) if(!boxes[b]) return b;
		return -1;
	}

	function doNextQueue(){

		if(!queue.length) return;

		let tiedTo = queue.shift();

		//let n = getOpenSlot();

		let n = 0;

		//let box = new OSBox( n, tiedTo.type, tiedTo.color, tiedTo.name, tiedTo.toy, tiedTo.params );
		
		let box = boxes[n];
		box.retoy( tiedTo.type, tiedTo.color, tiedTo.name, tiedTo.toy, tiedTo.params );
		box.$el.css({bottom:-800}).animate({bottom:GRID});
		box.$el.appendTo(n==0?$left:$right);
		box.warning = tiedTo.warning;

		console.log('heree');

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
					frame.reskin('black');
					audio.stop('alarm');
				}
			}
		}});
		
	}

	let OSWarning = function(text){
		let self = this;
		self.$el = $('<debugalert>').html(text);
	}

	let n = 1000;
	

	for(var i=0; i<2; i++){
		let box = new OSBox( i, 'purple', i==0?'PORT MATRIX':'STARBOARD MATRIX' );
		box.$el.appendTo(i==0?$left:$right);
		boxes[i] = box;
		box.$el.css({bottom:GRID});
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

		let timeNow = new Date().getTime();
		let timeElapsed = timeNow - timeMove;
		if(timeElapsed>2000) $debug.attr('hidden','true');
	
	},1000);

	//for iterating puzzles
	let N = {};

	function addDebug( type, fn ){
		$(`<button>${type}</button>`).appendTo($debug.find('debugevents')).click(fn);
		window.socket.on( type, fn );
	}

	function addToy( type, nameIssue, nameResolution, typeToy, color ){
		N[type] = 0;
		//iterate severity on click
		$(`<button>warn_${type}</button>`).appendTo($debug.find('debugevents')).click(function(){
			doDamage(type, { 
				type:type, 
				color:color, 
				name:nameResolution, 
				toy:typeToy, 
				params:[N[type]++] } );
		});
		//otherwise capture severity from message
		window.socket.on( 'warn_'+type, function(e){
			doDamage(type, { 
				type:type, 
				color:color, 
				name:nameResolution, 
				toy:typeToy, 
				params:[e.severity] } );
		} );
	}

	addDebug( 'os_reset', reset );
	addDebug( 'os_init_mic', init );
	addDebug( 'os_text', doSentence );
	addDebug( 'os_video', doTransmission );

	addToy( 'circuit', 'CIRCUIT<br>DAMAGE', 'POWER DIVERTER', PowerDiverter, 'yellow' );
	addToy( 'fire', 'PLASMA<br>FIRE', 'FIRE SUPRESSION', FireSuppression, 'pink' );
	addToy( 'fragment', 'DATA<br>FRAGMENTATION', 'DEFRAGGLETISER', Rubix, 'blue' );
	addToy( 'whale', 'PHONIC<br>TRANSMISSION', 'PHONICULATOR', MelodyMatch, 'blue' );
	addToy( 'docker', 'DOCK<br>LOCKED', 'UNDOCKER', Undocker, 'yellow' );

	let $alerts = $('<debugalerts>').appendTo($debug);

	function doTransmission(){
		let panel = new OSPanel('blue', 'INCOMING TRANSMISSION');
		panel.$el.appendTo($center);
		panel.$el.css({margin:GRID});
		$('<video src="./video/klingon.mp4" autoplay/>').appendTo(panel.$inner)[0].addEventListener('ended',function(){
			panel.$el.remove();
		},false);
	};
	
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

		if(b) boxes[n].instance.triggerXY(x,y);
		if(!b && boxes[n].instance.untriggerXY )  boxes[n].instance.untriggerXY(x,y);
	})

	let timeMove = new Date().getTime();
	$(document).on('mousemove',function(){
		timeMove = new Date().getTime();
		$debug.removeAttr('hidden');
	})
}