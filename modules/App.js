$(function(){



	OSWindow = function (h,color) {
		this.$el = $(`<oscategory color=${color}><h1>${h}</h1></oscategory>`).appendTo('[module=audiomash]')
	}

		
	$('[module]').hide();
	$('[module=intro]').show();
	$('[module=intro]').click(function(){
		$('[module]').hide();
		$('[module=audiomash]').show();
		
		new Sequencer().$el.appendTo( new OSWindow('Digital Sequencer','blue').$el );
		new Fourier().$el.appendTo( new OSWindow('Fourier Analysis').$el );
		new SingStar().$el.appendTo( new OSWindow('Voice Recorder','blue').$el );
	});

	//new AudioMash();

	let $dragging;
	let offset;
	$('oscategory').on('mousedown',function(e){
		z++;
		$dragging = $(this).css({'z-index':z})


		offset = $dragging.offset();

		offset.left -= e.pageX;
		offset.top -= e.pageY;

	});

	let z = 1;

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