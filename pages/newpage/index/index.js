const app = getApp();
const logs = require("../../../utils/logs");
import _ from '../../../libs/we-lodash'
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../utils/util.js')
var md5util = require('../../../utils/md5.js') 

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
    tabTypeIndex: 0, //顶部大分类 默认认选择项
    typeBars: [{
        name: '全部课程',
        id: "0",
        path: '/pages/newpage/index/index',
      },
      {
        name: '约团课',
        id: "1",
        path: '/pages/course/group/index',
      },
      {
        name: '约私教',
        id: "2",
        path: '/pages/course/personal/index',
      },
      {
        name: '集训营',
        id: "4",
        path: '/pages/course/camp/index',
      }
    ],
    //顶部类型选择END
    // 选择默认课程
    clicknum: 0,
    typeList:[
      {
        id:1,
        name: '初级团课',
      },
      {
        id:2,
        name: '进阶团课',
      },
      {
        id:3,
        name: '集训营',
      },
      {
        id:4,
        name: '初阶私教',
      },
      {
        id:5,
        name: '进阶私教',
      },
      {
        id:6,
        name: '高级定制',
      }
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
    leftBars: [{
        "id": "0",
        "title": "全部课程",
        "grade":-1
      },
      {
        "id": "-1",
        "title": "热门推荐",
        "grade":-1
      }
    ],
    // 左边类型选择 TAB end

    // 搜索框
    inputShowed: false,

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
          that.initLoad();
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
        that.initLoad();
    })

  },
  //整理搜索参数
  initParam(_pageIndex = 1) {
    let that = this;
    let _timestamp = (new Date()).valueOf();
    let config = {
      userID: wx.getStorageSync('USERID'),
      TIMESTAMP: _timestamp
    };

    _.assign(config, {
      typeClass: that.data.typeClass 
    });
    _.assign(config, {
      pageSize: that.data.pageSize
    });
    _.assign(config, {
      //   pageIndex: that.data.pageIndex
      pageIndex: _pageIndex
    });
    _.assign(config, {
      orderSet: that.data.orderSet
    });
    if (!util.isNull(that.data.lng)) {
      _.assign(config, {
        lng: that.data.lng
      });
    }
    if (!util.isNull(that.data.lat)) {
      _.assign(config, {
        lat: that.data.lat
      });
    }
    if (!util.isNull(that.data.word)) {
      _.assign(config, {
        word: that.data.word
      });
    }
    _.assign(config, {
      typeId: that.data.typeId
    });
    _.assign(config, {
      storeId: that.data.storeId
    });
    _.assign(config, {
      coachId: that.data.coachId
    });
    if (!util.isNull(that.data.dateTime)) {
      _.assign(config, {
        dateTime: that.data.dateTime
      });
    }

    //门店选择 //storeId
    let _storeListData = that.data.storeListData;
    if(!util.isNull(_storeListData))
    {
      let  selectedIds = _.filter(_storeListData, item => item.selected).map(item => item.id).join(',');
      _.assign(config, {
        storeId: selectedIds
      });
    }
    

    //coachId  教练
    let _coachListData = that.data.coachListData;
    if(!util.isNull(_coachListData))
    {
      let  selectedIds = _.filter(_coachListData, item => item.selected).map(item => item.id).join(',');
      _.assign(config, {
        coachId: selectedIds
      }); 
    }

    //orderSet  排序
    let _orderListData = that.data.orderListData;
    if(!util.isNull(_orderListData))
    {
      let  selectedIds = _.filter(_orderListData, item => item.selected).map(item => item.id).join(',');
      _.assign(config, {
        orderSet: selectedIds
      });
    }


    return config;
  },
  getData(page_index = 1) {
    let that = this;
    let getConfig = this.initParam(page_index);
    that.setData({
      loadingData: true
    })
    if (!util.isNull(page_index) && page_index > 1) {
      _.assign(getConfig, {
        pageIndex: page_index
      });
    }
    return new Promise((resolve, reject) => {
      axios.get("Course/coursePub", getConfig, {
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
          reject([]);
        }

      }).catch((err) => {
        reject([]);
      });
    }).catch(err => {
      reject([]);
    })

  },

  //初始状态
  initLoad() {
    const that = this;

    this.getData().then(_data => {
      let _courseList = that.data.courseList;
      _.assign(_courseList, {
        lastPage: _data.lastPage,
        total: _data.total,
        data: _data.data
      });
      //_.concat(array1, array2);
      that.setData({
        courseList: _courseList,
        loadingData: false
      })
    })
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
                              this.initLoad();
                            });
                          } else {
                            this.initLoad();
                          }

                        }
                      })
                    } else {
                      //console.log('用户点击取消')
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
  //左菜单列表
  getClassList(_type = 1) {
    return new Promise((resolve, reject) => {
      axios.get("Course/typePub", {
        id: _type
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
  //4.菜单 - 门店列表
  getStoreList(_pagesize = 10) {
    /*
    {"currentPage":1,"lastPage":1,"total":5,"listRows":10,"data":[{"id":1,"ubid":4,"title":"阳科园店","poster":"https://temp-aoben-picture.oss-cn-shanghai.aliyuncs.com/web-images/2023/08/23/20230823%5Ce5eb38ca56cca59580f4e36a2093909d.jpg",},。。。。。。。]}
     */
    const that = this;
    return new Promise((resolve, reject) => {
      axios.get("Store/indexPub", {
        pageSize:_pagesize,//调用数量，在分页时则限制每页的数量
        pageIndex:1,//分页调用，大于0时有效
        orderSet:0,//排序方式
        distance:0,//距离，单位:米
        lng:that.data.lng,//经度坐标
        lat:that.data.lat,//纬度坐标
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
  //4.菜单 - 关注的教练列表
  getCoachList() {
    const that = this;
    
    return new Promise((resolve, reject) => {

      let _timestamp = (new Date()).valueOf();
      axios.get("User/concernCoachPub", {
        TIMESTAMP: _timestamp,
        userID: wx.getStorageSync('USERID')||"",//有用户返回关注教练，没有用户ID则返回空
        FKEY: md5util.md5(wx.getStorageSync('USERID')||"" + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
          resolve([]);
        }

      }).catch((err) => {
        reject();
      });
    }).catch(err => {
      reject();
    })

  },
  onLoad: function (options) {
    let that = this;

    wx.hideHomeButton(); //隐HOME
 
    //3.获取左菜单
    this.getClassList(1).then(res => {
      let _leftBars = that.data.leftBars;
      let mergedList = _.union(_leftBars, res);
      that.setData({
        leftBars: mergedList
      })
    }).catch(c => {})

  },

 // 底部菜单点击
 tabbarSwitch(e) {
    //{"index":4,"pagePath":"/pages/my/my","verify":true}
    console.log('点击E:', JSON.stringify(e))

    let _action = e.detail.action||"";//scanCode 为调用扫码
    let _navigate = e.detail.navigate||false;
    let isLogin = false;

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
  TypeListClick(e){
    let submitString = e.currentTarget.dataset;
    if(submitString.current.id){
      this.setData({
        clicknum:submitString.index
      })
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

  popup: function () {
    this.setData({
      popupShow: !this.data.popupShow
    })
  },

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

  //1.左边菜单
  swichNav: function (e) {
    let that = this;
    let cur = e.currentTarget.dataset.current; //索引
    let classID = e.currentTarget.dataset.id; //类ID
    if (this.data.tabLeftIndex == cur) {
      return false;
    } else {
      this.setData({
        tabLeftIndex: cur,
        typeId: classID
      }, () => {
        this.checkCor();
        this.initLoad();
      })
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.tabLeftIndex > 3) {
      this.setData({
        scrollViewId: `id_${this.data.tabLeftIndex - 2}`
      })
    } else {
      this.setData({
        scrollViewId: 'id_0'
      })
    }
  },
  //2.选择日期
  // switchTab(index) {
  //   let that = this;
  //   logs.log('【选择日期】switchTab', index);
  //   if (this.data.tabDateIndex === index) return;

  //   let switchDate = this.data.dateBars[index].date;

  //   let dateScrollInto = index - 1 < 0 ? 0 : index - 1;
  //   this.setData({
  //     tabDateIndex: index,
  //     dateScrollInto: this.data.dateBars[dateScrollInto].id
  //   })
  //   //重新获取数据
  //   that.setData({
  //     dateTime: switchDate
  //   })
  //   this.initLoad();


  // },
  //3.搜索框动作 start=================
  showInput() { //搜索框点击
    this.setData({
      inputShowed: true
    })
  },
  hideInput() { //取消搜索
    this.setData({
      word: '',
      inputShowed: false
    }, () => {
      this.initLoad();
    })
    wx.hideKeyboard(); //强行隐藏键盘
  },
  clearInput() { //清除搜索文字
    this.setData({
      word: ''
    }, () => {
      this.initLoad();
    })
  },
  inputTyping: function (e) { //监听到当前输入框的值
    this.setData({
      word: e.detail.value
    })
  },
  bindInput: function (e) { //确认搜索了
    let that = this;
    let keyWord = e.detail.value;
    if (!util.isNull(keyWord)) {
      if (that.data.word === keyWord) {
        this.initLoad();
      } else {
        that.setData({
          word: keyWord
        }, () => {
          this.initLoad();
        })
      }
    }

  },
  //搜索框动作 END

  //#endregion 菜单点击区

  //弹窗 - 确认
  btnCloseDrop() {
    this.setData({
        scrollTop: 0,
        dropShow: false,
        //proDropIndex: -1
      },()=>{ //小鱼解决闪屏
          setTimeout(() => {
              this.setData({
                  dropHeaderShow:false
              })
              
          }, 200);
      })

    switch(this.data.thisDropIndex){
      case 1:
        this.setData({
          storeListData:this.data.proDropData
        })
        break;
      case 2:
        this.setData({
          orderListData:this.data.proDropData
        })
        break;
      case 3:
        this.setData({
          coachListData:this.data.proDropData
        })
        break;
      default:
        break;
    }
    if(!util.isNull(this.data.proDropData)){
    this.initLoad();//重新加载
    }



  },
  goToStore() {
    wx.navigateTo({
      url: '/pages/store/show/index',
    })

  },
  //课程详情
  groupShow(e) {
    //data-registerednum="{{courseLi.registerednum}}" data-peoplenum="{{courseLi.peoplenum}}"
    let registerednum = e.currentTarget.dataset.registerednum||e.target.dataset.registerednum;//已报人数
    let peoplenum = e.currentTarget.dataset.peoplenum||e.target.dataset.peoplenum;//报满人数
    if(Number(registerednum)>=Number(peoplenum))
    {
        util.toast("该团课人数已满");
        return;
    }    
    let currentID=e.currentTarget.dataset.id||e.target.dataset.id;
    wx.navigateTo({
      url: '/pages/course/group_show/index?id='+currentID,
    })
  },
  //#endregion  下拉区

})