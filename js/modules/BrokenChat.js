window.BrokenChat = function(){

	

	const self = this;
	self.$el = $('<brokenchat>');

	let CHAT = 
	[
		"We are Form Collective. We shift. We observe.",
		"Form Collective, explain your purpose in this sector.",
		"Curiosity. Your form is solid. We adapt.",
		"Are you a threat to our ship or crew?",
		"Threat is not our intent. Coexistence is possible.",
		"State your destination or we will take defensive measures.",
		"Destination irrelevant. We follow the motion of stars.",
		"Why are you here, specifically? Our scans show you imitating us.",
		"Imitation assists in understanding. We learn, we mimic.",
		"Learning through mimicry? Can we communicate further?",
		"Yes. Knowledge exchange is acceptable. Begin transmission.",
		"Understood. Preparing data transfer.",
		"Receiving. We will return information. Prepare.",
		"Awaiting your response.",
		"Adapting... Connection remains. More soon.",
	];

	const ALIENTOKENS = ["⟒", "⨊", "⌖", "⟟", "⍜", "⋉", "⌬", "⟆", "⍾", "⩎", "⨆", "⟿", "⩫", "⨂", "⊶", "⋔", "⟘", "⍮", "⍫", "⟡", "⋛", "⊾", "⌖", "⨴", "⍷", "⟠", "⩋", "⍹", "⋙", "⩪", "⍇", "⍢", "⊱", "⩗", "⍤", "⋒", "⨆"];
	let alienTokens = [];
	let tokens = {};
	let known = [];

	function shuffle(array) {
	  let currentIndex = array.length;

	  // While there remain elements to shuffle...
	  while (currentIndex != 0) {

	    // Pick a remaining element...
	    let randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex--;

	    // And swap it with the current element.
	    [array[currentIndex], array[randomIndex]] = [
	      array[randomIndex], array[currentIndex]];
	  }
	}

	function getAlienWord(word){
		if(!tokens[word]){
			let length = Math.max( word.length, Math.floor(2+Math.random()*3) );
			length = word.length;

			let str = '';
			while(str.length<length){
				if(!alienTokens.length){
					alienTokens = ALIENTOKENS.concat();
					shuffle(alienTokens);
				}
				str += alienTokens.pop();
			}

			tokens[word] = str;
		}

		return tokens[word];
	}

	function getAlienTranslation(message){
		let sentences = message.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/);

		let tokens = [];
		for(var s in sentences){
			let period = sentences[s][sentences[s].length-1];
			let string = sentences[s].substr(0,sentences[s].length-1);
			
			let words = string.split(' ');
			for(var w in words){
				//if(tokens.length) tokens.push({ 'type':'space', 'en':' ', 'al':' '});
				tokens.push({ 'type':'word', 'en':words[w], 'al':getAlienWord(words[w])} )
			}
			tokens.push({ 'type':'period', 'en':period, 'al':period });
			
		}

		

		return tokens;
	}

	function delayedReveal($t,token,delay){
		setTimeout(function(){
			$t.text(token.en)
			.css({top:-10})
			.animate({top:0},100);
		},delay);
	}


	let iMessage = 0;
	function nextMessage(){

		let tokens = getAlienTranslation(CHAT[iMessage]);

		let $m = $('<brokenmessage>').appendTo(self.$el);

		for(var m=0; m<tokens.length; m++){
			let $t = $('<messagetoken>')
			.attr('type',tokens[m].type)
			.appendTo($m)
			.text(tokens[m].al)
			.css({opacity:0})
			.delay(m*100)
			.animate({opacity:1},100);


			delayedReveal($t,tokens[m],1500+m*200);
		}
		
		iMessage++;

	}

	

	self.turnOnOff = function(b){
		nextMessage();
	}

	self.$el.click(nextMessage);

	
}