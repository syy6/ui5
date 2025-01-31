/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */
// -----------------------------------------------------------------------------
// Retrieves the data for a value list from the OData metadata to bind to a given control/aggregation (TODO: take into account Searchsupported +
// ValueList In/Out/InOut parameter to set data)
// -----------------------------------------------------------------------------
sap.ui.define([
	'sap/ui/thirdparty/jquery', 'sap/ui/comp/library', 'sap/m/library', 'sap/m/List', 'sap/m/ResponsivePopover', 'sap/m/StandardListItem', 'sap/m/Token', 'sap/m/Table', 'sap/m/ColumnListItem', 'sap/m/Label', './BaseValueListProvider', 'sap/ui/comp/util/FormatUtil', 'sap/ui/model/json/JSONModel', 'sap/ui/core/format/DateFormat', 'sap/ui/Device', 'sap/ui/comp/smartfilterbar/SmartFilterBar', 'sap/ui/model/Sorter'
], function(jQuery, library, mLibrary, List, ResponsivePopover, StandardListItem, Token, Table, ColumnListItem, Label, BaseValueListProvider, FormatUtil, JSONModel, DateFormat, Device, SmartFilterBar, Sorter) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mLibrary.PlacementType;

	// shortcut for sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation
	var ValueHelpRangeOperation = library.valuehelpdialog.ValueHelpRangeOperation;

	// shortcut for sap.m.ListMode
	var ListMode = mLibrary.ListMode;

	var ValueListProvider;

	/**
	 * Retrieves the data for a collection from the OData metadata to bind to a given control/aggregation
	 * @constructor
	 * @experimental This module is only for internal/experimental use!
	 * @public
	 * @param {object} mParams - map containing the control,aggregation,annotation and the oODataModel
	 * @author SAP SE
	 */
	var ValueHelpProvider = BaseValueListProvider.extend("sap.ui.comp.providers.ValueHelpProvider", {
		constructor: function(mParams) {
			if (!SmartFilterBar) {
				SmartFilterBar = sap.ui.require("sap/ui/comp/smartfilterbar/SmartFilterBar"); // because of cycle in define (via FilterProvider)
			}

			if (mParams) {
				this.preventInitialDataFetchInValueHelpDialog = mParams.preventInitialDataFetchInValueHelpDialog;
				this.sTitle = mParams.title;
				this.bSupportMultiselect = !!mParams.supportMultiSelect;
				this.bSupportRanges = mParams.supportRanges;
				this.bIsSingleIntervalRange = mParams.isSingleIntervalRange;
				this.bIsUnrestrictedFilter = mParams.isUnrestrictedFilter;
				this.bTakeOverInputValue = (mParams.takeOverInputValue === false) ? false : true;
				// If field is of type Single Interval -> The dialog should support only 1 interval range selection
				if (this.bIsSingleIntervalRange) {
					this.bSupportRanges = true;
				}
				this._sType = mParams.type;
				this._sMaxLength = mParams.maxLength;
				this._sScale = mParams.scale;
				this._sPrecision = mParams.precision;
			}
			BaseValueListProvider.apply(this, arguments); // Call constructor of base class
			this._onInitialise();
		}
	});

	/**
	 * Initialise the relevant stuff
	 * @private
	 */
	ValueHelpProvider.prototype._onInitialise = function() {
		// Check if ValueHelp is supported by the control
		if (this.oControl.attachValueHelpRequest) {
			this._fVHRequested = function(oEvent) {
				if (!this.bInitialised) {
					return;
				}
				this.oControl = oEvent.getSource();
				this.bForceTriggerDataRetreival = oEvent.getParameter("fromSuggestions");
				if (this.bTakeOverInputValue || this.bForceTriggerDataRetreival) {
					this.sBasicSearchText = oEvent.getSource().getValue();
				}
				this._createValueHelpDialog();
			}.bind(this);
			this.oControl.attachValueHelpRequest(this._fVHRequested);
		}
	};

	/**
	 * Creates the Value Help Dialog
	 * @private
	 */
	ValueHelpProvider.prototype._createValueHelpDialog = function() {
		if (!this.bCreated) {
			this.bCreated = true;
			if (!this._oValueHelpDialogClass) {
				// Create ValueHelpDialog instance lazily
				sap.ui.require([
					'sap/ui/comp/valuehelpdialog/ValueHelpDialog'
				], this._onValueHelpDialogRequired.bind(this));
			} else {
				this._onValueHelpDialogRequired(this._oValueHelpDialogClass);
			}
		}
	};

	/**
	 * Returns the Value Help Dialog title. Either the exiting sTitle or via the oFilterProvider
	 * @private
	 */
	ValueHelpProvider.prototype._getTitle = function() {
		if (this.sTitle) {
			return this.sTitle;
		} else if (this.oFilterProvider) {
			return this.oFilterProvider._determineFieldLabel(this._fieldViewMetadata);
		}
		return "";
	};

	/**
	 * Called once the ValueHelpDialog instance is required
	 * @param {Object} ValueHelpDialog - the ValueHelpDialog class object
	 * @private
	 */
	ValueHelpProvider.prototype._onValueHelpDialogRequired = function(ValueHelpDialog) {
		this._oValueHelpDialogClass = ValueHelpDialog;
		var sValueHelpDialogId = this.oControl.getId() + "-valueHelpDialog";
		this.oValueHelpDialog = new ValueHelpDialog(sValueHelpDialogId, {
			stretch: Device.system.phone,
			basicSearchText: this.sBasicSearchText,
			supportRangesOnly: this.bIsSingleIntervalRange || !this.oPrimaryValueListAnnotation,
			supportMultiselect: this.bSupportMultiselect,
			title: this._getTitle(),
			supportRanges: this.bSupportRanges,
			displayFormat: this.sDisplayFormat,
			ok: this._onOK.bind(this),
			cancel: this._onCancel.bind(this),
			afterClose: function() {
				if (this.oPrimaryValueListAnnotation) {
					this._resolveAnnotationData(this.oPrimaryValueListAnnotation);
				}
				this.oValueHelpDialog.destroy();
				this.bCreated = false;
				if (this.oControl && this.oControl.focus && !Device.system.phone) {
					this.oControl.focus();
				}
			}.bind(this)
		});
		this.oControl.addDependent(this.oValueHelpDialog);

		this.oValueHelpDialog.suggest(function(oControl, sFieldName) {
			if (this.oPrimaryValueListAnnotation) {

				var fnCreate = function(ValueListProvider) {
					oControl.setShowSuggestion(true);
					oControl.setFilterSuggests(false);
					oControl._oSuggestProvider = new ValueListProvider({
						control: oControl,
						fieldName: sFieldName,
						typeAheadEnabled: true,
						aggregation: "suggestionRows",
						displayFormat: this.sDisplayFormat,
						displayBehaviour: this.sTokenDisplayBehaviour,
						resolveInOutParams: false,
						annotation: this.oPrimaryValueListAnnotation,
						model: this.oODataModel,
						enableShowTableSuggestionValueHelp: false
					});
				}.bind(this);

				ValueListProvider = sap.ui.require('sap/ui/comp/providers/ValueListProvider');
				if (!ValueListProvider) {
					sap.ui.require([
						'sap/ui/comp/providers/ValueListProvider'
					], fnCreate);
				} else {
					fnCreate(ValueListProvider);
					return oControl._oSuggestProvider;
				}
				return null;
			}
		}.bind(this));

		// Enable the Dialog to show only 1 interval range selection
		if (this.bIsSingleIntervalRange) {
			this.oValueHelpDialog.setIncludeRangeOperations([
				ValueHelpRangeOperation.BT, ValueHelpRangeOperation.EQ
			], this._sType);
			this.oValueHelpDialog.setMaxIncludeRanges(1);
			this.oValueHelpDialog.setMaxExcludeRanges(0);
			this._updateInitialInterval();
		} else if ((this._sType === "date" || this._sType === "time" || this._sType === "datetime") && !this.bIsUnrestrictedFilter) {
			// Enable the Dialog to show only multiple "EQ" date selection
			this.oValueHelpDialog.setIncludeRangeOperations([
				ValueHelpRangeOperation.EQ
			], this._sType);
			this.oValueHelpDialog.setMaxExcludeRanges(0);
		}

		if (this.oControl.$() && this.oControl.$().closest(".sapUiSizeCompact").length > 0) {
			// check if the Token field runs in Compact mode. We either find via closed a element with class sapUiSizeCompact or the body has such
			// class
			this.oValueHelpDialog.addStyleClass("sapUiSizeCompact");
		} else if (this.oControl.$() && this.oControl.$().closest(".sapUiSizeCozy").length > 0) {
			this.oValueHelpDialog.addStyleClass("sapUiSizeCozy");
		} else if (jQuery("body").hasClass("sapUiSizeCompact")) {
			this.oValueHelpDialog.addStyleClass("sapUiSizeCompact");
		} else {
			this.oValueHelpDialog.addStyleClass("sapUiSizeCozy");
		}

		if (this.bSupportRanges) {
			this.oValueHelpDialog.setRangeKeyFields([
				{
					label: this._getTitle(),
					key: this.sFieldName,
					typeInstance: this._fieldViewMetadata ? this._fieldViewMetadata.ui5Type : null,
					type: this._sType,
					formatSettings: this._sType === "numc" ? {
						isDigitSequence: true,
						maxLength: this._sMaxLength
					} : jQuery.extend({}, this._oDateFormatSettings, {
						UTC: false
					}),
					scale: this._sScale,
					precision: this._sPrecision,
					maxLength: this._sMaxLength
				}
			]);
		}
		if (!(this.bIsSingleIntervalRange || !this.oPrimaryValueListAnnotation)) {
			this.oValueHelpDialog.setModel(this.oODataModel);
			this._createAdditionalValueHelpControls();
			this._createCollectiveSearchControls();
		}

		// pass the existing tokens to the value help dialog
		if (this.oControl.getTokens) {
			var aTokens = this.oControl.getTokens();

			if (aTokens) {
				aTokens = this._adaptTokensFromFilterBar(aTokens);
				this.oValueHelpDialog.setTokens(aTokens);
			}
		}

		this.oValueHelpDialog.open();
	};

	/**
	 * In case of SmartFilterBar scenario the date/time data has to be be adapted, before passed to VH processing.
	 * @private
	 */
	ValueHelpProvider.prototype._adaptTokensFromFilterBar = function(aTokens) {
		var oToken, oRange, oDate, aRetTokens = aTokens;

		if (this.oFilterProvider && aTokens && this._sType === "time") {
			aRetTokens = [];
			for (var i = 0; i < aTokens.length; i++) {
				oToken = jQuery.extend(true, {}, aTokens[i]);

				oRange = oToken.data("range");
				if (oRange) {
					oRange = jQuery.extend(true, {}, oRange);
					if (oRange.value1 && oRange.value1.valueOf && oRange.value1.getTimezoneOffset) {
						oDate = new Date(oRange.value1.valueOf() - oRange.value1.getTimezoneOffset() * 60 * 1000);
						oRange.value1 = {
							__edmType: "Edm.Time",
							ms: oDate.getTime()
						};
					}

					if (oRange.value2 && oRange.value2.valueOf && oRange.value2.getTimezoneOffset) {
						oDate = new Date(oRange.value2.valueOf() - oRange.value2.getTimezoneOffset() * 60 * 1000);
						oRange.value2 = {
							__edmType: "Edm.Time",
							ms: oDate.getTime()
						};
					}

					oToken.data("range", oRange);
					aRetTokens.push(oToken);
				}
			}
		}

		return aRetTokens;

	};

	/**
	 * Updated the ValueHelpDialog with the initial value of the interval token
	 * @private
	 */
	ValueHelpProvider.prototype._updateInitialInterval = function() {
		var sIntervalValue = this.oControl.getValue(), oToken, oRange, aValues, oFormat, oDate;
		if (sIntervalValue) {
			oToken = new Token();
			oRange = {
				exclude: false,
				keyField: this.sFieldName
			};

			if (this._sType === "numeric") {
				aValues = FormatUtil.parseFilterNumericIntervalData(sIntervalValue);
			} else if (this._sType === "datetime") {
				aValues = FormatUtil.parseDateTimeOffsetInterval(sIntervalValue);
				oFormat = DateFormat.getDateTimeInstance(jQuery.extend({}, this._oDateFormatSettings, {
					UTC: false
				}));

				oDate = oFormat.parse(aValues[0]);
				aValues[0] = oDate ? oDate : new Date(aValues[0]);
				if (aValues.length === 2) {
					oDate = oFormat.parse(aValues[1]);
					aValues[1] = oDate ? oDate : new Date(aValues[1]);
				}

			} else {
				aValues = sIntervalValue.split("-");
			}

			if (aValues && aValues.length === 2) {
				oRange.operation = "BT";
				oRange.value1 = aValues[0];
				oRange.value2 = aValues[1];
			} else {
				oRange.operation = "EQ";
				oRange.value1 = aValues[0];
			}

			oToken.data("range", oRange);
		}
		if (oToken) {
			this.oValueHelpDialog.setTokens([
				oToken
			]);
		}
	};

	/**
	 * Creates the necessary control(s) for Collective Search Help on the ValueHelpDialog
	 * @private
	 */
	ValueHelpProvider.prototype._createCollectiveSearchControls = function() {
		var oPopOver, oList, oItem, i = 0, len = 0, fOnSelect, oAdditionalAnnotation, oResourceBundle;
		if (this.additionalAnnotations && this.additionalAnnotations.length) {
			fOnSelect = function(oEvt) {
				var oSource = oEvt.getParameter("listItem"), oAnnotation;
				oPopOver.close();
				if (oSource) {
					oAnnotation = oSource.data("_annotation");
					if (oAnnotation) {
						this._triggerAnnotationChange(oAnnotation);
					}
				}
			}.bind(this);
			// Selection Controls
			oList = new List({
				mode: ListMode.SingleSelectMaster,
				selectionChange: fOnSelect
			});
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");

			oPopOver = new ResponsivePopover({
				placement: PlacementType.Bottom,
				showHeader: true,
				contentHeight: "30rem",
				title: oResourceBundle.getText("COLLECTIVE_SEARCH_SELECTION_TITLE"),
				content: [
					oList
				],
				afterClose: function() {
					this.oValueHelpDialog._rotateSelectionButtonIcon(false);
				}.bind(this)
			});

			oItem = new StandardListItem({
				title: this.oPrimaryValueListAnnotation.valueListTitle
			});
			oItem.data("_annotation", this.oPrimaryValueListAnnotation);
			oList.addItem(oItem);
			oList.setSelectedItem(oItem);

			this.oValueHelpDialog.oSelectionTitle.setText(this.oPrimaryValueListAnnotation.valueListTitle);
			this.oValueHelpDialog.oSelectionTitle.setTooltip(this.oPrimaryValueListAnnotation.valueListTitle);
			len = this.additionalAnnotations.length;
			for (i = 0; i < len; i++) {
				oAdditionalAnnotation = this.additionalAnnotations[i];
				oItem = new StandardListItem({
					title: oAdditionalAnnotation.valueListTitle
				});
				oItem.data("_annotation", oAdditionalAnnotation);
				oList.addItem(oItem);
			}
			this.oValueHelpDialog.oSelectionButton.setVisible(true);
			this.oValueHelpDialog.oSelectionTitle.setVisible(true);
			this.oValueHelpDialog.oSelectionButton.attachPress(function() {
				if (!oPopOver.isOpen()) {
					this.oValueHelpDialog._rotateSelectionButtonIcon(true);
					oPopOver.openBy(this.oValueHelpDialog.oSelectionButton);
				} else {
					oPopOver.close();
				}
			}.bind(this));
		}
	};

	ValueHelpProvider.prototype._triggerAnnotationChange = function(oAnnotation) {
		this.oValueHelpDialog.oSelectionTitle.setText(oAnnotation.valueListTitle);
		this.oValueHelpDialog.oSelectionTitle.setTooltip(oAnnotation.valueListTitle);
		this.oValueHelpDialog.resetTableState();
		this._resolveAnnotationData(oAnnotation);
		this._createAdditionalValueHelpControls();
	};

	/**
	 * Create the SmartFilter control on the Value Help Dialog and set the model
	 * @private
	 */
	ValueHelpProvider.prototype._createAdditionalValueHelpControls = function() {
		var sBasicSearchFieldName = null;
		this.oValueHelpDialog.setKey(this.sKey);
		this.oValueHelpDialog.setKeys(this._aKeys);
		this.oValueHelpDialog.setDescriptionKey(this.sDescription);
		this.oValueHelpDialog.setTokenDisplayBehaviour(this.sTokenDisplayBehaviour);

		/*
		 * This is necessary since, ValueHelpDialog control expects columns for table would be filled from a model called columns with column data!
		 */
		// init the columns model for the table
		var oColModel = new JSONModel();
		oColModel.setData({
			cols: this._aCols
		});
		this.oValueHelpDialog.setModel(oColModel, "columns");

		// Set the Basic search field if search is supported
		if (this.bSupportBasicSearch) {
			sBasicSearchFieldName = this.sKey;
		}

		// Remove the old collectiveSearch from the existing filterbar and destroy the filterbar instance
		if (this.oSmartFilterBar) {
			this.oSmartFilterBar._setCollectiveSearch(null);
			this.oSmartFilterBar.destroy();
		}

		// Create the smart filter
		this.oSmartFilterBar = new SmartFilterBar(this.oValueHelpDialog.getId() + "-smartFilterBar", {
			entitySet: this.sValueListEntitySetName,
			basicSearchFieldName: sBasicSearchFieldName,
			enableBasicSearch: this.bSupportBasicSearch,
			advancedMode: true,
			showGoOnFB: !Device.system.phone,
			expandAdvancedArea: (!this.bForceTriggerDataRetreival && Device.system.desktop),
			search: this._onFilterBarSearchPressed.bind(this),
			reset: this._onFilterBarResetPressed.bind(this),
			filterChange: this._onFilterBarFilterChange.bind(this),
			initialise: this._onFilterBarInitialise.bind(this)
		});
		if (this._oDateFormatSettings) {
			this.oSmartFilterBar.data("dateFormatSettings", this._oDateFormatSettings);
		}
		// This has to be set before the SmartFilter is initialised!
		this.oSmartFilterBar.isRunningInValueHelpDialog = true;
		// Set SmartFilter on ValueHelp Dialog
		this.oValueHelpDialog.setFilterBar(this.oSmartFilterBar);
	};

	/**
	 * Called when the filter data is changed in SmartFilter
	 * @private
	 */
	ValueHelpProvider.prototype._onFilterBarFilterChange = function() {
		if (!this._bIgnoreFilterChange) {
			this.oValueHelpDialog.getTableAsync().then(function(oTable){
				oTable.setShowOverlay(true);
				this.oValueHelpDialog.TableStateSearchData();
			}.bind(this));
		}
	};

	/**
	 * Called when the search is triggered in SmartFilter
	 * @private
	 */
	ValueHelpProvider.prototype._onFilterBarSearchPressed = function() {
		this._rebindTable();
	};

	/**
	 * Binds the table taking current filters and parameters into account
	 * @private
	 */
	ValueHelpProvider.prototype._rebindTable = function() {
		var aFilters, mParameters, mBindingParams;
		aFilters = this.oSmartFilterBar.getFilters();
		mParameters = this.oSmartFilterBar.getParameters() || {};
		if (this.aSelect && this.aSelect.length) {
			mParameters["select"] = this.aSelect.toString();
		}

		mBindingParams = {
			path: "/" + this.sValueListEntitySetName,
			filters: aFilters,
			parameters: mParameters,
			events: {
				dataReceived: function(oEvt) {
					this.oValueHelpDialog.TableStateDataFilled();
					var oBinding = oEvt.getSource();
					this.oValueHelpDialog.getTableAsync().then(function(oTable){
						if (oBinding && this.oValueHelpDialog && this.oValueHelpDialog.isOpen()) {
							var iBindingLength = oBinding.getLength();
							// Infinite number of requests are triggered if an error occurs, so don't update if no data is present
							// The below code is mainly required for token handling on the ValueHelpDialog.
							if (iBindingLength) {
								this.oValueHelpDialog.update();
							} else {
								this.oValueHelpDialog._updateTitles();
							}
						}
					}.bind(this));
				}.bind(this)
			}
		};

		this.oValueHelpDialog.getTableAsync().then(function(oTable){
			oTable.setShowOverlay(false);
			this.oValueHelpDialog.TableStateDataSearching();
			oTable.setEnableBusyIndicator(true);

			if (oTable instanceof Table) {

				// Check which property can be sorted
				var aEntitySetFields;
				if (this.sKey && this._oMetadataAnalyser) {
					aEntitySetFields = this._oMetadataAnalyser.getFieldsByEntitySetName(this.sValueListEntitySetName);
					for (var i = 0; i < aEntitySetFields.length; i++) {
						if (aEntitySetFields[i].name === this.sKey && aEntitySetFields[i].sortable !== false) {
							mBindingParams.sorter = new Sorter(this.sKey);
							break;
						}
					}
				}

				mBindingParams.factory = function(sId, oContext) {
					var aCols = oTable.getModel("columns").getData().cols;
					return new ColumnListItem({
						cells: aCols.map(function(column) {
							var colname = column.template;
							return new Label({
								text: "{" + colname + "}"
							});
						})
					});
				};
				oTable.bindItems(mBindingParams);
			} else {

				//create the sorter based on the current sorted columns
				var aColumns = oTable.getColumns();
				for (var i = 0; i < aColumns.length; i++) {
					var oColumn = aColumns[i];
					oColumn._appDefaults = null;	//TODO: remove the column._appDefaults, otherwise the sort icon will be set back to the default column inside bindRows of the table!!!!
				}

				aColumns = oTable.getSortedColumns(); // when the user changed the sorting we get an array of SortedColumns
				if (!aColumns || aColumns.length == 0) {
					aColumns = oTable.getColumns();	// if not, we have to loop over all columns and used the one which we created as sorted.
				}
				for (var i = 0; i < aColumns.length; i++) {
					var oColumn = aColumns[i];
					if (oColumn.getSorted()) {
						if (!mBindingParams.sorter) {
							mBindingParams.sorter = [];
						}
						mBindingParams.sorter.push( new Sorter(oColumn.getSortProperty(), oColumn.getSortOrder() === "Descending"));
					}
				}

				oTable.bindRows(mBindingParams);
			}
		}.bind(this));
	};

	/**
	 * Called when the reset button was clicked in the SmartFilter
	 * @private
	 */
	ValueHelpProvider.prototype._onFilterBarResetPressed = function() {
		this._calculateFilterInputData();
		if (this.oSmartFilterBar) {
			this.oSmartFilterBar.setFilterData(this.mFilterInputData);
		}
	};

	/**
	 * Called when the filterbar is initialised
	 * @private
	 */
	ValueHelpProvider.prototype._onFilterBarInitialise = function() {
		var oBasicSearchField = null;

		this._bIgnoreFilterChange = true; // ignore the filterChange event from filterbar during initialization
		// (Re-)Set the data to default
		this._onFilterBarResetPressed();
		delete this._bIgnoreFilterChange;

		// Update the basic search text!
		if (this.oSmartFilterBar && this.oSmartFilterBar.getBasicSearchControl) {
			oBasicSearchField = this.oSmartFilterBar.getBasicSearchControl();
			if (oBasicSearchField) {
				oBasicSearchField.setValue(this.sBasicSearchText);

				if (Device.system.phone && oBasicSearchField.isA("sap.m.SearchField")) {
					oBasicSearchField.setShowSearchButton(true);
				}
			}
		}
		// trigger the data request if the fetch was initiated from Suggest -or- if data fetch is not prevented
		if (!this.preventInitialDataFetchInValueHelpDialog || this.bForceTriggerDataRetreival) {
			this._rebindTable();
			this.bForceTriggerDataRetreival = false;
		}
	};

	/**
	 * Callback method after OK is clicked on the VH Dialog
	 * @param {object} oControlEvent - the event data from the control
	 * @private
	 */
	ValueHelpProvider.prototype._onOK = function(oControlEvent) {
		var aTokens = oControlEvent.getParameter("tokens"), oRangeData, sKey, i = 0, aRowData = [], oRowData = null, oFormat;
		// First close the dialog, since when used in an aggregation - some model updates (setting IN/OUT params to ODataModel) destroy this
		// instance/control!
		this._onCancel();
		if (this.oControl.isA("sap.m.MultiInput")) {
			// Clearing typed text if value is not selected from suggestion list but rather from ValueHelpDialog
			this.oControl.setValue("");
			this.oControl.destroyTokens();
			this.oControl.setTokens(aTokens);
			// this.oControl.fireTokenChange({
			// type: "tokensChanged"
			// });
			i = aTokens.length;
			while (i--) {
				oRowData = aTokens[i].data("row");
				if (oRowData) {
					aRowData.push(oRowData);
				}
			}
		} else {
			if (aTokens[0]) {
				// Single Interval
				if (this.bIsSingleIntervalRange) {
					oRangeData = aTokens[0].data("range");
					if (oRangeData) {
						// check if data is in the format: "2005-2014"
						if (this._sType === "datetime") {
							oFormat = DateFormat.getDateTimeInstance(jQuery.extend({}, this._oDateFormatSettings, {
								UTC: false
							}));

							if (typeof oRangeData.value1 === "string") {
								oRangeData.value1 = new Date(oRangeData.value1);
							}
							if (oRangeData.operation === "BT") {
								if (typeof oRangeData.value2 === "string") {
									oRangeData.value2 = new Date(oRangeData.value2);
								}
								sKey = oFormat.format(oRangeData.value1) + "-" + oFormat.format(oRangeData.value2);
							} else {
								sKey = oFormat.format(oRangeData.value1);
							}
						} else {
							if (oRangeData.operation === "BT") {
								sKey = oRangeData.value1 + "-" + oRangeData.value2;
							} else {
								sKey = oRangeData.value1;
							}
						}
					}
				} else {
					sKey = aTokens[0].getKey();
				}
				oRowData = aTokens[0].data("row");
				if (oRowData) {
					aRowData.push(oRowData);
				}
				aTokens[0].destroy();
			}
			this.oControl.setValue(sKey);

			// Manually trigger the change event on sapUI5 control since it doesn't do this internally on setValue!
			this.oControl.fireChange({
				value: sKey,
				validated: true
			});
		}
		this._calculateAndSetFilterOutputData(aRowData);
	};

	/**
	 * Callback method after Cancel is clicked on the VH Dialog
	 * @private
	 */
	ValueHelpProvider.prototype._onCancel = function() {
		this.oValueHelpDialog.close();
		this.oValueHelpDialog.setModel(null);
	};

	/**
	 * Destroys the object
	 */
	ValueHelpProvider.prototype.destroy = function() {
		if (this.oControl && this.oControl.detachValueHelpRequest) {
			this.oControl.detachValueHelpRequest(this._fVHRequested);
			this._fVHRequested = null;
		}
		BaseValueListProvider.prototype.destroy.apply(this, arguments);
		// Destroy other local data
		if (this.oValueHelpDialog) {
			this.oValueHelpDialog.destroy();
			this.oValueHelpDialog = null;
		}
		if (this.oSmartFilterBar) {
			this.oSmartFilterBar.destroy();
			this.oSmartFilterBar = null;
		}
		this.sTitle = null;
		this._fieldViewMetadata = null;
		this._oValueHelpDialogClass = null;
	};

	return ValueHelpProvider;

}, /* bExport= */true);
