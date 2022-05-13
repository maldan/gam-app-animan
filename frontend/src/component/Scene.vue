<template>
  <div :class="$style.scene" ref="scene">
    <desktop-ui-button @click="pickObject" text="Add" />
    <div :class="$style.list">
      <div
        class="clickable"
        :class="[$style.object, isSelected(x) ? $style.selected : null]"
        v-for="x in objectList"
        :key="x.name"
        @click="selectObject(x)"
      >
        <ui-icon
          :class="$style.icon"
          :name="iconByType(x)"
          :width="20"
          :height="20"
          :color="isSelected(x) ? '#a6ff68' : undefined"
        />

        <div :class="$style.name">{{ x.name }}</div>

        <ui-icon
          v-if="isShowTimelineIcon(x)"
          @click.stop="addAnimationObject(x)"
          :class="$style.timeline"
          name="film"
          :width="20"
          :height="20"
          :color="isSelected(x) ? '#a6ff68' : undefined"
        />
        <ui-icon
          @click.stop="toggleVisibility(x)"
          :class="$style.visibility"
          :name="isVisible(x) ? 'eye' : 'eye_hidden'"
          :width="18"
          :height="18"
          :color="isSelected(x) ? '#a6ff68' : undefined"
        />
        <ui-icon
          @click.stop="removeObject(x)"
          :class="$style.remove"
          name="trash"
          :width="18"
          :height="18"
          :color="isSelected(x) ? '#a6ff68' : undefined"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_State } from '@/core/AM_State';
import { AM_Object } from '@/core/object/AM_Object';
import { AM_API } from '@/core/AM_API';
import { AM_Character } from '@/core/object/AM_Character';
import { AM_Bone } from '@/core/object/AM_Bone';
import { AM_DirectionalLight } from '@/core/object/AM_DirectionalLight';

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
      // this.listHeight = (this.$refs['scene'] as HTMLElement).getBoundingClientRect().height - 8;
    },
    isCharacter(obj: AM_Object): boolean {
      return obj instanceof AM_Character;
    },
    isSelected(obj: AM_Object): boolean {
      if (this.r < 0) return false;
      if (AM_State.selectedObject instanceof AM_Bone) {
        return AM_State.selectedObject.parent === obj;
      }
      return AM_State.selectedObject === obj;
    },
    isVisible(obj: AM_Object): boolean {
      if (this.r < 0) return false;
      return obj.visible;
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
      this.$nextTick(() => {
        this.refresh();
      });
    },
    addAnimationObject(obj: AM_Object) {
      AM_State.addAnimationObject(obj);
    },
    pickObject(): void {
      const store = this.$store;

      this.$store.dispatch('modal/show', {
        name: 'pick/object',
        data: {
          resourceId: '',
        },
        onSuccess: async () => {
          const resourceId = store.state.modal.data.resourceId;
          const name = store.state.modal.data.name;

          if (resourceId === 'directionalLight') {
            const obj = new AM_DirectionalLight();
            obj.resourceId = resourceId;
            obj.name = name;
            obj.update();
            AM_State.addObject(obj);
          } else {
            const info = await AM_API.object.getInfo(resourceId);
            const threeObj = await AM_State.loadObject(info.filePath);

            if (info.category.match('character')) {
              const obj = AM_State.instantiateObject(threeObj, 'character');
              obj.resourceId = resourceId;
              obj.name = name;
              AM_State.addObject(obj);
            } else {
              const obj = AM_State.instantiateObject(threeObj);
              obj.resourceId = resourceId;
              obj.name = name;
              AM_State.addObject(obj);
            }
          }

          AM_State.ui.refresh();
        },
      });
    },
    iconByType(obj: AM_Object) {
      if (obj instanceof AM_DirectionalLight) return 'bulb';
      if (obj instanceof AM_Character) return 'person';
      return 'cube';
    },
    isShowTimelineIcon(obj: AM_Object) {
      if (obj instanceof AM_Character) return true;
      return false;
    },
  },
  data: () => {
    return {
      r: 0,
      listHeight: 100,
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
  height: 100%;

  .list {
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    height: calc(100% - 30px);
    overflow-y: auto;
  }

  .object {
    background: #1b1b1b;
    color: #999999;
    padding: 2px 3px;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    border-radius: 2px;

    .icon {
      margin-right: 5px;
    }

    .name {
      margin-right: auto;
    }

    .timeline {
      margin-left: 5px;
    }

    .visibility {
      margin-left: 5px;
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
