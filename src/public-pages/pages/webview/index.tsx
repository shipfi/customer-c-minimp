import React from "react";
import Nerv from 'nervjs'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Image, Input, Text, View, WebView} from '@tarojs/components'
// import {AtIcon} from 'taro-ui'
import ApiRequest from '@/service'
import log from "@/utils/log"
import ComPop from '@/materials/m-pop'
import {Blank, ComBack, ComConcat, ComSearch, MGoodsItem, NoData} from '@/config/comptsConfig'
import {GoodsListState} from 'typings'
import {getParamsAsRoute, getShareConfig, productPay} from '@/service/public'
import MscrollView from '@/materials/m-scroll-view'
import {GoodsInfo} from '@/service/pageType'
import config from "@/config";
import cacheManager from "@/service/cacheManager";
import WXSDK from "@/service/WXSDK";
import {AppUrls} from "@/config/pathConfig";

import {connect} from 'react-redux';
import {setSignOkMsg} from '@/store/actions'
import {pageLeave, pageView, sensorEventFunc} from "@/service/sensorRegister";
import SensorsApp, {PAGE_VIEW_ID} from "@/service/sensors";

export default class Index extends React.Component<any> {
    [x: string]: any

    state = {
        linkValue: "",
        sensorEvent: null,
        enterTime: null
    }

    // 生命周期钩子
    async componentDidMount() {
        // 路由信息
        const curInstance = getCurrentInstance();
        const curentParams = curInstance.router?.params;
        const {linkValue} = curentParams || {}
        const {cstId} = cacheManager.getCustomerUserInfo() || {}
        pageView({pageTitle: '关注公众号'})
        console.log({curentParams});
        const hasPars = decodeURIComponent(linkValue).indexOf("?") > -1;

        this.setState({linkValue: decodeURIComponent(linkValue + (hasPars ? "&" : "?") + "cstId=" + cstId)})
    }
    componentDidShow(){
        // pageView({pageTitle: '关注公众号'})
    }

    onShareAppMessage(res) {
        const {path, title, imageUrl} = getShareConfig();
        return {
            title,
            path,
            imageUrl
        }
    }


    componentWillUnmount() {
        pageLeave()
    }

    componentDidHide() {
        pageLeave()
    }

    render() {
        //右上角胶囊
        const ClientRect = Taro.getMenuButtonBoundingClientRect();

        //设备信息
        const systemInfo = Taro.getSystemInfoSync()
        const scrollViewHeight = systemInfo.windowHeight - ClientRect.bottom - 22 + "px";

        const {linkValue} = this.state

        return (
            <View>
                {!!linkValue && <WebView src={linkValue}/>}
            </View>
        )
    }
}
