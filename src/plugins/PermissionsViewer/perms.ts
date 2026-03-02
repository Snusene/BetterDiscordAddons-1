import type {Guild} from "@discord";
import type {DiscordPermissions as IDiscordPermissions} from "@discord/modules";
import type {PermissionCategoryDefinition} from "./types";



interface Description {
    ast: string[];
    locale: string;
}

interface PermissionSpecification {
    title: string;
    flag: bigint;
    description: ((locale: string) => Description) | string[];
}

interface PermissionSpecCategory {
    title: string;
    permissions: PermissionSpecification[];
}

// interface PermissionDefinition {
//     id: string;
//     name: string;
//     description: string;
// }

// interface PermissionCategoryDefinition {
//     name: string;
//     permissions: PermissionDefinition[];
// }

interface SpecManager {
    generateGuildPermissionSpec(guild: Guild): PermissionSpecCategory[];
    generateChannelPermissionSpec(channelId: string, guildId: string): PermissionSpecCategory[];
}

const DiscordPermissions = BdApi.Webpack.getModule<IDiscordPermissions>(m => m.ADD_REACTIONS, {searchExports: true})!;
const specManager = BdApi.Webpack.getByKeys<SpecManager>("generateGuildPermissionSpec");

export function getDefinitions(guildIdOrGuild: string | Guild): PermissionCategoryDefinition[] {
    if (!specManager) throw new Error("Permission spec manager not found");
    const guild = typeof guildIdOrGuild === "string" ? BdApi.Webpack.Stores.GuildStore.getGuild(guildIdOrGuild) : guildIdOrGuild;
    if (!guild) throw new Error("Guild not found");
    const guildSpecs = specManager.generateGuildPermissionSpec(guild);
    return guildSpecs.map(category => ({
        name: category.title,
        permissions: category.permissions.map(perm => ({
            id: Object.keys(DiscordPermissions).find(key => DiscordPermissions[key as keyof IDiscordPermissions] === perm.flag) ?? "",
            name: perm.title,
            description: typeof perm.description === "function" ? perm.description(BdApi.Webpack.Stores.LocaleStore.locale).ast[0] : perm.description[0]
        }))
    }));
}