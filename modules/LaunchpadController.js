window.LaunchpadController = function(){

	let launchpad;
	let self = this;
	let listeners = [];

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

	navigator.requestMIDIAccess({sysex:true}).then(onMIDISuccess, onMIDIFailure);

	function onMIDIFailure(midiAccess) {
		console.log(midiAccess);
	}

	function onMIDISuccess(midiAccess,b) {


		//console.log(midiAccess.outputs.values());
		for (var output of midiAccess.outputs.values()){
			
			if(output.name.includes("Launchpad Mini")){
				launchpad = output;
				//enter programmer mode
       			launchpad.send([240,0,32,41,2,13,14,1,247]);

       			setTimeout(function(){
       				for(var y=0; y<8; y++){
       					for(var x=0; x<8; x++){
       						launchpad.send([144,11+x+y*10,x+y*8]);
       					}
       				}
       			},500);
       			
       				

       			/*let n = 0;
       			 setInterval(function(){

       			 	n++;
       			 	for(var i=11; i<99; i++){
       			 		launchpad.send(
			        		[
			        			144,
			        			i,
			        			colors.rainbow[((i%10)+n)%colors.rainbow.length]
			        		]
			        	);
       			 	}

		        	
		        },50);*/
			}
		}

        for (var input of midiAccess.inputs.values()){
			if(output.name.includes("Launchpad Mini")){
				input.onmidimessage = onLaunchpadMessage;
			}
        }
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
  	
 	return ''+x+''+y;
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
  		for(var l in listeners) listeners[l](coord);
  	}
  }


  self.set = function(coord,color){
  	let d = toData(coord,color);
  	
  	if(d[1]<0||d[1]>99) return; //limits of the Launchpad
  	if(launchpad) launchpad.send(d);
  }

  self.listen = function(fn){
  	listeners.push(fn);
  }
	
}