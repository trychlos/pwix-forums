/*
 * pwix:forums/src/common/js/strings.js
 */

pwiForums.strings = {
    //'en-US': {
    'fr_FR': {
        badges: {
            for_public: 'Forum is public',
            for_private: 'Forum is private',
            for_rw: 'Forum is opened',
            for_ro: 'Forum is archived',
            moderator: 'Moderator',
            threads_count: '%s threads',
            posts_count: '%s posts'
        },
        breadcrumb: {
            forums: 'Forums',
            posts: 'Posts',
            threads: 'Threads'
        },
        category_edit: {
            modal_edit: 'Edit a category',
            modal_new: 'Create a new category',
            title_label: 'Title',
            title_placeholder: 'Enter a title here',
            description_label: 'Displayed description',
            description_placeholder: 'Write in a few lines of a description which will be displayed besides of the category',
            btn_close: 'Cancel',
            btn_save: 'Save',
            message_updated: 'Category "%s" successfully updated',
            message_created: 'Category "%s" successfully created'
        },
        forum_edit: {
            modal_edit: 'Edit a forum',
            modal_new: 'Create a new forum',
            props_tab: 'Properties',
            privusers_tab: 'Private users',
            privusers_text: 'Select the users who will be allowed to participate to this forum.',
            moderators_tab: 'Moderators',
            moderators_text: 'In addtion to the \'FRS_MODERATOR\' role, select here users which will be authorized to moderate <b>this</b> forum.',
            title_label: 'Title',
            title_placeholder: 'Have a one-line descriptive title',
            description_label: 'Displayed description',
            description_placeholder: 'Write in a few lines of a description which will be displayed on top of the forum',
            comment_label: 'Internal comment',
            comment_placeholder: 'A comment which will be only visible to other administrators',
            category_label: 'Category',
            private_label: 'Private',
            show_deleted_for_admin_label: 'Show deleted posts to admins (as an expandable placeholder)',
            show_deleted_for_user_label: 'Show deleted posts to users (as a placeholder)',
            archive_label: 'Archive the forum, making it read-only',
            forum_archived: 'Forum is archived, and thus read-only',
            archived_by_label: 'Operated on %s by %s (%s)',
            unarchive_label: 'Unarchive the forum, reopening it to its users',
            btn_close: 'Cancel',
            btn_save: 'Save',
            btn_private: 'Private users',
            message_error: 'Sorry, I am unable to update this record',
            message_updated: 'Forum "%s" successfully updated',
            message_created: 'Forum "%s" successfully created'
        },
        forums_home: {
            page_title: 'Discussion forums',
            last_post: 'Last post on %s<br/>by %s'
        },
        manager: {
            manager_title: 'Forums Management',
            forums_nav: 'Forums',
            categories_nav: 'Categories',
            settings_nav: 'Settings',
            tree_nav: 'Forums tree',
            btn_new: 'New',
            default_category_label: 'Uncategorized'
        },
        moderate: {
            modal_title: 'Moderating a post',
            pre_text: 'You are about to moderate a post.'
                +'<br />After your operation, the message will no longer be visible to standard users.'
                +'<br />You have the ability to inform the user of your decision, and to give him/her a reason.',
            post_text: 'Are you sure ?',
            inform_label: 'Send an information email to the user',
            reason_label: 'Choose a reason (an easy way to motivate your decision):',
            cancel: 'Cancel',
            confirm: 'Confirm',
            content_label: 'Message content:',
            owner_label: 'Author:',
            owner_posted: '%s posted messages, in which %s (%s) have already been moderated.',
            message_error: 'Sorry, I am unable to update this record',
            message_success: 'Post successfully moderated',
            options: [
                // doesn't translate the id here, but only the label
                { id: 'gtu', label: 'Non conform to General Terms of Use' },
                { id: 'donotlove', label: 'I don\'t love you' }
            ],
        },
        post_edit: {
            title_label: 'Have a title',
            title_placeholder: 'Some nice title as a summary of the new thread',
            preview_btn: 'Preview',
            cancel_btn: 'Cancel',
            post_btn: 'Post',
            preview_mode: 'Preview mode is on. Your message has not yet been posted. Do not forgive to \'Post\' it.',
            msg_error: 'Unable to post your message. Sorry',
            msg_success: 'Message successfully posted'
        },
        roles_view: {
            perms_tab: 'Forums permissions',
            public_label: 'As an identified user, you are able to view and participate to all public forums.',
            private_label: 'You are also authorized to view and participate to following private forums:',
            moderators_label: 'You are also authorized to moderate following forums:',
            none: 'No other permission.'
        },
        settings_tab: {
            description: 'No updatable settings at the moment.'
        },
        threads: {
            page_title: 'Hot threads in the forum',
            new: 'Start a new dicussion',
            title_header: 'Title',
            start_header: 'Started',
            count_header: 'Posts count',
            last_header: 'Last posted',
            no_threads: 'There is not yet any thread opened on this forum.'
                +'<br />Be the first to create one (click on the "New discussion" button on the top right of this page).'
                +'<br />And enjoy...',
            owner_header: 'Owner',
            reply: 'Reply',
            posted_by: 'Posted by %s',
            posted_on: 'On %s',
            last_post: 'Last post on %s<br/>by %s',
            tooltip: 'Open the tread (and go to \'%s\')',
            deleted_label: 'You have deleted one of your own posts on %s. This operation is not cancelable',
            moderated_label: 'A post was moderated on %s by %s (reason: %s)',
            delete: 'Delete',
            delete_confirm: 'You are about to delete your own message.<br />Are you sure ?',
            delete_error: 'I am unable to delete your message at the moment. Sorry',
            delete_success: 'Message successfully deleted',
            edit: 'Edit',
            moderate: 'Moderate'
        },
        tree_tab: {
            description: 'The categories, along with their attached forums, can be updated here.'
                +'<br />The ordering of the categories, the ordering of the forums, and even the attachement of a forum to a category, can be easily modified by a simple drag-and-drop with your mouse.'
                +'<br />This is also the right place to create new categories and/or new forums.',
            cat_info: 'Category informations',
            for_info: 'Forum informations',
            cat_confirm_delete: 'You are about to delete the "%s" category<br />Are you sure ?',
            cat_deleted: 'Category "%s" successfully deleted.',
            for_confirm_delete: 'You are about to delete the "%s" forum<br />Are you sure ?',
            for_deleted: 'Forum "%s" successfully deleted.',
            cat_edit: 'Edit the "%s" category',
            cat_delete: 'Delete the "%s" category',
            for_edit: 'Edit the "%s" forum',
            for_delete: 'Delete the "%s" forum',
            catcount_label: '%s registered category(ies)',
            forcount_label: '%s registered forum(s)',
            forum_new: 'New forum',
            category_new: 'New category'
        }
    },

    'fr-FRX': {
    },
};
