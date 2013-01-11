$(function () {
	var rfb;

	var updateState = function (rfb, state, oldstate, msg) {
		switch (state) {
		case 'failed':
		case 'fatal':
			$("#form-connect").slideDown();
			$('<div class="alert">' +
				'<button type="button" class="close" data-dismiss="alert">&#215;</button>' + 
 				'<strong>Oops!</strong> ' + msg + '</div>').prependTo("#form-connect");
			break;
		case 'normal':
		case 'disconnected':
		case 'loaded':
		default:
		}
	}

	var dial = function(host, port) {
		var password;

		document.title = host;

		pwd = "";

		rfb = VNC.rfb({
			'target': $('#screen')[0],
			'local_cursor': true,
			'updateState': updateState,
			'onPasswordRequired': function() {
				$("#form-pwd").slideDown();
			}
		});
		rfb.connect(host, port, pwd, '');
	}

	$("#form-pwd").hide().submit(function(){
		rfb.sendPassword(password.value);
		$("#form-pwd").slideUp();
		$("#form-pwd")[0].reset();
		return false;
	});
	$("#form-connect").submit(function() {
		$(this).slideUp();
		chrome.storage.local.set({"last_conn": {
			"host": host.value,
			"port": port.value }});
		dial(host.value, port.value);
		return false;
	});
	chrome.storage.local.get("last_conn", function(data) {
		host.value = data.last_conn.host;
		port.value = data.last_conn.port;
	});
});
