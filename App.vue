<script>
  import {
    mapMutations,
    mapActions,
    mapState
  } from "vuex"
  
  import {
    getCourse
  } from "@/service/device.js"

  export default {
    computed: {
      ...mapState(['uuid', 'platform'])
    },
    onLaunch() {
      console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
      console.log('App Launch')

      // uni.getLocation()

      // 保持屏幕常亮
      uni.setKeepScreenOn({
        keepScreenOn: true
      });

      if (uni.getStorageSync('launchflag')) {
        uni.redirectTo({
          url: "/subpkg/device/device",
          success() {
            setTimeout(() => {
              plus.navigator.closeSplashscreen();
            }, 500)
          }
        })
      } else {
        uni.redirectTo({
          url: "/pages/connect/connect",
          success() {
            setTimeout(() => {
              plus.navigator.closeSplashscreen();
            }, 500)
          }
        })
      }

      switch (uni.getSystemInfoSync().platform) {
        case 'android':
          //底部导航栏(虚拟按键)背景颜色
          var color = plus.android.newObject("android.graphics.Color")
          var ac = plus.android.runtimeMainActivity();
          var c2int = plus.android.invoke(color, "parseColor", "#111111");
          // console.log("c2int===" + JSON.stringify(c2int))
          var win = plus.android.invoke(ac, "getWindow");
          // console.log("win===" + JSON.stringify(win))
          plus.android.invoke(win, "setNavigationBarColor", c2int);
          break;
        case 'ios':
          break;
      }

      //锁定屏幕方向
      plus.screen.lockOrientation('portrait-primary')

      const timer = setInterval(() => {
        // 获取手机设备号
        const uuid = plus.push.getClientInfo().clientid;
        // 判断机型
        const platform = uni.getSystemInfoSync().platform === "android" ? 1 : 2
        if (uuid && uuid !== 'null') {
          this.handleSavePhoneInfo({
            uuid,
            platform
          })
          // 静态教程更新检查
          // this.handleGetCourse()
          // app更新检查
          plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
            console.log("版本号", wgtinfo.version, wgtinfo.versionCode)
            this.handleSaveVersion(wgtinfo.version)
            this.handleCheckUpdate(wgtinfo.version)
          })
          clearInterval(timer)
        }
      }, 100)

      // 检查页面信息更新


    },
    onShow: function() {
      console.log('App Show')
    },
    onHide: function() {
      console.log('App Hide')
    },
    methods: {
      ...mapMutations(['handleSavePhoneInfo', 'handleSaveVersion']),
      ...mapActions(['handleCheckUpdate']),
      // 获取教程
      async handleGetCourse() {
        const params = {
          device_id: this.uuid,
          system: this.platform,
          type: 1
        }
        const {
          data
        } = await getCourse(params)
        console.log('教程', data);
        this.couresList = data.page_list
      },
    }
  }
</script>

<style lang="scss">
  /*每个页面公共css */
  @import '@/static/css/font.css';
  @import '@/static/css/custom-uni.css';
  @import '@/uni_modules/uni-scss/index.scss';
  /* #ifndef APP-NVUE */
  @import '@/static/customicons.css';

  // 设置整个项目的背景色
  page {
    background-color: #111111;
    font-family: "Corbelb";
  }

  /* #endif */
  .example-info {
    font-size: 14px;
    color: #333;
    padding: 10px;
  }
</style>