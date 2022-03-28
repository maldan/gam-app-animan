<template>
  <div :class="$style.poseList">
    <div :class="$style.list">
      <ui-button
        @click="view(x)"
        :class="$style.button"
        v-for="x in $store.state.pose.list"
        :text="x"
        :key="x"
      />
    </div>
    <div :class="$style.menu">
      <div :class="$style.line" v-if="mode === 'new'">
        <ui-input v-model="poseName" placeholder="Pose name..." />
        <ui-select
          :class="$style.select"
          :items="poseTypes"
          v-model="poseType"
          placeholder="Pose type..."
        />
        <div :class="$style.group">
          <ui-button @click="cancel" :class="$style.button" text="Cancel" icon="close" />
          <ui-button
            @click="save"
            v-if="poseType && poseName"
            :class="$style.button"
            text="Save"
            icon="check"
          />
        </div>
      </div>
      <div :class="$style.line" v-if="mode === 'view'">
        <div :class="$style.group">
          <ui-button @click="cancel" :class="$style.button" text="Cancel" icon="close" />
          <ui-button :class="$style.button" text="Apply" icon="check" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Animation_Character } from '@/core/Animation_Character';
import { MainScene } from '@/core/MainScene';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    character(): Animation_Character {
      // @ts-ignore
      if (this.r < 0) return null;
      return MainScene.selectedObject?.userData.class as Animation_Character;
    },
  },
  async mounted() {
    await this.$store.dispatch('pose/getList');
  },
  methods: {
    refresh() {
      this.r = Math.random();
    },
    async view(pose: string) {
      this.poseType = null;
      this.mode = 'view';

      this.savePreviousPose();

      await this.$store.dispatch('pose/load', pose);
    },
    savePreviousPose() {
      this.previousPose.length = 0;
      for (const rig of this.character.rigList) {
        this.previousPose.push({
          name: rig.bone.name,
          position: rig.positionOffset.clone(),
          rotation: rig.rotationOffset.clone(),
        });
      }
    },
    restorePreviousPose() {
      for (const rig of this.previousPose) {
        this.character.rig[rig.name].positionOffset = rig.position;
        this.character.rig[rig.name].rotationOffset = rig.rotation;
      }
      this.character.tick();
      this.previousPose.length = 0;
    },
    cancel() {
      this.mode = 'new';
      this.restorePreviousPose();
    },
    async save() {
      const pose = {} as Record<string, unknown>;
      for (const x of this.character.rigList) {
        pose[x.bone.name] = {
          position: { x: x.positionOffset.x, y: x.positionOffset.y, z: x.positionOffset.z },
          scale: { x: 1, y: 1, z: 1 },
          rotation: {
            x: x.rotationOffset.x,
            y: x.rotationOffset.y,
            z: x.rotationOffset.z,
            w: x.rotationOffset.w,
          },
          type: 0,
          value: 0,
        };
      }
      await this.$store.dispatch('pose/save', {
        name: this.poseName,
        data: JSON.stringify({ keys: pose }),
      });
    },
  },
  data: () => {
    return {
      r: 0,
      previousPose: [] as any[],
      poseName: '',
      poseType: null,
      poseTypes: [
        { label: 'Full', value: 'full' },
        { label: 'Body', value: 'body' },
        { label: 'Hand', value: 'hand' },
        { label: 'Face', value: 'face' },
      ],
      mode: 'new',
    };
  },
});
</script>

<style lang="scss" module>
.poseList {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  user-select: none;

  .list {
    display: flex;
    flex-direction: column;

    .button {
      padding: 5px;
      font-size: 14px;
      border-radius: 0;
    }
  }

  .menu {
    margin-top: 10px;
    display: flex;
    flex-direction: column;

    .line {
      .group {
        display: flex;
      }
    }

    .button {
      padding: 5px;
      font-size: 14px;
      border-radius: 0;
    }
  }
}
</style>
