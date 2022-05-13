<template>
  <div :class="$style.clipList">
    <desktop-ui-button
      @click="loadClip(x)"
      v-for="x in list"
      :key="x"
      :text="x"
      :class="$style.button"
      icon="arrow_down"
      iconPosition="left"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_API } from '@/core/AM_API';
import { AM_State } from '@/core/AM_State';
import { AM_Character } from '@/core/object/AM_Character';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {
    // this.list = await AM_API.getClipList();
  },
  methods: {
    async loadClip(name: string) {
      const clip = await AM_API.getClip(name);
      /*for (let i = 0; i < clip.objectList.length; i++) {
        const objectInfo = await AM_API.object.getInfo(clip.objectList[i].resourceId);
        const obj = await AM_State.loadObject(
          objectInfo.filePath,
          objectInfo.category === 'character' ? 'character' : '',
        );
        obj.id = clip.objectList[i].id;
        obj.resourceId = clip.objectList[i].resourceId;

        obj.position = clip.objectList[i].position;
        obj.rotation = clip.objectList[i].rotation;
        // obj.scale = objectInfo.scale;
        AM_State.addObject(obj);
      }*/

      for (let i = 0; i < clip.animationList.length; i++) {
        const obj = AM_State.objectList.find((x) => x.id === clip.animationList[i].objectId);
        if (!obj) continue;
        obj.animationController.animationList.length = 0;

        clip.animationList[i].animationList?.forEach((x) => {
          const animation = AM_API.animation.fromJSON(x.animation);
          obj.animationController.appendAnimation(animation, x.offset);
        });
        obj.animationController.compile();
      }
    },
  },
  data: () => {
    return {
      list: [] as string[],
    };
  },
});
</script>

<style lang="scss" module>
.clipList {
  display: flex;
  flex-direction: column;

  .button {
    margin-bottom: 5px;
  }
}
</style>
