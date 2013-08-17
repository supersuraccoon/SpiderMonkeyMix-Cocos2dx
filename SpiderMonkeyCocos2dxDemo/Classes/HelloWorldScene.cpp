#include "HelloWorldScene.h"
#include "TestLayer.h"

using namespace cocos2d;

CCScene* HelloWorld::scene()
{
    CCScene *scene = CCScene::create();
    HelloWorld *layer = HelloWorld::create();
    scene->addChild(layer);
    return scene;
}

bool HelloWorld::init()
{
    if (!CCLayer::init())
        return false;

    CCSize winSize = CCDirector::sharedDirector()->getWinSize();
    // add info
    CCLabelTTF* infoLabel = CCLabelTTF::create("This project contains:\nSeveral examples on how to use SpiderMonkey in cocos2d-x project.\nA console layer named CLI you can see all the logs in it\nREMEMBER Init SpiderMonkey(NO.1)/Activate CLILayer(NO.10) FIRST!", "Verdana-Italic", 24);
    infoLabel->setHorizontalAlignment(kCCTextAlignmentLeft);
    infoLabel->setPosition(ccp(winSize.width / 2, winSize.height / 2));
    this->addChild(infoLabel);
    infoLabel->runAction(CCFadeOut::create(20.0));
    
    // add test layer
    CCLayer * layer = TestLayer::create();
    layer->setPosition( ccp(0, layer->getContentSize().height - 30));
    this->addChild(layer);
    
    
    return true;
}
