window.WhaleSong = function( ui ){

	
	let parsed = '';

	async function portUp(){
		const port = await navigator.serial.requestPort();
		// Wait for the serial port to open.
		await port.open({ baudRate: 9600 });

		const reader = port.readable.getReader();

		// Listen to data coming from the serial device.
		while (true) {
		  const { value, done } = await reader.read();
		  if (done) {
		    // Allow the serial port to be closed later.
		    reader.releaseLock();
		    break;
		  }
		  // Creating textDecoder instance
			let decoder = new TextDecoder("utf-8");
			  
			// Using decode method to get string output
			let str = decoder.decode(value);


			parsed += str;
			//atCoord(parseInt(str),parseInt(str));

			if(str.indexOf(')') != -1){
		
				let nFrom = parsed.indexOf('(');
				let nTo = parsed.indexOf(')');

				atCoord(parsed.substring(nFrom+1,nTo).split(','));


				parsed = parsed.substr(nTo+1);


				

				//atCoord(parsed.substring(parsed.lastIndexOf('(')+1,parsed.lastIndexOf(')')-1));
			}

			if(!isTriggered){
				synthQuick.triggerAttack(pitchLibrary[n]);
				isTriggered = true;
			}
			  
			// Display the output

			let floored = parseInt(str);

			changeNoteTo(Math.floor(floored/40));
		}
	}

	let timeUpdate = new Date().getTime();
	let isTriggered = false;
	let max = 240+320;
	function atCoord(c){
		//console.log(c);

		const bottom = 100;
		let ix = Math.floor(c[0]/240*8);
		let iy = Math.floor(c[1]/320*3);

		let sum = parseInt(c[0])+parseInt(c[1]);
		
		console.log(sum,max);

		let n = Math.floor(sum/max*pitchLibrary.length);



		if(!isTriggered){
			synthQuick.triggerAttack(pitchLibrary[n]);
			isTriggered = true;
		} else {
			synthQuick.triggerAttack(pitchLibrary[n]);

		}



		

		timeUpdate = new Date().getTime();

	}

	//create a synth and connect it to the main output (your speakers)

	const loop = 8;
	const pitchUp = ['C5','D5','E5','G5','A5','C6','D6','E6'];
	const pitchDown = ['C2','D2','E2','G2','A2','C3','D3','E3'];
	const pitch = ['C3','D3','E3','G3','A3','C4','D4','E4'];

	const pitchLibrary = ['C2','D2','E2','G2','A2','C3','D3','E3','G3','A3','C4','D4','E4','G4','A4','C5','D5','E5','G5'];
	const song = [2,1,0,6,5,4,3]
	const timePerBeat = 0.7;

	const synthQuick = new Tone.Synth().toDestination();
	synthQuick.envelope.attack = 1;
	synthQuick.envelope.release = 1;
	synthQuick.portamento = 0.1;

	const synthWhale = new Tone.Synth().toDestination();
	synthWhale.envelope.attack = 1;
	synthWhale.envelope.release = 1;
	synthWhale.portamento = 0.4;
	synthWhale.volume.value = 0;

	const synthWhaleDown = new Tone.Synth().toDestination();
	synthWhaleDown.envelope.attack = 1;
	synthWhaleDown.envelope.release = 1;
	synthWhaleDown.portamento = 0.4;
	synthWhaleDown.volume.value = 0;

	const synthWhaleUp = new Tone.Synth().toDestination();
	synthWhaleUp.envelope.attack = 1;
	synthWhaleUp.envelope.release = 1;
	synthWhaleUp.portamento = 0.4;
	synthWhaleUp.volume.value = -10;

	
	const synth = new Tone.Synth().toDestination();
	synth.envelope.attack = 0.5;
	synth.envelope.release = 0.8;
	synth.portamento = 0;

	$('[trigger=connect]').click(function(){
		changeNoteTo(0);
		portUp();
	})

	$('[trigger=listen]').click(function(){

		let now = Tone.now();

		for( var s in song ){
			synthWhale.triggerAttackRelease( pitch[song[s]], timePerBeat+0.5, now + timePerBeat*s );
			synthWhaleDown.triggerAttackRelease( pitchDown[song[s]], timePerBeat+0.5, now + timePerBeat*s );
			synthWhaleUp.triggerAttackRelease( pitchUp[song[s]], timePerBeat, now + timePerBeat*s );
		}
	})

	for(var i=0; i<101; i++){
		$('<whaleslice>')
		.appendTo('whale')
		.css('background-position-x',i+'%')
		.css('animation-delay',-i*0.02+'s')
	}


	let map = [];

	for(var i=0; i<loop; i++){

		map[i] = -1;

		for(var n=0; n<loop; n++){
			$('<button>')
			.appendTo('launchpad')
			.attr('n',n)
			.attr('p',i)
			.click(toggle);
		}
		

	}

	function toggle(){
		let n = $(this).attr('n');
		let p = $(this).attr('p');
		let b = !$(this).hasClass('on');

		map[n] = -1;


		$('launchpad button[n='+n+']').removeClass('on');
		if(b){
			$(this).addClass('on');
			map[n] = p;
			//synth.triggerAttackRelease(pitch[p], "8n");
		}
	}

	let noteWas = -1;

	function changeNoteTo(noteIs){

		if(noteIs != noteWas && pitch[noteIs]){
			now = Tone.now();
			noteWas = noteIs;
			console.log(noteIs,pitch[noteIs]);
			synthQuick.triggerAttackRelease(pitch[noteIs], 0.1,now);
		}
	}
	
	this.activate = function(){
		$('[module=whale]').show();
	}

	let nBeatWas = -1;

	this.step = function( timeStep, timeElapsed, timeNow ){
		
		let nBeat = Math.floor(timeElapsed/(timePerBeat*1000))%8;

		if(nBeat != nBeatWas){
			$('launchpad button').removeClass('active');
			$('launchpad button[n='+nBeat+']').addClass('active');

			if(map[nBeat] > -1) synth.triggerAttackRelease(pitch[map[nBeat]], 0.5);

			nBeatWas = nBeat;
		}

		if(isTriggered && timeNow-timeUpdate > 500){
			isTriggered = false;
			synthQuick.triggerRelease();
		}
	}
}


