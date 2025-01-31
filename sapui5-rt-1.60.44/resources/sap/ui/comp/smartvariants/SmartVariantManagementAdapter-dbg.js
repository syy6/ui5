/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */

// Provides control sap.ui.comp.smartvariants.SmartVariantManagement.
sap.ui.define([
	'sap/ui/comp/library',
	'sap/ui/comp/variants/VariantItem',
	'sap/ui/comp/state/UIState',
	'sap/ui/core/Element'
], function(library, VariantItem, UIState, Element, AnnotationHelper, Context) {
	"use strict";

	/**
	 * Constructor for new instance of a SmartVariantManagementAdapter control.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Handles the odata metadata based information. An instance of this class will be created and used by the
	 *        {@link sap.ui.comp.smartvariants.SmartVariantManagement SmartVariantManagement} control. The adapter transforms odata metadata based
	 *        SelectionPresentationVariant information to UIState object. For each SelectionPresentationVariant annotation an entry will be added to
	 *        the VariantManagement control. It will be called by the SmartVariantManagement whenever the user selects the corresponding entry and
	 *        will provide a valid {@link sap.ui.comp.state.UIState UIState} object.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartvariants.SmartVariantManagementAdapter
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SmartVariantManagementAdapter = Element.extend("sap.ui.comp.smartvariants.SmartVariantManagementAdapter", /** @lends sap.ui.comp.smartvariants.SmartVariantManagementAdapter.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			properties: {
				/**
				 * assign an array of selectionPresentationVariants annotations.
				 */
				selectionPresentationVariants: {
					type: "object",
					group: "Misc",
					defaultValue: false
				}
			}
		}
	});

	/**
	 * Get the UIState for a SelectionPresentationVariant based variant item.
	 * @param {string} sKeyWithPrefix corresponds to the qualifier of the SelectionPresentationVariant
	 * @returns {sap.ui.comp.state.UIState} representing the selection and presentation variant.
	 * @internal
	 */
	SmartVariantManagementAdapter.prototype.getUiState = function(sKeyWithPrefix) {
		var oContent, oSelectionPresenationVariant = null, sKey = sKeyWithPrefix.substring(1);

		this.getSelectionPresentationVariants().some(function(oSPVariant) {
			if (oSPVariant.qualifier === sKey) {
				oSelectionPresenationVariant = oSPVariant;
			}

			return oSelectionPresenationVariant !== null;
		});

		if (oSelectionPresenationVariant) {
			if (oSelectionPresenationVariant.uiStateContent) {
				oContent = oSelectionPresenationVariant.uiStateContent;
			} else {
				oContent = UIState.createFromSelectionAndPresentationVariantAnnotation(oSelectionPresenationVariant.text, oSelectionPresenationVariant.selectionVariant.annotation, oSelectionPresenationVariant.presentationVariant.annotation);
				oSelectionPresenationVariant.uiStateContent = oContent;
			}
		}

		return oContent;
	};

	/**
	 * Creates variant item for a given VariantManagment control.
	 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oVariantManagement for which the items are created.
	 * @internal
	 */
	SmartVariantManagementAdapter.prototype.createSelectionPresentationVariants = function(oVariantManagement) {
		var aSelectionPresentationVariants, oVariantItem, sKeyPrefix = "#", aVariantKeys = [];

		if (!this.getSelectionPresentationVariants()) {
			return;
		}

		aSelectionPresentationVariants = this.getSelectionPresentationVariants();
		if (aSelectionPresentationVariants) {

			aSelectionPresentationVariants.forEach(function(oSPVariant) {
				var sVariantKey = sKeyPrefix + oSPVariant.qualifier;
				if (oSPVariant.qualifier) {
					oVariantItem = new VariantItem({
						key: sVariantKey,
						text: oSPVariant.text,
						global: true,
						executeOnSelection: false,
						lifecycleTransportId: "",
						lifecyclePackage: "",
						namespace: "",
						readOnly: true,
						labelReadOnly: true,
						author: ""
					});

					oVariantManagement.insertVariantItem(oVariantItem, 0);

					aVariantKeys.push(sVariantKey);
// } else {
// bNewStandard = this._defaultSelectionVariantHandling(oVariantManagement, oSPVariant);
				}

			});

// if (!oVariantManagement._getDefaultVariantKey()) {
// if (oVariantManagement.getDefaultVariantKey()) {
// sDefaultKey = sKeyPrefix + this.getDefaultVariantName();
// oVariantManagement.setInitialSelectionKey(sDefaultKey);
// oVariantManagement.fireSelect({
// key: sDefaultKey
// });
// } else if (bNewStandard) {
// oVariantManagement.fireSelect({
// key: this._oSmartVariantManagement.STANDARDVARIANTKEY
// });
// }
// }

			oVariantManagement.applyDefaultFavorites(aVariantKeys, true);
		}

	};

	SmartVariantManagementAdapter.prototype.destroy = function() {
		Element.prototype.destroy.apply(this, arguments);
	};

	return SmartVariantManagementAdapter;

}, /* bExport= */true);