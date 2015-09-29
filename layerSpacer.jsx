// layerSpacer.jsx - Adobe Photoshop Script
// Version: 0.4.0
// Author: Anton Lyubushkin (nvkz.nemo@gmail.com)
// Website: http://uberplugins.cc/
// ============================================================================
// Installation:
// 1. Place script in:
//    PC:  C:\Program Files (x86)\Adobe\Adobe Photoshop CC#\Presets\Scripts\
//    Mac:     <hard drive>/Applications/Adobe Photoshop CC#/Presets/Scripts/
// 2. Restart Photoshop
// 3. Choose File > Scripts > layerSpacer
// ============================================================================

#target photoshop

app.bringToFront();

var w = new Window("dialog");
w.orientation = "column";
w.alignChildren = ["center", "center"];

var radio_group = w.add("group");
radio_group.orientation = "row";
radio_group.alignChildren = "left";
radio_group.add("radiobutton", undefined, "→ Horizontal");
radio_group.add("radiobutton", undefined, "↓ Vertical");
radio_group.children[0].value = true;

var g1 = w.add("panel");
g1.alignChildren = ["center", "center"];
g1.size = [220, 60];
g1.orientation = "row";
g1.add("statictext", undefined, "Set interval");
var value = g1.add('edittext {text: 0, characters: 3, justify: "center", active: true}');
value.size = [40, 25];
g1.add("statictext", undefined, "px");

var submit = w.add("button", undefined, "OK");
submit.size = [220, 40];

function selected_rbutton(rbuttons) {
    for (var i = 0; i < rbuttons.children.length; i++)
        if (rbuttons.children[i].value == true)
            return rbuttons.children[i].text;
}


if (w.show() == 1) {

    var originalRulerUnits = preferences.rulerUnits,
        delta = Number(value.text),
        orientation = selected_rbutton(radio_group),
        strtPoint = 0,
        lyrs = getSelectedLayersInfo();

    try {
        // layerSet fix
        var p = 0;
        for (g in lyrs) {
            if (lyrs[g].layerKind == 7) {
                selectLayerById(lyrs[g].id, false);
                executeAction(stringIDToTypeID("newPlacedLayer"), undefined, DialogModes.NO);
                var folderInfo = getSelectedLayersInfo();
                lyrs[g].top = folderInfo[0].top;
                lyrs[g].bottom = folderInfo[0].bottom;
                lyrs[g].left = folderInfo[0].left;
                lyrs[g].right = folderInfo[0].right;
                p = p + 1;
            }
        }
        app.activeDocument.activeHistoryState = app.activeDocument.historyStates[app.activeDocument.historyStates.length - (2 + p - 1)];
    } catch (e) {}

    if (lyrs.length > 1) {
        try {
            app.activeDocument.suspendHistory("Set " + delta + "px space between " + lyrs.length + " layers", "main()");

            function main() {
                preferences.rulerUnits = Units.PIXELS;

                if (orientation == "→ Horizontal") {
                    lyrs = lyrs.sort(sorterX);
                    for (var i = 1; i < lyrs.length; i++) {
                        strtPoint = lyrs[i - 1].right - lyrs[i].left + strtPoint + delta;
                        translateLayerById(lyrs[i].id, strtPoint, 0);
                    }
                } else {
                    lyrs = lyrs.sort(sorterY);
                    for (var i = 1; i < lyrs.length; i++) {
                        strtPoint = lyrs[i - 1].bottom - lyrs[i].top + strtPoint + delta;
                        translateLayerById(lyrs[i].id, 0, strtPoint);
                    }
                }
            }
        } catch (o) {}

        selectLayers(lyrs, true);
        preferences.rulerUnits = originalRulerUnits;

    } else {
        alert("Select more then 1 layer");
    }

    function getSelectedLayersInfo() {
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
            lyr.layerKind = executeActionGet(ref2).getInteger(stringIDToTypeID("layerKind"));
            lyr.id = executeActionGet(ref2).getInteger(stringIDToTypeID("layerID"));
            lyr.top = bounds.getDouble(stringIDToTypeID("top"));
            lyr.right = bounds.getDouble(stringIDToTypeID("right"));
            lyr.bottom = bounds.getDouble(stringIDToTypeID("bottom"));
            lyr.left = bounds.getDouble(stringIDToTypeID("left"));
            lyrs.push(lyr);
        }
        return lyrs
    }

    function translateLayerById(_id, _x, _y) {
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
    }

    function selectLayerById(_id, add) {
        var ref = new ActionReference();
        ref.putIdentifier(charIDToTypeID("Lyr "), _id);
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID("null"), ref);
        if (add) desc.putEnumerated(stringIDToTypeID("selectionModifier"), stringIDToTypeID("selectionModifierType"), stringIDToTypeID("addToSelection"));
        desc.putBoolean(charIDToTypeID("MkVs"), false);
        try {
            executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
        } catch (e) {}

    }

    function selectLayers(lyrs, add) {
        for (g in lyrs) {
            var ref = new ActionReference();
            ref.putIdentifier(charIDToTypeID("Lyr "), lyrs[g].id);
            var desc = new ActionDescriptor();
            desc.putReference(charIDToTypeID("null"), ref);
            if (add) desc.putEnumerated(stringIDToTypeID("selectionModifier"), stringIDToTypeID("selectionModifierType"), stringIDToTypeID("addToSelection"));
            desc.putBoolean(charIDToTypeID("MkVs"), false);
            try {
                executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
            } catch (e) {}
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

}
