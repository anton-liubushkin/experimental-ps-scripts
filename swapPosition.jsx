#target photoshop

//
// swapPosition.jsx
// Written by Anton Lyubushkin
// version 0.1
//

var doc = app.activeDocument;
var selectedLayers = getSelectedLayersIndex(doc);

if (selectedLayers.length == 2) {
    try {
        for (var i = 0; selectedLayers.length > i; i++) {
		  
            var sLayers = new Array();
            for (var i = 0, l = selectedLayers.length; i < l; i++) {
                selectLayerByIndex(selectedLayers[i], false);
                sLayers.push(activeDocument.activeLayer);
            }
		  
		  var delta0_x = (sLayers[1].bounds[2]-((sLayers[1].bounds[2]-sLayers[1].bounds[0])/2)) - (sLayers[0].bounds[2]-((sLayers[0].bounds[2]-sLayers[0].bounds[0])/2));
		  var delta1_x = (sLayers[0].bounds[2]-((sLayers[0].bounds[2]-sLayers[0].bounds[0])/2)) - (sLayers[1].bounds[2]-((sLayers[1].bounds[2]-sLayers[1].bounds[0])/2));
		  
		  var delta0_y = 0;
		  var delta1_y = 0;
		  
		  function differentHeight() {
			if (sLayers[1].bounds[3] - sLayers[1].bounds[1] != sLayers[0].bounds[3] - sLayers[0].bounds[1]) {
			  return true
			} else {
			  return false
			}
		  }
		  
		  function returnSmaller() {
			if( sLayers[1].bounds[3] - sLayers[1].bounds[1] < sLayers[0].bounds[3] - sLayers[0].bounds[1] ) {
			  return [sLayers[1], sLayers[0]]
			} else {
			  return [sLayers[0], sLayers[1]]
			}
		  }
		  
		  if (sLayers[1].bounds[1] != sLayers[0].bounds[1]) {
			if (differentHeight() == true ) {
			  var smallLyr = returnSmaller();
			  if (smallLyr[0].bounds[1] < smallLyr[1].bounds[1] || smallLyr[0].bounds[3] > smallLyr[1].bounds[3]) {
				delta0_y = (sLayers[1].bounds[3]-((sLayers[1].bounds[3]-sLayers[1].bounds[1]))) - (sLayers[0].bounds[3]-((sLayers[0].bounds[3]-sLayers[0].bounds[1])));
				delta1_y = (sLayers[0].bounds[3]-((sLayers[0].bounds[3]-sLayers[0].bounds[1]))) - (sLayers[1].bounds[3]-((sLayers[1].bounds[3]-sLayers[1].bounds[1])));
			  }
			} else {
			  delta0_y = (sLayers[1].bounds[3]-((sLayers[1].bounds[3]-sLayers[1].bounds[1]))) - (sLayers[0].bounds[3]-((sLayers[0].bounds[3]-sLayers[0].bounds[1])));
			  delta1_y = (sLayers[0].bounds[3]-((sLayers[0].bounds[3]-sLayers[0].bounds[1]))) - (sLayers[1].bounds[3]-((sLayers[1].bounds[3]-sLayers[1].bounds[1])));
			}
		  }

		  sLayers[0].translate(delta0_x, delta0_y);
		  sLayers[1].translate(delta1_x, delta1_y);
		  
		  for (var i = 0, l = selectedLayers.length; i < l; i++) {
              selectLayerByIndex(selectedLayers[i], true);
          }
		  
        }
    } catch (e) {
        alert(e.line + '\n' + e.message);
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

function cTID(s) {
    return app.charIDToTypeID(s);
}

function sTID(s) {
    return app.stringIDToTypeID(s);
}