const app = getApp();
const logs = require("../../../utils/logs");
import _ from '../../../libs/we-lodash'
import axios from '../../../libs/axios-miniprogram/axios-miniprogram.cjs';
var util = require('../../../utils/util.js')
var md5util = require('../../../utils/md5.js')
const filter = require('../../../utils/loginFilter');
Page(filter.loginCheck(true, app, {
    data: {
        preventOnShow: true, 
        detailID: 0, //项目ID
        detailTitle: "", //项目名称 

        //私教课里属性里cardexchange=1可以使用卡兑换，carddiscount=1可以使用卡打折
        cardexchange: 0, //是否可以使用卡兑换 产品属性，优先于卡的属性
        carddiscount: 0, //是否可以使用卡打折 产品属性，优先于卡的属性

        totalPrice: 0, //合计价钱
        payPrice: 0, //应付价格

        totalBalance: 0, //用户现金余额
        balanceSwitch: false, //是否选了抵扣
        payType: 0, //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
        payAmount: 0, //实付金额，当payType=1 和 2时生效
        payCouponList: "", //支付的券列表 10,20,30

        //支付提交按钮
        subDisabled: true,
        PayLoading: false, //透明加载  tui-loading wx:if="{{PayLoading}}"
        PayLoadingTxt: '加载中', //加载动画文字

        //   needPayPrice:0,//最终付款


        price: 0, //单价格
        originalprice: 0, //原单价
        classesmin: 1, //最少多少节起售
        poster: '', //图片


        //优惠窗
        couponShow: false,
        //couponsListIndex: 0, //默认选中
        couponsList: [], //优惠券列表
        hasCoupon: false, //能否使用优惠，比如例表为空
        usingCoupons: false, //默认未使用优惠券，弹出窗口测选中了未使用优惠券
        discount: 100, //折扣
        discountShow: false, //折扣 栏显示
        //couponSelectTitle:'请选择优惠',

        discountQuantity: 0, //优惠卷数量 选择的优惠券可抵多少节课
        discountTotal: 0, //优惠卷抵扣掉的总价



        //课次选择
        //classCouponIndex:0,
        classCouponSelectItems: null, //课次推荐满减默认选中的数组{}
        hasPackage: false, //是否有套餐选择
        classCouponList: [], //课次推荐满减列表
        /*
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
        */
        claAct: 0, //课次选择默认，没有套餐要变为1
        numberBoxValue: 0, //课次自定义初始
        diffClassPrice: 0, //课程包最终算下来优惠了多少
        //课次选择END
        favourableShow: true, //优惠课程抵扣选择 栏显示
        exchangeSwitchShow: true, //兑换选项栏勾选 栏显示

        insufficient: false, //余额支付
        show: false,
    },
    onShow(e) {
        if (this.data.preventOnShow) return; //5.登录验证  需要登录时，阻止ONSHOW 

    },
    //选择优惠列表
    selectCoupon() {
        if (this.data.couponsList.length <= 0 || !this.data.hasCoupon) {
            return;
        }
        this.setData({
            couponShow: true
        })
    },
    //优惠节数统计
    discountQuantityCount(_tempArr) {
        const uncheckedItems = _.filter(_tempArr, item => item.checked); //筛选出 checked = true的
        const sum = _.sumBy(uncheckedItems, 'residue');
        return sum;
    },
    //返回选择的券列表，号隔开
    getPayCouponList() {

        let tempArr = this.data.couponsList;
        const checkedItems = _.filter(tempArr, item => item.checked);
        const values = _.map(checkedItems, 'id');
        const result = _.join(values, ',');

        return result;

    },
    //计算出应付钱结果
    thisPayCount() {
        let that = this;
        let _returnCoupons = this.data.couponsList;
        //看看有没有选中的券，这个功能还没加
        let hasChecked = _.some(_returnCoupons, item => item.checked); // 或 _.some(tempArr, 'checked');
        //#region 计算可抵
        let _discountQuantity = hasChecked ? this.discountQuantityCount(_returnCoupons) : 0; //计算一下用户选择的券共抵多少节

        //最终用到
        let _totalPrice = 0; //总计
        let _payPrice = 0; //实付

        if (this.data.claAct == 0) //一、套餐的
        {
            let _claQuantity = this.data.classCouponSelectItems.classnum; //套餐总节数

            //1.有选券 并且大于 课程总节数，相当于0元购
            if (_discountQuantity >= _claQuantity) {

                let _claPrice = this.data.classCouponSelectItems.price; //套餐总价
                let _discountQuantityAllPrice = _claPrice; //抵了多少节课总价


                logs.log("套餐:================选券节数 > 套餐节数 价格计算======================");
                logs.log("原单价：", this.data.price, true);
                logs.log("套餐固定课时：", this.data.classCouponSelectItems.classnum, true);
                logs.log("算下来总价：", this.data.price * this.data.classCouponSelectItems.classnum, true);
                logs.log("套餐价：", this.data.classCouponSelectItems.price, true);
                logs.log("少了钱：", this.data.price * this.data.classCouponSelectItems.classnum - this.data.classCouponSelectItems.price, true);
                logs.log("用户选了券抵节数：", _discountQuantity, true);

                logs.log("-----[0元购],你有可抵节数为" + _discountQuantity + ",大于套餐所需节数:", this.data.classCouponSelectItems.classnum, true)

                logs.log("套餐:================选券节数 > 套餐节数 价格计算 END======================");

                _totalPrice = this.data.classCouponSelectItems.price; //总计
                _payPrice = 0; //实付

            } else { //2.券的数量小于总节数
                let _claPrice = this.data.classCouponSelectItems.price; //套餐总价
                let _claAvPrice = Math.round(_claPrice / _claQuantity); //平均一节课多少钱 四舍五入取整
                logs.log("1111111111111111平均一节", _claAvPrice, true)
                let _discountQuantityAllPrice = _discountQuantity * _claAvPrice; //抵了多少节课总价
                logs.log("1111111111111111您抵了", _discountQuantityAllPrice, true)

                logs.log("套餐:================选券节数 《 套餐节数 价格计算======================");
                logs.log("原单价：", this.data.price, true);
                logs.log("套餐固定课时：", this.data.classCouponSelectItems.classnum, true);
                logs.log("算下来总价：", this.data.price * this.data.classCouponSelectItems.classnum, true);
                logs.log("套餐价：", this.data.classCouponSelectItems.price, true);
                logs.log("少了钱：", this.data.price * this.data.classCouponSelectItems.classnum - this.data.classCouponSelectItems.price, true);


                if (this.data.usingCoupons) { //2.1.用券了
                    logs.log("用户选了券抵节数：", _discountQuantity, true);

                    logs.log("你有可抵节数为" + _discountQuantity + ",小于 套餐所需节数:", this.data.classCouponSelectItems.classnum, true)
                    logs.log("每节均价：", _claAvPrice, true);
                    logs.log("您优惠课节抵了：", _discountQuantityAllPrice, true);
                    logs.log("还应支付：", this.data.classCouponSelectItems.price - _discountQuantityAllPrice, true);

                    logs.log("套餐:================选券节数 《 套餐节数 价格计算 END======================");

                    _totalPrice = this.data.classCouponSelectItems.price; //总计
                    _payPrice = this.data.classCouponSelectItems.price - _discountQuantityAllPrice; //实付

                } else { //2.2.没用券
                    let _discount = this.data.discount; //是否打折
                    if (_discount < 100) { //2.2.1用打折了
                        logs.log("用的是打折：", _discount / 100, true);
                        logs.log("最终要付：", this.data.classCouponSelectItems.price * (_discount / 100), true);

                        _totalPrice = this.data.classCouponSelectItems.price; //总计
                        _payPrice = this.data.classCouponSelectItems.price * (_discount / 100); //实付

                    } else { //2.2.2正常价
                        logs.log("啥都不是，正常价", this.data.classCouponSelectItems.price, true);

                        _totalPrice = this.data.classCouponSelectItems.price; //总计
                        _payPrice = this.data.classCouponSelectItems.price; //实付
                    }
                }
            }
        } else { //二、自定议的
            let _claQuantity = this.data.numberBoxValue; //选的节数 自定议的数值
            //1.有选券 并且大于 课程总节数，相当于0元购
            if (_discountQuantity >= _claQuantity) {
                let _allPrice = _claQuantity * this.data.price; //总价
                //logs.log("2222222参与了0元购,你有可抵节数为"+_discountQuantity+",共需钱：",_allPrice,true)
                logs.log("自定议:================选券节数 > 自定义节数 价格计算======================");
                logs.log("您选的课时：", this.data.numberBoxValue, true);
                logs.log("原单价：", this.data.price, true);
                logs.log("算下来总价：", this.data.numberBoxValue * this.data.price, true);
                logs.log("用户选了券抵节数：", _discountQuantity, true);
                logs.log("-----[0元购],你有可抵节数为" + _discountQuantity + ",大于所需节数:", this.data.numberBoxValue, true)
                logs.log("自定议:================选券节数 > 自定义节数 价格计算 END======================");

                _totalPrice = this.data.numberBoxValue * this.data.price; //总计
                _payPrice = 0; //实付
            } else {
                let _avPrice = this.data.price; //每节课钱
                let _allPrice = _claQuantity * _avPrice; //自定议的节数需要的总价
                logs.log("2222222222222222平均一节", _avPrice, true)
                let _discountQuantityAllPrice = _discountQuantity * _avPrice; //抵了多少节课总价
                logs.log("222222222222222您原需要" + _allPrice + "抵了", _discountQuantityAllPrice, true)
                logs.log("自定议:================选券节数 《 自定义节数 价格计算======================");
                logs.log("您选的课时：", this.data.numberBoxValue, true);
                logs.log("原单价：", this.data.price, true);
                logs.log("算下来总价：", this.data.numberBoxValue * this.data.price, true);
                //=============================
                if (this.data.usingCoupons) { //2.1.用券了
                    logs.log("用户选了券抵节数：", _discountQuantity, true);
                    logs.log("用户选了券抵节数-算成钱：", _discountQuantity * this.data.price, true);
                    logs.log("还应支付：", this.data.numberBoxValue * this.data.price - _discountQuantity * this.data.price, true);
                    logs.log("自定议:================选券节数 《 自定义节数 价格计算 END======================");

                    _totalPrice = this.data.numberBoxValue * this.data.price; //总计
                    _payPrice = this.data.numberBoxValue * this.data.price - _discountQuantity * this.data.price; //实付

                } else { //2.2.没用券
                    let _discount = this.data.discount; //是否打折
                    if (_discount < 100) { //2.2.1用打折了
                        logs.log("用的是打折：", _discount / 100, true);
                        logs.log("最终要付：", (this.data.numberBoxValue * this.data.price) * (_discount / 100), true);

                        _totalPrice = this.data.numberBoxValue * this.data.price; //总计
                        _payPrice = (this.data.numberBoxValue * this.data.price) * (_discount / 100); //实付

                    } else { //2.2.2正常价
                        logs.log("啥都不是，正常价", this.data.numberBoxValue * this.data.price, true);

                        _totalPrice = this.data.numberBoxValue * this.data.price; //总计
                        _payPrice = this.data.numberBoxValue * this.data.price; //实付

                    }
                }
            }
        }
        //开始看看有没有用瑜伽币抵扣
        // let _totalPrice = 0;//总计 在上面定义了
        // let _payPrice = 0;//上面算出来的实付 在上面定义了

        logs.log("==================支付方式计算========================");
        let _payType = 1; ////支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
        let _totalBalance = this.data.totalBalance; //用户瑜伽币余额
        //let _payAmount = this.data.payAmount; //最终 实付金额，当payType=1 和 2时生效

        let _isPayPrice = _payPrice; //临时 计算终付多少
        if (_payPrice > 0) { //非0元购
            if (this.data.balanceSwitch) { //余额选中了

                if (_totalBalance == 0) { //没有余额
                    _payType = 1; //1现金支付 //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
                    logs.log("1现金支付");
                } else { //
                    if (_totalBalance >= _payPrice) { //余额 >=商品额度 = 实付为0
                        _payType = 2; //2帐户扣除 //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
                        _isPayPrice = 0;
                        logs.log("2帐户扣除 ");
                    } else { //余额 < 商品额度
                        _payType = 3; //组合 支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
                        _isPayPrice = _payPrice - _totalBalance;
                        logs.log("3组合 ");
                    }
                }
                // that.setData({
                //   payType: _payType,
                //   thisPay: _isPayPrice,
            } else {
                logs.log("1 默认 现金支付");
            }

            that.setData({
                payType: _payType,
                totalPrice: _totalPrice <= 0 ? 0 : _totalPrice, //容错 非负
                payPrice: _isPayPrice <= 0 ? 0 : _isPayPrice, //容错 非负
                payCouponList: !this.data.usingCoupons ? "" : this.getPayCouponList(), //支付的券列表
            })
        } else {
            //0元购

            that.setData({
                balanceSwitch: false,
                payType: _payType,
                totalPrice: _totalPrice <= 0 ? 0 : _totalPrice, //容错 非负
                payPrice: _isPayPrice <= 0 ? 0 : _isPayPrice, //容错 非负
                payCouponList: !this.data.usingCoupons ? "" : this.getPayCouponList(), //支付的券列表
            })
        }

        //#endregion 计算可抵
    },
    //是否使用余额
    balanceSwitch(e) {
        this.setData({
            balanceSwitch: !this.data.balanceSwitch,
        }, () => {
            this.thisPayCount();
        })
    },
    //券关闭了
    couponClose(e) {

        if (this.data.cardexchange == 0) //产品属性禁止了卡换,不知您是从哪到这的，也要处理一下
        {

            this.setData({
                couponShow: false,
                usingCoupons: false,
                discountQuantity: 0,
            })
            return;
        }



        //关闭 未确认 {"type":"close","timeStamp":36201,"target":{"id":"","dataset":{}},"currentTarget":{"id":"","dataset":{}},"mark":{},"mut":false} 
        //确认选择的  有 detail
        let _detail = e.detail;
        if (util.isNull(_detail)) {
            this.setData({
                couponShow: false,
            })
        } else {
            let _returnCoupons = _detail.returnCoupons;

            //检测一下券列表中有没有选中的，只要有 true就说明有选，否则为没有
            let hasChecked = _.some(_returnCoupons, item => item.checked); // 或 _.some(tempArr, 'checked');
            logs.log("总优惠的节数总和", this.discountQuantityCount(_returnCoupons), true);

            let _discountQuantity = hasChecked ? this.discountQuantityCount(_returnCoupons) : 0; //计算一下用户选择的券共抵多少节

            let _discountShow = false;
            if (this.data.carddiscount == 1) { //产品属性 禁止打折了
                if (hasChecked) {
                    _discountShow = false;
                } else {
                    if (this.data.discount < 100) {
                        _discountShow = true;
                    } else {
                        _discountShow = false;
                    }
                }
            } else {
                _discountShow = false;
            }

            this.setData({
                couponShow: false,
                couponsList: _returnCoupons,
                usingCoupons: hasChecked,
                discountShow: _discountShow, //折扣隐

                discountQuantity: _discountQuantity, //计算一下用户选择的券共抵多少节
                //discountTotal:_discountTotal,//计算出来 抵扣的钱数
            }, () => {
                this.thisPayCount();
            })
        }

    },
    //========================================
    //课次选择默认
    tapAlaAct(e) {

        let that = this;
        let _detailVal = e.currentTarget.dataset.val || e.target.dataset.val;
        that.setData({
            claAct: _detailVal
        }, () => {
            this.thisPayCount();
        })
    },
    //自定义 变化触发
    numberboxChange: function (e) {
        this.setData({
            numberBoxValue: e.detail.value
        }, () => {
            this.thisPayCount();
        })
    },
    //课次推荐满减选择
    selectClassNumber(e) {
        let that = this;
        let _index = e.target.dataset.index || e.currentTarget.dataset.index;
        //更新数组中是否选中
        let tempArr = this.data.classCouponList; //临时数组
        _.each(tempArr, (x, index) => { //全部不选中
            if (_index === index) {
                x.selected = true;
            } else {
                x.selected = false;
            }
        });
        //计算价格
        let _price = this.data.price; //课程初始单价格
        let _originalprice = this.data.originalprice; //课程初始原单价


        let _getCouponList = tempArr[_index];
        //{"id":6,"type":1,"title":"新手课","classnum":24,"price":300000,"validity":"1年","selected":true}
        let _getClassnum = _getCouponList.classnum; //选择这个总共多少节
        let _getClassPrice = _getCouponList.price; //选择这个总价

        let allPrice = _getClassnum * _price; //理论上总价 -原价算下来的总价
        let diffClassPrice = allPrice - _getClassPrice; //优惠了多少

        that.setData({
            classCouponSelectItems: tempArr[_index],
            classCouponList: tempArr,
            diffClassPrice: diffClassPrice,
        }, () => {
            this.thisPayCount();
        })


    },


    //优惠券增加字段是否选中
    initCouponsList(_list) {
        if (util.isNull(_list)) return _list;
        let result = _.map(_list, item => ({
            id: item.id,
            cardTitle: item.cardTitle, //标题

            ///separateGiveResidue:item.separateGiveResidue,//还可兑换 私有
            //giveResidue:item.giveResidue,//还可兑换 通用
            residue: item.residue, //上面两个的总和，让陈工增加的，不然麻烦

            expiredTime: item.expiredTime, //过期时间
            poster: item.poster, //封面
            checked: false, //是否选中
        }));
        return result;
    },
    onLoad(options) {
        //
        let that = this;
        let _id = options.id;
        let _title = options.t;
        //需要验证
        if (util.isNull(_id) || util.isNull(_title)) {

            util.toast("参数有误", null, null, () => {
                setTimeout((res) => {
                    wx.navigateBack();
                }, 500);
            });

        }
        that.setData({
            detailTitle: _title,
            detailID: Number(_id),
        })


        this.initLoad(_id).then(val => {
            // let _card =  val.offer.card;
            let _cardexchange = Number(val.cardexchange) || 0; //cardexchange=1可以使用卡兑换
            let _carddiscount = Number(val.carddiscount) || 0; //carddiscount=1可以使用卡打折
            if (_cardexchange === 1) //可以使用 卡兑换
            {
                let _card = _.has(val.offer, 'card') ? val.offer.card : [];
                if (util.isNull(_card)) { //无优惠信息列表
                    //无优惠
                    that.setData({
                        title: val.title,
                        //couponsList:[],//优惠券列表
                        hasCoupon: false, //能否使用优惠，比如例表为空
                        couponShow: false,
                        discount: _carddiscount == 1 && _.has(val.offer, 'discounts') ? val.offer.discounts : 100, //val.offer.discounts,//折扣
                        discountShow: _carddiscount == 1 && _.has(val.offer, 'discounts') && val.offer.discounts < 100 ? true : false,

                        cardexchange: _cardexchange, //cardexchange=1可以使用卡兑换
                        carddiscount: _carddiscount, //carddiscount=1可以使用卡打折
                    })
                } else { //有列表
                    that.setData({
                        title: val.title,
                        couponsList: this.initCouponsList(_card), //优惠券列表
                        hasCoupon: true, //能否使用优惠，比如例表为空
                        //discount:val.offer.discounts,//折扣
                        discount: _carddiscount == 1 && _.has(val.offer, 'discounts') ? val.offer.discounts : 100, //val.offer.discounts,//折扣
                        discountShow: _carddiscount == 1 && val.offer.discounts < 100 ? true : false,

                        cardexchange: _cardexchange, //cardexchange=1可以使用卡兑换
                        carddiscount: _carddiscount, //carddiscount=1可以使用卡打折
                    })

                }
            } else { //不可以卡换
                //不可以卡换，也就无优惠了
                that.setData({
                    title: val.title,
                    couponsList: [], //优惠券列表
                    hasCoupon: false, //能否使用优惠，比如例表为空
                    couponShow: false,
                    discount: _carddiscount == 1 && _.has(val.offer, 'discounts') ? val.offer.discounts : 100, //val.offer.discounts,//折扣
                    discountShow: _carddiscount == 1 && _.has(val.offer, 'discounts') && val.offer.discounts < 100 ? true : false,

                    cardexchange: _cardexchange, //cardexchange=1可以使用卡兑换
                    carddiscount: _carddiscount, //carddiscount=1可以使用卡打折
                })

            }

            //#region  页面初始默认套餐选中的那个优惠的多少
            let _diffClassPrice = this.data.diffClassPrice;
            let _discount = _.has(val, 'discount') ? val.discount : []; //推荐课程序列表

            let _hasPackage = this.data.hasPackage; //是否有套餐
            let _claAct = this.data.claAct; //默认选中的是套餐
            let checkedItems = null;
            if (!util.isNull(_discount)) {

                let _price = val.price; //课程初始单价格
                //let _originalprice=this.data.originalprice;//课程初始原单价

                //const indexDefault = _.findIndex(_discount, item => item.selected);//默认套餐选中的索引
                checkedItems = _.filter(_discount, item => item.selected); //直接返回默认数组

                let _getClassnum = checkedItems[0].classnum; //选择这个总共多少节
                let _getClassPrice = checkedItems[0].price; //选择这个总价


                let allPrice = _getClassnum * _price; //理论上总价 -原价算下来的总价
                _diffClassPrice = allPrice - _getClassPrice; //优惠了多少

                _hasPackage = true; //有套餐
                _claAct = 0; //默认选中套餐展现
            } else {
                _hasPackage = false; //无套餐
                _claAct = 1; //默认选中自定议
            }
            //#endregion 页面初始默认套餐选中的那个优惠的多少


            that.setData({
                title: val.title,
                classCouponSelectItems: util.isNull(checkedItems) ? [] : checkedItems[0],
                classCouponList: val.discount, //推荐课程序列表
                price: val.price, //价格
                originalprice: val.originalprice, //原价
                classesmin: val.classesmin, //最少多少节起售
                tagList: val.label, //TAG 列表
                poster: val.poster, //封面
                numberBoxValue: val.classesmin, //课次自定义初始, 用的也是 最少多少节起售
                diffClassPrice: _diffClassPrice, //默认套餐选中的那个优惠的多少

                hasPackage: _hasPackage, //是否有套餐
                claAct: _claAct, //默认选中套餐展现

                totalBalance: val.balance, //用户现金余额

                subDisabled: false, //禁止提交

            }, () => {
                this.thisPayCount()
            })





        }, function (err) {
            this.setData({
                subDisabled: true //禁止提交
            })


        })

        //授课模式默认选中
        // that.setData({
        //     coachTypeSelectID: that.data.couponsList[that.data.couponsListIndex].id,
        //     coachTypeSelectTitle: that.data.couponsList[that.data.couponsListIndex].title
        // })

    },
    chooseAddr() {
        wx.navigateTo({
            url: "../address/address"
        })
    },

    popupClose() {
        this.setData({
            show: false
        })
    },


    //=====================

    //初始化
    initLoad(_id) {
        let that = this;
        let _timestamp = (new Date()).valueOf();
        return new Promise((resolve, reject) => {
            axios.get("CoursePersonal/detailInfo", {
                id: _id,
                userID: wx.getStorageSync('USERID'),
                TIMESTAMP: _timestamp,
                FKEY: md5util.md5(wx.getStorageSync('USERID') + _id.toString() + _timestamp.toString() + app.globalData.APP_INTF_SECRECT)
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
                    resolve(res.data.data);
                } else {
                    reject();
                }

            }).catch((err) => {
                reject();
            });
        });
    },

    //2.支付完查询
    //2.支付完，订单查询
  queryGroupOrder(orderNum) {
    const that = this;
    let _type= "1";      //;//0=团课，1=私教课，2=集训课
    var timestamp = (new Date()).valueOf();
    axios.post('CourseOrder/orderInfo', {
        type:_type,//0=团课，1=私教课，2=集训课
        orderNo: orderNum,
        userID: wx.getStorageSync('USERID'),
        TIMESTAMP: timestamp,
        FKEY: md5util.md5(wx.getStorageSync('USERID')+_type + orderNum + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
      }, {
        headers: {
          "Content-Type": 'application/json; charset=utf-8',
        }
      })
      .then((res) => {
        const {data} = res;
        let _data = util.jsonTestParse(data); //解决返回为字符串型JSON问题
        if (_data.code === 1 && _data.data.paytime > 0) { //表示支付完成了
          that.setData({
            PayLoading: false,
            PayLoadingTxt: '',
            subDisabled: true //禁止提交
          }, () => {
            util.toast("购买私教课成功！", null, null, (e) => {
              setTimeout((res) => {
                wx.redirectTo({
                  url: '/packageA/pages/order/list/index',
                })
              }, 1000);
            });
          })
        } else { //虽然正常，但是服务端调用paytime没有时间
          ///购课程中心 packageA/pages/listCourse/index
          that.setData({
            PayLoading: false,
            PayLoadingTxt: '',
            subDisabled: true //禁止提交
          }, () => {
            util.toast("订单处理中...", null, null, (e) => {
              setTimeout((res) => {
                wx.redirectTo({
                  url: '/packageA/pages/order/list/index',
                })
              }, 1000);
            });
          })
        }
        return;
      })
      .catch((error) => {
        that.setData({
          PayLoading: false,
          PayLoadingTxt: '',
          subDisabled: true //禁止提交
        }, () => {
          util.toast("订单处理中...", null, null, (e) => {
            setTimeout((res) => {
              wx.redirectTo({
                url: '/packageA/pages/order/list/index',
              })
            }, 1000);
          });
        })

        return;
      });
  },

    //1.点击支付 
    btnPay() {
        const that = this;

        that.setData({
            PayLoading: true,
            PayLoadingTxt: '请稍候...',
            subDisabled: true //禁止提交
        })

        let _type = 1; //0=团课，1=私教课，2=集训课
        let _groupID = this.data.detailID; //课程ID
        let _couponSelectID = this.data.payCouponList; //优惠卡选择ID，多个用英文逗号隔开,可能为空

        let _totalBalance = this.data.balanceSwitch ? this.data.totalBalance : 0; //余额 没选余额为0

        let _payType = this.data.payType || 1; //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）

        let _discountId = 0; //套餐ID，也可能为空
        let _total = 0; //课程节数 套餐里也有
        /*
             //卡列表
             //产品ID
             //套餐ID
             //课程数  
            //有没有选余额支付
            //供参考对比应付金额，仅作对比使用
            */
        if (this.data.claAct == 0) {
            _discountId = this.data.classCouponSelectItems.id;
            _total = this.data.classCouponSelectItems.classnum;
        } else {
            _discountId = 0;
            _total = this.data.numberBoxValue;
        }

        logs.log("支付=========================");
        logs.log("类型0=团课，1=私教课，2=集训课", _type);
        logs.log("课程ID", _groupID);
        logs.log("优惠卡选择ID，多个用英文逗号隔开,可能为空", _couponSelectID);
        logs.log("余额", _totalBalance);
        logs.log("支付方式", _payType);
        logs.log("套餐ID，也可能为空", _discountId);
        logs.log("课程节数", _total);
        logs.log("支付金额", this.data.payPrice);


        //安检区
        if (util.isNull(_groupID) || Number(_groupID) <= 0) {
            that.setData({
                PayLoading: false,
                PayLoadingTxt: '',
                subDisabled: true //禁止提交
            }, () => {
                util.toast("信息有误，请重新购买!", null, null, (e) => {
                    setTimeout((res) => {
                        wx.navigateBack();
                    }, 500);
                });
            })
            return;
        }
        //#region 支付开始
        new Promise((resolve, reject) => {
            //发送体
            let timestamp = (new Date()).valueOf();
            let postConfig = {
                type: _type, //0=团课，1=私教课，2=集训课
                groupID: _groupID, //就用这个键值吧
                couponSelectID: _couponSelectID, //选中的优惠卡ID        
                totalBalance: _totalBalance, //用户现金余额,瑜伽币
                payType: _payType, //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
                thisPay: this.data.payPrice, //实付金额

                discountId: _discountId, //套餐ID
                total: _total, //节数

                userID: wx.getStorageSync('USERID'),
                TIMESTAMP: timestamp,
                FKEY: md5util.md5(wx.getStorageSync('USERID') + _type + _groupID.toString() + _couponSelectID.toString() + timestamp.toString() + app.globalData.APP_INTF_SECRECT)
            }
  
            axios.post('CourseOrder/creatOrder', postConfig, {
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                    }
                })
                .then((res) => {
                    const {
                        data
                    } = res;
                    let _data = util.jsonTestParse(data); //解决返回为字符串型JSON问题
                    resolve(_data);
                })
                .catch((error) => {
                    reject("出错")
                });
        }).then(res => { //定单开始付钱

            if (_payType === 0 || _payType === 2) {
                if (res.code == 1) {
                    that.setData({
                        PayLoading: false,
                        PayLoadingTxt: '',
                        subDisabled: true //禁止提交
                    }, () => {
                        util.toast("私教课兑换成功!", null, null, (e) => {
                            setTimeout((res) => {
                                wx.redirectTo({
                                    url: '/packageA/pages/order/list/index',
                                })
                            }, 1000);
                        });
                    })
                    return;
                } else {
                    that.setData({
                        PayLoading: false,
                        PayLoadingTxt: '',
                        subDisabled: true //禁止提交
                    }, () => {
                        util.toast("私教课兑换失败,请重新操作!", null, null, (e) => {
                            setTimeout((res) => {
                                wx.navigateBack();
                            }, 500);
                        });
                    })
                    return;
                }
            }
            //支付方式 0优惠卡兑换 1完全人民币支付 2余额瑜伽币扣除(瑜伽币完全大于等于应付) 3组合（现金+余额：瑜伽币少于应付）
            else { //使用了1 或 3 涉及了人民币操作
                if (res.code == 1) {
                    //调起支付------------------
                    var timestamp_ = res.data.timeStamp;
                    var noncestr_ = res.data.nonceStr;
                    var package_ = res.data.package;
                    var paySign_ = res.data.paySign;
                    var signType_ = "RSA";
                    // 订单参数
                    var orderNum = res.data.orderno; // 订单号
                    wx.requestPayment({
                        timeStamp: timestamp_.toString(),
                        nonceStr: noncestr_,
                        package: package_,
                        signType: signType_,
                        paySign: paySign_,
                        success(res_pay) {
                            //勿使用requestPayment:ok的结果作为判断支付成功的依据
                            if (res_pay.errMsg == 'requestPayment:ok') {
                                // 只能说 支付动作完成，不代表订单完成
                                that.queryGroupOrder(orderNum); //去查订单状态,但是不一定成功
                                return;
                            } else {
                                //util.toast("支付失败,请重新支付");
                                that.setData({
                                    PayLoading: false,
                                    PayLoadingTxt: '',
                                    subDisabled: true //禁止提交
                                }, () => {
                                    util.toast("支付失败,请至订单中心重新支付!", null, null, (e) => {
                                        setTimeout((res) => {
                                            wx.redirectTo({
                                                url: '/packageA/pages/order/list/index',
                                            })
                                        }, 1000);
                                    });
                                })
                                return;
                            }
                        },
                        fail: function (err) {
                            // 支付失败或取消支付后的回调函数
                            //:{"errMsg":"requestPayment:fail cancel"} 
                            if (err.errMsg = 'requestPayment:fail cancel') {
                                //reject("取消支付")
                                //util.toast("支付取消,请重新支付");
                                that.setData({
                                    PayLoading: false,
                                    PayLoadingTxt: '',
                                    subDisabled: true //禁止提交
                                }, () => {
                                    util.toast("付取消,请至订单中心重新支付!", null, null, (e) => {
                                        setTimeout((res) => {
                                            wx.redirectTo({
                                                url: '/packageA/pages/order/list/index',
                                            })
                                        }, 1000);
                                    });
                                })
                                return;
                            } else {
                                // util.toast("支付失败,请重新支付");
                                // that.setData({
                                //   subDisabled: false //可以提交
                                // })
                                that.setData({
                                    PayLoading: false,
                                    PayLoadingTxt: '',
                                    subDisabled: true //禁止提交
                                }, () => {
                                    util.toast("支付失败,请至订单中心重新支付!", null, null, (e) => {
                                        setTimeout((res) => {
                                            wx.redirectTo({
                                                url: '/packageA/pages/order/list/index',
                                            })
                                        }, 1000);
                                    });
                                })
                                return;
                            }
                        }
                    })
                } else {

                    //util.toast("订单创建失败，请重新点击！");
                    that.setData({
                        PayLoading: false,
                        PayLoadingTxt: '',
                        subDisabled: true //禁止提交
                    }, () => {
                        util.toast("订单创建失败,请重新购买!", null, null, (e) => {
                            setTimeout((res) => {
                                wx.navigateBack();
                            }, 1000);
                        });
                    })
                    return;

                }
            }
        }).catch(err => {
            //util.toast("订单CATCH，请重新点击！");
            that.setData({
                PayLoading: false,
                PayLoadingTxt: '',
                subDisabled: true //禁止提交
            }, () => {
                util.toast("CATCH订单失败,请重新购买!", null, null, (e) => {
                    setTimeout((res) => {
                        wx.navigateBack();
                    }, 1000);
                });
            })
            return;
        })
        //#endregion 支付结束
    },
}))