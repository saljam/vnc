/*jslint white: false */
/*global window, $, RFB, */
"use strict";

var rfb;

function setPassword() {
	rfb.sendPassword($D('password_input').value);
	return false;
}

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

	password = '';

	rfb = new RFB({'target': $D('vnc_canvas'),
		'encrypt': false,
		'repeaterID': '',
		'true_color': true,
		'local_cursor': true,
		'shared': true,
		'view_only': false,
		'updateState':  updateState,
		'onPasswordRequired':  null});
	rfb.connect(host, port, password, '');
}

$(function () {
	$("#hostDialog").dialog({ autoOpen: true, title: "VNC",
		modal: true, resizable: false,
		closeOnEscape: false,
		open: function(event, ui) {
			$(".ui-dialog-titlebar-close").hide();
		},
		buttons: [ { text: "Connect", click: function() {
			$(this).dialog("close");
			dial(host.value, port.value);
		}}],
	});
	
	$("#pwdDialog").dialog({ autoOpen: false, title: "VNC Password",
		modal: true, resizable: false,
		closeOnEscape: false,
		open: function(event, ui) {
			$(".ui-dialog-titlebar-close").hide();
		},
		buttons: [ { text: "Login", click: function() {
			$(this).dialog("close");
			setPassword(password.value);
			password.value = "";
		}}],
	});
});
