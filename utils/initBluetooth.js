import store from '@/store/index.js'

import {
  stateFeedback
} from "@/utils/state_feedback.js"
import {
  getDeviceInfo
} from "@/utils/getDeviceInfo.js"
import {
  filterHex
} from "@/utils/filterHex.js"
import {
  getDeviceError
} from "@/utils/getDeviceError.js"

// 处理未连接到蓝牙
let timer = null

// 处理初始化蓝牙
const handleOpenBluetooth = (cb) => {
  uni.openBluetoothAdapter({
    success: (res) => {
      console.log(res);
      startBluetoothDevicesDiscovery()
    },
    fail: (err) => {
      console.log(err);
      cb && cb.open()
    }
  })
}

// 开始搜寻附近的蓝牙外围设备
const startBluetoothDevicesDiscovery = () => {

  uni.startBluetoothDevicesDiscovery({
    allowDuplicatesKey: false,
    // interval: ['0000FFF1-0000-1000-8000-00805F9B34FB'],
    success: res => {
      console.log('搜寻附近的蓝牙外围设备 startBluetoothDevicesDiscovery success111', res);
      // 监听寻找到新设备的事件
      onBluetoothDeviceFound();
    },
    fail: err => {
      console.log('搜寻附近的蓝牙外围设备 startBluetoothDevicesDiscovery fail', err);
    },
    complete: (res) => {
      console.log("complete", res);
    }
  });
}


// 监听寻找到新设备的事件
const onBluetoothDeviceFound = () => {
  console.log('进入查询设备');
  uni.onBluetoothDeviceFound(res => {
    res.devices.find(device => {
      if (!device.name && !device.localName) return

      if (device.deviceId === uni.getStorageSync('deviceId')) {
        // 连接蓝牙
        _createBLEConnection(device.deviceId, device)
      } else {
        // if (timer !== null) return
        // console.log(12);
        // timer = setTimeout(() => {
        //   store.commit('handleChangeLinkStatus', 'notLink')
        //   uni.stopBluetoothDevicesDiscovery();
        //   uni.hideLoading()
        // }, 10000)
      }
    });
  });
}

// 连接蓝牙
const _createBLEConnection = (deviceId, device) => {
  uni.showLoading({
    title: "connecting...",
    mask: true
  })
  store.commit('handleChangeLinkStatus', 'await')
  // 连接低功耗蓝牙设备
  uni.createBLEConnection({
    deviceId, // 用于区分设备的 id
    success: (res) => {
      console.log("成功连接蓝牙", res);
      // console.log('连接蓝牙接口调用成功 createBLEConnection success', res);
      setBleMTU(deviceId)
      store.commit('handleChangeLinkStatus', 'success')
      store.commit('hadnleSaveDevice', device)
      store.commit('handleDeviceState', {
        ...store.state.deviceStore,
        state: '等待'
      })
      store.commit('handleChangeStateText', 'Waiting')
      store.commit('handleIsInitBlue', false)
      uni.setStorageSync("stateText", 'Waiting')
      console.log("device", store.state.deviceStore);

      onBLEConnectionStateChange()

      // stateFeedback('6A01B210000200000000090000000000000001000095C60A')
      uni.hideLoading()

    },
    complete() {
      uni.hideLoading();
      // 已经找到需要的蓝牙设备,停止搜寻附近的蓝牙外围设备
      uni.stopBluetoothDevicesDiscovery();
      setTimeout(() => {
        clearTimeout(timer)
        timer = null
      }, 9000)
    },
    fail: res => {
      // 连接蓝牙接口调用失败
      uni.hideLoading()
      store.commit('handleChangeLinkStatus', 'notLink')
      console.log('连接蓝牙接口调用失败 createBLEConnection fail', res);
    }
  });
}

/**
 * 监听蓝牙设备状态
 */
function onBLEConnectionStateChange() {
  uni.onBLEConnectionStateChange(function(res) {
    console.log("设备连接状态", res);
    if (!res.connected) {
      store.commit('handleChangeLinkStatus', 'notLink')
      store.commit('handleChangeStateText', 'Bluetooth Disconnected')
      store.commit("handleProgressMsg", "Installation failed")
    }
  })
}

/**
 * 设置蓝牙最大传输单元 
 */
const setBleMTU = (deviceId) => {

  if (uni.getSystemInfoSync().platform === 'ios') {
    // 获取蓝牙设备所有服务(service)
    clearTimeout(timer)
    getBLEDeviceServices(deviceId);
  } else {
    setTimeout(() => {
      clearTimeout(timer)
      uni.setBLEMTU({
        deviceId,
        mtu: 512,
        success: (res) => {
          console.log('设置最大传输单元成功', res);
          setTimeout(() => {
            getBLEDeviceServices(deviceId);
          }, 200)
        },
        fail: (err) => {
          console.log('设置最大传输单元失败', err);
        }
      })
    }, 800)
  }

}

/**
 * 获取蓝牙设备所有服务(service)
 * @param {设备id}  
 */
const getBLEDeviceServices = (deviceId, cb) => {
  uni.getBLEDeviceServices({
    deviceId,
    success: res => {
      console.log('获取蓝牙设备所有服务 getBLEDeviceServices', res.services);
      const service = res.services.find(item => {
        if (item.uuid.indexOf('0000FFF0') !== -1) {
          return item
        }
      })
      getBLEDeviceCharacteristics(deviceId, service.uuid, cb);

    },
    fail: err => {
      console.log("err", err);
    }
  });
}


/**
 * 获取蓝牙设备某个服务中所有特征值
 * @param {String} 设备id
 * @param {string} 服务id   
 */
const getBLEDeviceCharacteristics = (deviceId, serviceId, cb) => {
  uni.setStorageSync('device_uuid', serviceId)

  plus.bluetooth.getConnectedBluetoothDevices({
    services: serviceId,
    success(res) {

    },
    fail(err) {

    }
  });

  uni.getBLEDeviceCharacteristics({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId,
    // 这里的 serviceId(蓝牙服务 uuid) 需要在 getBLEDeviceServices 接口中获取
    serviceId,
    success: async res => {

      const characteristic = res.characteristics.find(item => {
        if (item.uuid.indexOf('0000FFF1') !== -1) {
          return item
        }
      })

      await notify(deviceId, serviceId, characteristic.uuid, cb)

      setTimeout(() => {
        // 主动获取状态
        writeBLECharacteristicValue('6A 01 B2 00 00 59 B9 0A')
        // 读取设备信息
        setTimeout(() => {
          writeBLECharacteristicValue('6A 01 B1 00 00 09 E0 0A')

          // 写死的设备信息
          // getDeviceInfo(
          //   '6A01B1700008657A537069726974CF23DBD2C58CFBCB6605060000008248FA0753433030312F410C000A0000000000000001000000080000000A534E46334F464C3231443CC8A68F3BFC6274DC8C9BA95B74660953433030312E302E393053012058FA0020000000000A000000323032333038313766CA0A'
          // )

          setTimeout(() => {
            // 异常上报
            writeBLECharacteristicValue('6A 01 B6 00 00 99 65 0A')
            // getDeviceError('6A01B61F0006000701010000020100000301020001030000010200000104000001050000F36C0A6A01B2000059B90A')
          }, 200)

        }, 200)
      }, 1000)

      console.log('特征值变化 getBLEDeviceCharacteristics success', characteristic);
    },
    fail(res) {
      console.error('特征值变化 getBLEDeviceCharacteristics', res);
    }
  });
}

/**
 * 开启蓝牙消息的监听
 * @param {String} 设备id
 * @param {String} 服务id
 * @param {String} 特征值id    
 */
function notify(deviceId, serviceId, characteristicId, cb) {
  uni.notifyBLECharacteristicValueChange({
    deviceId,
    serviceId,
    characteristicId,
    success(res) {
      console.log('开启蓝牙消息的监听', res)
      // 接受消息的方法
      listenValueChange(cb)
    },
    fail(err) {
      console.error(err)
    }
  })
}

/**
 * 接收蓝牙消息的方法
 */
function listenValueChange(cb) {
  uni.onBLECharacteristicValueChange(res => {
    // 结果
    const resHex = ab2hex(res.value)
    const hex = filterHex(resHex)
    // console.log(hex);
    if (hex) {
      if (hex.slice(0, 6) === '6A01B1') {
        getDeviceInfo(hex)
        return
      } else if (hex.slice(0, 6) === '6A01B5') {
        // if (hex.slice(10, 12) === '00') {
        //   store.commit("handleProgressMsg", "Installation failed")
        // } else {
        //   store.commit("handleProgressMsg", "Installing")
        // }
        return
      } else if (hex.slice(0, 6) === '6A02B5') {
        console.log(hex);
        switch (hex.slice(12, 14)) {
          case "00":
            uni.showToast({
              title: 'Upgrade successfully',
              icon: 'none',
              duration: 5000
            })
            break;
          case '01':
            uni.showToast({
              title: 'Model incorrect',
              icon: 'none',
              duration: 5000
            })
            // store.commit("handleProgressMsg", "Modelincorrect")
            break;
          case '02':
            uni.showToast({
              title: 'File transfer error',
              icon: 'none',
              duration: 5000
            })
            // store.commit("handleProgressMsg", "File transfer error")
            break;
          case '03':
            uni.showToast({
              title: 'Need more than 10% battery',
              icon: 'none',
              duration: 5000
            })
            // store.commit("handleProgressMsg", "Need more than 10% battery")
            break;
          case '04':
            uni.showToast({
              title: 'Charging is not allowed',
              icon: 'none',
              duration: 5000
            })
            // store.commit("handleProgressMsg", "Charging is not allowed")
            break;
          case '05':
            uni.showToast({
              title: 'Capacity is insufficient',
              icon: 'none',
              duration: 5000
            })
            // store.commit("handleProgressMsg", "Capacity is insufficient")
            break;
        }
      } else if (hex.slice(0, 6) === '6A01B6') {
        getDeviceError(hex)
      } else if (hex.slice(0, 6) === '6A01B2') {
        stateFeedback(hex)
        return
      }
    } else {
      cb && cb(resHex)
    }
  })
}

/**
 * ArrayBuffer转16进度字符串示例
 * @param {String} buffer 
 */
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function(bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('')
}


/**
 * 蓝牙连接成功后给设备发送指令
 * @param {string} 传入的指令 16进制 
 */
const writeBLECharacteristicValue = (hexString) => {
  const bytes = hexString.split(' ').map(str => parseInt(str, 16));
  // console.log(hexString);
  const buffer = new ArrayBuffer(bytes.length);
  // 创建一个 DataView 对象，并将十六进制字符串转换成 ArrayBuffer 对象
  const dataView = new DataView(buffer);
  for (let i = 0; i < bytes.length; i++) {
    dataView.setUint8(i, bytes[i]);
  }
  _writeBLECharacteristicValue(dataView)

}

// 向低功耗蓝牙设备特征值中写入二进制数据。注意：必须设备的特征值支持 write 才可以成功调用。
const _writeBLECharacteristicValue = (dataView) => {

  // console.log(dataView)
  // 创建一个 ArrayBuffer 对象
  uni.writeBLECharacteristicValue({
    deviceId: store.state.device.deviceId, // 蓝牙设备 id
    serviceId: '0000FFF0-0000-1000-8000-00805F9B34FB', // 蓝牙特征值对应服务的 uuid
    characteristicId: '0000FFF1-0000-1000-8000-00805F9B34FB', // 蓝牙特征值的 uuid
    value: dataView.buffer, // 蓝牙设备特征值对应的二进制值
    success(res) {
      // console.log('writeBLECharacteristicValue success', res);
    },
    fail(res) {
      // console.log('writeBLECharacteristicValue fail', res);
    }
  });

}

export {
  handleOpenBluetooth,
  startBluetoothDevicesDiscovery,
  onBluetoothDeviceFound,
  getBLEDeviceServices,
  getBLEDeviceCharacteristics,
  writeBLECharacteristicValue,
  _writeBLECharacteristicValue,
  _createBLEConnection,
  onBLEConnectionStateChange,
  setBleMTU,
  listenValueChange
}