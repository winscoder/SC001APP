<template>
  <view style="margin-top: 40rpx;">
    <!-- <scroll-view scroll-y="true" style="height: calc(100vh - 600rpx);"> -->
    <view class="task">
      <!-- 标签页区域 -->
      <view class="select" v-show="active === 'time' || active === 'area' || active === 'start'">
        <view :class="['time', active === 'time' && timeOrControlStatus ? 'active' : '']"
          @click="handleChangeSelect('time')">Time</view>
        <view
          :class="['area', (active === 'area' && timeOrControlStatus || active && timeOrControlStatus === 'start') ? 'active' : '']"
          @click="handleChangeSelect('area')">Area</view>
      </view>
      <view class="tip">
        <view v-show="active === 'time'">Please select the cleaning duration:</view>
        <view v-show="active === 'area'">Please select the area you want to clean:</view>
        <view style="margin-top: 10rpx;" v-show="active === 'control'">Please drive the robot to the starting point:
        </view>
      </view>

      <!-- 选择时间区域 -->
      <view class="select-time" v-show="active === 'time'">
        <scroll-view class="scroll-view" :scroll-x="true" :scroll-left="initLeft" @scroll="scroll"
          :show-scrollbar="false" scroll-with-animation>
          <!-- content 高度要通过计算 如果item 是数据请求的列表 可以到 style 找计算公式 -->
          <view class="content">
            <view :class="['scroll-view-item', scrollLeft === 0 ? 'active' : 'no-active']">0.5h</view>
            <view :class="['scroll-view-item', scrollLeft === 75 ? 'active' : 'no-active']">1.0h</view>
            <view :class="['scroll-view-item', scrollLeft === 135 ? 'active' : 'no-active']">1.5h</view>
            <view :class="['scroll-view-item', scrollLeft === 195 ? 'active' : 'no-active']">2.0h</view>
            <view :class="['scroll-view-item', scrollLeft === 255 ? 'active' : 'no-active']">2.5h</view>
            <view :class="['scroll-view-item', scrollLeft === 315 ? 'active' : 'no-active']">3.0h</view>
          </view>
        </scroll-view>
        <view class="always">
          <view class="icon" @click="handleIsShowAlways">
            <view class="dot" v-show="isShowAlawys"></view>
          </view>
          <view>Set as default</view>
        </view>
        <view :class="[ timeOrControlStatus ? 'btn' : 'no-btn']" style="margin-top: 135rpx;" @click="handleSetTimeTask">
          <button>Confirm</button>
        </view>
        <!-- 禁止滑动scroll -->
        <view class="not-scroll" v-if="!timeOrControlStatus"></view>
      </view>

      <!-- 选择区域的区域 -->
      <view class="select-area" v-show="active === 'area'">
        <view class="icon">
          <view @click="handleChangetaskIcon('left')">
            <view class="left-active" v-show="taskActive === 'left'">
              <!-- <image class="active" src="@/static/img/device/task/task_left_region_check.png"
                  mode=""></image> -->
              <view
                style="width: 90%; height: 49rpx; background: #222222; font-size: 32rpx; position: absolute; top: 265rpx; left: 5%; color: #FFFFFF; text-align: center;">
                Left Side
              </view>
            </view>
            <view class="left-no-active" v-show="taskActive === 'right'">
              <view
                style="width: 100%; height: 39rpx; background: #191919; font-size: 32rpx; position: absolute; top: 245rpx; left: 0; color: rgba(135, 135, 135, 1); text-align: center;">
                Left Side
              </view>
              <!-- <image v-show="taskActive === 'right'" class="no-active"
                  src="@/static/img/device/task/task_left_region_normal.png" mode=""></image> -->
            </view>
          </view>
          <view @click="handleChangetaskIcon('right')">
            <view class="right-active" v-show="taskActive === 'right'">
              <view
                style="width: 90%; height: 49rpx; background: #222222; font-size: 32rpx; position: absolute; top: 265rpx; left: 5%; color: #FFFFFF; text-align: center;">
                Right Side
              </view>
              <!-- <image class="active"
                  src="@/static/img/device/task/task_right_region_check.png" mode=""></image> -->
            </view>
            <view class="right-no-active" v-show="taskActive === 'left'">
              <view
                style="width: 100%; height: 39rpx; background: #191919; font-size: 32rpx; position: absolute; top: 245rpx; left: 0; color: rgba(135, 135, 135, 1); text-align: center;">
                Right Side
              </view>
              <!-- <image class="no-active"
                  src="@/static/img/device/task/task_right_region_normal.png" mode=""></image> -->
            </view>
          </view>
        </view>
        <view :class="[ timeOrControlStatus ? 'btn' : 'no-btn']">
          <button type="default" @click="handleAreaConfirm">Confirm</button>
        </view>
      </view>

      <!-- 确认区域的区域 -->
      <!-- <view class="control" v-show="active === 'control'">
          <image src="@/static/img/device/controller/controller_rocker_bg.png" mode=""></image>
        </view> -->
      <view v-show="active === 'control'">
        <controller type="2"></controller>
      </view>

      <!-- 执行区域规划任务区域 -->
      <view class="control-bnts" v-show="active === 'control'">
        <view :class="[ timeOrControlStatus ? 'back' : 'no-btn']">
          <button @click="handleControlBack">Back</button>
        </view>
        <view :class="[ timeOrControlStatus ? 'region-start' : 'no-btn']">
          <button @click="handleControlStart">Start</button>
        </view>
      </view>

      <!-- 开始区域 -->
      <view class="area-start" v-show="active === 'start'">
        <view style="color: #FFFFFF; font-size: 46rpx;">
          {{startTip}}
        </view>
        <view style="width: 158rpx; color: #C7C7C7; font-size: 28rpx; margin-top: 20rpx; text-align: center;">
          Automatically
          Cleaning
        </view>
      </view>

      <!-- 开始的按钮区域 -->
      <view :class="[ timeOrControlStatus ? 'stop' : 'no-btn']" v-show="active === 'start'" @click="handleStopClean">
        <button>Stop</button>
      </view>
    </view>
    <!-- </scroll-view> -->
  </view>
</template>

<script>
  import {
    writeBLECharacteristicValue
  } from "@/utils/initBluetooth.js"
  import {
    mapState,
    mapMutations
  } from "vuex";

  import {
    rpxTopx
  } from "@/utils/rpxToPx.js"
  import {
    crc16xmodem
  } from "@/utils/CRC_XMODEM.js"

  const zeroFive = rpxTopx(60 * 2)
  const oneZero = rpxTopx(120 * 2)
  const oneFive = rpxTopx(180 * 2)
  const twoZero = rpxTopx(240 * 2)
  const twoFive = rpxTopx(300 * 2)

  export default {
    name: "task",
    watch: {
      timeOrControlStatus(newValue) {
        // if (newValue) {
        //   this.active = 'time'
        //   return
        // } else {
        //   this.active = ''
        //   return
        // }
      },
      "deviceStore.work_cycle_set": {
        handler(newVal, oldVal) {
          switch (newVal ? newVal : this.deviceStore.work_cycle_set) {
            case 0:
              setTimeout(() => {
                this.scrollLeft = 0
                this.initLeft = rpxTopx((0 + 20) * 2)
              }, 200)
              break;
            case 1:
              setTimeout(() => {
                this.scrollLeft = 75
                this.initLeft = rpxTopx((75 + 20) * 2)
              }, 200)
              break;
            case 2:
              setTimeout(() => {
                this.scrollLeft = 135
                this.initLeft = rpxTopx((135 + 20) * 2)
              }, 200)
              break;
            case 3:
              setTimeout(() => {
                this.scrollLeft = 195
                this.initLeft = rpxTopx((195 + 20) * 2)
              }, 200)
              break;
            case 4:
              setTimeout(() => {
                this.scrollLeft = 255
                this.initLeft = rpxTopx((255 + 20) * 2)
              }, 200)
              break;
            case 5:
              setTimeout(() => {
                this.scrollLeft = 315
                this.initLeft = rpxTopx((315 + 20) * 2)
              }, 200)
              break;
            default:
              setTimeout(() => {
                this.scrollLeft = 195
                this.initLeft = rpxTopx((195 + 20) * 2)
              }, 200)
              break;
          }
        },
        immediate: true
      }
    },
    data() {
      return {
        // 初始化scrollLeft
        initLeft: null,
        // 标签页的活跃
        active: "time",
        // 滚动的位置
        scrollLeft: 195,
        // 区域的活跃
        taskActive: "left",
        isShowAlawys: false,
        timeBnt: false,
        startTip: "",
      };
    },
    mounted() {
      // uni.getStorageSync('scrollLeft') ? this.initLeft = uni.getStorageSync('scrollLeft') : rpxTopx(215 * 2) // 195 + 20
      // this.timeOrControlStatus ? this.scrollLeft = 195 : this.scrollLeft = 0
    },
    computed: {
      ...mapState(['deviceStore', 'linkStatus']),

      // 处理设置时间和区域清洁任务的状态
      timeOrControlStatus() {
        if (this.deviceStore.state == '等待' || this.deviceStore.state == '充电') return false
        if (this.deviceStore.start_exception == '启动异常' || this.deviceStore.start_exception == '其它异常') return false
        if (this.linkStatus !== 'success') return false
        if (this.deviceStore.low_bat_flag == '低电状态') return false
        if (this.deviceStore.filter_exception == '堵网异常') return false
        if (this.deviceStore.bldc_exception !== '工作正常' && this.deviceStore.bldc_exception !== '') return false
        if (this.deviceStore.left_dc_exception == '其他异常' || this.deviceStore.left_dc_exception == '电机堵转') return false
        if (this.deviceStore.right_dc_exception == '其他异常' || this.deviceStore.right_dc_exception == '电机堵转') return false
        if (this.deviceStore.battery_exception !== '工作正常' && this.deviceStore.battery_exception !== '') return false
        if (this.deviceStore.system_exception === '系统异常' || this.deviceStore.system_exception === '其他异常') return false

        return true
      }
    },
    methods: {
      ...mapMutations(['handleChangeStateText', 'handleStateTextTimer']),

      // 处理标签切换
      handleChangeSelect(text) {
        if (!this.timeOrControlStatus) return
        if (this.active === "start") return
        this.active = text
      },
      // 监听滑动事件
      scroll({
        target: {
          scrollLeft
        }
      }) {
        // console.log(scrollLeft);
        // 根据 scroll-item 的长度 scrollLeft < margin-right * (i) 
        if (scrollLeft < zeroFive) {
          this.scrollLeft = 0
          return
        } else if (scrollLeft < oneZero) {
          this.scrollLeft = 75 // 右外边距 * i + 盒子宽度 / 4
          return
        } else if (scrollLeft < oneFive) {
          this.scrollLeft = 135
          return
        } else if (scrollLeft < twoZero) {
          this.scrollLeft = 195
          return
        } else if (scrollLeft < twoFive) {
          this.scrollLeft = 255
          return
        } else {
          this.scrollLeft = 315
        }
      },
      // 处理点击切换 区域方向
      handleChangetaskIcon(text) {
        this.taskActive = text
      },
      // 处理区域的确认点击
      handleAreaConfirm() {
        this.active = "control"
      },
      // 处理清洁的返回点击
      handleControlBack() {
        if (!this.timeOrControlStatus) return
        this.active = "area"
      },
      // 处理清洁的开始点击
      handleControlStart() {
        if (!this.timeOrControlStatus) return

        this.$emit('onArea', 'start')
        this.active = "start"
        this.handleChangeStateText('Set Area Cleaning Task')
        this.handleStateTextTimer(uni.getStorageSync('stateText'))
        if (this.taskActive === 'left') {
          this.startTip = "Left Side"
          writeBLECharacteristicValue('6A 02 B4 01 00 00 89 91 0A')
        } else {
          this.startTip = "Right Side"
          writeBLECharacteristicValue('6A 02 B4 01 00 01 A8 81 0A')
        }
      },
      // 处理停止清洁
      handleStopClean() {
        if (!this.timeOrControlStatus) return
        this.active = "area"
        writeBLECharacteristicValue('6A 04 B3 01 00 00 21 0D 0A')
        this.$emit('onArea', 'close')
      },
      // 处理点击是否选择记录当前时间段
      handleIsShowAlways() {
        this.isShowAlawys = !this.isShowAlawys
      },
      // 处理设置工作时间任务
      handleSetTimeTask() {
        console.log(this.scrollLeft);
        if (!this.timeOrControlStatus) return

        if (this.timeBnt) return
        setTimeout(() => {
          this.timeBnt = false
        })

        this.timeBnt = true

        this.$emit('onTiming')
        const isSave = this.isShowAlawys ? '01' : '00'
        switch (this.scrollLeft) {
          case 0:
            writeBLECharacteristicValue(`6A 01 B4 02 00 00 ${isSave} ${crc16xmodem(`6A 01 B4 02 00 00 ${isSave}`)} 0A`)
            break;
          case 75:
            writeBLECharacteristicValue(`6A 01 B4 02 00 01 ${isSave} ${crc16xmodem(`6A 01 B4 02 00 01 ${isSave}`)} 0A`)
            break;
          case 135:
            writeBLECharacteristicValue(`6A 01 B4 02 00 02 ${isSave} ${crc16xmodem(`6A 01 B4 02 00 02 ${isSave}`)} 0A`)
            break;
          case 195:
            writeBLECharacteristicValue(`6A 01 B4 02 00 03 ${isSave} ${crc16xmodem(`6A 01 B4 02 00 03 ${isSave}`)} 0A`)
            break;
          case 255:
            writeBLECharacteristicValue(`6A 01 B4 02 00 04 ${isSave} ${crc16xmodem(`6A 01 B4 02 00 04 ${isSave}`)} 0A`)
            break;
          case 315:
            writeBLECharacteristicValue(`6A 01 B4 02 00 05 ${isSave} ${crc16xmodem(`6A 01 B4 02 00 05 ${isSave}`)} 0A`)
            break;
          default:
            break;
        }

        this.handleChangeStateText('Set Timed Task')
        this.handleStateTextTimer(uni.getStorageSync('stateText'))
        uni.$showMsg("successfully set")
      }
    }
  }
</script>

<style lang="scss" scoped>
  /* 解决小程序和app滚动条的问题 */
  /* #ifdef MP-WEIXIN || APP-PLUS */
  /deep/ uni-scroll-view .uni-scroll-view::-webkit-scrollbar {
    display: none;
  }

  /* #endif */
  /* 解决H5 的问题 */
  /* #ifdef H5 */
  /deep/ uni-scroll-view .uni-scroll-view::-webkit-scrollbar {
    /* 隐藏滚动条，但依旧具备可以滚动的功能 */
    display: none
  }

  /* #endif */

  .task {
    // min-height: 700rpx;
    padding-bottom: 40rpx;

    .select {
      width: 278rpx;
      height: 62rpx;
      margin: 0 206rpx;
      background: #262626;
      border-radius: 31rpx 31rpx 31rpx 31rpx;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      color: #888888;
      font-size: 28rpx;

      .time,
      .area {
        width: 139rpx;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .active {
        width: 139rpx;
        height: 62rpx;
        background: #FF8616;
        color: #111111;
        border-radius: 31rpx 31rpx 31rpx 31rpx;
      }

      .no-active {
        width: 139rpx;
        height: 62rpx;
        background: #888888;
        color: #111111;
        border-radius: 31rpx 31rpx 31rpx 31rpx;
      }
    }

    .tip {
      color: #888888;
      font-size: 28rpx;
      margin-top: 20rpx !important;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 30rpx;
    }

    .select-time {
      margin-top: 100rpx;
      margin-top: 0 30rpx;
      position: relative;

      .not-scroll {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .scroll-view {
        width: 100%;
        height: 90rpx;
        color: #FFFFFF;
        font-size: 32rpx;
        white-space: nowrap;
        font-family: "DIN Black";

        .content {
          width: 1360rpx; // 是 item 的数量 * margin * item 宽度 * + 最后一个和第一个的 margin-left / margin-right
          height: 90rpx;
          display: flex;
          justify-content: flex-start;
          align-items: center;


          .scroll-view-item {
            width: 120rpx;
            margin-right: 60rpx;
          }

          .scroll-view-item:last-child {
            margin-right: 312rpx; // 52*6 （最后一个在中心位置）
          }

          .scroll-view-item:first-of-type {
            margin-left: 312rpx; // 52*6 （第一个在中心位置）
          }

          .active {
            font-size: 65rpx;
            transition: font-size 0.25s linear;
          }

          .no-active {
            font-size: 37rpx;
            transition: font-size 0.25s linear;
          }
        }
      }

      .always {
        margin-left: 249rpx;
        margin-top: 80rpx;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        color: #888888;
        font-size: 26rpx;

        .icon {
          width: 25rpx;
          height: 25rpx;
          margin-right: 11rpx;
          border-radius: 50%;
          border: 1rpx solid #888888;
          position: relative;

          .dot {
            width: 20rpx;
            height: 20rpx;
            border-radius: 50%;
            background: #FF8616;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }

        image {
          width: 25rpx;
          height: 25rpx;
        }


      }

      .btn {
        margin-top: 183rpx;
        // padding-bottom: 86rpx;
        // position: fixed;
        // bottom: 30rpx;
        // left: 254rpx;

        uni-button {
          margin-top: 127rpx;

          width: 242rpx;
          height: 86rpx;
          background: #FF8616;
        }
      }
    }

    .select-area {
      // width: 626rpx;
      height: 353rpx;
      margin-top: 50rpx;

      .icon {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .no-active {
        width: 314rpx;
        height: 314rpx;
      }

      .active {
        width: 353rpx;
        height: 353rpx;
      }

      .left-active {
        width: 353rpx;
        height: 353rpx;
        background: url("@/static/img/device/task/task_left_region_check.png") no-repeat;
        background-size: 353rpx 353rpx;
        box-sizing: border-box;
        position: relative;
      }

      .left-no-active {
        width: 314rpx;
        height: 314rpx;
        background: url('@/static/img/device/task/task_left_region_normal.png') no-repeat;
        background-size: 314rpx 314rpx;
        box-sizing: border-box;
        position: relative;
      }

      .right-active {
        width: 353rpx;
        height: 353rpx;
        background: url('@/static/img/device/task/task_right_region_check.png') no-repeat;
        background-size: 353rpx 353rpx;
        box-sizing: border-box;
        position: relative;
      }

      .right-no-active {
        width: 314rpx;
        height: 314rpx;
        background: url('@/static/img/device/task/task_right_region_normal.png') no-repeat;
        background-size: 314rpx 314rpx;
        box-sizing: border-box;
        position: relative;
      }

      .btn {
        margin-top: 75rpx;
        // margin-bottom: 86rpx;

        uni-button {
          width: 242rpx;
          height: 86rpx;
          background: #FF8616;
        }
      }
    }

    .control {
      width: 570rpx;
      height: 570rpx;
      margin: 0 60rpx;
      // margin-top: 50rpx;
      background: url("@/static/img/device/controller/controller_area_up.png") no-repeat;
      background-size: 570rpx 570rpx;
      position: relative;

      image {
        width: 108rpx;
        height: 108rpx;
        position: absolute;
        left: 234rpx;
        top: 136rpx;
      }
    }

    .control-bnts {
      width: calc(100vw - 60rpx);
      position: fixed;
      bottom: 20rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      // margin-top: 40rpx;
      // margin-bottom: 86rpx;

      .back {
        uni-button {
          width: 180rpx;
          height: 86rpx;
          border: 1rpx solid #FF8616;
          color: #FF8616;
          background: #111111;
        }
      }

      .region-start {
        uni-button {
          width: 180rpx;
          height: 86rpx;
          background: #FF8616;
        }
      }
    }

    .area-start {
      margin: 60rpx 175rpx 94rpx 175rpx;
      width: 340rpx;
      height: 340rpx;
      background: url("@/static/img/device/controller/controller_rocker_ban.png") no-repeat;
      background-size: 340rpx 340rpx;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .stop {
      margin-bottom: 186rpx;

      uni-button {
        width: 180rpx;
        height: 86rpx;
        background: #FF8616;
      }
    }

    .no-btn {
      // margin-top: 75rpx;

      uni-button {
        width: 242rpx;
        height: 86rpx;
        background: #262626;
        color: #888888;
      }
    }
  }
</style>