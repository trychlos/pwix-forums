/*
 * pwi:forums/src/common/js/roles.js
 *
 *  Define here the roles used by the pwi:forums package.
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
                },
                {
                    name: 'FRS_FORUM_MANAGER'
                },
                {
                    name: 'FRS_MODERATORS'
                },
                {
                    name: 'FRS_PRIVATE_EDIT',
                    children: [
                        {
                            name: 'FRS_PRIVATE_VIEW'
                        }
                    ]
                }
            ]
        }
    ]
};
