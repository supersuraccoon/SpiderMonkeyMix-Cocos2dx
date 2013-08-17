#include "TestLayer.h"

// jsb
#include "jsapi.h"
#include "cocos2d.h"
#include "ScriptingCore.h"
#include "jsb_cocos2dx_auto.hpp"
#include "jsb_cocos2dx_extension_auto.hpp"
#include "jsb_cocos2dx_extension_manual.h"
#include "cocos2d_specifics.hpp"
#include "js_bindings_system_registration.h"
#include "jsb_opengl_registration.h"

/*
	g_cliJSValue: 
		we need this to call addLog function (CLILayer member function)
		
	c_addLogToCLI:
		c++ function which will call addLog function in JS
	
	js_addLogToCLI:
		this function is register in SpiderMonkey global context which we can call from inside js function
		to addLog to our cliLayer in c++ project
*/
jsval g_cliJSValue;

void c_addLogToCLI(int logType, const char * pszFormat, ...)
{
    ScriptingCore* sc = ScriptingCore::getInstance();
    if (sc) {
        char szBuf[kMaxLogLen+1] = {0};
        va_list ap;
        va_start(ap, pszFormat);
        vsnprintf(szBuf, kMaxLogLen, pszFormat, ap);
        va_end(ap);
        
        jsval args[2];
        args[0] = c_string_to_jsval(sc->getGlobalContext(), szBuf);
        args[1] = INT_TO_JSVAL(logType);
        sc->executeFunctionWithOwner(g_cliJSValue, "addLog", 2, args, NULL);
    }
}

JSBool js_addLogToCLI(JSContext *cx, uint32_t argc, jsval *vp) {
    jsval *argv = JS_ARGV(cx, vp);
    jsval logJSV =  argv[0];
    jsval logTypeJSV =  argv[1];
    std::string cLog;
    int cLogType;
    jsval_to_std_string(cx, logJSV, &cLog);
    jsval_to_int32(cx, logTypeJSV, &cLogType);
    c_addLogToCLI(cLogType, cLog.c_str());
    JS_SET_RVAL(cx, vp, JSVAL_NULL);
    return JS_TRUE;
}

/*
 Used by calendarDateChanged delegate in js
 */
JSBool calendarDateChanged(JSContext *cx, uint32_t argc, jsval *vp) {
    jsval *argv = JS_ARGV(cx, vp);
    jsval yearJSV =  argv[0];
    jsval monthJSV =  argv[1];
    jsval dayJSV =  argv[2];
    int year = JSVAL_TO_INT(yearJSV);
    int month = JSVAL_TO_INT(monthJSV);
    int day = JSVAL_TO_INT(dayJSV);
    c_addLogToCLI(1, "[C++] calendarDateChanged delegate called in C++");
    c_addLogToCLI(1, "[C++] calendarDateChanged Y/%d M/%d D/%d", year, month, day);
    JS_SET_RVAL(cx, vp, JSVAL_NULL);
    return JS_TRUE;
}

static JSFunctionSpec myjs_global_functions[] = {
    JS_FS("js_addLogToCLI", js_addLogToCLI, 2, 0),
    JS_FS("calendarDateChanged", calendarDateChanged, 3, 0),
    JS_FS_END
};


/*
	test list
*/
#define TESTS_COUNT         10
const std::string g_aTestNames[TESTS_COUNT] = {
    "1.  SpiderMonkey Init",
    "2.  call JS function - 0 param, 0 return",
    "3.  call JS function - 1 param(Basic Type) , 1 return(Basic Type)",
    "4.  call JS function - 0 param , 1 return(cocos2d Object)",
    "5.  call JS function - 1 param(cocos2d Object) , 0 return",
    "6.  Bind Simple UI component to c++ CCScene",
    "7.  Bind Complex UI component to c++ CCScene",
    "8.  call JS function - N param(Mix) , 0 return",
    "9.  call JS object function",
    "10. Bind UI Component (CLI)"
};

/*
	TestLayer
*/
TestLayer* TestLayer::create()
{
    TestLayer* pRet = new TestLayer();
    if (pRet && pRet->init())
    {
        pRet->setTouchEnabled(true);
        pRet->autorelease();
    }
    else
    {
        CC_SAFE_DELETE(pRet);
    }
    return pRet;
}

bool TestLayer::init()
{
    CCSize winSize = CCDirector::sharedDirector()->getWinSize();
    m_pItemMenu = CCMenu::create();
    for (int i = 0; i < TESTS_COUNT; ++i)
    {
        CCLabelTTF* label = CCLabelTTF::create(g_aTestNames[i].c_str(), "Verdana-Italic", 18);
        label->setAnchorPoint(ccp(0, 0.5));
        CCMenuItemLabel* pMenuItem = CCMenuItemLabel::create(label, this, menu_selector(TestLayer::menuCallback));
        m_pItemMenu->addChild(pMenuItem, i + 1);
    }
    m_pItemMenu->alignItemsVerticallyWithPadding(12);
    m_pItemMenu->setPosition(ccp(winSize.width / 2, winSize.height * 3 / 4));
    addChild(m_pItemMenu);
    return CCLayerColor::initWithColor(ccc4(0, 245, 255, 100), winSize.width, winSize.height);
}

TestLayer::TestLayer()
{
    m_bShowing = false;
    m_bSpiderMonkeyInited = false;
    m_bCLIBound = false;
}

TestLayer::~TestLayer()
{
}

void TestLayer::menuCallback(CCObject * pSender)
{
    CCMenuItem* pMenuItem = (CCMenuItem *)(pSender);
    this->testLogic(pMenuItem->getZOrder());
}

void TestLayer::testLogic(int testIndex)
{
    if (testIndex == 1)
    {
		if (m_bSpiderMonkeyInited) 
		{
			c_addLogToCLI(3, "[C++] %s", "Spidermonkey already inited!!!");
			return;
		}
        // init spidermonkey
        ScriptingCore* sc = ScriptingCore::getInstance();
        CCScriptEngineProtocol *pEngine = ScriptingCore::getInstance();
        CCScriptEngineManager::sharedManager()->setScriptEngine(pEngine);
        sc->addRegisterCallback(register_all_cocos2dx);
        sc->addRegisterCallback(register_all_cocos2dx_extension);
        sc->addRegisterCallback(register_cocos2dx_js_extensions);
        sc->addRegisterCallback(register_all_cocos2dx_extension_manual);
        sc->addRegisterCallback(jsb_register_system);
        sc->addRegisterCallback(JSB_register_opengl);
        sc->start();
        if (!JS_DefineFunctions(sc->getGlobalContext(), sc->getGlobalObject(), myjs_global_functions)) {
            c_addLogToCLI(4, "[C++] JS_DefineFunctions Failed!!!");
            return;
        }
        sc->runScript("GlobalFuncTest.js");
        sc->runScript("SpriteFuncTest.js");
        m_bSpiderMonkeyInited = true;
		//c_addLogToCLI(1, "[C++] %s", "Spidermonkey init success");
        return;
    }
    if (!m_bSpiderMonkeyInited)
    {
		//c_addLogToCLI(4, "[C++] %s", "Init SpiderMonkey First!!!");
        return;
    }
    if (testIndex == 2)
    {
        // call JS function - 0 param, 0 return
        ScriptingCore* sc = ScriptingCore::getInstance();
        sc->executeFunctionWithOwner(OBJECT_TO_JSVAL(sc->getGlobalObject()), "MyLogFunc");
        c_addLogToCLI(1, "[C++] MyLogFunc called");
    }
    else if (testIndex == 3)
    {
        // call JS function - 1 param(Basic Type) , 1 return(Basic Type)
        ScriptingCore* sc = ScriptingCore::getInstance();
        jsval dataVal = INT_TO_JSVAL(10);
        jsval ret;
        sc->executeFunctionWithOwner(OBJECT_TO_JSVAL(sc->getGlobalObject()), "DubleIntFunc", 1, &dataVal, &ret);
        c_addLogToCLI(1, "[C++] DubleIntFunc called with result: %d", JSVAL_TO_INT(ret));
    }
    else if (testIndex == 4)
    {
        // call JS function - 0 param , 1 return(cocos2d Object)
        ScriptingCore* sc = ScriptingCore::getInstance();
        jsval ret;
        sc->executeFunctionWithOwner(OBJECT_TO_JSVAL(sc->getGlobalObject()), "SpawnIconSprite", 0, NULL, &ret);
		c_addLogToCLI(1, "[C++] SpawnIconSprite called");
        if(!JSVAL_IS_NULL(ret)) {
            JSObject *obj = JSVAL_TO_OBJECT(ret);
            js_proxy_t *proxy = jsb_get_js_proxy(obj);
            CCSprite *sprite = (CCSprite *)(proxy ? proxy->ptr : NULL);
            if (sprite) {
                this->addChild(sprite);
				c_addLogToCLI(1, "[C++] Add sprite from js to c++ layer");
            }
        }
    }
    else if (testIndex == 5 )
    {
        // call JS function - 1 param(cocos2d Object) , 0 return
        ScriptingCore* sc = ScriptingCore::getInstance();
        CCSprite *sprite = CCSprite::create("Icon.png");
        sprite->setPosition(ccp(CCRANDOM_0_1() * 1000, CCRANDOM_0_1() * 1000));
        this->addChild(sprite);
        js_proxy_t *p = js_get_or_create_proxy<cocos2d::CCSprite>(sc->getGlobalContext(), sprite);
        jsval dataVal = OBJECT_TO_JSVAL(p->obj);
        sc->executeFunctionWithOwner(OBJECT_TO_JSVAL(sc->getGlobalObject()), "DoubleSpriteSize", 1, &dataVal, NULL);
		c_addLogToCLI(1, "[C++] Add sprite from js to layer");
    }
    else if (testIndex == 6)
    {
        // Bind Simple UI component to c++ CCScene
        ScriptingCore* sc = ScriptingCore::getInstance();
        sc->runScript("CircleLabelTTFTest.js");
		c_addLogToCLI(1, "[C++] %s", "Run CircleLabelTTFTest script");
		c_addLogToCLI(1, "[C++] %s", "Bind UI Component to CCSCene");
    }
    else if (testIndex == 7)
    {
        // Bind Complex UI component to c++ CCScene
        ScriptingCore* sc = ScriptingCore::getInstance();
        sc->runScript("CalendarTest.js");
		c_addLogToCLI(1, "[C++] %s", "Run CalendarTest script");
		c_addLogToCLI(1, "[C++] %s", "Bind UI Component to CCSCene");
    }
    else if (testIndex == 8)
    {
        // call JS function - N param(Mix) , 0 return
        ScriptingCore* sc = ScriptingCore::getInstance();
        js_proxy_t *p = js_get_or_create_proxy<cocos2d::CCLayer>(sc->getGlobalContext(), this);
        jsval layerVal = OBJECT_TO_JSVAL(p->obj);
        
        jsval nowStringVal = c_string_to_jsval(sc->getGlobalContext(), "2013-7-27");
        jsval minYearVal = INT_TO_JSVAL(2010);
        jsval maxYearVal = INT_TO_JSVAL(2016);
        jsval args[4];
        args[0] = layerVal;
        args[1] = minYearVal;
        args[2] = maxYearVal;
        args[3] = nowStringVal;
        sc->executeFunctionWithOwner(OBJECT_TO_JSVAL(sc->getGlobalObject()), "AddCalendarToLayer", 4, args, NULL);
		c_addLogToCLI(1, "[C++] %s", "Bind Calendar UI to speicfied layer");
    }
    else if (testIndex == 9)
    {
        // call JS object function
        ScriptingCore* sc = ScriptingCore::getInstance();
        js_proxy_t *p = js_get_or_create_proxy<cocos2d::CCLayer>(sc->getGlobalContext(), this);
        jsval layerVal = OBJECT_TO_JSVAL(p->obj);
        
        jsval stringVal = c_string_to_jsval(sc->getGlobalContext(), "center");
        
        CCArray *array = CCArray::create();
        array->addObject(CCInteger::create(111));
        array->addObject(CCInteger::create(222));
        array->addObject(CCInteger::create(333));
        array->addObject(CCInteger::create(444));
        array->addObject(CCInteger::create(555));
        array->addObject(CCInteger::create(666));
        array->addObject(CCInteger::create(777));
        array->addObject(CCInteger::create(888));
        jsval arrayVal = ccarray_to_jsval(sc->getGlobalContext(), array);
        jsval radiusVal = INT_TO_JSVAL(200);
        jsval args[4];
        args[0] = layerVal;
        args[1] = stringVal;
        args[2] = arrayVal;
        args[3] = radiusVal;
        jsval ret;
        sc->executeFunctionWithOwner(OBJECT_TO_JSVAL(sc->getGlobalObject()), "AddCircleTTFSpriteToLayer", 4, args, &ret);
		c_addLogToCLI(1, "[C++] %s", "Bind CircleTTF UI to speicfied layer");
        if(!JSVAL_IS_NULL(ret)) {
            sc->executeFunctionWithOwner(ret, "expandTTF", 0, NULL, NULL);
			c_addLogToCLI(1, "[C++] %s", "Call CircleTTF function expandTTF");
        }
    }
    else if (testIndex == 10)
    {
        // Bind UI Component (CLI)
        ScriptingCore* sc = ScriptingCore::getInstance();
        js_proxy_t *p = js_get_or_create_proxy<cocos2d::CCLayer>(sc->getGlobalContext(), this);
        jsval layerVal = OBJECT_TO_JSVAL(p->obj);
        sc->executeFunctionWithOwner(OBJECT_TO_JSVAL(sc->getGlobalObject()), "BindCLILayerTo", 1, &layerVal, &g_cliJSValue);
		c_addLogToCLI(1, "[C++] %s", "Bind CLI Layer to current layer");
        m_bCLIBound = true;
    }
    else
    {
		c_addLogToCLI(4, "[C++] TEST NOT FOUND!!!");
    }
}

void TestLayer::updateShowingState()
{
    m_bShowing = (m_bShowing) ? false : true;
    //this->setTouchEnabled(true);
}

void TestLayer::ccTouchesBegan(CCSet *pTouches, CCEvent *pEvent)
{
    CCTouch *touch = (CCTouch*)pTouches->anyObject();
    if (!this->boundingBox().containsPoint(touch->getLocation())) {
        return;
    }
    this->setTouchEnabled(false);
    if (!m_bShowing) {
        this->runAction(CCSequence::create(CCMoveBy::create(0.5, ccp(0, - this->getContentSize().height + 30)),
                                           CCCallFunc::create(this, callfunc_selector(TestLayer::updateShowingState)), NULL));
    }
    else {
        this->runAction(CCSequence::create(CCMoveBy::create(0.5, ccp(0, this->getContentSize().height - 30)),
                                           CCCallFunc::create(this, callfunc_selector(TestLayer::updateShowingState)), NULL));
    }
}