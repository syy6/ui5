/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */

/**
 * Abstract Model adapter
 *
 * @experimental
 * @abstract
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery", "./BaseAdapter"
], function(jQuery, BaseAdapter) {
	"use strict";

	var ObjectAdapter = BaseAdapter.extend("sap.ui.mdc.experimental.provider.model.ObjectAdapter", {

		constructor: function(oModel, sModelName, sContextName, Base) {
			var SuperAdapter = BaseAdapter;

			if (Base) {
				jQuery.extend(SuperAdapter.prototype, Base.prototype);
				SuperAdapter.prototype.constructor = BaseAdapter;
			}

			SuperAdapter.prototype.constructor.apply(this, arguments);

			this.putProperty("collection", this.collection);
			this.putProperty("keys", this.keys);
			this.putProperty("fields", this.fields);
			this.putProperty("relations", this.relations);
			this.putProperty("filterRestrictions", this.filterRestrictions);
			this.putProperty("sortRestrictions", this.sortRestrictions);
			this.putProperty("chartInfo", this.chartInfo);
			this.putProperty("tableInfo", this.tableInfo);
			this.putProperty("contactInfo", this.contactInfo);
		},

		kind: function() {
			return 'object';
		},

		/**
		 * The path to the object as a collection
		 *
		 * @return {string} A binding path
		 */
		collection: function() {
			throw new Error("ap.ui.mdc.experimental.provider.model.ObjectAdapter:  method collection must be redefined");
		},

		/**
		 *
		 */
		keys: function() {

		},
		/**
		 * A map of the object fields
		 *
		 * @return {object} A named array of field adapters
		 * @public
		 */
		fields: function() {
			throw new Error("ap.ui.mdc.experimental.provider.model.ObjectAdapter:  method fields must be redefined");
		},
		/**
		 * The relations of the corresponding object
		 */
		relations: function() {
			throw new Error("ap.ui.mdc.experimental.provider.model.ObjectAdapter:  method relations must be redefined");
		},
		/**
		 * The filter Restrictions
		 */
		filterRestrictions: function() {
			throw new Error("ap.ui.mdc.experimental.provider.model.ObjectAdapter:  method filterRestrictions must be redefined");
		},
		/**
		 * The sort Restrictions
		 */
		sortRestrictions: function() {
			throw new Error("ap.ui.mdc.experimental.provider.model.ObjectAdapter:  method sortRestrictions must be redefined");
		},
		/**
		 * Chart Information
		 */
		chartInfo: function(sQualifier) {
			throw new Error("ap.ui.mdc.experimental.provider.model.ObjectAdapter:  method chartInfo must be redefined");
		},
		/**
		 * Chart Information
		 */
		tableInfo: function(sQualifier) {
			throw new Error("ap.ui.mdc.experimental.provider.model.ObjectAdapter:  method tableInfo must be redefined");
		},
		/**
		 * Contact Information
		 */
		contactInfo: function() {
			throw new Error("ap.ui.mdc.experimental.provider.model.ObjectAdapter:  method contactInfo must be redefined");
		},
		/**
		 * The relation of the object in concern of the path
		 */
		relation: function(sPath) {
			return null;
		}
	});

	return ObjectAdapter;

});