const app = getApp();
const logs = require("../../../utils/logs");
import _ from '../../../libs/we-lodash'
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../utils/util.js')
var md5util = require('../../../utils/md5.js') 
var apis = require('../../../utils/apis.js')
Page({
  data: {
    globalURL: app.globalData.globalURL,
    agreeClick:false, //隐私是点击过的，不管是否同意的

    //轮播主件
    banner: [
      app.globalData.globalURL + "/miniprogram/url-img/banner/index/1.jpg",
      app.globalData.globalURL + "/miniprogram/url-img/banner/index/2.jpg",
      app.globalData.globalURL + "/miniprogram/url-img/banner/index/3.jpg",
      app.globalData.globalURL + "/miniprogram/url-img/banner/index/4.jpg",
      app.globalData.globalURL + "/miniprogram/url-img/banner/index/5.jpg"
  ],



    //底部菜单
    flag: false, //首页加载动画
    tabbarShow: true, //底部菜单不与其它冲突默认关闭

    indexPage: false, //是否在首页，tabbar和别人不一样
    indexBackToTop: true, //是否返回顶部
    current: 1, //tabbar 默认选中的项
    //底部按钮 在首页有效果时 与 indexPage合用,并把第一个首页隐掉
    tabBar: app.globalData.tabBar,
    safeAreaBottom: app.globalData.safeAreaBottom,

    //顶部类型选择
    typeScrollInto: '', //选择后运动到的位置
    tabTypeIndex: 2, //顶部大分类 默认认选择项
    typeBars: [
      {
        name: '约私教',
        id: "0",
        path: '/pages/course/personal/index',
      },
      {
        name: '约团课',
        id: "1",
        path: '/pages/course/group/index',
      },
      {
        name: '课程介绍',
        id: "2",
        path: '/pages/newpage/index/index',
      },
      // {
      //   name: '集训营',
      //   id: "4",
      //   path: '/pages/course/camp/index',
      // }
    ],
    //顶部类型选择END
    // 选择默认课程
    clicknum: 0,
    course_id:'',
    course_name:'',
    typeList:[
      // {
      //   id:1,
      //   name: '精选团课',
      //   title:'适合新手入门',
      //   photo:'https://ssl.aoben.yoga/miniprogram/20231127/card-ico1.png?v=202311271722'
      // },
      // {
      //   id:2,
      //   name: '普拉提团课',
      //   title:'有瑜伽基础人群',
      //   photo:'https://ssl.aoben.yoga/miniprogram/20231127/card-ico2.png?v=202311271722'
      // },
      // {
      //   id:3,
      //   name: '集训营',
      //   title:'小班教学 快速高效',
      //   photo:'https://ssl.aoben.yoga/miniprogram/20231127/card-ico3.png?v=202311271722'
      // },
      // {
      //   id:4,
      //   name: '精选私教',
      //   title:'适合所有人群',
      //   photo:'https://ssl.aoben.yoga/miniprogram/20231127/card-ico4.png?v=202311271722'
      // },
      // {
      //   id:5,
      //   name: '导师私教',
      //   title:'轻松易练高效',
      //   photo:'https://ssl.aoben.yoga/miniprogram/20231127/card-ico5.png?v=202311271722'
      // },
      // {
      //   id:6,
      //   name: '高级定制',
      //   title:'轻松易练高效',
      //   photo:'https://ssl.aoben.yoga/miniprogram/20231127/card-ico6.png?v=202311271722'
      // }
    ],
    dateScrollInto: '', //选择后运动到的位置
    //日期选择块END

    //小鱼下面抽整过来
    storeListData: [], //1.门店列表 首次在下拉时填充
    orderListData:[{id:0,title: "默认排序",selected: true}, {id:1,title: "按门店评分排序",selected: false}], //2.排序
    coachListData:[], //3.关注的教练列表 首次在下拉时填充
    thisDropIndex:0,//当前proDropData填充的是哪一个 0没有 1门店 2排序 3教练
    proDropData: [], //3个菜单 共用体部份
    dropShow: false,
    dropHeaderShow:false,//下拉闪屏小鱼试解决

    scrollTop: 0,
    dropdownShow: false,
    popupShow: false,
    
    //右下角数据区
    //newsList: [],
    pulling: false,

    //吸顶区==================START
    //1.顶部类型选择
    typeNavTop: 0, //顶部距离
    isTypeNavFixed: false, //是否吸顶
    //2.搜索框的定位
    isSearchFixed: false,
    searchNavTop: 0,
    //3.日期选择块
    isDataFixed: false,
    dataNavTop: 0,
    //4.筛选
    //isDropdowFixed: false,
    //dropdowNavTop: 0,
    //吸顶区==================END


    //开始对接区=====================
    loadingData: true, //数据加载中

    courseList: {
      loadingText: '正在加载...',
      refreshing: false,
      refreshText: '',
      data: [],
      isLoading: false,
      pageIndex: 1,
      lastPage: 1,
      total: 0
    },
    typeClass: 0,
    pageSize: 5, //每页条数
    pageIndex: 1, //当前页
    orderSet: 0, //排序方式 
    lng: null, //经度坐标
    lat: null, //纬度坐标
    word: '', //关健词搜
    typeId: 0, //指定课程类别
    storeId: 0, //指定门店ID
    coachId: 0, //指定教练ID
    dateTime: '', //日期，可以是时间戳，也可是具体的日期2023-08-22
    //陈建给还有时分，暂时不用

    // 左边类型选择 TAB
    tabLeftIndex: 0, //左边分类 默认选中 预设当前项的值
    scrollViewId: "id_0", //左边TAB滚动到的位置 scroll-into-view

    // 搜索框
    inputShowed: false,

  },
  // 点击详情
  contClick(e){
    let _id = e.currentTarget.dataset.current
    // let modelData = JSON.stringify(e.currentTarget.dataset.current)
    wx.navigateTo({
      url: `/pages/newpage/detail/index?editid=${_id}`,
    })
  },

  // 卡项支持的课程
  courseDetail(val){
    wx.showLoading({
      title: '加载中...',
    })
    let _config = {
      course_package_id: val
    }
    apis.get('/CoursePackage/getCourseTitleByIdPub', _config, {
      "Content-Type": 'applciation/json'
    }, false).then(obj => {
      let _list = []
      obj.forEach(el => {
        _list.push(el)
      });
      this.setData({
        listData:_list
      })
      wx.hideLoading()
    }).catch(err => {
      reject([]);
      wx.hideLoading()
      tui.toast("网络不给力，请稍后再试~")
    })
  },
  // 单击卡项
  detailShow(e){
    //#endregion   菜单区
    let submitString = e.currentTarget.dataset;
    if(submitString.current.id){
      this.setData({
        clicknum:submitString.index,
        course_id:submitString.current.id,
        course_name:submitString.current.title,
      })
      this.courseDetail(submitString.current.id)
    }
  },
  cardList() {
    let _config = ''
    apis.get('/CoursePackage/coursePackagePub', _config, {
      "Content-Type": 'applciation/json'
    }, false).then(obj => {
      let arrList = [];
      // 先遍历对象拿到里面的对象
      for (let key in obj) {
        arrList.push(obj[key].lowerLevel)
      }
      let newarrList = [];
      // 再次遍历数组,然后拿到里层的对象
      arrList.forEach(el => {
        for (let key in el) {
          newarrList.push(el[key])
        }
      });
      this.setData({
        typeList: newarrList,
        course_name: newarrList[0].title
      })
      this.courseDetail(newarrList[0].id)
    }, ).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '网络不给力，请稍后再试~',
        icon: 'none',
        duration: 2000
      })
    })
  },
  agree(e){
    console.log("用户同意隐私授权, 接下来可以调用隐私协议中声明的隐私接口")
    const that = this;
    this.setData({
        agreeClick:true //隐私是点击过的，不管是否同意的
    },()=>{
        //1.获取定位，并加载默认数据
        wx.getLocation({
        type: 'gcj02',
        altitude: true,
        success(res) {
          //1.1 已开启直接调用
          that.setData({
            lat: res.latitude,
            lng: res.longitude
          })
          that.cardList();
        },
        fail(res) {
          //1.2 未获取到 ，提示用户去打开 检测是否开启
          that.getLocationSetting();
        }
      });
    })


  },
  disagree(e){
    util.toast("您将以游客身份浏览！")
    const that = this;
    this.setData({
        agreeClick:true //隐私是点击过的，不管是否同意的
    },()=>{
        that.cardList();
    })

  },


  //用户设置中查看定位功能是否打开
  getLocationSetting() {
    new Promise((resolve, reject) => {
      //#region 拉取用户是否开启了定位
      wx.getSetting({
        success: (res) => {

          // 查询是否授权了定位
          if (!res.authSetting['scope.userLocation']) {
            // 发起授权请求
            wx.authorize({
              scope: 'scope.userLocation',
              success: (res) => {
                // 用户已同意，其他操作
                this.getLocation(() => {
                  this.cardList();
                });
              },
              fail: () => {
                //this.openConfirm() //如果拒绝，在这里进行再次获取授权的操作
                // 再次获取授权，引导客户手动授权
                wx.showModal({
                  //content: '检测到您没打开此小程序的位置消息功能，是否去设置打开？',
                  content: '为了附近门店的准确定位需要位置消息功能，是否去设置打开？',
                  confirmText: "确认",
                  cancelText: "取消",
                  success: (res) => {
                    //点击“确认”时打开设置页面
                    if (res.confirm) {
                      wx.openSetting({
                        success: (r) => {
                          //{"errMsg":"openSetting:ok","authSetting":{"scope.record":false,"scope.userLocation":false}} 
                          if (r.authSetting['scope.userLocation']) {
                            this.getLocation(() => {
                              this.cardList();
                            });
                          } else {
                            this.cardList();
                          }

                        }
                      })
                    } else {
                      //console.log('用户点击取消')
                      this.cardList();
                    }
                  }
                })
                // 再次获取授权，引导客户手动授权END
              }
            })
          } else {
            // 用户已授权，其他操作
            this.getLocation(() => {
              //2.加载初始数据
              this.cardList();
            });
          }
        }
      })
      //#endregion 拉取用户是否开启了定位
    })
  },
  onLoad: function (options) {
    let that = this;
    that.cardList();
    wx.hideHomeButton(); //隐HOME
  },

 // 底部菜单点击
 tabbarSwitch(e) {
    //{"index":4,"pagePath":"/pages/my/my","verify":true}
    console.log('点击E:', JSON.stringify(e))

    let _action = e.detail.action||"";//scanCode 为调用扫码
    let _navigate = e.detail.navigate||false;
    let isLogin = false;
    let that = this
    
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
              app.getOpenID(false).then(resOpenID => {
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
                        title: '二维码错误',
                        icon: 'none'
                    })
                    return
                }
                let _action=util.getURLParam(qrCodeContent,"s");
                let _actionTitle="";
                let _param =util.getURLParam(qrCodeContent,"param");
                console.log(_param);
                let _timestamp = (new Date()).valueOf();
                let _uid = wx.getStorageSync('USERID')||resOpenID;
                let config = {
                  userID: _uid,
                  TIMESTAMP: _timestamp,
                  key: _param,
                  FKEY: md5util.md5(_uid + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
                }
                switch(_action)
                {
                  case "door"://开门 https://yoga.aoben.yoga/s=door&param=mac
                  // _actionTitle="开门动作";
                  apis.posts("Door/qrCode",config,false).then(val=>{
                    that.setData({
                      openID:resOpenID,
                      openDoorHtml:"开门成功",
                      returnHtml:"CODE1正常："+JSON.stringify(val)
                    });
                    let model = JSON.stringify(val);
                    wx.navigateTo({
                      url: `/pages/mini/scan/index?model=${model}`,
                    })
                  },function(err)
                  {
                    _actionTitle = err.data.message;
                    util.toast(_actionTitle);
                    that.setData({
                      openID:resOpenID,
                      openDoorHtml:"开门失败",
                      openErrMessage:err.data.message,
                      returnHtml:"CODE 0出错："+JSON.stringify(err)
                    });
            
                  })
                  break;
              case "locker"://开柜 https://yoga.aoben.yoga/s=locker&param=mac
                  // _actionTitle="开柜动作";
                  // https://aoben.kshot.com
                  apis.posts("/Locker/qrCode",config,false).then(val=>{
                    console.log(val);
                    that.setData({
                      openID:resOpenID,
                      openDoorHtml:"开柜成功",
                      returnHtml:"CODE1正常："+JSON.stringify(val)
                    });
                    let model = JSON.stringify(val);
                    wx.navigateTo({
                      url: `/pages/mini/scan/index?model=${model}`,
                    })
                  },function(err)
                  {
                    _actionTitle = err.data.message;
                    util.toast(_actionTitle);
                    that.setData({
                      openID:resOpenID,
                      openDoorHtml:"开柜失败",
                      openErrMessage:err.data.message,
                      returnHtml:"CODE 0出错："+JSON.stringify(err)
                    });
                  })
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

              })


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
  tiaoClick(e) {
    console.log(e);
    wx.navigateTo({
      url: `/packageB/pages/Member/buyCard/index`,
    })
  },
  //顶部大类点击 OK
  tabTypeClick(e) {
    let index = e.target.dataset.current || e.currentTarget.dataset.current;
    if (index == this.data.tabTypeIndex) {
      return;
    }
    let path = e.target.dataset.path || e.currentTarget.dataset.path;
    wx.reLaunch({
      url: path,
    })
  },

  //页面滚动
  onPageScroll(e) {
    let scrollTop = parseInt(e.scrollTop);

    let isTypeNavFixed = scrollTop > this.data.typeNavTop;
    let isDataFixed = scrollTop > this.data.isDataFixed + 50;
    // let isSearchFixed = scrollTop>=this.data.isSearchFixed;
    // let isDropdowFixed = scrollTop>=this.data.isDropdowFixed;
    if (this.data.isTypeNavFixed != isTypeNavFixed) {
      this.setData({
        isTypeNavFixed
      })
    }
    if (this.data.isDataFixed != isDataFixed) {
      this.setData({
        isDataFixed
      })
    }
  },
  onReady(e) {
    //获取节点到顶部的距离
    wx.createSelectorQuery().select('#typeNavTop').boundingClientRect((rect) => {
      if (rect && rect.top) {
        this.setData({
          typeNavTop: parseInt(rect.top)
        })
      }
    }).exec();
    wx.createSelectorQuery().select('#dataNavTop').boundingClientRect((rect) => {
      if (rect && rect.top) {
        this.setData({
          dataNavTop: parseInt(rect.top)
        })
      }
    }).exec();
  },


  //#region  菜单点击区

  //#endregion 菜单点击区
  goToStore() {
    wx.navigateTo({
      url: '/pages/store/show/index',
    })

  },

})