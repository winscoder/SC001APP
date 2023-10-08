<template>
  <view class="about">
    <view class="set" @click="handleGoToBTSetting">
      <view>Bluetooh Setting</view>
      <view class="icon">
        <image src="@/static/img/device/about/support_right.png" />
      </view>
    </view>

    <!-- <view class="statement">
      <view class="title">Legal Statement</view>
      <view class="item">
        <text>Terms of Use</text>
        <view class="icon">
          <image src="@/static/img/device/about/support_right.png" mode=""></image>
        </view>
      </view>
      <view class="item">
        <text>Third Party License Agreement</text>
        <view class="icon">
          <image src="@/static/img/device/about/support_right.png" mode=""></image>
        </view>
      </view>
      <view class="item">
        <text>Privacy Policy</text>
        <view class="icon">
          <image src="@/static/img/device/about/support_right.png" mode=""></image>
        </view>
      </view>
    </view> -->

    <view class="product">
      <view class="title">About Product</view>
      <view class="version" @click="handleUpdataClick">
        <uni-badge size="small" text=" " :is-dot="true" absolute="rightTop" type="error"
          v-if="JSON.stringify(updataInfo) !== '{}'">
          <text>Software Version</text>
        </uni-badge>
        <text v-else>Software Version</text>
        <view>
          <view class="title" v-if="!isUpdataPlan">{{'V ' + version}}</view>
          <view class="title" v-else>{{updataPlan}}%</view>
        </view>
      </view>
    </view>
    <progress :percent="updataPlan" stroke-width="4" backgroundColor="#111111" activeColor="rgba(255, 134, 22, 1)"
      v-if="isUpdataPlan" />
  </view>
</template>

<script>
  import {
    stateFeedback
  } from "@/utils/state_feedback.js"
  import {
    mapState,
    mapMutations
  } from "vuex";

  export default {
    name: "about",
    data() {
      return {};
    },
    computed: {
      ...mapState(['version', "updataInfo", 'isUpdataPlan', 'updataPlan'])
    },
    methods: {
      ...mapMutations(['handleShowAppPlan', 'handleUpdateAppPlan']),

      handleGoToBTSetting() {
        uni.navigateTo({
          url: "/subpkg/device/c-views/bluetooth-setting/bluetooth-setting"
        })
      },
      // 处理更新的点击
      handleUpdataClick() {
        if (JSON.stringify(this.updataInfo) === "{}") return
        console.log(this.updataInfo);
        const platform = uni.getSystemInfoSync().platform;
        if (platform !== 'ios') {
          const url = this.updataInfo.file_url
          var dtask = plus.downloader.createDownload(url, {
            timeout: 10,
            retry: 1,
            retryInterval: 5
          }, (d, status) => {
            // 下载完成
            if (status == 200) {
              //安卓安装
              plus.runtime.install(plus.io.convertLocalFileSystemURL(d.filename), {}, {}, function(error) {
                uni.showToast({
                  title: 'fail to install',
                  mask: false,
                  duration: 1500
                });
              });
            } else {
              plus.downloader.clear();
              uni.showToast({
                title: 'Update failure',
                mask: false,
                duration: 1500
              });
            }
            this.handleShowAppPlan(false)
          });
          this.onProgress(dtask)
          dtask.start(); //执行下载
          this.handleShowAppPlan(true)
        } else {
          // 跳转苹果商城
          let appleId = ''; //appid	iOS可在appstore分享给好友，复制获取下载链接
          plus.runtime.launchApplication({
              action: this.updataInfo.file_url
            },
            (e) => {
              console.log(e.message);
            }
          );
        }
      },
      // 监听下载进度
      onProgress(task) {
        task.addEventListener('statechanged', e => {
          if (e && e.downloadedSize > 0) {
            const progress = ((e.downloadedSize / e.totalSize) * 100).toFixed(2)
            this.handleUpdateAppPlan(progress)
          }
        }, false)
      }
    }
  }
</script>

<style lang="scss" scoped>
  uni-input {
    width: 100%;
    height: 90rpx;
    background-color: #FFF;
    color: #000;
  }

  .about {
    font-size: 36rpx;
    color: rgba(255, 255, 255, 1);

    .set {
      height: 84rpx;
      margin-top: 108rpx;
      margin-bottom: 10rpx;
      border-bottom: 2rpx solid rgba(34, 34, 34, 1);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .statement {
      height: 378rpx;
      border-bottom: 2rpx solid rgba(34, 34, 34, 1);
      padding: 40rpx 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: space-between;


      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .product {
      height: 160rpx;
      padding-top: 51rpx;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: space-between;
      margin-bottom: 20rpx;

      .version {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
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

    .title {
      color: rgba(255, 134, 22, 1);
      font-size: 28rpx;
      font-family: "DIN Regular";
    }
  }
</style>