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
              {{item.name + item.deviceId.substr(-4)}}
              <!-- {{item.name}} <br />
              {{item.deviceId}} -->
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
        <button type="default" @click="handleConnectDevice">Connect</button>
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
      <view class="popup" :style="{'padding-bottom': safeAreaHeight ? safeAreaHeight + 'px' : '20rpx'}">
        <view class="popup-label"><text>{{popupTable}}</text></view>
        <view class="msg">
          {{popupMsg}}
        </view>
        <button @click="handleClosePopup" v-if="popupBtn !== 'Ok'">
          {{popupBtn}}
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
    onBLEConnectionStateChange,
    setBleMTU
  } from "@/utils/initBluetooth.js"
  import {
    stateFeedback
  } from "@/utils/state_feedback.js"
  import {
    getCurrentDate
  } from "@/utils/GetCurrentDate.js"
  import {
    registrationDevice
  } from "@/service/device.js"

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
        timer: null,
        safeAreaHeight: 0,
        popupTable: 'Turn on Bluetooth',
        popupMsg: "For connecting device, please turn on Bluetooth in OS Settings.",
        popupBtn: "Set Bluetooth",
        // 递归调用监听未打开蓝牙
        blueTimer: null,
        openBtTimer: null,
        isNext: true,
      };
    },
    onLoad() {
      // 安全区域高度
      const system = uni.getSystemInfoSync()
      this.safeAreaHeight = system.safeAreaInsets.bottom

    },
    onShow() {
      this.handleOpenBluetooth()
      this.$nextTick(() => {
        this.handelgetBlueTooth()
      })
    },
    computed: {
      ...mapState(['devices', 'noSreach', 'deviceStore', 'isInitBlue', 'deviceInfo', 'uuid', 'platform'])
    },
    methods: {
      ...mapMutations(['handleFillterBluetoothDevice', 'handleConnectionFail', 'handleSaveDeviceId',
        'handleChangeLinkStatus', 'hadnleSaveDevice', 'handleNoSreachDevice', 'handleInitDevices',
        'handleDeviceState', 'handleChangeStateText', 'handleIsInitBlue',
      ]),

      // 处理初始化蓝牙
      handleOpenBluetooth() {
        this.handleChangeLinkStatus('notLink')
        uni.openBluetoothAdapter({
          success: (res) => {
            console.log(res);
            this.startBluetoothDevicesDiscovery()
          },
          fail: (err) => {
            console.log(err);
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
        this.$refs.popup.close()
        uni.hideLoading()
        this.handleConnectionFail(true)
        uni.onBluetoothDeviceFound(res => {
          // console.log(res.devices);
          this.handleFillterBluetoothDevice(res.devices)
        });
      },

      // 处理返回上一页
      handleBack() {
        // 停止搜索蓝牙
        clearTimeout(this.timer)
        uni.hideLoading()
        uni.stopBluetoothDevicesDiscovery();
        this.handleNoSreachDevice(true)
        uni.navigateBack()
        this.handleInitDevices()

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
              this.$refs.popup.close()
              uni.showLoading({
                title: 'opening...'
              })
              this.openBtTimer = setTimeout(() => {
                uni.hideLoading()
                this.handleOpenBluetooth()
                clearTimeout(this.blueTimer)
                this.blueTimer = null
              }, 2500)
            }
            break;
          case 'ios':
            // 如果是ios
            // this.handelgetBlueTooth()
            break;
        }
      },
      // 监听蓝牙是否打开
      handelgetBlueTooth() {
        let state = 0
        uni.getBluetoothAdapterState({
          success: (res) => {
            console.log('蓝牙打开', res.available);
            if (this.isInitBlue) {
              this.handleOpenBluetooth()
              this.$refs.popup.close()
            }
          },
          fail: (res) => {
            console.log('蓝牙关闭', res);
            this.handleIsInitBlue(true)
            this.handleChangeLinkStatus('notLink')
            if (uni.getSystemInfoSync().platform === 'ios') {
              this.popupTable = 'Open the bluetooth'
              this.popupMsg =
                'For connecting device, please turn on Bluetooth in OS Settings.'
              this.popupBtn = 'Ok'
            }
            if (this.blueTimer) return
            this.$refs.popup.open()
            this.blueTimer = setTimeout(() => {
              this.handelgetBlueTooth()
              this.blueTimer = null
            }, 2500)
          }
        })

        uni.onBluetoothAdapterStateChange(e => {

          if (uni.getSystemInfoSync().platform === 'ios') {
            this.handleNoSreachDevice(false)
            this.popupTable = 'Turn on bluetooth'
            this.popupMsg = 'For connecting device, please turn on Bluetooth in OS Settings.'
            this.popupBtn = 'Ok'
            if (!e.available) {
              this.isShowAmin = false
              this.handleChangeLinkStatus('notLink')
              this.handleIsInitBlue(true)
              if (this.blueTimer) return
              this.$refs.popup.open()
            } else {
              if (this.isInitBlue) {
                clearTimeout(this.blueTimer)
                this.handleIsInitBlue(false)
                this.handleNoSreachDevice(true)
                this.isShowAmin = true
                this.handleOpenBluetooth()
                this.$refs.popup.close()
              }
            }
          } else {
            state = state + 1

            if (state % 2 !== 0) return
            if (!e.available) {
              this.handleNoSreachDevice(false)
              this.isShowAmin = false
              this.handleIsInitBlue(true)
              this.handleChangeLinkStatus('notLink')
              if (this.blueTimer) return
              this.$refs.popup.open()
            } else {
              if (this.isInitBlue) {
                this.handleIsInitBlue(false)
                this.isShowAmin = true
                this.handleNoSreachDevice(true)
                this.handleOpenBluetooth()
                this.$refs.popup.close()
              }
            }
          }
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
            // this.handleConnectionFail()
            permission.gotoAppPermissionSetting()
            break
          case 'ios':
            if (!permission.judgeIosPermission('location')) {
              // this.handleConnectionFail()
              permission.gotoAppPermissionSetting()
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
        if (!this.isNext) return
        this.isNext = false
        const deviceId = this.devices[this.currentIndex].deviceId
        if (!deviceId) return
        uni.showLoading({
          mask: true,
          title: "connecting..."
        })
        uni.createBLEConnection({
          deviceId,
          success: (res) => {
            this.isNext = true
            uni.hideLoading()
            this.handleNoSreachDevice(true)
            console.log("连接成功", res);
            // uni.showToast({
            //   title: "连接成功",
            //   icon: "none"
            // })
            // 停止搜索蓝牙
            this.$nextTick(() => {
              uni.stopBluetoothDevicesDiscovery({
                success: (res) => {
                  console.log('停止搜索成功');
                  onBLEConnectionStateChange()

                  // 保存当前设备
                  this.hadnleSaveDevice(this.devices[this.currentIndex])

                  // 打开自动清洁功能 连接设备成功后有延迟
                  this.handleChangeLinkStatus("success")
                  this.handleDeviceState({
                    ...this.deviceStore,
                    state: '等待'
                  })
                  this.handleChangeStateText('Waiting')
                  uni.setStorageSync("stateText", 'Waiting')

                  uni.setStorageSync("launchflag", true)
                  uni.setStorageSync("deviceId", deviceId)
                  // 保存deviceId到store
                  this.handleSaveDeviceId(deviceId)

                  this.handleSuccesContact(deviceId)
                },
                fail: (err) => {
                  console.log("停止搜索失败", err);
                },
              });
            })
          },
          fail: err => {
            // 连接失败后显示重新搜索设备
            console.log(err);
            uni.hideLoading()
            uni.showToast({
              title: "Connection fail",
              icon: "none"
            })
            this.handleConnectionFail()
            uni.stopBluetoothDevicesDiscovery();
            setTimeout(() => {
              this.isNext = true
              this.handleOpenBluetooth()
            }, 500)
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
        // this.handleRegistration()

        setBleMTU(deviceId)

        uni.setStorageSync('register', true)

        if (!this.contactDevices) {
          this.contactDevices = [deviceId]
          uni.setStorageSync("contactDevices", this.contactDevices)

          uni.reLaunch({
            url: `/pages/product-tutorial/product-tutorial`
          })
          return
        }

        await this.contactDevices.find(id => {
          // if (id === deviceId) {
            
          //   return
          // }
          uni.reLaunch({
            url: "/subpkg/device/device?type=1"
          })
        })

        // this.deviceActive = [...new Set(this.deviceActive.push(deviceId))]
        // uni.setStorageSync("contactDevices", this.contactDevices)
        // uni.reLaunch({
        //   url: `/pages/product-tutorial/product-tutorial`
        // })
      },
      // 注册设备
      // async handleRegistration() {
      //   const date = getCurrentDate()
      //   const { data } = await registrationDevice({
      //     robot_sn_list: [{robot_sn: this.deviceInfo.ser_number, data_time: date}],
      //     device_id: this.uuid,
      //     system: this.platform
      //   })
      //   console.log("注册设备成功");
      // }
    }
  }
</script>



<style lang="scss" scoped>
  .container {
    height: 100vh;
    position: relative;

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
      // margin-bottom: 235rpx;

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
      width: 100%;
      position: absolute;
      bottom: 150rpx;
      font-size: 36rpx;
      display: flex;
      justify-content: center;

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
      // height: 483rpx;
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