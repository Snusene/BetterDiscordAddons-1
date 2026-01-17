import type {User, Guild, GuildMember, GuildRole} from "./index";
import {FluxStore} from "./modules";


export interface UserStore extends FluxStore {
    getUser(id: string): User | undefined;
    getCurrentUser(): User | undefined;
}


export interface SelectedGuildStore extends FluxStore {
    getGuildId(): string | null;
}

export interface GuildStore extends FluxStore {
    getGuild(id: string): Guild | undefined;
}

export interface ChannelStore extends FluxStore {
    getChannel(id: string): unknown;
}

export interface GuildMemberStore extends FluxStore {
    getMember(guildId: string, userId: string): GuildMember | undefined;
    getMembers(guildId: string): GuildMember[];
}

export interface GuildRoleStore extends FluxStore {
    getRole(guildId: string, roleId: string): GuildRole | undefined;
    getRolesSnapshot(guildId: string): Record<string, GuildRole>;
}

export interface Stores {
    UserStore: UserStore;
    SelectedGuildStore: SelectedGuildStore;
    GuildStore: GuildStore;
    ChannelStore: ChannelStore;
    GuildMemberStore: GuildMemberStore;
    GuildRoleStore: GuildRoleStore;
}