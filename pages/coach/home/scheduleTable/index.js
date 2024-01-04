const app = getApp();
var moment = require('../../../../libs/moment.min');
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../../utils/util.js')
var md5util = require('../../../../utils/md5.js')
const filter = require('../../../../utils/loginFilter');

Page(filter.loginCheck(true, app, { 

    /**
     * 页面的初始数据
     */
    data: {
      globalURL: app.globalData.globalURL,
      
        weekDateShow: false, //周日期选择
        defaultDate: "", //2023-09-11",
        defaultWeekNumber: 0, //当前是第几周
        notDefaultWeek: false, //日期不是当前周
        weekStart: "", //'09.11',
        weekEnd: "", //'09.17',
        defaultWeek:'',//周几


        tabBarCurrent: 0,
        tabBar: app.globalData.coachTabBar,//教练菜单
        weekDateList: [],
        

    },
    getWeekByDate(dates) {
        let show_day = new Array('日', '一', '二', '三', '四', '五', '六');
        let date = new Date(dates);
        date.setDate(date.getDate());
        let day = date.getDay();
        return show_day[day];
    },
    //计算是第几周
    getWeekNumber(date) {
        const dayOfYear = (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24;
        return Math.ceil((dayOfYear - date.getDay() + 1) / 7);
    },
    // 获取本周开始日期
    getWeekStartDate() {
        //var date = new Date();
        const date = new Date(moment().format());
        var day = date.getDay() || 7; // 获取星期几,getDay()返回值是 0(周日) 到 6(周六) 之间的一个整数。因此需要修正。
        //date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - day + 1); // 设置到本周周一
        //return date;
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    },

    // 获取本周结束日期
    getWeekEndDate() {
        // var date = new Date();
        const date = new Date(moment().format());
        var day = date.getDay() || 7;
        //date.setHours(23, 59, 59, 999); // 设置到当天最后一毫秒
        date.setDate(date.getDate() + (7 - day)); // 设置到本周周日
        //return date; 

        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    },
    //日期格式化
    formatDate(format, date, type = 1) {
        let val = util.formatDate(format, date, type);
        return val;
    },

    // 周日期选择
    selectWeek(e) {
        let that = this;
        that.setData({
            weekDateShow: !that.data.weekDateShow
        })
    },
    //排课区点击 关闭周日期选择
    closeWeekPanel() {
        let that = this;
        if (this.data.weekDateShow) {
            that.setData({
                weekDateShow: false
            })
        }
    },
    // 日期点击
    dateClick(e) {

        let that = this;
        that.setData({
            weekStart: this.formatDate('m.d', e.detail.weekRange[0]),
            weekEnd: this.formatDate('m.d', e.detail.weekRange[1]),
            defaultDate: e.detail.today
        })

    },
    // 增加时档
    addSurplus() {
        wx.navigateTo({
            url: '/pages/coach/home/surplus/add/index',
        })

    },

    //回到本周
    thisWeek(e) {
        let that = this;
        if (!that.data.notDefaultWeek) {
            return
        }
        // const date = new Date();
        const date = new Date(moment().format());
        const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

        that.setData({
            weekStart: this.formatDate('m.d', this.getWeekStartDate()),
            weekEnd: this.formatDate('m.d', this.getWeekEndDate()),
            defaultDate: today,
            notDefaultWeek: false,
        }, () => {
            this.getDataJson(this.formatDate('y-m-d', this.getWeekStartDate()), this.formatDate('y-m-d', this.getWeekEndDate()));
        })

    },
    // 组件传来的选上一周
    thisPrevWeek(e) {
        logs.log("上一周", e, true)
        let that = this;

        var date_monday = new Date(e.detail.date);
        date_monday.setDate(date_monday.getDate() - 7);
        const monday = date_monday.toISOString().substring(0, 10);

        var date_sunday = new Date(e.detail.date);
        date_sunday.setDate(date_sunday.getDate() - 1);
        const sunday = date_sunday.toISOString().substring(0, 10);

        const weekNumber = this.getWeekNumber(date_sunday); //上一周  星期天是一周的开始

        // const date = new Date();
        const date = new Date(moment().format());
        const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

        let _defaultDate = this.formatDate('y-m-d', sunday); //解决关闭面板再打开返回当天的问题
        that.setData({
            //defaultDate:weekNumber==this.data.defaultWeekNumber?today:"",//解决不更新
            defaultDate: weekNumber == this.data.defaultWeekNumber ? today : _defaultDate, //解决不更新 2.解决关闭面板再打开返回当天的问题
            weekStart: this.formatDate('m.d', monday),
            weekEnd: this.formatDate('m.d', sunday),
            notDefaultWeek: weekNumber == this.data.defaultWeekNumber ? false : true
        }, () => {
            this.getDataJson(this.formatDate('y-m-d', monday), this.formatDate('y-m-d', sunday));
        })
    },

    // 组件传来的选下一周
    thisNextWeek(e) {

        let that = this;

        var date_sunday = new Date(e.detail.date);
        date_sunday.setDate(date_sunday.getDate() + 7);
        const sunday = date_sunday.toISOString().substring(0, 10);

        var date_monday = new Date(e.detail.date);
        date_monday.setDate(date_monday.getDate() + 1);
        const monday = date_monday.toISOString().substring(0, 10);


        let weekNumber = this.getWeekNumber(date_sunday); //下一周  星期天是一周的开始

        // const date = new Date();
        const date = new Date(moment().format());
        const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

        let _defaultDate = this.formatDate('y-m-d', sunday); //解决关闭面板再打开返回当天的问题

        that.setData({
            //   defaultDate:weekNumber==this.data.defaultWeekNumber?today:"",//解决不更新
            defaultDate: weekNumber == this.data.defaultWeekNumber ? today : _defaultDate, //解决不更新,2.解决关闭面板再打开返回当天的问题
            weekStart: this.formatDate('m.d', monday),
            weekEnd: this.formatDate('m.d', sunday),
            notDefaultWeek: weekNumber == this.data.defaultWeekNumber ? false : true
        }, () => {
            this.getDataJson(this.formatDate('y-m-d', monday), this.formatDate('y-m-d', sunday));
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        wx.hideHomeButton();
        //默认日期
        let that = this;
        const date  = new Date(moment().format());
        //算一下是第几周
        const weekNumber = this.getWeekNumber(date);

        that.setData({
            weekStart: this.formatDate('m.d', this.getWeekStartDate()),
            weekEnd: this.formatDate('m.d', this.getWeekEndDate()),
            defaultDate: this.formatDate('y-m-d', date.toISOString().substring(0, 10)),
            todayDate: this.formatDate('y-m-d', date.toISOString().substring(0, 10)), //获取后就不变了，用于控制日期控件圈红限制
            defaultWeekNumber: weekNumber,
            defaultWeek:this.getWeekByDate(date),//周几
        }, () => {
            this.getDataJson(this.formatDate('y-m-d', this.getWeekStartDate()), this.formatDate('y-m-d', this.getWeekEndDate()));
        })

        // const range = [{
        //     start: '08:00',
        //     end: '12:00'
        // }, {
        //     start: '14:00',
        //     end: '18:00'
        // }];

        // const time = '18:00';


    },
    search(ranges, target) {
        let left = 0;
        let right = ranges.length - 1;

        while (left <= right) {

            const mid = Math.floor((left + right) / 2);
            const range = ranges[mid];

            if (target < range.start) {
                right = mid - 1;
            } else if (target > range.end) {
                left = mid + 1;
            } else {
                // 考虑 target 等于端点值的情况
                return true;
            }
        }

        return false;
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        wx.hideHomeButton();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        wx.hideHomeButton();
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

    // 底部菜单点击
    tabbarSwitch(e) {
        let isLogin = false
        if (e.detail.verify && !isLogin) {
            wx.showToast({
                title: '您还未登录，请先登录',
                icon: "none"
            })
        } else {
            if (e.detail.index != this.data.tabBarCurrent) {
                //临时用用
                if (e.detail.pagePath == "/pages/coach/home/door/index") {
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
                         // const arrUrl="https://yoga.aoben.yoga";
                         const arrUrl=app.globalData.scanURL;
                            const found = qrCodeContent.indexOf(arrUrl) > -1;
                            if(!found){
                                wx.showToast({
                                    title: '二维码错误',
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
                //临时用用
                // if (e.detail.pagePath == "/packageA/pages/order/list/index"||e.detail.pagePath == "/pages/coach/home/door/index")
                if (e.detail.pagePath == "/packageA/pages/order/list/index") {
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
    getDataJson(weekStart, weekEnd) {
        const that = this;
        wx.showLoading({
            title: '加载中...',
        })
        this.getTimeJson(weekStart, weekEnd).then(val => {
            this.setData({
                weekDateList: val,
            }, () => {
                wx.hideLoading();
            })

        }, function (err) {
            wx.hideLoading();
            that.setData({
                weekDateList: [],
            }, () => {
                wx.hideLoading();
            })
        })


    },
    //1.获取时间列表
    getTimeJson(_datestart, _dateend) {
        let _timestamp = (new Date()).valueOf();
        return new Promise((resolve, reject) => {
            axios.get("Coach/coursePlan", {
                dateStart: _datestart,
                dateEnd: _dateend,
                userID: wx.getStorageSync('USERID'),
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5(wx.getStorageSync('USERID') + _datestart.toString() + _dateend.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
                reject(err);
            });
        });
    },
    //返回有修改时刷新页面
    callBackReturn(_object) {
        let that = this;
 
        const date = new Date(moment().format());
        const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

        that.setData({
            weekStart: this.formatDate('m.d', this.getWeekStartDate()),
            weekEnd: this.formatDate('m.d', this.getWeekEndDate()),
            defaultDate: today,
            notDefaultWeek: false
        }, () => {
            this.getDataJson(this.formatDate('y-m-d', this.getWeekStartDate()), this.formatDate('y-m-d', this.getWeekEndDate()));
        })
    }

}))