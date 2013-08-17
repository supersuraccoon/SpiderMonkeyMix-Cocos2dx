// CalendarLayer

var CalendarLayer = cc.Layer.extend({
	_delegate:null,
	_yearRangeStart:0,
	_yearRangeEnd:0,
    _currentYear:0,
    _currentMonth:0,
    _currentDay:0,
	_caDayArray:null,
    _caWeekdayArray:null,
    _caMonthObject:null,
	_caYearObject:null,
    init:function (delegate, yearRangeStart, yearRangeEnd, currentDate) {
    	var bRet = false;
        if (this._super()) {
        	// enable touch
        	this.setTouchEnabled(true);
        	// init args
        	this._delegate = delegate;
		    this._yearRangeStart = yearRangeStart;
		    this._yearRangeEnd = yearRangeEnd;
            this._currentYear = parseInt(currentDate.split("-")[0]);
            this._currentMonth = parseInt(currentDate.split("-")[1]);
            this._currentDay = parseInt(currentDate.split("-")[2]);
            // create ui
		    this.createCAFrame();
		    this.initCAElement();
		    this.initCAElementPosition();
		    // update ui
		    this.updateDays();
		    // return
		    bRet = true;
		}
		return bRet;
    },
    createCAFrame:function () {
    	// create body
        this._caBody = cc.Sprite.create(CA_BODY_SPRITE);
        this._caBodySize = this._caBody.getContentSize();
        this.addChild(this._caBody, 1, CA_BODY_TAG);
        // create title
        this._caTitle = cc.Sprite.create(CA_TITLE_SPRITE);
        this._caTitleSize = this._caTitle.getContentSize();
	    this.addChild(this._caTitle, 2, CA_TITLE_TAG);
	    // create header
	    this._caHeader = cc.Sprite.create(CA_HEADER_SPRITE);
	    this._caHeaderSize = this._caHeader.getContentSize();
	    this.addChild(this._caHeader, 3, CA_HEADER_TAG);
	    // set position
	    this._caBody.setPosition(cc.p(0, 0));
        this._caTitle.setPosition(cc.p(0, this._caBodySize.height / 2 - this._caTitleSize.height / 2));
        this._caHeader.setPosition(cc.p(0, this._caBodySize.height / 2 - this._caTitleSize.height - this._caHeaderSize.height / 2));
    },
    initCAElement:function (dateString) {
    	// create year object
    	this._caYearObject = CalendarObject.createObject(this._currentYear, 1);
        this._caTitle.addChild(this._caYearObject, 1, 0);
        // create month object
        this._caMonthObject = CalendarObject.createObject(this._currentMonth, 2);
        this._caTitle.addChild(this._caMonthObject, 1, 0);
        // create weekday objects
        this._caWeekdayArray = new Array();
        for (var i = 1; i < 8; i++) {
    		var caWeekdayObject = CalendarObject.createObject(i, 4);
    		this._caWeekdayArray.push(caWeekdayObject);
            this._caHeader.addChild(caWeekdayObject);
    	}
        // create day objects
    	this._caDayArray = new Array();
    	for (var i = 1; i < 32; i++) {
    		var caDayObject = CalendarObject.createObject(i, 3);
    		this._caDayArray.push(caDayObject);
            this._caBody.addChild(caDayObject);
            if (i == this._currentDay) caDayObject.select();
    	}
    	// create menu
        var ls = cc.Sprite.create(CA_LEFT_ARROW);
        var lss = cc.Sprite.create(CA_LEFT_ARROW_SELECTED);
        var lsd = cc.Sprite.create(CA_LEFT_ARROW_SELECTED);
        var rs = cc.Sprite.create(CA_RIGHT_ARROW);
        var rss = cc.Sprite.create(CA_RIGHT_ARROW_SELECTED);
        var rsd = cc.Sprite.create(CA_RIGHT_ARROW_SELECTED);
        var m1 = cc.MenuItemSprite.create(ls, lss, lsd, this.preSelected, this);
        var m2 = cc.MenuItemSprite.create(rs, rss, rsd, this.nextSelected, this);
        var selectMenu = cc.Menu.create(m1, m2);
        selectMenu.alignItemsHorizontallyWithPadding(this._caTitleSize.width * 4 / 5);
        selectMenu.setPosition(cc.p(this._caTitleSize.width / 2, this._caTitleSize.height / 2));
        this._caTitle.addChild(selectMenu);
    },
    initCAElementPosition:function () {
    	// set year object position
        this._caYearObject.setPosition(cc.p(this._caTitleSize.width / 6 * 2.5, this._caTitleSize.height / 2));
    	this._caMonthObject.setPosition(cc.p(this._caTitleSize.width / 6 * 3.5, this._caTitleSize.height / 2));
    	for (var i = 0; i < this._caWeekdayArray.length; i ++) {
    		var caWeekdayObject = this._caWeekdayArray[i];
    		caWeekdayObject.setPosition(cc.p(caWeekdayObject.getContentSize().width * (caWeekdayObject.getObjectValue() - 0.5),
                                        this._caHeaderSize.height / 2));
    	}
    	this.updateDays();
    },
    updateDays:function() {
    	var daysCount = daysInMonth(this._caMonthObject.getObjectValue(), this._caYearObject.getObjectValue());
    	var startWeekDay = getFirstDay(this._caMonthObject.getObjectValue(), this._caYearObject.getObjectValue());
    	for (var i = 0; i < this._caDayArray.length; i ++) {
    		var caDayObject = this._caDayArray[i];
            caDayObject.setVisible(caDayObject.getObjectValue() <= daysCount ? true : false);
    		var day = caDayObject.getObjectValue();
    		var row = (day + startWeekDay % 7) ? (parseInt((day + startWeekDay - 1) / 7) + 1) : (day + startWeekDay - 1 % 7)
    		var col = (day + startWeekDay % 7) ? (parseInt(day + startWeekDay - 1) % 7 + 1) : (7 + 1)
    		caDayObject.setPosition(cc.p(col * caDayObject.getContentSize().width - caDayObject.getContentSize().width / 2,
    									 this._caBodySize.height - this._caHeaderSize.height / 2 - caDayObject.getContentSize().height * (row + 0.5)));
    	}    	
    },
    // handle touch
    onTouchesBegan:function (touches, event) {
        cc.log("onTouchesBegan from JS");
    	var touchLocation = touches[0].getLocation();
        touchLocation = this._caBody.convertToNodeSpace(touchLocation);
    	// is year touched
    	if (this._caYearObject.containsTouchLocation(touchLocation))
    		this.handleYearTouched();
    	// is month touched
    	if (this._caMonthObject.containsTouchLocation(touchLocation))
    		this.handleMonthTouched();
    	// is day touched
        for (var i = 0; i < this._caDayArray.length; i ++) {
            var caDayObject = this._caDayArray[i];
    		if (caDayObject.containsTouchLocation(touchLocation)) {
    			this.handleDayTouched(caDayObject);
    			break;
    		}
    	}
    },
    handleDayTouched:function (caDayObject) {
    	var preDay = this.caDayObjectFromDay(this._currentDay);
        if (preDay) preDay.deselect();
        caDayObject.select();
        this._currentDay = caDayObject.getObjectValue();
    	this._delegate.calendarDateChanged(this._caYearObject.getObjectValue(),
                                           this._caMonthObject.getObjectValue(),
                                           this._currentDay);
    },
    // handle menu selector
    preSelected:function (sender) {
        var currentMonth = this._caMonthObject.getObjectValue();
    	var currentYear = this._caYearObject.getObjectValue();
        currentMonth = (currentMonth - 1 <= 0) ? 12 : currentMonth - 1;
        currentYear = (currentMonth == 12) ? currentYear - 1 : currentYear;
        if (currentYear <= this._yearRangeStart) return;
        this._caMonthObject.updateContent(currentMonth);
        this._caYearObject.updateContent(currentYear);
        // check day
        var daysCount = daysInMonth(this._caMonthObject.getObjectValue(), this._caYearObject.getObjectValue());
        if (this._currentDay > daysCount) {
            // set to last day
            var caDayObject = this.caDayObjectFromDay(daysCount);
            this.handleDayTouched(caDayObject);
        }
        this.updateDays();
        this._delegate.calendarDateChanged(this._caYearObject.getObjectValue(),
            this._caMonthObject.getObjectValue(),
            this._currentDay);
    },
    nextSelected:function (sender) {
        var currentMonth = this._caMonthObject.getObjectValue();
        var currentYear = this._caYearObject.getObjectValue();
        currentMonth = (currentMonth + 1 >= 12) ? 1 : currentMonth + 1;
        currentYear = (currentMonth == 1) ? currentYear + 1 : currentYear;
        if (currentYear <= this._yearRangeStart) return;
        this._caMonthObject.updateContent(currentMonth);
        this._caYearObject.updateContent(currentYear);
        this.updateDays();
        this._delegate.calendarDateChanged(this._caYearObject.getObjectValue(),
            this._caMonthObject.getObjectValue(),
            this._currentDay);
    },
    // get data
    caDayObjectFromDay:function (day) {
        for (var i = 0; i < this._caDayArray.length; i ++) {
            var caDayObject = this._caDayArray[i];
            if (caDayObject.getObjectValue() == day) {
                return caDayObject;
            }
        }
        return null;
    },
    getAllCaDayObjects:function () {
                                    cc.log("getAllCaDayObjects");
        return this._caDayArray;
    }
});

CalendarLayer.createCalendar = function (delegate, yearRangeStart, yearRangeEnd, currnetDate) {
    var calendarLayer = new CalendarLayer();
    if (calendarLayer && calendarLayer.init(delegate, yearRangeStart, yearRangeEnd, currnetDate)) return calendarLayer;
    return null;
};
