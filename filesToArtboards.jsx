function cTID(s) {return app.charIDToTypeID(s);}
function sTID(s) {return app.stringIDToTypeID(s);}

function newArtboard(_name,_w,_h) {
    var desc6 = new ActionDescriptor();
        var ref1 = new ActionReference();
        ref1.putClass( sTID('artboardSection') );
    desc6.putReference( cTID('null'), ref1 );
        var desc7 = new ActionDescriptor();
        desc7.putString( cTID('Nm  '), _name );
    desc6.putObject( cTID('Usng'), sTID('artboardSection'), desc7 );
        var desc8 = new ActionDescriptor();
        desc8.putDouble( cTID('Top '), 0.000000 );
        desc8.putDouble( cTID('Left'), 0.000000 );
        desc8.putDouble( cTID('Btom'), _h );
        desc8.putDouble( cTID('Rght'), _w );
    desc6.putObject( sTID('artboardRect'), sTID('classFloatRect'), desc8 );
    executeAction( cTID('Mk  '), desc6, DialogModes.NO );
}

function selectAllLayers() {
    var desc23 = new ActionDescriptor();
        var ref5 = new ActionReference();
        ref5.putEnumerated( cTID('Lyr '), cTID('Ordn'), cTID('Trgt') );
    desc23.putReference( cTID('null'), ref5 );
    executeAction( sTID('selectAllLayers'), desc23, DialogModes.NO );
}

function main() {
    var doc = app.documents.add(400, 400, 72, "File1");
    var fileList = app.openDialog("Select your files");
    var delta = 0;
    var currentDocWidth = 0;
    if (fileList != null) {
        for (var i = 0; i < fileList.length; i++) {
            app.open(fileList[i]);
            currentDocWidth = app.activeDocument.width.value + 20;
		    selectAllLayers();
            newArtboard(app.activeDocument.name,app.activeDocument.width.value, app.activeDocument.height.value);
            app.activeDocument.activeLayer.duplicate(doc, ElementPlacement.INSIDE);
            app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            if (i > 0) {
                app.activeDocument.activeLayer.translate(delta, 0);
            }
            delta = delta + currentDocWidth;
        }
    }
    doc.crop([0,0,app.activeDocument.width,app.activeDocument.height],0,delta);
    alert('Done!');
}

main();