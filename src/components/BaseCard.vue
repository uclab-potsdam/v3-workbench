<template>
  <div v-if="entity != null" class="card"
    :class="{ collapsed, 'context-search': context === 'search', note: isNote }" :style="{...colors, transform}"
    v-drop="{
      filter: ['connect'],
      obj: _id,
    }"
    v-drag="{
      mode: 'move-card',
      trigger: '.drag-trigger',
      data: { _id, offset: true }
    }"
    @dropped="onDrop">
    <CardHeader :label="getLabel(entity.label)" :doctype="getLabel(doctype.metadata.label) || doctype._id" @click="toggleCollapse">
      <icon scale="1" v-if="context !== 'search'" data="@icon/property-add-l.svg" :color="[
        collapsed && hasOutgoingConnections ? 'var(--edges)' : 'none',
        'rgb(var(--secondary))',
        'currentColor'
      ]" v-drag="{
        mode: 'connect',
        data: {
          sub: _id,
          doctype: doctype?._id
        }
      }"/>
    </CardHeader>
    <card-footer v-if="!collapsed && context !== 'search'">
       <icon @click="onRemoveCard" scale="1" data="@icon/remove.svg"/>
       <icon @click="confirmDeleteEntity = true" scale="1" data="@icon/delete.svg"/>
       <!-- <template #right>
       </template> -->
    </card-footer>
    <main v-if="!collapsed">
      <card-cover v-if="cover" :path="cover"/>
      <card-note v-if="isNote" :entity="_id" :prop="properties.find(d => d.id === 'text')"/>
      <card-property v-for="(prop, i) in entityProperties" :key="i"
        :prop="prop" :represents="_id"/>
    </main>
    <base-modal v-if="sub != null" @close="closePropSelect">
      <card-select :options="propOptions" @select="selectProperty"/>
    </base-modal>
    <base-modal v-if="confirmDeleteEntity" @close="confirmDeleteEntity = false">
      <card-select :options="['Permanently Delete Entity']" @select="onDeleteEntity"/>
    </base-modal>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import drag from '@/assets/js/directives/drag'
import drop from '@/assets/js/directives/drop'
import CardHeader from './CardHeader.vue'
import CardFooter from './CardFooter.vue'
import CardProperty from './CardProperty.vue'
import CardCover from './CardCover.vue'
import CardNote from './CardNote.vue'
import BaseModal from './BaseModal.vue'
import CardSelect from './CardSelect.vue'
export default {
  components: { CardHeader, CardFooter, CardProperty, CardCover, CardNote, BaseModal, CardSelect },
  name: 'BaseCard',
  directives: {
    drag,
    drop
  },
  emits: ['drag', 'toggleCollapse', 'removeProp', 'setTempEdge', 'clearTempEdge'],
  props: {
    _id: String,
    // label: String,
    // doctype: Object,
    entity: Object,
    properties: Object,
    cover: String,
    cardId: String,
    // collapsed: Boolean,
    pane: String,
    context: String,
    scale: Number,
    allowDrop: Boolean,
    transform: String
  },
  data () {
    return {
      widthLabel: 0,
      widthCard: 0,
      collapsed: true,
      hover: false,
      dragActive: false,
      sub: null,
      propOptions: [],
      confirmDeleteEntity: false
    }
  },
  computed: {
    ...mapState('config', ['fileServer']),
    ...mapState('data', ['classes', 'props']),
    ...mapGetters('data', ['getProperties', 'getClass']),
    ...mapGetters('config', ['getLabel']),
    colors () {
      if (this.doctype?.metadata?.secondary == null) return
      const { secondary, primary } = this.doctype.metadata
      return {
        '--primary': /-[0-9]+/.test(primary) ? `var(--${primary})` : `var(--${primary}-2)`,
        '--secondary': /-[0-9]+/.test(secondary) ? `var(--${secondary})` : `var(--${secondary}-9)`
      }
    },
    doctype () {
      return this.getClass(this.entity.doctype)
    },
    label () {
      // console.log(this.entity)
      return this.getLabel(this.entity?.label)
    },
    isNote () {
      return this.doctype?._id === 'Note'
    },
    hasOutgoingConnections () {
      return this.properties?.find(p => p.linkProperty && !p.inverse && p.value.length > 0) != null
    },
    entityProperties () {
      return this.entity.properties.map(d => {
        return {
          ...d,
          ...this.props.find(p => p._id === d.id)
        }
      }).filter(d => d.metadata != null && !d.metadata.hidden)
    }
  },
  methods: {
    ...mapActions('data', ['addProp']),
    ...mapActions('api', ['deleteDocument']),
    ...mapActions('view', ['removeCard']),
    onDrop (e) {
      const { detail } = e
      if (detail.data.sub == null) return
      e.stopPropagation()
      if (detail.data.prop == null) {
        // console.log(this.getProperties({ sub: detail.data.doctype, obj: this.doctype._id }))
        this.propOptions = this.getProperties({ sub: detail.data.doctype, obj: this.doctype._id }).map(({ prop }) => prop)
        this.sub = detail.data.sub
      } else {
        this.addProp([detail.data.sub, detail.data.prop, this._id])
      }
    },
    closePropSelect () {
      this.sub = null
    },
    selectProperty (prop) {
      this.addProp([this.sub, prop, this._id])
      this.closePropSelect()
    },
    toggleCollapse () {
      this.collapsed = !this.collapsed
      this.$emit('toggleCollapse')
    },
    onRemoveCard () {
      this.removeCard(this.cardId)
      this.deleteDocument(this.cardId)
    },
    onDeleteEntity () {
      this.removeCard(this.cardId)
      this.deleteDocument(this._id)
    }
  }
}
</script>

<style scoped lang="scss">
// .svg-icon {
//   color: var(--secondary);
// }
.card {
  transform-origin: top left;
  background: rgb(var(--secondary));
  color: rgb(var(--primary));
  // @media (prefers-color-scheme: dark) {
  //   background: rgb(var(--primary));
  //   color: rgb(var(--secondary));
  // }
  width: var(--card-width);
  overflow-x: hidden;
  overflow-y: auto;
  // display: flex;
  // flex-direction: column;
  // justify-content: space-between;
  &:hover {
    z-index: 1;
  }

  // hide scrollbars
  &::-webkit-scrollbar { width: 0 !important }
  scrollbar-width: none;

  height: var(--card-height);
  // &.note {
  //   height: var(--card-width);
  // }

  &.context-search {
    height: calc(var(--card-height) - var(--card-footer-height));
    overflow-y: hidden;
  }

  &.collapsed {
    height: var(--card-header-height);
  }

  main {
    min-height: var(--card-main-height);
    margin-bottom: var(--card-footer-height);
    // padding: 0 var(--spacing);

    section + section {
      margin-top: var(--spacing);
    }
  }
}
</style>
