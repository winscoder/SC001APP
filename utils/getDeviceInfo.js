import store from "@/store/index.js"

/**
 * 获取设备信息
 */
function getDeviceInfo(hex) {
  hex = hex.toUpperCase() // 英文字母转大写
  let newHexString = ''
  // 设备昵称长度
  let dev_name_len = 0
  // 设备昵称16进制数组
  let dev_name_arr = null
  // 设备昵称
  let dev_name = ''
  // 设备型号长度
  let dev_model_len = 0
  // 设备信号16进制数组
  let dev_model_arr = []
  // 设备型号字符
  let dev_model = ''
  // 设备序列号长度
  let ser_num_len = 0
  // 设备序列号16进制数组
  let ser_num_arr = []
  // 设备序列号字符
  let ser_number = ''
  // 固件名称长度
  let fw_vs_len = 0
  // 固件名称16进制数组
  let fw_vs_arr = []
  // 固件名称
  let fw_vs = ''

  // 更新日期16机制数组
  let upgrade_date_arr = []
  // 更新日期字符串
  let upgrade_date = ''

  for (let i = 0; i < hex.length; i++) {
    if (i % 2 == 0 && i != 0) {
      newHexString += ' ' + hex[i];
    } else {
      newHexString += hex[i];
    }
  }
  const hexArr = newHexString.split(" ")
  
  // 处理设备名称
  dev_name_len = (eval('0x' + hexArr[5])).toString(10) * 1
  dev_name_arr = [...hexArr].splice(6, dev_name_len)
  dev_name_arr.forEach(item => {
    const str = hexCharCodeToStr(item)
    dev_name = dev_name + str
  })
  // console.log(dev_name);

  // 处理设备型号
  dev_model_len = (eval('0x' + hexArr[5 + 25 + 1])).toString(10) * 1
  dev_model_arr = [...hexArr].splice(6 + 25 + 1, dev_model_len)
  dev_model_arr.forEach(item => {
    const str = hexCharCodeToStr(item)
    dev_model = dev_model + str
  })
  console.log(dev_model);
  

  // 处理设备序列号
  ser_num_len = (eval('0x' + hexArr[5 + 25 + 1 + 25 + 1])).toString(10) * 1
  ser_num_arr = [...hexArr].splice(6 + 25 + 1 + 25 + 1, ser_num_len)
  ser_num_arr.forEach(item => {
    const str = hexCharCodeToStr(item)
    ser_number = ser_number + str
  })

  // 处理固件号 5 为指令头部加上数据长度 
  fw_vs_len = (eval('0x' + hexArr[5 + 25 + 1 + 25 + 1 + 25 + 1])).toString(10) * 1
  fw_vs_arr = [...hexArr].splice(6 + 25 + 1 + 25 + 1 + 25 + 1, fw_vs_len)
  fw_vs_arr.forEach(item => {
    const str = hexCharCodeToStr(item)
    fw_vs = fw_vs + str
  })

  // 处理更新日期 更新日期固定8个字节
  upgrade_date_arr = [...hexArr].splice(6 + 25 + 1 + 25 + 1 + 25 + 25 + 1, 8)
  upgrade_date_arr.forEach(item => {
    const str = hexCharCodeToStr(item)
    upgrade_date = upgrade_date + str
  })
  
  console.log('昵称 ', dev_name);
  console.log('型号 ', dev_model);
  console.log('序列号 ', ser_number);
  console.log('固件号', fw_vs);
  console.log('更新日期', upgrade_date);

  store.commit('handleGetDeviceInfo', {
    dev_name,
    dev_model,
    ser_number,
    fw_vs,
    upgrade_date
  })
  
  uni.setStorageSync("dev_name", dev_name)

  const register = uni.getStorageSync('register')
  
  store.dispatch('handleUpgrade')

  if (register) {
    store.dispatch("handleRegistration")
  }

}

/**
 * 十六进制转ASCII码
 * @param {string} 十六进制的字符串 
 */
function hexCharCodeToStr(hexCharCodeStr) {
  var trimedStr = hexCharCodeStr.trim();
  var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
  var len = rawStr.length;
  if (len % 2 !== 0) {
    return "";
  }
  var curCharCode;
  var resultStr = [];
  for (var i = 0; i < len; i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16);
    resultStr.push(String.fromCharCode(curCharCode));
  }
  return resultStr.join("");
}


// getDeviceInfo('6A01B1700008657A537069726974CF23DBD2C58CFBCB6605060000008248FA0753433030312F410C000A0000000000000001000000080000000A534E46334F464C3231443CC8A68F3BFC6274DC8C9BA95B74660953433030312E302E393053012058FA0020000000000A000000323032333038313766CA0A')

export {
  getDeviceInfo
}