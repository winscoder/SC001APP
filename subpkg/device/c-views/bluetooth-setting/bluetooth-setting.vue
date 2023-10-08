<template>
  <view class="container">
    <uni-nav-bar dark title="Bluetooth Setting" fixed backgroundColor="rgba(17, 17, 17, 1)" statusBar :border="false">
      <template #left>
        <view class="close" @click="handleBack">
          <image src="@/static/img/connect_device_back.png" mode=""></image>
        </view>
      </template>
    </uni-nav-bar>

    <view class="robot-list">
      <view class="item">
        <view class="info">
          <image src="@/static/img/connect/looking-for-device/device_robot_check.png" />
          <view class="msg">
            <text>{{mapDevName}}</text>
            <span v-show="linkStatus === 'notLink'">Diseonnected</span>
            <span v-show="linkStatus === 'await'">Connecting</span>
            <span v-show="linkStatus === 'success'">Connected</span>
          </view>
        </view>
        <view class="connect">
          <button @click="handleConnectClcik" v-if="linkStatus === 'notLink'">Connect</button>
          <button @click="handleConnectClcik" v-else-if="linkStatus === 'success'">Disconnect</button>
          <view class="load" v-else="linkStatus === 'await'">
            <image src="@/static/img/device/about/load.png" mode=""></image>
          </view>
        </view>
      </view>
    </view>

    <view class="search">
      <button @click="handleSearchMore" v-if="linkStatus === 'notLink'">Search More</button>
      <button @click="handleBettereEuipment" v-else>Other device</button>
    </view>


    <!-- 弹出层区域 -->
    <uni-popup ref="popup" type="bottom" :is-mask-click="false">
      <view class="popup" :style="{'padding-bottom': safeAreaHeight + 'px'}">
        <view class="title">
          {{popupTitle}}
        </view>
        <view class="msg">
          {{popupContent}}
        </view>
        <button @click="handlePopupConfirm">
          Confirm
        </button>
        <button class="cancel" @click="handlePopupCancel">
          Cancel
        </button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
  import {
    handleOpenBluetooth,
    startBluetoothDevicesDiscovery
  } from "@/utils/initBluetooth.js"
  import {
    mapMutations
  } from "vuex";

  import {
    mapState
  } from "vuex";

  export default {
    data() {
      return {
        popupContent: "",
        popupTitle: "",
        safeAreaHeight: 0
      };
    },
    onLoad() {
      const system = uni.getSystemInfoSync()
      this.safeAreaHeight = system.safeAreaInsets.bottom
    },
    onHide() {
      console.log(this.stateText);
    },
    computed: {
      ...mapState(['linkStatus', 'device', 'stateText', 'deviceInfo']),
      mapDevName() {
        return this.deviceInfo.dev_name ? this.deviceInfo.dev_name : uni.getStorageSync('dev_name')
      }
    },
    methods: {
      ...mapMutations(['handleChangeLinkStatus', 'handleChangeStateText', 'hadnleSaveDevice', 'handleInitDevices']),

      handleBack() {
        uni.navigateBack()
      },
      // 处理点击连接/断开连接
      handleConnectClcik() {
        if (this.linkStatus === "notLink") {
          this.hadnleSaveDevice({})
          handleOpenBluetooth()
          this.handleChangeLinkStatus('await')
          setTimeout(() => {
            if (JSON.stringify(this.device) === "{}") {
              this.handleChangeLinkStatus('notLink')
            }
          }, 10000)
        } else {
          console.log(111);
          uni.closeBluetoothAdapter({
            complete: res => {
              // this.$refs.popup.close()
              this.handleChangeLinkStatus('notLink')
              this.handleChangeStateText("Bluetooth disconnected")
              this.hadnleSaveDevice({})
              this.handleInitDevices()
            }
          })
        }
      },
      // 点击搜索设备
      handleSearchMore() {
        // console.log(this.$store.state.linkStatus);
        uni.closeBluetoothAdapter({
          complete: res => {
            this.$refs.popup.close()
            this.handleChangeLinkStatus('notLink')
            this.handleChangeStateText("Bluetooth disconnected")
            this.hadnleSaveDevice({})
            this.handleInitDevices()
            uni.navigateTo({
              url: "/subpkg/looking-for-device/looking-for-device"
            })
          }
        })
      },
      // 处理点击更好的设备
      handleBettereEuipment() {
        if (this.linkStatus === 'await') return
        this.popupContent = "Current connection may be disconnected."
        this.popupTitle = "Search other device"
        this.$refs.popup.open('bottom')
      },
      // 处理弹框的确定点击
      handlePopupConfirm() {
        // 判断断开连接/搜索更多设备
        uni.closeBluetoothAdapter({
          complete: res => {
            this.$refs.popup.close()
            this.handleChangeLinkStatus('notLink')
            this.handleChangeStateText("Bluetooth disconnected")
            this.hadnleSaveDevice({})
            this.handleInitDevices()
            uni.navigateTo({
              url: "/subpkg/looking-for-device/looking-for-device"
            })
          }
        })

      },
      // 处理弹框的取消点击
      handlePopupCancel() {
        this.$refs.popup.close()
      }


    },

  }
</script>

<style lang="scss" scoped>
  .container {
    height: 100vh;
    padding: 0 30rpx;
    box-sizing: border-box;
    position: relative;

    .close {
      width: 19rpx;
      height: 33rpx;
      // margin-left: 30rpx;

      image {
        width: 100%;
        height: 100%;
      }
    }

    .robot-list {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;

      .item {
        width: 100%;
        height: 82.02rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 35rpx;

        .info {
          display: flex;
          justify-content: flex-start;

          .msg {
            margin-left: 40rpx;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            text {
              width: 330rpx;
              color: #FFF;
              font-size: 32rpx;
              font-family: "DIN Regular";
              overflow: hidden;
              text-overflow: ellipsis;
            }

            span {
              color: rgba(136, 136, 136, 1);
              font-size: 32rpx;
              font-family: "DIN Regular";
            }
          }

          image {
            width: 80rpx;
            height: 82.02rpx;
          }
        }

        .connect {
          uni-button {
            // width: 173rpx;
            height: 66rpx;
            border-radius: 15rpx 15rpx 15rpx 15rpx;
            opacity: 1;
            border: 1rpx solid #FF8616;
            background: rgba(17, 17, 17, 1);
            display: flex;
            justify-content: center;
            align-items: center;
            color: #FF8616;
          }
        }

        .load {
          font-size: 36rpx;
          margin-right: 20rpx;
          color: #FF8616;

          image {
            width: 47rpx;
            height: 47rpx;
            animation: myRptate 2s linear infinite;
          }

          @keyframes myRptate {
            0% {
              transform: rotate(0);
            }

            100% {
              transform: rotate(360deg);
            }
          }
        }

      }
    }

    .search {
      position: absolute;
      left: 50rpx;
      bottom: 154rpx;

      uni-button {
        width: 650rpx;
        height: 86rpx;
        background: #FF8616;
        border-radius: 15rpx 15rpx 15rpx 15rpx;
        opacity: 1;
      }
    }

    .popup {
      width: 750rpx;
      height: 543rpx;
      background: #222222;
      border-radius: 0rpx 0rpx 0rpx 0rpx;
      opacity: 1;
      padding: 0 50rpx;
      padding-top: 60rpx;
      box-sizing: border-box;

      .title {
        margin-bottom: 29rpx;
        font-size: 36rpx;
        font-family: "Corbel";
        font-weight: bold;
        color: #FFFFFF;
      }

      .msg {
        font-size: 32rpx;
        font-family: "Corbel";
        color: #888888;
        margin-bottom: 80rpx;


      }

      uni-button {
        width: 650rpx;
        height: 86rpx;
        background: #FF8616;
        font-size: 36rpx;
      }

      .cancel {
        margin-top: 30rpx;
        width: 650rpx;
        height: 86rpx;
        background: rgba(34, 34, 34, 1);
        border: 1rpx solid #FF8616;
        color: #FF8616;
      }
    }
  }
</style>