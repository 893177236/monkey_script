// ==UserScript==
// @name         网盘链接识别
// @namespace    http://tampermonkey.net/
// @version      1.4.8
// @description  识别网页中显示的网盘链接，目前包括百度网盘、蓝奏云网盘
// @author       MT-戒酒的李白染
// @include      *
// @run-at       document-start
// @license      GPL-3.0-only
// @copyright 2021, whitesev (https://openuserjs.org/users/whitesev)
// @require		 http://cdn.staticfile.org/jquery/2.1.4/jquery.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_log
// @grant        GM_addElement
// @grant        GM_info
// @grant        GM_addStyle
// @connect      *
// ==/UserScript==

(function () {
    'use strict';
    ! function (e, t, a) {
        function n(e) {
            return Object.prototype.toString.call(e).toLocaleLowerCase().replace(/[\[\]]/g, "").split(" ")[1]
        }
        if (!t)
            return void console.error("lack jQuery.js");
        var i = {
            info: function (e) {
                var t = this._getConf(e);
                return t.icon = '<i class="fa fa-exclamation-circle vt-icon vt-info" aria-hidden="true"></i>',
                    t.background = "info",
                    this._make(t)
            },
            error: function (e) {
                var t = this._getConf(e);
                return t.icon = '<i class="fa fa-times-circle vt-icon vt-error" aria-hidden="true"></i>',
                    t.background = "error",
                    this._make(t)
            },
            success: function (e) {
                var t = this._getConf(e);
                return t.icon = '<i class="fa fa-check-circle vt-icon vt-success" aria-hidden="true"></i>',
                    t.background = "success",
                    this._make(t)
            },
            warning: function (e) {
                var t = this._getConf(e);
                return t.icon = '<i class="fa fa-exclamation-circle vt-icon vt-warning" aria-hidden="true"></i>',
                    t.background = "warning",
                    this._make(t)
            },
            panel: function (e) {
                return "object" != n(e) && (e = {
                        content: e
                    }),
                    e = Object.assign({}, {
                        closable: !0,
                        duration: 0,
                        style: {
                            minWidth: 320
                        }
                    }, e),
                    this._make(this._getConf(e))
            },
            _getConf: function (e) {
                var t = Object.assign({}, this._config);
                return e && "object" == n(e) ? Object.assign(t, e) : e ? Object.assign(t, {
                    content: e
                }) : t
            },
            _getId: function () {
                return "VtMessageId_" + Math.floor(1e7 * Math.random())
            },
            _config: {
                duration: 2500,
                background: !1,
                color: null,
                content: "",
                onclose: null,
                icon: "",
                animate_duration: 500,
                closable: !1,
                header: !1,
                title: !1,
                footer: !1,
                confirm: function (e) {
                    e()
                },
                confirm_text: "确认",
                cancel: function (e) {
                    e()
                },
                cancel_text: "取消",
                area: [],
                mask: !1,
                parent: null,
                remove_parent: !1,
                offset: "vt-right-top",
                style: null
            },
            _createHeader: function (e, a) {
                if (a.header) {
                    var n = t('<div class="vt-message-header">' + (a.icon + a.header) + "</div>");
                    e.prepend(n)
                } else if (a.title) {
                    var i = t('<div class="vt-message-header"><div class="vt-header-text">' + (a.icon + a.title) + "</div></div>");
                    e.prepend(i)
                }
                this._createClose(e, e.find(".vt-message-header"), a)
            },
            _createClose: function (e, a, n) {
                var i = this;
                if (n.closable && a.length) {
                    var s = t('<div class="vt-hide"><i class="fa fa-times" aria-hidden="true"></i></div>');
                    a.append(s),
                        s.find("i").bind("click", function () {
                            i.hide(e, n)
                        })
                }
            },
            _createContent: function (e, a) {
                var n = a.header || a.title || !a.icon ? "" : a.icon;
                n += a.content;
                var i = t('<div class="vt-message-body">' + n + "</div>");
                a.header || a.title || !a.closable || this._createClose(e, i, a),
                    e.append(i)
            },
            _createFooter: function (e, a) {
                var i = this;
                if (a.footer && "string" == n(a.footer))
                    e.append('<div class="vt-message-footer">${conf.footer}</div>');
                else if ((a.cancel || a.confirm) && a.footer) {
                    var s = t('<div class="vt-message-footer"></div>');
                    if (e.append(s), a.cancel) {
                        var o = t('<button class="vt-cancel">' + a.cancel_text + "</button>");
                        s.append(o),
                            o.on("click", function () {
                                !0 === a.cancel(function () {
                                    i.hide(e, a)
                                }) && i.hide(e, a)
                            })
                    }
                    if (a.confirm) {
                        var r = t('<button class="vt-confirm">' + a.confirm_text + "</button>");
                        s.append(r),
                            r.on("click", function () {
                                !0 === a.confirm(function () {
                                    i.hide(e, a)
                                }) && i.hide(e, a)
                            })
                    }
                }
            },
            _setMask: function (e, t) {
                if (t.mask) {
                    var a = Math.floor(1e6 * Math.random());
                    e.parent().addClass("vt-message-mask").data("mask", a),
                        e.data("mask", a)
                }
            },
            hide: function (e, t) {
                e.data("mask") && e.parent().data("mask") && e.data("mask").toString() == e.parent().data("mask").toString() && e.parent().removeClass("vt-message-mask").data("mask", "0"),
                    e.addClass("vt-remove");
                var a = function () {
                    t.remove_parent && e.parent().remove(),
                        e.remove()
                };
                t.onclose ? t.onclose(a, e, t) : setTimeout(a, t.animate_duration)
            },
            _make: function (e) {
                var a = this,
                    i = this._getId(),
                    s = t('<div class="vt-message"  id="' + i + '"></div>');
                return this.getContainer(e).append(s),
                    e.class && s.addClass(e.class),
                    e.color && s.css("color", e.color),
                    e.background && (/^(#|rgb\(|rgba\()/.test(e.background) ? s.css("background-color", e.background) : s.addClass("vt-background vt-bg-" + e.background)),
                    e.style && "object" == n(e.style) && s.css(e.style),
                    this._createHeader(s, e),
                    this._createContent(s, e),
                    this._createFooter(s, e),
                    e.area.length > 0 && s.css("width", e.area[0]),
                    e.area.length > 1 && s.css("height", e.area[1]),
                    this._setMask(s, e),
                    e.offset && ("string" == n(e.offset) ? s.addClass(e.offset) : s.css("position", "absolute").css(e.offset)),
                    e.duration > 0 && setTimeout(function () {
                        a.hide(s, e)
                    }, e.duration),
                    s
            },
            getContainer: function (e) {
                var a = t(e.parent ? e.parent : ".vt-message-package");
                return a.length || (a = t('<div class="vt-message-package"></div>'), t(document.body).append(a)),
                    a
            }
        };
        a && (a.Message = i),
            e.VtMessage = i
    }
    (window, window.jQuery, window.ViewT);
    GM_addStyle(`.vt-message-package {
        width:100%;
        height:0;
        position:fixed;
        display:flex;
        flex-direction:column;
        z-index:20000;
        padding:0 15px;
        top:0;
        font-size:1rem;
        box-sizing:border-box;
        text-align:center
    }
    .vt-message-package.vt-message-mask {
        height:100%;
        background-color:rgba(0,0,0,.2)
    }
    .vt-message-package * {
        box-sizing:border-box
    }
    .vt-message {
        opacity:1;
        position:relative;
        animation-duration:.5s;
        animation-fill-mode:forwards;
        border:1px solid #dcdee2;
        background-color:#fff;
        border-radius:5px;
        min-width:240px;
        max-width:520px;
        box-sizing:border-box
    }
    .vt-message * {
        box-sizing:border-box
    }
    .vt-message .vt-message-header {
        display:flex;
        font-size:1rem;
        padding:10px 16px;
        border-bottom:1px solid #eee;
        margin-bottom:5px
    }
    .vt-message .vt-hide {
        color:#ccc;
        font-weight:300;
        margin-right:0;
        margin-left:auto;
        width:25px;
        cursor:pointer!important
    }
    .vt-message .vt-hide:hover {
        color:#aaa
    }
    .vt-message .vt-message-body {
        flex-wrap:wrap;
        letter-spacing:1px;
        text-decoration:none;
        width:100%;
        padding:5px 16px;
        text-align:left
    }
    .vt-message .vt-message-body .vt-hide {
        position:absolute;
        right:0;
        top:5px
    }
    .vt-message .vt-message-footer {
        padding:14px 16px;
        margin-top:5px;
        border-top:1px solid #eee;
        text-align:right
    }
    .vt-message .vt-message-footer button {
        line-height:1;
        display:inline-block;
        font-weight:400;
        text-align:center;
        vertical-align:middle;
        cursor:pointer;
        outline:0;
        white-space:nowrap;
        user-select:none;
        height:30px;
        padding:0 15px;
        font-size:14px;
        border-radius:4px;
        margin-bottom:0
    }
    .vt-message .vt-message-footer button:after {
        display:none;
        transition:color ease .3s
    }
    .vt-message .vt-message-footer button.vt-confirm {
        margin-left:8px;
        color:#fff;
        background-color:#2d8cf0;
        border:1px solid #2d8cf0
    }
    .vt-message .vt-message-footer button.vt-confirm:hover {
        color:#e9e9e9
    }
    .vt-message .vt-message-footer button.vt-cancel {
        background:0 0;
        border:none
    }
    .vt-message .vt-message-footer button.vt-cancel:hover {
        color:#2d8cf0
    }
    .vt-message .vt-icon {
        margin-right:4px;
        font-size:16px;
        width:16px
    }
    .vt-message .vt-icon.vt-info {
        color:#2d8cf0
    }
    .vt-message .vt-icon.vt-error {
        color:#ed4014
    }
    .vt-message .vt-icon.vt-success {
        color:#19be6b
    }
    .vt-message .vt-icon.vt-warning {
        color:#f90
    }
    .vt-message.vt-background {
        box-shadow:none!important
    }
    .vt-message.vt-background.vt-bg-info {
        background-color:#f0faff!important;
        color:#2d8cf0;
        border:1px solid #d4eeff
    }
    .vt-message.vt-background.vt-bg-error {
        background-color:#ffefe6!important;
        color:#ed4014;
        border:1px solid #ffcfb8
    }
    .vt-message.vt-background.vt-bg-success {
        background-color:#edfff3!important;
        color:#19be6b;
        border:1px solid #bbf2cf
    }
    .vt-message.vt-background.vt-bg-warning {
        background-color:#fff9e6!important;
        color:#f90;
        border:1px solid #ffe7a3
    }
    .vt-message.vt-top-center {
        margin:0 auto;
        animation-name:VtMsgTopEnter;
        transform:translateY(15px)
    }
    .vt-message.vt-top-center.vt-fixed {
        position:fixed;
        left:50%;
        transform:translateY(15px) translateX(-50%)
    }
    .vt-message.vt-top-center.vt-remove {
        animation-name:VtMsgTopOut
    }
    .vt-message.vt-left-top {
        margin-top:15px;
        margin-left:0;
        margin-right:auto;
        animation-name:VtMsgLeftEnter
    }
    .vt-message.vt-left-top.vt-remove {
        animation-name:VtMsgLeftOut
    }
    .vt-message.vt-left-top.vt-fixed {
        position:fixed;
        left:15px
    }
    .vt-message.vt-right-top {
        margin-right:0;
        margin-top:15px;
        margin-left:auto;
        animation-name:VtMsgRightEnter
    }
    .vt-message.vt-right-top.vt-fixed {
        position:fixed;
        right:15px
    }
    .vt-message.vt-right-top.vt-remove {
        animation-name:VtMsgRightOut
    }
    .vt-message.vt-left-center {
        position:fixed;
        opacity:1;
        left:15px;
        top:50%;
        transform:translate3d(0,-50%,0);
        animation-name:VtMsgLeftEnter
    }
    .vt-message.vt-left-center.vt-remove {
        animation-name:VtMsgLeftOut
    }
    .vt-message.vt-center-center {
        position:fixed;
        animation-name:VtMsgOpacityEnter;
        left:50%;
        top:50%;
        transform:translate3d(-50%,-50%,0)
    }
    .vt-message.vt-center-center.vt-remove {
        animation-name:VtMsgOpacityOut
    }
    .vt-message.vt-right-center {
        position:fixed;
        opacity:1;
        right:15px;
        top:50%;
        transform:translateY(-50%);
        animation-name:VtMsgRightEnter
    }
    .vt-message.vt-right-center.vt-remove {
        animation-name:VtMsgRightOut
    }
    .vt-message.vt-left-bottom {
        position:fixed;
        top:auto;
        left:15px;
        opacity:1;
        bottom:15px;
        animation-name:VtMsgBottomEnter
    }
    .vt-message.vt-left-bottom.vt-remove {
        animation-name:VtMsgBottomOut
    }
    .vt-message.vt-bottom-center {
        position:fixed;
        top:auto;
        left:50%;
        opacity:1;
        bottom:15px;
        transform:translateX(-50%);
        animation-name:VtMsgBottomEnter
    }
    .vt-message.vt-bottom-center.vt-remove {
        animation-name:VtMsgBottomOut
    }
    .vt-message.vt-right-bottom {
        position:fixed;
        right:15px;
        bottom:15px;
        top:auto;
        opacity:1;
        animation-name:VtMsgBottomEnter
    }
    .vt-message.vt-right-bottom.vt-remove {
        animation-name:VtMsgBottomOut
    }
    @media screen and (max-width:768px) {
        .vt-message {
        max-width:calc(100% - 30px)
    }
    }@keyframes VtMsgLeftEnter {
        0% {
        opacity:0;
        margin-left:-100%
    }
    100% {
        opacity:1;
        margin-left:0
    }
    }@keyframes VtMsgLeftOut {
        0% {
        opacity:1;
        margin-left:0
    }
    100% {
        opacity:0;
        margin-left:-100%
    }
    }@keyframes VtMsgRightEnter {
        0% {
        opacity:0;
        margin-right:-100%
    }
    100% {
        opacity:1;
        margin-right:0
    }
    }@keyframes VtMsgRightOut {
        0% {
        opacity:1;
        margin-right:0
    }
    100% {
        opacity:0;
        margin-right:-100%
    }
    }@keyframes VtMsgOpacityEnter {
        0% {
        opacity:0
    }
    100% {
        opacity:1
    }
    }@keyframes VtMsgOpacityOut {
        0% {
        opacity:1
    }
    100% {
        opacity:0
    }
    }@keyframes VtMsgBottomEnter {
        0% {
        opacity:0;
        margin-bottom:-100%
    }
    100% {
        opacity:1;
        margin-bottom:0
    }
    }@keyframes VtMsgBottomOut {
        0% {
        opacity:1;
        margin-bottom:0
    }
    100% {
        opacity:0;
        margin-bottom:-100%
    }
    }@keyframes VtMsgTopEnter {
        0% {
        margin-top:-100%;
        opacity:0
    }
    100% {
        margin-top:0;
        opacity:1
    }
    }@keyframes VtMsgTopOut {
        0% {
        opacity:1;
        margin-top:0
    }
    100% {
        opacity:0;
        margin-top:-100%
    }
    }`);


    const ui = {
        bodyWidth:"60vw",
        setCSS: function () { //加载css
            let ui_css = `
            #white-box-body{
                position: fixed;
                right: 0px;
                z-index: 1000;
                width: 0px;
                height: 228px;
                transform: translateY(50%);
                bottom:50%;
                transition: all 0.45s ease;
                
                border-radius: 5px;
            }
            #white-box-main{
                display: none;
                background: #eae7e7;
                z-index: 1000;
                width: 100%;
                min-width:130px;
                height: 228px;
                border-radius: inherit;
                box-shadow: -1px 0px 10px 0px;
                transition: all 0.45s ease;
                
            }
            #white-box-body .home_fixed{
                width: 100%;
                height: 85%;
                overflow-x: hidden;
                overflow-y: auto;
                border-radius: inherit;
            }
            #white-box-body .home_fixed a{
                color: #ff4848;
                background-color: #fff;
                display: block;
                border-radius: 5px;
                overflow-x: hidden;
                overflow-y: auto;
                font-size: 14px;
                border:none;
                margin: 8px 0px;
                padding: 0px 5px;
            }
            #white-box-body .home_fixed a:first-child{
                margin: 4px;
            }
            #white-box-body .bottom_fixed{
                text-align: center;
                width: 100%;
                background: #fff;
                border-radius: inherit;
                height: 15%;
            }
            #white-box-body .guanbi,
            #white-box-body .white-open-set{
                width: 44px;
                height: 75%;
                border-width: 0px;
                border-radius: 3px;
                cursor: pointer;
                outline: none;
                font-family: Microsoft YaHei;
                margin: 0 auto;
                margin-top: 4px;
            }
            #white-box-body .guanbi{
                margin-right: 20px;
            }
            .white-bdlink-icon,
            .white-lanzou-icon{
                width: 16px;
                height: 16px;
                margin: 0px 3px;
            }

            .white-link-isclick{
                color:grey !important;
            }
            .white-link-div{
                display: flex;
                align-items: center;
                width:100%;
            }
            .white-link-img{
                margin: 0px 4px;
                width: 15%;
                display: contents;
            }
            .white-link-url{
                width: 85%;
            }
            .white-link-img img{
                border-radius:5px;
            }
            .white-link-img img,
            .white-link-url a,
            #white-box-main .bottom_fixed button{
                box-shadow: 0 0.3px 0.6px rgb(0 0 0 / 6%),
                            0 0.7px 1.3px rgb(0 0 0 / 8%),
                            0 1.3px 2.5px rgb(0 0 0 / 10%),
                            0 2.2px 4.5px rgb(0 0 0 / 12%),
                            0 4.2px 8.4px rgb(0 0 0 / 14%),
                            0 10px 20px rgb(0 0 0 / 20%);
            }
            .white-setting-body{
                display:none;
                width: 78vw;
                min-width:280px;
                height: 60vh;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                margin: auto;
                background: #f7f7f7;
                z-index: 999999;
                border-radius: 10px;
                font-size:14px;
                font-weight:bold;
            }
            #white-float-button{
                background: #000;
                height: inherit;
                width: 6px;
                right: 1px;
                z-index: 1100;
                position: inherit;
                top: 0;
                border-radius: 10px;
            }
            @media screen and (min-width: 1400px){
                .white-setting-body{
                    width:20vw !important;
                    height:54vh !important;
                }
            }
            .bd-setting
            {
                margin:20px 0 0 20px;
            }
            .bd-setting:first-child{

            }
            .bd-setting:last-child{
                margin-bottom:15px;
            }
            .bd-setting label{

            }
            .bd-setting input{
                float:right;
                margin-right:20px;
                border:none;
                background:transparent;
                border-bottom:3px solid;
                
            }
            .bd-setting input[type=text]{
                width:60%;
            }
            .bd-setting input:focus{
                outline:0;
            }
            .bd-setting-main{
                overflow-y: auto;
                height: 90%;
            }
            .bd-setting-main::-webkit-scrollbar,
            #white-box-body .home_fixed a::-webkit-scrollbar{
                display:none;
            }
            .lbl-close{
                height: 10%;
                border-radius: inherit;
                text-align: center;
            }
            .lbl-close svg{
                fill:currentColor;
                color:#000;
            }
            .white-link-setting-menu summary{
                margin:10px 6px;
            }
            .white-bd-panel-more .vt-message-body,
            .white-bd-panel-more-one  .vt-message-body,
            .white-bd-panel-more-two  .vt-message-body{
                max-height: 38vh;
                overflow-y: auto;
                display: flex;
            }
            .white-bd-panel-more .vt-message-body a{
                margin: 10px 0px;
            }
            .white-bd-panel-more .vt-message-body a:not(:last-child),
            .white-bd-panel-more-two .vt-message-body a:first-child{
                border:none;
                border-bottom:1px solid grey;
            }
            `;
            GM_addStyle(ui_css);
        },
        setSidebar: function setSidebar() { //侧边
            var Sidebar = document.createElement("div");
            Sidebar.id = "white-float-button";
            $("#white-box-body").append(Sidebar);
        },
        setSidebarDefaultWidth: () => {
            let deviceWindowWidth = window.innerWidth;
            if (deviceWindowWidth >= 600 && deviceWindowWidth <= 800) {
                ui.bodyWidth = "50vw";
            } else if (deviceWindowWidth >= 800 && deviceWindowWidth <= 1000) {
                ui.bodyWidth = "40vw";
            } else if (deviceWindowWidth >= 1000 && deviceWindowWidth <= 1200) {
                ui.bodyWidth = "30vw";
            } else if (deviceWindowWidth >= 1200) {
                ui.bodyWidth = "20vw";
            }
            $("#white-box-main").css("width", ui.bodyWidth);
        },
        setBoxBody: function setBoxBody() {
            var BoxBody = document.createElement("div");
            BoxBody.id = "white-box-body";
            BoxBody.innerHTML = `<div id="white-box-main"></div>`;
            document.body.appendChild(BoxBody);

        },
        setLinkLayout: function setLinkLayout() {
            var linkLayout = document.createElement("div");
            linkLayout.className = "home_fixed";
            //document.body.appendChild(linkLayout);//插入百度网盘链接布局
            linkLayout.style = "display:inherit;";
            $("#white-box-main").append(linkLayout);
        },
        setLinkLayoutAddHref: function setLinkLayoutAddHref(surl, pwd) {
            let settingenable = GM_getValue("Enable");
            let keyenable = GM_getValue("KeyEnable");
            let surl_name = GM_getValue("surlname");
            let pwd_name = GM_getValue("pwdname");
            let key_name = GM_getValue("keyname");
            let key = GM_getValue("key");
            let web_url = GM_getValue("urlname");
            let only_open = GM_getValue("BaiDuLinkOnlyOpen");

            var url_div = document.createElement("div");
            url_div.className = "white-link-div";
            url_div.innerHTML = `<div class="white-link-img"></div><div class="white-link-url"></div>`

            var labelA = document.createElement("a");
            var bdpan_icon = document.createElement("img");
            bdpan_icon.src = icon_src.bdpan();
            bdpan_icon.className = "white-bdlink-icon";
            var list = {}; //表单数据
            list[surl_name] = surl;
            list[pwd_name] = pwd;
            if (keyenable) {
                list[key_name] = key;
            }

            var displayHref = surl + "提取码：" + pwd;
            labelA.href = "javascript:;";
            if(only_open){
                labelA.onclick = function (e) {
                    e.target.setAttribute("class", "white-link-isclick");
                    if(pwd){
                        GM_setClipboard(pwd);
                    }
                    window.open("https://pan.baidu.com/s/"+displayHref);
                    GM_log("open ==> " + displayHref);
                }
            }else if (settingenable) {
                labelA.onclick = function post(e) {
                    e.target.setAttribute("class", "white-link-isclick");
                    var temp = document.createElement("form");
                    temp.action = web_url; //解析网址
                    temp.method = "post";
                    temp.style.display = "none";
                    temp.target = "_blank";
                    for (var x in list) {
                        var opt = document.createElement("textarea");
                        opt.name = x;
                        opt.value = list[x]; // alert(opt.name)
                        temp.appendChild(opt);
                    }
                    document.body.appendChild(temp);
                    temp.submit();
                    return temp;
                }
            } else {
                labelA.onclick = function (e) {
                    e.target.setAttribute("class", "white-link-isclick");
                    GM_setClipboard("https://pan.baidu.com/s/" + displayHref);
                    GM_log("copy ==> " + displayHref);
                    VtMessage_show.success("复制成功~");
                }
            }
            labelA.innerHTML = displayHref;
            // $(".home_fixed").append(labelA);
            // labelA.append(bdpan_icon)
            $(".home_fixed").append(url_div);
            $(url_div).find(".white-link-img").append(bdpan_icon);
            $(url_div).find(".white-link-url").append(labelA);
        },
        setLanzouLinkLayoutAddHref: function (url, skey) {
            var url_div = document.createElement("div");
            url_div.className = "white-link-div";
            url_div.innerHTML = `<div class="white-link-img"></div><div class="white-link-url"></div>`

            var url_link = document.createElement("a");
            var url_link_str = "";
            var img_lanzou_icon = document.createElement("img");
            img_lanzou_icon.src = icon_src.lanzoupan();
            img_lanzou_icon.className = "white-lanzou-icon";

            url_link.href = "javascript:;";
            url_link.onclick = function (e) {
                e.target.setAttribute("class", "white-link-isclick");
                let enable_lanzou_real_link = GM_getValue("LanZouRealLinkEnable");
                let only_open = GM_getValue("LanZouLinkOnlyOpen");
                if(only_open){
                    // 仅打开
                    if(skey){
                        GM_setClipboard(skey);
                    }
                    window.open(GM_rexp.lanzou + url);

                }else if (enable_lanzou_real_link) {
                    // 开启蓝奏直链解析
                    // LanZouUrlParsing(url, skey)
                    LanzouLinkParse(url, skey);
                } else {
                    // 复制到剪贴板
                    GM_setClipboard(GM_rexp.lanzou + url+"密码:"+skey);
                }


            }
            url_link_str = GM_rexp.lanzou.replace(/http(s|):\/\/www./g, "") + url;
            if (skey) {
                url_link_str = url_link_str + " 密码:" + skey;
            }
            url_link.innerHTML = url_link_str;
            $(".home_fixed").append(url_div);
            $(url_div).find(".white-link-img").append(img_lanzou_icon);
            $(url_div).find(".white-link-url").append(url_link);


        },
        setCloseBotton: function setCloseBotton() {
            var Button = document.createElement("div");
            Button.className = "bottom_fixed";
            Button.style = "display:inherit;text-align:center";
            Button.innerHTML = `
                          <button type="button" class="guanbi">关闭</button>
                          <button type="button" class="white-open-set">设置</button>
           `;
            //document.body.appendChild(Button);//在百度网盘链接布局后面插入关闭按钮
            $("#white-box-main").append(Button);
            $(".white-open-set").click(function () {
                $(".white-setting-body").show();
            })
        },
        setSidebar_Event: function setSidebar_Event() {
            $("#white-float-button").click(()=>{
                $("#white-float-button").hide();
                $("#white-box-main").show();
                $("#white-box-body").css("right",ui.bodyWidth);
            })
        },
        setCloseBotton_Event: function setCloseBotton_Event() {
            $(".guanbi").click(()=>{
               // $("#white-box-main").hide();
               $("#white-box-body").css("right", "0px");
                setTimeout(()=>{
                    $("#white-float-button").show()
                },450);
               
           }) //关闭按钮点击事件
            // $(".guanbi").bind("click", function () {
            //     // $("#white-box-main").hide();
            //     $("#white-box-body").css("width", "0px");
            //     $("#white-float-button").show();
            // }) //关闭按钮点击事件
        },
        setSettingBody: function () { //配置界面
            let settingbody = document.createElement("div");
            let location_url = GM_getValue("urlname");
            let location_surl = GM_getValue("surlname");
            let location_pwd = GM_getValue("pwdname");
            let location_key_name = GM_getValue("keyname");
            let location_key = GM_getValue("key");
            let url_name = "";
            let surl_name = "";
            let pwd_name = "";
            let key_name = "";
            let key = "";
            if (location_url != null) {
                url_name = location_url;
            }
            if (location_surl != null) {
                surl_name = location_surl;
            }
            if (location_pwd != null) {
                pwd_name = location_pwd;
            }
            if (location_key_name != null) {
                key_name = location_key_name;
            }
            if (location_key != null) {
                key = location_key;
            }
            settingbody.className = "white-setting-body";
            settingbody.innerHTML = `
            <div class="bd-setting-main">
                <details class="white-link-setting-menu">
                    <summary>百度网盘</summary>
                    <div class="bd-setting">
                        <label>配置网址</label>
                        <input type="text" class="bd-link-url" value="` + url_name + `">
                    </div>
                    <div class="bd-setting">
                        <label>网盘链接-键</label>
                        <input type="text" class="bd-link-surl" value="` + surl_name + `">
                    </div>
                    <div class="bd-setting">
                        <label>网盘密码-键</label>
                        <input type="text" class="bd-link-pwd" value="` + pwd_name + `">
                    </div>
                    <div class="bd-setting">
                        <label>密钥-键</label>
                        <input type="text" class="bd-link-key-name" value="` + key_name + `">
                    </div>
                    <div class="bd-setting">
                        <label>密钥-值</label>
                        <input type="text" class="bd-link-key" value="` + key + `">
                    </div>
                    <div class="bd-setting">
                        <input type="checkbox" class="bd-key-enable">
                        <label>启用密钥</label>
                    </div>
                    <div class="bd-setting">
                        <input type="checkbox" class="bd-only-copy">
                        <label>启用配置</label>
                    </div>
                    <div class="bd-setting">
                        <input type="checkbox" class="bd-only-open">
                        <label>仅打开</label>
                    </div>
                </details>
                <details class="white-link-setting-menu" open>
                    <summary>蓝奏云</summary>
                    <div class="bd-setting">
                        <input type="checkbox" class="bd-link-sure-lanzou">
                        <label>开启蓝奏直链获取</label>
                    </div>
                    <div class="bd-setting">
                        <input type="checkbox" class="bd-link-lanzou-only-open">
                        <label>仅打开</label>
                    </div>
                </details>
            </div>
            <div class="lbl-close">
                <svg t="1623995603360" class="icon lbl-close-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2400" width="32" height="32">
                    <path d="M810.666667 273.493333L750.506667 213.333333 512 451.84 273.493333 213.333333 213.333333 273.493333 451.84 512 213.333333 750.506667 273.493333 810.666667 512 572.16 750.506667 810.666667 810.666667 750.506667 572.16 512z" p-id="2401">
                    </path>
                </svg>
            </div>
            `;
            document.body.appendChild(settingbody);

            if (GM_getValue("KeyEnable") == 1) {
                document.getElementsByClassName("bd-key-enable")[0].checked = true;
            }
            if (GM_getValue("Enable") == 1) {
                document.getElementsByClassName("bd-only-copy")[0].checked = true;
            }
            if (GM_getValue("LanZouRealLinkEnable") == 1) {
                document.getElementsByClassName("bd-link-sure-lanzou")[0].checked = true;
            }
            if (GM_getValue("BaiDuLinkOnlyOpen") == 1) {
                document.getElementsByClassName("bd-only-open")[0].checked = true;
            }
            if (GM_getValue("LanZouLinkOnlyOpen") == 1) {
                document.getElementsByClassName("bd-link-lanzou-only-open")[0].checked = true;
            }
        },
        setSettingBodyEvent: function () { //配置界面点击事件
            $(".lbl-close").click(function () {
                $(".white-setting-body").hide();
            })
            $(".bd-link-url").bind("input propertychange", function () {
                GM_setValue("urlname", $(".bd-link-url").val());
            })
            $(".bd-link-surl").bind("input propertychange", function () {
                GM_setValue("surlname", $(".bd-link-surl").val());
            })
            $(".bd-link-pwd").bind("input propertychange", function () {
                GM_setValue("pwdname", $(".bd-link-pwd").val());
            })
            $(".bd-link-key-name").bind("input propertychange", function () {
                GM_setValue("keyname", $(".bd-link-key-name").val());
            })
            $(".bd-link-key").bind("input propertychange", function () {
                GM_setValue("key", $(".bd-link-key").val());
            })
            $(".bd-key-enable").on("change", function () {
                if (document.getElementsByClassName("bd-key-enable")[0].checked == true) {
                    GM_setValue("KeyEnable", 1);
                } else {
                    GM_setValue("KeyEnable", 0);
                }
            })
            $(".bd-only-copy").on("change", function () {
                if (document.getElementsByClassName("bd-only-copy")[0].checked == true) {
                    GM_setValue("Enable", 1);
                } else {
                    GM_setValue("Enable", 0);
                }

            })
            $(".bd-link-sure-lanzou").on("change", function () {
                if (document.getElementsByClassName("bd-link-sure-lanzou")[0].checked == true) {
                    GM_setValue("LanZouRealLinkEnable", 1);
                } else {
                    GM_setValue("LanZouRealLinkEnable", 0);
                }

            })
            $(".bd-only-open").on("change",()=>{
                if (document.getElementsByClassName("bd-only-open")[0].checked == true) {
                    GM_setValue("BaiDuLinkOnlyOpen", 1);
                } else {
                    GM_setValue("BaiDuLinkOnlyOpen", 0);
                }
            })
            $(".bd-link-lanzou-only-open").on("change",()=>{
                if (document.getElementsByClassName("bd-link-lanzou-only-open")[0].checked == true) {
                    GM_setValue("LanZouLinkOnlyOpen", 1);
                } else {
                    GM_setValue("LanZouLinkOnlyOpen", 0);
                }
            })
        }
    }
    const icon_src = {
        bdpan: function () {
            let this_src = `data:image/ico;base64,AAABAAEAICAAAAEAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAgBAAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAAAAAADT09MO4+PjdO3t7bj09PTY9/f38Pj4+PL5+fjyy8D48lkx9/JqRvfya0j38mFD+fJzTOry8Ygq8vmQFPL4iyLy+Ioh8vh6B/L4zqTy+Pn58vj4+PL39/fw9PT02O/v77ji4uJ30dHRDgAAAAAAAAAAAAAAAAAAAAAAAAAA19fXS/b29ur////////////////////////////////Rxf//VSz//2hD//9qRf//Xz///3JJ9P/7iiP//5IL//+MGv//ixn//3oA///Vp//////////////////////////////////29vbq1tbWSwAAAAAAAAAAAAAAANDQ0ET+/v7///////////////////////////////////////z7///18///9vT///b0///19P//9vX+//748v//+PH///jx///48f//9/H///z6///////////////////////////////////////+/v7/09PTRAAAAADNzc0L+vr6+P/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////5+fn4y8rLDOLi4nX////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////j4+Ny8PDwxP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v78L19fXe////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9fX13/j4+PL/////////////////////////////////++3//+qm///ih///4Yn//+ux/////////////////////////////////////////////+Wv///Uf///0Hj//9uZ///25P/////////////////////////////////4+Pjy+Pj49P///////////////////////////+uj///QLf//xg7//8ML///AB///vwf//skz///wxf////////////////////////DL//+8LP//qAD//6MA//+gAP//ngD//6cH///Uhf////////////////////////////j4+PT4+Pjy///////////////////////roP//yAr//80k///JGv//xhn//8MT///DF//+vg3//roF///rtP/////////////xzf/+sgD//6wA//+tAP//qAD//6UA//+jAP//pAD//5QA///QdP//////////////////////+Pj48vj4+PL/////////////////99r//88g///PLf//zB///99y///tt///6qz//9JM//7AE//+vxn//rcA///psP///////+u5//6jAP//pAD//74z///gnf//46v//8pd//+kAP//pAD//5cA///qxP/////////////////4+Pjy+Pj48v/////////////////lg///zRb//80g///igf///////////////////////85H//6/Ff/+vRT//rUA///orP///////9+U///Rcv///vv//////////////////9B1//+fAP//lgD//8FQ//////////////////j4+PL4+Pjy/////////////////91d///OHf//0jj///34////////////////////////7sT//70C///OE///zQD//8QA///zi////////////////////////////////////////60T//+ZAP//sSL/////////////////+Pj48vj4+PL/////////////////3Fj//84b///WR///////////////////////////////sf//ygD/6LE9/9CgaP/OlVL/45oX///vg/////X/////////////////////////////tB7//5gA//+vG//////////////////4+Pjy+Pj48v/////////////////hb///zhv//80g///wvP//////////////////////5M6b/5Jxqv9tWf//YEv//11H//9jQfj/gk+k/9bDzP///////////////////////+i6//+hAP//mAD//7k4//////////////////j4+PL4+Pjy//////////////////C3///MFP//0C3//9Ay///vuP///Pv////Y/9bG0/9oVv7/YFb//2ZR//9dQP//Wjr//14///9VNP//TyT6/8Kn3P///9H///z4///lsf//rRP//6QB//+UAP//2pX/////////////////+Pj48vj4+PL//////////////////////95j///KEf//zir//8oh///eJ//sw1D/b2Dp/25i//9oVf//gm///62e//+unf//gWj+/1w2/v9gPf//TiTt/9ycSv//yRH//6UA//+nAP//mAD//7Uq///////////////////////4+Pjy+Pj48v///////////////////////fX//9pY///IDf//yQ7//9MA/6aOtv9mZv//bFv//5eK///49v/////////////9/P//m4X9/1sz/v9QNP//hVPF//+yAP//pQD//5oA//+0Mf//+ev///////////////////////j4+PL4+Pjy/////////////////////////////////+qj///fT//3y1P/g3z9/29p//+Ac///////////////////////////////////e1z//1k0//9fO///6KNF///JN///15D/////////////////////////////////+Pj48vj4+PL//////////////////////////////////////////+Hf//9zbv//Z17//6Gd//////////////////////////////////+klf//TyX//04o///Jv//////////////////////////////////////////////4+Pjy+Pj48v//////////////////////////////////////////8fDt/3919f9UUf//wLTY/////////////////////////////////8Wtz/8/Hf//WC/6/+LZ4/////////////////////////////////////////////j4+PL4+Pjy/////////////////////////////////////////////+T/6chj/8+ua///0yz///zq/////////////////////////////74S/8uFSv/ekzT///7N////////////////////////////////////////////+Pj48vj4+PL/////////////////////////////////////////////////8W3//+IA///TIf//11H///fe//////////////jl//7LSv//sgD//7cA///RKf/////////////////////////////////////////////////4+Pjy+Pj49P/////////////////////////////////////////////////77P//1jb//9Mo///OJf//0DP//9tr///Yav/+xCv//rcG//6zA///rQD///PX//////////////////////////////////////////////////j4+PT4+Pjy///////////////////////////////////////////////////////21P//1jT//84Y///MIf//xRH//8AL//6+D//+tQD//rYG///qtv//////////////////////////////////////////////////////+Pj48vX19d/////////////////////////////////////////////////////////////77P//5Hz//9VA///OKP//ySH//8gs///UYP//9tr////////////////////////////////////////////////////////////19fXe7u7uwv///////////////////////////////////////////////////////////////////////fT///bU///00f//++7//////////////////////////////////////////////////////////////////////+/v78Tk5ORy////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4eHheM3NzQz5+fn4//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////n5+fjOzc4MAAAAANHR0UT+/v7////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v7/0tLSRAAAAAAAAAAAAAAAANfX10v29vbq////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9vb26tbW1ksAAAAAAAAAAAAAAAAAAAAAAAAAANHQ0Q7j4+N07u7uuPT09Nj39/fw+Pj48vj4+PL4+Pjy+Pj48vj4+PL4+Pjy+Pj48vj4+PL4+Pjy+Pj48vj4+PL4+Pjy+Pj48vj4+PL4+Pjy+Pj48vf39/D09PTY7u7uuOPj43HS0tIOAAAAAAAAAAAAAAAA4AAAB8AAAAOAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAABwAAAA+AAAAc=`;
            return this_src;
        },
        lanzoupan: function () {
            let this_src = `data:image/jpeg;base64,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`;
            return this_src;
        }

    }
    const GM_rexp = {
        bd_link: /pan\.baidu\.com\/s\/[0-9a-zA-Z-_]*(.+)(\s+|)(提取码|密码)(：|:|)(\s+|)[0-9a-zA-Z]{1,4}/g, //百度网盘链接
        bd_key: "", //百度网盘链接参数
        bd_pwd: /(提取码|密码).*/g, //百度网盘链接密码
        bd_pwd_number: /[0-9a-zA-Z]{1,4}/g, //百度网盘链接提取密码

        lanzou: "https://www.lanzoux.com/", //蓝奏可用链接
        lanzou_tp: "https://www.lanzoux.com/tp/", //蓝奏可用直接请求网站(单文件)
        lanzou_link: /lanzou(s|i|x)\.com\/([a-zA-Z0-9_\-]{5,22})\b([\s\n]*密码(:|：|)[a-zA-Z0-9]{2,6}|)/gi, //蓝奏云链接,官方设定密码长度2-6位
        lanzou_key: /[a-zA-Z0-9_\-]{5,22}\b/, //蓝奏云链接链接参数
        lanzou_pwd: /密码.*/g, //蓝奏云链接密码
        lanzou_pwd_number: /[0-9a-zA-Z]{2,6}/g, //蓝奏云链接提取密码
        laznou_sign: /\'sign\':\'(.*?)\'/, //蓝奏设置了密码的单文件请求需要的sign值;
        lanzou_filesize: /<span class=\"mtt\">\((.*)\)<\/span>/, //蓝奏文件大小
        laznou_download_url: /domianload[\s]*=[\s]*\'(.*?)\';/, //蓝奏直链前面网址
        lanzou_download_url_param: /downloads[\s]*=[\s]*'(.*?)';/, //蓝奏直链后面参数
        lanzou_download_fileName: /<title>(.*)<\/title>/, //蓝奏文件名
        lanzou_nofile: /div>来晚啦...文件取消分享了<\/div>/g //蓝奏文件取消分享
    }


    const VtMessage_show = {
        //信息框提示
        panel: function (content_str, download_url) {
            //显示获取到的链接提示框panel
            VtMessage.panel({
                content: content_str,
                offset: 'vt-center-center mo',
                title: '蓝奏云单文件直链',
                footer: true,
                style: {},
                mask: true,
                confirm: function (cb) {
                    var download_form = document.createElement('form');
                    download_form.style = "display:none;";
                    download_form.method = "post";
                    download_form.action = download_url;
                    $('body').append(download_form);
                    download_form.submit();
                    download_form.remove();
                    cb();
                },
                confirm_text: '下载',
            });
        },
        panel_more:function(content_str,setoffset){
            //多文件
            setoffset  = 'vt-center-center mo '+setoffset;
            VtMessage.panel({
                content: content_str,
                offset: setoffset,
                title: '蓝奏云多文件直链',
                footer: true,
                style: {},
                mask: true
            });
        },
        info: function (content_str, show_time) {
            content_str = content_str ? content_str : '信息';
            show_time = show_time ? show_time : 1500;
            VtMessage.info({
                content: content_str,
                offset: 'vt-bottom-center',
                duration: show_time,
                style: {
                    bottom: "15%",
                    "text-align-last": "center",
                }
            })
        },
        success: function (content_str, show_time) {
            content_str = content_str ? content_str : '成功';
            show_time = show_time ? show_time : 2500;
            VtMessage.success({
                content: content_str,
                offset: 'vt-bottom-center',
                duration: show_time,
                style: {
                    bottom: "15%",
                    "text-align-last": "center",
                }
            });
        },
        error: function (content_str, show_time) {
            content_str = content_str ? content_str : '错误';
            show_time = show_time ? show_time : 2500;
            VtMessage.error({
                content: content_str,
                offset: 'vt-bottom-center',
                duration: show_time,
                style: {
                    bottom: "15%",
                    "text-align-last": "center",
                }
            });
        },

    }

    function loadCss(filename, filetype) {
        if (filetype == "js") {
            var fileref = document.createElement('script'); //创建标签
            fileref.setAttribute("type", "text/javascript"); //定义属性type的值为text/javascript
            fileref.setAttribute("src", filename); //文件的地址
        } else if (filetype == "css") {
            var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", filename);
        }
        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
    }

    function Dictionary() {
        this.items = {};
        //检查是否有某一个键
        this.has = function (key) {
            return this.items.hasOwnProperty(key);
        }
        //为字典添加某一个值
        this.set = function (key, val) {
            this.items[key] = val;
        }
        //删除某一个键
        this.delete = function (key) {
            if (this.has(key)) {
                delete this.items[key];
                return true;
            }
            return false;
        }
        //查找某一特定项
        this.get = function (key) {
            return this.has(key) ? this.items[key] : undefined;
        }
        //返回字典中的所有值
        this.values = function () {
            var res = [];
            for (var prop in this.items) {
                if (this.has(prop)) {
                    res.push(this.items[prop]);
                }
            }
            return res;
        }
        //清空字典
        this.clear = function () {
            this.items = {};
        }
        //获取字典的长度
        this.size = function () {
            return Object.keys(this.items).length;
        }
        //获取字典所有的键
        this.keys = function () {
            return Object.keys(this.items);
        }
        //返回字典本身
        this.getItems = function () {
            return this.items;
        }
    }

    function LinkDictionary(LinkArray, Rexp_key, Rexp_pwd, Rexp_pwd_number) {
        //参数 数组 密码存在正则 密码提取正则
        //链接字典，用于去重
        var link_dict = new Dictionary();
        LinkArray.forEach((item) => {
            let pwd_match = item.match(Rexp_pwd);
            if (pwd_match) {
                //匹配到有密码
                let lnk_key = "";
                if (Rexp_key != "") {
                    //如果传入key 正则，就使用
                    lnk_key = item.match(Rexp_key)[0].trim();
                } else {
                    lnk_key = item.replace(pwd_match[0], "").trim(); //链接,源字符串去除密码就是链接了
                }
                let lnk_value = pwd_match[0].match(Rexp_pwd_number)[0]; //密码
                link_dict.set(lnk_key, lnk_value);
            } else {
                //没有匹配到密码
                if (link_dict.has(item)) {
                    //存在该键,不做处理
                    // if (!lanzoudictionary.get(item)) {
                    //     lanzoudictionary.set(item, "")
                    // }
                } else {
                    //不存在该键
                    link_dict.set(item, "");
                }
            }
        });
        return link_dict;
    }

    function getWebsiteBaiduLink() {
        //获取当前页面百度网盘链接
        let bd_link = document.body.outerText.match(GM_rexp.bd_link);
        if (bd_link) {
            let bd_link_set = new Set();
            bd_link.forEach((item) => bd_link_set.add(item.replace(/\s+/g, "").replace("pan.baidu.com/s/", "")));
            let new_bd_link = Array.from(bd_link_set);
            return new_bd_link;
        } else {
            console.log("None BaiDuLink match")
            return null;
        }
    }

    function getWebsiteLanzouLink() {
        //获取当前页面蓝奏云链接
        let pan_lanzou_link = document.body.outerText.match(GM_rexp.lanzou_link);
        if (pan_lanzou_link) {
            let lanzou_link_set = new Set();
            pan_lanzou_link.forEach((item) => lanzou_link_set.add(item.replace(/\s+/g, "").replace(/lanzou(s|i|x).com\//, "")));
            let new_lanzou_link = Array.from(lanzou_link_set);
            console.log("match lanzou", new_lanzou_link);
            return new_lanzou_link;
        } else {
            console.log("None LanZouLink match");
            return null;
        }
    }
    var show_panel_more_str= {
        len:0,
        issuccess:0,
        isfail:0,
        content:"",
    };

    function GM_Request_Post_MoreFile(r,skey){
        //蓝奏post多文件获取
        console.log(r);
        let fid = r.match(/\'fid\':(.+?),/)[1].replaceAll("'","");
        let uid = r.match(/\'uid\':(.+?),/)[1].replaceAll("'","");
        let pgs = 1;
        let t_name = r.match(/\'t\':(.+?),/)[1];;
        let t_rexp = new RegExp(t_name+"[\\s]*=[\\s]*('|\")(.+?)('|\");");
        let t =  r.match(t_rexp)[2];
        let k_name = r.match(/\'k\':(.+?),/)[1];
        let k_rexp = new RegExp(k_name+"[\\s]*=[\\s]*('|\")(.+?)('|\");");
        let k = r.match(k_rexp)[2];
        let url_post_data = "lx=2&fid="+fid+"&uid="+uid+"&pg="+pgs+"&rep=0&t="+t+"&k="+k+"&up=1&ls=1&pwd="+skey;
        console.log(url_post_data);
        GM_xmlhttpRequest({
            url: 'https://www.lanzoux.com/filemoreajax.php',
            timeout: 5000,
            method: "POST",
            responseType: "json",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "user-agent": "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36 Edg/91.0.864.59",
                "referer": window.location.origin
            },
            data: url_post_data,
            onload:function(resp){
                console.log(resp);
                let zt = resp.response.zt;
                let info = resp.response.info;
                if(zt==4){
                    VtMessage_show.error(info);
                }else if(zt==1){
                    VtMessage_show.success("获取文件夹成功，解析文件直链中...");
                    var folder = resp.response.text;
                    var folder_length = folder.length;
                    //初始显示panel内容为空，文件数量为获取的长度，成功获取数量为0，失败获取数量为0，内容为空
                    show_panel_more_str.content = "";
                    show_panel_more_str.len = folder_length;
                    show_panel_more_str.issuccess = 0;
                    show_panel_more_str.isfail = 0;
                    show_panel_more_str.content = "";
                    $.each(folder, function(index, value){
						let folder_file_size = value.size;
                        let folder_file_name = value.name_all;
                        let folder_file_url = value.id;
                        GM_Request_Get_Folder_Success(folder_file_url,index,folder_file_name,folder_file_size,folder_length);
					});
                }else{
                    VtMessage_show.error("未知错误");
                }
            },
            onerror:function(){
                VtMessage_show.error("网络异常");
            }
        })
    }
    function toCheckMoreFilePanel(){
        //检查是否显示panel
        let current_file_issuccess = show_panel_more_str.issuccess;
        let current_file_isfail = show_panel_more_str.isfail;
        let current_file_len = show_panel_more_str.len;
        if(current_file_issuccess + current_file_isfail == current_file_len){
            if(current_file_len==1){
                VtMessage_show.panel_more(show_panel_more_str.content,"white-bd-panel-more-one");
            }else if(current_file_len==2){
                VtMessage_show.panel_more(show_panel_more_str.content,"white-bd-panel-more-two");
            }else{
                VtMessage_show.panel_more(show_panel_more_str.content,"white-bd-panel-more");
            }
            
        }else{
            return false
        }
    }
    function toShowMoreFilePanel(state,content){
        if(state){
            //获取成功
            show_panel_more_str.issuccess +=1;
        }else{
            show_panel_more_str.isfail += 1;
        }
        show_panel_more_str.content += content;
        toCheckMoreFilePanel()

       
    }
    function GM_Request_Get_Folder_Success(url_param,index,file_name,file_size,folder_length){
        //蓝奏 get页面成功的请求,用于返回直链
        let lanzou_tp = GM_rexp.lanzou_tp;
        let ret_content = "";
        GM_xmlhttpRequest({
            url: lanzou_tp + url_param,
            timeout: 5000,
            method: "GET",
            headers: {
                'Accept': '*/*',
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36 Edg/91.0.864.59',
                "referer": window.location.origin
            },
            onload: function (r) {
                console.log(r.responseText);
                let sure_url = r.responseText.match(GM_rexp.laznou_download_url); //直链前面的参数
                let sure_urls = r.responseText.match(GM_rexp.lanzou_download_url_param); //直链后面的参数
                if (sure_url != null && sure_urls != null) {
                    let download_url = sure_url[1] + sure_urls[1];
                    ret_content = '<a href="' + download_url + '" style="color: #233df8;">' + file_name +"(" +file_size + ')</a>';
                    toShowMoreFilePanel(true,ret_content);
                } else {
                    ret_content = '<a href="javascript:;" style="color: #233df8;">' + file_name + "(解析失败)" + '</a>';
                    toShowMoreFilePanel(false,ret_content);
                }
                
            },
            onerror: function () {
                ret_content = '<a href="javascript:;" style="color: #233df8;">' + file_name + "(解析失败,网络异常)" + '</a>';
                toShowMoreFilePanel(false,ret_content);
            }
        })
    }
    function GM_Request_Get_Success(url_param,skey,successFc){
        //蓝奏 get页面成功的请求
        let lanzou_tp = GM_rexp.lanzou_tp;
        GM_xmlhttpRequest({
            url: lanzou_tp + url_param,
            timeout: 5000,
            method: "GET",
            headers: {
                'Accept': '*/*',
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36 Edg/91.0.864.59',
                "referer": window.location.origin
            },
            onload: function (r) {
                if (r.status == 200) {
                    successFc(r, skey)
                } else {
                    VtMessage_show.error("请求失败，请重试");
                }

            },
            onerror: function () {
                VtMessage_show.error("网络异常");
            }
        })
    }


    function GM_Request_Get(url_param, skey, successFc) {
        //蓝奏 get页面请求
        GM_xmlhttpRequest({
            url: GM_rexp.lanzou + url_param,
            timeout: 5000,
            method: "GET",
            headers: {
                'Accept': '*/*',
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36 Edg/91.0.864.59',
                "referer": window.location.origin
            },
            onload: function (r) {
                if (r.status == 200) {
                    if(r.responseText.match(GM_rexp.lanzou_nofile)){
                        VtMessage_show.error('来晚啦...文件取消分享了');
                    }else if(r.responseText.match(/<span id=\"filemore\" onclick=\"more\(\);\">/g)){
                        try{
                            GM_Request_Post_MoreFile(r.responseText,skey)
                        }catch(err){
                            VtMessage_show.error("解析多文件失败")
                        }
                        
                    } else {
                        GM_Request_Get_Success(url_param,skey,successFc);
                    }

                } else {
                    VtMessage_show.error("请求失败，请重试");
                }

            },
            onerror: function () {
                VtMessage_show.error("网络异常");
            }
        })
    }

    function GM_Request_Post(url_post_data, file_size) {
        //蓝奏，post表单请求获取直链
        GM_xmlhttpRequest({
            url: "https://www.lanzoux.com/ajaxm.php",
            timeout: 5000,
            method: "POST",
            responseType: "json",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "user-agent": "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36 Edg/91.0.864.59",
                "referer": window.location.origin
            },
            data: url_post_data,
            onload: function (r) {
                if (r.status == 200) {
                    let request_r_json = r.response;
                    if (request_r_json.zt == 1) {
                        let download_url = request_r_json.dom + "/file/" + request_r_json.url;
                        let download_fileName = request_r_json.inf;
                        let content_str = '<a href="' + download_url + '" style="color: #233df8;">' + download_fileName + file_size + "</a>";
                        VtMessage_show.panel(content_str, download_url);
                    } else {
                        VtMessage_show.error(request_r_json.inf);
                    }
                } else {
                    VtMessage_show.error("请求失败，请重试");
                }
            },
            onerror: function () {
                VtMessage_show.error('请求直链异常，请重试');
            }
        })
    }

    function GM_Lanzou_onlyFile_get(r, skey) {
        //单文件
        if (skey) {
            //有密码
            console.log("has pwd");
            let sure_form_sign = r.responseText.match(GM_rexp.laznou_sign);
            if (sure_form_sign == null) {
                //获取sign失败
                VtMessage_show.error("获取sign失败");

            } else {
                let url_post_data = "action=downprocess&sign=" + sure_form_sign[1] + "&p=" + skey;
                let download_file_size_match = r.responseText.match(GM_rexp.lanzou_filesize);
                let download_file_size = download_file_size_match ? "(" + download_file_size_match[1].trim() + ")" : "";
                GM_Request_Post(url_post_data, download_file_size);
            }
        } else {
            //无密码
            console.log("no pwd")
            let get_url_has_key = $(r.response).find("#sub"); // 获取该文件是否需要密码
            if (get_url_has_key.length == 0) {
                let sure_url = r.responseText.match(GM_rexp.laznou_download_url); //直链前面的参数
                let sure_urls = r.responseText.match(GM_rexp.lanzou_download_url_param); //直链后面的参数
                if (sure_url != null && sure_urls != null) {
                    let download_url = sure_url[1] + sure_urls[1];
                    let download_file_title = r.responseText.match(GM_rexp.lanzou_download_fileName)[1];
                    let download_file_size_match = r.responseText.match(GM_rexp.lanzou_filesize);
                    let download_file_size = download_file_size_match ? "(" + download_file_size_match[1].trim() + ")" : "";
                    let content_str = '<a href="' + download_url + '" style="color: #233df8;">' + download_file_title + download_file_size + '</a>';
                    VtMessage_show.panel(content_str, download_url);
                } else {
                    VtMessage_show.error('解析直链失败')
                }
            } else {
                VtMessage_show.error('请求失败，该文件需要密码', 3500);
            }


        }
    }

    function LanzouLinkParse(url, skey) {
        //蓝奏云单文件直链解析
        VtMessage_show.info('正在请求直链中...');
        GM_Request_Get(url, skey, GM_Lanzou_onlyFile_get)
    }



    function main_start() {
        let get_Website_BaiduLink = getWebsiteBaiduLink();
        let get_website_LanzouLink = getWebsiteLanzouLink();
        let get_flag = false;
        let bd_dict = null;
        let lanzou_dict = null;
        if (get_Website_BaiduLink != null) {
            get_flag = true;
            // BaiduLinkDictionary(get_Website_BaiduLink);
            // bd_dict = window.dictionary;
            bd_dict = LinkDictionary(get_Website_BaiduLink, GM_rexp.bd_key, GM_rexp.bd_pwd, GM_rexp.bd_pwd_number);

        }
        if (get_website_LanzouLink != null) {
            get_flag = true;
            // lanzou_dict = LanZouDictionary(get_website_LanzouLink);
            lanzou_dict = LinkDictionary(get_website_LanzouLink, GM_rexp.lanzou_key, GM_rexp.lanzou_pwd, GM_rexp.lanzou_pwd_number);

        }
        if (get_flag) {
            ui.setCSS();
            ui.setBoxBody();
            ui.setSidebar();
            ui.setSidebarDefaultWidth();
            ui.setSidebar_Event();
            ui.setLinkLayout();
            ui.setSettingBody();
            ui.setSettingBodyEvent();
            if (bd_dict != null) {
                for (let key in bd_dict.getItems()) {
                    console.log("white-bd: " + key + " ===>> " + bd_dict.get(key));
                    ui.setLinkLayoutAddHref(key, bd_dict.get(key));
                };
            }
            if (lanzou_dict != null) {
                console.log(lanzou_dict.getItems());
                for (let key in lanzou_dict.getItems()) {
                    console.log("white-lanzou: " + key + " ===>> " + lanzou_dict.get(key));
                    ui.setLanzouLinkLayoutAddHref(key, lanzou_dict.get(key));
                };
            }

            ui.setCloseBotton();
            ui.setCloseBotton_Event();
        }
    }

    function panDownload() { //获取使用panDownload源码的网站的解析链接
        let Pandownload_gethref_info = $(".alert.alert-primary").text();
        let Pandownload_getDown_url = Pandownload_gethref_info.match(/https:\/\/.*/g);
        if (Pandownload_gethref_info.match("下载链接") && Pandownload_getDown_url) {
            // var getSuccessLink_http = $("#http")[0].href;
            //var getSuccessLink_https = $("#https")[0].href;
            let getSuccessLink_https = Pandownload_getDown_url[0];
            let Pandownload_UA = Pandownload_gethref_info.match(/UA(:|：)(.*)/)[2];
            let red_bd_link = "";
            //var st_http = `<a id="Pandown_href_http" href="javascript:;" style="color: white; background-color: #cc4343; display: block; border-style: solid; border-radius: 10px;text-align: -webkit-center;">HTTP链接</a>`;
            let st_https = `<a id="Pandown_href_https" href="javascript:;" style="color: white; background-color: #cc4343; display: block; border-style: solid; border-radius: 10px;text-align: -webkit-center;">HTTPS链接</a>`;
            let Pandown_UA = `<a id="Pandown_UA" href="javascript:;" style="color: white; background-color: #6bb9e9; display: block; border-style: solid; border-radius: 10px;text-align: -webkit-center;">复制UA</a>`;
            GM_setValue("Pandown_UA", Pandownload_UA);
            // GM_setValue("Pandown_href_http",getSuccessLink_http);
            GM_setValue("Pandown_href_https", getSuccessLink_https);
            red_bd_link = Pandown_UA + st_https;

            if ($(document.body).width() > 400) {
                VtMessage.panel({
                    content: red_bd_link,
                    offset: 'vt-center-center mo',
                    title: 'IDM下载链接',
                    footer: true,
                    style: {
                        minWidth: 400
                    },
                    mask: true,
                });
            } else {
                VtMessage.panel({
                    content: red_bd_link,
                    offset: 'vt-center-center mo',
                    title: 'IDM下载链接',
                    footer: true,
                    style: {
                        minWidth: "80%"
                    },
                    mask: true,
                });

            }
        }

        $("a").click(function (event) {
            GM_log("click_id:" + event.target.id);
            var Pandown_a_id = event.target.id;
            if (Pandown_a_id.match(/Pandown_/g)) {
                GM_log("复制的url:" + GM_getValue(Pandown_a_id));
                GM_setClipboard(GM_getValue(Pandown_a_id));
                VtMessage.success({
                    content: '复制成功~',
                    offset: 'vt-bottom-center',
                    duration: 2500,
                    style: {
                        bottom: "15%",
                        "text-align-last": "center",
                    }
                });
            }
        })

    }

    function panDownWebsite() { //新的解析网站
        if (location.href.match(/pan.(ednovas.xyz|kdbaidu.com)\/\?download/g)) {
            loadCss("https://cdn.jsdelivr.net/gh/893177236/Monkey_script/Message.css", "css");
            try {
                panDownload();
            } catch (err) {
                GM_log("执行Pandown子网站出错：" + err);
            }
        }
        if (location.href == "https://pan.kdbaidu.com/" && $(".card-text").length == 1 && $(".card-text").text().match(/密钥错误/)) {
            loadCss("https://cdn.jsdelivr.net/gh/893177236/Monkey_script/Message.css", "css");
            //             GM_log("密钥出错，开始更新");
            //             VtMessage.error({
            //                 content: '密钥出错，开始更新',
            //                 offset: 'vt-bottom-center',
            //                 duration: 3500,
            //                 style:{
            //                     bottom:"15%",
            //                     "text-align-last":"center",
            //                 }
            //             });
            panDownUpdateKey();
            setTimeout(function () {
                VtMessage.success({
                    content: '当前key:' + GM_getValue("Pandown_Key"),
                    offset: 'vt-bottom-center',
                    duration: 0,
                    style: {
                        bottom: "15%",
                        "text-align-last": "center",
                    }
                });
            }, 3500);


        }
    }

    function panDownCheckUpdateTime() { //Pandown子网站的key更新时间
        let GM_myDate = new Date;
        let GM_year = GM_myDate.getFullYear(); //获取当前年
        let GM_mon = GM_myDate.getMonth() + 1; //获取当前月
        let GM_date = GM_myDate.getDate();
        let GM_alldate = GM_year.toString() + GM_mon.toString() + GM_date.toString();
        GM_alldate = parseInt(GM_alldate);
        GM_log("客户端当前时间：===>> ", GM_alldate);
        if (GM_getValue("Pandown_UpdateTime")) {
            GM_log("更新key的时间： ===>> ", GM_getValue("Pandown_UpdateTime"));
            if (parseInt(GM_getValue("Pandown_UpdateTime")) < GM_alldate) {
                GM_log("key今天没有更新，开始更新");
                GM_setValue("Pandown_UpdateTime", GM_alldate); //更新时间
                panDownUpdateKey(); //更新key
            } else {
                GM_log("key今天已更新");
            }
        } else {
            GM_log("第一次使用或误删除存储，开始设置时间");
            GM_setValue("Pandown_UpdateTime", GM_alldate); //更新时间
            panDownUpdateKey(); //更新key
        }
    }

    function panDownUpdateKey() { //Pandwon子网站更新key
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://pan.kdbaidu.com/",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            onload: function (r) {
                if (r.status == 200) {
                    GM_log("获取成功");
                    let Pandown_Key = r.responseText.match(/<div class="form-group my-4"><input type="text" class="form-control" name="pass" value="(.*)" /);
                    GM_log("key ===>> ", Pandown_Key[1]);
                    GM_setValue("Pandown_Key", Pandown_Key[1]);
                }
            },
            onerror: function () {
                GM_log("跨域请求失败");
            }
        });
    }
    try {
        $(document).ready(function () {
            // panDownCheckUpdateTime();
            main_start();
            // panDownWebsite();
        });
    } catch (err) {
        console.log("百度网盘链接识别出错：" + err)
    }

})();