const app = getApp();
const logs = require("../../../../utils/logs");
import axios from '../../../../libs/axios-miniprogram/axios-miniprogram.cjs';
import _ from '../../../../libs/we-lodash'
var md5util = require('../../../../utils/md5.js')
var util = require('../../../../utils/util.js')

Page({
    data: {

        storeList: [],
        loading: true,
        noDataShow: false,

    },
    /*
    获取数据
    payType 0全部 1待支付 2已支付 3售后
    */
   getDataJson(_uid) {
    let that = this;
    let _timestamp = (new Date()).valueOf();
    let config = {
        pageSize: 10,
        pageIndex: 1,
        userId: _uid,//_uid
        TIMESTAMP: _timestamp,
        FKEY: md5util.md5(_uid + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
    };
    return new Promise((resolve, reject) => {
        axios.get("Coach/coachCertificatePub", config, {
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
                       resolve(_data);
            } else {
                reject([]);
            }
        }).catch((err) => {
            reject([]);
        });
    })
},
    onShow(e) { 


    },
    onLoad: function (options) {
        let that = this;
        let _uid = options.uid||'';
        if(util.isNull(_uid))
        {
            wx.navigateBack();
            return;
        }
        this.getDataJson(_uid).then(list => {
            if (list.total > 0) {
                that.setData({
                    storeList:list.data,
                    loading: false
                })
            } else {
                that.setData({
                    noDataShow: true,
                    loading: false
                })
            }

        })
    },

})
