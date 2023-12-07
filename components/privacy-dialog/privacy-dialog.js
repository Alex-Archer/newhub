Component({
    properties: {
        //同意按钮颜色
        agreecolor:{
            type: String,
            value: '#319fa6'
        },
        //不同意按钮颜色
        disagreecolor:{
            type: String,
            value: '#999'
        },       
        //距离底部
        fixedbottom: {
            type: String,
            // value: '12px'
            value: '30vh'
        },
        //左右边距
        leftright: {
            type: String,
            // value: '16px'
            value: '15vw'
        },
        backgroundColor: {
            type: String,
            value: '#fff'
        },
        radius: {
            type: String,
            value: '12px'
        },
        titleColor: {
            type: String,
            value: '#333'
        },
        contentColor: {
            type: String,
            value: '#999'
        },
        mask: {
            type: Boolean,
            value: false
        }, 
        bottomShowType:{
            type:Number,
            value:0//默认 1上下
        }

    },
    data: {
        // title: "用户隐私保护提示",
        // desc1: "感谢您使用本游戏，您使用本游戏前应当阅井同意",
        // urlTitle: "《用户隐私保护指引》",
        // desc2: "当您点击同意并开始时用产品服务时，即表示你已理解并同息该条款内容，该条款将对您产生法律约束力。如您拒绝，将无法进入游戏。",
        // innerShow: false,
        // height: 0,

        title: "用户隐私保护提示",
        desc1: "感谢您使用本程序，您使用本程序前应当阅读并同意",
        urlTitle: "《aoben shared yoga 隐私保护指引》",
        desc2: "当您点击同意并开始时用产品服务时，即表示您已理解并同意该条款内容，该条款将对您产生法律约束力。如您拒绝，将无法使用部分功能。",
        innerShow: false,
        height: 0,
    },
    lifetimes: {
        attached: function () {
            if (wx.getPrivacySetting) {
                wx.getPrivacySetting({
                    success: res => {
                        console.log("是否需要授权：", res.needAuthorization, "隐私协议的名称为：", res.privacyContractName)
                        if (res.needAuthorization) {
                            this.popUp()
                        } else {
                            this.triggerEvent("agree")
                        }
                    },
                    fail: () => {},
                    complete: () => {},
                })
            } else {
                // 低版本基础库不支持 wx.getPrivacySetting 接口，隐私接口可以直接调用
                this.triggerEvent("agree")
            }
        },
    },
    methods: {
        handleDisagree(e) {
            this.triggerEvent("disagree")
            this.disPopUp()
        },
        handleAgree(e) {
            this.triggerEvent("agree")
            this.disPopUp()
        },
        popUp() {
            this.setData({
                innerShow: true
            })
        },
        disPopUp() {
            this.setData({
                innerShow: false
            })
        },
        openPrivacyContract() {
            wx.openPrivacyContract({
                success: res => {
                    console.log('openPrivacyContract success')
                },
                fail: res => {
                    console.error('openPrivacyContract fail', res)
                }
            })
        }
    }
})