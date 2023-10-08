/**
 * 过滤设备返回的指令
 * @param {String} resHex 
 */
export function filterHex(resHex) {
  let next = false
  let hexString = resHex + ''
  hexString = hexString.toUpperCase()
  let newHexString = ''
  let CurrentIndex = 0
  let endIndex = 0
  let msgLeng = 0
  for (let i = 0; i < hexString.length; i++) {
    if (i % 2 == 0 && i != 0) {
      newHexString += ' ' + hexString[i];
    } else {
      newHexString += hexString[i];
    }
  }
  newHexString = newHexString.split(' ')
  newHexString.find((item, index) => {
    if (item === "6A") {
      return (CurrentIndex = index, next = true)
    }
  })

  // 判断是否有6a开头 没有则是乱码 退出
  if (!next) return

  newHexString = newHexString.splice(CurrentIndex)
  if ((newHexString[1] === '01' || newHexString[1] === '02') && (newHexString[2] === 'B2' || newHexString[2] === 'B1' ||
      newHexString[2] === 'B3' || newHexString[2] === 'B4' || newHexString[2] === 'B5' || newHexString[2] === 'B6')) {
    let length = []
    length.push(newHexString[3])
    length.push(newHexString[4])
    length = length[1] + length[0] + ''
    length = parseInt(length, 16)


    if (newHexString[length + 7] === '0A') {
      return newHexString.splice(0, newHexString.length).join('')
    } else {
      newHexString = newHexString.filter((item, index) => {
        if (index !== 0) return item
      })
      newHexString = newHexString.join('')
      console.log(55, newHexString);
      demo(newHexString)
    }
    return
  } else {
    const hex = newHexString.splice(1).join('')
    demo(hex)
    return
  }

}

// filterHex('6A12306A01B2100002000000000A00030000000000000000E1DC0A000A02')