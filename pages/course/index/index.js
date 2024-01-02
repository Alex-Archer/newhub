const app = getApp(); 
var moment = require('../../../libs/moment.min');
const logs = require("../../../utils/logs");
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
import _ from '../../../libs/we-lodash'
var md5util = require('../../../utils/md5.js')
var util = require('../../../utils/util.js')


Page({

  /**
   * 页面的初始数据 
   */
  data: {
    globalURL: app.globalData.globalURL,

    //1.顶部类型选择
    typeNavTop:0,//顶部距离
    isTypeNavFixed:false,//是否吸顶



//底部菜单
flag: true, //首页加载动画
tabbarShow: true, //底部菜单不与其它冲突默认关闭

indexPage: false, //是否在首页，tabbar和别人不一样
indexBackToTop: true, //是否返回顶部
current: 1, //tabbar 默认选中的项
//底部按钮 在首页有效果时 与 indexPage合用,并把第一个首页隐掉
tabBar: app.globalData.tabBar,
safeAreaBottom: app.globalData.safeAreaBottom,

//顶部导航选中项
tabTypeIndex: 0,//顶部大分类 默认认选择项
//tabDateIndex: 1,//日期选择模块 日期默认选中项



//顶部类型选择
typeScrollInto: '',//选择后运动到的位置
typeBars: 
[
  {
    name: '全部课程',
    id:"0",
    path: '/pages/course/index/index',
  },
  {
    name: '约团课',
    id:"1",
    path: '/pages/course/group/index',
  },
  {
    name: '约私教',
    id:"2",
    path: '/pages/course/personal/index',
  },
  // {
  //   name: '包月私教',
  //   id:"3",
  //   path: '/pages/course/personalMon/index',
  // },
  // {
  //   name: '集训营',
  //   id:"4",
  //   path: '/pages/course/camp/index',
  // }
],
//顶部类型选择END
tabIndex: -1, 
dateBars: [],
dateScrollInto:'',//选择后运动到的位置
dateTime:'',//今天日期 2023-05-02
//日期选择块END



    //=================
    banner: [],
    productList: [{
      img: 1,
      name: '李教练',
      rate: 5,
      price: 220
    },
    {
      img: 1,
      name: '李教练',
      rate: 5,
      price: 220
    },
    {
      img: 1,
      name: '李教练',
      rate: 5,
      price: 220
    }],

// 团课日期选择块
// newsList: [
  courseList: [],
  coursePageIndex:1,
  isLoadingCourse:true,
  noDataCourse:false, //可能用不到

  coachList:[],//教练列表
  campList:[],//训练营

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
      name:today.format('D').toString(),//日期 天，如6、16，不补全0
      id: today.format('D').toString(),//用 日期 天，如6、16 不补全0
      date: today.format('YYYY-MM-DD'), //2023-12-26,
      // weekday: today.toLocaleDateString('zh-CN', {weekday: 'long'}).replace('星期', '')
      weekday: "今天",
      number: 0,
      dot: false,
      allowClick:true,//允许点击,只有今天 明天 后天 3天可以点
  });

  // 明天
  const tomorrow = today.clone().add(1, 'day');//.clone()是解决today变异了，日期乱了，必须，不然就用moment().add()

  result.push({
    name:tomorrow.format('D').toString(),//日期 天，如6、16，不补全0
    id: tomorrow.format('D').toString(),//用 日期 天，如6、16 不补全0
    date: tomorrow.format('YYYY-MM-DD'), //2023-12-26,
      weekday: "明天",
      number: 0,
      dot: false,
      allowClick:true,//允许点击,只有今天 明天 后天 3天可以点
  });
  // 后天
  const afterTomorrow = today.clone().add(2, 'day');//.clone()是解决today变异了，日期乱了，必须，不然就用moment().add()
  result.push({
    name:afterTomorrow.format('D').toString(),//日期 天，如6、16，不补全0
    id: afterTomorrow.format('D').toString(),//用 日期 天，如6、16 不补全0
    date: afterTomorrow.format('YYYY-MM-DD'), //2023-12-26,
      weekday: "后天",
      number: 0,
      dot: false,
      allowClick:true,//允许点击,只有今天 明天 后天 3天可以点
  });
  

  // 第4天起
  for (let i = 3; i < 7; i++) {
      const nextDay = today.clone().add(i, 'day')//.clone()是解决today变异了，日期乱了，必须，不然就用moment().add()
      result.push({
        name:nextDay.format('D').toString(),//日期 天，如6、16，不补全0
        id: nextDay.format('D').toString(),//用 日期 天，如6、16 不补全0
        date: nextDay.format('YYYY-MM-DD'), //2023-12-26,

          weekday: this.getWeekByDate(nextDay), 
          number: 0,
          dot: false,
          allowClick:false,//允许点击,只有今天 明天 后天 3天可以点
      });
  }


  return result;
},

  //更多点击
  moreTap(e){
    let that = this;
    let _url = e.target.dataset.url || e.currentTarget.dataset.url;
    if(_url){
      wx.reLaunch({
        url: _url,
      })
    }
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
      //重新加载数据
      //this.loadCourse( this.data.dateBars[index].date);
      this.loadCourse(this.data.dateBars[index].date).then(val => {

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
    })
   
  },
  loadCourse(_date){

    return new Promise((resolve, reject) => {

      let _timestamp = (new Date(moment().format())).valueOf();      
      let config = {
        typeClass:0,
        pageSize:5,
        pageIndex:1,
        orderSet:0,
        typeId:0,
        storeId:0,
        coachId:0,
        dateTime:_date,




          userID: wx.getStorageSync('USERID'),
          TIMESTAMP: _timestamp,
          FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      };

      axios.get("Course/coursePub", config, {
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

//团课点击详情
//课程详情
groupShow(e) {

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
  //教练详情
  goToCoach(e){
    let uid = e.currentTarget.dataset.userid||e.target.dataset.userid;

    wx.navigateTo({
      url: '/pages/coach/index/index?uid='+uid,
    })
  },
//训练营点击
 //集训营显示
 campShow(e){
  let _campID = e.currentTarget.dataset.id||e.target.dataset.id;
  if (util.isNull(_campID)||!util.isNumber(_campID))
  {
     util.toast("信息有误");
      return;
  }
  wx.navigateTo({
    url: '/pages/course/camp_show/index?detailID='+_campID
  })
},

initData(){
  return new Promise((resolve, reject) => {
    
      let _timestamp = (new Date(moment().format())).valueOf();      
      let config = {
          userID: wx.getStorageSync('USERID'),
          TIMESTAMP: _timestamp,
          FKEY: md5util.md5(wx.getStorageSync('USERID') + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      };
      axios.get("Course/indexPub", config, {
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
              let _data = util.jsonTestParse(res.data.data); //解决返回为字符串型JSON问题
              resolve(util.jsonTestParse(_data));
          } else {
              reject(res.data.message);
          }
      }).catch((err) => {
          reject(err);
      });
  })

},
/**
 * 生命周期函数--监听页面加载
 */
onLoad(options) {

  wx.hideHomeButton({
    complete:()=>{
      console.log("99999")
    }
  })
  const that = this;
  const today = new Date(moment().format());//new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();


  // this.initData();
  //1.获取日程 并带点点
  new Promise((resolve, reject) => {
    //const today = new Date();
    //测试获取 周几
    let getNextSevenDays = this.getNextSevenDays();
    that.setData({
      dateBars: getNextSevenDays,
      dateTime: today.toISOString().slice(0, 10),
    }, () => {
      resolve()
    })
  }).then(val => {
    
    this.initData().then(val => {
      that.setData({
        banner:val.ad,//顶轮图
        courseList:val.course,//团课
        coachList:val.coach,//教练
        campList:val.camp,//训练营

        isLoadingCourse:false,
        noDataCourse:util.isNull(val.course)?true:false,
      })

    }, function (err) {
      that.setData({
        isLoadingCourse:false,
        noDataCourse:true,
      })
    });
  })
},

 // 底部菜单点击
 tabbarSwitch(e) {

    let _action = e.detail.action||"";//scanCode 为调用扫码
    let _navigate = e.detail.navigate||false;
    let isLogin = false;
    //"coachPath":"/pages/coach/home/index/index",//教练中心地址，不为空则需要验证身份,暂时放在集训营中来测试
    

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
//顶部大类点击 OK
tabTypeClick(e){

  let index = e.target.dataset.current || e.currentTarget.dataset.current;
  if(index == this.data.tabTypeIndex){
    return;
  }
  let path = e.target.dataset.path||e.currentTarget.dataset.path;
  wx.reLaunch({
    url: path,
  })
},
//选择大类 OK
switchTypeTab(index) {

  if (this.data.tabTypeIndex === index) return;
  
  //处理数据......
  
  let typeScrollInto = index - 1 < 0 ? 0 : index - 1;
  this.setData({
    tabTypeIndex: index,
    typeScrollInto: this.data.typeBars[typeScrollInto].id
  })

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


  onReady(e){
    //获取节点到顶部的距离
    wx.createSelectorQuery().select('#typeNavTop').boundingClientRect((rect)=>{
      if(rect&&rect.top){
        this.setData({
          typeNavTop:parseInt(rect.top)
        })
      }
    }).exec();
  },
  //页面滚动
onPageScroll(e)
{
  let scrollTop =parseInt(e.scrollTop);
  let isTypeNavFixed = scrollTop>this.data.typeNavTop;
  // let isSearchFixed = scrollTop>=this.data.isSearchFixed;
  // let isDropdowFixed = scrollTop>=this.data.isDropdowFixed;
  if(this.data.isTypeNavFixed!=isTypeNavFixed){
    this.setData({
      isTypeNavFixed
    })
  }

  // if(this.data.isSearchFixed!=isSearchFixed){
  //   this.setData({
  //     isSearchFixed
  //   })
  // }
  //  if(this.data.isDropdowFixed!=isDropdowFixed){
  //   this.setData({
  //     isDropdowFixed
  //   })
  // } 
},

})