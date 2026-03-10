import type {Manifest} from "@betterdiscord/manifest";

const manifest: Manifest = {
    info: {
        name: "PermissionsViewer",
        authors: [{
            name: "Zerebos",
            discord_id: "249746236008169473",
            github_username: "zerebos",
            twitter_username: "IAmZerebos"
        }],
        version: "1.0.0",
        description: "Allows you to view all the permissions for users, servers, and channels!",
        github: "https://github.com/zerebos/BetterDiscordAddons/tree/master/Plugins/PermissionsViewer",
        github_raw: "https://raw.githubusercontent.com/zerebos/BetterDiscordAddons/master/Plugins/PermissionsViewer/PermissionsViewer.plugin.js"
    },
    changelog: {
        banner: "https://github.com/user-attachments/assets/a9cd5ef8-35fa-446e-8839-1b9cb1dc8962",
        blurb: "It took me a long time but I finally sat down and rewrote the entire plugin to be more efficient, better looking, and more accurate. If you had issues with the old version, please give this one a try!",
        changes: [
            {
                type: "added",
                title: "Total Rewrite!",
                items: [
                    "Switched from using stinky virgin React to based chad Svelte.",
                    "Completely revamped the UI to be more user friendly and look better.",
                    "Improved performance and reduced memory usage.",
                    "Users now have an \"Effective Permissions\" section that shows their overall permissions.",
                    "Roles and permissions are now searchable to make finding specific permissions easier.",
                    "Channel overwrites now make user and role overwrites more clear and easier to understand.",
                    "Added support for role icons and emojis.",
                    "Neutral permissions can now be toggled either in settings or in the modal itself.",
                ]
            },
            {
                title: "Also Some Fixes",
                type: "fixed",
                items: [
                    "Permission badges in popouts now show up properly.",
                    "Improved accuracy of permission calculations.",
                    "Fixed an issue where some permissions would show up as denied when they were actually neutral.",
                    "Roles and permissions are now sorted by position instead of alphabetically.",
                ]
            }
        ]
    },
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
            type: "switch",
            id: "showNeutral",
            name: "Show Neutral Permissions",
            value: false
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
                    name: "Botón de menú contextual",
                    note: "Añadir un botón para ver permisos en los menús contextuales."
                }
            }
        },
        pt: {
            contextMenuLabel: "Permissões",
            popoutLabel: "Permissões",
            modal: {
                header: "Permissões de {{name}}",
                rolesLabel: "Cargos",
                permissionsLabel: "Permissões",
                owner: "@dono"
            },
            settings: {
                popouts: {
                    name: "Mostrar em Popouts",
                    note: "Mostrar as permissões em popouts como os cargos."
                },
                contextMenus: {
                    name: "Botão do menu de contexto",
                    note: "Adicionar um botão parar ver permissões ao menu de contexto."
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
                owner: "@eigentümer"
            },
            settings: {
                popouts: {
                    name: "In Popouts anzeigen",
                    note: "Zeigt die Gesamtberechtigungen eines Benutzers in seinem Popup ähnlich den Rollen an."
                },
                contextMenus: {
                    name: "Kontextmenü-Schaltfläche",
                    note: "Fügt eine Schaltfläche hinzu, um die Berechtigungen mithilfe von Kontextmenüs anzuzeigen."
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
                showNeutral: {
                    name: "Show Neutral Permissions",
                    note: "Whether to show permissions that are neither allowed nor denied."
                }
            }
        },
        ru: {
            contextMenuLabel: "Полномочия",
            popoutLabel: "Полномочия",
            modal: {
                header: "Полномочия {{name}}",
                rolesLabel: "Роли",
                permissionsLabel: "Полномочия",
                owner: "Владелец"
            },
            settings: {
                popouts: {
                    name: "Показать во всплывающих окнах",
                    note: "Отображает полномочия пользователя в их всплывающем окне, аналогичном ролям."
                },
                contextMenus: {
                    name: "Кнопка контекстного меню",
                    note: "Добавить кнопку для отображения полномочий с помощью контекстных меню."
                }
            }
        },
        nl: {
            contextMenuLabel: "Permissies",
            popoutLabel: "Permissies",
            modal: {
                header: "{{name}}'s Permissies",
                rolesLabel: "Rollen",
                permissionsLabel: "Permissies",
                owner: "@eigenaar"
            },
            settings: {
                popouts: {
                    name: "Toon in Popouts",
                    note: "Toont de totale rechten van een gebruiker in zijn pop-out, vergelijkbaar met rollen."
                },
                contextMenus: {
                    name: "Contextmenuknop",
                    note: "Voegt een knop toe om de machtigingsmodaliteit voor het selecteren van contextmenu's te bekijken."
                }
            }
        }
    },
    main: "index.ts"
};

export default manifest;
