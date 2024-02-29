$(function(){



	OSWindow = function (h,color) {

		let self = this;
		self.$el = $(`<oscategory color=${color}><h1>${h}</h1></oscategory>`).appendTo('[module=audiomash]');

		let $ul;

		self.addLink = function(text){
			if(!$ul) $ul = $('<ul>').appendTo(self.$el);
			$('<li>').appendTo($ul).text(text);
			return self;
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
			
			// promise resolves when input is available
			console.log("mic open");
			// print the incoming mic levels in decibels
			begin();
			
		}).catch(e => {
			// promise is rejected when the user doesn't have or allow mic access
			console.log("mic not open",e);
		});

		
	});

	function begin(){
		$('[module]').hide();
		$('[module=audiomash]').show();
		
		new OSWindow('Optical Sensors','yellow')
			.addLink('Port')
			.addLink('Bow');
		new OSWindow('Audio Analysis','pink')
			.addLink('Fourier Analysis')
		new OSWindow('Transmission','blue')
			.addLink('Digital Sequencer')
			.addLink('Pitch Recorder')
			.addLink('Signal Looper')

		new Sequencer().$el.appendTo( new OSWindow('Digital Sequencer','blue').$el );
		new Fourier().$el.appendTo( new OSWindow('Fourier Analysis','pink').$el );
		new PitchRecorder().$el.appendTo( new OSWindow('Pitch Recorder','blue').$el );
		new SignalLooper().$el.appendTo( new OSWindow('Signal Looper','blue').$el );

		new OpticalSensor('flying-whales.gif').$el.appendTo( new OSWindow('Optical Sensor | Port','yellow').$el );
		new OpticalSensor('https://i.makeagif.com/media/6-01-2015/nDkCVx.gif').$el.appendTo( new OSWindow('Optical Sensor | Bow','yellow').$el );

		$('oscategory h1').on('mousedown',function(e){
			z++;
			$dragging = $(this).closest('oscategory').css({'z-index':z})


			offset = $dragging.offset();

			offset.left -= e.pageX;
			offset.top -= e.pageY;

		});
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