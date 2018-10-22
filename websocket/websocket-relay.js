// Use the websocket-relay to serve a raw MPEG-TS over WebSockets. You can use
// ffmpeg to feed the relay. ffmpeg -> websocket-relay -> browser
//Main server handle new connections from web app and sends back stream port number
//Web app send url (rtsp) to decode, mainserver checks if WsServer is running on that URL
// If is already running, then sends port number
// If not then new ffmpeg process is spawned and new WsServer is started with new stream port
//Every instance of WsServer is checking their clients status
// If all cients are disconnected WsServer kills spawned ffmpeg and shuts down
//Result: at any time we have one WsServer for every camera(url) which have clients connected
//WsServer port numbers are assigned dynamically according to index in openedStreamServers array
// first WsServer listen for stream on mainSocketServerPort + 1, brodcasting to clients on mainSocketServerPort + 2
// If one WsServer is shut down, then next new created WsServer will take its numbers

var fs = require('fs'),
	http = require('http'),
	WebSocket = require('ws');
var spawn = require('child_process').spawn;

const mainSocketServerPort = 8081;
//array of active WsServers
var openedStreamServers = [];

//Main Websocket Server
var mainSocketServer = new WebSocket.Server({port: mainSocketServerPort, perMessageDeflate: false});
mainSocketServer.on('connection', function(socket, upgradeReq) {
	console.log(
		'(main server) New WebSocket Connection: ',
		(upgradeReq || socket.upgradeReq).socket.remoteAddress,
		(upgradeReq || socket.upgradeReq).headers['user-agent']
	);

	socket.on('message', function(data){
		//message from Web App with url to stream
		if (data.startsWith("rtsp")) {
			//check if camera is streaming or create new streaming server
			var streamport = openNewServer(data);
			var wsport = streamport + 1;
			if (streamport > 0) {
				//send info to App that server and ffmpeg is running
				var response = {
					"text": "Success",
					"port": wsport
				}
				console.log('(main server) Connect to '+data+' on ws://127.0.0.1:'+wsport+'/');
			}
			else {
				//probably never happens :)
				var response = {
					"text": "Internal Error",
					"port": -2
				}
			}
		}
		else {
			//if bad url from App
			var response = {
				"text": "Bad URL, not RTSP",
				"port": -1
			}
		}
		//send response to Web App
		socket.send(JSON.stringify(response));
	});
});
console.log('(main server) Awaiting WebSocket connections on ws://127.0.0.1:'+mainSocketServerPort+'/');

function removeInactiveStreamServers() {
	//remove WsServer if its ffmpeg is killed
	for (var i = openedStreamServers.length-1; i >= 0; i--) {
    if (openedStreamServers[i].FFMPEGproc.killed) {
      openedStreamServers.splice(i, 1);
    }
	}
}
function openNewServer(url) {
	var newurl = true;
	var index = -1;
	var streamport = -1;

	removeInactiveStreamServers();

	//check if any existing WsServer is already streaming from this url camera
	for (var i = openedStreamServers.length-1; i >= 0; i--) {
		if (openedStreamServers[i].FFMPEGproc.spawnargs[2] === url) {
			index = i;
			newurl = false;
			break;
		}
	}

	//if new WsServer is needed then determine its index ( first not used index from 0 to ... )
	if (newurl) {
		for (var i = 0; i <= openedStreamServers.length; i++) {
			var newindex = i;
			var result = true;
			for (var j =0; j < openedStreamServers.length; j++) {
				if (newindex === openedStreamServers[j].INDEX) {
					result = false;
					break;
				}
			}
			if (result) {
				index = newindex;
				break;
			}
		}
	}

	if (index >= 0) {
		//if index is specified then compute stream port number
		streamport = mainSocketServerPort + 2*index + 1;
		if (newurl) {
			//if new WsServer is needed then create WsServer and store itd data in openedStreamServers array
			var ffmpegproc = createWsServer('svs',streamport,streamport + 1,false,url);
			var cs = {
				"FFMPEGproc": ffmpegproc, //spawned ffmpeg (stores information about stream url)
				"INDEX": index
			}
			openedStreamServers.push(cs);
		}
	}
	//return stream port number to send to Web App
	return streamport;
}

function createWsServer(STREAM_SECRET,STREAM_PORT,WEBSOCKET_PORT,RECORD_STREAM,STREAM_URL) {
	var ffmpegproc=null;

	// HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
	var streamServer = http.createServer( function(request, response) {
		var params = request.url.substr(1).split('/');

		if (params[0] !== STREAM_SECRET) {
			console.log(
				'Failed Stream Connection: '+ request.socket.remoteAddress + ':' +
				request.socket.remotePort + ' - wrong secret.'
			);
			response.end();
		}

		response.connection.setTimeout(0);
		console.log(
			'Stream Connected: ' +
			request.socket.remoteAddress + ':' +
			request.socket.remotePort
		);
		request.on('data', function(data){
			socketServer.broadcast(data);
			if (request.socket.recording) {
				request.socket.recording.write(data);
			}
		});
		request.on('end',function(){
			console.log('Stream finished');
			if (request.socket.recording) {
				request.socket.recording.close();
			}
		});

		// Record the stream to a local file?
		if (RECORD_STREAM) {
			var path = 'recordings/' + Date.now() + '.ts';
			request.socket.recording = fs.createWriteStream(path);
		}
	}).listen(STREAM_PORT);

	// Websocket Server
	var socketServer = new WebSocket.Server({port: WEBSOCKET_PORT, perMessageDeflate: false});

	socketServer.connectionCount = 0;
	socketServer.on('connection', function(socket, upgradeReq) {
		socketServer.connectionCount++;
		console.log(
			'New WebSocket Connection: ',
			(upgradeReq || socket.upgradeReq).socket.remoteAddress,
			(upgradeReq || socket.upgradeReq).headers['user-agent'],
			'('+socketServer.connectionCount+' total)'
		);

		socket.on('close', function(code, message){
			socketServer.connectionCount--;
			console.log(
				'Disconnected WebSocket ('+socketServer.connectionCount+' total)'
			);
			//code 4000 = don't kill ffmpeg or other client connected
			if (code != 4000 && socketServer.connectionCount === 0) {
				if (ffmpegproc!=null) {
					console.log("Stop ffmpeg for: " + ffmpegproc.spawnargs[2]);
					ffmpegproc.kill();
					ffmpegproc=null;
				}
				socketServer.close();
				streamServer.close();
			}
		});
	});

	//spawn ffmpeg with parameters
	var cmd = 'ffmpeg';
	var args = [
			'-rtsp_transport', 'tcp',
			'-i', STREAM_URL,
			'-r', '30',
			'-f', 'mpegts',
			'-codec:v', 'mpeg1video',
			'-b:v', '1000k',
			'-bf', '0', 'http://localhost:'+STREAM_PORT+'/'+STREAM_SECRET
	];
	console.log("Spawning ffmpeg for: " + STREAM_URL);
	ffmpegproc = spawn(cmd, args);
	// function to check ffmpeg output (not used, if ffmpeg is not succesfully started, then Web App has 10 seconds timeout and disconnects from WsServer (killing ffmpeg))
	ffmpegproc.stderr.on('data', function(data) {
			//console.log(data.toString());
	});

	socketServer.broadcast = function(data) {
		socketServer.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(data);
			}
		});
	};

	console.log('Listening for incomming MPEG-TS Stream on http://127.0.0.1:'+STREAM_PORT+'/<secret>');
	console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');

	return ffmpegproc;
}
