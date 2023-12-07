Component({
    externalClasses: ["tui-btn-class"],
    behaviors: ['wx://form-field-button'],
    properties: {
        //样式类型 primary, white, danger, warning,  green,blue, gray，black,brown,gray-primary,gray-danger,gray-warning,gray-green
        type: {
            type: String,
            value: 'default', //primary', 小鱼改 default 为奥本默认色
            observer(val) {
                this.initStyl()
            }
        },
        bgColor:{//小鱼加，如果有，就是以它为优先
            type: String,
            value: ''
        },
        borderRadius:{//小鱼加 圆角大小，如果有，就是以它为优先
            type: String,
            value: ''
        },
        
   //小鱼加，按钮内FLEX 上下居中对齐
   flexdirection: {
            type: Boolean,
            value: false
        },
        
        //是否加阴影
        shadow: {
            type: Boolean,
            value: false
        },
        // 宽度 rpx或 %
        width: {
            type: String,
            value: '100%'
        },
        //高度 rpx
        height: {
            type: String,
            value: ''
        },
        //medium 368*80 / small 240*80/ mini 116*64
        btnSize: {
            type: String,
            value: ''
        },
        //字体大小 rpx
        size: {
            type: String,
            optionalTypes: [Number],
            value: 0
        },
        bold: {
            type: Boolean,
            value: false
        },
        margin: {
            type: String,
            value: '0'
        },
        //形状 circle(圆角), square(默认方形)，rightAngle(平角)
        shape: {
            type: String,
            value: 'square'
        },
        plain: {
            type: Boolean,
            value: false,
            observer(val) {
                this.initStyl()
            }
        },
        link: {
            type: Boolean,
            value: false
        },
        disabled: {
            type: Boolean,
            value: false
        },
        //禁用后背景是否为灰色 （非空心button生效）
        disabledGray: {
            type: Boolean,
            value: false
        },
        loading: {
            type: Boolean,
            value: false
        },
        formType: {
            type: String,
            value: ''
        },
        openType: {
            type: String,
            value: ''
        },
        appParameter: {
            type: String,
            value: ''
        },
        index: {
            type: Number,
            optionalTypes: [String],
            value: 0
        },
        //是否需要阻止重复点击【默认200ms】
        preventClick: {
            type: Boolean,
            value: true
        }
    },
    data: {
        time: 0,
        g_height: wx.$tui && wx.$tui.tuiButton.height,
        g_size: wx.$tui && wx.$tui.tuiButton.size,
        g_bg_color: '',
        g_color: '',
        g_shadow: 'none',
        g_border_color: ''
    },
    lifetimes: {
        attached: function () {
            this.initStyl()
        }
    },
    methods: {
        hexToRGB(hex) {
            if (hex.length === 4) {
                let text = hex.substring(1, 4);
                hex = '#' + text + text;
            }
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : {};
        },
        getColorByType(type, isText, plain) {
            const global = wx.$tui && wx.$tui.color
            let color = ''
            const colors = {
                'default': (global && global.default) || '#319fa6', //#68a9ad
                'primary': (global && global.primary) || '#5677fc',
                'white': '#fff',
                'danger': (global && global.danger) || '#EB0909',
                'warning': (global && global.warning) || '#ff7900',
                'green': (global && global.success) || '#07c160',
                'blue': (global && global.blue) || '#007aff',
                'gray': '#bfbfbf',
                'black': '#333333',
                'brown': '#ac9157',
                'gray-primary': '#f2f2f2',
                'gray-danger': '#f2f2f2',
                'gray-warning': '#f2f2f2',
                'gray-green': '#f2f2f2'
            }
            if (isText) {
                if (type && ~type.indexOf('gray-')) {
                    const tp = type.replace('gray-', '')
                    color = colors[tp]
                } else if (type === 'white') {
                    color = '#333'
                } else {
                    if (plain) {
                        color = colors[type]
                    } else {
                        color = '#fff'
                    }
                }
            } else {
                color = colors[type] || colors.primary
            }
            return color;
        },
        getShadow(type, plain) {
            const color = this.getColorByType(type)
            if (plain || !color) return 'none';
            const rgb = this.hexToRGB(color)
            return `0 10rpx 14rpx 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
        },
        getBgColor(type, plain) {
            return plain ? 'transparent' : this.getColorByType(type)
        },
        getColor(type, plain) {
            return this.getColorByType(type, true, plain)
        },
        initStyl() {
            const type = this.data.type;
            const plain = this.data.plain;
            this.setData({
                g_bg_color: this.data.bgColor?this.data.bgColor:this.getBgColor(type, plain),
                g_color: this.getColor(type, plain),
                g_shadow: this.getShadow(type, plain),
                g_border_color: this.getBgColor(type)
            })
        },
        handleClick() {
            if (this.data.disabled) return false;
            if (this.data.preventClick) {
                if (new Date().getTime() - this.data.time <= 200) return;
                this.data.time = new Date().getTime();
                setTimeout(() => {
                    this.data.time = 0;
                }, 200);
            }
            this.triggerEvent('click', {
                index: Number(this.data.index)
            });
        },
        bindgetuserinfo({
            detail = {}
        } = {}) {
            this.triggerEvent('getuserinfo', detail);
        },
        bindcontact({
            detail = {}
        } = {}) {
            this.triggerEvent('contact', detail);
        },
        bindgetphonenumber({
            detail = {}
        } = {}) {
            this.triggerEvent('getphonenumber', detail);
        },
        binderror({
            detail = {}
        } = {}) {
            this.triggerEvent('error', detail);
        },
        bindchooseavatar({
            detail = {}
        } = {}) {
            this.triggerEvent('chooseavatar', detail);
        },
        bindlaunchapp({
            detail = {}
        } = {}) {
            this.triggerEvent('launchapp', detail);
        }
    }
})