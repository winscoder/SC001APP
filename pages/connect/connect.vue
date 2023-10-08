<template>
  <view class="container">
    <!-- ±³¾°Í¼ -->
    <view class="bac">
      <image src="@/static/img/connect/activate_robot_img.png" mode=""></image>
    </view>
    
    <view class="add">
      <image src="../../static/img/connect/activate_add_device.png" mode="" @click="handleGotoAdd"></image>
      <text>Connecting Device</text>
    </view>
    
    <view class="help" @click="handleGoToHelp">
      Help
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        
      };
    },
    async created() {
      const system = await uni.getSystemInfoSync()
      uni.setStorageSync("statusBarHeight", JSON.stringify(system.statusBarHeight))
    },
    methods: {
      handleGoToHelp() {
        uni.navigateTo({
          url: "/pages/help/help"
        })
      },
      handleGotoAdd () {
        uni.navigateTo({
          url: "/subpkg/looking-for-device/looking-for-device"
          // url: "/pages/demo/demo"
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .container {
    
    .bac {
      position: fixed;
      top: 21.49%;
      left: 156rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      
      image {
        width: 440rpx;
        height: 404.54rpx;
      }
    }
    
    .add {
      position: fixed;
      top: 59.42%;
      left: 247rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: "Corbelb";
      font-size: 32rpx;
      color: #FFF;
      
      image {
        width: 84rpx;
        height: 84rpx;
      }
      
      text {
        margin-top: 30rpx;
      }
    }
    
    .help {
      color: rgba(255, 134, 22, 1);
      font-family: "Corbelb";
      font-size: 28rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      // margin-top: 227rpx;
      position: fixed;
      bottom: 7.75%;
      left: 50%;
      transform: translateX(-50%);
      text-decoration: underline;
    }
  }
</style>
