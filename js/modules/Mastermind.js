window.Mastermind = function(){

	let LENGTH = 5;
	let colors = ['red','orange','yellow','green','blue','pink'];
	let BREADTH = colors.length;
	let guess = [];
	let $r;

	const self = this;
	self.$el = $('<mastermind>');

	let $rows = $('<div>').appendTo(self.$el);

	let $btn = $('<button>GUESS</button>').appendTo(self.$el).click(onGuess);

	while(guess.length<LENGTH) guess[guess.length] = -1;

	let mystery = [];
	while(mystery.length<LENGTH) mystery.push(Math.floor(Math.random()*BREADTH));

	function makeRow(){

		self.$el.find('seq-c').off('mousedown');

		$r = $('<seq-r>').appendTo($rows);
		for(var c = 0; c < LENGTH; c++){
			$('<seq-c>').appendTo($r).attr('c',c).on('mousedown',onCell);
			guess[c] = -1;
		}
	}

	function onCell(){
		let c = $(this).attr('c');
		guess[c] = (guess[c]+1)%BREADTH;

		$r.find('seq-c').each(function(n){
			if( guess[n] == -1 ) $(this).removeAttr('bg');
			else $(this).attr('bg',colors[guess[n]]);
		})
	}

	function onGuess() {

		let feedback = [];
		while(feedback.length<LENGTH) feedback[feedback.length] = 0;

		//how many instance of each colour
		let allocation = [];
		while(allocation.length<BREADTH) allocation[allocation.length] = 0;
		for( var m in mystery ) allocation[mystery[m]] ++;

		//allocate correct first
		for( var g in guess ){
			if(guess[g] == mystery[g]){
			 feedback[g] = 2;
			 allocation[guess[g]] --;
			}
		}

		//allocate remaining
		for( var g in guess ){
			let isCorrect = guess[g] == mystery[g];
			let isSomewhere = mystery.indexOf(guess[g]) > -1;
			if(!isCorrect && isSomewhere && allocation[guess[g]]){
			 feedback[g] = 1;
			 allocation[guess[g]] --;
			}
		}


		let allCorrect = true;
		// need to account for duplicates better
		$r.find('seq-c').each(function(n){
			$(this).attr('correctness',feedback[n]);
			if(feedback[n] != 2) allCorrect = false;
		});

		if(allCorrect) $btn.remove();
		else makeRow();
	}

	makeRow();

}