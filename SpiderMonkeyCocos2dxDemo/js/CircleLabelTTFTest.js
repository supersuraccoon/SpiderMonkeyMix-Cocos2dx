require("jsb.js");
require("CircleLabelTTF.js");

try {
    director = cc.Director.getInstance();
    winSize = director.getWinSize();
    
    var runningScene = director.getRunningScene();
    if (runningScene === null) {
        js_addLogToCLI("[JS] runningScene === null", 4);
    }
    else {
        js_addLogToCLI("[JS] CircleLabelTTFTest.js called", 2);
        var layer = new cc.LayerGradient();
        layer.init(cc.c4b(0, 0, 0, 255), cc.c4b(0, 128, 255, 50));
        runningScene.addChild(layer);
        var circleTTF = CircleLabelTTF.create("CircleTTF From JS", new Array("J", "S", "B", "I", "N", "D", "I", "N", "G"), 250);
        circleTTF.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
        layer.addChild(circleTTF);
        layer.expandTTF = function(sender) {
            js_addLogToCLI("[JS] circleTTF.expandTTF called", 2);
            circleTTF.expandTTF();
        }
        layer.shrinkTTF = function(sender) {
            js_addLogToCLI("[JS] shrinkTTF called", 2);
            circleTTF.shrinkTTF();
        }
        layer.onClose = function(sender) {
            js_addLogToCLI("[JS] circleTTF removeFromParent called", 2);
            layer.removeFromParent(true);
        }
        // menu
        cc.MenuItemFont.setFontSize(30);
        var item1 = cc.MenuItemFont.create("Expand TTF", layer.expandTTF, this);
        var item2 = cc.MenuItemFont.create("Shrink TTF", layer.shrinkTTF, this);
        var item3 = cc.MenuItemFont.create("Remove Component", layer.onClose, this);
        var menu = cc.Menu.create(item1, item2, item3);
        menu.alignItemsHorizontallyWithPadding(50);
        menu.setPosition(winSize.width / 2, winSize.height / 10);
        layer.addChild(menu);
    }
} catch(e) {log(e);}
