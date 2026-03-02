import type {Component, ReactElement} from "react";

import Plugin from "@common/plugin";
import formatString from "@common/formatstring";

import type {Meta} from "@betterdiscord/meta";

import type {Channel, Guild, GuildMember, GuildRole, PermissionOverwrite, User} from "@discord";
import type {ClassModule, DiscordPermissions as IDiscordPermissions} from "@discord/modules";

import Config from "./config";

import DefaultCSS from "./styles.css";
import JumboCSS from "./jumbo.css";

import SectionHTML from "./list.html";
import ItemHTML from "./item.html";
import ModalHTML from "./modal.html";
import ModalItemHTML from "./modalitem.html";
import ModalButtonHTML from "./modalbutton.html";
import ModalButtonUserHTML from "./modalbuttonuser.html";

import PermAllowedSVG from "./permallowed.svg";
import PermDeniedSVG from "./permdenied.svg";
import {rgbToAlpha} from "@common/colors";
import PermissionModal from "./components/PermissionViewerModal.svelte";
import {mount, unmount} from "svelte";
import {getDefinitions} from "./perms";


type DisplayMode = "cozy" | "compact";


const {ContextMenu, DOM, Utils, Webpack, UI, ReactUtils} = BdApi;

const GuildStore = Webpack.getStore<{getGuild(id: string): Guild;}>("GuildStore");
const SelectedGuildStore = Webpack.getStore<{getGuildId(): string;}>("SelectedGuildStore");
const GuildRoleStore = Webpack.getStore<{getRolesSnapshot(id: string): Record<string, GuildRole>;}>("GuildRoleStore");
const MemberStore = Webpack.getStore<{getNick(gid: string, uid: string): string; getMembers(id: string): GuildMember[]; getMember(gid: string, uid: string): GuildMember;}>("GuildMemberStore");
const UserStore = Webpack.getStore<{getUser(id: string): User;}>("UserStore");
const DiscordPermissions = Webpack.getModule<IDiscordPermissions>(m => m.ADD_REACTIONS, {searchExports: true});
const AvatarDefaults = Webpack.getByKeys<{DEFAULT_AVATARS: string[];}>("DEFAULT_AVATARS") ?? {DEFAULT_AVATARS: ["/assets/a0180771ce23344c2a95.png", "/assets/ca24969f2fd7a9fb03d5.png", "/assets/974be2a933143742e8b1.png", "/assets/999edf6459b7dacdcadf.png", "/assets/887bc8fac6c9878f058a.png", "/assets/1256b1e634d7274dd430.png"]};
const ElectronModule = BdApi.Webpack.getByKeys<{copy(s: string): void;}>("setBadge");
const intlModule = BdApi.Webpack.getByKeys<{intl: {string(hash: string): string;}; t: Record<string, string>;}>("intl");


const getRoles = (guild: {roles?: Record<string, GuildRole>; id: string;}): Record<string, GuildRole> | undefined => guild?.roles ?? GuildRoleStore?.getRolesSnapshot(guild?.id);
const getHashString = (hash: string) => intlModule?.intl.string(hash);
const getPermString = (perm: keyof IDiscordPermissions) => intlModule?.intl.string(intlModule.t[PermissionStringMap[perm]]) ?? perm.toString();

const PermissionStringMap: Record<keyof IDiscordPermissions, string> = {
    ADD_REACTIONS: "yEoJAg",
    ADMINISTRATOR: "dwlcc3",
    ATTACH_FILES: "3AS4UF",
    BAN_MEMBERS: "2a50fH",
    BYPASS_SLOWMODE: "kqcjeV",
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
    PIN_MESSAGES: "Y5BI39",
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
    // USE_CLYDE_AI: "8eeEZm",
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
    VIEW_GUILD_ANALYTICS: "rQJBEx",
};

function isOverwriteEmpty(overwrite: PermissionOverwrite): boolean {
    return !overwrite.allow && !overwrite.deny && overwrite.type == 0;
}

/**
 * For some reason, Discord sometimes creates an overwrite object for the
 * `@everyone` role that has no permissions set.
 * @param channel
 * @returns
 */
function hasOverwrites(channel: Channel): boolean {
    const roleIds = Object.keys(channel.permissionOverwrites);
    if (roleIds.length === 0) return false;
    if (roleIds.length === 1 && isOverwriteEmpty(channel.permissionOverwrites[roleIds[0]])) return false;
    return true;
}

export default class PermissionsViewer extends Plugin {
    constructor(meta: Meta) {super(meta, Config);}

    sectionHTML: string;
    itemHTML: string;
    modalHTML: string;
    contextMenuPatches: (() => void)[] = [];

    onStart() {
        DOM.addStyle(this.meta.name, DefaultCSS);

        const ModalClasses = Webpack.getByKeys<ClassModule>("root", "header", "small");
        const PopoutRoleClasses = Webpack.getByKeys("roleCircle");
        const EyebrowClasses = Webpack.getByKeys("defaultColor", "eyebrow");
        const UserPopoutClasses = Object.assign(
            {section: "section_ba4d80", heading: "heading_ba4d80", root: "root_c83b44"},
            Webpack.getByKeys("userPopoutOuter"),
            EyebrowClasses,
            PopoutRoleClasses,
            Webpack.getByKeys("root", "expandButton"),
            Webpack.getModule(m => m?.heading && m?.section && Object.keys(m)?.length === 2)
        );
        const RoleClasses = Object.assign({}, PopoutRoleClasses, EyebrowClasses, Webpack.getByKeys("role", "roleName", "roleCircle"));
        const BackdropClasses = Webpack.getByKeys<ClassModule>("backdrop");

        this.sectionHTML = formatString(SectionHTML, RoleClasses, UserPopoutClasses);
        this.itemHTML = formatString(ItemHTML, RoleClasses);
        this.modalHTML = formatString(ModalHTML, BackdropClasses?.backdrop ? {backdrop: BackdropClasses.backdrop} : {}, {root: ModalClasses?.root ?? "root_f9a4c9", small: ModalClasses?.small ?? "small_f9a4c9"});

        if (this.settings.popouts) this.bindPopouts();
        if (this.settings.contextMenus) this.bindContextMenus();
        this.setDisplayMode(this.settings.displayMode as DisplayMode);
    }

    onStop() {
        DOM.removeStyle(this.meta.name);
        this.unbindPopouts();
        this.unbindContextMenus();
    }

    setDisplayMode(mode: DisplayMode) {
        if (mode === "cozy") DOM.addStyle(this.meta.name + "-jumbo", JumboCSS);
        else DOM.removeStyle(this.meta.name + "-jumbo");
    }

    patchPopouts(e: MutationRecord) {
        const popoutMount = (props: {displayProfile: {guildId: string;}; user: User;}) => {
            if (!props || !props.displayProfile || !props.user) return;
            const popout = document.querySelector<HTMLDivElement>(`[class*="userPopout_"], [class*="outer_"]`);
            if (!popout || popout.querySelector("#permissions-popout")) return;
            const user = MemberStore?.getMember(props.displayProfile.guildId, props.user.id);
            const guild = GuildStore?.getGuild(props.displayProfile.guildId);
            const name = MemberStore?.getNick(props.displayProfile.guildId, props.user.id) ?? props.user.username;
            if (!user || !guild || !name) return;

            const userRoles = user.roles.slice(0);
            userRoles.push(guild.id);
            userRoles.reverse();
            let perms = 0n;
            const permBlock = DOM.parseHTML(formatString(this.sectionHTML, {sectionTitle: this.strings.popoutLabel})) as HTMLDivElement;
            const memberPerms = permBlock.querySelector<HTMLDivElement>(".member-perms") as HTMLDivElement;

            const referenceRoles = getRoles(guild);
            if (!referenceRoles) return;
            for (let r = 0; r < userRoles.length; r++) {
                const role = userRoles[r];
                if (!referenceRoles[role]) continue;
                perms = perms | referenceRoles[role].permissions;
                for (const perm in DiscordPermissions) {
                    const permName = getPermString(perm as keyof IDiscordPermissions) || perm.split("_").map(n => n[0].toUpperCase() + n.slice(1).toLowerCase()).join(" ");
                    const hasPerm = (perms & DiscordPermissions[perm as keyof typeof DiscordPermissions]!) == DiscordPermissions[perm as keyof typeof DiscordPermissions];
                    if (hasPerm && !memberPerms.querySelector(`[data-name="${permName}"]`)) {
                        const element = DOM.parseHTML(this.itemHTML) as HTMLDivElement;
                        // element.classList.add(RoleClasses.rolePill);
                        let roleColor = referenceRoles[role].colorString;
                        element.querySelector<HTMLDivElement>(".name")!.textContent = permName;
                        element.setAttribute("data-name", permName);
                        if (!roleColor) roleColor = "#B9BBBE";
                        element.querySelector<HTMLDivElement>(".perm-circle")!.style.backgroundColor = rgbToAlpha(roleColor, 1);
                        // element.style.borderColor = ColorConverter.rgbToAlpha(roleColor, 0.6);
                        memberPerms.prepend(element);
                    }
                }
            }

            permBlock.querySelector<HTMLSpanElement>(".perm-details")?.addEventListener("click", () => {
                popoutInstance?.props?.targetRef?.current?.click(); // Close the popout
                document.querySelector<HTMLDivElement>(`[class*="backdrop__"]`)?.click(); // Close the modal
                // this.showModal(this.createModalUser(name, user, guild));
                this.createModalUser(name, user, guild);
            });

            let roleList = popout.querySelector<HTMLDivElement>(`[class*="root_"]`);
            if (roleList?.parentElement?.className.includes("section")) roleList = roleList.parentElement as HTMLDivElement;
            roleList?.after(permBlock);

            const popoutInstance = Utils.findInTree<Component & {updatePosition(): void; props: {targetRef: {current: HTMLElement | null;};};}>(
                ReactUtils.getInternalInstance(popout),
                (m: {updatePosition?: () => void;}) => m && m.updatePosition,
                {walkable: ["stateNode", "return"]}
            );
            if (!popoutInstance || !popoutInstance.updatePosition) return;
            popoutInstance.updatePosition();
        };

        if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element)) return;
        const element = e.addedNodes[0];
        const popout = element.querySelector<HTMLDivElement>(`[class*="userPopout_"], [class*="outer_"]`) ?? element as HTMLDivElement;

        if (!popout || !popout.matches(`[class*="userPopout_"], [class*="outer_"]`)) return;
        const props = Utils.findInTree<{displayProfile: {guildId: string;}; user: User;}>(ReactUtils.getInternalInstance(popout), (m: {user?: User;}) => m && m.user, {walkable: ["memoizedProps", "return"]});
        popoutMount(props);
    }

    bindPopouts() {
        this.observer = this.patchPopouts.bind(this);
    }

    unbindPopouts() {
        this.observer = undefined;
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
        this.contextMenuPatches.push(ContextMenu.patch("guild-context", (retVal: ReactElement<{children?: ReactElement[];}>, props) => {
            if (!props?.guild) return retVal; // Ignore non-guild items
            const newItem = ContextMenu.buildItem({
                label: this.strings.contextMenuLabel,
                action: () => {
                    // this.showModal(this.createModalGuild(props.guild.name, props.guild));
                    this.createModalGuild(props.guild.name, props.guild);
                }
            });
            retVal.props.children?.splice(1, 0, newItem);
        }));
    }

    patchChannelContextMenu() {
        this.contextMenuPatches.push(ContextMenu.patch("channel-context", (retVal: ReactElement<{children?: ReactElement[];}>, props) => {
            const newItem = ContextMenu.buildItem({
                label: this.strings.contextMenuLabel,
                action: () => {
                    if (!hasOverwrites(props.channel)) return UI.showToast(`#${props.channel.name} has no permission overrides`, {type: "info"});
                    // this.showModal(this.createModalChannel(props.channel.name, props.channel, props.guild));
                    this.createModalChannel(props.channel.name, props.channel, props.guild);
                }
            });
            retVal.props.children?.splice(1, 0, newItem);
        }));
    }

    patchUserContextMenu() {
        this.contextMenuPatches.push(ContextMenu.patch("user-context", (retVal: ReactElement<{children?: ReactElement<{children?: ReactElement[];}>[];}>, props) => {
            const guild = GuildStore?.getGuild(props.guildId);
            if (!guild) return;

            const newItem = ContextMenu.buildItem({
                label: this.strings.contextMenuLabel,
                action: () => {
                    const user = MemberStore?.getMember(props.guildId, props.user.id);
                    if (!user) return;
                    const name = user.nick ? user.nick : props.user.username;
                    // this.showModal(this.createModalUser(name, user, guild));
                    this.createModalUser(name, user, guild);
                }
            });
            retVal?.props?.children?.[0]?.props?.children?.splice(2, 0, newItem);
        }));
    }

    // showModal(modal: HTMLDivElement) {
    //     return;
    //     const popout = document.querySelector<HTMLDivElement>(`[class*="userPopoutOuter-"]`);
    //     if (popout) popout.style.display = "none";
    //     const app = document.querySelector(".app-19_DXt");
    //     if (app) app.append(modal);
    //     else document.querySelector<HTMLDivElement>("#app-mount")?.append(modal);

    //     const closeModal = (event: KeyboardEvent) => {
    //         if (event.key !== "Escape") return;
    //         modal.classList.add("closing");
    //         setTimeout(() => {modal.remove();}, 300);
    //     };
    //     document.addEventListener("keydown", closeModal, true);
    //     DOM.onRemoved(modal, () => document.removeEventListener("keydown", closeModal, true));
    // }

    createModalChannel(name: string, channel: Channel, guild: Guild) {
        return this.createModal({title: `#${name}`}, channel.permissionOverwrites, getRoles(guild), true);
    }

    createModalUser(name: string, user: GuildMember, guild: Guild) {
        const guildRoles = Object.assign({}, getRoles(guild)) as Record<string, Partial<GuildRole>>;
        const userRoles = user.roles.slice(0).filter(r => typeof (guildRoles[r]) !== "undefined");

        userRoles.push(guild.id);
        userRoles.sort((a, b) => {return guildRoles[b].position! - guildRoles[a].position!;});

        if (user.userId == guild.ownerId) {
            const ALL_PERMISSIONS = Object.values(DiscordPermissions!).reduce((all, p) => all | p);
            userRoles.push("@owner");
            guildRoles["@owner"] = {name: (this.strings.modal as Record<string, string>).owner ?? "", permissions: ALL_PERMISSIONS};
        }
        const userInstance = UserStore?.getUser(user.userId);
        return this.createModal({title: name, avatarUrl: userInstance?.getAvatarURL(null, 128, true)}, userRoles, guildRoles);
    }

    // https://cdn.discordapp.com/icons/947985618502307840/d021915c6f7e81a81af16cf482dc9676.webp?size=80&quality=lossless
    createModalGuild(name: string, guild: Guild) {
        return this.createModal(
            {
                title: name,
                avatarUrl: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128&quality=lossless` : undefined
            },
            getRoles(guild)!
        );
    }

    createModal<T extends boolean = false>(
        title: {
            title: string;
            subtitle?: string;
            avatarUrl?: string;
        },
        displayRoles: T extends true ? Record<string, PermissionOverwrite> : Array<string> | Record<string, Partial<GuildRole>>,
        referenceRoles?: Record<string, Partial<GuildRole>>,
        isOverride?: T
    ) {
        // @ts-expect-error This whole function needs to be rewritten to get rid of hacks like this
        if (!referenceRoles) referenceRoles = displayRoles;
        // const modal = DOM.parseHTML(formatString(formatString(this.modalHTML, this.strings.modal as Record<string, string>), {name: Utils.escapeHTML(title.title)})) as HTMLDivElement;
        // const closeModal = () => {
        //     modal.classList.add("closing");
        //     setTimeout(() => {modal.remove();}, 300);
        // };
        // modal.querySelector(".callout-backdrop")?.addEventListener("click", closeModal);

        // for (const r in displayRoles) {
        //     const role = (Array.isArray(displayRoles) ? displayRoles[r as keyof Array<string>] : r) as keyof typeof displayRoles;
        //     const user = UserStore?.getUser(role as string) || {getAvatarURL: () => AvatarDefaults.DEFAULT_AVATARS[Math.floor(Math.random() * AvatarDefaults.DEFAULT_AVATARS.length)], username: role as string};
        //     const member = MemberStore?.getMember(SelectedGuildStore?.getGuildId() ?? "", role as string) || {colorString: ""};
        //     const item = DOM.parseHTML(!isOverride || (displayRoles[role] as PermissionOverwrite).type == 0 ? ModalButtonHTML : formatString(ModalButtonUserHTML, {avatarUrl: user.getAvatarURL(null, 16, true)})) as HTMLDivElement; // getAvatarURL(guildId, size, canAnimate);
        //     if (!isOverride || (displayRoles[role] as PermissionOverwrite).type == 0) item.style.color = referenceRoles![role as keyof typeof referenceRoles].colorString as string;
        //     else item.style.color = member.colorString;
        //     if (isOverride) item.querySelector(".role-name")!.innerHTML = Utils.escapeHTML((displayRoles[role] as PermissionOverwrite).type == 0 ? (referenceRoles![role as keyof typeof referenceRoles] as GuildRole).name : user.username);
        //     else item.querySelector(".role-name")!.innerHTML = Utils.escapeHTML((referenceRoles![role as keyof typeof referenceRoles] as GuildRole).name);
        //     modal.querySelector(".role-scroller")!.append(item);
        //     item.addEventListener("click", () => {
        //         modal.querySelectorAll(".role-item.selected").forEach(e => e.classList.remove("selected"));
        //         item.classList.add("selected");
        //         const allowed = isOverride ? (displayRoles[role] as PermissionOverwrite).allow : referenceRoles![role as keyof typeof referenceRoles].permissions;
        //         const denied = isOverride ? (displayRoles[role] as PermissionOverwrite).deny : null;

        //         const permList = modal.querySelector<HTMLDivElement>(".perm-scroller")!;
        //         permList.innerHTML = "";
        //         for (const perm in DiscordPermissions) {
        //             const element = DOM.parseHTML(ModalItemHTML) as HTMLDivElement;
        //             const permAllowed = (allowed! & DiscordPermissions[perm as keyof typeof DiscordPermissions]!) == DiscordPermissions[perm as keyof typeof DiscordPermissions];
        //             const permDenied = isOverride ? (denied! & DiscordPermissions[perm as keyof typeof DiscordPermissions]!) == DiscordPermissions[perm as keyof typeof DiscordPermissions] : !permAllowed;
        //             if (!permAllowed && !permDenied) continue;
        //             if (permAllowed) {
        //                 element.classList.add("allowed");
        //                 element.prepend(DOM.parseHTML(PermAllowedSVG) as HTMLDivElement);
        //             }
        //             if (permDenied) {
        //                 element.classList.add("denied");
        //                 element.prepend(DOM.parseHTML(PermDeniedSVG) as HTMLDivElement);
        //             }
        //             element.querySelector(".perm-name")!.textContent = getPermString(perm as keyof IDiscordPermissions) || perm.split("_").map(n => n[0].toUpperCase() + n.slice(1).toLowerCase()).join(" ");
        //             permList.append(element);
        //         }
        //     });
        //     item.addEventListener("contextmenu", (e) => {
        //         ContextMenu.open(e, ContextMenu.buildMenu([
        //             {
        //                 label: getHashString("rCaznZ") ?? "Copy ID",
        //                 action: () => {
        //                     ElectronModule?.copy(role as string);
        //                 }
        //             }
        //         ]));
        //     });
        // }

        // modal.querySelector<HTMLDivElement>(".role-item")?.click();

        const svelteMountContainer = document.createElement("div");
        svelteMountContainer.style.display = "contents";
        // svelteMountContainer.style.position = "fixed";
        // svelteMountContainer.style.pointerEvents = "all";
        // svelteMountContainer.style.zIndex = "1001";
        // svelteMountContainer.style.width = "100%";
        // svelteMountContainer.style.height = "100%";
        // console.log(getDefinitions(SelectedGuildStore?.getGuildId() ?? ""));
        const dRoles = Object.keys(displayRoles);
        // console.log(displayRoles);
        const temp = mount(PermissionModal, {
            target: svelteMountContainer,
            props: {
                title: title.title,
                avatarUrl: title.avatarUrl,
                subtitle: title.subtitle ?? "View effective permissions and role breakdowns",
                tabs: dRoles?.map(d => {
                    const role = (Array.isArray(displayRoles) ? displayRoles[d as keyof Array<string>] : d) as keyof typeof displayRoles;
                    // console.log(d, role, referenceRoles);
                    // const allPerms = Object.keys(DiscordPermissions).map(p => p.toLowerCase());
                    const perms = {};
                    const allowed = isOverride ? (displayRoles[role] as PermissionOverwrite).allow : referenceRoles![role as keyof typeof referenceRoles].permissions;
                    const denied = isOverride ? (displayRoles[role] as PermissionOverwrite).deny : null;
                    for (const perm in DiscordPermissions) {
                        // console.log(perm, DiscordPermissions[perm as keyof typeof DiscordPermissions], allowed, denied);
                        const permAllowed = (allowed! & DiscordPermissions[perm as keyof typeof DiscordPermissions]!) == DiscordPermissions[perm as keyof typeof DiscordPermissions];
                        const permDenied = isOverride ? (denied! & DiscordPermissions[perm as keyof typeof DiscordPermissions]!) == DiscordPermissions[perm as keyof typeof DiscordPermissions] : !permAllowed;
                        // const isAllowed = (isOverride ? (displayRoles[d as keyof typeof displayRoles] as PermissionOverwrite).allow : role.permissions) & DiscordPermissions[perm as keyof typeof DiscordPermissions] ? true : false;
                        // const isDenied = isOverride ? (displayRoles[d as keyof typeof displayRoles] as PermissionOverwrite).deny & DiscordPermissions[perm as keyof typeof DiscordPermissions] ? true : false : !isAllowed;
                        perms[perm] = permAllowed ? "allowed" : permDenied ? "denied" : "neutral";
                    }

                    // console.log({
                    //     displayRoles,
                    //     d,
                    //     role,
                    //     referenceRoles,
                    //     roleData: referenceRoles![role as keyof typeof referenceRoles],
                    // });


                    const user = UserStore?.getUser(role as string) || {getAvatarURL: () => AvatarDefaults.DEFAULT_AVATARS[Math.floor(Math.random() * AvatarDefaults.DEFAULT_AVATARS.length)], username: role as string, id: undefined};
                    return {
                        id: role as string,
                        name: user?.id ? user.username : referenceRoles![role as keyof typeof referenceRoles].name,
                        color: user?.id ? undefined : referenceRoles![role as keyof typeof referenceRoles].colorStrings?.primaryColor,
                        permissions: perms,
                        position: user?.id ? undefined : referenceRoles![role as keyof typeof referenceRoles].position || undefined,
                        iconUrl: user?.id ? undefined : referenceRoles![role as keyof typeof referenceRoles].icon ? `https://cdn.discordapp.com/role-icons/${referenceRoles![role as keyof typeof referenceRoles].id}/${referenceRoles![role as keyof typeof referenceRoles].icon}.webp` : undefined,
                        avatarUrl: user?.id ? user.getAvatarURL(null, 128, true) : undefined,
                    };
                }),
                onClose: () => {svelteMountContainer.remove();},
                categories: getDefinitions(SelectedGuildStore?.getGuildId() ?? "")
            }
        });
        document.querySelector<HTMLDivElement>("#app-mount")?.append(svelteMountContainer);
        DOM.onRemoved(svelteMountContainer, () => unmount(temp));

        // return modal;
    }

    getSettingsPanel() {
        return this.buildSettingsPanel((_, id, checked) => {
            if (id == "popouts") {
                if (checked) this.bindPopouts();
                else this.unbindPopouts();
            }
            if (id == "contextMenus") {
                if (checked) this.bindContextMenus();
                else this.unbindContextMenus();
            }
            if (id == "displayMode") this.setDisplayMode(checked as DisplayMode);
        });
    }

};
