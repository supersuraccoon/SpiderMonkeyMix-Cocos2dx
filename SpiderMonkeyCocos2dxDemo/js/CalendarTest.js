require("jsb.js");
require("CalendarLayer.js");
require("CalendarConfig.js");
require("CalendarObject.js");
require("CalendarUtil.js");

try {
    director = cc.Director.getInstance();
    winSize = director.getWinSize();
    
    var runningScene = director.getRunningScene();
    if (runningScene === null) {
        js_addLogToCLI("[JS] runningScene === null", 4);
    }
    else {
        var layer = new cc.LayerGradient();
        layer.init(cc.c4b(0, 0, 0, 255), cc.c4b(0, 128, 255, 50));
        runningScene.addChild(layer);
        
        var calendarLayer = CalendarLayer.createCalendar(this, 2010, 2013, "2013-1-1");
        calendarLayer.setPosition(winSize.width / 2, winSize.height / 2);
        layer.addChild(calendarLayer);
        this.calendarDateChanged = function(year, month, day) {
            js_addLogToCLI("[JS] calendarDateChanged delegate called", 2);
            js_addLogToCLI("[JS] calendarDateChanged: Y/" + year + " M/" + month + " D/" + day, 2);
        },
        layer.onClose = function(sender) {
            layer.removeFromParent(true);
            js_addLogToCLI("[JS] removeFromParent called", 2);
        }
        // menu
        cc.MenuItemFont.setFontSize(30);
        var item = cc.MenuItemFont.create("Remove Component", layer.onClose, this);
        var menu = cc.Menu.create(item);
        menu.setPosition(winSize.width / 2, winSize.height / 10);
        layer.addChild(menu);
    }
} catch(e) {log(e);}