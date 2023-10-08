<template>
  <view class="container">
    <uni-nav-bar dark title="" fixed backgroundColor="rgba(17, 17, 17, 1)" statusBar :border="false">
      <template #left>
        <view class="close" @click="handleBack">
          <image src="@/static/img/connect/help/connect_help_close.png" mode=""></image>
        </view>
      </template>
    </uni-nav-bar>

    <view class="title">
      <view style="color: #FFF; font-size: 46rpx; margin-bottom: 20rpx;">
        <text v-if="noSreach">Searching for Device</text>
        <text v-else>Cannot find your device?</text>
      </view>
      <view style="color: rgba(136, 136, 136, 1); font-size: 32rpx; width: 500rpx; text-align: center;">
        <text v-if="noSreach">Ensure that the device is powered on</text>
        <text v-else>If you cannot find it after several attempts, please contact us.</text>
      </view>
    </view>

    <view class="logo" v-if="noSreach">
      <!-- 搜索设备区域 -->
      <view class="device">
        <view class="bac">
          <image src="@/static/img/connect/looking-for-device/search_device_ble_bg.png" mode=""></image>
        </view>
        <view class="bluetooth">
          <image src="@/static/img/connect/looking-for-device/connect_device_ble.png" mode=""></image>
        </view>
        <view :class="isShowAmin ? 'active-amin' : 'amin'">
          <image src="@/static/img/connect/looking-for-device/search_device_ble_anim.png" mode=""></image>
        </view>
      </view>

      <!-- 蓝牙设备区域 -->
      <!-- <template v-for="(item, index) in 2">
        <view class="robot" :key="item" :style="{
          'transform': `rotate(${72 * (item - 1)}deg)`,
          'transformOrigin': '72rpx 329rpx',
        }">
          <view class="icon">
            <image src="@/static/img/connect/looking-for-device/device_robot_check.png" mode=""></image>
          </view>
          <text class="name">
            Device name
          </text>
        </view>
      </template> -->

      <view v-if="noSreach">
        <template v-for="(item, index) in devices">
          <view :class="['robot', index === currentIndex ? 'active' : '']" :key="item.deviceId"
            :style="{
            'top': 
              `${ index === 0 ? '0' : (index === 1 ? '150rpx' : (index === 2 ? '440rpx' : (index === 3 ? '440rpx' : '150rpx'))) }`,
            'left': 
              `${ index === 0 ? '50%' : (index === 1 ? '490rpx' : (index === 2 ? '430rpx' : (index === 3 ? '80rpx' : '20rpx'))) }`}" @click="handleDeviceClick(index)" v-if="index <= 4">
            <view class="icon">
              <image :src="index === currentIndex ? deviceActive.icon : deviceDead.icon" mode=""></image>
            </view>
            <text class="name">
              {{item.name}}
            </text>
          </view>
        </template>
      </view>
    </view>

    <!-- 未搜索到设备区域 -->
    <view class="no-device" v-if="!noSreach">
      <image src="@/static/img/connect/looking-for-device/ic_device_search_fail.png" mode=""></image>
    </view>

    <view class="btns">
      <view class="connect" v-if="noSreach">
        <button type="default" @click="handleConnectDevice">Connection</button>
      </view>
      <view class="search-again" v-else>
        <button type="default" @click="startBluetoothDevicesDiscovery">Search again</button>
        <view class="help" @click="handleGoToHelp">
          Help
        </view>
      </view>
    </view>

    <!-- 弹出层区域 -->
    <uni-popup ref="popup" type="bottom" :is-mask-click="false">
      <view class="popup">
        <view class="popup-label"><text>Turn on Bluetooth</text></view>
        <view class="msg">
          For connecting device, please turn on Bluetooth in OS Settings.
        </view>
        <button @click="handleClosePopup">
          Set Bluetooth
        </button>
      </view>
    </uni-popup>
  </view>
</template>


<script>
  import {
    mapState,
    mapMutations
  } from 'vuex';
  import permission from '@/js_sdk/wa-permission/permission.js'

  import {
    getBLEDeviceServices,
    writeBLECharacteristicValue,
    onBLEConnectionStateChange
  } from "@/utils/initBluetooth.js"
  import {
    stateFeedback
  } from "@/utils/state_feedback.js"

  export default {
    data() {
      return {
        // 当前选设备
        currentIndex: 0,
        // 当前点击的设备
        deviceActive: {
          bac: require("@/static/img/connect/looking-for-device/device_robot_bg_check.png"),
          icon: require("@/static/img/connect/looking-for-device/device_robot_check.png")
        },
        // 不活跃的设备
        deviceDead: {
          bac: require("@/static/img/connect/looking-for-device/device_robot_bg_normal.png"),
          icon: require("@/static/img/connect/looking-for-device/device_robot_normal.png")
        },
        // 是否搜索到设备
        isSearchDevice: true,
        // 激活的设备
        contactDevices: [],
        isShowAmin: false,
        timer: null
      };
    },
    onLoad() {

    },
    onShow() {
      // this.handleOpenBluetooth()
    },
    computed: {
      ...mapState(['devices', 'noSreach'])
    },
    methods: {
      ...mapMutations(['handleFillterBluetoothDevice', 'handleConnectionFail', 'handleSaveDeviceId',
        'handleChangeLinkStatus', 'hadnleSaveDevice', 'handleNoSreachDevice', 'handleInitDevices'
      ]),

      // 处理初始化蓝牙
      handleOpenBluetooth() {
        uni.openBluetoothAdapter({
          success: (res) => {
            console.log(res);
            this.startBluetoothDevicesDiscovery()
          },
          fail: (err) => {
            console.log(err);
            this.$refs.popup.open('bottom')
          }
        })
      },

      // 开始搜寻附近的蓝牙外围设备
      startBluetoothDevicesDiscovery() {
        console.log('开始搜寻附近的蓝牙设备');
        uni.startBluetoothDevicesDiscovery({
          allowDuplicatesKey: false,
          success: res => {
            console.log('搜寻附近的蓝牙外围设备 startBluetoothDevicesDiscovery success111', res);
            // 监听寻找到新设备的事件
            this.onBluetoothDeviceFound();
            this.isShowAmin = true
          },
          fail: res => {
            console.log('搜寻附近的蓝牙外围设备 startBluetoothDevicesDiscovery fail', res);
            this.requestAndroidPermission('android.permission.ACCESS_FINE_LOCATION')
          },
        });

      },

      // 监听寻找到新设备的事件
      onBluetoothDeviceFound() {
        console.log('进入查询设备');
        uni.onBluetoothDeviceFound(res => {
          // console.log(res);
          this.handleFillterBluetoothDevice(res.devices)
        });
      },

      // 处理返回上一页
      handleBack() {
        this.contactDevices = uni.getStorageSync('contactDevices')
        if (!this.contactDevices) {
          // 停止搜索蓝牙
          clearTimeout(this.timer)
          uni.hideLoading()
          uni.stopBluetoothDevicesDiscovery();
          this.handleNoSreachDevice(true)
          uni.navigateBack()
          this.handleInitDevices()
          return
        }

      },
      // 处理关闭弹框
      handleClosePopup() {
        switch (uni.getSystemInfoSync().platform) {
          case 'android':
            // 如果是安卓
            const BluetoothAdapter = plus.android.importClass('android.bluetooth.BluetoothAdapter');
            const blueadapter = BluetoothAdapter.getDefaultAdapter();
            const boolean = blueadapter.enable();
            if (boolean) {
              this.handelgetBlueTooth()
            }
            break;
          case 'ios':
            // 如果是ios
            // 跳转系统授权管理页
            this.$refs.popup.close()
            uni.openAppAuthorizeSetting({
              success: (res) => {
                uni.showLoading({
                  title: 'opening...'
                })
                this.timer = setTimeout(() => {
                  uni.hideLoading()
                  this.handleInitDevices()
                  // this.handleOpenBluetooth()
                }, 2500)
              }
            })
            break;
        }
      },
      // 监听蓝牙是否打开
      handelgetBlueTooth() {
        let state = 0
        uni.onBluetoothAdapterStateChange(e => {
          // console.log(e);
          state = state + 1
          if (state % 2 !== 0) return
          if (!e.available) return
          this.$refs.popup.close()
          uni.showLoading({
            title: 'opening...'
          })
          this.timer = setTimeout(() => {
            uni.hideLoading()
            this.handleInitDevices()
            // this.handleOpenBluetooth()
          }, 2500)
        })
      },
      // 处理Android设备上当前App是否定位权限
      async requestAndroidPermission(permissionID) {
        switch (uni.getSystemInfoSync().platform) {
          case 'android':
            var result = await permission.requestAndroidPermission(permissionID)
            // 已授权 
            if (result == 1) return
            // 未授权
            this.handleConnectionFail()
            // permission.gotoAppPermissionSetting()
            break
          case 'ios':
            if (!permission.judgeIosPermission('location')) {
              this.handleConnectionFail()
              // permission.gotoAppPermissionSetting()
            }
            break
        }
      },
      // 处理设备的点击
      handleDeviceClick(i) {
        this.currentIndex = i
      },
      // 处理点击连接设备
      handleConnectDevice() {
        const deviceId = this.devices[this.currentIndex].deviceId
        if (!deviceId) return
        uni.showLoading({
          mask: true,
          title: "connecting..."
        })
        // console.log(deviceId);
        uni.createBLEConnection({
          deviceId,
          success: (res) => {
            uni.hideLoading()

            console.log("连接成功", res);
            // 停止搜索蓝牙
            uni.stopBluetoothDevicesDiscovery({
              success: (res) => {
                console.log('停止搜索成功');

                onBLEConnectionStateChange()

                // 获取蓝牙设备所有服务
                getBLEDeviceServices(deviceId)

                // 保存当前设备
                this.hadnleSaveDevice(this.devices[this.currentIndex])

                // 打开自动清洁功能 连接设备成功后有延迟
                this.handleChangeLinkStatus("success")

                stateFeedback('6A01B210000200000000090000000000000001000095C60A')

                setTimeout(() => {
                  writeBLECharacteristicValue('6A 04 B3 01 00 01 00 1D 0A')

                  // 读取设备信息
                  setTimeout(() => {
                    writeBLECharacteristicValue('6A 01 B1 00 00 09 E0 0A')
                  }, 200)
                }, 800)

                uni.setStorageSync("launchflag", true)
                uni.setStorageSync("deviceId", deviceId)
                // 保存deviceId到store
                this.handleSaveDeviceId(deviceId)

                this.handleSuccesContact(deviceId)
              },
              fail: (err) => {
                console.log("停止搜索失败", err);
              }
            });
          },
          fail: err => {
            // 连接失败后显示重新搜索设备
            console.log(err);
            uni.hideLoading()
            this.handleConnectionFail()
            uni.stopBluetoothDevicesDiscovery();
          }
        })

      },
      // 处理跳转到帮助页面
      handleGoToHelp() {
        uni.navigateTo({
          url: '/pages/help/help'
        })
      },
      // 处理连接成功后保存设备到本地已激活
      async handleSuccesContact(deviceId) {
        this.contactDevices = uni.getStorageSync('contactDevices')
        if (!this.contactDevices) {
          this.contactDevices = [deviceId]
          uni.setStorageSync("contactDevices", this.contactDevices)
          uni.reLaunch({
            url: `/pages/product-tutorial/product-tutorial`
          })
          return
        }

        await this.contactDevices.find(id => {
          if (id === deviceId) {
            uni.reLaunch({
              url: "/subpkg/device/device?type=1"
            })
            return
          }
        })

        this.deviceActive = [...new Set(this.deviceActive.push(deviceId))]
        uni.setStorageSync("contactDevices", this.contactDevices)
        uni.reLaunch({
          url: `/pages/product-tutorial/product-tutorial`
        })
      },
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

    .title {
      margin-top: 60rpx;
      margin-bottom: 138rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .logo {
      width: 514rpx;
      height: 514rpx;
      // border: 1rpx solid red;
      border-radius: 50%;
      margin: 0 118rpx;
      position: relative;
      margin-bottom: 235rpx;

      .device {
        width: 514rpx;
        height: 514rpx;
        border-radius: 50%;
        position: absolute;

        .bac {
          // animation: myRptate 5s linear infinite;

          image {
            width: 514rpx;
            height: 514rpx;
          }
        }

        .bluetooth {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);

          image {
            width: 78rpx;
            height: 90.32rpx;
          }
        }


        .active-amin {
          position: absolute;
          left: 0;
          top: 0;

          image {
            width: 514rpx;
            height: 514rpx;
            animation: myRptate 2s linear infinite;
          }
        }

        .amin {
          position: absolute;
          left: 0;
          top: 0;

          image {
            width: 514rpx;
            height: 514rpx;
          }
        }
      }

      .robot {
        width: 144rpx;
        height: 144rpx;
        position: absolute;
        top: 0;
        left: 50%;
        margin-top: -72rpx;
        margin-left: -72rpx;
        background: url("@/static/img/connect/looking-for-device/device_robot_bg_normal.png") no-repeat;
        background-size: 144rpx 144rpx;
        display: flex;
        justify-content: center;
        align-items: center;

        .icon {
          width: 76rpx;
          height: 78rpx;
          position: absolute;
          top: 0;
          transform: translateY(50%);

          image {
            width: 100%;
            height: 100%;
          }
        }

        .name {
          min-width: 176rpx;
          position: absolute;
          bottom: -50rpx;
          color: #FFFFFF;
          font-size: 30rpx;
        }
      }

      .active {
        background: url("@/static/img/connect/looking-for-device/device_robot_bg_check.png") no-repeat;
        background-size: 144rpx 144rpx;
      }

      // .robot:nth-of-type(2) {
      //   transform: rotate(45deg);
      //   transform-origin: 72rpx 392rpx;
      // }

    }

    .no-device {
      width: 165rpx;
      height: 170.6rpx;
      margin: 205rpx 292rpx 332rpx 293rpx;

      image {
        width: 100%;
        height: 100%;
      }
    }

    .btns {
      font-size: 36rpx;

      .connect {
        uni-button {
          width: 364rpx;
          height: 86rpx;
          background: #FF8616;
        }
      }

      .search-again {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        uni-button {
          width: 364rpx;
          height: 86rpx;
          background: #FF8616;
          border-radius: 15rpx 15rpx 15rpx 15rpx;
          opacity: 1;
        }

        .help {
          margin-top: 65rpx;
          color: #FF8616;
          font-size: 28rpx;
          text-decoration: underline;
        }
      }
    }

    .popup {
      // width: 750rpx;
      height: 483rpx;
      background: #222222;
      // border-radius: 0rpx 0rpx 0rpx 0rpx;
      // opacity: 1;
      padding: 0 50rpx;
      box-sizing: border-box;

      .popup-label {
        margin-bottom: 29rpx;
        padding-top: 60rpx;
        font-size: 36rpx;
        font-family: "Corbel";
        font-weight: bold;
        color: #FFFFFF;
      }

      .msg {
        font-size: 32rpx;
        font-family: "Corbel";
        color: #888888;
      }

      uni-button {
        margin-top: 121rpx;
        width: 650rpx;
        height: 86rpx;
        background: #FF8616;
        border-radius: 15rpx 15rpx 15rpx 15rpx;
        opacity: 1;
        font-size: 36rpx;
      }
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
</style>