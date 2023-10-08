import store from '@/store/index.js'

const deviceStore = {
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
  move_error_flag: ''
}

/**
 * 设备状态反馈工具函数
 * @param {设备返回状态码} hexString
 */
export function stateFeedback(hexString) {
  hexString = hexString + ''
  let newHexString = ''
  for (let i = 0; i < hexString.length; i++) {
    if (i % 2 == 0 && i != 0) {
      newHexString += ' ' + hexString[i];
    } else {
      newHexString += hexString[i];
    }
  }

  let stateText = ''
  if (newHexString.split(' ').length < 24) return

  const hexArr = newHexString.split(' ').splice(5, 16)

  // 状态
  switch (hexArr[0]) {
    case '00':
      deviceStore.state = '工作'
      break
    case '01':
      deviceStore.state = '闲置'
      break
    case '02':
      deviceStore.state = '异常'
      break
    case '03':
      deviceStore.state = '充电'
      break
    case '04':
      deviceStore.state = '等待'
      break
    default:
      deviceStore.state = ''
      break
  }

  switch (hexArr[1]) {
    case '00':
      deviceStore.autoclean = '关闭'
      break
    case '01':
      deviceStore.autoclean = '开启全域任务'
      break
    case '02':
      deviceStore.autoclean = '开启定时任务'
      break
    case '03':
      deviceStore.autoclean = '开启区域任务'
      break
    default:
      deviceStore.autoclean = ''
      break
  }

  switch (hexArr[2]) {
    case '00':
      deviceStore.control = '关闭'
      break
    case '01':
      deviceStore.control = '手动控制任务'
      break
    default:
      deviceStore.control = ''
      break
  }

  switch (hexArr[3]) {
    case '00':
      deviceStore.pump_power = '熄火'
      break
    case '01':
      deviceStore.pump_power = '常规'
      break
    case '02':
      deviceStore.pump_power = '强力'
      break
    default:
      deviceStore.pump_power = ''
      break
  }

  switch (hexArr[4]) {
    case '00':
      deviceStore.cruise = '关闭'
      break
    case '01':
      deviceStore.cruise = '开启'
      stateText === '' ? stateText = 'Pulling Over' : stateText = stateText + ',' + 'Pulling Over'
      break
    default:
      deviceStore.cruise = ''
      break
  }

  deviceStore.bat_level = (eval('0x' + hexArr[5])).toString(10)

  switch (hexArr[6]) {
    case '00':
      deviceStore.low_bat_flag = '电量正常'
      break
    case '01':
      deviceStore.low_bat_flag = '低电状态'
      stateText === '' ? stateText = 'Low Battery' : stateText = stateText + ',' + 'Low Battery'
      break
    default:
      deviceStore.low_bat_flag = ''
      break
  }

  switch (hexArr[7]) {
    case '00':
      deviceStore.bldc_exception = '工作正常'
      break
    case '01':
      deviceStore.bldc_exception = '电机过流'
      stateText === '' ? stateText = 'Suction Motor Malfunction' : stateText = stateText + ',' +
        'Suction Motor Malfunction'
      break
    case '02':
      deviceStore.bldc_exception = '电机过热'
      stateText === '' ? stateText = 'Suction Motor Malfunction' : stateText = stateText + ',' +
        'Suction Motor Malfunction'
      break
    case '03':
      deviceStore.bldc_exception = '电机堵转'
      stateText === '' ? stateText = 'Suction Motor Malfunction' : stateText = stateText + ',' +
        'Suction Motor Malfunction'
      break
    case '04':
      deviceStore.bldc_exception = '其它异常'
      stateText === '' ? stateText = 'Suction Motor Malfunction' : stateText = stateText + ',' +
        'Suction Motor Malfunction'
      break
    default:
      deviceStore.bldc_exception = ''
      break
  }

  switch (hexArr[8]) {
    case '00':
      deviceStore.left_dc_exception = '工作正常'
      break
    case '01':
      deviceStore.left_dc_exception = '电机堵转'
      stateText === '' ? stateText = 'Left Motor Malfunction' : stateText = stateText + ',' + 'Left Motor Malfunction'
      break
    case '02':
      deviceStore.left_dc_exception = '其它异常'
      stateText === '' ? stateText = 'Left Motor Malfunction' : stateText = stateText + ',' + 'Left Motor Malfunction'
      break
    default:
      deviceStore.left_dc_exception = ''
      break
  }

  switch (hexArr[9]) {
    case '00':
      deviceStore.right_dc_exception = '工作正常'
      break
    case '01':
      deviceStore.right_dc_exception = '电机堵转'
      stateText === '' ? stateText = 'Right Motor Malfunction' : stateText = stateText + ',' + 'Right Motor Malfunction'
      break
    case '02':
      deviceStore.right_dc_exception = '其它异常'
      stateText === '' ? stateText = 'Right Motor Malfunction' : stateText = stateText + ',' + 'Right Motor Malfunction'
      break
    default:
      deviceStore.right_dc_exception = ''
      break
  }

  switch (hexArr[10]) {
    case '00':
      deviceStore.battery_exception = '工作正常'
      break
    case '01':
      deviceStore.battery_exception = '模块过热'
      stateText === '' ? stateText = 'Battery Malfunction' : stateText = stateText + ',' + 'Battery Malfunction'
      break
    case '02':
      deviceStore.battery_exception = '电压异常'
      stateText === '' ? stateText = 'Battery Malfunction' : stateText = stateText + ',' + 'Battery Malfunction'
      break
    case '03':
      deviceStore.battery_exception = '其它异常'
      stateText === '' ? stateText = 'Battery Malfunction' : stateText = stateText + ',' + 'Battery Malfunction'
      break
    default:
      deviceStore.battery_exception = ''
      break
  }

  switch (hexArr[11]) {
    case '00':
      deviceStore.system_exception = '工作正常'
      break
    case '01':
      deviceStore.system_exception = '系统异常'
      stateText === '' ? stateText = 'System Malfunction' : stateText = stateText + ',' + 'System Malfunction'
      break
    case '02':
      deviceStore.system_exception = '其它异常'
      stateText === '' ? stateText = 'System Malfunction' : stateText = stateText + ',' + 'System Malfunction'
      break
    default:
      deviceStore.system_exception = ''
      break
  }

  switch (hexArr[12]) {
    case '00':
      deviceStore.start_exception = '工作正常'
      break
    case '01':
      deviceStore.start_exception = '启动异常'
      stateText === '' ? stateText = 'Only Work In Water' : stateText = stateText + ',' + 'Only Work In Water'
      break
    case '02':
      deviceStore.start_exception = '其它异常'
      stateText === '' ? stateText = 'Only Work In Water' : stateText = stateText + ',' + 'Only Work In Water'
      break
    default:
      deviceStore.start_exception = ''
      break
  }

  switch (hexArr[13]) {
    case '00':
      deviceStore.movement_exception = '工作正常'
      break
    case '01':
      deviceStore.movement_exception = '围困异常'
      stateText === '' ? stateText = 'Get Stucked' : stateText = stateText + ',' + 'Get Stucked'
      break
    default:
      deviceStore.movement_exception = ''
      break
  }

  switch (hexArr[14]) {
    case '00':
      deviceStore.filter_exception = '工作正常'
      break
    case '01':
      deviceStore.filter_exception = '堵网异常'
      stateText === '' ? stateText = 'Filter Clogged' : stateText = stateText + ',' + 'Filter Clogged'
      break
    default:
      deviceStore.filter_exception = ''
      break
  }

  switch (hexArr[15]) {
    case '00':
      deviceStore.move_error_flag = '非移动异常'
      break
    case '01':
      deviceStore.move_error_flag = '移动异常'
      break
    default:
      deviceStore.move_error_flag = ''
      break
  }

  store.commit('handleDeviceState', deviceStore)

  if (stateText) {
    store.commit('handleChangeStateText', {text: stateText})
  } else {
    switch (hexArr[0]) {
      case '00':
        stateText = "Working"
        break
      case '01':
        stateText = "Idle"
        break
      case '02':
        stateText = "Working"
        break
      case '03':
        stateText = "Charging"
        break
      case '04':
        stateText = "Waiting"
        break
      default:
        break
    }
    store.commit('handleChangeStateText', {
      text: stateText
    })
  }
  console.log(stateText);
  uni.setStorageSync("stateText", stateText)
  console.log(store.state.deviceStore);
}