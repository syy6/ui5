/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the Core tests must not yet introduce dependencies to this module.
 */

/*global QUnit, sinon, */

(function(deps, callback) {

	"use strict";

	//extract base URL from script tag
	var oScriptTag, mMatch, sBaseUrl, bCoverage;

	oScriptTag = document.querySelector("[src$='runTest.js']");
	if (oScriptTag) {
		mMatch = /^([^?#]*\/)?runTest.js/.exec(oScriptTag.getAttribute("src"));
		if (mMatch) {
			sBaseUrl = mMatch[1] + "../../../../";
		}
	}

	if (sBaseUrl == null) {
		throw new Error("runTest.js: could not identify script tag!");
	}

	bCoverage = /(?:^|\?|&)coverage(?:&|=|$)/.test(window.location.search);

	function loadScripts(urls, callback) {
		var pending = urls.length,
			errors = 0;

		function listener(e) {
			pending--;
			if ( e.type === 'error' ) {
				errors++;
			}
			e.target.removeEventListener("load", listener);
			e.target.removeEventListener("error", listener);
			if ( pending === 0 && errors === 0 && callback ) {
				callback();
			}
		}

		for ( var i = 0; i < urls.length; i++ ) {
			var script = document.createElement("script");
			script.addEventListener("load", listener);
			script.addEventListener("error", listener);
			script.src = sBaseUrl + urls[i];
			document.head.appendChild(script);
		}
	}

	// cascade 1: polyfills, can all be loaded in parallel
	loadScripts([
		"sap/ui/thirdparty/baseuri.js",
		"sap/ui/thirdparty/es6-promise.js",
		"sap/ui/thirdparty/es6-string-methods.js",
		"sap/ui/thirdparty/es6-object-assign.js"
	], function() {
		// cascade 2: the loader
		loadScripts([
			"ui5loader.js"
		], function() {
			// cascade 3: the loader configuration script
			sap.ui.loader.config({
				async: !bCoverage // run sync when client side coverage is requested
			});
			loadScripts([
				"ui5loader-autoconfig.js"
			], function() {
				sap.ui.require(deps, callback);
			});
		});
	});

}([
	"sap/base/util/UriParameters",
	"sap/ui/test/starter/_utils"
], function(UriParameters, utils) {
	"use strict";

	function makeArray(arg) {
		return Array.isArray(arg) ? arg : [arg];
	}

	function requireP(deps) {
		return new Promise(function(resolve, reject) {
			sap.ui.require(makeArray(deps), function() {
				resolve(Array.prototype.slice.call(arguments));
			}, reject);
		});
	}

	function copyFiltered(target, source, filter) {
		if ( source ) {
			for ( var key in source ) {
				if ( Object.prototype.hasOwnProperty.call(filter, key) ) {
					target[key] = source[key];
				}
			}
		}
		return target;
	}

	function ensureDOM() {
		function insertDIV(id) {
			if ( document.body.querySelector("#" + id) == null ) {
				var elem = document.createElement("div");
				elem.id = id;
				document.body.insertBefore(elem, document.body.firstChild);
			}
		}

		return utils.whenDOMReady().then(function() {
			/* Prepare body: Add QUnit DOM if missing, add CSS, ... */
			insertDIV("qunit");
			insertDIV("qunit-fixture");
		});
	}

	function onCSPViolation(e) {
		var location = e.sourceFile + ":" + e.lineNumber + ":" + e.columnNumber,
			msg = "Security policy violation: directive '" + e.violatedDirective + "'";
		if ( e.blockedURI ) {
			msg += " violated by '" + String(e.blockedURI).slice(0, 20) + "'";
		}

		if ( QUnit.config.current ) {
			QUnit.pushFailure(msg, location);
		} else {
			// should be caught and reported by QUnit's global error handler
			// if not, it will only fail the current task for the securityviolationevent
			throw new Error(msg + " at " + location);
		}
	}

	/*
	 * @const
	 */
	var QUNIT_KNOWN_OPTIONS = {
		altertitle: 1,
		collapse: 1,
		filter: 1,
		fixture: 1,
		hidepassed: 1,
		maxDepth: 1,
		module: 1,
		moduleId: 1,
		notrycatch: 1,
		noglobals: 1,
		seed: 1,
		reorder: 1,
		requireExpects: 1,
		testId: 1,
		testTimeout: 1,
		scrolltop: 1
	};

	function initTestModule(oConfig) {
		var pAfterLoader, pQUnit, pSinon, pSinonQUnitBridge, pSinonConfig, pCoverage, pTestEnv,
			sQUnitModule, sQUnitCSS, aJUnitDoneCallbacks;

		document.title = oConfig.title;

		// first configure the loader if needed
		if ( oConfig.loader ) {
			sap.ui.loader.config(oConfig.loader);
		}

		if ( oConfig.runAfterLoader ) {
			pAfterLoader = requireP( oConfig.runAfterLoader );
		} else {
			pAfterLoader = Promise.resolve();
		}

		if ( oConfig.qunit.version === "edge" || oConfig.qunit.version === true ) {
			oConfig.qunit.version = 2;
		}
		if ( typeof oConfig.qunit.version === "number" ) {

			if ( oConfig.qunit.version === 1 ) {
				sQUnitModule = "sap/ui/thirdparty/qunit";
				sQUnitCSS = "sap/ui/thirdparty/qunit.css";
			} else if ( oConfig.qunit.version === 2 ) {
				sQUnitModule = "sap/ui/thirdparty/qunit-2";
				sQUnitCSS = "sap/ui/thirdparty/qunit-2.css";
			} else {
				throw new TypeError("unsupported qunit version " + oConfig.qunit.version);
			}

			// QUnit configuration can be set in advance, we always disable the autostart
			window.QUnit = window.QUnit || {};
			QUnit.config = QUnit.config || {};
			if ( oConfig.qunit != null && typeof oConfig.qunit === 'object' ) {
				copyFiltered(QUnit.config, oConfig.qunit, QUNIT_KNOWN_OPTIONS);
			}
			QUnit.config.autostart = false;

			// now load QUnit, its CSS + the reporter bridge
			pQUnit = pAfterLoader.then(function () {
				return requireP("sap/ui/test/qunitPause");
			}).then(function() {
				utils.addStylesheet(sQUnitCSS);
				return requireP(sQUnitModule);
			}).then(function() {

				// install a mock version of the qunit-reporter-junit API to collect jUnitDone callbacks
				aJUnitDoneCallbacks = [];
				QUnit.jUnitDone = function(cb) {
					aJUnitDoneCallbacks.push(cb);
				};
				return requireP("sap/ui/qunit/qunit-junit");
			}).then(function() {
				delete QUnit.jUnitDone;
				return requireP("sap/ui/thirdparty/qunit-reporter-junit");
			}).then(function() {
				// now register the collected callbacks with the real qunit-reporter-junit API
				aJUnitDoneCallbacks.forEach(function(cb) {
					QUnit.jUnitDone(cb);
				});
				aJUnitDoneCallbacks = undefined;
			});
		}

		if ( oConfig.sinon.version === "edge" || oConfig.sinon.version === true ) {
			oConfig.sinon.version = 4;
		}
		if ( typeof oConfig.sinon.version === "number" ) {
			var sinonModule, bridgeModule;
			if ( oConfig.sinon.version === 1 ) {
				sinonModule = "sap/ui/thirdparty/sinon";
				bridgeModule = "sap/ui/thirdparty/sinon-qunit";
			} else if ( oConfig.sinon.version === 4 ) {
				sinonModule = "sap/ui/thirdparty/sinon-4";
				bridgeModule = "sap/ui/qunit/sinon-qunit-bridge";
			} else {
				throw new TypeError("unsupported sinon version " + oConfig.sinon.version);
			}

			pSinon = pAfterLoader.then(function() {
				return requireP(sinonModule);
			});

			if ( oConfig.sinon.qunitBridge && pQUnit ) {
				pSinonQUnitBridge = Promise.all([
					pQUnit,
					pSinon
				]).then(function() {
					return requireP(bridgeModule);
				});
			}

			// sinon configuration must be applied only after sinon AND bridge have been loaded,
			// they both set their own defaults
			if ( oConfig.sinon != null && typeof oConfig.sinon === 'object' ) {
				pSinonConfig = Promise.all([
					pSinon,
					pSinonQUnitBridge
				]).then(function() {
					// copy only settings that are listed in sinon.defaultConfig
					sinon.config = copyFiltered(sinon.config || {}, oConfig.sinon, sinon.defaultConfig);
					return arguments;
				});
			}

		} else if ( sQUnitModule ) {
			// shim dependencies for the bridges, based on the selected QUnit version
			// might be needed if tests load the bridge on their own
			sap.ui.loader.config({
				shim: {
					"sap/ui/thirdparty/sinon-qunit": {
						deps: [sQUnitModule, "sap/ui/thirdparty/sinon"]
					},
					"sap/ui/qunit/sinon-qunit-bridge": {
						deps: [sQUnitModule, "sap/ui/thirdparty/sinon-4"]
					}
				}
			});
		}

		pCoverage = pQUnit.then(function() {
			if ( QUnit.urlParams.coverage ) {
				// when coverage has been activated in a QUnit page via checkbox,
				// then load blanket, configure it, then load the QUnit plugin
				return requireP("sap/ui/thirdparty/blanket").then(function() {
					if ( oConfig.coverage && window.blanket ) {
						if (oConfig.coverage.only != null) {
							window.blanket.options("sap-ui-cover-only", oConfig.coverage.only);
						}
						if (oConfig.coverage.never != null) {
							window.blanket.options("sap-ui-cover-never", oConfig.coverage.never);
						}
						if (oConfig.coverage.branchTracking) {
							window.blanket.options("branchTracking", true);
						}
					}
					return requireP("sap/ui/qunit/qunit-coverage");
				}).then(function() {
					// when coverage is active, qunit-coverage sets autostart to true again
					QUnit.config.autostart = false;
				});
			} else {
				// otherwise load only the QUnit plugin
				return requireP(["sap/ui/qunit/qunit-coverage"]);
			}
		}).then(function() {
			if ( QUnit.urlParams["sap-ui-xx-csp-policy"] ) {
				document.addEventListener("securitypolicyviolation", onCSPViolation);
				QUnit.done(function() {
					document.removeEventListener("securitypolicyviolation", onCSPViolation);
				});
			}
			QUnit.config.urlConfig.push({
				id: "sap-ui-xx-csp-policy",
				label: "CSP",
				value: {
					"sap-target-level-1:report-only": "Level 1",
					"sap-target-level-2:report-only": "Level 2"
				},
				tooltip: "What Content-Security-Policy should the server send"
			});
		});

		pTestEnv = Promise.all([
			pAfterLoader,
			pQUnit,
			pSinon,
			pSinonQUnitBridge,
			pSinonConfig,
			pCoverage
		]);

		if ( oConfig.beforeBootstrap ) {
			pTestEnv = pTestEnv.then(function() {
				return requireP(oConfig.beforeBootstrap);
			});
		}

		// copy UI5 configuration
		window["sap-ui-config"] = oConfig.ui5 || {};
		if ( Array.isArray(window["sap-ui-config"].libs) ) {
			window["sap-ui-config"].libs = window["sap-ui-config"].libs.join(",");
		}

		if ( oConfig.bootCore ) {
			pTestEnv = pTestEnv.then(function() {
				return new Promise(function(resolve, reject) {
					sap.ui.require(["sap/ui/core/Core"], function(core) {
						core.boot();
						core.attachInit(resolve);
					});
				});
			});
		}

		return pTestEnv.then(function() {
			if (oConfig.autostart) {
				// first load the tests, then ensure DOM then start tests
				return requireP( oConfig.module ). // Note: accepts single module or array
					then(function(aTestModules) {
						return Promise.all(aTestModules);
					}).then(function() {
						return ensureDOM();
					}).then(function() {
						QUnit.start();
					});
			} else {
				// first ensure the DOM then load tests as tests will start QUnit already
				return ensureDOM().then(function() {
					return requireP( oConfig.module ). // Note: accepts single module or array
						then(function(aTestModules) {
							return Promise.all(aTestModules);
						});
				});
			}
		});

	}

	var oParams = new UriParameters(window.location.href),
		sSuiteName = utils.getAttribute('data-sap-ui-testsuite') || oParams.get("testsuite"),
		sTestName = utils.getAttribute('data-sap-ui-test') || oParams.get("test");

	utils.getSuiteConfig(sSuiteName).then(function(oSuiteConfig) {
		var oTestConfig = oSuiteConfig.tests[sTestName];
		if (!oTestConfig) {
			throw new TypeError("Invalid test name");
		}

		return initTestModule(oTestConfig);
	}).catch(function(oErr) {
		console.error(oErr.stack || oErr); // eslint-disable-line no-console
		if ( typeof QUnit !== "undefined" ) {
			QUnit.test("Test Starter", function() {
				throw oErr;
			});
			QUnit.start();
		} else {
			utils.whenDOMReady().then(function() {
				document.body.innerHTML = "<pre style='color:red;'>" + utils.encode(oErr.stack || oErr.message || String(oErr)) + "</pre>";
			});
		}
	});


}));
