$(function(){

	window.pulse = new function(){

		let start = new Date().getTime();
		let now = start;
		let elapseWas;
		let elapsedNow;
		let nPulseWas = 0;
		let nPulse = 0;

		let self = this;
		let listeners = [];

		window.requestAnimationFrame(function(){
			now = new Date().getTime();
			elapsedNow = now-start;
			nPulse = Math.floor(elapsedNow/500);
			if(nPulse>nPulseWas) broadcastPulse();
			nPulseWas = nPulse;
		});

		function listen(every,fn){
			listeners.push(fn);
		}

		function broadcastPulse(){
			for(var l in listeners) listeners[l]();
		}
	}



	OSMenu = function (h,color,parent) {

		let self = this;
		self.h = h;
		self.color = color;
		self.$el = $(`<osmenu color=${color}></osmenu>`).appendTo('[module=audiomash]');
		
		if(!parent){
			self.$header = $(`<osheader bg=${color}><oslabel>${h}</oslabel></osheader>`).appendTo(self.$el);
			
		}

		let $inner = $(`<osmenuprimary>`).appendTo(self.$el);

		//if(parent!=undefined) $(`<osli><pip bg=${color}></pip><oslabel bg=${color}>${h}</oslabel></osli>`).appendTo($inner).click(onBack);

		

		self.undrill = function () {
			$inner.show();
		}

		self.setAsContext = function(){
			self.setContext(h,color);
		}

		self.setContext = function (h,color) {
			if(parent) parent.setContext(h,color);
			else{
				self.$header.attr('bg',color);
				self.$header.find('oslabel').text(h);
			}
		} 

		function drill(child){
			child.$el.show();
			$inner.hide();
			child.setAsContext();
		}

		function onBack(){
			if(parent){
				self.$el.hide();
				parent.undrill();
			}
		};

		

		self.addMenu = function (text,color) {
			
			let child = new OSMenu(text,color,self);
			child.$el.appendTo(self.$el).hide();
			

			$(`<osli><pip bg=${color}></pip><oslabel bg=${color}>${text}</oslabel></osli>`).appendTo($inner).click(function(){ drill(child) });
			return child;
		}

		self.addLink = function(text,toy){
			
			$(`<osli><pip bg=${color}></pip><oslabel bg=${color}>${text}</oslabel></osli>`).appendTo($inner).click(function(){
				launchToy(toy,color,text);
			})
			return self;
		}

	}

	OSWindow = function (h,color) {

		let self = this;
		self.$el = $(`<oswindow>
			<osborder bg=${color}></osborder>
			<oscolumn>
				<oswindowheader>
				 	<osh text=${color}>${h}</osh>
				 	<oshafter bg=${color}></oshafter>
				 </oswindowheader>
				<ostoy></ostoy>
			</oscolumn>
			
		</oswindow>`).appendTo('[module=audiomash]');
		let $ul = $('<ul>').appendTo(self.$el);

		self.addLink = function(text,toy){
			$('<li>').appendTo($ul).text(text).click(function(){
				launchToy(toy,color,text);
			})
			return self;
		}

		self.addToy = function(toy){
			self.toy = toy;
			toy.$el.appendTo( self.$el.find('ostoy') );
			if(toy.turnOnOff) toy.turnOnOff(true);
		}

		self.$el.find('h1').on('mousedown',function(e){
			z++;
			$dragging = self.$el.css({'z-index':z})
			offset = $dragging.offset();
			offset.left -= e.pageX;
			offset.top -= e.pageY;
		});

		$('<button type=close>').appendTo(self.$el).on('click',function(){
			self.$el.children().detach();
			self.$el.remove();
			if(self.toy.turnOnOff) self.toy.turnOnOff(false);
		});
	}

	function launchToy(toy,color,h) {

		if(!toy.$el.parent().length){
			let panel = new OSWindow(h,color);
			panel.$el.css({position:'fixed',top:'20%',left:'40%'});
			panel.addToy(toy);
			return panel;
		}


	}
		
	$('[module]').hide();
	$('[module=intro]').show();


	let $dragging;
	let offset;
	let z = 1;
	let isBegun = false;

	$('[module=intro]').click(async function(){



		await Tone.start()

		let meter = new Tone.Meter();
		window.mic = new Tone.UserMedia().connect(meter);

		mic.open().then(() => {
			console.log("mic open");
			begin();
			
		}).catch(e => {
			console.log("mic not open",e);
		});

		

		
	});

	function begin(){

		if(isBegun) return;
		isBegun = true;

		$('[module]').hide();
		$('[module=audiomash]').show();

		window.launchpad = new LaunchpadController();
		window.launchpad.$el.appendTo('body').css({'position':'fixed','right':'20px','bottom':'20px'});

		launchToy(window.launchpad,'pink','Launchpad Sim');

		let menu = new OSMenu('CTE','pink');
		menu.addMenu('Optical Sensors','yellow')
			.addLink('Port',new OpticalSensor('https://i.makeagif.com/media/6-01-2015/nDkCVx.gif'))
			.addLink('Bow',new OpticalSensor('flying-whales.gif'));

		menu.addMenu('Operations','orange')
			.addLink('Power Distribution', new PowerDiverter());

		menu.addMenu('Communications','green')
			.addLink('Frequency Analysis',new Fourier())
			.addLink('Signal Decoder',new Mastermind())
			.addLink('Trasmission Decryption',new Unscramble());

		menu.addMenu('Transmission','blue')
			.addLink('Digital Sequencer',new Sequencer())
			.addLink('Pitch Recorder',new PitchRecorder())
			.addLink('Signal Looper',new SignalLooper());

		/*new OSWindow('Optical Sensors','yellow')
			.addLink('Port',new OpticalSensor('https://i.makeagif.com/media/6-01-2015/nDkCVx.gif'))
			.addLink('Bow',new OpticalSensor('flying-whales.gif'));
		new OSWindow('Operations','orange')
			.addLink('Power Distribution', new PowerDiverter());
		new OSWindow('Communications','pink')
			.addLink('Frequency Analysis',new Fourier())
			.addLink('Signal Decoder',new Mastermind())
			.addLink('Trasmission Decryption',new Unscramble())
		new OSWindow('Transmission','blue')
			.addLink('Digital Sequencer',new Sequencer())
			.addLink('Pitch Recorder',new PitchRecorder())
			.addLink('Signal Looper',new SignalLooper())*/
	}

	launchToy(new Rubix(),'pink','DEFRAG');

	$(document).on('mousemove',function(e){

		
		if($dragging){
			
			$dragging.offset({
				left:e.pageX+offset.left,
				top:e.pageY+offset.top
			});

		}
	});

	$(document).on('mouseup',function(e){
		$dragging = undefined;
	});
});