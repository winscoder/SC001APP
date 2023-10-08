<template>
  <view class="tabbar">
    <template v-for="(item, index) in tabbarData">
      <view class="item" :key="item.name" @click="handleChangeIndex(index)">
        <image :src="index === currentIndex ? item.active_icon : item.icon" mode=""></image>
        <view style="margin-top: 14rpx;" v-if="(index === 2 && JSON.stringify(uploadInfo) !== '{}') || (index === 3 && JSON.stringify(updataInfo) !== '{}')">
          <uni-badge size="small" text=" " :is-dot="true" absolute="rightTop" type="error">
            {{item.name}}
          </uni-badge>
        </view>
        <view style="margin-top: 14rpx;" v-else>
          {{item.name}}
        </view>
      </view>
    </template>
  </view>
</template>

<script>
  import { tabbarData } from "@/static/local-data.js"
  import { mapState } from "vuex"
  
  export default {
    name:"tabbar",
    data() {
      return {
        tabbarData,
        // 当前活跃index
        currentIndex: 0,
      };
    },
    computed: {
      ...mapState(['updataInfo', 'uploadInfo'])
    },
    methods: {
      handleChangeIndex(i) {
        this.currentIndex = i
        this.$emit("handleChangeIndex", i)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .tabbar {
    height: 211rpx;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    // margin-top: 38rpx;
    box-sizing: border-box;
    
    .item {
      width: 130rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: rgba(255, 255, 255, 1);
      font-size: 30rpx;
      
       image {
         width: 120rpx;
         height: 120rpx;
       }
    }
  }
</style>