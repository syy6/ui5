/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/Control',
	'sap/ui/model/json/JSONModel',
	'./FilterFieldRenderer',
	'sap/m/MultiInput',
	'sap/m/Token',
	'sap/ui/model/Filter',
	'sap/ui/model/Sorter',
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/mdc/base/type/DateRange",
	'sap/ui/mdc/library',
	"sap/base/Log",
	"sap/ui/dom/containsOrEquals",
	"sap/base/util/ObjectPath"
], function(
	jQuery,
	Control,
	JSONModel,
	FilterFieldRenderer,
	MultiInput,
	Token,
	Filter,
	Sorter,
	ManagedObjectModel,
	ManagedObjectObserver,
	DateRange,
	library,
	Log,
	containsOrEquals,
	ObjectPath
) {
	"use strict";

	var EditMode = library.EditMode;

	/**
	 * Constructor for a new FilterField.
	 * A FilterField can be used to create conditions for a ListBinding.
	 * The FilterField publishes its properties and aggregations to the content as a model <code>$filterField</code> to which the internal content can bind.
	 * This model is local to the content aggregation and cannot be used outside the field's context.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.60.42
	 *
	 * @constructor
	 * @alias sap.ui.mdc.base.FilterField
	 * @author SAP SE
	 * @version 1.60.42
	 * @since 1.48.0
	 *
	 * @private
	 * @experimental
	 * @sap-restricted
	 */
	var FilterField = Control.extend("sap.ui.mdc.base.FilterField", /* @lends sap.ui.mdc.base.FilterField.prototype */ {
		constructor: function(sId, mSettings) {
			this._oManagedObjectModel = null;
			this._oActiveDelegate = null;
			Control.apply(this, arguments);
		},
		metadata: {
			properties: {

				//TODO
				showValueHelp: {
					type: "boolean",
					group: "Data",
					defaultValue: true
				},

				/**
				 * The data type that should be used for the filter field as defined in the corresponding data model.
				 * A data type should be a simple types class name like "sap.ui.model.type.String". If the data type is not
				 * defined the filter field will not be able to determine the right visualization and might only allow limited functionality.
				 */
				dataType: {
					type: "any",
					group: "Data",
					defaultValue: "sap.ui.model.type.String"
				},

				dataTypeConstraints: {
					type: "object",
					group: "Data",
					defaultValue: null
				},

				dataTypeFormatOptions: {
					type: "object",
					group: "Data",
					defaultValue: null
				},

				/**
				 * Defines the path of the filter field that is used to create and show conditions.
				 * The path normally represents a simple property in the corresponding model that should be used
				 * for filtering. In some cases it could also be required to filter for nested model structures.
				 * In such cases use a path to the property separated by slashes.
				 */
				fieldPath: {
					type: "string",
					group: "Data",
					defaultValue: null
				},

				/**
				 * Defines the width of the filter field.
				 *
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: "15rem"
				},

				/**
				 * Defines whether the filter field is editable.
				 * @deprecated Since 1.50, use editMode instead.
				 */
				editable: {
					type: "boolean",
					group: "Data",
					defaultValue: true
				},

				/**
				 * Whether the field is editable. Only Editable, ReadOnly and Disabled is supported.
				 */
				editMode: {
					type: "sap.ui.mdc.EditMode",
					group: "Data",
					defaultValue: EditMode.Editable
				},

				/**
				 * Sets the maximum amount of conditions that are allowed for this field.
				 *
				 * The default value of -1 indicates that an unlimited amount of conditions can defined.
				 */
				maxConditions: {
					type: "int",
					group: "Behavior",
					defaultValue: -1
				},

				/**
				 * Defines a short hint intended to aid the user with data entry when the control has no value.
				 */
				placeholder: {
					type: "string",
					group: "Behavior",
					defaultValue: ""
				},

				/**
				 * Indicates that at least one valid condition needs to be contained in the filter field.
				 * TODO: Raise an error for the field if required entry is not fulfilled. To be clarified, when this error should be raised.
				 */
				required: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Visualizes the validation state of the control, e.g. <code>Error</code>, <code>Warning</code>, <code>Success</code>.
				 */
				valueState: {
					type: "sap.ui.core.ValueState",
					group: "Appearance",
					defaultValue: sap.ui.core.ValueState.None
				},

				/**
				 * Defines the text that appears in the value state message pop-up. If this is not specified, a default text is shown from the resource bundle.
				 */
				valueStateText: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * The condition data that is bound to the filter field.
				 *
				 * Instead the bound data needs to use the data structure defined by sap.ui.mdc.Condition.
				 */
				conditions: {
					type: "object[]",
					defaultValue: []
				}
			},
			events: {
				/**
				 * This event is fired when the value help is requested.
				 */
				valueHelpRequest: {},
				/**
				 * This event is fired when the value property of the field is changed
				 *
				 * <b>Note</b> This event is only triggered if the used content control has a change event
				 */
				change: {
					parameters: {

						/**
						 * The new added condition object which has been added/removed into/from the ConditionModel.
						 */
						value: {
							type: "object"
						},

						/**
						 * The <code>type</code> of the change.
						 */
						type: {
							type: "string"
						}, //TODO should be an enum when we know how

						/**
						 * Flag indicates if the entered <code>value</code> is valid.
						 */
						valid: {
							type: "boolean"
						}
					}
				},
				/**
				 * This event is fired when the value of the field is changed - e.g. at each keypress
				 *
				 * <b>Note</b> This event is only triggered if the used content control has a liveChange event
				 */
				liveChange: {
					parameters: {
						/**
						 * The new value of the input.
						 */
						value: {
							type: "string"
						},

						/**
						 * Indicate that ESC key triggered the event.
						 */
						escPressed: {
							type: "boolean"
						}
					}
				}
			},
			aggregations: {
				_input: {
					type: "sap.ui.core.Control",
					multiple: false,
					hidden: true
				},
				/**
				 * An optional content to visualize the field fields conditions.
				 *
				 * If content is set the filter field suppresses its default rendering and will only render the content.
				 * The content control can make use of the <code>$filterField</code< model to bind to the conditions and to the properties of
				 * the filter field.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				/**
				 * optional FieldHelp
				 */
				fieldHelp: {
					type: "sap.ui.mdc.base.FieldHelpBase",
					multiple: false
				}
			},
			publicMethods: [],
			defaultAggregation: "content"
		}
	});

	FilterField.prototype.init = function() {

		this._oManagedObjectModel = new ManagedObjectModel(this);
		this._oManagedObjectModel.setSizeLimit(1000);
		this._oManagedObjectModel.attachEvent("propertyChange", this._updateConditionModel.bind(this));

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));
		this._oObserver.observe(this, {
			aggregations: [
				"fieldHelp"
			]
		});

	};

	FilterField.prototype.onAfterRendering = function() {
		// TODO: what if only Input re-renders, but not FilterField
		// disable browsers autocomplete on the FilterField input
		var oContent = this.getAggregation("_input");
		if (oContent) {
			var oDomRef = oContent.getFocusDomRef();
			jQuery(oDomRef).attr("autocomplete", "off");
		}
	};

	function _observeChanges(oChanges) {
		if (oChanges.name == "fieldHelp" && oChanges.child) {
			_fieldHelpChanged.call(this, oChanges.child, oChanges.mutation);
		}
	}

	function _fieldHelpChanged(oFieldHelp, sMutation) {
		var bFieldHelp = false;
		if (sMutation == "remove") {
			oFieldHelp.detachEvent("select", _handleFieldHelpSelect, this);
			oFieldHelp.detachEvent("navigate", _handleFieldHelpNavigate, this);
			//     oFieldHelp.detachEvent("dataUpdate", _handleDataUpdate, this);
		} else if (sMutation == "insert") {
			oFieldHelp.attachEvent("select", _handleFieldHelpSelect, this);
			oFieldHelp.attachEvent("navigate", _handleFieldHelpNavigate, this);
			//     oFieldHelp.attachEvent("dataUpdate", _handleDataUpdate, this);
			bFieldHelp = true;
		}
		// toggle valueHelp icon on internal Input
		var oContent = this.getAggregation("_input");
		if (oContent && oContent.setShowValueHelp) {
			oContent.setShowValueHelp(bFieldHelp);
		}

	}

	function _handleFieldHelpSelect(oEvent) {
		// var sValue = oEvent.getParameter("value");
		// var sKey = oEvent.getParameter("key");

		// var oSource = this.getAggregation("_input");
		// var oType = this._getDataType();
		// var oConditionModel = this.getBinding("conditions").getModel();
		// var oOperator = this.getFilterOperatorConfig().getOperator("EEQ");
		// if (oOperator && oOperator.test("==" + sKey, oType)) {
		// 	var oCondition = oConditionModel.addCondition(oConditionModel.createItemCondition(this.getFieldPath(), sKey, sValue));
		// 	oSource.setValue("");
		// 	this.fireChange({ value: oCondition, type: "added", valid: true });
		// }
	}

	function _handleFieldHelpNavigate(oEvent) {
		var sValue = oEvent.getParameter("value");
		// var sKey = oEvent.getParameter("key");

		//TODO: API on Input to update value without property????
		var oContent = this.getAggregation("_input");
		if (oContent && oContent.setDOMValue) {
			oContent.setDOMValue(sValue);
			oContent._doSelect();
		}

		this.fireLiveChange({
			value: sValue
		});
	}

	FilterField.prototype._fireValueHelpRequest = function(oEvent) {
		if (this.hasListeners("valueHelpRequest")) {
			this.fireValueHelpRequest(oEvent);
			return;
		}

		var oFieldHelp = this.getFieldHelp();
		if (oFieldHelp) {
			//var sValue = this.getAggregation("_input").getValue();
			oFieldHelp.setFilterValue(" "); // sValue
			oFieldHelp.setConditions([]);
			oFieldHelp.toggleOpen();
		}
	};

	FilterField.prototype.onsapup = function(oEvent) {
		var oFieldHelp = this.getFieldHelp();

		if (oFieldHelp) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
			oFieldHelp.navigate(-1);
		}

	};

	FilterField.prototype.onsapdown = function(oEvent) {
		var oFieldHelp = this.getFieldHelp();

		if (oFieldHelp) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
			oFieldHelp.navigate(1);
		}

	};

	/**
	 * Returns the FilterOpConfig for the ListBinding, which is filtered by this FilterBar. Only available once model etc. are available.
	 */
	FilterField.prototype.getFilterOperatorConfig = function() {
		if (!this._oFilterOpConfig && this.getBinding("conditions")) {
			var oConditionModel = this.getBinding("conditions").getModel();
			this._oFilterOpConfig = oConditionModel.getFilterOperatorConfig();
		}
		return this._oFilterOpConfig;
	};

	/*
	 * Updates the conditions
	 */
//	FilterField.prototype.updateConditions = function() {
//		var oBinding = this.getBinding("conditions");
//		if (oBinding && this._oManagedObjectModel) {
//			//update the model async
//			this._oManagedObjectModel.checkUpdate(true, true);
//
//			oBinding.getModel().addFilterField(this);
//		}
//		return this;
//	};
	FilterField.prototype.updateProperty = function(sName) {
		Control.prototype.updateProperty.apply(this, arguments);

		if (sName == "conditions" && !this._bFFAdded) {
			var oBinding = this.getBinding("conditions");
			if (oBinding) {
				oBinding.getModel().addFilterField(this);
				this._bFFAdded = true;
			}
		}
		return this;
	};

	FilterField.prototype.setWidth = function(sWidth) {
		var sOldWidth = this.getWidth();

		this.setProperty("width", sWidth, true);
		if (sOldWidth != this.getWidth()) {
			var oInner = this.getAggregation("_input");
			if (oInner) {
				//update the inner control properties
				oInner.setWidth(sWidth);
			}
		}

		return this;
	};

	FilterField.prototype.setEditable = function(bEditable) {
		var bOldEditable = this.getEditable();

		this.setProperty("editable", bEditable, true);
		if (bOldEditable != this.getEditable()) {
			var oInner = this.getAggregation("_input");
			if (oInner) {
				//update the inner control properties
				oInner.setEditable(bEditable);
			}
		}

		return this;
	};

	FilterField.prototype.setPlaceholder = function(sPlaceholder) {
		var sOldPlaceholder = this.getPlaceholder();

		this.setProperty("placeholder", sPlaceholder, true);
		if (sOldPlaceholder != this.getPlaceholder()) {
			var oInner = this.getAggregation("_input");
			if (oInner) {
				//update the inner control properties
				oInner.setPlaceholder(sPlaceholder);
			}
		}

		return this;
	};

	FilterField.prototype.setMaxConditions = function(iMaxConditions) {
		this.setProperty("maxConditions", iMaxConditions, true);

		return this;
	};

	FilterField.prototype.setRequired = function(bRequired) {
		var bOldRequired = this.getRequired();

		this.setProperty("required", bRequired, true);
		if (bOldRequired != this.getRequired()) {
			var oInner = this.getAggregation("_input");
			if (oInner) {
				//update the inner control properties
				oInner.setRequired(bRequired);
			}
		}

		return this;
	};

	/*
	 * Overwrite if bind aggregation for special handling of condition aggregation
	 * Filter is created and added, also sorter for position.
	 * Custom sorter and filter are still used
	 *
	 * @see sap.ui.base.ManagedObject#bindAggregation
	 *
	 * @param {string} sName the name of the aggregation
	 * @param {object} sName the name of the aggregation
	 *
	 * @returns {sap.ui.mdc.base.FilterField} Returns <code>this</code> to allow method chaining
	 *
	 * @private
	 */
//	FilterField.prototype.bindAggregation = function(sName, oBindingInfo) {
//		if (sName === "conditions") {
//			var sFieldPath = this.getFieldPath();
//			this.sFieldPathUpper = this.getFieldPath().toUpperCase();
//			if (sFieldPath && !oBindingInfo.filters) {
//				oBindingInfo.filters = new sap.ui.model.Filter({
//					path: "fieldPath",
//					test: this._matchFieldPath.bind(this)
//				});
//			}
//			if (!oBindingInfo.sorter) {
//				oBindingInfo.sorter = new sap.ui.model.Sorter("position", false);
//			}
//		}
//		return Control.prototype.bindAggregation.apply(this, [
//			sName, oBindingInfo
//		]);
//	};
//TODO: do we need to sort the conditions?????
	FilterField.prototype._matchFieldPath = function(vValue) {
		var sFieldPath = this.sFieldPathUpper;
		//var sFieldPath = this.getFieldPath(); //.toUpperCase();
		return sFieldPath === vValue;
	};

	/*
	 * Sets the field name. The bound list of conditions is filtered by the field name. If no field name is given
	 * the filter fields displays all conditions of the bound condition list.
	 * @param {string} sValue the value for the fields name.
	 * @returns {sap.ui.mdc.base.FilterField} Returns <code>this</code> to allow method chaining
	 *@pubic
	 */
//	FilterField.prototype.setFieldPath = function(sValue) {
//		var sOld = this.getFieldPath();
//		this.setProperty("fieldPath", sValue);
//		if (sOld !== this.getFieldPath() && this.mBindingInfos["conditions"]) {
//			this.sFieldPathUpper = this.getFieldPath().toUpperCase();
//
//			var oFilter = new Filter({
//				path: "fieldPath",
//				test: this._matchFieldPath.bind(this)
//			});
//
//			var oBinding = this.getBinding("conditions");
//			if (oBinding) {
//				oBinding.filter(oFilter);
//			} else {
//				this.mBindingInfos["conditions"].filters = oFilter;
//			}
//		}
//
//		// if (sOld !== this.getFieldPath()) {
//		// 	this.bindProperty("valueState", { path: "sap.fe.cm>/fieldPath/" + sValue + "/valueState", mode: "OneWay"});
//		// 	this.bindProperty("valueStateText", { path: "sap.fe.cm>/fieldPath/" + sValue + "/valueStateText", mode: "OneWay"});
//		// }
//		return this;
//	};

	/**
	 * Handle the token update event from an inner MultiInput.
	 * It removes the corresponding items from the model or adds a token if the entered text is valid.
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	FilterField.prototype._handleTokenUpdate = function(oEvent) {
		var sEvent = oEvent.getId(),
			sValue, oBinding, oCondition, aOperators, oNewOperator, oOperator;

		// jQuery.sap.log.info("mdc:FilterField", "_handleTokenUpdate for " + sEvent);

		if (sEvent === "tokenUpdate") {
			if (oEvent.getParameter("type") === "added") {
				sEvent = "change";
				sValue = oEvent.getParameter("addedTokens")[0].getText().trim(); //TODO only one added token will be handled
			}
			if (oEvent.getParameter("type") === "removed") {
				var aRemovedTokens = oEvent.getParameter("removedTokens"),
					aContexts = [];
				aRemovedTokens.forEach(function(o) {
					aContexts.push(o.getBindingContext("$filterField"));
				});
				oBinding = this.getBinding("conditions");
				oBinding.getModel().deleteConditions(aContexts, oBinding); // TODO: use logic inside FilterField to just update the conditions.
			}
		}

		if (sEvent === "change") {
			Log.info("mdc:FilterField", "_handleTokenUpdate for " + sEvent);

			var oSource = oEvent.getSource(),
				oType = this._getDataType(),
				type = oType.getMetadata().getName();

			oBinding = this.getBinding("conditions");

			if (oSource instanceof sap.m.Select) {
				sValue = oEvent.getParameter("selectedItem").getText();
			} else {
				sValue = sValue || oEvent.getParameter("value");
				sValue = sValue.trim();
			}

			if (oEvent.oSource.setSelectedKey) {
				// :-(
				oEvent.oSource.setSelectedKey(); // reset the last selected Key of the input, otherwise the last selected item will be set back by the renderer and we get a change event with the last selected item text
			}

			Log.info("mdc:FilterField", "_handleTokenUpdate sValue " + sValue);

			if (!sValue) {
				if (oSource instanceof sap.m.MultiInput) {
					// oSource.setValue("");
//				} else if (this.getMaxConditions() >= 0 && oBinding.getModel().getConditions(this.getFieldPath()).length > 0) {
//					oBinding.getModel().removeCondition(this.getFieldPath(), 0);
				} else if (this.getMaxConditions() >= 0 && this.getConditions().length > 0) {
					this.getConditions().splice(0, 1);
				}

				oBinding.getModel().removeUIMessage(this.getFieldPath());
				return;
			}

			if (oSource instanceof sap.m.DateRangeSelection) {
				oOperator = this.getFilterOperatorConfig().getOperator("BT");
				sValue = sValue.replace(" - ", "...");
				oCondition = oOperator.getCondition(sValue, oType);
				if (oCondition) {
					oCondition.fieldPath = this.getFieldPath();
//					oBinding.getModel().addCondition(oCondition);
					this.setConditions(this.getConditions().push(oCondition));
					this.fireChange({
						value: oCondition,
						type: "added",
						valid: true
					});

					if (this.getMaxConditions() >= 0 && oBinding.getModel().getConditions(this.getFieldPath()).length > 1) {
						oBinding.getModel().removeCondition(this.getFieldPath(), 0);
					}
					return;
				}
			}

			// to prevent the change handling when an item is pressed from the fieldHelp (focus is on the FieldHelp)
			if (this.getFieldHelp()) {
				if (containsOrEquals(this.getFieldHelp()._getPopover().getFocusDomRef(), document.activeElement)) {
					return;
				}
				if (this.getFieldHelp()._getPopover().isOpen() && this.getFieldHelp().getConditions().length > 0) {
					return;
				}
			}

			// find the suitable operators
			aOperators = this.getFilterOperatorConfig().getMatchingOperators(type, sValue);

			// use default operator if nothing found
			if (aOperators.length === 0) {
				// default operation
				var sDefaultOperator = this.getFilterOperatorConfig().getDefaultOperator(type);
				oNewOperator = this.getFilterOperatorConfig().getOperator(sDefaultOperator);
				sValue = oNewOperator ? oNewOperator.format([
					sValue
				]) : sValue;
			} else {
				oNewOperator = aOperators[0]; // TODO: multiple matches?
			}

			try {
				if (oNewOperator && oNewOperator.test(sValue, oType)) {
					oOperator = oNewOperator;
					oBinding.getModel().removeUIMessage(this.getFieldPath());
				}
			} catch (err) {
				oBinding.getModel().setUIMessage(this.getFieldPath(), err.message);
			}

			if (oOperator) {
				oCondition = oOperator.getCondition(sValue, oType);
				if (oCondition) {
					oCondition.fieldPath = this.getFieldPath();
//					oBinding.getModel().addCondition(oCondition);
					var aConditions = this.getConditions();
					aConditions.push(oCondition);
					this.setConditions(aConditions);
					this.fireChange({
						value: oCondition,
						type: "added",
						valid: true
					});

					if (oSource instanceof sap.m.MultiInput) {
						oSource.setValue("");
					}
					if (oSource instanceof sap.m.Select || oSource instanceof sap.m.DatePicker || oSource instanceof sap.m.TimePicker) {
						if (this.getMaxConditions() >= 0 && oBinding.getModel().getConditions(this.getFieldPath()).length > 1) {
							oBinding.getModel().removeCondition(this.getFieldPath(), 0);
						}
					}
				}
			}
		}
	};

	//TODO: does not return the aggregation what might be strange for the API (getter should return what is set)
	/*
	 * Returns the currently bound conditions
	 * The method is used by the managed object model to retrieve the data for the inner control.
	 * It needs to pass on the data as an array as we do not have other instances.
	 * TODO: It might be nice to get the list of data from the binding as well.
	 */
//	FilterField.prototype.getConditions = function() {
//		if (this.getBinding("conditions")) {
//			//				var aContexts = this.getBinding("conditions").getContexts();
//			//				return this.getBinding("conditions").getModel().getData().conditions;
//
//			//				var oConditionsBinding = this.getBinding("conditions");
//			//				oConditionsBinding.bUseExtendedChangeDetection = true;
//
//			var aContexts = this.getBinding("conditions").getContexts(),
//				aData = [];
//			for (var i = 0; i < aContexts.length; i++) {
//				aData.push(aContexts[i].getProperty());
//			}
//			return aData;
//		}
//		return [];
//	};

	var formatOperator = function(oContext) { // oContext is a condition
		var sResult = "";
		if (oContext) {
			var oOperator = this.getFilterOperatorConfig().getOperator(oContext.operator);
			var aValues = oContext.values;
			sResult = oOperator.format(aValues, oContext, this._getDataType());
		}
		return sResult;
	};

	/**
	 * Creates the default MultiInput for the FilterField
	 * @returns {sap.ui.core.Control} input control
	 * @private
	 */
	FilterField.prototype._getDefaultInput = function() {
		var oControl;

		if (!this.getAggregation("_input")) {

			var regexp = new RegExp("^\\*(.*)\\*|\\$search$");
			if (regexp.test(this.getProperty("fieldPath")) && this.getMaxConditions() === 1) {
				oControl = new sap.m.SearchField(this.getId() + "-inner", {
					value: {
						path: "$filterField>conditions/0/values/0",
						mode: "OneWay"
					},
					search: function(oEvent) {
						var oBinding = oEvent.oSource.getParent().getBinding("conditions");
						var oConditionModel = oBinding.getModel();
						oConditionModel.applyFilters(true);
					},
					liveChange: function(oEvent) {
						var oFF = oEvent.oSource.getParent();
						var sValue = oEvent.getParameter("newValue");

						if (this.iChangeTimer) {
							clearTimeout(this.iChangeTimer);
							delete this.iChangeTimer;
						}
						this.iChangeTimer = setTimeout(function() {
							var oOperator = oFF.getFilterOperatorConfig().getOperator("Contains");
							if (oOperator && oOperator.test("*" + sValue + "*")) {
								var oBinding = oFF.getBinding("conditions");
								var oConditionModel = oBinding.getModel();
//								var oCondition = oBinding.getModel().createCondition(oFF.getFieldPath(), "Contains", [sValue]);
//
//								oConditionModel.removeAllConditions(oFF.getFieldPath());
//								if (sValue) {
//									oConditionModel.addCondition(oCondition);
//								}
								if (sValue) {
									var oCondition = oConditionModel.createCondition(oFF.getFieldPath(), "Contains", [sValue]);
									oFF.setConditions([oCondition]);
								} else {
									oFF.setConditions([]);
								}
							}
						}, 400);

					}.bind(this)
				});

			} else if (this.getProperty("dataType").indexOf("Boolean") > -1 && this.getMaxConditions() === 1) {
				//TODO checking the Type via getType does not work because the _createType at this point of time fails.

				// if (this._getDataType().getMetadata().getName() === "sap.ui.model.type.Boolean") {
				// var oCombo = new sap.m.ComboBox(this.getId() + "-inner", {
				oControl = new sap.m.Select(this.getId() + "-inner", {
					//editable: this.getEditable(),
					width: this.getWidth(),
					//placeholder: this.getPlaceholder(),
					//required: this.getRequired(),
					selectedKey: "{$filterField>conditions/0/values/0}",
					valueState: {
						path: "$filterField>/valueState",
						mode: "OneWay"
					},
					valueStateText: {
						path: "$filterField>/valueStateText",
						mode: "OneWay"
					},
					items: [
						new sap.ui.core.Item({
							key: "",
							text: ""
						}), new sap.ui.core.Item({
							key: false,
							text: this._getDataType().formatValue(false, "string")
						}), new sap.ui.core.Item({
							key: true,
							text: this._getDataType().formatValue(true, "string")
						})
					]
				});

			} else if (this.getProperty("dataType").indexOf(".Time") > -1 && this.getMaxConditions() === 1) {
				oControl = new sap.m.TimePicker(this.getId() + "-inner", {
					editable: {
						path: "$filterField>editMode",
						formatter: _getEditable
					},
					enabled: {
						path: "$filterField>editMode",
						formatter: _getEnabled
					},
					width: "{$filterField>width}",
					required: "{$filterField>required}",
					// dateValue : { path: "$filterField>conditions/0/values/0", mode: "OneWay" }
					value: {
						path: "$filterField>conditions/0/values/0",
						type: this._getDataType(),
						mode: "OneWay"
					},
					valueState: {
						path: "$filterField>/valueState",
						mode: "OneWay"
					},
					valueStateText: {
						path: "$filterField>/valueStateText",
						mode: "OneWay"
					}
				});

			} else if (this.getProperty("dataType").indexOf("Date") > -1 && this.getMaxConditions() === 1) {
				oControl = new sap.m.DatePicker(this.getId() + "-inner", {
					editable: {
						path: "$filterField>editMode",
						formatter: _getEditable
					},
					enabled: {
						path: "$filterField>editMode",
						formatter: _getEnabled
					},
					width: "{$filterField>width}",
					required: "{$filterField>required}",
					value: {
						path: "$filterField>conditions/0/values/0",
						type: this._getDataType(),
						mode: "OneWay"
					},
					valueState: {
						path: "$filterField>/valueState",
						mode: "OneWay"
					},
					valueStateText: {
						path: "$filterField>/valueStateText",
						mode: "OneWay"
					}
				});

			} else if (this.getProperty("dataType").indexOf("Date") > -1 && this.getMaxConditions() === 2) {
				oControl = new sap.m.DateRangeSelection(this.getId() + "-inner", {
					editable: {
						path: "$filterField>editMode",
						formatter: _getEditable
					},
					enabled: {
						path: "$filterField>editMode",
						formatter: _getEnabled
					},
					width: "{$filterField>width}",
					required: "{$filterField>required}",
					value: {
						parts: [{
							path: "$filterField>conditions/0/values/0",
							type: this._getDataType()
						}, {
							path: "$filterField>conditions/0/values/1",
							type: this._getDataType()
						}],
						mode: "OneWay",
						type: "sap.ui.mdc.base.type.DateRange"
					},
					valueState: {
						path: "$filterField>/valueState",
						mode: "OneWay"
					},
					valueStateText: {
						path: "$filterField>/valueStateText",
						mode: "OneWay"
					}
				});

			} else {

				//TODO: clean this up and move to a default fragment similar to FieldHelp
				//With that the default content fragment can be configured.
				var oTokenBindingInfo = {};
				oTokenBindingInfo.path = "conditions";
				oTokenBindingInfo.model = "$filterField";
				oTokenBindingInfo.template = new Token({
					text: {
						path: '$filterField>',
						formatter: formatOperator.bind(this)
					},
					tooltip: {
						path: '$filterField>',
						formatter: formatOperator.bind(this)
					}
				});
				oTokenBindingInfo.templateShareable = false;

				//settings for the multi input
				oControl = new MultiInput(this.getId() + "-inner", {
					tokens: oTokenBindingInfo,
					editable: {
						path: "$filterField>editMode",
						formatter: _getEditable
					},
					enabled: {
						path: "$filterField>editMode",
						formatter: _getEnabled
					},
					width: "{$filterField>width}", //this.getWidth(),
					required: "{$filterField>required}", //this.getRequired(),
					placeholder: "{$filterField>placeholder}", //this.getPlaceholder(),
					enableMultiLineMode: true,
					showSuggestion: false,
					valueState: {
						path: "$filterField>/valueState",
						mode: "OneWay"
					},
					valueStateText: {
						path: "$filterField>/valueStateText",
						mode: "OneWay"
					},
					showValueHelp: "{$filterField>showValueHelp}" //this.getShowValueHelp()
				});

				oControl._tokenizer.updateTokens = function() {
					this.updateAggregation("tokens");
				};
				oControl.attachTokenUpdate(this._handleTokenUpdate, this);
				oControl.attachValueHelpRequest(this._fireValueHelpRequest, this);
				oControl.attachLiveChange(this._handleLiveChange, this);
				oControl.onpaste = this._paste.bind(this);

				//update tokens is not necessary
				//TODO: check why there is a destroy of all tokens necessary in updateTokens in default implementation
				oControl.updateTokens = null;
			}

			if (oControl.attachChange) {
				oControl.attachChange(this._handleTokenUpdate, this);
			}
			this.setAggregation("_input", oControl);
			this._input = oControl;
			this._activateManagedObjectModel();
		}

		return this.getAggregation("_input");
	};

	FilterField.prototype._paste = function(oEvent) {
		var sOriginalText, oSource = oEvent.srcControl;

		// for the purpose to copy from column in excel and paste in MultiInput/MultiComboBox
		if (window.clipboardData) {
			//IE
			sOriginalText = window.clipboardData.getData("Text");
		} else {
			// Chrome, Firefox, Safari
			sOriginalText = oEvent.originalEvent.clipboardData.getData('text/plain');
		}
		var aSeparatedText = sOriginalText.split(/\r\n|\r|\n/g);

		if (aSeparatedText && aSeparatedText.length > 1) {
			setTimeout(function() {
				var oType = this._getDataType(),
					type = oType.getMetadata().getName();
//					oBinding = this.getBinding("conditions");

				var iLength = aSeparatedText.length;

				for (var i = 0; i < iLength; i++) {
					if (aSeparatedText[i]) {
						var sValue = aSeparatedText[i];
						var aValues = sValue.split(/\t/g); // if two values exist, use it as Between
						var sOperator, oOperator;
						if (aValues.length == 2 && aValues[0] && aValues[1]) {
							sOperator = "BT";
							oOperator = this.getFilterOperatorConfig().getOperator(sOperator);
						} else {
							aValues = [
								sValue.trim()
							];
							sOperator = this.getFilterOperatorConfig().getDefaultOperator(type);
							oOperator = this.getFilterOperatorConfig().getOperator(sOperator);
						}
						sValue = oOperator ? oOperator.format(aValues) : aValues[0];

						if (oOperator) {
							var oCondition = oOperator.getCondition(sValue, oType);
							if (oCondition) {
								oCondition.fieldPath = this.getFieldPath();
//								oBinding.getModel().addCondition(oCondition);
								this.setConditions(this.getConditions().push(oCondition));
								this.fireChange({
									value: oCondition,
									type: "added",
									valid: true
								});
							}
						}
					}
				}

				if (oSource instanceof sap.m.MultiInput) {
					oSource.setValue("");
				}

			}.bind(this), 0);
		}

	};

	function _getEditable(sEditMode) {

		if (sEditMode && sEditMode == EditMode.Editable) {
			return true;
		} else {
			return false;
		}

	}

	function _getEnabled(sEditMode) {

		if (sEditMode && sEditMode != EditMode.Disabled) {
			return true;
		} else {
			return false;
		}

	}

	FilterField.prototype._handleLiveChange = function(oEvent) {
		var vValue;
		var bEscPressed = false;

		if ("value" in oEvent.getParameters()) {
			vValue = oEvent.getParameter("value");
		}

		if ("escPressed" in oEvent.getParameters()) {
			bEscPressed = oEvent.getParameter("escPressed");
		}

		var oFieldHelp = this.getFieldHelp();
		if (oFieldHelp) {
			oFieldHelp.setFilterValue(vValue);
			if (oFieldHelp.openByTyping()) {
				oFieldHelp.setConditions([]);
				oFieldHelp.open();
			}
		}

		this.fireLiveChange({
			value: vValue,
			escPressed: bEscPressed
		});
	};

	//TODO: returns an Input is no content is set - makes API behave strange
	/*
	 * Returns the current content of the filter field
	 * @returns {sap.ui.core.Control} the currently used content control.
	 */
	FilterField.prototype.getContent = function() {
		if (!this.getAggregation("content")) {
			return this._getDefaultInput();
		}
		return this.getAggregation("content");
	};

	/**
	 * During cloning the internal event handlers of the _input aggregations point to the wrong control
	 */
	FilterField.prototype.clone = function() {
		var oClone;

		if (this._input) {
			// detach all events as they will be handled incorrect in cloning
			this._input.detachChange(this._handleTokenUpdate, this);
			if (this._input.detachTokenUpdate) {
				this._input.detachTokenUpdate(this._handleTokenUpdate, this);
			}
			if (this._input.detachValueHelpRequest) {
				this._input.detachValueHelpRequest(this._fireValueHelpRequest, this);
			}

			oClone = Control.prototype.clone.apply(this, arguments);

			// attach the events again
			this._input.attachChange(this._handleTokenUpdate, this);
			if (this._input.attachTokenUpdate) {
				this._input.attachTokenUpdate(this._handleTokenUpdate, this);
			}
			if (this._input.attachValueHelpRequest) {
				this._input.attachValueHelpRequest(this._fireValueHelpRequest, this);
			}

			var oCloneInput = oClone.getAggregation("_input");

			oCloneInput.attachChange(oClone._handleTokenUpdate, oClone);
			if (oCloneInput.attachTokenUpdate) {
				oCloneInput.attachTokenUpdate(oClone._handleTokenUpdate, oClone);
			}
			if (oCloneInput.attachValueHelpRequest) {
				oCloneInput.attachValueHelpRequest(oClone._fireValueHelpRequest, oClone);
			}
		}

		//else case tbd
		return oClone;
	};

	/*
	 * Sets the content for the filter field, activates the control tree model.
	 * The inner control can bind the properties and aggregations to the "$filterField" model that is available on the content.
	 * TODO: Use the driver for the most common settings ??
	 *
	 * @param {sap.ui.core.Control} oControl the control that should be used as content.
	  @returns {sap.ui.mdc.base.FilterField} Returns <code>this</code> to allow method chaining
	 */
	FilterField.prototype.setContent = function(oControl) {
		this._deactivateManagedObjectModel();
		this.setAggregation("content", oControl);
		this._activateManagedObjectModel();
		return this;
	};

	FilterField.prototype.destroyContent = function() {
		this._deactivateManagedObjectModel();
		this.destroyAggregation("content");
		this._activateManagedObjectModel();
		return this;
	};

	/**
	 * An inner control can bind its properties to the content of the condition structure, array with sub objects.
	 * Changes on the inner properties will result in property changes within the control tree model but are missing
	 * a corresponding aggregation. Here the propertyChange event of the JSONPropertyBinding can be used to
	 * trigger an update on the condition data structure.
	 * @param {jQuery.Event} oEvent The event object.
	 */
	FilterField.prototype._updateConditionModel = function(oEvent) {
		var oBinding = this.getBinding("conditions");
		if (oBinding && oEvent.getParameter("resolvedPath").indexOf("/conditions") === 0) {
			//do an async update of the condition model to avoid recursion
			oBinding.getModel().checkUpdate(true, true);
		}
	};

	// *** ManagedObjectModel handling for content ***
	FilterField.prototype._activateManagedObjectModel = function() {
		var oContent = this.getContent();
		if (oContent) {
			if (!this._oManagedObjectModel) {
				this._oManagedObjectModel = new ManagedObjectModel(this);
				this._oManagedObjectModel.setSizeLimit(1000);
				this._oManagedObjectModel.attachEvent("propertyChange", this._updateConditionModel.bind(this));
			}
			oContent.setModel(this._oManagedObjectModel, "$filterField");
			oContent.bindElement({
				path: "/",
				model: "$filterField"
			});

		}
	};

	FilterField.prototype._deactivateManagedObjectModel = function() {
		var oContent = this.getContent();
		if (oContent) {
			oContent.unbindElement("$filterField");
			this._oManagedObjectModel.destroy();
			this._oManagedObjectModel = null;
		}
	};

	FilterField.prototype.setParent = function() {
		Control.prototype.setParent.apply(this, arguments);
		if (!this.getParent()) {
			this._deactivateManagedObjectModel();
		} else {
			this._activateManagedObjectModel();
		}
	};

	FilterField.prototype.setDataType = function(vValue) {
		delete this._oDataType;
		this.setProperty("dataType", vValue, true);
		return this;
	};

	FilterField.mapEdmTypes = {
		"Edm.Boolean": "sap.ui.model.odata.type.Boolean",
		"Edm.Byte": "sap.ui.model.odata.type.Byte",
		"Edm.Date": "sap.ui.model.odata.type.Date", // V4 Date
		"Edm.DateTime": "sap.ui.model.odata.type.DateTime", // only for V2  constraints: {displayFormat: 'Date' }
		"Edm.DateTimeOffset": "sap.ui.model.odata.type.DateTimeOffset", //constraints: { V4: true, precision: n }
		"Edm.Decimal": "sap.ui.model.odata.type.Decimal", //constraints: { precision, scale, minimum, maximum, minimumExclusive, maximumExclusive}
		"Edm.Double": "sap.ui.model.odata.type.Double",
		"Edm.Single": "sap.ui.model.odata.type.Single",
		"Edm.Guid": "sap.ui.model.odata.type.Guid",
		"Edm.Int16": "sap.ui.model.odata.type.Int16",
		"Edm.Int32": "sap.ui.model.odata.type.Int32",
		"Edm.Int64": "sap.ui.model.odata.type.Int64",
		//Edm.Raw not supported
		"Edm.SByte": "sap.ui.model.odata.type.SByte",
		"Edm.String": "sap.ui.model.odata.type.String", //constraints: {maxLength, isDigitSequence}
		"Edm.Time": "sap.ui.model.odata.type.Time", // only V2
		"Edm.TimeOfDay": "sap.ui.model.odata.type.TimeOfDay" // V4 constraints: {precision}
	};

	FilterField.prototype._createDataType = function(sType) {
		var OTypeClass = ObjectPath.get(sType || "");
		if (!OTypeClass) {
			var oFilterOperatorConfig = this.getFilterOperatorConfig(),
				sNewType;
			if (oFilterOperatorConfig) {
				sNewType = oFilterOperatorConfig.getParentType(sType);
			} else {
				sNewType = FilterField.mapEdmTypes[sType];
			}
			if (!sNewType) {
				Log.error("FilterField", "dataType for " + sType + " can not be created!");
				return null;
			}
			return this._createDataType(sNewType);
		}

		return new OTypeClass(this.getDataTypeFormatOptions(), this.getDataTypeConstraints());
	};

	FilterField.prototype._getDataType = function(sType) {
		if (!this._oDataType) {
			this._oDataType = this.getProperty("dataType");
			if (typeof this._oDataType === "string") {
				this._oDataType = this._createDataType(this._oDataType);
			}
		}
		return this._oDataType;
	};

	return FilterField;

}, /* bExport= */ true);