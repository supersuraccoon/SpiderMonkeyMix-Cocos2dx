
var CIRCLE_LABEL_FONTNAME = "Arial-Bold";
var CIRCLE_LABEL_FONTCOLOR = cc.WHITE;
var CIRCLE_LABEL_FONTSIZE = 30;

var CircleLabelTTF = cc.Node.extend({
    init:function (centerString, nodeStringArray, radius, angle, startAngle) {
		if (this._super()) {
			this._centerString = centerString;
			this._nodeStringArray = nodeStringArray;
			this._radius = radius;
            this._isExpanding = false;
            this._initTTF();
            bRet = true;
		}
		return bRet;
    },
    _initTTF:function() {
    	this.centerTTF = cc.LabelTTF.create(this._centerString, CIRCLE_LABEL_FONTNAME, CIRCLE_LABEL_FONTSIZE);
    	this.addChild(this.centerTTF, 2, 0);
    	for (var i = 0; i < this._nodeStringArray.length; i++) {
    		var nodeTTF = cc.LabelTTF.create(this._nodeStringArray[i], CIRCLE_LABEL_FONTNAME, CIRCLE_LABEL_FONTSIZE);
    		nodeTTF.setColor(CIRCLE_LABEL_FONTCOLOR);
    		nodeTTF.setOpacity(0);
    		this.addChild(nodeTTF, 1, i + 1);
    	}
    },
    expandTTF:function() {
        if (this._isExpanding) return;
  		var angleUnit = 360 / this._nodeStringArray.length;
  		var angle = 0;
  		var delay = 0;
  		for (var i = 0; i < this._nodeStringArray.length; i++) {
    		angle += angleUnit; 
    		var nodeTTF = this.getChildByTag(i + 1);
    		var targetPosition = cc.p(Math.cos(angle * Math.PI / 180) * this._radius, Math.sin(angle * Math.PI / 180) * this._radius);
			nodeTTF.runAction(cc.Sequence.create(cc.DelayTime.create(delay), cc.Spawn.create(cc.FadeIn.create(0.2), cc.MoveTo.create(0.1, targetPosition))));
			delay += 0.1;
    	}
        this._isExpanding = true;
    },
    shrinkTTF:function() {
        if (!this._isExpanding) return;
    	var delay = 0;
  		for (var i = 0; i < this._nodeStringArray.length; i++) {
  			var nodeTTF = this.getChildByTag(i + 1);
			nodeTTF.runAction(cc.Sequence.create(cc.DelayTime.create(delay), cc.MoveTo.create(0.1, this.centerTTF.getPosition()), cc.FadeOut.create(0.2)));
			delay += 0.1;
    	}
        this._isExpanding = false;
    },
    setStrings:function(nodeStringArray) {
    	this._nodeStringArray = nodeStringArray;
  		for (var i = 0; i < this._nodeStringArray.length; i++) {
    		var nodeTTF = this.getChildByTag(i + 1);
    		nodeTTF.setString(this._nodeStringArray[i]);
    	}    	
    },
    isExpanding:function() {
        return this._isExpanding;
    }
});

CircleLabelTTF.create = function (centerString, nodeStringArray, radius) {
    var label = new CircleLabelTTF();
    if (label && label.init(centerString, nodeStringArray, radius)) return label;
    return null;
};