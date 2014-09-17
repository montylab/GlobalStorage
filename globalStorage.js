var GlobalStorage = function(serverSrc) {
	this.callbacks = ['non-usage'];
	this.serverSrc = serverSrc;

	// initialization (iframe, events)
	this.init = function() {
		if (!document.body) {
			setTimeout(this.init.bind(this), 100);
			return;
		}

		var self = this;
		this.ready = false;

		// iframe creating
		this.iframe = document.createElement('iframe');
		this.iframe.setAttribute('src', this.serverSrc);
		this.iframe.style.display = 'none';
		document.body.appendChild(this.iframe);

		// events
		window.onmessage = processMessage.bind(this);
		this.iframe.onload = function () {
			self.ready = true;
		};
	};

	// toggle readdy state when iframe loaded
	this.isReady = function() {
		return this.ready;
	};

	//
	this.getItem = function (key, callback) {
		if (!this.ready) {
			setTimeout(this.getItem.bind(this, key, callback), 100);
			return;
		}

		var callbackId = this.callbacks.push(callback) - 1;
    	this.iframe.contentWindow.postMessage(JSON.stringify({key: key, method: "get", callbackId: callbackId}), "*");
	};

	this.setItem = function (key, data, callback) {
		if (!this.ready) {
			setTimeout(this.setItem.bind(this, key, data, callback), 100);
			return;
		}

		var callbackId = this.callbacks.push(callback) - 1;
		this.iframe.contentWindow.postMessage(JSON.stringify({key: key, method: "set", data: data, callbackId: callbackId}), "*");
	};

	this.removeItem = function (key, callback) {
		if (!this.ready) {
			setTimeout(this.removeItem.bind(this, key, callback), 100);
			return;
		}

		var callbackId = this.callbacks.push(callback) - 1;
    	this.iframe.contentWindow.postMessage(JSON.stringify({key: key, method: "remove", callbackId: callbackId}), "*");
	};

	var processMessage = function(e) {
		var data = JSON.parse(e.data);
		if (!data || !data.callbackId) return;
		if (typeof this.callbacks[data.callbackId] === 'function') {
			this.callbacks[data.callbackId].call(window, JSON.stringify(data.item));
		}
		this.callbacks[data.callbackId] = null;
	};

	this.init();
};