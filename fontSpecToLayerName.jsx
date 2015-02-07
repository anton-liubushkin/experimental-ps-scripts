var myLayer = app.activeDocument.activeLayer;

if (myLayer.kind == 'LayerKind.TEXT') {
    
    try{
        var textColor = ', #'+myLayer.textItem.color.rgb.hexValue;
    } catch(e) {
        var textColor = ', #000000';
    }
    
    try{
        var textLineHeight = '/'+parseInt(myLayer.textItem.leading)+'px';
    } catch(e) {
        var textLineHeight = '';
    }
    
    var textFont = app.fonts.getByName(myLayer.textItem.font).name;
    
    var textSize = ', '+parseInt(myLayer.textItem.size)+'px';
 
    myLayer.name = textFont + textSize + textLineHeight + textColor;
}