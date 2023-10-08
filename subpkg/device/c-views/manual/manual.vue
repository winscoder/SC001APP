<template>
  <view class="container">
    <uni-nav-bar dark title="User Manual" fixed backgroundColor="rgba(17, 17, 17, 1)" statusBar :border="false">
      <template #left>
        <view class="close" @click="handleBack">
          <image src="@/static/img/connect_device_back.png" mode=""></image>
        </view>
      </template>
    </uni-nav-bar>

    <!-- <view class="search">
      <view class="inp">
        <input class="uni-input" />
      </view>
      <view class="icon">
        <image src="@/static/img/device/support/search.png" mode=""></image>
      </view>
    </view> -->

    <scroll-view scroll-y="true" :style="{height: windowHeight - 90 + 'rpx'}">
      <view class="list" v-for="(item, index) in couresList">
        <view class="statement" :key="index" @click="handelGoToTutorialDetail(item)">
          <view class="item">
            <view>
              <text>{{item.page_title}}</text>
            </view>
            <view class="icon">
              <image src="@/static/img/device/about/support_right.png" mode=""></image>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
  import {
    mapMutations,
    mapActions,
    mapState
  } from "vuex"
  
  import {
    getCourse
  } from "@/service/device.js"

  export default {
    data() {
      return {
        windowHeight: 0,
        couresList: []
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
        uni.navigateBack()
      },
      handelGoToTutorialDetail(item) {
        uni.navigateTo({
          url: `/subpkg/device/c-views/manual/detail/detail?data=${JSON.stringify(item)}`,
        })
      },
      // 获取教程
      async handleGetCourse() {
        const params = {
          device_id: this.uuid,
          system: this.platform,
          type: 1
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
    padding: 0 30rpx;

    .close {
      width: 19rpx;
      height: 33rpx;
      margin-left: 30rpx;

      image {
        width: 100%;
        height: 100%;
      }
    }

    .search {
      width: 650rpx;
      height: 90rpx;
      background: #222222;
      border-radius: 15rpx 15rpx 15rpx 15rpx;
      margin-top: 30rpx;
      margin: 0 20rpx;
      padding: 0 39rpx;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .inp {
        color: #FFF;
        font-family: "DIN Medium";
      }

      .icon {
        width: 40.5rpx;
        height: 40.5rpx;

        image {
          width: 100%;
          height: 100%;
        }
      }
    }

    .statement {
      height: 125rpx;
      border-bottom: 2rpx solid rgba(34, 34, 34, 1);
      padding: 40rpx 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: space-between;
      color: #FFF;
      font-size: 36rpx;

      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .icon {
        width: 18rpx;
        height: 27rpx;
        display: flex;
        align-items: center;

        image {
          width: 100%;
          height: 100%;
        }
      }
    }

    .statement:last-child {
      border: none;
    }
  }
</style>