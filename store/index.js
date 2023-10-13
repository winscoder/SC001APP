import Vue from "vue"
import Vuex from "vuex"

import _ from "lodash"

import {
  detectionFirmwareUpdate,
  detectionAppUpdate,
  reportAnErr,
  registrationDevice
} from "@/service/device.js"

import {
  getCurrentDate
} from "@/utils/GetCurrentDate.js"

Vue.use(Vuex)

const store = new Vuex.Store({
  state: () => {
    return {
      devices: [],
      noSreach: true,
      timer: null,
      device: {},
      deviceId: '',
      // 连接状态 notLink success await
      linkStatus: 'notLink',
      // 手机设备号
      uuid: '',
      // 机型
      platform: '',
      // 设备反馈状态
      deviceStore: {
        state: '',
        autoclean: '',
        control: '',
        pump_power: '',
        cruise: '',
        bat_level: '',
        low_bat_flag: '',
        bldc_exception: '',
        left_dc_exception: '',
        right_dc_exception: '',
        battery_exception: '',
        system_exception: '',
        start_exception: '',
        movement_exception: '',
        filter_exception: '',
        move_error_flag: '',
        work_cycle_set: ''
      },
      // 文本反馈
      stateText: 'bluetooth disconnected',
      // 文本反馈节流阀
      stateTextTimer: null,
      demo: "",
      // 判断是否重新搜索蓝牙
      isInitBlue: false,
      // 设备消息 dev_name(设备名称)、dev_model(设备型号)、ser_number(设备序列号)、fw_vs(固件号)、更新时间(upgrade_date),
      deviceInfo: {},
      // app 版本
      version: "",
      // app最新版本信息
      updataInfo: {},
      // 是否显示app跟新进度调
      isUpdataPlan: false,
      // app更新进度
      updataPlan: 0.00,
      // 固件升级信息
      uploadInfo: {},
      // 固件升级进度
      deviceUploadPlan: 0,
      // 固件升级的信息
      progressMsg: "",
      // 异常信息
      errList: [],
      // 启动次数
      num: 0
    }
  },
  actions: {

  },
  mutations: {
    // 过滤不是设备的蓝牙
    handleFillterBluetoothDevice(state, payload) {
      if (!payload[0].name && !payload[0].localName) return
      if (payload[0].name.search(/ezSpirit/i) !== -1 || payload[0].name.search(/HSO_ez1_0001/i) !== -1) {
        if (state.devices.length < 1) {
          state.devices.push(payload[0])
        } else {
          setTimeout(() => {
            let isPush = null
            isPush = state.devices.find(item => {
              if (item.deviceId === payload[0].deviceId) return item;
            })
            if (!isPush) {
              state.devices.push(payload[0])
              isPush = null
            }
            // if (state.devices.indexOf(payload[0].deviceId) === -1) {
            //   console.log(999, state.devices);
            //   console.log("发现新设备", payload[0].name, payload[0].deviceId);
            //   state.devices.push(payload[0])
            // }
          }, 600)
        }
        if (!state.timer) {
          this.commit('handleNoSreachDevice')
        }
      }
    },
    // 处理显示没有找到设备
    handleNoSreachDevice(state, payload) {
      if (payload) {
        clearTimeout(state.timer)
        state.noSreach = true
        state.timer = null
        return
      } else {
        if (state.timer) return
        state.timer = setTimeout(() => {
          if (state.devices.length < 1) {
            uni.stopBluetoothDevicesDiscovery({
              success: () => {
                state.noSreach = false
                state.timer = null
              }
            })
          }
        }, 10000)
      }
    },
    // 处理连接蓝牙失败
    handleConnectionFail(state, payload = false) {
      state.noSreach = payload
    },
    // 处理保存deviceId
    handleSaveDeviceId(state, payload) {
      state.deviceId = uni.getStorageSync('deviceId')
    },
    // 修改连接状态
    handleChangeLinkStatus(state, payload) {
      state.linkStatus = payload
      if (payload === 'notLink') {
        state.device = {}
        state.devices = []
        state.stateText = 'Bluetooth disconnected'
        state.isUpdataPlan = false
        state.isUpdataPlan = 0.00
        state.uploadInfo = {}
        state.deviceUploadPlan = 0
        state.progressMsg = ""
        state.errList = []
        state.num = 0
        state.deviceStore = {
          state: '',
          autoclean: '',
          control: '',
          pump_power: '',
          cruise: '',
          bat_level: '',
          low_bat_flag: '',
          bldc_exception: '',
          left_dc_exception: '',
          right_dc_exception: '',
          battery_exception: '',
          system_exception: '',
          start_exception: '',
          movement_exception: '',
          filter_exception: '',
          move_error_flag: '',
          work_cycle_set: ''
        }
      }
    },
    // 保存手机机型以及设备号
    handleSavePhoneInfo(state, {
      uuid,
      platform
    }) {
      state.uuid = uuid
      state.platform = platform
    },
    // 连接成功保存连接的设备
    hadnleSaveDevice(state, payload) {
      state.device = payload
    },
    // 修改设备名称
    handlEditDeviceName(state, payload) {
      state.device.name = payload
    },
    // 处理初始化状态
    handleInitDevices(state) {
      state.devices = []
    },
    // 处理设备反馈状态
    handleDeviceState(state, payload) {
      console.log(payload);
      state.deviceStore = payload
    },
    // 处理状态文本切换
    handleChangeStateText(state, payload) {
      if (typeof payload === "object") {
        if (state.stateTextTimer === null) {
          state.stateText = payload.text
        }
      } else {
        state.stateText = payload
        if (state.stateTextTimer) {
          clearTimeout(state.stateTextTimer)
          state.stateTextTimer = null
        }
      }

    },
    // 处理状态文本节流阀
    handleStateTextTimer(state, payload) {
      if (state.stateTextTimer) {
        clearTimeout(state.stateTextTimer)
        state.stateTextTimer = null
      }

      state.stateTextTimer = setTimeout(() => {
        state.stateText = uni.getStorageSync('stateText')
        state.stateTextTimer = null
      }, 3000)
    },
    handleDemo(state, payload) {
      state.demo = state
    },
    handleIsInitBlue(state, payload) {
      state.isInitBlue = payload
    },
    handleGetDeviceInfo(state, payload) {
      state.deviceInfo = payload
    },
    // 保存当前app版本
    handleSaveVersion(state, payload) {
      state.version = payload
    },
    // 处理报错app更新信息
    handleSaveUpdataInfo(state, payload) {
      state.updataInfo = payload
    },
    // 处理是否显示app更新进度条
    handleShowAppPlan(state, payload) {
      state.isUpdataPlan = payload
    },
    // app更新进度
    handleUpdateAppPlan(state, payload) {
      state.updataPlan = payload
    },
    // 处理固件升级信息
    handleSaveUploadInfo(state, payload) {
      state.uploadInfo = payload
    },
    // 处理固件升级进度
    handleDeviceUploadPlan(state, payload) {
      state.deviceUploadPlan = payload
    },
    // 处理固件升级的状态
    handleProgressMsg(state, payload) {
      state.progressMsg = payload
    },
    // 处理异常信息
    handleGetErrList(state, payload) {
      state.errList = payload
    },
    // 获取启动次数
    handleGetNum(state, payload) {
      state.num = payload
    }
  },
  actions: {
    /**
     * 注册设备
     */
    async handleRegistration({
      state,
      commit
    }, payload) {
      const date = getCurrentDate()
      const {
        data
      } = await registrationDevice({
        robot_sn_list: [{
          robot_sn: state.deviceInfo.ser_number,
          data_time: date
        }],
        device_id: state.uuid,
        system: state.platform
      })
      console.log("注册设备成功");
      uni.setStorageSync('register', false)
    },
    /**
     *  处理固件升级
     */
    async handleUpgrade({
      state,
      commit
    }, paylod) {
      const {
        data
      } = await detectionFirmwareUpdate({
        robot_sn: state.deviceInfo.ser_number,
        robot_fw: state.deviceInfo.fw_vs,
        system: state.platform,
        device_id: state.uuid,
        model_number: state.deviceInfo.dev_model
      })
      console.log("检测固件升级", data);
      commit("handleSaveUploadInfo", data)
    },
    // app检查更新
    async handleCheckUpdate({
      state,
      commit
    }, payload) {
      const params = {
        device_id: state.uuid,
        version_name: payload,
        update_time: getCurrentDate(),
        system: state.platform
      }
      console.log(params);
      const {
        data
      } = await detectionAppUpdate(params)
      console.log('检查更新', data);
      commit("handleSaveUpdataInfo", data)
    },
    // 处理异常上报
    async handleAppearErr({
      state,
      commit
    }, payload) {
      const {
        data
      } = await reportAnErr(payload)
      console.log('异常上报成功', data);
      uni.removeStorageSync('err_params')
    }
  },
  getters: {

  },
  modules: {

  }
})

export default store