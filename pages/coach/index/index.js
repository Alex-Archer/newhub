const app = getApp();
var moment = require('../../../libs/moment.min');
var apis = require('../../../utils/apis.js')
const logs = require("../../../utils/logs");
import _ from '../../../libs/we-lodash'
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../utils/util.js')
var md5util = require('../../../utils/md5.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typetabs: [{
        key: 'tuan',
        value: '团课'
      },
      {
        key: 'pt',
        value: '私教'
      },
      {
        key: 'jingpinke',
        value: '',
        // value: '集训营'
      },
    ],
    coursePersonalReferId: '', // 选择私教类型id
    currentIndex: 1,
    branchid: 0, //门店id
    resTime: '', // 选择的时间
    teachid: '',
    //胶囊位置
    statusBar: app.globalData.statusBar,
    customBar: app.globalData.customBar,
    navBarHeight: app.globalData.navBarHeight,
    listData: {}, //全部数据
    // 团课日期选择块
    groupList: [],
    groupTempList: [], //用于存初始groupList 只有当有修改时就提示保存
    groupEdit: false, //上面两个数组比较，来控制是否保存按钮可不可用
    tabTypeIndex: 0,
    tabIndex: 0,

    dateTime: '', //日期，可以是时间戳，也可是具体的日期2023-08-22
    dateBars: [], //周日期选择
    tabDateIndex: 0, //周日期选择模块 日期默认选中项 今天
    loading: true,
    globalURL: app.globalData.globalURL,
    list: [], //
    storePopupShow: false, //场地上弹窗
    timePopupShow: false, //时间弹窗

    uInfo: null, //教练信息
    courseList: [], //团 营列表
    storeList: [], //场馆列表
    // 选择时间
    timeList: [],
    cardList: [],

    countdown: '06', // 倒计时时间
    show: false, // 展示弹框
    time: 6, // 初始时间
    agreecheckbox:false, // 协议同意
    cardLoading:true, // 卡的loading
    resulut: '', // 选择卡后展示的名称
    orderNumber: '', // 卡的订单编号(不懂为啥用这个传)
    popupShow: false, 
    agreeContent:'1.参与aoben shared yoga集训营的用户，具有完全的法律行为能力，同意遵守相关管理规章制度，应接受aoben shared yoga集训营的相关服务协议，并已知晓有关的健身规则与警示，承诺遵守aoben shared yoga集训营的相关规定。1.参与aoben shared yoga集训营的用户，具有完全的法律行为能力，同意遵守相关管理规章制度，应接受aoben shared yoga集训营的相关服务协议，并已知晓有关的健身规则与警示，承诺遵守aoben shared yoga集训营的相关规定。',
    tabs: [
      // {id:'', title:'全部'} // 暂时不要全部,后期不知道会不会加
    ],
    removeGradient: false,
    loadingData: true, // 展示数据
  },
  readmore() {
    this.setData({
      removeGradient: !this.data.removeGradient
    })
  },
  // 私教课程列表
  getPtList(_id){
    this.setData({
      loadingData: true,
    })
    let _cId = this.data.listData.cId
    let _config = {
      id:_cId,
      course_package_id:_id
    }
    apis.gets('CoursePersonal/getCoursePersonalReferPub',_config).then(res => {
      this.setData({
        ptList: res,
        loadingData: false,
      })
    }).catch(err => {

    })
  },
  // 私教的课程单选
  ptTypeChange(e){
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      coursePersonalReferId:e.detail.value,
    })
  },
  // 私教类型tab点击
  onTabClick(e) {
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    this.getPtList(id)
    this.setData({
      tabTypeIndex: index,
      coursePersonalReferId:id
    })
  },
  // 团课还是私教切换
  courserTypeChange(e) {
    const {
      index
    } = e.currentTarget.dataset;
    // let _id = ''
    this.setData({
      currentIndex: Number(index),
      tabTypeIndex: 0, // 重置
    });
    // if(index == 1){
      
      this.getPtList() // 获取私教课程列表
      this.getCardList() // 获取卡列表
    // }
  },
  // 获取私教类型id
  getptTypeId(){
    let _config = {
      coursePackageTypeId:2
    }
    let _tabs = this.data.tabs
    apis.gets('coursePackage/getCoursePackageByTypeTitlePub',_config).then(res => {
      _tabs = _tabs.concat(res)
      this.getPtList(_tabs[0].id) // 获取私教列表
      this.setData({
        tabs: _tabs,
      })

    }).catch(err => {

    })
  },
  // 已购卡
  getCardList(){
    this.setData({
      loadingData: true,
    })
    let _timestamp = (new Date()).valueOf();
    let _coursePackageType = 2
    let _config={
      userID: wx.getStorageSync('USERID'),
      coursePackageType: _coursePackageType.toString(),
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT),
    }
    apis.get('/CardItemOrderApi/getUserCardItem',_config,{
      "Content-Type": 'applciation/json'
    },true).then(val => {
      val.forEach(el => {
        // 算出剩余多少节
        el.remaining = el.course_quantity - el.course_used_quantity 
        el.days = (el.expire_time - _time) / (1000*3600*24);
        el.months = Math.floor(el.days % 365 / 30);
      });
      this.setData({
        cardList:val,
        loadingData:false,
      })
    },function(err){
      console.log(err);
    })
  },
  //调用此方法显示弹层
  showPopup() {
    this.setData({
      popupShow: true
    })
  },
  hiddenPopup() {
    this.setData({
      popupShow: false
    })
  },
  // 阅读
  handyue() {
    this.setData({
      show: false,
      countdown: '06', // 初始化值
      time: 6,
      agreecheckbox: true,
    })
  },
  // 显示协议
  xieyiClick(e) {
    let _title = e.currentTarget.dataset.num
    let intve = setInterval(() => {
      let minute = this.data.time;
      minute < 10 && minute > 0 ? minute = '0' + minute : '';
      this.setData({
        countdown: minute,
        time: this.data.time - 1
      })
      if (this.data.time < 0) {
        clearInterval(intve)
      }
    }, 1000);
    this.setData({
      title: _title,
      show: true,
    })
  },
  //协议选框点击
  checkboxChange(e){
    let _agree = e.detail.value||[];
    this.setData({
      agreecheckbox:util.isNull(_agree)?false:true
    })
  },
  // 选卡点击
  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    const _cardList = this.data.cardList
    let _setData = e.detail.value.split("_")
    let _orderNumber= _setData[0]
    let resulut= _setData[1]
    this.setData({
      resulut,
      orderNumber:_orderNumber,
      cardList:_cardList
    })
  },
  // 查看更多的
  moreClick(e){
    let _index = this.data.currentIndex
    if(_index == 0){
      wx.navigateTo({
        url: '/pages/course/group/index',
      })
    }else{
      wx.navigateTo({
        url: '/pages/course/personal/index',
      })
    }
   
  },
  // 点击详情
  // 是团课还是私教的 1是团课,2是私教
  detailClick(e) {
    let _id = (e.currentTarget.dataset.current)
    wx.navigateTo({
      url: `/pages/newpage/detail/index?editid=${_id}&typeid=2`,
    })
  },
  // 团课预约点击
  yueClick(e) {
    let _id = (e.currentTarget.dataset.currid)
    wx.navigateTo({
      url: `/pages/newpage/detail/index?editid=${_id}&typeid=1`,
    })
  },
  //1.获取私教老师的时间
  getTimeJson(_date) {
    let _timestamp = (new Date()).valueOf();
    let _config = {
      date: _date,
      coachId: this.data.listData.coachId,
    }
    apis.gets("Coach/coachPlanTimePub", _config).then(val => {
      let defaultData =  this.randomfn(val);
      this.setData({
          groupList: defaultData,
          groupTempList:_.cloneDeep(defaultData),
      })
    }).catch((err) => {
      console.log(err);
    });
  },
  // 选择老师可约时间段
  // tabChange(e) {
  //   if (e.detail.source == 'touch') {
  //     let index = e.target.current || e.detail.current;
  //     this.switchTab(index)
  //   }
  // },
  // 时间日期点击
  tabClick(e) {
    let index = e.target.dataset.current || e.currentTarget.dataset.current;
    let _data = e.currentTarget.dataset.day;
    this.setData({
      tabDateIndex:index
    })
    this.getTimeJson(_data)
    this.switchTab(index);
  },
  switchTab(index) { //111
    let that = this;
    if (this.data.tabDateIndex === index) return;
    this.setData({
      isLoadingCourse: true,
      noDataCourse: false,
      tabDateIndex: index,
      scrollInto: this.data.dateBars[index].id
    }, () => {
      this.getPtList(); // 暂时不用
      this.getTimeJson(this.data.dateBars[index].date);

    })

  },
  back() {
    wx.navigateBack();
  },
  //去购买课卡
  gobuy(e) {
    wx.navigateTo({
      url: '/packageB/pages/card/index/index',
    })
  },
  //上课场地
  openStoreList: function (e) {
    this.setData({
      storePopupShow: true
    })
  },
  hideStoreList: function () {
    this.setData({
      storePopupShow: false
    })
  },
  //上课时间
  openTimeList: function (e) {
    this.setData({
      timePopupShow: true
    })
  },
  hideTimeList: function () {
    this.setData({
      timePopupShow: false
    })
  },
  getWeekByDate(dates) {
    let show_day = new Array('日', '一', '二', '三', '四', '五', '六');
    let date = new Date(dates);
    date.setDate(date.getDate());
    let day = date.getDay();
    return show_day[day];
  },
  //初始数据
  initLoad(_coachId) {

    return new Promise((resolve, reject) => {
      //let that = this;
      let _timestamp = (new Date()).valueOf();
      axios.get("Coach/baseInfoPub", {
        userId: _coachId,
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(_coachId + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }, {
        headers: {
          "Content-Type": 'applciation/json',
        },
        interceptors: {
          request: false,
          response: false
        },

        validateStatus(status) {
          return status === 200;
        },
      }).then(res => {
        if (res.data.code == 1) {

          resolve(res.data.data);
        } else {
          reject();
        }

      }).catch((err) => {
        reject();
      });
    })
  },
  //进入初始化数据
  randomfn(_defaultData) {
    let ary = [];
    for (let i = 0, length = this.data.dateBars.length; i < length; i++) {
        let aryItem = {
            loadingText: '正在加载...',
            refreshing: false,
            refreshText: '',
            data: [],
            isLoading: false,
            pageIndex: 1,
            restTime:0,//默认休息多久
            rest:0//当天是否休息 0为否 1为是
        };
        if (i === this.data.tabIndex) {
            aryItem.pageIndex = 2;
            // aryItem.data = aryItem.data.concat(this.getDataJson());
           aryItem.data = aryItem.data.concat(_defaultData.list);
           aryItem.restTime = _defaultData.restTime;//课间休息时间
           aryItem.rest = _defaultData.rest;//当天是否休息
        }
        ary.push(aryItem);
    }
    return ary;
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    const today = new Date(moment().format());
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    let _uid = options.uid || '';
    this.setData({
      branchid:options.branchid,
      teachid: options.uid,
    })
    if (util.isNull(_uid)) {
      util.toast("信息有误", null, null, () => {
        setTimeout(() => {
          wx.navigateBack();
        }, 500);
      })
      return;
    }
    this.initLoad(_uid).then(val => {
      that.setData({
        loading: false,
        uInfo: {
          nickname: val.nickname,
          headimgurl: val.headimgurl,
          group: val.group,
        },
        timeList: val.courseTime,
        courseList: val.courseList,
        storeList: val.storeList,
        listData: val,
        goodat: val.goodat.split(','),
        list: [{
          text: '累计上课',
          value: val.coursenum + '节'
        }, {
          text: '证书',
          value: val.certificateCount + '本',
          page: '/pages/coach/view/certificate/index?uid=' + val.userId
        }, {
          text: '好评率',
          value: val.positivenum + '%'
        }, {
          text: '评价',
          value: val.positivenum + '条',
          page: '/pages/coach/view/certificate/index?uid=' + val.userId
        }],
      })
      // 需要获取到参数
      //2. 加载时间段
      let _data = year + "-" + month.toString().padStart(2, "0") + "-" + day.toString().padStart(2, "0");
      this.getTimeJson(_data) // 获取教练可约时间
      this.getptTypeId() // 获取私教类型

    })
    //1. 今天日期
    new Promise(() => {
      that.setData({
        today: {
          day: day.toString().padStart(2, "0"), //补全0
          week: this.getWeekByDate(today),
          date: `${year}年${month}月`
        },
      })
    })

    //2.获取周几菜单
    new Promise(() => {
      const today = new Date(moment().format());
      let getNextSevenDays = this.getNextSevenDays();
      that.setData({
        dateBars: getNextSevenDays,
        dateTime: today.toISOString().slice(0, 10),
      }, () => {
        // this.loadCourse(today.toISOString().slice(0, 10));
      })
    })
  },
  
  getNextSevenDays() {
    const result = [];
    const today = moment();
    // 今天
    result.push({
      name: today.format('D').toString(), //日期 天，如6、16，不补全0
      id: today.format('D').toString(), //用 日期 天，如6、16 不补全0
      date: today.format('YYYY-MM-DD'), //2023-12-26,
      // weekday: today.toLocaleDateString('zh-CN', {weekday: 'long'}).replace('星期', '')
      weekday: "今天",
      number: 0,
      dot: false,
      allowClick: true, //允许点击,只有今天 明天 后天 3天可以点
    });

    // 明天
    const tomorrow = today.clone().add(1, 'day'); //.clone()是解决today变异了，日期乱了，必须，不然就用moment().add()

    result.push({
      name: tomorrow.format('D').toString(), //日期 天，如6、16，不补全0
      id: tomorrow.format('D').toString(), //用 日期 天，如6、16 不补全0
      date: tomorrow.format('YYYY-MM-DD'), //2023-12-26,
      weekday: "明天",
      number: 0,
      dot: false,
      allowClick: true, //允许点击,只有今天 明天 后天 3天可以点
    });
    // 后天
    const afterTomorrow = today.clone().add(2, 'day'); //.clone()是解决today变异了，日期乱了，必须，不然就用moment().add()
    result.push({
      name: afterTomorrow.format('D').toString(), //日期 天，如6、16，不补全0
      id: afterTomorrow.format('D').toString(), //用 日期 天，如6、16 不补全0
      date: afterTomorrow.format('YYYY-MM-DD'), //2023-12-26,
      weekday: "后天",
      number: 0,
      dot: false,
      allowClick: true, //允许点击,只有今天 明天 后天 3天可以点
    });


    // 第4天起
    for (let i = 3; i < 7; i++) {
      const nextDay = today.clone().add(i, 'day') //.clone()是解决today变异了，日期乱了，必须，不然就用moment().add()
      result.push({
        name: nextDay.format('D').toString(), //日期 天，如6、16，不补全0
        id: nextDay.format('D').toString(), //用 日期 天，如6、16 不补全0
        date: nextDay.format('YYYY-MM-DD'), //2023-12-26,
        weekday: this.getWeekByDate(nextDay),
        number: 0,
        dot: false,
        allowClick: false, //允许点击,只有今天 明天 后天 3天可以点
      });
    }
    return result;
  },
  loadCourse(_data) {
    let that = this;
    let _timestamp = (new Date(moment().format())).valueOf();
    let config = {
      lng: 120.98181,
      lat: 31.38475,
      typeClass: 0,
      pageSize: 5,
      pageIndex: 1,
      orderSet: 0,
      typeId: 0,
      storeId: 0,
      coachId: 0,
      // storeId: this.data.branchid,
      // coachId: this.data.teachid,
      // dateTime: '2023-12-20',
      dateTime: _data,
      userID: wx.getStorageSync('USERID'),
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    };

    apis.get("Course/coursePub", config, {
      "Content-Type": 'applciation/json'
    }, false).then(val => {
      let _data = val;
      if (util.isNull(val.data)) {
        that.setData({
          courseList: [], //团课
          isLoadingCourse: false,
          noDataCourse: true,
        })
      } else {
        let tempArr = []; //临时数组
        _.each(val.data, x => {
          tempArr.push({
            "id": x.course[0].id,
            "title": x.course[0].title,
            "starttime": x.course[0].starttime,
            "endtime": x.course[0].endtime,
            "registerednum": x.course[0].registerednum,
            "peoplenum": x.course[0].peoplenum,
            "listposter": x.course[0].listposter,
            "enrollstate": x.course[0].enrollstate,
            "registeropen": x.course[0].listpregisteropenoster,
            "score": x.score
          });
        });
        that.setData({
          courseList: tempArr, //团课
          isLoadingCourse: false,
          noDataCourse: false,
        })

      }

    }, function (err) {
      that.setData({
        courseList: [], //团课
        isLoadingCourse: false,
        noDataCourse: true,
      })
    });

  },
  // 证书
  zhengClick(e) {
    let newData = e.currentTarget.dataset.valdata
    wx.navigateTo({
      url: `/pages/coach/view/certificate/index?uid=${newData.userId}`,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //this.selectComponent("#tui_column_3").draw(this.data.options3.dataset, this.data.options3.yAxisVal.formatter)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getCardList()
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


  itemClick(e) {

    let _index = e.detail.index; //
    let _to = this.data.list[_index].page;
    wx.navigateTo({
      url: _to,
    })

  },
  teachClick(e){
    let _index = e.currentTarget.dataset.index;
    let _startTime = e.currentTarget.dataset.stime;
    this.setData({
      tabIndex: _index,
      resTime:_startTime
    })
  },
  //时间段点击之前的
  clickThisTime(e) {
    // 1未排课 0教练排课了 2及其它都是已约或占用
    let that = this;
    let _tabIndex = this.data.tabIndex; //当前选项卡
    let _index = e.currentTarget.dataset.index || e.target.dataset.index; //当前时间选择的索引
    let tempArr = this.data.groupList[_tabIndex].data; //当前时间数组  
    //如果已经是占用的
    if (tempArr[_index].state == 2) {
      util.toast("有其它按排，无法选择");
      return;
    }
  
    _.set(tempArr, '[' + _index + '].use', !this.data.groupList[_tabIndex].data[_index].use)
    // _.set(tempArr, '[' + _index + '].state', this.data.groupList[_tabIndex].data[_index].use ? 1 : 0);
    that.setData({
      [`groupList[${_tabIndex}].data`]: tempArr
    })
  },
  dSubscribe(e) {
    let _typenum = e.currentTarget.dataset.typenum;
    if(!this.data.agreecheckbox){
      util.toast("请先阅读并接受会员卡协议",null,null,()=>{})
      return
    }
    let _timestamp = (new Date()).valueOf();
    let _orderNumber = this.data.orderNumber
    let _branchid = this.data.branchid
    let _coachId = this.data.coachId
    let _resTime = this.data.resTime
    let _coursePersonalReferId = this.data.coursePersonalReferId
    let _resDate = util.getNowDate()
    if(_typenum == '1'){
      wx.showToast({
        title: '当前暂无课卡,请先购卡',
        icon: 'none',
      })
      wx.navigateTo({
        url: '/packageB/pages/card/index/index',
      })
      return
    }
    if(!_orderNumber){
      wx.showToast({
        title: '请选择课卡后进行预约',
        icon: 'none',
      })
      return
    }
    
    if(_resTime == ''){
      wx.showToast({
        title: '请选择老师可约时间',
        icon: 'none',
      })
      return
    }
    let _config = {
      storeId:_branchid, // 门店id
      resTime:_resTime, // 预约老师的时间
      coachId: _coachId, //老师id
      coursePersonalReferId:_coursePersonalReferId, // 私教类型id
      resDate:_resDate, // 约课时间
      orderNumber:_orderNumber,
      userID: wx.getStorageSync('USERID'),
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _branchid + _orderNumber +_coachId+ _resDate+_resTime+_timestamp.toString() + app.globalData.APP_INTF_SECRECT),
    }
    apis.posts('BookedClass/bookPersonalCourse',_config,true).then(res => {
      console.log(res);
      wx.navigateTo({
        // url: '/packageA/pages/listCourse/index?tab=2',
        url: '/packageA/pages/myCourse/index/index',
      })
    }).catch(err => {
      wx.showToast({
        title: err.message,
        icon: 'none',
      })
    })
  },
  //全选时间
selectAllTime(e) {
  let that = this;
  let _tabIndex = this.data.tabIndex; //当前选项卡
  let _timeDate = this.data.groupList[_tabIndex].data; //当前时间数组  
  let tempArr = _timeDate; //临时数组
  //_.set(tempArr, '[' + _index + '].use', !this.data.groupList[_tabIndex].data[_index].use)
  _.each(tempArr, x => {
    if (x.state !== 2) {
      x.use = true;
      x.state = 1;
    }
  });
  that.setData({
    [`groupList[${_tabIndex}].data`]: tempArr,
    select_all: true,
  })


},
//取消全选时间
resetAllTime(e) {
  let that = this;
  let _tabIndex = this.data.tabIndex; //当前选项卡
  let _timeDate = this.data.groupList[_tabIndex].data; //当前时间数组  
  let tempArr = _timeDate; //临时数组
  _.each(tempArr, x => {
    if (x.state !== 2) {
      x.use = false;
      x.state = 0;
    }
  });
  that.setData({
    [`groupList[${_tabIndex}].data`]: tempArr,
    select_all: false,
  })


},
// 打电话
callPhone () {
  wx.makePhoneCall({
    phoneNumber: "4001-111-111",
    success: function () {
      console.log("拨打电话成功！")
    },
    fail: function () {
      console.log("拨打电话失败！")
    }
  })
},

})