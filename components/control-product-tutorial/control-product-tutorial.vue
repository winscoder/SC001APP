<template>
  <view class="container">
    <view class="tutorial">
        <image v-if="JSON.stringify(data) === '{}' || !data" src="@/static/img/tutorial/product_controller_bg.png" mode="aspectFit"></image>
        <image v-else :src="data.content_url" mode="aspectFit"></image>
    </view>

    <view class="btn" @click="handleGoToConnect">
      <button>Got it</button>
    </view>
  </view>
</template>

<script>
  export default {
    name: "control-product-tutorial",
    props: {
      data: {
        type: Object,
        default: () => {}
      }
    },
    mounted() {
      setTimeout(() => {
        console.log('12122212', this.data);
      }, 3000)
    },
    data() {
      return {

      };
    },
    methods: {
      handleGoToConnect() {
        uni.redirectTo({
          url: `/subpkg/device/device?type=1`
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .container {
    margin-top: 60rpx;

    .tutorial {
      width: 670rpx;
      height: 1550rpx;
      margin: 0 40rpx;

      image {
        width: 100%;
        height: 100%;
      }
    }

    .btn {
      margin-top: 100rpx;
      padding-bottom: 48rpx;

      uni-button {
        width: 650rpx;
        height: 86rpx;
        background: #FF8616;
      }
    }
  }
</style>