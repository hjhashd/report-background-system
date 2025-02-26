<!--
 * @Author: bekon
 * @Date: 2025-02-18 17:57:40
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-25 13:57:59
 * @FilePath: /report-background-system/src/components/ReportCardSlider/ReportCardSlider.vue
 * @Description: 
 * 
-->
<template>
  <div class="report-card-slider">
    <button class="arrow-button prev" @click="prevSlide" :disabled="currentIndex === 0">
      <a-icon type="left-circle" theme="twoTone" :style="{ fontSize: '18px' }" />
    </button>
    <div class="slider-container" ref="slider" v-if="cards.length">
      <div class="card-wrapper" :style="{ transform: `translateX(-${currentIndex * cardWidth}px)` }">
        <div class="report-card" v-for="(card, index) in cards" :key="index">
          <div style="width: 100%">
            <img style="width: 100%" src="@/assets/images/report-bg.png" alt="dark" />
          </div>
          <h3>{{ card.reportName }}</h3>
        </div>
      </div>
    </div>
    <button class="arrow-button next" @click="nextSlide" :disabled="currentIndex === cards.length - 1">
      <a-icon type="right-circle" theme="twoTone" :style="{ fontSize: '18px' }" />
    </button>
  </div>
</template>

<script>
export default {
  name: 'ReportCardSlider',
  props: {
    cards: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      currentIndex: 0,
    }
  },
  computed: {
    cardWidth() {
      if (this.$refs.slider) {
        return this.$refs.slider.querySelector('.report-card').offsetWidth || 0
      } else {
        return 0
      }
    },
  },
  methods: {
    prevSlide() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },
    nextSlide() {
      if (this.currentIndex < this.cards.length - 1) {
        this.currentIndex++
      }
      if (this.currentIndex == this.cards.length - 3) {
        // 请求下一页？
        this.$emit('getNextPage')
      }
    },
  },
}
</script>

<style lang="less" scoped>
.report-card-slider {
  padding: 0 30px;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.arrow-button {
  position: absolute;
  top: 50%;
  background-color: transparent;
  transform: translateY(-50%);
  border: none;
  cursor: pointer;
  z-index: 10;
}

.prev {
  left: 0;
}

.next {
  right: 0;
}

.slider-container {
  width: 100%;
  overflow: hidden;
}

.card-wrapper {
  display: flex;
  transition: transform 0.3s ease;
}

.report-card {
  width: 188px;
  margin: 10px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  overflow-wrap: break-word;
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19);
  }
}
</style>