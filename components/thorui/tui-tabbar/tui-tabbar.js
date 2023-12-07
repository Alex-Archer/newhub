Component({
    properties: {
        //首页和别人模式不一样
        indexPage: {
            type: Boolean,
            value: false
        },
        //首页按钮是否显示
        homeShow: {
            type: Boolean,
            value: true
        },
        //当前索引
        current: {
            type: Number,
            value: 0
        },
        //字体颜色
        color: {
            type: String,
            value: '#666'
        },
        //字体选中颜色
        selectedColor: {
            type: String,
            value: '#ff6425'
        },
        //背景颜色
        backgroundColor: {
            type: String,
            value: '#FFFFFF'
        },
        //是否需要中间凸起按钮
        hump: {
            type: Boolean,
            value: false
        },
        //固定在底部
        isFixed: {
            type: Boolean,
            value: true
        },
        //tabbar
        // "pagePath": "/pages/my/my", 页面路径
        // "text": "thor", 标题
        // "iconPath": "thor_gray.png", 图标地址
        // "selectedIconPath": "thor_active.png", 选中图标地址
        // "hump": true, 是否为凸起图标
        // "num": 2,   角标数量
        // "isDot": true,  角标是否为圆点
        // "verify": true  是否验证  （如登录）
        //coachPath:'/page/......' 要判断是教练时不为空 他的用户中心地址
        tabBar: {
            type: Array,
            value: []
        },
        //角标字体颜色
        badgeColor: {
            type: String,
            value: '#fff'
        },
        //角标背景颜色
        badgeBgColor: {
            type: String,
            value: '#F74D54'
        },
        //小鱼 距离底部,默认20RPX安全距离
        paddingBottom: {
            type: String,
            value: '24rpx'
        },
        unlined: {
            type: Boolean,
            value: false
        },
        //是否开启高斯模糊效果[IOS]
        backdropFilter: {
            type: Boolean,
            value: false
        },
        //z-index
        zIndex: {
            type: Number,
            optionalTypes: [String],
            value: 9999
        }
    },

    methods: {
        tabbarSwitch(e) {
            //console.log(JSON.stringify(e));
            let dataset = e.currentTarget.dataset;
            this.triggerEvent('click', {
                index: Number(dataset.index),
                hump: dataset.hump,
                pagePath: dataset.pagepath,
                verify: dataset.verify,
                navigate:dataset.navigate,
                action:dataset.action,
                coachPath:dataset.coachpath//判断教练
            });
        },
        showHomeButton(show) {
            //console.log('myokokevent myokokeventmyokokeventmyokokevent');
            this.setData({
                homeShow: show
            })
        },
        //回到顶部 通知父窗
        goTop(e) { // 一键回到顶部
            console.log('goTop Component')
            let dataset = e.currentTarget.dataset;
            this.triggerEvent('goToTop', 0);

            // if (wx.pageScrollTo) {
            //   wx.pageScrollTo({
            //     scrollTop: 0
            //   })
            // } else {
            //   wx.showModal({
            //     title: '提示',
            //     content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            //   })
            // }
        },

    }
})