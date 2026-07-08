"use client";

import { useEffect } from "react";

const dictionaries = {
  zh: {
    Route: "路由",
    Dynamic: "动态",
    Static: "静态",
    "Try Turbopack": "尝试 Turbopack",
    "Route Info": "路由信息",
    Preferences: "偏好设置",
    "Dev Tools": "开发工具",
    "Dev Indicator": "开发指示器",
    "Open in editor": "在编辑器中打开",
    Position: "位置",
    Theme: "主题",
    System: "跟随系统",
    Light: "浅色",
    Dark: "深色",
    Enabled: "已启用",
    Disabled: "已禁用",
    Close: "关闭",
    Copy: "复制",
    Copied: "已复制",
    "Learn More": "了解更多",
    Documentation: "文档"
  },
  id: {
    Route: "Rute",
    Dynamic: "Dinamis",
    Static: "Statis",
    "Try Turbopack": "Coba Turbopack",
    "Route Info": "Info Rute",
    Preferences: "Preferensi",
    "Dev Tools": "Alat Dev",
    "Dev Indicator": "Indikator Dev",
    "Open in editor": "Buka di editor",
    Position: "Posisi",
    Theme: "Tema",
    System: "Ikuti sistem",
    Light: "Terang",
    Dark: "Gelap",
    Enabled: "Aktif",
    Disabled: "Nonaktif",
    Close: "Tutup",
    Copy: "Salin",
    Copied: "Disalin",
    "Learn More": "Pelajari",
    Documentation: "Dokumentasi"
  }
} as const;

type SupportedDevtoolsLocale = keyof typeof dictionaries;
type LocalizableRoot = Document | ShadowRoot | Element;

function resolveLocale(): SupportedDevtoolsLocale | null {
  const pathLocale = window.location.pathname.split("/").filter(Boolean)[0];
  const htmlLocale = document.documentElement.lang;
  const locale = pathLocale || htmlLocale;

  if (locale?.startsWith("zh")) return "zh";
  if (locale?.startsWith("id")) return "id";
  return null;
}

function replaceTextValue(value: string, dictionary: Record<string, string>) {
  const trimmed = value.trim();
  const translated = dictionary[trimmed];

  if (!translated || translated === trimmed) return value;

  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translated}${trailing}`;
}

function shouldSkipTextNode(node: Node) {
  const parent = node.parentElement;
  if (!parent) return false;

  return ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(parent.tagName);
}

function localizeRoot(root: LocalizableRoot, dictionary: Record<string, string>) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (shouldSkipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
  });
  let node = walker.nextNode();

  while (node) {
    const nextValue = replaceTextValue(node.textContent ?? "", dictionary);
    if (nextValue !== node.textContent) node.textContent = nextValue;
    node = walker.nextNode();
  }

  root.querySelectorAll("*").forEach((element) => {
    ["aria-label", "title"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value) return;

      const nextValue = replaceTextValue(value, dictionary);
      if (nextValue !== value) element.setAttribute(attribute, nextValue);
    });

    if (element.shadowRoot) localizeRoot(element.shadowRoot, dictionary);
  });
}

export function NextDevtoolsLocalizer() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const run = () => {
      const locale = resolveLocale();
      if (!locale) return;
      localizeRoot(document, dictionaries[locale]);
    };

    run();

    const observer = new MutationObserver(run);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    const interval = window.setInterval(run, 500);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
