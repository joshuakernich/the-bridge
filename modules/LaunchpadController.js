window.LaunchpadController = function(){

	let launchpad;
	let self = this;
	let listeners = [];
	let isX = false;
	let isRotate = false;

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

	let map = [];

	self.$el = $('<table class="launchpadsim">');

	for(var i=0; i<8; i++){
		let $tr = $('<tr>').appendTo(self.$el);
		map[i] = [];
		for(var j=0; j<8; j++){
			map[i][j] = 0;
			let $td = $('<td>').appendTo($tr).attr('x',j).attr('y',i);
		}
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

	function reviseMidi() {
		
		launchpad = undefined;
		for (var output of midiAccess.outputs.values()){
			
			if(output.name.includes("Launchpad")){

				isX = output.name.includes("X");
				//isRotate = isX;

				launchpad = output;
				
				// enter programmer mode
       			// different message depending on type of device

       			if(isX) launchpad.send([240,0,32,41,2,12,0,127,247]);
       			else launchpad.send([240,0,32,41,2,13,14,1,247]);
       			
       			
			}
		}

        for (var input of midiAccess.inputs.values()){
			if(output.name.includes("Launchpad")){
				input.onmidimessage = onLaunchpadMessage;
			}
        }

        $('midi-message').text(launchpad?launchpad.name:'no launchpad');
	}

  let alpha = 'ABCDEFGHI';

  // top row is 91-99
  // bottom row is 11-19

  function toCoord(d){

  	let n = d[1];

  	let x = n%10 - 1;
  	let y = 8 - Math.floor(n/10);

  	if(y==-1) return ''+x;
  	if(x==8) return alpha[y];

  	if(isRotate) [x, y] = [y, x];
  	
 	return {x:x,y:y};
  }

  function toData(coord,color){

  	if(typeof(color)=='string') color = colors[color];

  	if(coord.length==2){
  		let x = parseInt(coord[0]);
  		let y = parseInt(coord[1]);
  		return [144,81-y*10+x,color];
  	} else{
  		let n = alpha.indexOf(coord);
  		if(n == -1) return [144,99-parseInt(coord)*10,color];
  		else return [144,91+n,color];
  	}
  }

  function onLaunchpadMessage(msg){
  	let d = msg.data;

  	let bTrigger = d[2] > 0;

  	if(bTrigger){
  		let coord = toCoord(d);
  		for(var l in listeners) listeners[l](coord.x,coord.y);
  	}
  }

  self.clear = function(){
  	if(launchpad){
  		for(var x=0; x<8; x++){
  			for(var y=0; y<8; y++){
  				self.setXY(x,y,colors['off'])
  			}
  		}
  	}
  }

  self.setXYRGBA = function(x,y,r,g,b,a){

  	map[y][x] = [r,g,b,a];

  	let id = 81-y*10+x;
  	if(launchpad) launchpad.send([
  		240,0,32,41,2,isX?12:13,3,
  		3,id,r*a,g*a,b*a,
  		247]);

  	self.$el.find('[x="'+x+'"][y="'+y+'"]').css({'background':`rgba(${r},${g},${b},${a}})`});
  }


  self.setXY = function(x,y,color){
  	map[y][x] = color;

  	if(typeof(color)=='string') color = colors[color];

  	let id = 81-y*10+x;
  	if(launchpad) launchpad.send([144,id,color]);

  	
  	self.$el.find('[x="'+x+'"][y="'+y+'"]').css({'background':hex[color]});
  }

  self.set = function(coord,color){
  	let d = toData(coord,color);
  	
  	if(d[1]<0||d[1]>99) return; //limits of the Launchpad
  	if(launchpad) launchpad.send(d);

  	console.log(coord,'[x="'+coord[0]+'"][y="'+coord[1]+'"]',self.$el.find('[x="'+coord[0]+'"][y="'+coord[1]+'"]'));
  	self.$el.find('[x="'+coord[0]+'"][y="'+coord[1]+'"]').css({'background':hex[color]});
  }

  self.listen = function(fn){
  	listeners.push(fn);
  }
	
}