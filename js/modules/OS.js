


window.sendEvent = function(evt){
	window.socket.send({
		type:'fire_event',
		event_type:evt
	});
}

window.OSType = function(text){
	const audio = new AudioContext();
	audio.add('type','./audio/sfx-type.mp3', 1);

	let self = this;
	self.$el = $('<span>');

	let n = 0;
	let int = setInterval(function(){
		n++;
		self.$el.text(text.substr(0,n));
		audio.play('type',true);
		if(n>=text.length) clearInterval(int);
	},50)
}

window.OSPanel = function( c, label ){

	const DEFAULTCOLOR = 'yellow';

	let self = this;
	self.$el = $(`
		<ospanel>
			<osvert>
				<ossegment bg=${c}></ossegment>
				<ossegment bg=${c} style="opacity:0.8; margin: var(--border) 0px var(--border)"></ossegment>
				<ossegment bg=${c}></ossegment>
			</osvert>		
			<osmiddle>
				<oshorz>
					<ossegment bg=${c}></ossegment>
					<ossegment bg=${c} style="opacity:0.8; margin: 0px var(--border)"></ossegment>
					<ossegment bg=${c}></ossegment>
				</oshorz>
				<osinner>
					<osframe border=${c}></osframe>
				</osinner>
				<oshorz>
					<ossegment bg=${c}></ossegment>
					<ossegment>${label?`<osh color=${c=='black'?DEFAULTCOLOR:c}>${label}</osh>`:``}</ossegment>
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

	let $bgs = self.$el.find('[bg]');
	let $colors = self.$el.find('[color]');

	self.$inner = self.$el.find('osinner');

	self.reskin = function(c,label){
		//self.$el.find('ossegment[bg],oshorz[bg]').attr('bg',c);
		//self.$el.find('osframe[border]').attr('border',c);
		//self.$el.find('osh[color]').attr('color',c=='black'?DEFAULTCOLOR:c);
		$bgs.attr('bg',c);
		$colors.attr('color',c=='black'?DEFAULTCOLOR:c);
		if(label) self.$el.find('osh').text(label);
	}
}

window.OSMenu = function(n,list){
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

	let interval = undefined;

	self.setOnOff = function(b){

		clearInterval(interval);

		if( b ) for( var i in list ) for(var x=0; x<8; x++) launchpad.setXY(n,x,i,list[i].color,x==0?0.5:1);
		else launchpad.clear(n);

		launchpad.commit(n);

		if(b) interval = setInterval(function(){ self.setOnOff(b) }, 500);
	}

	self.trigger = function(n) {
		self.$el.find('osmenuitem').eq(n).click();
	}
}

window.OSToast = function(argument) {
	let self = this;
	self.$el = $('<ostoast>');
	
	let panel = new OSPanel('red', undefined);
	panel.$el.appendTo(self.$el);

	let $inner = $('<ostoastinner color=red>').appendTo(panel.$inner);

	$inner.html('TOAST TOAST TOAST TOAST<br>TOAST TOAST TOAST TOAST<br>TOAST TOAST TOAST TOAST');

	self.$el.hide();
}

window.OSBox = function(nBox,color,header,getNextDamageForType){

	const audio = new AudioContext();
	audio.add('blip','./audio/sfx-blip.mp3');

	let self = this;
	let $el = $('<osbox>');
	
	let panel = new OSPanel(color, header);
	panel.$el.appendTo($el);

	let panelGlow = new OSPanel('cyan', undefined);
	panelGlow.$el.prependTo(panel.$el);
	panelGlow.$el.css({
		'position':'absolute',
		'inset':'0px',
		'filter':'blur(20px)',
		'opacity':'0.4',
	})

	panelGlow.$inner.css({
		'background-color':'var(--cyan)',
		'opacity':'0.25',
	});

	let instanceToy = undefined;

	self.$el = $el;

	
	let $inner = $('<osboxinner>').appendTo(panel.$inner);

	const MENU = [
		{type:'docker', 	toy:Undocker,			name:'UNDOCKER', 	color:'yellow'},
		{type:'circuit', 	toy:PowerDiverter,		name:'REPOWER', 	color:'yellow'},
		{type:'fire', 		toy:FireSuppression,	name:'UNFLAMER', 	color:'pink'},
		{type:'fragment', 	toy:Rubix,				name:'DEFRAGGER', 	color:'blue'},
		{type:'whale', 		toy:MelodyMatch,		name:'UPTONER', 	color:'blue'},
	]

	let menu = new OSMenu(nBox, MENU);
	menu.$el.appendTo($inner);
	menu.setOnOff(true);

	menu.callbackSelect = function(n){

		audio.play('blip',true);
		menu.setOnOff(false);

		let selection = MENU[n];
		$inner.attr('mode','toy');

		let damage = getNextDamageForType(selection.type);

		self.retoy(
			selection.type,
			selection.color,
			selection.name,
			selection.toy,
			damage?(damage.params?damage.params:[1]):undefined,
		)

		panel.reskin(selection.color, selection.name);

		if(!damage){
			setTimeout(function(){
				audio.play('blip',true);
				self.reset();
			},2000);

		}

	}

	self.$toy = $('<ostoy>').appendTo($inner);

	self.retoy = function(type,color,header,toy,params){

		self.$toy.empty();

		//janky way of passing params
		if(!params) params = [];

		instanceToy = new toy(nBox,function(){
			sendEvent('fix_'+type);
			self.reset();
		},params[0],params[1],params[2]);
		instanceToy.$el.appendTo(self.$toy);

		if(!params.length){
			let $overlay = $('<osoverlay>').appendTo(self.$toy).attr('color',color);
			new OSType('ALL SYSTEMS NOMINAL').$el.appendTo($overlay);
		}
	}

	self.reset = function(){
		if(instanceToy.turnOnOff) instanceToy.turnOnOff(false);
		$inner.attr('mode','menu');
		panel.reskin(color, header);

		menu.setOnOff(true);

		instanceToy = undefined;
	}

	self.triggerXY = function(x,y){
		if( instanceToy && instanceToy.triggerXY ) instanceToy.triggerXY(x,y);
		else if(menu) menu.trigger(y);
	}

	self.untriggerXY = function(x,y){
		if( instanceToy && instanceToy.untriggerXY ) instanceToy.untriggerXY(x,y);
	}

	self.cancel = function(){
		self.reset();
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
	const WIDTH = 5000;

	window.launchpad = new LaunchpadController();
	window.socket = new HASocket();

	let colors = ['yellow','cyan','purple','pink'];

	let boxes = [undefined,undefined];
	let toasts = [undefined,undefined];

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
	frame.$el.appendTo($bg).css({position:'absolute', inset: '0px', margin:GRID });

	let panelGlow = new OSPanel('cyan', undefined);
	panelGlow.$el.prependTo(frame.$el);
	panelGlow.$el.css({
		'position':'absolute',
		'inset':'0px',
		'filter':'blur(90px)',
		'opacity':'1',
	})

	let $debug = $(`
		<debug>
			<debuglaunchpads></debuglaunchpads>
			<debugevents><h1>OS</h1></debugevents>
			<debugevents><h1>WARN</h1></debugevents>
			<debugevents><h1>CODE</h1></debugevents>
			<debugevents><h1>QUEUE</h1><debugqueue></debugqueue></debugevents>
			
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

	function doScreenShake(){
		audio.play('boom',true);
		//screenshake
		$($container)
		.animate({bottom:-10,left:-10},20)
		.animate({bottom:10,left:10},20)
		.animate({bottom:-20,left:-50},20)
		.animate({bottom:-20,left:-10},20)
		.animate({bottom:0,left:0},20);
	}

	function doDamage( damage ){

		//ouch
		audio.play('alert',true);

		doScreenShake();
		
		queue.push(damage);
		renderQueue();
	}

	function getNextDamageForType(type){
		for(var i in queue){
			console.log(queue[i].type,type);
			if(queue[i].type == type){
				let damage = queue.splice(i,1)[0];
				renderQueue();
				return damage;
			}
		}
		return undefined;
	}

	function renderQueue(){
		let text = '';
		for(var i in queue) text = text + '! '+ queue[i].type + '<br>'
		console.log(queue,text);
		$debug.find('debugqueue').html(text);
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

		boxes[n] = box;
	}

	let OSWarning = function(text){
		let self = this;
		self.$el = $('<debugalert>').html(text);
	}

	let n = 1000;
	

	for(var i=0; i<2; i++){
		let box = new OSBox( i, 'black', i==0?'PORT MATRIX':'STARBOARD MATRIX', getNextDamageForType );
		box.$el.appendTo(i==0?$left:$right);
		boxes[i] = box;
		box.$el.css({bottom:GRID});

		let toast = new OSToast( i, 'red' );
		toast.$el.appendTo(i==0?$left:$right);
		toasts[i] = toast;
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

	function addDebug( type, fn, nColumn=0 ){
		$(`<button>${type}</button>`).appendTo($debug.find('debugevents').eq(nColumn)).click(function(){
			fn();
		});
		window.socket.on( type, fn );
	}

	function addToy( type, nColumn=1 ){
		N[type] = 0;
		//iterate severity on click
		$(`<button>warn_${type}</button>`).appendTo($debug.find('debugevents').eq(nColumn)).click(function(){
			doDamage({ 
				type:type, 
				params:[N[type]++] } );
		});
		//otherwise capture severity from message
		window.socket.on( 'warn_'+type, function(e){
			doDamage({ 
				type:type, 
				params:[e.severity] } );
		} );
	}

	function doToast(){
		frame.$el.find('osvert').eq(0).css({width:'calc( 5 * var(--grid))'}); 
		toasts[0].$el.show();
	}

	addDebug( 'os_reset', reset );
	addDebug( 'os_init_mic', init );
	addDebug( 'os_text', doSentence );
	addDebug( 'os_video', doTransmission );
	addDebug( 'os_toast', doToast );
	addDebug( 'os_cancel', doCancel );

	addToy( 'circuit' );
	addToy( 'fire' );
	addToy( 'fragment' );
	addToy( 'whale' );
	addToy( 'docker' );

	const palette = ['red','yellow','green','blue','purple','cyan','white','black'];
	for(let c in palette) addDebug( 'code_'+palette[c], function(){ doCode(palette[c]) }, 2 );

	function doCode(color){
		doScreenShake();
		frame.reskin(color);
	}

	let $alerts = $('<debugalerts>').appendTo($debug);

	function doTransmission(){
		let panel = new OSPanel('blue', 'INCOMING TRANSMISSION');
		panel.$el.appendTo($center);
		panel.$el.css({margin:GRID});
		$('<video src="./video/klingon.mp4" autoplay/>').appendTo(panel.$inner)[0].addEventListener('ended',function(){
			panel.$el.remove();
		},false);
	};

	function doCancel(n=0){
		console.log(n,boxes,boxes[n]);
		boxes[n].cancel();
	}

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

		if(b) boxes[n].triggerXY(x,y);
		if(!b) boxes[n].untriggerXY(x,y);
	})

	let timeMove = new Date().getTime();
	$(document).on('mousemove',function(){
		timeMove = new Date().getTime();
		$debug.removeAttr('hidden');
	})
}