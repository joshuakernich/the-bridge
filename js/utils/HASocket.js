window.HASocket = function(){

	let self = this;
	let listeners = {};

	//const URL = 'http://192.168.1.141:8123/api/websocket';
	const URL = 'https://localhost:8123/api/websocket';
	const protocols = 'nothingHere';
	const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJmMzRjZWI1OTNlOTY0OTJhYThjYzNlNmMwNGUyYjY1MiIsImlhdCI6MTcyNjg5NjE3NCwiZXhwIjoyMDQyMjU2MTc0fQ.ru0S-BHJCClCRKkpMNbNfwRvi8QUfVy8NznFT-80L_c';

	//let s = new WebSocket(URL);
	let s = {};

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
	 		self.send({
	 			"type": "auth",
  				"access_token": token,
	 		})
	 	}

	 	if(data.type=='auth_ok'){
	 		console.log('SOCKET GOOD! away we go');
	 		self.send({
	 			"id": 100,
	 			"type": "subscribe_events",
	 			"event_type": "circuit_damage"
	 		})

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

	self.send = function(msg){
		msg = JSON.stringify(msg);
		console.log("SEND",msg);
		if(s.send) s.send(msg);
	}

	self.on = function(type,fn){
		if( !listeners[type] ) listeners[type] = [];
		listeners[type].push(fn);
	}
}