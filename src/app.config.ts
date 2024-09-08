/*
 * @,@Author: ,: your name
 * @,@Date: ,: 2021-03-30 10:31:11
 * @,@LastEditTime: ,: 2021-07-05 11:15:53
 * @,@LastEditors: ,: Please set LastEditors
 * @,@Description: ,: In User Settings Edit
 * @,@FilePath: ,: /crm-customer-c-minimp/src/app.config.ts
 */
import {useGlobalIconFont} from "./components/iconfont/helper";

const env = process.env.ENV // 客户版本 针对不同客户做的区分（此处用于生成配置文件）
// 主包
const main_pages = [
    "pages/loading/index",
    "pages/login/index",
    "pages/page-1/index",
    "pages/callback/index",
    "pages/externalLink/index",
    "pages/kydevice/index",
    "pages/deviceStatus/index",
    "pages/share/index",
    "pages/sign-up/detail",
    "pages/signedAgreement/index",
    "pages/orderList/index",
    "pages/online-award/index",
    "pages/wmCouponList/index",

]

// 卡游分包
const ky_sub_pages = {
    root: "ky-pages",
    pages: [
        "pages/index/index",
        "pages/footprint/index",
        "pages/area-product-list/index",
        "pages/superiorkayou/index",
    ]
}

// 良友分包
const ly_sub_pages = {
    root: "ly-pages",
    pages: [
        "pages/order/index",
        "pages/confirmOrder/index",
        "pages/record/index",
    ]
}

// 良友扫码点餐
const scan_sub_pages = {
    root: "scan-order-pages",
    pages: [
        "pages/order/index",
        "pages/confirmOrder/index",
        "pages/record/index",
        "pages/nearSite/index",
        "pages/productDetail/index",
        "pages/orderDetail/index"
    ]
}

// saas分包
const saas_sub_pages = {
    root: "saas-pages",
    pages: [
        "pages/store-card-bind/index",
        "pages/store-card-edit/index",
        "pages/store-card-info/index",
        "pages/store-card-list/index",
        "pages/store-card-order/index",
        "pages/store-card-pay/index",
        "pages/address-list/index",
        "pages/address-edit/index",
        "pages/after-sale/index",
        "pages/return-submit/index",
        "pages/return-detail/index",
        "pages/goods-list/index",
        "pages/goods-detail/index",
        "pages/order-submit/index",
        "pages/order-list/index",

        "pages/order-detail/index",

        "pages/exchange-detail/index",
        "pages/page-2/index",
        "pages/check-point/index",
        "pages/sign-up-form/index",
        "pages/editor/index",
        "pages/pshop/index",
        "pages/coupon-give/index",
        "pages/qw-coupon/index",
        "pages/point-list/index",
        "pages/growth-list/index",
    ]
}

// 公共分包
const public_sub_pages = {
    root: "public-pages",
    pages: [
        "pages/index/index",
        "pages/h5Index/index",
        "pages/qyIndex/index",
        "pages/webview/index",
        "pages/page-1/index",
        "pages/infiniteFission/index",
        "pages/groupFission/index",
        "pages/fission-result/index",
        "pages/evaluation-center/index"
    ]
}

// 公共分包
const mall_pages = {
    root: "mall-pages",
    pages: [
        "pages/index/index",
        "pages/qikan-info/index",
        "pages/qikan-return-detail/index",
        "pages/qikan-payResult/index",
        "pages/qikan-order-list/index",
        "pages/qikan-order-detail/index",
        "pages/distributor-detail/index",
        "pages/performance-order/index",
        "pages/profit-out-list/index",
        "pages/commodity-promotion-list/index",
        "pages/mall-share/index",
        "pages/sec-kill-detail/index",


    ]
}

/**
 * 不同租户打包不同代码包
 */
let subpackages = {
    REALLY:     [public_sub_pages, saas_sub_pages, ky_sub_pages], // 锐利
    production: [public_sub_pages, saas_sub_pages, ky_sub_pages, ly_sub_pages, scan_sub_pages,mall_pages], // saas
    KAYOU:      [public_sub_pages, saas_sub_pages, ky_sub_pages], // 卡游
    ANLIFANG:   [public_sub_pages, saas_sub_pages, ky_sub_pages], // 安莉芳
    SANX:       [public_sub_pages, saas_sub_pages, ky_sub_pages], // 三星
    LIANGYOU:   [public_sub_pages, saas_sub_pages, ky_sub_pages, ly_sub_pages, scan_sub_pages], // 良友
    development:[public_sub_pages, saas_sub_pages, ky_sub_pages, ly_sub_pages, scan_sub_pages,mall_pages], // 开发环境
}[env]

export default {
    pages: main_pages,
    subpackages,
    preloadRule: {
        "pages/loading/index": {
            network: "all",
            packages: ["public-pages"]
        }
    },
    window: {
        backgroundTextStyle: "light",
        navigationBarBackgroundColor: "#fff",
        navigationBarTitleText: "WeChat",
        navigationBarTextStyle: "black",
        enablePullDownRefresh: false
    },
    plugins: {
        contactPlugin: {
            version: "1.4.4",
            provider: "wx104a1a20c3f81ec2"
        },
        materialPlugin: {
            version: "1.0.5",
            provider: "wx4d2deeab3aed6e5a"
        }
    },
    permission: {
        "scope.userLocation": {
            desc: "你的位置信息将用于小程序位置接口的效果展示"
        }
    },
    requiredPrivateInfos: ["chooseLocation", "getLocation", "chooseAddress"],
    usingComponents: Object.assign(useGlobalIconFont()),
    "__usePrivacyCheck__": true
};
