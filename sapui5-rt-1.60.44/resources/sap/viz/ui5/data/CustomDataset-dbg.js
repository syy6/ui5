/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */

// Provides control sap.viz.ui5.data.CustomDataset.
sap.ui.define(['sap/viz/library','./Dataset'],
    function(library, Dataset) {
    "use strict";

    /**
     * Constructor for a new ui5/data/CustomDataset.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given 
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class
     * A dataset for raw data format.
     * @extends sap.viz.ui5.data.Dataset
     *
     * @constructor
     * @public
     * @since 1.31
     * @name sap.viz.ui5.data.CustomDataset
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var CustomDataset = Dataset.extend("sap.viz.ui5.data.CustomDataset", /** @lends sap.viz.ui5.data.CustomDataset.prototype */ { metadata : {

        library : "sap.viz",
        properties : {

            /**
             * Data containing dimensions and measures. The format and structure of this data is depends on the chart.
             */
            data : {type : "object", group : "Misc"}
        }
    }});


    /**
     * @returns sap.viz.api.data.CustomDataset
     */
    CustomDataset.prototype.getRawDataset = function() {
        return this.getProperty('data');
    };

     // check if the data is ready to consume 
    CustomDataset.prototype.isReady = function(){
        return true;
    };

    return CustomDataset;
});
