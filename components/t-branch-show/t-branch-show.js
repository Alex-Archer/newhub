const app = getApp();
const util = require('../../utils/util.js'); //日志打印
const logs = require('../../utils/logs.js'); //日志打印
const QQMapWX = require('../../libs/qqmap-wx-jssdk.1.2.js');
Component({
  properties: {
    //同意按钮颜色
    agreecolor: {
      type: String,
      value: '#319fa6'
    },
    //不同意按钮颜色
    disagreecolor: {
      type: String,
      value: '#999'
    },
    //距离底部
    fixedbottom: {
      type: String,
      // value: '12px'
      value: '30vh'
    },
    //左右边距
    leftright: {
      type: String,
      // value: '16px'
      value: '15vw'
    },
    backgroundColor: {
      type: String,
      value: '#fff'
    },
    radius: {
      type: String,
      value: '12px'
    },
    titleColor: {
      type: String,
      value: '#333'
    },
    contentColor: {
      type: String,
      value: '#999'
    },
    mask: {
      type: Boolean,
      value: false
    },
    bottomShowType: {
      type: Number,
      value: 0 //默认 1上下
    }

  },
  data: {
    qqmapsdk: app.globalData.MapQQ.MapSDK,
    key: app.globalData.MapQQ.MapKey,
    lat: app.globalData.MapQQ.lat,
    lng: app.globalData.MapQQ.lng, //默认市政府
    Location: null,
    title: "用户隐私保护提示",
    desc1: "感谢您使用本程序，您使用本程序前应当阅读并同意",
    urlTitle: "《aoben shared yoga 隐私保护指引》",
    desc2: "当您点击同意并开始时用产品服务时，即表示您已理解并同意该条款内容，该条款将对您产生法律约束力。如您拒绝，将无法使用部分功能。",
    innerShow: false,
    height: 0,
  },
  lifetimes: {
    attached: function () {
      //本地定位
      const _location = wx.getStorageSync('Location');
      logs.log('123123',_location,true)
      this.data.qqmapsdk = new QQMapWX({
        key: this.data.key
      });
      //本地无
      if (util.isNull(_location)) {
        this.setData({
          Location: {
            "title": "请选择服务门店",
            "lat": 0,
            "lng": 0,
            "address": "选择默认门店可获更优服务"
          },
          locationDistance: "0",
        })
      } else {
        this.getLocation().then(val => {
          this.getDistance(val[0], val[1], _location.lat, _location.lng).then(res => {
            this.setData({
              Location: _location,
              locationDistance: res
            })
          }, function (err) {
            this.setData({
              Location: _location,
              locationDistance: "0"
            })
          });
        })
      }
    },
  },
  methods: {
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
  
            let hw = res.result.rows[0].elements[0].distance; //拿到距离(米)
            if (hw && hw !== -1) {
              if (hw < 1000) {
                hw = hw + "m";
              }
              //转换成公里
              else {
                hw = (hw / 2 / 500).toFixed(2) + "km";
              }
            } else {
              //hw = "距离太近或请刷新重试";
              hw = "0m";
            }
            resolve(hw);
            //return hw;
          },
          fail: (error) => {
            reject(error);
          }
        });
      })
    },
    //获取当前位置
  getLocation() {
    //当前位置
    return new Promise((resolve, reject) => {
      //H5：使用坐标类型为 gcj02 时，需要配置腾讯地图 sdk 信息（manifest.json -> h5）
      wx.getLocation({
        type: 'gcj02',
        altitude: true,
        success(res) {
          // logs.log("位置getLocation",res,true);
          resolve([res.latitude, res.longitude])
        },
        fail(res) {
          reject();
        }
      });
    });
  },
    ToMapList: function (e) {
      wx.navigateTo({
        url: '/pages/map/pointListView/index',
      })
    }
  }
})