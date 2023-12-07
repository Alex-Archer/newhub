const app = getApp();
const logs = require('../../utils/logs.js'); //日志打印
const QQMapWX = require('../../libs/qqmap-wx-jssdk.1.2.js');
import {
  _,
  includes,
  findIndex
} from '../../libs/we-lodash';

var md5util = require('../../utils/md5.js')
var util = require('../../utils/util.js')
var apis = require('../../utils/apis.js')


Page({
  data: {

    containerTop: app.globalData.platform == 'android' ? "65rpx" : '100rpx', //安卓 苹果不一样
    //轮播主件
    topBanner: [
      app.globalData.globalURL + "/miniprogram/url-img/banner.png?v=202311271721",
      app.globalData.globalURL + "/miniprogram/url-img/banner.png?v=202311271721",
      app.globalData.globalURL + "/miniprogram/url-img/banner.png?v=202311271721"
    ],

    qrShow: false,
    agreePrivacy: false, //是否同意了隐私
    vipExpireTime: 0, //会员 到期时间


    globalURL: app.globalData.globalURL,

    isAddedToMyMiniProgram: true, //用户是否添加至我的小程序 控制一段时间只弹一次,默认不显示

    uOpenID: null,
    baseURL: app.globalData.globalURL,
    backgroundImage: app.globalData.globalURL + "/miniprogram/url-img/bg.png",
    bannerImage: app.globalData.globalURL + "/miniprogram/url-img/banner.png",

    // flag: false, //首页加载动画 默认false
    loadingMask: false, //首页加载动画 默认true 与 隐私保护冲突
    tabbarShow: true, //底部菜单不与其它冲突默认关闭
    tabbarZIndex: 9,

    indexPage: true, //是否在首页，tabbar和别人不一样
    indexBackToTop: false, //是否返回顶部
    current: -1, //tabbar 默认选中的项
    //底部按钮 在首页有效果时 与 indexPage合用,并把第一个首页隐掉
    tabBar: _.drop(app.globalData.tabBar), //移除第一个元素

    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
      ,
    gifSetting: {
      shake: true, // 是否开启下拉震动
      height: 70,
      background: {
        color: '#eeeeee',
        img: app.globalData.globalURL + '/miniprogram/loading_top.gif?v=202309192303'
      },
    },
    scrollTop: 0,

    positionLandscape: 1,
    landscapeClosable: false,
    showLandscape: false,

    //轮播主件
    banner: [
      app.globalData.globalURL + "/miniprogram/url-img/banner/index/1.jpg",
      app.globalData.globalURL + "/miniprogram/url-img/banner/index/2.jpg",
      app.globalData.globalURL + "/miniprogram/url-img/banner/index/3.jpg",
      app.globalData.globalURL + "/miniprogram/url-img/banner/index/4.jpg",
      app.globalData.globalURL + "/miniprogram/url-img/banner/index/5.jpg"
    ],
    currentBanner: 0,

    Location: null,
    locationDistance: "0",

    qqmapsdk: app.globalData.MapQQ.MapSDK,
    key: app.globalData.MapQQ.MapKey,
    lat: app.globalData.MapQQ.lat,
    lng: app.globalData.MapQQ.lng, //默认市政府

    showPrivacy: false,
    buttons: [{
        text: '拒绝'
      }
      // , {
      //   text: '同意',
      //   color: '#586c94'
      // }
    ],

    //测试区
    pageContainerShow: false,
    duration: 300,
    position: 'right',
    round: false,
    overlay: true,
    customStyle: '',
    overlayStyle: '',

    onHide: false,
  },
  qrClose(e) {
    this.setData({
      qrShow: false,
      //tabbarShow:true,
      tabbarZIndex: 9999
    })
  },
  showQR(e) {
    this.setData({
      qrShow: true,
      //tabbarShow:false,
      tabbarZIndex: 9,
    })

  },
  agree(e) {
    console.log("用户同意隐私授权, 接下来可以调用隐私协议中声明的隐私接口")
    this.setData({
      agreePrivacy: true,
      loadingMask: true,
      //tabbarShow: true,
      tabbarZIndex: 9,
    }, () => {
      this.initOnLoad();
    })
    new Promise(() => {
      //本地定位
      const _location = wx.getStorageSync('Location'); //this.data.Location||
      this.data.qqmapsdk = new QQMapWX({
        key: this.data.key
      });
      //本地无
      if (util.isNull(_location)) {
        this.setData({
          Location: {
            "title": "请选择服务门店",
            "lat": 0,
            "lng": 0,
            "address": "选择默认门店可获更优服务"
          },
          locationDistance: "0",
        })
      } else {
        this.getLocation().then(val => {
          this.getDistance(val[0], val[1], _location.lat, _location.lng).then(res => {
            this.setData({
              Location: _location,
              locationDistance: res
            })
          }, function (err) {
            this.setData({
              Location: _location,
              locationDistance: "0"
            })
          });

        })
      }
    })

  },
  disagree(e) {
    util.toast("您将以游客身份浏览！")
    this.setData({
      // locationDistance:"未授权",
      agreePrivacy: false,
      loadingMask: false,
      tabbarZIndex: 9999
    }, () => {
      this.initOnLoad(true);
    })

    new Promise(() => {
      //本地定位
      const _location = wx.getStorageSync('Location'); //this.data.Location||
      this.data.qqmapsdk = new QQMapWX({
        key: this.data.key
      });
      if (util.isNull(_location)) {
        this.setData({
          Location: {
            "title": "请选择服务门店",
            "lat": 0,
            "lng": 0,
            "address": "请同意隐私协议方便导航定位"
          },
          locationDistance: "0",
        })
      } else {
        _.set(_location, 'address', '未授权隐私协议')
        this.setData({
          Location: _location,
          locationDistance: "0",
        })
      }
    })


  },


  //测式区
  exit() {
    this.setData({
      pageContainerShow: false
    })
    // wx.navigateBack()
  },
  //右弹入，暂关
  popup() {
    return;
    this.setData({
      pageContainerShow: true
    })

  },
  //测式区END


  //人物下4大菜单
  goToPage(e) {

    let _url = e.target.dataset.url || e.currentTarget.dataset.url;
    if (_url) {
      wx.reLaunch({
        url: _url,
      })
    }

  },
  //人物下4大菜单
  navPage(e) {

    logs.log("", e, true);
    let _url = e.target.dataset.url || e.currentTarget.dataset.url;
    if (_url) {
      wx.navigateTo({
        url: _url,
      })
    }

  },

  accountClick() {
    wx.navigateTo({
      url: '/packageB/pages/card/index/index',
    })
  },

  //banner 轮播主件
  change: function (e) {
    this.setData({
      currentBanner: e.detail.current
    })
  },
  detail: function () {
    wx.navigateTo({
      url: '../productDetail/productDetail'
    })
  },
  //banner 轮播主件END


  //数据有误，点击加载页面重新加载
  maskTapOnLoad() {
    this.onLoad();
  },
  //加载初始
  initOnLoad(unprivacy = false) {
    new Promise(() => {
      let _this = this;
      app.getOpenID(unprivacy).then(resOpenID => {

        let timestamp = (new Date()).valueOf();
        let _config = {
          userID: resOpenID,
          thisPage: "index",
          TIMESTAMP: timestamp,
          FKEY: md5util.md5("index" + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        }

        apis.get('/Index/indexPub', _config, {
          "Content-Type": 'applciation/json'
        }, false).then(val => {
          let tabBarObj = this.data.tabBar;

          if (!util.isNull(val.notice) && val.notice.user_msg > 0) {
            _this.setData({
              uOpenID: resOpenID,
              //flag: true,
              loadingMask: false,
              //tabbarShow: true
              tabbarZIndex: 9999,
              vipExpireTime: val.vipExpireTime,
              tabBar: val.notice.user_msg < 100 ? _.set(tabBarObj, '[3].num', val.notice.user_msg) : _.set(tabBarObj, '[3].isDot', true)
            })
          } else {
            _this.setData({
              uOpenID: resOpenID,
              //flag: true,
              loadingMask: false,
              //tabbarShow: true
              tabbarZIndex: 9999,
              vipExpireTime: val.vipExpireTime
            })
          }


        }, function (err) {
          util.toast(err)
          _this.setData({
            uOpenID: resOpenID,
            //flag: true,
            loadingMask: false,
            // tabbarShow: true
            tabbarZIndex: 9999,
          })
        });



      }).catch((err) => {

      })
      //#endregion 拉取用户OPENID后加载首页数据END
    })



  },

  onLoad(options) {
    let _this = this;
    //#region  弹窗小提示，如果MSG不为空
    //'/packageA/pages/myCourse/index/index?msg='+encodeURIComponent("约课成功"),
    new Promise(() => {
      let _msg = options.msg || '';
      if (!util.isNull(_msg)) {
        util.toast(decodeURIComponent(_msg));
      }
    })
    //#endregion 弹窗小提示，如果MSG不为空

    //#region  异步 检查小程序是否被添加至 「我的小程序」
    new Promise((resolve, reject) => {
      // 获取上次检查时间
      const lastCheckMyMiniProgram = wx.getStorageSync('lastCheckMyMiniProgram')
      // 和当前时间对比
      const now = Date.now()
      const oneDay = 1000 * 60 * 60 * 24; //一天
      if (util.isNull(lastCheckMyMiniProgram) || now - lastCheckMyMiniProgram > oneDay) {
        resolve(now); //大于一天了，去检测
      }
    }).then(val => {
      wx.setStorageSync('lastCheckMyMiniProgram', val); // 更新时间戳
      wx.checkIsAddedToMyMiniProgram({
        success: function (res) {
          if (res.isAdded) {
            // 小程序已被添加到微信
            _this.setData({
              isAddedToMyMiniProgram: true
            })
          } else {
            // 小程序未被添加到微信  
            _this.setData({
              isAddedToMyMiniProgram: false
            })
          }
        }
      })
    })
    //#endregion  异步 检查小程序是否被添加至 「我的小程序」 END


  },

  // 底部菜单点击
  tabbarSwitch(e) {

    let _action = e.detail.action || ""; //scanCode 为调用扫码
    let _navigate = e.detail.navigate || false;
    let isLogin = false;


    if (e.detail.verify && !isLogin) {
      wx.showToast({
        title: '您还未登录，请先登录',
        icon: "none"
      })
    } else {
      if (_action == "scanCode") {
        //https://developers.weixin.qq.com/miniprogram/dev/api/device/scan/wx.scanCode.html
        wx.scanCode({
          onlyFromCamera: false, //禁止相册
          scanType: ['qrCode'], //只识别二维码
          success: (res) => {
            wx.showLoading();
            // 获取到扫描到的二维码内容
            const qrCodeContent = res.result;
            // logs.log("11111111111扫码内容",qrCodeContent,true)
            //https://yoga.aoben.yoga/s=door&param=mac
            //1.必须有网址
            //2.必须有参数s
            //3.必须有参数param
            // const arrUrl="https://yoga.aoben.yoga";
            const arrUrl = app.globalData.scanURL;
            const found = qrCodeContent.indexOf(arrUrl) > -1;
            // logs.log("2222222是否有网址",found.toString(),true);
            if (!found) {
              wx.showToast({
                title: '啥都不是，不处理',
                icon: 'none'
              })
              return
            }
            let _action = util.getURLParam(qrCodeContent, "s");
            let _actionTitle = "";
            switch (_action) {
              case "door": //开门 https://yoga.aoben.yoga/s=door&param=mac
                _actionTitle = "开门动作";
                break;
              case "getpass": //获取用户密码 https://yoga.aoben.yoga/s=getpass&param=MAC
                _actionTitle = "获取用户密码";
                break;
              case "cabinet": //开柜 https://yoga.aoben.yoga/s=cabinet&param=mac
                _actionTitle = "开柜";
                break;
              case "coach": //教练分享 https://yoga.aoben.yoga/s=coach&param=2,str
                _actionTitle = "教练分享码";
                break;
              case "sign": //用户签到 https://yoga.aoben.yoga/s=sign&param=2,str
                _actionTitle = "用户签到";
                break;
              default: //啥都不是
                _actionTitle = "啥都不是";
                break;
            }

            //联网去处理
            // wx.showToast({
            //     title: _actionTitle,
            //     icon: 'none'
            // })
            util.toast(_actionTitle);
            return;

          },
          fail: (error) => {
            console.log('扫描失败', error);

            // 根据扫描到的内容跳转到对应的页面
            wx.navigateTo({
              url: e.detail.pagePath,
              success: () => {
                console.log('跳转成功');
              },
              fail: (error) => {
                console.log('跳转失败', error);
                wx.showToast({
                  title: '跳转失败，请稍后重试',
                  icon: 'none'
                })
              }
            });
          }
        })
        return;
      }
      //需要判断是否是教练
      let _coachPath = e.detail.coachPath || ""; //教练中心地址，不为空则需要验证身份,暂时放在集训营中来测试
      if (!util.isNull(_coachPath) && !util.isNull(wx.getStorageSync('ISCOACH'))) {
        wx.reLaunch({
          url: _coachPath
        })
        return;
      }

      //其它点击
      if (e.detail.index != this.data.current) {
        if (_navigate) {
          wx.navigateTo({
            url: e.detail.pagePath,
          })

        } else {
          wx.reLaunch({
            url: e.detail.pagePath
          })
        }
      }
    }
  },
  //底部菜单上的返回项部
  indexGoTop() {
    if (this.data.indexBackToTop) {
      //调用 index-scroller 组件的返回顶部命令
      const child = this.selectComponent('#index-scroller');
      child.backToTop();
    }
  },

  //动态改变class为tui-tabbar的组件数据
  //主要用于控制首页那个图标显不显示
  hideHomeBotton(e) {
    this.setData({
      indexBackToTop: true
    })
    const child = this.selectComponent('#tui-tabbar');
    child.showHomeButton(false);
    //console.log('tui-tabbar',child)
  },
  showHomeBotton(e) {
    this.setData({
      indexBackToTop: false
    })
    const child = this.selectComponent('#tui-tabbar');
    child.showHomeButton(true);
    //console.log('tui-tabbar',child)
  },
  //滚动动作,超过一定高度显示吸顶
  indexScroll: function (e) {
    let scrollTop = e.detail.detail.scrollTop;
    this.setData({
      scrollTop
    })
    const child = this.selectComponent('#tui-tabbar');

    if (scrollTop > 50) {
      child.showHomeButton(false);
      this.setData({
        indexBackToTop: true
      })
    } else {
      child.showHomeButton(true);
      this.setData({
        indexBackToTop: false
      })
    }

  },

  //下拉刷新
  indexRefresh: function () {
    const that = this;
    that.setData({
      //flag: false,
      loadingMask: true,
      // tabbarShow: false
    });
  },
  //下拉结束
  indexRestore: function () {
    let that = this;
    that.setData({
      // flag: true,
      loadingMask: false,
      // tabbarShow: true
    });

    //上面的移过来的，必须在flag: true 后再用，不然找不到节点this.selectComponent('#index-scroller')
    const scroll = this.selectComponent('#index-scroller');
  },

  //绑定 上拉加载更多
  indexLoadmore: function () {
    // logs.log("【上拉加载更多】indexLoadmore");
  },
  //压屏广告
  landscapeShow() {
    let position = 1;
    let maskClosable = true;
    this.setData({
      positionLandscape: position,
      landscapeClosable: maskClosable
    }, () => {
      setTimeout(() => {
        this.setData({
          showLandscape: true,
          // tabbarShow: false
        })
      }, 50)
    })
  },
  landscapeClose() {
    this.setData({
      showLandscape: false,
      // tabbarShow: true
    })
  }
  //压屏广告 END

  //地图定位选择操作区====================
  ,
  ToMapList: function (e) {
      wx.navigateTo({
        url: '/pages/map/pointListView/index',
      })
    }
    //更新定位,怎么存储再看
    //https://blog.csdn.net/m0_73341533/article/details/128526712
    ,
  ToPakeList() {
    wx.reLaunch({
      url: '/pages/newpage/index/index',
    })

  },
  changeLocation: function (locationJson, LocationDistance) {

    this.setData({
      Location: locationJson,
      locationDistance: LocationDistance
    })


    //地图定位选择操作区====================END
  },

  //获取当前位置
  getLocation() {
    //当前位置
    return new Promise((resolve, reject) => {
      //H5：使用坐标类型为 gcj02 时，需要配置腾讯地图 sdk 信息（manifest.json -> h5）
      wx.getLocation({
        type: 'gcj02',
        altitude: true,
        success(res) {
          // logs.log("位置getLocation",res,true);
          resolve([res.latitude, res.longitude])
        },
        fail(res) {
          reject();
        }
      });
    });
  },
  /**
   * 计算二点之间的距离
   * @param {*} F_lat 原始点LAT
   * @param {*} F_lng 原始点LNG
   * @param {*} T_lat 到点LAT
   * @param {*} T_lng 到点LNG
   */
  getDistance(F_lat, F_lng, T_lat, T_lng) {
    const _this = this;
    const _qqmapsdk = _this.data.qqmapsdk;
    return new Promise((resolve, reject) => {
      _qqmapsdk.calculateDistance({
        //mode: 'driving',//可选值：'driving'（驾车）、'walking'（步行），不填默认：'walking',可不填
        mode: "walking",
        from: {
          latitude: F_lat,
          longitude: F_lng
        },
        to: "" + T_lat + "," + T_lng + "",
        success: (res) => { //成功后的回调

          let hw = res.result.rows[0].elements[0].distance; //拿到距离(米)
          if (hw && hw !== -1) {
            if (hw < 1000) {
              hw = hw + "m";
            }
            //转换成公里
            else {
              hw = (hw / 2 / 500).toFixed(2) + "km";
            }
          } else {
            //hw = "距离太近或请刷新重试";
            hw = "0m";
          }
          resolve(hw);
          //return hw;
        },
        fail: (error) => {
          reject(error);
        }
      });
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.setData({
      onHide: true,
    })

  },
  onShow() {
    //如果有隐藏再次计算
    if (this.data.onHide) {
      //检查定位变化
      new Promise(() => {
        if (this.data.agreePrivacy) {
          //本地定位
          const _location = wx.getStorageSync('Location'); //this.data.Location||
          this.data.qqmapsdk = new QQMapWX({
            key: this.data.key
          });
          //本地无
          if (util.isNull(_location)) {
            this.setData({
              Location: {
                "title": "请选择服务门店",
                "lat": 0,
                "lng": 0,
                "address": "选择默认门店可获更优服务"
              },
              locationDistance: "0",
            })
          } else {
            this.getLocation().then(val => {
              this.getDistance(val[0], val[1], _location.lat, _location.lng).then(res => {
                this.setData({
                  Location: _location,
                  locationDistance: res
                })
              }, function (err) {
                this.setData({
                  Location: _location,
                  locationDistance: "0"
                })
              });
            })
          }


        } else {

          this.setData({
            Location: {
              "title": "请选择服务门店",
              "lat": 0,
              "lng": 0,
              "address": "请同意隐私协议方便导航定位"
            },
            locationDistance: "0",
          })

        }

      })
      return;
    }
  },


  onShareAppMessage(e) {

    return {
      title: 'aoben shared yoga'
    };

  },
  //用户点击右上角转发到朋友圈
  onShareTimeline(e) {

  },
  //用户点击右上角收藏
  onAddToFavorites(e) {

  },


  //#region  菜单区
  NavigateTo(e) {
    let _url = e.currentTarget.dataset.href || e.target.dataset.href;
    if (util.isNull(_url)) {
      return;
    }
    logs.log("【NavigateTo】", _url, true)
    wx.navigateTo({
      url: _url,
    })
  },

  //#endregion   菜单区
  test() {
    wx.navigateTo({
      url: '/packageB/pages/Member/buyCard/index',
    })
  }
})