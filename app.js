const _config = require('./config');
import logs from './utils/logs.js';
import _ from './libs/we-lodash'

import axios from './libs/axios-miniprogram/axios-miniprogram.cjs';
axios.defaults.baseURL = _config.host+'/api/'


import Storage from './libs/axios-miniprogram/Storage';
const store = new Storage(wx); //实体化
import aut from './libs/axios-miniprogram/authorUtils';
const authorUtils = new aut(); //实体化
const refreshURL = '/refreshToken';
const DecodeUserURL = '/DecodeUserInfo';
var md5util = require('./utils/md5.js')
var util = require('./utils/util.js')


function refresh(refreshtoken) {
   
    const app = getApp();
    var timestamp = (new Date()).valueOf();
    let _USERID = wx.getStorageSync('USERID');
    return axios.get(refreshURL, {
            userID: _USERID,
            refreshtoken: refreshtoken,
            TIMESTAMP: timestamp,
            FKEY: md5util.md5(_USERID + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        }, {
            interceptors: {
                request: false, //是否经过请求拦截
            }
        }
    ).then(res => res.data.token)
}

/**
 * 刷新令牌
 * @param token 令牌对象
 * @param config axios的配置对象
 */
async function refreshingToken(token, config) {
    if (!isRefreshing) {
        isRefreshing = true
        return new Promise((resolve, reject) => {
            refresh(token.refreshtoken).then(data => {
                const newToken = new authorUtils.Token(data.accesstoken, data.refreshtoken, data.accessexpires, data.refreshexpires)
                wx.setStorageSync(TOKEN_LOCAL_STORAGE, newToken);
                resolve(data)
            }).catch(data => {
                cancelTokens.forEach(cancel => {
                    cancel("TOKEN写入本地失败取消");
                })
                wx.redirectTo({
                    url: '/pages/user/login/index?url=' + getApp().globalData.baseURL,
                })
                reject(data)
            }).finally(() => {
                isRefreshing = false
            })
        })
    } else {
        return new Promise((resolve, reject) => {
            const id = setInterval(() => {
                if (!isRefreshing) {
                    clearTimeout(id)
                    resolve();
                }
            }, 1000);
        });
    }
}

const TOKEN_LOCAL_STORAGE = "Token"; //token名称
const AUTHORIZATION = 'Authorization';
const BEARER = 'Bearer ';
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
let isRefreshing = false;
const cancelTokens = [];// 需要取消请求的集合
const queue = [];//响应拦截
const queueURL = []; //是否重复增加

axios.interceptors.request.use(async config => {
    if (config.interceptors && !config.interceptors.request) {
        return config;
    }
    const token = wx.getStorageSync(TOKEN_LOCAL_STORAGE);
    if (!authorUtils.validateAuthenticationURL(config.url)) {

        if (!token) {
            cancelTokens.forEach(cancel => {
                cancel("5A 本地TOLEN为空 时取消");
            })
            wx.reLaunch({
                url: '/pages/user/login/index?url=' + getApp().globalData.baseURL,
            })
            return;
        }

        if (authorUtils.validateDateExpires(token.refreshexpires)) {
            cancelTokens.forEach(cancel => {
                cancel("7A 刷新TOKEN已过期 时取消");
            })
            wx.reLaunch({
                url: '/pages/user/login/index?url=' + getApp().globalData.baseURL,
            })
            return;
        }
        //将本次请求放入待取消请求集合 
        config.cancelToken = new axios.CancelToken(cancel => {
            if (!queueURL.includes(config.url)) {
                queue.push({
                    cancel,
                    config
                });
                queueURL.push(config.url);
            }
            cancelTokens.push(() => source.cancel("令牌无效取消请求"));
        });
        if (authorUtils.validateDateExpires(token.accessexpires)) {
            await refreshingToken(token, config)
        }

    }

    let _token = wx.getStorageSync(TOKEN_LOCAL_STORAGE); //再次获取最新的
    if (_token && _token.accesstoken) {
        config.headers[AUTHORIZATION] = BEARER + _token.accesstoken;
    }
    return config
}, error => {
    return Promise.reject(error)
})


let err401 = 0; //防止响应来的一直是401，造成小程序一直请求，超过3次就停止吧
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (!error || JSON.stringify(error) == "{}") {

            queue.forEach(item => item.cancel());
            return Promise.reject();

        }
        /*
        401 accessToken 过期，需要refreshToken换新的
        405 refreshToken 过期，必须重新登录.
        */
        if (err401 >= 3) {
            err401 = 0;
            //重大问题 刷新次数过多，服务端响应的401一直未变
            return Promise.reject(error);
        }
        //405 就必须重新登，哪怕是刷新页
        if (error.response.status === 405) {
            //store.remove(TOKEN_LOCAL_STORAGE);
            queue.forEach(item => item.cancel());
            // wx.redirectTo({
            //     url: '/pages/user/login/index?url=' + getApp().globalData.baseURL,
            // })
            return;
        }
        if (error.response.status === 401 && !authorUtils.validateAuthenticationURL(error.response.config.url)) {
            err401++;
            let token = wx.getStorageSync(TOKEN_LOCAL_STORAGE);
            if (!token || !token.refreshtoken) {
                queue.forEach(item => item.cancel());
                wx.redirectTo({
                    url: '/pages/user/login/index?url=' + getApp().globalData.baseURL,
                })
                return;
            } else //401 且本地TOKEN不为空
            {
                if (util.isNull(token) || !_.has(token, 'accessexpires')) {
                    queue.forEach(item => item.cancel());
                    wx.redirectTo({
                        url: '/pages/user/login/index?url=' + getApp().globalData.baseURL,
                    })
                    return;
                } else {
                    let tokenTemp = token;
                    queue.forEach(item =>item.cancel());
                        return new Promise(resolve => {

                            let currentDate = new Date();
                            let timestamp = currentDate.getTime();
                            let oneDay = 24 * 60 * 60 * 1000;
                            let previousDate = new Date(timestamp - oneDay);
                            let year = previousDate.getFullYear();
                            let month = String(previousDate.getMonth() + 1).padStart(2, '0');
                            let day = String(previousDate.getDate()).padStart(2, '0');
                            let hours = String(previousDate.getHours()).padStart(2, '0');
                            let minutes = String(previousDate.getMinutes()).padStart(2, '0');
                            let seconds = String(previousDate.getSeconds()).padStart(2, '0');
                            let newDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                            //重新设置AC 过期一天用以和服务器时间不同步的问题
                            _.set(tokenTemp, 'accessexpires', newDate);
                            wx.setStorageSync(TOKEN_LOCAL_STORAGE, tokenTemp);

                            token = wx.getStorageSync(TOKEN_LOCAL_STORAGE);//不能去,去了会少一个请求
                            //移除拦截器防止死循环
                            axios.interceptors.response.eject(this);
                            resolve(axios(error.config));//重新请求
                        })









                }
            }
        }

        return Promise.reject(error);
    }
)

App({
    onLaunch: function () {
        wx.getSystemInfo({
            success: res => {

                let custom = wx.getMenuButtonBoundingClientRect(); //菜单按钮
                let systemInfo = wx.getSystemInfoSync();
                /*
                if(res.platform == 'ios')   //ios
                if(res.platform == 'android')  //安卓
                if(res.platform == 'devtools')  //开发者工具
                */
               this.globalData.platform = systemInfo.platform;

                this.globalData.custom = custom;
                this.globalData.customBar = custom.height;
                this.globalData.statusBar = custom.top;
                this.globalData.navBarHeight = (custom.top - systemInfo.statusBarHeight) * 2 + custom.height + systemInfo.statusBarHeight;

                this.globalData.windowHeight = systemInfo.windowHeight;
                this.globalData.windowWidth = systemInfo.windowWidth;

                //底部安全区域计算
                let screenHeight = res.screenHeight;
                let _safeAreaBottom = res.safeArea.bottom;
                this.globalData.safeAreaBottom = screenHeight - _safeAreaBottom;
            }
        })


        // 获取小程序更新机制兼容
        if (wx.canIUse('getUpdateManager')) {
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    updateManager.onUpdateReady(function () {
                        wx.showModal({
                            title: '更新提示',
                            content: '新版本已经上线啦~，为了获得更好的体验，建议立即更新',
                            showCancel: false,
                            confirmColor: "#5677FC",
                            success: function (res) {
                                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                updateManager.applyUpdate()
                            }
                        })
                    })
                    updateManager.onUpdateFailed(function () {
                        // 新的版本下载失败
                        wx.showModal({
                            title: '更新失败',
                            content: '新版本更新失败，为了获得更好的体验，请您删除当前小程序，重新搜索打开',
                            confirmColor: "#5677FC",
                            showCancel: false
                        })
                    })
                }
            })
        } else {
            // 当前微信版本过低，无法使用该功能
        }
    },
    onShow(e) {

        wx.onCopyUrl((result) => {
        setTimeout(() => {
            wx.setClipboardData({
            data: '',
            })
        }, 1000);
})


    },
    onError(err) {

    },
    globalData: {
        scanURL: 'HTTPS://yoga.aoben.yoga', //扫码动作网址
        version: "202311011718",
        baseURL: "/pages/index/index", //总局返回页面,默认为首页
        loginPage: "/pages/user/login/index", //登录页 app.globalData.loginPage
        MAC: '', //MAC计算唯一串组合 防换手机时OAUTH过期
        showPrivacy: false, //20230815强制隐私了
        APP_INTF_SECRECT: "NDATGYSXzrdtE5mQqfWlJhCbaixnPsqR", //首次登录约定
        appName: '奥本运动',
        appID: 'wx5dc5170a2e31c431', //奥本
        openId: null,
        code: null, //wx.login 的code
        encryptedData: null,
        iv: null,
        aesKEY: "key",
        aesIV: "",

        //订阅消息模板
        subscribeMsg: {
            /**
                预约课程{{thing2.DATA}}
                预约时间{{date3.DATA}}
                预约门店{{thing4.DATA}}
                上课地址{{thing6.DATA}}
                温馨提示{{thing5.DATA}}
             */
            "agreeConfirmation": {
                tID: "WOxzrpkwYFx4Kv7nqop48wVNqSy9FOHnFG0wKOF3a70",
                tNO: "2400",
                des: "预约确认通知"
            },
            /**
                活动名称{{thing3.DATA}}
                开始时间{{time1.DATA}}
                结束时间{{time2.DATA}}
                温馨提示{{thing4.DATA}}
             */
            "activityStart": {
                tID: "uZmNcZAqvGOQu-GTSTQZ5bbuddF7eegbddimuQBcD80",
                tNO: "12504",
                des: "活动开始提醒"
            },
        },
        
      /*
      if(res.platform == 'ios')   //ios
      if(res.platform == 'android')  //安卓
      if(res.platform == 'devtools')  //开发者工具
      */
     platform:'',//操作系统

        //胶囊位置
        custom: 0,
        customBar: 0,
        statusBar: 0, //胶囊距离顶 PX
        navBarHeight: 0, //导航栏高度
        windowHeight: 0,
        windowWidth: 0,
        //腾讯地图 app.globalData.MapQQ.MapSDK ...
        MapQQ: {
            MapSDK: null,
            MapKey: 'YR6BZ-VGQW5-CXMIY-QVXIC-NPTM7-FEF75', //微信地图MAPKEY
            //初始定位，市政府那
            // lat: 22.63137,
            // lng: 114.010857,
            //阳科园
            lat: 31.41530584978003,
            lng: 120.87849783800436,
        },

        //图片都在 {{baseURL}}/miniprogram/url-img/....
        globalURL: _config.host,
        //axios请求地址在顶上配置：axios.defaults.baseURL 
        userInfo: null,
        isLogin: wx.getStorageSync("thorui_mobile") ? true : false,

        isOnline: true,
        mobile: wx.getStorageSync("thorui_mobile") || "",
        statusBarHeight: 0,
        navigationBarHeight: 0,
        navigationBarWidth: 0,
        safeAreaBottom: 0, //底部安全区截域高

        tabBar: [{
                "pagePath": "/pages/index/index",
                "navigate": false,
                "action": "",
                "text": "首页",
                "iconPath": "/static/img/tabbar/home.png",
                "selectedIconPath": "/static/img/tabbar/home_active_orange_all.png",
                "isDot": false,

                "ico": "home-capsule",
                "selectedIco": "home-capsule-fill",
                "icoSize": "1.8",
                "icoSizeUnit": "rem",
            },
            {
                // "pagePath": "/pages/course/index/index", // 老版本的
                "pagePath": "/pages/course/personal/index", // 最新的
                "navigate": false,
                "action": "",
                "text": "课程",
                "iconPath": "/static/img/tabbar/course.png",
                "selectedIconPath": "/static/img/tabbar/course_active_orange_all.png",

                "ico": "calendar",
                "selectedIco": "calendar-fill",
                "icoSize": "1.8",
                "icoSizeUnit": "rem",
            },
            {
                "pagePath": "/pages/mini/scan/index",
                "navigate": true,
                "action": "scanCode",
                "text": "开门",
                "iconPath": "",
                "selectedIconPath": "/static/img/tabbar/bbs_active_orange_all.png",
                "isDot": true,
                "ico": "scan",
                "selectedIco": "scan",
                "icoSize": "1.8",
                "icoSizeUnit": "rem",
            },

            {
                "pagePath": "/packageA/pages/myCourse/index/index",
                "navigate": true,
                "action": "",
                "text": "日程",
                "iconPath": "/static/img/tabbar/shop.png",
                "selectedIconPath": "/static/img/tabbar/shop_active_orange_all.png",
                "isDot": true,

                "ico": "clock",
                "selectedIco": "clock-fill",
                "icoSize": "1.8",
                "icoSizeUnit": "rem",

                "coachPath": "/pages/coach/home/schedule/index", //教练中心地址，不为空则需要验证身份,暂时放在集训营中来测试
            },

            {
                "pagePath": "/pages/user/home/index",
                "navigate": false,
                "action": "",
                "text": "我的",
                "iconPath": "/static/img/tabbar/my.png",
                "selectedIconPath": "/static/img/tabbar/my_active_orange_all.png",
                //"verify": true, //是否验证  （如登录）
                "num": 0,
                //"isDot":true,
                "coachPath": "/pages/coach/home/index/index", //教练中心地址，不为空则需要验证身份,暂时放在集训营中来测试


                "ico": "my-circle",
                "selectedIco": "my-circle-fill",
                "icoSize": "1.8",
                "icoSizeUnit": "rem",


            }
        ],
        //教练中心菜单
        coachTabBar: [{
                "action": "",
                "navigate": false,
                "pagePath": "/pages/coach/home/scheduleTable/index",
                "text": "课表",
                "name": 'deploy',
                "activeName": 'deploy-fill',
            },
            {
                "action": "",
                "navigate": false,
                "pagePath": "/pages/coach/home/schedule/index",
                "text": "日程",
                "name": 'calendar',
                "num": 0,
                "activeName": 'calendar-fill',
                "hump": false,
            },
            {
                "action": "scanCode",
                "navigate": false,
                "pagePath": "/pages/mini/scan/index",
                "text": "开门",
                "name": 'qr-code',
                "activeName": 'qr-code',
                "iconSize": '80',
                "hump": true,
            },
            {
                "action": "",
                "navigate": false,
                "pagePath": "/pages/coach/home/message/index",
                "text": "消息",
                "name": 'message',
                "activeName": 'message-fill',
                "num": 0,
                "hump": false,
                "isDot": false
            },
            {
                "action": "",
                "navigate": false,
                "pagePath": "/pages/coach/home/index/index",
                "text": "我的",
                "name": 'my',
                "activeName": 'my-fill',
                "num": 0,
                "isDot": false,
                "verify": false,
            }
        ],
    },

    //系统MAC,只是计算，但是无用
    getMac(_systemInfo = null) {
        var _mac = wx.getStorageSync('MAC');
        if (_mac && !util.isNull(_mac)) {
            this.globalData.MAC = _mac;
            return _mac;
        } else {

            if (!this.globalData.MAC || util.isNull(this.globalData.MAC)) {
                let systemInfo = _systemInfo;
                if (!systemInfo || util.isNull(systemInfo)) {
                    systemInfo = wx.getSystemInfoSync();
                }
                //md5(model+system+screenWidth+screenHeight+pixelRatio) 尽量保证唯一
                let _mac = systemInfo.model + systemInfo.system + systemInfo.screenWidth + systemInfo.screenHeight + systemInfo.pixelRatio;
                _mac = _mac.toLowerCase().replace(/\s+/g, ""); //转小写 去空格
                let md5MAC = md5util.md5(_mac);
                this.globalData.MAC = md5MAC;
                wx.setStorageSync('MAC', md5MAC); //终端MAC 唯一
                return md5MAC;
            } else {
                wx.setStorageSync('MAC', this.globalData.MAC);
                return this.globalData.MAC;
            }
        }

    },
    //#endregion 获取用户openid END
    getOpenID(unprivacy = false) {
        let _this = this;
        return new Promise((resolve, reject) => {
            if (unprivacy) {
                resolve("unprivacy"); //返回OPENID为unprivacy，表示用户未授权
            }

            var uCache = wx.getStorageSync('USERID'); //用户OPENID加密
            var isCoach = wx.getStorageSync('ISCOACH'); //不为空就是教练，是他的OPENGID
            if (uCache && !util.isNull(uCache)) {
                resolve(uCache);
            } else {
                wx.login({
                    success: function (res) {
                        if (res.code) {
                            _this.globalData.code = res.code; //登录凭证
                            //2、调用获取用户信息接口
                            wx.getUserInfo({
                                success: function (res) {
                                    if (res.encryptedData && res.iv) {
                                        _this.globalData.encryptedData = res.encryptedData
                                        _this.globalData.iv = res.iv
                                        let timestamp = (new Date()).valueOf();
                                        axios.get(DecodeUserURL, {
                                            encryptedData: _this.globalData.encryptedData, //res.encryptedData,
                                            iv: _this.globalData.iv, //res.iv,
                                            code: _this.globalData.code,
                                            //认证区
                                            TIMESTAMP: timestamp,
                                            FKEY: md5util.md5(_this.globalData.code + '' + timestamp + _this.globalData.APP_INTF_SECRECT)
                                        }, {
                                            headers: {
                                                "Content-Type": 'applciation/json'
                                            },
                                            interceptors: {
                                                request: false, //是否经过请求拦截
                                                response: false //是否经过向应拦截,在错误码正常情况下不起作用，只是不验证如401等
                                            }
                                        }).then((res) => {
                                           if (typeof res != 'object') {
                                                reject("【APPJS】getOpenID AXIOS IS NOT OBJECT")
                                            }

                                            if (res.data.code == 1) {
                                                wx.setStorageSync(TOKEN_LOCAL_STORAGE, res.data.token); //统刷KEN
                                                wx.setStorageSync('USERID', res.data.openidencode); //用户OPENID加密
                                                wx.setStorageSync('MOBILE', res.data.mobile); //是否有手机号,没有就是网站客人

                                                if (!util.isNull(res.data.isCoach) && isCoach != res.data.isCoach) //是教练则写入
                                                {
                                                    wx.setStorageSync('ISCOACH', res.data.isCoach);
                                                }

                                                resolve(res.data.openidencode);
                                            }
                                        }).catch((err) => {
                                            if (err.statusCode != 200) {
                                                reject("【APPJS】getOpenID AXIOS status err " + err.statusCode)
                                            } else {
                                                reject();
                                            }
                                        });
                                    } else {
                                        reject("【APPJS】getOpenID wx.getUserInfo 获取 encryptedData 和 IV 为空")
                                    }
                                },
                                fail: function () {
                                    reject("【APPJS】getOpenID wx.getUserInfo fail")
                                }
                            })
                        } else {
                            reject("【APPJS】getOpenID wx.login err" + r.errMsg)
                        }
                    },
                    fail: function () {
                        reject("【APPJS】getOpenID wx.login fail")
                    }
                })
            }
        })
    }
    //#endregion 获取用户openid END

})
