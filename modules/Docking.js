window.Docking = function( ui ){

	let thrustForward = 1/100;
	let thrustRoll = 1/100;
	let speedSpin = 0; // target is -1;
	let totalSpin = 0;
	let progressForward = 0; 
	let maxScale = 6;
	let bThrust = false;
	let dirRoll = 0;

	this.activate = function(){
		$('[module=docking]').show();
	}

	this.step = function( timeStep, timeElapsed ){
		$('stationlayer').css('transform','rotate('+timeElapsed*0.02+'deg)');

		if(bThrust) progressForward += thrustForward*timeStep;
		if(progressForward>100) progressForward = 100;

		let p = progressForward/100;
		let pScaled = p*p;
		let scale = maxScale * pScaled;

		$('station').css('transform','scale('+(1+scale)+')');
		$('reticule.target').css('transform','rotate('+((timeElapsed+totalSpin)*0.02-7)+'deg)');
		$('reticule.target').css('width', (1/6 + (scale/maxScale)*5/6 )*500 );
		$('reticule.target').css('height', (1/6 + (scale/maxScale)*5/6 )*150 );

		speedSpin += thrustRoll*dirRoll;
		totalSpin += speedSpin*timeStep;

		$('world').css('transform','rotate('+totalSpin*0.02+'deg)');
		$('hud p').eq(1).text(((100-progressForward)*10).toFixed(2) + ' m');
		$('hud p').eq(3).text((bThrust?(thrustForward*10000):0) + ' m/s');
		$('hud p').eq(5).text(speedSpin.toFixed(2) + ' m/s');
	}

	this.thrust = function(b){
		bThrust = b;
	}

	this.roll = function(dir){
		dirRoll = dir;
	}
}


