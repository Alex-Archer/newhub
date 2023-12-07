const app = getApp();
var moment = require('../../../../libs/moment.min');
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../../utils/util.js')
var md5util = require('../../../../utils/md5.js')
const filter = require('../../../../utils/loginFilter');  

// 缓存最多页数
const MAX_CACHE_PAGEINDEX = 3;
// 缓存页签数量
const MAX_CACHE_PAGE = 3;

Page(filter.loginCheck(true, app, { 
  data: {
    today:null,
    groupEditDate:'',//当前日期，只是显示

    // 团课日期选择块
    newsList: [
      {
        "data": [],
        "isLoading": true,
        "lastPage": 1,
        "loadingText": "正在加载...",
        "noData": false,
        "pageIndex": 1,
        "refreshText": "",
        "refreshing": false
      }
    ],//初始写组数据,为了有加载效果

    cacheTab: [],
    tabIndex: 0,
    dateBars:[],//日期
    dateBarsTotal:[0,0,0,0,0,0,0],//7天数据 BookedClass/coachClassSevenDay
    
    scrollInto: '',


    pulling: false,

    
    tabBarCurrent:1, //tabbar 默认选中的项
    tabBar: app.globalData.coachTabBar,//教练菜单

  },
  /**
     *拨打用户电话
     * @param {*} e 
     */
    callUserMobile(e){
      let _tel = e.currentTarget.dataset.tel||e.target.dataset.tel;
      if(!util.isNull(_tel))
      {
        wx.makePhoneCall({
          phoneNumber: _tel
        });
      }
    },
    //教练签到
    signScan(e){
     let _coachID = e.currentTarget.dataset.id||e.target.dataset.id;
      wx.scanCode({
        onlyFromCamera: true,
        success(res) {
            console.log(res)
        }
      })

    },
    //学员签到码
    signCode(e){
      let _coachID = e.currentTarget.dataset.id||e.target.dataset.id;
      //scene 场景设定
      //0.或空-去到个人主页 1.推广-转到私教课程推广页有分成  2.学员签到-需有教练ID、学员ID、课程ID
      wx.navigateTo({
        url: '/pages/coach/home/setting/qrcode/my/index?scene=2&coachID='+_coachID,
      })
      return;


    },
  //#region  周日期操作模块
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

          weekday: this.getWeekByDate(nextDay), //解决 https://www.codenong.com/cs106059340/
          number: 0,
          dot: false,
          allowClick:false,//允许点击,只有今天 明天 后天 3天可以点
      });
  }


  return result;
},
//#endregion  周日期操作模块
 //教练签到
 signScan(e){
  logs.log("11111111111签到扫描",e,true)
  let _coachID = e.currentTarget.dataset.id||e.target.dataset.id;
  wx.scanCode({
    onlyFromCamera: true,
    success(res) {
        console.log(res)
    }
  })

},
//学员签到码
signCode(e){
  let _coachID = e.currentTarget.dataset.id||e.target.dataset.id;
  //scene 场景设定
  //0.或空-去到个人主页 1.推广-转到私教课程推广页有分成  2.学员签到-需有教练ID、学员ID、课程ID
  wx.navigateTo({
    url: '/pages/coach/home/setting/qrcode/my/index?scene=2&coachID='+_coachID,
  })
  return;


}, 
/**
 * 获取7天数据统计
 */
getDateBarsTotal(){
  let _timestamp = (new Date()).valueOf();
  let config = {
      userID: wx.getStorageSync('USERID'),
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
  };
  return new Promise((resolve, reject) => {
      axios.get("BookedClass/coachClassSevenDay", config, {
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
              let _data = util.jsonTestParse(res.data.data); //解决返回为字符串型JSON问题
              //"currentPage":1,"data":[],"lastPage":3,"listRows":10,"total":21} 
              resolve(util.jsonTestParse(_data));
          } else {
              reject([]);
          }
      }).catch((err) => {
          reject([]);
      });
  })
},
onLoad: function (options) {
      //需要判断是否是教练
      if(util.isNull(wx.getStorageSync('ISCOACH')))
      {
          wx.reLaunch({
            url: "/pages/user/home/index"
          })
          return;
      }

    wx.hideHomeButton();
    const that = this;
    // const today = new Date();
    const today  = new Date(moment().format());
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    //1. 今天日期
    new Promise(() => {
        that.setData({
            today:{
                day:day.toString().padStart(2,"0"),//补全0
                week:this.getWeekByDate(today),
                date:`${year}年${month}月`
            },
            //groupEditDate:`${year}年${month}月${day}日`,
            //groupSubmitDate:`${year}-${month.toString().padStart(2,"0")}-${day.toString().padStart(2,"0")}`
        })
    })

     //1.获取日程 并带点点
     new Promise(() => {
        //const today = new Date();
        //测试获取 周几
        let getNextSevenDays = this.getNextSevenDays();
        that.setData({
            dateBars: getNextSevenDays,
            dateTime: today.toISOString().slice(0, 10),
        },()=>{
        this.getDateBarsTotal().then(val=>{

            that.setData({
              dateBarsTotal:val
            })
          })
        })


    })

    //2.获取今天数据
    let _data = year + "-" + month.toString().padStart(2,"0") + "-" + day.toString().padStart(2,"0");
    this.getDataJson(_data,1).then(_thisData => {
        this.setData({
            newsList: util.isNull(_thisData)?this.initNotData():this.initData(_thisData)
        })
    }, function (err) { 
        
        that.setData({
            newsList: that.initNotData()
        })
    });



  },

  //2.获取数据
  getDataJson(_date, _pageIndex = 1) {

    let _timestamp = (new Date()).valueOf();
    let config = {
        resDate: _date, 
        pageIndex:1,
        pageSize:100,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _date.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    };
    return new Promise((resolve, reject) => {
        axios.get("BookedClass/coachClass", config, {
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
                let _data = util.jsonTestParse(res.data.data); //解决返回为字符串型JSON问题
                resolve(util.jsonTestParse(_data));
            } else {
                reject([]);
            }
        }).catch((err) => {
            reject([]);
        });
    })
},
//3.1无数据
initNotData(){
    let ary = [];
    for (let i = 0, length = this.data.dateBars.length; i < length; i++) {
        let aryItem = {
            loadingText: '正在加载...',
            refreshing: false,
            refreshText: '',
            data: [],
            isLoading: false,
            pageIndex: 1,
            lastPage: 1, //小鱼加，数据来的最大页
            noData:true, //小鱼加 有没有数据，默认不显示
        };
        
        ary.push(aryItem);
    }
    return ary;
},
//3.2 数据格式化
initData(_defaultData) {
    //小鱼加获取初始第一屏数据,只有这里时机合适
    let ary = [];
    for (let i = 0, length = this.data.dateBars.length; i < length; i++) {
        let aryItem = {
            loadingText: '正在加载...',
            refreshing: false,
            refreshText: '',
            data: [],
            isLoading: false,
            pageIndex: 1,
            lastPage: 1, //小鱼加，数据来的最大页
            noData: false, //小鱼加 有没有数据，默认不显示
        };
        //只有指定的tab先填充数据
        if (i === this.data.tabIndex) {
            aryItem.lastPage =1;
            aryItem.pageIndex = 1;
            if (_.size(_defaultData)>0) {
                aryItem.noData = false;
            } else {
                aryItem.noData = true;
            }
            aryItem.data = aryItem.data.concat(_defaultData);
        } else {
            aryItem.pageIndex = 1;
        }
        ary.push(aryItem);
    }
    return ary;
},
  /**
     * 获取数据 - 下拉刷新 上拉加载更多合用
     * @param {*} index  tab的索引，配合了获取的类型  payState: _payType, //0全部 1待支付 2已支付 3售后
     * @param {*} refresh  是否下拉刷新,true:下拉刷新    false：上拉加载更多
     */
    getList(index, refresh) {
        let  _selectDate = this.data.dateBars[index].date;//当天日期
        let activeTab = this.data.newsList[index];
        let _pageIndex = refresh ? 0 : activeTab.pageIndex; //当前,如果是下拉刷新设为0，加1后正常
        this.getDataJson(_selectDate, _pageIndex + 1).then(list => 
        {
            if (refresh) {
                activeTab.data = [];
                activeTab.loadingText = '正在加载...';
                activeTab.data = list || [];
                if (_.size(list) > 0) {
                    activeTab.noData = false;
                } else {
                    activeTab.noData = true;
                }

            } else {
                activeTab.data = activeTab.data.concat(list);
                activeTab.isLoading = false;

                if (_.size(list) > 0) {
                    activeTab.noData = false;
                } else {
                    activeTab.noData = true;
                }
                activeTab.loadingText = '没有更多了';
            }
            this.setData({
                [`newsList[${index}]`]: activeTab
            })
        }, function (err) { 
            activeTab.data = [];
            activeTab.loadingText = '正在加载...';
            activeTab.isLoading = false;
            activeTab.pageIndex = 1;
            activeTab.lastPage = 1;
            activeTab.noData = true;
            that.setData({
                [`newsList[${index}]`]: activeTab
            })
        });
    },
  goDetail(e) {

        wx.navigateTo({
      url: '/packageA/pages/order/detail/index?id=1',
    })
  },
  //上拉加载更多
  loadMore(e) {

    let index = this.data.tabIndex
    let activeTab = this.data.newsList[index];
    if (activeTab.pageIndex < activeTab.lastPage && !activeTab.isLoading) {
        let value = `newsList[${index}].isLoading`
        this.setData({
            [value]: true
        })
        setTimeout(() => {
            this.getList(index);
        }, 300);
    }
},
//下拉刷新
onrefresh(e) {
    let index = this.data.tabIndex;
    var tab = this.data.newsList[index];
    if (tab.refreshing) return;
    this.setData({
        [`newsList[${index}].refreshing`]: true,
        [`newsList[${index}].refreshText`]: '正在刷新...'
    })

    setTimeout(() => {
        this.getList(index, true);
        this.setData({
            pulling: true,
            [`newsList[${index}].refreshing`]: false,
            [`newsList[${index}].refreshText`]: '刷新成功',
            [`newsList[${index}].refreshFlag`]: false
        })
        setTimeout(() => {
            this.setData({
                pulling: false
            })
        }, 500);
    }, 500);
},
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
  switchTab(index) {//111
    if (this.data.tabIndex === index) return;
    if (this.data.newsList[index].data.length === 0) {
      this.setData({
        [`newsList[${index}].isLoading`]: true,
        [`newsList[${index}].noData`]: false,                
    })
      this.getList(index);
    }
    // 缓存 tabId
    if (this.data.newsList[this.data.tabIndex].pageIndex > MAX_CACHE_PAGEINDEX) {
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

  // 底部菜单点击
  tabbarSwitch(e) {
    let isLogin = false
    if (e.detail.verify && !isLogin) {
      wx.showToast({
        title: '您还未登录，请先登录',
        icon: "none"
      })
    } else {
      if (e.detail.index != this.data.tabBarCurrent) {
        //临时用用
        if (e.detail.pagePath == "/pages/coach/home/door/index")
        {      
            //https://developers.weixin.qq.com/miniprogram/dev/api/device/scan/wx.scanCode.html
            wx.scanCode({
                onlyFromCamera: false,//禁止相册
                scanType:['qrCode'],//只识别二维码
                success: (res) => {
                    wx.showLoading();
                    // 获取到扫描到的二维码内容
                    const qrCodeContent = res.result;
                    //https://yoga.aoben.yoga/s=door&param=mac
                    //1.必须有网址
                    //2.必须有参数s
                    //3.必须有参数param
                     // const arrUrl="https://yoga.aoben.yoga";
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
                              icon:'none'
                          })
                        }
                      });
                  }
            }) 
            return;
        }
        //临时用用
        if (e.detail.pagePath == "/packageA/pages/order/list/index")
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
  cancelSelectedDates(){
    wx.navigateTo({
      url: '/pages/coach/home/scheduleTable/index',
    })
  },
 
//#endregion 菜单点击
}))
