Component({
  externalClasses: ['tui-rate-class'],
  properties: {
    //数量
    quantity: {
      type: Number,
      value: 5
    },
    //当前选中
    current: {
      type: Number,
      value: 0
    },
    //当前选中星星分数(大于0，小于等于1的数)
    score: {
      type: Number,
      value: 1,
      observer(val) {
        this.getPercent()
      }
    },
    //禁用点击
    disabled: {
      type: Boolean,
      value: false
    },
    //大小
    size: {
      type: Number,
      value: 20
    },
    //未选中颜色
    normal: {
      type: String,
      value: "#b2b2b2"
    },
    //选中颜色
    active: {
      type: String,
      value: ""
    },
    //未选中是否为空心
    hollow: {
      type: Boolean,
      value: false
    },
    //自定义参数
    params: {
      type: Number,
      optionalTypes:[String],
      value: 0
    }
  },
  lifetimes: {
    attached: function () {
      this.getPercent()
    }
  },
  data: {
    pageX: 0,
    percent: 0,
    g_active:(wx.$tui && wx.$tui.color.danger) || '#EB0909'
  },
  methods: {
    getPercent() {
      this.setData({
        percent: Number(this.data.score || 0) * 100
      })
    },
    handleTap(e) {
      if (this.data.disabled) {
        return;
      }
      const index = e.currentTarget.dataset.index;
      this.triggerEvent('change', {
        index: index + 1,
        params:this.data.params
      })
    },
    touchMove(e) {
      if (this.data.disabled) {
        return;
      }
      if (!e.changedTouches[0]) {
        return;
      }
      const movePageX = e.changedTouches[0].pageX;
      const distance = movePageX - this.data.pageX;

      if (distance <= 0) {
        return;
      }
      let index = Math.ceil(distance / this.data.size);
      index = index > this.data.quantity ? this.data.quantity : index;
      this.triggerEvent('change', {
        index: index,
        params:this.data.params
      })
    }
  },
  ready() {
    const className = '.tui-rate-box';
    let query = wx.createSelectorQuery().in(this)
    query.select(className).boundingClientRect((res) => {
      if(res)//小鱼加，在团课中还没出来时报 res.left错
      {
        this.setData({
            pageX: res.left || 0
          })
       }    
      }).exec();
     
  }
})