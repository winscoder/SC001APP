
var isReady=false;var onReadyCallbacks=[];
var isServiceReady=false;var onServiceReadyCallbacks=[];
var __uniConfig = {"pages":["pages/connect/connect","pages/demo/demo","pages/product-tutorial/product-tutorial","pages/help/help","subpkg/device/device","subpkg/device/c-views/bluetooth-setting/bluetooth-setting","subpkg/device/c-views/manual/manual","subpkg/looking-for-device/looking-for-device","subpkg/device/c-views/manual/detail/detail"],"window":{"navigationBarTextStyle":"black","navigationBarTitleText":"uni-app","navigationBarBackgroundColor":"#F8F8F8","backgroundColor":"#F8F8F8","background":"#efeff4"},"darkmode":false,"nvueCompiler":"uni-app","nvueStyleCompiler":"uni-app","renderer":"auto","splashscreen":{"alwaysShowBeforeRender":false,"autoclose":false},"appname":"ezGo","compilerVersion":"3.8.4","entryPagePath":"pages/connect/connect","networkTimeout":{"request":60000,"connectSocket":60000,"uploadFile":60000,"downloadFile":60000}};
var __uniRoutes = [{"path":"/pages/connect/connect","meta":{"isQuit":true},"window":{"navigationBarTextStyle":"white","disableScroll":true,"backgroundColor":"#111111","titleNView":false,"background":"#111111"}},{"path":"/pages/demo/demo","meta":{},"window":{"navigationBarTextStyle":"white","disableScroll":true,"backgroundColor":"#111111","titleNView":false,"background":"#111111"}},{"path":"/pages/product-tutorial/product-tutorial","meta":{},"window":{"navigationBarTextStyle":"white","backgroundColor":"#111111","disableScroll":true,"titleNView":false,"background":"#111111"}},{"path":"/pages/help/help","meta":{},"window":{"navigationBarTextStyle":"white","disableScroll":true,"backgroundColor":"#111111","titleNView":false,"background":"#111111"}},{"path":"/subpkg/device/device","meta":{},"window":{"navigationBarTextStyle":"white","backgroundColor":"#111111","disableScroll":true,"titleNView":false,"background":"#111111"}},{"path":"/subpkg/device/c-views/bluetooth-setting/bluetooth-setting","meta":{},"window":{"navigationBarTextStyle":"white","backgroundColor":"#111111","disableScroll":true,"titleNView":false,"background":"#111111"}},{"path":"/subpkg/device/c-views/manual/manual","meta":{},"window":{"navigationBarTextStyle":"white","backgroundColor":"#111111","disableScroll":true,"titleNView":false,"background":"#111111"}},{"path":"/subpkg/looking-for-device/looking-for-device","meta":{},"window":{"navigationBarTextStyle":"white","backgroundColor":"#111111","disableScroll":true,"titleNView":false,"background":"#111111"}},{"path":"/subpkg/device/c-views/manual/detail/detail","meta":{},"window":{"navigationBarBackgroundColor":"#111111","navigationBarTextStyle":"white","backgroundColor":"#111111"}}];
__uniConfig.onReady=function(callback){if(__uniConfig.ready){callback()}else{onReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"ready",{get:function(){return isReady},set:function(val){isReady=val;if(!isReady){return}const callbacks=onReadyCallbacks.slice(0);onReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
__uniConfig.onServiceReady=function(callback){if(__uniConfig.serviceReady){callback()}else{onServiceReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"serviceReady",{get:function(){return isServiceReady},set:function(val){isServiceReady=val;if(!isServiceReady){return}const callbacks=onServiceReadyCallbacks.slice(0);onServiceReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
service.register("uni-app-config",{create(a,b,c){if(!__uniConfig.viewport){var d=b.weex.config.env.scale,e=b.weex.config.env.deviceWidth,f=Math.ceil(e/d);Object.assign(__uniConfig,{viewport:f,defaultFontSize:Math.round(f/20)})}return{instance:{__uniConfig:__uniConfig,__uniRoutes:__uniRoutes,global:void 0,window:void 0,document:void 0,frames:void 0,self:void 0,location:void 0,navigator:void 0,localStorage:void 0,history:void 0,Caches:void 0,screen:void 0,alert:void 0,confirm:void 0,prompt:void 0,fetch:void 0,XMLHttpRequest:void 0,WebSocket:void 0,webkit:void 0,print:void 0}}}});