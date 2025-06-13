// ==UserScript==
// @name         通用组件库
// @namespace    https://greasyfork.org/zh-CN/users/1296281
// @version      1.0.0
// @license      GPL-3.0
// @description  通用 UI 组件和工具函数库
// @author       ShineByPupil
// @match        *
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  class MessageBox extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
        <div class="message-box"></div>
        
        <style>
          :host {
            display: none;
          }
        
          .message-box {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #ffffff; /* 明亮的背景色 */
            color: #000000; /* 深色文本 */
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 100;
            transition: opacity 0.3s ease;
            opacity: 1;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
          }
        </style>
      `;

      this.message = this.shadowRoot.querySelector(".message-box");
    }

    show(message, duration = 2500) {
      this.message.textContent = message;
      this.style.display = "block"; // 显示消息

      // 设置一定时间后自动隐藏消息
      setTimeout(() => {
        this.style.display = "none";
      }, duration);
    }
  }

  if (!customElements.get("message-box")) {
    customElements.define("message-box", MessageBox);
  } else {
    console.error("message-box 组件已注册");
  }
})();
