const app = getApp();
const md5util = require('../../../utils/md5.js');
const logs = require('../../../utils/logs.js'); //日志打印
import _ from '../../../libs/we-lodash'
const QQMapWX = require('../../../libs/qqmap-wx-jssdk.1.2.js');
var util = require('../../../utils/util.js')
var apis = require('../../../utils/apis.js')
Page({
  data: {
    //胶囊位置
    statusBar: app.globalData.statusBar,
    customBar: app.globalData.customBar,
    navBarHeight: app.globalData.navBarHeight,

    latTemp: 0, //出数据的定位，用于请求设计定移动距离才请求
    lngTemp: 0, //出数据的定位，用于请求设计定移动距离才请求
    getReturnDistance: 2000, //单位米，移动指定米才会请求

    qqmapsdk: app.globalData.MapQQ.MapSDK,
    key: app.globalData.MapQQ.MapKey,
    lat: app.globalData.MapQQ.lat,
    lng: app.globalData.MapQQ.lng, //默认市政府
    scale: 13, //地图默认级别
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

    addressDistanc: [], //小鱼加的 用于计算实时距离

    loading: true,
    pullUpOn: true,

    ani: true,

    agreeClick: false, //隐私是点击过的，不管是否同意的
    agreePrivacy: false, //是否同意了隐私
    Location: null,

    selectStore: null, //数据整点传过去

    selectIndex: -1,
    refreshParent: false,

    backParentErr: '',

  },
  goList(){
    wx.redirectTo({
      url: '../pointListView/index',
    })

  },
  //拉取位置点位
  getPoiAround() {

    let _timestamp = (new Date()).valueOf();
    let _config = {
      //word: util.isNull(this.data.keywords) ? '' : this.data.keywords,
      lat: this.data.lat,
      lng: this.data.lng,
      distance: 5000, //搜索距离 米

      pageSize: 100,
      pageIndex: 1,
      userID: wx.getStorageSync('USERID'),
      TIMESTAMP: _timestamp,
      FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    }
    apis.get("store/indexMapPub", _config, {
      "Content-Type": 'applciation/json'
    }, false).then(val => {
      let data = val.data || [];
      this.getResult(data);
    })

  },
  //数据格式化
  getResult(data) {
    //数组比较一下

    let coversArr = []; //点位MARKER
    //let addr = [];

    for (let [index, item] of data.entries()) {
      let _tel = item.tel;
      if (~_tel.indexOf(';')) {
        _tel = _tel.split(';')[0];
      }

      coversArr.push({
        id: item.id,
        info: {
          id: item.id,
          tel: _tel,
          address: item.address

        },
        latitude: item.location.lat,
        longitude: item.location.lng,
        title: item.title,

        selected: item.selected,
        iconPath: "/static/img/map/icon_marker_3x.png",
        width: 40,
        height: 40,
        callout: {
          content: item.title,
          padding: 4,
          display: 'ALWAYS', //'BYCLICK':点击显示; 'ALWAYS':常显
          fontSize: 12,
          textAlign: 'center',
          borderRadius: '6',
          borderWidth: 1,
          borderColor: '#ff7417',
          bgColor: '#ffffff' //需要6位的色值有效
        }
      });

    }

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
    }
    */
    //将已选中的列到第一位,距离升序排列END


    this.setData({
      covers: coversArr,
      loading: false
    })

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
                  this.getPoiAround();
                });

              },
              fail: () => {
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
                              this.getPoiAround();
                            });
                          } else {
                            this.getPoiAround();
                          }

                        }
                      })
                    } else {
                      console.log('用户点击取消')
                      this.getPoiAround(); //仅使用默认定位坐标
                    }
                  }
                })
                // 再次获取授权，引导客户手动授权END
              }
            })
          } else {
            // 用户已授权，其他操作
            this.getLocation(() => {
              this.getPoiAround();
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
      this.getPoiAround(); //仅使用默认定位坐标
    })
  },
  onShow(e) {},
  onLoad: function (options) {
    let that = this;

    this.data.qqmapsdk = new QQMapWX({
      key: this.data.key
    });

  },
  //获取当前位置
  getLocation(callback) {
    const that = this;
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success(res) {
        that.setData({
          lat: res.latitude,
          lng: res.longitude,
          latTemp: res.latitude, //出数据的定位，用于请求设计定移动距离才请求
          lngTemp: res.longitude, //出数据的定位，用于请求设计定移动距离才请求
        }, () => {
          callback();
        })

      },
      fail(res) {
        callback();
      }
    });
  },




  back() {
    wx.navigateBack();
  },
  /**
   * 可能花钱 计算二点之间的距离 - 需要请求腾讯的，还是不要了吧 花钱，用下面的
   * @param {*} F_lat 原始点LAT
   * @param {*} F_lng 原始点LNG
   * @param {*} T_lat 到点LAT
   * @param {*} T_lng 到点LNG
   */
  getDistance(F_lat, F_lng, T_lat, T_lng) {
    const _this = this;
    const _qqmapsdk = _this.data.qqmapsdk;
    return new Promise((resolve, reject) => {
      _qqmapsdk.calculateDistance({
        //mode: 'driving',//可选值：'driving'（驾车）、'walking'（步行），不填默认：'walking',可不填
        mode: "walking",
        from: {
          latitude: F_lat,
          longitude: F_lng
        },
        to: "" + T_lat + "," + T_lng + "",
        success: (res) => { //成功后的回调
          //单个 
          let hw = res.result.rows[0].elements[0].distance; //拿到距离(米)

          resolve(hw);
        },
        fail: (error) => {
          reject(error);
        }
      });
    })
  },
  /**
   * 免费  Haversine 公式来计算两点之间的距离 - 不使用腾讯花钱的服务
   * 比腾讯的少了大约100米
   * @param {*} lat1 
   * @param {*} lon1 
   * @param {*} lat2 
   * @param {*} lon2 
   */
  calcDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 地球半径
    const φ1 = (lat1 * Math.PI) / 180; // 第一个点的纬度转化为弧度
    const φ2 = (lat2 * Math.PI) / 180; // 第二个点的纬度转化为弧度
    const Δφ = ((lat2 - lat1) * Math.PI) / 180; // 两点纬度之差转化为弧度
    const Δλ = ((lon2 - lon1) * Math.PI) / 180; // 两点经度之差转化为弧度

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // 距离，单位为米

    // return distance;
    //比腾讯算出来少了大约35% , 所以小鱼加上
    return distance + distance * 0.35;
  },

  //地图移动注册
  regionchange(e) {
    if (e.type == 'end' && (e.causedBy == 'scale' || e.causedBy == 'drag')) {
      clearTimeout(this.data.timer);
      this.ani = false;
      this.setData({
        ani: false
      })
      if (e.causedBy == 'scale') {
        this.setData({
          scale: e.detail.scale
        })
      }
      this.data.timer = setTimeout(() => {
        this.setData({
          ani: true
        })
      }, 300);
      if (!this.data.mapCtx) {
        this.data.mapCtx = wx.createMapContext('maps');
      }
      //移动到的位置
      let lat = e.detail.centerLocation.latitude;
      let lng = e.detail.centerLocation.longitude;

      //距离计算1 - 免费
      let _Distance = this.calcDistance(lat, lng, this.data.latTemp, this.data.lngTemp);
      if (_Distance > this.data.getReturnDistance) {
        this.setData({
          latTemp: lat, //出数据的定位，用于请求设计定移动距离才请求
          lngTemp: lng, //出数据的定位，用于请求设计定移动距离才请求
          lat: lat,
          lng: lng
        }, () => {
          this.getPoiAround();
        })
      } else {
        this.setData({
          lat: lat,
          lng: lng
        })
      }



      //距离计算2 - 腾讯收费可能
      /*
      this.getDistance(lat,lng,this.data.latTemp,this.data.lngTemp).then(val=>{
        logs.log("11111111111111111",val,true);

                   
        if(val>this.data.getReturnDistance){
          this.setData({
            latTemp:lat,//出数据的定位，用于请求设计定移动距离才请求
            lngTemp: lng, //出数据的定位，用于请求设计定移动距离才请求
            lat: lat,
            lng: lng
          },()=>{
            this.getPoiAround();
          })
        }else{
          this.setData({
            lat: lat,
            lng: lng
          })
        }
      })
      */

    }
  },
  //去到当前位置
  currentLocation() {
    //当前位置
    const that = this;
    this.getLocation(() => {
      setTimeout(() => {
        this.getPoiAround();
      }, 200);
    });
  },
  callBackReturn(_object) {
    let _backParentErr = _object.backParentErr || '';
    if (!util.isNull(_backParentErr)) {
      util.toast(_backParentErr);
      return;
    }
  },

  //泡泡点击
  marker: function (e) {
    const that = this;
    let _covers = this.data.covers;
    let _markerId = e.detail.markerId; //点击的ID
    const item = _.find(_covers, {
      id: _markerId
    });
    if (util.isNull(item)) {
      return;
    }

    const menu = _.has(item.info, "tel") && !util.isNull(item.info.tel) ? ['切换为服务场馆', '导航到到这里', '拨打场馆电话'] : ['切换为服务场馆', '导航到到这里'];
    wx.showActionSheet({
      itemList: menu,
      success(res) {
        if (res.tapIndex == 0) { //切换场馆

          let _itemIndex = _.findIndex(_covers, item) || -1; //当前item在地址中的索引，用于去拉取距离
          let _distanc = "0m";

          let locationJson = {
            "id": item.id,
            "title": item.title,
            "lat": item.latitude,
            "lng": item.longitude,
            "address": item.address
          };
          wx.setStorageSync('Location', locationJson);

          let pages = getCurrentPages();
          if (pages.length > 1) {
            let prePage = pages[pages.length - 2];
            prePage.changeLocation(locationJson, _distanc);
            wx.navigateBack();
          }
        } else if (res.tapIndex == 2 && item.info.tel) {
          wx.makePhoneCall({
            phoneNumber: item.info.tel
          });
        } else {
          const latitude = Number(item.latitude);
          const longitude = Number(item.longitude);
          wx.openLocation({
            name: item.title,
            address: item.info.address,
            latitude,
            longitude,
            scale: 18
          });
        }
      },
      fail(res) {
        console.log(res.errMsg);
      }
    });
  },

  //选择此门店
  switchLocation(e) {
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

    let pages = getCurrentPages();
    if (pages.length > 1) {
      let prePage = pages[pages.length - 2];
      prePage.changeLocation(locationJson, _distanc);
      wx.navigateBack();
    }
  },
})