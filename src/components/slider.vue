<template>
  <div>
    <el-slider
      ref="slider"
      :value="value"
      :max="max"
      :step="step"
      :disabled="disabled"
      :style="style"
    ></el-slider>
  </div>
</template>
<script>
export default {
  data: function() {
    return {
      value: 0,
      max: 100,
      step: 1,
      disabled: true,
      style: {
        width: "100px",
        display: "none"
      }
    };
  },
  methods: {
    reset: function() {
      this.disabled = true;
      this.style.display = "none"; // "none": 不可见, "block":可见
    },
    init: function(max, onChange) {
      this.value = 0;
      this.max = max;
      this.disabled = false;
      this.style.display = "block";
      $(this.$refs.slider).change(e => {
        onChange(e.target.value);
      });
    },
    setPosition: function(frameNumber) {
      this.value = frameNumber;
    }
  }
};
</script>