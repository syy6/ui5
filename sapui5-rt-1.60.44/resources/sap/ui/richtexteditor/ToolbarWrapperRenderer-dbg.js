/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */
// Provides default renderer for control sap.ui.richtexteditor.ToolbarWrapper
sap.ui.define(['sap/ui/core/Renderer'],
	function(Renderer)	{
		"use strict";


		/**
		 * RichTextEditor's ToolbarRenderer
		 * @class
		 * @static
		 */
		var ToolbarRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the Render-Output-Buffer.
		 * @param {sap.ui.richtexteditor.ToolbarWrapper} oToolbarWrapper The Toolbar control that should be rendered.
		 */
		ToolbarRenderer.render = function (oRM, oToolbarWrapper) {
			oToolbarWrapper.getAggregation("_toolbar").addStyleClass("sapUiRTECustomToolbar");
			oRM.renderControl(oToolbarWrapper.getAggregation("_toolbar"));
		};

		return ToolbarRenderer;

	}, /* bExport= */ true);