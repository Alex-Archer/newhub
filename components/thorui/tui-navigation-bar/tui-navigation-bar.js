Component({
  properties: {
    //NavigationBar标题
    title: {
      type: String,
      value: ''
    },
    //NavigationBar标题颜色
    color: {
      type: String,
      value: '#fff' 
    },
    //NavigationBar背景颜色 不支持rgb
    backgroundColor: {
      type: String,
      value: '#fff'
    },
    //是否需要分割线
    splitLine: {
      type: Boolean,
      value: false
    },
    //是否设置不透明度
    isOpacity: {
      type: Boolean,
      value: true
    },
    //不透明度最大值 0-1
    maxOpacity: {
      type: Number,
      optionalTypes:[String],
      value: 1
    },
		//背景透明 【设置该属性，则背景透明，只出现内容，isOpacity和maxOpacity失效】
		transparent:{
			type: Boolean,
			value: false
		},
    //滚动条滚动距离
    scrollTop: {
      type: Number,
      optionalTypes:[String],
      value: 0,
      observer(val) {
        if (this.data.isOpacity && !this.data.transparent) {
          this.opacityChange();
        }
      }
    },
    /*
     isOpacity 为true时生效
     opacity=scrollTop /windowWidth * scrollRatio
    */
    scrollRatio: {
      type: Number,
      optionalTypes:[String],
      value: 0.3
    },
    //是否自定义header内容
    isCustom: {
      type: Boolean,
      value: false
    },
    //是否沉浸式
    isImmersive: {
      type: Boolean,
      value: true
    },
    isFixed: {
      type: Boolean,
      value: true
    },
    //是否开启高斯模糊效果[仅在支持的浏览器有效果]
    backdropFilter: { 
      type: Boolean,
      value: false
    },
    //下拉隐藏NavigationBar，主要针对有回弹效果ios端
    dropDownHide: {
      type: Boolean,
      value: false
    },
		//z-index设置
		zIndex: {
      type: Number,
      optionalTypes:[String],
			value: 9998
		}
  },
  data: {
    width: 375, //header宽度
    left: 375, //小程序端 左侧距胶囊按钮距离
    height: 44, //header高度
    top: 0,
    scrollH: 1, //滚动总高度,计算opacity
    opacity: 0, //0-1
    statusBarHeight: 0, //状态栏高度
    background: '255,255,255', //header背景色
    dropDownOpacity: 1
  },
  lifetimes: {
    attached: function () {
      this.setData({
        opacity: this.data.isOpacity || this.data.transparent ? this.data.opacity : this.data.maxOpacity,
        background: this.hexToRgb(this.data.backgroundColor),
        dropDownOpacity:this.data.backdropFilter && 0
      })

      let obj = wx.getMenuButtonBoundingClientRect();
      wx.getSystemInfo({
        success: res => {
          let height = this.data.height;
          if (this.data.isImmersive) {
            height = obj.top ? obj.top + obj.height + 8 : res.statusBarHeight + 44;
          }
          this.setData({
            statusBarHeight: res.statusBarHeight,
            width: res.windowWidth,
            left: obj.left || res.windowWidth,
            height: height,
            scrollH: res.windowWidth * this.data.scrollRatio,
            top: obj.top ? obj.top + (obj.height - 32) / 2 : res.statusBarHeight + 6
          }, () => {
            this.triggerEvent('init', {
              width: this.data.width,
              height: this.data.height,
              left: obj.left,
              top: this.data.top,
              statusBarHeight: this.data.statusBarHeight,
              opacity: this.data.opacity,
              windowHeight:res.windowHeight
            });
          })
        }
      });
    }
  },
  methods: {
    hexToRgb(hex) {
      let rgb = '255,255,255';
      if (hex && ~hex.indexOf('#')) {
        if (hex.length === 4) {
          let text = hex.substring(1, 4);
          hex = '#' + text + text;
        }
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
          rgb = `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
        }
      }
      return rgb;
    },
    opacityChange() {
      if(this.data.dropDownHide){
        if (this.data.scrollTop < 0) {
          if (this.data.dropDownOpacity > 0) {
            this.setData({
              dropDownOpacity: 1 - Math.abs(this.scrollTop) / 30
            })
          }
        } else {
          this.setData({
            dropDownOpacity: 1
          })
        }
      }
      let scroll = this.data.scrollTop <= 1 ? 0 : this.data.scrollTop;
      let opacity = scroll / this.data.scrollH;
      if ((this.data.opacity >= this.data.maxOpacity && opacity >= this.data.maxOpacity) || (this.data.opacity == 0 && opacity == 0)) {
        return;
      }
    
      this.setData({
        opacity: opacity > this.data.maxOpacity ? this.data.maxOpacity : opacity
      })
      if (this.data.backdropFilter) {
        this.setData({
          dropDownOpacity:this.data.opacity >= this.data.maxOpacity ? 1 : this.data.opacity
        })
			}
      this.triggerEvent('change', {
        opacity: opacity
      });
    }
  }
})