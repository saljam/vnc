/*
Copyright 2012 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Boris Smus (smus@chromium.org)
*/

var VNC = VNC || {};

VNC.tcpClient = function(host, port, callbacks, pollInterval) {

	var socket = chrome.socket,
		addr, socketId;
	var client = {
		host: host,
		port: port,
		pollInterval: pollInterval || 15,
		isConnected: false,
		callbacks: callbacks
	};

	// Connects to the TCP socket, and creates an open socket.
	client.connect = function(callback) {
		socket.create('tcp', {}, function(info) {
			socketId = info.socketId;
			if (socketId > 0) {
				socket.connect(socketId, host, port, function(resultCode) {
					// Start polling for reads.
					client.isConnected = true;
 					socket.read(socketId, null, onDataRead);

					if (callback) {
						callback();
					}
				});
			} else {
				console.error('Unable to create socket');
			}
		});
	};

	// Sends an arraybuffer/view down the wire to the remote side
	client.sendBuffer = function(buf, callback) {
		if (buf.buffer) {
			buf = buf.buffer;
		}

		socket.write(socketId, buf, function(writeInfo) {
			// Call sent callback.
			if (callback) {
				callback(writeInfo);
			}
		});
	};

	// Disconnects from the remote side
	client.disconnect = function() {
		if (client.isConnected) {
			client.isConnected = false;
			socket.disconnect(socketId);
			if (callbacks.disconnect) {
				callbacks.disconnect();
			}
		}
	};

	// Callback function for when data has been read from the socket.
	// Converts the array buffer that is read in to a string
	// and sends it on for further processing by passing it to
	// the previously assigned callback function.
	var onDataRead = function(info) {
		// Call received callback if there's data in the response.
		if (info.resultCode > 0) {
			if (callbacks.receive) {
				// Return raw ArrayBuffer directly.
				callbacks.receive(info.data);
			}

			// Trigger another read right away
 			socket.read(socketId, null, onDataRead);
		} else if (client.isConnected) {
			client.disconnect();
		}
	};

	return client;
};
