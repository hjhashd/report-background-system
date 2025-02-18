<!--
 * @Author: bekon
 * @Date: 2025-02-18 17:57:40
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-18 18:25:01
 * @FilePath: /report-background-system/src/components/ReportCardSlider/ReportCardSlider.vue
 * @Description: 
 * 
-->
<template>
  <div class="report-card-slider">
    <button class="arrow-button prev" @click="prevSlide" :disabled="currentIndex === 0">
      <a-icon type="left-circle" theme="twoTone" :style="{fontSize: '18px'}"/>
    </button>
    <div class="slider-container" ref="slider">
      <div class="card-wrapper" :style="{ transform: `translateX(-${currentIndex * cardWidth}px)` }">
        <div class="report-card" v-for="(card, index) in cards" :key="index">
          <!-- 这里可以根据实际需求修改卡片内容 -->
          <h3>{{ card.title }}</h3>
          <p>{{ card.description }}</p>
        </div>
      </div>
    </div>
    <button class="arrow-button next" @click="nextSlide" :disabled="currentIndex === cards.length - 1">
      <a-icon type="right-circle" theme="twoTone" :style="{fontSize: '18px'}"/>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ReportCardSlider',
  props: {
    cards: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentIndex: 0,
      cardWidth: 0
    };
  },
  mounted() {
    this.cardWidth = this.$refs.slider.querySelector('.report-card').offsetWidth;
  },
  methods: {
    prevSlide() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },
    nextSlide() {
      if (this.currentIndex < this.cards.length - 1) {
        this.currentIndex++;
      }
    }
  }
};
</script>

<style scoped>
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
  min-width: 300px;
  margin-right: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>