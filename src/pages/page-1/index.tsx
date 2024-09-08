import React, {useState} from "react";
import Nerv from 'nervjs'
import Taro from '@tarojs/taro'
import {Text, View} from '@tarojs/components'
import WXSDK from "@/service/WXSDK";
import GoodsDetail from "@/mall-pages/micropage/goods-detail"
import GoodsClass from "@/mall-pages/micropage/goods-class"
import {ComIcon} from "@/config/comptsConfig";

export default class Index extends React.Component<any> {
    [x: string]: any


    render() {
        //右上角胶囊
        const ClientRect = Taro.getMenuButtonBoundingClientRect();
        return (

            <View className="column-between window-height window-width bg-blue-grey-1 ">
                <View className="full-width" style={{height: `${ClientRect.bottom + 12}px`}}/>
                <View className="flex-1">
                    <View
                        className={`com-back-container  flex justify-between items-center r-ml-24`}
                        style={
                            {
                                height: ClientRect.height + 'px',
                                width: ClientRect.width + 'px',
                                lineHeight: ClientRect.height + 'px',
                                background: 'rgba(255,255,255,.6)'
                            }
                        }>
                        <ComIcon className="flex-2 row justify-center"
                                 prefixClass='pcicon'
                                 value='fanhui1'
                                 color={"#333"}
                                 size={15}
                        />
                        <ComIcon className="flex-1 text-center"
                                 prefixClass='pcicon'
                                 value='shuxian'
                                 color={"#333"}
                                 size={15}
                        />

                        <ComIcon className="flex-2 row justify-center"
                                 prefixClass='pcicon'
                                 value='huidaoshouye'
                                 color={"#333"}
                                 size={15}
                        />
                    </View>

                    <ComIcon prefixClass='pcicon' size="14" value='dingwei'/>
                    <ComIcon prefixClass='pcicon' size="14" className="text-grey2" value='xiala'/>
                    <ComIcon prefixClass='pcicon' size="28" value='lianxidaogou' />
                    <ComIcon className="text-yellow absilute-center" size="16"
                             prefixClass='pcicon' value='yiwancheng'/>
                </View>
            </View>
        )
    }
}
