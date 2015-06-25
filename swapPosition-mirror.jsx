// swapPosition-mirror.jsx - Adobe Photoshop Script
// Version: 0.2.1
// Author: Anton Lyubushkin (nvkz.nemo@gmail.com)
// Website: http://lyubushkin.pro/
// ============================================================================
// Installation:
// 1. Place script in:
//    PC(32):  C:\Program Files (x86)\Adobe\Adobe Photoshop CC#\Presets\Scripts\
//    PC(64):  C:\Program Files\Adobe\Adobe Photoshop CC# (64 Bit)\Presets\Scripts\
//    Mac:     <hard drive>/Applications/Adobe Photoshop CC#/Presets/Scripts/
// 2. Restart Photoshop
// 3. Choose File > Scripts > swapPosition-mirror
// ============================================================================

#target photoshop

app.bringToFront();

var doc = app.activeDocument;
var selectedLayers = getSelectedLayersIndex(doc);

if (selectedLayers.length == 2) {
    try {
        for (var i = 0; selectedLayers.length > i; i++) {

            var sLayers = new Array();
            for (var i = 0, l = selectedLayers.length; i < l; i++) {
                selectLayerByIndex(selectedLayers[i], false);
                if (app.activeDocument.activeLayer.typename == "LayerSet") {
                    executeAction(stringIDToTypeID("newPlacedLayer"), undefined, DialogModes.NO);
                    var xpos = activeDocument.activeLayer.bounds[0];
                    var ytop = activeDocument.activeLayer.bounds[1];
                    var ybot = activeDocument.activeLayer.bounds[3];
				  var xleft = activeDocument.activeLayer.bounds[0]
				  var xright = activeDocument.activeLayer.bounds[2]
                    var height = activeDocument.activeLayer.bounds[3] - activeDocument.activeLayer.bounds[1];
                    app.activeDocument.activeHistoryState = app.activeDocument.historyStates[app.activeDocument.historyStates.length - 2];
                    selectLayerByIndex(selectedLayers[i], false);
                } else {
                    var xpos = activeDocument.activeLayer.bounds[0];
                    var ytop = activeDocument.activeLayer.bounds[1];
                    var ybot = activeDocument.activeLayer.bounds[3];
                    var height = activeDocument.activeLayer.bounds[3] - activeDocument.activeLayer.bounds[1];
				  var xleft = activeDocument.activeLayer.bounds[0]
				  var xright = activeDocument.activeLayer.bounds[2]
                }

                sLayers.push([activeDocument.activeLayer, xpos, ytop, ybot, height, xleft, xright]);
            }

            var delta0_y = 0;
            var delta1_y = 0;

            function differentHeight() {
                if (sLayers[1][4] != sLayers[0][4]) {
                    return true
                } else {
                    return false
                }
            }

            function returnSmaller() {
                if (sLayers[1][4] < sLayers[0][4]) {
                    return [sLayers[1][0], sLayers[0][0]]
                } else {
                    return [sLayers[0][0], sLayers[1][0]]
                }
            }

            if (sLayers[1][2] != sLayers[0][2]) {
                if (differentHeight() == true) {
                    var smallLyr = returnSmaller();
                    if (smallLyr[0].bounds[1] < smallLyr[1].bounds[1] || smallLyr[0].bounds[3] > smallLyr[1].bounds[3]) {
                        delta0_y = (sLayers[1][3] - ((sLayers[1][3] - sLayers[1][2]))) - (sLayers[0][3] - ((sLayers[0][3] - sLayers[0][2])));
                        delta1_y = (sLayers[0][3] - ((sLayers[0][3] - sLayers[0][2]))) - (sLayers[1][3] - ((sLayers[1][3] - sLayers[1][2])));
                    } else {
                        delta0_y = 0;
                        delta1_y = 0;
                    }
                } else {
                    delta0_y = (sLayers[1][3] - ((sLayers[1][3] - sLayers[1][2]))) - (sLayers[0][3] - ((sLayers[0][3] - sLayers[0][2])));
                    delta1_y = (sLayers[0][3] - ((sLayers[0][3] - sLayers[0][2]))) - (sLayers[1][3] - ((sLayers[1][3] - sLayers[1][2])));
                }
            }
		  
		  if (sLayers[0][5] < sLayers[1][5] && sLayers[0][6] < sLayers[1][6]) {
            var delta0_x = sLayers[1][6] - sLayers[0][6];
			var delta1_x = sLayers[0][5] - sLayers[1][5];
		  } else {
			var delta0_x = sLayers[1][5] - sLayers[0][5];
			var delta1_x = sLayers[0][6] - sLayers[1][6];
		  }
            

            sLayers[0][0].translate(delta0_x, delta0_y);
            sLayers[1][0].translate(delta1_x, delta1_y);

            for (var i = 0, l = selectedLayers.length; i < l; i++) {
                selectLayerByIndex(selectedLayers[i], true);
            }

        }
    } catch (e) {
        alert("Oops! These layers cannot be repositioned");
    }
}

function getSelectedLayersIndex(doc) {
    var selectedLayers = [];
    var ref = new ActionReference();
    ref.putEnumerated(cTID('Dcmn'), cTID('Ordn'), cTID('Trgt'));
    var desc = executeActionGet(ref);
    if (desc.hasKey(sTID('targetLayers'))) {
        desc = desc.getList(sTID('targetLayers'));
        var c = desc.count;
        for (var i = 0; i < c; i++) {
            try {
                doc.backgroundLayer;
                selectedLayers.push(desc.getReference(i).getIndex());
            } catch (e) {
                selectedLayers.push(desc.getReference(i).getIndex() + 1);
            }
        }
    } else {
        var ref = new ActionReference();
        ref.putProperty(cTID('Prpr'), cTID('ItmI'));
        ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
        try {
            doc.backgroundLayer;
            selectedLayers.push(executeActionGet(ref).getInteger(cTID('ItmI')) - 1);
        } catch (e) {
            selectedLayers.push(executeActionGet(ref).getInteger(cTID('ItmI')));
        }
    }
    return selectedLayers;
}

function selectLayerByIndex(index, add) {
    var ref = new ActionReference();
    ref.putIndex(charIDToTypeID("Lyr "), index);
    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID("null"), ref);
    if (add) desc.putEnumerated(stringIDToTypeID("selectionModifier"), stringIDToTypeID("selectionModifierType"), stringIDToTypeID("addToSelection"));
    desc.putBoolean(charIDToTypeID("MkVs"), false);
    try {
        executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
    } catch (e) {}
}

function cTID(s) {return app.charIDToTypeID(s);}
function sTID(s) {return app.stringIDToTypeID(s);}