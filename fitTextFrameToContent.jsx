if (checkTextLayerByIndex()) {
    resizeTextAreaToFitToText(null, true, false);
} else {
    var allTextLayersIndex = collectAllTextLayersIndex();
    for (g in allTextLayersIndex) {
        resizeTextAreaToFitToText(allTextLayersIndex[g], true, false);
    }
}

function checkTextLayerByIndex(_index) {
    try {
        var ref = new ActionReference();
        if (_index) {
            ref.putIndex(charIDToTypeID('Lyr '), _index);
        } else {
            ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        }
        if (executeActionGet(ref).hasKey(stringIDToTypeID('textKey'))) {
            return true
        } else {
            return null
        }
    } catch (e) {
        return null
    }
}

function collectAllTextLayersIndex() {
    var allTextLayers = [];
    var layersCount = getLayersCount();
    var startLoop = Number(!hasBackground());
    for (var l = startLoop; l <= layersCount; l++) {
        if (checkTextLayerByIndex(l)) {
            allTextLayers.push(l);
        }
    }
    return allTextLayers
}

function resizeTextAreaToFitToText(_index, fixHeight, fixWidth) {
    try {
        var desc1 = new ActionDescriptor(), desc2 = new ActionDescriptor(), desc3 = new ActionDescriptor(), desc4 = new ActionDescriptor(), ref1 = new ActionReference(), list1 = new ActionList(), _height = null, _width = null, topDelta = 0, originalHeight = 0, originalWidth = 0, bounds;

        if (_index) {
            ref1.putIndex(charIDToTypeID('Lyr '), _index);
        } else {
            ref1.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        }
        desc1.putReference(charIDToTypeID('null'), ref1);

        originalHeight = executeActionGet(ref1).getObjectValue(charIDToTypeID('Txt ')).getList(stringIDToTypeID('textShape')).getObjectValue(0).getObjectValue(stringIDToTypeID('bounds')).getDouble(stringIDToTypeID('bottom'));
        originalWidth = executeActionGet(ref1).getObjectValue(charIDToTypeID('Txt ')).getList(stringIDToTypeID('textShape')).getObjectValue(0).getObjectValue(stringIDToTypeID('bounds')).getDouble(stringIDToTypeID('right'));

        try {
            topDelta = executeActionGet(ref1).getObjectValue(charIDToTypeID('Txt ')).getObjectValue(stringIDToTypeID('boundingBox')).getDouble(stringIDToTypeID('top'));
        } catch (o) {}

        if (topDelta < 1) topDelta = 2;

        try {
            bounds = executeActionGet(ref1).getObjectValue(stringIDToTypeID("boundsNoEffects"));
            if (fixHeight) _height = bounds.getDouble(stringIDToTypeID("height"));
            if (fixWidth) _width = bounds.getDouble(stringIDToTypeID("width"));
        } catch (o) {
            bounds = executeActionGet(ref1).getObjectValue(stringIDToTypeID("bounds"));
            if (fixHeight) _height = bounds.getDouble(stringIDToTypeID("bottom")) - bounds.getDouble(stringIDToTypeID("top"));
            if (fixWidth) _width = bounds.getDouble(stringIDToTypeID("right")) - bounds.getDouble(stringIDToTypeID("left"));
        }

        _height = _height + topDelta * 2.5 || originalHeight;

        if (_width && originalWidth - _width > 20) {
            _width += 5;
        } else {
            _width = originalWidth;
        }

        desc3.putEnumerated(stringIDToTypeID("textType"), stringIDToTypeID("textType"), stringIDToTypeID("box"));
        desc4.putDouble(charIDToTypeID('Top '), 0);
        desc4.putDouble(charIDToTypeID('Left'), 0);
        desc4.putDouble(charIDToTypeID('Btom'), _height);
        desc4.putDouble(charIDToTypeID('Rght'), _width);
        desc3.putObject(stringIDToTypeID("bounds"), charIDToTypeID('Rctn'), desc4);
        list1.putObject(stringIDToTypeID("textShape"), desc3);
        desc2.putList(stringIDToTypeID("textShape"), list1);
        desc1.putObject(charIDToTypeID('T   '), charIDToTypeID('TxLr'), desc2);
        executeAction(charIDToTypeID('setd'), desc1, DialogModes.NO);
    } catch (e) {
        //alert(e.line + '\n' + e);
    }
}

function hasBackground() {
    var res = undefined;
    try {
        var ref = new ActionReference();
        ref.putProperty(1349677170, 1315774496);
        ref.putIndex(1283027488, 0);
        executeActionGet(ref).getString(1315774496);;
        res = true;
    } catch (e) {
        res = false
    }
    return res;
}

function getLayersCount() {
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    return executeActionGet(ref).getInteger(charIDToTypeID('NmbL'));
}
