(function(scope) {
	var Vendor = function(id) {
		this.id = id;
	};
	Vendor.prototype.callbacks = {
		onBeforeLoad: function() {},
		onAfterLoad: function() {}
	};
	Vendor.prototype.init = function() {
		if (this.config.generic == false) {
			console.log('loading init script for vendor ', this.id);
			this.config.initScript();
			return false;
		} else {
			console.log('loading generic configuration for vendor ', this.id);
		}

		// 1. call onBeforeLoad script
		this.callbacks['onBeforeLoad']();

		// 2. build generic init scripts
		var elem = document.createElement('script');
		elem.type = 'text/javascript';
		elem.async = true;
		elem.src = ('https:' == document.location.protocol ? 'https://' + this.config.sslPrefix : 'http://' + this.config.prefix) + this.config.script;
		var script = document.getElementsByTagName('script')[0];
		script.parentNode.insertBefore(elem, script);

		// 1. call onAfterLoad script
		this.callbacks['onAfterLoad']();
	};
	Vendor.prototype.registerCallback = function(name, callback) {
		this.callbacks[name] = callback;
	}

	/* GA */
	var GoogleAnalytics = function(id) {
		this.id = id;
		this.name = "ga";
	};
	GoogleAnalytics.prototype = new Vendor();
	GoogleAnalytics.prototype.config = {
		prefix: '',
		sslPrefix: '',
		script: 'stats.g.doubleclick.net/dc.js',
		generic: true,
		initScript: false,
	};
	GoogleAnalytics.prototype.pageview = function(url) {
		if (url) {
			_gaq.push(['_trackPageview', url]);
		} else {
			_gaq.push(['_trackPageview']);
		}
	};
	GoogleAnalytics.prototype.call = function(action, params) {
		_gaq.push([action, params]);
	};
	GoogleAnalytics.prototype.track = function(params) {
		_gaq.push(["_trackEvent", params]);
	};
	GoogleAnalytics.prototype.callbacks = {
		onBeforeLoad: function() {
			window._gaq = window._gaq || [];
			_gaq.push(['_setAccount', this.id]);
		},
		onAfterLoad: function() {}
	};

	/* QuantCast */
	var QuantCast = function(id) {
		this.id = id;
		this.name = "quantcast";
	};
	QuantCast.prototype = new Vendor();
	QuantCast.prototype.config = {
		prefix: 'edge.',
		sslPrefix: 'secure.',
		script: 'quantserve.com/quant.js',
		generic: true,
		initScript: false
	};
	QuantCast.prototype.pageview = function() {
		_qevents.push({
			qacct: this.id,
			event: "refresh"
		});
	};
	QuantCast.prototype.callbacks = {
		onBeforeLoad: function() {
			window._qevents = window._qevents || [];
		},
		onAfterLoad: function() {
			_qevents.push({
				qacct: this.id
			});
		}
	};

	/* MixPanel */
	var MixPanel = function(id) {
		this.id = id;
		this.name = "mixpanel";
	};
	MixPanel.prototype = new Vendor();
	MixPanel.prototype.config = {
		generic: false,
		initScript: function() {
			start = (function(f, b) {
				if (!b.__SV) {
					var a, e, i, g;
					window.mixpanel = b;
					b._i = [];
					b.init = function(a, e, d) {
						function f(b, h) {
							var a = h.split(".");
							2 == a.length && (b = b[a[0]], h = a[1]);
							b[h] = function() {
								b.push([h].concat(Array.prototype.slice.call(arguments, 0)))
							}
						}
						var c = b;
						"undefined" !== typeof d ? c = b[d] = [] : d = "mixpanel";
						c.people = c.people || [];
						c.toString = function(b) {
							var a = "mixpanel";
							"mixpanel" !== d && (a += "." + d);
							b || (a += " (stub)");
							return a
						};
						c.people.toString = function() {
							return c.toString(1) + ".people (stub)"
						};
						i = "disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
						for (g = 0; g < i.length; g++) f(c, i[g]);
						b._i.push([a, e, d])
					};
					b.__SV = 1.2;
					a = f.createElement("script");
					a.type = "text/javascript";
					a.async = !0;
					a.src = "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
					e = f.getElementsByTagName("script")[0];
					e.parentNode.insertBefore(a, e)
				}
			})(document, window.mixpanel || []);
			mixpanel.init("213b82043713d3624e227a8232b15715");
		}
	};
	MixPanel.prototype.pageview = function() {
		mixpanel.track("Page View");
	};
	MixPanel.prototype.track = function(params) {
		mixpanel.track(params);
	};
	MixPanel.prototype.call = function(action, params) {
		console.log('vendor ' + this.name + ' call ' + action);

		if (action.indexOf('.') == -1) {
			mixpanel[action](params);
		} else {
			function buildNestedObjectCall(obj, str, val) {
				str = str.split(".");
				while (str.length > 1) {
					obj = obj[str.shift()];
				}

				return obj[str.shift()](val);
			}

			buildNestedObjectCall(mixpanel, action, params);
		}
	};
	MixPanel.prototype.callbacks = {
		onBeforeLoad: function() {},
		onAfterLoad: function() {}
	};

	scope.Analytics = {
		available: {
			ga: GoogleAnalytics,
			quantcast: QuantCast,
			mixpanel: MixPanel
		},
		vendors: [],
		callAll: function(func, args) {
			for(var i=0; i<this.vendors.length; i++) {
				this.vendors[i].call(func, args);
			}
		},
		call: function(key, func, args) {
			var index = this.findVendor(key);
			if (index != -1) {
				this.vendors[index].call(func, args);
			}
		},
		track: function(args) {
			for(var i=0; i<this.vendors.length; i++) {
				this.vendors[i].track(args);
			}
		},
		pageView: function(args) {
			for(var i=0; i<this.vendors.length; i++) {
				this.vendors[i].pageview(args);
			}
		},
		findVendor: function(vendor) {
			var i, index = -1;
			for(i=0; i<this.vendors.length; i++) {
				if (this.vendors[i]['name'] == vendor) {
					index = i;
				}
			}

			return index;
		},
		addVendor: function(type, options) {
			if (this.available.hasOwnProperty(type)) {
				this.vendors.push(new this.available[type](options));
			} else {
				this.vendors.push(new Vendor(options));
			}
		},
		initAll: function() {
			for(var i=0; i<this.vendors.length; i++) {
				this.vendors[i].init();
			}
		},
		listAll: function() {
			return this.vendors;
		}
	}
})(window);

