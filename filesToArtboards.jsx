function cTID(s) {return app.charIDToTypeID(s);}
function sTID(s) {return app.stringIDToTypeID(s);}

function createNewDoc() {
    var desc3 = new ActionDescriptor();
    var desc4 = new ActionDescriptor();
    desc4.putString(cTID('Nm  '), """File1""");
    desc4.putClass(cTID('Md  '), cTID('RGBM'));
    desc4.putUnitDouble(cTID('Wdth'), cTID('#Rlt'), 1000.000000);
    desc4.putUnitDouble(cTID('Hght'), cTID('#Rlt'), 1000.000000);
    desc4.putUnitDouble(cTID('Rslt'), cTID('#Rsl'), 72.000000);
    desc4.putDouble(sTID('pixelScaleFactor'), 1.000000);
    desc4.putEnumerated(cTID('Fl  '), cTID('Fl  '), cTID('Trns'));
    desc4.putInteger(cTID('Dpth'), 8);
    desc4.putString(sTID('profile'), """sRGB IEC61966-2.1""");
    desc3.putObject(cTID('Nw  '), cTID('Dcmn'), desc4);
    executeAction(cTID('Mk  '), desc3, DialogModes.NO);
}

function newArtboard(_w,_h) {
    var desc6 = new ActionDescriptor();
        var ref1 = new ActionReference();
        ref1.putClass( sTID('artboardSection') );
    desc6.putReference( cTID('null'), ref1 );
        var desc7 = new ActionDescriptor();
        desc7.putString( cTID('Nm  '), """Artboard 1""" );
    desc6.putObject( cTID('Usng'), sTID('artboardSection'), desc7 );
        var desc8 = new ActionDescriptor();
        desc8.putDouble( cTID('Top '), 0.000000 );
        desc8.putDouble( cTID('Left'), 0.000000 );
        desc8.putDouble( cTID('Btom'), _h );
        desc8.putDouble( cTID('Rght'), _w );
    desc6.putObject( sTID('artboardRect'), sTID('classFloatRect'), desc8 );
    executeAction( cTID('Mk  '), desc6, DialogModes.NO );
}

function duplicateArtboardToFile() {
    var desc8 = new ActionDescriptor();
    var ref2 = new ActionReference();
    ref2.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc8.putReference(cTID('null'), ref2);
    var ref3 = new ActionReference();
    ref3.putName(cTID('Dcmn'), "File1");
    desc8.putReference(cTID('T   '), ref3);
    desc8.putInteger(cTID('Vrsn'), 5);
    executeAction(cTID('Dplc'), desc8, DialogModes.NO);
}

function main() {
    createNewDoc();
    var fileList = app.openDialog("Select your files");
    var delta = 0;
    var currentDocWidth = 0;
    if (fileList != null) {
        for (var i = 0; i < fileList.length; i++) {
            app.open(fileList[i]);
            currentDocWidth = app.activeDocument.width.value + 20;
            newArtboard(app.activeDocument.width.value, app.activeDocument.height.value);
            app.activeDocument.activeLayer.name = app.activeDocument.name;
            duplicateArtboardToFile();
            app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            if (i > 0) {
                app.activeDocument.activeLayer.translate(delta, 0);
            }
            delta = delta + currentDocWidth;
        }
    }
    alert('Done!');
}

main();