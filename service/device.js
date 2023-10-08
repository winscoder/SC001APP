import {
  request
} from './request.js'

/**
 * 获取联系方式
 */
export function getContactInfo(data) {
  return request({
    url: "robot/get_contact_info",
    data,
    method: "POST"
  })
}

/**
 * 获取反馈列表
 */
export function getFeedbackList(data) {
  return request({
    url: "qumu/get_feedback",
    data,
    method: "POST"
  })
}

/**
 * 注册设备
 */
export function registrationDevice(data) {
  return request({
    url: "robot/registration",
    data,
    method: "POST"
  })
}

/**
 * 用户反馈
 */
export function userFeedback(data) {
  return request({
    url: "robot/feedback",
    data,
    method: "POST"
  })
}

/**
 * 上报异常
 */
export function reportAnErr(data) {
  return request({
    url: "robot/error_report",
    data,
    method: "POST"
  })
}

/**
 * 获取教程
 */
export function getCourse(data) {
  return request({
    url: "robot/get_tutorial",
    data,
    method: "POST"
  })
}

/**
 * 固件升级更新
 */
export function detectionFirmwareUpdate(data) {
  return request({
    url: "robot/firmware_checkupdate",
    data,
    method: "POST"
  })
}

/**
 * APP检测更新
 */
export function detectionAppUpdate(data) {
  return request({
    url: "robot/app_checkupdate",
    data,
    method: "POST"
  })
}

