const app = getApp();
const md5util = require('../../utils/md5.js');
const logs = require('../../utils/logs.js'); //日志打印
import _ from '../../libs/we-lodash'

const QQMapWX = require('../../libs/qqmap-wx-jssdk.1.2.js');
import tui from '../../common/httpRequest'

Page({
  data: {
    //胶囊位置
    statusBar: app.globalData.statusBar,
    customBar: app.globalData.customBar,
    navBarHeight: app.globalData.navBarHeight,


    ani: true,
    mapObj: null,

    qqmapsdk: app.globalData.MapQQ.MapSDK,
    key: app.globalData.MapQQ.MapKey,

    latitude: app.globalData.MapQQ.lat,
    longitude: app.globalData.MapQQ.lng, //默认市政府

    selectTitle:'',//用户选择的地址标题
    selectLat:'',//用户选择的lat
    selectLng:'',//用户选择的lng

    showNoAddress:true,//显示不选择位置 值为-1

    scrollH: 0,
    address: [],
    timer: null,
    keywords: '',
    location: null,
    pageIndex: 1,
    loading: false,
    pullUpOn: true,
    scrollTop: 0,
    index: -1,
    changeTimer: null
  },
  onLoad: function (options) {
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
  //子页面搜索确认后过来
  getLocationBySearch(res) {
    this.setData({
      latitude: res.lat,
      longitude: res.lng,
      keywords: res.keywords
    }, () => {
      this.getPoiAround();
    })
  },
  //计算距离
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
  //地图移动
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
  
  
  //搜索点击
  search() {
    tui.href('../search-suggest/search-suggest');
  },
  //返回上一面
  back() {
    wx.navigateBack();
  },
  //选择
  radioChange(e) {

    clearTimeout(this.data.changeTimer);
    this.data.changeTimer = null;

    let index=Number(e.detail.value);
    this.setData({
      index:index
    })
    //选择了 不显示位置
    if(index==-1){
      this.setData({
        selectTitle:'不显示位置',
        selectLat:'',//用户选择的lat
        selectLng:'',//用户选择的lng
      })
    }else
    {
    let item = this.data.address[index];
    this.setData({

      latitude:item.location.lat,
      longitude:item.location.lng,

      selectTitle:item.title,
      selectLat:item.location.lat,//用户选择的lat
      selectLng:item.location.lng,//用户选择的lng
    })
  }
  },
  //确认按钮
  btnFix() {
    let that = this;

    //获取页面栈
    let pages = getCurrentPages();
    //检查页面栈
    //判断页面栈中页面的数量是否有跳转(可以省去判断)
    if (pages.length > 1) {
      //获取上一个页面实例对象
      let prePage = pages[pages.length - 2];
      prePage.getParentLocation({
        lat:that.data.selectLat,
        lng:that.data.selectLng,
        keywords: that.data.selectTitle
      })      
      setTimeout(() => {
        wx.navigateBack();
      }, 0);
    }



  },

  //用到的=================
  //1.当前位置
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
  //2.周边位置列取
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
        // this.setData({
        //   keywords:'车站'
        // })
        this.getPoiAround();
      }
    });
  },
  //3.获取点位
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
  //4.填充数据
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
})