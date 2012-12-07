var rfb;

function updateState(rfb, state, oldstate, msg) {
	var level;
	switch (state) {
		case 'failed':       level = "error";  break;
		case 'fatal':        level = "error";  break;
		case 'normal':       level = "normal"; break;
		case 'disconnected': level = "normal"; break;
		case 'loaded':       level = "normal"; break;
		default:             level = "warn";   break;
	}
}

function dial(host, port) {
	var password;

	document.title = host;

	password = "";

	rfb = new RFB({
		'target': $D('screen'),
		'encrypt': false,
		'repeaterID': '',
		'true_color': true,
		'local_cursor': true,
		'shared': true,
		'view_only': false,
		'updateState': updateState,
		'onPasswordRequired': null
	});
	rfb.connect(host, port, password, '');
}

$(function () {
	$("#form-pwd").hide().submit(function(){
		rfb.sendPassword(password.value);
		$("#form-pwd")[0].reset();
	});
	$("#form-connect").submit(function() {
		$(this).slideUp();
		chrome.storage.local.set({"last_conn": {
			"host": host.value,
			"port": port.value }});
		dial(host.value, port.value);
	});
	chrome.storage.local.get("last_conn", function(data) {
		host.value = data.last_conn.host;
		port.value = data.last_conn.port;
	});
});
