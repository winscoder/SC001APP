<template>
  <view class="container">
    <uni-nav-bar dark title="Connect  to help" fixed backgroundColor="rgba(17, 17, 17, 1)" statusBar :border="false">
      <template #left>
        <view class="close" @click="handleBack">
          <image src="@/static/img/connect/help/connect_help_close.png" mode=""></image>
        </view>
      </template>
    </uni-nav-bar>

    <view class="help">
      <view class="step">
        <image src="@/static/img/connect/help/yi.png" mode=""></image>
        <view class="text">
          <span @click="handleGoToAppPermissionSetting">Location access </span> {{' '}} is needed for certain phones.
        </view>
      </view>
      <template v-for="item in helpData">
        <view :key="item.text" class="step">
          <image :src="item.url" mode=""></image>
          <view class="text">
            {{item.text}}
          </view>
        </view>
      </template>

      <view class="btn" @click="handleBack">
        <button>
          Got it
        </button>
      </view>
    </view>
  </view>
</template>

<script>
  import permission from '@/js_sdk/wa-permission/permission.js'

  import {
    helpData
  } from '@/static/local-data.js'

  export default {
    data() {
      return {
        helpData
      };
    },
    methods: {
      handleBack() {
        uni.navigateBack()
      },
      // 处理跳转到设置页面
      handleGoToAppPermissionSetting() {
        permission.gotoAppPermissionSetting()
      }
    }
  }
</script>

<style lang="scss" scoped>
  .container {

    .close {
      width: 70rpx;
      height: 70rpx;

      image {
        width: 100%;
        height: 100%;
      }
    }

    .help {
      width: 670rpx;
      height: 896rpx;
      background: #222222;
      border-radius: 30rpx 30rpx 30rpx 30rpx;
      opacity: 1;
      padding: 0 40rpx;
      padding-top: 52rpx;
      padding-bottom: 80rpx;
      box-sizing: border-box;
      margin: 50rpx 40rpx 0 40rpx;

      .step {
        width: 590rpx;
        height: 158rpx;
        border-bottom: 1rpx solid rgba(49, 49, 49, 1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: rgba(227, 227, 227, 1);
        font-size: 32rpx;

        .text {
          width: 467rpx;

          span {
            color: #ff8616;
            text-decoration: underline;
          }
        }

        image {
          width: 48rpx;
          height: 48rpx;
        }
      }

      .btn {
        uni-button {
          width: 272rpx !important;
          height: 86rpx;
          margin-top: 80rpx;
          opacity: 1;
          color: rgba(17, 17, 17, 1);
          font-size: 36rpx;
        }
      }
    }
  }
</style>
