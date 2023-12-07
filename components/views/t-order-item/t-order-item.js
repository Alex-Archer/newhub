Component({
  options: {
    multipleSlots: true
  },
  properties: {
    entity: {
      type: Object,
      value: {}
    },
    lastChild: {
      type: Boolean,
      value: false
    }
  },
  data: {

  },
  methods: {
    bindClick(e) {
      console.log('bindClick')
      this.triggerEvent('click', {
        index: 0
      });
		}
  }
})