/**
 * @name PermissionsViewer
 * @description Allows you to view a user's permissions. Thanks to Noodlebox for the idea!
 * @version 0.3.0
 * @author Zerebos
 * @authorId 249746236008169473
 * @website https://github.com/zerebos/BetterDiscordAddons/tree/master/Plugins/PermissionsViewer
 * @source https://raw.githubusercontent.com/zerebos/BetterDiscordAddons/master/Plugins/PermissionsViewer/PermissionsViewer.plugin.js
 */

/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/plugins/PermissionsViewer/index.ts
var PermissionsViewer_exports = {};
__export(PermissionsViewer_exports, {
  default: () => PermissionsViewer
});
module.exports = __toCommonJS(PermissionsViewer_exports);

// src/common/plugin.ts
var Plugin = class {
  meta;
  manifest;
  settings;
  defaultSettings;
  LocaleManager;
  get strings() {
    if (!this.manifest.strings) return {};
    const locale = this.LocaleManager?.locale.split("-")[0] ?? "en";
    if (this.manifest.strings.hasOwnProperty(locale)) return this.manifest.strings[locale];
    if (this.manifest.strings.hasOwnProperty("en")) return this.manifest.strings.en;
    return this.manifest.strings;
  }
  constructor(meta, zplConfig) {
    this.meta = meta;
    this.manifest = zplConfig;
    if (typeof this.manifest.config !== "undefined") {
      this.defaultSettings = {};
      for (let s = 0; s < this.manifest.config.length; s++) {
        const current = this.manifest.config[s];
        if (current.type != "category") {
          this.defaultSettings[current.id] = current.value;
        } else {
          for (let si = 0; si < current.settings.length; si++) {
            const subCurrent = current.settings[si];
            this.defaultSettings[subCurrent.id] = subCurrent.value;
          }
        }
      }
      this.settings = BdApi.Utils.extend({}, this.defaultSettings);
    }
    const currentVersionInfo = BdApi.Data.load(this.meta.name, "version");
    if (currentVersionInfo !== this.meta.version) {
      this.#showChangelog();
      BdApi.Data.save(this.meta.name, "version", this.meta.version);
    }
    if (this.manifest.strings) this.LocaleManager = BdApi.Webpack.getByKeys("locale", "initialize");
    if (this.manifest.config && !this.getSettingsPanel) {
      this.getSettingsPanel = () => {
        this.#updateConfig();
        return BdApi.UI.buildSettingsPanel({
          onChange: (_, id, value) => {
            this.settings[id] = value;
            this.saveSettings();
          },
          settings: this.manifest.config
        });
      };
    }
  }
  async start() {
    BdApi.Logger.info(this.meta.name, `version ${this.meta.version} has started.`);
    if (this.defaultSettings) this.settings = this.loadSettings();
    if (typeof this.onStart == "function") this.onStart();
  }
  stop() {
    BdApi.Logger.info(this.meta.name, `version ${this.meta.version} has stopped.`);
    if (typeof this.onStop == "function") this.onStop();
    const svelteStyles = document.querySelectorAll(`style[id*="${this.meta.name}"]`);
    for (const style of svelteStyles) style.remove();
  }
  #showChangelog() {
    if (typeof this.manifest.changelog == "undefined") return;
    const changelog = {
      title: this.meta.name + " Changelog",
      subtitle: `v${this.meta.version}`,
      changes: []
    };
    if (!Array.isArray(this.manifest.changelog)) Object.assign(changelog, this.manifest.changelog);
    else changelog.changes = this.manifest.changelog;
    BdApi.UI.showChangelogModal(changelog);
  }
  saveSettings() {
    BdApi.Data.save(this.meta.name, "settings", this.settings);
  }
  loadSettings() {
    return BdApi.Utils.extend({}, this.defaultSettings ?? {}, BdApi.Data.load(this.meta.name, "settings"));
  }
  #updateConfig() {
    if (!this.manifest.config) return;
    for (const setting of this.manifest.config) {
      if (setting.type !== "category") {
        setting.value = this.settings[setting.id] ?? setting.value;
      } else {
        for (const subsetting of setting.settings) {
          subsetting.value = this.settings[subsetting.id] ?? subsetting.value;
        }
      }
    }
  }
  buildSettingsPanel(onChange) {
    this.#updateConfig();
    return BdApi.UI.buildSettingsPanel({
      onChange: (groupId, id, value) => {
        this.settings[id] = value;
        onChange?.(groupId, id, value);
        this.saveSettings();
      },
      settings: this.manifest.config
    });
  }
};

// src/common/formatstring.ts
function formatString(stringToFormat, ...replacements) {
  for (let v = 0; v < replacements.length; v++) {
    const values = replacements[v];
    for (const val in values) {
      let replacement = values[val];
      if (Array.isArray(replacement)) replacement = JSON.stringify(replacement);
      if (typeof replacement === "object" && replacement !== null) replacement = replacement.toString();
      stringToFormat = stringToFormat.replace(new RegExp(`{{${val}}}`, "g"), replacement.toString());
    }
  }
  return stringToFormat;
}

// src/plugins/PermissionsViewer/config.ts
var manifest = {
  info: {
    name: "PermissionsViewer",
    authors: [{
      name: "Zerebos",
      discord_id: "249746236008169473",
      github_username: "zerebos",
      twitter_username: "IAmZerebos"
    }],
    version: "0.3.0",
    description: "Allows you to view a user's permissions. Thanks to Noodlebox for the idea!",
    github: "https://github.com/zerebos/BetterDiscordAddons/tree/master/Plugins/PermissionsViewer",
    github_raw: "https://raw.githubusercontent.com/zerebos/BetterDiscordAddons/master/Plugins/PermissionsViewer/PermissionsViewer.plugin.js"
  },
  changelog: [
    {
      title: "What's New?",
      type: "added",
      items: [
        "Plugin no longer depends on ZeresPluginLibrary!",
        "Popout permissions updated to match Discord's new style."
      ]
    },
    {
      title: "Fixes",
      type: "fixed",
      items: [
        "The main startup error has finally been fixed!",
        "Fixed an issue where localization wouldn't process correctly.",
        "Permissions should now show properly on the new user popouts.",
        "Modals should now close when pressing Escape."
      ]
    }
  ],
  config: [
    {
      type: "switch",
      id: "contextMenus",
      name: "Context Menus",
      value: true
    },
    {
      type: "switch",
      id: "popouts",
      name: "Popouts",
      value: true
    },
    {
      type: "radio",
      id: "displayMode",
      name: "Modal Display Mode",
      value: "compact",
      options: [
        { name: "Cozy", value: "cozy" },
        { name: "Compact", value: "compact" }
      ]
    }
  ],
  strings: {
    es: {
      contextMenuLabel: "Permisos",
      popoutLabel: "Permisos",
      modal: {
        header: "Permisos de {{name}}",
        rolesLabel: "Roles",
        permissionsLabel: "Permisos",
        owner: "@propietario"
      },
      settings: {
        popouts: {
          name: "Mostrar en Popouts",
          note: "Mostrar los permisos de usuario en popouts como los roles."
        },
        contextMenus: {
          name: "Bot\xF3n de men\xFA contextual",
          note: "A\xF1adir un bot\xF3n para ver permisos en los men\xFAs contextuales."
        }
      }
    },
    pt: {
      contextMenuLabel: "Permiss\xF5es",
      popoutLabel: "Permiss\xF5es",
      modal: {
        header: "Permiss\xF5es de {{name}}",
        rolesLabel: "Cargos",
        permissionsLabel: "Permiss\xF5es",
        owner: "@dono"
      },
      settings: {
        popouts: {
          name: "Mostrar em Popouts",
          note: "Mostrar as permiss\xF5es em popouts como os cargos."
        },
        contextMenus: {
          name: "Bot\xE3o do menu de contexto",
          note: "Adicionar um bot\xE3o parar ver permiss\xF5es ao menu de contexto."
        }
      }
    },
    de: {
      contextMenuLabel: "Berechtigungen",
      popoutLabel: "Berechtigungen",
      modal: {
        header: "{{name}}s Berechtigungen",
        rolesLabel: "Rollen",
        permissionsLabel: "Berechtigungen",
        owner: "@eigent\xFCmer"
      },
      settings: {
        popouts: {
          name: "In Popouts anzeigen",
          note: "Zeigt die Gesamtberechtigungen eines Benutzers in seinem Popup \xE4hnlich den Rollen an."
        },
        contextMenus: {
          name: "Kontextmen\xFC-Schaltfl\xE4che",
          note: "F\xFCgt eine Schaltfl\xE4che hinzu, um die Berechtigungen mithilfe von Kontextmen\xFCs anzuzeigen."
        }
      }
    },
    en: {
      contextMenuLabel: "Permissions",
      popoutLabel: "Permissions",
      modal: {
        header: "{{name}}'s Permissions",
        rolesLabel: "Roles",
        permissionsLabel: "Permissions",
        owner: "@owner"
      },
      settings: {
        popouts: {
          name: "Show In Popouts",
          note: "Shows a user's total permissions in their popout similar to roles."
        },
        contextMenus: {
          name: "Context Menu Button",
          note: "Adds a button to view the permissions modal to select context menus."
        },
        displayMode: {
          name: "Modal Display Mode"
        }
      }
    },
    ru: {
      contextMenuLabel: "\u041F\u043E\u043B\u043D\u043E\u043C\u043E\u0447\u0438\u044F",
      popoutLabel: "\u041F\u043E\u043B\u043D\u043E\u043C\u043E\u0447\u0438\u044F",
      modal: {
        header: "\u041F\u043E\u043B\u043D\u043E\u043C\u043E\u0447\u0438\u044F {{name}}",
        rolesLabel: "\u0420\u043E\u043B\u0438",
        permissionsLabel: "\u041F\u043E\u043B\u043D\u043E\u043C\u043E\u0447\u0438\u044F",
        owner: "\u0412\u043B\u0430\u0434\u0435\u043B\u0435\u0446"
      },
      settings: {
        popouts: {
          name: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u043E \u0432\u0441\u043F\u043B\u044B\u0432\u0430\u044E\u0449\u0438\u0445 \u043E\u043A\u043D\u0430\u0445",
          note: "\u041E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u0442 \u043F\u043E\u043B\u043D\u043E\u043C\u043E\u0447\u0438\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0432 \u0438\u0445 \u0432\u0441\u043F\u043B\u044B\u0432\u0430\u044E\u0449\u0435\u043C \u043E\u043A\u043D\u0435, \u0430\u043D\u0430\u043B\u043E\u0433\u0438\u0447\u043D\u043E\u043C \u0440\u043E\u043B\u044F\u043C."
        },
        contextMenus: {
          name: "\u041A\u043D\u043E\u043F\u043A\u0430 \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u043D\u043E\u0433\u043E \u043C\u0435\u043D\u044E",
          note: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043A\u043D\u043E\u043F\u043A\u0443 \u0434\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u043F\u043E\u043B\u043D\u043E\u043C\u043E\u0447\u0438\u0439 \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u043D\u044B\u0445 \u043C\u0435\u043D\u044E."
        }
      }
    }
  },
  main: "index.ts"
};
var config_default = manifest;

// src/plugins/PermissionsViewer/styles.css
var styles_default = ".perm-user-avatar {\n    border-radius: 50%;\n    width: 16px;\n    height: 16px;\n    margin-right: 3px;\n}\n\n.member-perms-header {\n    color: var(--header-secondary);\n    display: flex;\n    justify-content: space-between;\n}\n\n.member-perms {\n    display: flex;\n    flex-wrap: wrap;\n    margin-top: 2px;\n    max-height: 160px;\n    overflow-y: auto;\n    overflow-x: hidden;\n}\n\n.member-perms .member-perm .perm-circle {\n    border-radius: 50%;\n    height: 12px;\n    margin: 0 8px 0 5px;\n    width: 12px;\n}\n\n.member-perms .member-perm .name {\n    margin-right: 4px;\n    max-width: 200px;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n}\n\n.perm-details-button {\n    cursor: pointer;\n    height: 12px;\n}\n\n.perm-details {\n    display: flex;\n    justify-content: flex-end;\n}\n\n.member-perm-details {\n    cursor: pointer;\n}\n\n.member-perm-details-button {\n    fill: #72767d;\n    height: 10px;\n}\n\n/* Modal */\n\n@keyframes permissions-backdrop {\n    to { opacity: 0.85; }\n}\n\n@keyframes permissions-modal-wrapper {\n    to { transform: scale(1); opacity: 1; }\n}\n\n@keyframes permissions-backdrop-closing {\n    to { opacity: 0; }\n}\n\n@keyframes permissions-modal-wrapper-closing {\n    to { transform: scale(0.7); opacity: 0; }\n}\n\n#permissions-modal-wrapper {\n    z-index: 100;\n}\n\n#permissions-modal-wrapper .callout-backdrop {\n    animation: permissions-backdrop 250ms ease;\n    animation-fill-mode: forwards;\n    opacity: 0;\n    background-color: rgb(0, 0, 0);\n    transform: translateZ(0px);\n}\n\n#permissions-modal-wrapper.closing .callout-backdrop {\n    animation: permissions-backdrop-closing 200ms linear;\n    animation-fill-mode: forwards;\n    animation-delay: 50ms;\n    opacity: 0.85;\n}\n\n#permissions-modal-wrapper.closing .modal-wrapper {\n    animation: permissions-modal-wrapper-closing 250ms cubic-bezier(0.19, 1, 0.22, 1);\n    animation-fill-mode: forwards;\n    opacity: 1;\n    transform: scale(1);\n}\n\n#permissions-modal-wrapper .modal-wrapper {\n    animation: permissions-modal-wrapper 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275);\n    animation-fill-mode: forwards;\n    transform: scale(0.7);\n    transform-origin: 50% 50%;\n    display: flex;\n    align-items: center;\n    box-sizing: border-box;\n    contain: content;\n    justify-content: center;\n    top: 0;\n    left: 0;\n    bottom: 0;\n    right: 0;\n    opacity: 0;\n    pointer-events: none;\n    position: absolute;\n    user-select: none;\n    z-index: 1000;\n}\n\n#permissions-modal-wrapper .modal-body {\n    background-color: #36393f;\n    height: 440px;\n    width: auto;\n    /*box-shadow: 0 0 0 1px rgba(32,34,37,.6), 0 2px 10px 0 rgba(0,0,0,.2);*/\n    flex-direction: row;\n    overflow: hidden;\n    display: flex;\n    flex: 1;\n    contain: layout;\n    position: relative;\n}\n\n#permissions-modal-wrapper #permissions-modal {\n    contain: layout;\n    flex-direction: column;\n    pointer-events: auto;\n    border: 1px solid rgba(28,36,43,.6);\n    border-radius: 5px;\n    box-shadow: 0 2px 10px 0 rgba(0,0,0,.2);\n    overflow: hidden;\n}\n\n#permissions-modal-wrapper .header {\n    background-color: #35393e;\n    box-shadow: 0 2px 3px 0 rgba(0,0,0,.2);\n    padding: 12px 20px;\n    z-index: 1;\n    color: #fff;\n    font-size: 16px;\n    font-weight: 700;\n    line-height: 19px;\n}\n\n.role-side, .perm-side {\n    flex-direction: column;\n    padding-left: 6px;\n}\n\n.role-scroller, .perm-scroller {\n    contain: layout;\n    flex: 1;\n    min-height: 1px;\n    overflow-y: scroll;\n}\n\n#permissions-modal-wrapper .scroller-title {\n    color: #fff;\n    padding: 8px 0 4px 4px;\n    margin-right: 8px;\n    border-bottom: 1px solid rgba(0,0,0,0.3);\n    display: none;\n}\n\n#permissions-modal-wrapper .role-side {\n    width: auto;\n    min-width: 150px;\n    background: #2f3136;\n    flex: 0 0 auto;\n    overflow: hidden;\n    display: flex;\n    min-height: 1px;\n    position: relative;\n}\n\n#permissions-modal-wrapper .role-scroller {\n    contain: layout;\n    flex: 1;\n    min-height: 1px;\n    overflow-y: scroll;\n    padding-top: 8px;\n}\n\n#permissions-modal-wrapper .role-item {\n    display: flex;\n    border-radius: 2px;\n    padding: 6px;\n    margin-bottom: 5px;\n    cursor: pointer;\n    color: #dcddde;\n}\n\n#permissions-modal-wrapper .role-item:hover {\n    background-color: rgba(0,0,0,0.1);\n}\n\n#permissions-modal-wrapper .role-item.selected {\n    background-color: rgba(0,0,0,0.2);\n}\n\n#permissions-modal-wrapper .perm-side {\n    width: 273px;\n    background-color: #36393f;\n    flex: 0 0 auto;\n    display: flex;\n    min-height: 1px;\n    position: relative;\n    padding-left: 10px;\n}\n\n#permissions-modal-wrapper .perm-item {\n    box-shadow: inset 0 -1px 0 rgba(79,84,92,.3);\n    box-sizing: border-box;\n    height: 44px;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    flex-direction: row;\n    justify-content: flex-start;\n    align-items: center;\n    display: flex;\n}\n\n#permissions-modal-wrapper .perm-item.allowed svg {\n    fill: #43B581;\n}\n\n#permissions-modal-wrapper .perm-item.denied svg {\n    fill: #F04747;\n}\n\n#permissions-modal-wrapper .perm-name {\n    display: inline;\n    flex: 1;\n    font-size: 16px;\n    font-weight: 400;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    user-select: text;\n    color: #dcddde;\n    margin-left: 10px;\n}\n\n\n.member-perms::-webkit-scrollbar-thumb, .member-perms::-webkit-scrollbar-track,\n#permissions-modal-wrapper *::-webkit-scrollbar-thumb, #permissions-modal-wrapper *::-webkit-scrollbar-track {\n    background-clip: padding-box;\n    border-radius: 7.5px;\n    border-style: solid;\n    border-width: 3px;\n    visibility: hidden;\n}\n\n.member-perms:hover::-webkit-scrollbar-thumb, .member-perms:hover::-webkit-scrollbar-track,\n#permissions-modal-wrapper *:hover::-webkit-scrollbar-thumb, #permissions-modal-wrapper *:hover::-webkit-scrollbar-track {\n    visibility: visible;\n}\n\n.member-perms::-webkit-scrollbar-track,\n#permissions-modal-wrapper *::-webkit-scrollbar-track {\n    border-width: initial;\n    background-color: transparent;\n    border: 2px solid transparent;\n}\n\n.member-perms::-webkit-scrollbar-thumb,\n#permissions-modal-wrapper *::-webkit-scrollbar-thumb {\n    border: 2px solid transparent;\n    border-radius: 4px;\n    cursor: move;\n    background-color: rgba(32,34,37,.6);\n}\n\n.member-perms::-webkit-scrollbar,\n#permissions-modal-wrapper *::-webkit-scrollbar {\n    height: 8px;\n    width: 8px;\n}\n\n\n\n.theme-light #permissions-modal-wrapper #permissions-modal {\n    background: #fff;\n}\n\n.theme-light #permissions-modal-wrapper .modal-body {\n    background: transparent;\n}\n\n.theme-light #permissions-modal-wrapper .header {\n    background: transparent;\n    color: #000;\n}\n\n.theme-light #permissions-modal-wrapper .role-side {\n    background: rgba(0,0,0,.2);\n}\n\n.theme-light #permissions-modal-wrapper .perm-side {\n    background: rgba(0,0,0,.1);\n}\n\n.theme-light #permissions-modal-wrapper .role-item,\n.theme-light #permissions-modal-wrapper .perm-name {\n    color: #000;\n}\n\n#permissions-modal-wrapper #permissions-modal {\n    width: auto;\n}";

// src/plugins/PermissionsViewer/jumbo.css
var jumbo_default = "#permissions-modal-wrapper #permissions-modal {\n    height: 840px;\n}\n\n#permissions-modal-wrapper #permissions-modal .perm-side {\n    width: 500px;\n}\n\n#permissions-modal .perm-scroller {\n    display: flex;\n    flex-wrap: wrap;\n    align-content: flex-start;\n}\n\n#permissions-modal .perm-item {\n    width: 50%;\n}";

// src/plugins/PermissionsViewer/list.html
var list_default = '<div class="{{section}}" id="permissions-popout">\n    <h1 class="member-perms-header {{text-xs/semibold}} {{defaultColor_e9e35f}} {{heading}}" data-text-variant="text-xs/semibold" style="color: var(--header-secondary);">\n        <div class="member-perms-title">{{sectionTitle}}</div>\n        <span class="perm-details">\n            <svg name="Details" viewBox="0 0 24 24" class="perm-details-button" fill="currentColor">\n                <path d="M0 0h24v24H0z" fill="none"/>\n                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>\n            </svg>\n        </span>\n    </h1>\n    <div class="member-perms {{root}}"></div>\n</div>';

// src/plugins/PermissionsViewer/item.html
var item_default = '<div class="member-perm {{role}}">\n    <div class="perm-circle {{roleCircle}}"></div>\n    <div class="name {{roleName}} {{defaultColor}}"></div>\n</div>';

// src/plugins/PermissionsViewer/modal.html
var modal_default = '<div id="permissions-modal-wrapper">\n        <div class="callout-backdrop {{backdrop}}"></div>\n        <div class="modal-wrapper">\n            <div id="permissions-modal" class="{{root}} {{small}}">\n                <div class="header"><div class="title">{{header}}</div></div>\n                <div class="modal-body">\n                    <div class="role-side">\n                        <span class="scroller-title role-list-title">{{rolesLabel}}</span>\n                        <div class="role-scroller">\n        \n                        </div>\n                    </div>\n                    <div class="perm-side">\n                        <span class="scroller-title perm-list-title">{{permissionsLabel}}</span>\n                        <div class="perm-scroller">\n        \n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>';

// src/plugins/PermissionsViewer/modalitem.html
var modalitem_default = '<div class="perm-item"><span class="perm-name"></span></div>';

// src/plugins/PermissionsViewer/modalbutton.html
var modalbutton_default = '<div class="role-item"><span class="role-name"></span></div>';

// src/plugins/PermissionsViewer/modalbuttonuser.html
var modalbuttonuser_default = `<div class="role-item"><div class="wrapper_de5239 xsmall_d82b57"><div class="image__25781 xsmall_d82b57 perm-user-avatar" style="background-image: url('\\{{avatarUrl}}');"></div></div><span class="role-name marginLeft8_ff311d"></span></div>`;

// src/plugins/PermissionsViewer/permallowed.svg
var permallowed_default = '<svg height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

// src/plugins/PermissionsViewer/permdenied.svg
var permdenied_default = '<svg height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/></svg>';

// src/common/colors.ts
function getRGB(color) {
  let result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color);
  if (result) return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];
  result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)%\s*,\s*([0-9]+(?:\.[0-9]+)?)%\s*,\s*([0-9]+(?:\.[0-9]+)?)%\s*\)/.exec(color);
  if (result) return [parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55];
  result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color);
  if (result) return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
  result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color);
  if (result) return [parseInt(result[1] + result[1], 16), parseInt(result[2] + result[2], 16), parseInt(result[3] + result[3], 16)];
}
function rgbToAlpha(color, alpha) {
  const rgb = getRGB(color);
  if (!rgb) return color;
  return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + alpha + ")";
}

// node_modules/svelte/src/version.js
var PUBLIC_VERSION = "5";

// node_modules/svelte/src/internal/disclose-version.js
if (typeof window !== "undefined")
  (window.__svelte ||= { v: /* @__PURE__ */ new Set() }).v.add(PUBLIC_VERSION);

// node_modules/svelte/src/internal/flags/index.js
var legacy_mode_flag = false;
function enable_legacy_mode_flag() {
  legacy_mode_flag = true;
}

// node_modules/svelte/src/internal/flags/legacy.js
enable_legacy_mode_flag();

// node_modules/svelte/src/constants.js
var EACH_INDEX_REACTIVE = 1 << 1;
var EACH_IS_CONTROLLED = 1 << 2;
var EACH_IS_ANIMATED = 1 << 3;
var EACH_ITEM_IMMUTABLE = 1 << 4;
var PROPS_IS_RUNES = 1 << 1;
var PROPS_IS_UPDATED = 1 << 2;
var PROPS_IS_BINDABLE = 1 << 3;
var PROPS_IS_LAZY_INITIAL = 1 << 4;
var TRANSITION_OUT = 1 << 1;
var TRANSITION_GLOBAL = 1 << 2;
var TEMPLATE_FRAGMENT = 1;
var TEMPLATE_USE_IMPORT_NODE = 1 << 1;
var HYDRATION_START = "[";
var HYDRATION_END = "]";
var HYDRATION_ERROR = {};
var ELEMENT_PRESERVE_ATTRIBUTE_CASE = 1 << 1;
var UNINITIALIZED = Symbol();
var FILENAME = Symbol("filename");
var HMR = Symbol("hmr");

// node_modules/svelte/src/utils.js
var DOM_BOOLEAN_ATTRIBUTES = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "disabled",
  "formnovalidate",
  "hidden",
  "indeterminate",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "seamless",
  "selected",
  "webkitdirectory"
];
var DOM_PROPERTIES = [
  ...DOM_BOOLEAN_ATTRIBUTES,
  "formNoValidate",
  "isMap",
  "noModule",
  "playsInline",
  "readOnly",
  "value",
  "inert",
  "volume",
  "defaultValue",
  "defaultChecked",
  "srcObject"
];
var PASSIVE_EVENTS = ["touchstart", "touchmove"];
function is_passive_event(name) {
  return PASSIVE_EVENTS.includes(name);
}

// node_modules/esm-env/dev-fallback.js
var node_env = globalThis.process?.env?.NODE_ENV;
if (!node_env) {
  console.warn("If bundling, conditions should include development or production. If not bundling, conditions or NODE_ENV should include development or production. See https://www.npmjs.com/package/esm-env for tips on setting conditions in popular bundlers and runtimes.");
}
var dev_fallback_default = node_env && !node_env.toLowerCase().includes("prod");

// node_modules/svelte/src/internal/shared/utils.js
var is_array = Array.isArray;
var array_from = Array.from;
var object_keys = Object.keys;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
function run_all(arr) {
  for (var i = 0; i < arr.length; i++) {
    arr[i]();
  }
}

// node_modules/svelte/src/internal/client/constants.js
var DERIVED = 1 << 1;
var EFFECT = 1 << 2;
var RENDER_EFFECT = 1 << 3;
var BLOCK_EFFECT = 1 << 4;
var BRANCH_EFFECT = 1 << 5;
var ROOT_EFFECT = 1 << 6;
var BOUNDARY_EFFECT = 1 << 7;
var UNOWNED = 1 << 8;
var DISCONNECTED = 1 << 9;
var CLEAN = 1 << 10;
var DIRTY = 1 << 11;
var MAYBE_DIRTY = 1 << 12;
var INERT = 1 << 13;
var DESTROYED = 1 << 14;
var EFFECT_RAN = 1 << 15;
var EFFECT_TRANSPARENT = 1 << 16;
var LEGACY_DERIVED_PROP = 1 << 17;
var INSPECT_EFFECT = 1 << 18;
var HEAD_EFFECT = 1 << 19;
var EFFECT_HAS_DERIVED = 1 << 20;
var STATE_SYMBOL = Symbol("$state");
var STATE_SYMBOL_METADATA = Symbol("$state metadata");
var LEGACY_PROPS = Symbol("legacy props");
var LOADING_ATTR_SYMBOL = Symbol("");

// node_modules/svelte/src/internal/client/reactivity/equality.js
function equals(value) {
  return value === this.v;
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
function safe_equals(value) {
  return !safe_not_equal(value, this.v);
}

// node_modules/svelte/src/internal/client/errors.js
function derived_references_self() {
  if (dev_fallback_default) {
    const error = new Error(`derived_references_self
A derived value cannot reference itself recursively
https://svelte.dev/e/derived_references_self`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/derived_references_self`);
  }
}
function effect_update_depth_exceeded() {
  if (dev_fallback_default) {
    const error = new Error(`effect_update_depth_exceeded
Maximum update depth exceeded. This can happen when a reactive block or effect repeatedly sets a new value. Svelte limits the number of nested updates to prevent infinite loops
https://svelte.dev/e/effect_update_depth_exceeded`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
  }
}
function hydration_failed() {
  if (dev_fallback_default) {
    const error = new Error(`hydration_failed
Failed to hydrate the application
https://svelte.dev/e/hydration_failed`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/hydration_failed`);
  }
}
function rune_outside_svelte(rune) {
  if (dev_fallback_default) {
    const error = new Error(`rune_outside_svelte
The \`${rune}\` rune is only available inside \`.svelte\` and \`.svelte.js/ts\` files
https://svelte.dev/e/rune_outside_svelte`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/rune_outside_svelte`);
  }
}
function state_unsafe_local_read() {
  if (dev_fallback_default) {
    const error = new Error(`state_unsafe_local_read
Reading state that was created inside the same derived is forbidden. Consider using \`untrack\` to read locally created state
https://svelte.dev/e/state_unsafe_local_read`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/state_unsafe_local_read`);
  }
}
function state_unsafe_mutation() {
  if (dev_fallback_default) {
    const error = new Error(`state_unsafe_mutation
Updating state inside a derived or a template expression is forbidden. If the value should not be reactive, declare it without \`$state\`
https://svelte.dev/e/state_unsafe_mutation`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
  }
}

// node_modules/svelte/src/internal/client/dev/tracing.js
var tracing_expressions = null;
function get_stack(label) {
  let error = Error();
  const stack2 = error.stack;
  if (stack2) {
    const lines = stack2.split("\n");
    const new_lines = ["\n"];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === "Error") {
        continue;
      }
      if (line.includes("validate_each_keys")) {
        return null;
      }
      if (line.includes("svelte/src/internal")) {
        continue;
      }
      new_lines.push(line);
    }
    if (new_lines.length === 1) {
      return null;
    }
    define_property(error, "stack", {
      value: new_lines.join("\n")
    });
    define_property(error, "name", {
      // 'Error' suffix is required for stack traces to be rendered properly
      value: `${label}Error`
    });
  }
  return error;
}

// node_modules/svelte/src/internal/client/reactivity/sources.js
var inspect_effects = /* @__PURE__ */ new Set();
function set_inspect_effects(v) {
  inspect_effects = v;
}
function source(v, stack2) {
  var signal = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v,
    reactions: null,
    equals,
    version: 0
  };
  if (dev_fallback_default) {
    signal.created = stack2 ?? get_stack("CreatedAt");
    signal.debug = null;
  }
  return signal;
}
// @__NO_SIDE_EFFECTS__
function mutable_source(initial_value, immutable = false) {
  const s = source(initial_value);
  if (!immutable) {
    s.equals = safe_equals;
  }
  if (legacy_mode_flag && component_context !== null && component_context.l !== null) {
    (component_context.l.s ??= []).push(s);
  }
  return s;
}
function set(source2, value) {
  if (active_reaction !== null && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT)) !== 0 && // If the source was created locally within the current derived, then
  // we allow the mutation.
  (derived_sources === null || !derived_sources.includes(source2))) {
    state_unsafe_mutation();
  }
  return internal_set(source2, value);
}
function internal_set(source2, value) {
  if (!source2.equals(value)) {
    source2.v = value;
    source2.version = increment_version();
    if (dev_fallback_default) {
      source2.updated = get_stack("UpdatedAt");
    }
    mark_reactions(source2, DIRTY);
    if (is_runes() && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & BRANCH_EFFECT) === 0) {
      if (new_deps !== null && new_deps.includes(source2)) {
        set_signal_status(active_effect, DIRTY);
        schedule_effect(active_effect);
      } else {
        if (untracked_writes === null) {
          set_untracked_writes([source2]);
        } else {
          untracked_writes.push(source2);
        }
      }
    }
    if (dev_fallback_default && inspect_effects.size > 0) {
      const inspects = Array.from(inspect_effects);
      var previously_flushing_effect = is_flushing_effect;
      set_is_flushing_effect(true);
      try {
        for (const effect2 of inspects) {
          if ((effect2.f & CLEAN) !== 0) {
            set_signal_status(effect2, MAYBE_DIRTY);
          }
          if (check_dirtiness(effect2)) {
            update_effect(effect2);
          }
        }
      } finally {
        set_is_flushing_effect(previously_flushing_effect);
      }
      inspect_effects.clear();
    }
  }
  return value;
}
function mark_reactions(signal, status) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  var runes = is_runes();
  var length = reactions.length;
  for (var i = 0; i < length; i++) {
    var reaction = reactions[i];
    var flags = reaction.f;
    if ((flags & DIRTY) !== 0) continue;
    if (!runes && reaction === active_effect) continue;
    if (dev_fallback_default && (flags & INSPECT_EFFECT) !== 0) {
      inspect_effects.add(reaction);
      continue;
    }
    set_signal_status(reaction, status);
    if ((flags & (CLEAN | UNOWNED)) !== 0) {
      if ((flags & DERIVED) !== 0) {
        mark_reactions(
          /** @type {Derived} */
          reaction,
          MAYBE_DIRTY
        );
      } else {
        schedule_effect(
          /** @type {Effect} */
          reaction
        );
      }
    }
  }
}

// node_modules/svelte/src/internal/client/warnings.js
var bold = "font-weight: bold";
var normal = "font-weight: normal";
function hydration_mismatch(location) {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] hydration_mismatch
%c${location ? `Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near ${location}` : "Hydration failed because the initial UI does not match what was rendered on the server"}
https://svelte.dev/e/hydration_mismatch`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/hydration_mismatch`);
  }
}
function lifecycle_double_unmount() {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] lifecycle_double_unmount
%cTried to unmount a component that was not mounted
https://svelte.dev/e/lifecycle_double_unmount`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/lifecycle_double_unmount`);
  }
}
function state_proxy_equality_mismatch(operator) {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] state_proxy_equality_mismatch
%cReactive \`$state(...)\` proxies and the values they proxy have different identities. Because of this, comparisons with \`${operator}\` will produce unexpected results
https://svelte.dev/e/state_proxy_equality_mismatch`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/state_proxy_equality_mismatch`);
  }
}

// node_modules/svelte/src/internal/client/dom/hydration.js
var hydrating = false;
function set_hydrating(value) {
  hydrating = value;
}
var hydrate_node;
function set_hydrate_node(node) {
  if (node === null) {
    hydration_mismatch();
    throw HYDRATION_ERROR;
  }
  return hydrate_node = node;
}
function hydrate_next() {
  return set_hydrate_node(
    /** @type {TemplateNode} */
    get_next_sibling(hydrate_node)
  );
}

// node_modules/svelte/src/internal/client/dev/ownership.js
var ADD_OWNER = Symbol("ADD_OWNER");

// node_modules/svelte/src/internal/client/proxy.js
function get_proxied_value(value) {
  if (value !== null && typeof value === "object" && STATE_SYMBOL in value) {
    return value[STATE_SYMBOL];
  }
  return value;
}

// node_modules/svelte/src/internal/client/dev/equality.js
function init_array_prototype_warnings() {
  const array_prototype2 = Array.prototype;
  const cleanup = Array.__svelte_cleanup;
  if (cleanup) {
    cleanup();
  }
  const { indexOf, lastIndexOf, includes } = array_prototype2;
  array_prototype2.indexOf = function(item, from_index) {
    const index2 = indexOf.call(this, item, from_index);
    if (index2 === -1) {
      for (let i = from_index ?? 0; i < this.length; i += 1) {
        if (get_proxied_value(this[i]) === item) {
          state_proxy_equality_mismatch("array.indexOf(...)");
          break;
        }
      }
    }
    return index2;
  };
  array_prototype2.lastIndexOf = function(item, from_index) {
    const index2 = lastIndexOf.call(this, item, from_index ?? this.length - 1);
    if (index2 === -1) {
      for (let i = 0; i <= (from_index ?? this.length - 1); i += 1) {
        if (get_proxied_value(this[i]) === item) {
          state_proxy_equality_mismatch("array.lastIndexOf(...)");
          break;
        }
      }
    }
    return index2;
  };
  array_prototype2.includes = function(item, from_index) {
    const has = includes.call(this, item, from_index);
    if (!has) {
      for (let i = 0; i < this.length; i += 1) {
        if (get_proxied_value(this[i]) === item) {
          state_proxy_equality_mismatch("array.includes(...)");
          break;
        }
      }
    }
    return has;
  };
  Array.__svelte_cleanup = () => {
    array_prototype2.indexOf = indexOf;
    array_prototype2.lastIndexOf = lastIndexOf;
    array_prototype2.includes = includes;
  };
}

// node_modules/svelte/src/internal/client/dom/operations.js
var $window;
var $document;
var first_child_getter;
var next_sibling_getter;
function init_operations() {
  if ($window !== void 0) {
    return;
  }
  $window = window;
  $document = document;
  var element_prototype = Element.prototype;
  var node_prototype = Node.prototype;
  first_child_getter = get_descriptor(node_prototype, "firstChild").get;
  next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
  element_prototype.__click = void 0;
  element_prototype.__className = "";
  element_prototype.__attributes = null;
  element_prototype.__styles = null;
  element_prototype.__e = void 0;
  Text.prototype.__t = void 0;
  if (dev_fallback_default) {
    element_prototype.__svelte_meta = null;
    init_array_prototype_warnings();
  }
}
function create_text(value = "") {
  return document.createTextNode(value);
}
// @__NO_SIDE_EFFECTS__
function get_first_child(node) {
  return first_child_getter.call(node);
}
// @__NO_SIDE_EFFECTS__
function get_next_sibling(node) {
  return next_sibling_getter.call(node);
}
function clear_text_content(node) {
  node.textContent = "";
}

// node_modules/svelte/src/internal/client/reactivity/deriveds.js
function destroy_derived_children(derived2) {
  var children = derived2.children;
  if (children !== null) {
    derived2.children = null;
    for (var i = 0; i < children.length; i += 1) {
      var child2 = children[i];
      if ((child2.f & DERIVED) !== 0) {
        destroy_derived(
          /** @type {Derived} */
          child2
        );
      } else {
        destroy_effect(
          /** @type {Effect} */
          child2
        );
      }
    }
  }
}
var stack = [];
function get_derived_parent_effect(derived2) {
  var parent = derived2.parent;
  while (parent !== null) {
    if ((parent.f & DERIVED) === 0) {
      return (
        /** @type {Effect} */
        parent
      );
    }
    parent = parent.parent;
  }
  return null;
}
function execute_derived(derived2) {
  var value;
  var prev_active_effect = active_effect;
  set_active_effect(get_derived_parent_effect(derived2));
  if (dev_fallback_default) {
    let prev_inspect_effects = inspect_effects;
    set_inspect_effects(/* @__PURE__ */ new Set());
    try {
      if (stack.includes(derived2)) {
        derived_references_self();
      }
      stack.push(derived2);
      destroy_derived_children(derived2);
      value = update_reaction(derived2);
    } finally {
      set_active_effect(prev_active_effect);
      set_inspect_effects(prev_inspect_effects);
      stack.pop();
    }
  } else {
    try {
      destroy_derived_children(derived2);
      value = update_reaction(derived2);
    } finally {
      set_active_effect(prev_active_effect);
    }
  }
  return value;
}
function update_derived(derived2) {
  var value = execute_derived(derived2);
  var status = (skip_reaction || (derived2.f & UNOWNED) !== 0) && derived2.deps !== null ? MAYBE_DIRTY : CLEAN;
  set_signal_status(derived2, status);
  if (!derived2.equals(value)) {
    derived2.v = value;
    derived2.version = increment_version();
  }
}
function destroy_derived(derived2) {
  destroy_derived_children(derived2);
  remove_reactions(derived2, 0);
  set_signal_status(derived2, DESTROYED);
  derived2.v = derived2.children = derived2.deps = derived2.ctx = derived2.reactions = null;
}

// node_modules/svelte/src/internal/client/reactivity/effects.js
function push_effect(effect2, parent_effect) {
  var parent_last = parent_effect.last;
  if (parent_last === null) {
    parent_effect.last = parent_effect.first = effect2;
  } else {
    parent_last.next = effect2;
    effect2.prev = parent_last;
    parent_effect.last = effect2;
  }
}
function create_effect(type, fn, sync, push2 = true) {
  var is_root = (type & ROOT_EFFECT) !== 0;
  var parent_effect = active_effect;
  if (dev_fallback_default) {
    while (parent_effect !== null && (parent_effect.f & INSPECT_EFFECT) !== 0) {
      parent_effect = parent_effect.parent;
    }
  }
  var effect2 = {
    ctx: component_context,
    deps: null,
    deriveds: null,
    nodes_start: null,
    nodes_end: null,
    f: type | DIRTY,
    first: null,
    fn,
    last: null,
    next: null,
    parent: is_root ? null : parent_effect,
    prev: null,
    teardown: null,
    transitions: null,
    version: 0
  };
  if (dev_fallback_default) {
    effect2.component_function = dev_current_component_function;
  }
  if (sync) {
    var previously_flushing_effect = is_flushing_effect;
    try {
      set_is_flushing_effect(true);
      update_effect(effect2);
      effect2.f |= EFFECT_RAN;
    } catch (e) {
      destroy_effect(effect2);
      throw e;
    } finally {
      set_is_flushing_effect(previously_flushing_effect);
    }
  } else if (fn !== null) {
    schedule_effect(effect2);
  }
  var inert = sync && effect2.deps === null && effect2.first === null && effect2.nodes_start === null && effect2.teardown === null && (effect2.f & EFFECT_HAS_DERIVED) === 0;
  if (!inert && !is_root && push2) {
    if (parent_effect !== null) {
      push_effect(effect2, parent_effect);
    }
    if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
      var derived2 = (
        /** @type {Derived} */
        active_reaction
      );
      (derived2.children ??= []).push(effect2);
    }
  }
  return effect2;
}
function effect_root(fn) {
  const effect2 = create_effect(ROOT_EFFECT, fn, true);
  return () => {
    destroy_effect(effect2);
  };
}
function component_root(fn) {
  const effect2 = create_effect(ROOT_EFFECT, fn, true);
  return (options = {}) => {
    return new Promise((fulfil) => {
      if (options.outro) {
        pause_effect(effect2, () => {
          destroy_effect(effect2);
          fulfil(void 0);
        });
      } else {
        destroy_effect(effect2);
        fulfil(void 0);
      }
    });
  };
}
function effect(fn) {
  return create_effect(EFFECT, fn, false);
}
function render_effect(fn) {
  return create_effect(RENDER_EFFECT, fn, true);
}
function branch(fn, push2 = true) {
  return create_effect(RENDER_EFFECT | BRANCH_EFFECT, fn, true, push2);
}
function execute_effect_teardown(effect2) {
  var teardown2 = effect2.teardown;
  if (teardown2 !== null) {
    const previously_destroying_effect = is_destroying_effect;
    const previous_reaction = active_reaction;
    set_is_destroying_effect(true);
    set_active_reaction(null);
    try {
      teardown2.call(null);
    } finally {
      set_is_destroying_effect(previously_destroying_effect);
      set_active_reaction(previous_reaction);
    }
  }
}
function destroy_effect_deriveds(signal) {
  var deriveds = signal.deriveds;
  if (deriveds !== null) {
    signal.deriveds = null;
    for (var i = 0; i < deriveds.length; i += 1) {
      destroy_derived(deriveds[i]);
    }
  }
}
function destroy_effect_children(signal, remove_dom = false) {
  var effect2 = signal.first;
  signal.first = signal.last = null;
  while (effect2 !== null) {
    var next2 = effect2.next;
    destroy_effect(effect2, remove_dom);
    effect2 = next2;
  }
}
function destroy_block_effect_children(signal) {
  var effect2 = signal.first;
  while (effect2 !== null) {
    var next2 = effect2.next;
    if ((effect2.f & BRANCH_EFFECT) === 0) {
      destroy_effect(effect2);
    }
    effect2 = next2;
  }
}
function destroy_effect(effect2, remove_dom = true) {
  var removed = false;
  if ((remove_dom || (effect2.f & HEAD_EFFECT) !== 0) && effect2.nodes_start !== null) {
    var node = effect2.nodes_start;
    var end = effect2.nodes_end;
    while (node !== null) {
      var next2 = node === end ? null : (
        /** @type {TemplateNode} */
        get_next_sibling(node)
      );
      node.remove();
      node = next2;
    }
    removed = true;
  }
  destroy_effect_children(effect2, remove_dom && !removed);
  destroy_effect_deriveds(effect2);
  remove_reactions(effect2, 0);
  set_signal_status(effect2, DESTROYED);
  var transitions = effect2.transitions;
  if (transitions !== null) {
    for (const transition2 of transitions) {
      transition2.stop();
    }
  }
  execute_effect_teardown(effect2);
  var parent = effect2.parent;
  if (parent !== null && parent.first !== null) {
    unlink_effect(effect2);
  }
  if (dev_fallback_default) {
    effect2.component_function = null;
  }
  effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.deps = effect2.fn = effect2.nodes_start = effect2.nodes_end = null;
}
function unlink_effect(effect2) {
  var parent = effect2.parent;
  var prev = effect2.prev;
  var next2 = effect2.next;
  if (prev !== null) prev.next = next2;
  if (next2 !== null) next2.prev = prev;
  if (parent !== null) {
    if (parent.first === effect2) parent.first = next2;
    if (parent.last === effect2) parent.last = prev;
  }
}
function pause_effect(effect2, callback) {
  var transitions = [];
  pause_children(effect2, transitions, true);
  run_out_transitions(transitions, () => {
    destroy_effect(effect2);
    if (callback) callback();
  });
}
function run_out_transitions(transitions, fn) {
  var remaining = transitions.length;
  if (remaining > 0) {
    var check = () => --remaining || fn();
    for (var transition2 of transitions) {
      transition2.out(check);
    }
  } else {
    fn();
  }
}
function pause_children(effect2, transitions, local) {
  if ((effect2.f & INERT) !== 0) return;
  effect2.f ^= INERT;
  if (effect2.transitions !== null) {
    for (const transition2 of effect2.transitions) {
      if (transition2.is_global || local) {
        transitions.push(transition2);
      }
    }
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
    pause_children(child2, transitions, transparent ? local : false);
    child2 = sibling2;
  }
}

// node_modules/svelte/src/internal/client/dom/task.js
var is_micro_task_queued = false;
var is_idle_task_queued = false;
var current_queued_micro_tasks = [];
var current_queued_idle_tasks = [];
function process_micro_tasks() {
  is_micro_task_queued = false;
  const tasks = current_queued_micro_tasks.slice();
  current_queued_micro_tasks = [];
  run_all(tasks);
}
function process_idle_tasks() {
  is_idle_task_queued = false;
  const tasks = current_queued_idle_tasks.slice();
  current_queued_idle_tasks = [];
  run_all(tasks);
}
function queue_micro_task(fn) {
  if (!is_micro_task_queued) {
    is_micro_task_queued = true;
    queueMicrotask(process_micro_tasks);
  }
  current_queued_micro_tasks.push(fn);
}
function flush_tasks() {
  if (is_micro_task_queued) {
    process_micro_tasks();
  }
  if (is_idle_task_queued) {
    process_idle_tasks();
  }
}

// node_modules/svelte/src/internal/client/runtime.js
var FLUSH_MICROTASK = 0;
var FLUSH_SYNC = 1;
var handled_errors = /* @__PURE__ */ new WeakSet();
var is_throwing_error = false;
var scheduler_mode = FLUSH_MICROTASK;
var is_micro_task_queued2 = false;
var last_scheduled_effect = null;
var is_flushing_effect = false;
var is_destroying_effect = false;
function set_is_flushing_effect(value) {
  is_flushing_effect = value;
}
function set_is_destroying_effect(value) {
  is_destroying_effect = value;
}
var queued_root_effects = [];
var flush_count = 0;
var dev_effect_stack = [];
var active_reaction = null;
function set_active_reaction(reaction) {
  active_reaction = reaction;
}
var active_effect = null;
function set_active_effect(effect2) {
  active_effect = effect2;
}
var derived_sources = null;
var new_deps = null;
var skipped_deps = 0;
var untracked_writes = null;
function set_untracked_writes(value) {
  untracked_writes = value;
}
var current_version = 1;
var skip_reaction = false;
var captured_signals = null;
var component_context = null;
var dev_current_component_function = null;
function increment_version() {
  return ++current_version;
}
function is_runes() {
  return !legacy_mode_flag || component_context !== null && component_context.l === null;
}
function check_dirtiness(reaction) {
  var flags = reaction.f;
  if ((flags & DIRTY) !== 0) {
    return true;
  }
  if ((flags & MAYBE_DIRTY) !== 0) {
    var dependencies = reaction.deps;
    var is_unowned = (flags & UNOWNED) !== 0;
    if (dependencies !== null) {
      var i;
      if ((flags & DISCONNECTED) !== 0) {
        for (i = 0; i < dependencies.length; i++) {
          (dependencies[i].reactions ??= []).push(reaction);
        }
        reaction.f ^= DISCONNECTED;
      }
      for (i = 0; i < dependencies.length; i++) {
        var dependency = dependencies[i];
        if (check_dirtiness(
          /** @type {Derived} */
          dependency
        )) {
          update_derived(
            /** @type {Derived} */
            dependency
          );
        }
        if (is_unowned && active_effect !== null && !skip_reaction && !dependency?.reactions?.includes(reaction)) {
          (dependency.reactions ??= []).push(reaction);
        }
        if (dependency.version > reaction.version) {
          return true;
        }
      }
    }
    if (!is_unowned || active_effect !== null && !skip_reaction) {
      set_signal_status(reaction, CLEAN);
    }
  }
  return false;
}
function propagate_error(error, effect2) {
  var current = effect2;
  while (current !== null) {
    if ((current.f & BOUNDARY_EFFECT) !== 0) {
      try {
        current.fn(error);
        return;
      } catch {
        current.f ^= BOUNDARY_EFFECT;
      }
    }
    current = current.parent;
  }
  is_throwing_error = false;
  throw error;
}
function should_rethrow_error(effect2) {
  return (effect2.f & DESTROYED) === 0 && (effect2.parent === null || (effect2.parent.f & BOUNDARY_EFFECT) === 0);
}
function handle_error(error, effect2, previous_effect, component_context2) {
  if (is_throwing_error) {
    if (previous_effect === null) {
      is_throwing_error = false;
    }
    if (should_rethrow_error(effect2)) {
      throw error;
    }
    return;
  }
  if (previous_effect !== null) {
    is_throwing_error = true;
  }
  if (!dev_fallback_default || component_context2 === null || !(error instanceof Error) || handled_errors.has(error)) {
    propagate_error(error, effect2);
    return;
  }
  handled_errors.add(error);
  const component_stack = [];
  const effect_name = effect2.fn?.name;
  if (effect_name) {
    component_stack.push(effect_name);
  }
  let current_context = component_context2;
  while (current_context !== null) {
    if (dev_fallback_default) {
      var filename = current_context.function?.[FILENAME];
      if (filename) {
        const file = filename.split("/").pop();
        component_stack.push(file);
      }
    }
    current_context = current_context.p;
  }
  const indent = /Firefox/.test(navigator.userAgent) ? "  " : "	";
  define_property(error, "message", {
    value: error.message + `
${component_stack.map((name) => `
${indent}in ${name}`).join("")}
`
  });
  define_property(error, "component_stack", {
    value: component_stack
  });
  const stack2 = error.stack;
  if (stack2) {
    const lines = stack2.split("\n");
    const new_lines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("svelte/src/internal")) {
        continue;
      }
      new_lines.push(line);
    }
    define_property(error, "stack", {
      value: new_lines.join("\n")
    });
  }
  propagate_error(error, effect2);
  if (should_rethrow_error(effect2)) {
    throw error;
  }
}
function update_reaction(reaction) {
  var previous_deps = new_deps;
  var previous_skipped_deps = skipped_deps;
  var previous_untracked_writes = untracked_writes;
  var previous_reaction = active_reaction;
  var previous_skip_reaction = skip_reaction;
  var prev_derived_sources = derived_sources;
  var previous_component_context = component_context;
  var flags = reaction.f;
  new_deps = /** @type {null | Value[]} */
  null;
  skipped_deps = 0;
  untracked_writes = null;
  active_reaction = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
  skip_reaction = !is_flushing_effect && (flags & UNOWNED) !== 0;
  derived_sources = null;
  component_context = reaction.ctx;
  try {
    var result = (
      /** @type {Function} */
      (0, reaction.fn)()
    );
    var deps = reaction.deps;
    if (new_deps !== null) {
      var i;
      remove_reactions(reaction, skipped_deps);
      if (deps !== null && skipped_deps > 0) {
        deps.length = skipped_deps + new_deps.length;
        for (i = 0; i < new_deps.length; i++) {
          deps[skipped_deps + i] = new_deps[i];
        }
      } else {
        reaction.deps = deps = new_deps;
      }
      if (!skip_reaction) {
        for (i = skipped_deps; i < deps.length; i++) {
          (deps[i].reactions ??= []).push(reaction);
        }
      }
    } else if (deps !== null && skipped_deps < deps.length) {
      remove_reactions(reaction, skipped_deps);
      deps.length = skipped_deps;
    }
    return result;
  } finally {
    new_deps = previous_deps;
    skipped_deps = previous_skipped_deps;
    untracked_writes = previous_untracked_writes;
    active_reaction = previous_reaction;
    skip_reaction = previous_skip_reaction;
    derived_sources = prev_derived_sources;
    component_context = previous_component_context;
  }
}
function remove_reaction(signal, dependency) {
  let reactions = dependency.reactions;
  if (reactions !== null) {
    var index2 = reactions.indexOf(signal);
    if (index2 !== -1) {
      var new_length = reactions.length - 1;
      if (new_length === 0) {
        reactions = dependency.reactions = null;
      } else {
        reactions[index2] = reactions[new_length];
        reactions.pop();
      }
    }
  }
  if (reactions === null && (dependency.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (new_deps === null || !new_deps.includes(dependency))) {
    set_signal_status(dependency, MAYBE_DIRTY);
    if ((dependency.f & (UNOWNED | DISCONNECTED)) === 0) {
      dependency.f ^= DISCONNECTED;
    }
    remove_reactions(
      /** @type {Derived} **/
      dependency,
      0
    );
  }
}
function remove_reactions(signal, start_index) {
  var dependencies = signal.deps;
  if (dependencies === null) return;
  for (var i = start_index; i < dependencies.length; i++) {
    remove_reaction(signal, dependencies[i]);
  }
}
function update_effect(effect2) {
  var flags = effect2.f;
  if ((flags & DESTROYED) !== 0) {
    return;
  }
  set_signal_status(effect2, CLEAN);
  var previous_effect = active_effect;
  var previous_component_context = component_context;
  active_effect = effect2;
  if (dev_fallback_default) {
    var previous_component_fn = dev_current_component_function;
    dev_current_component_function = effect2.component_function;
  }
  try {
    if ((flags & BLOCK_EFFECT) !== 0) {
      destroy_block_effect_children(effect2);
    } else {
      destroy_effect_children(effect2);
    }
    destroy_effect_deriveds(effect2);
    execute_effect_teardown(effect2);
    var teardown2 = update_reaction(effect2);
    effect2.teardown = typeof teardown2 === "function" ? teardown2 : null;
    effect2.version = current_version;
    if (dev_fallback_default) {
      dev_effect_stack.push(effect2);
    }
  } catch (error) {
    handle_error(error, effect2, previous_effect, previous_component_context || effect2.ctx);
  } finally {
    active_effect = previous_effect;
    if (dev_fallback_default) {
      dev_current_component_function = previous_component_fn;
    }
  }
}
function log_effect_stack() {
  console.error(
    "Last ten effects were: ",
    dev_effect_stack.slice(-10).map((d) => d.fn)
  );
  dev_effect_stack = [];
}
function infinite_loop_guard() {
  if (flush_count > 1e3) {
    flush_count = 0;
    try {
      effect_update_depth_exceeded();
    } catch (error) {
      if (dev_fallback_default) {
        define_property(error, "stack", {
          value: ""
        });
      }
      if (last_scheduled_effect !== null) {
        if (dev_fallback_default) {
          try {
            handle_error(error, last_scheduled_effect, null, null);
          } catch (e) {
            log_effect_stack();
            throw e;
          }
        } else {
          handle_error(error, last_scheduled_effect, null, null);
        }
      } else {
        if (dev_fallback_default) {
          log_effect_stack();
        }
        throw error;
      }
    }
  }
  flush_count++;
}
function flush_queued_root_effects(root_effects) {
  var length = root_effects.length;
  if (length === 0) {
    return;
  }
  infinite_loop_guard();
  var previously_flushing_effect = is_flushing_effect;
  is_flushing_effect = true;
  try {
    for (var i = 0; i < length; i++) {
      var effect2 = root_effects[i];
      if ((effect2.f & CLEAN) === 0) {
        effect2.f ^= CLEAN;
      }
      var collected_effects = [];
      process_effects(effect2, collected_effects);
      flush_queued_effects(collected_effects);
    }
  } finally {
    is_flushing_effect = previously_flushing_effect;
  }
}
function flush_queued_effects(effects) {
  var length = effects.length;
  if (length === 0) return;
  for (var i = 0; i < length; i++) {
    var effect2 = effects[i];
    if ((effect2.f & (DESTROYED | INERT)) === 0) {
      try {
        if (check_dirtiness(effect2)) {
          update_effect(effect2);
          if (effect2.deps === null && effect2.first === null && effect2.nodes_start === null) {
            if (effect2.teardown === null) {
              unlink_effect(effect2);
            } else {
              effect2.fn = null;
            }
          }
        }
      } catch (error) {
        handle_error(error, effect2, null, effect2.ctx);
      }
    }
  }
}
function process_deferred() {
  is_micro_task_queued2 = false;
  if (flush_count > 1001) {
    return;
  }
  const previous_queued_root_effects = queued_root_effects;
  queued_root_effects = [];
  flush_queued_root_effects(previous_queued_root_effects);
  if (!is_micro_task_queued2) {
    flush_count = 0;
    last_scheduled_effect = null;
    if (dev_fallback_default) {
      dev_effect_stack = [];
    }
  }
}
function schedule_effect(signal) {
  if (scheduler_mode === FLUSH_MICROTASK) {
    if (!is_micro_task_queued2) {
      is_micro_task_queued2 = true;
      queueMicrotask(process_deferred);
    }
  }
  last_scheduled_effect = signal;
  var effect2 = signal;
  while (effect2.parent !== null) {
    effect2 = effect2.parent;
    var flags = effect2.f;
    if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
      if ((flags & CLEAN) === 0) return;
      effect2.f ^= CLEAN;
    }
  }
  queued_root_effects.push(effect2);
}
function process_effects(effect2, collected_effects) {
  var current_effect = effect2.first;
  var effects = [];
  main_loop: while (current_effect !== null) {
    var flags = current_effect.f;
    var is_branch = (flags & BRANCH_EFFECT) !== 0;
    var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;
    var sibling2 = current_effect.next;
    if (!is_skippable_branch && (flags & INERT) === 0) {
      if ((flags & RENDER_EFFECT) !== 0) {
        if (is_branch) {
          current_effect.f ^= CLEAN;
        } else {
          try {
            if (check_dirtiness(current_effect)) {
              update_effect(current_effect);
            }
          } catch (error) {
            handle_error(error, current_effect, null, current_effect.ctx);
          }
        }
        var child2 = current_effect.first;
        if (child2 !== null) {
          current_effect = child2;
          continue;
        }
      } else if ((flags & EFFECT) !== 0) {
        effects.push(current_effect);
      }
    }
    if (sibling2 === null) {
      let parent = current_effect.parent;
      while (parent !== null) {
        if (effect2 === parent) {
          break main_loop;
        }
        var parent_sibling = parent.next;
        if (parent_sibling !== null) {
          current_effect = parent_sibling;
          continue main_loop;
        }
        parent = parent.parent;
      }
    }
    current_effect = sibling2;
  }
  for (var i = 0; i < effects.length; i++) {
    child2 = effects[i];
    collected_effects.push(child2);
    process_effects(child2, collected_effects);
  }
}
function flush_sync(fn) {
  var previous_scheduler_mode = scheduler_mode;
  var previous_queued_root_effects = queued_root_effects;
  try {
    infinite_loop_guard();
    const root_effects = [];
    scheduler_mode = FLUSH_SYNC;
    queued_root_effects = root_effects;
    is_micro_task_queued2 = false;
    flush_queued_root_effects(previous_queued_root_effects);
    var result = fn?.();
    flush_tasks();
    if (queued_root_effects.length > 0 || root_effects.length > 0) {
      flush_sync();
    }
    flush_count = 0;
    last_scheduled_effect = null;
    if (dev_fallback_default) {
      dev_effect_stack = [];
    }
    return result;
  } finally {
    scheduler_mode = previous_scheduler_mode;
    queued_root_effects = previous_queued_root_effects;
  }
}
function get(signal) {
  var flags = signal.f;
  var is_derived = (flags & DERIVED) !== 0;
  if (is_derived && (flags & DESTROYED) !== 0) {
    var value = execute_derived(
      /** @type {Derived} */
      signal
    );
    destroy_derived(
      /** @type {Derived} */
      signal
    );
    return value;
  }
  if (captured_signals !== null) {
    captured_signals.add(signal);
  }
  if (active_reaction !== null) {
    if (derived_sources !== null && derived_sources.includes(signal)) {
      state_unsafe_local_read();
    }
    var deps = active_reaction.deps;
    if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
      skipped_deps++;
    } else if (new_deps === null) {
      new_deps = [signal];
    } else {
      new_deps.push(signal);
    }
    if (untracked_writes !== null && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & BRANCH_EFFECT) === 0 && untracked_writes.includes(signal)) {
      set_signal_status(active_effect, DIRTY);
      schedule_effect(active_effect);
    }
  } else if (is_derived && /** @type {Derived} */
  signal.deps === null) {
    var derived2 = (
      /** @type {Derived} */
      signal
    );
    var parent = derived2.parent;
    var target = derived2;
    while (parent !== null) {
      if ((parent.f & DERIVED) !== 0) {
        var parent_derived = (
          /** @type {Derived} */
          parent
        );
        target = parent_derived;
        parent = parent_derived.parent;
      } else {
        var parent_effect = (
          /** @type {Effect} */
          parent
        );
        if (!parent_effect.deriveds?.includes(target)) {
          (parent_effect.deriveds ??= []).push(target);
        }
        break;
      }
    }
  }
  if (is_derived) {
    derived2 = /** @type {Derived} */
    signal;
    if (check_dirtiness(derived2)) {
      update_derived(derived2);
    }
  }
  if (dev_fallback_default && tracing_expressions !== null && active_reaction !== null && tracing_expressions.reaction === active_reaction) {
    if (signal.debug) {
      signal.debug();
    } else if (signal.created) {
      var entry = tracing_expressions.entries.get(signal);
      if (entry === void 0) {
        entry = { read: [] };
        tracing_expressions.entries.set(signal, entry);
      }
      entry.read.push(get_stack("TracedAt"));
    }
  }
  return signal.v;
}
var STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
function set_signal_status(signal, status) {
  signal.f = signal.f & STATUS_MASK | status;
}
function push(props, runes = false, fn) {
  component_context = {
    p: component_context,
    c: null,
    e: null,
    m: false,
    s: props,
    x: null,
    l: null
  };
  if (legacy_mode_flag && !runes) {
    component_context.l = {
      s: null,
      u: null,
      r1: [],
      r2: source(false)
    };
  }
  if (dev_fallback_default) {
    component_context.function = fn;
    dev_current_component_function = fn;
  }
}
function pop(component2) {
  const context_stack_item = component_context;
  if (context_stack_item !== null) {
    if (component2 !== void 0) {
      context_stack_item.x = component2;
    }
    const component_effects = context_stack_item.e;
    if (component_effects !== null) {
      var previous_effect = active_effect;
      var previous_reaction = active_reaction;
      context_stack_item.e = null;
      try {
        for (var i = 0; i < component_effects.length; i++) {
          var component_effect = component_effects[i];
          set_active_effect(component_effect.effect);
          set_active_reaction(component_effect.reaction);
          effect(component_effect.fn);
        }
      } finally {
        set_active_effect(previous_effect);
        set_active_reaction(previous_reaction);
      }
    }
    component_context = context_stack_item.p;
    if (dev_fallback_default) {
      dev_current_component_function = context_stack_item.p?.function ?? null;
    }
    context_stack_item.m = true;
  }
  return component2 || /** @type {T} */
  {};
}
if (dev_fallback_default) {
  let throw_rune_error = function(rune) {
    if (!(rune in globalThis)) {
      let value;
      Object.defineProperty(globalThis, rune, {
        configurable: true,
        // eslint-disable-next-line getter-return
        get: () => {
          if (value !== void 0) {
            return value;
          }
          rune_outside_svelte(rune);
        },
        set: (v) => {
          value = v;
        }
      });
    }
  };
  throw_rune_error("$state");
  throw_rune_error("$effect");
  throw_rune_error("$derived");
  throw_rune_error("$inspect");
  throw_rune_error("$props");
  throw_rune_error("$bindable");
}

// node_modules/svelte/src/internal/client/dev/css.js
var all_styles = /* @__PURE__ */ new Map();
function register_style(hash2, style) {
  var styles = all_styles.get(hash2);
  if (!styles) {
    styles = /* @__PURE__ */ new Set();
    all_styles.set(hash2, styles);
  }
  styles.add(style);
}

// node_modules/svelte/src/internal/client/dom/elements/events.js
var all_registered_events = /* @__PURE__ */ new Set();
var root_event_handles = /* @__PURE__ */ new Set();
function handle_event_propagation(event2) {
  var handler_element = this;
  var owner_document = (
    /** @type {Node} */
    handler_element.ownerDocument
  );
  var event_name = event2.type;
  var path = event2.composedPath?.() || [];
  var current_target = (
    /** @type {null | Element} */
    path[0] || event2.target
  );
  var path_idx = 0;
  var handled_at = event2.__root;
  if (handled_at) {
    var at_idx = path.indexOf(handled_at);
    if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
    window)) {
      event2.__root = handler_element;
      return;
    }
    var handler_idx = path.indexOf(handler_element);
    if (handler_idx === -1) {
      return;
    }
    if (at_idx <= handler_idx) {
      path_idx = at_idx;
    }
  }
  current_target = /** @type {Element} */
  path[path_idx] || event2.target;
  if (current_target === handler_element) return;
  define_property(event2, "currentTarget", {
    configurable: true,
    get() {
      return current_target || owner_document;
    }
  });
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    var throw_error;
    var other_errors = [];
    while (current_target !== null) {
      var parent_element = current_target.assignedSlot || current_target.parentNode || /** @type {any} */
      current_target.host || null;
      try {
        var delegated = current_target["__" + event_name];
        if (delegated !== void 0 && !/** @type {any} */
        current_target.disabled) {
          if (is_array(delegated)) {
            var [fn, ...data] = delegated;
            fn.apply(current_target, [event2, ...data]);
          } else {
            delegated.call(current_target, event2);
          }
        }
      } catch (error) {
        if (throw_error) {
          other_errors.push(error);
        } else {
          throw_error = error;
        }
      }
      if (event2.cancelBubble || parent_element === handler_element || parent_element === null) {
        break;
      }
      current_target = parent_element;
    }
    if (throw_error) {
      for (let error of other_errors) {
        queueMicrotask(() => {
          throw error;
        });
      }
      throw throw_error;
    }
  } finally {
    event2.__root = handler_element;
    delete event2.currentTarget;
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}

// node_modules/svelte/src/internal/client/dom/blocks/svelte-head.js
var head_anchor;
function reset_head_anchor() {
  head_anchor = void 0;
}

// node_modules/svelte/src/internal/client/dom/reconciler.js
function create_fragment_from_html(html2) {
  var elem = document.createElement("template");
  elem.innerHTML = html2;
  return elem.content;
}

// node_modules/svelte/src/internal/client/dom/template.js
function assign_nodes(start, end) {
  var effect2 = (
    /** @type {Effect} */
    active_effect
  );
  if (effect2.nodes_start === null) {
    effect2.nodes_start = start;
    effect2.nodes_end = end;
  }
}
// @__NO_SIDE_EFFECTS__
function template(content, flags) {
  var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
  var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;
  var node;
  var has_start = !content.startsWith("<!>");
  return () => {
    if (hydrating) {
      assign_nodes(hydrate_node, null);
      return hydrate_node;
    }
    if (node === void 0) {
      node = create_fragment_from_html(has_start ? content : "<!>" + content);
      if (!is_fragment) node = /** @type {Node} */
      get_first_child(node);
    }
    var clone = (
      /** @type {TemplateNode} */
      use_import_node ? document.importNode(node, true) : node.cloneNode(true)
    );
    if (is_fragment) {
      var start = (
        /** @type {TemplateNode} */
        get_first_child(clone)
      );
      var end = (
        /** @type {TemplateNode} */
        clone.lastChild
      );
      assign_nodes(start, end);
    } else {
      assign_nodes(clone, clone);
    }
    return clone;
  };
}
function append(anchor, dom) {
  if (hydrating) {
    active_effect.nodes_end = hydrate_node;
    hydrate_next();
    return;
  }
  if (anchor === null) {
    return;
  }
  anchor.before(
    /** @type {Node} */
    dom
  );
}

// node_modules/svelte/src/internal/client/render.js
var should_intro = true;
function mount(component2, options) {
  return _mount(component2, options);
}
function hydrate(component2, options) {
  init_operations();
  options.intro = options.intro ?? false;
  const target = options.target;
  const was_hydrating = hydrating;
  const previous_hydrate_node = hydrate_node;
  try {
    var anchor = (
      /** @type {TemplateNode} */
      get_first_child(target)
    );
    while (anchor && (anchor.nodeType !== 8 || /** @type {Comment} */
    anchor.data !== HYDRATION_START)) {
      anchor = /** @type {TemplateNode} */
      get_next_sibling(anchor);
    }
    if (!anchor) {
      throw HYDRATION_ERROR;
    }
    set_hydrating(true);
    set_hydrate_node(
      /** @type {Comment} */
      anchor
    );
    hydrate_next();
    const instance = _mount(component2, { ...options, anchor });
    if (hydrate_node === null || hydrate_node.nodeType !== 8 || /** @type {Comment} */
    hydrate_node.data !== HYDRATION_END) {
      hydration_mismatch();
      throw HYDRATION_ERROR;
    }
    set_hydrating(false);
    return (
      /**  @type {Exports} */
      instance
    );
  } catch (error) {
    if (error === HYDRATION_ERROR) {
      if (options.recover === false) {
        hydration_failed();
      }
      init_operations();
      clear_text_content(target);
      set_hydrating(false);
      return mount(component2, options);
    }
    throw error;
  } finally {
    set_hydrating(was_hydrating);
    set_hydrate_node(previous_hydrate_node);
    reset_head_anchor();
  }
}
var document_listeners = /* @__PURE__ */ new Map();
function _mount(Component, { target, anchor, props = {}, events, context, intro = true }) {
  init_operations();
  var registered_events = /* @__PURE__ */ new Set();
  var event_handle = (events2) => {
    for (var i = 0; i < events2.length; i++) {
      var event_name = events2[i];
      if (registered_events.has(event_name)) continue;
      registered_events.add(event_name);
      var passive2 = is_passive_event(event_name);
      target.addEventListener(event_name, handle_event_propagation, { passive: passive2 });
      var n = document_listeners.get(event_name);
      if (n === void 0) {
        document.addEventListener(event_name, handle_event_propagation, { passive: passive2 });
        document_listeners.set(event_name, 1);
      } else {
        document_listeners.set(event_name, n + 1);
      }
    }
  };
  event_handle(array_from(all_registered_events));
  root_event_handles.add(event_handle);
  var component2 = void 0;
  var unmount2 = component_root(() => {
    var anchor_node = anchor ?? target.appendChild(create_text());
    branch(() => {
      if (context) {
        push({});
        var ctx = (
          /** @type {ComponentContext} */
          component_context
        );
        ctx.c = context;
      }
      if (events) {
        props.$$events = events;
      }
      if (hydrating) {
        assign_nodes(
          /** @type {TemplateNode} */
          anchor_node,
          null
        );
      }
      should_intro = intro;
      component2 = Component(anchor_node, props) || {};
      should_intro = true;
      if (hydrating) {
        active_effect.nodes_end = hydrate_node;
      }
      if (context) {
        pop();
      }
    });
    return () => {
      for (var event_name of registered_events) {
        target.removeEventListener(event_name, handle_event_propagation);
        var n = (
          /** @type {number} */
          document_listeners.get(event_name)
        );
        if (--n === 0) {
          document.removeEventListener(event_name, handle_event_propagation);
          document_listeners.delete(event_name);
        } else {
          document_listeners.set(event_name, n);
        }
      }
      root_event_handles.delete(event_handle);
      if (anchor_node !== anchor) {
        anchor_node.parentNode?.removeChild(anchor_node);
      }
    };
  });
  mounted_components.set(component2, unmount2);
  return component2;
}
var mounted_components = /* @__PURE__ */ new WeakMap();
function unmount(component2, options) {
  const fn = mounted_components.get(component2);
  if (fn) {
    mounted_components.delete(component2);
    return fn(options);
  }
  if (dev_fallback_default) {
    lifecycle_double_unmount();
  }
  return Promise.resolve();
}

// node_modules/svelte/src/internal/client/dom/css.js
function append_styles(anchor, css) {
  queue_micro_task(() => {
    var root2 = anchor.getRootNode();
    var target = (
      /** @type {ShadowRoot} */
      root2.host ? (
        /** @type {ShadowRoot} */
        root2
      ) : (
        /** @type {Document} */
        root2.head ?? /** @type {Document} */
        root2.ownerDocument.head
      )
    );
    if (!target.querySelector("#" + css.hash)) {
      const style = document.createElement("style");
      style.id = css.hash;
      style.textContent = css.code;
      target.appendChild(style);
      if (dev_fallback_default) {
        register_style(css.hash, style);
      }
    }
  });
}

// node_modules/svelte/src/legacy/legacy-client.js
function createClassComponent(options) {
  return new Svelte4Component(options);
}
var Svelte4Component = class {
  /** @type {any} */
  #events;
  /** @type {Record<string, any>} */
  #instance;
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(options) {
    var sources = /* @__PURE__ */ new Map();
    var add_source = (key, value) => {
      var s = mutable_source(value);
      sources.set(key, s);
      return s;
    };
    const props = new Proxy(
      { ...options.props || {}, $$events: {} },
      {
        get(target, prop2) {
          return get(sources.get(prop2) ?? add_source(prop2, Reflect.get(target, prop2)));
        },
        has(target, prop2) {
          if (prop2 === LEGACY_PROPS) return true;
          get(sources.get(prop2) ?? add_source(prop2, Reflect.get(target, prop2)));
          return Reflect.has(target, prop2);
        },
        set(target, prop2, value) {
          set(sources.get(prop2) ?? add_source(prop2, value), value);
          return Reflect.set(target, prop2, value);
        }
      }
    );
    this.#instance = (options.hydrate ? hydrate : mount)(options.component, {
      target: options.target,
      anchor: options.anchor,
      props,
      context: options.context,
      intro: options.intro ?? false,
      recover: options.recover
    });
    if (!options?.props?.$$host || options.sync === false) {
      flush_sync();
    }
    this.#events = props.$$events;
    for (const key of Object.keys(this.#instance)) {
      if (key === "$set" || key === "$destroy" || key === "$on") continue;
      define_property(this, key, {
        get() {
          return this.#instance[key];
        },
        /** @param {any} value */
        set(value) {
          this.#instance[key] = value;
        },
        enumerable: true
      });
    }
    this.#instance.$set = /** @param {Record<string, any>} next */
    (next2) => {
      Object.assign(props, next2);
    };
    this.#instance.$destroy = () => {
      unmount(this.#instance);
    };
  }
  /** @param {Record<string, any>} props */
  $set(props) {
    this.#instance.$set(props);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(event2, callback) {
    this.#events[event2] = this.#events[event2] || [];
    const cb = (...args) => callback.call(this, ...args);
    this.#events[event2].push(cb);
    return () => {
      this.#events[event2] = this.#events[event2].filter(
        /** @param {any} fn */
        (fn) => fn !== cb
      );
    };
  }
  $destroy() {
    this.#instance.$destroy();
  }
};

// node_modules/svelte/src/internal/client/dom/elements/custom-element.js
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    /** The Svelte component constructor */
    $$ctor;
    /** Slots */
    $$s;
    /** @type {any} The Svelte component instance */
    $$c;
    /** Whether or not the custom element is connected */
    $$cn = false;
    /** @type {Record<string, any>} Component props data */
    $$d = {};
    /** `true` if currently in the process of reflecting component props back to attributes */
    $$r = false;
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    $$p_d = {};
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    $$l = {};
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    $$l_u = /* @__PURE__ */ new Map();
    /** @type {any} The managed render effect for reflecting attributes */
    $$me;
    /**
     * @param {*} $$componentCtor
     * @param {*} $$slots
     * @param {*} use_shadow_dom
     */
    constructor($$componentCtor, $$slots, use_shadow_dom) {
      super();
      this.$$ctor = $$componentCtor;
      this.$$s = $$slots;
      if (use_shadow_dom) {
        this.attachShadow({ mode: "open" });
      }
    }
    /**
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | AddEventListenerOptions} [options]
     */
    addEventListener(type, listener, options) {
      this.$$l[type] = this.$$l[type] || [];
      this.$$l[type].push(listener);
      if (this.$$c) {
        const unsub = this.$$c.$on(type, listener);
        this.$$l_u.set(listener, unsub);
      }
      super.addEventListener(type, listener, options);
    }
    /**
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | AddEventListenerOptions} [options]
     */
    removeEventListener(type, listener, options) {
      super.removeEventListener(type, listener, options);
      if (this.$$c) {
        const unsub = this.$$l_u.get(listener);
        if (unsub) {
          unsub();
          this.$$l_u.delete(listener);
        }
      }
    }
    async connectedCallback() {
      this.$$cn = true;
      if (!this.$$c) {
        let create_slot = function(name) {
          return (anchor) => {
            const slot2 = document.createElement("slot");
            if (name !== "default") slot2.name = name;
            append(anchor, slot2);
          };
        };
        await Promise.resolve();
        if (!this.$$cn || this.$$c) {
          return;
        }
        const $$slots = {};
        const existing_slots = get_custom_elements_slots(this);
        for (const name of this.$$s) {
          if (name in existing_slots) {
            if (name === "default" && !this.$$d.children) {
              this.$$d.children = create_slot(name);
              $$slots.default = true;
            } else {
              $$slots[name] = create_slot(name);
            }
          }
        }
        for (const attribute of this.attributes) {
          const name = this.$$g_p(attribute.name);
          if (!(name in this.$$d)) {
            this.$$d[name] = get_custom_element_value(name, attribute.value, this.$$p_d, "toProp");
          }
        }
        for (const key in this.$$p_d) {
          if (!(key in this.$$d) && this[key] !== void 0) {
            this.$$d[key] = this[key];
            delete this[key];
          }
        }
        this.$$c = createClassComponent({
          component: this.$$ctor,
          target: this.shadowRoot || this,
          props: {
            ...this.$$d,
            $$slots,
            $$host: this
          }
        });
        this.$$me = effect_root(() => {
          render_effect(() => {
            this.$$r = true;
            for (const key of object_keys(this.$$c)) {
              if (!this.$$p_d[key]?.reflect) continue;
              this.$$d[key] = this.$$c[key];
              const attribute_value = get_custom_element_value(
                key,
                this.$$d[key],
                this.$$p_d,
                "toAttribute"
              );
              if (attribute_value == null) {
                this.removeAttribute(this.$$p_d[key].attribute || key);
              } else {
                this.setAttribute(this.$$p_d[key].attribute || key, attribute_value);
              }
            }
            this.$$r = false;
          });
        });
        for (const type in this.$$l) {
          for (const listener of this.$$l[type]) {
            const unsub = this.$$c.$on(type, listener);
            this.$$l_u.set(listener, unsub);
          }
        }
        this.$$l = {};
      }
    }
    // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
    // and setting attributes through setAttribute etc, this is helpful
    /**
     * @param {string} attr
     * @param {string} _oldValue
     * @param {string} newValue
     */
    attributeChangedCallback(attr2, _oldValue, newValue) {
      if (this.$$r) return;
      attr2 = this.$$g_p(attr2);
      this.$$d[attr2] = get_custom_element_value(attr2, newValue, this.$$p_d, "toProp");
      this.$$c?.$set({ [attr2]: this.$$d[attr2] });
    }
    disconnectedCallback() {
      this.$$cn = false;
      Promise.resolve().then(() => {
        if (!this.$$cn && this.$$c) {
          this.$$c.$destroy();
          this.$$me();
          this.$$c = void 0;
        }
      });
    }
    /**
     * @param {string} attribute_name
     */
    $$g_p(attribute_name) {
      return object_keys(this.$$p_d).find(
        (key) => this.$$p_d[key].attribute === attribute_name || !this.$$p_d[key].attribute && key.toLowerCase() === attribute_name
      ) || attribute_name;
    }
  };
}
function get_custom_element_value(prop2, value, props_definition, transform) {
  const type = props_definition[prop2]?.type;
  value = type === "Boolean" && typeof value !== "boolean" ? value != null : value;
  if (!transform || !props_definition[prop2]) {
    return value;
  } else if (transform === "toAttribute") {
    switch (type) {
      case "Object":
      case "Array":
        return value == null ? null : JSON.stringify(value);
      case "Boolean":
        return value ? "" : null;
      case "Number":
        return value == null ? null : value;
      default:
        return value;
    }
  } else {
    switch (type) {
      case "Object":
      case "Array":
        return value && JSON.parse(value);
      case "Boolean":
        return value;
      // conversion already handled above
      case "Number":
        return value != null ? +value : value;
      default:
        return value;
    }
  }
}
function get_custom_elements_slots(element2) {
  const result = {};
  element2.childNodes.forEach((node) => {
    result[
      /** @type {Element} node */
      node.slot || "default"
    ] = true;
  });
  return result;
}

// src/plugins/PermissionsViewer/Hello.svelte
var root = template(`<div id="idk" class="PermissionsViewer-b54u5w">Hello World!</div>`);
var $$css = {
  hash: "PermissionsViewer-b54u5w",
  code: "#idk.PermissionsViewer-b54u5w {color:orange;}"
};
function Hello($$anchor) {
  append_styles($$anchor, $$css);
  var div = root();
  append($$anchor, div);
}

// src/plugins/PermissionsViewer/index.ts
var { ContextMenu, DOM, Utils, Webpack, UI, ReactUtils } = BdApi;
var GuildStore = Webpack.getStore("GuildStore");
var SelectedGuildStore = Webpack.getStore("SelectedGuildStore");
var MemberStore = Webpack.getStore("GuildMemberStore");
var UserStore = Webpack.getStore("UserStore");
var DiscordPermissions = Webpack.getModule((m) => m.ADD_REACTIONS, { searchExports: true });
var AvatarDefaults = Webpack.getByKeys("DEFAULT_AVATARS") ?? { DEFAULT_AVATARS: ["/assets/a0180771ce23344c2a95.png", "/assets/ca24969f2fd7a9fb03d5.png", "/assets/974be2a933143742e8b1.png", "/assets/999edf6459b7dacdcadf.png", "/assets/887bc8fac6c9878f058a.png", "/assets/1256b1e634d7274dd430.png"] };
var ElectronModule = BdApi.Webpack.getByKeys("setBadge");
var intlModule = BdApi.Webpack.getByKeys("intl");
var getRoles = (guild) => guild?.roles ?? GuildStore?.getRoles(guild?.id);
var getHashString = (hash2) => intlModule?.intl.string(hash2);
var getPermString = (perm) => intlModule?.intl.string(intlModule.t[PermissionStringMap[perm]]) ?? perm.toString();
var PermissionStringMap = {
  ADD_REACTIONS: "yEoJAg",
  ADMINISTRATOR: "dwlcc3",
  ATTACH_FILES: "3AS4UF",
  BAN_MEMBERS: "2a50fH",
  CHANGE_NICKNAME: "ieWVpK",
  CONNECT: "S0W8Z2",
  CREATE_EVENTS: "qyjZub",
  CREATE_GUILD_EXPRESSIONS: "HarVuL",
  CREATE_INSTANT_INVITE: "0BNJdX",
  CREATE_PRIVATE_THREADS: "QwbTSU",
  CREATE_PUBLIC_THREADS: "25rKnZ",
  DEAFEN_MEMBERS: "9L47Fh",
  EMBED_LINKS: "969dEB",
  KICK_MEMBERS: "pBNv6u",
  MANAGE_CHANNELS: "9qLtWl",
  MANAGE_EVENTS: "HIgA5e",
  MANAGE_GUILD_EXPRESSIONS: "bbuXIi",
  MANAGE_MESSAGES: "ZGbTc3",
  MANAGE_NICKNAMES: "t+Ct5+",
  MANAGE_ROLES: "C8d+oK",
  MANAGE_GUILD: "QZRcfH",
  MANAGE_THREADS: "kEqgr6",
  MANAGE_WEBHOOKS: "/ADKmJ",
  MENTION_EVERYONE: "Y78KGB",
  MODERATE_MEMBERS: "7DgVBg",
  MOVE_MEMBERS: "YtjJPT",
  MUTE_MEMBERS: "8EI309",
  PRIORITY_SPEAKER: "BVK71t",
  READ_MESSAGE_HISTORY: "l9ufaW",
  REQUEST_TO_SPEAK: "hLbG5O",
  SEND_MESSAGES: "T32rkJ",
  SEND_MESSAGES_IN_THREADS: "fTE74u",
  SEND_POLLS: "UMQ7W1",
  SEND_TTS_MESSAGES: "Mg7bkp",
  SEND_VOICE_MESSAGES: "WlWSBQ",
  SET_VOICE_CHANNEL_STATUS: "VBwkUV",
  SPEAK: "8w1tIS",
  STREAM: "UPvOiY",
  USE_APPLICATION_COMMANDS: "shbR1d",
  USE_CLYDE_AI: "8eeEZm",
  USE_EMBEDDED_ACTIVITIES: "rLSGen",
  USE_EXTERNAL_APPS: "TtA5rK",
  USE_EXTERNAL_EMOJIS: "BpBGZW",
  USE_EXTERNAL_SOUNDS: "pwaVJy",
  USE_EXTERNAL_STICKERS: "ERNhYW",
  USE_SOUNDBOARD: "Bco7ND",
  USE_VAD: "08zAV1",
  VIEW_AUDIT_LOG: "fZgLpK",
  VIEW_CHANNEL: "W/A4Qk",
  VIEW_CREATOR_MONETIZATION_ANALYTICS: "0lTLTk",
  VIEW_GUILD_ANALYTICS: "rQJBEx"
};
var PermissionsViewer = class extends Plugin {
  constructor(meta) {
    super(meta, config_default);
  }
  sectionHTML = "";
  itemHTML = "";
  modalHTML = "";
  contextMenuPatches = [];
  onStart() {
    DOM.addStyle(this.meta.name, styles_default);
    const ModalClasses = Webpack.getByKeys("root", "header", "small");
    const PopoutRoleClasses = Webpack.getByKeys("roleCircle");
    const EyebrowClasses = Webpack.getByKeys("defaultColor", "eyebrow");
    const UserPopoutClasses = Object.assign(
      { section: "section_ba4d80", heading: "heading_ba4d80", root: "root_c83b44" },
      Webpack.getByKeys("userPopoutOuter"),
      EyebrowClasses,
      PopoutRoleClasses,
      Webpack.getByKeys("root", "expandButton"),
      Webpack.getModule((m) => m?.heading && m?.section && Object.keys(m)?.length === 2)
    );
    const RoleClasses = Object.assign({}, PopoutRoleClasses, EyebrowClasses, Webpack.getByKeys("role", "roleName", "roleCircle"));
    const BackdropClasses = Webpack.getByKeys("backdrop");
    this.sectionHTML = formatString(list_default, RoleClasses, UserPopoutClasses);
    this.itemHTML = formatString(item_default, RoleClasses);
    this.modalHTML = formatString(modal_default, BackdropClasses ?? {}, { root: ModalClasses?.root ?? "root_f9a4c9", small: ModalClasses?.small ?? "small_f9a4c9" });
    if (this.settings.popouts) this.bindPopouts();
    if (this.settings.contextMenus) this.bindContextMenus();
    this.setDisplayMode(this.settings.displayMode);
  }
  onStop() {
    DOM.removeStyle(this.meta.name);
    this.unbindPopouts();
    this.unbindContextMenus();
  }
  setDisplayMode(mode) {
    if (mode === "cozy") DOM.addStyle(this.meta.name + "-jumbo", jumbo_default);
    else DOM.removeStyle(this.meta.name + "-jumbo");
  }
  patchPopouts(e) {
    const popoutMount = (props2) => {
      const popout2 = document.querySelector(`[class*="userPopout_"], [class*="outer_"]`);
      if (!popout2 || popout2.querySelector("#permissions-popout")) return;
      const user = MemberStore?.getMember(props2.displayProfile.guildId, props2.user.id);
      const guild = GuildStore?.getGuild(props2.displayProfile.guildId);
      const name = MemberStore?.getNick(props2.displayProfile.guildId, props2.user.id) ?? props2.user.username;
      if (!user || !guild || !name) return;
      const userRoles = user.roles.slice(0);
      userRoles.push(guild.id);
      userRoles.reverse();
      let perms = 0n;
      const permBlock = DOM.parseHTML(formatString(this.sectionHTML, { sectionTitle: this.strings.popoutLabel }));
      const memberPerms = permBlock.querySelector(".member-perms");
      const referenceRoles = getRoles(guild);
      if (!referenceRoles) return;
      for (let r = 0; r < userRoles.length; r++) {
        const role = userRoles[r];
        if (!referenceRoles[role]) continue;
        perms = perms | referenceRoles[role].permissions;
        for (const perm in DiscordPermissions) {
          const permName = getPermString(perm) || perm.split("_").map((n) => n[0].toUpperCase() + n.slice(1).toLowerCase()).join(" ");
          const hasPerm = (perms & DiscordPermissions[perm]) == DiscordPermissions[perm];
          if (hasPerm && !memberPerms.querySelector(`[data-name="${permName}"]`)) {
            const element3 = DOM.parseHTML(this.itemHTML);
            let roleColor = referenceRoles[role].colorString;
            element3.querySelector(".name").textContent = permName;
            element3.setAttribute("data-name", permName);
            if (!roleColor) roleColor = "#B9BBBE";
            element3.querySelector(".perm-circle").style.backgroundColor = rgbToAlpha(roleColor, 1);
            memberPerms.prepend(element3);
          }
        }
      }
      permBlock.querySelector(".perm-details")?.addEventListener("click", () => {
        this.showModal(this.createModalUser(name, user, guild));
      });
      const roleList = popout2.querySelector(`[class*="section_"]`);
      roleList?.parentElement?.parentNode?.append(permBlock);
      const popoutInstance = ReactUtils.getOwnerInstance(popout2, { include: ["Popout"] });
      if (!popoutInstance || !popoutInstance.updateOffsets) return;
      popoutInstance.updateOffsets();
    };
    if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element)) return;
    const element2 = e.addedNodes[0];
    const popout = element2.querySelector(`[class*="userPopout_"], [class*="outer_"]`) ?? element2;
    if (!popout || !popout.matches(`[class*="userPopout_"], [class*="outer_"]`)) return;
    const props = Utils.findInTree(ReactUtils.getInternalInstance(popout), (m) => m && m.user, { walkable: ["memoizedProps", "return"] });
    popoutMount(props);
  }
  bindPopouts() {
    this.observer = this.patchPopouts.bind(this);
  }
  unbindPopouts() {
    this.observer = void 0;
  }
  async bindContextMenus() {
    this.patchChannelContextMenu();
    this.patchGuildContextMenu();
    this.patchUserContextMenu();
  }
  unbindContextMenus() {
    for (const cancel of this.contextMenuPatches) cancel();
  }
  patchGuildContextMenu() {
    this.contextMenuPatches.push(ContextMenu.patch("guild-context", (retVal, props) => {
      if (!props?.guild) return retVal;
      const newItem = ContextMenu.buildItem({
        label: this.strings.contextMenuLabel,
        action: () => {
          this.showModal(this.createModalGuild(props.guild.name, props.guild));
        }
      });
      retVal.props.children?.splice(1, 0, newItem);
    }));
  }
  patchChannelContextMenu() {
    this.contextMenuPatches.push(ContextMenu.patch("channel-context", (retVal, props) => {
      const newItem = ContextMenu.buildItem({
        label: this.strings.contextMenuLabel,
        action: () => {
          if (!Object.keys(props.channel.permissionOverwrites).length) return UI.showToast(`#${props.channel.name} has no permission overrides`, { type: "info" });
          this.showModal(this.createModalChannel(props.channel.name, props.channel, props.guild));
        }
      });
      retVal.props.children?.splice(1, 0, newItem);
    }));
  }
  patchUserContextMenu() {
    this.contextMenuPatches.push(ContextMenu.patch("user-context", (retVal, props) => {
      const guild = GuildStore?.getGuild(props.guildId);
      if (!guild) return;
      const newItem = ContextMenu.buildItem({
        label: this.strings.contextMenuLabel,
        action: () => {
          const user = MemberStore?.getMember(props.guildId, props.user.id);
          if (!user) return;
          const name = user.nick ? user.nick : props.user.username;
          this.showModal(this.createModalUser(name, user, guild));
        }
      });
      retVal?.props?.children?.[0]?.props?.children?.splice(2, 0, newItem);
    }));
  }
  showModal(modal) {
    const popout = document.querySelector(`[class*="userPopoutOuter-"]`);
    if (popout) popout.style.display = "none";
    const app = document.querySelector(".app-19_DXt");
    if (app) app.append(modal);
    else document.querySelector("#app-mount")?.append(modal);
    const closeModal = (event2) => {
      if (event2.key !== "Escape") return;
      modal.classList.add("closing");
      setTimeout(() => {
        modal.remove();
      }, 300);
    };
    const temp = DOM.createElement("div");
    modal.append(temp);
    mount(Hello, { target: modal });
    document.addEventListener("keydown", closeModal, true);
    DOM.onRemoved(modal, () => document.removeEventListener("keydown", closeModal, true));
  }
  createModalChannel(name, channel, guild) {
    return this.createModal(`#${name}`, channel.permissionOverwrites, getRoles(guild), true);
  }
  createModalUser(name, user, guild) {
    const guildRoles = Object.assign({}, getRoles(guild));
    const userRoles = user.roles.slice(0).filter((r) => typeof guildRoles[r] !== "undefined");
    userRoles.push(guild.id);
    userRoles.sort((a, b) => {
      return guildRoles[b].position - guildRoles[a].position;
    });
    if (user.userId == guild.ownerId) {
      const ALL_PERMISSIONS = Object.values(DiscordPermissions).reduce((all, p) => all | p);
      userRoles.push(user.userId);
      guildRoles[user.userId] = { name: this.strings.modal.owner ?? "", permissions: ALL_PERMISSIONS };
    }
    return this.createModal(name, userRoles, guildRoles);
  }
  createModalGuild(name, guild) {
    return this.createModal(name, getRoles(guild));
  }
  createModal(title, displayRoles, referenceRoles, isOverride) {
    if (!referenceRoles) referenceRoles = displayRoles;
    const modal = DOM.parseHTML(formatString(formatString(this.modalHTML, this.strings.modal), { name: Utils.escapeHTML(title) }));
    const closeModal = () => {
      modal.classList.add("closing");
      setTimeout(() => {
        modal.remove();
      }, 300);
    };
    modal.querySelector(".callout-backdrop")?.addEventListener("click", closeModal);
    for (const r in displayRoles) {
      const role = Array.isArray(displayRoles) ? displayRoles[r] : r;
      const user = UserStore?.getUser(role) || { getAvatarURL: () => AvatarDefaults.DEFAULT_AVATARS[Math.floor(Math.random() * AvatarDefaults.DEFAULT_AVATARS.length)], username: role };
      const member = MemberStore?.getMember(SelectedGuildStore?.getGuildId() ?? "", role) || { colorString: "" };
      const item = DOM.parseHTML(!isOverride || displayRoles[role].type == 0 ? modalbutton_default : formatString(modalbuttonuser_default, { avatarUrl: user.getAvatarURL(null, 16, true) }));
      if (!isOverride || displayRoles[role].type == 0) item.style.color = referenceRoles[role].colorString;
      else item.style.color = member.colorString;
      if (isOverride) item.querySelector(".role-name").innerHTML = Utils.escapeHTML(displayRoles[role].type == 0 ? referenceRoles[role].name : user.username);
      else item.querySelector(".role-name").innerHTML = Utils.escapeHTML(referenceRoles[role].name);
      modal.querySelector(".role-scroller").append(item);
      item.addEventListener("click", () => {
        modal.querySelectorAll(".role-item.selected").forEach((e) => e.classList.remove("selected"));
        item.classList.add("selected");
        const allowed = isOverride ? displayRoles[role].allow : referenceRoles[role].permissions;
        const denied = isOverride ? displayRoles[role].deny : null;
        const permList = modal.querySelector(".perm-scroller");
        permList.innerHTML = "";
        for (const perm in DiscordPermissions) {
          const element2 = DOM.parseHTML(modalitem_default);
          const permAllowed = (allowed & DiscordPermissions[perm]) == DiscordPermissions[perm];
          const permDenied = isOverride ? (denied & DiscordPermissions[perm]) == DiscordPermissions[perm] : !permAllowed;
          if (!permAllowed && !permDenied) continue;
          if (permAllowed) {
            element2.classList.add("allowed");
            element2.prepend(DOM.parseHTML(permallowed_default));
          }
          if (permDenied) {
            element2.classList.add("denied");
            element2.prepend(DOM.parseHTML(permdenied_default));
          }
          element2.querySelector(".perm-name").textContent = getPermString(perm) || perm.split("_").map((n) => n[0].toUpperCase() + n.slice(1).toLowerCase()).join(" ");
          permList.append(element2);
        }
      });
      item.addEventListener("contextmenu", (e) => {
        ContextMenu.open(e, ContextMenu.buildMenu([
          {
            label: getHashString("rCaznZ") ?? "Copy ID",
            action: () => {
              ElectronModule?.copy(role);
            }
          }
        ]));
      });
    }
    modal.querySelector(".role-item")?.click();
    return modal;
  }
  getSettingsPanel() {
    return this.buildSettingsPanel((_, id, checked) => {
      if (id == "popouts") {
        if (checked) this.bindPopouts();
        else this.unbindPopouts();
      }
      if (id == "contextMenus") {
        if (checked) this.bindContextMenus();
        this.unbindContextMenus();
      }
      if (id == "displayMode") this.setDisplayMode(checked);
    });
  }
};

/*@end@*/