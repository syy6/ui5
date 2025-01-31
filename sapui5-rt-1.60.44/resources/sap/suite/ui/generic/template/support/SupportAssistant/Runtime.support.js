/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
/**
 * Defines support rules for the app configuration.
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/support/library"
], function(
		jQuery,
		SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application*/

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	var oBusyHandling = {
		id: "busyHandling",
		audiences: [Audiences.Internal],
		categories: [Categories.Functionality],
		enabled: true,
		async: true,
		minversion: "1.52",
		title: "Log and check promises for busy handling",
		description: "This rule helps you find the reason for long-running busy indicators set by SAP Fiori elements. To do so, reconstruct the situation and launch the support assistant before the long-running busy indicator is displayed. Then, all promises are written into the console log. During the check, the system creates issues for all promises which are still pending. Busy indicators not set by SAP Fiori elements are checked again after a delay of 1 second and if they are still busy an information issue is created.",
		resolution: "If the busy indicator is set by SAP Fiori elements, use the issue details to find out the last caller from the call stack, which sets the busy indicator. Find the reason why its promise has not been settled.",

		check: function(oIssueManager, oCoreFacade, oScope, fnResolve) {
			/*
			 oIssueManager - allows you to add new issues with the addIssue() method
			 oCoreFacade - gives you access to state of the core: getMetadata(), getUIAreas(), getComponents(), getModels()
			 oScope - retrieves elements in the scope with these methods: getElements(), getElementsByClassName(className), getLoggedObjects(type)
			 fnResolve - optional, passed when the rule property async is set to true
			*/
			var sType = "sap.suite.ui.generic.template.busyHandling",
				iRecheckBusyDelay = 1000, // Delay after which busy elements are checked if they are still busy
				mIssueLogged = {},
				mIssueList,
				sDetails;

			// Check all log entries with supportInfo for type busyHandling (structure: <library>.<id>) and supportinfo.elementId in scope
			oScope.getLoggedObjects(sType).forEach(function(oElement) {
				var oSupportInfo = oElement.supportInfo;

				// If we have a pending promise we can create an issue immediately
				if (oSupportInfo.promisePending) {
					if (oSupportInfo.reason) {
						sDetails =  oSupportInfo.method + ": called with reason " + oSupportInfo.reason + " since ";
					} else {
						sDetails =  oSupportInfo.method + ": Pending promise set since ";
					}
					sDetails += ((jQuery.sap.now() - oElement.timestamp) / 1000).toFixed(1) + " sec " + oSupportInfo.caller;
					oIssueManager.addIssue({
						severity: Severity.Medium,
						details: sDetails,
						context: {
							id: oSupportInfo.elementId
						}
					});
					mIssueLogged[oSupportInfo.elementId] = true;
				}
			});

			function checkBusyControls() {
				var mIssueList = [],
					mElements = oScope.getElements(),
					mElemIds = mElements.map(function (element) {
						return element.getId();
					}),
					$busy = jQuery(".sapUiLocalBusy"); // Set by sap.me.BusyIndicator

				$busy.each(function() {
					var $item = jQuery(this),
						sId = $item.attr("id"),
						oElement = sap.ui.getCore().byId(sId),
						sElementId;

					if (!oElement) {
						oElement = $item.control(0); // Maybe parent control
					}
					sElementId = (oElement) ? oElement.getId() : "";

					if (jQuery.inArray(sElementId, mElemIds) > -1) { // Only if in scope
						// Special handling for Fiori loading dialog busy indicator which is always in state busy
						if (sElementId !== "fiori2LoadingDialogBusyIndicator" || sap.ui.getCore().byId("Fiori2LoadingDialog").isOpen()) {
							if (!mIssueLogged[sId]) {
								mIssueList.push({
									timestamp: jQuery.sap.now(),
									id: sId,
									busyType: "checkBusyLocal"
								});
							}
						}
					}
				});

				if (jQuery("body").attr("aria-busy")) { // Set by sap.ui.core.BusyIndicator
					mIssueList.push({
						timestamp: jQuery.sap.now(),
						id: "WEBPAGE",
						busyType: "checkBusyGlobal"
					});
				}
				return mIssueList;
			}

			function recheckBusyControls(issueList) {
				issueList.forEach(function(oIssue) {
					var sId = oIssue.id;

					switch (oIssue.busyType) {
						case "checkBusyLocal":
							if (jQuery.sap.byId(sId).hasClass("sapUiLocalBusy")) { // Use ID where the class was found
								// Special handling for Fiori loading dialog busy indicator which is always in state busy
								if (sId !== "fiori2LoadingDialogBusyIndicator" || sap.ui.getCore().byId("Fiori2LoadingDialog").isOpen()) {
									oIssueManager.addIssue({
										severity: Severity.Low,
										details: "There is a local busy indicator for at least "
											+ ((jQuery.sap.now() - oIssue.timestamp) / 1000).toFixed(1) + " sec which is not set by SAP Fiori elements.",
										context: {
											id: sId
										}
									});
								}
							}
							break;
						case "checkBusyGlobal":
							if (jQuery("body").attr("aria-busy")) {
								oIssueManager.addIssue({
									severity: Severity.Low,
									details: "There is a global busy indicator for at least "
										+ ((jQuery.sap.now() - oIssue.timestamp) / 1000).toFixed(1) + " sec which is not set by SAP Fiori elements.",
									context: {
										id: sId
									}
								});
							}
							break;
						default:
							jQuery.sap.log.warning("Unknown busy type: " + oIssue.busyType);
							break;
					}
				});
				fnResolve();
			}

			mIssueList = checkBusyControls();
			if (mIssueList.length) {
				setTimeout(recheckBusyControls, iRecheckBusyDelay, mIssueList);
			} else {
				fnResolve();
			}
		}
	};

	return [
		oBusyHandling
	];

}, true);
