const app = getApp();
const md5util = require('../../../utils/md5.js');
const logs = require('../../../utils/logs.js'); //日志打印 
import _ from '../../../libs/we-lodash'
var util = require('../../../utils/util.js')
var apis = require('../../../utils/apis.js')

Page({
  data: {

    //轮播主件
    loadingSwiper: true,
    banner: null,
    Location: null,

    //胶囊位置
    statusBar: app.globalData.statusBar,
    customBar: app.globalData.customBar,
    navBarHeight: app.globalData.navBarHeight,


    indexPage: false, //是否在首页，tabbar和别人不一样
    indexBackToTop: true, //是否返回顶部
    current: 2, //tabbar 默认选中的项
    //底部按钮 在首页有效果时 与 indexPage合用,并把第一个首页隐掉
    tabBar: app.globalData.tabBar,
    safeAreaBottom: app.globalData.safeAreaBottom,

    loadingData: true, //数据加载中

    courseList: [],
    loadingText: '正在加载...',
    refreshing: false,
    refreshText: '',
    isLoading: false,
    pageSize: 10, //每页条数
    pageIndex: 1, //当前页
    lastPage: 1,
    total: 0,

    orderSet: 0, //排序方式 
    lng: null, //经度坐标
    lat: null, //纬度坐标
    storeId: 0, //门店ID
    branchname:'', // 门店名称
    coachId: 0, //指定教练ID


    //小鱼下面抽整过来

    //2.排序
    coachListData: [], //3.关注的教练列表 首次在下拉时填充
    thisDropIndex: 0, //当前proDropData填充的是哪一个 0没有 1门店 2排序 3教练
    proDropData: [], //3个菜单 共用体部份
    dropShow: false,
    dropHeaderShow: false, //下拉闪屏小鱼试解决

    //排序 在btnDropOrder中操作
    DropOrderIndex: -1, //三个排序 高分1，好评2、上课最多3

  },

  //1.排序
  btnDropOrder(e) {
    if(util.isNull(this.data.courseList)||this.data.courseList.length<=0)
    {
      return;
    }
    
    let index = e.currentTarget.dataset.index || e.target.dataset.index;
    if (index == this.data.DropOrderIndex) { //点击已选的 就取消
      this.setData({
        DropOrderIndex: -1,
      }, () => {
        //this.initLoad();//重新加载
        this.getData().then(_data => {
          //let _courseList = that.data.courseList;
          this.setData({
            courseList: _data.data,
            loadingData: false,
            isLoading: false,
            pageIndex: 1, //当前页
            lastPage: _data.lastPage,
            total: _data.total,
          })
        })
      })
    } else {
      this.setData({
        DropOrderIndex: index,
      }, () => {
        //this.initLoad();//重新加载
        this.getData().then(_data => {
          //let _courseList = that.data.courseList;
          this.setData({
            courseList: _data.data,
            loadingData: false,
            isLoading: false,
            pageIndex: 1, //当前页
            lastPage: _data.lastPage,
            total: _data.total,
          })
        })
      })
    }

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
      storeId: that.data.storeId || wx.getStorageSync('Location').id
    });

    _.assign(config, {
      pageSize: that.data.pageSize
    });
    _.assign(config, {
      //   pageIndex: that.data.pageIndex
      pageIndex: _pageIndex
    });


    //定位
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

    // //关健词
    // if (!util.isNull(that.data.word)) {
    //     _.assign(config, {
    //         word: that.data.word
    //     });
    // }

    //coachId  教练
    let _coachListData = that.data.coachListData;
    if (!util.isNull(_coachListData)) {
      let selectedIds = _.filter(_coachListData, item => item.selected).map(item => item.id).join(',');
      _.assign(config, {
        coachId: selectedIds
      });
    }

    //orderSet  排序
    let _orderListData = this.data.DropOrderIndex;
    if (!util.isNull(_orderListData)) {
      _.assign(config, {
        orderSet: _orderListData
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
      apis.get("Coach/listPub", getConfig, {
        "Content-Type": 'applciation/json'
      }, false).then(val => {
        resolve(val);
      })
    }).catch(err => {
      reject([]);
    })
  },


  //教练详情
  goToCoach(e) {

    // wx.navigateTo({
    //     url: '/pages/coach/index/index',
    // })
    let uid = e.currentTarget.dataset.userid || e.target.dataset.userid;

    wx.navigateTo({
      url: '/pages/coach/index/index?uid=' + uid,
    })
  },


  onLoad: function (options) {
    if(options.storid){
      this.setData({
        storeId: options.storid,
        branchname: options.title,
      })
    }
    wx.hideHomeButton();
    this.swiper(true);
  },
  /**
   * 加载轮显
   * @param {*} loadingDefault 是否需要重新加载数据
   */
  swiper(loadingDefault = false) {
    const that = this;
    new Promise(() => {
      //本地定位
      const _location = wx.getStorageSync('Location'); //this.data.Location||
      let _storeID = that.data.storeId
      if(_storeID){
        _storeID = that.data.storeId;
      }else{
        _storeID = _location.id;
      }
      if (!_storeID) {
        this.setData({
          DropOrderIndex: -1,
          Location: {
            "title": "请选择服务门店",
            "lat": 0,
            "lng": 0,
            "address": "选择默认门店可获更优服务"
          }
        }, () => {
          if (loadingDefault) {
            //需要重新加载教练列表
            this.getData().then(_data => {
              //let _courseList = that.data.courseList;
              that.setData({
                DropOrderIndex: -1,
                courseList: _data.data,
                loadingData: false,
                isLoading: false,
                pageIndex: 1, //当前页
                lastPage: _data.lastPage,
                total: _data.total,
              })
            })

          }
        })
      } else {
        
        //读取轮显图
        let _timestamp = (new Date()).valueOf();
        let _config = {
          storeId: _storeID,
          userID: wx.getStorageSync('USERID'),
          TIMESTAMP: _timestamp,
          FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        }
        apis.get("store/swiperPub", _config, {
          "Content-Type": 'applciation/json'
        }, false).then(val => {
          this.setData({
            DropOrderIndex: -1,
            Location: _location,
            banner: val,
            loadingSwiper: false,
          }, () => {
            if (loadingDefault) {
              //需要重新加载教练列表
              this.getData().then(_data => {
                //let _courseList = that.data.courseList;
                that.setData({
                  courseList: _data.data,
                  loadingData: false,
                  isLoading: false,
                  pageIndex: 1, //当前页
                  lastPage: _data.lastPage,
                  total: _data.total,
                })
              })

            }
          })
        })
      }
    })
  },
  btnSelected: function (e) {
    let index = e.currentTarget.dataset.index;
    let obj = this.data.proDropData[index];
    let key = `proDropData[${index}].selected`
    this.setData({
      [key]: !obj.selected
    })
  },
  reset() {
    let arr = this.data.proDropData;
    for (let item of arr) {
      item.selected = false;
    }
    this.setData({
      proDropData: arr
    })
  },

  loadMore(e) {
    let that = this;
    if (this.data.lastPage <= this.data.pageIndex) {
      return;
    }
    this.setData({
      isLoading: true
    }, () => {
      this.getData(this.data.pageIndex + 1).then(_data => {
        let _courseList = that.data.courseList;
        let _courseListTemp = _.concat(_courseList, _data.data);
        that.setData({
          // courseList: _courseList,
          // isLoading: false
          courseList: _courseListTemp,
          loadingData: false,
          isLoading: false,
          pageIndex: this.data.pageIndex + 1, //当前页
          lastPage: _data.lastPage,
          total: _data.total,
        })
      })


    })
  },

  //页面滚动
  onPageScroll(e) {
    //let scrollTop = parseInt(e.scrollTop);

  },
  onReady(e) {

    wx.createSelectorQuery().select('#FixedNavTop').boundingClientRect((rect) => {
      if (rect && rect.top) {
        this.setData({
          FixedNavTop: parseInt(rect.top)
        })
      }
    }).exec();
  },


  //弹窗 - 内容选择点击
  btnSelected: function (e) {

    let index = e.currentTarget.dataset.index;
    if (this.data.thisDropIndex === 2) //只能单选
    {
      let arr = this.data.proDropData;
      for (let i = 0; i < arr.length; i++) {
        if (i == index) {
          arr[i].selected = true;
        } else {
          arr[i].selected = false;
        }
      }
      this.setData({
        proDropData: arr
      })

    } else { //原来 多选
      let obj = this.data.proDropData[index];
      let key = `proDropData[${index}].selected`
      this.setData({
        [key]: !obj.selected
      })
    }


    if (this.data.thisDropIndex === 1) {
      this.setData({
        storeListData: this.data.proDropData
      })
    } else if (this.data.thisDropIndex === 2) {
      this.setData({
        orderListData: this.data.proDropData
      })
    } else if (this.data.thisDropIndex === 3) {
      this.setData({
        coachListData: this.data.proDropData
      })
    }


  },
  //弹窗 - 重置
  reset() {
    let arr = this.data.proDropData;
    for (let item of arr) {
      item.selected = false;
    }
    this.setData({
      proDropData: arr
    })

  },

  //#endregion  下拉选择=====================

  ToMapList: function (e) {
    wx.navigateTo({
      // 代表从教练列表跳转到选门店的
      url: '/pages/map/pointListView/index?teach=1',
    })
  },
  changeLocation: function (locationJson, LocationDistance) {

    this.setData({
      loadingSwiper: true,
      storeId: locationJson.id,
      Location: locationJson,
      locationDistance: LocationDistance
    }, () => {
      this.swiper(true);
    })

  },
  back() {
    wx.navigateBack();
  },
})