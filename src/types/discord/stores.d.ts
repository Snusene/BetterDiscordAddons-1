import type {User} from "./index";
import {FluxStore} from "./modules";


export interface UserStore extends FluxStore {
    getUser(id: string): User | undefined;
    getCurrentUser(): User;
}


export interface SelectedGuildStore extends FluxStore {
    getGuildId(): string | null;
}

export interface Stores {
    UserStore: UserStore;
    SelectedGuildStore: SelectedGuildStore;
}