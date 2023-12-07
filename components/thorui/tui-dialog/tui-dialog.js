Component({
  options: {
    multipleSlots: true
  },
  properties: {
    title: {
      type: String,
      value: ''
    },
    maskClosable: {
      type: Boolean,
      value: true
    },
    mask: {
      type: Boolean,
      value: true
    },
    show: {
      type: Boolean,
      value: false
    },
    buttons: {
      type: Array,
      value:[]
    },
    backgroundColor: {
      type: String,
      value: '#fff'
    },
    radius: {
      type: String,
      value: '12px'
    },
    titleColor: {
      type: String,
      value: '#333'
    },
    contentColor: {
      type: String,
      value: '#999'
    }
  },
  methods: {
    buttonTap(e) {
      const {
        index
      } = e.currentTarget.dataset;
      this.triggerEvent('click', {
        index,
        item: this.data.buttons[index]
      });
    },
    close() {
      if (!this.data.maskClosable) return;
      this.triggerEvent('close', {});
    },

    stopEvent() {}
  }
})