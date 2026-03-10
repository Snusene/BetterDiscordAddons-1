export type PermissionStatus = "allowed" | "denied" | "neutral";

export interface PermissionDefinition {
    id: string;
    name: string;
    description: string;
}

export interface PermissionCategoryDefinition {
    name: string;
    permissions: PermissionDefinition[];
}

// Represents an entity that can have permissions, such as a user or role or pseudo-entity like "everyone"
// If avatarUrl is provided, then the entity is a user
// If position or iconUrl are provided, then the entity is a role
// If none is provided, then the entity is a pseudo-entity like "everyone"
export interface PermissionableEntity {
    id: string;
    name: string;
    iconUrl?: string;
    color?: string;
    position?: number;
    avatarUrl?: string;
    permissions: Record<string, PermissionStatus>;
}

export type PermissionableEntitySectionType = "special" | "roles" | "users";

export interface PermissionableEntitySection {
    id: PermissionableEntitySectionType;
    label: string;
    entities: PermissionableEntity[];
}