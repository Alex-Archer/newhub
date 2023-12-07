const app = getApp();
const md5util = require('../../../utils/md5.js');
const logs = require('../../../utils/logs.js'); //日志打印
import _ from '../../../libs/we-lodash'

// const QQMapWX = require('../../../libs/qqmap-wx-jssdk.min.js');
const QQMapWX = require('../../../libs/qqmap-wx-jssdk.1.2.js');
import tui from '../../../common/httpRequest'

Page({
  data: {
    ani: true,
    mapObj: null,
    qqmapsdk: app.globalData.MapQQ.MapSDK,
    key: app.globalData.MapQQ.MapKey,
    latitude: app.globalData.MapQQ.lat,
    longitude: app.globalData.MapQQ.lng, //默认市政府

    scrollH: 0,
    address: [],
    timer: null,
    keywords: '车站',
    location: null,
    pageIndex: 1,
    loading: false,
    pullUpOn: true,
    scrollTop: 0,
    index: -1,
    changeTimer: null
  },
  onLoad: function (options) {
    //POI搜索关键字
    this.setData({
      keywords: options.keywords || '车站'
    })
    setTimeout(() => {
      let sys = wx.getSystemInfoSync();
      this.setData({
        scrollH: sys.windowHeight - (sys.windowWidth / 750 * 600) - 46 //78=30+8*2
      })
      this.data.qqmapsdk = new QQMapWX({
        key: this.data.key
      });
      this.currentLocation();
    }, 80);
  },
  getLocationBySearch(res) {
    this.setData({
      latitude: res.lat,
      longitude: res.lng,
      keywords: res.keywords
    }, () => {
      this.getPoiAround();
    })
  },
  calculateDistance(to, callback) {
    this.data.qqmapsdk.calculateDistance({
      from: '', //默认当前位置
      to: to,
      success: res => {
        callback && callback(res.result);
      },
      fail: res => {
        callback && callback(false);
        console.log(res);
      }
    });
  },
  getPoiAround() {
    if (!this.data.keywords) return;

    this.setData({
      pageIndex:1,
      pullUpOn:true,
      address:[],
      index:-1,
      scrollTop:1
    })
    setTimeout(() => {
      this.setData({
        scrollTop:0
      })
    }, 10);
    this.getLocation(this.data.keywords);
  },
  regionchange(e) {
    if (e.type == 'end' && (e.causedBy == 'scale' || e.causedBy == 'drag')) {
      clearTimeout(this.data.timer);
      this.ani = false;
      this.setData({
        ani:false
      })
      this.data.timer = setTimeout(() => {
        this.setData({
          ani:true
        })
      }, 300);
      if (!this.data.mapCtx) {
        this.data.mapCtx = wx.createMapContext('maps');
      }
      this.data.mapCtx.getCenterLocation({
        type: 'gcj02',
        success: res => {
          this.setData({
            latitude:res.latitude,
            longitude:res.longitude
          })
          this.getAddress(res.longitude, res.latitude);
        }
      });
    }
  },
  getAddress: function(lng, lat) {
    //根据经纬度获取地址信息
    this.data.qqmapsdk.reverseGeocoder({
      location: {
        latitude: lat,
        longitude: lng
      },
      success: res => {
        this.setData({
          keywords:res.result.formatted_addresses.recommend
        })
        this.getPoiAround();
      },
      fail: res => {
        this.setData({
          keywords:'车站'
        })
        this.getPoiAround();
      }
    });
  },
  currentLocation() {
    //当前位置
    const that = this;
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success(res) {
        that.setData({
          latitude:res.latitude,
          longitude:res.longitude
        })
        that.getAddress(res.longitude, res.latitude);
      },
      fail(res) {
        that.getAddress(that.longitude, that.latitude);
      }
    });
  },
  getLocation() {
    if (!this.data.pullUpOn || this.data.loading) return;
    this.setData({
      loading:true
    })
    let keywords = this.data.keywords;
    let index = keywords.indexOf('(');
    if (index !== -1) {
      keywords = keywords.substring(0, index);
    }
    this.data.qqmapsdk.getSuggestion({
      keyword: keywords,
      page_index: this.data.pageIndex,
      location: {
        latitude: this.data.latitude,
        longitude: this.data.longitude
      },
      success: res => {
        let data = res.data || [];
        this.calculateDistance(data, d => {
          if (d) {
            let arr = d.elements || [];
            for (let i = 0, len = data.length; i < len; i++) {
              data[i].distance = arr[i].distance;
            }
          }
          this.setData({
            address:this.data.address.concat(data),
            pageIndex:this.data.pageIndex+1,
            loading:false
          })
          if (data.length < 10) {
            this.setData({
              pullUpOn:false
            })
          }
        });
      },
      fail: res => {
        this.setData({
          loading:false
        })
        console.log(res);
      }
    });
  },
  search() {
    tui.href('../search-suggest/search-suggest');
  },
  back() {
    wx.navigateBack();
  },
  radioChange(e) {
    clearTimeout(this.data.changeTimer);
    this.data.changeTimer = null;
    console.log(this.data.index)
    let index=Number(e.detail.value);
    let item = this.data.address[index];
    this.setData({
      index:index,
      latitude:item.location.lat,
      longitude:item.location.lng
    })
  },
  btnFix() {
    let item = this.data.address[this.data.index];
    this.goback(item)
  },

  //按钮点击回调函数
  //同时更新首页上的位置信息
  goback: function (item) {
    console.log(JSON.stringify(item))
    //获取页面栈
    let pages = getCurrentPages();
    //检查页面栈
    //判断页面栈中页面的数量是否有跳转(可以省去判断)
    if(pages.length > 1){
        //获取上一个页面实例对象
        let prePage = pages[pages.length - 2];
        //调用上一个页面实例对象的方法
        //prePage.changeLocation("昆山市城西选择店","森林公园南门正门口","99");
        prePage.changeLocation(item.title,item.address,(item._distance/1000).toFixed(1));        
        //返回上一个页面
        wx.navigateBack();
    }
  }
})