Component({
  properties: {
    list: {
      type: Array,
      value: []
    },
    background: {
      type: String,
      value: '#fff'
    },
    textSize: {
      type: String,
      optionalTypes: [Number],
      value: 24
    },
    textColor: {
      type: String,
      value: '#999'
    },
    textFontWeight: {
      type: String,
      optionalTypes: [Number],
      value: 400
    },
    valueSize: {
      type: String,
      optionalTypes: [Number],
      value: 32
    },
    valueColor: {
      type: String,
      value: '#333'
    },
    valueFontWeight: {
      type: String,
      optionalTypes: [Number],
      value: 400
    },
    width: {
      type: String,
      optionalTypes: [Number],
      value: 80
    },
    height: {
      type: String,
      optionalTypes: [Number],
      value: 80
    },
    divider: {
      type: Boolean,
      value: true
    },
    dividerColor: {
      type: String,
      value: '#eaeef1'
    },
    //百分比：1~100
    dividerHeight: {
      type: String,
      optionalTypes: [Number],
      value: 60
    },
    padding: {
      type: String,
      optionalTypes: [Number],
      value: 20
    },
    //角标字体颜色
    badgeColor: {
      type: String,
      value: '#fff'
    },
    //角标背景颜色
    badgeBgColor: {
      type: String,
      value: ''
    }
  },
  data: {
    g_badgeBgColor:(wx.$tui && wx.$tui.color.pink) || '#f74d54'
  },
  methods: {
    itemTap(e) {
      let index = Number(e.currentTarget.dataset.index)
      this.triggerEvent('click', {
        index
      })
    }
  }
})