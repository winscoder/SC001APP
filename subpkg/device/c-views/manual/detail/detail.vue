<template>
  <view class="container">
    <!-- <uni-nav-bar dark :title="`Tutorial`" fixed backgroundColor="rgba(17, 17, 17, 1)" statusBar :border="false">
      <template #left>
        <view class="close" @click="handleBack">
          <image src="@/static/img/connect_device_back.png" mode=""></image>
        </view>
      </template>
    </uni-nav-bar> -->
    
    <web-view :src="data.content_url"></web-view>
    
  </view>
</template>

<script>
  export default {
    data() {
      return {
        data: ""
      };
    },
    onLoad(options) {
      this.data = JSON.parse(options.data)
      console.log(this.data);
      setTimeout(() => {
        uni.setNavigationBarTitle({
          title: this.data.page_title
        })
      }, 200)
    },
    methods: {
      handleBack() {
        uni.navigateBack()
      },
    }
  }
</script>

<style>
  
</style>

<style lang="scss" scoped>
.container {
  padding: 0 30rpx;
  
  /deep/ .uni-nav-bar-text {
    font-size: 36rpx !important;
    font-family: "DIN Regular" !important;
  }
  
  .close {
    width: 19rpx;
    height: 33rpx;
    margin-left: 30rpx;
  
    image {
      width: 100%;
      height: 100%;
    }
  }
  
  .msg {
    margin-bottom: 60rpx;
    color: #C7C7C7;
    font-size: 26rpx;
    font-family: "DIN Regular";
  }
}
</style>
