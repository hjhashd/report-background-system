<!--
 * @Author: bekon
 * @Date: 2025-02-18 15:24:27
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-26 20:56:40
 * @FilePath: /report-background-system/src/components/Charts/EChartsComponent.vue
 * @Description: 
 * 
-->
<template>
  <div ref="chartRef" style="width: 100%; height: 256px"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'EChartsComponent',
  props: {
    // 接收 ECharts 的配置项
    options: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      chart: null,
    }
  },
  mounted() {
    this.initChart()
  },
  watch: {
    options: {
      deep: true,
      handler(newData) {
        // 数据更新时更新图表
        this.chart.setOption(this.options)
      },
    },
  },
  methods: {
    initChart() {
      // 初始化 ECharts 实例
      this.chart = echarts.init(this.$refs.chartRef)
      // 设置图表配置项
      this.chart.setOption(this.options)

      // 监听窗口大小变化，自适应图表大小
      window.addEventListener('resize', this.resizeChart)
    },
    resizeChart() {
      if (this.chart) {
        this.chart.resize()
      }
    },
  },
  beforeDestroy() {
    // 移除窗口大小变化监听事件
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) {
      // 销毁 ECharts 实例
      this.chart.dispose()
    }
  },
}
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>