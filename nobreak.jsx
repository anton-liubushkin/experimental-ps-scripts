var doc = app.activeDocument,
    alyr = doc.activeLayer,
    str = alyr.textItem.contents,
    expr = new RegExp('\\ и т. | из-| кто-| где-| в т. | ну | я | а | в | во | до | з | за | и | из | ни | не | и на | и из | к | ко | на | не | о | об | от | по | под | с | со | — | – ', 'ig'),
    myArray = [];

function cTID(s) { return app.charIDToTypeID(s); };
function sTID(s) { return app.stringIDToTypeID(s); };

function getFontInfo() {
    var ref = new ActionReference();
    ref.putEnumerated(sTID('layer'), cTID('Ordn'), cTID('Trgt'));
    var desc = executeActionGet(ref),
        list = desc.getObjectValue(cTID('Txt ')),
        tsr = list.getList(cTID('Txtt')),
        info = new Array;
    for (var i = 0; i < tsr.count; i++) {
        var tsr0 = tsr.getObjectValue(i),
            from = tsr0.getInteger(cTID('From')),
            to = tsr0.getInteger(cTID('T   ')),
            range = [from, to],
            textStyle = tsr0.getObjectValue(cTID('TxtS')),
            font = textStyle.getString(cTID('FntN')),
            style = textStyle.getString(cTID('FntS')),
            size = textStyle.getDouble(cTID('Sz  ')),
            color = textStyle.getObjectValue(cTID('Clr ')),
            textColor = new SolidColor;
        try{
            var underline = typeIDToStringID(textStyle.getEnumerationValue(cTID('Undl')));
        }catch(e){
            var underline = 'underlineOff';
        }
        
        textColor.rgb.red = color.getDouble(cTID('Rd  '));
        textColor.rgb.green = color.getDouble(cTID('Grn '));
        textColor.rgb.blue = color.getDouble(cTID('Bl  '));
        info.push([range, font, size, style, textColor.rgb.red, textColor.rgb.green, textColor.rgb.blue, underline]);
    }
    return info;
}

var info = getFontInfo();

function getTextInfo(endIndex) {
    for (var i = 0; i < info.length; i++) {
        var aInfo = info[i],
            range = aInfo[0],
            rangeStart = range[0],
            rangeEnd = range[1];
        if (endIndex >= rangeStart && endIndex <= rangeEnd) {
            return aInfo;
        }
    }
    return null;
}

function noBreak() {
    try {
        if ((alyr.kind == LayerKind.TEXT) && (alyr.textItem.contents != "")) {
            var action = new ActionDescriptor(),
                reference = new ActionReference(),
                textAction = new ActionDescriptor(),
                actionList = new ActionList(),
                textRange = new ActionDescriptor(),
                formatting = new ActionDescriptor(),
                setClr = new ActionDescriptor(),
				textRange2 = new ActionDescriptor(),
                formatting2 = new ActionDescriptor(),
                setClr2 = new ActionDescriptor();

            reference.putEnumerated(cTID('TxLr'), cTID('Ordn'), cTID('Trgt'));
            action.putReference(cTID('null'), reference);

            while ((myArray = expr.exec(str)) != null) {
                if ((((expr.lastIndex - myArray[0].length) + 1) >= 0) && ((expr.lastIndex + 1) <= alyr.textItem.contents.length)) {
                    //var msg = "Нашел «" + myArray[0] + "...»";
                    //alert(msg);
                    var textInfo = getTextInfo((expr.lastIndex - myArray[0].length) + 1);

                    textRange.putInteger(cTID('From'), (expr.lastIndex - myArray[0].length) + 1);
                    textRange.putInteger(cTID('T   '), expr.lastIndex );

                    if (textInfo) {
                        var textFont = textInfo[1],
                            textStyle = textInfo[3],
                            textSize = textInfo[2],
                            textColorR = textInfo[4],
                            textColorG = textInfo[5],
                            textColorB = textInfo[6],
                            textUnderline = textInfo[7];

                        formatting.putString(cTID('FntN'), textFont);
                        formatting.putString(cTID('FntS'), textStyle);
                        formatting.putUnitDouble(cTID('Sz  '), cTID('#Pnt'), textSize);
                        setClr.putDouble(cTID('Rd  '), textColorR);
                        setClr.putDouble(cTID('Grn '), textColorG);
                        setClr.putDouble(cTID('Bl  '), textColorB);
                        formatting.putObject(cTID('Clr '), cTID('RGBC'), setClr);
                        formatting.putEnumerated(cTID('Undl'), cTID('Undl'), sTID(textUnderline));
                        formatting.putBoolean(sTID('noBreak'), true);
                    }
				  
                    textInfo = getTextInfo(expr.lastIndex + 1);

                    textRange2.putInteger(cTID('From'), expr.lastIndex);
                    textRange2.putInteger(cTID('T   '), expr.lastIndex + 1);

                    if (textInfo) {
                        var textFont = textInfo[1],
                            textStyle = textInfo[3],
                            textSize = textInfo[2],
                            textColorR = textInfo[4],
                            textColorG = textInfo[5],
                            textColorB = textInfo[6],
                            textUnderline = textInfo[7];

                        formatting2.putString(cTID('FntN'), textFont);
                        formatting2.putString(cTID('FntS'), textStyle);
                        formatting2.putUnitDouble(cTID('Sz  '), cTID('#Pnt'), textSize);
                        setClr2.putDouble(cTID('Rd  '), textColorR);
                        setClr2.putDouble(cTID('Grn '), textColorG);
                        setClr2.putDouble(cTID('Bl  '), textColorB);
                        formatting2.putObject(cTID('Clr '), cTID('RGBC'), setClr2);
                        formatting2.putEnumerated(cTID('Undl'), cTID('Undl'), sTID(textUnderline));
                        formatting2.putBoolean(sTID('noBreak'), true);
                    }
				  
                    textRange.putObject(cTID('TxtS'), cTID('TxtS'), formatting);
				    actionList.putObject(cTID('Txtt'), textRange);
				  
				    textRange2.putObject(cTID('TxtS'), cTID('TxtS'), formatting2);
				    actionList.putObject(cTID('Txtt'), textRange2);
				  
                    textAction.putList(cTID('Txtt'), actionList);
                    action.putObject(cTID('T   '), cTID('TxLr'), textAction);
                }
            }
            executeAction(cTID('setd'), action, DialogModes.NO);
        }
	  alert("Done!");
    } catch (e) {
        alert(e);
    }
}

// ===============================================

doc.suspendHistory("Расставляем неразрывные пробелы", "noBreak()");

app.bringToFront();
