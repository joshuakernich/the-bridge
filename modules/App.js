$(function(){



	OSWindow = function (h,color) {
		this.$el = $(`<oscategory color=${color}><h1>${h}</h1></oscategory>`).appendTo('[module=audiomash]')
	}

		
	$('[module]').hide();
	$('[module=intro]').show();



	let $dragging;
	let offset;
	let z = 1;

	$('[module=intro]').click(function(){
		$('[module]').hide();
		$('[module=audiomash]').show();
		
		new Sequencer().$el.appendTo( new OSWindow('Digital Sequencer','blue').$el );
		new Fourier().$el.appendTo( new OSWindow('Fourier Analysis').$el );
		new SingStar().$el.appendTo( new OSWindow('Voice Recorder','blue').$el );

		$('oscategory h1').on('mousedown',function(e){
			z++;
			$dragging = $(this).closest('oscategory').css({'z-index':z})


			offset = $dragging.offset();

			offset.left -= e.pageX;
			offset.top -= e.pageY;

		});
	});

	

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