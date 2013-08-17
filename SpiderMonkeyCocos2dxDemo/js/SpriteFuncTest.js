require("jsb.js");

require("CircleLabelTTF.js");

require("CalendarLayer.js");
require("CalendarConfig.js");
require("CalendarObject.js");
require("CalendarUtil.js");

require("CLILayer.js");

function SpawnIconSprite() {
    js_addLogToCLI("[JS] SpawnIconSprite called", 2);
    var winSize = cc.Director.getInstance().getWinSize();
    var sprite = cc.Sprite.create("Icon.png");
    sprite.setPosition(cc.p(Math.random() * winSize.width, Math.random() * winSize.height));
    return sprite;
}

function DoubleSpriteSize(sprite) {
    js_addLogToCLI("[JS] DoubleSpriteSize called", 2);
    sprite.setScale(sprite.getScale() * 2.0);
}


function AddCircleTTFSpriteToLayer(parendLayer, centerString, stringArray, radius) {
    js_addLogToCLI("[JS] AddCircleTTFSpriteToLayer called", 2);
    js_addLogToCLI("[JS] parendLayer: " + parendLayer, 2);
    js_addLogToCLI("[JS] centerString: " + centerString, 2);
    js_addLogToCLI("[JS] stringArray: " + stringArray, 2);
    js_addLogToCLI("[JS] radius: " + radius, 2);
    var winSize = cc.Director.getInstance().getWinSize();
    var circleTTF = CircleLabelTTF.create(centerString, stringArray, radius);
    circleTTF.setPosition(cc.p(500, 500));
    parendLayer.addChild(circleTTF, 999, 999);
    circleTTF.onClose = function(sender) {
        js_addLogToCLI("[JS] circleTTF removeFromParent called", 2);
        circleTTF.removeFromParent(true);
    }
    // menu
    cc.MenuItemFont.setFontSize(30);
    var item1 = cc.MenuItemFont.create("Remove Component", circleTTF.onClose, this);
    var menu = cc.Menu.create(item1);
    menu.alignItemsHorizontallyWithPadding(50);
    menu.setPosition(0, - winSize.height / 3);
    circleTTF.addChild(menu);
    return circleTTF;
}


function AddCalendarToLayer(parendLayer, minYear, maxYear, nowString) {
    js_addLogToCLI("[JS] AddCalendarToLayer called", 2);
    var winSize = cc.Director.getInstance().getWinSize();
    var calendarLayer = CalendarLayer.createCalendar(parendLayer, minYear, maxYear, nowString);
    calendarLayer.setPosition(winSize.width / 2, winSize.height / 2);
    parendLayer.addChild(calendarLayer);
    parendLayer.calendarDateChanged = function(year, month, day) {
        js_addLogToCLI("[JS] Call C++ calendarDateChanged", 2);
        calendarDateChanged(year, month, day);
    }
    calendarLayer.onClose = function(sender) {
        js_addLogToCLI("[JS] calendarLayer removeFromParent called", 2);
        calendarLayer.removeFromParent(true);
    }
    // menu
    cc.MenuItemFont.setFontSize(30);
    var item1 = cc.MenuItemFont.create("Remove Component", calendarLayer.onClose, this);
    var menu = cc.Menu.create(item1);
    menu.alignItemsHorizontallyWithPadding(50);
    menu.setPosition(0, - winSize.height / 3);
    calendarLayer.addChild(menu);
    return calendarLayer;
}

function BindCLILayerTo(parendLayer) {
    var winSize = cc.Director.getInstance().getWinSize();
    var cliLayer = CLILayer.create(winSize.width * 4 / 5, winSize.height / 2);
    cliLayer.setPosition(cc.p((winSize.width - cliLayer.getContentSize().width ) / 2 , (winSize.height - cliLayer.getContentSize().height) / 50));
    parendLayer.addChild(cliLayer);
    return cliLayer;
}
