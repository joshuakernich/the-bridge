window.LaunchpadController = function(){

	let launchpad;
	let self = this;
	let listeners = [];

	let colors = {
		red:15,
		orange:63,
		green:60,
		yellow:62,
		gray:29,
		off:12,
	}

	navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

	function onMIDIFailure(midiAccess) {
		console.log(midiAccess);
	}

	function onMIDISuccess(midiAccess) {

		console.log(midiAccess);
		for (var output of midiAccess.outputs.values()){
			if(output.name == "Launchpad Mini"){
				launchpad = output;
			}
		}

        for (var input of midiAccess.inputs.values()){
			if(input.name == "Launchpad Mini"){
				input.onmidimessage = onLaunchpadMessage;
			}
        }
  }

  let alpha = 'ABCDEFGH';

  function toCoord(d){

  	if(d[0]==176) return ''+d[1]-104+1;
  	
  	let n = d[1];
  	let r = Math.floor(n/16);
  	let c = n-r*16;

  	if(c==8) return alpha[r];
  
 	return ''+c+''+r;
  }

  function toData(coord,color){
  	if(coord.length==2){
  		let r = parseInt(coord[0]);
  		let c = parseInt(coord[1]);
  		return [144,c*16+r,colors[color]];
  	} else{
  		let n = alpha.indexOf(coord);

  		if(n == -1) return [176,103+parseInt(coord),colors[color]];
  		else return [144,8+n*16,colors[color]];
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
  	if(launchpad) launchpad.send(d);
  }

  self.listen = function(fn){
  	listeners.push(fn);
  }
	
}