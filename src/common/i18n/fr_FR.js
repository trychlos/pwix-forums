/*
 * pwix:forums/src/common/i18n/fr_FR.js
 */

pwiForums.i18n = {
    ...pwiForums.i18n,
    ...{
        fr_FR: {
            allPosts: {
                page_title: 'All the posts',
                page_comment: 'You are seeing here all messages since the specified date, posted in the forums you are allowed to access.'
            },
            badges: {
                for_public: 'Forum is public',
                for_private: 'Forum is private',
                for_rw: 'Forum is opened',
                for_ro: 'Forum is archived',
                moderator: 'Moderator',
                threads_count: '%s thread(s)',
                posts_count: '%s post(s)',
                new_thread: 'New thread',
                new_label: 'New',
                mod_strategy: 'Moderation strategy'
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
            color: {
                choose: 'Choose a color',
                current: 'Current selection'
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
                moderation_label: 'Moderation strategy',
                inform_label: 'Informing the author',
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
                message_created: 'Forum "%s" successfully created',
                informs: [
                    { id: FRS_INFORM_NONE, label: 'Author is not informed' },
                    { id: FRS_INFORM_MAY, label: 'Moderator can choose to inform the author' },
                    { id: FRS_INFORM_MUST, label: 'Author must be informed' }
                ],
                informs_long: [
                    { id: FRS_INFORM_NONE, label: 'Due to the forum information option set, the author will not be informed of your decision.' },
                    { id: FRS_INFORM_MAY, label: 'The forum information option let you choose to inform - or not - the author, and to provide him/her a reason.' },
                    { id: FRS_INFORM_MUST, label: 'The forum information option makes mandatory for you to inform the author, and to provide him/her a reason.' }
                ]
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
                // moderation page
                page_title: 'Forums moderation',
                page_comment: 'You are seeing here all messages since the specified date, posted in the forums you are allowed to moderate.',
                date: 'Since :',
                noforum: 'Nothing to moderate',
                nonewpost: 'No new post since %s',
                thread_title: 'In the thread «&nbsp;<b>%s</b>&nbsp;»',
                ellipsis_more: '[Read more]',
                ellipsis_less: '[Read less]',
                moderate_date: 'Posted on %s',
                owner_score: '%s posted messages<br />%s (%s) have already been moderated',
                author: 'By %s (aka « %s »)',
                moderate: 'Moderate',
                unmoderate: 'Unmoderate',
                unmoderated: 'The post has been successfully unmoderated',
                validate: 'Validate',
                unvalidate: 'Unvalidate',
                validated: 'The post has been successfully validated',
                unvalidated: 'The post has been successfully unvalidated (waits for a new validation)',
                validated_checkbox: 'Also show validated posts',
                moderated_checkbox: 'Also show moderated posts',
                empty_checkbox: 'Display forums without to-be-moderated posts',
                validated_by: 'Validated by %s<br />on %s',
                moderated_by: 'Moderated by %s<br />on %s',
                // moderation operation
                modal_title: 'Moderating a post',
                pre_text: 'You are about to moderate a post.'
                    +'<br />After your operation, the message will no longer be visible to standard users.',
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
                strategies: [
                    { id: FRS_MODERATE_NONE, label: 'No moderation at all' },
                    { id: FRS_MODERATE_APRIORI, label: 'Moderation a priori' },
                    { id: FRS_MODERATE_APOSTERIORI, label: 'Moderation a posteriori' }
                ],
                short_strategies: [
                    { id: FRS_MODERATE_NONE, label: 'None' },
                    { id: FRS_MODERATE_APRIORI, label: 'A priori' },
                    { id: FRS_MODERATE_APOSTERIORI, label: 'A posteriori' }
                ],
                supplement_label: 'You may argument your decision and provide an additional reason:',
                supplement_placeholder: 'Some optional words here as an added argument',
                // moderation informations
                info_title: 'Moderation informations',
                reason: 'Reason was: "%s".',
                no_supplement: 'No additionnal argument was given.',
                supplement_text: 'Additional argument was: "%s".'
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
            posts: {
                not_writable: 'You cannot participate as %s.'
            },
            posts_options: {
                date_label: 'Since :',
                empty_checkbox: 'Display forums without visible posts',
                validated_checkbox: 'Show validated posts',
                nonvalidated_checkbox: 'Show non-validated posts',
                moderated_checkbox: 'Show moderated posts',
                nonmoderated_checkbox: 'Show non-moderated posts',
                deleted_checkbox: 'Also show posts deleted by their author',
                date_parse: 'dd/mm/yy',
                date_format: 'dd/mm/yyyy'
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
                not_writable: 'There is not yet any thread opened on this forum.'
                    +'<br />Unfortunately, you are currently not allowed to create a new thread here.'
                    +'<br />The reason is that %s.'
                    +'<br />Contact the administrator if you are not sure.',
                owner_header: 'Owner',
                reply: 'Reply',
                posted_by: 'Posted by %s',
                posted_on: 'On %s',
                last_post: 'Last post on %s<br/>by %s',
                tooltip: 'Open the thread (and go to \'%s\')',
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
                cat_color: 'The category\'s color',
                cat_edit: 'Edit the \'%s\' category',
                cat_delete: 'Delete the \'%s\' category',
                for_count: 'Forums count',
                for_edit: 'Edit the \'%s\' forum',
                for_delete: 'Delete the \'%s\' forum',
                catcount_plural: '%s registered categories',
                catcount_singular: '%s registered category',
                catcount_none: 'No registered category',
                forcount_plural: '%s registered forums',
                forcount_singular: '%s registered forum',
                forcount_none: 'No registered forum',
                forum_new: 'New forum',
                category_new: 'New category'
            },
            // these strings are to be added to a sentence - so do not begin with a capital
            unwritable: {
                FRS_REASON_NONE: 'FRS_REASON_NONE',
                FRS_REASON_NOTCONNECTED: 'you are not connected',
                FRS_REASON_NOEMAIL: 'your profile does not exhibit any registered email address',
                FRS_REASON_NOTVERIFIED: 'your email address has not yet been verified',
                FRS_REASON_APPFN: 'participation is refused by the application',
                FRS_REASON_PRIVATEWRITERS: 'FRS_REASON_PRIVATEWRITERS',
                FRS_REASON_PRIVATEEDIT: 'FRS_REASON_PRIVATEEDIT',
                FRS_REASON_PRIVATE: 'you are not allowed to participate to this private forum'
            }
        }
    },
};
