/*
 * pwix:forums/src/common/js/roles.js
 *
 *  Define here the roles used by the pwix:forums package.
 *
 *      FRS_ADMIN                       do anything anywhere
 * 
 *          FRS_CATEGORY_MANAGER        per category
 * 
 *          FRS_FORUM_MANAGER           per forum
 * 
 *          FRS_MODERATOR               forums moderation, all forums
 * 
 *          FRS_PRIVATE_EDIT            can participate to all private forums
 * 
 *              FRS_PRIVATE_VIEW        can view all private forums
 * 
 *  Instead of calling pwix:roles.configure() to directly define these roles, they are expected to be given to the application.
 *  More exactly, it is expected that the application which makes use of this package 'comes' get the needed roles at 
 *  configuration time (for example, to merge them with its own roles).
 */

pwiForums.roles = {
    hierarchy: [
        {
            name: 'FRS_ADMIN',
            children: [
                {
                    name: 'FRS_CATEGORY_MANAGER',
                    children: [
                        {
                            name: 'FRS_CATEGORY_CREATE'
                        },
                        {
                            name: 'FRS_CATEGORY_UPDATE'
                        },
                        {
                            name: 'FRS_CATEGORY_DELETE'
                        }
                    ]
                },
                {
                    name: 'FRS_FORUM_MANAGER',
                    children: [
                        {
                            name: 'FRS_FORUM_CREATE'
                        },
                        {
                            name: 'FRS_FORUM_UPDATE'
                        },
                        {
                            name: 'FRS_FORUM_DELETE'
                        }
                    ]
                },
                {
                    name: 'FRS_MODERATOR_MANAGER',
                    children: [
                        {
                            // must have one of these roles to be able to actually moderate
                            name: 'FRS_MODERATOR',
                            children: [
                                {
                                    name: 'FRS_PUBLIC_MODERATOR'
                                },
                                {
                                    name: 'FRS_PRIVATE_MODERATOR'
                                }
                            ]
                        },
                        {
                            // must have this role to access to the moderation page
                            name: 'FRS_MODERATOR_ACCESS'
                        }
                    ]
                },
                {
                    // can post in all private forums
                    name: 'FRS_PRIVATE_EDIT',
                    children: [
                        {
                            // can view all private forums
                            name: 'FRS_PRIVATE_VIEW'
                        }
                    ]
                }
            ]
        }
    ]
};
