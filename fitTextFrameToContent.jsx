// fitTextFrameToContent.jsx - Adobe Photoshop Script
// Version: 0.6.0
// Requirements: Adobe Photoshop CC or higher
// Author: Anton Lyubushkin (nvkz.nemo@gmail.com)
// Website: http://uberplugins.cc/
// ============================================================================
// Installation:
// 1. Place script in:
//    PC:  C:\<Program Files>\Adobe\Adobe Photoshop <version>\Presets\Scripts\
//    Mac: <hard drive>/Applications/Adobe Photoshop <version>/Presets/Scripts/
// 2. Restart Photoshop
// 3. Choose File > Scripts > fitTextFrameToContent
// ============================================================================

#target photoshop

try {
    app.bringToFront();
    var originalRulerUnits = preferences.rulerUnits;
    var docInfo = getDocumentInfo();
    preferences.rulerUnits = Units.PIXELS;

    selectAllLayers();

    var textLayers = getSelectedTextLayersIndexs();

    if (textLayers.length > 0) {
        for (var i in textLayers) {
            fixTextShapeHeight(textLayers[i], docInfo);
        }
        alert("Done!");
    } else {
        alert("Can't find a TEXT layers in the document");
    }

    preferences.rulerUnits = originalRulerUnits;

    function fixTextShapeHeight(_idx, docInfo) {
        try {
            var desc1 = new ActionDescriptor();
            var ref1 = new ActionReference();
            ref1.putIndex(charIDToTypeID('Lyr '), _idx);
            desc1.putReference(charIDToTypeID('null'), ref1);

            var originalShapeBoxBounds = executeActionGet(ref1).getObjectValue(charIDToTypeID('Txt ')).getList(stringIDToTypeID('textShape'));
            var originalTop = originalShapeBoxBounds.getObjectValue(0).getObjectValue(stringIDToTypeID('bounds')).getDouble(charIDToTypeID('Top '));
            var originalLeft = originalShapeBoxBounds.getObjectValue(0).getObjectValue(stringIDToTypeID('bounds')).getDouble(charIDToTypeID('Left'));
            var originalBottom = originalShapeBoxBounds.getObjectValue(0).getObjectValue(stringIDToTypeID('bounds')).getDouble(charIDToTypeID('Btom'));
            var originalRight = originalShapeBoxBounds.getObjectValue(0).getObjectValue(stringIDToTypeID('bounds')).getDouble(charIDToTypeID('Rght'));

            var desc2 = new ActionDescriptor();
            var list1 = new ActionList();
            var desc6 = new ActionDescriptor();
            desc6.putEnumerated(stringIDToTypeID("textType"), stringIDToTypeID("textType"), stringIDToTypeID("box"));
            desc6.putEnumerated(charIDToTypeID('Ornt'), charIDToTypeID('Ornt'), charIDToTypeID('Hrzn'));
            var desc7 = new ActionDescriptor();
            var desc8 = new ActionDescriptor();
            desc8.putDouble(charIDToTypeID('Top '), originalTop);
            desc8.putDouble(charIDToTypeID('Left'), originalLeft);
            desc8.putDouble(charIDToTypeID('Btom'), docInfo.height);
            desc8.putDouble(charIDToTypeID('Rght'), originalRight);
            desc6.putObject(stringIDToTypeID("bounds"), charIDToTypeID('Rctn'), desc8);
            list1.putObject(stringIDToTypeID("textShape"), desc6);
            desc2.putList(stringIDToTypeID("textShape"), list1);
            desc1.putObject(charIDToTypeID('T   '), charIDToTypeID('TxLr'), desc2);
            executeAction(charIDToTypeID('setd'), desc1, DialogModes.NO);

            try {
                var textBounds = executeActionGet(ref1).getObjectValue(stringIDToTypeID("boundsNoEffects"));
                var textHeight = textBounds.getDouble(stringIDToTypeID("height"));
            } catch (o) {
                var textBounds = executeActionGet(ref1).getObjectValue(stringIDToTypeID("bounds"));
                var textHeight = textBounds.getDouble(stringIDToTypeID("bottom")) - textBounds.getDouble(stringIDToTypeID("top"));
            }

            var desc2 = new ActionDescriptor();
            var list1 = new ActionList();
            var desc6 = new ActionDescriptor();
            desc6.putEnumerated(stringIDToTypeID("textType"), stringIDToTypeID("textType"), stringIDToTypeID("box"));
            desc6.putEnumerated(charIDToTypeID('Ornt'), charIDToTypeID('Ornt'), charIDToTypeID('Hrzn'));
            var desc7 = new ActionDescriptor();
            var desc8 = new ActionDescriptor();
            desc8.putDouble(charIDToTypeID('Top '), originalTop);
            desc8.putDouble(charIDToTypeID('Left'), originalLeft);
            desc8.putDouble(charIDToTypeID('Btom'), textHeight + 20);
            desc8.putDouble(charIDToTypeID('Rght'), originalRight);
            desc6.putObject(stringIDToTypeID("bounds"), charIDToTypeID('Rctn'), desc8);
            list1.putObject(stringIDToTypeID("textShape"), desc6);
            desc2.putList(stringIDToTypeID("textShape"), list1);
            desc1.putObject(charIDToTypeID('T   '), charIDToTypeID('TxLr'), desc2);
            executeAction(charIDToTypeID('setd'), desc1, DialogModes.NO);
        } catch (e) {}
    }

    function getDocumentInfo() {
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        var AMinfo = executeActionGet(ref);
        var doc = {};
        doc.name = AMinfo.getString(charIDToTypeID('Ttl '));
        doc.layers = AMinfo.getInteger(charIDToTypeID('NmbL'));
        doc.width = AMinfo.getDouble(charIDToTypeID('Wdth'));
        doc.height = AMinfo.getDouble(charIDToTypeID('Hght'));
        doc.resolution = AMinfo.getDouble(charIDToTypeID('Rslt'));
        doc.hasBackground = AMinfo.getBoolean(stringIDToTypeID('hasBackgroundLayer'));
        return doc
    }

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

} catch (e) {
    alert(e.line + '\n' + e);
}
