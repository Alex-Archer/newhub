const app = getApp();
const md5util = require('../../../utils/md5.js');
const logs = require('../../../utils/logs.js'); //日志打印 
import _ from '../../../libs/we-lodash'
const QQMapWX = require('../../../libs/qqmap-wx-jssdk.1.2.js');
var util = require('../../../utils/util.js')
var apis = require('../../../utils/apis.js')
Page({
  data: {
    teach:'', // 从教练列表跳过来的
    tiao: '', // 从私教跳过来的 
    teachid: '', // 从私教跳过来的 
    typeid: '', // 从团课跳过来的 
    editid: '', // 课程详情id 
    loading: true,
    pageIndex: 1,
    pageSize: 10,
    lastPage: 1, //最后一页
    isLoading: true, //上拉加载中
    refreshing: false, //下拉刷新中
    keywords: '',

    //胶囊位置
    statusBar: app.globalData.statusBar,
    customBar: app.globalData.customBar,
    navBarHeight: app.globalData.navBarHeight,

    inputShowed: false,
    inputVal: '',

    qqmapsdk: app.globalData.MapQQ.MapSDK,
    key: app.globalData.MapQQ.MapKey, 
    lat: app.globalData.MapQQ.lat,
    lng: app.globalData.MapQQ.lng, //默认市政府
    scale: 16, //地图默认级别
    setting: { // 使用setting配置，方便统一还原
      rotate: 0,
      skew: 0,
      enableRotate: true,
    },
    minScale: 3,
    maxScale: 20,
    isOverLooking: false,
    covers: [],
    address: [],

    //agreeClick: false, //隐私是点击过的，不管是否同意的
    agreePrivacy: false, //是否同意了隐私
    Location: null,

    backParentErr: '',


    dropdownlistIcon: false, //下拉是否显示图标
    dropdownIndex: 4,
    dropdownIndexText: "全部门店",

    dropdownlistData: [{
        name: "全部门店",
        icon: "wechat",
        color: "#80D640",
        size: 30,
        id: 0
      },
      {
        name: "昆山市",
        icon: "wechat",
        color: "#80D640",
        size: 30,
        id: 3
      }, {
        name: "常熟市 ",
        icon: "alipay",
        color: "#00AAEE",
        size: 30,
        id: 15
      }, {
        name: "姑苏区 ",
        icon: "alipay",
        color: "#00AAEE",
        size: 30,
        id: 16
      }, {
        name: "虎丘区",
        icon: "alipay",
        color: "#00AAEE",
        size: 30,
        id: 17
      }, {
        name: "太仓市 ",
        icon: "alipay",
        color: "#00AAEE",
        size: 30,
        id: 18
      }, {
        name: "吴江区 ",
        icon: "alipay",
        color: "#00AAEE",
        size: 30,
        id: 19
      }, {
        name: "吴中区",
        icon: "bankcard-fill",
        color: "#ff7900",
        size: 28,
        id: 20
      }, {
        name: "相城区 ",
        icon: "wechat",
        color: "#80D640",
        size: 30,
        id: 21
      }, {
        name: "张家港市",
        icon: "alipay",
        color: "#00AAEE",
        size: 30,
        id: 22
      }, {
        name: "苏州工业园区 ",
        icon: "alipay",
        color: "#00AAEE",
        size: 30,
        id: 42
      }
    ],
    dropdownShow: false,

    paramAreaId: 0,
    noData: false,

  },
  agree(e) {
    console.log("用户同意隐私授权, 接下来可以调用隐私协议中声明的隐私接口")
    this.setData({
      agreePrivacy: true
    }, () => {
      //拉取用户是否开启了定位===========
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
                  this.getPoiAround(this.data.keywords);
                });

              },
              fail: () => {
                //this.openConfirm() //如果拒绝，在这里进行再次获取授权的操作
                // 再次获取授权，引导客户手动授权
                wx.showModal({
                  content: '检测到您没打开此小程序的位置消息功能，是否去设置打开？',
                  confirmText: "确认",
                  cancelText: "取消",
                  success: (res) => {
                    //点击“确认”时打开设置页面
                    if (res.confirm) {
                      wx.openSetting({
                        success: (r) => {
                          if (r.authSetting['scope.userLocation']) {
                            this.getLocation(() => {
                              this.getPoiAround(this.data.keywords);
                            });
                          } else {
                            this.getPoiAround(this.data.keywords);
                          }

                        }
                      })
                    } else {
                      console.log('用户点击取消')
                      this.getPoiAround(this.data.keywords); //仅使用默认定位坐标
                    }
                  }
                })
                // 再次获取授权，引导客户手动授权END

              }
            })
          } else {
            // 用户已授权，其他操作
            this.getLocation(() => {
              this.getPoiAround(this.data.keywords);
            });
          }
        }
      })
    })
    //拉取用户是否开启了定位 end===========
  },
  disagree(e) {
    this.setData({
      agreePrivacy: false
    }, () => {
      util.toast("您将以游客身份浏览！")
      this.getPoiAround(this.data.keywords); //仅使用默认定位坐标
    })
  },
  goMap() {
    wx.redirectTo({
      url: '../point/index',
    })

  },
  onShow(e) {

  },
  onLoad: function (options) {
    let that = this;
    this.data.qqmapsdk = new QQMapWX({
      key: this.data.key
    });
    that.setData({
      teach: options.teach, // 教练列表调转
      tiao: options.tiao, // 判断是从哪里跳转的1是团课,2是私教
      editid: options.editid, //团课跳转带的课程id
      typeid: options.typeid, // 什么类型的课程 // 1是团课,2是私教
      teachid: options.uid, // 老师id
      keywords: options.key || '',
      Location: wx.getStorageSync('Location'),

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
        }, () => {
          callback();
        })

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
                  this.getPoiAround();
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
                          if (r.authSetting['scope.userLocation']) {
                            this.getLocation(() => {
                              this.getPoiAround();
                            });
                          } else {
                            this.getPoiAround();
                          }

                        }
                      })
                    } else {
                      this.getPoiAround();
                    }
                  }
                })
                // 再次获取授权，引导客户手动授权END
              }
            })
          } else {
            // 用户已授权，其他操作
            logs.log("用户已授权，其他操作,列取附定定位数据")
            this.getLocation(() => {
              //2.加载初始数据
              this.getPoiAround();
            });
          }
        }
      })
      //#endregion 拉取用户是否开启了定位
    })
  },


  //拉取位置点位
  getPoiAround(_pageIndex = 0) {

    const that = this;
    let _timestamp = (new Date()).valueOf();
    let _config = {
      areaId: this.data.paramAreaId,
      word: util.isNull(this.data.keywords) ? '' : this.data.keywords,
      lat: this.data.lat,
      lng: this.data.lng,
      //distance: 5000, //搜索距离 米
      orderSet: '', //排序 1评分 2人气 

      pageSize: this.data.pageSize,
      pageIndex: _pageIndex + 1,
      userID: wx.getStorageSync('USERID'),
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    }
    apis.get("store/indexPub", _config, {
      "Content-Type": 'applciation/json'
    }, false).then(val => {
      let _data = val;

      if (util.isNull(_data.data) || _data.data.length <= 0) {
        that.setData({
          noData: true,
          isLoading: false,
          address: [],
          pageIndex: 1,
          loading: false,
        })

      } else {

        that.setData({
          noData: false,
          isLoading: false,
          address: _data.data,
          pageIndex: 1,
          lastPage: _data.lastPage,
          loading: false,
        })
      }

    })

  },
  //数据格式化
  getResult(data) {

    let addr = [];
    for (let [index, item] of data.entries()) {

      let tel = item.tel;
      if (~tel.indexOf(';')) {
        tel = tel.split(';')[0];
      }
      //let _distance = this.calculateTwoPlaceDistance(item.location.lat,item.location.lng);
      //1.要钱太贵，服务端算出来吧
      //distancArr.push([item.location.lat, item.location.lng])

      addr.push({
        id: item.id,
        latitude: item.location.lat,
        longitude: item.location.lng,
        businessStartTime: item.businessStartTime,
        businessEndTime: item.businessEndTime,
        listPoster: item.listPoster,
        title: item.title,
        poster: item.poster,
        score: item.score,
        commentnum: item.commentnum,
        label: item.label,
        address: item.address,
        tel: item.tel,
        selected: item.selected,
        //distance: item._distance  //因为是本地数据了，所以要重新计算
        //distance: ""
        distance: item.distance
      });
    }

    // const sortedArr = _.orderBy(addr, ['distance'], ['asc']); // 按距离升序排列
    // const result = _.concat(sortedArr.filter(obj => obj.id === 5), sortedArr.filter(obj => obj.id !== 5));

    //将已选中的列到第一位,距离升序排列
    /*
    let _Location = wx.getStorageSync('Location')||null;
    let _topLocationID = 0;//在顶部第一个是选中的ID
    let _resultAddress = null;
    if(!util.isNull(_Location))
    {
        _topLocationID = _Location.id;
        if(_topLocationID>0)
        {
            let sortedArr = _.orderBy(addr, ['distance'], ['asc']); // 按距离升序排列
            _resultAddress = _.concat(sortedArr.filter(obj => obj.id === _topLocationID), sortedArr.filter(obj => obj.id !== _topLocationID));

        }
    }*/
    //将已选中的列到第一位,距离升序排列END

    /*2.要钱太贵，服务端算出来吧
    if (this.data.agreePrivacy) { //未同意隐私就出0，不计算距离
        this.calculateMorePlaceDistance(distancArr); //批量算出距离

    }
    */

    /*比较数组有没有变化
    if(_.isEqual(this.data.address,addr)){
      logs.log("数据没有变化，暂时不动！");
      return;
    }
    */
    this.setData({
      address: addr,
      //covers: arr,
      pageIndex: this.data.pageIndex + 1,
      isLoading: false
    })

  },

  bindInput: function (e) {
    this.keywords = e.detail.value;
    this.pageIndex = 1;
    this.address = [];
    //this.covers = [];
    //this.pullUpOn = true;
    this.setData({
      keywords: e.detail.value,
      pageIndex: 1,
      address: [],
      //covers: [],
      //pullUpOn: true
    })
    this.getPoiAround(this.data.keywords);
  },

  back() {
    wx.navigateBack();
  },

  callBackReturn(_object) {
    //子页有返回错误信息
    //{"backParentErr":"您的课程有误"}
    let _backParentErr = _object.backParentErr || '';
    if (!util.isNull(_backParentErr)) {
      util.toast(_backParentErr);
      return;
    }
  },
  //列表显示门店
  toViewStore(e) {
    let _clickData = e.currentTarget.dataset;
    let _teachid = this.data.teachid
    let _typeid = this.data.typeid
    let _editid = this.data.editid
    // 之前的,可能后续不需要
    if(this.data.tiao == 2){
      wx.redirectTo({
        url: `/pages/coach/index/index?branchid=${_clickData.id}&uid=${_teachid}`,
      })
    }else if(this.data.tiao == 1){
      wx.redirectTo({
        url: `/pages/newpage/detail/index?typeid=${_typeid}&editid=${_editid}`,
      })
      // 选门店的操作,1是从团课来的
    }else if(_typeid == 1){
      wx.redirectTo({
        url: `/pages/course/group/index?branchid=${_clickData.id}&title=${_clickData.title}`,
      })
      // 2是从私教来的
    }else if(_typeid == 2){
      wx.redirectTo({
        url: `/pages/course/personal/index?branchid=${_clickData.id}&title=${_clickData.title}`,
      })
    }else if(this.data.teach == 1){
      wx.redirectTo({
        url: `/pages/course/List/index?storid=${_clickData.id}&title=${_clickData.title}`,
      })
    }else{
      this.setData({
        dropdownShow: this.data.dropdownShow && false,
      }, () => {
        let _id = _clickData.id;
        if (util.isNull(_id)) {
          util.toast("参数有误");
          return;
        }
        wx.navigateTo({
          url: '/pages/store/show/index?storeID=' + _id,
        })
      })
    }


  },
  
  //搜索框动作 start=================
  //搜索框点击
  showInput() {
    this.setData({
      dropdownShow: this.data.dropdownShow && false,
      inputShowed: true
    })
  },
  //搜索框改变
  hideInput() {
    this.setData({
      inputVal: '',
      inputShowed: false,
      keywords: '',
    }, () => {
      wx.hideKeyboard(); //强行隐藏键盘
      this.getPoiAround(this.data.keywords); //仅使用默认定位坐标
    })
  },
  clearInput() {
    this.setData({
      inputVal: '',
      keywords: '',
    }, () => {
      this.getPoiAround(this.data.keywords); //仅使用默认定位坐标
    })

  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    })
  },
  //搜索框动作 END


  //#region 增加

  //选择此门店
  switchLocation(e) {
    const that = this;
    //data-poster="{{item.poster}}" data-index="{{index}}" data-distanc="{{parse.getDistance(addressDistanc,index) }}" data-score="{{item.score}}" data-title="{{item.title}}" data-lat="{{item.latitude}}" data-lng="{{item.longitude}}" data-id="{{item.id}}" data-address="{{item.address}}"

    let _selectID = e.currentTarget.dataset.id || e.target.dataset.id;
    let _distanc = e.currentTarget.dataset.distanc || e.target.dataset.distanc;
    let _title = e.currentTarget.dataset.title || e.target.dataset.title;
    let _lat = e.currentTarget.dataset.lat || e.target.dataset.lat;
    let _lng = e.currentTarget.dataset.lng || e.target.dataset.lng;
    let _address = e.currentTarget.dataset.address || e.target.dataset.address;

    let _Location = wx.getStorageSync('Location'); //用户保存的本地信息
    if (!util.isNull(_Location.id) && _Location.id != 0 && _Location.id == _selectID) {
      return;
    }
    let locationJson = {
      "id": _selectID,
      "title": _title,
      "lat": _lat,
      "lng": _lng,
      "address": _address
    };
    wx.setStorageSync('Location', locationJson);


    //获取页面栈
    let pages = getCurrentPages();
    //检查页面栈
    //判断页面栈中页面的数量是否有跳转(可以省去判断)
    if (pages.length > 1) {
      //获取上一个页面实例对象
      let prePage = pages[pages.length - 2];
      //调用上一个页面实例对象的方法
      //prePage.changeLocation("昆山市城西选择店","森林公园南门正门口","99");
      console.log(prePage);
      prePage.changeLocation(locationJson, _distanc);
      //返回上一个页面
      wx.navigateBack();
    }
  },

  //下拉选择
  dropDownList(e) {
    let that = this;
    let index = Number(e.currentTarget.dataset.index)


    if (index !== -1) {
      let _selectData = this.data.dropdownlistData[Number(index)];
      let thisName = this.data.dropdownlistData[Number(index)].name;
      this.setData({
        dropdownIndexText: thisName,
        dropdownIndex: index,
        paramAreaId: _selectData.id,
        isLoading: true,
      }, () => {
        this.getPoiAround(this.data.keywords); //仅使用默认定位坐标
      })
    }
    this.setData({
      dropdownShow: !this.data.dropdownShow

    })
  },
  loadMore(e) {

    if (this.data.pageIndex < this.data.lastPage && !this.data.isLoading) {
      this.setData({
        isLoading: true,
        dropdownShow: this.data.dropdownShow && false,
      })

      const that = this;
      let _timestamp = (new Date()).valueOf();
      let _pageIndex = this.data.pageIndex + 1;
      let _addressData = this.data.address;
      let _config = {
        areaId: this.data.paramAreaId,
        word: util.isNull(this.data.keywords) ? '' : this.data.keywords,
        lat: this.data.lat,
        lng: this.data.lng,
        //distance: 5000, //搜索距离 米
        orderSet: '', //排序 1评分 2人气 

        pageSize: this.data.pageSize,
        pageIndex: _pageIndex,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }
      apis.get("store/indexPub", _config, {
        "Content-Type": 'applciation/json'
      }, false).then(val => {
        let _data = val;
        if (util.isNull(_data.data) || _data.data.length <= 0) {
          that.setData({
            noData: false,
            isLoading: false,
          })

        } else {
          that.setData({
            noData: false,
            isLoading: false,
            address: _addressData.concat(_data.data),
            pageIndex: _pageIndex,
            lastPage: _data.lastPage
          })
        }

      })
    }
  },
  //下拉刷新
  onrefresh(e) {
    let that = this;
    if (this.data.refreshing) return;
    this.setData({
      dropdownShow: this.data.dropdownShow && false,
      refreshing: true,
      refreshText: '正在刷新...'
    }, () => {

      let _timestamp = (new Date()).valueOf();
      let _config = {
        areaId: this.data.paramAreaId,
        word: util.isNull(this.data.keywords) ? '' : this.data.keywords,
        lat: this.data.lat,
        lng: this.data.lng,
        //distance: 5000, //搜索距离 米
        orderSet: '', //排序 1评分 2人气 

        pageSize: this.data.pageSize,
        pageIndex: 1,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }
      apis.get("store/indexPub", _config, {
        "Content-Type": 'applciation/json'
      }, false).then(val => {
        let _data = val;
        if (util.isNull(_data.data) || _data.data.length <= 0) {
          that.setData({
            noData: true,
            isLoading: false,
            address: [],
            refreshing: false,

          })

        } else {
          that.setData({
            noData: false,
            isLoading: false,
            address: _data.data,
            pageIndex: 1,
            lastPage: _data.lastPage,
            refreshing: false,
          })
        }

      })
    })
  },
})