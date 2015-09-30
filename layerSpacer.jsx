// layerSpacer.jsx - Adobe Photoshop Script
// Version: 0.8.1
// Author: Anton Lyubushkin (nvkz.nemo@gmail.com)
// Website: http://uberplugins.cc/
// ============================================================================
// Installation:
// 1. Place script in:
//    PC:  C:\Program Files (x86)\Adobe\Adobe Photoshop CC#\Presets\Scripts\
//    Mac: <hard drive>/Applications/Adobe Photoshop CC#/Presets/Scripts/
// 2. Restart Photoshop
// 3. Choose File > Scripts > layerSpacer
// ============================================================================

#target photoshop

app.bringToFront();

try {
    var w,
        input_txt,
        UI_res;

    UI_res =
        "dialog{ text: 'Set interval', preferredSize:[-1, -1], orientation: 'row',\
            inputs: Group {orientation: 'row', alignChildren:'left',\
                input_txt: EditText {text:'auto', characters: 5, active: true},\
            }\
            buttons: Group{ orientation: 'row', \
                horizontal_btn: Button {text:'→ Horizontal'},\
                vertical_btn: Button {text:'↓ Vertical'},\
            }\
        }";

    w = new Window(UI_res);
    input_txt = w.inputs.input_txt;

    w.buttons.horizontal_btn.onClick = function () {
        w.close();
        go("→ Horizontal");
    }

    w.buttons.vertical_btn.onClick = function () {
        w.close();
        go("↓ Vertical");
    }

    w.show();
    
} catch (e) {
    //alert(e.line + '\n' + e);
}

function go(_orientation) {
    var originalRulerUnits = preferences.rulerUnits,
        delta = Number(input_txt.text),
        orientation = _orientation,
        strtPoint = 0,
        lyrs = getSelectedLayersInfo(),
        hasLayerSets = false;

    try {
        // layerSet fix
        var p = 0;
        for (g in lyrs) {
            if (lyrs[g].layerKind == "layerSectionStart") {
                hasLayerSets = true;
                selectLayerById(lyrs[g].id, false);
                executeAction(stringIDToTypeID('mergeLayersNew'), undefined, DialogModes.NO);
                var folderInfo = getLayerInfo();
                lyrs[g].top = folderInfo[0].top;
                lyrs[g].bottom = folderInfo[0].bottom;
                lyrs[g].left = folderInfo[0].left;
                lyrs[g].right = folderInfo[0].right;
                lyrs[g].width = folderInfo[0].width;
                lyrs[g].height = folderInfo[0].height;
                p--;
            }
        }
        if (hasLayerSets) selectHistoryState(p);
    } catch (e) {
        //alert(e.line + '\n' + e);
    }

    try {
        // remove grouped layers
        if (hasLayerSets) {
            var new_array = [];
            for (var i = 0; i < lyrs.length; i++) {
                var del = false;
                for (var j = 0; j < lyrs.length; j++) {
                    if (lyrs[i].parentIndex == lyrs[j].index && lyrs[i].index != lyrs[j].index) {
                        del = true;
                        break;
                    }
                }
                if (!del) {
                    new_array.push(lyrs[i]);
                }
            }
        } else {
            var new_array = [];
            new_array = lyrs;
        }
    } catch (e) {
        //alert(e.line + '\n' + e);
    }

    if (new_array.length > 1) {
        try {
            if (isNaN(delta)) {
                app.activeDocument.suspendHistory("Set auto space between " + new_array.length + " layers", "main()");
            } else {
                app.activeDocument.suspendHistory("Set " + delta + "px space between " + new_array.length + " layers", "main()");
            }

            function main() {
                preferences.rulerUnits = Units.PIXELS;

                var fix = 0;

                if (orientation == "→ Horizontal") {
                    new_array = new_array.sort(sorterX);
                    if (isNaN(delta)) {
                        fix = 1;
                        var layersWidth = 0;
                        var whiteSpace = new_array[new_array.length - 1].left - new_array[0].right;
                        for (var i = 1; i < new_array.length - 1; i++) {
                            layersWidth = layersWidth + new_array[i].width;
                        }
                        delta = (whiteSpace - layersWidth) / (new_array.length - 1);
                    }
                    for (var i = 1; i < new_array.length - fix; i++) {
                        strtPoint = new_array[i - 1].right - new_array[i].left + strtPoint + delta;
                        translateLayerById(new_array[i].id, strtPoint, 0);
                    }
                } else {
                    new_array = new_array.sort(sorterY);
                    if (isNaN(delta)) {
                        fix = 1;
                        var layersHeight = 0;
                        var whiteSpace = new_array[new_array.length - 1].top - new_array[0].bottom;
                        for (var i = 1; i < new_array.length - 1; i++) {
                            layersHeight = layersHeight + new_array[i].height;
                        }
                        delta = (whiteSpace - layersHeight) / (new_array.length - 1);
                    }
                    for (var i = 1; i < new_array.length - fix; i++) {
                        strtPoint = new_array[i - 1].bottom - new_array[i].top + strtPoint + delta;
                        translateLayerById(new_array[i].id, 0, strtPoint);
                    }
                }
            }
        } catch (e) {
            //alert(e.line + '\n' + e);
        }

        selectLayers(new_array, true);
        preferences.rulerUnits = originalRulerUnits;

    } else {
        alert("Select more then 1 layer");
    }

    function getSelectedLayersInfo() {
        try {
            var lyrs = [];
            var ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            var targetLayers = executeActionGet(ref).getList(stringIDToTypeID("targetLayers"));
            for (var i = 0; i < targetLayers.count; i++) {
                var lyr = new Object();
                var ref2 = new ActionReference();
                try {
                    activeDocument.backgroundLayer;
                    ref2.putIndex(charIDToTypeID('Lyr '), targetLayers.getReference(i).getIndex());
                    lyr.index = executeActionGet(ref2).getInteger(stringIDToTypeID("itemIndex")) - 1;
                } catch (o) {
                    ref2.putIndex(charIDToTypeID('Lyr '), targetLayers.getReference(i).getIndex() + 1);
                    lyr.index = executeActionGet(ref2).getInteger(stringIDToTypeID("itemIndex"));
                }
                try {
                    var bounds = executeActionGet(ref2).getObjectValue(stringIDToTypeID("boundsNoEffects"));
                } catch (o) {
                    var bounds = executeActionGet(ref2).getObjectValue(stringIDToTypeID("bounds"));
                }
                lyr.layerKind = typeIDToStringID(executeActionGet(ref2).getEnumerationValue(stringIDToTypeID('layerSection')));
                lyr.id = executeActionGet(ref2).getInteger(stringIDToTypeID("layerID"));
                lyr.top = bounds.getDouble(stringIDToTypeID("top"));
                lyr.right = bounds.getDouble(stringIDToTypeID("right"));
                lyr.bottom = bounds.getDouble(stringIDToTypeID("bottom"));
                lyr.left = bounds.getDouble(stringIDToTypeID("left"));
                try {
                    lyr.width = bounds.getDouble(stringIDToTypeID("width"));
                    lyr.height = bounds.getDouble(stringIDToTypeID("height"));
                } catch (e) {
                    lyr.width = bounds.getDouble(stringIDToTypeID("right")) - bounds.getDouble(stringIDToTypeID("left"));
                    lyr.height = bounds.getDouble(stringIDToTypeID("bottom")) - bounds.getDouble(stringIDToTypeID("top"));
                }
                lyr.parentIndex = getLayerParentAMIndexByAMIndex(lyr.index);
                lyrs.push(lyr);
            }
            return lyrs
        } catch (e) {
            //alert(e.line + '\n' + e);
        }
    }

    function getLayerInfo() {
        try {
            var lyrs = [];
            var ref2 = new ActionReference();
            ref2.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            var lyr = new Object();
            try {
                activeDocument.backgroundLayer;
                lyr.index = executeActionGet(ref2).getInteger(stringIDToTypeID("itemIndex")) - 1;
            } catch (o) {
                lyr.index = executeActionGet(ref2).getInteger(stringIDToTypeID("itemIndex"));
            }
            lyr.name = executeActionGet(ref2).getString(stringIDToTypeID("name"));
            lyr.hasUserMask = executeActionGet(ref2).getBoolean(stringIDToTypeID("hasUserMask"));
            lyr.hasVectorMask = executeActionGet(ref2).getBoolean(stringIDToTypeID("hasVectorMask"));
            lyr.layerKind = "layerSectionStart";
            lyr.id = executeActionGet(ref2).getInteger(stringIDToTypeID("layerID"));
            try {
                var bounds = executeActionGet(ref2).getObjectValue(stringIDToTypeID("boundsNoEffects"));
            } catch (o) {
                var bounds = executeActionGet(ref2).getObjectValue(stringIDToTypeID("bounds"));
            }
            lyr.top = bounds.getDouble(stringIDToTypeID("top"));
            lyr.right = bounds.getDouble(stringIDToTypeID("right"));
            lyr.bottom = bounds.getDouble(stringIDToTypeID("bottom"));
            lyr.left = bounds.getDouble(stringIDToTypeID("left"));
            try {
                lyr.width = bounds.getDouble(stringIDToTypeID("width"));
                lyr.height = bounds.getDouble(stringIDToTypeID("height"));
            } catch (e) {
                lyr.width = bounds.getDouble(stringIDToTypeID("right")) - bounds.getDouble(stringIDToTypeID("left"));
                lyr.height = bounds.getDouble(stringIDToTypeID("bottom")) - bounds.getDouble(stringIDToTypeID("top"));
            }
            lyrs.push(lyr);
            return lyrs
        } catch (e) {
            //alert(e.line + '\n' + e);
        }
    }

    function translateLayerById(_id, _x, _y) {
        try {
            var desc1 = new ActionDescriptor();
            var ref1 = new ActionReference();
            ref1.putIdentifier(charIDToTypeID("Lyr "), _id);
            desc1.putReference(charIDToTypeID('null'), ref1);
            desc1.putBoolean(charIDToTypeID("MkVs"), false);
            var desc2 = new ActionDescriptor();
            desc2.putUnitDouble(charIDToTypeID('Hrzn'), charIDToTypeID('#Pxl'), _x);
            desc2.putUnitDouble(charIDToTypeID('Vrtc'), charIDToTypeID('#Pxl'), _y);
            desc1.putObject(charIDToTypeID('T   '), charIDToTypeID('Ofst'), desc2);
            executeAction(charIDToTypeID('slct'), desc1, DialogModes.NO);
            executeAction(charIDToTypeID('move'), desc1, DialogModes.NO);
        } catch (e) {
            //alert(e.line + '\n' + e);
        }
    }

    function selectLayerById(_id, add) {
        try {
            var ref = new ActionReference();
            ref.putIdentifier(charIDToTypeID("Lyr "), _id);
            var desc = new ActionDescriptor();
            desc.putReference(charIDToTypeID("null"), ref);
            if (add) desc.putEnumerated(stringIDToTypeID("selectionModifier"), stringIDToTypeID("selectionModifierType"), stringIDToTypeID("addToSelection"));
            desc.putBoolean(charIDToTypeID("MkVs"), false);
            executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
        } catch (e) {
            //alert(e.line + '\n' + e);
        }

    }

    function selectLayers(lyrs, add) {
        try {
            for (g in lyrs) {
                var ref = new ActionReference();
                ref.putIdentifier(charIDToTypeID("Lyr "), lyrs[g].id);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID("null"), ref);
                if (add) desc.putEnumerated(stringIDToTypeID("selectionModifier"), stringIDToTypeID("selectionModifierType"), stringIDToTypeID("addToSelection"));
                desc.putBoolean(charIDToTypeID("MkVs"), false);
                executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
            }
        } catch (e) {
            //alert(e.line + '\n' + e);
        }
    }

    function sorterX(a, b) {
        if (a.left < b.left) return -1;
        if (a.left > b.left) return 1;
        return 0;
    }

    function sorterY(a, b) {
        if (a.top < b.top) return -1;
        if (a.top > b.top) return 1;
        return 0;
    }

    function selectHistoryState(_h) {
        try {
            var desc1 = new ActionDescriptor();
            var ref1 = new ActionReference();
            ref1.putOffset(charIDToTypeID('HstS'), _h);
            desc1.putReference(charIDToTypeID('null'), ref1);
            executeAction(charIDToTypeID('slct'), desc1, DialogModes.NO);
        } catch (e) {
            //alert(e.line + '\n' + e);
        }
    }

    function getLayerParentAMIndexByAMIndex(idx) {
        try {
            var nestedSets = 0;
            var layerCount = getNumberOfLayer();
            for (var l = idx; l <= layerCount; l++) {
                var layerSection = getLayerSectionByAMIndex(l);
                if (layerSection == 'layerSectionEnd') nestedSets++;
                if (layerSection == 'layerSectionStart' && nestedSets <= 0) return l;
                if (layerSection == 'layerSectionStart' && nestedSets > 0) nestedSets--;
            }

            function getLayerSectionByAMIndex(idx) {
                var ref = new ActionReference();
                ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID('layerSection'));
                ref.putIndex(charIDToTypeID("Lyr "), idx);
                return typeIDToStringID(executeActionGet(ref).getEnumerationValue(stringIDToTypeID('layerSection')));
            }

            function getNumberOfLayer() {
                var ref = new ActionReference();
                ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
                var desc = executeActionGet(ref);
                var numberOfLayer = desc.getInteger(charIDToTypeID("NmbL"));
                return numberOfLayer;
            }
        } catch (e) {
            //alert(e.line + '\n' + e);
        }
    }

}
