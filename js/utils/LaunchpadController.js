window.LaunchpadInstance = function(n,callback){

	let colors = {
		red:5,
		orange:9,
		green:21,
		yellow:13,
		blue:37,
		purple:49,
		pink:53,
		gray:1,
		off:0,
		blues:[37,38,39,41,42,43,45,46,47,66,67,79],
		rainbow:[5,13,21,29,37,45,53,61],
	}

	const CLEAR = '#111';

	let self = this;
	self.id = undefined;
	

	let map = [];
	let isX = false;
	let isRotate = true;

	self.$el = $('<launchpadsim>').css({'transform':'rotate(-90deg)'});
	let $name = $('<launchpadname>').appendTo(self.$el).text('no launchpad');
	let $t = $('<table>').appendTo(self.$el);

	for(var i=0; i<8; i++){
		let $tr = $('<tr>').appendTo($t);
		map[i] = [];
		for(var j=0; j<8; j++){
			map[i][j] = 0;
			let $td = $('<td>').appendTo($tr).attr('x',j).attr('y',i).click(onLaunchpadSimulation);
		}
	}

	self.setOutput = function(output){

		self.output = output;
		self.id = output.id;
		isX = output.name.includes("X");

		// enter programmer mode
       	// different message depending on type of device
		if(isX) output.send([240,0,32,41,2,12,0,127,247]);
       	else output.send([240,0,32,41,2,13,14,1,247]);

       	$name.text(output.name);

       	self.clear();
       	self.commit();
	}

	self.setInput = function(input){
		self.id = input.id;
		self.input = input;
		input.onmidimessage = onLaunchpadMessage;

		$name.text(input.name);
	}

	self.clear = function( ){
  		for(var x=0; x<8; x++){
  			for(var y=0; y<8; y++){
  				self.setXYRGBA(x,y,0,0,0,0);
  			}
  		}
	  }

	self.setXYRGBA = function(x,y,r,g,b,a){

		if(isRotate) y = [x, x = 7-y][0]; // fancy code to swap two variables

		map[y][x] = [r,g,b,a];

		/*let id = 81-y*10+x;
		if(self.output) self.output.send([
			240,0,32,41,2,isX?12:13,3,
			3,id,r/2*a,g/2*a,b/2*a,
			247]);*/

		self.$el.find('[x="'+x+'"][y="'+y+'"]').css({'background':`rgba(${r},${g},${b},${a})`});
		self.$el.attr('dirty','true');
	}

	function onLaunchpadSimulation(){

		let $td = $(this);
		let x = parseInt($td.attr('x'));
		let y = parseInt($td.attr('y'));

		let id = 81-y*10+x;
		onLaunchpadMessage({data:[144,id,5]})
	}

	// top row is 91-99
	// bottom row is 11-19
	let alpha = 'ABCDEFGHI';
	function toCoord(d){

		let n = d[1];

		let x = n%10 - 1;
		let y = 8 - Math.floor(n/10);

		if(y==-1) return ''+x;
		if(x==8) return alpha[y];

		if(isRotate) y = [7-x, x = y][0];
		
		return {x:x,y:y};
	}

	function onLaunchpadMessage(msg){


	  	let d = msg.data;

	  	//strange combo that signifies a "touchstart" on Launchpad X
	  	let bDown = d[0]==144 && d[2] > 0;
	  	//strange combo that signifies a "touchend" on Launchpad X
	  	let bUp = d[0]==144 && d[2] == 0;

	  	if(bUp || bDown){
	  		let coord = toCoord(d);
	  		callback( n,coord.x,coord.y,bDown );
	  		
	  	}
	  }

	 self.clear();
	 
	 self.commit = function(){
	 	for(var x=0; x<8; x++){
  			for(var y=0; y<8; y++){
  				let cell = map[y][x];
  				commitXYRGBA(x,y,cell[0],cell[1],cell[2],cell[3]);
  			}
  		}
  		self.$el.attr('dirty','false');
	 }

	 function commitXYRGBA(x,y,r,g,b,a){
	 	let id = 81-y*10+x;
		if(self.output) self.output.send([
			240,0,32,41,2,isX?12:13,3,
			3,id,r/2*a,g/2*a,b/2*a,
			247]);
	 }
}

window.LaunchpadController = function(){

	const COUNT = 2;

	let self = this;
	self.$el = $('<div>');

	let launchpads = [];
	while(launchpads.length < COUNT){
		let l = new LaunchpadInstance( launchpads.length, onLaunchpadMessage );
		l.$el.appendTo(self.$el);
		launchpads.push( l );
	}

	const RGB = {
		yellow:[255, 255, 0],
		green:[0, 255, 0],
		blue:[0, 127, 255],
		cyan:[0, 255, 255],
		purple:[127, 0, 255],
		pink:[255, 0, 127],
		red:[255, 0, 127],
		white:[255, 255, 255],
		gray:[0, 0, 0],
		off:[0, 0, 0],
		'0':[0, 0, 0],
	}

	let listeners = [];
	

	let hex = {
		red:'red',
		orange:'orange',
		green:'limegreen',
		yellow:'yellow',
		blue:'cyan',
		purple:'magenta',
		pink:'pink',
		gray:'gray',
		off:'rgba(255,255,255,0.1)',

	}
	
	navigator.requestMIDIAccess({sysex:true}).then(onMIDISuccess, onMIDIFailure);

	function onMIDIFailure(midiAccess) {
		console.log(midiAccess);
	}

	let midiAccess;
	function onMIDISuccess(access,b) {

		midiAccess = access;
        midiAccess.onstatechange = reviseMidi;
        reviseMidi();
	}

	
	function reviseMidi(e) {

		console.log('reviseMidi',e);
		
		//TODO check if something has been removed

		let nOutput = 0;
		let nInput = 0;

		for (var output of midiAccess.outputs.values()){

			if(output.name.includes("LP") && output.name.includes("MIDI")){
				launchpads[nOutput%launchpads.length].setOutput(output);
				nOutput++;

				console.log('output',output.name, output.id);
			}
		}

        for (var input of midiAccess.inputs.values()){
        	
			if(input.name.includes("LP") && input.name.includes("MIDI")){
				launchpads[nInput%launchpads.length].setInput(input);
				nInput++;

				console.log('input',input.name, input.id);
			}
        }

       
	}

  

  

  /*function toData(coord,color){

  	if(typeof(color)=='string') color = colors[color];

  	if(coord.length==2){
  		let x = parseInt(coord[0]);
  		let y = parseInt(coord[1]);
  		if(isRotate) y = [x, x = y][0]; // fancy code to swap two variables
  		return [144,81-y*10+x,color];
  	} else{
  		let n = alpha.indexOf(coord);
  		if(n == -1) return [144,99-parseInt(coord)*10,color];
  		else return [144,91+n,color];
  	}
  }*/

  function onLaunchpadMessage( n, x, y, bDown ){
  	for(var l in listeners) listeners[l](n,x,y,bDown);
  }

  self.clear = function( n ){
  	launchpads[n].clear();
  }

  self.setXYRGBA = function(n,x,y,r,g,b,a){
  	launchpads[n].setXYRGBA(x,y,r,g,b,a);
  }


  self.setXY = function(n,x,y,colorName,alpha=1){
  	if(x<0 || y<0 || x>=8 || y>=8) return;
  	let rgb = RGB[colorName];
  	launchpads[n].setXYRGBA(x,y,rgb[0],rgb[1],rgb[2],alpha);
  }

  self.commit = function(n){
  	launchpads[n].commit();
  }

  /*self.set = function(coord,color){
  	let d = toData(coord,color);

  	if(isRotate) coord.y = [coord.x, coord.x = 7-coord.y][0]; // fancy code to swap two variables
  	
  	if(d[1]<0||d[1]>99) return; //limits of the Launchpad
  	if(launchpad) launchpad.send(d);
  	self.$el.find('[x="'+coord[0]+'"][y="'+coord[1]+'"]').css({'background':hex[color]});
  }*/

  self.listen = function(fn){
  	listeners.push(fn);
  }
	
}