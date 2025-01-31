/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP SE. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ca.ui.InPlaceEdit.
jQuery.sap.declare("sap.ca.ui.InPlaceEdit");
jQuery.sap.require("sap.ca.ui.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new InPlaceEdit.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>{@link #getValueState valueState} : sap.ui.core.ValueState (default: sap.ui.core.ValueState.None)</li>
 * <li>{@link #getUndoEnabled undoEnabled} : boolean (default: false)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getContent content} : sap.ui.core.Control</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.ca.ui.InPlaceEdit#event:change change} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * 
 * This control is used to switch between readonly and edit modes. A typical use case would be to change the value of a Label.
 * @extends sap.ui.core.Control
 * @version 1.60.4
 *
 * @constructor
 * @public
 * @deprecated Since version 1.22. 
 * This control is not required anymore as per central UX requirements.
 * Please use sap.m.Input instead!
 * This control will not be supported anymore.
 * @name sap.ca.ui.InPlaceEdit
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.ca.ui.InPlaceEdit", { metadata : {

	deprecated : true,
	publicMethods : [
		// methods
		"clearOldText"
	],
	library : "sap.ca.ui",
	properties : {

		/**
		 * Visualizes warnings or errors related to the InPlaceEdit. Possible values: Warning, Error, Success.
		 * If the content control has a own valueState property this will be used.
		 */
		"valueState" : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : sap.ui.core.ValueState.None},

		/**
		 * If undo is enabled after changing the text an undo button appears.
		 */
		"undoEnabled" : {type : "boolean", group : "Misc", defaultValue : false}
	},
	aggregations : {

		/**
		 * Content control of the InPlaceEdit.
		 * The following control is allowed: sap.m.Input, sap.m.Link
		 */
		"content" : {type : "sap.ui.core.Control", multiple : false}
	},
	events : {

		/**
		 * Event is fired when the text in the field has changed AND the focus leaves the InPlaceEdit or the Enter key is pressed.
		 */
		"change" : {
			parameters : {

				/**
				 * The new / changed value of the InPlaceEdit.
				 */
				"newValue" : {type : "string"}
			}
		}
	}
}});


/**
 * Creates a new subclass of class sap.ca.ui.InPlaceEdit with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ca.ui.InPlaceEdit.extend
 * @function
 */

sap.ca.ui.InPlaceEdit.M_EVENTS = {'change':'change'};


/**
 * Getter for property <code>valueState</code>.
 * Visualizes warnings or errors related to the InPlaceEdit. Possible values: Warning, Error, Success.
 * If the content control has a own valueState property this will be used.
 *
 * Default value is <code>None</code>
 *
 * @return {sap.ui.core.ValueState} the value of property <code>valueState</code>
 * @public
 * @name sap.ca.ui.InPlaceEdit#getValueState
 * @function
 */

/**
 * Setter for property <code>valueState</code>.
 *
 * Default value is <code>None</code> 
 *
 * @param {sap.ui.core.ValueState} oValueState  new value for property <code>valueState</code>
 * @return {sap.ca.ui.InPlaceEdit} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.InPlaceEdit#setValueState
 * @function
 */


/**
 * Getter for property <code>undoEnabled</code>.
 * If undo is enabled after changing the text an undo button appears.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>undoEnabled</code>
 * @public
 * @name sap.ca.ui.InPlaceEdit#getUndoEnabled
 * @function
 */

/**
 * Setter for property <code>undoEnabled</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bUndoEnabled  new value for property <code>undoEnabled</code>
 * @return {sap.ca.ui.InPlaceEdit} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.InPlaceEdit#setUndoEnabled
 * @function
 */


/**
 * Getter for aggregation <code>content</code>.<br/>
 * Content control of the InPlaceEdit.
 * The following control is allowed: sap.m.Input, sap.m.Link
 * 
 * @return {sap.ui.core.Control}
 * @public
 * @name sap.ca.ui.InPlaceEdit#getContent
 * @function
 */


/**
 * Setter for the aggregated <code>content</code>.
 * @param {sap.ui.core.Control} oContent
 * @return {sap.ca.ui.InPlaceEdit} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.InPlaceEdit#setContent
 * @function
 */
	

/**
 * Destroys the content in the aggregation 
 * named <code>content</code>.
 * @return {sap.ca.ui.InPlaceEdit} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.InPlaceEdit#destroyContent
 * @function
 */


/**
 * Event is fired when the text in the field has changed AND the focus leaves the InPlaceEdit or the Enter key is pressed.
 *
 * @name sap.ca.ui.InPlaceEdit#change
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {string} oControlEvent.getParameters.newValue The new / changed value of the InPlaceEdit.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'change' event of this <code>sap.ca.ui.InPlaceEdit</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ca.ui.InPlaceEdit</code>.<br/> itself. 
 *  
 * Event is fired when the text in the field has changed AND the focus leaves the InPlaceEdit or the Enter key is pressed.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ca.ui.InPlaceEdit</code>.<br/> itself.
 *
 * @return {sap.ca.ui.InPlaceEdit} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.InPlaceEdit#attachChange
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'change' event of this <code>sap.ca.ui.InPlaceEdit</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ca.ui.InPlaceEdit} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.InPlaceEdit#detachChange
 * @function
 */

/**
 * Fire event change to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'newValue' of type <code>string</code> The new / changed value of the InPlaceEdit.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ca.ui.InPlaceEdit} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ca.ui.InPlaceEdit#fireChange
 * @function
 */


/**
 * Clear the old text after a change to disable the undo functionality. If undoEnabled is false this has no effect.
 *
 * @name sap.ca.ui.InPlaceEdit#clearOldText
 * @function
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */

// Start of sap/ca/ui/InPlaceEdit.js
/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.m.Input");
jQuery.sap.require("sap.m.Select");
jQuery.sap.require("sap.m.Link");

/*
 * On focus the InplaceEdit automatically switches to edit mode. Only for Links it stays in display mode to allow link-clicking.
 * When the focus is set outside the control is switches back to display mode. So for styling it is clear that edit mode
 * is always focused. The focusout handling must be done with a delay because in ComboBoxes the click of the expand button fires a focusout event too.
 * So it must be checked if the focus is still inside the control.
 * As the content controls don't bubble their property changes the _change event is handled. Because the InPlaceEdit have to react on content-changes.
 * Changing the content needs a rerendering of the InPlaceEdit. Toggling edit mode also rerenders the control.
 * The focusDomRef is in display mode the display control, in edit mode the edit control.
 * So as the control often rerenders and changes the focusDomRef be careful if you put the control in an ItemNavigation. (Update the DomRefs!)
 */

sap.ca.ui.InPlaceEdit.prototype.init = function() {

	this._bEditMode = false;

};

sap.ca.ui.InPlaceEdit.prototype.exit = function() {

	this._bEditMode = undefined;
	this._oDisplayControl = undefined;
	this._oEditControl = undefined;
	this._sOldText = undefined;
	this._sOldTextAvailable = undefined;
	this._bUseEditButton = undefined;
	this._iHeight = undefined;

	if (this._oTextView) {
		this._oTextView.destroy();
		delete this._oTextView;
	}

	if (this._oTextField) {
		this._oTextField.destroy();
		delete this._oTextField;
	}

	if (this._oUndoButton) {
		this._oUndoButton.destroy();
		delete this._oUndoButton;
	}

	if (this._oEditButton) {
		this._oEditButton.destroy();
		delete this._oEditButton;
	}

	var oContent = this.getContent();
	if (oContent) {
		oContent.detachEvent("_change", this._handleContentInvalidate, this);
		if (oContent instanceof sap.m.Input) {
			oContent.detachEvent("change", this._handleContentChange, this);
			oContent.detachEvent("liveChange",this._handleContentLiveChange, this);
		}
	}
};

sap.ca.ui.InPlaceEdit.prototype.onBeforeRendering = function() {

	// detach events
	if (!jQuery.device.is.desktop) {
		//this.$().off("focusin focus", jQuery.proxy(this.onfocusin, this));
		this.$().off("focusout blur", jQuery.proxy(this.onfocusout, this));
	}


	this._updateControls();

	this._createUndoButton(); // create here, because if created onfocusin there are focus errors

};

sap.ca.ui.InPlaceEdit.prototype.onAfterRendering = function() {
	// attach events
	if (!jQuery.device.is.desktop) {
		//this.$().on("focusin focus", jQuery.proxy(this.onfocusin, this));
		this.$().on("focusout blur", jQuery.proxy(this.onfocusout, this));
	}

	//
	// Warning: This method is called several times, for example after the child controls
	//          are (re-)rendered.
	//

	// if TextView is rendered make it not focusable (only InPlaceEdit is focused)
	if (!this._bEditMode && this.getEditable() && this._oTextView && jQuery.sap.domById(this._oTextView.getId())) {
		jQuery.sap.byId(this._oTextView.getId()).attr("tabindex", "0");
	}

	var $Control = jQuery.sap.byId(this.getId());
	// In edit mode use 100% width for edit control, because width is set outside
	if (this._bEditMode) {
		jQuery.sap.byId(this._oEditControl.getId()).css("width", "100%");
		if (this._iHeight > 0) {
			// Control is in display mode higher than in edit mode
			// add margins to center edit control
			var iOuterHeight = $Control.height();
			var iDelta = this._iHeight - iOuterHeight;
			// check if already margins added and add them
			var iMargins = $Control.outerHeight(true) - $Control.outerHeight(false);
			iDelta = iDelta + iMargins;
			var iMarginTop = Math.floor(iDelta / 2);
			var iMarginBottom = iDelta - iMarginTop;
			$Control.css("margin-top", iMarginTop + "px").css("margin-bottom", iMarginBottom + "px");
		}
	} else if (this._oDisplayControl instanceof sap.m.Link) {
		// edit icon should be directly next to link
		jQuery.sap.byId(this._oDisplayControl.getId()).css("width", "auto").css("max-width", "100%");
	} else {
		var $DisplayControl = jQuery.sap.byId(this._oDisplayControl.getId());
		$DisplayControl.css("width", "100%");
		if (!this._iHeight && this._iHeight != 0) {
			// check if TextView is higher than inPlaceEdits standards height (Header design) ->
			// set to this new height even in edit mode to avoid flickering
			// special case: standard TextView has line height of textFields height in most themes
			// but font size fits. in this case the height should not be changed.
			var iInnerHeight = $DisplayControl.outerHeight(true);
			var iOuterHeight = $Control.innerHeight();
			if (iOuterHeight < iInnerHeight) {
				// because of box-sizing: border-box add borders to height
				var iOffset = $Control.outerHeight() - $Control.innerHeight();
				this._iHeight = iInnerHeight + iOffset;
			} else {
				this._iHeight = 0;
			}
		}
		if (this._iHeight > 0) {
			$Control.css("height", this._iHeight + "px");
		}
	}

	// if undo button is rendered remove it from tab-chain
	if (this._sOldTextAvailable && this._oUndoButton && jQuery.sap.domById(this._oUndoButton.getId())) {
		jQuery.sap.byId(this._oUndoButton.getId()).attr("tabindex", "-1");
	}
	if (this._oEditButton && jQuery.sap.domById(this._oEditButton.getId())) {
		jQuery.sap.byId(this._oEditButton.getId()).attr("tabindex", "-1");
	}

	if (this._delayedCallId) {
		jQuery.sap.clearDelayedCall(this._delayedCallId);
		this._delayedCallId = null;
	}

	if (this.getValueState() == sap.ui.core.ValueState.Success) {
		this._delayedCallId = jQuery.sap.delayedCall(3000, this, "removeValidVisualization");
	}

};

sap.ca.ui.InPlaceEdit.prototype.removeValidVisualization = function() {

	var oDomRef = jQuery.sap.byId(this.getId());
	if (oDomRef) {
		oDomRef.removeClass("sapCaUiIpeSucc");
	}

};

sap.ca.ui.InPlaceEdit.prototype.clearOldText = function() {

	if (!this.getUndoEnabled()) {
		return;
	}

	if (this._bEditMode) {
		this._sOldText = this._oEditControl.getValue();
		this._sOldTextAvailable = true; // because "" can be a valid text so check for sOldText will not work in this case
	} else {
		this._sOldText = undefined;
		this._sOldTextAvailable = false;
	}
	this.rerender();

};

/*
 * If a label is assigned to the InPlaceEdit it need to know if it's required
 * So check the content for required
 * @public
 */
sap.ca.ui.InPlaceEdit.prototype.getRequired = function() {

	if (this.getContent() && this.getContent().getRequired) {
		return this.getContent().getRequired();
	} else {
		return false;
	}

};

sap.ca.ui.InPlaceEdit.prototype.getEditable = function() {

	var oContent = this.getContent();

	if ((oContent.getEditable && !oContent.getEditable()) || (oContent.getEnabled && !oContent.getEnabled())) {
		// readOnly or disabled -> only display mode
		return false;
	} else {
		return true;
	}

};

sap.ca.ui.InPlaceEdit.prototype.onsapescape = function(oEvent) {

	if (this.getUndoEnabled()) {
		// Escape fires no keypress in webkit
		// In Firefox value can not be changed in keydown (onsapescape) event
		// So the escape event is stored in this._bEsc and the value in this._sValue
		if (!!!sap.ui.Device.browser.firefox) {
			this._undoTextChange();
		} else {
			this._bEsc = true;
		}
		if (jQuery.sap.byId(this.getId()).hasClass("sapCaUiIpeUndo")) {
			// undo is possible -> do not propagate escape (not close popup)
			oEvent.stopPropagation();
		}
		// delete TextFields escape information, because native ESC-logic not needed
		this._oEditControl._bEsc = undefined;
		this._oEditControl._sValue = undefined;
	}

};

sap.ca.ui.InPlaceEdit.prototype.onkeypress = function(oEvent) {

	// Firefox escape logic
	if (this._bEsc) {
		this._bEsc = undefined;
		this._undoTextChange();
	}

};

sap.ca.ui.InPlaceEdit.prototype.onkeydown = function(oEvent) {

	if (oEvent.keyCode == jQuery.sap.KeyCodes.F2 && !this._bEditMode) {
		this._switchToEditMode();
		jQuery.sap.byId(this.getId()).addClass("sapCaUiIpeFocus");
	}

};

sap.ca.ui.InPlaceEdit.prototype.ontap = function(oEvent) {
	if (!jQuery.device.is.desktop) {
        this.onfocusin(oEvent);
    }
};

sap.ca.ui.InPlaceEdit.prototype.onfocusin = function(oEvent) {
	// in display mode focus is on displayControl -> simulate focus on outer DIV
	if (!this._bEditMode) {
		if (!this._bUseEditButton && oEvent.target.id != this.getId() + "--X") {
			// if not a link and not clicked on undo button -> directly switch to edit mode
			this._switchToEditMode();
		}
		jQuery.sap.byId(this.getId()).addClass("sapCaUiIpeFocus");
	}

};

sap.ca.ui.InPlaceEdit.prototype.onfocusout = function(oEvent) {

	if (this._focusDelay) {
		jQuery.sap.clearDelayedCall(this._focusDelay);
		this._focusDelay = null;
	}
	this._focusDelay = jQuery.sap.delayedCall(200, this, "_handleFocusOut", arguments); // check delayed because click of ComboBox Expander (shorter than 200 sometimes don't work)

};

sap.ca.ui.InPlaceEdit.prototype._handleFocusOut = function(oEvent) {

	var oFocusedDom = document.activeElement;
	if (!jQuery.sap.containsOrEquals(this.getDomRef(), oFocusedDom)) {
		// focus is not inside of the InPlaceEdit
		// in display mode focus is on displayControl -> simulate focus on outer DIV
		if (!this._bEditMode) {
			jQuery.sap.byId(this.getId()).removeClass("sapCaUiIpeFocus");
		}
		this._switchToDisplayMode();
	}

};

sap.ca.ui.InPlaceEdit.prototype.setContent = function(oContent) {

	var oOldContent = this.getContent();
	if (oOldContent) {
		oOldContent.detachEvent("_change", this._handleContentInvalidate, this);
		if (oOldContent instanceof sap.m.Input) {
			oOldContent.detachEvent("change", this._handleContentChange, this);
			oOldContent.detachEvent("liveChange", this._handleContentLiveChange, this);
			oOldContent._propagateEsc = undefined;
		}
	}
	this._sOldText = undefined;
	this._sOldTextAvailable = false;
	this._oDisplayControl = undefined;
	this._oEditControl = undefined;

	this.setAggregation("content", oContent);

	if (oContent) {
		// As controls don't bubble their invalidate we have to use the _change event
		oContent.attachEvent("_change", this._handleContentInvalidate, this);
		if (oContent instanceof sap.m.Input) {
			oContent.attachEvent("change", this._handleContentChange, this);
			oContent.attachEvent("liveChange", this._handleContentLiveChange, this);
			oContent._propagateEsc = true;
		}
	}

	this._updateControls();

};

// since some Properties and the change event are not available on all controls (Link)
// have it as property on InPlaceEdit too. If Content-control has the property too just forward it to
// the content control
// ! what's about setting property before adding content? !
sap.ca.ui.InPlaceEdit.prototype.setValueState = function(oValueState) {

	var oContent = this.getContent();

	if (oContent && oContent.setValueState) {
		oContent.setValueState(oValueState);
	} else if (this._oEditControl && this._oEditControl.setValueState) {
		this._oEditControl.setValueState(oValueState);
		this._handleContentInvalidate.call(this);
	} else {
		this.setProperty("valueState", oValueState);
	}

};

sap.ca.ui.InPlaceEdit.prototype.getValueState = function() {

	var oContent = this.getContent();

	if (oContent && oContent.getValueState) {
		return oContent.getValueState();
	} else if (this._oEditControl && this._oEditControl.getValueState) {
		return this._oEditControl.getValueState();
	} else {
		return this.getProperty("valueState");
	}

};

/**
 * Sets a new tooltip for this InPlaceEdit. The tooltip can either be a simple string
 * (which in most cases will be rendered as the <code>title</code> attribute of this
 * Element) or an instance of {@link sap.ui.core.TooltipBase}.
 *
 * If a new tooltip is set, any previously set tooltip is deactivated.
 *
 * If a content control is assigned to the InPlaceEdit the tooltip of this control
 * is used. A directly set tooltip to the InPlaceEdit is ignored in this case.
 *
 * @param {string|sap.ui.core.TooltipBase} oTooltip.
 * @public
 */
sap.ca.ui.InPlaceEdit.prototype.setTooltip = function(oTooltip) {

	var oContent = this.getContent();

	if (oContent) {
		oContent.setTooltip(oTooltip);
	} else {
		if (oTooltip instanceof sap.ui.core.TooltipBase) {
			oTooltip._currentControl = this;
			this.addDelegate(oTooltip);
		}
		this.setAggregation("tooltip", oTooltip);
	}

	return this;

};

/**
 * Returns the tooltip for this InPlaceEdit if any or an undefined value.
 * The tooltip can either be a simple string or a subclass of
 * {@link sap.ui.core.TooltipBase}.
 *
 * Callers that are only interested in tooltips of type string (e.g. to render
 * them as a <code>title</code> attribute), should call the convenience method
 * {@link #getTooltip_AsString} instead. If they want to get a tooltip text no
 * matter where it comes from (be it a string tooltip or the text from a TooltipBase
 * instance) then they could call {@link #getTooltip_Text} instead.
 *
 * If a content control is assigned to the InPlaceEdit the tooltip of this control
 * is used. A directly set tooltip to the InPlaceEdit is ignored in this case.
 *
 * @return {string|sap.ui.core.TooltipBase} The tooltip for this Element.
 * @public
 */
sap.ca.ui.InPlaceEdit.prototype.getTooltip = function() {

	var oContent = this.getContent();

	if (oContent) {
		return oContent.getTooltip();
	} else {
		return this.getAggregation("tooltip");
	}

};

sap.ca.ui.InPlaceEdit.prototype.clone = function() {

	// on clone don't clone event handler
	var oContent = this.getContent();
	if (oContent) {
		oContent.detachEvent("_change", this._handleContentInvalidate, this);
		if (oContent instanceof sap.m.Input) {
			oContent.detachEvent("change", this._handleContentChange, this);
			oContent.detachEvent("liveChange", this._handleContentLiveChange, this);
		}
	}

	var oClone = sap.ui.core.Control.prototype.clone.apply(this, arguments);

	if (oContent) {
		oContent.attachEvent("_change", this._handleContentInvalidate, this);
		if (oContent instanceof sap.m.Input) {
			oContent.attachEvent("change", this._handleContentChange, this);
			oContent.attachEvent("liveChange", this._handleContentLiveChange, this);
		}
	}

	return oClone;

};

sap.ca.ui.InPlaceEdit.prototype.getFocusDomRef = function() {

	if (!this.getDomRef()) {
		// not rendered
		return;
	}

	// focus is on inner control (display or edit)
	if (this._bEditMode) {
		return this._oEditControl.getFocusDomRef();
	} else {
		return this._oDisplayControl.getFocusDomRef();
	}

};

sap.ca.ui.InPlaceEdit.prototype.getIdForLabel = function() {

	// point the label to the edit control because on tabbing in its in edit mode
	// only link must get label on it self

	if (this._oDisplayControl) {
		return this._oDisplayControl.getId();
	} else if (this._oEditControl) {
		return this._oEditControl.getId();
	} else {
		return this.getId();
	}

};

// Private variables

/**
 * Delegate object for listening to the child elements' events.
 * WARNING: this is set to the InPlaceEdit-instance. This is done by setting it as the second
 *          parameter of the addDelegate call. (See updateControls())
 * @private
 */
sap.ca.ui.InPlaceEdit.prototype._contentDelegate = {
	onAfterRendering : function() {
		this.onAfterRendering(); // WARNING: this means the InPlaceEdit instance
	}
};

// Private functions

sap.ca.ui.InPlaceEdit.prototype._updateControls = function() {

    var oInPlaceEdit = this;
	var oContent = oInPlaceEdit.getContent();
	if (!oContent) {
		return;
	}

	// do not check with instanceof because then all classes must be loaded
	switch (oContent.getMetadata().getName()) {
		case "sap.m.Input" :
		case "sap.m.Select" :
			// use TextView for display
			if (!oInPlaceEdit._oTextView) {
				oInPlaceEdit._oTextView = new sap.m.Text(oInPlaceEdit.getId() + "--TV", {
					wrapping : false
				});
				oInPlaceEdit._oTextView.setParent(oInPlaceEdit);
				// Make sure the delegate is not there twice
				oInPlaceEdit._oTextView.removeDelegate(this._contentDelegate);
				oInPlaceEdit._oTextView.addDelegate(this._contentDelegate, oInPlaceEdit);
			}
			oInPlaceEdit._oTextView.setText(oContent.getValue());
			//oInPlaceEdit._oTextView.setEnabled(oContent.getEnabled());
			//oInPlaceEdit._oTextView.setTextDirection(oContent.getTextDirection());
			oInPlaceEdit._oTextView.setVisible(oContent.getVisible());
			oInPlaceEdit._oTextView.setWidth("100%"); // width is set on the outer DIV
			//oInPlaceEdit._oTextView.setTooltip(sap.ui.core.ValueStateSupport.enrichTooltip(oInPlaceEdit, oContent.getTooltip_AsString()));

			oInPlaceEdit._oDisplayControl = oInPlaceEdit._oTextView;

			// use oContent for edit
			oInPlaceEdit._oEditControl = oContent;
			oInPlaceEdit._bUseEditButton = false;
			break;

		case "sap.m.Link" :
			// use Link for display
			oInPlaceEdit._oDisplayControl = oContent;

			// Make sure the delegate is not there twice
			oInPlaceEdit._oDisplayControl.removeDelegate(this._contentDelegate);
			oInPlaceEdit._oDisplayControl.addDelegate(this._contentDelegate, oInPlaceEdit);

			// use TextField for edit
			if (oInPlaceEdit._oTextField) {
				oInPlaceEdit._oTextField.setValue(oContent.getText());
				oInPlaceEdit._oTextField.setWidth("100%");
				oInPlaceEdit._oTextField.setTooltip(oContent.getTooltip()); // value state text is added in TextField

				oInPlaceEdit._oEditControl = oInPlaceEdit._oTextField;
			}

			// for link an edit button is needed to allow the link click
			this._createEditButton();
			oInPlaceEdit._bUseEditButton = true;
			break;

		default :
			throw new Error("Control '" + oContent.getMetadata().getName() + "' not supported for InPlaceEdit");
			break;
	}

};

sap.ca.ui.InPlaceEdit.prototype._switchToEditMode = function() {
    var oInPlaceEdit = this;

	if (!oInPlaceEdit._bEditMode && oInPlaceEdit.getEditable()) {
		// switch to edit mode
		if (!oInPlaceEdit._oEditControl && oInPlaceEdit.getContent().getMetadata().getName() == "sap.m.Link") {
			// for Link - create TextField (Only on first edit mode to do not have it if not needed)
			var sValueState = oInPlaceEdit.getValueState(); // initially get ValueState from property, after this its stored on the TextField
			oInPlaceEdit._oTextField = new sap.m.Input(oInPlaceEdit.getId() + "--input", {
				valueState : sValueState
			});
			oInPlaceEdit._oTextField.attachEvent('change', this._handleTextFieldChange, oInPlaceEdit); // attach event this way to have the right this-reference in handler
			oInPlaceEdit._oTextField.attachEvent('liveChange', this._handleContentLiveChange, oInPlaceEdit); // attach event this way to have the right this-reference in handler
			oInPlaceEdit._oTextField._propagateEsc = true;
		}

		if (!oInPlaceEdit._sOldTextAvailable && oInPlaceEdit.getUndoEnabled()) {
			// only remember original text, not by toggling between edit and display
			oInPlaceEdit._sOldText = this._getContentText();
			oInPlaceEdit._sOldTextAvailable = true;
		}
		oInPlaceEdit._bEditMode = true;
		oInPlaceEdit.rerender();
		oInPlaceEdit._oEditControl.focus();
	}

};

sap.ca.ui.InPlaceEdit.prototype._switchToDisplayMode = function() {
    var oInPlaceEdit = this;

	if (oInPlaceEdit._bEditMode && oInPlaceEdit.getEditable()) {
		// switch to edit mode
		oInPlaceEdit._bEditMode = false;
		if (oInPlaceEdit._sOldText == this._getContentText()) {
			// nothing changed
			oInPlaceEdit._sOldText = undefined;
			oInPlaceEdit._sOldTextAvailable = false;
		}
		oInPlaceEdit.rerender();
	}

};

sap.ca.ui.InPlaceEdit.prototype._getContentText = function() {
    var oInPlaceEdit = this;

	var oContent = oInPlaceEdit.getContent();
	if (!oContent) {
		return;
	}

	if (oContent.getValue) {
		return oContent.getValue();
	} else if (oContent.getText) {
		return oContent.getText();
	}

};

sap.ca.ui.InPlaceEdit.prototype._createUndoButton = function() {
    var oInPlaceEdit = this;

	if (!oInPlaceEdit._oUndoButton && oInPlaceEdit.getUndoEnabled()) {
		oInPlaceEdit._oUndoButton = new sap.m.Button(oInPlaceEdit.getId() + "--X", {
            icon: "sap-icon://undo",
            type: sap.m.ButtonType.Transparent
        }).setParent(oInPlaceEdit);
		oInPlaceEdit._oUndoButton.attachEvent('press', this._handleUndoButtonPress, this); // attach event this way to have the right this-reference in handler
	}

};

sap.ca.ui.InPlaceEdit.prototype._handleUndoButtonPress = function(oEvent) {

	this._undoTextChange();

	if (this._bEditMode) {
		this._oEditControl.focus();
		jQuery.sap.byId(this.getId()).removeClass("sapCaUiIpeUndo");
	}

};

sap.ca.ui.InPlaceEdit.prototype._undoTextChange = function() {
    var oInPlaceEdit = this;

	// change text back to old value (only if value changed -> undo button visible)
	if (oInPlaceEdit.getUndoEnabled() && oInPlaceEdit._sOldTextAvailable) {
		var oContent = oInPlaceEdit.getContent();
		if (!oContent) {
			return;
		}

		if (oContent.setValue) {
			oContent.setValue(oInPlaceEdit._sOldText);
		} else if (oContent.setText) {
			oContent.setText(oInPlaceEdit._sOldText);
		}
		if (oInPlaceEdit._bEditMode) {
			// to be sure that text is updated in edit mode (e.g. Link case) - update edit control
			oInPlaceEdit._oEditControl.setValue(oInPlaceEdit._sOldText);
		}

		if (oContent.fireChange) {
			// fire change event
			oContent.fireChange({
				newValue : oInPlaceEdit._sOldText
			});
		} else {
			// fire InPlaceEdit change event
			oInPlaceEdit.fireChange({
				newValue : oInPlaceEdit._sOldText
			});
		}

		if (!oInPlaceEdit._bEditMode) {
			oInPlaceEdit._sOldText = undefined;
			oInPlaceEdit._sOldTextAvailable = false;
		}
	}

};

sap.ca.ui.InPlaceEdit.prototype._createEditButton = function() {
    var oInPlaceEdit = this;

	if (!oInPlaceEdit._oEditButton) {
		oInPlaceEdit._oEditButton = new sap.m.Button(oInPlaceEdit.getId() + "--Edit", {
            icon:"sap-icon://edit",
            type: sap.m.ButtonType.Transparent
        }).setParent(oInPlaceEdit);
		oInPlaceEdit._oEditButton.addStyleClass("sapCaUiIpeEBtn");
		oInPlaceEdit._oEditButton.attachEvent('press', this._handleEditButtonPress, oInPlaceEdit); // attach event this way to have the right this-reference in handler
	}

};


sap.ca.ui.InPlaceEdit.prototype._handleEditButtonPress = function(oEvent) {

	this._switchToEditMode();
	jQuery.sap.byId(this.getId()).addClass("sapCaUiIpeFocus");

};

sap.ca.ui.InPlaceEdit.prototype._handleTextFieldChange = function(oEvent) {

	var oContent = this.getContent();

	if (oContent.setText) {
		var sNewValue = oEvent.getParameter("newValue");
		oContent.setText(sNewValue);
		this.fireChange({
			newValue : sNewValue
		});
	}

};

sap.ca.ui.InPlaceEdit.prototype._handleContentChange = function(oEvent) {

	if (this._sOldText != oEvent.getParameter("newValue") && this.getUndoEnabled()) {
		jQuery.sap.byId(this.getId()).addClass("sapCaUiIpeUndo");
	} else {
		jQuery.sap.byId(this.getId()).removeClass("sapCaUiIpeUndo");
	}
	this.fireChange(oEvent.getParameters());

};

sap.ca.ui.InPlaceEdit.prototype._handleContentLiveChange = function(oEvent) {

	if (this._sOldText != oEvent.getParameter("liveValue") && this.getUndoEnabled()) {
		jQuery.sap.byId(this.getId()).addClass("sapCaUiIpeUndo");
	} else {
		jQuery.sap.byId(this.getId()).removeClass("sapCaUiIpeUndo");
	}

};

sap.ca.ui.InPlaceEdit.prototype._handleContentInvalidate = function() {

	if (!this._bEditMode) {
		//in edit mode TextField change must only checked by switch do display mode
		this.invalidate();
	} else {
		//if valueState changes -> class must be adopted on outer DIV but do not rerender
		switch (this.getValueState()) {
			case (sap.ui.core.ValueState.Error) :
				if (!jQuery.sap.byId(this.getId()).hasClass('sapUiIpeErr')) {
					jQuery.sap.byId(this.getId()).addClass('sapUiIpeErr');
					jQuery.sap.byId(this.getId()).removeClass('sapUiIpeWarn');
					jQuery.sap.byId(this.getId()).removeClass('sapUiIpeSucc');
				}
				break;
			case (sap.ui.core.ValueState.Success) :
				if (!jQuery.sap.byId(this.getId()).hasClass('sapUiIpeSucc')) {
					jQuery.sap.byId(this.getId()).addClass('sapUiIpeSucc');
					jQuery.sap.byId(this.getId()).removeClass('sapUiIpeErr');
					jQuery.sap.byId(this.getId()).removeClass('sapUiIpeWarn');
				}
				break;
			case (sap.ui.core.ValueState.Warning) :
				if (!jQuery.sap.byId(this.getId()).hasClass('sapUiIpeWarn')) {
					jQuery.sap.byId(this.getId()).addClass('sapUiIpeWarn');
					jQuery.sap.byId(this.getId()).removeClass('sapUiIpeErr');
					jQuery.sap.byId(this.getId()).removeClass('sapUiIpeSucc');
				}
				break;
			default :
				jQuery.sap.byId(this.getId()).removeClass('sapUiIpeWarn');
				jQuery.sap.byId(this.getId()).removeClass('sapUiIpeErr');
				jQuery.sap.byId(this.getId()).removeClass('sapUiIpeSucc');
				break;
		}
	}

};
