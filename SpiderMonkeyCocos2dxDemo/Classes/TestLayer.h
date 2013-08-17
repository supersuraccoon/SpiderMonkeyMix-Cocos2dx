#include "cocos2d.h"

USING_NS_CC;

class TestLayer : public CCLayerColor
{
public:
    TestLayer();
    ~TestLayer();

    void testLogic(int testIndex);
    void menuCallback(CCObject * pSender);

    virtual bool init();
    virtual void ccTouchesBegan(CCSet *pTouches, CCEvent *pEvent);
    
    static TestLayer* create();

    void updateShowingState();
private:
    CCMenu* m_pItemMenu;
    bool m_bShowing;
    bool m_bSpiderMonkeyInited;
    bool m_bCLIBound;
};
