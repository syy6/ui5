/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides class sap.ui.core.ComponentSupport
sap.ui.define([
	'sap/ui/base/DataType',
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/library',
	"sap/base/Log",
	"sap/base/util/ObjectPath",
	"sap/base/strings/camelize"
],
	function(
		DataType,
		Component,
		ComponentContainer,
		library,
		Log,
		ObjectPath,
		camelize
	) {
	"use strict";

	var ComponentLifecycle = library.ComponentLifecycle;
	var ComponentContainerMetadata = ComponentContainer.getMetadata();


	/**
	 * The class <code>sap.ui.core.ComponentSupport</code> provides functionality
	 * which is used to find declared Components in the HTML page and to create
	 * the Component instances which will be put into a ComponentContainer.
	 *
	 * @author SAP SE
	 * @public
	 * @since 1.58.0
	 * @version 1.60.42
	 * @alias sap.ui.core.ComponentSupport
	 */
	var ComponentSupport = function() {
	};


	/**
	 * Find all DOM elements with the attribute <code>data-sap-ui-component</div>
	 * and parse the attributes from these DOM elements for the settings of the
	 * <code>ComponentContainer</code> which will be placed into these DOM elements.
	 *
	 * @public
	 */
	ComponentSupport.run = function() {
		var aElements = ComponentSupport._find();
		for (var i = 0, l = aElements.length; i < l; i++) {
			var oElement = aElements[i];
			Log.debug("Parsing element " + oElement.outerHTML, "", "sap/ui/core/ComponentSupport");
			var mSettings = ComponentSupport._parse(oElement);
			ComponentSupport._applyDefaultSettings(mSettings);
			Log.debug("Creating ComponentContainer with the following settings", JSON.stringify(mSettings, 0, 2), "sap/ui/core/ComponentSupport");
			new ComponentContainer(mSettings).placeAt(oElement);
			// Remove marker so that the element won't be processed again in case "run" is called again
			oElement.removeAttribute("data-sap-ui-component");
		}
	};

	/**
	 * Find all DOM elements with the attribute <code>data-sap-ui-component</div>
	 * and parse the attributes from these DOM elements for the settings of the
	 * <code>ComponentContainer</code> which will be placed into these DOM elements.
	 *
	 * @returns {NodeList} array of <code>Node</code>s
	 * @private
	 */
	ComponentSupport._find = function() {
		return document.querySelectorAll("[data-sap-ui-component]");
	};

	/**
	 * Parses the attributes of the given DOM element and creates a settings
	 * map. Each attribute starting with <code>data-</code> will be interpret
	 * as setting and be parsed by considering the data type of the matching
	 * property in the <code>ComponentContainer</code>. As HTML is case-insensitive
	 * camel cased properties have to be written in dashed form, e.g.
	 * <code>componentCreated</code> as <code>data-component-created</code>.
	 *
	 * @param {Node} oElement the DOM element to be parsed
	 * @returns {object} settings map
	 * @private
	 */
	ComponentSupport._parse = function(oElement) {
		var mSettings = {};
		for (var i = 0, l = oElement.attributes.length; i < l; i++) {
			var oAttribute = oElement.attributes[i];
			// parse every data- property besides data-sap-ui-component
			var oParsedAttributeName = /^data-((?!sap-ui-component).+)/g.exec(oAttribute.name);
			if (oParsedAttributeName) {
				var sKey = camelize(oParsedAttributeName[1]);
				var oValue = oAttribute.value;
				// special handling for id property
				if (sKey !== "id") {
					var oProperty = ComponentContainerMetadata.getProperty(sKey);
					var oEvent = !oProperty && ComponentContainerMetadata.getEvent(sKey);
					if (!oProperty && !oEvent) {
						throw new Error("Property or event \"" + sKey + "\" does not exist in sap.ui.core.ComponentContainer");
					}
					if (oProperty) {
						var oType = DataType.getType(oProperty.type);
						if (!oType) {
							throw new Error("Property \"" + oProperty.name + "\" has no known type");
						}
						oValue = oType.parseValue(oValue);
					} else if (oEvent) {
						var fnCallback = ObjectPath.get(oValue);
						if (typeof fnCallback !== "function") {
							throw new Error("Callback handler for event \"" + oEvent.name + "\" not found");
						}
						oValue = fnCallback;
					}
				}
				mSettings[sKey] = oValue;
			}
		}
		return mSettings;
	};

	/**
	 * Applies the default settings for the <code>ComponentContainer</code>
	 * for some properties such as:
	 * <ul>
	 *   <li><code>async</code> {boolean} (<b>forced to <code>true</code></b>)</li>
	 *   <li><code>manifest</code> {boolean|string} (<b>forced to <code>true</code> if no string is provided to ensure manifest first</b>)</li>
	 *   <li><code>lifecycle</code> {sap.ui.core.ComponentLifecycle} (defaults to <code>Container</code>)</li>
	 *   <li><code>autoPrefixId</code> {boolean} (defaults to <code>true</code>)</li>
	 * </ul>
	 *
	 * @param {object} mSettings settings map to be adopted
	 * @private
	 */
	ComponentSupport._applyDefaultSettings = function(mSettings) {
		// force async loading behavior
		mSettings.async = true;

		// ignore boolean values for manifest property and force manifest first
		if (mSettings.manifest === undefined || mSettings.manifest === "true") {
			mSettings.manifest = true;
		} else if (mSettings.manifest === "false") {
			Log.error("Ignoring \"manifest=false\" for ComponentContainer of component \"" + mSettings.name + "\" as it is not supported by ComponentSupport. " +
				"Forcing \"manifest=true\"", "", "sap/ui/core/ComponentSupport");
			mSettings.manifest = true;
		}

		// different default value behavior for declarative components
		mSettings.lifecycle = mSettings.lifecycle === undefined ? ComponentLifecycle.Container : mSettings.lifecycle;
		mSettings.autoPrefixId = mSettings.autoPrefixId === undefined ? true : mSettings.autoPrefixId;
	};

	// Automatically run once
	ComponentSupport.run();

	return ComponentSupport;

});