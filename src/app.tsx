
import Nerv from 'nervjs'
import React from "react";
import Taro from '@tarojs/taro'
import configStore from '@/store'
import cacheManager from '@/service/cacheManager'
import {Provider} from "react-redux";
import './app.styl'
// import './styles/stylus/iconfont/iconfont.styl'
import SensorsApp from "@/service/sensors";

const store = configStore()

SensorsApp.init()

class App extends React.Component {
    // // [x: string]: any

    public checkUpdateVersion() {
        //判断微信版本是否 兼容小程序更新机制API的使用
        if (!Taro.canIUse("getUpdateManager")) {
            //TODO 此时微信版本太低（一般而言版本都是支持的）
            Taro.showModal({
                title: "溫馨提示",
                content: "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。"
            });
        } else {
            //创建 UpdateManager 实例
            // @ts-ignore
            const updateManager = Taro.getUpdateManager();
            console.log("是否进入模拟更新", updateManager);
            //检测版本更新
            updateManager.onCheckForUpdate(function (res) {
                console.log("是否获取版本", res);
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    //监听小程序有版本更新事件
                    updateManager.onUpdateReady(function () {
                        //TODO 新的版本已经下载好，调用 applyUpdate 应用新版本并重启 （ 此处进行了自动更新操作）
                        updateManager.applyUpdate();
                    });
                    updateManager.onUpdateFailed(function () {
                        // 新版本下载失败
                        Taro.showModal({
                            title: "已经有新版本喽~",
                            content: "请您删除当前小程序，到微信 “发现-小程序” 页，重新搜索打开哦~"
                        });
                    });
                }
            });
        }
    }

    onLaunch(a) {

        //@ts-ignore
        console.log("------------------------------", a, __wxConfig);
        //@ts-ignore
        Taro.setStorageSync("LOGO_URL", __wxConfig.accountInfo.icon)
    }


    componentDidMount() {

        // 打开调试
        // Taro.setEnableDebug({
        //   enableDebug: false
        // })

        Taro.getSystemInfo({
            success: function (rel) {
                console.log("isIphoneX--", rel, cacheManager.getIsIphoneX());
                // const model = rel.model.replace(/\s/g, "");
                const model = rel.model;
                // const modelList = ["iPhone X", "iPhone 11", "iPhone XS", "iPhone XS Max", "iPhone 11 Pro Max", "iPhone XR","iPhone 12/13 mini"];
                const inModel = model.indexOf("iPhone X") > -1 || model.indexOf("iPhone 11") > -1 || model.indexOf("iPhone 12") > -1 || model.indexOf("iPhone 13") > -1 || model.indexOf("iPhone 14") > -1 || model.indexOf("iPhone 15") > -1;
                console.log("===", inModel, model, model.indexOf("iPhone X"), model.indexOf("iPhone 11"), model.indexOf("iPhone XS"), model.indexOf("iPhone XR"));
                if (inModel) {
                    cacheManager.setIsIphoneX(1);
                }
            }
        });
        this.checkUpdateVersion();
    }

    componentDidShow() {
    }

    componentDidHide() {
    }

    componentDidCatchError() {
    }

    // this.props.children 是将要会渲染的页面
    render() {
        //@ts-ignore
        return <Provider store={store}>{this.props.children}</Provider>
        // return this.props.children
    }
}

export default App
