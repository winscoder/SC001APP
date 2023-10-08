/** 将hex转换为 CRC-16/XMODEM 校验 
 * 
 * 参数长度需要被2整除
 * 
 * 第八位在前，高八位在后
 */
const crc16xmodem = (datass) => {
  datass = datass.replace(/\s/g, "")
  return CRC_16_XMODEM(Str2Bytes(datass), datass.length / 2)
}

const Str2Bytes = (str) => {
  var pos = 0;
  var len = str.length;
  if (len % 2 != 0) {
    return null;
  }
  len /= 2;
  var hexA = new Array();
  for (var i = 0; i < len; i++) {
    var s = str.substr(pos, 2);
    var v = parseInt(s, 16);
    hexA.push(v);
    pos += 2;
  }
  return hexA;
}

function CRC_16_XMODEM(bytes, length) {
  let crc = 0x0000;
  let polynomial = 0x1021;
  for (let index = 0; index < length; index++) {
    let b = bytes[index];
    for (let i = 0; i < 8; i++) {
      let bit = ((b >> (7 - i) & 1) == 1);
      let c15 = ((crc >> 15 & 1) == 1);
      crc <<= 1;
      if (c15 ^ bit)
        crc ^= polynomial;
    }
  }
  crc &= 0xffff;
  // 输出String字样的16进制
  let strCrc = crc.toString(16).toLocaleUpperCase();
  switch (strCrc.length) {
    case 1:
      strCrc = "000" + strCrc;
      break;
    case 2:
      strCrc = "00" + strCrc;
      break;
    case 3:
      strCrc = "0" + strCrc;
      break;
    case 4:
      strCrc = strCrc
      break;
    default:
      break;
  }
  strCrc = strCrc[2] + strCrc[3] + " " + strCrc[0] + strCrc[1]

  return strCrc;

}

export {
  crc16xmodem
}
