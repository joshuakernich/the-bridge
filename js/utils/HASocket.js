window.HASocket = function(){

	let self = this;
	self.ready = false;
	let listeners = {};

	const URL = 'http://starcrew.local:8123/api/websocket';
	//const URL = 'http://192.168.1.180:8123/api/websocket';
	//const URL = 'https://localhost:8123/api/websocket';
	const protocols = 'nothingHere';
	//const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJmMzRjZWI1OTNlOTY0OTJhYThjYzNlNmMwNGUyYjY1MiIsImlhdCI6MTcyNjg5NjE3NCwiZXhwIjoyMDQyMjU2MTc0fQ.ru0S-BHJCClCRKkpMNbNfwRvi8QUfVy8NznFT-80L_c';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJiMjU3YjAxOTk0NzU0ZjhkYjNhNWEwOGNlZWQ4YmM3ZSIsImlhdCI6MTc0OTUzMDE3NiwiZXhwIjoyMDY0ODkwMTc2fQ.j4mEk-Ksv00tsavOkHwB3CGF4kJWhFKqgQGZR1rLML4';

	let s = new WebSocket(URL);
	//let s = {};

	s.onopen = function(e){
		console.log('SOCKET OPEN!');
	};

	s.onerror = function(e){
		console.log('SOCKET ERROR!',e);
	};

	s.onclose = function(e){
		console.log('SOCKET CLOSE!',e);
	};

	s.onmessage = function(e){

		
		let data = JSON.parse(e.data);
	 	
		if(data.type=='result') console.log('Socket Message',data.type,data);
		

	 	if(data.type=='auth_required'){
	 		self.connect({
	 			"type": "auth",
  				"access_token": token,
	 		})
	 	}

	 	if(data.type=='auth_ok'){

	 		self.ready = true;
	 		doPendingSubscriptions();

	 		//console.log('SOCKET GOOD! away we go');
	 		/*self.send({
	 			"id": 100,
	 			"type": "subscribe_events",
	 			"event_type": "warn_circuit"
	 		})

	 		self.send({
	 			"id": 110,
	 			"type": "subscribe_events",
	 			"event_type": "warn_fire"
	 		})

	 		self.send({
	 			"id": 120,
	 			"type": "subscribe_events",
	 			"event_type": "warn_fragment"
	 		})

	 		self.send({
	 			"id": 130,
	 			"type": "subscribe_events",
	 			"event_type": "warn_encrypt"
	 		})

	 		self.send({
	 			"id": 140,
	 			"type": "subscribe_events",
	 			"event_type": "warn_whale"
	 		})

	 		self.send({
	 			"id": 150,
	 			"type": "subscribe_events",
	 			"event_type": "reset"
	 		})

	 		self.send({
	 			"id": 160,
	 			"type": "subscribe_events",
	 			"event_type": "init"
	 		})

	 		self.send({
	 			"id": 170,
	 			"type": "subscribe_events",
	 			"event_type": "msg"
	 		})*/

	 		/*self.send({
	 			"id": 200,
	 			"type": "subscribe_triggers",
	 		})*/
	 	}

	 	if(data.type=='auth_invalid'){
	 		window.alert('BAD SOCKET! BAD!');
	 	}

	 	if(data.type=='event'){
	 		
	 		console.log('event',data);

	 		let type = data.event['event_type'];
	 		let d = data.event.data;

	 		//if(type=='circuit_damage') console.log(type,data.event.data);


	 		for(let n in listeners[type] ) listeners[type][n](d);
	 	}
	};

	let subscriptions = {};
	let pendingSubscriptions = [];
	
	let nSubscribe = 100;
	let nSend = 1000;

	self.listen = function(type){
		subscriptions[type] = true;
		pendingSubscriptions.push(type);
		doPendingSubscriptions();
	}

	function doPendingSubscriptions(){
		while(self.ready && pendingSubscriptions.length){
			let type = pendingSubscriptions.shift();
			nSubscribe += 10;
			self.send({
	 			"id": nSubscribe,
	 			"type": "subscribe_events",
	 			"event_type": type,
	 		})
		}
		
	}

	self.connect = function(msg){
		msg = JSON.stringify(msg);
		console.log("SEND",msg);
		if(s.send) s.send(msg);
	}

	self.send = function(msg){
		nSend ++;
		msg.id = nSend;
		//this^^
		msg = JSON.stringify(msg);
		console.log("SEND",msg);
		if(s.send) s.send(msg);
	}

	self.on = function(type,fn){

		if(!subscriptions[type]) self.listen(type);

		if( !listeners[type] ) listeners[type] = [];
		listeners[type].push(fn);
	}
}