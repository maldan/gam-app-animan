<template>
  <div :class="$style.timeline">
    <div :class="$style.line" v-for="(k, v) in keys" :key="k">
      <div :class="$style.title">{{ v }}</div>
      <div :class="$style.keys">
        <div :class="$style.key" v-for="y in 32" :key="y"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {},
  methods: {},
  data: () => {
    return {
      keys: {
        Head: [],
        Neck: [],
        Chest: [],
        Belly: [],
        Root: [],
        'Tight.L': [],
        'Tight.R': [],
      },
    };
  },
});
</script>

<style lang="scss" module>
.timeline {
  .line {
    display: flex;
    margin-bottom: 1px;

    .title {
      min-width: 128px;
      font-size: 14px;
    }

    .keys {
      display: flex;

      .key {
        width: 10px;
        background: #161616;
        margin-right: 1px;
      }
    }
  }
}
</style>
