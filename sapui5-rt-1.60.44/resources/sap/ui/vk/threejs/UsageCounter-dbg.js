sap.ui.define([
	"jquery.sap.global", "./thirdparty/three"
], function(jQuery, threeJs) {

    "use strict";

    var UsageCounter = function() { };

    UsageCounter.increaseMaterialUsed = function(material) {
        if (material && material.userData && material.userData.materialUsed !== undefined) {
            material.userData.materialUsed++;
            return true;
        }
        return false;
    };

    UsageCounter.decreaseMaterialUsed = function(material) {
        if (material && material.userData && material.userData.materialUsed !== undefined) {
            material.userData.materialUsed--;
            return true;
        }
        return false;
    };

    UsageCounter.increaseGeometryUsed = function(geo) {
        if (geo && geo.userData && geo.userData.geometryUsed !== undefined) {
            geo.userData.geometryUsed++;
            return true;
        }
        return false;
    };

    UsageCounter.decreaseGeometryUsed = function(geo) {
        if (geo && geo.userData && geo.userData.geometryUsed !== undefined) {
            geo.userData.geometryUsed--;
            return true;
        }
        return false;
    };
    return UsageCounter;
});
