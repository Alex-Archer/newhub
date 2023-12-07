const app = getApp();
const logs = require("../../../../utils/logs");
import _ from '../../../../libs/we-lodash'
Page({
    data: {
      globalURL: app.globalData.globalURL,
        hasCoupon: true,
        insufficient: false,
        show: false,
        couponShow: false,

        //授课模式选择窗口
        typeList: [{
                "title": "一对一授课",
                "id": "1",
                "hot": true,
                "des": ["教练进行1对1授课", "其它说明"]
            },
            {
                "title": "一对二授课",
                "id": "2",
                "hot": false,
                "des": ["教练进行1对2授课"]
            },
        ],
        typeListIndex: 0, //默认选中

        coachTypeShow: false,
        //选中的授课模式
        coachTypeSelectID: 0, //ID
        coachTypeSelectTitle: "", //名称

        classCouponIndex: 1, //课次推荐满减默认选中
        classCouponList: //课次推荐满减列表
            [{
                    "title": "25节", //标题
                    "des": "立减¥200", //说明
                    "classNumber": 25, //课节数
                    "subtractPrice": 200, //满减数     
                    "id": 10 //数据库ID
                },
                {
                    "title": "35节",
                    "des": "立减¥600",
                    "classNumber": 35,
                    "subtractPrice": 600,
                    "id": 12
                },
                {
                    "title": "50节",
                    "des": "立减¥1000",
                    "classNumber": 50,
                    "subtractPrice": 1000,
                    "id": 19
                }
            ],


        claAct: 0, //课次选择默认
        numberBoxValue: 12, //课次自定义初始



        storeShow:false,//上课场地选择
        storeSelectID:0,//选中的场馆ID
        storeSelectTitle:'',//选中的场馆名称
        storeList: //场馆列表
        [
            {
                "id": "1",
                "title": "昆山城西优美店",
                "address":"这是地址址址埴",
                "distance":"22km",
                "picture":"https://temp-aoben-picture.oss-cn-shanghai.aliyuncs.com/web-images/2023/08/23/20230823%5Cdf6c722325c8436f715733addff349b0.jpg",
                "hot": true,
                "tag": ["教练进行1对1授课", "其它说明"]
            },
            {
                "id": "99",
                "title": "城南啥啥啥店",
                "address":"这是地址址这是埴是地址址这是地址址这",
                "distance":"800m",
                "picture":"https://temp-aoben-picture.oss-cn-shanghai.aliyuncs.com/web-images/2023/08/23/20230823%5C32d9182dbfb326063179ce2a4d9c83ad.jpg",
                "hot": true,
                "tag": ["教练进行1对1授课", "其它说明"]
            }
        ],


                        // typeListIndex: _selectIndex,
                // coachTypeSelectID: that.data.typeList[_selectIndex].id,
                // coachTypeSelectTitle: that.data.typeList[_selectIndex].title

                // storeListIndex: _selectIndex,
                // storeSelectID: that.data.storeList[_selectIndex].id,
                // storeSelectTitle: that.data.storeList[_selectIndex].title
    },
    //自定义课报
    change: function (e) {
        this.setData({
            numberBoxValue: e.detail.value
        })
    },
    //课次推荐满减选择
    selectClassNumber(e) {
        let that = this;
        //logs.log("【课次推荐满减选择】",e,true);
        let index = e.target.dataset.index || e.currentTarget.dataset.index;
        that.setData({
            classCouponIndex: index
        })


    },
    //课次选择默认
    tapAlaAct(e) {

        let that = this;
        let _detailVal = e.currentTarget.dataset.val || e.target.dataset.val;
        that.setData({
            claAct: _detailVal
        })
    },
    onLoad() {
        //
        let that = this;

        //授课模式默认选中
        that.setData({
            coachTypeSelectID: that.data.typeList[that.data.typeListIndex].id,
            coachTypeSelectTitle: that.data.typeList[that.data.typeListIndex].title
        })

    },
    chooseAddr() {
        wx.navigateTo({
            url: "../address/address"
        })
    },
    btnPay() {
        this.setData({
            show: true
        })
    },
    popupClose() {
        this.setData({
            show: false
        })
    },
    couponClose() {
        this.setData({
            couponShow: false
        })
    },

    selectCoupon() {
        this.setData({
            couponShow: true
        })
    },

    selectCoachType() {
        this.setData({
            coachTypeShow: true
        })
    },
    coachTypeClose(e) {

        let that = this;
        let _detail = e.detail;
        if (_detail && _detail.selectIndex) {
            // coachTypeSelectID:0,
            // coachTypeSelectTitle:"",
            let _selectIndex = _detail.selectIndex;
            this.setData({
                coachTypeShow: false,
                typeListIndex: _selectIndex,
                coachTypeSelectID: that.data.typeList[_selectIndex].id,
                coachTypeSelectTitle: that.data.typeList[_selectIndex].title

            })
        } else {
            this.setData({
                coachTypeShow: false

            })
        }
    },
    invoice() {
        wx.navigateTo({
            url: "../invoice/invoice"
        })
    },


    //上课场地选择


    //选择点击
    selectStore() {
        this.setData({
            storeShow: true
        })
    },
    //窗关闭
    storeClose(e) {
        let that = this;
        let _detail = e.detail;
        if (_detail && _detail.selectIndex) {
            // coachTypeSelectID:0,
            // coachTypeSelectTitle:"",
            let _selectIndex = _detail.selectIndex;
            this.setData({
                storeShow: false,
                storeListIndex: _selectIndex,
                storeSelectID: that.data.storeList[_selectIndex].id,
                storeSelectTitle: that.data.storeList[_selectIndex].title

            })
        } else {
            this.setData({
                storeShow: false

            })
        }
    },
    //上课场地选择 END
})