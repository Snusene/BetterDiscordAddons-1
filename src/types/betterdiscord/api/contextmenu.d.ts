/* eslint-disable @typescript-eslint/no-explicit-any */
import {ComponentType, FunctionComponent, ReactElement} from "react";


export type ContextMenuCallback = (tree: ReactElement, props: any) => ReactElement | void;

export interface ContextMenuItemProps extends Record<string, any> {
    type?: "text" | "submenu" | "toggle" | "radio" | "control" | "custom" | "separator";
}

export interface ContextMenuGroupProps {
    type: "group";
    items: ContextMenuItemProps[];
}

export type ContextMenuSetup = (ContextMenuItemProps | ContextMenuGroupProps)[];

export interface ContextMenuConfig {
    position?: "right" | "left";
    align?: "top" | "bottom";
    onClose?: (...args: any) => void;
    noBlurEvent?: boolean;
}

export interface ContextMenu {
    patch(navId: string, callback: ContextMenuCallback): () => void;
    buildItem(props: ContextMenuItemProps): ReactElement;
    buildMenu(setup: ContextMenuSetup): FunctionComponent;
    open(event: MouseEvent, menuComponent: ComponentType<unknown>, config?: ContextMenuConfig): void;
    close(): void;
}