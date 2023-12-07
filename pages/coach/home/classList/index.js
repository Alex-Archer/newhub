const app = getApp();
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash';
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var md5util = require('../../../../utils/md5.js');
var util = require('../../../../utils/util.js');
let calendar = null;
// 缓存最多页数
const MAX_CACHE_PAGEINDEX = 3;
// 缓存页签数量
const MAX_CACHE_PAGE = 3;
const groupData = [
  {
    title: '空中瑜伽-打造完美曲线',
    des:"张珊珊 30分钟 10人预约",
    coverImg: "/miniprogram/url-img/store/img-3.png",
    coverBg: "/miniprogram/url-img/store/box-1.png",    
    startDate:"2023-08-21",
    startTime:"17:00",
    endTime:"21:00",
    coachName:"张珊珊",//教练
    classDuration:"30",//上课时长
    appointmentsNumber:10,//10人预约
    isReservation:true,//是否已预约
    classesBegin:"",//已经开始上课，无法约，没开始就为空
  },
  {
    title: '瑜伽基本功-柔韧拉伸',
    des:"张珊珊 30分钟 10人预约",
    coverImg: "/miniprogram/url-img/store/img-4.png",
    coverBg: "/miniprogram/url-img/store/box-2.png",    
    startDate:"2023-08-21",
    startTime:"17:00",
    endTime:"21:00",
    coachName:"张珊珊",//教练
    classDuration:"30分钟",//上课时长
    appointmentsNumber:10,//10人预约
    isReservation:false,//是否已预约
    classesBegin:"",//已经开始上课，无法约，没开始就为空
  },
  {
    title: '身心放松-即可缓解疲劳',
    des:"张珊珊 30分钟 10人预约",
    coverImg: "/miniprogram/url-img/store/img-5.png",
    coverBg: "/miniprogram/url-img/store/box-3.png",    
    startDate:"2023-08-21",
    startTime:"17:00",
    endTime:"21:00",
    coachName:"张珊珊",//教练
    classDuration:"30分钟",//上课时长
    appointmentsNumber:10,//10人预约
    isReservation:false,//是否已预约
    classesBegin:"27:30",//已经开始上课，无法约，没开始就为空
  },
  {
    title: '空中瑜伽-打造完美曲线',
    des:"张珊珊 30分钟 10人预约",
    coverImg: "/miniprogram/url-img/store/img-3.png",
    coverBg: "/miniprogram/url-img/store/box-1.png",    
    startDate:"2023-08-21",
    startTime:"17:00",
    endTime:"21:00",
    coachName:"张珊珊",//教练
    classDuration:"30",//上课时长
    appointmentsNumber:10,//10人预约
    isReservation:true,//是否已预约
    classesBegin:"",//已经开始上课，无法约，没开始就为空
  }
  
];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //https://treadpit.github.io/wx_calendar/v1/guide.html#自定义配置
    //小程序-参考\日历组件\wx_calendar-master\wx_calendar-master\src
    calendarConfig: {
      theme: 'ksald', // 日历主题，目前共两款可选择，默认 default 及 elegant，自定义主题在 theme 文件夹扩展
      showLunar: false, // 是否显示农历，此配置会导致 setTodoLabels 中 showLabelAlways 配置失效
      multi: true, // 是否开启多选,
      //chooseAreaMode: true, // 开启日期范围选择模式，该模式下只可选择时间段
      enableArea: ['2023-09-07', '2023-09-17'],
      markToday: '今', // 当天日期展示不使用默认数字，用特殊文字标记
      defaultDay: '2023-09-07', // 默认选中指定某天；当为 boolean 值 true 时则默认选中当天，非真值则在初始化时不自动选中日期，
      hideHeadOnWeekMode: true, // 周视图模式是否隐藏日历头部
      disableMode: { // 禁用某一天之前/之后的所有日期
        type: 'before', // [‘before’, 'after']
        date: '2023-09-07', // 无该属性或该属性值为假，则默认为当天
      },
      onlyShowCurrentMonth: true, // 日历面板是否只显示本月日期

      // chooseAreaMode: true,
      // firstDayOfWeek: 'Mon',
      // disableMode: {
      //   type: 'after',
      //   date: '2020-03-9'
      // },
      // defaultDay: '2020-3-6'
      // multi: true
    },

    flag: true, //首页加载动画
    tabbarShow: true, //底部菜单不与其它冲突默认关闭


    indexBackToTop: false, //是否返回顶部
    current: 0, //tabbar 默认选中的项
    //底部按钮 在首页有效果时 与 indexPage合用,并把第一个首页隐掉
    safeAreaBottom: app.globalData.safeAreaBottom,

    dateScrollInto: '', //选择后运动到的位置
    tabDateIndex: 0, //日期选择模块 日期默认选中项
    //日期选择块END

    tabBarCurrent:1,
   
    // 签到
    timeArray: [{
        start: '06:00',
        use: false
      },
      {
        start: '06:30',
        use: false
      },
      {
        start: '07:00',
        use: false
      },
      {
        start: '07:30',
        use: false
      },
      {
        start: '08:00',
        use: false
      },
      {
        start: '08:30',
        use: false
      },
      {
        start: '09:00',
        use: false
      },
      {
        start: '09:30',
        use: false
      },
      {
        start: '10:00',
        use: false
      },
      {
        start: '10:30',
        use: true
      },
      {
        start: '11:00',
        use: true
      },
      {
        start: '11:30',
        use: false
      },
      {
        start: '12:00',
        use: false
      },
      {
        start: '12:30',
        use: false
      },
      {
        start: '13:00',
        use: false
      },
      {
        start: '13:30',
        use: false
      },
      {
        start: '14:00',
        use: false
      },
      {
        start: '14:30',
        use: false
      },
      {
        start: '15:00',
        use: true
      },
      {
        start: '15:30',
        use: true
      },
      {
        start: '16:00',
        use: true
      },
      {
        start: '16:30',
        use: false
      },
      {
        start: '17:00',
        use: false
      },
      {
        start: '17:30',
        use: false
      },
      {
        start: '18:00',
        use: false
      },
      {
        start: '18:30',
        use: false
      },
      {
        start: '19:00',
        use: false
      },
      {
        start: '19:30',
        use: false
      },
      {
        start: '20:00',
        use: false
      },
      {
        start: '20:30',
        use: false
      },
      {
        start: '21:00',
        use: false
      },
      {
        start: '21:30',
        use: false
      },
      {
        start: '22:00',
        use: false
      }
    ],

    // 签到END
    // 团课日期选择块
    groupList: [],
    cacheTab: [],
    tabIndex: 0,
    dateBars: [{
        name: '20',
        id: 'wynb',
        weekday:'日',
        date:'2023-08-20',
        number:0,
        dot:false
        
      },
      {
        name: '21',
        id: 'yule',
        weekday:'今天',
        date:'2023-08-21',
        number:10,
        dot:true
      },
      {
        name: '22',
        id: 'sports',
        weekday:'明天',
        date:'2023-08-22',
        number:20,
        dot:false
      },
      {
        name: '23',
        id: 'domestic',
        weekday:'三',
        date:'2023-08-23',
        number:13,
        dot:true
      },
      {
        name: '24',
        id: 'finance',
        weekday:'四',
        date:'2023-08-24',
        number:0,
        dot:false
      },
      {
        name: '25',
        id: 'keji',
        weekday:'五',
        date:'2023-08-25',
        number:0,
        dot:false
      },
      {
        name: '26',
        id: 'education',
        weekday:'六',
        date:'2023-08-26',
        number:0,
        dot:false
      },
      {
        name: '27',
        id: 'car',
        weekday:'日',
        date:'2023-08-27',
        number:0,
        dot:false
      }
    ],
    scrollInto: '',
    showTips: false,
    navigateFlag: false,
    pulling: false,
    tuiTabsHeight:90*groupData.length,//项目列表高*默认个数+日期选择高
    // 团课日期选择块END
  },
  // 底部菜单点击
  tabbarSwitch(e) {
    //{"index":4,"pagePath":"/pages/my/my","verify":true}
    let isLogin = false
    if (e.detail.verify && !isLogin) {
      wx.showToast({
        title: '您还未登录，请先登录',
        icon: "none"
      })
    } else {
      if (e.detail.index != this.data.tabBarCurrent) {
        //临时用用
        if(e.detail.pagePath=="/packageA/pages/order/list/index")
        {
          wx.navigateTo({
            url: e.detail.pagePath,
          })

        }else{
        wx.reLaunch({
          url: e.detail.pagePath
        })
      }
      }
    }
  },
  //测试消息模板同意
  test() {
   
    let that = this;
    const SUBSCRIBE_ID = 'uZmNcZAqvGOQu-GTSTQZ5bbuddF7eegbddimuQBcD80' // 模板ID
    if (wx.requestSubscribeMessage) {
      wx.requestSubscribeMessage({
        tmplIds: [SUBSCRIBE_ID],
        success(res) {
          if (res[SUBSCRIBE_ID] === 'accept') {
            // 用户主动点击同意...do something
            wx.showToast({
              title: '主动同意',
              icon: 'none'
            })
          } else if (res[SUBSCRIBE_ID] === 'reject') {
            // 用户主动点击拒绝...do something
            wx.showToast({
              title: '主动拒绝',
              icon: 'none'
            })
          } else {
            wx.showToast({
              title: '授权订阅消息有误',
              icon: 'none'
            })
          }
        },
        fail(res) {
          // 20004:用户关闭了主开关，无法进行订阅,引导开启
          if (res.errCode == 20004) {
            // 显示引导设置弹窗
            wx.showToast({
              title: '显示引导设置弹窗',
              icon: 'none'
            })
            that.setData({
              isShowSetModel: true
            })
          }else{
            // 其他错误信息码，对应文档找出原因
            wx.showModal({
              title: '提示',
              content: res.errMsg,
              showCancel: false
            })
          }
        }
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '请更新您微信版本，来获取订阅消息功能',
        showCancel: false
      })
    }


  },

  afterTapDay(e) {
    console.log('afterTapDay', e.detail)
  },
  afterCalendarRender(e) {
    calendar = this.calendar;
    const area = ['2023-09-07', '2023-09-17']
    let action = 'enableArea'
    this.calendar[action](area)
    //1.禁选指定日期
    this.calendar.disableDay([{
      year: 2023,
      month: 9,
      day: 12
    }]);

    //2.选中指定日期
    const toSet = [{
        year: 2023,
        month: 9,
        day: 13
      },
      {
        year: 2023,
        month: 9,
        day: 16
      }
    ]
    this.calendar["setSelectedDays"](toSet);
  },
  //取消重选
  cancelSelectedDates(e) {
    const resetDay = [{
        year: 2023,
        month: 9,
        day: 13
      },
      {
        year: 2023,
        month: 9,
        day: 14
      }
    ]
    //不传 resetDay 则取消所有已选择的日期
    // this.calendar.cancelSelectedDates(resetDay);
    this.calendar.cancelSelectedDates();
  },
  //回到本月
  jumpMonth(e) {

    this.calendar.jump(2023, 9);
  },
  //全选时间
  selectAllTime(e) {
    let that = this;
    let tmpArr = that.data.timeArray;

    _.each(tmpArr, x => {
      x.use = true;
    });

    that.setData({
      timeArray: tmpArr
    })


  },
  //取消全选时间
  resetAllTime(e) {
    let that = this;
    let tmpArr = that.data.timeArray;

    _.each(tmpArr, x => {
      x.use = false;
    });

    that.setData({
      timeArray: tmpArr
    })


  },
  clickThisTime(e) {
    let that = this;
    let tempArr = that.data.timeArray;

    let _index = e.target.dataset.index || e.currentTarget.dataset.index;
    // _.set(tempArr, '[5].use', true)
    _.set(tempArr, '[' + _index + '].use', !that.data.timeArray[_index].use)
    that.setData({
      timeArray: tempArr
    })


  },
  loadDefault() {
    let _this = this;
    //#region  拉取用户OPENID后加载首页数据
    app.getOpenID().then(resOpenID => {
      _this.setData({
        uOpenID: resOpenID
      })

      var timestamp = (new Date()).valueOf();
      let config = {
        header: {
          "Content-Type": 'applciation/json',
          "Authorization":"Bearer 3aa501cd651945a9b4829ae166fca518"
          // uid: wx.getStorageSync('USERID'), //暂时只是传过去，不作他用，以后可能有大用，不一定是UID
          // mac: app.getMac()
        },
        data: {
          userID: wx.getStorageSync('USERID'),
          thisPage: "store",
          TIMESTAMP: timestamp,
          FKEY: md5util.md5("store" + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        },
        
        validateStatus: function (status) {
          return status.statusCode == 200 ? true : false; //状态码不等于200的都会进入catch error回调
        }
      };

      axios.get("/api/Store/detail?id=1", config)
        .then(res => {
          //{"code":1,"message":"success","data":{"id":1,"ubid":7,"title":"前进路店","poster":"\/uploadfiles\/images\/2023\/07\/20230714\/561ff47dd76a17b9283af1998162e27a.jpg","tel":"","address":"江苏省苏州市昆山市金茂路888号4号楼三层","addressexplanatory":"地铁11号钱，陆家站直达","lng":"22.333","lat":"33.333","introduce":"介绍文字","area":0,"overallviewid":"24awobdmddd","explainfile":"https:\/\/temp-aoben-picture.oss-cn-shanghai.aliyuncs.com\/audio\/2023\/08\/14\/20230814170513183306.mp3","businesshours":"7*24小时","businessstart":0,"businessend":32767,"parking":1,"browsenum":100,"usesnum":1,"opennum":1,"score":"4","commentnum":26,"facilitiesscore":"0","environmentscore":"0","servicescore":"0","adminid":1,"sort":0,"open":1,"show":1,"addtime":1688535708,"picture":[{"id":1,"sid":1,"title":"1","poster":"https:\/\/temp-aoben-picture.oss-cn-shanghai.aliyuncs.com\/web-images\/2023\/08\/14\/20230814091427716949.png","introduce":"","adminid":1,"sort":0,"open":1,"show":1,"addtime":1688695407},{"id":2,"sid":1,"title":"大厅","poster":"\/uploadfiles\/images\/2023\/07\/20230707\/855224da1af251e7f3e9bd979a132807.png","introduce":"图片介绍","adminid":1,"sort":0,"open":1,"show":1,"addtime":1688695416}],"mov":[{"id":1,"sid":1,"title":"门店视频","videoid":24,"introduce":"测试","adminid":1,"sort":0,"open":1,"show":1,"addtime":1689654940,"url":"https:\/\/temp-aoben-picture.oss-cn-shanghai.aliyuncs.com\/web-video\/2023\/08\/15\/20230815103946940038.mp4","poster":"https:\/\/temp-aoben-picture.oss-cn-shanghai.aliyuncs.com\/video-png\/2023\/08\/15\/20230815103946940038.png","gif":"https:\/\/temp-aoben-picture.oss-cn-shanghai.aliyuncs.com\/video-gif\/2023\/08\/15\/20230815103946940038.gif","size":1889,"filename":"横拍视频.mp4","duration":"0.00"},{"id":9,"sid":1,"title":"横","videoid":36,"introduce":"大","adminid":1,"sort":0,"open":1,"show":1,"addtime":1692153865,"url":"https:\/\/temp-aoben-picture.oss-cn-shanghai.aliyuncs.com\/web-video\/2023\/08\/16\/20230816104424233089.mp4","poster":"https:\/\/temp-aoben-picture.oss-cn-shanghai.aliyuncs.com\/video-png\/2023\/08\/16\/20230816104424233089.png","gif":"https:\/\/temp-aoben-picture.oss-cn-shanghai.aliyuncs.com\/video-gif\/2023\/08\/16\/20230816104424233089.gif","size":1889,"filename":"横拍视频.mp4","duration":"9.37"}],"scenes":[{"id":1,"ovid":12322,"sid":1,"title":"1号房间","poster":"\/uploadfiles\/images\/2023\/07\/20230717\/ff3668f2f73168d1d8e8520483af1965.png","browsenum":0,"sort":0,"open":1,"show":1,"addtime":1689577828}],"room":[{"id":1,"sid":1,"tid":2,"poster":"\/uploadfiles\/images\/2023\/07\/20230717\/0cb86d73a78633f848e7be990557c25f.png","title":"一号教室","usesnum":20,"opennum":1,"area":20,"introduce":"1111","scenesid":1,"score":"4","commentnum":19,"facilitiesscore":"0","environmentscore":"0","servicescore":"0","adminid":1,"sort":0,"open":1,"show":1,"addtime":1689582304,"picture":[{"id":1,"srid":1,"title":"工要要","poster":"\/uploadfiles\/images\/2023\/07\/20230707\/33b643d4e9f32bf98d35f9d46f5e5e53.png","introduce":"<p>林要 要要<\/p>","adminid":1,"sort":0,"open":1,"show":1,"addtime":1688695407}],"mov":[]}],"provinceId":1,"provinceName":"江苏","cityId":2,"cityName":"苏州","countyId":3,"countyName":"昆山","townId":7,"townName":"张浦镇"}}
          let _resdata = res.data;
          if (_resdata.code == 1) { //开始处理
            _this.setData({
              pageData:_resdata.data
            })

          } else {
            util.toast(res.data.message + " 点击页面重新加载")
          }
        }).catch(err => {
          if (err.statusCode != 200) {
            util.toast("请求出错[" + err.statusCode + "] 点击页面重新加载")
          }
        })
    }).catch((err) => {
    })
    //#endregion 拉取用户OPENID后加载首页数据END
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideHomeButton();

    setTimeout(() => {
      wx.getSystemInfo({
        success: res => {

          this.setData({
            height: res.windowHeight - res.windowWidth / 750 * 92
          });
        }
      });
    }, 50);




    // 生成0-23的数组,代表24小时
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }

    this.setData({
      hours
    });


    setTimeout(() => {
      this.setData({
        groupList: this.randomfn()
      })
    }, 50);
    //开始加载数据
    this.loadDefault();



  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  //初始化数据
  randomfn() {
    let ary = [];
    for (let i = 0, length = this.data.dateBars.length; i < length; i++) {
      let aryItem = {
        loadingText: '正在加载...',
        refreshing: false,
        refreshText: '',
        data: [],
        isLoading: false,
        pageIndex: 1
      };
      if (i === this.data.tabIndex) {
        aryItem.pageIndex = 2;
        aryItem.data = aryItem.data.concat(groupData);
      }
      ary.push(aryItem);
    }
    return ary;
  },
  //模拟获取数据
  getList(index, refresh) {
    let activeTab = this.data.groupList[index];
    let list = groupData || [];
    if (refresh) {
      activeTab.data = [];
      activeTab.loadingText = '正在加载...';
      activeTab.pageIndex = 2;
      activeTab.data = list || [];
    } else {
      activeTab.data = activeTab.data.concat(list);
      activeTab.pageIndex++;
      activeTab.isLoading = false;
      //根据实际修改判断条件
      if (activeTab.pageIndex > 3) {
        activeTab.loadingText = '没有更多了';
      }
    }
    this.setData({
      [`groupList[${index}]`]: activeTab
    })
  },
  goDetail(e) {
    console.log(goDetail)
    // if (this.data.navigateFlag) return;
    // this.data.navigateFlag = true;
    // wx.navigateTo({
    //   url: '/pages/template/news/newsDetail/newsDetail'
    // });
    // setTimeout(() => {
    //   this.data.navigateFlag = false;
    // }, 200);
  },
  //日期点击
  tabClick(e) {

    let index = e.target.dataset.current || e.currentTarget.dataset.current;
    this.switchTab(index);
  },
  tabChange(e) {
    if (e.detail.source == 'touch') {
      let index = e.target.current || e.detail.current;
      this.switchTab(index);
    }
  },
  //选择日期
  switchTab(index) {
    if (this.data.tabIndex === index) return;
    if (this.data.groupList[index].data.length === 0) {
      this.getList(index);
    }
    // 缓存 tabId
    if (this.data.groupList[this.data.tabIndex].pageIndex > MAX_CACHE_PAGEINDEX) {
      let isExist = this.data.cacheTab.indexOf(this.data.tabIndex);
      if (isExist < 0) {
        this.data.cacheTab.push(this.data.tabIndex);
      }
    }
    let scrollIndex = index - 1 < 0 ? 0 : index - 1;
    this.setData({
      tabIndex: index,
      scrollInto: this.data.dateBars[scrollIndex].id
    })

    // 释放 tabId
    if (this.data.cacheTab.length > MAX_CACHE_PAGE) {
      let cacheIndex = this.data.cacheTab[0];
      this.clearTabData(cacheIndex);
      this.data.cacheTab.splice(0, 1);
    }
  },
})