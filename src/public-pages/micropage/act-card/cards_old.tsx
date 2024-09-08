import React from "react";
import Nerv from 'nervjs'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { Button, Canvas, Image, Input, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import ApiRequest from '@/service'
import { Blank, ComBack, ComConcat, ComSearch, MBottom, MGoodsItem, MPop, NoData } from '@/config/comptsConfig'
import './card.styl'
import IconFont from "@/components/iconfont";
import WXSDK from "@/service/WXSDK";
import { limitClick, noPassByMobile, parseParams } from "@/utils";
import CacheManager from "@/service/cacheManager";
import { ADV_SCENE } from "@/service/status";
import ShareCard from "./share-card";
import { checkMemberAndSetReturnPage, getDefaultIndex, getParamsAsRoute } from "@/service/public";
import log from "@/utils/log";
import { AppUrls } from "@/config/pathConfig";
import cacheManager from "@/service/cacheManager";

export default class Cards_old extends React.Component<any> {
    [x: string]: any

    public state: any = {
        activityId: 0,
        actConfig: null,
        giftList: [], //原始奖品列表
        // 奖品列表
        prizesList: [],
        // 分享有礼
        shareRules: null,
        // 分享规则
        raffleRules: null,
        // 基本的图片信息
        baseInfo: {
            style: {
                background: {
                    isShowPic: true, //是否显示背景图
                    picUrl: "",
                    //背景图
                    color: "#ffff", //背景颜色
                },
                title: {
                    isShowPic: true, //是否显示主题图片
                    picUrl: "",
                    //主题图片
                },
                turnplate: {
                    platePicUrl: "",
                    //转盘图片
                    buttonPicUrl: "",
                    //抽奖按钮图片
                    lineColor: "#ffff", //分隔线颜色
                    awardWordColor: "",
                },
                dialog: {
                    picUrl: "",
                },
            },
            isShowAwardName: true, //是否显示奖品名称
            winCustomers: {
                type: 2, //枚举值：1：展示真实中奖名单  2：展示虚拟中奖名单  3：不展示
                count: 20, //最多展示中奖名单人数
            },
            rules: "活动规则内容说明",
        },
        baseConfig: null,
        remainingNumberText: "",
        submitBtnState: false, // 洗牌按钮状态


        cards: [],
        sort: [], // 奖品排序
        prizeDlgFlag: false, // 中奖弹框 开关
        rulesDlgFlag: false, // 规则弹框 开关
        playBtnState: 0, // 0：初始化 1、 洗牌准备  2： 洗牌中  3：重新洗牌
        isCanPlay: false, //

        prizeInfo: {
            icon: "https://media-opens.oss-cn-shanghai.aliyuncs.com/2076/default/image/1f3d1c76e7db9294c1101df28d716457.png",
            id: 0
        }, //奖品

        sharePop: false
    }

    // 生命周期钩子
    async componentDidMount() {
        const curInstance = getCurrentInstance();
        const curentParams = curInstance.router?.params;
        const { iactivityId } = curentParams || {};
        this.setState({ activityId: iactivityId }, async () => {
            await this.getActConfig();
            await this.computedWarringText();
            await this.initGame();
            this.setState({ isCanPlay: true })
        })

    }

    // 剩余抽奖次数描述文本
    async computedWarringText() {
        const curInstance = getCurrentInstance();
        const curentParams = curInstance.router?.params;
        const { from_scene } = curentParams;
        const userInfo = CacheManager.getCustomerUserInfo() || {};

        /**
         * 活动门槛
         */
        if (userInfo?.cstType > 0) {
            // 活动门槛
            const actFilterResult = await ApiRequest.customerFilterAsAct({
                postParams: {
                    activityId: this.state.activityId,
                    cstSource: from_scene
                }
            });
            const { failMsg, result } = actFilterResult;
            if (!result) {
                this.setState({ remainingNumberText: failMsg, submitBtnState: false })
                return;
            }
        }

        // 剩余抽奖次数
        const findFreeTimesRes = await ApiRequest.findFreeTimes({ postParams: { activityId: this.state.activityId } });
        // this.freeTimesRes = findFreeTimesRes;
        const [freeTimes = 0, totalTimes, shareTimes] = [
            findFreeTimesRes.times,
            findFreeTimesRes.total,
            findFreeTimesRes.shareGet,
        ];
        this.last = freeTimes;
        const { pointsCost } = this.state.raffleRules || {};
        const { percentPoints = 0, freeCounts, type } = pointsCost || {};

        let stateResult = (() => {
            const customerInfo = CacheManager.getCustomerUserInfo();
            if (!customerInfo?.cstType) {
                return ["", true]
            }

            //枚举值：0：暂存、1：正常、2：下架、3：过期 、4：作废
            const { status, isStart, isDeleted } = this.state.basicInfo;
            const errorData = ["活动未开始", "", "活动已中止", "活动已过期", "活动已作废"];
            if (!isStart) {
                return ["活动未开始", false];
            }
            if (!!isDeleted) {
                return ["活动已删除", false];
            }
            if (errorData[status]) {
                return [errorData[status], false];
            }

            if (!totalTimes) {
                // if (!!this.state.shareRules?.isEnableShare) {
                //     return ["您的翻牌机会已用完，分享给好友可以获得更多翻牌机会", false];
                // }
                // return ["您的翻牌机会已用完", false];

                return ["您有 0 次翻牌机会", false];
            }

            if (!freeTimes) {
                return [`翻牌每次消耗 ${percentPoints} 积分`, true];
            }

            return [`您有 ${freeTimes} 次翻牌机会`, true]
        })();

        this.setState({ remainingNumberText: stateResult[0], submitBtnState: stateResult[1] })
    }

    //获取活动配置
    async getActConfig() {
        return new Promise(async resolve => {
            const [result, luckyDrawInfoRes] = await Promise.all([
                ApiRequest.luckyDrawConfig({
                    postParams: {
                        iactivityId: this.state.activityId,
                        scene: "formal"
                    }
                }),
                ApiRequest.luckyDrawInfo({
                    postParams: {
                        activityId: this.state.activityId,
                    }
                })
            ])

            let { awardItems = [] } = luckyDrawInfoRes;
            const { basicInfo = {}, config = {} } = luckyDrawInfoRes;
            const giftList = awardItems;
            const { isStart, status } = basicInfo || {};

            const { raffleRules, shareRules, threshold, itemsMap } = config;
            const { thanksAwards, awardIdxs, pointsCost } = raffleRules;

            // 1. 过滤不是抽奖的礼品
            awardItems = awardItems.filter((i) => (awardIdxs || []).includes(i.awardIdx));

            // 1.5 谢谢参与也可以有奖品，需加上奖品
            if (thanksAwards && thanksAwards.awardIdxs && thanksAwards.awardIdxs.length) {
                thanksAwards["awardItems"] = giftList.filter((i) => thanksAwards.awardIdxs.includes(i.awardIdx));
            }

            // 前端加上唯一的ID
            thanksAwards["fontType"] = "sun";
            thanksAwards["awardName"] = thanksAwards.title;

            // 2. 加上谢谢参与
            awardItems.push(thanksAwards);
            const actConfig = result?.components?.find(v => v.code === "c_card_raffle")?.config;

            let winningList = [];
            // 获取中奖列表
            if (actConfig.winCustomers.type != 3) {
                const warranting = {
                    type: actConfig.winCustomers.type,
                    count: actConfig.winCustomers.count,
                    activityId: this.state.activityId,
                };
                const winningListResult = await ApiRequest.winningList({ postParams: warranting });

                winningList = (winningListResult.list || []).map((i) => {
                    i.phone = noPassByMobile(i.phone);
                    return i;
                });
            }

            // 剩余抽奖次数
            // this.remainingNumberText = result ? await this.coputedWarringText() : failMsg;

            this.setState({
                actConfig,
                giftList,
                basicInfo,
                baseConfig: config,
                shareRules,
                raffleRules,
                prizesList: awardItems,
                winningList
            }, () => {
                console.log({ ...this.state })
                resolve(actConfig)
            })
        })
    }

    getCardPosition(par) {
        let offsetX = 0, offsetY = 0;
        const { w, h, m, col, v, i, len } = par;
        let rows = Math.floor(len / 2);
        let row_1 = rows;
        let row_2 = len - rows;
        let cols = 2;
        let width = w * 4;
        let height = h * 2;

        let idx = i > row_1 - 1 ? i - row_1 : i;
        offsetX = (width - (i > row_1 - 1 ? row_2 : row_1) * w) / 2 + w * idx;
        offsetY = i > row_1 - 1 ? h : 0;
        console.log({ offsetX, offsetY, i, idx })
        return {
            offsetX,
            offsetY
        }
    }

    // 初始化卡牌
    initGame(s = 0) {
        return new Promise(resolve => {
            const w = 160, h = 240, m = 0, col = 4;
            const list = JSON.parse(JSON.stringify(this.state.prizesList || []));
            const sorts = [];
            const cards = list.map((v, i) => {
                const { offsetX, offsetY } = this.getCardPosition({ w, h, m, col, v, i, len: list.length });
                sorts.push({ offsetX, offsetY })
                return {
                    state: s, //0 显示正面 1，x显示反面
                    isShowPrize: false, // 是否显示奖品
                    offsetX,
                    offsetY,
                    // sort: `${i}#`
                    ...v
                }
            })
            this.setState({ cards, sorts }, () => {
                this.setState({ playBtnState: 0 })
                resolve(this.state)
            })
        })
    }

    // 抽卡开始
    async playStart(state, index) {

        console.log({ state, index, playBtnState: this.state.playBtnState });
        if (this.state.playBtnState == 0) {
            WXSDK.errorMessage("请先洗牌！");
            return;
        }

        if (!this.state.isCanPlay) {
            return;
        }

        if ([1, 2].includes(~~this.state.playBtnState)) {
            // WXSDK.errorMessage("请先洗牌！");
            return;
        }
        await limitClick(3000);

        this.rotateStart(state, index);
    }

    //参与活动  获取中奖信息
    participateAct(index) {
        return new Promise(async resolve => {
            const customer = CacheManager.getCustomerUserInfo();

            const {
                from_scene,
                referrer,
                matId,
                refGuider,
                sitId,
                fromPageId,
                inviterId
            } = getCurrentInstance().router?.params || {};
            const advScene = { ...(ADV_SCENE[from_scene] || ADV_SCENE['ACE']) };

            if (from_scene) {
                // const advScene = JSON.parse(JSON.stringify(ADV_SCENE[from_scene]));
                if (matId) {
                    advScene.mat_id = matId;
                }
                if (refGuider) {
                    advScene.guider_id = refGuider;
                }
                if (sitId) {
                    advScene.site_code = sitId;
                }
                if (fromPageId) {
                    advScene.page_id = fromPageId;
                }
            }

            // 参与活动
            const postParams = {
                activityId: this.state.activityId, //活动id
                cstId: customer?.cstId,
                cstSource: from_scene,
                advScene
            };
            sitId && (postParams["sitId"] = sitId);
            inviterId && (postParams["inviterId"] = inviterId);
            ApiRequest.participate({ postParams }).then((result) => {
                console.log("=======================")
                let sort = null;
                let choseItem = null;
                const { awardIdx, givenType, config, givenRecId } = result.awards[0];
                if (givenType !== 1 && givenType !== 2) {
                    choseItem = this.state.prizesList.find((i) => i.fontType === "sun");
                } else {
                    // 根据Id 查询位置
                    choseItem =
                        this.state.prizesList.find((i) => {
                            // 查找阳光普照里的awardIdx奖品
                            return Array.isArray(i.awardIdxs) ? i.awardIdxs.includes(awardIdx) : i.awardIdx === awardIdx;
                        }) || {};
                }

                this.computedWarringText().then(r => r);

                setTimeout(() => {
                    this.setState({ prizeInfo: { ...choseItem, givenRecId } }, () => {
                        this.rotateEnd(index);
                    });
                }, 1000)

            }).catch(err => {
                console.log("-------111111-------", err);
                this.stopRotate(index);
            });
        })
    }

    // 抽奖动画 开始
    rotateStart(state, index) {
        console.log({ state, index });
        const cards = this.state.cards.map((v, i) => {
            if (index === i) {
                v.state = state
            }
            return v
        })
        console.log("========>cards", cards, index);
        this.setState({ cards }, async () => {
            this.participateAct(index)
        })
    }

    stopRotate(index) {
        const newCards = this.state.cards.map((v, i) => {
            v.state = 0;
            return v
        })
        this.setState({ cards: newCards })
    }

    //抽奖动画停止
    rotateEnd(index) {

        // 设置当前奖项 ， 并替换当前卡片背面奖品与 中奖项保持一致
        // const newCards = JSON.parse(JSON.stringify(this.state.cards));
        // const {offsetX,offsetY} = newCards[index];
        // newCards.splice(index,1, {...choseItem,offsetX,offsetY})

        const thisPrizeInfo = this.state.cards[index];

        const newCards = this.state.cards.map((v, i) => {
            if (index === i) {
                return {
                    ...this.state.prizeInfo,
                    state: 2,
                    isShowPrize: true,
                    offsetX: v.offsetX,
                    offsetY: v.offsetY,
                    checked: true
                }
            }
            if (this.state.prizeInfo?.awardName === v.awardName && index != i) {
                return {
                    ...thisPrizeInfo,
                    state: v.state,
                    isShowPrize: v.isShowPrize,
                    offsetX: v.offsetX,
                    offsetY: v.offsetY
                }
            }
            return v
        })
        this.setState({ prizeDlgFlag: true, cards: newCards })
    }

    //洗牌方法 随机排序
    shuffleFn(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;
        // 循环打乱剩下的元素
        while (0 !== currentIndex) {
            // 抽取剩下的元素
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // 和当前元素交换
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    sleep(t) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(1)
            }, t || 100)
        })
    }

    //洗牌 / 重新洗牌
    async ShuffleStart() {
        await limitClick(500);

        const { pre } = await getParamsAsRoute();
        console.log({pre})
        if (pre) {
            return;
        }

        const customer = CacheManager.getCustomerUserInfo();
        if (!customer?.cstType) {
            const routeParams = await getParamsAsRoute();
            await checkMemberAndSetReturnPage({
                ...routeParams,
                path: getDefaultIndex()
            });
            return;
        }

        //枚举值：0：暂存、1：正常、2：下架、3：过期 、4：作废
        const { status } = this.state.basicInfo;
        const errorData = ["活动未开始", "", "活动已中止", "活动已过期", "活动已作废"];

        if (!!errorData[status]) {
            WXSDK.errorMessage(errorData[status]);
            return;
        }

        if (!this.state.isCanPlay) {
            return
        }

        this.setState({ isCanPlay: false });

        this.setState({ playBtnState: 1, isCanPlay: false }, async () => {
            // 把所有牌翻转, 然后再洗牌
            await this.showBackAll();
            await this.sleep(500);
            await this.showFrontAll();
            await this.sleep(500);
            await this.initGame(2);
            this.ShuffleCallback();
        })
    }

    // 展示所有奖品
    showAllPrize() {

    }

    //翻转所有卡牌
    showBackAll() {
        return new Promise(resolve => {
            const cards = this.state.cards.map((v, i) => {
                return {
                    ...v,
                    state: 2,
                    isShowPrize: true,
                }
            })
            this.setState({ cards }, () => {
                resolve(cards)
            })
        })
    }

    //翻正所有卡牌
    showFrontAll() {
        return new Promise(resolve => {
            const cards = this.state.cards.map((v, i) => {
                return {
                    ...v,
                    state: 0,
                    // isShowPrize: false
                }
            })
            this.setState({ cards }, () => {
                resolve(cards)
            })
        })
    }

    // 洗牌
    ShuffleCallback() {
        const newSorts = this.shuffleFn(this.state.sorts);
        const cards = this.state.cards.map((v, i) => {
            v.state = 0;
            return {
                ...v,
                state: 0,
                isShowPrize: false,
                ...newSorts[i]
            }
        })

        this.setState({ cards, playBtnState: 2 }, () => {
            setTimeout(() => {
                this.setState({ playBtnState: 3, isCanPlay: true })
            }, 1000
            )
        })
    }

    closePrizeDlg() {
        this.setState({
            prizeDlgFlag: false,
            isCanPlay: false
        }, async () => {
            await this.showBackAll();
            console.log({ cards: this.state.cards })
            await this.sleep(1000);
            await this.initGame(0);
            this.setState({ playBtnState: 0 }, async () => {
                this.setState({ isCanPlay: true })
            })
        })
    }

    render() {
        const {
            prizeDlgFlag,
            rulesDlgFlag,
            playBtnState,
            prizeInfo,
            actConfig,
            winningList,
            sharePop,
            isCanPlay
        } = this.state;
        const { style, winCustomers } = actConfig || {};
        const { background, card, introduce } = style || {};
        const userInfo = CacheManager.getCustomerUserInfo() || {};

        //背面背景图
        // const cardImgBack = card?.backOpenUrl || "https://media-opens.oss-cn-shanghai.aliyuncs.com/2076/default/image/eac878f9da7b2adcc0787bb4d8621c6a.png"

        // 初始化背景图
        const cardImgInit = card?.backUrl

        // 抽卡翻牌背景图
        const cardImgPlay = card?.backOpenUrl

        const cardImg = playBtnState == 3 ? cardImgPlay : cardImgInit;
        // [cardImgInit, cardImgInit, cardImgInit, cardImgPlay][playBtnState];

        return (
            <View className="fit overflow-auto relative-position bg-grey2">
                <View className="window-width relative-position">
                    <Image
                        src={background?.picUrl}
                        mode="widthFix" />
                    <View className="absolute-top-left  fit">
                        <View className="flex justify-between items-center r-py-24">
                            <View className={`r-ml-24 ${this.state.shareRules?.isEnableShare ? "" : "invisible"}`}
                                style={{ color: "#FF8519" }}
                                onClick={() => this.setState({ sharePop: true })}>
                                <View className="round-borders2 overflow-hidden flex flex-center width-50 height-50"
                                    style={{ background: "rgba(255, 255, 255, 0.6)" }}><IconFont
                                        name={"pcicon-fenxiang1"} size={40} color={"#FF8519"} /></View>
                                <View className="font-size-22 r-ml-6" style={{ color: "#FF8519" }}>分享</View>
                            </View>
                            <View className="row b-r-l-100 r-py-12  r-px-24"
                                style={{ background: "rgba(255, 255, 255, 0.6)", color: "#FF8519" }}>
                                <View className="font-size-22 "
                                    onClick={() => this.setState({ rulesDlgFlag: true })}>活动说明</View>

                                {
                                    userInfo?.cstType > 0 && <View className="font-size-22 r-pl-12 r-ml-12"
                                        style={{ borderLeft: "1px solid #FF8519" }}
                                        onClick={() => WXSDK.link(`${actConfig?.award?.linkValue}`, { iactivityId: this.state.activityId })}>我的奖品</View>
                                }

                            </View>
                        </View>

                        <Blank height={206} />
                        {/*公告栏*/}
                        <View className="border round-borders2 r-px-16 r-mx-56 font-size-24 row items-center"
                            style={{ color: "#ED9E00", borderColor: "#FF8519" }}>
                            <View className="width-40">
                                <IconFont name={"pcicon-guangbo"} size={26} color={"#FF8519"} />
                            </View>
                            <View
                                className="flex-1 r-ml-4  overflow-hidden relative-position height-40 line-height-40">
                                <Swiper
                                    circular
                                    autoplay={false}
                                    vertical
                                    interval={2000}
                                    duration={1000}
                                    easing-function={'easeInOutCubic'}
                                >
                                    {
                                        winningList?.map((v, i) => {
                                            // return <View className={`text-scroll-x-${i + 1} absolute-left height-40`}>恭喜{v.phone}获得{v.awardName}
                                            return <SwiperItem
                                                className="relative-position"><View>恭喜{v.phone}获得{v.awardName}</View></SwiperItem>
                                        })
                                    }
                                </Swiper>
                            </View>
                        </View>

                        <Blank height={32} />
                        {/*    奖品栏*/}
                        <View className=" relative-position border-box r-mx-56">
                            <View className=" full-width relative-position container"
                                style={{ height: `504rpx` }}>
                                {
                                    this.state.cards.map((v, i) => {
                                        // @ts-ignore
                                        return <CardItem {...{
                                            v,
                                            i,
                                            cardImg,
                                            cardImgPlay,
                                            cardImgInit,
                                            ...this.state,
                                            onClick: this.playStart.bind(this, 1, i)
                                        }} />
                                    })
                                }
                            </View>

                            {
                                !!this.state.submitBtnState ? <View
                                    className={`submit-btn  text-center r-py-12 font-size-32 text-bold ${[1, 2].includes(playBtnState) ? "disabled-btn" : ""}`}
                                    onClick={this.ShuffleStart.bind(this)}>{["开始洗牌", "洗牌中", "洗牌中", "重新洗牌"][playBtnState]}</View>
                                    : <View
                                        className={`disabled-btn  text-center r-py-12 font-size-32 text-bold border-radius-12 `}>开始洗牌</View>
                            }


                            {
                                this.state.remainingNumberText && <View className="text-center font-size-24 r-mt-6"
                                    style={{ color: "#FF8519" }}>（{this.state.remainingNumberText}）</View>
                            }

                        </View>

                    </View>
                </View>

                <View>
                    {
                        introduce?.map(v => {
                            return <Image src={v?.picUrl} mode="widthFix" className="vertical-bottom" />
                        })
                    }
                </View>


                {prizeDlgFlag && <Dialog {...{
                    ...this.state.prizeInfo,
                    linkValue: this.props.confirmOrder?.linkValue,
                    close: this.closePrizeDlg.bind(this)
                }} />}

                {rulesDlgFlag && <IntroduceDlg {...{
                    ...actConfig,
                    close: () => this.setState({ rulesDlgFlag: false })
                }} />}

                {
                    !!sharePop &&
                    <ShareCard ref="shareCardRef" {...{
                        sharePageId: this.props.pageId,
                        iactivityId: this.state.activityId,
                        ...this.state.baseConfig,
                        ...this.state.basicInfo,
                        ...(getCurrentInstance().router?.params || {})
                    }} sharePopColse={() => this.setState({ sharePop: false })} />
                }

                <Blank height={68} />
            </View>
        )
    }
}

//获奖弹框
function Dialog(props) {
    console.log({ prizeInfo: { ...props } });

    const goSubmit = () => {
        props.close();
        const postParams = {
            ...props.config,
            productNum: 1,
            givenRecId: props.givenRecId
        }
        const templateId = (cacheManager.getPcenterInfo())?.templateId || 1;
        if (templateId == 2) {
            console.log({ ...props })
            WXSDK.link(props?.linkValue, postParams).then(r => r);
            return;
        }
        WXSDK.linkNavigateTo(AppUrls.orderSubmit + "?" + parseParams(postParams)).then(r => r)
    }
    return <View className="window-width window-height fixed-full z-max" style={{ background: "rgba(0,0,0,.9)" }}>
        <View className="bg-light absolute-center fit">
            <View className="absolute-center flex flex-center">
                <View className="font-size-48 text-center" style="color: #FDFFCF">恭喜获得</View>
                <View className="width-560 height-560 r-my-32">
                    <Image className="prize-img-animate"
                        src={props?.iconUrl}
                        mode="widthFix" />
                </View>
                <View className="prize-dlg-title">{props?.awardName || props?.title}</View>

                {props?.awardType == 3 && <View
                    className="bg-submit width-480 font-size-32 text-title border-radius-12 r-py-12 text-center text-bold r-mt-100"
                    onClick={goSubmit}>去领取</View>}

                {props?.awardType == 2 && <View
                    className="width-480 font-size-32 text-title border-radius-12 r-py-12 text-center text-bold r-mt-100"
                    style={{ backgroundColor: "#CCCCCC" }}>已发放至券包</View>}
                {props?.awardType == 1 && <View
                    className="width-480 font-size-32 text-title border-radius-12 r-py-12 text-center text-bold r-mt-100"
                    style={{ backgroundColor: "#CCCCCC" }}>已发放至积分账户</View>}

                <View className="text-center r-mt-48 full-width" onClick={props.close}>
                    <IconFont name={"pcicon-yiquxiao"} size={48} color="white" />
                </View>
            </View>
        </View>
    </View>
}

// 活动说明 弹框
function IntroduceDlg(props) {
    return <MPop isShow={true} popStyle={{ background: "rgba(0,0,0,0.8)" }}
        className=" absolute-center bg-white  border-radius-10"
        style={{ height: "516rpx", width: "640rpx" }} close={props?.close}>

        <View className="title flex flex-center text-bold text-title font-size-34"
            style={{ height: "112rpx" }}>活动说明</View>
        <View className="content border-top  r-pa-24 overflow-auto font-size-24 text-subTitle  rich-text"
            style={{ height: `calc(100% - 244rpx)` }} dangerouslySetInnerHTML={{ __html: props?.rules }} />
        <View style={{ height: "132rpx" }} className="flex flex-center">
            <View className="btn submit-btn r-mx-24 r-py-20 font-size-30 full-width text-bold"
                onClick={props.close}>我知道了</View>
        </View>

    </MPop>
}

function CardItem() {
    const { v, i, playBtnState, cardImgPlay, cardImg, onClick, cardImgInit } = this.props;
    return <View
        className={`width-160 height-240 flex-center flex warp-box  absolute ${playBtnState == 2 ? "ani-style" : ""}`}
        onClick={onClick}
        style={{
            left: `${v.offsetX}rpx`,
            top: `${v.offsetY}rpx`,
        }}>
        <View
            className={`  overflow-hidden   ${v.checked ? "animations" : ""}`}
            style={{
                width: "148rpx",
                height: "228rpx"
            }}>
            <View
                className={`fit card-container  ${["", "animate", "show-back"][v.state]} `}>
                {
                    //背面
                    v.isShowPrize ?
                        <View
                            className={`fit card-back absolute-top-left  text-title flex flex-center z-index-1`}
                            style={{ background: `url(${v?.bgUrl}) no-repeat center / 100%` }}>
                            <Image style={{ width: "128rpx", height: "128rpx" }}
                                src={v?.iconUrl}
                                mode="heightFix" />
                        </View>
                        :
                        <View
                            className={`fit  card-back absolute-top-left text-title flex flex-center z-index-1`}
                            style={{ background: `url(${cardImgPlay}) no-repeat center / 100%` }} />
                }

                <div className="z-index-2 fit  absolute-top-left  bg-white" />

                {/*前面*/}
                {
                    playBtnState == 3 ? <View
                        className={`fit card-front absolute-top-left text-title flex flex-center z-index-3 ${[1, 2].includes(playBtnState) ? "no-pointer-events" : ""}`}
                        style={{ background: `url(${cardImgPlay}) no-repeat center / 100%` }} /> :
                        <View
                            className={`fit card-front absolute-top-left text-title flex flex-center z-index-3 ${[1, 2].includes(playBtnState) ? "no-pointer-events" : ""}`}
                            style={{ background: `url(${cardImgInit}) no-repeat center / 100%` }} />
                }


            </View>
        </View>
    </View>
}
