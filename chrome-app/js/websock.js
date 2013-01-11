var VNC;
if (VNC === undefined) {
	VNC = {};
}

VNC.socket = function(eventHandlers) {
	var sock = null, // WebSocket object
		rQ = [],          // Receive queue
		rQi = 0,          // Receive queue index
		rQmax = 10000;    // Max receive queue size before compacting

		for (handler in ['message', 'open', 'close', 'error']) {
			if (eventHandlers[handler] === undefined) {
				eventHandlers[handler] = function(){};
			}
		}

	// Queue public functions

	function get_rQ() {
		return rQ;
	}
	function get_rQi() {
		return rQi;
	}
	function set_rQi(val) {
		rQi = val;
	}

	function rQlen() {
		return rQ.length - rQi;
	}

	function rQpeek8() {
		return (rQ[rQi]);
	}
	function rQshift8() {
		return (rQ[rQi++]);
	}
	function rQunshift8(num) {
		if (rQi === 0) {
			rQ.unshift(num);
		} else {
			rQi -= 1;
			rQ[rQi] = num;
		}
	}
	function rQshift16() {
		return (rQ[rQi++] <<  8) +
			(rQ[rQi++]      );
	}
	function rQshift32() {
		return (rQ[rQi++] << 24) +
			(rQ[rQi++] << 16) +
			(rQ[rQi++] <<  8) +
			(rQ[rQi++]      );
	}
	function rQshiftStr(len) {
		if (typeof(len) === 'undefined') { len = rQlen(); }
		var arr = rQ.slice(rQi, rQi + len);
		rQi += len;
		return String.fromCharCode.apply(null, arr);
	}
	function rQshiftBytes(len) {
		if (typeof(len) === 'undefined') { len = rQlen(); }
		rQi += len;
		return rQ.slice(rQi-len, rQi);
	}

	function rQslice(start, end) {
		if (end) {
			return rQ.slice(rQi + start, rQi + end);
		} else {
			return rQ.slice(rQi + start);
		}
	}

	// Check to see if we must wait for 'num' bytes (default to FBU.bytes)
	// to be available in the receive queue. Return true if we need to
	// wait (and possibly print a debug message), otherwise false.
	function rQwait(msg, num, goback) {
		var rQlen = rQ.length - rQi; // Skip rQlen() function call
		if (rQlen < num) {
			if (goback) {
				if (rQi < goback) {
					throw("rQwait cannot backup " + goback + " bytes");
				}
				rQi -= goback;
			}
			return true;  // true means need more data
		}
		return false;
	}

	function decode_message(data) {
		// push arraybuffer values onto the end
		var u8 = new Uint8Array(data);
		for (var i = 0; i < u8.length; i++) {
			rQ.push(u8[i]);
		}
	}

	function send(arr) {
		sock.sendBuffer(new Uint8Array(arr));
	}

	var stringToArrayBuffer = function(str, callback) {
		var bb = new Blob([str]);
		var f = new FileReader();
		f.onload = function(e) {
			callback(e.target.result);
		};
		f.readAsArrayBuffer(bb);
	};

	var sendString = function(str) {
		stringToArrayBuffer(str, function(buf) {
			sock.sendBuffer(buf);
		});
	}

	function recv_message(e) {
		try {
			decode_message(e);
			if (rQlen() > 0) {
				eventHandlers.message();
				// Compact the receive queue
				if (rQ.length > rQmax) {
					rQ = rQ.slice(rQi);
					rQi = 0;
				}
			} else {
				Util.Debug("Ignoring empty message");
			}
		} catch (exc) {
			if (typeof exc.stack !== 'undefined') {
				Util.Warn("recv_message, caught exception: " + exc.stack);
			} else if (typeof exc.description !== 'undefined') {
				Util.Warn("recv_message, caught exception: " + exc.description);
			} else {
				Util.Warn("recv_message, caught exception:" + exc);
			}
			if (typeof exc.name !== 'undefined') {
				eventHandlers.error(exc.name + ": " + exc.message);
			} else {
				eventHandlers.error(exc);
			}
		}
	}
	
	function connect(host, port) {
	        sock = new TcpClient(host, parseInt(port));
		sock.connect(function() {
			eventHandlers.open();
		});
		sock.addResponseListener(recv_message);
	}
	
	function close() {
	}
	
	return {
		// Direct access to send and receive queues
		get_rQ:	get_rQ,
		get_rQi:	get_rQi,
		set_rQi:	set_rQi,
		
		// Routines to read from the receive queue
		rQlen:	rQlen,
		rQpeek8:	rQpeek8,
		rQshift8:	rQshift8,
		rQunshift8:	rQunshift8,
		rQshift16:	rQshift16,
		rQshift32:	rQshift32,
		rQshiftStr:	rQshiftStr,
		rQshiftBytes:	rQshiftBytes,
		rQslice:	rQslice,
		rQwait:	rQwait,
		
		send:	send,
		sendString:	sendString,
		
		connect:	connect,
		close:	close,
	};
}
