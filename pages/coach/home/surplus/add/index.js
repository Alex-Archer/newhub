const app = getApp();
var moment = require('../../../../../libs/moment.min');
const logs = require("../../../../../utils/logs");
import _ from '../../../../../libs/we-lodash'
import axios from '../../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../../../utils/util.js')
var md5util = require('../../../../../utils/md5.js')
const filter = require('../../../../../utils/loginFilter'); 
let calendar = null; 
// 缓存最多页数
const MAX_CACHE_PAGEINDEX = 3;
// 缓存页签数量
const MAX_CACHE_PAGE = 3;
Page(filter.loginCheck(true, app, { 

    /**
     * 页面的初始数据
     */
    data: {
        refreshParent:false,//返回是否需要刷新

        select_all:false,//是否全选了
        today:null,
        
        flag: true, //首页加载动画
        tabbarShow: true, //底部菜单不与其它冲突默认关闭

        restToday:0,//今天是否休息

        restTimeShow:false,
        restTimeText:"30分钟",
        restTimeValue:30,
        restTimeArr: [{
            text: '30分钟',
            value: 30
            },
            {
                text: '1小时',
                value: 60
            },
            {
                text: '2小时',
                value: 120
            },
            {
                text: '3小时',
                value: 180
            }
            ,
            {
                text: '4小时',
                value: 240
            }
            ,
            {
                text: '5小时',
                value: 300
            }
        ],
       


        indexBackToTop: false, //是否返回顶部
        current: 0, //tabbar 默认选中的项
        //底部按钮 在首页有效果时 与 indexPage合用,并把第一个首页隐掉
        safeAreaBottom: app.globalData.safeAreaBottom,

        dateScrollInto: '', //选择后运动到的位置
        tabDateIndex: 0, //日期选择模块 日期默认选中项
        //日期选择块END

        groupList: [],
        groupTempList: [],//用于存初始groupList 只有当有修改时就提示保存
        groupEdit:false,//上面两个数组比较，来控制是否保存按钮可不可用
        groupEditText:'当前档期无变化',
        groupEditDate:'',//当前日期，只是显示
        groupSubmitDate:'',//当前日期，提交的，需要补全0的

        cacheTab: [],
        tabIndex: 0,
        
        // scrollInto: '',
        showTips: false,
        navigateFlag: false,
        pulling: false,
       // tuiTabsHeight: 90 * groupData.length, //项目列表高*默认个数+日期选择高
        // 团课日期选择块END

        showActionSheet: false,
        tips: "设置休息后将无法接约，您确认休息吗？",
        actionItemList: [{ text: "确认休息",color: "#E3302D"}],
        maskClosable: true, //可以点击外部任意地方关闭
        color: "#9a9a9a",
        size: 26,
        isCancel: true,
    },


    
    test() {
        let that = this; 
        const SUBSCRIBE_ID = 'uZmNcZAqvGOQu-GTSTQZ5bbuddF7eegbddimuQBcD80' // 模板ID
        if (wx.requestSubscribeMessage) {
            wx.requestSubscribeMessage({
                tmplIds: [SUBSCRIBE_ID],
                success(res) {
                    if (res[SUBSCRIBE_ID] === 'accept') {
                        // 用户主动点击同意...do something
                        wx.showToast({
                            title: '主动同意',
                            icon: 'none'
                        })
                    } else if (res[SUBSCRIBE_ID] === 'reject') {
                        // 用户主动点击拒绝...do something
                        wx.showToast({
                            title: '主动拒绝',
                            icon: 'none'
                        })
                    } else {
                        wx.showToast({
                            title: '授权订阅消息有误',
                            icon: 'none'
                        })
                    }
                },
                fail(res) {
                    // 20004:用户关闭了主开关，无法进行订阅,引导开启
                    if (res.errCode == 20004) {
                        // 显示引导设置弹窗
                        wx.showToast({
                            title: '显示引导设置弹窗',
                            icon: 'none'
                        })
                        that.setData({
                            isShowSetModel: true
                        })
                    } else {
                        // 其他错误信息码，对应文档找出原因
                        wx.showModal({
                            title: '提示',
                            content: res.errMsg,
                            showCancel: false
                        })
                    }
                }
            });
        } else {
            wx.showModal({
                title: '提示',
                content: '请更新您微信版本，来获取订阅消息功能',
                showCancel: false
            })
        }


    },
    handleAction(e) {

    },
    afterTapDay(e) {
        console.log('afterTapDay', e.detail)
    },
    afterCalendarRender(e) {
        console.log('afterCalendarRender', e)
        console.log('【afterCalendarRender】', this.calendar, true)


        calendar = this.calendar;
        const area = ['2023-09-07', '2023-09-17']
        let action = 'enableArea'
        this.calendar[action](area)
        //1.禁选指定日期
        this.calendar.disableDay([{
            year: 2023,
            month: 9,
            day: 12
        }]);

        //2.选中指定日期
        const toSet = [{
                year: 2023,
                month: 9,
                day: 13
            },
            {
                year: 2023,
                month: 9,
                day: 16
            }
        ]
        this.calendar["setSelectedDays"](toSet);
    },
    //取消重选
    cancelSelectedDates(e) {
        const resetDay = [{
                year: 2023,
                month: 9,
                day: 13
            },
            {
                year: 2023,
                month: 9,
                day: 14
            }
        ]
        //不传 resetDay 则取消所有已选择的日期
        this.calendar.cancelSelectedDates();
    },
    //回到本月
    jumpMonth(e) {

        this.calendar.jump(2023, 9);
    },
    //全选时间
    selectAllTime(e) {

       let that = this;
       let _tabIndex = this.data.tabIndex;//当前选项卡
       let _timeDate = this.data.groupList[_tabIndex].data; //当前时间数组  
       let tempArr = _timeDate;//临时数组
       //_.set(tempArr, '[' + _index + '].use', !this.data.groupList[_tabIndex].data[_index].use)
       _.each(tempArr, x => {
            if(x.state !== 2) {
                x.use = true;
                x.state = 1;
            }
        });
       that.setData({
           [`groupList[${_tabIndex}].data`]: tempArr,
           select_all:true,
       },()=>{
            //数据与临时文件相同
            if(_.isEqual(this.data.groupList[_tabIndex].data, this.data.groupTempList[_tabIndex].data)){
                this.updateDateBotton(this.data.dateBars[_tabIndex].date,false);
            }else{
                this.updateDateBotton(this.data.dateBars[_tabIndex].date,true);
            }
       })


    },
    //取消全选时间
    resetAllTime(e) {

       let that = this;
       let _tabIndex = this.data.tabIndex;//当前选项卡
       let _timeDate = this.data.groupList[_tabIndex].data; //当前时间数组  
       let tempArr = _timeDate;//临时数组
       _.each(tempArr, x => {
            if(x.state !== 2) {
                x.use = false;
                x.state = 0;
            }
        });
       that.setData({
           [`groupList[${_tabIndex}].data`]: tempArr,
           select_all:false,
        },()=>{
            //数据与临时文件相同
            if(_.isEqual(this.data.groupList[_tabIndex].data, this.data.groupTempList[_tabIndex].data)){

                this.updateDateBotton(this.data.dateBars[_tabIndex].date,false);
            }else{

                this.updateDateBotton(this.data.dateBars[_tabIndex].date,true);
            }
       })


    },
    //时间段点击
    clickThisTime(e) {
        // 0未排课 1教练排课了 2及其它都是已约或占用
        let that = this;
        let _tabIndex = this.data.tabIndex;//当前选项卡
        let _index = e.currentTarget.dataset.index || e.target.dataset.index;//当前时间选择的索引

        let tempArr = this.data.groupList[_tabIndex].data; //当前时间数组  
        //如果已经是占用的
        if(tempArr[_index].state==2)
        {
            util.toast("有其它按排，无法选择");
            return;
        }

        _.set(tempArr, '[' + _index + '].use', !this.data.groupList[_tabIndex].data[_index].use)
        _.set(tempArr, '[' + _index + '].state', this.data.groupList[_tabIndex].data[_index].use?1:0);
        that.setData({
            [`groupList[${_tabIndex}].data`]: tempArr
        },()=>{
            //数据与临时文件相同
            if(_.isEqual(this.data.groupList[_tabIndex].data, this.data.groupTempList[_tabIndex].data)){
                this.updateDateBotton(this.data.dateBars[_tabIndex].date,false);
            }else{
                 this.updateDateBotton(this.data.dateBars[_tabIndex].date,true);
            }
        })
    },

    compareElement(a, b) {
        
        return _.isEqual(a.use, b.use); 
    },

    //1.获取时间
    getTimeJson(_date) {
        let _timestamp = (new Date()).valueOf();
        return new Promise((resolve, reject) => {
            axios.get("Coach/getPlanTime", {
                date: _date,
                userID: wx.getStorageSync('USERID'),
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5(wx.getStorageSync('USERID') +_date.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
                    resolve(res.data.data);
                } else {
                    reject(res.data.message);
                }

            }).catch((err) => {
                reject("数据处理有误");
            });
        });
    },
    //进入初始化数据
    randomfn(_defaultData) {
        let ary = [];
        for (let i = 0, length = this.data.dateBars.length; i < length; i++) {
            let aryItem = {
                loadingText: '正在加载...',
                refreshing: false,
                refreshText: '',
                data: [],
                isLoading: false,
                pageIndex: 1,
                restTime:0,//默认休息多久
                rest:0//当天是否休息 0为否 1为是
            };
            if (i === this.data.tabIndex) {
                aryItem.pageIndex = 2;
                // aryItem.data = aryItem.data.concat(this.getDataJson());
               aryItem.data = aryItem.data.concat(_defaultData.list);
               aryItem.restTime = _defaultData.restTime;//课间休息时间
               aryItem.rest = _defaultData.rest;//当天是否休息
            }
            ary.push(aryItem);
        }
        return ary;
    },
    //更新按钮
    updateDateBotton(_date,_isEdit){
        let today;
        let that = this;
        if(util.isNull(_date)){
            today = new Date();
        }else{
            today = new Date(_date);
        }
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        that.setData({
            groupEdit:_isEdit,
            groupEditText:!_isEdit?'当前档期无变化':'确认保存当前档期',
            groupEditDate:`${year}年${month}月${day}日`,
            groupSubmitDate:`${year}-${month.toString().padStart(2,"0")}-${day.toString().padStart(2,"0")}`

        })

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        wx.hideHomeButton();
        let that = this;
        const today  = new Date(moment().format());
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        
        //1. 今天日期
        new Promise(() => {
            that.setData({
                today:{
                    day:day.toString().padStart(2,"0"),//补全0
                    week:this.getWeekByDate(today),
                    date:`${year}年${month}月`
                },
                groupEditDate:`${year}年${month}月${day}日`,
                groupSubmitDate:`${year}-${month.toString().padStart(2,"0")}-${day.toString().padStart(2,"0")}`
            })
        })
        
        setTimeout(() => {
            wx.getSystemInfo({
                success: res => {
                    logs.log("高----", res.screenHeight)
                    this.setData({
                        height: res.windowHeight - res.windowWidth / 750 * 92
                    });
                }
            });
        }, 50);

        //2. 加载时间段
        let _data = year + "-" + month.toString().padStart(2,"0") + "-" + day.toString().padStart(2,"0");
        this.getTimeJson(_data).then(val => {
            let defaultData =  this.randomfn(val);

            //休息时间读取
            const _restTimeValue = val.restTime||30;
            const _restTimeText = _.find(this.data.restTimeArr, {value: _restTimeValue}).text||'30分钟';

            this.setData({
                groupList: defaultData,
                groupTempList:_.cloneDeep(defaultData),
                
                //休息时间呈现
                restTimeValue:_restTimeValue,
                restTimeText:_restTimeText,

                restToday:defaultData[0].rest,//当天是否休息
            })
        }, function (err) { 
            
        });

        //1.获取周几菜单
        new Promise((resolve, reject) => {
            const today  = new Date(moment().format());
            //测试获取 周几
            let getNextSevenDays = this.getNextSevenDays();
            that.setData({
                dateBars: getNextSevenDays,
                dateTime: today.toISOString().slice(0, 10),
            }, () => {
                resolve();
            })
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
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },



    //2.获取数据
    getTimeList(index, refresh) {
        let activeTab = this.data.groupList[index];
        let activeDate = this.data.dateBars[index].date;
        this.getTimeJson(activeDate).then(list => {    
            if (refresh) {
                activeTab.data = [];
                activeTab.loadingText = '正在加载...';
                activeTab.pageIndex = 1;
                activeTab.restTime = list.restTime;
                activeTab.rest = list.rest;     
                activeTab.data = list.list || [];
            } else {

                activeTab.restTime = list.restTime;
                activeTab.rest = list.rest;     
                activeTab.data = list.list;
                activeTab.isLoading = false;
            }

            //休息时间读取
            const _restTimeValue = activeTab.restTime||30;
            const _restTimeText = _.find(this.data.restTimeArr, {value: _restTimeValue}).text||'30分钟';

            this.setData({
                [`groupList[${index}]`]: activeTab,
               [`groupTempList[${index}]`]:_.cloneDeep(activeTab),
                
               //休息时间呈现
                restTimeValue:_restTimeValue,
                restTimeText:_restTimeText,

                restToday : activeTab.rest||0,    
   
            })
        }, function (err) { 
            
        });
        
    },

    //日期点击
    tabClick(e) {
        let index = e.target.dataset.current || e.currentTarget.dataset.current;
        if(!this.data.dateBars[index].allowClick)
        {
            util.toast("只能预排三天档期");
            return;
        }
        this.switchTab(index);
    },
    tabChange(e) {
        if (e.detail.source == 'touch') {
            let index = e.target.current || e.detail.current;
            if(!this.data.dateBars[index].allowClick)
            {
                util.toast("只能预排三天档期");
                this.switchTab((index-1)<=0?0:index-1,true);//true为强制 forceBack
                return;
            }

            this.switchTab(index);
        }
    },
    /**
     * 选择日期
     * @param {*} index  索引
     * @param {*} forceBack 强制返回，解决只许选三天时，非用户点击返回上索引
     */
    switchTab(index,forceBack=false) { 
        if (!forceBack&&this.data.tabIndex === index) return; //增加 forceBack强制返回，解决只许选三天时，非用户点击返回上索引

        let value = `groupList[${index}].isLoading`
        if (this.data.groupList[index].data.length === 0) {

            this.setData({
                [value]: true
            })
            this.getTimeList(index);
        }else{
            //休息时间
            let _restTimeValue = this.data.groupList[index].restTime||30;
            let _restTimeText = _.find(this.data.restTimeArr, {value: _restTimeValue}).text||'30分钟';

            let _restToday =  this.data.groupList[index].rest||0;
            this.setData({
                //休息时间
                restTimeValue:Number(_restTimeValue),
                restTimeText:_restTimeText.toString(),
                restToday:_restToday,
            })
        }
        // 缓存 tabId
        if (this.data.groupList[this.data.tabIndex].pageIndex > MAX_CACHE_PAGEINDEX) {
            
            let isExist = this.data.cacheTab.indexOf(this.data.tabIndex);
            if (isExist < 0) {
                this.data.cacheTab.push(this.data.tabIndex);
            }
        }
        
        let dateScrollInto = index - 1 < 0 ? 0 : index - 1;
        




        this.setData({
            tabIndex: index,
            dateScrollInto: this.data.dateBars[dateScrollInto].id,
        })

        // 释放 tabId
        if (this.data.cacheTab.length > MAX_CACHE_PAGE) {
            let cacheIndex = this.data.cacheTab[0];
            this.clearTabData(cacheIndex);
            this.data.cacheTab.splice(0, 1);
        }

        



        //数据与临时文件相同
        if(_.isEqual(this.data.groupList[index].data, this.data.groupTempList[index].data)){
            this.updateDateBotton(this.data.dateBars[index].date,false);
        }else{
            this.updateDateBotton(this.data.dateBars[index].date,true);
        }
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
              weekday: this.getWeekByDate(nextDay), //解决 https://www.codenong.com/cs106059340/
              number: 0,
              dot: false,
              allowClick:false,//允许点击,只有今天 明天 后天 3天可以点
          });
      }


      return result;
  },
    //#region 休息时间选择
    selectRestTime(e){
        this.setData({
            restTimeShow: true
        })
    },
    changeRestTime(e){
        let that = this;
        if (e.detail.text == that.data.restTimeText) {
            return;
        }
        let _restTimeValue = e.detail.value;
        let _restTimeText = e.detail.text;
        that.setData({
            restTimeText: _restTimeText,
            restTimeValue: _restTimeValue //默认选中
        },()=>{
            //看看时间
            let _tabDateIndex = this.data.tabIndex;//当前索引
            let _groupList = this.data.groupList;//当前数据
            if(_restTimeValue!=_groupList[_tabDateIndex].restTime)
            {
                this.updateDateBotton(this.data.dateBars[_tabDateIndex].date,true);
            }else{
                this.updateDateBotton(this.data.dateBars[_tabDateIndex].date,false);
            }
            
        })

    },
    hideRestTime(e){
        this.setData({
            restTimeShow: false
        })

    },
    //#endregion 休息时间选择

    //#region 排课提交
    buttonForm(e){
        let dataTableIndex = this.data.tabIndex;
        if(!this.data.groupEdit){
            util.toast("当日数据无变化!")
        }
        let that = this;
        this.submitForm().then(val=>{
            //成功了
            that.setData({
                refreshParent:true,//返回需要刷新父窗
                [`groupList[${dataTableIndex}].data`]:val,
                [`groupList[${dataTableIndex}].restTime`]:this.data.restTimeValue,
                [`groupTempList[${dataTableIndex}].data`]:_.cloneDeep(val),
                //[`groupTempList[${dataTableIndex}].restTime`]:this.data.restTimeValue,             
            },()=>{
                if(_.isEqual(this.data.groupList[dataTableIndex].data, this.data.groupTempList[dataTableIndex].data)){
                    this.updateDateBotton(this.data.dateBars[dataTableIndex].date,false);
                }else{
                    this.updateDateBotton(this.data.dateBars[dataTableIndex].date,true);
                }
                util.toast(this.data.groupEditDate +" 数据保存成功!");
            })
        })




        

    },
    submitForm(){
        // let that = this;
        let _groupSubmitDate = this.data.groupSubmitDate;//2023-09-06
        let _tabDateIndex = this.data.tabIndex;//当前索引
        let _groupList = this.data.groupList;//当前数据
        let _restTimeValue = this.data.restTimeValue;//休息时间

        let _timestamp = (new Date()).valueOf();
        let postConfig = {
            date: _groupSubmitDate,
            restTime:_restTimeValue,//教练自定义修息时长，单位：分钟
            timeArray:_groupList[_tabDateIndex].data,//状态列表


            userID: wx.getStorageSync('USERID'),
            TIMESTAMP: _timestamp,
            FKEY: md5util.md5(wx.getStorageSync('USERID') +_groupSubmitDate + _restTimeValue + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
        }
        return new Promise((resolve, reject) => {
            axios.post("Coach/sendPlanTime",postConfig, {
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
                    resolve(res.data.data);
                } else {
                    reject(res.data.message);
                }

            }).catch((err) => {
                reject("数据处理有误");
            });
        });
    },
    
    //#endregion 排课提交
    actionButtons(e)
    {
        const that = this;
        let _actionType = e.currentTarget.dataset.ac || e.target.dataset.ac;

        if(_actionType===0){
            that.setData({
                tips: "设置休息后将无法接约，您确认休息吗？",
                actionItemList: [{ text: "确认休息",color: "#E3302D"}],
                showActionSheet: true
            })
        }else{
            that.setData({
                tips: "取消休息后用户将可以约您，确认正常工作吗？",
                actionItemList: [{ text: "确认解除休息",color: "#319fa6"}],
                showActionSheet: true
            })
        }
    },
    //面板点击 操作 确认
    actionItemClick(e) 
    {
        const that = this;
        let _tabIndex = this.data.tabIndex;//当前选项卡

         let _groupData = this.data.groupList[_tabIndex]; //当前数组 
         let _restType = _groupData.rest;
        let _restDate = this.data.groupSubmitDate;
        if(_restType===0)
        {//设置休息
            this.confirmRest(_restDate,1);//设置休息

        }else{//解除休息
            this.confirmRest(_restDate,0);//解除休息

        }
        

    },
    //面板关闭
    closeActionSheet(e) {
        this.setData({
            actionType:0,//操作类型 在data-actiontype 中带入
            tips: "设置休息后将无法接约，您确认休息吗？",
            actionItemList: [{ text: "确认休息",color: "#E3302D"}],
            showActionSheet: false
        })
    },
    //操作休息/工作
    confirmRest(_restDate,_restType)
    {
        let that = this;
        let _restText = _restType===0?"正常工作":"休息";
        let _tabIndex = this.data.tabIndex;//当前选项卡
        this.restController(_restDate,_restType).then(val => {
            if(_restType===0){
                util.toast("成功设置个人状态为正常工作", null, null, (e) => {
                    this.setData({
                        [`groupList[${_tabIndex}].rest`]: 0,
                        tips: "设置休息后将无法接约，您确认休息吗？",
                        actionItemList: [{ text: "确认休息",color: "#E3302D"}],
                        showActionSheet: false,
                        restToday:0,
                        refreshParent:true,//返回需要刷新父窗
                    })
                });
            }else{
                util.toast("成功设置个人状态为休息", null, null, (e) => {
                    this.setData({
                        [`groupList[${_tabIndex}].rest`]: 1,
                        tips: "取消休息后用户将可以约您，确认正常工作吗？",
                        actionItemList: [{ text: "确认解除休息",color: "#319fa6"}],
                        showActionSheet: false,
                        restToday:1,
                        refreshParent:true,//返回需要刷新父窗
                    })
                });
            }

        },function(err){
            util.toast(err, null, null, (e) => {
                that.setData({
                    tips: "设置休息后将无法接约，您确认休息吗？",
                    actionItemList: [{ text: "确认休息",color: "#E3302D"}],
                    showActionSheet: false
                })
            });
        })
    },
    restController(_restDate,_restType){
        let _timestamp = (new Date()).valueOf();
        return new Promise((resolve, reject) => {
            axios.get("Coach/sendRest", {
                date: _restDate,
                rest:_restType,//休息，0=不休息
                userID: wx.getStorageSync('USERID'),
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5(wx.getStorageSync('USERID') +_restDate.toString()+ _restType.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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

    
 /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

        if(this.data.refreshParent){//是否需要刷新
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