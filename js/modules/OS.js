window.OS = function(){
	window.launchpad = new LaunchpadController();
	window.socket = new HASocket();

	let colors = ['yellow','cyan','purple','pink'];

	/*let toysLeft = [
		{ title:"DIVERT POWER", color:'yellow', instance:new PowerDiverter() },
		{ title:"DECODER", color:'pink', instance:new Unscramble() },
		{ title:"SYNTH SIGNAL", color:'pink', instance:new Sequencer() },
		{ title:"VOCAL SIGNAL", color:'blue', instance:new PitchRecorder() },
		{ title:"TRANSLATOR", color:'blue', instance:new BrokenChat() },

	]*/

	function makeTable(w,h,hasInner){

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
	}

	let audio = new AudioContext();
	audio.add('alert','./audio/sfx-alert.mp3',0.5);
	audio.add('alarm','./audio/sfx-alarm.mp3',0.1,true);
	audio.add('boom','./audio/sfx-boom.mp3',0.5);

	function showChapter(n,title){
		$('chapterline').eq(0).text('CHAPTER '+n);
		$('chapterline').eq(1).text(title);

		$('chapter')
		.css({'opacity':0})
		.animate({'opacity':1},1000)
		.delay(3000)
		.animate({'opacity':0},1000);

		audio.play('boom',true);
	}

	function doDamage( whatKind, tiedTo ){

		audio.play('boom',true);
		audio.play('alert',true);
		audio.play('alarm');
		new OSWarning(whatKind).$el.appendTo('alerts');

		if(tiedTo){
			let box = new OSBox( tiedTo.color, tiedTo.name, tiedTo.toy );
			box.$el.appendTo('screen[position="left"]');
		}
		

		$('container')
		.animate({bottom:-10,left:-10},20)
		.animate({bottom:10,left:10},20)
		.animate({bottom:-20,left:-50},20)
		.animate({bottom:-20,left:-10},20)
		.animate({bottom:0,left:0},20);
	}

	let WormHoleSimulator = function(){
		let self = this;

		audio.add('music','./audio/music-wormhole.mp3',0.5,true);

		self.start = function(){

			$(`<video autoplay loop muted>
			  <source src="./video/video-wormhole.mp4" type="video/mp4">
			</video>`).appendTo('bg');

			audio.play('music');

			setTimeout(function(){ doDamage('CIRCUIT<br>DAMAGE', {name:'POWER DIVERTER', color:'yellow', toy:new PowerDiverter( PowerDiverterPuzzles[0] )}) }, 5000);
			

			showChapter(2,'THE WORMHOLE');
		}

		
	}

	let OSWarning = function(text){
		let self = this;
		self.$el = $('<oswarning>').html(text);

	}

	let OSBox = function(color,header,toy){
		
		
		let self = this;
		let w = 14;
		let h = 14;

		let $el = $('<osbox>');
		let $t = makeTable(w,h,true).appendTo($el);

		self.$el = $el;

		let paint = [
			''
		]

		$('<h1>').appendTo($el.find('[c=2][r=0]'));
		
		$(`[r=6][c=${w-1}]`).attr('bordered','vert');
		$(`[r=7][c=${w-1}]`).attr('bordered','vert');

		self.reskin = function(title,color){
			$el.find('[paint]').attr('bg',color);
			$el.find('h1').attr('color',color).text(title);
		}

		self.reskin(header,color);
		self.$toy = $('<toy>').appendTo($el.find('[r=1][c=1]'));

		toy.$el.appendTo(self.$toy);
	}
	
	window.socket.on('circuit_damage',function(params){
		//osRight.toToy('DIVERT POWER',params);
	})

	const WIDTH = 3000;
	setInterval(function(){

		let w = $('body').width();
		if(w<WIDTH){
			let scale = w/WIDTH;
			
			$('container').css('transform','scale('+scale+')');
		} else {
			$('container').css('transform','scale(1)');
		}
	

	},1000);

	
	$('<button>DO WORMHOLE</button>').appendTo('debug').click(function(){
		new WormHoleSimulator().start();
	})

	$('<button>DO CIRCUIT DAMAGE</button>').appendTo('debug').click(function(){
		doDamage('CIRCUIT<br>DAMAGE', { color:'yellow', name:'POWER DIVERTER', toy:new PowerDiverter( PowerDiverterPuzzles[0] ) } );
	})

	$('<button>DO FIRE</button>').appendTo('debug').click(function(){
		doDamage('PLASMA<br>FIRE', { color:'pink', name:'FIRE SUPRESSION', toy:new PowerDiverter( PowerDiverterPuzzles[1] ) } );
	})

	$('<button>DATA FRAGMENTATION</button>').appendTo('debug').click(function(){
		doDamage('DATA<br>FRAGMENTATION', { color:'blue', name:'DEFRAGGLETISER', toy:new Unscramble() } );
	})
}