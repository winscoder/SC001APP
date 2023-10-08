import {
  getBLEDeviceServices,
  listenValueChange,
  writeBLECharacteristicValue,
} from "@/utils/initBluetooth.js"

import {
  analysisAscll
} from "@/utils/analysisAscll.js"

import {
  crc16xmodem
} from '@/utils/CRC_XMODEM.js'

import store from "@/store/index.js"

const PACKET_SIZE_128 = 128;
const PACKET_SIZE_1024 = 1024;
const SOH = 0x01; // 128 字节的数据包
const STX = 0x02; // 1024 字节的数据包
const EOT = 0x04; // 结束传输
const ACK = 0x06; // 响应
const NAK = 0x15; // 不响应
const CA = 0x18; // 24 传输中止
const CRC16 = 0x43; // 67 请求数据包
const ABORT1 = 0x41 // 65
const ABORT2 = 0x61 // 97

var eot_pack = Buffer.alloc(PACKET_SIZE_128 + 5, 0x00);
eot_pack[0] = SOH;
eot_pack[2] = 0xff;
// crc == 0

function noop() {}

/* 
 * YModem uses CRC16-CCITT European version of the CRC checksum, 
 * its generator polynomial is：x16+x12+x5+1
 */
function crc16(packet, begin, len, previous) {
  let stop_at = begin + len;
  let crc = typeof previous !== 'undefined' ? ~~previous : 0x0;
  for (; begin < stop_at; begin++) {
    let code = (crc >>> 8) & 0xff;
    code ^= packet[begin] & 0xff;
    code ^= code >>> 4;
    crc = (crc << 8) & 0xffff;
    crc ^= code;
    code = (code << 5) & 0xffff;
    crc ^= code;
    code = (code << 7) & 0xffff;
    crc ^= code;
  }
  return crc;
}

function makeFileHeader(filename, filesize) {
  let File_HD_SIZE = 128
  var payload = Buffer.alloc(File_HD_SIZE + 3 + 2, 0x00);
  payload[0] = SOH;
  payload[1] = 0;
  payload[2] = 0xff;
  var offset = 3;
  if (filename) {
    payload.write(filename, offset);
    offset += filename.length + 1;
  }
  if (filesize) {
    payload.write(filesize.toString() + " ", offset);
  }
  var crc = crc16(payload, 3, File_HD_SIZE);
  payload.writeUInt16BE(crc, payload.byteLength - 2);
  return payload;
}

/**
 * 处理发送固件升级指令
 * @param {Number} fileLength 文件大小
 */
function handleOrder(fileLength) {
  try {
    const {
      deviceInfo,
      uploadInfo
    } = store.state

    let msg = analysisAscll(deviceInfo.fw_vs)
    msg = msg.split(" ")
    const length = (24 - msg.length)
    for (let i = 0; i <= length; i++) {
      msg.push('00')
    }
    msg = msg.join(" ")

    const upgrade_date = analysisAscll(uploadInfo.upgrade_time)

    let file_length = fileLength.toString(16)
    if (file_length.length === 1) {
      file_length = '00 00 00 0' + file_length
    } else if (file_length.length === 2) {
      file_length = '00 00 00 ' + file_length
    } else if (file_length.length === 3) {
      file_length = '00 00 0' + file_length
      file_length = insertStr(file_length, 8, ' ')
    } else if (file_length.length === 4) {
      file_length = '00 00 ' + file_length
      file_length = insertStr(file_length, 8, ' ')
    } else if (file_length.length === 5) {
      file_length = '00 0' + file_length
      file_length = insertStr(file_length, 5, ' ')
      file_length = insertStr(file_length, 8, ' ')
    } else if (file_length.length === 6) {
      file_length = '00 ' + file_length
      file_length = insertStr(file_length, 5, ' ')
      file_length = insertStr(file_length, 8, ' ')
    } else if (file_length.length === 7) {
      file_length = '0' + file_length
      file_length = insertStr(file_length, 2, ' ')
      file_length = insertStr(file_length, 5, ' ')
      file_length = insertStr(file_length, 8, ' ')
    } else if (file_length.length === 8) {
      file_length = insertStr(file_length, 2, ' ')
      file_length = insertStr(file_length, 5, ' ')
      file_length = insertStr(file_length, 8, ' ')
    }

    // 设备名称长度
    const fw_lenght = parseInt(deviceInfo.fw_vs.length).toString(16).length > 1 ?
      parseInt(deviceInfo.fw_vs.length)
      .toString(16) : '0' + parseInt(deviceInfo.fw_vs.length).toString(16)

    // 数据长度 固件名称长度 + 固件号 + 更新日期 + 固件文件长度 + 固件文件长度
    // let msgLength = ''
    // if (deviceInfo.fw_vs.length + 1 > 255 && deviceInfo.fw_vs.length + 1 <
    //   4096) {
    //   msgLength = '0' + (parseInt(deviceInfo.fw_vs.length) + 1).toString(16)
    //   msgLength = msgLength.slice(2) + ' ' + msgLength.slice(0, 2)
    // } else if (deviceInfo.fw_vs.length + 1 >= 4096) {
    //   msgLength = (parseInt(deviceInfo.fw_vs.length) + 1).toString(16)
    //   msgLength = msgLength.slice(2) + ' ' + msgLength.slice(0, 2)
    // } else if (deviceInfo.fw_vs.length + 1 <= 15) {
    //   msgLength = '0' + (parseInt(deviceInfo.fw_vs.length) + 1).toString(16) + " 00"
    // } else {
    //   msgLength = (parseInt(deviceInfo.fw_vs.length) + 1).toString(16) + " 00"
    // }

    file_length = file_length.toUpperCase()
    file_length = file_length.split(" ")
    file_length = file_length.map((item, index, array) => {
      return array[array.length - 1 - index]
    })
    file_length = file_length.join(" ")
    console.log(file_length);

    let hash_sha_256 = ''
    for (let i = 0; i < uploadInfo.hash_sha_256.length; i++) {
      if (i % 2 == 0 && i != 0) {
        hash_sha_256 += ' ' + uploadInfo.hash_sha_256[i];
      } else {
        hash_sha_256 += uploadInfo.hash_sha_256[i];
      }
    }
    hash_sha_256 = hash_sha_256.toUpperCase()

    const CRC = crc16xmodem(`6A 01 B5 46 00 ${fw_lenght} ${msg} ${upgrade_date} ${file_length} ${hash_sha_256}`)

    const instruct = (
        `6A 01 B5 46 00 ${fw_lenght} ${msg} ${upgrade_date} ${file_length} ${hash_sha_256} ${CRC} 0A`)
      .toUpperCase()
    console.log(instruct);

    // 固件升级指令
    setTimeout(() => {
      writeBLECharacteristicValue(instruct)
    }, 200)
  } catch (e) {
    //TODO handle the exception
    console.log(e);
  }
}

/**
 *  插入字符串 
 * @param {String} souece 原字符串
 * @param {String} 要截取的位置
 * @param {String} 要插入的字符
 */
function insertStr(source, start, newStr) {
  return source.slice(0, start) + newStr + source.slice(start)
}

function splitFile(buffer, totalBytes, writtenBytes) {
  // let totalBytes = buffer.byteLength;

  // 128bye
  // 设置传输的字节数量
  let maxPack = parseInt((buffer.byteLength + PACKET_SIZE_128 - 1) / PACKET_SIZE_128);
  const array = [];
  for (let i = 0; i < maxPack; i++) {
    let is_last = (i + 1) == maxPack ? true : false;
    let packSize = PACKET_SIZE_128;
    var chunk = Buffer.alloc(packSize + 3 + 2, is_last ? 0x1A : 0x00);

    chunk[0] = SOH;
    chunk[1] = (i + 1) & 0xff;
    chunk[2] = 0xff - chunk[1];

    buffer.copy(chunk, 0 + 3, PACKET_SIZE_128 * i, PACKET_SIZE_128 * i + packSize);
    var crc = crc16(chunk, 3, packSize);
    chunk.writeUInt16BE(crc, chunk.byteLength - 2);
    array.push(chunk);
  }

  // 1024byte
  // let maxPack = parseInt((buffer.byteLength + PACKET_SIZE_1024 - 1) / PACKET_SIZE_1024);
  // const array = [];
  // for (let i = 0; i < maxPack; i++) {
  //   let is_last = (i + 1) == maxPack ? true : false;
  //   let packSize = PACKET_SIZE_1024;
  //   if (is_last && totalBytes - i * PACKET_SIZE_1024 <= 128) {
  //     packSize = PACKET_SIZE_128;
  //   }
  //   var chunk = Buffer.alloc(packSize + 3 + 2, is_last ? 0x1A : 0x00);

  //   chunk[0] = (packSize == PACKET_SIZE_1024) ? STX : SOH;
  //   chunk[1] = (i + 1) & 0xff;
  //   chunk[2] = 0xff - chunk[1];

  //   buffer.copy(chunk, 0 + 3, PACKET_SIZE_1024 * i, PACKET_SIZE_1024 * i + packSize);
  //   var crc = crc16(chunk, 3, packSize);
  //   chunk.writeUInt16BE(crc, chunk.byteLength - 2);
  //   array.push(chunk);
  // }
  // eslint-disable-next-line
  return array;
}

function splitBuffer(buffer, size) {
  let totalBytes = buffer.byteLength;
  let maxPack = parseInt((buffer.byteLength + size - 1) / size);
  var array = [];
  for (let i = 0; i < maxPack; i++) {
    let is_last = (i + 1) == maxPack ? true : false;
    let packSize = size;
    if (is_last) {
      packSize = totalBytes % size;
    }
    var chunk = Buffer.alloc(packSize, 0x00);
    buffer.copy(chunk, 0, size * i, size * i + packSize);
    array.push(chunk);
  }
  // eslint-disable-next-line
  return array;
}

/**
 * 数据传输
 * @param {Function} 发送命令的方法
 * @param {String}  文件名称
 * @param {Buffer} buffer 
 * @param {number} fileSize 文件大小  
 * @param {number} 超时时间    
 */
export function transfer(serial, filename, buffer, fileSize, timeout = 0, onProgress = noop, logger = console.log) {
  // eslint-disable-next-line
  return new Promise(async (resolve, reject) => {
    // 数据包
    var file_trunks = [];
    // 文件总大小
    var totalBytes = 0;
    // 文件已传输的大小
    var writtenBytes = 0;
    var seq = 0;
    var session = false;
    var sending = false;
    var finished = false;
    var haveTimeout = typeof timeout === "number" && timeout > 0
    var timer;

    // 设置数据包请求的超时时间
    if (haveTimeout) {
      timer = setTimeout(() => {
        close("TIMEOUT", false);
      }, timeout);
    }


    // 将Uint8Array转换为Buffer
    buffer = Buffer.from(buffer);

    /**
     * 发送Buffer
     */
    async function sendBuffer(buffer, once_len = 0) {
      console.log("发送buffer");
      if (!once_len) {
        console.log(buffer);
        // if (buffer.length > 500) {
        //   // 1024 byte 分数据包发送 
        //   const arr = [buffer.slice(0, 343), buffer.slice(343, 686), buffer.slice(686)]
        //   setTimeout(async () => {
        //     return await serial(arr[0]);
        //   }, 200)
        //   setTimeout(async () => {
        //     return await serial(arr[1]);
        //   }, 400)
        //   setTimeout(async () => {
        //     return await serial(arr[2]);
        //   }, 600)
        // } else {
        return await serial(buffer);
        // }
      }
      // async function bulk() {
      //   var chunks = splitBuffer(buffer, once_len);
      //   for (const chunk of chunks) {
      //     var arr = new Uint8Array(chunk.buffer);
      //     await serial(buffer);
      //   }
      // }
      // return await bulk();
    }

    /**
     * 发送数据包
     */
    async function sendPacket() {
      console.log('发送数据包', totalBytes, writtenBytes);
      const plan = (writtenBytes / totalBytes * 100).toFixed(2)
      store.commit("handleDeviceUploadPlan", plan)
      console.log(`sendPacket seq:${seq}/${file_trunks.length}`);
      onProgress([seq, file_trunks.length])
      if (seq < file_trunks.length) {
        var packet = file_trunks[seq];
        await sendBuffer(packet);
      } else {
        if (sending) {
          await sendBuffer(Buffer.from([EOT]));
        }
      }
    }

    // Handler for data from Ymodem
    /**
     * 处理来自设备返回的数据
     * @param {string} 16进制的数组
     */
    function handler(data) {
      let newData = ''
      for (let i = 0; i < data.length; i++) {
        if (i % 2 == 0 && i != 0) {
          newData += ' ' + data[i];
        } else {
          newData += data[i];
        }
      }
      newData = newData.split(" ")

      let PreChar = 0;
      // 遍历 buffer 
      for (var i = 0; i < newData.length; i++) {
        if (!finished) {
          var ch = ('0x' + newData[i]) * 1;
          // 判断Ymodem握手信号 是否存在 43
          if (ch === CRC16) {
            console.log('判断Ymodem握手信号');
            if (haveTimeout) {
              // 收到报文请求，取消超时定时器
              clearTimeout(timer);
            }

            console.log(`RCV: C @${seq}`);
            if (seq >= file_trunks.length) {
              logger(`SEND EOT @${seq}`);
              sendBuffer(eot_pack);
            } else if (PreChar != CRC16) {
              sendPacket();
              sending = true;
            }
          } else if (ch === ACK) {
            console.log('响应数据');
            logger(`RCV: ACK @${seq}`);
            if (!session) {
              close();
            }
            if (sending) {
              if (seq == 0) { //HEADER ACK ;DATA PACK followed by next C
                seq++;
              } else if (seq < file_trunks.length) {
                if (writtenBytes < totalBytes) {
                  writtenBytes = (seq + 1) * PACKET_SIZE_128;
                  if (writtenBytes > totalBytes) {
                    writtenBytes = totalBytes;
                  }
                }
                seq++;
                sendPacket();
              } else {
                /* send complete */
                sending = false;
                session = false;
                // send null header for end of session
                logger(`SEND EOT @${seq}`);
                sendBuffer(eot_pack);
              }
            }
          } else if (ch === NAK) {
            console.log('不响应');
            sendPacket();
          } else if (ch === CA) {
            console.log('传输中止');
            logger(`RCV: CA @${seq}`);
            close("CA");
          }
          PreChar = ch;
        }
      }
    }

    /**
     * 完成传输 
     * @param {type}
     * @param {Boolean} 是否传输成功    
     */
    function close(ch = '', success = true) {
      console.log('完成传输', success);
      session = false;
      sending = false;
      // serial.removeListener("data", handler);
      logger(`CLOSE BY [${ch}]`);
      if (!finished) {
        if (success) {
          const result = {
            filePath: filename,
            totalBytes: totalBytes,
            writtenBytes: writtenBytes,
          };
          resolve(result);
        } else {
          reject(new Error(`Timeout for Ymodem packet request expired: ${timeout} ms`));
        }
      }
      finished = true;
    }

    // 文件大小
    totalBytes = buffer.byteLength;

    // 处理文件的帧头
    var headerPayload = makeFileHeader(filename, totalBytes);
    file_trunks.push(headerPayload);

    // 处理文件的数据
    var payloads = splitFile(buffer, totalBytes, writtenBytes);
    payloads.forEach((payload) => {
      file_trunks.push(payload);
    });

    // 开始传输
    // eslint-disable-next-line
    session = true;
    // serial.on("data", handler);
    // getBLEDeviceServices(uni.getStorageSync('deviceId'), handler)

    // 1. 监听蓝牙设备返回的数据
    listenValueChange(handler)

    await handleOrder(fileSize)
  });
}