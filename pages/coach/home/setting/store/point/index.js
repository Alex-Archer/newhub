const app = getApp();
const logs = require("../../../../../../utils/logs");
import axios from '../../../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
import _ from '../../../../../../libs/we-lodash'
var md5util = require('../../../../../../utils/md5.js')
var util = require('../../../../../../utils/util.js')
const filter = require('../../../../../../utils/loginFilter'); //1.登录验证
const QQMapWX = require('../../../../../../libs/qqmap-wx-jssdk.1.2.js');

Page(filter.loginCheck(true, app, {
  data: {
    preventOnShow: true, //3.登录验证  需要登录时，阻止ONSHOW 4.在页面中 wx:if="{{!preventOnShow}}"防跳转时显示页面


    //胶囊位置
    statusBar: app.globalData.statusBar,
    customBar: app.globalData.customBar,
    navBarHeight: app.globalData.navBarHeight,

    //selectLocationID: 1, //记录的 选择的定位数据库ID


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

    addressDistanc: [], //小鱼加的 用于计算实时距离

    scrollH: 156,
    pageIndex: 1,
    loading: true,
    pullUpOn: true,
    keywords: '',

    ani: true,

    agreeClick: false, //隐私是点击过的，不管是否同意的
    agreePrivacy: false, //是否同意了隐私
    Location: null,

    showActionSheet: false,
    tips: "您确定将此场馆增加为您的服务场馆吗？",
    actionItemList: [{
      text: "确认增加",
      color: "#E3302D"
    }],
    maskClosable: true, //可以点击外部任意地方关闭
    color: "#9a9a9a",
    size: 26,
    isCancel: true,

    selectID: 0,
    selectIndex: -1,
    refreshParent: false,

  },
  onShow(e) {
    if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 

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
                          //{"errMsg":"openSetting:ok","authSetting":{"scope.record":false,"scope.userLocation":false}} 
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
    //console.log("用户拒绝隐私授权, 未同意过的隐私协议中的接口将不能调用")
    this.setData({
      agreePrivacy: false
    }, () => {
      util.toast("您将以游客身份浏览！")
      this.getPoiAround(this.data.keywords); //仅使用默认定位坐标
    })
  },

  toStore(e) {
    wx.navigateTo({
      url: '/pages/store/show/index',
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
  //https://aoben.kshot.com/api/store/indexPub
  getStoreData(_pageIndex = 1) {
    return new Promise((resolve, reject) => {
      let _timestamp = (new Date()).valueOf();
      axios.get("Coach/store", {
        word: util.isNull(this.data.keywords) ? '' : this.data.keywords,
        pageSize: 10,
        pageIndex: _pageIndex,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }, {
        headers: {
          "Content-Type": 'applciation/json',
        },
        interceptors: {
          request: true,
          response: false
        },

        validateStatus(status) {
          return status === 200;
        },
      }).then(res => {
        if (res.data.code == 1) {
          let _data = util.jsonTestParse(res.data.data); //解决返回为字符串型JSON问题
          resolve(_data);
        } else {
          reject([]);
        }
      }).catch((err) => {
        reject([]);
      });
    })

  },
  //拉取位置点位
  getPoiAround(keywords) {

    this.getStoreData().then(val => {

      let data = val.data || [];
      this.getResult(data);
    })

  },
  //数据格式化
  getResult(data) {
    //数组比较一下
    let arr = [];
    let addr = [];
    let idx = this.data.address.length;

    let distancArr = []

    for (let [index, item] of data.entries()) {
      arr.push({
        //id: index + idx,
        //id: index,
        id: item.id,
        latitude: item.location.lat,
        longitude: item.location.lng,
        title: item.title,
        poster: item.poster,
        score: item.score,
        commentnum: item.commentnum,
        label: item.label,
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
      // let tel = this.trim(item.tel);
      let tel = item.tel;
      if (~tel.indexOf(';')) {
        tel = tel.split(';')[0];
      }
      distancArr.push([item.location.lat, item.location.lng])
      addr.push({
        //id: index + idx,
        //id: index,
        id: item.id,
        latitude: item.location.lat,
        longitude: item.location.lng,
        title: item.title,
        poster: item.poster,
        score: item.score,
        commentnum: item.commentnum,
        label: item.label,
        address: item.address,
        tel: item.tel,
        selected: item.selected,
        //distance: item._distance  //因为是本地数据了，所以要重新计算
        distance: ""
      });
    }

    //[[31.383008,120.984822],[31.382914,120.985048]]
    //去更新 addressDistanc
    if (this.data.agreePrivacy) { //未同意隐私就出0，不计算距离
      this.calculateMorePlaceDistance(distancArr); //批量算出距离

    }

    this.setData({
      // address: this.data.address.concat(addr),
      // covers: this.data.covers.concat(arr),
      address: addr,
      covers: arr,
      pageIndex: this.data.pageIndex + 1,
      loading: false
    })
    if (data.length < 10) {
      this.setData({
        pullUpOn: false
      })
    }

  },

  onLoad: function (options) {
    this.data.qqmapsdk = new QQMapWX({
      key: this.data.key
    });
    this.setData({
      keywords: options.key || ''
    })
    //防 scroll-view 拖不到底
    this.setData({
      scrollH: app.globalData.windowHeight - 46 - app.globalData.windowWidth / 750 * 600,
      Location: wx.getStorageSync('Location') || {
        "id": 1,
        "title": "昆山市祖冲之路店",
        "lat": 31.383914,
        "lng": 120.986048,
        "address": "祖冲之路1999号"
      },
    }, () => {

      if (this.data.agreePrivacy) {
        const mapCtx = wx.createMapContext('map', this);
        let _lat = this.data.Location.lat;
        let _lng = this.data.Location.lng;
        mapCtx.moveToLocation({
          latitude: _lat,
          longitude: _lng,
          success: () => {

            this.data.timer = setTimeout(() => {
              this.setData({
                // isGuGong: true,
                lat: _lat,
                lng: _lng,
                // scale: 18
              });
            }, 300);
          },
          fail: () => {
            this.setData({
              isGuGong: false,
            });
          }
        });
      }
    })

  },


  //计算二点之间的距离
  //https://blog.csdn.net/weixin_40816738/article/details/122619771
  //小程序 获取腾讯地图计算两经纬度的实际距离（可批量）_多地打卡
  calculateTwoPlaceDistance(_lat, _lng) {
    // 实例化腾讯地图API核心类
    // const QQMapWX = new qqmapsdk({
    //     key: '腾讯申请的key' // 必填
    // });
    const _this = this;
    let _qqmapsdk = _this.data.qqmapsdk;
    //return new Promise(function (resolve, reject) {
    //调用距离计算接口
    _qqmapsdk.calculateDistance({
      //mode: 'driving',//可选值：'driving'（驾车）、'walking'（步行），不填默认：'walking',可不填
      //from参数不填默认当前地址
      //获取表单提交的经纬度并设置from和to参数（示例为string格式）
      // from: e.detail.value.start || '', //若起点有数据则采用起点坐标，若为空默认当前地址
      // to: e.detail.value.dest, //终点坐标
      mode: "walking",
      //from: "39.77466,116.55859", //当前位置的经纬度，不填则是当前位置,不填会报：频繁调用会增加电量损耗，可考虑使用 wx.onLocationChange 监听地理位置变化
      from: {
        latitude: _this.data.lat,
        longitude: _this.data.lng
      },
      //to: "39.775091,116.56107", //办公地点经纬度 "北京市通州区经海三路137号"
      to: "" + _lat + "," + _lng + "", //单个
      //to: "31.383008,120.984822;31.382914,120.985048", //批量 strs为字符串，末尾的“；”要去掉
      success: (res) => { //成功后的回调
        //单个 
        logs.log("[calculateDistance] 单个", res, true);
        //{"status":0,"message":"query ok","result":{"elements":[{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.383008,"lng":120.984822},"distance":547,"duration":157}]}} 

        //批量：
        //logs.log("[calculateDistance] 批量：",res,true);
        //{"status":0,"message":"query ok","result":{"elements":[{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.383008,"lng":120.984822},"distance":547,"duration":157},{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.382914,"lng":120.985048},"distance":568,"duration":158}]}}


        let hw = res.result.elements[0].distance; //拿到距离(米)
        // console.log("hw", hw);
        if (hw && hw !== -1) {
          if (hw < 1000) {
            hw = hw + "m";
          }
          //转换成公里
          else {
            hw = (hw / 2 / 500).toFixed(2) + "km";
          }
        } else {
          hw = "距离太近或请刷新重试";
        }
        console.log("当前位置与办公地点距离:" + hw);
        //alert("当前位置与办公地点距离:" + hw)
        return hw;
        //resolve(hw);
      },
      fail: (error) => {
        console.error("err:", error)
      }
    });
    //})
  },
  //上面的批量，批量算出距离
  //2023 09 24 腾讯通知改写,见下面
  //【腾讯科技】您好，腾讯位置服务的距离计算相关接口将于10月8日0点下线，下线后您将无法再分配该接口的配额，为了避免您的业务受到影响，请您尽快切换为距离矩阵接口，详细调用方式请见https://lbs.qq.com/service/webService/webServiceGuide/webServiceMatrix。如您有任何疑问，请通过工单向我们咨询。
  /*
  calculateMorePlaceDistance(_distancArr) {
    
    //[[31.383008,120.984822],[31.382914,120.985048]]
    if (_distancArr.length < 0) {
      return false;
    }
    let toPoint = "";
    for (let i = 0; i < _distancArr.length; i++) {
      logs.log("_distancArr", _distancArr[i], true);
      if (i == _distancArr.length - 1) {
        //移掉最后一个;
        toPoint += "" + _distancArr[i][0] + "," + _distancArr[i][1];
      } else {
        toPoint += "" + _distancArr[i][0] + "," + _distancArr[i][1] + ";";
      }
    }
    logs.log("toPoint", toPoint); //31.383008,120.984822;31.382914,120.985048 

    const _this = this;
    let _qqmapsdk = _this.data.qqmapsdk;
    //调用距离计算接口
    _qqmapsdk.calculateDistance({
      //mode: 'driving',//可选值：'driving'（驾车）、'walking'（步行），不填默认：'walking',可不填
      mode: "walking",
      //from: "39.77466,116.55859", //当前位置的经纬度，不填则是当前位置,不填会报：频繁调用会增加电量损耗，可考虑使用 wx.onLocationChange 监听地理位置变化
      from: {
        latitude: _this.data.lat,
        longitude: _this.data.lng
      },
      //to:"" + _lat + "," + _lng + "",//单个
      //to: "31.383008,120.984822;31.382914,120.985048", //批量 strs为字符串，末尾的“；”要去掉
      to: toPoint,
      success: (res) => { //成功后的回调
        logs.log("批量距离",res,true);
        //【批量距离】:{"status":0,"message":"query ok","result":{"elements":[{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.383008,"lng":120.984822},"distance":568,"duration":0},{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.382914,"lng":120.985048},"distance":589,"duration":0},{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.383914,"lng":120.986048},"distance":573,"duration":0},{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.384914,"lng":120.987048},"distance":915,"duration":0},{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.385914,"lng":120.988048},"distance":1622,"duration":0}]}} 
        //单个 
        //logs.log("[calculateDistance] 单个",res,true);
        //{"status":0,"message":"query ok","result":{"elements":[{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.383008,"lng":120.984822},"distance":547,"duration":157}]}} 

        //批量：
        //logs.log("[calculateDistance] 批量：",res,true);
        //{"status":0,"message":"query ok","result":{"elements":[{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.383008,"lng":120.984822},"distance":547,"duration":157},{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.382914,"lng":120.985048},"distance":568,"duration":158}]}}
        //let hw = res.result.elements[0].distance; //拿到距离(米)
        const moreWorkDistanceList = [];
        const distanceList = res.result.elements;
        for (var i = 0; i < distanceList.length; i++) {
          const distAddress = distanceList[i].distance;

          // 把计算出来的距离放到数组容器中，等会统一计算
          moreWorkDistanceList.push(distAddress)
          // console.log("多地打卡数组追加元素->", moreWorkDistanceList);
        }

        _this.setData({
          addressDistanc: moreWorkDistanceList
        })
        logs.log("[addressDistanc] 批量：", _this.data.addressDistanc, true);



      }
    });

  },
  */
  //上面的改写
  //20230924接通知：【腾讯科技】您好，腾讯位置服务的距离计算相关接口将于10月8日0点下线，下线后您将无法再分配该接口的配额，为了避免您的业务受到影响，请您尽快切换为距离矩阵接口，详细调用方式请见https://lbs.qq.com/service/webService/webServiceGuide/webServiceMatrix。如您有任何疑问，请通过工单向我们咨询。
  //var URL_DISTANCE = BASE_URL + 'distance/v1/';//https://apis.map.qq.com/ws/distance/v1/?parameters
  //用这个了 ,返回不一样了 var URL_DISTANCE = BASE_URL + 'distance/v1/matrix';//https://apis.map.qq.com/ws/distance/v1/matrix
  calculateMorePlaceDistance(_distancArr) {

    //[[31.383008,120.984822],[31.382914,120.985048]]
    if (_distancArr.length < 0) {
      return false;
    }
    let toPoint = "";
    for (let i = 0; i < _distancArr.length; i++) {
      logs.log("_distancArr", _distancArr[i], true);
      if (i == _distancArr.length - 1) {
        //移掉最后一个;
        toPoint += "" + _distancArr[i][0] + "," + _distancArr[i][1];
      } else {
        toPoint += "" + _distancArr[i][0] + "," + _distancArr[i][1] + ";";
      }
    }
    logs.log("toPoint", toPoint); //31.383008,120.984822;31.382914,120.985048 

    const _this = this;
    let _qqmapsdk = _this.data.qqmapsdk;
    //调用距离计算接口
    _qqmapsdk.calculateDistance({
      //_qqmapsdk.calculateDistance_matrix({            
      //mode: 'driving',//可选值：'driving'（驾车）、'walking'（步行），不填默认：'walking',可不填
      mode: "walking",
      //from: "39.77466,116.55859", //当前位置的经纬度，不填则是当前位置,不填会报：频繁调用会增加电量损耗，可考虑使用 wx.onLocationChange 监听地理位置变化
      from: {
        latitude: _this.data.lat,
        longitude: _this.data.lng
      },
      //to:"" + _lat + "," + _lng + "",//单个
      //to: "31.383008,120.984822;31.382914,120.985048", //批量 strs为字符串，末尾的“；”要去掉
      to: toPoint,
      success: (res) => { //成功后的回调
        //logs.log("批量距离",res,true);
        //return;
        //【批量距离】:{"status":0,"message":"query ok","result":{"elements":[{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.383008,"lng":120.984822},"distance":568,"duration":0},{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.382914,"lng":120.985048},"distance":589,"duration":0},{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.383914,"lng":120.986048},"distance":573,"duration":0},{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.384914,"lng":120.987048},"distance":915,"duration":0},{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.385914,"lng":120.988048},"distance":1622,"duration":0}]}} 
        //单个 
        //logs.log("[calculateDistance] 单个",res,true);
        //{"status":0,"message":"query ok","result":{"elements":[{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.383008,"lng":120.984822},"distance":547,"duration":157}]}} 

        //批量：
        //logs.log("[calculateDistance] 批量：",res,true);
        //{"status":0,"message":"query ok","result":{"elements":[{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.383008,"lng":120.984822},"distance":547,"duration":157},{"from":{"lat":31.38475,"lng":120.98181},"to":{"lat":31.382914,"lng":120.985048},"distance":568,"duration":158}]}}
        //let hw = res.result.elements[0].distance; //拿到距离(米)
        const moreWorkDistanceList = [];
        //const distanceList = res.result.elements;//0924调整后多了rows节点
        const distanceList = res.result.rows[0].elements;
        for (var i = 0; i < distanceList.length; i++) {
          const distAddress = distanceList[i].distance;

          // 把计算出来的距离放到数组容器中，等会统一计算
          moreWorkDistanceList.push(distAddress)
          // console.log("多地打卡数组追加元素->", moreWorkDistanceList);
        }

        _this.setData({
          addressDistanc: moreWorkDistanceList
        })
        logs.log("[addressDistanc] 批量：", _this.data.addressDistanc, true);



      }
    });

  },

  pullUp() {
    if (!this.data.pullUpOn || this.data.loading) return;
    this.setData({
      loading: true
    })
    this.getPoiAround(this.data.keywords)
  },

  bindInput: function (e) {
    this.keywords = e.detail.value;
    this.pageIndex = 1;
    this.address = [];
    this.covers = [];
    this.pullUpOn = true;
    this.setData({
      keywords: e.detail.value,
      pageIndex: 1,
      address: [],
      covers: [],
      pullUpOn: true
    })
    this.getPoiAround(this.data.keywords);
  },

  call(event) {
    const index = Number(event.currentTarget.dataset.id);
    const tel = this.data.address[index].tel;
    if (tel) {
      wx.makePhoneCall({
        phoneNumber: tel
      });
    }
  },
  go(event) {
    const index = Number(event.currentTarget.dataset.id);
    const item = this.data.address[index];
    const latitude = Number(item.latitude);
    const longitude = Number(item.longitude);
    wx.openLocation({
      name: item.title,
      address: item.address,
      latitude,
      longitude,
      scale: 18
    });
  },
  back() {
    wx.navigateBack();
  },

  getAddress: function (lng, lat) {
    //根据经纬度获取地址信息
    /*
    this.data.qqmapsdk.reverseGeocoder({
      location: {
        latitude: lat,
        longitude: lng
      },
      success: res => {
        this.setData({
          keywords: res.result.formatted_addresses.recommend
        })
        this.getPoiAround(this.data.keywords);
      },
      fail: res => {
        this.setData({
          keywords: '车站'
        })
        this.getPoiAround(this.data.keywords);
      }
    });
    */
    this.getPoiAround(this.data.keywords);
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
        logs.log("scale", e.detail.scale, true)
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
      this.data.mapCtx.getCenterLocation({
        type: 'gcj02',
        success: res => {
          this.setData({
            lat: res.latitude,
            lng: res.longitude
          })
          this.getAddress(res.longitude, res.latitude);
        }
      });
    }
  },
  currentLocation() {
    //当前位置
    const that = this;
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success(res) {
        console.log('wx.getLocation', res)
        that.setData({
          lat: res.latitude,
          lng: res.longitude
        })
        //that.getAddress(res.longitude, res.latitude);
      },
      fail(res) {
        //that.getAddress(that.longitude, that.latitude);
      }
    });
  },
  //列表点击定位
  toLocation(e) {
    let _clickData = e.currentTarget.dataset;
    const mapCtx = wx.createMapContext('map', this);
    logs.log("mapCtx", mapCtx);
    mapCtx.moveToLocation({
      latitude: _clickData.lat,
      longitude: _clickData.lng,
      success: () => {

        this.data.timer = setTimeout(() => {
          this.setData({
            // isGuGong: true,
            lat: _clickData.lat,
            lng: _clickData.lng,
            // scale: 18
          });
        }, 300);
      },
      fail: () => {
        this.setData({
          isGuGong: false,
        });
      }
    });
    return;

    let that = this;

    let clickData = e.currentTarget.dataset;
    logs.log("[clickData]", clickData, true) //{"id":"","offsetLeft":0,"offsetTop":101,"dataset":{"lat":31.382914,"lng":120.985048}} 

    //logs.log("[covers]",that.data.covers,true)
    let newCovers = this.data.covers;

    //newCovers[clickData.id].callout = callout;
    that.setData({
      lat: clickData.lat,
      lng: clickData.lng,
      scale: 18
      //covers:newCovers

    })

  },
  //泡泡点击
  marker: function (e) {
    //logs.log("[marker]",e,true)
    //{"type":"markertap","target":{"dataset":{},"id":"maps","offsetTop":0,"offsetLeft":0},"currentTarget":{"dataset":{},"id":"maps","offsetTop":0,"offsetLeft":0},"timeStamp":1691471075550,"detail":{"markerId":1},"_userTap":true,"markerId":1}


    const that = this;
    const item = that.data.address[e.detail.markerId || 0];
    //logs.log("[marker] item ",item,true)
    //{"id":1,"latitude":31.382914,"longitude":120.985048,"title":"特来电昆山阳光水世界麦当劳充电站","address":"江苏省苏州市昆山市前进东路1587号华敏世家花园停车场","tel":"13732646263","distance":""}


    const menu = item.tel ? ['打电话', '到这里'] : ['到这里'];

    wx.showActionSheet({
      itemList: menu,
      success(res) {
        if (res.tapIndex == 0 && item.tel) {
          wx.makePhoneCall({
            phoneNumber: item.tel
          });
        } else {
          const latitude = Number(item.latitude);
          const longitude = Number(item.longitude);
          wx.openLocation({
            name: item.title,
            address: item.address,
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



  //搜索框动作 start=================
  //搜索框点击
  showInput() {
    this.setData({
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
  closeActionSheet() {
    this.setData({
      showActionSheet: false,
      selectID: 0,
      refreshParent: false, //返回需要刷新父窗
    })
  },
  //增加
  addLocation(e) {
    const that = this;
    //logs.log("addLocation", e, true);
    let _selectID = e.currentTarget.dataset.id || e.target.dataset.id;
    let _selectIndex = Number(e.currentTarget.dataset.index || e.target.dataset.index) || 0;
    //dataset":{"address":"江苏省苏州市昆山市博士路","distanc":"10.57km","id":1,"index":0,"lat":"31.403930","lng":"120.894638","title":"阳科园店"}}
    //logs.log("addLocation", _selectIndex, true);
    //return;
    if (!util.isNull(_selectID)) {
      that.setData({
        showActionSheet: true,
        selectID: _selectID,
        selectIndex: _selectIndex
      })
    } else {
      util.toast("数据有误", null, null, (e) => {
        this.setData({
          showActionSheet: false,
          selectID: 0,
          selectIndex: -1
        })
      });
    }
  },
  //面板点击 操作 确认
  actionItemClick(e) {
    let _id = this.data.selectID;
    this.confirmAdd(_id);

  },
  //确认增加
  confirmAdd(_id) {
    let that = this;
    this.addController(_id).then(val => {
      let setIndex = this.data.selectIndex;
      let tempAddress = this.data.address;
      util.toast("增加服务场馆成功", null, null, (e) => {
        _.set(tempAddress, `[${setIndex}].selected`, true);
        //修改列表
        this.setData({
          showActionSheet: false,
          refreshParent: true, //返回需要刷新父窗
          selectIndex: -1,
          selectID: 0,
          address: tempAddress
        })
      });

    }, function (err) {
      //logs.log("2222222222222222222222",err,true)
      util.toast(err, null, null, (e) => {
        that.setData({
          showActionSheet: false,
          refreshParent: false, //返回需要刷新父窗
          selectIndex: -1,
          selectID: 0,
        })
      });
    })

  },
  addController(_id) {
    //logs.log("1111111111111111111",_id,true)
    return new Promise((resolve, reject) => {
      let _timestamp = (new Date()).valueOf();
      axios.get("Coach/addStore", {
        storeId: _id,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID') + _id.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
          // resolve("ok");
          resolve(res.data.data);
        } else {
          reject(res.data.message);
        }

      }).catch((err) => {
        reject("数据处理有误");
      });
    });
  },
  //#endregion 增加 END
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

    if (this.data.refreshParent) { //是否需要刷新
      // 页面卸载时触发
      //触发用户中心更新头像昵称
      let pages = getCurrentPages(); //获取页面栈
      if (pages.length > 1) //判断页面栈中页面的数量是否有跳转(可以省去判断)
      {
        let prePage = pages[pages.length - 2]; //获取上一个页面实例对象
        prePage.callBackReturn({
          //headimgurl: this.data.headimgurl,
          //nickname:this.data.nickname
        }); //调用上一个页面实例对象的方法
      }
    }
  },

}))