import React, {useEffect, useState} from "react";
import Nerv from "nervjs";
import Taro, {getCurrentInstance} from "@tarojs/taro";
import {Block, Image, Input, ScrollView, Text, View} from "@tarojs/components";
import IndexHeader from "@/ky-pages/cpts/index-header";
import SelfHeader from "@/ky-pages/cpts/self-header";
import CQrcode from "@/public-pages/micropage/c-qrcode";
//微页面
import ComHeader from '@/components/com-header/index'
import OrderList from '@/saas-pages/micropage/order-list/index'
import KyOrderList from "@/ky-pages/micropage/order-list";
import PShopRecord from "@/ky-pages/micropage/pshop-record-list";
import KyCouponList from "@/ky-pages/micropage/coupon-list";
//优惠券列表
import CouponList from '@/saas-pages/micropage/coupon-list/index'
import TaskIndex from "@/public-pages/micropage/task-index";
import PointList from "@/ky-pages/micropage/point-list";
import KyOrderDetail from "@/ky-pages/micropage/order-detail";
import DeviceOrderDetail from "@/ky-pages/micropage/device-order-detail";
//订单详情
import OrderDetail from '@/saas-pages/micropage/order-detail/index'

import RecordDetail from "@/ky-pages/micropage/coupon-record-detail";
import ProductRecordDetail from "@/ky-pages/micropage/product-record-detail";
import ProductReturnOrderInfo from "@/ky-pages/micropage/return-order/return-info";
import DeviceReturnOrderInfo from "@/ky-pages/micropage/device-return-order/return-info";
import ProductReturnOrderApply from "@/ky-pages/micropage/return-order/return-apply";
import DeviceReturnOrderApply from "@/ky-pages/micropage/device-return-order/return-apply";
import ProductReturnEms from "@/ky-pages/micropage/return-order/return-ems"
import AddressEdit from "@/ky-pages/micropage/address/address-edit";
import AddressList from "@/ky-pages/micropage/address/address-list";
import PshopIndex from "@/ky-pages/micropage/pshop-index";
import PShopVrGoodsDetail from "@/ky-pages/micropage/pshop-vr-goods-detail";
import PShopGoodsDetail from "@/ky-pages/micropage/pshop-goods-detail";
import PShopGoodsOrderConfirm from "@/ky-pages/micropage/pshop-goods-order-confirm";
import UserInfo from "@/public-pages/micropage/user-info";
import GrantCoupons from "@/public-pages/micropage/c_grantCoupons";

// import NearSiteDetail from "@/public-pages/micropage/near-site-detail/index";
import NearSiteList from "@/public-pages/micropage/near-site/index";
import NearSiteCity from "@/public-pages/micropage/near-site-city";
import ScanBuyStatus from "@/ky-pages/micropage/scan-buy/status";
import ActCard from "@/public-pages/micropage/act-card/cards_1";
import ActCardRecord from "@/public-pages/micropage/act-card/records";
import ScoreList from "@/saas-pages/micropage/score-list";
import CacheManager from "@/service/cacheManager";
import PshopWindow from "@/components/com-pshop/pshop-window";
import PshopMixed from "@/public-pages/micropage/pshop-mixed";
import {
    Blank, ComAdv, ComClassIcon, CText, MBottom, TabBar, ComSite,
    ComSiteAct,
    ComSiteMatch,
    ComMultiWindow,
    Record, MPop, ComFloatIcon
} from "@/config/comptsConfig";
import MicroPage from "@/saas-pages/micropage/micro-page";
import PshopIndexHeader from '@/components/com-pshop/pshop-index-header'
import PshopCouponPic from '@/components/com-pshop/pshop-coupon-pic'
import PointerIndex from "@/saas-pages/micropage/pointer-shop/index"
import PointerGoodsList from "@/saas-pages/micropage/pointer-shop/goods-list"
import ExchangeInfo from "@/saas-pages/micropage/pointer-shop/exchange"
import ExchangeResult from "@/saas-pages/micropage/pointer-shop/exchange-result"
import ExchangeList from "@/saas-pages/micropage/pointer-shop/exchange-list"
import {HIDE_TITLE_PAGES} from "@/config/page_config";
import CouponDetail from "@/saas-pages/micropage/coupon-detail";
import MemberBenefits from "@/saas-pages/micropage/member-benefits";
import SiteIndex from "@/saas-pages/micropage/site-index";
import ComInteract from "@/components/com-interact";
import ComOnlineAward from "@/components/com-onlineAward";
import ActWindow from "@/ky-pages/cpts/act-window/index";
import NewsWindow from "@/ky-pages/cpts/news-window/index";
import KyActList from "@/ky-pages/cpts/act-list/index";
import C_device_product_window from "@/ky-pages/cpts/c_device_product_window/index";
import InformationList from "@/ky-pages/cpts/information-list/index";
import SurveyIndex from "@/public-pages/micropage/c_survey_index";
import SurveyAward from "@/public-pages/micropage/c_survey_award";
import SurveyInput from "@/public-pages/micropage/c_survey_input";
import TaskActivity from "@/public-pages/micropage/c_task_activity";
import TaskActivityItem from "@/public-pages/micropage/c_task_activity_item";
import TaskWinCst from "@/public-pages/micropage/c_task_win_cst";
import C_bounce_adv from "@/public-pages/micropage/c_bounce_adv";
import C_awardInviting from "@/public-pages/micropage/c_awardInviting";
import C_join_inviting_rate from "@/public-pages/micropage/c_join_inviting_rate";
import C_information_common_window from "@/public-pages/micropage/c_information_common_window";
import C_information_common_list from "@/public-pages/micropage/c_information_common_list";
import C_siteInfo_btn from "@/components/com-site/siteBtns";
import C_online_award_v2 from "@/public-pages/micropage/c_online_award_v2/index";
import {includesArr, pick} from "@/utils";
import API_CONFIG from "@/service";
import CDialog from "@/components/c-dialog";
import C_countdown from "@/public-pages/micropage/c_countdown";
import C_package from "@/public-pages/micropage/c_package";
import C_receive_coupon from "@/public-pages/micropage/c_receive_coupon";
import C_limit_shop_window from "@/public-pages/micropage/c_limit_shop_window";
import C_qiKan_list from "@/public-pages/micropage/c-qikan-list";
import WXSDK from "@/service/WXSDK";
import cacheManager from "@/service/cacheManager";
import SparkMD5 from "spark-md5";
import {AppUrls} from "@/config/pathConfig";
import IconFont from "@/components/iconfont";
import C_site_coupon from "@/saas-pages/micropage/C_site_coupon";
import C_ev_shop_product_info from "@/mall-pages/micropage/goods-detail";
import C_ev_shop_product_list from "@/mall-pages/micropage/goods-list";
import C_ev_shop_cart from "@/mall-pages/micropage/goods-cart";
import C_ev_shop_product_group from "@/mall-pages/micropage/goods-class";
import C_ev_shop_search from "@/mall-pages/micropage/goods-search";
import C_ev_shop_order_complete from "@/mall-pages/micropage/goods-complete";
import C_ev_shop_order_confirm from "@/mall-pages/micropage/cart-confirm";
import C_ev_shop_product_window from "@/mall-pages/micropage/goods-window";
import C_ev_shop_product_multiple_window from "@/mall-pages/micropage/goods-multiple-window";
import {sensorPubClick} from "@/service/sensorRegister";

function getComponent(props: any) {
    const {
        code,
        item,
        isShowTab,
        from_scene,
        fromPageId,
        pageInfo,
        siteInfo,
        memberRankConfig,
        networkType,
        headerHeight,
        pagesDetails,
        iactivityId,
        refPageName,
        onBackToTop
    } = props || {}


    // console.log("-----code--------", code, item)

    const isShowQw = pageInfo?.components?.find(item => {
        return item.code === "c_qw_contact"
    })?.config?.showType;

    //todo 分销员中心以后要可以装修
    const guiderCenter = pageInfo?.components?.find(item => item.code === "c_ev_shop_retail_center")

    // todo:如果有搜索，则在商品分类页预留位置，（傻缺设计无法沟通）
    const hasGoodsSearch = pageInfo?.components?.find(item => {
        return item.code === "c_ev_shop_search"
    })

    // let vid = "", isAutoPlay = false, vSource = 0;
    // if (code === "c_video") {
    //     const {videoSource, videoUrl, playType} = item.config || {}
    //     vid = videoUrl.slice(videoUrl.lastIndexOf("/") + 1, videoUrl.lastIndexOf("."));
    //     isAutoPlay = playType == 1 ? false : playType == 3 ? true : networkType == "wifi";
    //     vSource = videoSource
    // }
    item.headerHeight = headerHeight;

    // @ts-ignore
    const components = {
        c_personal_index_header: <ComHeader pcId={pageInfo.pcId} memberRankConfig={memberRankConfig} {...item}
                                            guiderCenter={guiderCenter}/>,

        c_qw_contact: <C_siteInfo_btn {...{
            ...item?.config,
            pageId: item.pageId,
            bizType: item.bizType,
            sort: item.sort
        }} pageInfo={pageInfo} from_scene={from_scene}/>,

        // 首页头部
        c_kayou_home_header: <IndexHeader {...{
            ...item?.config,
            pageId: item.pageId,
            bizType: item.bizType,
            sort: item.sort
        }} pageInfo={pageInfo} from_scene={from_scene}/>,

        // 分隔符
        c_white: <Blank {...item} />,

        c_float_icon: <ComFloatIcon config={item.config}
                                    from_scene={from_scene}
                                    fromPageId={fromPageId}
                                    pageInfo={pageInfo}
                                    onBackToTop={onBackToTop}
        />,

        // 个人中心头部
        c_kayou_index_header: <SelfHeader {...{...item?.config, pageId: item.pageId, sort: item.sort}}
                                          pageInfo={pageInfo} bizType={item.bizType} from_scene={from_scene}/>,

        // 会员码
        c_qrcode: <CQrcode {...item?.config} pageInfo={pageInfo} bizType={item.bizType} sort={item.sort}/>,

        // 订单列表
        c_kayou_order_list: <KyOrderList {...item?.config} pageInfo={pageInfo} bizType={item.bizType}
                                         sort={item.sort}/>,

        //订单详情
        c_kayou_order_info: <KyOrderDetail {...item?.config} pageInfo={pageInfo} bizType={item.bizType}
                                           sort={item.sort}/>,

        //抽卡机订单详情
        c_kayou_device_order_info: <DeviceOrderDetail {...item?.config} pageInfo={pageInfo} bizType={item.bizType}
                                                      sort={item.sort}/>,

        // 积分商城兑换记录
        c_pshop_kayou_coupon_order: <PShopRecord {...item?.config} pageInfo={pageInfo} bizType={item.bizType}
                                                 sort={item.sort}/>,

        // 兑换记录详情
        c_pshop_kayou_coupon_order_info: <RecordDetail {...item?.config} pageInfo={pageInfo} bizType={item.bizType}
                                                       sort={item.sort}/>,

        c_pshop_kayou_order_info: <ProductRecordDetail {...item?.config} pageInfo={pageInfo} bizType={item.bizType}
                                                       sort={item.sort}/>,

        // 卡游积分商城虚拟商品详情
        c_pshop_kayou_coupon_info: (
            <PShopVrGoodsDetail ref={"c_pshop_kayou_coupon_info"}
                                {...{
                                    ...item?.config,
                                    pageId: item.pageId,
                                    pageInfo,
                                    sort: item.sort,
                                    bizType: item.bizType
                                }}

            />
        ),

        // saas积分虚拟商品详情
        c_pshop_coupon_info: <ExchangeInfo psId={pageInfo.psId} bizType={item.bizType} config={item.config}
                                           sort={item.sort}
                                           from_scene={from_scene}/>,

        // 积分商城实物商品详情
        c_pshop_kayou_product_info: (
            <PShopGoodsDetail ref={"c_pshop_kayou_product_info"}
                              {...{
                                  ...item?.config,
                                  pageId: item.pageId,
                                  psId: pageInfo?.psId,
                                  pageInfo,
                                  bizType: item.bizType,
                                  sort: item.sort
                              }}
            />
        ),

        c_pshop_kayou_order_confirm: (
            <PShopGoodsOrderConfirm ref={"c_pshop_kayou_order_confirm"}
                                    {...{
                                        ...item?.config,
                                        pageId: item.pageId,
                                        pageInfo,
                                        bizType: item.bizType,
                                        sort: item.sort
                                    }}
            />
        ),

        c_pshop_kayou_return_info: (
            <ProductReturnOrderInfo ref={"c_pshop_kayou_return_info"}
                                    {...{
                                        ...item?.config,
                                        pageId: item.pageId,
                                        sort: item.sort,
                                        pageInfo,
                                        bizType: item.bizType
                                    }}
            />
        ),
        c_kayou_device_return_info: (
            <DeviceReturnOrderInfo ref={"c_kayou_device_return_info"}
                                   {...{
                                       ...item?.config,
                                       pageId: item.pageId,
                                       sort: item.sort,
                                       bizType: item.bizType
                                   }}
            />
        ),
        c_pshop_kayou_return_apply: (
            <ProductReturnOrderApply ref={"c_pshop_kayou_return_apply"}
                                     {...{
                                         ...item?.config,
                                         pageId: item.pageId,
                                         sort: item.sort,
                                         pageInfo,
                                         bizType: item.bizType
                                     }}
            />
        ),
        c_kayou_device_apply_return: (
            <DeviceReturnOrderApply ref={"c_kayou_device_apply_return"}
                                    {...{
                                        ...item?.config,
                                        pageId: item.pageId,
                                        sort: item.sort,
                                        bizType: item.bizType
                                    }}
            />
        ),

        //快递单号填写
        c_pshop_kayou_return_ems: <ProductReturnEms ref={"c_pshop_kayou_return_apply"} {...{
            ...item?.config,
            pageId: item.pageId,
            sort: item.sort,
            bizType: item.bizType
        }} />,

        // 收货地址列表
        c_pshop_kayou_address_list: <AddressList {...item?.config} bizType={item.bizType} sort={item.sort}/>,

        // 新建、编辑收货地址
        c_pshop_kayou_address_info: <AddressEdit {...item?.config} bizType={item.bizType} sort={item.sort}/>,

        // 券列表
        c_kayou_coupon_list: <KyCouponList {...item?.config} pageInfo={pageInfo} bizType={item.bizType}
                                           sort={item.sort}/>,

        c_micro_page: <MicroPage ref={"c_micro_page"} {...item} pageInfo={pageInfo} isMenu={isShowTab}
                                 nodes={item.nodes}/>,

        c_title: <CText config={item.config} bizType={item.bizType} sort={item.sort}/>,

        c_pic: (
            <ComAdv
                config={item.config}
                from_scene={from_scene}
                fromPageId={fromPageId}
                bizType={item.bizType}
                pageInfo={pageInfo}
                sort={item.sort}
                // callback={enterCallBack}
            />
        ),

        // 任务中心
        c_task_center_header: (
            <TaskIndex
                ref={"c_task_center_header"}
                {...item?.config}
                pageInfo={pageInfo}
                pageTitle={pageInfo?.pageTitle}
                pageId={item?.pageId}
                sort={item.sort}
                bizType={item.bizType}
            />
        ),

        // 积分明细
        // c_kayou_points_center: <PointList {...item?.config} />,
        c_kayou_points_center: <ScoreList {...item?.config} pageInfo={pageInfo} bizType={item.bizType}
                                          sort={item.sort}/>,

        //橱窗
        c_shop_window: (
            <PshopWindow psId={item?.psId} sort={item.sort} pageInfo={pageInfo} bizType={item.bizType}
                         config={item.config}/>
        ),

        // 混排橱窗
        c_shop_mixed: <PshopMixed psId={item?.psId} pageInfo={pageInfo} bizType={item.bizType} sort={item.sort}
                                  config={item.config}/>,

        // 个人信息
        c_kayou_modify_info: <UserInfo {...item?.config} pageInfo={pageInfo} refPageName={refPageName || '我的'}
                                       sort={item.sort} bizType={item.bizType}
        />,

        c_modify_info: <UserInfo {...item?.config} bizType={item.bizType} pageInfo={pageInfo} sort={item.sort}/>,

        c_icon_nav: (
            <ComClassIcon
                config={item.config}
                from_scene={from_scene}
                fromPageId={fromPageId}
                sort={item.sort}
                pageInfo={pageInfo}
                bizType={item.bizType}
                // callback={enterCallBack}
            />
        ),

        c_kayou_city_list: <NearSiteList {...item?.config} bizType={item.bizType} sort={item.sort}
                                         headerHeight={headerHeight}
                                         pageInfo={pageInfo}
                                         pageId={item?.pageId}/>,

        c_kayou_site_header: (
            // <NearSiteDetail
            //     ref="c_kayou_site_header"
            //     {...item?.config}
            //     pageInfo={pageInfo}
            // />
            <SiteIndex ref={"c_kayou_site_header"} {...{...item, ...item?.config}} pageInfo={pageInfo}
                       isShowQw={isShowQw}/>
        ),

        c_kayou_city_location: <NearSiteCity {...item?.config} pageInfo={pageInfo} bizType={item.bizType}
                                             sort={item.sort}/>,

        c_shipment: <ScanBuyStatus {...item?.config} bizType={item.bizType} sort={item.sort}/>,

        // c_video: (
        //     <WxVideo config={item.config} autoplay={isAutoPlay}/>
        // ),

        //卡牌屋
        c_card_raffle: <ActCard {...item.config} sort={item.sort} pageInfo={pageInfo} bizType={item.bizType}
                                ref={'c_card_raffle'}
                                from_scene={from_scene}/>,

        c_card_raffle_award: <ActCardRecord {...item.config} pageInfo={pageInfo} sort={item.sort} bizType={item.bizType}
                                            from_scene={from_scene}/>,

        // 积分商城
        c_pshop_index_header: <PshopIndexHeader ref={'c_pshop_index_header'} bizType={item.bizType} sort={item.sort}
                                                psId={pageInfo.psId}
                                                config={item.config}/>,
        c_pshop_kayou_index_header: <PshopIndex ref={'c_pshop_kayou_index_header'}
                                                pageInfo={pageInfo}
                                                psId={pageInfo.psId} sort={item.sort}  {...item?.config} />,

        c_all_coupon_pic: <PshopCouponPic code="c_all_coupon_pic" psId={pageInfo.psId} bizType={item.bizType}
                                          sort={item.sort}
                                          pageInfo={pageInfo}
                                          config={item.config}
                                          from_scene={from_scene}/>,

        c_all_product_pic: <PshopCouponPic code="c_all_product_pic" psId={pageInfo.psId} bizType={item.bizType}
                                           sort={item.sort}
                                           pageInfo={pageInfo}
                                           config={item.config}
                                           from_scene={from_scene}/>,

        c_pshop_coupon_list: <PointerGoodsList psId={pageInfo.psId} config={item.config} bizType={item.bizType}
                                               sort={item.sort}
                                               pageInfo={pageInfo}
                                               from_scene={from_scene}/>,

        c_pshon_exchange_list: <ExchangeList psId={pageInfo.psId} config={item.config} bizType={item.bizType}
                                             sort={item.sort}
                                             pageInfo={pageInfo}
                                             from_scene={from_scene}/>,

        c_pshon_exchange_info: <ExchangeResult psId={pageInfo.psId} pageInfo={pageInfo} sort={item.sort}
                                               bizType={item.bizType} {...item.config}/>,

        c_coupon_list: <CouponList {...item} pageInfo={pageInfo} headerHeight={headerHeight} name={"c_coupon_list"}/>,

        c_near_sites: <NearSiteList ref={"c_near_sites"} pageInfo={pageInfo} {...item?.config} bizType={item.bizType}
                                    sort={item.sort}
                                    pageId={item.pageId}/>,

        c_city_list: <NearSiteCity {...item?.config} pageInfo={pageInfo} bizType={item.bizType} sort={item.sort}/>,

        c_order_list: <OrderList {...item} pageInfo={pageInfo}/>,

        c_order_info: <OrderDetail {...item} pageInfo={pageInfo}/>,

        c_points_center: <ScoreList {...item?.config} bizType={item.bizType} pageInfo={pageInfo} sort={item.sort}/>,

        c_coupon_info: <CouponDetail {...item}/>,

        c_personal_rights_header: <MemberBenefits {...item} name={"c_personal_rights_header"}/>,

        c_site_header: <SiteIndex ref={"c_site_header"} {...{...item, ...item?.config}} isShowQw={isShowQw}/>,

        c_interact_activity: <ComInteract from_scene={from_scene} pageInfo={pageInfo} {...item} />,

        c_online_award: <ComOnlineAward from_scene={from_scene} {...item} pageInfo={pageInfo}/>,

        c_kayou_activity_window: !!item?.config?.enable ?
            <ActWindow from_scene={from_scene} pageInfo={pageInfo} {...item} /> : "",

        c_kayou_activity_list: <KyActList from_scene={from_scene} pageInfo={pageInfo} {...item}  />,

        c_information_list: <InformationList from_scene={from_scene} pageInfo={pageInfo} {...item}
                                             pcId={pageInfo?.pcId} bizType='information'/>,

        c_information_window: !!item?.config?.enable ?
            <NewsWindow from_scene={from_scene} {...item} pageInfo={pageInfo} pcId={pageInfo?.pcId}/> : "",

        // c_coupon_give: <ComCouponGive {...item}/>,
        c_online_award_v2: <C_online_award_v2 ref={"c_online_award_v2"} {...{
            itemConfig: item.config, ...pageInfo,
            sort: item.sort,
            pagesDetails,
            bizType: item.bizType
        }}/>,

        c_survey_index: <SurveyIndex ref={"c_survey_index"} {...{...item, ...pageInfo}}/>,

        c_survey_award: <SurveyAward {...{...item, ...pageInfo}}/>,

        c_survey_input: <SurveyInput {...{...item, ...pageInfo}}/>,

        c_task_activity: <TaskActivity ref={"c_task_activity"} {...{
            ...item, ...pageInfo,
            headerHeight,
            pagesDetails
        }}/>,

        c_task_activity_item: <TaskActivityItem
            ref={"c_task_activity_item"} {...{
            itemConfig: item.config,
            ...pageInfo,
            pagesDetails,
            bizType: item.bizType,
            sort: item.sort
        }}/>,

        c_task_win_cst: <TaskWinCst {...{
            itemConfig: item.config, ...pageInfo,
            bizType: item.bizType,
            sort: item.sort
        }}/>,

        c_bounce_adv: <C_bounce_adv {...{
            itemConfig: {...item.config, sort: item.sort},
            ...pageInfo,
            bizType: item.bizType,
            from_scene,
        }}/>,

        c_join_inviting: <C_awardInviting ref={"c_join_inviting"} {...{
            itemConfig: item.config, ...pageInfo, bizType: item.bizType,
            sort: item.sort
        }}/>,

        c_join_inviting_rate: <C_join_inviting_rate {...{
            itemConfig: item.config, ...pageInfo,
            bizType: item.bizType,
            sort: item.sort
        }}/>,

        c_site_activity: <ComSiteAct {...{
            ...item.config,
            from_scene,
            pageInfo,
            bizType: item.bizType,
            sort: item.sort
        }} />,

        c_site_match: <ComSiteMatch {...{
            ...item.config,
            from_scene,
            bizType: item.bizType,
            sort: item.sort,
            pageInfo
        }} />,

        c_multi_page_window: <ComMultiWindow {...{
            ...item.config,
            from_scene,
            pageInfo,
            bizType: item.bizType,
            sort: item.sort
        }} />,

        c_information_common_window: <C_information_common_window pcId={pageInfo?.pcId} {...{
            ...item.config,
            from_scene, bizType: item.bizType, sort: item.sort
        }} />,

        c_information_common_list: <C_information_common_list headerHeight={headerHeight} pcId={pageInfo?.pcId} {...{
            ...item.config,
            from_scene, bizType: item.bizType, sort: item.sort
        }} />,

        //附近网点橱窗
        c_near_sites_window: <ComSite {...{...item}} pageInfo={pageInfo}/>,

        //@ts-ignore
        c_staff: <Record {...item} />,

        // 期刊列表
        c_qikan_list: <C_qiKan_list {...item} {...pick(pageInfo, ['evSiteCode', 'pcId', 'templateId'])} />,

        //
        c_device_product_window: <C_device_product_window {...item.config} bizType={item.bizType} pageInfo={pageInfo}
                                                          sort={item.sort}/>,

        // 领券
        c_grantCoupons: <GrantCoupons ref={"c_grantCoupons"} pageInfo={pageInfo} {...{
            ...item.config,
            actId: iactivityId,
            bizType: item.bizType,
            sort: item.sort
        }} from_scene={from_scene}/>,

        // 倒计时组件
        c_countdown: <C_countdown ref={"c_countdown"} {...{...item.config, ...item}} pageInfo={pageInfo}
                                  from_scene={from_scene}/>,

        //领券+图文组件
        c_package: <C_package ref={"c_package"} {...{...item.config, ...item}} pageInfo={pageInfo}
                              from_scene={from_scene}/>,

        // 领券
        c_receive_coupon: <C_receive_coupon ref={"c_receive_coupon"} {...{...item.config, ...item}}
                                            pageInfo={pageInfo}
                                            from_scene={from_scene}/>,

        // 限兑橱窗
        c_limit_shop_window: <C_limit_shop_window ref={"c_limit_shop_window"}
                                                  pageInfo={pageInfo} {...{...item.config, ...item}}
                                                  from_scene={from_scene}/>,

        // 注销
        c_delete_user: <C_delete_user/>,

        /*@ts-ignore*/
        c_official_account: <View style={{margin: `0 ${(item.config?.areaDistance || 0)}rpx`}}
                                  onClick={() => sensorPubClick({
                                      item: {title: '关注公众号', sort: item.sort},
                                      pageInfo,
                                      bizType: props.bizType
                                  })}>

            <official-account/>

        </View>,

        c_site_coupon: <C_site_coupon ref={"c_site_coupon"} {...{...item.config, ...item}} pageInfo={pageInfo}
                                      from_scene={from_scene}/>,

        c_ev_commission: <Image src={""} className="full-width full-height" onClick={() => {
            WXSDK.linkNavigateTo(AppUrls.distributorDetail + "?evSiteCode=" + pageInfo?.evSiteCode)
        }}/>,

        c_ev_shop_product_info: <C_ev_shop_product_info
            ref={"c_ev_shop_product_info"} {...{...item.config, ...item}}
            siteInfo={siteInfo} {...pick(pageInfo, ['evSiteCode', 'pcId', 'templateId'])}
            from_scene={from_scene}/>,

        c_ev_shop_product_list: <C_ev_shop_product_list
            ref={"c_ev_shop_product_list"} {...{...item.config, ...item}}
            siteInfo={siteInfo} {...pick(pageInfo, ['evSiteCode', 'pcId', 'templateId'])}
            from_scene={from_scene}/>,

        c_ev_shop_cart: <C_ev_shop_cart
            ref={"c_ev_shop_cart"} {...{...item.config, ...item}} {...pick(pageInfo, ['evSiteCode', 'pcId', 'templateId'])}
            from_scene={from_scene}/>,

        c_ev_shop_product_group: <C_ev_shop_product_group
            ref={"c_ev_shop_product_group"} {...{...item.config, ...item}} {...pick(pageInfo, ['evSiteCode', 'pcId', 'templateId'])}
            from_scene={from_scene} isShowSearch={hasGoodsSearch}/>,

        c_ev_shop_search: <C_ev_shop_search
            ref={"c_ev_shop_search"} {...{...item, ...item.config}} {...pick(pageInfo, ['evSiteCode', 'pcId', 'templateId'])}
            from_scene={from_scene}/>,

        c_ev_shop_order_complete: <C_ev_shop_order_complete
            ref={"c_ev_shop_order_complete"} {...{...item, ...item.config}} {...pick(pageInfo, ['evSiteCode', 'pcId', 'templateId'])}
            from_scene={from_scene}/>,

        c_ev_shop_order_confirm: <C_ev_shop_order_confirm
            ref={"c_ev_shop_order_confirm"} {...{...item, ...item.config}} {...pick(pageInfo, ['evSiteCode', 'pcId', 'templateId'])}
            from_scene={from_scene}/>,

        c_ev_shop_product_multiple_window: <C_ev_shop_product_multiple_window
            ref={"c_ev_shop_product_multiple_window"} {...{...item, ...item.config}}
            siteInfo={siteInfo} {...pick(pageInfo, ['evSiteCode', 'pcId', 'templateId'])}
            from_scene={from_scene}/>,

        c_ev_shop_product_window: <C_ev_shop_product_window
            ref={"c_ev_shop_product_window"} {...{...item, ...item.config}} {...pick(pageInfo, ['evSiteCode', 'pcId', 'templateId', 'pageTags'])}
            siteInfo={siteInfo}
            from_scene={from_scene}/>,
    };
    return components[code];
}

function C_delete_user() {
    const {phone, cstId, cstType} = CacheManager.getCustomerUserInfo();

    function deleteUser() {
        const {appId, openid, tenId} = cacheManager.getUserTokenInfoCacheObj();
        const pCenterInfo = cacheManager.getPcenterInfo();
        const {configMap} = pCenterInfo || {};
        const {MULTIPLE_REGISTRATION_LIMIT_DAY} = configMap || {};
        if (!phone) {
            WXSDK.errorMessage("该手机号不存在！")
            return
        }
        WXSDK.confirmContent(`卡游小程序注销后，您在产品中各类权益及信息将被清除，` + (MULTIPLE_REGISTRATION_LIMIT_DAY > 0 ? `且${MULTIPLE_REGISTRATION_LIMIT_DAY}天内无法再次注册，` : '') + `如再次注册将无法重复享有新人会员权益，请确认是否注销？`, "注销", true, "确定").then(res => {
            if (!!res.cancel) {
                return
            }
            API_CONFIG.deleteUser({
                postParams: {
                    cstId
                }
            }).then((res) => {
                console.log(this, res);
                WXSDK.linkReLaunch(AppUrls.loading)
            });
        })
    }

    if (cstType < 1) {
        return null
    }
    return <View className="flex justify-between items-center" onClick={deleteUser}>
        <Image mode="widthFix"
               src={"https://media-opens.oss-cn-shanghai.aliyuncs.com/2076/default/image/9fe396b440dc7dd42de8499273d316b2.png"}/>
    </View>
}

function Components() {
    const {
        components,
        isShowTab,
        isIphoneX,
        isFullScreen,
        ClientRect,
        from_scene,
        fromPageId,
        pageInfo,
        siteInfo,
        memberRankConfig,
        enterCallBack,
        networkType,
        tabList,
        pagesDetails,
        refPageName,
        codes = []
    } = this.props;

    const {config, filter, iactivityId, pcId} = pageInfo || {};
    const [scroll, setScroll] = useState<any>({})


    const handleScroll = (e: any) => {
        const top = e.detail.scrollTop
        if (top > 200) {
            setScroll({
                ...scroll,
                fixed: true,
                style: {top: 100}
            })
        }
        if (top <= 200 && scroll.fixed) {
            setScroll({
                ...scroll,
                fixed: false,
                style: {}
            })
        }
    }

    const onBackToTop = () => {
        setScroll({
            top: Math.random(),
            fixed: false,
            style: {}
        })
    }

    return !!components && (
        <View className="relative-position border-box r-ma-32 window-height window-width  overflow-auto"
              style={
                  {
                      background: ["", config?.bgValue || "#f7f7f7", "", "", `linear-gradient(${config?.angle || 180}deg, ${config?.bg2Color?.[0]} 0%, ${config?.bg2Color?.[1]} 100%)`][config?.bgType] || "#f7f7f7",
                  }
              }
        >
            <View className="relative-position " style={{zIndex: 1}}>
                <Image src={config?.bgImg} className="vertical-bottom" mode="widthFix"/>
            </View>
            <View className="absolute-top-left full-width flex column " style={{
                zIndex: 10,
                top: `${isFullScreen ? 0 : ClientRect.bottom + 12}px`,
                bottom: 0
            }}>
                <View className="flex-1 overflow-auto full-width">
                    <ScrollView scrollWithAnimation scrollY scrollTop={scroll.top}
                                className="full-height" onScroll={handleScroll}>
                        {
                            components.map((item, index) => {
                                return getComponent({
                                    ...{
                                        code: item.code,
                                        item,
                                        isShowTab,
                                        from_scene,
                                        fromPageId,
                                        pageInfo,
                                        siteInfo,
                                        memberRankConfig,
                                        enterCallBack,
                                        networkType,
                                        headerHeight: `${isFullScreen ? 0 : ClientRect.bottom + 12}px`,
                                        pagesDetails,
                                        refPageName,
                                        iactivityId,
                                        onBackToTop
                                    }
                                })
                            })
                        }
                        <Blank height={12}/>
                        {includesArr(codes, ["c_qw_contact"]) > 0 && <Blank height={isIphoneX ? 158 : 106}/>}

                    </ScrollView>
                </View>

                {/*底部菜单*/}
                {
                    !!isShowTab ? <TabBar dataList={tabList} pageInfo={pageInfo}/> : ""
                }

            </View>
        </View>
    )
}

export default Components
