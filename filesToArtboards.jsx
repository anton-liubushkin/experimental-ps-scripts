// filesToArtboards.jsx - Adobe Photoshop Script
// Version: 0.4.0
// Requirements: Adobe Photoshop CC 2015, or higher
// Author: Anton Lyubushkin (nvkz.nemo@gmail.com)
// Website: http://lyubushkin.pro/
// ============================================================================
// Installation:
// 1. Place script in:
//    PC:  C:\Program Files\Adobe\Adobe Photoshop CC#\Presets\Scripts\
//    Mac:     <hard drive>/Applications/Adobe Photoshop CC#/Presets/Scripts/
// 2. Restart Photoshop
// 3. Choose File > Scripts > filesToArtboards
// ============================================================================

#target photoshop

app.bringToFront();

function cTID(s) {return app.charIDToTypeID(s);}
function sTID(s) {return app.stringIDToTypeID(s);}

function newArtboard(_name, _w, _h) {
    var desc6 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putClass(sTID('artboardSection'));
    desc6.putReference(cTID('null'), ref1);
    var desc7 = new ActionDescriptor();
    desc7.putString(cTID('Nm  '), _name);
    desc6.putObject(cTID('Usng'), sTID('artboardSection'), desc7);
    var desc8 = new ActionDescriptor();
    desc8.putDouble(cTID('Top '), 0.000000);
    desc8.putDouble(cTID('Left'), 0.000000);
    desc8.putDouble(cTID('Btom'), _h);
    desc8.putDouble(cTID('Rght'), _w);
    desc6.putObject(sTID('artboardRect'), sTID('classFloatRect'), desc8);
    executeAction(cTID('Mk  '), desc6, DialogModes.NO);
}

function main() {
    var fileList = app.openDialog("Select your files"),
        delta = 0,
        currentDocWidth = 0;
    if (fileList != null && fileList != "") {
        var doc = app.documents.add(400, 400, 72, "File1");
        for (var i = 0; i < fileList.length; i++) {
            app.open(fileList[i]);
            currentDocWidth = app.activeDocument.width.value + 20;
            app.runMenuItem(sTID('selectAllLayers'));
            newArtboard(app.activeDocument.name, app.activeDocument.width.value, app.activeDocument.height.value);
            app.activeDocument.activeLayer.duplicate(doc, ElementPlacement.INSIDE);
            app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            if (i > 0) {
                app.activeDocument.activeLayer.translate(delta, 0);
            }
            delta = delta + currentDocWidth;
        }
        doc.crop([0, 0, app.activeDocument.width, app.activeDocument.height], 0, delta);
        app.runMenuItem(charIDToTypeID("FtOn"));
        alert('Done!');
    }
}

main();