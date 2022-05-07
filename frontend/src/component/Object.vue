<template>
  <div v-if="selectedObject" :class="$style.object">
    <!-- Position -->
    <div :class="$style.label">Position</div>
    <div :class="$style.line">
      <div v-for="x in ['x', 'y', 'z']" :class="$style.field" :key="x">
        <div :class="$style.name">{{ x }}</div>
        <desktop-ui-input-number
          :class="$style.input"
          v-model="position[x]"
          @change="updateTRS"
          :step="0.1"
        />
      </div>
    </div>

    <!-- Rotation -->
    <div :class="$style.label">Rotation</div>
    <div :class="$style.line">
      <div v-for="x in ['x', 'y', 'z']" :class="$style.field" :key="x">
        <div :class="$style.name">{{ x }}</div>
        <desktop-ui-input-number
          :class="$style.input"
          v-model="rotation[x]"
          @change="updateTRS"
          :step="0.1"
        />
      </div>
    </div>

    <!-- Scale -->
    <div :class="$style.label">Scale</div>
    <div :class="$style.line">
      <div v-for="x in ['x', 'y', 'z']" :class="$style.field" :key="x">
        <div :class="$style.name">{{ x }}</div>
        <desktop-ui-input-number
          :class="$style.input"
          v-model="scale[x]"
          @change="updateTRS"
          :step="0.1"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_State } from '@/core/AM_State';
import { AM_Object } from '@/core/am/AM_Object';
import { AM_Bone } from '@/core/am/AM_Bone';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    selectedObject(): AM_Object | undefined {
      if (this.r < 0) return undefined;
      if (AM_State.selectedObject instanceof AM_Bone) return AM_State.selectedObject.parent;
      return AM_State.selectedObject;
    },
  },
  async mounted() {
    AM_State.ui.object.ref = this;
    AM_State.ui.object.refresh();
  },
  methods: {
    refresh() {
      this.r = Math.random();
      if (this.selectedObject) {
        this.position = { ...this.selectedObject.position };
        this.rotation = { ...this.selectedObject.euler };
        this.scale = { ...this.selectedObject.scale };
      }
    },
    updateTRS() {
      if (!this.selectedObject) return;
      this.selectedObject.position = { ...this.position };
      this.selectedObject.euler = { ...this.rotation };
      this.selectedObject.scale = { ...this.scale };
    },
  },
  data: () => {
    return {
      r: 0,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0, y: 0, z: 0 },
    };
  },
});
</script>

<style lang="scss" module>
@import 'src/gam_sdk_ui/vue/style/color';
@import 'src/gam_sdk_ui/vue/style/size';

.object {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  user-select: none;
  color: $text-gray;

  .label {
    margin-bottom: 5px;
    margin-top: 5px;
    background: lighten($gray-dark, 5%);
    padding: 2px;

    &:first-child {
      margin-top: 0;
    }
  }

  .line {
    display: flex;
    flex: 1;
    max-width: 100%;

    .field {
      display: flex;
      align-items: center;
      flex: 1;

      .name {
        margin-right: 5px;
        margin-left: 5px;
      }

      .input {
        width: 50px;
      }
    }
  }
}
</style>
