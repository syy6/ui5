/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */

sap.ui.define([
	    './library',
		'sap/ui/core/theming/Parameters',
		"sap/base/security/encodeXML",
		'sap/suite/ui/microchart/MicroChartRenderUtils',
		'sap/m/ValueColor'
	],
	function(library, Parameters, encodeXML, MicroChartRenderUtils, ValueColor) {
	"use strict";

	/**
	 * LineMicroChart renderer.
	 * @namespace
	 */
	var LineMicroChartRenderer = {};
	var LineType = library.LineType;

	LineMicroChartRenderer.QUALITATIVE_CLASS = "sapUiChartPaletteQualitativeHue";
	LineMicroChartRenderer.QUALITATIVE_MAX = 22;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @public
	 */
	LineMicroChartRenderer.render = function(oRm, oControl) {
		if (oControl._hasData()) {
			oRm.write("<div");
			this._writeMainProperties(oRm, oControl);
			oRm.writeStyles();

			if (oControl._bSemanticMode) {
				oRm.addClass("sapSuiteLMCSemanticMode");
			}
			if (oControl._bFocusMode) {
				oRm.addClass("sapSuiteLMCFocusMode");
			}

			if (oControl._bNoBottomLabels || !oControl.getShowBottomLabels()) {
				oRm.addClass("sapSuiteLMCNoBottomLabels");
			}
			if (oControl._bNoTopLabels || !oControl.getShowTopLabels()) {
				oRm.addClass("sapSuiteLMCNoTopLabels");
			}
			
			oRm.writeClasses();

			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapSuiteLMCVerticalAlignmentContainer");
			oRm.writeClasses();
			oRm.write(">");

			// Top Labels
			this._renderLabelsTop(oRm, oControl);

			oRm.write("<div");
			oRm.addClass("sapSuiteLMCContentWrapper");
			oRm.writeClasses();
			oRm.write(">");

			// Canvas and SVG
			this._renderCanvas(oRm, oControl);

			this._renderThresholdLabel(oRm, oControl);

			oRm.write("</div>"); // end of sapSuiteLMCContentWrapper

			// Bottom Labels
			this._renderLabelsBottom(oRm, oControl);
			oRm.write("</div>");

			oRm.write("</div>");
		} else {
			oRm.write("<div");
			this._writeMainProperties(oRm, oControl);
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			this._renderNoData(oRm);

			oRm.write("</div>");
		}
	};

		/**
		 * Renders control data and prepares default classes and styles
		 *
		 * @param {object} oRm render manager
		 * @param {object} oControl AreaMicroChart control
		 * @private
		 */
		LineMicroChartRenderer._writeMainProperties = function(oRm, oControl) {
			var bIsActive = oControl.hasListeners("press");

			this._renderActiveProperties(oRm, oControl);
			// screen reader
			var sAriaLabel = oControl._createTooltipText(bIsActive);
			oRm.writeAttribute("role", "img");

			if (oControl.getAriaLabelledBy().length) {
				oRm.writeAccessibilityState(oControl);
			} else {
				oRm.writeAttributeEscaped("aria-label", sAriaLabel);
			}

			oRm.writeControlData(oControl);
			oRm.addClass("sapSuiteLMC");
			oRm.addClass("sapSuiteLMCSize" + oControl.getSize());

			oRm.addStyle("width", oControl.getWidth());
			oRm.addStyle("height", oControl.getHeight());
		};

	/**
	 * Renders the HTML for the canvas.
	 *
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @private
	 */
	LineMicroChartRenderer._renderCanvas = function(oRm, oControl) {
		var aPoints;
		var iPointsCount;

		oRm.write("<div");
		oRm.addClass("sapSuiteLMCSvgCanvas");
		oRm.writeClasses();
		oRm.write(">");

		// render the lines if valid scaling
		if (oControl._bScalingValid) {
			oRm.write("<svg");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-sapSuiteLMCSvgElement");
			oRm.writeAttribute("focusable", "false");
			oRm.addClass("sapSuiteLMCSvgElement");
			oRm.writeClasses();
			oRm.write(">");

			this._renderThresholdLine(oRm, oControl);

			oControl._getLines().forEach(function(oLine, iIndex) {
				oRm.write("<g");
				oRm.writeElementData(oLine);
				oRm.write(">");

				iPointsCount = oLine._getPoints().length;

				for (var i = 1; i < iPointsCount; i++) {
					this._renderLine(oRm, oControl, iIndex,
						oLine._aNormalizedPoints[i - 1].x, oLine._aNormalizedPoints[i - 1].y,
						oLine._aNormalizedPoints[i].x, oLine._aNormalizedPoints[i].y);
				}

				oRm.write("</g>");
			}, this);
			oRm.write('</svg>');


			oRm.write("<div");
			oRm.addClass("sapSuiteLMCPointsContainer");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-sapSuiteLMCPointsContainer");
			oRm.writeClasses();
			oRm.write(">");

			oControl._getLines().forEach(function(oLine, iIndex) {
				aPoints = oLine._getPoints();
				iPointsCount = aPoints.length;

				// render the points if valid scaling
				var bShowPoints = oLine.getShowPoints(),
					oPoint,
					bPointEmphasized;
				if (oLine._bFocusMode || bShowPoints) {
					for (var j = 0; j < iPointsCount; j++) {
						oPoint = aPoints[j];
						bPointEmphasized = this._isPointEmphasized(oPoint);
						if (!oLine._bFocusMode && bShowPoints || oLine._bFocusMode && bPointEmphasized && oPoint.getShow()) {
							this._renderPoint(oRm, oControl, iIndex, oPoint, j, bPointEmphasized);
						}
					}
				}
			}, this);
			oRm.write( "</div>");
		}


		oRm.write( "</div>");
	};

		/**
		 * Renders HTML for the threshold label
		 *
		 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oControl The control to be rendered
		 * @private
		 */
	LineMicroChartRenderer._renderThresholdLabel = function(oRm, oControl) {
		var sValue = oControl.getThresholdDisplayValue();

		if (this._isThresholdValue(oControl) && oControl.getShowThresholdLine() && oControl.getShowThresholdValue()) {
			oRm.write("<div");
			oRm.addClass("sapSuiteLMCThresholdLabelWrapper");
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapSuiteLMCThresholdLabel");
			oRm.writeClasses();
			oRm.write(">");

			sValue = sValue ? sValue : oControl.getThreshold();

			oRm.writeEscaped(sValue);

			oRm.write("</div>"); // end of sapSuiteLMCThresholdLabel
			oRm.write("</div>"); // end of sapSuiteLMCThresholdLabelWrapper
		}
	};

	/**
	 * Renders the HTML for the point.
	 *
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @param {int} iLineIndex index of the current line
	 * @param {sap.suite.ui.microchart.LineMicroChartPoint} oPoint The point to be rendered
	 * @param {int} iPointIndex The position of the point in the aggregation
	 * @param {boolean} bEmphasized Sets whether or not an emphasized point is to be rendered
	 * @private
	 */
	LineMicroChartRenderer._renderPoint = function(oRm, oControl, iLineIndex, oPoint, iPointIndex, bEmphasized) {
		var oLine = oControl._getLines()[iLineIndex],
			sType = oLine.getType(),
			oNormalizedPoint = oLine._aNormalizedPoints[iPointIndex],
			oChartColor = oLine.getColor(),
			oPointColor,
			sStyle;

		// do not draw point if it is outside the canvas
		if (oNormalizedPoint.x < 0 || oNormalizedPoint.x > 100 || oNormalizedPoint.y < 0 || oNormalizedPoint.y > 100) {
			return;
		}

		oRm.write("<div");
		oRm.addStyle("left", encodeXML(oNormalizedPoint.x + "%"));
		oRm.addStyle("top", encodeXML(100 - oNormalizedPoint.y + "%"));


		sStyle = (sType === LineType.Dotted) ? "border-color" : "background-color";
		oRm.addClass("sapSuiteLMCPoint" + sType);

		if (oLine._bFocusMode && oLine._bSemanticMode) {
			oPointColor = oPoint.getColor();
			if (ValueColor[oPointColor]) {
				oRm.addClass("sapSuiteLMCPoint" + jQuery.sap.encodeXML(oPointColor));
			} else {
				oRm.addStyle(sStyle, encodeXML(this._getHexColor(oPointColor)));
			}
		} else if (!oLine._bFocusMode && oLine._bSemanticMode) {
			if (oPoint.getY() >= oControl.getThreshold()) {
				if (ValueColor[oChartColor.above]) {
					oRm.addClass("sapSuiteLMCPoint" + encodeXML(oChartColor.above));
				} else {
					oRm.addStyle(sStyle, encodeXML(this._getHexColor(oChartColor.above)));
				}
			} else if (ValueColor[oChartColor.below]) {
				oRm.addClass("sapSuiteLMCPoint" + encodeXML(oChartColor.below));
			} else {
				oRm.addStyle(sStyle, encodeXML(this._getHexColor(oChartColor.below)));
			}
		} else if (!oLine._bSemanticMode && typeof oChartColor === "string") {
			if (oLine.getColor() === ValueColor.Neutral) { // in this case, neutral color changes for each new line
				oRm.addStyle(sStyle, encodeXML(this._getQualitativeColor(iLineIndex + 1)));
			} else if (ValueColor[oChartColor]) {
				oRm.addClass("sapSuiteLMCPoint" + encodeXML(oChartColor));
			} else {
				oRm.addStyle(sStyle, encodeXML(this._getHexColor(oChartColor)));
			}
		} else {
			oRm.addStyle(sStyle, encodeXML(this._getQualitativeColor(iLineIndex + 1)));
		}

		oRm.addClass("sapSuiteLMCPoint");
		if (bEmphasized && oPoint.getShow()) {
			oRm.addClass("sapSuiteLMCPointEmphasized");
		}

		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write("></div>");
	};

	/**
	 * Renders the HTML for the threshold line.
	 *
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @private
	 */
	LineMicroChartRenderer._renderThresholdLine = function(oRm, oControl) {
		if (this._isThresholdValue(oControl) && oControl.getShowThresholdLine()) {
			oRm.write("<line");
			oRm.writeAttribute("x1", "0%");
			oRm.writeAttributeEscaped("y1", (100 - oControl._fNormalizedThreshold) + "%");
			oRm.writeAttribute("x2", "100%");
			oRm.writeAttributeEscaped("y2", (100 - oControl._fNormalizedThreshold) + "%");
			oRm.addClass("sapSuiteLMCLineThreshold");
			oRm.writeClasses();
			oRm.write("/>");
		}
	};

	LineMicroChartRenderer._isThresholdValue = function(oControl) {
		return oControl._fNormalizedThreshold >= 0 && oControl._fNormalizedThreshold <= 100
			&& !oControl._bThresholdNull;
	};

	/**
	 * Renders the HTML for the line.
	 *
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @param {int} iLineIndex index of the current line
	 * @param {int} iStartPosX The horizontal dimension of the starting point
	 * @param {int} iStartPosY The vertical dimension of the starting point
	 * @param {int} iEndPosX The horizontal dimension of the ending point
	 * @param {int} iEndPosY The vertical dimension of the ending point
	 * @private
	 */
	LineMicroChartRenderer._renderLine = function(oRm, oControl, iLineIndex, iStartPosX, iStartPosY, iEndPosX, iEndPosY) {
		// ignore the points which are outside of the scaled canvas ({0, 0}; {100, 100})
		if (this._isDimensionLineOutsideCanvas(oControl, iStartPosX, iEndPosX, "X") || // X dimension
			this._isDimensionLineOutsideCanvas(oControl, iStartPosY, iEndPosY, "Y")) { // Y dimension
			return;
		}

		var fIntersectionX, fIntersectionY,
			iLineWidth = iEndPosX - iStartPosX,
			iLineHeight = iEndPosY - iStartPosY;
		if ((iStartPosY - oControl._fNormalizedThreshold) * (iEndPosY - oControl._fNormalizedThreshold) < 0) {
			// in case the line intersects 0, two different lines will be drawn instead;
			// infinite loop will not occur because the above condition (0*0) < 0 is always false
			fIntersectionX = iStartPosX + (oControl._fNormalizedThreshold - iStartPosY) * iLineWidth / iLineHeight;
			this._renderLine(oRm, oControl, iLineIndex, iStartPosX, iStartPosY, fIntersectionX, oControl._fNormalizedThreshold);
			this._renderLine(oRm, oControl, iLineIndex, fIntersectionX, oControl._fNormalizedThreshold, iEndPosX, iEndPosY);
			// for line strokes to be round rather than cut-off, we must allow visible overflow and get rid of actual overflowing elements manually;
			// detect intersections with regard to the given scaling and split lines recursively while keeping directional angles unchanged
		} else if (iStartPosY * iEndPosY < 0) { // intersection bottom
			fIntersectionX = iStartPosX - iStartPosY * iLineWidth / iLineHeight;
			this._renderLine(oRm, oControl, iLineIndex, iStartPosX, iStartPosY, fIntersectionX, 0);
			this._renderLine(oRm, oControl, iLineIndex, fIntersectionX, 0, iEndPosX, iEndPosY);
		} else if ((iStartPosY - 100) * (iEndPosY - 100) < 0) { // intersection top
			fIntersectionX = iStartPosX + (100 - iStartPosY) * iLineWidth / iLineHeight;
			this._renderLine(oRm, oControl, iLineIndex, iStartPosX, iStartPosY, fIntersectionX, 100);
			this._renderLine(oRm, oControl, iLineIndex, fIntersectionX, 100, iEndPosX, iEndPosY);
		} else if (iStartPosX * iEndPosX < 0) { // intersection left
			fIntersectionY = iStartPosY - iStartPosX * iLineHeight / iLineWidth;
			this._renderLine(oRm, oControl, iLineIndex, iStartPosX, iStartPosY, 0, fIntersectionY);
			this._renderLine(oRm, oControl, iLineIndex, 0, fIntersectionY, iEndPosX, iEndPosY);
		} else if ((iStartPosX - 100) * (iEndPosX - 100) < 0) { // intersection right
			fIntersectionY = iStartPosY + (100 - iStartPosX) * iLineHeight / iLineWidth;
			this._renderLine(oRm, oControl, iLineIndex, iStartPosX, iStartPosY, 100, fIntersectionY);
			this._renderLine(oRm, oControl, iLineIndex, 100, fIntersectionY, iEndPosX, iEndPosY);
		} else {
			this._displayLine(oRm, oControl, iLineIndex, iStartPosX, iStartPosY, iEndPosX, iEndPosY);
		}
	};

	/**
	 * Displays the HTML for the line.
	 *
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @param {int} iLineIndex index of the current line
	 * @param {int} iStartPosX The horizontal dimension of the starting point
	 * @param {int} iStartPosY The vertical dimension of the starting point
	 * @param {int} iEndPosX The horizontal dimension of the ending point
	 * @param {int} iEndPosY The vertical dimension of the ending point
	 * @private
	 */
	LineMicroChartRenderer._displayLine = function(oRm, oControl, iLineIndex, iStartPosX, iStartPosY, iEndPosX, iEndPosY) {
		var oLine = oControl._getLines()[iLineIndex],
			oChartColor = oLine.getColor();

		oRm.write("<line");
		oRm.writeAttributeEscaped("x1", iStartPosX + "%");
		oRm.writeAttributeEscaped("y1", (100 - iStartPosY) + "%");
		oRm.writeAttributeEscaped("x2", iEndPosX + "%");
		oRm.writeAttributeEscaped("y2", (100 - iEndPosY) + "%");
		oRm.addClass("sapSuiteLMCLine");
		oRm.addClass("sapSuiteLMCLine" + oLine.getType());

		if (oLine._bSemanticMode && oLine._bFocusMode) {
			oRm.addClass("sapSuiteLMCLineNeutral");
		} else if (oLine._bSemanticMode && !oLine._bFocusMode) {
			if (iStartPosY >= oControl._fNormalizedThreshold && iEndPosY >= oControl._fNormalizedThreshold) {
				if (ValueColor[oChartColor.above]) {
					oRm.addClass("sapSuiteLMCLine" + encodeXML(oChartColor.above));
				} else {
					oRm.addStyle("stroke", encodeXML(this._getHexColor(oChartColor.above)));
				}
			} else if (ValueColor[oChartColor.below]) {
				oRm.addClass("sapSuiteLMCLine" + encodeXML(oChartColor.below));
			} else {
				oRm.addStyle("stroke", encodeXML(this._getHexColor(oChartColor.below)));
			}
		} else if (!oLine._bSemanticMode && typeof oChartColor === "string") {
			if (oChartColor === ValueColor.Neutral) { // in this case, neutral color changes for each new line
				oRm.addStyle("stroke", encodeXML(this._getQualitativeColor(iLineIndex + 1)));
			} else if (ValueColor[oChartColor]) {
				oRm.addClass("sapSuiteLMCLine" + encodeXML(oChartColor));
			} else {
				oRm.addStyle("stroke", encodeXML(this._getHexColor(oChartColor)));
			}
		} else {
			oRm.addStyle("stroke", encodeXML(this._getQualitativeColor(iLineIndex + 1)));
		}
		oRm.writeStyles();
		oRm.writeClasses();
		oRm.write("/>");
	};

	LineMicroChartRenderer._getQualitativeColor = function(iIndex) {
		return this._getHexColor(this.QUALITATIVE_CLASS + (iIndex % this.QUALITATIVE_MAX));
	};

	/**
	 * Renders the HTML for the bottom labels.
	 *
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @private
	 */
	LineMicroChartRenderer._renderLabelsBottom = function(oRm, oControl) {
		var sLeftBottomLabel = oControl.getLeftBottomLabel(),
			sRightBottomLabel = oControl.getRightBottomLabel();

		if (!oControl.getShowBottomLabels() || (!sLeftBottomLabel && !sRightBottomLabel)) {
			return;
		}

		oRm.write("<div");
		oRm.addClass("sapSuiteLMCLabels");
		oRm.addClass("sapSuiteLMCLabelsBottom");
		oRm.writeClasses();
		oRm.write(">");

		if ((sLeftBottomLabel && sLeftBottomLabel.length > 0) || (sRightBottomLabel && sRightBottomLabel.length > 0)) {
			// left bottom label
			oRm.write("<div");
			oRm.addClass("sapSuiteLMCLeftBottomLabel");
			oRm.addClass("sapSuiteLMCLabel");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sLeftBottomLabel);
			oRm.write("</div>");

			// right bottom label
			oRm.write("<div");
			oRm.addClass("sapSuiteLMCRightBottomLabel");
			oRm.addClass("sapSuiteLMCLabel");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sRightBottomLabel);
			oRm.write("</div>");
		}

		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the top labels.
	 *
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @private
	 */
	LineMicroChartRenderer._renderLabelsTop = function(oRm, oControl) {
		var sLeftTopLabel = oControl.getLeftTopLabel(),
			sRightTopLabel = oControl.getRightTopLabel(),
			oLine = oControl._getLines()[0];

		if (!oControl.getShowTopLabels() ||  (!sLeftTopLabel && !sRightTopLabel)) {
			return;
		}

		var sTopLeftSemanticClass = "",
			sTopRightSemanticClass = "",
			sTopLeftColorStyle = "",
			sTopRightColorStyle = "",
			aPoints,
			iPointsNum,
			oFirstPoint,
			oLastPoint,
			oColor;



		var fnAddColorStyle = function (sColor) {
			oRm.addStyle("color", sColor);
			oRm.writeStyles();
		};

		var fnSetClassOrStyle = function (oPoint, bIsTopRight) {
			var sSemanticClass = "",
				sColorStyle = "";

			if (this._isPointEmphasized(oPoint) && oPoint.getShow()) {
				oColor = oPoint.getColor();
				if (ValueColor[oColor]) {
					sSemanticClass = "sapSuiteLMCLabel" + oColor;
				} else {
					sColorStyle = this._getHexColor(oColor);
				}
			} else {
				sSemanticClass = "sapSuiteLMCLabelNeutral";
			}

			if (bIsTopRight) {
				sTopRightColorStyle = sColorStyle;
				sTopRightSemanticClass = sSemanticClass;
			} else {
				sTopLeftColorStyle = sColorStyle;
				sTopLeftSemanticClass = sSemanticClass;
			}
		}.bind(this);

		if (oLine && oLine._getPoints().length > 1) {
			aPoints = oLine._getPoints();
			iPointsNum = aPoints.length;
			oFirstPoint = aPoints[0];
			oLastPoint = aPoints[iPointsNum - 1];
			var oChartColor = oLine.getColor();

			if (oLine._bFocusMode && oLine._bSemanticMode && oControl._bScalingValid) {
				fnSetClassOrStyle(oFirstPoint, false);
				fnSetClassOrStyle(oLastPoint, true);
			} else if (!oLine._bFocusMode && oLine._bSemanticMode && oControl._bScalingValid && oLine.getShowPoints() &&
					ValueColor[oChartColor.above] && ValueColor[oChartColor.below]) {

				if (oFirstPoint.getY() >= oControl.getThreshold()) {
					sTopLeftSemanticClass = "sapSuiteLMCLabel" + oChartColor.above;
				} else {
					sTopLeftSemanticClass = "sapSuiteLMCLabel" + oChartColor.below;
				}
				if (oLastPoint.getY() >= oControl.getThreshold()) {
					sTopRightSemanticClass = "sapSuiteLMCLabel" + oChartColor.above;
				} else {
					sTopRightSemanticClass = "sapSuiteLMCLabel" + oChartColor.below;
				}
			} else {
				sTopLeftSemanticClass = "sapSuiteLMCLabelNeutral";
				sTopRightSemanticClass = "sapSuiteLMCLabelNeutral";
			}
		}

		oRm.write("<div");
		oRm.addClass("sapSuiteLMCLabels");
		oRm.addClass("sapSuiteLMCLabelsTop");
		oRm.writeClasses();
		oRm.write(">");

		if ((sLeftTopLabel && sLeftTopLabel.length > 0)  || (sRightTopLabel && sRightTopLabel.length > 0)) {
			// left top label
			oRm.write("<div");
			oRm.addClass("sapSuiteLMCLeftTopLabel");
			oRm.addClass("sapSuiteLMCLabel");
			oRm.addClass(encodeXML(sTopLeftSemanticClass));
			oRm.writeClasses();
			if (sTopLeftColorStyle) {
				fnAddColorStyle(sTopLeftColorStyle);
			}
			oRm.write(">");
			oRm.writeEscaped(sLeftTopLabel);
			oRm.write("</div>");

			// right top label
			oRm.write("<div");
			oRm.addClass("sapSuiteLMCRightTopLabel");
			oRm.addClass("sapSuiteLMCLabel");
			oRm.addClass(encodeXML(sTopRightSemanticClass));
			oRm.writeClasses();
			if (sTopRightColorStyle) {
				fnAddColorStyle(sTopRightColorStyle);
			}
			oRm.write(">");
			oRm.writeEscaped(oControl.getRightTopLabel());
			oRm.write("</div>");
		}

		oRm.write("</div>");
	};

	/**
	 * Checks if the given point is an emphasized point.
	 * @param {sap.suite.ui.microchart.LineMicroChartPoint} point The instance of point to be checked
	 * @returns {boolean} True if the given point is emphasized, false if not
	 * @private
	 */
	LineMicroChartRenderer._isPointEmphasized = function(point) {
		return point && point.getMetadata().getName() === "sap.suite.ui.microchart.LineMicroChartEmphasizedPoint";
	};

	/**
	 * Returns the hex color corresponding to the provided color name.
	 *
	 * @private
	 * @param {string} color The name of the color
	 * @returns {string} The corresponding hex color
	 */
	LineMicroChartRenderer._getHexColor = function(color) {
		return Parameters.get(color) || color;
	};

	/**
	 * Tests (one dimension only) if the line is outside of the scaled canvas.
	 *
	 * @private
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @param {int} startPos The starting point dimension
	 * @param {int} endPos The ending point dimension
	 * @param {string} axis The axis type of values ('X' or 'Y')
	 * @returns {boolean} True if the line is outside, false otherwise.
	 */
	LineMicroChartRenderer._isDimensionLineOutsideCanvas = function(oControl, startPos, endPos, axis) {
		var iMaxLimit = 100, iMinLimit = 0;
		if (axis === "X" && oControl._minXScale === oControl._maxXScale) { // X axis limits
			iMaxLimit = 50;
			iMinLimit = 50;
		} else if (axis === "Y" && oControl._minYScale === oControl._maxYScale) { // Y axis limits
			iMaxLimit = 50;
			iMinLimit = 50;
		}

		return ((startPos >= iMaxLimit && endPos >= iMaxLimit) && !(startPos === iMaxLimit && endPos === iMaxLimit)) || // iMaxLimit
			((startPos <= iMinLimit && endPos <= iMinLimit) && !(startPos === iMinLimit && endPos === iMinLimit)); // iMinLimit
	};

	MicroChartRenderUtils.extendMicroChartRenderer(LineMicroChartRenderer);

	return LineMicroChartRenderer;

}, /* bExport= */ true);
