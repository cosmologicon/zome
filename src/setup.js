// Use this file for:
//   main error handler
//   polyfill not covered by Babel
// This file should not undergo transpilation or minification.

"use strict"

window.onerror = function (message, url, line, col, errorobj) {
	var stack =
		errorobj === undefined ? undefined :
		errorobj === null ? null :
		"stack" in errorobj ? errorobj.stack :
		errorobj
	var report = {
		t: Date.now(),
		useragent: window.navigator.userAgent,
		message: message,
		url: url,
		line: line,
		col: col,
		stack: stack
	}
	var req = new XMLHttpRequest()
	req.open("POST", "http://universefactory.net/tools/dump/", true)
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
	req.send("project=zomeerror&data=" + encodeURIComponent(JSON.stringify(report)))
	document.body.innerHTML = [
		"<p>Error in: " + url,
		"<p>line " + line,
		"<pre>" + message,
		"",
		"" + stack + "</pre>"
	].join("\n")
	window.onerror = null
}

if (!String.prototype.includes) {
	String.prototype.includes = function (a, pos) {
		return this.indexOf(a, pos || 0) != -1
	}
}
if (!Array.prototype.includes) {
	Array.prototype.includes = function (a, pos) {
		return this.indexOf(a, pos || 0) != -1
	}
}

