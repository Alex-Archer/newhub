const app = getApp();
const logs = require("../../../utils/logs"); 
const version = require('../../../config').version;
import _ from '../../../libs/we-lodash'
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';

var md5util = require('../../../utils/md5.js')
var util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    agreeClick:false, //隐私是点击过的，不管是否同意的 
    globalURL: app.globalData.globalURL,

    version:version,
    uOpenID: null,
    loginShow: false, //登录窗

    tourist:true,//游客
    user: {
      nickname: null,
      mobile: null,
      headimgurl: null,
      //姓别sex:0=未设置，1=男，2=女
      // vip: 0, //0普通 1 VIP

      vipName:'',
      vipExpireTime:0,//会员 到期时间
      vipExpireTimeStr:'',//会员 到期时间 

    },
    msg_badge:0,//右上角消息数指示点
    firstEdit:false,//是否是第一次修改 //头像那是否有修改图标，仅头像为空时显示
    oldToken : wx.getStorageSync('Token'),//用于比较是否登录页过来


    msg_count: 0, //信息数
    thought_count: 0, //关注数
    fans_count: 0, //粉丝数
    love_count: 0, //点赞数
    order_count: 0, //定单数

    integral:0,//瑜伽币
    

    card: [{
        title: {
          text: "今日运动",
          color: "#ffffff"
        },
        tag: {
          text: ">",
          color: "#ffffff"
        },
        header: {
          bgcolor: "#fc9a62",
          line: true
        }
      },
      {
        title: {
          text: "身体数据",
          color: "#000000"
        },
        tag: {
          text: ">",
          color: "#000000"
        }
      }
    ],

    //以上青青给
    flag: true, //首页加载动画
    tabbarShow: true, //底部菜单不与其它冲突默认关闭

    indexPage: false, //是否在首页，tabbar和别人不一样
    indexBackToTop: false, //是否返回顶部
    current: 4, //tabbar 默认选中的项
    //底部按钮 在首页有效果时 与 indexPage合用,并把第一个首页隐掉
    tabBar: app.globalData.tabBar,
    safeAreaBottom: app.globalData.safeAreaBottom,

    gifSetting: {
      shake: false, // 是否开启下拉震动
      height: 80,
      background: {
        color: '#eeeeee',
        img:app.globalData.globalURL+'/miniprogram/loading_top.gif?v=202309192303'
      },
    },
  },
  agree(e){
    this.setData({
        agreeClick:true //隐私是点击过的，不管是否同意的
    },()=>{
        this.showMask(); //显示加载层 移AGREE中去
        this.loadDefault();
    })


  },
  disagree(e){
    util.toast("您将以游客身份浏览！")

    this.setData({
        agreeClick:true //隐私是点击过的，不管是否同意的
    },()=>{
        this.showMask(); //显示加载层 移AGREE中去
        this.loadDefault(true);
    })

  },
  //转 消息中心
  goMSG() {
    wx.navigateTo({
      url: '/packageA/pages/msg/index/index',
    })
  },
  //转设置中心
  goSetting() {
    wx.navigateTo({
      url: '/packageA/pages/Setting/index/index',
    })
  },
  gohead() {
    wx.navigateTo({
      url: '/pages/store/navbar-header/navbar',
    })

  },
  // 加载层显示
  showMask: function () {
    this.setData({
      flag: false,
      // tabbarShow: false
    })
  },
  closeMask: function () {
    this.setData({
      flag: true,
      // tabbarShow: true
    })
  },
  //数据有误，点击加载页面重新加载
  maskTapOnLoad() {
    this.onLoad();
  },
  loadDefault(unprivacy=false) {
    let _this = this;
    let timestamp = (new Date()).valueOf();
    //#region  拉取用户OPENID后加载首页数据
    app.getOpenID(unprivacy).then(resOpenID => {
      _this.setData({
        uOpenID: resOpenID
      })

      axios.get("/User/indexPub", { //首页数据获取 1.公共数据  页：/User/indexPub2 可以测试手机为FLASH
        userID: unprivacy?resOpenID:wx.getStorageSync('USERID'),//有未授权的浏览
        thisPage: "home",
        TIMESTAMP: timestamp,
        FKEY: md5util.md5("home" + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }, {
        headers: {
          "Content-Type": 'applciation/json',
          //"Authorization": "Bearer 3aa501cd651945a9b4829ae166fca518"
        },
        interceptors: {
          request: false, //是否经过请求拦截
          // response: true 
        },
        
        validateStatus(status) {
          return status === 200;
        },
      }).then(res => {

        let _resdata = res.data;
        if (_resdata.code == 1) { //开始处理

          let obj = this.data.tabBar;
          let _dataUser = _resdata.data.user;
          let _notice = _dataUser.notice;//消息体
          
          const total = _.sum(_.values(_notice));

          //更新个人信息
          let isLogin = wx.getStorageSync("LOGING");//用加密的用户OPENID 暂时不加密
          let tokenCache = wx.getStorageSync("Token");//用加密的用户OPENID 暂时不加密
          let _nickname = _dataUser.nickname;
          let _headimgurl = _dataUser.headimgurl;
          let _firstEdit = false;


          if(util.isNull(isLogin)|| isLogin!="true"||util.isNull(tokenCache)||util.validateDateExpires(tokenCache.refreshexpires))//定为游客
          {
            _nickname ="游客";
            _headimgurl = app.globalData.globalURL+"/miniprogram/url-img/my/mine_def_touxiang_3x.png"; 
            _firstEdit =false;
            
          }else{
            if (util.isNull(_headimgurl)) {
              _headimgurl = app.globalData.globalURL+"/miniprogram/url-img/my/mine_def_touxiang_3x.png"; 
              _firstEdit = true;
            }else{
              _firstEdit = false;
            }
          }

          if (util.isNull(_nickname)) {
            _nickname = _dataUser.username;
          }
          let _mobile = _dataUser.mobile;
         let _vipName = _dataUser.vipName;
         let _vipExpireTime = _dataUser.vipExpireTime;

          //消息大于99个就显示红点
          //let user_msg_count = _notice.user_msg; 
          
          if(_nickname!=='游客')
          {
            _.set(obj, '[4].num', total) ;//tb[3]["num"]=9; 同理
            if(total > 0 && total < 100 ){
                           
                _.set(obj, '[4].isDot', false) ;//tb[3]["num"]=9; 同理
            }
            if(total >= 100 ){
                
                _.set(obj, '[4].isDot', true)//tb[3]["num"]=9; 同理
            }
            _this.setData({
            
                tabBar: obj, 
                msg_badge:total,//右上角消息点点
              })
          }

         
          _this.setData({
            ['user.nickname']: _nickname, //多维数组要这样更新
            ['user.mobile']: _mobile, //多维数组要这样更新  
            ['user.headimgurl']: _headimgurl, //多维数组要这样更新     
            ['user.vipName']: _nickname!=='游客'?_vipName:'普通游客', // 
            ['user.vipExpireTime']: _nickname!=='游客'?_vipExpireTime:0, //   
            ['user.vipExpireTimeStr']: _nickname!=='游客'&&_vipExpireTime>0?util.formatDate('y-m-d',_vipExpireTime,2,false):'',

            integral:_nickname!=='游客'?util.formatFans(_dataUser.integral):0,//瑜伽币
            thought_count: _nickname!=='游客'?util.formatFans(_dataUser.thought_count):0, //关注数
            fans_count: _nickname!=='游客'?util.formatFans(_dataUser.fans_count):0, //粉丝数
            love_count: _nickname!=='游客'?util.formatFans(_dataUser.love_count):0, //点赞数

            tourist:_nickname==='游客'?true:false,



            firstEdit:_firstEdit,//头像那是否有修改图标，仅头像为空时显示
          })
          //隐藏加载动画
          _this.setData({
            flag: true,
            // tabbarShow: true
          })




        } else {
          util.toast(res.data.message + " 点击页面重新加载")
        }
      }).catch(err => {
        util.toast("请求出错[" + err + "] 点击页面重新加载")

      })
    }).catch((err) => {

    })
    //#endregion 拉取用户OPENID后加载首页数据END




  },
  //用户已登，则获取个人信息
  getUserInfo() {
    //测试私有获取
    let _timestamp = (new Date()).valueOf();
    axios.get("/User/index", { //首页数据获取 1.公共数据
      userID: wx.getStorageSync('USERID'),
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    }, {
      headers: {
        "Content-Type": 'applciation/json',
        //"Authorization": "Bearer 3aa501cd651945a9b4829ae166fca518"
      },
      
      validateStatus(status) {

        return status === 200;
      },
    }).then(res => {
      // 成功之后做些什么
      
    }).catch((err) => {
      // 失败之后做些什么
    });
  },
  //底部登录窗的确认按钮
  confirm(e) {
    //{"type":"confirm","timeStamp":5935,"target":{"id":"","dataset":{}},"currentTarget":{"id":"","dataset":{}},"mark":{},"detail":{"headimgurl":"/static/urlimg/hqq/icon-nickphoto.png","nickname":"5byg546J"},"mut":false} 
    let that = this;
    let _headimgurl = e.detail.headimgurl; //"http://tmp/Xea9DMqwtrFl03ac6f5916951a3e54ae39b03f863849.jpeg"
    let _nickname = e.detail.nickname;

    //查看头像有没有修改
    let uploadFile = 0; //1表示有图片要上传 0表示没修改头像
    if (_headimgurl.indexOf("wxfile://") < 0 && _headimgurl.indexOf("http://tmp/") < 0) {
      uploadFile = 0;
    } else {
      uploadFile = 1;
    }

    //#region  上传图片
    new Promise((resolve, reject) => {
      var timestamp = (new Date()).valueOf();
      //uploadFile
      if (uploadFile == 0) {
        let config = {
          header: {
            mac: app.getMac(),
            uid: wx.getStorageSync('USERID')
          },
          
          validateStatus: function (status) {
            return status.statusCode == 200 ? true : false; //状态码不等于200的都会进入catch error回调
          }

        };
        let data = {
          userID: wx.getStorageSync('USERID'),
          nickName: _nickname,
          uploadFile: 0, //0,
          TIMESTAMP: timestamp,
          FKEY: md5util.md5(wx.getStorageSync('USERID') + timestamp.toString() + wx.getStorageSync('OAUTH'))
        }

        axios.post("/api/User/modifyFaceAndName", data, config)
          .then(function (res) {
            resolve(res.data);

          })
          .catch(function (err) {

            if (!err && !util.isNull(err) && err.statusCode != 200) {
              reject(err)
            }
          });
      } else {
        //有图片 微信上传
        wx.uploadFile({
          url: "https://aoben.kshot.com/api/User/modifyFaceAndName",
          header: {
            mac: app.getMac(),
            uid: wx.getStorageSync('USERID'),
            "Content-Type": "multipart/form-data"
          },
          formData: {
            userID: wx.getStorageSync('USERID'),
            nickName: _nickname,
            uploadFile: uploadFile, //0,
            TIMESTAMP: timestamp,
            FKEY: md5util.md5(wx.getStorageSync('USERID') + timestamp.toString() + wx.getStorageSync('OAUTH'))
          },
          filePath: _headimgurl,
          name: 'file',
          success: function (res) {
            let d = JSON.parse(res.data.replace(/\ufeff/g, "") || "{}")
            resolve(d)

          },
          fail: function (res) {
            reject(res)
          }
        })
      }
    }).then(val => {
      if (val.code == 1) {
        that.setData({
          ['user.nickname']: val.nickname //多维数组要这样更新         
        })
        if (val.headimgurl && !util.isNull(val.headimgurl)) {
          that.setData({
            ['user.headimgurl']: val.headimgurl //多维数组要这样更新    
          })
        }
      } else {}
      //}
      this.onClose();


    }).catch(err => {
      this.onClose();
    })

    //#endregion 上传图片END



  },

  onClose() {
    let that = this;
    that.setData({
      loginShow: false,
      // tabbarShow: true
    })
  },
  //底部登录窗END

  //会员组别点击
  jumpLevel(e){
    wx.navigateTo({
      // url: '/pages/user/level/index',//旧
      url: '/packageB/pages/Member/level/index',
    })


  },


  //跳到设置里的
  toJumpUser(e) {
    wx.navigateTo({
      url: '/packageA/pages/Setting/userInfo/index',
    })
  },
  
  topJump(e) {
    let _this = this;
    let _dataset = e.currentTarget.dataset;

    let _islogin = _dataset.islogin;
    let _navigate = _dataset.navigate;
    let _url = _dataset.url;
    if (_islogin) {
      //检测用户头像、昵称、手机
        let _uMobile = wx.getStorageSync('MOBILE');
      if (!_uMobile || util.isNull(_uMobile)) {
        wx.navigateTo({
          url: '/pages/user/login/index',
        })
        return;


      } else {
        if (_navigate) {
          wx.navigateTo({
            url: _url,
          })
        } else {
          wx.reLaunch({
            url: _url
          })
        }
      }




    } else {
      if (_navigate) {

        wx.navigateTo({
          url: _url,
        })
      } else {
        wx.reLaunch({
          url: _url
        })
      }
    }


  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

    //#region 检测是否是登录后过来的，如果是要更新基本的如头像昵称
    let that = this;
    let oldToken = that.data.oldToken;
    let newToken = wx.getStorageSync('Token');

    if(util.isNull(oldToken)){
      if(util.isNull(newToken)){
        return true;
      }else{//原来没登，但是现在登了
        that.setData({
          oldToken:newToken
        })
        this.loadDefault();
      }
    }
    // 创建两个 Date 对象
    const time1 = new Date(oldToken.refreshexpires); 
    const time2 = new Date(newToken.refreshexpires);
    //比较两个刷新时间
    if(time1.getTime()!==time2.getTime())
    {
      that.setData({
        oldToken:newToken
      })
      this.loadDefault();
    }else{
      return true;
    }
    //#endregion 检测是否是登录后过来的，如果是要更新基本的如头像昵称
    

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.indexLoadmore();
  },
  //=========================================
  //绑定 上拉加载更多
  indexLoadmore: function () {

  },
  //滚动动作,超过一定高度显示吸顶
  indexScroll: function (e) {

  },
  //下拉刷新
  indexRefresh: function () {
    const that = this;
    that.setData({
      flag: false,
      // tabbarShow: false
    });
  },
  //下拉结束
  indexRestore: function () {
    let that = this;
    that.loadDefault();

    that.setData({
      flag: true,
      // tabbarShow: true
    });

    //上面的移过来的，必须在flag: true 后再用，不然找不到节点this.selectComponent('#index-scroller')
    const scroll = this.selectComponent('#index-scroller');
  },
  
 // 底部菜单点击
 tabbarSwitch(e) {
    //{"index":4,"pagePath":"/pages/my/my","verify":true}
    console.log('点击E:', JSON.stringify(e))
    let _action = e.detail.action||"";//scanCode 为调用扫码
    let _navigate = e.detail.navigate||false;
    let isLogin = false;
    //"coachPath":"/pages/coach/home/index/index",//教练中心地址，不为空则需要验证身份,暂时放在集训营中来测试
    if (e.detail.verify && !isLogin) {
      wx.showToast({
        title: '您还未登录，请先登录',
        icon: "none"
      })
    } else {
      if(_action=="scanCode")
      {
          //https://developers.weixin.qq.com/miniprogram/dev/api/device/scan/wx.scanCode.html
          wx.scanCode({
            onlyFromCamera: false, //禁止相册
            scanType: ['qrCode'], //只识别二维码
            success: (res) => {
                wx.showLoading();
                // 获取到扫描到的二维码内容
                const qrCodeContent = res.result;
                //https://yoga.aoben.yoga/s=door&param=mac
                //1.必须有网址
                //2.必须有参数s
                //3.必须有参数param
                const arrUrl=app.globalData.scanURL;
                const found = qrCodeContent.indexOf(arrUrl) > -1;
                if(!found){
                    wx.showToast({
                        title: '啥都不是，不处理',
                        icon: 'none'
                    })
                    return
                }
                let _action=util.getURLParam(qrCodeContent,"s");
                let _actionTitle="";
                switch(_action)
                {
                    case "door"://开门 https://yoga.aoben.yoga/s=door&param=mac
                        _actionTitle="开门动作";
                        break;
                    case "getpass"://获取用户密码 https://yoga.aoben.yoga/s=getpass&param=MAC
                        _actionTitle="获取用户密码";
                        break;
                    case "cabinet"://开柜 https://yoga.aoben.yoga/s=cabinet&param=mac
                        _actionTitle="开柜";
                        break;            
                    case "coach"://教练分享 https://yoga.aoben.yoga/s=coach&param=2,str
                        _actionTitle="教练分享码";
                        break;
                    case "sign"://用户签到 https://yoga.aoben.yoga/s=sign&param=2,str
                        _actionTitle="用户签到";
                        break;            
                    default://啥都不是
                        _actionTitle="啥都不是";
                        break;
                }

                //联网去处理
                wx.showToast({
                    title: _actionTitle,
                    icon: 'none'
                })
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
      let _coachPath = e.detail.coachPath||"";//教练中心地址，不为空则需要验证身份,暂时放在集训营中来测试
      if(!util.isNull(_coachPath)&&!util.isNull(wx.getStorageSync('ISCOACH')))
      {
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




  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },


  //其它更新返回
//其它更新返回
callBackReturn(_object) {
    //{"headimgurl":"https://temp-.....a589a0a8d9ee.jpg","nickname":"弓长23"} 
    let that = this;
    if(!util.isNull(_object)){
        if(_object.headimgurl!=that.data.user.headimgurl){
            that.setData({
                ['user.headimgurl']:_object.headimgurl
            })
        }
        if(_object.nickname!=that.data.user.nickname){
            that.setData({
                ['user.nickname']:_object.nickname
            })
        }
    }
},

//#region  菜单区
NavigateTo(e){
  let _url = e.currentTarget.dataset.href||e.target.dataset.href;
  if(util.isNull(_url))
  {
    return;
  }
  wx.navigateTo({
    url: _url,
  })
},

//#endregion   菜单区
detailShow(e) {
  let _cla = e.currentTarget.dataset.cla||e.target.dataset.cla||0;
  if(util.isNull(_cla)||_cla==0)
  {
    return;
  }
  wx.navigateTo({
    url: '/packageB/pages/card/detailShow/index?cla='+_cla,
  })
},
})