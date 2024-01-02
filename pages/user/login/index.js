const app = getApp();
const logs = require("../../../utils/logs");
import _ from '../../../libs/we-lodash'
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../utils/md5.js')
var util = require('../../../utils/util.js')
import Storage from '../../../libs/axios-miniprogram/Storage';
const store = new Storage(wx); //实体化
const TOKEN_LOCAL_STORAGE = "Token"; //token名称
Page({
    data: {
        backURL: '', //转跳网址
        Redirect: false, //不是redirect 就是  reLaunch



        safeAreaBottom: app.globalData.safeAreaBottom,
        checkboxChecked: false,
        checkboxDisabled:true,//没同意隐私前不给用
        //buttonDisabled: true,

        disabled: false,
        btnText: '获取验证码',
        mobile: '',
        type: 'primary',
        code: '',

       
        loginText:"微信登录",

        //是否同意协议
        agreecheckbox:false,
    },

    agree(e){
        console.log("用户同意隐私授权, 接下来可以调用隐私协议中声明的隐私接口")
        this.setData({
            checkboxDisabled:false,
            loginText:"微信登录",

        })
      },
      disagree(e){
        let that = this;
        util.toast("您将以游客身份浏览！",null,null,(e)=>{
            that.setData({
                checkboxDisabled:true,
                loginText:"游客无需登录",
            })
            
        })
      },

    onLoad(opt) {
        
        //wx.hideHomeButton();
        let that = this;
        if (opt && opt.url) {
            that.setData({
                backURL: opt.url
            })
        }
        that.setData({
            Redirect: (opt.Redirect && opt.Redirect == "true") ? true : false
        })
    },
    //打开隐私说明
    openPrivacyContract() {
        wx.openPrivacyContract({
            success: () => {}, // 打开成功
            fail: () => {}, // 打开失败
        })
    },

    //打开服务条款
    protocol() {
        wx.navigateTo({
          url: '/packageA/pages/agreement/service/index',
        })
    },   
    //协议选框点击
    checkboxChange(e)
    {
      let _agree = e.detail.value||[];
      this.setData({
        agreecheckbox:util.isNull(_agree)?false:true
      })
    }, 
    //电话登录
    getPhoneNumber(e) {
        if(!this.data.agreecheckbox)
        {
          util.toast("请先阅读并同意使用协议和隐私协议")
          return;
        }
        app.getOpenID().then(resOpenID => {
            //{"errMsg":"getPhoneNumber:ok","encryptedData":"4aV0wX7e5JaR2rDGY9a4L6TW6r91gaHo398oiWvX67UcT+ap7hUp13iYW/tYAnDwtC5Tml7SoYNf1f8JUWWOO3S1z4REscNrDIj0WvRZ/nujb4Fk2NFpMgjH6a9CXtnHGrC8vgqai2f4jkYZ0Jc8pxjLDVTVJslLStPNgUh6qk42VX/9Sgkkofl3NRo8Oy55fdHAOQAHcXghMtV1Ntm/Ow==","iv":"lP9Qv0m49LFVT3b3SpfdOg==","cloudID":"71_2cvu12BrZaGBmRrXSN7MjdU3xnVswJ9if2xlkk5c4oMtnz7dFXFqCaakQrg","code":"f147dbd2cec09238e9065cccc5e1b6db1b97c1b3e44b22e296b0805f3a0ddc1a"}
            //拒绝 {"errMsg":"getPhoneNumber:fail user deny"} 
            let that = this;
            let res = e.detail;
            if (!res.errMsg || res.errMsg != "getPhoneNumber:ok") {
                return;
            }
            // let encryptedData = res.encryptedData;
            // let iv = res.iv;
            // let cloudID = res.cloudID;
            let code = res.code;

            if (res.encryptedData && res.iv) {
                let timestamp = (new Date()).valueOf();
                axios.get('/User/modifyMobile', {
                    userID: resOpenID,
                    codePhone: code,
                    //认证区
                    TIMESTAMP: timestamp,
                    //FKEY: md5util.md5(wx.getStorageSync('USERID') + code + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
                    FKEY: md5util.md5(resOpenID + code + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
                }, {
                    headers: {
                        "Content-Type": 'applciation/json',
                    }
                }).then((res) => {
                    //{"code":1,"message":"sucess","mobile":"15370752212","countrycode":"86"}
                    if (res.data.code == 1 && !util.isNull(res.data.mobile)) {
                        wx.setStorageSync('MOBILE', "true");
                        wx.setStorageSync(TOKEN_LOCAL_STORAGE, res.data.token); //统刷KEN  服务端进行了仅RT时间延长
                        wx.setStorageSync('LOGING', "true"); //后期考虑加密存比较
                        let  isCoach = wx.getStorageSync('ISCOACH'); //不为空就是教练，是他的OPENGID
                        if(!util.isNull(res.data.isCoach)&&isCoach!=res.data.isCoach)//是教练则写入
                        {
                          wx.setStorageSync('ISCOACH', res.data.isCoach); 
                        }

                        if (!util.isNull(that.data.backURL)) 
                        {
                          //order字符串单独处理返回，迎合TX上架要求
                          //https://mp.weixin.qq.com/cgi-bin/announce?action=getannouncement&key=11669729383k7cis&version=1&lang=zh_CN&platform=2
                          if(that.data.backURL=="order"){
                            
                            wx.redirectTo({
                              url: '/packageA/pages/order/list/index',
                            })
                            return
                          }

                              if (!this.data.Redirect) {
                                  wx.reLaunch({
                                      url: that.data.backURL,
                                  })
                              } else {
                                  wx.redirectTo({
                                      url: that.data.backURL
                                  })
                              }
                            return;

                        } else {
                            wx.navigateBack();
                            return;
                        }

                    } else {
                        wx.showToast({
                            title: '登录失败，请重试!',
                            icon: "none"
                        })
                    }
                }).catch((err) => {
                    if (err && JSON.stringify(err) == "{}" && err.statusCode != 200) {
                        // 处理非200错误
                        reject(err)
                    } else {
                        // 处理其他原因导致的错误 
                    }
                });
                //#endregion 开始自已服务器获取OPENGID
            } else {
                wx.showToast({
                    title: '登录失败，请重试!',
                    icon: "none"
                })

            }
        }, function (reason) {
            //出错

        })
    },
    getRandom: function (u) {
        let rnd = '';
        u = u || 6;
        for (var i = 0; i < u; i++) {
            rnd += Math.floor(Math.random() * 10);
        }
        return rnd;
    },
    input: function (e) {
        this.setData({
            mobile: e.detail.value
        });
    },
    doLoop: function (seconds) {
        let code = this.getRandom(6);
        tui.toast('您本次的验证码是：' + code, 5000);
        seconds = seconds ? seconds : 60;
        this.setData({
            btnText: seconds + 's后获取',
            code: code
        })
        let countdown = setInterval(() => {
            if (seconds > 0) {
                this.setData({
                        btnText: seconds + 's后获取'
                    })
                    --seconds;
            } else {
                this.setData({
                    btnText: '获取验证码',
                    disabled: false,
                    type: 'primary'
                })
                clearInterval(countdown);
            }
        }, 1000);
    },
    btnSend: function () {
        let rules = [{
            name: 'mobile',
            rule: ['required', 'isMobile'],
            msg: ['请输入手机号码', '请输入正确的手机号码']
        }];
        //进行表单检查
        let formData = {
            mobile: this.data.mobile
        };
        let checkRes = form.validation(formData, rules);
        if (!checkRes) {
            this.setData({
                disabled: true,
                btnText: "请稍候...",
                type: "gray"
            })
            setTimeout(() => {
                this.doLoop(60);
            }, 500);
        } else {
            tui.toast(checkRes);
        }
    },
    formLogin: function (e) {
        let loginCode = e.detail.value.smsCode;
        let mobile = e.detail.value.mobile;
        let rules = [{
                name: 'mobile',
                rule: ['required', 'isMobile'],
                msg: ['请输入手机号码', '请输入正确的手机号码']
            },
            {
                name: 'loginCode',
                rule: ['required', 'isSame:code'],
                msg: ['请输入验证码', '验证码不正确']
            }
        ];
        //进行表单检查
        let formData = {
            mobile: mobile,
            loginCode: loginCode,
            code: this.data.code
        };
        let checkRes = form.validation(formData, rules);
        if (checkRes) {
            tui.toast(checkRes);
            return;
        }
        let format = util.formatNumber(mobile);
        tui.setUserInfo(format)
        globalData.isLogin = true;
        globalData.mobile = format;
        tui.toast('登录成功', 2000, true);
        setTimeout(() => {
            wx.reLaunch({
                url: '/pages/tabbar/my/my'
            });
        }, 200);
    },

    //假设登录区
    formatDateTime(date) {
        const year = date.getFullYear()
        const month = (date.getMonth() + 1 + '').padStart(2, '0')
        const day = (date.getDate() + '').padStart(2, '0')
        const hour = (date.getHours() + '').padStart(2, '0')
        const minute = (date.getMinutes() + '').padStart(2, '0')
        const second = (date.getSeconds() + '').padStart(2, '0')
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    },
    generateRandomString(length) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            let randomIndex = Math.floor(Math.random() * chars.length);
            result += chars.charAt(randomIndex);
        }
        return result;
    },
    sb() {
        const curTime = new Date();

        var addMinute = new Date(curTime.setMinutes(curTime.getMinutes() + 10));
        var addMinute60 = new Date(curTime.setMinutes(curTime.getMinutes() + 60));

        store.set(TOKEN_LOCAL_STORAGE, {
            "accessToken": this.generateRandomString(32),
            "refreshToken": this.generateRandomString(32),
            "accessExpires": this.formatDateTime(addMinute),
            "refreshExpires": this.formatDateTime(addMinute60)
        });

        wx.reLaunch({
            url: '/pages/index/index',
        })
    },
    jump() {

        let that = this;
        if (!util.isNull(that.data.backURL)) {
            wx.reLaunch({
                url: that.data.backURL,
            })
            return;

        } else {
            wx.navigateBack();
            return;
        }
    }
})