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

	OSWindow = function (h,color) {

		let self = this;
		self.$el = $(`<oscategory color=${color}><h1>${h}</h1></oscategory>`).appendTo('[module=audiomash]');

		let $ul;

		self.addLink = function(text,toy){
			if(!$ul) $ul = $('<ul>').appendTo(self.$el);
			$('<li>').appendTo($ul).text(text).click(function(){
				launchToy(toy,color,text);
			})
			return self;
		}

		self.$el.find('h1').on('mousedown',function(e){
			z++;
			$dragging = self.$el.css({'z-index':z})
			offset = $dragging.offset();
			offset.left -= e.pageX;
			offset.top -= e.pageY;
		});
	}

	function launchToy(toy,color,h) {
		if(!toy.$el.parent().length){

			let panel = new OSWindow(h,color);
			//panel.$el.css({position:'absolute',top:Math.random()*500,left:Math.random()*500});
			toy.$el.appendTo( panel.$el );
			
		}
	}
		
	$('[module]').hide();
	$('[module=intro]').show();



	let $dragging;
	let offset;
	let z = 1;

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
		$('[module]').hide();
		$('[module=audiomash]').show();
		
		new OSWindow('Optical Sensors','yellow')
			.addLink('Port',new OpticalSensor('https://i.makeagif.com/media/6-01-2015/nDkCVx.gif'))
			.addLink('Bow',new OpticalSensor('flying-whales.gif'));
		new OSWindow('Audio Analysis','pink')
			.addLink('Fourier Analysis',new Fourier())
		new OSWindow('Transmission','blue')
			.addLink('Digital Sequencer',new Sequencer())
			.addLink('Pitch Recorder',new PitchRecorder())
			.addLink('Signal Looper',new SignalLooper())

		/*new Sequencer().$el.appendTo( new OSWindow('Digital Sequencer','blue').$el );
		new Fourier().$el.appendTo( new OSWindow('Fourier Analysis','pink').$el );
		new PitchRecorder().$el.appendTo( new OSWindow('Pitch Recorder','blue').$el );
		new SignalLooper().$el.appendTo( new OSWindow('Signal Looper','blue').$el );
		new OpticalSensor('flying-whales.gif').$el.appendTo( new OSWindow('Optical Sensor | Port','yellow').$el );
		new OpticalSensor('https://i.makeagif.com/media/6-01-2015/nDkCVx.gif').$el.appendTo( new OSWindow('Optical Sensor | Bow','yellow').$el );
		*/

		
	}

	

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