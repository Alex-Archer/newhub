const app = getApp(); 
var moment = require('../../../../libs/moment.min');
const logs = require("../../../../utils/logs");
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
import _ from '../../../../libs/we-lodash'
var md5util = require('../../../../utils/md5.js')
var util = require('../../../../utils/util.js')
const filter = require('../../../../utils/loginFilter'); //1.登录验证
// 缓存最多页数
const MAX_CACHE_PAGEINDEX = 3;
// 缓存页签数量
const MAX_CACHE_PAGE = 3;
// Page({
Page(filter.loginCheck(true, app, { 
    data: {
      
        preventOnShow:true,//3.登录验证  需要登录时，阻止ONSHOW 4.在页面中 wx:if="{{!preventOnShow}}"防跳转时显示页面
        globalURL: app.globalData.globalURL,
        today:null,

        user:null,
        welcomeMessage:'',
        certificateCount:0,//证书数
        storefrontCount:0,//场馆数

        courseCount:0,//为下面的加起来
        dateBarsTotal:[0,0,0,0,0,0,0],//7天数据 BookedClass/coachClassSevenDay



        //导航菜单
        flag: true, //首页加载动画
        tabbarShow: true, //底部菜单不与其它冲突默认关闭



        indexBackToTop: false, //是否返回顶部
        current: 4, //tabbar 默认选中的项
        //底部按钮 在首页有效果时 与 indexPage合用,并把第一个首页隐掉
        safeAreaBottom: app.globalData.safeAreaBottom,


        top: 0, //标题图标距离顶部距离
        scrollTop: 0.5,


        gifSetting: {
            shake: false, // 是否开启下拉震动
            height: 70,
            background: {
                color: '#eeeeee',
                // img: '/static/urlimg/tm_mui_yujia.gif'
                //img: app.globalData.globalURL+ '/miniprogram/url-img/tm_mui_yujia.gif'
                img: app.globalData.globalURL+'/miniprogram/loading_top.gif?v=202309192303'
            },
        },

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

    scrollInto: '', //选择后运动到的位置
        tabDateIndex: 1, //日期选择模块 日期默认选中项
        //日期选择块END

        tabBarCurrent: 4,
        tabBar: app.globalData.coachTabBar,//教练菜单



        //休息相关
        restToday:0,//今天是否休息
        showActionSheet: false,
        tips: "设置休息后将无法接约，您确认休息吗？",
        actionItemList: [
          { text: "确认休息 半 小时",color: "#E3302D"},
          { text: "确认休息 一 小时",color: "#E3302D"},
          { text: "确认休息 两 小时",color: "#E3302D"}   
      ],
        maskClosable: true, //可以点击外部任意地方关闭
        color: "#9a9a9a",
        size: 26,
        isCancel: true,
        dateTime:'',

    },
    onShow(e){
      if(this.data.preventOnShow) return;//5.登录验证  需要登录时，阻止ONSHOW 
  
  },
    /**
     *拨打用户电话
     * @param {*} e 
     */
    callUserMobile(e){
      logs.log("111111111",e,true)
      //:{"type":"tap","timeStamp":9519,"target":{"id":"","dataset":{"tel":"18962671981"}},"currentTarget":{"id":"","dataset":{"tel":"18962671981"}},"mark":{},"detail":{"index":0},"mut":false}
      let _tel = e.currentTarget.dataset.tel||e.target.dataset.tel;
      if(!util.isNull(_tel))
      {
        wx.makePhoneCall({
          phoneNumber: _tel
        });
      }
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

      result.push({
          name:today.format('D').toString(),//日期 天，如6、16，不补全0
          id: today.format('D').toString(),//用 日期 天，如6、16 不补全0
          date: today.format('YYYY-MM-DD'), //2023-12-26,
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
              // BUG出现 ios正常，华为安卓上是英文 周 日 月 年的格式
              weekday: this.getWeekByDate(nextDay), 
              number: 0,
              dot: false,
              allowClick:false,//允许点击,只有今天 明天 后天 3天可以点
          });
      }


      return result;
  },
    onLoad(options) {

      if(util.isNull(wx.getStorageSync('ISCOACH')))
      {
          wx.reLaunch({
            url: "/pages/user/home/index"
          })
          return;
      }


      const that = this;
      const today = new Date(moment().format());//new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      //1. 今天日期
      new Promise(() => {
        that.setData({
          today: {
            day: day.toString().padStart(2, "0"), //补全0
            week: this.getWeekByDate(today),
            date: `${year}年${month}月`
          },
          //groupEditDate:`${year}年${month}月${day}日`,
          //groupSubmitDate:`${year}-${month.toString().padStart(2,"0")}-${day.toString().padStart(2,"0")}`
        })
      })

      

      new Promise(() => {
        //===================原=================
        let _timestamp = (new Date()).valueOf();
        let config = {
          userID: wx.getStorageSync('USERID'),
          TIMESTAMP: _timestamp,
          FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        }
        this.getController("coach/baseInfo", config).then(val => {
        
          //_.set(val, `revenue`, '0.00'); //营收
         
          let _thisTabBar = this.data.tabBar;

          let _msgNum = val.msgmum; //消息数
          let _schedulenum = val.schedulenum; //日程数   

          /*
          //日程栏
          _.set(_thisTabBar, `[1].num`, _schedulenum); //消息数
          _.set(_thisTabBar, `[1].isDot`, _schedulenum > 99 ? true : false); //消息数
          //消息栏
          _.set(_thisTabBar, `[3].num`, _msgNum); //消息数
          _.set(_thisTabBar, `[3].isDot`, _msgNum > 99 ? true : false); //消息数
          */

          that.setData({
            storefrontCount: val.storefrontCount || 0, //场馆数
            certificateCount: val.certificateCount || 0, //证书数
            user: val,
            welcomeMessage: util.welcomeMessage(val.nickname),
            tabBar: _thisTabBar,
            restToday:val.rest,//今天是否休息
          }, () => {
            app.globalData.coachTabBar = this.data.tabBar;
            //计算日程总数 和 红点点
            this.getDateBarsTotal().then(val=>{
              that.setData({
                dateBarsTotal:val,
                courseCount:_.sum(val),
              })
            })
          })
        })


   
      },function(err){
        logs.log("11111111111111");

      })


//1.获取日程 并带点点
new Promise((resolve, reject) => {
  //const today = new Date();
  //测试获取 周几
  let getNextSevenDays = this.getNextSevenDays();
  that.setData({
    dateBars: getNextSevenDays,
    dateTime: today.toISOString().slice(0, 10),
  }, () => {
    resolve()
  })
}).then(val => {
  //2.获取今天数据
  let _data = year + "-" + month.toString().padStart(2, "0") + "-" + day.toString().padStart(2, "0");
  this.getDataJson(_data, 1).then(_thisData => {
    this.setData({
      newsList: util.isNull(_thisData) ? this.initNotData() : this.initData(_thisData)
    })
  }, function (err) { 
    
    that.setData({
      newsList: that.initNotData()
    })
  });
})





    },
    getDataJson(_date, _pageIndex = 1) {

        let _timestamp = (new Date()).valueOf();      
        let config = {
            pageSize: 10,
            resDate:_date,
            pageIndex: _pageIndex,
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
        if (i === this.data.tabIndex) 
        {
          aryItem.pageIndex = 1;
            aryItem.data = aryItem.data.concat(_defaultData);
        } else {
            aryItem.pageIndex = 0;
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
        const that = this;
        let  _selectDate = this.data.dateBars[index].date;//当天日期
        let activeTab = this.data.newsList[index];
        let _pageIndex = refresh ? 0 : activeTab.pageIndex; //当前,如果是下拉刷新设为0，加1后正常
        this.getDataJson(_selectDate, _pageIndex + 1).then(list => {
            if (refresh) {
                activeTab.data = [];
                activeTab.loadingText = '正在加载...';
                activeTab.pageIndex = 1;
                activeTab.lastPage = 1;
                activeTab.data = list || [];
                if (_.size(list) > 0) {
                    activeTab.noData = false;
                } else {
                    activeTab.noData = true;
                }

            } else {
                activeTab.data = activeTab.data.concat(list);
                activeTab.pageIndex=1;
                activeTab.lastPage = 1;
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
    // 底部菜单点击
    tabbarSwitch(e) {
        logs.log("【tabbarSwitch 点击】", e.detail, true);
        let isLogin = false
        if (e.detail.verify && !isLogin) {
            wx.showToast({
                title: '您还未登录，请先登录',
                icon: "none"
            })
        } else {
            logs.log("【tabbarSwitch 当前菜单】", this.data.tabBarCurrent, true);
            if (e.detail.index != this.data.tabBarCurrent) {

                //临时用用
                if (e.detail.pagePath == "/pages/coach/home/door/index") {
                    wx.scanCode({
                        onlyFromCamera: false, //禁止相册
                        scanType: ['qrCode'], //只识别二维码
                        success: (res) => {
                            wx.showLoading();
                            // 获取到扫描到的二维码内容
                            const qrCodeContent = res.result;
                            logs.log("11111111111扫码内容",qrCodeContent,true)
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
                                        icon: 'none'
                                    })
                                }
                            });
                        }
                    })
                    return;
                }
                //临时用用
                if (e.detail.pagePath == "/packageA/pages/order/list/index") {
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
    
    initNavigation(e) {
        this.setData({
            top: e.detail.top
        })
    },
    onPageScroll(e) {
        logs.log("【onPageScroll】")
        this.setData({
            scrollTop: e.scrollTop
        })
    },
    indexRestore(e) {
        this.onLoad();

    },
    indexRefresh(e) {


    },
    indexScroll(e) {
        this.setData({
            scrollTop: e.detail.detail.scrollTop //e.scrollTop
        })

    },
    indexLoadmore(e) {
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

    //   扫一扫开门
scanCode() {
        // 只允许从相机扫码
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
    topJump(e) {
        let _this = this;
        let _dataset = e.currentTarget.dataset;

        let _islogin = _dataset.islogin;
        let _navigate = _dataset.navigate;
        let _url = _dataset.url;
        if (_islogin) {

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
                    //url: _url+(_dataset.userinfo?"?u="+encodeURIComponent(JSON.stringify(_this.data.user)):""),
                    url: _url,
                })
            } else {
                
                wx.reLaunch({
                    url: _url
                })
            }
        }


    },
    

    //其它更新返回
    callBackReturn(_object) {
 
        let that = this;
        if(!_object){
            return;
        }
        //场馆数
        if(_.has(_object, 'storefrontCount'))
        {
            let _storefrontCount = Number(_object.storefrontCount)||0;
                if(_storefrontCount!=this.data.storefrontCount){
                that.setData({
                    storefrontCount: _object.storefrontCount||0,//证书数
                })
            }
        }
        //证书数
        if(_.has(_object, 'certificateCount'))
        {
            let _certificateCount = Number(_object.certificateCount)||0;
                if(_certificateCount!=this.data.certificateCount){
                that.setData({
                    certificateCount: _object.certificateCount||0,//证书数
                })
            }
        }
    },
    getController(url,config) {
        return new Promise((resolve, reject) => {
            
            axios.get(url, config, {
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
              resolve(util.jsonTestParse(_data));
          } else {
              reject([]);
          }
      }).catch((err) => {
          reject([]);
      });
  })
},


//#region 休息操作区
actionButtons(e)
    {
        const that = this;
        let _actionType = e.currentTarget.dataset.ac || e.target.dataset.ac||0;//是0 必须要加
        
        if(_actionType==0){
            that.setData({
                tips: "设置休息后将无法接约，请选择休息时长！",
                actionItemList: [
                  { text: "休息 0.5 小时",color: "#E3302D"},
                  { text: "休息  1  小时",color: "#E3302D"},
                  { text: "休息  2  小时",color: "#E3302D"}   
              ],
                showActionSheet: true
            })
        }else{
            that.setData({
                tips: "取消休息后用户将可以约您，确认正常工作吗？",
                actionItemList: [{ text: "确认解除休息",color: "#319fa6"}],
                showActionSheet: true
            })
        }
    },
    //面板点击 操作 确认
    actionItemClick(e) 
    {
      const that = this;
        let _restDate = this.data.dateTime;
        let _restType = this.data.restToday||0;
        if(_restType===0)
        {//设置休息
            this.confirmRest(_restDate,1);//设置休息

        }else{//解除休息
            this.confirmRest(_restDate,0);//解除休息

        }
        

    },
    //面板关闭
    closeActionSheet(e) {
        this.setData({
            showActionSheet: false
        })
    },
    //操作休息/工作
    confirmRest(_restDate,_restType)
    {
        let that = this;
        this.restController(_restDate,_restType).then(val => {
            if(_restType===0){
                util.toast("成功设置个人状态为正常工作", null, null, (e) => {
                    this.setData({
                        tips: "设置休息后将无法接约，您确认休息吗？",
                        actionItemList: [{ text: "确认休息",color: "#E3302D"}],
                        showActionSheet: false,
                        restToday:0,
                    })
                });
            }else{
                util.toast("成功设置个人状态为休息", null, null, (e) => {
                    this.setData({
                        tips: "取消休息后用户将可以约您，确认正常工作吗？",
                        actionItemList: [{ text: "确认解除休息",color: "#319fa6"}],
                        showActionSheet: false,
                        restToday:1,
                    })
                });
            }

        },function(err){
            util.toast(err, null, null, (e) => {
                that.setData({
                    tips: "设置休息后将无法接约，您确认休息吗？",
                    actionItemList: [{ text: "确认休息",color: "#E3302D"}],
                    showActionSheet: false
                })
            });
        })
    },
    restController(_restDate,_restType){
        let _timestamp = (new Date()).valueOf();
        return new Promise((resolve, reject) => {
            axios.get("Coach/sendRest", {
                date: _restDate,
                rest:_restType,//休息，0=不休息
                userID: wx.getStorageSync('USERID'),
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5(wx.getStorageSync('USERID') +_restDate.toString()+ _restType.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
//#region 休息操作区END
}))