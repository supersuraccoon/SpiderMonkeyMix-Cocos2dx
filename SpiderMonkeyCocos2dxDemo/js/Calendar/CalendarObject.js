// Calendar Object : year, month, weeday, day

var CalendarObject = cc.Sprite.extend({
	_objectValue:0,
	_objectType:0,
	_objectSelected:false,
	// objectType: 1: year 2: month 3: day 4: weekday
    init:function (objectValue, objectType) {
    	var bRet = false;
        if (this._super(CA_OBJECT_NORMAL_SPRITE_DICT[objectType])) {
		    this._objectValue = objectValue;
		    this._objectType = objectType;
		    this._objectSelected = false;
		    this.updateContent(this._objectValue);
		    bRet = true;
		}
		return bRet;
    },
    // touch
    rect:function () {
        return cc.rect (this.getPositionX() - this.getContentSize().width / 2,
        				this.getPositionY() - this.getContentSize().height / 2,
        				this.getContentSize().width,
        				this.getContentSize().height);
    },
    containsTouchLocation:function (touch) {
    	if (this._objectType == 4) return false;
        return cc.rectContainsPoint(this.rect(), touch);
    },
    updateContent:function (objectValue) {
    	var contentLabel = this.getChildByTag(CA_OBJECT_CONTENT_TAG);
    	if (!contentLabel) {
    		contentLabel = cc.LabelTTF.create("", CA_OBJECT_FONTNAME_DICT[this._objectType], CA_OBJECT_FONTSIZE_DICT[this._objectType]);
    		contentLabel.setColor(CA_OBJECT_NORMAL_FONTCOLOR_DICT[this._objectType]);
            contentLabel.setPosition(cc.p(this.getContentSize().width / 2, this.getContentSize().height / 2));
    		this.addChild(contentLabel, 1, CA_OBJECT_CONTENT_TAG);
    	}
    	this._objectValue = objectValue;
        if (this._objectType == 2) {
            contentLabel.setString(CA_OBJECT_MONTH_DICT[this._objectValue]);
        }
        else if (this._objectType == 4) {
            contentLabel.setString(CA_OBJECT_WEEKDAY_DICT[this._objectValue]);
        }
        else {
            contentLabel.setString(objectValue);
        }
    },
    getObjectValue:function () {
    	return this._objectValue;
    },
    select:function () {
    	if (this._objectSelected) return;
    	this._objectSelected = true;
    	this.setTexture(cc.TextureCache.getInstance().addImage(CA_OBJECT_SELECTED_SPRITE_DICT[this._objectType]));
    	var contentLabel = this.getChildByTag(CA_OBJECT_CONTENT_TAG);
    	if (contentLabel) contentLabel.setColor(CA_OBJECT_SELECTED_FONTCOLOR_DICT[this._objectType]);
    },
    deselect:function () {
    	if (!this._objectSelected) return;
    	this._objectSelected = false;
    	this.setTexture(cc.TextureCache.getInstance().addImage(CA_OBJECT_NORMAL_SPRITE_DICT[this._objectType]));
        var contentLabel = this.getChildByTag(CA_OBJECT_CONTENT_TAG);
    	if (contentLabel) contentLabel.setColor(CA_OBJECT_NORMAL_FONTCOLOR_DICT[this._objectType]);
    }
});

CalendarObject.createObject = function (objectValue, objectType) {
    var calendarObject = new CalendarObject();
    if (calendarObject && calendarObject.init(objectValue, objectType)) return calendarObject;
    return null;
};
