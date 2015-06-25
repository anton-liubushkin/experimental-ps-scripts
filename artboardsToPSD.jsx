// artboardsToPSD.jsx - Adobe Photoshop Script
// Version: 0.6.0
// Requirements: Adobe Photoshop CC 2015, or higher
// Author: Anton Lyubushkin (nvkz.nemo@gmail.com)
// Website: http://lyubushkin.pro/
// ============================================================================
// Installation:
// 1. Place script in:
//    PC:  C:\Program Files\Adobe\Adobe Photoshop CC#\Presets\Scripts\
//    Mac:     <hard drive>/Applications/Adobe Photoshop CC#/Presets/Scripts/
// 2. Restart Photoshop
// 3. Choose File > Scripts > artboardsToPSD
// ============================================================================

#target photoshop

app.bringToFront();

var docRef = app.activeDocument,
    allArtboards,
    artboardsCount = 0,
    inputFolder = Folder.selectDialog("Select a folder to process");

if (inputFolder) {
    function getAllArtboards() {
        try {
            var ab = [];
            var theRef = new ActionReference();
            theRef.putProperty(charIDToTypeID('Prpr'), stringIDToTypeID("artboards"));
            theRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            var getDescriptor = new ActionDescriptor();
            getDescriptor.putReference(stringIDToTypeID("null"), theRef);
            var abDesc = executeAction(charIDToTypeID("getd"), getDescriptor, DialogModes.NO).getObjectValue(stringIDToTypeID("artboards"));
            var abCount = abDesc.getList(stringIDToTypeID('list')).count;
            if (abCount > 0) {
                for (var i = 0; i < abCount; ++i) {
                    var abObj = abDesc.getList(stringIDToTypeID('list')).getObjectValue(i);
                    var abTopIndex = abObj.getInteger(stringIDToTypeID("top"));
                    ab.push(abTopIndex);

                }
            }
            return [abCount, ab];
        } catch (e) {
            alert(e.line + '\n' + e.message);
        }
    }

    function selectLayerByIndex(index, add) {
        add = undefined ? add = false : add
        var ref = new ActionReference();
        ref.putIndex(charIDToTypeID("Lyr "), index + 1);
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID("null"), ref);
        if (add) desc.putEnumerated(stringIDToTypeID("selectionModifier"), stringIDToTypeID("selectionModifierType"), stringIDToTypeID("addToSelection"));
        desc.putBoolean(charIDToTypeID("MkVs"), false);
        executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
    }

    function ungroupLayers() {
        var desc1 = new ActionDescriptor();
        var ref1 = new ActionReference();
        ref1.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        desc1.putReference(charIDToTypeID('null'), ref1);
        executeAction(stringIDToTypeID('ungroupLayersEvent'), desc1, DialogModes.NO);
    }

    function crop() {
        var desc1 = new ActionDescriptor();
        desc1.putBoolean(charIDToTypeID('Dlt '), true);
        executeAction(charIDToTypeID('Crop'), desc1, DialogModes.NO);
    }

    function saveAsPSD(_name) {
        var psd_Opt = new PhotoshopSaveOptions();
        psd_Opt.layers = true; // Preserve layers.
        psd_Opt.embedColorProfile = true; // Preserve color profile.
        psd_Opt.annotations = true; // Preserve annonations.
        psd_Opt.alphaChannels = true; // Preserve alpha channels.
        psd_Opt.spotColors = true; // Preserve spot colors.
        app.activeDocument.saveAs(File(inputFolder + '/' + _name + '.psd'), psd_Opt, true);
    }

    function main(i) {
        selectLayerByIndex(allArtboards[1][i]);
        var artboardName = app.activeDocument.activeLayer.name;
        executeAction(stringIDToTypeID("newPlacedLayer"), undefined, DialogModes.NO);
        executeAction(stringIDToTypeID("placedLayerEditContents"), undefined, DialogModes.NO);
        app.activeDocument.selection.selectAll();
        ungroupLayers();
        crop();
        saveAsPSD(artboardName);
        app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    }

    allArtboards = getAllArtboards();

    artboardsCount = allArtboards[0];

    for (var i = 0; i < artboardsCount; i++) {
        docRef.suspendHistory('Save Artboard as PSD', 'main(' + i + ')');
        app.refresh();
        app.activeDocument.activeHistoryState = app.activeDocument.historyStates[app.activeDocument.historyStates.length - 2];
    }
}