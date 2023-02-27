# pwix:forums - TODO

## Summary

1. [Todo](#todo)
2. [Done](#done)

---
## Todo

|   Id | Date       | Description and comment(s) |
| ---: | :---       | :---                       |
|    1 | 2022-10- 2 | forums: have an icon for the categories (hardcoded default) (was app #7) |
|    3 | 2022-10- 2 | forums: have an icon for the forums (hardcoded default) (was app #9) |
|    4 | 2022-10- 2 | forums: have an icon per forum (was app #10) |
|    5 | 2022-10-30 | pwix:forums let a moderator delete a post + inform the user (was app #97) |
|      |            | have some predefined reasons ? |
|      | 2022-10-31 | a) moderation is operational + b) have predefined reasons -> TODO: inform the user |
|      |            | cf. /src/collections/posts/server/methods.js 'frsPosts.postModerate'() method |
|    6 | 2022-10-30 | pwix:forums keep a count of deleted posts per user + inform the moderator above a given configurable limit (was app #98) |
|      | 2022-11- 2 | the count of moderated is automatically computed in frsPosts publications |
|      | 2022-11- 3 | the limit should it be a count or a percent ? |
|    7 | 2022-10-30 | pwix:forums have a page for the moderator with the published posts since a date (to be moderated) (was app #99) |
|      |            | this is the not same page than frsPosts as the to-be-moderated posts may come from several forums |
|    8 | 2022-10-30 | pwix:forums a thread creator may want to be notified of replies in his thread (was app #102) |
|      | 2022-11- 9 | like anyone may want to be notified of any reply to one of his post |
|      |            | like anyone may want subscribe to any new post in a thread or a forum |
|    9 | 2022-10-31 | pwix:forums what to do when 'moderating' the first post of a thread ? (was app #105) |
|      |            | -> other posts do not have a title (at the moment) |
|      |            | -> thread starter is identified by a null threadId -> what when deleted ? |
|      | 2022-10-31 | take the first reply and make it the new thread leader (set treadId=null, set title) todo in postModerate |
|      | 2022-11- 3 | obsoleted by #113 for user deletion - but still relevant for moderation |
|   10 | 2022-10-31 | pwix:forums have 'wantModerationConfirmation' configuration option (when false, moderation is applied without confirmation) (was app #106) |
|      |            | if no confirmation is done, an automatic reason must be set |
|   11 | 2022-10-31 | pwix:forums have a page for general terms of use => new frs_contents collection (was app #108) |
|   12 | 2022-11- 1 | pwix:forums review the <a> tag in frsPosts (should have same display than frsThreads) (was app #114) |
|      | 2022-11- 2 | note that, while frsThreads have right bg color while mouse is hover, the mouse pointer is not ok in all columns |
|      | 2022-11- 3 | was actually 'review frsThreads to be the same than frsForums' -> that's done but had to remove <a> tags |
|      |            | -> have set tooltips, but they do not show |
|   13 | 2022-11- 1 | pwix:forums have an option so that new posts must be validated by a moderator before being displayed (was app #115) |
|   14 | 2022-11- 3 | pwix:forums let a moderator choose his own setting for showDeletedForAdmin which would override the forum property (was app #116) |
|   15 | 2022-11- 9 | have a test mails option which let the application send one of each mail template in order to facilitate the tests (was app #119) |
|      |            | as of today, we have first verification mail, later verification mail, reset password, contact form |
|      |            | + subscription mail + moderation information |
|      |            | an option only opened to mail redactor ? or to app administrator |
|   17 | 2023- 2-13 | have the ability to unmoderate a post |
|   18 | 2023- 2-18 | frsForums frs-right column; items are not aligned |
|   19 | 2023- 2-19 | tree_tab.cat_edit, cat_delete, for_edit, for_delete should have double quotes, but doesn't work |
|   20 | 2023- 2-21 | get rid of FRS_MODERATOR_ACCESS role, replacing with a function |
|   21 | 2023- 2-21 | export more bulding elements, e.g. methods who answer some common questions as who is able to read, to write, to moderate, and so on |
|   22 | 2023- 2-21 | frsModerate: internationalize (register in i18n) datepicker formats |
|   23 | 2023- 2-21 | add a view counter to the thread |
|   37 | 2023- 2-21 | frsModerate have a button for moderate which goes to the moderation dialog |
|   38 | 2023- 2-21 | frsModerate if already moderated, say by who and why and when ? |
|   39 | 2023- 2-21 | frsModerate if have unmoderator role, then have a button unmoderate (+ reason ?) |
|   40 | 2023- 2-22 | frsPosts: ellipsize like in frsModerate |
|   41 | 2023- 2-22 | frsThreads: ellipsize like in frsModerate |
|   42 | 2023- 2-22 | review the display of the permissions in a forum |
|   43 | 2023- 2-22 | when posting, publish or not depending of the forum moderation mode |
|   46 | 2023- 2-22 | alert the moderator manager when there are too many pending posts |
|   47 | 2023- 2-22 | forum_edit: restore edition of private readers, writers and moderators |
|   48 | 2023- 2-22 | frsForums: ellipsize the forum description like in frsModerate |
|   49 | 2023- 2-22 | frsPosts: have a single Reply button for the thread |
|   53 | 2023- 2-23 | use ellipsizer in frs_post_moderate |
|   54 | 2023- 2-27 | BUG it happens that validate and moderate are rightly reactive, but unvalidate and unmoderate are not, even though cursor observer actaully see changes |
|      |            | current work-around is to stop and relaunch the subscription |
|   55 | | |

---
## Done

|   Id | Date       | Description and comment(s) |
| ---: | :---       | :---                       |
|    2 | 2022-10- 2 | forums: have an icon per category (was app #8) |
|      | 2023- 2-2à | replaced with a color per category - done |
|   16 | 2023- 2- 5 | have a color per category |
|      | 2023- 2-19 | done |
|   24 | 2023- 2-21 | review html externalizing to stylesheets all display classes from bootstrap  -> have container classes |
|      | 2023- 2-22 | should have container classes for grid, flex and so on |
|      |            | but keep (Bootstrap) display classes for the same reason we introduce positioning classes |
|      | 2023- 2-22 | done |
|   25 | 2023- 2-21 | review stylesheets, distinguishing intrinsic format of an element (element classes) vs. positioning utilities (positioning classes) + js classes |
|      | 2023- 2-22 | done |
|   26 | 2023- 2-21 | review badge: have a class for each type of these, and be able to derive these types |
|      | 2023- 2-22 | done |
|   27 | 2023- 2-21 | frsModerate: keep the last used date either as a user data |
|      | 2023- 2-22 | done |
|   28 | 2023- 2-21 | BUG frsPosts: while I am logged in as admin, display 'You cannot participate as undefined.' |
|      | 2023- 2-22 | fixed |
|   29 | 2023- 2-21 | frsModerate: have an option to show already moderated posts |
|      | 2023- 2-23 | done |
|   30 | 2023- 2-21 | frsModerate: have an option to show empty forums (forums without any to-be-moderated posts) |
|      | 2023- 2-23 | done |
|   31 | 2023- 2-21 | frsModerate forums: add a public/private badge |
|      | 2023- 2-22 | done |
|   32 | 2023- 2-21 | frsModerate forums: display the moderation strategy |
|      | 2023- 2-22 | done |
|   33 | 2023- 2-21 | frsModerate posts: display the creation date |
|      | 2023- 2-23 | done |
|   34 | 2023- 2-21 | frsModerate posts: ellipsize the content + have 'plus' button/link |
|      | 2023- 2-22 | done |
|   35 | 2023- 2-21 | frsModerate identify the author + add already moderated count and percent|
|      | 2023- 2-23 | done |
|   36 | 2023- 2-21 | frsModerate have a checkbox for validate if moderation is a priori |
|      | 2023- 2-23 | done |
|   44 | 2023- 2-22 | should be able to modify the category from forum_panel |
|      | 2023- 2-22 | done |
|   45 | 2023- 2-22 | forum_panel: select the moderation strategy |
|      | 2023- 2-22 | done |
|   51 | 2023- 2-22 | frsModerate: have an option to include moderated posts since the date |
|      | 2023- 2-23 | done |
|   52 | 2023- 2-22 | frsModerate: the publication should take into account the above option (with ou without moderated posts) |
|      | 2023- 2-23 | done |

---
P. Wieser
- Created on 2023, Jan. 18th
- Last updated on 2023, Jan. 26th
