/**
 * 获取当前时间
 */
export function getCurrentDate () {
  const date = new Date();
  const year = date.getFullYear();
  let month = date.getMonth() + 1
  let day = date.getDate()
  let H = date.getHours()
  let M = date.getMinutes()
  let S = date.getSeconds()
  
  month * 1 >= 10 ? month = month : month = '0' + month
  day * 1 >= 10 ? day = day : day = '0' + day
  H * 1 >= 10 ? H = H : H = '0' + H
  M * 1 >= 10 ? M = M : H = '0' + M
  S * 1 >= 10 ? S = S : S = '0' + S
  
  const data_time = year + '-' + month + '-' + day + ' ' + H + ":" + M + ':' + S
  
  return data_time
}