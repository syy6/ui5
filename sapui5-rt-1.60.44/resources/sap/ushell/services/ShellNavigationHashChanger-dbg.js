// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview Shell Navigation Hash Changer Service.
 */

sap.ui.define([
    "sap/ui/core/routing/HashChanger",
    "sap/ui/thirdparty/hasher"
], function (HashChanger, hasher) {
    "use strict";

    function createInitialNavigationManager () {
        var historyLengthWhenInitial = window.history.length;

        var oManager = {
            onHashChanged: function () {
                if (window.history.length !== historyLengthWhenInitial) {
                    oManager.onHashChanged = function () {};
                    oManager.isInitialNavigation = function () { return false; };
                }
            },
            isInitialNavigation: function () {
                return true;
            }
        };

        return oManager;
    }

        /**
     * Denotes all possible events that can be emitted by the
     * ShellNavigationHashChanger. Each event is described by an object, with
     * the following attributes:
     * <pre>
     * {
     *   name: "...", // the event name that sent via fireEvent
     *   historyEntry: true // or false, to indicate whether or not a browser
     *                      // history entry should be added once the event is
     *                      // fired.
     * }
     * </pre>
     *
     * @enum {object}
     * @private
     */
    var O_EVENT = {
        HASH_SET: {
            name: "hashSet",
            historyEntry: true
        },
        HASH_REPLACED: {
            name: "hashReplaced",
            historyEntry: false
        },
        SHELL_HASH_CHANGED: {
            name: "shellHashChanged",
            historyEntry: true,
            usedByUi5HistoryDetection: true
        },
        SHELL_HASH_PARAMETER_CHANGED: {
            name: "shellHashParameterChanged",
            historyEntry: false
        },
        HASH_CHANGED: {
            name: "hashChanged",
            historyEntry: false,
            usedByUi5HistoryDetection: true
        }
    };

    var ShellNavigationHashChanger = HashChanger.extend("sap.ushell.services.ShellNavigatonHashChanger", {
        constructor : function (oConfig) {
            var urlValue;

            this.oServiceConfig = oConfig;

            // apply url parameter if present
            if (jQuery.sap.getUriParameters().get("sap-ushell-reload")) {
                if (jQuery.sap.getUriParameters().get("sap-ushell-reload") === "X" ||
                         jQuery.sap.getUriParameters().get("sap-ushell-reload") === "true") {
                    urlValue = true;
                } else {
                    urlValue = false;
                }
            }

            if (urlValue !== undefined) {
                if (typeof this.oServiceConfig !== "object") {
                    this.oServiceConfig = {};
                }
                this.oServiceConfig.reload = urlValue;
            }

            HashChanger.apply(this);
            this._initializedByShellNav = false;    // initialization flag for the shellNavigationService
            this.oURLShortening = sap.ushell.Container.getService("URLShortening");
            this.privfnShellCallback = null;
            this.privappHashPrefix = "&/";
            this.privhashPrefix = "#";
            this.aNavigationFilters = [];
            this.NavigationFilterStatus = {
                Continue : "Continue",
                Custom : "Custom",
                Abandon : "Abandon",
                Keep : "Keep"
            };
        }
    });

    /**
     * Obtains the current shell hash (with #) urlDecoded
     * Shortened(!)
     * @return {object} Object containing the shell hash
     * @private
     */
    ShellNavigationHashChanger.prototype.privgetCurrentShellHash = function () {
        var res = this.privsplitHash(hasher.getHash());
        return {
            hash : "#" + ((res && res.shellPart) ? res.shellPart : "")
        };
    };

    /**
     * Internally constructs the next hash, with #
     * shortened(!)
     * @param {string} sAppSpecific Application specific hash
     * @return {string} constructed full hash
     * @private
     */
    ShellNavigationHashChanger.prototype.privconstructHash = function (sAppSpecific) {
        var o = this.privgetCurrentShellHash();
        o.hash += sAppSpecific;
        return o;
    };

    /**
     * internal, without #
     * @param {object} oShellHash shell hash concept
     * @return {string} return constructed string
     * @private
     */
    ShellNavigationHashChanger.prototype.privconstructShellHash = function (oShellHash) {
        return sap.ushell.Container.getService("URLParsing").constructShellHash(oShellHash);
    };

    /** split a shell hash into app and shell specific part
     *  @private
     *  @returns <code>null</code>, if sHash is not a valid hash (not parseable);
     *      otherwise an object with properties <code>shellPart</code> and <code>appSpecificRoute</code>
     *      the properties are <code>null</code> if sHash is falsy
     */
    // this method is deliberately restrictive to work only on proper hashes
    //  this may be made part of URLParser
    ShellNavigationHashChanger.prototype.privsplitHash = function (sHash) {
        var oShellHash,
            oShellHashParams,
            sAppSpecificRoute;

        if (sHash === undefined || sHash === null || sHash === "") {
            return {
                shellPart : null,
                appSpecificRoute : null,
                intent: null,
                params: null
            };
        }
        // break down hash into parts
        // "#SO-ABC~CONTXT?ABC=3A&DEF=4B&/detail/1?A=B");
        oShellHash =  sap.ushell.Container.getService("URLParsing").parseShellHash(sHash);
        if (oShellHash === undefined || oShellHash === null) {
            return null;
        }

        oShellHashParams = (oShellHash.params && !jQuery.isEmptyObject(oShellHash.params)) ? oShellHash.params : null;
        sAppSpecificRoute = oShellHash.appSpecificRoute;
        oShellHash.appSpecificRoute = undefined;
        return {
            shellPart : this.privstripLeadingHash(this.privconstructShellHash(oShellHash)) || null,
            appSpecificRoute : sAppSpecificRoute || null, // ,"&/detail/1?A=B");
            intent: (oShellHash.semanticObject && oShellHash.action
                && (oShellHash.semanticObject + "-" + oShellHash.action + (oShellHash.contextRaw || ""))) || null,
            params: oShellHashParams
        };
    };

    /**
     * internal, central navigation hook that trigger hash change
     * triggers events and sets the hash
     * @param {string} sFullHash full shell hash
     * @param {string} sAppHash application specific hash
     * @param {boolean} bWriteHistory whether to create a history record (true, undefined) or replace the hash (false)
     * @private
     */
    ShellNavigationHashChanger.prototype.privsetHash = function (sFullHash, sAppHash, bWriteHistory) {
        hasher.prependHash = "";
        sFullHash = this.privstripLeadingHash(sFullHash);
        sAppHash = sAppHash || "";
        if (bWriteHistory === undefined) {
            bWriteHistory = true;
        }
        // don't call method on super class
        // we set the full hash and fire the events for the app-specific part only
        // this is necessary for consistency of all events; hashSet and hashReplaced are
        // evaluated by sap.ui.core.routing.History
        if (bWriteHistory) {
            this.fireEvent("hashSet", { sHash : sAppHash });
            hasher.setHash(sFullHash);
        } else {
            this.fireEvent("hashReplaced", { sHash : sAppHash });
            hasher.replaceHash(sFullHash);
        }
    };

    ShellNavigationHashChanger.prototype.privstripLeadingHash = function (sHash) {
        if (sHash[0] === '#') {
            return sHash.substring(1);
        }
        return sHash;
    };

    ShellNavigationHashChanger.prototype.registerNavigationFilter = function (fnFilter) {
        if (typeof fnFilter !== "function") {
            throw new Error("fnFilter must be a function");
        }
        this.aNavigationFilters.push(fnFilter);
    };

    ShellNavigationHashChanger.prototype.unregisterNavigationFilter = function (fnFilter) {
        if (typeof fnFilter !== "function") {
            throw new Error("fnFilter must be a function");
        }
        this.aNavigationFilters = this.aNavigationFilters.filter(function (fnRegisteredFilter) {
            return fnRegisteredFilter !== fnFilter;
        });
    };

    /**
     * This object can generate an arbitrary number of keys
     * and potentially store them in sequence,
     *
     * it is required to call the getNextKey function before
     * calling store(sValue)
     *
     * this.getPromise(), invoked after the last store sequence,
     * returns a promise which will be ok *after* all save sequences are
     * done
     *
     * @param {object} oComponent a ui5 component
     * @param {boolean} [bTransient] whether the AppState is supposed to be transient
     * @constructor
     * @alias sap.ushell.services.StoreContext
     * @class
     */
    function StoreContext (oComponent, bTransient) {
        this.oAppState = undefined;
        this.oPromise = (new jQuery.Deferred()).resolve();
        this.getNextKey = function () {
            this.oAppState = sap.ushell.Container.getService("AppState").createEmptyAppState(oComponent, bTransient);
            return this.oAppState.getKey();
        };
        this.store = function (sValue) {
            var nPromise;
            this.oAppState.setData(sValue);
            nPromise = this.oAppState.save();
            this.oPromise = jQuery.when(this.oPromise, nPromise);
        };
        this.getPromise = function () {
            return this.oPromise;
        };
    }

    /**
     * Compact a given parameter object if too long,
     * retaining <code> aRetainParameterList if possible
     * a member sap-intent-param with the key will be added to the
     * returned oParams object
     * @param {object} oParams a parameter object
     * @param {Array} [aRetainParameterList] the parameter list to retain
     * @param {object} [oComponent] a ui5 component, should be the root component of your application
     * @param {boolean} [bTransient] indicates a transient appstate should be created
     * @returns {promise} a promise, whose first argument on resolution is a either
     * an equivalent oParams object (or the identical one) or a new
     * parameter object with the retained url parameters and a sap-intent-param with key value
     */
    ShellNavigationHashChanger.prototype.compactParams = function (oParams, aRetainParameterList, oComponent, bTransient) {
        var oUrlParsing = sap.ushell.Container.getService("URLParsing"),
            oSaveContext,
            oCompactedParams,
            oResult,
            oPromise,
            oDeferred = new jQuery.Deferred(),
            sHash = oUrlParsing.constructShellHash({
                "target" : {
                    "semanticObject" :  "SO",
                    "action" : "action"
                },
                "params" : oParams
            }, oSaveContext);

        if (oParams === undefined || Object.keys(oParams).length === 0) {
            return oDeferred.resolve(oParams).promise();
        }

        oSaveContext = new StoreContext(oComponent, bTransient);
        oResult = this.oURLShortening.compactHash(sHash, aRetainParameterList, oSaveContext);

        // separate the parameters
        oCompactedParams = oUrlParsing.parseParameters(oResult.hash.match(/\?.*/)[0]);
        oPromise = oSaveContext.getPromise();
        oPromise.done(function () {
            oDeferred.resolve(oCompactedParams);
        }).fail(function (sMsg) {
            oDeferred.reject(sMsg);
        });
        return oDeferred;
    };

    /// protected API, only used by shell services
    /**
     * Returns a string which can be put into the DOM (e.g. in a link tag)
     * Please use CrossApplicationNavigation service and do not invoke this method directly
     * if you are an application.
     *
     * @param {Object} oArgs
     *     object encoding a semantic object and action
     *     e.g.:
     *     <pre>
     *     {
             *        target: {
             *            semanticObject: "AnObject",
             *            action: "Action"
             *        },
             *        params: {
             *            A: "B"
             *        }
             *     }
     *     </pre>
     *
     *     or
     *
     *     <pre>
     *     {
             *         target: {
             *             shellHash: "SO-36&jumper=postman"
             *         }
             *     }
     *     </pre>
     * @param {boolean} [bVerbose]
     *    whether the response should be returned in verbose format. If
     *    this flag is set to true, this function returns an object
     *    instead of a string.
     * @param {object} [oComponent]
     *    an optional instance of sap.ui.core.UIComponent
     * @param {boolean} [bAsync]
     *    indicates whether the method should return the result
     *    asynchronously. When set to <code>true</code>, the method
     *    returns a jQuery Deferred object that is resolved only after
     *    the URLShortening save operation is completed.
     *
     * @returns {object}
     *    <p>a string that can be put into an href attribute of an
     *    HTML anchor.  The returned string will always start with a
     *    hash character.</p>
     *
     *    <p>
     *    In case the <b>bVerbose</b> parameter is set to true, an
     *    object that wraps the result string will be returned
     *    instead:
     *    <pre>
     *    { hash : {string},
             *      params : {object}
             *      skippedParams : {object}
             *    }
     *    </pre>
     *    </p>
     *
     * where:
     * <ul>
     * <li><code>params</code> is an object containing non-truncated parameters</li>
     * <li><code>skippedParams</code> is an object containing truncated parameters if truncation occurred or undefined if not</li>
     * </ul>
     *
     * @methodOf sap.ushell.services.ShellNavigation#
     * @name hrefForExternal
     * @since 1.15.0
     * @private
     */
    ShellNavigationHashChanger.prototype.hrefForExternal = function (oArgs, bVerbose, oComponent, bAsync) {
        // result not encoded
        var vResultOrPromise = this.hrefForExternalNoEnc(oArgs, bVerbose, oComponent, bAsync);

        // must encode

        function encodeResult (vResult, bVerbose) {
            if (bVerbose === true) {
                vResult.hash = encodeURI(vResult.hash);
            } else {
                vResult = encodeURI(vResult);
            }
            return vResult;
        }

        if (!bAsync) {
            return encodeResult(vResultOrPromise, bVerbose);
        }

        // async case
        var oDeferred = new jQuery.Deferred();
        vResultOrPromise
            .done(function (vResult) {
                oDeferred.resolve(encodeResult(vResult, bVerbose));
            })
            .fail(oDeferred.reject.bind(oDeferred));

        return oDeferred;
    };

    /**
     * Behaves as {@link #hrefForExternal} but does not encode the
     * returned intents with encodeURI.
     *
     * @param {Object} oArgs
     *     object encoding a semantic object and action
     * @param {boolean} [bVerbose]
     *    whether the response should be returned in verbose format.
     * @param {object} [oComponent]
     *    an optional instance of sap.ui.core.UIComponent
     * @param {boolean} [bAsync]
     *    indicates whether the method should return the result
     *    asynchronously.
     *
     * @returns {object}
     *    <p>a string that can be put into an href attribute of an
     *    HTML anchor.</p>
     *
     * @methodOf sap.ushell.services.ShellNavigation#
     * @name hrefForExternal
     * @see {@link #hrefForExternal}
     * @since 1.32.0
     * @private
     */
    ShellNavigationHashChanger.prototype.hrefForExternalNoEnc = function (oArgs, bVerbose, oComponent, bAsync) {
        var oTmp,
            oPromise,
            oDeferred,
            oSaveContext = new StoreContext(oComponent),
            oResult;

        oTmp = this.privhrefForExternalNoEnc(oArgs, oSaveContext);
        if (bVerbose === true) {
            oResult = {
                hash: oTmp.hash,
                params: oTmp.params,
                skippedParams: oTmp.skippedParams
            };
        } else {
            oResult = oTmp.hash;
        }

        if (!bAsync) {
            return oResult;
        }

        oPromise = oSaveContext.getPromise();
        oDeferred = new jQuery.Deferred();
        oPromise.done(function () {
            oDeferred.resolve(oResult);
        }).fail(function (sMsg) {
            oDeferred.reject(sMsg);
        });

        return oDeferred;
    };

    /**
     * Shortened(!)
     * @param {object} oArgs arguments
     * @param {object} oSaveContext Save context
     * @return {string} Shell hash
     */
    ShellNavigationHashChanger.prototype.privhrefForExternalNoEnc = function (oArgs, oSaveContext) {
        var r;
        if (oArgs === undefined) {
            return this.privgetCurrentShellHash();
        }
        // construct url
        if (oArgs && oArgs.target && (typeof oArgs.target.semanticObject === "string" || typeof oArgs.target.shellHash === "string")) {
            r = "#" + this.privconstructShellHash(oArgs);
            return this.oURLShortening.compactHash(r, undefined, oSaveContext);
        }
        return this.privgetCurrentShellHash();
    };

    ShellNavigationHashChanger.prototype.privgetAppHash = function (oArgs) {
        var sAppHash, oShellHash;
        if (oArgs && oArgs.target && (typeof oArgs.target.shellHash === "string")) {
            oShellHash = sap.ushell.Container.getService("URLParsing").parseShellHash(oArgs.target.shellHash);
            sAppHash = oShellHash && oShellHash.appSpecificRoute;
            sAppHash = sAppHash && sAppHash.substring(2);
        }
        return sAppHash;
    };

    /**
     * returns a string which can be put into the DOM (e.g. in a link tag)
     * given an app specific hash suffix
     *
     * @param {string} sAppHash Application hash
     * @returns {string} a string which can be put into the link tag,
     *          containing the current shell hash as prefix and the
     *          specified application hash as suffix
     *
     * example: hrefForAppSpecificHash("View1/details/0/") returns
     * "#MyApp-Display&/View1/details/0/"
     * @methodOf sap.ushell.services.ShellNavigation#
     * @name parseShellHash
     * @since 1.15.0
     * @private
     */
    ShellNavigationHashChanger.prototype.hrefForAppSpecificHash = function (sAppHash) {
        return encodeURI(this.privconstructHash(this.privappHashPrefix + sAppHash).hash);
    };

    /**
     *
     * Navigate to an external target
     * Please use CrossApplicationNavigation service and do not invoke this method directly!
     *
     * @param {Object} oArgs  configuration object describing the target
     *
     *  e.g. { target : { semanticObject : "AnObject", action: "Action" },
             *         params : { A : "B" } }
     *
     * constructs sth. like    http://....ushell#AnObject-Action?A=B ....
     * and navigates to it.
     * @param {Object} oComponent runtime
     * @param {boolean} bWriteHistory
     *     set to false to invoke replaceHash
     *
     * @private
     */
    ShellNavigationHashChanger.prototype.toExternal = function (oArgs, oComponent, bWriteHistory) {
        var sHash,
            oSaveContext = new StoreContext(oComponent),
            sAppHash;
        sHash = this.privhrefForExternalNoEnc(oArgs, oSaveContext).hash; // shortened!
        sAppHash = this.privgetAppHash(oArgs);
        this.privsetHash(sHash, sAppHash, bWriteHistory);
    };

    /**
     * constructs the full shell hash and
     * sets it, thus triggering a navigation to it
     * @param {string} sAppHash specific hash
     * @param {boolean} bWriteHistory if true it adds a history entry in the browser if not it replaces the hash
     * @private
     */
    ShellNavigationHashChanger.prototype.toAppHash = function (sAppHash, bWriteHistory) {
        var sHash = this.privconstructHash(this.privappHashPrefix + sAppHash).hash;
        this.privsetHash(sHash, sAppHash, bWriteHistory);
    };


    /**
     * Initialization for the shell navigation.
     *
     * This will start listening to hash changes and also fire a hash changed event with the initial hash.
     * @param {function} fnShellCallback Shell callback
     * @protected
     * @return {boolean} false if it was initialized before, true if it was initialized the first time
     */
    ShellNavigationHashChanger.prototype.initShellNavigation = function (fnShellCallback) {
        this._oInitialNavigationManager = createInitialNavigationManager();

        if (this._initializedByShellNav) {
            jQuery.sap.log.info("initShellNavigation already called on this ShellNavigationHashChanger instance.");
            return false;
        }

        this.privfnShellCallback = fnShellCallback;

        hasher.changed.add(this.treatHashChanged, this); //parse hash changes

        if (!hasher.isActive()) {
            hasher.initialized.addOnce(this.treatHashChanged, this); //parse initial hash
            hasher.init(); //start listening for history change
        } else {
            this.treatHashChanged(hasher.getHash());
        }
        this._initializedByShellNav = true;
        return true;
    };

    /**
     * Initialization for the application
     *
     * The init method of the base class is overridden, because the hasher initialization (registration for hash changes) is already done
     * in <code>initShellNavigation</code> method. The application-specific initialization ensures that the application receives a hash change event for the
     * application-specific part if set in the  initial hash.
     * @return {boolean} false if it was initialized before, true if it was initialized the first time
     * @protected
     */
    ShellNavigationHashChanger.prototype.init = function () {
        if (this._initialized) {
            jQuery.sap.log.info("init already called on this ShellNavigationHashChanger instance.");
            return false;
        }
        // fire initial hash change event for the app-specific part
        var oNewHash = this.privsplitHash(hasher.getHash()),
            sAppSpecificRoute = oNewHash && (oNewHash.appSpecificRoute || "  ").substring(2);  // strip &/
        this.fireEvent("hashChanged", {
            newHash : sAppSpecificRoute,
            fullHash : oNewHash ? oNewHash.shellPart + oNewHash.appSpecificRoute : ""
        });
        this._initialized = true;
        return true;
    };

    /**
     * Fires the hashchanged event, may be extended to modify the hash before firing the event
     * @param {string} newHash the new hash of the browser
     * @param {string} oldHash - the previous hash
     * @protected
     */
    ShellNavigationHashChanger.prototype.treatHashChanged = function (newHash, oldHash) {
        if (this.inAbandonFlow) {
            // in case and navigation was abandon by a navigation filter, we ignore the hash reset event
            return;
        }

        this._oInitialNavigationManager.onHashChanged();

        var sAppSpecificRoute,
            sOldAppSpecificRoute,
            oNewHash,
            oOldHash,
            sNewIntent,
            sOldIntent,
            sNewParameters,
            sOldParameters,
            oError,
            i,
            vFilterResult,
            sFilterResult,
            sFilterHash,
            bShouldKeep;

        newHash = this.oURLShortening.expandHash(newHash); // do synchronous expansion if possible
        oldHash = this.oURLShortening.expandHash(oldHash); // if not, the parameter remains and is expanded during NavTargetResolution
        oNewHash = this.privsplitHash(newHash);
        oOldHash = this.privsplitHash(oldHash);

        if (!oNewHash) {
            // illegal new hash; pass the full string and an error object
            oError = new Error("Illegal new hash - cannot be parsed: '" + newHash + "'");
            this.fireEvent("shellHashChanged", {
                newShellHash : newHash,
                newAppSpecificRoute : null,
                oldShellHash : (oOldHash ? oOldHash.shellPart : oldHash),
                error: oError
            });
            this.privfnShellCallback(newHash, null, (oOldHash ? oOldHash.shellPart : oldHash), (oOldHash ? oOldHash.appSpecificRoute : null), oError);
            return;
        }

        sNewIntent = oNewHash.intent;

        if (!oOldHash) {
            // illegal old hash - we are less restrictive in this case and just set the complete hash as shell part
            oOldHash = {
                shellPart: oldHash,
                appSpecificRoute: null
            };
        } else {
            sOldIntent = oOldHash.intent;
        }

        //call all navigation filters
        for (i = 0; i < this.aNavigationFilters.length; i++) {
            try {
                vFilterResult = this.aNavigationFilters[i].call(undefined, newHash, oldHash);
                sFilterResult = vFilterResult;
                if (typeof vFilterResult !== "string") {
                    sFilterResult = vFilterResult.status;
                    sFilterHash = vFilterResult.hash;
                }

                if (sFilterResult === this.NavigationFilterStatus.Custom) {
                    //filter is handling navigation - stop the navigation flow.
                    if (sFilterHash && sFilterHash.length > 0) {
                        this.inAbandonFlow = true;
                        hasher.replaceHash(sFilterHash);
                        this.inAbandonFlow = false;
                    }
                    return;
                }
                if (sFilterResult === this.NavigationFilterStatus.Abandon) {
                    //filter abandon this navigation, therefore we need to reset the hash and stop the navigation flow
                    this.inAbandonFlow = true;
                    hasher.replaceHash(oldHash);
                    this.inAbandonFlow = false;
                    return;
                }

                if (sFilterResult === this.NavigationFilterStatus.Keep) {
                    bShouldKeep = true;
                }
            } catch (e) {
                jQuery.sap.log.error("Error while calling Navigation filter! ignoring filter...", e.message, "sap.ushell.services.ShellNavigation");
            }
        }

        if (bShouldKeep) {
            // parameter fullHash is passed twice for consistency
            this.fireEvent("hashChanged", {
                newHash : newHash,
                oldHash : oldHash,
                fullHash : newHash
            });
            return;
        }
        //else - continue with navigation

        // second condition holds true for initial load where we always want to trigger the shell navigation
        var bAppSpecificChange = sNewIntent === sOldIntent && oldHash !== undefined;
        if (bAppSpecificChange && !this._parametersChanged(oNewHash.params, oOldHash.params)) {
            sAppSpecificRoute = (oNewHash.appSpecificRoute || "  ").substring(2);  // strip &/
            sOldAppSpecificRoute = (oOldHash.appSpecificRoute || "  ").substring(2);  // strip &/
            jQuery.sap.log.info("Inner App Hash changed from '" + sOldAppSpecificRoute + "' to '" + sAppSpecificRoute + "'", null, "sap.ushell.services.ShellNavigation");
            // an empty string has to be propagated!
            this.fireEvent("hashChanged", {
                newHash : sAppSpecificRoute,
                oldHash : sOldAppSpecificRoute,
                fullHash : newHash
            });
            return;
        }

        if (bAppSpecificChange && this.hasListeners("shellHashParameterChanged") ) {
            sNewParameters = sap.ushell.Container.getService("URLParsing").paramsToString(oNewHash.params);
            sOldParameters = sap.ushell.Container.getService("URLParsing").paramsToString(oOldHash.params);

            jQuery.sap.log.info("Shell hash parameters changed from '" + sOldParameters + "' to '" + sNewParameters  + "'", null, "sap.ushell.services.ShellNavigation");
            this.fireEvent("shellHashParameterChanged", {
                oNewParameters : oNewHash.params,
                oOldParameters : oOldHash.params
            });
            return;
        }

        // if there is no listener for shellHashParameterChanged then we proceed with cross app navigation

        if (oldHash !== undefined && this.oServiceConfig && this.oServiceConfig.reload) {
            // the event handler is fired before hasher.js performs the actual hash update in the browser
            // thus we must update the hash here prior to triggering reload
            // (technically, _encodeHash() of hasher.js would be more appropriate)
            window.location.hash = '#' + encodeURI(newHash);
            window.location.reload();
        }

        jQuery.sap.log.info("Outer shell hash changed from '" + oldHash + "' to '" + newHash + "'", null, "sap.ushell.services.ShellNavigation");
        // all Shell specific callback -> load other app !
        this.fireEvent("shellHashChanged", { newShellHash : oNewHash.shellPart, newAppSpecificRoute : oNewHash.appSpecificRoute, oldShellHash :  oOldHash.shellPart, oldAppSpecificRoute : oOldHash.appSpecificRoute});
        this.privfnShellCallback(oNewHash.shellPart, oNewHash.appSpecificRoute, oOldHash.shellPart, oOldHash.appSpecificRoute);
    };

    /**
     * Returns a boolean value indicating whether only the first navigation
     * occurred.
     *
     * @returns {boolean}
     *   Whether the first navigation occurred (true) or a successive
     *   navigation occurred (false) after the ShellNavigationHashChanger was
     *   initialized. An undefined value indicates that the
     *   ShellNavigationHashChanger object initialization was not yet
     *   triggered.
     *
     * @private
     */
    ShellNavigationHashChanger.prototype.isInitialNavigation = function () {
        return this._oInitialNavigationManager && this._oInitialNavigationManager.isInitialNavigation();
    };

    /**
     * Checks whether shell hash parameters have changed
     * @param {object} oNewParameters the new parameters
     * @param {object} oOldParameters the new parameters
     * @returns {boolean} <code>true</code> if oNewParameters are not equal to oOldParameters
     * @private
     */
    ShellNavigationHashChanger.prototype._parametersChanged = function (oNewParameters, oOldParameters) {
        return !jQuery.sap.equal(oNewParameters, oOldParameters);
    };

    /**
     * Sets the hash to a certain value, this hash is prefixed by the shell hash if present
     * @param {string} sHash the hash
     *  adds a history entry in the browser if not it replaces the hash
     * @protected
     */
    ShellNavigationHashChanger.prototype.setHash = function (sHash) {
        this.toAppHash(sHash, /*bWriteHistory*/true);
    };

    /**
     * Replaces the hash to a certain value. When using the replace function no browser history is written.
     * If you want to have an entry in the browser history, please use set setHash function.
     * this function has a side effect
     * @param {string} sHash the hash
     * @protected
     */
    ShellNavigationHashChanger.prototype.replaceHash = function (sHash) {
        this.toAppHash(sHash, /* bWriteHistory */false);
    };


    /**
     * Gets the current hash
     *
     * Override the implementation of the base class and just return the application-specific hash part
     * @returns {string} returned string
     * @protected
     */
    ShellNavigationHashChanger.prototype.getHash = function () {
        return this.getAppHash();
    };

    /**
     * Gets the current application-specific hash part
     *
     * @returns {string} the current application hash
     * @private
     */
    ShellNavigationHashChanger.prototype.getAppHash = function () {
        var oNewHash = this.privsplitHash(hasher.getHash()),
            sAppSpecificRoute = oNewHash && (oNewHash.appSpecificRoute || "  ").substring(2);  // strip &/
        return sAppSpecificRoute;
    };

    /**
     * Determines whether an inner app navigation will be made, given the old
     * and the new hash. This method should be called internally by FLP
     * components only and it's not intended for any other usage.
     *
     * @param {string} sNewHash
     *   The new hash as returned by <code>treatHashChanged</code>
     *
     * @param {string} sOldHash
     *   The old hash as returned by <code>treatHashChanged</code>
     *
     * @return {boolean}
     *   Whether the navigation should be made within the same application.
     *
     * @protected
     */
    ShellNavigationHashChanger.prototype.isInnerAppNavigation = function (sNewHash, sOldHash) {
        var oNewHash = this.privsplitHash(sNewHash) || {};
        var oOldHash = this.privsplitHash(sOldHash) || {};

        var bHaveSameIntent = this._haveSameIntent(sNewHash, sOldHash);
        var bHaveDifferentIntentParameters = !this._parametersChanged(oNewHash.params, oOldHash.params);

        return bHaveSameIntent && bHaveDifferentIntentParameters;
    };

    /**
     * Determines whether two hash fragments have the same intent during an
     * app-to-app navigation.
     *
     * @param {string} sNewHash
     *   The new hash as returned by <code>treatHashChanged</code>
     *
     * @param {string} sOldHash
     *   The old hash as returned by <code>treatHashChanged</code>
     *
     * @return {boolean}
     *   Whether two hash fragments have the same semantic object and action
     *   during an app-to-app navigation.
     *
     * @private
     */
    ShellNavigationHashChanger.prototype._haveSameIntent = function (sNewHash, sOldHash) {
        var oNewHash = this.privsplitHash(sNewHash) || {};
        var oOldHash = this.privsplitHash(sOldHash) || {};

        var sNewIntent = oNewHash.intent;
        var sOldIntent = oOldHash.intent;

        return sNewIntent === sOldIntent
            && sOldHash !== undefined;  // Occurs during initial load
    };

    /**
     * Cleans the event registration
     * @see sap.ui.base.Object.prototype.destroy
     * @protected
     */
    ShellNavigationHashChanger.prototype.destroy = function () {
        hasher.changed.remove(this.treatHashChanged, this);
        HashChanger.prototype.destroy.apply(this, arguments);
    };

        /**
     * Returns all events triggered by this module into an array.
     *
     * @returns {object[]}
     *  the ShellNavigationHashChanger.EVENT enum items wrapped into an array.
     *
     * @private
     */
    ShellNavigationHashChanger.prototype._getAllEvents = function () {
        return Object.keys(O_EVENT).map(function (sEvent) {
            return O_EVENT[sEvent];
        });
    };

    /**
     * Returns the name of events that would not cause an entry to be added in
     * the history once triggered.
     *
     * @returns {string[]}
     *   An array containing event names.
     *
     * @protected
     */
    ShellNavigationHashChanger.prototype.getReplaceHashEvents = function () {
        return this._getAllEvents().filter(function (oEvent) {
            return oEvent.historyEntry === false;
        }).map(function (oEvent) {
            return oEvent.name;
        });
    };

    /**
     * Returns the name of events that would cause an entry to be added in the
     * history once triggered.
     *
     * @returns {string[]}
     *   An array containing event names.
     *
     * @protected
     */
    ShellNavigationHashChanger.prototype.getSetHashEvents = function () {
        return this._getAllEvents().filter(function (oEvent) {
            return oEvent.historyEntry === true;
        }).map(function (oEvent) {
            return oEvent.name;
        });
    };

    return ShellNavigationHashChanger;
}, true /* bExport */);
