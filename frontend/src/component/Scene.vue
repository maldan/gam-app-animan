<template>
  <div :class="$style.scene">
    <div
      class="clickable"
      :class="[$style.object, isSelected(x) ? $style.selected : null]"
      v-for="x in objectList"
      :key="x.name"
      @click="selectObject(x)"
    >
      {{ x.type }} {{ x.name }}
      <ui-icon @click.stop="toggleVisibility(x)" :class="$style.visibility" name="eye" />
      <ui-icon @click.stop="removeObject(x)" :class="$style.remove" name="trash" />
    </div>
    <desktop-ui-button @click="pickObject" text="Add" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_State } from '@/core/AM_State';
import { AM_Object } from '@/core/am/AM_Object';
import { AM_API } from '@/core/AM_API';
import { AM_Character } from '@/core/am/AM_Character';
import { AM_Bone } from '@/core/am/AM_Bone';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    objectList() {
      if (this.r === 0) return [];
      return AM_State.objectList.filter((x) => !(x instanceof AM_Bone));
    },
  },
  async mounted() {
    AM_State.ui.scene.ref = this;
    AM_State.ui.scene.refresh();
  },
  methods: {
    refresh() {
      this.r = Math.random();
    },
    isCharacter(obj: AM_Object): boolean {
      return obj instanceof AM_Character;
    },
    isSelected(obj: AM_Object): boolean {
      return AM_State.selectedObject === obj;
    },
    removeObject(obj: AM_Object) {
      AM_State.removeObject(obj);
    },
    selectObject(obj: AM_Object) {
      AM_State.selectObject(obj);
    },
    toggleVisibility(obj: AM_Object) {
      obj.visible = !obj.visible;
      obj.update();
    },
    pickObject(): void {
      const store = this.$store;

      this.$store.dispatch('modal/show', {
        name: 'pick/object',
        data: {
          uuid: '',
        },
        onSuccess: async () => {
          const info = await AM_API.getObjectByUUID(store.state.modal.data.uuid);
          const obj = await AM_State.loadObject(
            info.modelPath,
            info.category === 'character' ? 'character' : '',
          );
          AM_State.addObject(obj);
          AM_State.ui.refresh();
        },
      });
    },
  },
  data: () => {
    return {
      r: 0,
    };
  },
});
</script>

<style lang="scss" module>
.scene {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  user-select: none;

  .object {
    background: #1b1b1b;
    color: #999999;
    padding: 5px;
    margin-bottom: 1px;
    display: flex;
    align-items: center;

    .visibility {
      margin-left: auto;
    }

    .remove {
      margin-left: 5px;
    }

    &.selected {
      background: #33a833;
      color: #ffffff;
    }
  }
}
</style>
