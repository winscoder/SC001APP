<template>
  <view class="container">
    <!-- navbar -->
    <uni-nav-bar dark title="Product tutorial" fixed backgroundColor="rgba(17, 17, 17, 1)" statusBar :border="false">
      <template #left>
        <view class="close" @click="handleBack">
          <image src="@/static/img/connect_device_back.png" mode=""></image>
        </view>
      </template>
    </uni-nav-bar>

    <!-- 标签页区域 -->
    <view class="select">
      <view :class="['control', activeSelect === 'control' ? 'active' : '']" @click="handleChangeSelect('control')">
        Controller</view>
      <view :class="['task', activeSelect === 'task' ? 'active' : '']" @click="handleChangeSelect('task')">Task</view>
    </view>

    <scroll-view scroll-y="true" :style="{height: windowHeight - 98 + 'rpx'}">
      <!-- control教程区域 -->
      <control-product-tutorial v-show="activeSelect === 'control'" :data="couresList[0]"></control-product-tutorial>

      <!-- task教程区域 -->
      <task-product-tutorial v-show="activeSelect === 'task'" :data="couresList[1]"></task-product-tutorial>
    </scroll-view>

  </view>
</template>

<script>
  import {
    getCourse
  } from "@/service/device.js"
  import {
    mapState
  } from "vuex";

  export default {
    data() {
      return {
        activeSelect: "control",
        deviceId: '',
        windowHeight: 0,
        controlInfo: {},
        taskInfo: {},
        couresList: [],
        webviewStyles: {
          // width: "375px",
          height: "650px"
        }
      };
    },
    onLoad() {
      const system = uni.getSystemInfoSync()
      this.windowHeight = (750 / system.windowWidth) * (system.windowHeight - system.statusBarHeight - 44)
      this.handleGetCourse()
    },
    computed: {
      ...mapState(['uuid', 'platform'])
    },
    methods: {
      handleBack() {
        uni.reLaunch({
          url: "/subpkg/device/device"
        })
      },
      // 处理标签页的切换
      handleChangeSelect(text) {
        this.activeSelect = text
      },
      // 获取教程
      async handleGetCourse() {
        const params = {
          device_id: this.uuid,
          system: this.platform,
          type: 2
        }
        const {
          data
        } = await getCourse(params)
        console.log('教程', data);
        this.couresList = data.page_list
      },
    }
  }
</script>

<style lang="scss" scoped>
  .container {
    .close {
      width: 19rpx;
      height: 33rpx;
      margin-left: 30rpx;

      image {
        width: 100%;
        height: 100%;
      }
    }

    .select {
      height: 98rpx;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      font-size: 32rpx;
      color: #C7C7C7;
      // position: fixed;
      background: rgba(17, 17, 17, 1);
      // top: 88rpx + 88rpx;
      z-index: 999;
    }

    .control,
    .task {
      width: 375rpx;
      height: 98rpx;
      border-bottom: 3rpx solid #222222;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .active {
      border-bottom: 3rpx solid #FF8616;
      color: #FF8616;
    }

    .web-view {
      height: calc(100vh - 88rpx - 98rpx - 20rpx);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      
      .btn {
        margin-top: 100rpx;
        padding-bottom: 48rpx;
        display: flex;
        justify-content: center;

        uni-button {
          width: 650rpx;
          height: 86rpx;
          background: #FF8616;
        }
      }
    }

  }
</style>