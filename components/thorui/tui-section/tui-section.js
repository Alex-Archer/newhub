Component({
  options:{
     multipleSlots: true
  },
  properties: {
    title: {
      type: String,
      value: ''
    },
    size: {
      type: String,
      optionalTypes:[Number],
      value: 32
    },
    color: {
      type: String,
      value: '#333'
    },
    fontWeight: {
      type: String,
      optionalTypes:[Number],
      value: 400
    },
    descr: {
      type: String,
      value: ''
    },
    descrSize: {
      type: String,
      optionalTypes:[Number],
      value: 24
    },
    descrColor: {
      type: String,
      value: '#7a7a7a'
    },
    descrTop: {
      type: String,
      optionalTypes:[Number],
      value: 16
    },
    isLine: {
      type: Boolean,
      value: false
    },
    lineWidth: {
      type: String,
      optionalTypes:[Number],
      value: 8
    },
    lineColor: {
      type: String,
      value: ''
    },
    //square、circle
    lineCap: {
      type: String,
      value: 'circle'
    },
    lineRight: {
      type: String,
      optionalTypes:[Number],
      value: 16
    },
    lineGap: {
      type: String,
      optionalTypes: [Number],
      value: 4
    },
    background: {
      type: String,
      value: 'transparent'
    },
    padding: {
      type: String,
      value: '20rpx 30rpx'
    },
    margin: {
      type: String,
      value: '0'
    }
  },
  data:{
     g_lineColor:(wx.$tui && wx.$tui.color.primary) || '#5677fc'
  },
  methods: {
    handleClick() {
      this.triggerEvent('click', {
        title: this.data.title
      })
    }
  }
})
