<template>
  <view class="container" :style="{paddingTop: `${statusBarHeight}px`}">
    <!-- 导航栏区域 -->
    <tabbar @handleChangeIndex="handleChangeIndex"></tabbar>

    <!-- 设备信息 -->
    <view class="robot" v-show="(currentIndex === 3 || currentIndex === 2) ? false : true">
      <view class="msg" v-show="linkStatus !== 'notLink'">
        <view class="msg-left" @click="handleEditName">{{deviceInfo.dev_name}}</view>
        <view class="msg-right">
          <!-- 电量 -->
          <view class="electric">
            <text>{{deviceStore.bat_level ? deviceStore.bat_level + '%' : '0%'}}</text>
            <view class="sum">
              <view :class="['residue', deviceStore.bat_level <= 20 ? 'low-residue' : '' ]"
                :style="{width: deviceStore.bat_level ? deviceStore.bat_level + '%' : '0%'}">
              </view>
            </view>
          </view>
          <!-- 蓝牙 -->
          <view class="bt">
            <image src="@/static/img/connect/looking-for-device/connect_device_ble.png" mode=""></image>
            <!-- 蓝牙信号强度 -->
            <image v-show="signal < 50" src="@/static/img/device/controller/controller_ble_signal2.png" mode=""></image>
            <image v-show="signal >= 50 && signal < 70" src="@/static/img/device/controller/controller_ble_signal3.png"
              mode=""></image>
            <image v-show="signal >= 70" src="@/static/img/device/controller/controller_ble_signal1.png" mode="">
            </image>
          </view>
        </view>
      </view>
      <!-- status 根据设备连接的状态改变图片 -->
      <view class="no-connect">
        <!-- 未连接 -->
        <image v-show="linkStatus !== 'success'" src="@/static/img/device/controller/git_no_connect.gif" />
        <!-- 系统故障 -->
        <image v-show="StatusSystemIcon" src="@/static/img/device/controller/git_no_connect_00012.png" mode="" />

        <!-- 电机故障 -->
        <image v-show="StatusBatteryIcon || StatusRightIcon || StatusLeftIcon || StatusSuctionIcon"
          src="@/static/img/device/controller/git_no_connect_00013.png" mode="" />
        <!-- 中电机故障 -->
        <image v-show="StatusSuctionIcon" class="malfunction" src="@/static/img/device/controller/dianliang.png"
          mode="" />
        <!-- 左移动电机故障 -->
        <image v-show="StatusLeftIcon" class="malfunction" src="@/static/img/device/controller/zuodian.png" mode="" />
        <!-- 右移动电机故障 -->
        <image v-show="StatusRightIcon" class="malfunction" src="@/static/img/device/controller/youdian.png" mode="" />
        <!-- 电池故障 -->
        <image v-show="StatusBatteryIcon" class="malfunction" src="@/static/img/device/controller/zhongjian.png"
          mode="" />
        <!-- 未启动提示 -->
        <image v-show="StatusStartIcon" src="@/static/img/device/controller/ex_device_start_bg.png" mode="" />

        <!-- 围困提示 -->
        <image v-show="StatusStuckIcon && !areaIcon && !timingIcon && !switchIcon && !pumpIcon && !cruiseIcon"
          src="@/static/img/device/controller/ex_device_weikun_bg.png" mode="" />

        <!-- 堵网异常提示 -->
        <image v-show="StatusFilterIcon && !areaIcon && !timingIcon && !switchIcon && !pumpIcon && !cruiseIcon"
          src="@/static/img/device/controller/ex_device_duwang_bg.png" mode="" />

        <!-- 低电量提示 -->
        <image v-show="StatusLowIcon" src="@/static/img/device/controller/gif_work_state_low_battery.gif" mode="" />

        <!-- 正常工作-闲置 -->
        <image
          v-show="StatusWorkingIcon && deviceStore.state !== '工作' && !areaIcon && !timingIcon && !switchIcon && !pumpIcon && !cruiseIcon"
          src="@/static/img/device/controller/gif_work_state_xianzhi.gif" mode="" />
        <!-- 正常工作-熄火 -->
        <image
          v-show="StatusWorkingIcon && stateText !== 'Waiting' && stateText !== 'Charging' && deviceStore.state === '工作' && deviceStore.pump_power === '熄火' && !areaIcon && !timingIcon && !switchIcon && !pumpIcon && !cruiseIcon"
          src="@/static/img/device/controller/gif_work_state_xihuo.gif" mode="" />
        <!-- 正常工作-常规 -->
        <image
          v-show="StatusWorkingIcon && stateText !== 'Waiting' && stateText !== 'Charging' && deviceStore.state !== '闲置' && deviceStore.state !== '异常' && deviceStore.pump_power === '常规' && !areaIcon && !timingIcon && !switchIcon && !pumpIcon && !cruiseIcon"
          src="@/static/img/device/controller/gif_work_state_rule.gif" mode="" />
        <!-- 正常工作-强力 -->
        <image
          v-show="StatusWorkingIcon && stateText !== 'Waiting' && stateText !== 'Charging' &&  deviceStore.state !== '闲置' && deviceStore.state !== '异常' && deviceStore.pump_power === '强力' && !areaIcon && !timingIcon && !switchIcon && !pumpIcon && !cruiseIcon"
          src="@/static/img/device/controller/gif_work_state_qiangli.gif" mode="" />

        <!-- 设置时间 -->
        <image v-show="timingIcon" src="@/static/img/device/controller/gif_time_setting.gif" mode="" />
        <!-- 设置区域 -->
        <image v-show="areaIcon" src="@/static/img/device/controller/gif_region_setting.gif" mode="" />
        <!-- 设置定速巡航 -->
        <image v-show="cruiseIcon == '开启' && (StatusWorkingIcon || StatusStuckIcon || StatusFilterIcon)"
          src="@/static/img/device/controller/gif_work_state_xihuo.gif" mode="" />
        <image v-show="cruiseIcon == '关闭' && (StatusWorkingIcon || StatusStuckIcon || StatusFilterIcon)"
          src="@/static/img/device/controller/gif_work_state_xianzhi.gif" mode="" />
        <!-- 设置自动清除 -->
        <image v-show="switchIcon == '开启' && (StatusWorkingIcon || StatusStuckIcon || StatusFilterIcon)"
          src="@/static/img/device/controller/gif_work_state_rule.gif" mode="" />
        <image v-show="switchIcon == '关闭' && (StatusWorkingIcon || StatusStuckIcon || StatusFilterIcon)"
          src="@/static/img/device/controller/gif_work_state_xianzhi.gif" mode="" />
        <!-- 设置水泵 -->
        <image v-show="pumpIcon === '熄火' && (StatusWorkingIcon || StatusStuckIcon || StatusFilterIcon)"
          src="@/static/img/device/controller/gif_work_state_xihuo.gif" mode="" />
        <image v-show="pumpIcon === '常规' && (StatusWorkingIcon || StatusStuckIcon || StatusFilterIcon)"
          src="@/static/img/device/controller/gif_work_state_rule.gif" mode="" />
        <image v-show="pumpIcon === '强力' && (StatusWorkingIcon || StatusStuckIcon || StatusFilterIcon)"
          src="@/static/img/device/controller/gif_work_state_qiangli.gif" mode="" />
      </view>
      <!-- working -->
      <view class="working">
        <uni-notice-bar ref="ref" :speed="50" background-color="rgba(0, 0, 0, 0)" color="#FFF" scrollable
          :text="stateText" v-if="stateText.length > 14 && notice" />
        <span v-else-if="stateText.length <= 14" style="text-align: left;">{{stateText}}</span>
      </view>
      <!-- clean -->
      <view class="clean">
        <view class="text">
          Auto Clean
        </view>
        <view class="switch">
          <switch color="#FF8616" :disabled="disabled" :checked="isSwitch" style="transform:scale(0.9)"
            @change="handleChangeSwitch" />
        </view>
      </view>
    </view>

    <!-- 控制组件区域 -->
    <controller v-show="currentIndex === 0" @onPump="onPump" @onCruise="onCruise"></controller>

    <!-- 任务组件区域 -->
    <task v-if="currentIndex === 1" @onArea="onArea" @onTiming="onTiming"></task>

    <!-- 支持区域 -->
    <support v-if="currentIndex === 2" :message="message"></support>

    <!-- 关于组件区域 -->
    <about v-if="currentIndex === 3"></about>

    <!-- 修改名称弹框 -->
    <uni-popup ref="popup" type="center" @change="handleChangePopup">
      <view class="popup">
        <view class="header">
          <view class="label">Robot name</view>
          <view class="tips">{{tip}}</view>
        </view>
        <view class="center">
          <input type="text" v-model="deviceName" @input="handleEditDeviceName">
        </view>
        <view class="footer">
          <button @click="handleOkClick">OK</button>
        </view>
      </view>
    </uni-popup>

    <!-- 弹出层区域 -->
    <uni-popup ref="popupBt" type="bottom" :is-mask-click="false">
      <view class="popup-bt" :style="{'padding-bottom': safeAreaHeight ? safeAreaHeight + 'px' : '20rpx'}">
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
  } from "vuex";

  import {
    handleOpenBluetooth,
    writeBLECharacteristicValue,
    startBluetoothDevicesDiscovery
  } from "@/utils/initBluetooth.js"
  import {
    analysisAscll
  } from "@/utils/analysisAscll.js"
  import {
    crc16xmodem
  } from '@/utils/CRC_XMODEM.js'
  import {
    getContactInfo,
    getFeedbackList
  } from "@/service/device.js"
  import {
    forEach,
    forIn
  } from "lodash";


  export default {
    watch: {
      isSwitch(newtext, oldtext) {
        if (newtext === true) {
          if (this.linkStatus !== 'success') return
          if (this.deviceStore.state === '' || this.deviceStore.state === '等待' || this.deviceStore.state === '充电')
            return

          clearTimeout(this.timingTimer)
          clearTimeout(this.areaTimer)
          clearTimeout(this.pumpTimer)
          clearTimeout(this.cruiseTimer)
          this.cruiseIcon = ''
          this.pumpIcon = ''
          this.timingIcon = false
          this.areaIcon = false
          if (this.switchTimer !== null) {
            clearTimeout(this.switchTimer)
            this.switchIcon = '开启'
            this.switchTimer = setTimeout(() => {
              // this.switchTimer = null
              this.switchIcon = ''
            }, 3000)
          } else {
            clearTimeout(this.switchTimer)
            this.switchIcon = '开启'
            this.switchTimer = setTimeout(() => {
              // this.switchTimer = null
              this.switchIcon = ''
            }, 3000)
          }
        } else {
          if (this.linkStatus !== 'success') return
          if (this.deviceStore.state == '等待' || this.deviceStore.state === '充电') return
          if (this.deviceStore.low_bat_flag == '低电状态') return
          // if (this.deviceStore.filter_exception == '堵网异常') return
          if (this.deviceStore.bldc_exception !== '工作正常') return
          if (this.deviceStore.left_dc_exception == '其他异常' || this.deviceStore.left_dc_exception == '电机堵转') return
          if (this.deviceStore.right_dc_exception == '其他异常' || this.deviceStore.right_dc_exception == '电机堵转') return
          if (this.deviceStore.battery_exception !== '工作正常') return
          if (this.deviceStore.system_exception === '系统异常' || this.deviceStore.system_exception === '其他异常') return
          // if (this.deviceStore.movement_exception !== '工作正常') return

          clearTimeout(this.timingTimer)
          clearTimeout(this.areaTimer)
          clearTimeout(this.pumpTimer)
          clearTimeout(this.cruiseTimer)
          this.cruiseIcon = ''
          this.pumpIcon = ''
          this.timingIcon = false
          this.areaIcon = false
          if (this.switchTimer !== null) {
            clearTimeout(this.switchTimer)
            this.switchIcon = '关闭'
            this.switchTimer = setTimeout(() => {
              // this.switchTimer = null
              this.switchIcon = ''
            }, 3000)
          } else {
            clearTimeout(this.switchTimer)
            this.switchIcon = '关闭'
            this.switchTimer = setTimeout(() => {
              // this.switchTimer = null
              this.switchIcon = ''
            }, 3000)
          }
        }
      },
      linkStatus(newValue, oldValue) {
        if (newValue === 'success') {
          // // 打开主动获取状态 连接设备成功后有延迟
          this.onBLEDeviceRSS()
          this.signalTimer = setInterval(() => {
            this.onBLEDeviceRSS()
          }, 3000)
          // this.handelgetBlueTooth()
        } else {
          this.isSwitch = false
          this.disabled = true
          clearInterval(this.signalTimer)
        }
      },
      'deviceStore.state'(newValue, oldValue) {
        console.log(newValue);
        switch (newValue) {
          case '等待':
            this.isSwitch = false
            this.disabled = true
            break
          case '充电':
            this.isSwitch = false
            this.disabled = true
            break
          case '工作':
            // this.isSwitch = true
            this.disabled = false
            break
          case '闲置':
            // this.isSwitch = true
            this.disabled = false
            break
          case '异常':
            if (this.deviceStore.low_bat_flag !== "低电状态") {
              if (this.deviceStore.state === '等待' || this.deviceStore.state === '充电') return
              // this.isSwitch = true
              this.disabled = false
            }
            break
        }
      },
      'deviceStore.low_bat_flag'(newValue, oldValue) {
        if (newValue === '低电状态') {
          this.isSwitch = false
          this.disabled = true
        } else {
          if (this.deviceStore.state === '等待' || this.deviceStore.state === '充电') return
          console.log(newValue);
          this.disabled = false
        }
      },
      'deviceStore.filter_exception'(newValue, oldValue) {
        if ((this.deviceStore.state === '工作' || this.deviceStore.state === '闲置' || this.deviceStore.state ===
            '异常') && this.deviceStore.low_bat_flag !== "低电状态" && this.deviceStore.bldc_exception === '工作正常' && this
          .deviceStore.left_dc_exception === '工作正常' && this.deviceStore.right_dc_exception === '工作正常' && this
          .deviceStore.battery_exception === '工作正常' && this.deviceStore.system_exception === '工作正常') {
          console.log(newValue);
          // this.isSwitch = true
          this.disabled = false
        }
      },
      'deviceStore.movement_exception'(newVal) {
        if (this.deviceStore.low_bat_flag !== "低电状态" && this.deviceStore.state !== '等待' && this.deviceStore.state !==
          '充电' && this.deviceStore
          .bldc_exception === '工作正常' && this.deviceStore.left_dc_exception === '工作正常' && this.deviceStore
          .right_dc_exception === '工作正常' && this.deviceStore
          .battery_exception === '工作正常' && this.deviceStore.system_exception === '工作正常') {
          console.log(newVal);
          // this.isSwitch = true
          this.disabled = false
        } else {
          this.isSwitch = false
          this.disabled = true
        }
      },
      'deviceStore.bldc_exception'(newValue, oldValue) {
        if (newValue !== '工作正常') {
          this.isSwitch = false
          this.disabled = true
        } else {
          if (this.deviceStore.low_bat_flag === "低电状态") return
          if (this.deviceStore.state === '等待' || this.deviceStore.state === '充电') return
          console.log(newValue);
          this.disabled = false
        }
      },
      'deviceStore.left_dc_exception'(newValue, oldValue) {
        if (newValue === '其他异常' || newValue === '电机堵转') {
          this.isSwitch = false
          this.disabled = true
        } else {
          if (this.deviceStore.low_bat_flag === "低电状态") return
          if (this.deviceStore.state === '等待' || this.deviceStore.state === '充电') return
          console.log(newValue);
          // this.isSwitch = true
          this.disabled = false
        }
      },
      'deviceStore.right_dc_exception'(newValue, oldValue) {
        if (newValue === '其他异常' || newValue === '电机堵转') {
          this.isSwitch = false
          this.disabled = true
        } else {
          if (this.deviceStore.low_bat_flag === "低电状态") return
          if (this.deviceStore.state === '等待' || this.deviceStore.state === '充电') return
          console.log(newValue);
          // this.isSwitch = true
          this.disabled = false
        }
      },
      'deviceStore.battery_exception'(newValue, oldValue) {
        if (newValue !== '工作正常') {
          this.isSwitch = false
          this.disabled = true
        } else {
          if (this.deviceStore.low_bat_flag === "低电状态") return
          if (this.deviceStore.state === '等待' || this.deviceStore.state === '充电') return
          console.log(newValue);
          // this.isSwitch = true
          this.disabled = false
        }
      },
      'deviceStore.system_exception'(newValue, oldValue) {
        if (newValue === '系统异常' || newValue === '其他异常') {
          this.isSwitch = false
          this.disabled = true
        } else {
          if (this.deviceStore.low_bat_flag === "低电状态") return
          if (this.deviceStore.state === '等待' || this.deviceStore.state === '充电') return
          console.log(newValue);
          // this.isSwitch = true
          this.disabled = false
        }
      },
      "deviceStore.autoclean"(newVal) {
        if (newVal === '关闭' || newVal === '') {
          this.isSwitch = false
        } else {
          this.isSwitch = true
        }
      },
      stateText(newVal) {
        this.notice = false
        this.$nextTick(() => {
          this.notice = true
        })
      }
    },
    data() {
      return {
        currentIndex: 0,
        controlIcon: require('@/static/img/device/controller/controller_area_bg.png'),
        banStyle: {
          top: "37rpx",
          left: "37rpx",
        },
        isSwitch: false,
        // 自动清除防抖
        switchTimer: null,
        // 是否显示自动清除动图
        switchIcon: '',
        // 区域设置防抖
        areaTimer: null,
        // 是否显示区域设置动图
        areaIcon: false,
        // 定时防抖
        timingTimer: null,
        // 是否显示定时动图
        timingIcon: false,
        // 水泵防抖
        pumpTimer: null,
        // 根据状态显示水泵动图
        pumpIcon: '',
        // 定速巡航的防抖
        cruiseTimer: null,
        // 是否显示定速巡航动图
        cruiseIcon: '',
        // 验证信息
        tip: '',
        deviceName: '',
        openBtTimer: null,
        // 信息
        message: {},
        // 反馈信息列表
        feedbackList: [],
        disabled: true,
        safeAreaHeight: 0,
        popupTable: 'Turn on Bluetooth',
        popupMsg: "For connecting device, please turn on Bluetooth in OS Settings.",
        popupBtn: "Set Bluetooth",
        // 递归调用监听未打开蓝牙
        blueTimer: null,
        switchBtn: false,
        // 蓝牙信号强度
        signal: 0,
        signalTimer: null,
        notice: true,
        // 监听页面是否隐藏
        isHide: false
      };
    },
    computed: {
      ...mapState(['linkStatus', 'uuid', 'platform', 'device', 'deviceStore', 'stateText', 'isInitBlue', 'deviceInfo']),

      statusBarHeight() {
        return uni.getStorageSync('statusBarHeight')
      },

      // 系统故障
      StatusSystemIcon() {
        if (this.linkStatus !== 'success') return false

        if (this.deviceStore.system_exception !== '工作正常' && this.deviceStore.system_exception !== '') return true
      },

      // 电池故障
      StatusBatteryIcon() {
        if (this.linkStatus !== 'success') return false
        if (this.StatusSystemIcon) return false

        if (this.deviceStore.battery_exception !== '工作正常' && this.deviceStore.battery_exception !== '') return true
      },

      // 右电机故障
      StatusRightIcon() {
        if (this.linkStatus !== 'success') return false
        if (this.StatusSystemIcon) return false

        if (this.deviceStore.right_dc_exception !== '工作正常' && this.deviceStore.right_dc_exception !== '') return true
      },

      // 左电机故障
      StatusLeftIcon() {
        if (this.linkStatus !== 'success') return false
        if (this.StatusSystemIcon) return false

        if (this.deviceStore.left_dc_exception !== '工作正常' && this.deviceStore.left_dc_exception !== '') return true
      },

      // 中电机故障
      StatusSuctionIcon() {
        if (this.linkStatus !== 'success') return false
        if (this.StatusSystemIcon) return false
        if (this.deviceStore.bldc_exception !== '工作正常' && this.deviceStore.bldc_exception !== '') return true
      },

      // 未启动提示
      StatusStartIcon() {
        if (this.linkStatus !== 'success') return false
        if (this.StatusSystemIcon) return false
        if (this.StatusBatteryIcon) return false
        if (this.StatusRightIcon) return false
        if (this.StatusLeftIcon) return false
        if (this.StatusSuctionIcon) return false

        if (this.deviceStore.start_exception !== '工作正常' && this.deviceStore.start_exception !== '') return true
      },

      // 围困提示
      StatusStuckIcon() {
        if (this.linkStatus !== 'success') return false
        if (this.StatusSystemIcon) return false
        if (this.StatusBatteryIcon) return false
        if (this.StatusRightIcon) return false
        if (this.StatusLeftIcon) return false
        if (this.StatusSuctionIcon) return false
        if (this.StatusStartIcon) return false

        if (this.deviceStore.movement_exception === '围困异常') return true
      },

      // 堵网提示异常
      StatusFilterIcon() {
        if (this.linkStatus !== 'success') return false
        if (this.StatusSystemIcon) return false
        if (this.StatusBatteryIcon) return false
        if (this.StatusRightIcon) return false
        if (this.StatusLeftIcon) return false
        if (this.StatusSuctionIcon) return false
        if (this.StatusStartIcon) return false
        if (this.StatusStuckIcon) return false

        if (this.deviceStore.filter_exception === '堵网异常') return true
      },

      // 低电量提示
      StatusLowIcon() {
        if (this.linkStatus !== 'success') return false
        if (this.StatusSystemIcon) return false
        if (this.StatusBatteryIcon) return false
        if (this.StatusRightIcon) return false
        if (this.StatusLeftIcon) return false
        if (this.StatusSuctionIcon) return false
        if (this.StatusStartIcon) return false
        if (this.StatusStuckIcon) return false
        if (this.StatusFilterIcon) return false

        if (this.deviceStore.low_bat_flag === '低电状态') return true
      },

      // 正常工作
      StatusWorkingIcon() {
        if (this.linkStatus !== 'success') return false
        if (this.StatusSystemIcon) return false
        if (this.StatusBatteryIcon) return false
        if (this.StatusRightIcon) return false
        if (this.StatusLeftIcon) return false
        if (this.StatusSuctionIcon) return false
        if (this.StatusStartIcon) return false
        if (this.StatusStuckIcon) return false
        if (this.StatusFilterIcon) return false
        if (this.StatusLowIcon) return false

        return true
      },

      LinkSuccessIcon() {
        let status = true
        const deviceStoreArr = Object.keys(this.deviceStore)
        deviceStoreArr.forEach(i => {
          if (this.deviceStore[i] !== '') {
            status = false
            return
          }
        })
        return status
      },

      // 处理状态文本滑动速度
      StateTextSpeed() {
        if (this.stateText.length > 20) {
          return '1'
        } else {
          return '2'
        }

      }
    },
    onLoad(options) {
      const system = uni.getSystemInfoSync()
      this.safeAreaHeight = system.safeAreaInsets.bottom

      if (options.type !== "1") {
        handleOpenBluetooth(this.$refs.popupBt)
      }

      this.handleGetContactInfo()

      // this.handleGetFeedBackList()
    },
    onShow() {
      this.$nextTick(() => {
        this.handelgetBlueTooth()
        this.isHide = false
        if (this.linkStatus === 'notLink') {
          setTimeout(() => {
            this.handleChangeStateText("Bluetooth disconnected")
          }, 700)
        }
      })
    },
    onHide() {
      clearTimeout(this.blueTimer)
      this.isHide = true
    },
    methods: {
      ...mapMutations(['handlEditDeviceName', 'handleChangeLinkStatus', 'handleChangeStateText',
        'handleStateTextTimer', 'handleIsInitBlue'
      ]),

      // 监听index
      handleChangeIndex(i) {
        this.currentIndex = i
      },
      // 处理切换开关
      handleChangeSwitch(e) {
        if (this.switchBtn) return
        setTimeout(() => {
          this.switchBtn = false
          this.disabled = false
        }, 200)
        this.isSwitch = e.target.value
        this.switchBtn = true
        this.disabled = true
        if (e.target.value) {
          writeBLECharacteristicValue('6A 04 B3 01 00 01 00 1D 0A')
          this.handleChangeStateText('Start Cleaning')
          this.handleStateTextTimer(uni.getStorageSync('stateText'))
        } else {
          writeBLECharacteristicValue('6A 04 B3 01 00 00 21 0D 0A')
          this.handleChangeStateText('Stop Cleaning')
          this.handleStateTextTimer(uni.getStorageSync('stateText'))
        }
      },
      // 处理修改名称
      handleEditName() {
        this.deviceName = this.deviceInfo.dev_name
        this.$refs.popup.open()
      },
      // 监听输入框的输入事件
      handleEditDeviceName(e) {
        const reg = (/^[\x00-\x7F]+$/)
        if (!reg.test(e.target.value) || e.target.value.length < 1) {
          this.$nextTick(() => {
            this.tip = 'Please use standard characters.'
          })
          return
        }

        if (e.target.value.length > 25) {
          this.tip = 'Please shorten the input.'
          return
        } else {
          this.tip = ''
          return
        }
      },
      // 监听弹框隐藏
      handleChangePopup(e) {
        if (!e.show) {
          this.deviceName = ''
          this.tip = ''
        }
      },
      // 处理对话框确认的点击
      handleOkClick() {
        if (this.linkStatus !== 'success') return
        // if (this.deviceStore.state == '等待') return

        if (this.deviceName === '') {
          this.tip = 'The text cannot be empty'
          return
        }

        if (this.tip) return
        const nameLength = parseInt(this.deviceName.length).toString(16).length > 1 ? parseInt(this.deviceName.length)
          .toString(16) : '0' + parseInt(this.deviceName.length).toString(16)
        // const msgLength = (parseInt(this.deviceName.length) + 1).toString(16).length > 1 ? (parseInt(this.deviceName
        //   .length) + 1).toString(16) : '0' + (parseInt(this.deviceName.length) + 1).toString(16)
        // let msgLength = ''
        // if (this.deviceName.length + 1 > 255 && this.deviceName.length + 1 < 4096) {
        //   msgLength = '0' + (parseInt(this.deviceName.length) + 1).toString(16)
        //   msgLength = msgLength.slice(2) + ' ' + msgLength.slice(0, 2)
        // } else if (this.deviceName.length + 1 >= 4096) {
        //   msgLength = (parseInt(this.deviceName.length) + 1).toString(16)
        //   msgLength = msgLength.slice(2) + ' ' + msgLength.slice(0, 2)
        // } else if (this.deviceName.length + 1 <= 15) {
        //   msgLength = '0' + (parseInt(this.deviceName.length) + 1).toString(16) + " 00"
        // } else {
        //   msgLength = (parseInt(this.deviceName.length) + 1).toString(16) + " 00"
        // }
        let msg = analysisAscll(this.deviceName)
        msg = msg.split(" ")
        const length = (24 - msg.length)
        for (let i = 0; i <= length; i++) {
          msg.push('00')
        }
        msg = msg.join(" ")



        const CRC = crc16xmodem(`6A 02 B1 1A 00 ${nameLength} ${msg}`)
        writeBLECharacteristicValue(`6A 02 B1 1A 00 ${nameLength} ${msg} ${CRC} 0A`)
        // 再次获取设备信息
        setTimeout(() => {
          writeBLECharacteristicValue('6A 01 B1 00 00 09 E0 0A')
        }, 200)
        console.log(this.device);
        this.$refs.popup.close()
        this.deviceName = ''
      },
      // 处理未连接蓝牙提示框关闭弹框
      handleClosePopup() {
        const BluetoothAdapter = plus.android.importClass('android.bluetooth.BluetoothAdapter');
        switch (uni.getSystemInfoSync().platform) {
          case 'android':
            // 如果是安卓
            const blueadapter = BluetoothAdapter.getDefaultAdapter();
            const boolean = blueadapter.enable();
            // 判断是否连接系统蓝牙
            if (boolean) {
              if (this.isHide) return
              this.$refs.popupBt.close()
              uni.showLoading({
                title: 'opening...'
              })
              this.openBtTimer = setTimeout(() => {
                uni.hideLoading()
                handleOpenBluetooth(this.$refs.popupBt)
                clearTimeout(this.blueTimer)
                this.blueTimer = null
              }, 2500)
            }
            break;
          case 'ios':
            // 如果是ios
            // 跳转系统微信授权管理页
            this.$refs.popupBt.close()
            break;
        }
      },
      // 监听连接蓝牙状态
      handelgetBlueTooth() {
        let state = 0
        uni.getBluetoothAdapterState({
          success: (res) => {
            console.log('蓝牙打开', res.available);
            if (this.isHide) return
            if (this.isInitBlue) {
              handleOpenBluetooth(this.$refs.popupBt)
              this.$refs.popupBt.close()
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
            if (this.isHide) return
            this.$refs.popupBt.open()
            this.blueTimer = setTimeout(() => {
              this.handelgetBlueTooth()
              this.blueTimer = null
            }, 500)
          }
        })

        uni.onBluetoothAdapterStateChange(e => {
          console.log(e);

          if (uni.getSystemInfoSync().platform === 'ios') {
            this.popupTable = 'Turn on bluetooth'
            this.popupMsg = 'For connecting device, please turn on Bluetooth in OS Settings.'
            this.popupBtn = 'Ok'
            if (!e.available) {
              this.handleChangeLinkStatus('notLink')
              this.handleIsInitBlue(true)
              if (this.blueTimer) return
              if (this.isHide) return
              this.$refs.popupBt.open()
              this.blueTimer = setTimeout(() => {
                this.handelgetBlueTooth()
                this.blueTimer = null
              }, 500)
            } else {
              if (this.isHide) return
              if (this.isInitBlue) {
                this.handleIsInitBlue(false)
                handleOpenBluetooth(this.$refs.popupBt)
                this.$refs.popupBt.close()
              }
            }
          } else {
            state = state + 1
            if (state % 2 !== 0) return
            if (!e.available) {
              this.handleChangeLinkStatus('notLink')
              if (this.blueTimer) return
              if (this.isHide) return
              this.$refs.popupBt.open()
              this.blueTimer = setTimeout(() => {
                this.handelgetBlueTooth()
                this.blueTimer = null
              }, 500)
            } else {
              if (this.isHide) return
              if (this.isInitBlue) {
                this.handleIsInitBlue(false)
                handleOpenBluetooth(this.$refs.popupBt)
                this.$refs.popupBt.close()
              }
            }
          }
        })
      },
      // 处理获取联系方式
      async handleGetContactInfo() {
        const {
          data
        } = await getContactInfo({
          device_id: this.uuid,
          system: this.platform
        })
        console.log('result.data', data);
        this.message = data
      },
      // 获取反馈信息
      async handleGetFeedBackList() {

        const {
          data
        } = await getFeedbackList({
          device_id: '9bfd288d6b09399da56008338a8b8783',
          system: 1
        })

        console.log("getFeedbackList", data);
        this.feedbackList = data
      },
      // 监听区域任务的开关
      onArea(value) {
        clearTimeout(this.timingTimer)
        clearTimeout(this.switchTimer)
        clearTimeout(this.pumpTimer)
        clearTimeout(this.cruiseTimer)
        this.cruiseIcon = false
        this.pumpIcon = ''
        this.switchIcon = ''
        this.timingIcon = false
        if (value === 'start') {
          if (this.areaTimer !== null) {
            clearTimeout(this.areaTimer)
            // this.areaTimer = null
            this.areaIcon = true
            this.areaTimer = setTimeout(() => {
              this.areaIcon = false
              // this.areaTimer = null
            }, 3000)
          } else {
            clearTimeout(this.areaTimer)
            this.areaIcon = true
            this.areaTimer = setTimeout(() => {
              this.areaIcon = false
              // this.areaTimer = null
            }, 3000)
          }
        } else {
          clearTimeout(this.areaTimer)
          this.areaIcon = false
          // this.areaTimer = null
        }
      },
      // 监听设置时间
      onTiming() {
        clearTimeout(this.areaTimer)
        clearTimeout(this.switchTimer)
        clearTimeout(this.pumpTimer)
        clearTimeout(this.cruiseTimer)
        this.cruiseIcon = false
        this.pumpIcon = ''
        this.switchIcon = ''
        this.areaIcon = false
        if (this.timingTimer !== null) {
          clearTimeout(this.timingTimer)
          // this.timingTimer = null
          this.timingIcon = true
          this.timingTimer = setTimeout(() => {
            // this.timingTimer = null
            this.timingIcon = false
          }, 3000)
        } else {
          clearTimeout(this.timingTimer)
          this.timingIcon = true
          this.timingTimer = setTimeout(() => {
            // this.timingTimer = null
            this.timingIcon = false
          }, 3000)
        }
      },
      // 监听水泵的设置
      onPump(val) {
        clearTimeout(this.areaTimer)
        clearTimeout(this.switchTimer)
        clearTimeout(this.timingTimer)
        clearTimeout(this.cruiseTimer)
        this.cruiseIcon = false
        this.timingIcon = false
        this.switchIcon = ''
        this.areaIcon = false
        if (this.pumpTimer !== null) {
          clearTimeout(this.pumpTimer)
          // this.pumpTimer = null
          this.pumpIcon = val
          this.pumpTimer = setTimeout(() => {
            // this.pumpTimer = null
            this.pumpIcon = ''
          }, 3000)
        } else {
          clearTimeout(this.pumpTimer)
          this.pumpIcon = val
          this.pumpTimer = setTimeout(() => {
            // this.pumpTimer = null
            this.pumpIcon = ''
          }, 3000)
        }
      },
      // 监听定速巡航
      onCruise(val) {
        clearTimeout(this.areaTimer)
        clearTimeout(this.switchTimer)
        clearTimeout(this.timingTimer)
        clearTimeout(this.pumpTimer)
        this.timingIcon = false
        this.pumpIcon = ''
        this.switchIcon = ''
        this.areaIcon = false
        this.pumpTimer = null
        if (this.cruiseTimer !== null) {
          clearTimeout(this.cruiseTimer)
          // this.timingTimer = null
          this.cruiseIcon = val
          this.cruiseTimer = setTimeout(() => {
            // this.timingTimer = null
            this.cruiseIcon = ''
          }, 3000)
        } else {
          clearTimeout(this.cruiseTimer)
          this.cruiseIcon = val
          this.cruiseTimer = setTimeout(() => {
            // this.timingTimer = null
            this.cruiseIcon = ''
          }, 3000)
        }
      },
      /**
       * 监听蓝牙信号强度
       */
      onBLEDeviceRSS() {
        uni.getBLEDeviceRSSI({
          deviceId: this.device.deviceId,
          success: (res) => {
            this.signal = Math.abs(res.RSSI)
            // console.log(this.signal);
          }
        })
      }
    },
  }
</script>

<style>
  /deep/ uni-switch .uni-switch-input {
    border: 2rpx solid #012D37 !important;
    background-color: #012D37;
  }

  /deep/ uni-switch .uni-switch-input:before {
    top: -1px !important;
    border: 2rpx solid #012D37 !important;
    background-color: #012D37 !important;
  }

  /deep/ uni-switch .uni-switch-input.uni-switch-input-checked:after {
    transform: translateX(70%) !important;
  }
</style>

<style lang="scss" scoped>
  .container {
    padding: 0 30rpx;
    // padding-top: 48rpx;
    box-sizing: border-box;

    .robot {
      width: 690rpx;
      height: 291.69rpx;
      margin-top: 40rpx;
      background: url("@/static/img/device/controller/controller_status_bar_bg.png") no-repeat;
      background-size: 690rpx 291.69rpx;
      padding: 30rpx 30rpx 0 30rpx;
      box-sizing: border-box;
      position: relative;

      .msg {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .msg-left {
          color: #FFF;
          font-size: 30rpx;
        }

        .msg-right {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .electric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #FFF;
            font-size: 26rpx;
            font-family: 'DIN Regular';

            .sum {
              margin-left: 9rpx;
              width: 51rpx;
              height: 26rpx;
              background: #012D37;
              border-radius: 2rpx 2rpx 2rpx 2rpx;
              opacity: 1;

              .residue {
                width: 26rpx;
                height: 26rpx;
                background: #44DB4B;
                border-radius: 2rpx 2rpx 2rpx 2rpx;
                opacity: 1;
              }

              .low-residue {
                background: red;
              }
            }
          }

          .bt {
            width: 60rpx;
            margin-left: 24rpx;
            display: flex;
            justify-content: space-between;
            align-items: center;

            image {
              width: 28rpx;
              height: 30rpx;
            }
          }
        }
      }

      .no-connect {
        width: 248rpx;
        height: 248rpx;
        position: absolute;
        left: 0;
        bottom: 0;
        pointer-events: none;

        image {
          padding: 10rpx 10rpx;
          width: 248rpx;
          height: 248rpx;
          box-sizing: border-box;
        }

        .malfunction {
          position: absolute;
          top: 0;
          left: 0;
          width: 248rpx;
          height: 248rpx;
        }

      }

      .working {
        width: 319.2rpx;
        height: 84rpx;
        background: url("@/static/img/device/controller/controller_working_bg.png");
        background-size: 319.2rpx 84rpx;
        position: absolute;
        top: 106rpx;
        left: 258rpx;
        color: #FFF;
        font-size: 42rpx;
        display: flex;
        justify-content: center;
        align-items: center;

        .uni-noticebar {
          width: 90%;
          margin: 0;

          /deep/ span {
            font-size: 42rpx !important;
          }
        }

        span {
          width: 90%;
          margin-left: 30rpx;

          /deep/ span {
            font-size: 42rpx !important;
          }
        }
      }

      .clean {
        // width: 300rpx;
        position: absolute;
        right: 0;
        top: 217rpx;
        color: #FFF;
        font-size: 28rpx;
        margin-right: 7rpx;
        font-family: "DIN Regular";
        display: flex;
        justify-content: flex-end;
        align-items: center;

        .text {}

        .switch {
          // background: #1d1d1d;
        }
      }
    }

    .popup {
      width: 670rpx;
      height: 366rpx;
      background: #222222;
      border-radius: 30rpx 30rpx 30rpx 30rpx;
      padding: 40rpx 30rpx;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;

      .header {
        display: flex;
        justify-content: flex-start;
        align-items: center;

        .label {
          font-size: 36rpx;
          color: #FFF;
        }

        .tips {
          margin-left: 20rpx;
          font-size: 26rpx;
          color: rgba(230, 34, 34, 1);
        }
      }

      .center {
        width: 610rpx;
        height: 86rpx;
        border-radius: 15rpx 15rpx 15rpx 15rpx;
        border: 1rpx solid #4E4E4E;
        display: flex;
        justify-content: center;
        align-items: center;
        color: rgba(199, 199, 199, 1);
        font-size: 32rpx;
        font-family: "DIN Black";
        margin-bottom: 1rpx;

        input {
          width: 548rpx;
        }
      }

      .footer {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        uni-button {
          width: 260rpx;
          height: 86rpx;
          background: #FF8616;
          border-radius: 15rpx 15rpx 15rpx 15rpx;
        }
      }
    }

    .popup-bt {
      // width: 750rpx;
      // height: 483rpx;
      background: #222222;
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
  }
</style>