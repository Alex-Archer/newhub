const app = getApp();
var moment = require('../../../libs/moment.min');
const QQMapWX = require('../../../libs/qqmap-wx-jssdk.1.2.js');
const logs = require("../../../utils/logs");
import _ from '../../../libs/we-lodash'
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var apis = require('../../../utils/apis.js')
var util = require('../../../utils/util.js')
var md5util = require('../../../utils/md5.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        globalURL: app.globalData.globalURL,
        backParentErr: '',
        locationDistance: "0",
        storeID:0,
        agreePrivacy:false,

        qqmapsdk: app.globalData.MapQQ.MapSDK,
        key: app.globalData.MapQQ.MapKey, 
        lat: app.globalData.MapQQ.lat,
        lng: app.globalData.MapQQ.lng, //默认市政府

        banner: ['banner-1.png', 'banner-1.png', 'banner-1.png'],
        loadding: false,
        show: false,
        current: 0,
        index: 3,
        tabs: ['14', '15', '16', '17', '18', '19', '20'],
        tabs2: ['/miniprogram/url-img/store/photo-1.png', '/static/urlimg/srore/photo-1.png', '/static/urlimg/srore/photo-1.png', '/static/urlimg/srore/photo-1.png', '/static/urlimg/srore/photo-1.png', '/static/urlimg/srore/photo-1.png'],
        webURL: '/static/urlimg/srore/',
        evaluateList: [{
            star: 5,
            imgs: ['/miniprogram/url-img/store/img-10.png', '/miniprogram/url-img/store/img-10.png', '/miniprogram/url-img/store/img-10.png', '/miniprogram/url-img/store/img-10.png', '/miniprogram/url-img/store/img-10.png']
        }, {
            star: 4,
            imgs: ['/miniprogram/url-img/store/img-10.png']
        }, {
            star: 5,
            imgs: []
        }],
        productList: [{
                img: 'img-10',
                name: '#今天你做瑜伽了吗？',
                avatar: 'icon-storephoto',
                nickname: '童心未泯'
            },
            {
                img: 'img-10',
                name: '#今天你做瑜伽了吗？',
                avatar: 'icon-storephoto',
                nickname: '童心未泯'
            },
            {
                img: 'img-10',
                name: '#今天你做瑜伽了吗？',
                avatar: 'icon-storephoto',
                nickname: '童心未泯'
            }
        ],
        pageIndex: 1,
        loadding: false,
        pullUpOn: true,

        // 团课日期选择块
        groupList: [],
        cacheTab: [],
        tabIndex: 0,

        dateTime: '', //日期，可以是时间戳，也可是具体的日期2023-08-22
        dateBars: [], //周日期选择
        tabDateIndex: 0, //周日期选择模块 日期默认选中项 今天

        scrollInto: '',
        showTips: false,
        navigateFlag: false,
        pulling: false,
        //tuiTabsHeight: 90 * groupData.length + 300, //项目列表高*默认个数+日期选择高
        // 团课日期选择块END

        storeInfo: {},

        //名师数据部份
        coachList: [],
        cacheHeadTab: [],
        headTabIndex: 0,
        currentPicture: 0,
        coachBars: [{
                name: '张美女',
                headImg: '/miniprogram/url-img/store/icon-storephoto.png',
                bgImg: '/miniprogram/url-img/store/b.png',
                des: '王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
                grade: '金牌教练',
                gradeIco: 'vip-fill',
                picture: [
                    "/miniprogram/url-img/store/swiper01.png",
                    "/miniprogram/url-img/store/swiper02.png",
                    "/miniprogram/url-img/store/swiper03.png"
                ],
                id: 'hot',
                badge: '热',
                badgeType: 'red' //primary,warning,green,danger,white，black，gray,white_red
            },
            {
                name: '老王',
                headImg: 'https://gd-hbimg.huaban.com/15964b4aa1d3aa228c6b9a93dbd69decb0e608bfa121-bDxfWm_fw1200',
                bgImg: '/miniprogram/url-img/store/b.png',
                des: '2王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
                grade: '金牌教练2',
                gradeIco: 'vip-fill',
                picture: [
                    "/miniprogram/url-img/store/swiper01.png",
                    "/miniprogram/url-img/store/swiper02.png",
                    "/miniprogram/url-img/store/swiper03.png"
                ],
                id: 'yule',
                badge: '火',
                badgeType: 'warning'
            },
            {
                name: '小孙',
                headImg: '/miniprogram/url-img/store/icon-storephoto.png',
                bgImg: '/miniprogram/url-img/store/b.png',
                des: '3王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
                grade: '3金牌教练',
                gradeIco: 'vip-fill',
                picture: [
                    "/miniprogram/url-img/store/swiper01.png",
                    "/miniprogram/url-img/store/swiper02.png",
                    "/miniprogram/url-img/store/swiper03.png"
                ],
                id: 'sports',
                badge: '新',
                badgeType: 'green'
            },
            {
                name: '司空见',
                headImg: 'https://gd-hbimg.huaban.com/15964b4aa1d3aa228c6b9a93dbd69decb0e608bfa121-bDxfWm_fw1200',
                bgImg: '/miniprogram/url-img/store/b.png',
                des: '4王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
                grade: '4金牌教练',
                gradeIco: 'vip-fill',
                picture: [
                    "/miniprogram/url-img/store/swiper01.png",
                    "/miniprogram/url-img/store/swiper02.png",
                    "/miniprogram/url-img/store/swiper03.png"
                ],
                id: 'domestic',
                badge: '新',
                badgeType: 'white_red'
            },
            {
                name: '大帅',
                headImg: '/miniprogram/url-img/store/icon-storephoto.png',
                bgImg: '/miniprogram/url-img/store/b.png',
                des: '5王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
                grade: '5金牌教练',
                gradeIco: 'vip-fill',
                picture: [
                    "/miniprogram/url-img/store/swiper01.png",
                    "/miniprogram/url-img/store/swiper02.png",
                    "/miniprogram/url-img/store/swiper03.png"
                ],
                id: 'finance'
            },
            {
                name: '小美',
                headImg: 'https://gd-hbimg.huaban.com/15964b4aa1d3aa228c6b9a93dbd69decb0e608bfa121-bDxfWm_fw1200',
                bgImg: '/miniprogram/url-img/store/b.png',
                des: '6王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
                grade: '6金牌教练',
                gradeIco: 'vip-fill',
                picture: [
                    "/miniprogram/url-img/store/swiper01.png",
                    "/miniprogram/url-img/store/swiper02.png",
                    "/miniprogram/url-img/store/swiper03.png"
                ],
                id: 'keji'
            },
            {
                name: '大壮',
                headImg: 'https://gd-hbimg.huaban.com/15964b4aa1d3aa228c6b9a93dbd69decb0e608bfa121-bDxfWm_fw1200',
                bgImg: '/miniprogram/url-img/store/b.png',
                des: '7王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
                grade: '7金牌教练',
                gradeIco: 'vip-fill',
                picture: [
                    "/miniprogram/url-img/store/swiper01.png",
                    "/miniprogram/url-img/store/swiper02.png",
                    "/miniprogram/url-img/store/swiper03.png"
                ],
                id: 'education'
            },
            {
                name: '小可爱',
                headImg: '/miniprogram/url-img/store/icon-storephoto.png',
                bgImg: '/miniprogram/url-img/store/b.png',
                des: '8王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚王楚楚',
                grade: '8金牌教练',
                gradeIco: 'vip-fill',
                picture: [
                    "/miniprogram/url-img/store/swiper01.png",
                    "/miniprogram/url-img/store/swiper02.png",
                    "/miniprogram/url-img/store/swiper03.png"
                ],
                id: 'car'
            }
        ],
        coachScrollInto: '',
        // 缓存最多页数
        COACH_MAX_CACHE_PAGEINDEX: 3,
        // 缓存页签数量
        COACH_MAX_CACHE_PAGE: 3,
        //名师数据部份 END


        dateBars: [],
dateScrollInto:'',//选择后运动到的位置
dateTime:'',//今天日期 2023-05-02

      campList:[],//集训营
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
    previewImage(e) {
        let dataset = e.currentTarget.dataset;
        let index = Number(dataset.index)
        let current = Number(dataset.current)
        let imgs = this.data.evaluateList[index].imgs
        let urls = imgs.map(item => {
            return this.data.webURL + item
        })
        wx.previewImage({
            current: urls[current],
            urls: urls
        })
    },
    
getLocation() {
    //当前位置
    const that = this;
    return new Promise((resolve, reject) => {
        //H5：使用坐标类型为 gcj02 时，需要配置腾讯地图 sdk 信息（manifest.json -> h5）
        wx.getLocation({
        type: 'gcj02',
        altitude: true,
        success(res) {
            resolve([res.latitude,res.longitude])
        },
        fail(res) {
            reject();
        }
        });
    });
  }, 
  calculateTwoPlaceDistance(_lat, _lng) {
    const _this = this;
    const _qqmapsdk = _this.data.qqmapsdk;
    return new Promise((resolve, reject) => {
        _qqmapsdk.calculateDistance({
            //mode: 'driving',//可选值：'driving'（驾车）、'walking'（步行），不填默认：'walking',可不填
            mode: "walking",
            from: {
                latitude: this.data.storeInfo.lat,
                longitude: this.data.storeInfo.lng
            },
            to: "" + _lat + "," + _lng + "",
            success: (res) => {

                let hw = res.result.rows[0].elements[0].distance; 
                if (hw && hw !== -1) {
                    if (hw < 1000) {
                        hw = hw + "m";
                    }
   
                    else {
                        hw = (hw / 2 / 500).toFixed(2) + "km";
                    }
                } else {
                    hw = "0m";
                }
                resolve(hw);
            },
            fail: (error) => {
                reject(error);
            }
        });
    })
},
    agree(e){

        console.log("用户同意隐私授权, 接下来可以调用隐私协议中声明的隐私接口")
        this.setData({
            agreePrivacy:true,
        })

        },
        disagree(e){
          //console.log("用户拒绝隐私授权, 未同意过的隐私协议中的接口将不能调用")
          util.toast("您将以游客身份浏览！")
          this.setData({
              locationDistance:"未授权",
              agreePrivacy:false,
          },()=>{
              this.initOnLoad(true);
          })
        },
    //初始数据
    initLoad(_storeID = 1) {
        let _timestamp = (new Date()).valueOf();
        return new Promise((resolve, reject) => {
            axios.get("/Store/detailPub", {
                id: _storeID,
                userID: wx.getStorageSync('USERID'),
                thisPage: "store",
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5("store" + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
                    //resolve(res.data.data);
                    let _data = util.jsonTestParse(res.data.data); //解决返回为字符串型JSON问题
                    resolve(util.jsonTestParse(_data));
                } else {
                    reject();
                }

            }).catch((err) => {
                reject();
            });
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let that = this;
        const _storeID = options.storeID;
        if (util.isNull(_storeID)) {
            that.setData({
                backParentErr: "参数有误"
            }, () => {
                wx.navigateBack();
            })
            return;
        }
        this.initLoad(_storeID).then(val=>{
            that.setData({
                storeInfo: val,
            },()=>{
                wx.setNavigationBarTitle({
                title: val.title,
                })
                if(!this.data.agreePrivacy)
                {
                    return
                }
                this.data.qqmapsdk = new QQMapWX({
                    key: this.data.key
                });
                this.getLocation().then(val => {
                    this.calculateTwoPlaceDistance(val[0],val[1]).then(res=>{
                        this.setData({
                            locationDistance:res
                        })
                    }, function (err) {
                        
                    });
                });

            })
        },function(err){
        })
  


        //2.获取周几菜单
        new Promise(() => {
            const today = new Date(moment().format());
            let getNextSevenDays = this.getNextSevenDays();
            that.setData({
                dateBars: getNextSevenDays,
                dateTime: today.toISOString().slice(0, 10),
            },()=>{
              this.loadCourse(today.toISOString().slice(0, 10));
            })
        })
        //3.集训营
        new Promise(() => {
          this.loadCamp(_storeID);
      })
        //开始加载下部数据

    },
    loadCamp(_storeID){
      let that = this;
      let _timestamp = (new Date(moment().format())).valueOf();
            let config = {
              typeClass: 0,
              pageSize: 20,
              pageIndex: 1,
              orderSet: 0,
              typeId: 0,
              storeId: _storeID,
              coachId: 0,
              userID: wx.getStorageSync('USERID'),
              TIMESTAMP: _timestamp,
              FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
            };
    
            apis.get("CourseCamp/courseCampPub", config, {
              "Content-Type": 'applciation/json'
            }, false).then(val => {

              if(util.isNull(val.data))
              {
                that.setData({
                  campList:[]
                })
              }else{
                
                that.setData({
                  campList:val.data
                })
      
              }
    
            }, function (err) {
              that.setData({
                courseList:[],//团课
                isLoadingCourse:false, 
                noDataCourse:true, 
              })
            });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        //用于上一页弹出错误提示
        if (!util.isNull(this.data.backParentErr)) { //是否需要刷新
            // 页面卸载时触发
            //触发用户中心更新头像昵称
            let pages = getCurrentPages(); //获取页面栈
            if (pages.length > 1) //判断页面栈中页面的数量是否有跳转(可以省去判断)
            {
                let prePage = pages[pages.length - 2]; //获取上一个页面实例对象
                prePage.callBackReturn({
                    backParentErr: this.data.backParentErr,
                });
            }
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

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
      let that = this;
      if (this.data.tabIndex === index) return;
      this.setData({ 
          isLoadingCourse:true, 
          noDataCourse:false, 
          tabIndex: index,
          scrollInto: this.data.dateBars[index].id          
      },()=>{
        this.loadCourse(this.data.dateBars[index].date);
        
      })
      
  
      
    },

loadCourse(_data){
  let that = this;
  let _timestamp = (new Date(moment().format())).valueOf();
        let config = {
          typeClass: 0,
          pageSize: 5,
          pageIndex: 1,
          orderSet: 0,
          typeId: 0,
          storeId: 0,
          coachId: 0,
          dateTime: _data,
          userID: wx.getStorageSync('USERID'),
          TIMESTAMP: _timestamp,
          FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        };

        apis.get("Course/coursePub", config, {
          "Content-Type": 'applciation/json'
        }, false).then(val => {
          let _data = val;
          if(util.isNull(val.data))
          {
            that.setData({
              courseList:[],//团课
              isLoadingCourse:false, 
              noDataCourse:true,
            })
          }else{
            let tempArr =[];//临时数组
            _.each(val.data, x => {
                    tempArr.push({
                    "id": x.course[0].id,
                    "title": x.course[0].title,
                    "starttime":x.course[0].starttime,
                    "endtime":x.course[0].endtime,
                    "registerednum": x.course[0].registerednum,
                    "peoplenum": x.course[0].peoplenum,
                    "listposter":x.course[0].listposter,
                    "enrollstate": x.course[0].enrollstate,
                    "registeropen": x.course[0].listpregisteropenoster,
                    "score": x.score
                  });
            });
            that.setData({
              courseList:tempArr,//团课
              isLoadingCourse:false, 
              noDataCourse:false, 
            })
  
          }

        }, function (err) {
          that.setData({
            courseList:[],//团课
            isLoadingCourse:false, 
            noDataCourse:true, 
          })
        });

},
    
    openLocation(e)
    {
        let item = e.currentTarget.dataset;
        if(util.isNull(item)){
            util.toast("数据有误！");
            return;
        }
        const latitude = Number(item.lat);
        const longitude = Number(item.lng);
        wx.openLocation({
            name: item.title,
            address: item.address,
            latitude,
            longitude,
            scale: 18
        });
    }
,

})