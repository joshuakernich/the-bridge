window.HASocket = function(){

	let self = this;

	const URL = 'http://localhost:8123/';
	const protocols = 'nothingHere';
	const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJmMzRjZWI1OTNlOTY0OTJhYThjYzNlNmMwNGUyYjY1MiIsImlhdCI6MTcyNjg5NjE3NCwiZXhwIjoyMDQyMjU2MTc0fQ.ru0S-BHJCClCRKkpMNbNfwRvi8QUfVy8NznFT-80L_c';

	let s = new WebSocket(URL, protocols);

	s.onopen = function(e){
		console.log('SOCKET OPEN!');
	};

	s.onmessage = function(e){
	 	console.log('Socket Message',e.data);

	 	if(e.data.type=='auth_required'){
	 		self.send({
	 			"type": "auth",
  				"access_token": token,
	 		})
	 	}

	 	if(e.data.type=='auth_ok'){
	 		console.log('SOCKET GOOD! away we go');
	 		self.send({
	 			"id": 100,
	 			"type": "subscribe_events",
	 		})

	 		self.send({
	 			"id": 200,
	 			"type": "subscribe_triggers",
	 		})
	 	}

	 	if(e.data.type=='auth_invalid'){
	 		window.alert('BAD SOCKET! BAD!');
	 	}

	 	if(e.data.type=='event'){
	 		console.log('GOT EVENT!',e.data.event);
	 		console.log( e.data.event.data['entity_id']);
	 	}
	};

	self.send = function(msg){
		msg = JSON.stringify(msg);
		s.send(msg);
	}
}