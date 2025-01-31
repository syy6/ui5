/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/model/odata/type/Decimal"],function(D){"use strict";var a=D.extend("sap.ui.comp.smartfield.type.Decimal",{constructor:function(f,c){D.apply(this,arguments);this.oFieldControl=null;}});a.prototype.parseValue=function(v,s){var r=D.prototype.parseValue.apply(this,[v,s]);if(typeof this.oFieldControl==="function"){this.oFieldControl(v,s);}return r;};a.prototype.getName=function(){return"sap.ui.comp.smartfield.type.Decimal";};return a;});
