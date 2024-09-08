import React, {useEffect, useState} from "react";
import Nerv from "nervjs";
import Taro, {getCurrentInstance} from "@tarojs/taro";
import {Block, Button, Image, Text, View} from "@tarojs/components";
import ApiRequest from "@/service/index";
import API_CONFIG, {computedTabMenu} from "@/service/index";
// 日志服务， 该应用下的日志会推送到小程序后台
import log from "@/utils/log";
import cacheManager, {CacheItemType} from "@/service/cacheManager";
import WXSDK from "@/service/WXSDK";
import {AppUrls} from "@/config/pathConfig";
import eventBus from "@/utils/eventBus";
import {debounce, includesArr, isEmpty, parseParams} from "@/utils";
import Components from "./components"
import PrivacyPopup from "@/components/privacyPop"
import {AgreePage, ComBackKy, MPop, OpenAdv,} from "@/config/comptsConfig";
import ComCouponAdv from "@/components/com-coupon-adv"

import {FULL_SCREEN_PAGES, HIDE_TITLE_PAGES} from "@/config/page_config"
import {getCustomerInfo, getShareConfig} from "@/service/public";
import Blank from "@/components/blank";
import {getCouponStateOnEvent, openPicStateOnEvent, openSiteStateOnEvent, openSuperStateOnEvent} from "@/utils/events";
import CDialog from "@/components/c-dialog";
import SensorsApp, {NEW_MP_CLICK_EVENT_ID, PAGE_VIEW_ID} from "@/service/sensors";
import {pageLeave, pageView, sensorEventFunc} from "@/service/sensorRegister";

export default class Index extends React.Component<any> {
    [x: string]: any;

    public state: any = {
        /**
         * 页面配置详情
         */
        pageInfo: null,

        // 会员商城网点详情
        siteInfo: null,
        /**
         * 底部导航菜单
         */
        tabList: [],

        /**
         * 当前页面ID
         */
        pageId: 0,

        /*
        * 是否显示底部菜单
        */
        isShowTab: false,

        /*
        * 是否显示header title
        */
        isShowTitle: true,

        /*
        * 是否全屏模式 （全屏模式下顶部header透明）
        */
        isFullScreen: false,
        refPageName: '',

        /*开屏广告*/
        showOpenScreenAdv: false,

        /*领券通知展示*/
        showGetCouponAdv: false,

        /*补签协议*/
        showAgreement: false,

        /*来源页面ID*/
        fromPageId: 0,

        /*来源场景*/
        from_scene: "CAD",

        /*会员等级配置*/
        memberRankConfig: [],

        /*任务活动*/
        taskPar: null,

        /*打开图片*/
        openPic: false,
        openPicData: {},

        /*打开企业微信*/
        openSiteQw: false,
        openSiteQwData: {},

        // 无落地页领券弹框
        openGetCoupon: false,

        pagesDetails: {},
        codes: [],

        /* 主页面code, 标记当前页面主组件code（）*/
        mainPageCode: "",

        /*术铂小程序*/
        openSuperState: false,

        //隐私协议开关
        showPrivacy: false,
        // sensorEvent: null,
        // // 进入时间
        // enterTime: null
    };


    // 生命周期钩子
    async componentDidMount() {
        const self = this;
        console.log("index-->componentDidMount", this)

        /**
         * 小程序隐私协议状态读取
         */
        //@ts-ignore
        if (wx.onNeedPrivacyAuthorization) {
            //@ts-ignore
            wx.onNeedPrivacyAuthorization((resolve, eventInfo) => {
                console.log('触发本次事件的接口是：' + eventInfo.referrer, {resolve, eventInfo})
                /*
                 * 需要用户同意隐私授权时，弹出开发者自定义的隐私授权弹窗
                 */
                self.setState({
                    showPrivacy: true,
                    resolvePrivacyAuthorization: resolve,
                    eventInfo
                })
            })
        }

        /**
         * 返回网络类型, 有效值：
         * wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
         */
        Taro.getNetworkType({
            success(res) {
                const networkType = res.networkType;
                self.setState({networkType});
            }
        }).then(r => r);

        const curInstance = getCurrentInstance();
        const {path, params: routeParams} = curInstance.router;
        const actResult = routeParams?.activityId || routeParams?.iactivityId ? await ApiRequest.commonActivityInfo({postParams: {activityId: routeParams?.iactivityId || routeParams?.activityId}}) : null
        cacheManager.setActCommonInfo(JSON.stringify(actResult))
        !!routeParams?.matId && SensorsApp.CusClick(NEW_MP_CLICK_EVENT_ID.GET_CUBE_URL, {
            activity_id: routeParams?.activityId || routeParams?.iactivityId,
            activity_name: actResult?.basicInfo?.title,
        })
        await this.getMocroPageInfo(routeParams);
        openPicStateOnEvent((data) => {
            console.log("this.state.openPic===================>", data, routeParams)
            this.setState({openPic: +data.code === +routeParams.t, openPicData: data})
        });

        openSiteStateOnEvent((data) => {
            console.log("this.state.openSiteQw===================>", data, routeParams)
            this.setState({openSiteQw: +data.code === +routeParams.t, openSiteQwData: data})
        })

        getCouponStateOnEvent((data) => {
            console.log("this.state.openGetCoupon===================>", data, routeParams)
            this.setState({openGetCoupon: +data.code === +routeParams.t})
        })

        openSuperStateOnEvent(() => {
            this.setState({openSuperState: true})
        })
    }


    async componentDidShow() {
        // 向子组件传递show事件
        eventBus.$emit("onShow", this.state);
        !isEmpty(this.state.pageInfo) && pageView(this.state.pageInfo)
        const curInstance = getCurrentInstance();
        const {path, params: routeParams} = curInstance.router;
        const {second, taskId, acId} = routeParams;

        if (this.state.taskPar?.second > 0 && !second) {
            this.setState({
                taskPar: null
            })
        }
    }

    /**
     * 发送期刊分享页面(Weixin事件)
     */
    onShareAppMessage(res) {
        console.log("--------11111----")
        const {path, title, imageUrl} = getShareConfig({...this});
        return {
            title,
            path,
            imageUrl
        }
    }

    //根据pcId获取当前网点获取开启分销的店铺
    getDistributeSiteList(pcId) {
        ApiRequest.getEvGuiderOpenSiteList({postParams: {pcId}}).then(result => {
            console.log("getDistributeSiteList", result.list)
            !!result.list[0]?.siteCode && cacheManager.setEvSiteCode(result.list[0]?.siteCode)
        })
    }

    /*
      *  获取菜单项
     */
    async computedTabMenu() {
        const {pageId} = this.state;
        // TODO: 测试数据
        // const tabList = JSON.parse(JSON.stringify(require("../../pages-json/tab-bar.json")));

        //菜单列表
        const {list, isShowTab} = await computedTabMenu(pageId, null);
        this.setState({tabList: list, isShowTab});
        log.info({
            "ky-pages/index/index -> computedTabMenu (底部菜单、当前页是否是菜单页):": {
                list,
                isShowTab
            }
        });
        log.setFilterMsg("tabMenu");
    }


    /**
     * 获取页面详情
     *
     */
    async getMocroPageInfo(routeParams) {
        // 路由信息
        // const curInstance = getCurrentInstance();
        // const {path, params: routeParams} = curInstance.router;
        const {
            pageId,
            scene,
            sitId,
            iactivityId,
            isLogin,
            second,
            taskId,
            acId,
            pcIds,
            matId,
            fromPageId: fromPid,
            from_scene: fromSce,
            refPageName,
        } = routeParams;

        if (second) {
            this.setState({
                taskPar: {
                    second, taskId, iactivityId: acId
                }
            })
        }
        const postParams = {
            pageId: pageId || 0,
            scene: scene || "formal",
            iactivityId,
            sitId
        };
        const pageInfo = await ApiRequest.getPcenterPageInfo({postParams});
        this.setState({pageInfo}, () => {

        })
        const evSiteCode = cacheManager.getEvSiteCode()
        pageInfo.evShop && !evSiteCode && this.getDistributeSiteList(pageInfo?.pcId) //是会员商城并且缓存中无siteCode需要重新调用
        log.info({"page-1->getMocroPageInfo->ApiRequest.getPcenterPageInfo": {routeParams}})
        const {
            components = [],
            pageTitle,
            config,
            pageTags,
            memberRankConfig,
        } = pageInfo || {};
        const siteInfo = !!evSiteCode ? await API_CONFIG.getEvSiteInfo({postParams: {evSiteCode}}) : {}
        if (!!iactivityId) {
            // @ts-ignore
            // wx.reportEvent("loading_activity", {
            //     "activity_id":iactivityId
            // })
        } else {
            // @ts-ignore
            wx.reportEvent("loading_page", {
                "page_id": pageInfo.pageId + ""
            })
        }

        // 会员协议等微页面不做逻辑处理
        if (isLogin != "true") {
            // 会员拦截
            const joinFlag = (components.findIndex(v => !!v?.config?.joinFlag)) > -1;
            //入会后是否返回当前页
            const joinReturnPage = components.find(v => !!v?.config?.joinReturn);

            // debugger
            cacheManager.setCacheReturnPage({
                ...routeParams,
                path: AppUrls.index1,
                pageId: joinReturnPage?.pageId,
                pageTags,
                psId: pageInfo?.psId || ""
            })
            if (!joinReturnPage) {
                Taro.removeStorageSync(CacheItemType.CacheReturnPage)
            }
            const userInfo = cacheManager.getCustomerUserInfo();
            if (joinFlag && !userInfo?.cstType) {
                log.info({
                    "首页非会员页面拦截入会-：": `${AppUrls.login}?${parseParams({
                        ...routeParams,
                        psId: pageInfo?.psId || ""
                    })}`
                })
                await WXSDK.linkRedirectTo(
                    `${AppUrls.login}?${parseParams({
                        ...routeParams,
                        psId: pageInfo?.psId,
                        refPageName: pageTitle || ""
                    })}`
                );
                return;
            }
        }

        const codes = components.map(item => {
            return item.code;
        });


        // 领奖活动
        if (codes.includes("c_online_award_v2") && iactivityId) {
            pageView({pageTitle: '购物领奖V2'})
            Promise.all([
                API_CONFIG.onlineAwardDetail({postParams: {activityId: iactivityId}}),
                API_CONFIG.onlineFindSaleList({postParams: {activityId: iactivityId}}),
                ApiRequest.couponGetTemplateIds({
                    postParams: {
                        typeCodes: ["onlineAward"]
                    }
                })
            ]).then(([actRes, saleRes, tplIdsRes]) => {


                this.setState({
                    pagesDetails: Object.assign({}, this.state.pagesDetails, {
                        c_online_award_v2: {
                            actRes,
                            saleRes,
                            templateIds: tplIdsRes?.templateIds || []
                        }
                    })
                })
            });
        }
        if (!codes.includes("c_online_award_v2")) {
            pageView(pageInfo)
        }

        //商品集锦
        if (pageTags[0] === "t_ev_shop_product_collection") {
            // 目前商品集锦里面只会有一个组件 所以可以先写死
            const item = components.find(item => item.code === "c_ev_shop_product_window");
            console.log("item.config", pcIds)
            item.config["productList"] = pcIds.replaceAll("%2C", ",").split(",").map(v => {
                return {id: v}
            })
            components[0] = item
        }

        // if (codes.includes("c_task_activity") && iactivityId) {
        //     ApiRequest.taskFindCst({postParams: {activityId: iactivityId}}).then(actRes=>{
        //         this.setState({
        //             pagesDetails: Object.assign({}, this.state.pagesDetails, {
        //                 c_task_activity: {
        //                     actRes
        //                 }
        //             })
        //         })
        //     })
        // }

        // 进入会员码 亮度调最大
        // if (codes.includes('c_qrcode')) {
        //   //@ts-ignore
        //   wx.setScreenBrightness({value: 1});
        // }

        let from_scene = fromSce || "CAD";
        let fromPageId = fromPid || null;
        const isMicroPage = components.find(item => {
            return item.code === "c_micro_page"
        });
        const isPShop = components.find(item => {
            return ["c_pshop_index_header", "c_pshop_kayou_index_header"].includes(item.code)
        });

        if (isMicroPage) {
            from_scene = "CMI";
            fromPageId = pageId;
        }
        if (isPShop) {
            from_scene = "SAD";
            fromPageId = pageId;
        }
        const {showOpenScreenAdv, showGetCouponAdv, showAgreement, couponList} = pageInfo;
        this.setState(
            {
                pageInfo,
                siteInfo,
                fromPageId,
                from_scene,
                components,
                pageId: pageInfo?.pageId,
                isFullScreen: includesArr(codes, FULL_SCREEN_PAGES) || (config?.headConfig?.type == 2),
                isShowTitle: !includesArr(HIDE_TITLE_PAGES, pageTags || []) && (config?.headConfig?.type !== 2),
                showOpenScreenAdv,
                showGetCouponAdv,
                showAgreement,
                couponList,
                memberRankConfig,
                second: ~~second,
                codes,
                refPageName: decodeURIComponent(refPageName)
            },
            async () => {
                console.log({pageInfo, siteInfo, HIDE_TITLE_PAGES, pageTags, memberRankConfig});
                await this.computedTabMenu();
            }
        );
    }

    // 关闭开屏广告
    closeOpenAdv() {
        console.log("s")
        this.setState({showOpenScreenAdv: false});
    }

    closeOpenCouponAdv() {
        this.setState({showGetCouponAdv: false});
    }

    // 入会成功回调
    async enterCallBack() {
        const pCenterInfo = cacheManager.getPcenterInfo() || {};
        const customerInfo = await getCustomerInfo();
        cacheManager.setCustomerUserInfo(
            Object.assign({}, this.state.customerInfo, customerInfo)
        );
        log.info({
            "pages/index -> enterCallBack (首页入会成功回调 个人中心详情、会员信息):": {
                pCenterInfo,
                customerInfo
            }
        });
        log.setFilterMsg("customerInfo");

        // this.props.setCustomerInfo(Object.assign({}, this.state.customerInfo, customerInfo))

        const curInstance = getCurrentInstance();
        const curentParams = curInstance.router?.params;
        const queryStr = parseParams(curentParams);
        await WXSDK.linkRedirectTo(`${AppUrls.kyIndex}?${queryStr}`);
    }

    handleAgreePrivacyAuthorization() {
        // 用户点击同意按钮后
        this.state.resolvePrivacyAuthorization({buttonId: 'agree-btn', event: 'agree'});
        this.setState({showPrivacy: false})
    }

    handleDisagree() {
        this.state.resolvePrivacyAuthorization({event: 'disagree'});
        this.setState({showPrivacy: false})
    }


    componentWillUnmount() {
        pageLeave(this.state.isShowTab)
        // SensorsApp.ClearAppRegister(['activity_id', 'activity_name',"share_person_id"])
    }

    componentDidHide() {
        pageLeave(this.state.isShowTab)
    }


    render() {
        //右上角胶囊
        const ClientRect = Taro.getMenuButtonBoundingClientRect();
        //设备信息
        const systemInfo = Taro.getSystemInfoSync();
        const isIphoneX = cacheManager.getIsIphoneX();
        const scrollViewHeight = systemInfo.windowHeight - ClientRect.bottom - 22 + "px";

        const pcenterInfo = cacheManager.getPcenterInfo();
        // const styleConfig = JSON.parse(pcenterInfo?.configMap?.styleConfig || "{}");

        const {
            tabList,
            isShowTab,
            isShowTitle,
            pageInfo,
            siteInfo,
            isFullScreen,
            // pageId,
            // showOpenScreenAdv,
            fromPageId,
            from_scene,
            memberRankConfig,
            showGetCouponAdv,
            couponList,
            networkType,
            showPrivacy,
            pagesDetails,
            codes,
            refPageName
        } = this.state;
        const {components = [], pageTitle, pageTags, couponListLinkValue, config, agreement, pageId} = pageInfo || {};

        return (
            <View className={`${config?.filter ? 'page-filter' : ""}`}>
                {
                    /*@ts-ignore 返回组件 */
                    <ComBackKy
                        className="r-ml-24"
                        isShowTab={!isShowTab}
                        isFull={isFullScreen}
                        isShowTitle={isShowTitle}
                        title={pageTitle}
                        {...config}
                    />
                }

                {
                    !!showPrivacy && <PrivacyPopup
                        handleAgreePrivacyAuthorization={this.handleAgreePrivacyAuthorization.bind(this)}
                        handleDisagree={this.handleDisagree.bind(this)}
                        eventInfo={this.state.eventInfo}
                        close={() => this.setState({showPrivacy: false})}
                    />
                }

                {/*开屏广告*/}
                {!!this.state.showOpenScreenAdv && (
                    <OpenAdv pageInfo={pageInfo} from_scene={from_scene} fromPageId={fromPageId}
                             closeAdv={this.closeOpenAdv.bind(this)}/>
                )}


                {/*// 补签协议？*/}
                {
                    !!this.state.showAgreement &&
                    <AgreePage agreement={agreement} close={() => this.setState({showAgreement: false})}/>
                }

                {
                    (!!showGetCouponAdv && couponList?.length > 0) && (
                        // @ts-ignore
                        <ComCouponAdv couponList={couponList} pageInfo={pageInfo} couponListLinkValue={couponListLinkValue}
                                      close={this.closeOpenCouponAdv.bind(this)}/>
                    )
                }

                {/*@ts-ignores组件*/}
                <Components ref={"Components"}
                            {...{
                                components: components?.sort((a, b) => a.sort - b.sort) || [],
                                codes,
                                from_scene,
                                fromPageId,
                                isShowTab,
                                isIphoneX,
                                isFullScreen,
                                ClientRect,
                                pageInfo,
                                siteInfo,
                                memberRankConfig,
                                networkType,
                                tabList,
                                pagesDetails,
                                refPageName,
                                enterCallBack: this.enterCallBack.bind(this)
                            }}
                />


                {
                    this.state.taskPar?.second > 0 &&
                    <SecondDom setsecond={(second) => this.setState({taskPar: {...this.state.taskPar, second}})}
                               ClientRect={ClientRect}
                               {...this.state.taskPar}/>
                }

                {
                    // 领奖活动
                    codes.includes("c_online_award_v2") &&
                    <Online_award_float_btn {...{...pageInfo, ...pagesDetails, pageId}} />
                }


                {/*// 打开图片*/}
                <MPop isShow={this.state.openPic} className="absolute-center bg-white  border-radius-24 width-600"
                      close={() => {
                          this.setState({openPic: false});
                      }
                      }>

                    <View className="flex flex-center full-width border-radius-12 relative-position overflow-auto"
                          style={{maxHeight: "80vh"}}>
                        <Image src={this.state.openPicData.linkValue} showMenuByLongpress mode="widthFix"/>
                    </View>

                    <View
                        className={`absolute-bottom-center `} style={{height: "92rpx", bottom: "-160rpx"}}
                        onClick={() => this.setState({openPic: false})}>
                        <Image style={{width: "68rpx", height: "68rpx"}}
                               src="https://media-opens.oss-cn-shanghai.aliyuncs.com/2276/default/image/af8f183b5b71473966dfd07603e32cd1.png"/>
                    </View>
                </MPop>

                {/*企业微信*/}
                <MPop isShow={this.state.openSiteQw} className="absolute-center bg-white  border-radius-24 width-600"
                      close={() => this.setState({openSiteQw: false})}>

                    <View
                        className="flex flex-center full-width bg-white border-radius-12 relative-position overflow-hidden">
                        <Image src={this.state.openSiteQwData.linkValue} showMenuByLongpress mode="widthFix"/>

                        <Blank/>
                        <View className="text-grey3 text-left font-size-24 full-width r-px-24">咨询服务</View>
                        <Blank height={12}/>
                        <View className="full-width text-left font-size-28 r-px-24 line-height-36">
                            {/*@ts-ignore*/}
                            <cell plugid={this.state.openSiteQwData.qwUserAddr} styleType={1} buttonStyle="light"/>
                        </View>

                        <Blank/>
                    </View>

                    <View
                        className={`absolute-bottom-center `} style={{height: "92rpx", bottom: "-160rpx"}}
                        onClick={() => this.setState({openSiteQw: false})}>
                        <Image style={{width: "68rpx", height: "68rpx"}}
                               src="https://media-opens.oss-cn-shanghai.aliyuncs.com/2276/default/image/af8f183b5b71473966dfd07603e32cd1.png"/>
                    </View>
                </MPop>

                {/*领券*/}
                <MPop isShow={this.state.openGetCoupon}
                      className="absolute-center bg-white  border-radius-24 text-center"
                      style={{width: "590rpx", height: "476rpx"}}
                      close={() => this.setState({openGetCoupon: false})}>

                    <Image className="width-160 r-mt-48" mode="widthFix"
                           src={
                               "https://ssl.picture.qingger.com/d3226ef2-5807-4ccc-bb7d-5566808f9e0b-yidaka.png"
                           }/>

                    {
                        <View className="text-grey font-size-32 text-center ">
                            <View className="">领取成功</View>
                            <View className="flex flex-center text-grey2 font-size-24 r-mt-12">
                                <View className="bg-submit round-borders2 r-mr-10"
                                      style={{width: "12rpx", height: "12rpx"}}/>
                                <View>可进入小程序: <Text className="text-yellow-14">我的</Text> - <Text
                                    className="text-yellow-14">我的卡券</Text> 中查看卡券</View>
                            </View>
                        </View>
                    }

                    <View
                        className="submit-btn round-borders2 flex flex-center text-grey font-size-30 text-bold r-mx-auto r-mt-36"
                        style={{width: "288rpx", height: "80rpx"}}
                        onClick={() => this.setState({openGetCoupon: false})}>确定</View>
                </MPop>

                {/*术铂小程序*/}
                <MPop isShow={this.state.openSuperState}
                      className="absolute-bottom-center bg-white  border-radius-24 width-700 r-pa-32"
                      style={{bottom: isIphoneX ? "84rpx" : "32rpx"}}
                      close={() => {
                          this.setState({openSuperState: false});
                      }
                      }>

                    <View className="flex flex-center full-width">
                        即将跳转至术铂小程序！
                    </View>

                    <View className="t-button flex-1 r-mx-12 bg-yellow text-black relative-position r-mt-32 text-center"
                          onClick={() => {
                              WXSDK.navigateToMiniProgram("wxf85977e258306a7a", "pages/home/home?channelCode=offline");
                              this.setState({openSuperState: false})
                          }}>
                        立即跳转
                    </View>
                </MPop>

            </View>
        );
    }
}

function SecondDom(props: any) {
    const [second, setSecond] = useState(props.second);
    let timer = null;
    useEffect(() => {
        timer = setTimeout(() => {
            if (second === 0) {
                props.setsecond(second);
                taskParticipate();
                WXSDK.errorMessage("恭喜你！浏览成功")
            } else if (second > 0) {
                setSecond(second - 1);
            } else {

            }
        }, 1000)
        return () => {
            console.log("----------SecondDom --return -------", second);
            clearTimeout(timer)
        }
    }, [props.second, second])

    // }, [])

    function taskParticipate() {
        return new Promise(resolve => {
            const {cstId} = cacheManager.getCustomerUserInfo();
            ApiRequest.taskParticipate({
                postParams: {
                    activityId: props.iactivityId,
                    cstId,
                    taskId: props.taskId
                }
            }).then(res => {
                resolve(res)
            })
        })

    }

    return <View
        className="fixed-top-right z-max round-borders font-size-48 text-bold flex flex-center r-pt-12"
        style={{
            width: "102rpx",
            height: "112rpx",
            background: "url(https://ssl.picture.qingger.com/pcenter_init/rwzxhd/count_down_bg.png) no-repeat center 0 / 102rpx 112rpx",
            right: "24rpx",
            top: props.ClientRect.bottom + 12 + "px",
            color: "#E74559"
        }}>{second > 9 ? second : "0" + second}</View>
}

function Online_award_float_btn(props: any) {
    const [descDialog, setDescDialog] = useState(false);
    const actInfo = (props?.c_online_award_v2 || {})?.actRes;

    if (+props?.c_online_award_v2?.actRes?.basicInfo?.logicStatus === 4) {
        return null
    }
    return <Block>
        <View className="absolute-top-right r-mt-100 width-120 z-fixed-drawer" style={{top: "160rpx", right: "24rpx"}}>
            <View className="relative-position">
                <Image mode="widthFix" src="https://ssl.picture.qingger.com/A4D554ECAC204B83A1AFF5218EBF99BF.png"/>
                <Button className="text col-grow column items-center  no-line-height absolute-full opacity-0"
                        open-type="share" lang="zh_CN"/>
            </View>
            <Image mode="widthFix" src="https://ssl.picture.qingger.com/jiangpin.png"
                   onClick={() => setDescDialog(true)}/>

        </View>

        {
            descDialog && <RuleDesc {...actInfo} pageId={props.pageId} setDescDialog={() => setDescDialog(false)}/>
        }
    </Block>
}

function RuleDesc(props: any) {
    console.log("---------RuleDesc--------", {props})
    return (
        <View className="fixed-full z-fixed-drawer" style={{background: "rgba(0,0,0,0.8)"}}>
            <View className="absolute-center"
                  style={{
                      width: "750rpx",
                      height: "1100rpx",
                      background: `url(https://ssl.picture.qingger.com/4dc00c68-1d2a-45d1-af70-51cd73f5ee56.png) no-repeat center / 100%`
                  }}>

                <View className="overflow-auto r-pa-24 r-mx-80"
                      style={{height: "850rpx", marginTop: "190rpx"}}>
                    {
                        props.config?.ruleDescConfig?.type === 1 ?
                            <View className="line-height-32 font-size-24 text-wrapper"
                                  style={{color: "rgba(0,0,0,.6)"}}
                                  dangerouslySetInnerHTML={{__html: props.config.ruleDescConfig?.textValue}}/> :
                            <CDialog {...(props.config.ruleDescConfig || {})}  />
                    }

                </View>

                <View className="flex flex-center r-mt-64" onClick={() => props.setDescDialog(false)}>
                    <Image className="width-100" mode="widthFix"
                           src="https://ssl.picture.qingger.com/f4d7f9eb-bc8e-4e0c-ba7d-159f1516c374.png"/>
                </View>
            </View>

        </View>
    )
}
