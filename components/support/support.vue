<template>
  <view class="support">
    <view class="set">
      <view>Contact us</view>
      <!-- <view class="icon">
        <image src="@/static/img/device/about/support_right.png" />
      </view> -->
    </view>

    <view class="msg">
      <view style="margin-bottom: 10rpx; font-family: 'DIN Regular';" @click="handleCall">Phone: {{message.phone_num}}
      </view>
      <view style="margin-bottom: 41rpx;" @click="handleCopy">Email: {{message.email}}</view>
    </view>

    <view class="statement" @click="handleGoToManual">
      <view class="item">
        <text>Manual</text>
        <view class="icon">
          <image src="@/static/img/device/about/support_right.png" mode=""></image>
        </view>
      </view>
    </view>

    <!-- <view class="statement">
      <view class="item">
        <uni-badge size="small" text=" " :is-dot="true" absolute="rightTop" type="error" v-if="!isUpgrade">
          <text>Feedback</text>
        </uni-badge>
        <text v-else>Feedback</text>
        <view class="icon">
          <image src="@/static/img/device/about/support_right.png" mode=""></image>
        </view>
      </view>
    </view> -->

    <!-- 最新版本区域 -->
    <view class="statement" v-if="JSON.stringify(uploadInfo) === '{}' && linkStatus !== 'notLink'">
      <view class="item">
        <text>Upgrade</text>
        <view style="color: #888888; font-size: 36rpx;" v-show="JSON.stringify(deviceInfo) !== '{}'">
          Already up to date
        </view>
      </view>
    </view>

    <!-- 有新版本区域 -->
    <view class="statement" v-if="JSON.stringify(uploadInfo) !== '{}' && !progressMsg && linkStatus !== 'notLink'">
      <view class="item">
        <view class="new-version">
          <uni-badge size="small" text=" " :is-dot="true" absolute="rightTop" type="error">
            <text>Upgrade</text>
          </uni-badge>
          <text style="font-family: DIN Regular; font-size: 26rpx; color: #888888; margin-left: 30rpx;">
            new firmware found
          </text>
        </view>
        <view class="download" @click="handleDownloadClick">
          <image src="@/static/img/device/support/xz.png" mode=""></image>
        </view>
      </view>
    </view>

    <!-- 正在下载 -->
    <view class="upgrade" v-if="JSON.stringify(uploadInfo) !== '{}' && progressMsg && linkStatus !== 'notLink'">
      <view class="item">
        <uni-badge size="small" text=" " :is-dot="true" absolute="rightTop" type="error">
          <text>Upgrade</text>
        </uni-badge>
        <view class="load">
          <image src="@/static/img/device/about/load.png"
            v-if="progressMsg === 'Downloading...' || progressMsg === 'Installing'"></image>
          <text class="success" v-if="progressMsg === 'Upgrade completed'">Already up to date</text>
          <button v-if="progressMsg === 'Doenload failed' || progressMsg === 'Installation failed'"
            @click="handleDownloadClick">
            Continue
          </button>
        </view>
      </view>

      <view class="progress" v-if="progressMsg === 'Downloading...' || progressMsg === 'Installing'">
        <view class="title">
          <view class="progress-msg">
            <image src="@/static/img/device/support/success.png" v-if="progressMsg === 'Upgrade completed'"></image>
            <image src="@/static/img/device/support/gb.png"
              v-if="progressMsg === 'Doenload failed' || progressMsg === 'Installation failed'"></image>
            <view>{{progressMsg}}</view>
          </view>
          <view>{{deviceUploadPlan}}%</view>
        </view>
        <progress :percent="deviceUploadPlan" stroke-width="4" backgroundColor="#111111"
          activeColor="rgba(255, 134, 22, 1)" />
      </view>
    </view>
  </view>
</template>

<script>
  // import fs from "fs"
  // import SerialPort from 'serialport'
  // import YModem from 'ymodem'
  import {
    transfer
  } from "@/utils/transfer.js"

  import {
    writeBLECharacteristicValue,
    _writeBLECharacteristicValue
  } from "@/utils/initBluetooth.js"

  import {
    analysisAscll
  } from "@/utils/analysisAscll.js"
  import {
    crc16xmodem
  } from '@/utils/CRC_XMODEM.js'
  import {
    mapState,
    mapMutations,
    mapActions
  } from "vuex"

  export default {
    name: "support",
    props: {
      message: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        isUpgrade: false,
        platform: '',
        // a: ""
      };
    },
    computed: {
      ...mapState(['uploadInfo', 'progressMsg', 'deviceUploadPlan', 'deviceInfo', 'linkStatus'])
    },
    mounted() {
      this.platform = uni.getSystemInfoSync().platform
    },
    methods: {
      ...mapMutations(['handleProgressMsg', 'handleDeviceUploadPlan', "handleSaveUploadInfo"]),
      ...mapActions(['handleUpgrade']),

      handleGoToManual() {
        uni.navigateTo({
          url: "/subpkg/device/c-views/manual/manual"
        })
      },
      handleCall() {
        // 获取设备平台
        let platform = uni.getSystemInfoSync().platform
        switch (platform) {
          case 'android':
            plus.device.dial(this.message.phone_num, false)
            break;
          case 'ios':
            // 使用uni-app提供的借口
            uni.makePhoneCall({
              phoneNumber: this.message.phone_num

            })
            break;
        }
      },
      handleCopy() {
        uni.setClipboardData({
          data: this.message.email,
          success: () => {
            uni.showToast({
              title: 'Successful replication',
              icon: 'none'
            })
          }
        });
      },
      // 处理查询是否已经下载文件
      handleCheckFile() {
        return new Promise((result, reject) => {
          plus.io.resolveLocalFileSystemURL('_downloads/app.bin', (entry) => {
            // entry.remove()
            result({
              code: 200
            })
          }, err => {
            result({
              code: 404
            })
          })
        })
      },
      // 处理文件下载的点击
      async handleDownloadClick() {
        let filePath = '';
        const {
          code
        } = await this.handleCheckFile()

        switch (code) {
          case 200:
            filePath = uni.getStorageSync('filePath')
            this.fetchFileData(filePath, this.handleTransferFiles)
            break
          case 404:
            this.handleDeviceUploadPlan(0)
            this.handleProgressMsg("Downloading...")
            let flieName = this.uploadInfo.file_url.split('/')
            flieName = flieName.splice(flieName.length - 1, 1)
            flieName = flieName[0]

            const downloadTask = plus.downloader.createDownload(this.uploadInfo.file_url, {
              // filename: "_downloads/" + flieName //利用保存路径，实现下载文件的重命名
              timeout: 10,
              retry: 1,
              retryInterval: 5
            }, (d, status) => {
              //d为下载的文件对象
              if (status == 200) {
                //下载成功,d.filename是文件在保存在本地的相对路径，使用下面的API可转为平台绝对路径
                filePath = plus.io.convertLocalFileSystemURL(d.filename);
                uni.setStorageSync('filePath', filePath)
                this.fetchFileData(filePath, this.handleTransferFiles)
              } else {
                //下载失败
                plus.downloader.clear();
                this.handleProgressMsg("Doenload failed")
              }
            })
            downloadTask.start()
            downloadTask.addEventListener('statechanged', e => {
              if (e && e.downloadedSize > 0) {

                const progress = ((e.downloadedSize / e.totalSize) * 100).toFixed(2)
                this.handleDeviceUploadPlan(progress)
              }
            }, false)

            // const downloadTask = uni.downloadFile({
            //   url: this.uploadInfo.file_url,
            //   success: (data) => {
            //     if (data.statusCode === 200) {
            //       uni.saveFile({
            //         tempFilePath: data.tempFilePath,
            //         success: (res) => {
            //           filePath = res.savedFilePath
            //           uni.setStorageSync('filePath', filePath)
            //           this.fetchFileData(filePath, this.handleTransferFiles)
            //         }
            //       })
            //     }
            //   }
            // })
            // downloadTask.onProgressUpdate(res => {
            //   this.handleDeviceUploadPlan(res.progress)
            // })
            break
        }
      },
      /**
       * 处理文件传输
       * @param {String} 文件名称
       * @param {Buffer} 文件内容  
       * @param {number} fileName 文件大小   
       */
      handleTransferFiles(fileName, fileBuf, fileSize) {
        transfer(_writeBLECharacteristicValue, fileName, fileBuf, fileSize)
          .then((res) => {
            console.log(res.totalBytes, res.writtenBytes);
            if (res && res.totalBytes == res.writtenBytes) {
              this.handleProgressMsg("Upgrade completed")
              this.handleSaveUploadInfo({})
              plus.io.resolveLocalFileSystemURL('_downloads/app.bin', (entry) => {
                entry.remove()
              })
              console.log('file transfer successful')
            } else {
              this.handleProgressMsg("Installation failed")
              console.log('file transfer error')
            }
          });
      },
      /**
       * 处理读取文件
       * @param {Object} 文件路径
       * @param {Function} 读取文件成功后的回调函数
       */
      fetchFileData(filePath, cb) {
        plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, fs => {
          console.log(filePath);
          fs.root.getFile(filePath, {}, fileEntry => {
            // 文件在手机中的路径
            console.log('文件在手机中的路径', fileEntry.fullPath)
            fileEntry.file((file) => {
              try {
                const fileReader = new plus.io.FileReader();
                console.log("getFile:" + JSON.stringify(file));
                fileReader.readAsDataURL(file) // , "utf-8"
                fileReader.onloadend = async (res) => { //读取文件内容成功后的回调事件
                  //res.target.result读取到的文件内容信息 base64 格式
                  // 读取文件时会返回一个 Data URL，这个 URL 包括了 MIME 类型（application/octet-stream）以及 base64, 的标识
                  const base64Data = res.target.result.split(',')[1];
                  // console.log(base64Data);
                  // 将 Base64 编码的字符串转换为 ArrayBuffer
                  const binaryData = uni.base64ToArrayBuffer(base64Data);
                  // 在这里可以处理读取到的二进制数据
                  const fileContent = new Uint8Array(binaryData);
                  // console.log('文件读取成功', fileContent);


                  this.handleDeviceUploadPlan(0)
                  this.handleProgressMsg("Installing")
                  if (this.platform === 'ios') {
                    uni.$showMsg("Do not exit the app!")
                  }
                  // res.target.result
                  await cb && cb(file.name, fileContent, file.size)

                  // this.handleOrder()
                }
              } catch (e) {
                //TODO handle the exception
                console.log(222, e);
              }
            })
          })
        })
      },
      // 处理发送固件升级指令
      handleOrder() {
        // 设备名称长度
        const fw_lenght = parseInt(this.deviceInfo.fw_vs.length).toString(16).length > 1 ?
          parseInt(this.deviceInfo.fw_vs.length)
          .toString(16) : '0' + parseInt(this.deviceInfo.fw_vs.length).toString(16)

        // 数据长度 固件名称长度 + 固件号
        let msgLength = ''
        if (this.deviceInfo.fw_vs.length + 1 > 255 && this.deviceInfo.fw_vs.length + 1 <
          4096) {
          msgLength = '0' + (parseInt(this.deviceInfo.fw_vs.length) + 1).toString(16)
          msgLength = msgLength.slice(2) + ' ' + msgLength.slice(0, 2)
        } else if (this.deviceInfo.fw_vs.length + 1 >= 4096) {
          msgLength = (parseInt(this.deviceInfo.fw_vs.length) + 1).toString(16)
          msgLength = msgLength.slice(2) + ' ' + msgLength.slice(0, 2)
        } else if (this.deviceInfo.fw_vs.length + 1 <= 15) {
          msgLength = '0' + (parseInt(this.deviceInfo.fw_vs.length) + 1).toString(16) + " 00"
        } else {
          msgLength = (parseInt(this.deviceInfo.fw_vs.length) + 1).toString(16) + " 00"
        }
        const msg = analysisAscll(this.deviceInfo.fw_vs)
        const upgrade_date = analysisAscll(this.uploadInfo.upgrade_time)
        const file_length = analysisAscll(this.uploadInfo.file_length + '')
        const hash_sha_256 = analysisAscll(this.uploadInfo.hash_sha_256 + '')
        const CRC = crc16xmodem(
          `6A 01 B5 ${msgLength} ${fw_lenght} ${msg} ${upgrade_date} ${file_length} ${hash_sha_256}`)

        // 固件升级指令
        setTimeout(() => {
          writeBLECharacteristicValue(
            `6A 01 B5 ${msgLength} ${fw_lenght} ${msg} ${upgrade_date} ${file_length} ${hash_sha_256} ${CRC} 0A`)
        }, 200)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .support {
    font-size: 36rpx;
    color: rgba(255, 255, 255, 1);

    .msg {
      // margin-top: 30rpx;
      height: 127rpx;
      border-bottom: 2rpx solid #222222;
      color: #888888;
      font-size: 28rpx;
      font-family: "Corbel";
    }

    .set {
      height: 84rpx;
      margin-top: 108rpx;
      margin-bottom: 10rpx;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .statement {
      height: 125rpx;
      border-bottom: 2rpx solid rgba(34, 34, 34, 1);
      padding: 40rpx 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: space-between;

      .new-version {
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }

      .download {
        width: 42.55rpx;
        height: 41.28rpx;

        image {
          width: 100%;
          height: 100%;
        }
      }
    }

    .upgrade {
      height: 360rpx;
      border-bottom: 2rpx solid rgba(34, 34, 34, 1);
      padding: 40rpx 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;

      .load {
        color: #888888;
        font-family: "DIN Regular";
        font-size: 26rpx;

        image {
          width: 47rpx;
          height: 47rpx;
          animation: iconRptate 2s linear infinite;
        }

        uni-button {
          width: 180rpx;
          height: 70rpx;
          border-radius: 15rpx 15rpx 15rpx 15rpx;
          background: #111111;
          border: 1rpx solid #FF8616;
          color: #FF8616;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 30rpx;
        }
      }

      @keyframes iconRptate {
        0% {
          transform: rotate(0);
        }

        100% {
          transform: rotate(360deg);
        }
      }
    }

    .item {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .icon {
      width: 18rpx;
      height: 27rpx;
      display: flex;
      align-items: center;

      image {
        width: 100%;
        height: 100%;
      }
    }

    .title {
      color: rgba(255, 134, 22, 1);
      font-size: 28rpx;
      font-family: "DIN Regular";
    }

    .progress {
      width: 690rpx;
      height: 150rpx;
      margin-top: 40rpx;
      padding: 0 30rpx;
      background: #222222;
      border-radius: 20rpx 20rpx 20rpx 20rpx;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-around;

      .title {
        // margin-top: 30rpx;
        // margin-bottom: 40rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: "DIN Regular";
        color: #FFFFFF;
        font-size: 26rpx;

        .progress-msg {
          display: flex;
          justify-content: flex-start;
          align-items: center;

          image {
            width: 31rpx;
            height: 31rpx;
            margin-right: 6rpx;
          }
        }
      }
    }
  }
</style>