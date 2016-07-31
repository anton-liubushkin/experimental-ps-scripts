// selectAllTextLayers.jsx - Adobe Photoshop Script
// Version: 0.1.0
// Requirements: Adobe Photoshop CC or higher
// Author: Anton Lyubushkin (nvkz.nemo@gmail.com)
// Website: http://uberplugins.cc/
// ============================================================================
// Installation:
// 1. Place script in:
//    PC:  C:\<Program Files>\Adobe\Adobe Photoshop <version>\Presets\Scripts\
//    Mac: <hard drive>/Applications/Adobe Photoshop <version>/Presets/Scripts/
// 2. Restart Photoshop
// 3. Choose File > Scripts > artboardsToPSD
// ============================================================================

#target photoshop

try {
    var textLayers;
    app.bringToFront();
    selectAllLayers();
    textLayers = getSelectedTextLayersIndexs();
    selectLayersByIndex(textLayers);

    function selectAllLayers() {
        var desc1 = new ActionDescriptor();
        var ref1 = new ActionReference();
        ref1.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        desc1.putReference(charIDToTypeID('null'), ref1);
        executeAction(stringIDToTypeID('selectAllLayers'), desc1, DialogModes.NO);
    }

    function getSelectedTextLayersIndexs() {
        var lyrs = [];
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        if (executeActionGet(ref).hasKey(stringIDToTypeID("targetLayers"))) {
            var targetLayers = executeActionGet(ref).getList(stringIDToTypeID("targetLayers"));
            for (var i = 0; i < targetLayers.count; i++) {
                var ref2 = new ActionReference();
                try {
                    activeDocument.backgroundLayer;
                    ref2.putIndex(charIDToTypeID('Lyr '), targetLayers.getReference(i).getIndex());
                    if (executeActionGet(ref2).hasKey(stringIDToTypeID('textKey'))) lyrs.push(executeActionGet(ref2).getInteger(stringIDToTypeID("itemIndex")) - 1);
                } catch (o) {
                    ref2.putIndex(charIDToTypeID('Lyr '), targetLayers.getReference(i).getIndex() + 1);
                    if (executeActionGet(ref2).hasKey(stringIDToTypeID('textKey'))) lyrs.push(executeActionGet(ref2).getInteger(stringIDToTypeID("itemIndex")));
                }
            }
        } else {
            var ref2 = new ActionReference();
            ref2.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("ItmI"));
            ref2.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            if (app.activeDocument.activeLayer.kind == LayerKind.TEXT) {
                try {
                    activeDocument.backgroundLayer;
                    lyrs.push(executeActionGet(ref2).getInteger(charIDToTypeID("ItmI")) - 1);
                } catch (o) {
                    lyrs.push(executeActionGet(ref2).getInteger(charIDToTypeID("ItmI")));
                }
            }
        }
        return lyrs
    }

    function selectLayersByIndex(_arrayOfIndexes) {
        var i = 0;
        var desc1 = new ActionDescriptor();
        var ref1 = new ActionReference();
        for (i in _arrayOfIndexes) {
            ref1.putIndex(charIDToTypeID('Lyr '), _arrayOfIndexes[i]);
        }
        desc1.putReference(charIDToTypeID('null'), ref1);
        desc1.putBoolean(charIDToTypeID('MkVs'), false);
        executeAction(charIDToTypeID('slct'), desc1, DialogModes.NO);
    }

} catch (e) {
    alert(e.line + '\n' + e);
}