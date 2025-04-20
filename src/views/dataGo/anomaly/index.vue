<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-04-20 17:46:40
 * @FilePath: \report-background-system\src\views\dataGo\anomaly\index.vue
 * @Description: 
 * 
-->
<template>
  <page-header-wrapper>
    <anomaly-content></anomaly-content>
  </page-header-wrapper>
</template>

<script>
import AnomalyContent from './innerContent.vue'
export default {
  components: { AnomalyContent },
}
</script>
