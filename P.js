;MultitabIO = (function (T, $) {
	var P = {}, N = 'multitabio';

	P.log = function () {
		if (!options.debugMode || !options.debugMode.val) return;

		var args = Array.prototype.slice.call(arguments, 0);
		console.log.apply(console, args);

		var $d = $('#debug')[0];
		if ($d) {
			args = args.map(function (o) { return JSON.stringify(o); });
			$d.innerHTML += args.join("\n");
		}
	}

	var options = {}
		, $links = $('#links')[0]

	P.get = function () {
		T.query({ currentWindow: true }, function (ts) {
			var r = [];
			ts.forEach(function (t, i) {
				// ignore chromespecials?
				if (!options.ignoreChrome.val || t.url.indexOf('chrome') !== 0) {
					if(options.markdown.val) {
						r.push("* [" + t.title + "](" + t.url + ")");
					}
					else if(options.wiki.val) {
						r.push("* [" + t.title + "|" + t.url + "]");
					}
					else {
						if (options.includeTitle.val) r.push("* " + t.title);
						r.push((options.includeTitle.val ? "\t" + t.url : "* " + t.url)+"\n");
					}
				}
			});

			$links.value = r.join("\n");
			$links.focus();
			$links.select();
		});

		return false;
	};

	P.clear = function () {
		$links.value = '';
	};

	P.set = function () {
		var urls = $links.value.split('\n').map(function(v) { return v.trim(); });
		urls.forEach(function (v) {

			// ignore non-links
			P.log('checking link', v);

			if (v.indexOf('http') === 0 || v.indexOf('//') !== -1) {
				T.create({ url: v }, function () { P.log.apply(console, arguments); });
			}
		});
	};


	P.save = function () {
		options = [].reduce.call($('.f input'), function (o, v) {
			o[v.id] = { val: v.checked, type: v.type };
			return o;
		}, {});
		P.log('saved ' + N + ' options', options);
		localStorage[N] = JSON.stringify(options);
	};

	P.load = function () {

		// default options
		if (!localStorage[N]) {
			if($links) $links.focus();
			localStorage[N] = JSON.stringify({ ignoreChrome: { type: "checkbox", val: true }, includeTitle: { type: "checkbox", val: true }, debugMode: { type: "checkbox", val: false } });
		}

		options = JSON.parse(localStorage[N]);
		
		for (var k in options) {
			if (options.hasOwnProperty(k)) {
				var v = options[k];

				var $o = $('#' + k)[0];
				if ($o) {
					if (v.type == 'checkbox' || v.type == 'radio') $o.checked = v.val;
					else $o.value = v.val;
				}
			}
		}

		if (options.debugMode.val && !$('#debug')[0]) {
			var e = document.createElement('pre');
			e.id = 'debug';
			$('#P')[0].parentNode.appendChild(e);
		}

		P.log('loaded ' + N + ' options');

		P.get();
	};

	
	
	return {
		initLoad: function() { document.addEventListener('DOMContentLoaded', P.load); }
		, initActions: function() {
			['get', 'set', 'clear', 'save'].forEach(function (a) {
				var $o = $('#' + a)[0];
				if($o) $o.addEventListener('click', P[a]);
			});

		}
	};
})(chrome.tabs, function (s) { return document.querySelectorAll(s); });
