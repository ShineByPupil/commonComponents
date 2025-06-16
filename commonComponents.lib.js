// ==UserScript==
// @name         通用组件库
// @namespace    https://greasyfork.org/zh-CN/users/1296281
// @version      1.1.0
// @license      GPL-3.0
// @description  通用 UI 组件和工具函数库
// @author       ShineByPupil
// @match        *
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const colors = {
    primary: "#4C6EF5",
    success: "#67c23a",
    info: "#909399",
    warning: "#e6a23c",
    danger: "#f56c6c",
  };
  const defaultColors = [];
  const lightColors = [];
  const darkColors = [];

  const mixColor = (color1, color2, percent) => {
    // 去掉井号并转换为 0～255 的整数
    const c1 = color1.replace(/^#/, "");
    const c2 = color2.replace(/^#/, "");
    const r1 = parseInt(c1.substr(0, 2), 16);
    const g1 = parseInt(c1.substr(2, 2), 16);
    const b1 = parseInt(c1.substr(4, 2), 16);
    const r2 = parseInt(c2.substr(0, 2), 16);
    const g2 = parseInt(c2.substr(2, 2), 16);
    const b2 = parseInt(c2.substr(4, 2), 16);

    // 百分比转 0～1
    const t = Math.min(Math.max(percent, 0), 100) / 100;

    // 插值计算
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    // 转回两位十六进制，不足两位补零
    const toHex = (x) => x.toString(16).padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  for (let key in colors) {
    const color = colors[key];
    defaultColors.push(`--${key}-color: ${color};`);

    for (let i = 1; i <= 9; i++) {
      const p = i * 10;

      lightColors.push(
        `--${key}-color-light-${i}: ${mixColor(color, "#ffffff", p)};`,
      );
      darkColors.push(
        `--${key}-color-light-${i}: ${mixColor(color, "#141414", p)};`,
      );
    }
  }

  const commonCssTemplate = document.createElement("template");
  commonCssTemplate.innerHTML = `
    <style>
      :host {
        font-family: Inter, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", 微软雅黑, Arial, sans-serif;
      }
      :host {
        ${defaultColors.join("\n")}
        ${lightColors.join("\n")}
        --primary-color-hover: var(--primary-color-linght);
        --border-color: #dcdfe6;
        --border-color-hover: #C0C4CC;
        --border-color-focus: var(--primary-color);
        --bg-color: #FFFFFF;
        --text-color: #333333;
        --overlay-bg: rgba(0, 0, 0, 0.5);
        --box-shadow: 0px 12px 32px 4px rgba(0, 0, 0, .04), 0px 8px 20px rgba(0, 0, 0, .08);
        --placeholder-color: #a8abb2;
      }
      :host-context(.dark),
      :host-context([data-theme="dark"]) {
        ${darkColors.join("\n")}
        --primary-color-hover: var(--primary-color-dark);
        --border-color: #4C4D4F;
        --border-color-hover: #6C6E72;
        --border-color-focus: var(--primary-color);
        --bg-color: #141414;
        --text-color: #CFD3DC;
        --placeholder-color: #8D9095;
      }
      
      button {
        color: inherit;
        cursor: pointer;
      }
    </style>
  `;

  class Input extends HTMLElement {
    input = null;

    constructor() {
      super();

      const htmlTemplate = document.createElement("template");
      htmlTemplate.innerHTML = `<input type="text" />`;

      const cssTemplate = document.createElement("template");
      cssTemplate.innerHTML = `
        <style>
          :host {
            display: inline-flex;
            height: 32px;
            vertical-align: top;
          }
          
          input {
            width: 100%;
            height: 100%;
            color: var(--text-color);
            outline: none;
            box-sizing: border-box;
            padding: 4px 11px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
            transition: all 0.3s;
            background-color: var(--bg-color);
          }
          
          input:hover {
            border-color: var(--border-color-hover);
          }
          input:focus {
            border-color: var(--border-color-focus);
            border-inline-end-width: 1px;
          }
          input::placeholder {
            color: var(--placeholder-color);
          }
        </style>
      `;

      this.attachShadow({ mode: "open" });
      this.shadowRoot.append(
        htmlTemplate.content,
        commonCssTemplate.content.cloneNode(true),
        cssTemplate.content,
      );
      this.input = this.shadowRoot.querySelector("input");
    }

    connectedCallback() {
      this.input.addEventListener("input", (e) => {
        e.stopPropagation();
        this.value = e.target.value;
        this.dispatchEvent(new CustomEvent("input", { detail: this.value }));
      });

      Object.values(this.attributes).forEach((attr) => {
        if (!/^on/.test(attr.name)) {
          this.input.setAttribute(attr.name, attr.value);
        }
      });

      const mo = new MutationObserver((mutationsList) => {
        for (const m of mutationsList) {
          if (m.type === "attributes") {
            const val = this.getAttribute(m.attributeName);
            if (val === null) {
              this.input.removeAttribute(m.attributeName);
            } else {
              this.input.setAttribute(m.attributeName, val);
            }
          }
        }
      });
      mo.observe(this, { attributes: true });
    }

    get value() {
      return this.input.value;
    }
    set value(val) {
      this.input.value = val;
    }
  }

  // todo
  class Option extends HTMLElement {
    constructor() {
      super();
    }
  }

  // todo
  class Select extends HTMLElement {
    constructor() {
      super();
    }
  }

  class Button extends HTMLElement {
    constructor() {
      super();

      const htmlTemplate = document.createElement("template");
      htmlTemplate.innerHTML = `
        <button>
          <slot></slot>
        </button>
      `;

      const cssTemplate = document.createElement("template");
      cssTemplate.innerHTML = `
        <style>
          :host {
            --bg-color: var(--bg-color);
            --bg-color-hover: var(--primary-color-light-9);
            --button-border-color: var(--border-color);
            --button-border-color-hover: var(--primary-color);
            --text-color-hover: var(--primary-color);
          }
          ${Object.keys(colors)
            .map((type) => {
              return `
              :host([type='${type}']) {
                --text-color: #FFFFFF;
                --text-color-hover: #FFFFFF;
                --bg-color: var(--${type}-color);
                --bg-color-hover: var(--${type}-color-light-3);
                --button-border-color: var(--${type}-color);
                --button-border-color-hover: var(--${type}-color-light-3);
              }
            `;
            })
            .join("\n")}
          :host {
            display: inline-flex;
            width: fit-content;
            height: 32px;
          }
        
          button {
            display: inline-flex;
            align-items: center;
            font-family: inherit;
            color: var(--text-color);
            padding: 8px 15px;
            background-color: var(--bg-color);
            border-radius: 5px;
            border: 1px solid var(--button-border-color);
            transition: all 0.3s;
            outline: none;
          }
          button:hover {
            color: var(--text-color-hover);
            background-color: var(--bg-color-hover);
            border-color: var(--button-border-color-hover);
          }
        </style>
      `;

      this.attachShadow({ mode: "open" });
      this.shadowRoot.append(
        htmlTemplate.content,
        commonCssTemplate.content.cloneNode(true),
        cssTemplate.content,
      );
    }
  }

  class Switch extends HTMLElement {
    // 事件来源类型: user | broadcast
    #currentChangeSource = "user";

    static get observedAttributes() {
      return ["checked", "disabled", "@change"];
    }

    constructor() {
      super();

      const htmlTemplate = document.createElement("template");
      htmlTemplate.innerHTML = `
        <div class="track">
          <div class="thumb"></div>
        </div>`;

      const cssTemplate = document.createElement("template");
      cssTemplate.innerHTML = `
        <style>
          :host {
            --bg-color: #ccc;
            --cursor: pointer;
          }
          :host {
            display: inline-block;
            aspect-ratio: 2/1;
            height: 20px;
          }
          :host([checked]) {
            --bg-color: ${colors.primary};
          }
          :host([checked]) .thumb {
            transform: translateX(calc(100% + 4px));
          }
          :host([disabled]) {
            --cursor: not-allowed;
          }
          .track {
            width: 100%;
            height: 100%;
            background: var(--bg-color);
            border-radius: 14px;
            position: relative;
            transition: background .3s;
            cursor: var(--cursor);
            outline: none;
          }
          .thumb {
            aspect-ratio: 1/1;
            height: calc(100% - 4px);
            background: #fff;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: transform .3s;
          }
        </style>
      `;

      this.attachShadow({ mode: "open" });
      this.shadowRoot.append(htmlTemplate.content, cssTemplate.content);
    }

    connectedCallback() {
      const track = this.shadowRoot.querySelector(".track");

      track.addEventListener("click", () => this.toggle());
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "checked" && oldValue !== newValue) {
        const oldChecked = oldValue !== null;
        const newChecked = newValue !== null;

        this.dispatchEvent(
          new CustomEvent("change", {
            detail: {
              value: newChecked,
              oldValue: oldChecked,
              source: this.#currentChangeSource,
            },
          }),
        );

        this.#currentChangeSource = "user";
      }
    }

    get checked() {
      return this.hasAttribute("checked");
    }
    set checked(val) {
      val ? this.setAttribute("checked", "") : this.removeAttribute("checked");
    }
    get disabled() {
      return this.hasAttribute("disabled");
    }
    set disabled(val) {
      val
        ? this.setAttribute("disabled", "")
        : this.removeAttribute("disabled");
    }

    toggle() {
      if (!this.disabled) this.checked = !this.checked;
    }

    // 静默更新方法（不触发事件）
    updateFromBroadcast(value) {
      this.#currentChangeSource = "broadcast";
      this.checked = value;
    }
  }

  class MessageBox extends HTMLElement {
    static #instance = null;

    constructor() {
      super();

      const htmlTemplate = document.createElement("template");
      htmlTemplate.innerHTML = `<div class="message-box"></div>`;

      const cssTemplate = document.createElement("template");
      cssTemplate.innerHTML = `
        <style>
          :host([type='primary']) {
            --text-color: var(--primary-color);
            --bg-color: var(--primary-color-light-9);
            --border-color: var(--primary-color-light-8);
          }
          :host([type='info']) {
            --text-color: var(--info-color);
            --bg-color: var(--info-color-light-9);
            --border-color: var(--info-color-light-8);
          }
          :host([type='success']) {
            --text-color: var(--success-color);
            --bg-color: var(--success-color-light-9);
            --border-color: var(--success-color-light-8);
          }
          :host([type='error']) {
            --text-color: var(--danger-color);
            --bg-color: var(--danger-color-light-9);
            --border-color: var(--danger-color-light-8);
          }
          
          .message-box {
            font-size: 14px;
            display: none;
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translate(-50%, 20px);
            opacity: 0;
            background-color: var(--bg-color);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 100;
            
          }
          .message-box.show {
            transform: translate(-50%, 0);
            opacity: 1;
            transition: transform 0.3s ease, opacity 0.3s ease;
          }
          .message-box.hide {
            transform: translate(-50%, -20px);
            opacity: 0;
            transition: transform 0.6s ease, opacity 0.6s ease;
          }
        
        </style>
      `;

      this.attachShadow({ mode: "open" });
      this.shadowRoot.append(
        htmlTemplate.content,
        commonCssTemplate.content.cloneNode(true),
        cssTemplate.content,
      );

      this.message = this.shadowRoot.querySelector(".message-box");
    }

    connectedCallback() {
      this.message.addEventListener("transitionend", (e) => {
        if (this.message.classList.contains("hide")) {
          this.message.style.display = "none";
          this.message.classList.remove("hide");
        }
      });
    }

    static get instance() {
      if (!MessageBox.#instance) {
        const el = document.createElement("mx-message-box");
        document.body.appendChild(el);
        MessageBox.#instance = el;
      }
      return MessageBox.#instance;
    }

    #show(message, type = "info", duration = 2500) {
      this.setAttribute("type", type);
      this.message.textContent = message; // 设置信息

      this.message.style.display = "block";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.message.classList.add("show");
        });
      });

      clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this.message.classList.remove("show");
        this.message.classList.add("hide");
      }, duration);
    }

    primary(message, duration) {
      this.#show(message, "primary", duration);
    }
    info(message, duration) {
      this.#show(message, "info", duration);
    }
    success(message, duration) {
      this.#show(message, "success", duration);
    }
    error(message, duration) {
      this.#show(message, "error", duration);
    }
  }

  class Dialog extends HTMLElement {
    visible = false;
    #confirmBtn = null;
    #cancelBtn = null;
    #closeBtn = null;

    static get observedAttributes() {
      return ["cancel-text", "confirm-text"];
    }

    constructor() {
      super();

      const htmlTemplate = document.createElement("template");
      htmlTemplate.innerHTML = `
        <main>
          <header>
            <slot name="header"></slot>
            
            <button class="close">✕</button>
          </header>
          
          <article>
            <slot></slot>
          </article>
          
          <footer>
            <slot name="footer">
              <slot name="button-before"></slot>
              <mx-button class="cancel">取消</mx-button>
              <slot name="button-center"></slot>
              <mx-button class="confirm" type="primary">确认</mx-button>
              <slot name="button-after"></slot>
            </slot>
          </footer>
        </main>
        
        <div class="mask"></div>
      `;

      const cssTemplate = document.createElement("template");
      cssTemplate.innerHTML = `
        <style>
          :host {
            display: none;
          }
          
          main {
            min-width: 500px;
            padding: 16px;
            position: fixed;
            left: 50%;
            top: calc(20vh);
            transform: translateX(-50%);
            z-index: 3001;
            border-radius: 4px;
            background-color: var(--bg-color);
            color: var(--text-color);
            box-shadow: var(--box-shadow);
          }
          
          header {
            padding-bottom: 16px;
            font-size: 18px;
          }
          
          article {
            min-width: 500px;
          }
          
          footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding-top: 16px;
          }
        
          .close {
            font-size: 16px;
            aspect-ratio: 1/1;
            padding: 0;
            position: fixed;
            top: 16px;
            right: 16px;
            background-color: inherit;
            border: 0;
          }
          .close:hover {
            color: #F56C6C;
          }
          
          .mask {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 3000;
            background: var(--overlay-bg);
          }
        </style>
      `;

      this.attachShadow({ mode: "open" });
      this.shadowRoot.append(
        htmlTemplate.content,
        commonCssTemplate.content.cloneNode(true),
        cssTemplate.content,
      );
      this.#confirmBtn = this.shadowRoot.querySelector(".confirm");
      this.#cancelBtn = this.shadowRoot.querySelector(".cancel");
      this.#closeBtn = this.shadowRoot.querySelector(".close");
    }

    connectedCallback() {
      // 按钮文字
      {
        const cancelText = this.getAttribute("cancel-text") || "取消";
        const confirmText = this.getAttribute("confirm-text") || "确认";
        this.#cancelBtn.textContent = cancelText;
        this.#confirmBtn.textContent = confirmText;
      }

      // 事件初始化
      {
        // 提交按钮
        this.#confirmBtn?.addEventListener("click", (e) => {
          this.visible = false;
          this.style.display = "none";
          this.dispatchEvent(new CustomEvent("confirm"));
        });

        const cancel = () => {
          this.visible = false;
          this.style.display = "none";
          this.dispatchEvent(new CustomEvent("cancel"));
        };

        // 关闭按钮
        this.#cancelBtn?.addEventListener("click", cancel);
        this.#closeBtn?.addEventListener("click", cancel);

        // ESC 键盘事件
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && this.visible) {
            cancel();
          }
        });
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "visible" && oldValue !== newValue) {
        this.style.display = newValue !== null ? "block" : "none";
      }
    }

    open() {
      this.visible = true;
      this.style.display = "block";
      this.dispatchEvent(new CustomEvent("open"));
    }
  }

  // 注册组件
  [Input, Select, Button, Option, Switch, MessageBox, Dialog].forEach((n) => {
    const name = `mx-${n.name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}`;

    if (!customElements.get(name)) {
      customElements.define(name, n);
    } else {
      console.error(`${name} 组件已注册`);
    }
  });

  window.MxMessageBox = MessageBox.instance;
})();
