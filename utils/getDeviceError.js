import store from "@/store/index.js"

import {
  getCurrentDate
} from "@/utils/GetCurrentDate.js"

async function getDeviceError(hex) {
  const err_params = uni.getStorageSync('err_params')
  if (err_params) {
    store.dispatch("handleAppearErr", err_params)
  }

  hex = hex.toUpperCase() // 英文字母转大写
  hex = hex.slice(10)
  // 启动次数 0600
  let num = hex.slice(0, 4)
  num = num.slice(2, 4) + num.slice(0, 2)
  num = (eval('0x' + num)).toString(10) * 1
  // 错误数组长度
  const err_len = (eval('0x' + hex.slice(4, 6))).toString(10) * 1
  hex = hex.slice(6, hex.length - 6)
  console.log(err_len);
  // 处理后的数据
  let newHexString = ''

  for (let i = 0; i < hex.length; i++) {
    if (i % 8 === 0 && i != 0) {
      newHexString += ' ' + hex[i];
    } else {
      newHexString += hex[i];
    }
  }
  const hexArr = newHexString.split(" ")

  const errList = []
  hexArr.forEach((item, index) => {
    if (err_len - 1 >= index) {
      let code = item.slice(0, 4)
      code = code.slice(0, 2) + " " + code.slice(2)
      let num = item.slice(4)
      num = num.slice(2) + num.slice(0, 2)
      errList[index] = {
        error_code: code,
        error_number: eval('0x' + num).toString(10) * 1
      }
    }
  })

  const {
    ser_number,
    fw_vs,
    upgrade_date,
    dev_model
  } = store.state.deviceInfo

  const params = {
    robot_sn: ser_number,
    robot_fw: fw_vs,
    update_time: upgrade_date,
    model_number: dev_model,
    error_time: getCurrentDate(),
    on_stat: num,
    error_list: errList
  }

  console.log("异常上报参数", params);

  uni.setStorageSync("err_params", params)

  store.dispatch("handleAppearErr", params)
}

export {
  getDeviceError
}

// getDeviceError('6A01B61C00000A0101000101020000010300000201000203010001040100010501000011110A')