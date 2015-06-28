try {
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
} catch (o) {
    alert(o.line + '\n' + o);
}

if (w.show() == 1) {
    var originalRulerUnits = preferences.rulerUnits;
    preferences.rulerUnits = Units.PIXELS;

    /*alert("You picked " + selected_rbutton(radio_group) + "\nInterval: " + value.text);*/

    try {
        var myValue = Number(value.text),
            orientation = selected_rbutton(radio_group),
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

                try {
                    resultLayers.push([app.activeDocument.activeLayer.layers[ix], app.activeDocument.activeLayer.layers[ix].boundsNoEffects[0].value, app.activeDocument.activeLayer.layers[ix].boundsNoEffects[1].value]);
                } catch (j) {
                    resultLayers.push([app.activeDocument.activeLayer.layers[ix], app.activeDocument.activeLayer.layers[ix].bounds[0].value, app.activeDocument.activeLayer.layers[ix].bounds[1].value]);
                }

            }

            refHsts.putEnumerated(charIDToTypeID("HstS"), charIDToTypeID("Ordn"), charIDToTypeID("Prvs"));
            descHsts.putReference(charIDToTypeID("null"), refHsts);
            executeAction(charIDToTypeID("slct"), descHsts, DialogModes.NO);

            return resultLayers;
        }

        sLayers = getSelectedLayers();

        function sorterX(a, b) {
            if (a[1] < b[1]) return -1;
            if (a[1] > b[1]) return 1;
            return 0;
        }

        function sorterY(a, b) {
            if (a[2] < b[2]) return -1;
            if (a[2] > b[2]) return 1;
            return 0;
        }

        if (orientation == "→ Horizontal") {
            sLayers = sLayers.sort(sorterX);
            try {
                strtPoint = sLayers[0][0].boundsNoEffects[2].value;
                for (var i = 1; i < sLayers.length; i++) {
                    delta = sLayers[i][0].boundsNoEffects[0].value - strtPoint;
                    sLayers[i][0].translate(-delta + myValue, 0);
                    strtPoint = sLayers[i][0].boundsNoEffects[2].value;
                }
            } catch (j) {
                strtPoint = sLayers[0][0].bounds[2].value;
                for (var i = 1; i < sLayers.length; i++) {
                    delta = sLayers[i][0].bounds[0].value - strtPoint;
                    sLayers[i][0].translate(-delta + myValue, 0);
                    strtPoint = sLayers[i][0].bounds[2].value;

                }

            }

        } else {
            sLayers = sLayers.sort(sorterY);
            try {
                strtPoint = sLayers[0][0].boundsNoEffects[3].value;
                for (var i = 1; i < sLayers.length; i++) {
                    delta = sLayers[i][0].boundsNoEffects[1].value - strtPoint;
                    sLayers[i][0].translate(0, -delta + myValue);
                    strtPoint = sLayers[i][0].boundsNoEffects[3].value;
                }
            } catch (j) {
                strtPoint = sLayers[0][0].bounds[3].value;
                for (var i = 1; i < sLayers.length; i++) {
                    delta = sLayers[i][0].bounds[1].value - strtPoint;
                    sLayers[i][0].translate(0, -delta + myValue);
                    strtPoint = sLayers[i][0].bounds[3].value;
                }
            }

        }
        
        preferences.rulerUnits = originalRulerUnits;

    } catch (e) {
        alert(e.line + '\n' + e);
    }
}