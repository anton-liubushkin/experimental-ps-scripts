try {
    var myValue = 0,
        delta = 0,
        strtPoint = 0,
        sLayers = new Array();

    function getSelectedLayers() {
        var descGrp = new ActionDescriptor(),
            refGrp = new ActionReference(),
            descHsts = new ActionDescriptor(),
            refHsts = new ActionReference(),
            resultLayers = new Array();

        refGrp.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        descGrp.putReference(charIDToTypeID("null"), refGrp);
        executeAction(stringIDToTypeID("groupLayersEvent"), descGrp, DialogModes.ALL);

        for (var ix = 0; ix < app.activeDocument.activeLayer.layers.length; ix++) {
            resultLayers.push([app.activeDocument.activeLayer.layers[ix], app.activeDocument.activeLayer.layers[ix].boundsNoEffects[2].value - (app.activeDocument.activeLayer.layers[ix].boundsNoEffects[2].value - app.activeDocument.activeLayer.layers[ix].boundsNoEffects[0].value)]);
        }

        refHsts.putEnumerated(charIDToTypeID("HstS"), charIDToTypeID("Ordn"), charIDToTypeID("Prvs"));
        descHsts.putReference(charIDToTypeID("null"), refHsts);
        executeAction(charIDToTypeID("slct"), descHsts, DialogModes.NO);

        return resultLayers;
    }
    
    

    sLayers = getSelectedLayers();

    function sorter(a, b) {
        if (a[1] < b[1]) return -1;
        if (a[1] > b[1]) return 1;
        return 0;
    }

    sLayers = sLayers.sort(sorter);
    
    strtPoint = sLayers[0][0].boundsNoEffects[2].value;

    for (var i = 1; i < sLayers.length; i++) {
        delta = sLayers[i][0].boundsNoEffects[0].value - strtPoint;
        sLayers[i][0].translate(-delta + myValue, 0);
        strtPoint = sLayers[i][0].boundsNoEffects[2].value;
    }
} catch (e) {
    alert(e.line + '\n' + e);
}