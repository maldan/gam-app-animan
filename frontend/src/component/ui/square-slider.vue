<template>
  <div :class="$style.squareSlider">
    <div
      ref="box"
      @mousedown="startDrag"
      :class="$style.box"
      :style="{
        left: (remap(modelValue.x, minX, maxX, -0.5, 0.5) + 0.5) * 64 + 'px',
        top: (remap(modelValue.y, minY, maxY, -0.5, 0.5) + 0.5) * 64 + 'px',
      }"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    minX: {
      type: Number,
      default: -0.5,
    },
    maxX: {
      type: Number,
      default: 0.5,
    },
    minY: {
      type: Number,
      default: -0.5,
    },
    maxY: {
      type: Number,
      default: 0.5,
    },
  },
  components: {},
  computed: {},
  async mounted() {
    this.mouseMove = (e: MouseEvent) => {
      if (this.isDrag) {
        const delta = {
          x: e.pageX - this.startDragPosition.x,
          y: e.pageY - this.startDragPosition.y,
        };
        let newValue = {
          x: this.startModelValue.x + delta.x / 64,
          y: this.startModelValue.y + delta.y / 64,
        };

        if (newValue.x < -0.5) newValue.x = -0.5;
        if (newValue.y < -0.5) newValue.y = -0.5;
        if (newValue.x > 0.5) newValue.x = 0.5;
        if (newValue.y > 0.5) newValue.y = 0.5;

        newValue.x = this.remap(newValue.x, -0.5, 0.5, this.minX, this.maxX);
        newValue.y = this.remap(newValue.y, -0.5, 0.5, this.minY, this.maxY);

        this.$emit('update:modelValue', {
          x: newValue.x,
          y: newValue.y,
        });
        this.$emit('change', {
          x: newValue.x,
          y: newValue.y,
        });

        /*let bp = this.startBoxPosition.x + (delta / this.boxWidth) * 100;
        if (bp <= 0) bp = 0;
        if (bp >= 100) bp = 100;*/
        // this.boxPosition = bp;
        //this.$emit('update:modelValue', bp / 100);
        //this.$emit('change', bp / 100);
      }
    };
    this.mouseUp = () => {
      this.isDrag = false;
    };
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('mouseup', this.mouseUp);
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.mouseMove);
    document.removeEventListener('mouseup', this.mouseUp);
  },
  methods: {
    startDrag(e: MouseEvent) {
      this.startDragPosition.x = e.pageX;
      this.startModelValue.x = this.remap(this.modelValue.x, this.minX, this.maxX, -0.5, 0.5);
      this.startDragPosition.y = e.pageY;
      this.startModelValue.y = this.remap(this.modelValue.y, this.minY, this.maxY, -0.5, 0.5);

      this.isDrag = true;
    },
    remap(value: number, low1: number, high1: number, low2: number, high2: number) {
      return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
    },
  },
  data: () => {
    return {
      r: 0,
      left: 32 - 8,
      top: 32 - 8,

      isDrag: false,
      mouseMove: null as any,
      mouseUp: null as any,
      startDragPosition: { x: 0, y: 0 },
      startModelValue: { x: 0, y: 0 },
      boxWidth: 16,
    };
  },
});
</script>

<style lang="scss" module>
@import 'src/gam_sdk_ui/vue/style/color';
@import 'src/gam_sdk_ui/vue/style/size';

.squareSlider {
  display: flex;
  flex-direction: column;
  width: 64px;
  height: 64px;
  background: $gray-dark;
  position: relative;
  overflow: hidden;

  .box {
    position: absolute;
    width: 16px;
    height: 16px;
    background: $gray-light;
    transform: translateX(-8px) translateY(-8px);
  }
}
</style>
