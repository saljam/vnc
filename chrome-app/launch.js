chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('vnc.html', {});
});
