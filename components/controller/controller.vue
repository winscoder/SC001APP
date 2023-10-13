<template>
  <view class="controller" :style="controlStyle">
    <!-- 控制区域 -->
    <view class="control">
      <view class="icon">
        <image :src="controlIcon" mode=""></image>
      </view>
      <!-- @touchcancel="handleTouchend" 触电中断 -->
      <view class="move" @touchstart="handleTouchstart" @touchmove="handleContrilMove" @touchend="handleTouchend">
        <view class="ban" :style="{left:left+'px',top:top+'px'}">
          <image v-show="!moveStatus" src="@/static/img/device/controller/controller_rocker_ban.png" mode="">
          </image>
          <image v-show="moveStatus" src="@/static/img/device/controller/controller_rocker_bg.png" mode=""></image>
        </view>
      </view>
    </view>

    <view class="cruise" v-if="type === '1'" :style="{'padding-bottom': safeAreaHeight + 'px'}">
      <view class="left" @click="handleChangeKeep">
        <image v-show="isOpenKeep && keepStatus" src="@/static/img/device/controller/controller_cruise_check.png"
          mode=""></image>
        <image v-show="!isOpenKeep && keepStatus" src="@/static/img/device/controller/controller_cruise_normal.png"
          mode=""></image>
        <image v-show="!keepStatus" src="@/static/img/device/controller/controller_cruise_ban.png" mode=""></image>
      </view>
      <view class="right">
        <view class="suction">
          <image src="@/static/img/device/controller/controller_suction.png" mode=""></image>
          <text class="text">Suction</text>
        </view>
        <view :class="['x1', isOpenWaterPump === 'off' && waterPumpStatus && !isCruise ? 'switch' : 'switch_ban']"
          @click="handleOpenWaterPump('off')">
          OFF
        </view>
        <view :class="['x1', isOpenWaterPump === 'x1' && waterPumpStatus && !isCruise ? 'switch' : 'switch_ban']"
          @click="handleOpenWaterPump('x1')">
          X1
        </view>
        <view :class="['x1', isOpenWaterPump === 'x2' && waterPumpStatus && !isCruise ? 'switch' : 'switch_ban']"
          @click="handleOpenWaterPump('x2')">
          X2
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import {
    defaults
  } from 'lodash';
  import {
    mapState,
    mapMutations
  } from 'vuex';

  import {
    writeBLECharacteristicValue
  } from "../../utils/initBluetooth.js"

  let startLeft, startTop;
  // 两点之间的距离函数
  const getDistance = function(x1, y1, x2, y2) {
    // 手指滑动的距离取绝对值Math.abs
    let _x = Math.abs(x1 - x2);
    let _y = Math.abs(y1 - y2);
    // Math.sqrt求平方根
    return Math.sqrt(_x * _x + _y * _y);
  }

  let topTimer = null
  let top2Timer = null
  let rightTimer = null
  let downTimer = null
  let down2Timer = null
  let leftTimer = null

  export default {
    name: "controller",
    watch: {
      // 监听滑动位置
      direction(newValue, oldValue) {
        switch (newValue) {
          case 'top':
            this.controlIcon = require('@/static/img/device/controller/controller_area_up.png')
            if (this.stickHeight < 60) {
              clearInterval(top2Timer)
              clearInterval(rightTimer)
              clearInterval(downTimer)
              clearInterval(down2Timer)
              clearInterval(leftTimer)
              top2Timer = null
              rightTimer = null
              down2Timer = null
              downTimer = null
              leftTimer = null
              if (topTimer) return
              topTimer = setInterval(() => {
                this.handleControlDirection('6A 01 B3 02 00 00 01 51 38 0A')
              }, 200)
            } else {
              clearInterval(topTimer)
              clearInterval(rightTimer)
              clearInterval(downTimer)
              clearInterval(down2Timer)
              clearInterval(leftTimer)
              topTimer = null
              rightTimer = null
              down2Timer = null
              downTimer = null
              leftTimer = null
              if (top2Timer) return
              top2Timer = setInterval(() => {
                this.handleControlDirection('6A 01 B3 02 00 00 02 32 08 0A')
              }, 200)
            }
            break;
          case 'right':
            this.controlIcon = require('@/static/img/device/controller/controller_area_right.png')
            clearInterval(topTimer)
            clearInterval(top2Timer)
            clearInterval(down2Timer)
            clearInterval(downTimer)
            clearInterval(leftTimer)
            topTimer = null
            top2Timer = null
            down2Timer = null
            downTimer = null
            leftTimer = null
            if (rightTimer) return
            rightTimer = setInterval(() => {
              this.handleControlDirection('6A 01 B3 02 00 03 01 02 6D 0A')
            }, 200)
            break;
          case 'down':
            this.controlIcon = require('@/static/img/device/controller/controller_area_down.png')
            if (this.stickHeight < 60) {
              clearInterval(topTimer)
              clearInterval(top2Timer)
              clearInterval(rightTimer)
              clearInterval(down2Timer)
              clearInterval(leftTimer)
              topTimer = null
              top2Timer = null
              rightTimer = null
              down2Timer = null
              leftTimer = null
              if (downTimer) return
              downTimer = setInterval(() => {
                this.handleControlDirection('6A 01 B3 02 00 01 01 60 0B 0A')
              }, 200)
            } else {
              clearInterval(topTimer)
              clearInterval(top2Timer)
              clearInterval(rightTimer)
              clearInterval(downTimer)
              clearInterval(leftTimer)
              topTimer = null
              top2Timer = null
              rightTimer = null
              downTimer = null
              leftTimer = null
              if (down2Timer) return
              down2Timer = setInterval(() => {
                this.handleControlDirection('6A 01 B3 02 00 01 02 03 3B 0A')
              }, 200)
            }
            break;
          case 'left':
            this.controlIcon = require('@/static/img/device/controller/controller_area_left.png')
            clearInterval(topTimer)
            clearInterval(top2Timer)
            clearInterval(down2Timer)
            clearInterval(downTimer)
            clearInterval(rightTimer)
            topTimer = null
            top2Timer = null
            down2Timer = null
            downTimer = null
            rightTimer = null
            if (leftTimer) return
            leftTimer = setInterval(() => {
              this.handleControlDirection('6A 01 B3 02 00 02 01 33 5E 0A')
            }, 200)
            break;
        }
      },
      // 监听摇杆拖动距离
      stickHeight(newValue, oldValue) {
        if (newValue === null) return
        if (newValue < 60 && this.direction === 'top') {
          clearInterval(top2Timer)
          clearInterval(rightTimer)
          clearInterval(downTimer)
          clearInterval(down2Timer)
          clearInterval(leftTimer)
          top2Timer = null
          rightTimer = null
          down2Timer = null
          downTimer = null
          leftTimer = null
          if (topTimer) return
          topTimer = setInterval(() => {
            this.handleControlDirection('6A 01 B3 02 00 00 01 51 38 0A')
          }, 200)
        } else if (newValue >= 60 && this.direction === 'top') {
          clearInterval(topTimer)
          clearInterval(rightTimer)
          clearInterval(downTimer)
          clearInterval(down2Timer)
          clearInterval(leftTimer)
          topTimer = null
          rightTimer = null
          down2Timer = null
          downTimer = null
          leftTimer = null
          if (top2Timer) return
          top2Timer = setInterval(() => {
            this.handleControlDirection('6A 01 B3 02 00 00 02 32 08 0A')
          }, 200)
        } else if (newValue < 60 && this.direction === 'down') {
          clearInterval(topTimer)
          clearInterval(top2Timer)
          clearInterval(rightTimer)
          clearInterval(down2Timer)
          clearInterval(leftTimer)
          topTimer = null
          top2Timer = null
          rightTimer = null
          down2Timer = null
          leftTimer = null
          if (downTimer) return
          downTimer = setInterval(() => {
            this.handleControlDirection('6A 01 B3 02 00 01 01 60 0B 0A')
          }, 200)
        } else if (newValue >= 60 && this.direction === 'down') {
          clearInterval(topTimer)
          clearInterval(top2Timer)
          clearInterval(rightTimer)
          clearInterval(downTimer)
          clearInterval(leftTimer)
          topTimer = null
          top2Timer = null
          rightTimer = null
          downTimer = null
          leftTimer = null
          if (down2Timer) return
          down2Timer = setInterval(() => {
            this.handleControlDirection('6A 01 B3 02 00 01 02 03 3B 0A')
          }, 200)
        }
      },
      // 监听倾斜角度
      angle(newValue, oldValue) {
        if (newValue === null) return

        if (newValue >= -2.36 && newValue < -0.78) {
          this.direction = 'top'
        } else if (newValue >= -0.78 && newValue < 0.81) {
          this.direction = 'right'
        } else if (newValue >= 0.81 && newValue < 2.36) {
          this.direction = 'down'
        } else if (newValue >= 2.36 || newValue < -2.36) {
          this.direction = 'left'
        }
      },
      // 监听是否禁止水泵状态
      waterPumpStatus(newValue) {
        if (newValue) {
          this.isOpenWaterPump = "off"
        } else {
          this.isOpenWaterPump = ""
        }
      },
      "deviceStore.pump_power"(newVal) {
        switch (newVal) {
          case '熄火':
            this.isOpenWaterPump = 'off'
            break
          case "常规":
            this.isOpenWaterPump = 'x1'
            break
          case '强力':
            this.isOpenWaterPump = 'x2'
            break
        }
      },
      // 监听是否禁止摇杆
      moveStatus(newValue) {
        console.log(newValue);
        if (newValue) {
          // if (this.linkStatus !== 'success') return this.isMove = false
          // this.isMove = true
        } else {
          // this.isMove = false
        }
      },
      linkStatus(newValue) {
        if (newValue !== 'success') {
          this.isMove = false
          this.banIcon = require('@/static/img/device/controller/controller_rocker_ban.png')
          this.$nextTick(() => {
            this.controlIcon = require('@/static/img/device/controller/controller_area_bg.png')
            this.direction = 'stop'
            this.top = 0
            this.left = 0
            this.angle = null
            this.stickHeight = null
            clearInterval(topTimer)
            clearInterval(top2Timer)
            clearInterval(rightTimer)
            clearInterval(downTimer)
            clearInterval(down2Timer)
            clearInterval(leftTimer)
            topTimer = null
            top2Timer = null
            rightTimer = null
            downTimer = null
            down2Timer = null
            leftTimer = null
          })
        } else {
          this.isMove = true
        }
      },
      'deviceStore.cruise'(newVal) {
        if (newVal === '开启') {
          this.isOpenKeep = true
        } else if (newVal === '关闭') {
          this.isOpenKeep = false
        }
      },
      "deviceStore.state"(newVal) {
        if (newVal === '等待' || newVal === '充电') {
          this.isMove = false
        }
      }

    },
    props: {
      type: {
        type: String,
        default: '1'
      }
    },
    data() {
      return {
        currentIndex: 0,
        // 控制上下左右的图片
        controlIcon: require('@/static/img/device/controller/controller_area_bg.png'),
        // 滑动icon是否处于活跃状态
        isMove: false,
        direction: "stop",
        // 开关水泵
        isOpenWaterPump: 'off',
        // 开关定速导航
        isOpenKeep: false,
        left: 0, //摇杆图标显示位置
        top: 0,
        ballMoveRadius: 100, //杆头的移动范围半径
        stickHeight: null, // 摇杆拖动距离
        angle: null, // 倾斜角度,
        // 是否禁用水泵
        isCruise: false,
        safeAreaHeight: 0,
        keepBtn: false,
        cruiseBtn: false,
        controlStyle: {}
      };
    },
    computed: {
      ...mapState(['deviceId', 'deviceStore', 'linkStatus', 'stateText']),

      // 是否禁止定速巡航状态
      keepStatus() {
        if (this.deviceStore.state == '等待' || this.deviceStore.state == '充电') return false
        if (this.deviceStore.start_exception == '启动异常' || this.deviceStore.start_exception == '其它异常') return false
        if (this.linkStatus !== 'success') return false
        if (this.deviceStore.left_dc_exception == '其他异常' || this.deviceStore.left_dc_exception == '电机堵转') return false
        if (this.deviceStore.right_dc_exception == '其他异常' || this.deviceStore.right_dc_exception == '电机堵转') return false

        return true
      },

      // 是否禁止水泵开关状态
      waterPumpStatus() {
        if (this.deviceStore.state == '等待' || this.deviceStore.state == '充电') return false
        if (this.deviceStore.state == '闲置') return false
        if (this.deviceStore.start_exception == '启动异常' || this.deviceStore.start_exception == '其它异常') return false
        if (this.linkStatus !== 'success') return false
        if (this.deviceStore.low_bat_flag == '低电状态') return false
        if (this.deviceStore.filter_exception == '堵网异常') return false
        if (this.deviceStore.bldc_exception !== '工作正常' && this.deviceStore.bldc_exception !== '') return false
        if (this.deviceStore.left_dc_exception == '其他异常' || this.deviceStore.left_dc_exception == '电机堵转') return false
        if (this.deviceStore.right_dc_exception == '其他异常' || this.deviceStore.right_dc_exception == '电机堵转') return false
        if (this.deviceStore.battery_exception !== '工作正常' && this.deviceStore.battery_exception !== '') return false
        if (this.deviceStore.system_exception === '系统异常' || this.deviceStore.system_exception === '其他异常') return false
        if (this.deviceStore.movement_exception === '围困异常') return false
        
        return true
      },

      // 处理摇杆高亮状态
      moveStatus() {
        if (this.deviceStore.state == '等待' || this.deviceStore.state == '充电') return false
        if (this.deviceStore.start_exception == '启动异常' || this.deviceStore.start_exception == '其它异常') return false
        if (this.linkStatus !== 'success') return false
        if (this.deviceStore.left_dc_exception == '其他异常' || this.deviceStore.left_dc_exception == '电机堵转') return false
        if (this.deviceStore.right_dc_exception == '其他异常' || this.deviceStore.right_dc_exception == '电机堵转') return false
        return true
      }
    },
    mounted() {
      const system = uni.getSystemInfoSync()
      this.safeAreaHeight = system.safeAreaInsets.bottom
      if (system.platform === 'ios') {
        this.controlStyle = {
          'height': 'calc(100vh - 260rpx - 80rpx - 210rpx - 310rpx)'
        }
      } else {
        this.controlStyle = {
          'height': 'calc(100vh - 260rpx - 80rpx - 210rpx - 220rpx)'
        }
      }
    },
    methods: {
      ...mapMutations(['handleChangeStateText', 'handleStateTextTimer', 'handleDeviceState']),

      // 处理手指触摸事件
      handleTouchstart(e) {
        if (!this.moveStatus) return
        var curTouch = e.touches[0];
        const systemWidth = uni.getSystemInfoSync().windowWidth;
        const leftRpxToPx = (systemWidth / 750) * 375
        const rightRpxTopx = (systemWidth / 750) * 884

        // 获取触摸坐标
        startLeft = curTouch.clientX - this.left;
        startTop = curTouch.clientY - this.top;


        // 两点之间的距离函数算出斜边距离
        // console.log(startLeft, startTop);
        let distance = getDistance(startLeft, startTop, leftRpxToPx, rightRpxTopx);
        // 限制移动范围
        if (distance >= this.ballMoveRadius) distance = this.ballMoveRadius;
        // 移动的夹角Math.atan2 当前坐标移动到目标坐标 之间的夹角
        const angle = Math.atan2((startTop - rightRpxTopx), (startLeft - leftRpxToPx));
        // 知道夹角和斜边 计算出 两个邻边
        this.left = Math.cos(angle) * distance;
        this.top = Math.sin(angle) * distance;
        // 摇杆拖动距离
        this.stickHeight = distance;
        // 倾斜角
        this.angle = angle;
      },
      // 处理遥控器手触摸动作结束
      handleTouchend() {
        if (this.deviceStore.state == '等待' || this.deviceStore.state == '充电') return
        if (this.deviceStore.start_exception == '启动异常' || this.deviceStore.start_exception == '其它异常') return
        if (this.linkStatus !== 'success') return
        if (this.deviceStore.left_dc_exception == '其他异常' || this.deviceStore.left_dc_exception == '电机堵转') return
        if (this.deviceStore.right_dc_exception == '其他异常' || this.deviceStore.right_dc_exception == '电机堵转') return
        console.log('手指抬起');

        this.banIcon = require('@/static/img/device/controller/controller_rocker_ban.png')
        this.$nextTick(() => {
          this.controlIcon = require('@/static/img/device/controller/controller_area_bg.png')
          this.direction = 'stop'
          this.top = 0
          this.left = 0
          this.angle = null
          this.stickHeight = null
          clearInterval(topTimer)
          clearInterval(top2Timer)
          clearInterval(rightTimer)
          clearInterval(downTimer)
          clearInterval(down2Timer)
          clearInterval(leftTimer)
          topTimer = null
          top2Timer = null
          rightTimer = null
          downTimer = null
          down2Timer = null
          leftTimer = null
        })
      },
      // 处理遥控器滑动事件
      handleContrilMove(e) {
        if (this.deviceStore.state == '等待' || this.deviceStore.state == '充电') return
        if (this.deviceStore.start_exception == '启动异常' || this.deviceStore.start_exception == '其它异常') return
        if (this.linkStatus !== 'success') return
        if (this.deviceStore.left_dc_exception == '其他异常' || this.deviceStore.left_dc_exception == '电机堵转') return
        if (this.deviceStore.right_dc_exception == '其他异常' || this.deviceStore.right_dc_exception == '电机堵转') return

        const curTouch = e.touches[0];
        // 相当于两个点的距离公式中 x2-x1 y2-y1
        const tleft = curTouch.clientX - startLeft;
        const ttop = curTouch.clientY - startTop;

        // 两点之间的距离函数算出斜边距离
        let distance = getDistance(tleft, ttop, 0, 0);
        // 限制移动范围
        if (distance >= this.ballMoveRadius) distance = this.ballMoveRadius;
        // 移动的夹角Math.atan2 当前坐标移动到目标坐标 之间的夹角
        const angle = Math.atan2((ttop - 0), (tleft - 0));
        // 知道夹角和斜边 计算出 两个邻边
        this.left = Math.cos(angle) * distance;
        this.top = Math.sin(angle) * distance;
        // 摇杆拖动距离
        this.stickHeight = distance;
        // 倾斜角
        this.angle = angle;
      },
      // 处理控制方向的移动
      handleControlDirection(hexString) {
        console.log(hexString);
        writeBLECharacteristicValue(hexString)
      },
      // 处理水泵开关
      handleOpenWaterPump(value) {
        if (!this.waterPumpStatus) return
        if (this.isCruise) return

        if (this.cruiseBtn) return

        setTimeout(() => {
          this.cruiseBtn = false
        }, 200)
        this.cruiseBtn = true

        this.isOpenWaterPump = value
        if (value === 'off') {
          this.$emit('onPump', '熄火')
          // this.handleDeviceState({
          //   ...this.deviceStore,
          //   pump_power: '熄火'
          // })
          writeBLECharacteristicValue('6A 02 B3 01 00 00 A4 C0 0A')
          this.handleChangeStateText('Suction Power Off')
          this.handleStateTextTimer(uni.getStorageSync('stateText'))
        } else if (value === 'x1') {
          this.$emit('onPump', '常规')
          // this.handleDeviceState({
          //   ...this.deviceStore,
          //   pump_power: '常规'
          // })
          writeBLECharacteristicValue('6A 02 B3 01 00 01 85 D0 0A')
          this.handleChangeStateText('Normal Suction Power')
          this.handleStateTextTimer(uni.getStorageSync('stateText'))
        } else {
          this.$emit('onPump', '强力')
          // this.handleDeviceState({
          //   ...this.deviceStore,
          //   pump_power: '强力'
          // })
          writeBLECharacteristicValue('6A 02 B3 01 00 02 E6 E0 0A')
          this.handleChangeStateText('Boost Suction Power')
          this.handleStateTextTimer(uni.getStorageSync('stateText'))
        }
      },
      // 监听定速导航切换
      handleChangeKeep() {
        if (!this.keepStatus) return

        if (this.keepBtn) return

        setTimeout(() => {
          this.keepBtn = false
        }, 200)
        this.keepBtn = true

        this.isOpenKeep = !this.isOpenKeep
        this.handleDeviceState({
          ...this.deviceStore,
          cruise: this.isOpenKeep ? "开启中" : "关闭中"
        })
        if (this.isOpenKeep) {
          writeBLECharacteristicValue('6A 03 B3 01 00 01 D4 7A 0A')
          this.$emit('onCruise', '开启')
          this.isCruise = true
          this.handleChangeStateText('Pulling over')
          this.handleStateTextTimer(uni.getStorageSync('stateText'))
        } else {
          this.$emit('onCruise', '关闭')
          this.isCruise = false
          writeBLECharacteristicValue('6A 03 B3 01 00 00 F5 6A 0A')
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .controller {
    display: flex;
    align-items: center;

    .control {
      width: 100%;
      // height: 500rpx;
      // margin: 18rpx 60rpx 0 60rpx;
      border-radius: 50%;
      // background: url("@/static/img/device/controller/controller_area_bg.png");
      // background-size: 570rpx 570rpx;
      position: relative;
      box-sizing: border-box;
      // overflow: hidden;
      display: flex;
      justify-content: center;

      .icon {
        width: 500rpx;
        height: 500rpx;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        // z-index: 9999;

        image {
          width: 500rpx;
          height: 500rpx;
        }
      }

      .top {
        width: 285rpx;
        height: 285rpx;
        position: absolute;
        top: -62rpx;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        box-sizing: border-box;
        // opacity: 0;
      }

      .right {
        width: 285rpx;
        height: 285rpx;
        position: absolute;
        top: 50%;
        left: 344rpx;
        transform: translateY(-50%) rotate(-45deg);
        box-sizing: border-box;
      }

      .down {
        width: 285rpx;
        height: 285rpx;
        position: absolute;
        top: 86%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        box-sizing: border-box;
      }

      .left {
        width: 285rpx;
        height: 285rpx;
        position: absolute;
        top: 50%;
        left: -58rpx;
        transform: translate(0, -50%) rotate(-45deg);
        box-sizing: border-box;
      }

      .move {
        position: relative;
        // top: 50%;
        // left: 50%;
        // transform: translate(-50%, -50%);
        // width: 151rpx;
        // height: 151rpx;
        width: 500rpx;
        height: 500rpx;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;

        .ban {
          position: absolute;
          transform: translate(184rpx, 186rpx);
          width: 135rpx;
          height: 135rpx;

          image {
            width: 100%;
            height: 100%;
          }
        }
      }
    }

    .cruise {
      // margin-top: 18rpx;
      position: fixed;
      bottom: 30rpx;
      left: 30rpx;
      height: 120rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left {
        margin-right: 73rpx;

        image {
          width: 120rpx;
          height: 120rpx;
        }
      }

      .right {
        width: 496.55rpx;
        height: 120rpx;
        color: #FFF;
        background: url("@/static/img/device/controller/controller_suction_bg.png") no-repeat;
        background-size: 496.55rpx 120rpx;
        box-sizing: border-box;
        border-radius: 100rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 41rpx;

        .suction {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          font-size: 24rpx;
          color: rgba(153, 153, 153, 1);
          margin-right: 20rpx;

          image {
            width: 59rpx;
            height: 56rpx;
          }
        }

        .switch {
          width: 123rpx;
          height: 86rpx;
          background: #FF8616;
          border-radius: 43rpx 43rpx 43rpx 43rpx;
          opacity: 1;
          display: flex;
          font-family: "DIN Black";
          justify-content: center;
          align-items: center;
          font-size: 36rpx;
          color: rgba(28, 28, 28, 1) !important;
        }

        .switch_ban {
          color: #888888;
        }

        .x1 {
          width: 123rpx;
          font-size: 36rpx;
          font-family: "DIN Black";
          font-weight: 900;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
</style>