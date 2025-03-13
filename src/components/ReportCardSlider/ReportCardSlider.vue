<!--
 * @Author: bekon
 * @Date: 2025-02-18 17:57:40
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-13 10:47:40
 * @FilePath: /report-background-system/src/components/ReportCardSlider/ReportCardSlider.vue
 * @Description: 
 * 
-->
<template>
  <a-spin :spinning="loading">
    <empty v-if="!cards.length"></empty>
    <div class="report-card-slider" v-else>
      <button class="arrow-button prev" @click="prevSlide" :disabled="currentIndex === 0">
        <a-icon type="left-circle" theme="twoTone" :style="{ fontSize: '18px' }" />
      </button>
      <div class="slider-container" ref="slider" v-if="cards.length">
        <div class="card-wrapper" :style="{ transform: `translateX(-${currentIndex * cardWidth}px)` }">
          <div class="card-wrapper">
            <div class="report-card" v-for="(card, index) in cards" :key="index" @click="toReportDetail(card)">
              <img style="width: 100%" src="@/assets/images/report-bg.png" alt="dark" />
              <h3 class="line2">{{ card.reportName }}</h3>
            </div>
          </div>
        </div>
      </div>
      <button class="arrow-button next" @click="nextSlide" :disabled="currentIndex === cards.length - 1">
        <a-icon type="right-circle" theme="twoTone" :style="{ fontSize: '18px' }" />
      </button>
    </div>
  </a-spin>
</template>

<script>
import { Empty } from 'ant-design-vue'
export default {
  name: 'ReportCardSlider',
  components: { Empty },
  props: {
    cards: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentIndex: 0,
      cardWidth: 188,
    }
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
    toReportDetail(item) {
      const { $router } = this
      $router.push({ path: `/homePage/viewReport/` + item.id })
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
  box-sizing: border-box;
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19);
  }
}
.line2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>