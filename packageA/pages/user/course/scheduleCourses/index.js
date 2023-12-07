const app = getApp();
var moment = require('../../../../../libs/moment.min');
const logs = require("../../../../../utils/logs");
import _ from '../../../../../libs/we-lodash'
import axios from '../../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../../../utils/util.js')
var md5util = require('../../../../../utils/md5.js')
const filter = require('../../../../../utils/loginFilter'); 

Page(filter.loginCheck(true, app, { 

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    preventOnShow: true, //3.登录验证  需要登录时，阻止ONSHOW 4.在页面中 wx:if="{{!preventOnShow}}"防跳转时显示页面

    coacScrollInto: 0, //教练滚动到哪索引

    dateBars: [], //日期数据
    tabDateIndex: 0, //日期选择模块 日期默认选中项
    dateScrollInto: '', //选择后运动到的位置

    todayDate: '', //今天日期
    timeData: [], //时间数据
    timeTempList: [], //时间数据 临时数组
    isLoading: false, //数据是否加载中

    //接收区
    paramOrderID: 0, //订单ID 陈健说不用了
    paramOrderNo: 0, //订单号
    paramCourseID: 0, ////课程ID

    //提交区
    //formOrderID:0,//订单ID 用不到
    formOrderNo: '', //订单号
    formCourseID: 0, //课程ID
    formStoreID: 0, //门店ID
    formCoachID: 0, //教练ID
    formReserveData: '', //预约日期
    formReserveTime: '', //预约时间


    //信息区
    courseInfo: null, //获取课程信息
    returnCoachList: [], //获取教练列表


    //面板区
    showCoursePanel: true, //课程面板显示
    showStorePanel: false, //门店面板显示
    showCoachPanel: false, //教练面板显示
    showReserverPanel: false, //上课时间面板显示

    disabledBottom: true, //提交按钮
    selectStoreTxt: '请选择您要上课的门店', //选择门店提示
    selectStore: null, //选中的门店信息数组


    itemBoxAnimation: "", //课程信息加截完后，文字动一下 item-box-animation

    //支付提交按钮
    subDisabled: true,
    PayLoading: false, //透明加载  tui-loading wx:if="{{PayLoading}}"
    PayLoadingTxt: '加载中', //加载动画文字

    //backParentErrText:'',

  },
  onShow(e) {
    if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 
  },
  /**
   * 根据教练，日期设置时间列表
   * @param {*} _coachid 
   * @param {*} _date 
   */
  getTimeListByCoachAndDate(_coachid, _date) {

    new Promise((resolve, reject) => {
      //获取教练时间
      const that = this;
      let _timestamp = (new Date()).valueOf();
      let _Config = {
        coachId: _coachid,
        date: _date,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _coachid.toString() + _date.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }
      this.getDataJson("Coach/coachPlanTime", _Config, true).then(val => {
        if (util.isNull(val.list) || val.list.length <= 0) {
          reject() //不通知吧
        }
        let thisTempArr = [];
        //1.排除过时和选掉的时间
        _.each(val.list, (x, index) => {
          if (this.CompareDateTimeShow(_date, x.start) && x.state == 1) // x.state !== 2
          {
            x.use = false;
            x.state = 0;
            thisTempArr.push(x);
          }
        });

        //筛选后时间为空了
        if (util.isNull(thisTempArr) && thisTempArr.length <= 0) {
          that.setData({
            timeData: thisTempArr,
            // formCoachID: _coachid,
            // coacScrollInto:_coachid,//滚动到
            //showReserverPanel: true, //时间可选

            formReserveTime: "", //清空
            disabledBottom: true, //提交按钮 不可以提交

            isLoading: false,
          })

        } else {
          resolve(thisTempArr);
        }




      }, function (err) {
        reject(err)
      })

    }).then(_val => {
      let courseTime = _val; //教练的时间段
       //开始获取店面空闲时间
      new Promise((resolve, reject) => {
        //获取教练时间
        const that = this;
        let _formStoreID = this.data.formStoreID;
        let _orderNo = this.data.paramOrderNo;
        let _timestamp = (new Date()).valueOf();
        let _Config = {
          storeId: _formStoreID,
          orderNo: _orderNo,
          date: _date,
          userID: wx.getStorageSync('USERID'),
          TIMESTAMP: _timestamp,
          FKEY: md5util.md5(wx.getStorageSync('USERID') + _formStoreID.toString() + _orderNo.toString() + _date.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        }
        this.getDataJson("Store/roomTime", _Config, true).then(val => {

          let storeTime = val; //场馆房间段情况
          //[{"start":"06:00","state":1},{"start":"06:30","state":1},{"start":"07:00","state":1},{"start":"07:30","state":1},{"start":"08:00","state":1},{"start":"08:30","state":1},{"start":"09:00","state":1},{"start":"09:30","state":1},{"start":"10:00","state":1},{"start":"10:30","state":1},{"start":"11:00","state":1},{"start":"11:30","state":1},{"start":"12:00","state":1},{"start":"12:30","state":1},{"start":"13:00","state":1},{"start":"13:30","state":1},{"start":"14:00","state":1},{"start":"14:30","state":1},{"start":"15:00","state":1},{"start":"15:30","state":1},{"start":"16:00","state":1},{"start":"16:30","state":1},{"start":"17:00","state":1},{"start":"17:30","state":1},{"start":"18:00","state":1},{"start":"18:30","state":1},{"start":"19:00","state":0},{"start":"19:30","state":0},{"start":"20:00","state":0},{"start":"20:30","state":1},{"start":"21:00","state":1},{"start":"21:30","state":1},{"start":"22:00","state":1},{"start":"22:30","state":1}]
          //开始对比教练时间
          //let b = [{"start":"20:00","state":0},{"start":"20:30","state":1},{"start":"21:00","state":1},{"start":"21:30","state":1},{"start":"22:00","state":0},{"start":"22:30","state":1}];
          _.forEach(courseTime, (courseTime_Obj) => {
            const storeTime_Obj = _.find(storeTime, {
              start: courseTime_Obj.start,
              state: 1
            });
            if (storeTime_Obj) {
              courseTime_Obj.state = 0; //可以用 
            } else {
              courseTime_Obj.state = 2; //禁用变灰
            }
          });

          that.setData({
            timeData: courseTime,
            formCoachID: _coachid,
            coacScrollInto: _coachid, //滚动到

            showReserverPanel: true, //时间可选

            formReserveTime: "", //清空
            disabledBottom: true, //提交按钮 不可以提交

            isLoading: false,
          })

        }, function (err) {
          let thisTempArr = [];
          //1.场馆无房间全部禁用
          _.each(_val, (x, index) => {
            x.use = true;
            x.state = 2;
            thisTempArr.push(x);
          });

          that.setData({
            timeData: thisTempArr,
            formCoachID: _coachid,
            coacScrollInto: _coachid, //滚动到

            showReserverPanel: true, //时间可选

            formReserveTime: "", //清空
            disabledBottom: true, //提交按钮 不可以提交

            isLoading: false,
          })
        })
      })


    }).catch(err => {

      util.toast(err);
      return;
    })
},
  //1.选择门店
  selectStore() {
    wx.navigateTo({
      url: '../point/index?orderNo=' + this.data.paramOrderNo + '&storeID=' + this.data.formStoreID,
    })
  },
  //2.点选教练
  selectCoach(e) {
    const _coachid = e.currentTarget.dataset.coachid || e.target.dataset.coachid || 0;
    if (util.isNull(_coachid) || _coachid == 0) {
      util.toast("教练信息有误");
      return;
    }

    this.setData({
      isLoading: true,
      formCoachID: _coachid,
      coacScrollInto: _coachid, //滚动到
      showReserverPanel: true,

    }, () => {
      this.getTimeListByCoachAndDate(_coachid, this.data.formReserveData);
    })






  },
  getWeekByDate(dates) {
    let show_day = new Array('日', '一', '二', '三', '四', '五', '六');
    let date = new Date(dates);
    date.setDate(date.getDate());
    let day = date.getDay();
    return show_day[day];
  },

  getNextSevenDays() {
    const result = [];
    const today = moment();
    // 今天
    result.push({
        name:today.format('D').toString(),//日期 天，如6、16，不补全0
        id: today.format('D').toString(),//用 日期 天，如6、16 不补全0
        date: today.format('YYYY-MM-DD'), //2023-12-26,
        // weekday: today.toLocaleDateString('zh-CN', {weekday: 'long'}).replace('星期', '')
        weekday: "今天",
        number: 0,
        dot: false,
        allowClick:true,//允许点击,只有今天 明天 后天 3天可以点
    });

    // 明天
    const tomorrow = today.clone().add(1, 'day');//.clone()是解决today变异了，日期乱了，必须，不然就用moment().add()
    result.push({
      name:tomorrow.format('D').toString(),//日期 天，如6、16，不补全0
      id: tomorrow.format('D').toString(),//用 日期 天，如6、16 不补全0
      date: tomorrow.format('YYYY-MM-DD'), //2023-12-26,
        weekday: "明天",
        number: 0,
        dot: false,
        allowClick:true,//允许点击,只有今天 明天 后天 3天可以点
    });
    // 后天
    const afterTomorrow = today.clone().add(2, 'day');//.clone()是解决today变异了，日期乱了，必须，不然就用moment().add()
    result.push({
      name:afterTomorrow.format('D').toString(),//日期 天，如6、16，不补全0
      id: afterTomorrow.format('D').toString(),//用 日期 天，如6、16 不补全0
      date: afterTomorrow.format('YYYY-MM-DD'), //2023-12-26,
        weekday: "后天",
        number: 0,
        dot: false,
        allowClick:true,//允许点击,只有今天 明天 后天 3天可以点
    });
    

    // 第4天起
    for (let i = 3; i < 7; i++) {
        const nextDay = today.clone().add(i, 'day')//.clone()是解决today变异了，日期乱了，必须，不然就用moment().add()
        result.push({
          name:nextDay.format('D').toString(),//日期 天，如6、16，不补全0
          id: nextDay.format('D').toString(),//用 日期 天，如6、16 不补全0
          date: nextDay.format('YYYY-MM-DD'), //2023-12-26,
			weekday: this.getWeekByDate(nextDay), 
			number: 0,
            dot: false,
            allowClick:false,//允许点击,只有今天 明天 后天 3天可以点
        });
    }


    return result;
},
  //教练点击
  tapCoach() {
    this.setData({
      coacScrollInto: 4,
    })
  },
  //日期点击
  tabClick(e) {
    let index = e.target.dataset.current || e.currentTarget.dataset.current;
    this.switchTab(index);
  },
  //选择日期
  switchTab(index) {
    if (this.data.tabDateIndex === index) return;

    //处理数据......
    let dateScrollInto = index - 1 < 0 ? 0 : index - 1;
    this.setData({
      tabDateIndex: index,
      dateScrollInto: this.data.dateBars[dateScrollInto].id,

      formReserveData: this.data.dateBars[index].date,
      formReserveTime: "", //清空
      disabledBottom: true, //提交按钮 不可以提交

      isLoading: true,

    }, () => {
      this.getTimeListByCoachAndDate(this.data.formCoachID, this.data.dateBars[index].date);
    })
  },

  //时间点击
  clickThisTime(e) {
    // 0未排课 1教练排课了 2及其它都是已约或占用
    let that = this;
    let _index = e.currentTarget.dataset.index || e.target.dataset.index; //当前时间选择的索引

    let tempArr = this.data.timeData; //当前时间数组  
    //如果已经是占用的
    if (tempArr[_index].state == 2) {
      util.toast("有其它按排，无法选择");
      return;
    }
    let _setState = tempArr[_index].state; //点击的 如果为0则说明要设为启用  如果为1则说明是关闭
    if (_setState === 1) {
      //点击选中的，不取消，这样用户就从初始点击后就始终保持一个
      return;
    }

    _.each(tempArr, (x, index) => {

      if (x.state !== 2) {

        x.use = (index == _index) ? true : false;
        x.state = (index == _index) ? 1 : 0;
      }
    });
    that.setData({
      timeData: tempArr,
      formReserveTime: tempArr[_index].start,
      disabledBottom: false, //提交按钮 可以提交
    })
  },
  //另外,如果只需要简单比较数组长度和元素值,可以使用 _.isEqualWith() 提供一个自定义比较函数:
  //_.isEqualWith(this.data.groupTempList, this.data.groupList, this.compareElement); // true
  compareElement(a, b) {
    return _.isEqual(a.use, b.use);
  },
  //1.获取时间列表
  getTimeJson(_date) {
    let _timestamp = (new Date()).valueOf();
    return new Promise((resolve, reject) => {
      axios.get("Coach/getPlanTime", {
        date: _date,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _date.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }, {
        headers: {
          "Content-Type": 'applciation/json',
        },
        interceptors: {
          request: true, 
          response: true 
        },
        
        validateStatus(status) {
          return status === 200;
        },
      }).then(res => {
        if (res.data.code == 1) {
          resolve(res.data.data);
        } else {
          reject(res.data.message);
        }

      }).catch((err) => {
        reject("数据处理有误");
      });
    });
  },
  //CompareDate("12:00","11:15") 时间比较
  /**
   * 当天时间比较，注意是当天，不考滤日期
   * 与当前时间比，比当前时间 后则true
   * this.CompareDateShow("16:00");
   * 如当前时间 12:00
   *11:00  返回  false
   *12:00 返回 false
   *12:01 返回 true
   * @param {*} t
   */
  CompareTimeShow(t) {
    var date = new Date();
    var nowTime = date.toTimeString().substring(0, 5); //15:35
    var a = t.split(":");
    var b = nowTime.split(":");
    if (date.setHours(a[0], a[1]) <= date.setHours(b[0], b[1])) {
      return false;
    } else {
      return true;
    }
  },
  /**
   * 日期 + 时间比较 在当前时间后面 返 true
   * @param {*} d  2023-10-10
   * @param {*} t  14:40
   * 如当前为 2023-10-10 12:00:00
   * 2023-10-10 12:00:00 返false
   * 2023-10-10 11:00:00 返false
   * 2023-10-10 12:01:00 返true
   */
  CompareDateTimeShow(d, t) {
    // 获取当前时间
    var currentDate = new Date();
    // 定义指定时间
    var specifiedDate = new Date(d + " " + t);
    // // 比较两个时间
    // if (currentDate > specifiedDate) {
    //   console.log("当前时间晚于指定时间");
    // } else if (currentDate < specifiedDate) {
    //   console.log("当前时间早于指定时间");
    // } else {
    //   console.log("当前时间等于指定时间");
    // }
    if (currentDate <= specifiedDate) {
      return true;

    } else {
      return false;
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    let _orderID = options.orderID; //订单ID，陈健用不到了,但是保存吧 formOrderID
    let _orderNo = options.orderNo;
    let _courseID = options.courseID;
    //需要验证
    if (util.isNull(_courseID) || util.isNull(_orderID) || util.isNull(_orderNo)) {

      that.setData({
        backParentErr:"参数有误"
      }, () => {
          wx.navigateBack();
          
      })
      return;
    }


    // const today = new Date();
    const today  = new Date(moment().format());

    const _dateTime = today.toISOString().slice(0, 10); //2023-09-01

    let _paramCourseID = this.data.paramCourseID.toString()

    new Promise((resolve, reject) => {

      let _timestamp = (new Date()).valueOf();
      let _courseConfig = {
        orderNo: _orderNo,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _orderNo.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }
      this.getDataJson("CourseOrder/coursePersonalRefer", _courseConfig).then(val => {

        let _course_expiration_time = val.course_expiration_time; //过期时间
        if (_course_expiration_time > 0 && util.validateDateExpiresByStamp(_course_expiration_time)) {

          that.setData({
            backParentErr:"此课程已过期,需续约!"
          }, () => {
              wx.navigateBack();
              
          })
          return;

        }
        if (val.quantity <= 0 || val.used_quantity >= val.quantity) {

          that.setData({
            backParentErr:"课程已无剩余节数!"
          }, () => {
              wx.navigateBack();
              
          })
          return;
        }
        let _courseInfo = {
          title: val.title,
          quantity: val.quantity, //总课时
          used_quantity: val.used_quantity, //已用
          course_expiration_time: _course_expiration_time
        }
        that.setData({
          loading: false,
          courseInfo: _courseInfo,
          itemBoxAnimation: "item-box-animation", //课程信息加截完后，文字动一下 

          paramOrderID: _orderID, //订单ID
          paramOrderNo: _orderNo, //订单号          
          paramCourseID: _courseID, ////课程ID

          formOrderNo: _orderNo, //要提交时 订单号

          todayDate: _dateTime, //今天日期          
          formReserveData: _dateTime, //刚进来默认今天日期



          formCourseID: _courseID, //课程ID
        }, () => {
          resolve();
        })




      }, function (err) {
        reject(err);

      })
    }).then(val => {
      new Promise(() => {
        // //测试获取 周几
        let getNextSevenDays = this.getNextSevenDays();
        that.setData({
          dateBars: getNextSevenDays,
        })

      })
    }).catch(err => {

      that.setData({
        backParentErr:"定单信息有误!"
      }, () => {
          wx.navigateBack();
          
      })
      return;

    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

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



  //获取数据,通用
  getDataJson(_url, _config, _interceptors = true) {
    let _timestamp = (new Date()).valueOf();
    return new Promise((resolve, reject) => {
      axios.get(_url, _config, {
        headers: {
          "Content-Type": 'applciation/json',
        },
        interceptors: {
          request: _interceptors, 
          response: _interceptors 
        },
        
        validateStatus(status) {
          return status === 200;
        },
      }).then(res => {
        if (res.data.code == 1) {
          resolve(res.data.data);
        } else {
          reject(res.data.message);
        }

      }).catch((err) => {
        reject("数据处理有误");
      });
    });
  },

  //其它更新返回
  callBackReturn(_object) {
    //{"headimgurl":"https://temp-.....a589a0a8d9ee.jpg","nickname":"弓长23"} 
    let that = this;
    let _selectStore = _object.selectStore;
    if (util.isNull(_selectStore)) {
      util.toast("出错,请重新选择");
      return;
    }
    let _selectID = _selectStore.id || 0;
    if (_selectID > 0 && _selectID !== this.data.formStoreID) {
      this.setData({
        formStoreID: _selectID, //记录门店ID
        selectStore: _selectStore,
        selectStoreTxt: '点击已选门店可重新选择',
        disabledBottom: true, //提交按钮 不可以提交
        formCoachID: 0, //教练选择为空
        showReserverPanel: false, //时间面板不显示
        formReserveData: this.data.todayDate, //选择的日期初始为今天
        tabDateIndex: 0, //那选择的日期就是今天了只能        
        formReserveTime: "", //清空选择的时间
        timeData: [], //时间数据还原
        timeTempList: [], //时间数据缓存的还原

      }, () => {
        this.listCoach(_selectID);

      })

    }
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {


    // 页面卸载时触发
    //触发用户中心更新头像昵称
    let pages = getCurrentPages(); //获取页面栈
    if (pages.length > 1) //判断页面栈中页面的数量是否有跳转(可以省去判断)
    {
      let prePage = pages[pages.length - 2]; //获取上一个页面实例对象
      prePage.callBackReturn({
        //headimgurl: this.data.headimgurl,
        //nickname:this.data.nickname
        storefrontCount: this.data.storeList ? this.data.storeList.length.toString() : "0" || "0",
      }); //调用上一个页面实例对象的方法
    }
    //}
  },
  //3.选择教练
  listCoach(_storeId) {
    //所属门店的教练列表
    new Promise((resolve, reject) => {
      const that = this;
      let _timestamp = (new Date()).valueOf();
      let _Config = {
        word: '',
        pageSize: 20,
        orderSet: 0,
        //orderId:this.data.paramOrderID,//订单ID 必传paramOrderNo 陈健不用了
        orderNo: this.data.paramOrderNo, //订单号 必传              
        storeId: _storeId, //门店ID

        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _storeId.toString() + this.data.paramOrderNo.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }
      this.getDataJson("Store/coach", _Config).then(val => {
        if (val.total <= 0) {
          that.setData({
            formCoachID: 0,
            showCoachPanel: false, //关闭教练选择

            formReserveData: '',
            formReserveTime: '',
            disabledBottom: true, //提交按钮 不可以提交
            showReserverPanel: false, //关闭时间选择
          }, () => {
            util.toast("该门店暂无满足您课程的教练");
          })
          return;

        }
        //数据正常
        that.setData({
          returnCoachList: val.data,
          showCoachPanel: true,
        }, () => {
          resolve();
        })
      }, function (err) {

        that.setData({
          formCoachID: 0,
          showCoachPanel: false, //关闭教练选择

          formReserveData: '',
          formReserveTime: '',
          disabledBottom: true, //提交按钮 不可以提交
          showReserverPanel: false, //关闭时间选择
        }, () => {
          util.toast("该门店暂无满足您课程的教练");
          reject(err);
        })
      })
    }).then(val => {

    }).then(val => {

    })
  },
  buttonForm(e) {
    const that = this;
    that.setData({
      PayLoading: true,
      PayLoadingTxt: '请稍候...',
      subDisabled: true //禁止提交
    })

    //提交区
    //let _formCourseID = this.data.formCourseID; //课程ID 陈总说不要
    let _formStoreID = this.data.formStoreID; //门店ID
    let _formCoachID = this.data.formCoachID; //教练ID
    let _formReserveData = this.data.formReserveData; //预约日期
    let _formReserveTime = this.data.formReserveTime; //预约时间
    let _formOrderNo = this.data.formOrderNo; //订单号

    //#region 提交约课
    new Promise((resolve, reject)  => {
      let timestamp = (new Date()).valueOf();
      let subConfig = {
        //formCourseID: _formCourseID, //课程ID 陈总说不要
        storeId: _formStoreID, //门店ID
        orderNo: _formOrderNo, //订单号
        coachId: _formCoachID, //教练ID
        resDate: _formReserveData, //预约日期
        resTime: _formReserveTime, //预约时间

        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _formStoreID.toString() + _formOrderNo.toString() + _formCoachID.toString() + _formReserveData.toString() + _formReserveTime.toString() + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }

      axios.post('BookedClass/index', subConfig, {
          headers: {
              "Content-Type": 'application/json; charset=utf-8',
          }
      })
      .then((res) => {
          const {data} = res;
          let _data = util.jsonTestParse(data); //解决返回为字符串型JSON问题
 
          resolve(_data);
      })
      .catch((error) => {
          reject(error)
      });

    }).then(_data=>{
      if(_data.code==1){
          that.setData({
              PayLoading: false,
              PayLoadingTxt: '',
              subDisabled: true //禁止提交
          }, () => {
            wx.redirectTo({
              url: '/packageA/pages/myCourse/index/index?msg='+encodeURIComponent("约课成功"),
            })
          })
          return;
      }else{
        that.setData({
          PayLoading: false,
          PayLoadingTxt: '',
          subDisabled: true ,//禁止提交

          backParentErr:_data.message
        }, () => {
            wx.navigateBack();
            
        })
        return;
      }
    }).catch(err=>{
        that.setData({
          PayLoading: false,
          PayLoadingTxt: '',
          subDisabled: true ,//禁止提交

          backParentErr:"约课出错["+err+"],请重新操作!"

        }, () => {
            wx.navigateBack();
            
        })
    })
    //#endregion 提交约课
  },

   /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    //用于上一页弹出错误提示
    if (!util.isNull(this.data.backParentErr)) { //是否需要刷新
      // 页面卸载时触发
      //触发用户中心更新头像昵称
      let pages = getCurrentPages(); //获取页面栈
      if (pages.length > 1) //判断页面栈中页面的数量是否有跳转(可以省去判断)
      {
        let prePage = pages[pages.length - 2]; //获取上一个页面实例对象
        prePage.callBackReturn({
          backParentErr: this.data.backParentErr,
        });
      }
    }

  },

}))