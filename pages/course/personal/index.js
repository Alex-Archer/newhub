const app = getApp();
var moment = require('../../../libs/moment.min');
var apis = require('../../../utils/apis.js')
import _ from '../../../libs/we-lodash'
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../utils/util.js')
var md5util = require('../../../utils/md5.js')

Page({
  data: {
    coachBars: [],
    globalURL: app.globalData.globalURL,
    agreeClick: false, //隐私是点击过的，不管是否同意的
    //底部菜单
    flag: false, //首页加载动画
    tabbarShow: true, //底部菜单不与其它冲突默认关闭
    
    indexPage: false, //是否在首页，tabbar和别人不一样
    indexBackToTop: true, //是否返回顶部
    current: 1, //tabbar 默认选中的项
    //底部按钮 在首页有效果时 与 indexPage合用,并把第一个首页隐掉
    tabBar: app.globalData.tabBar,
    safeAreaBottom: app.globalData.safeAreaBottom,
    Location:'',
    
    
    //顶部类型选择
    typeScrollInto: '', //选择后运动到的位置
    tabTypeIndex: 0, //顶部大分类 默认认选择项
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
      //   name: '包月私教',
      //   id: "3",
      //   path: '/pages/course/personalMon/index',
      // },
      // {
      //   name: '集训营',
      //   id: "4",
      //   path: '/pages/course/camp/index',
      // }
    ],
    //顶部类型选择END



    // cacheTab: [],
    dateScrollInto: '', //选择后运动到的位置
    //日期选择块END


    //小鱼下面抽整过来
    storeListData: [], //1.门店列表 首次在下拉时填充

    scrollTop: 0,

    //吸顶区==================START
    //1.顶部类型选择
    typeNavTop: 0, //顶部距离
    isTypeNavFixed: false, //是否吸顶
    //3.日期选择块
    isDataFixed: false,
    dataNavTop: 0,
    //吸顶区==================END


    //开始对接区=====================
    teachLoading: false, //数据加载中
    loadingData: true,
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
    cardid: '',
    pageSize: 5, //每页条数
    pageIndex: 1, //当前页
    orderSet: 0, //排序方式 
    lng: null, //经度坐标
    lat: null, //纬度坐标
    word: '', //关健词搜
    typeId: 0, //指定课程类别
    storeId: '', //指定门店ID
    branchName: '', //门店名称
    coachId: 0, //指定教练ID
    dateTime: '', //日期，可以是时间戳，也可是具体的日期2023-08-22
    //陈建给还有时分，暂时不用
    dateBars: [], //周日期选择
    tabDateIndex: 0, //周日期选择模块 日期默认选中项 今天
  },
  branchClick(){
    wx.navigateTo({
      url: `/pages/map/pointListView/index?typeid=2`,
    }) 
  },
  // 点击详情
  contClick(e){
    let _id = e.currentTarget.dataset.current
    // let modelData = JSON.stringify(e.currentTarget.dataset.current)
    wx.navigateTo({
      url: `/pages/newpage/detail/index?editid=${_id}`,
    })
  },
  goToStore() {
    wx.navigateTo({
      url: '/pages/store/show/index',
    })
  },
  // 老师的列表
  initLoad() {
    const that = this;
    this.getData().then(_data => {
      let _courseList = that.data.courseList;
      _.assign(_courseList, {
        lastPage: _data.lastPage,
        total: _data.total,
        data: _data.data
      });
      that.setData({
        coachBars: _courseList,
      })
    })
  },
  getCourseList(){
    let that = this
    let _courseList = that.data.courseList;
    let _config = {
      pageIndex: 6
    };
    that.setData({
      loadingData: true
    })
    apis.gets('CoursePersonal/courseReferPub',_config).then(res =>{
      console.log(res);
      _.assign(_courseList, {
        pageSize: res.lastPage,
        total: res.total,
        data: res.data
      });
      that.setData({
        courseList: _courseList,
      })
    }).catch(err => {

    })
  },
  cardClick(e) {
    console.log(e.currentTarget.dataset);
    let _detail = e.currentTarget.dataset
    let _cardid = _detail.cardid;
    let index = _detail.current;
    this.setData({
      cardid:_cardid
    })
    this.initLoad()
  },
  teachClick(e) {
    console.log(e.currentTarget.dataset);
    let _Location = wx.getStorageSync('Location');
    let _branchid = this.data.storeId
    let _branchName = this.data.branchName
    if(_branchName == ''){
      this.setData({
        branchName: _Location.title
      })
    }
    if(!_branchid){
      _branchid = _Location.id||0
    }
    let uid = e.currentTarget.dataset.userid;
    wx.navigateTo({
      url: `/pages/coach/index/index?uid=${uid}&branchid=${_branchid}`,
    }) 
    // }else{
    //   wx.navigateTo({
    //     url: `/pages/map/pointListView/index?uid=${uid}&tiao=2`,
    //   }) 
  },
  // 已购卡
  getCardList(){
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
      });
      this.setData({
        cardList:val
      })
    },function(err){
      console.log(err);
    })
  },
  yueClick(e) {
    let _id = (e.currentTarget.dataset.currid)
    wx.navigateTo({
      url: `/pages/newpage/detail/index?editid=${_id}&typeid=1`,
    })
  },
  // 选课程携带到下一个页面需要的参数，实现进页面展示当前卡项的参数
  keClick(e) {
    wx.redirectTo({
      url: `/pages/newpage/index/index?clicknum=0`,
    })
  },
  // 去购卡
  addClick(e) {
    wx.navigateTo({
      // url: `/packageB/pages/card/detailShow/index?cla=1`,
      url: `/packageB/pages/card/index/index`,
    })
  },
  agree(e) {
    console.log("用户同意隐私授权, 接下来可以调用隐私协议中声明的隐私接口")
    const that = this;
    this.setData({
      agreeClick: true //隐私是点击过的，不管是否同意的
    }, () => {
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
          // that.initLoad();
        },
        fail(res) {
          //1.2 未获取到 ，提示用户去打开 检测是否开启
          that.getLocationSetting();
        }
      });
    })


  },
  disagree(e) {
    util.toast("您将以游客身份浏览！")
    const that = this;
    this.setData({
      agreeClick: true //隐私是点击过的，不管是否同意的
    }, () => {
      that.initLoad();
    })

  },
  getData(page_index = 1) {
    let that = this;
    let teachArray = []
    this.data.coachBars = []
    let _Location = wx.getStorageSync('Location');
    let _branchid = that.data.storeId
    let _branchName = that.data.branchName
    if(_branchName == ''){
      this.setData({
        branchName: _Location.title
      })
    }
    if(!_branchid){
      _branchid = _Location.id||0
    }
    let getConfig = {
      pageSize: that.data.pageSize,
      storeId:_branchid,
      orderSet:that.data.orderSet,
      cardid:that.data.cardid
    };
    // if (page_index == 1) {
      that.setData({
        teachLoading: true
      })
    // }
    if (!util.isNull(page_index) && page_index > 1) {
      _.assign(getConfig, {
        pageIndex: page_index
      });
    }
    return new Promise((resolve, reject) => {
      apis.get("Coach/listPub", getConfig, {
        "Content-Type": 'applciation/json'
      }, false).then(val => {
        wx.hideLoading()
        val.data.forEach(el => {
         if(_.head(el.goodat) != ''){
          el.goodat = el.goodat.slice(0,2)
         }
          teachArray.push(el)
        })
        this.setData({
          coachBars:teachArray,
          teachLoading: false
        })
      }).catch(err => {
        console.log(err);
      })
    }).catch(err => {
      reject([]);
    })

  },
  onShow(){
    this.initLoad()
  },
  //获取分页数据
  getList(index, refresh) {
    let that = this;
    let activeTab = this.data.courseList;
    let setPage = activeTab.pageIndex + 1;
    this.getData(setPage).then(_data => {
      activeTab.data = activeTab.data.concat(_data.data);
      activeTab.pageIndex++;
      activeTab.isLoading = false;
      //根据实际修改判断条件
      if (_data.data.length <= 0) {
        activeTab.loadingText = '没有更多了';
      }

      this.setData({
        [`courseList`]: activeTab
      })

    })
  },

  //获取当前位置
  getLocation(callback) {
    //当前位置
    const that = this;
    //H5：使用坐标类型为 gcj02 时，需要配置腾讯地图 sdk 信息（manifest.json -> h5）
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success(res) {
        that.setData({
          lat: res.latitude,
          lng: res.longitude
        })
        callback();
      },
      fail(res) {
        callback();
      }
    });
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
                  this.initLoad();
                });
              },
              fail: () => {
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
                          if (r.authSetting['scope.userLocation']) {
                            this.getLocation(() => {
                              this.initLoad();
                            });
                          } else {
                            this.initLoad();
                          }

                        }
                      })
                    } else {
                      this.initLoad();
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
              this.initLoad();
            });
          }
        }
      })
      //#endregion 拉取用户是否开启了定位
    })
  },
  //4.菜单 - 门店列表
  getStoreList(_pagesize = 10) {
    /*
    {"currentPage":1,"lastPage":1,"total":5,"listRows":10,"data":[{"id":1,"ubid":4,"title":"阳科园店","poster":"https://temp-aoben-picture.oss-cn-shanghai.aliyuncs.com/web-images/2023/08/23/20230823%5Ce5eb38ca56cca59580f4e36a2093909d.jpg",},。。。。。。。]}
     */
    const that = this;
    return new Promise((resolve, reject) => {
      axios.get("Store/indexPub", {
        pageSize: _pagesize, //调用数量，在分页时则限制每页的数量
        pageIndex: 1, //分页调用，大于0时有效
        orderSet: 0, //排序方式
        distance: 0, //距离，单位:米
        lng: that.data.lng, //经度坐标
        lat: that.data.lat, //纬度坐标
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
    }).catch(err => {
      reject();
    })

  },
  onLoad: function (options) {
    wx.showLoading()
    let that = this;
    console.log(options);
    // 可能用不上
    // if(options.branchid){
    //   this.setData({
    //     storeId:options.branchid,
    //     branchName:options.branchName,
    //   })
    // }
    this.getCourseList(); // 课程
    this.getCardList();
    wx.hideHomeButton(); //隐HOME
    //2.获取周几菜单
    new Promise((resolve, reject) => {
      // const today = new Date();
      const today = new Date(moment().format());
      //测试获取 周几
      let getNextSevenDays = this.getNextSevenDays();

      that.setData({
        dateBars: getNextSevenDays,
        dateTime: today.toISOString().slice(0, 10),
      }, () => {
        resolve();
      })
    })

  },
  changeLocation: function (locationJson, LocationDistance) {
    this.setData({
      Location: locationJson,
      locationDistance: LocationDistance
    })
    //地图定位选择操作区====================END
  },
  // 底部菜单点击
  tabbarSwitch(e) {
    //{"index":4,"pagePath":"/pages/my/my","verify":true}
    let _action = e.detail.action || ""; //scanCode 为调用扫码
    let _navigate = e.detail.navigate || false;
    let isLogin = false;
    //"coachPath":"/pages/coach/home/index/index",//教练中心地址，不为空则需要验证身份,暂时放在集训营中来测试
    let that = this

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
            app.getOpenID(false).then(resOpenID => {
            wx.showLoading();
            // 获取到扫描到的二维码内容
            const qrCodeContent = res.result;
            //https://yoga.aoben.yoga/s=door&param=mac
            //1.必须有网址
            //2.必须有参数s
            //3.必须有参数param
            // const arrUrl="https://yoga.aoben.yoga";
            const arrUrl = app.globalData.scanURL;
            const found = qrCodeContent.indexOf(arrUrl) > -1;
            if (!found) {
              wx.showToast({
                title: '二维码错误',
                icon: 'none'
              })
              return
            }
            let _action = util.getURLParam(qrCodeContent, "s");
            let _actionTitle = "";
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
            switch (_action) {
              case "door": //开门 https://yoga.aoben.yoga/s=door&param=mac
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
                _actionTitle = err.data.message
                wx.showToast({
                  title: _actionTitle,
                  icon: 'none'
                })
                that.setData({
                  openID:resOpenID,
                  openDoorHtml:"开门失败",
                  openErrMessage:err.data.message,
                  returnHtml:"CODE 0出错："+JSON.stringify(err)
                });
        
              })
              break;
            case "locker"://开柜 https://yoga.aoben.yoga/s=locker&param=mac
            _actionTitle="开柜动作";
            // https://aoben.kshot.com
            apis.posts("Locker/qrCode",config,false).then(val=>{
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
              _actionTitle = err.data.message
              wx.showToast({
                title: _actionTitle,
                icon: 'none'
              })
              that.setData({
                openID:resOpenID,
                openDoorHtml:"开柜失败",
                openErrMessage:err.data.message,
                returnHtml:"CODE 0出错："+JSON.stringify(err)
              });
            })
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
            //   title: _actionTitle,
            //   icon: 'none'
            // })
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


  //日期选择点击
  tabClick(e) {
    let index = e.target.dataset.current || e.currentTarget.dataset.current;
    let today = e.currentTarget.dataset.day;
    console.log(e);
    this.switchTab(index);
  },


  // 右下角滚动 
  loadMore(e) {
    let index = 0
    let activeTab = this.data.courseList;

    if (activeTab.pageIndex === activeTab.lastPage) {
      return;
    }

    if (activeTab.pageIndex < 100 && !activeTab.isLoading) {
      let value = `courseList.isLoading`; //`newsList[${index}].isLoading`
      this.setData({
        [value]: true
      })
      setTimeout(() => {
        this.getList(index);
      }, 300);
    }
  },

  //页面滚动
  onPageScroll(e) {
    let scrollTop = parseInt(e.scrollTop);

    let isTypeNavFixed = scrollTop > this.data.typeNavTop;
    let isDataFixed = scrollTop > this.data.isDataFixed + 50;

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
    // wx.createSelectorQuery().select('#typeNavTop').boundingClientRect((rect)=>{
    //   if(rect&&rect.top){
    //     this.setData({
    //       typeNavTop:parseInt(rect.top)
    //     })
    //   }
    // }).exec();
    // wx.createSelectorQuery().select('#searchNavTop').boundingClientRect((rect)=>{
    //   if(rect&&rect.top){
    //     this.setData({
    //       searchNavTop:parseInt(rect.top)
    //     })
    //   }
    // }).exec();
    wx.createSelectorQuery().select('#dataNavTop').boundingClientRect((rect) => {
      if (rect && rect.top) {
        this.setData({
          dataNavTop: parseInt(rect.top)
        })
      }
    }).exec();
    // wx.createSelectorQuery().select('#dropdowNavTop').boundingClientRect((rect)=>{
    //   if(rect&&rect.top){
    //     this.setData({
    //       dropdowNavTop:parseInt(rect.top)
    //     })
    //   }
    // }).exec();
  },


  //#region  菜单点击区

  //2.选择日期
  switchTab(index) {
    let that = this;
    console.log(index);
    console.log(this.data.dateBars);
    if (this.data.tabDateIndex === index) return;
    
    let switchDate = this.data.dateBars[index].date;
    console.log(switchDate);

    let dateScrollInto = index - 1 < 0 ? 0 : index - 1;
    this.setData({
      tabDateIndex: index,
      dateScrollInto: this.data.dateBars[dateScrollInto].id
    })
    //重新获取数据
    that.setData({
      dateTime: switchDate
    })
    this.initLoad();


  },

  //#endregion 菜单点击区
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
  //#region  下拉区
  //1. 门店下拉
  btnDropStore(e) {
    let that = this;
    if (util.isNull(that.data.storeListData)) { //第一次获取的数据存起来 是否存在
      //4.获取全部门店
      that.getStoreList(10).then(res => {
        that.setData({
          storeListData: res.data, //第一次获取的数据存起来 

          //proDropIndex: index,
        })
      }).catch(c => {})
    } else {
      that.setData({
      })
    }
  },
  //#endregion  下拉区

})