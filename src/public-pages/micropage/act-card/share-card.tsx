import React from "react";
import Nerv from 'nervjs'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Block, Button, Canvas, Image, Input, Text, View} from '@tarojs/components'
import ApiRequest, {getTabBarList, computedTabMenu} from '@/service'
import log from "@/utils/log"
import {MBottom, MPop} from '@/config/comptsConfig'
import cacheManager from "@/service/cacheManager";
import WXSDK from "@/service/WXSDK";
import {AppUrls} from "@/config/pathConfig";
import CacheManager from "@/service/cacheManager";
import {limitClick} from "@/utils";
import {ORDER_DEFAULT_IMAGE, LOGO} from "@/utils/image";
import CanvasDraw from "@/utils/canvasDraw";
import {KY_SHARE_CARD_XILIE, KY_SHARE_CARD_LB} from "@/utils/image";
import IconFont from "@/components/iconfont";
import SensorsApp, {NEW_MP_CLICK_EVENT_ID} from "@/service/sensors";
import {actPageName} from "@/utils/utils";

export default class Index extends React.Component<any> {
    [x: string]: any

    public state: any = {
        t: new Date(),
        canvasImage: "",
        CanvasD: null,
        qrcode: null,
    }

    // 生命周期钩子
    async componentDidMount() {
        // const {buffer} = await this.getQrcode() || {};
        setTimeout(() => {
            this.DrawInit();
        }, 100)

    }

    /**
     * 保存图片到相册
     */
    saveImage(e) {
        e.stopPropagation();
        // const {qrcode} = this.state;
        this.CanvasD.saveOnlyImage();
    }

    // 转换图片为正方形
    covertImageAsround(url) {
        return new Promise((resolve) => {
            Taro.getImageInfo({
                src: url,
                success: (res) => {
                    // 取最小值截取正方形
                    const w = Math.min(...[res.width, res.height]);
                    console.log("转换图片为正方形---", `${url}?imageView2/1/w/${w}/h/${w}`);
                    resolve(`${url}?imageView2/1/w/${w}/h/${w}`);
                },
                fail: () => {
                    resolve(url);
                }
            });
        });
    }

    // 获取小程序码
    async getQrcode() {
        const {sharePageId, iactivityId, sitId, from_scene, matId, refGuider, fromPageId, advScene} = this.props;
        const empCode = cacheManager.getPcenterInfo()?.empCode

        const customerInfo = cacheManager.getCustomerUserInfo();
        const {cstId} = customerInfo;
        return ApiRequest.commonQrcode({
            postParams: {
                scene: 'formal',
                iactivityId,
                pageId: sharePageId,
                referrer: cstId,
                sitId,
                matId,
                refGuider,
                fromPageId,
                fromScene: from_scene || "CAD",
                paramMap: {
                    eg: empCode
                }
            }
        })
    }

    /**
     * 绘图初始化
     * @constructor
     */
    public async DrawInit() {
        WXSDK.showLoading('生成中');

        const {buffer} = await this.getQrcode() || {};
        const that = this;
        this.draw_type = 2;
        const {shareRules, activityType, activityId, title} = this.props;
        const {cardPicUrl, posterPicUrl} = shareRules?.showSettings || {};
        const customerInfo = cacheManager.getCustomerUserInfo();
        const {phone} = customerInfo;
        const textArr = [
            {
                "title": `${title}`,
                "color": "#1A1A1A",
                "fontSize": 24,
                "fontWeight": "600",
                "textAlign": "left",
                "maxLen": 30,
                "lineWidth": 308,
                "line": 2,
                "x": 22,
                "y": 674
            },
            {
                "title": phone ? `由尾号${phone?.substr(-4)}分享` : "",
                "color": "#808080",
                "fontSize": 20,
                "fontWeight": "500",
                "textAlign": "left",
                "line": 2,
                "x": 22,
                "y": 762
            }
        ]

        const query = Taro.createSelectorQuery(); //如果是在组件中，则改成 this.createSelectorQuery()
        query.select("#sharePic").fields({node: true, size: true}).exec(async (res) => {
            const canvas = res[0]?.node;
            const ctx = canvas.getContext("2d");

            const dpr = Taro.getSystemInfoSync().pixelRatio;
            canvas.width = 480;
            canvas.height = 798;
            ctx.scale(1, 1);
            const CanvasD = new CanvasDraw(canvas, ctx, 480, 798);
            that.CanvasD = CanvasD;
            that.setState({CanvasD});
            await CanvasD.roundRect(0, 0, 480, 798, 0);
            await CanvasD.DrawImg2d(buffer, 344, 652, 114, 114);
            await CanvasD.drawTXT(textArr);

            await CanvasD.roundRect(0, 0, 480, 632, 0);
            await CanvasD.DrawImg2d(posterPicUrl, 0, 0, 480, 632);

            const result = await CanvasD._canvasToPath(that);
            that.setState({canvasImage: result, qrcode: buffer}, () => {
                WXSDK.hideLoading()
            })
        });
        // });
    }

    render() {
        //右上角胶囊
        const ClientRect = Taro.getMenuButtonBoundingClientRect();
        //设备信息
        const systemInfo = Taro.getSystemInfoSync()
        const {canvasImage} = this.state;
        const {sharePopColse} = this.props;

        return (
            <MPop isShow={true} popStyle={{background: "rgba(0,0,0,0.8)"}}>
                <View className="border-box window-width window-height" onClick={(e) => {
                    e.stopPropagation();
                    sharePopColse()
                }}>
                    <View className="absolute-center window-width window-height r-pt-100">
                        <View className="canvas-box r-mx-auto flex flex-center"
                              style={`border-radius:16px;width:500rpx;height: calc(100% - 324rpx)`} onClick={(e) => {
                            e.stopPropagation();
                            sharePopColse();
                        }}>
                            {
                                canvasImage ?
                                    <Image className="img block vertical-bottom" src={canvasImage}
                                           mode="aspectFit" onClick={(e) => {
                                        e.stopPropagation();
                                    }}/> : ""
                            }
                        </View>
                        {
                            !!canvasImage && <MBottom>
                                <View className="column bg-white"
                                      onClick={(e) => e.stopPropagation()}>
                                    <View className="flex-1 r-my-32 flex items-center">
                                        <View
                                            className="flex-1 full-height text-center flex items-center justify-center relative-position"
                                            onClick={(e) => e.stopPropagation()}>
                                            <IconFont name={"pcicon-fasonghaoyou"} size={80}/>
                                            <View className="text-subTitle r-ml-16">发送好友</View>
                                            <Button
                                                className="text col-grow column items-center  no-line-height absolute-full opacity-0"
                                                open-type="share" lang="zh_CN"/>
                                        </View>
                                        <View
                                            className="flex-1 full-height text-center flex items-center justify-center"
                                            onClick={this.saveImage.bind(this)}>
                                            <IconFont name={"pcicon-baocunhaibao"} size={80}/>
                                            <View className="text-subTitle r-ml-16">保存海报</View>
                                        </View>
                                    </View>
                                    <View className="" onClick={(e) => {
                                        e.stopPropagation();
                                    }}>
                                        <View className="r-mx-auto share-cancel-btn text-bold text-center"
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  sharePopColse()
                                              }}>取消</View>
                                    </View>
                                </View>
                            </MBottom>
                        }

                    </View>
                    <Canvas type="2d" id="sharePic"
                            style="width:480px;height:798px;position: fixed;top: -10000rpx;"/>
                </View>
            </MPop>
        )


    }
}
