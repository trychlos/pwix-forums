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
|   22 | 2023- 2-21 | frsModerate: internationalize datepicker formats |
|   23 | 2023- 2-21 | add a view counter to the thread |
|   24 | 2023- 2-21 | review html externalizing to stylesheets all display classes from bootstrap  -> have container classes |
|   25 | 2023- 2-21 | review stylesheets, distinguishing intrinsic format of an element (element classes) vs. positioning utilities (positioning classes) + js classes |
|   26 | 2023- 2-21 | review badge: have a class for each type of these, and be able to derive these types |
|   27 | 2023- 2-21 | frsModerate: keep the last used date either as a user data |
|   28 | 2023- 2-21 | BUG frsPosts: while I am logged in as admin, display 'You cannot participate as undefined.' |
|   29 | | |

---
## Done

|   Id | Date       | Description and comment(s) |
| ---: | :---       | :---                       |
|    2 | 2022-10- 2 | forums: have an icon per category (was app #8) |
|      | 2023- 2-2à | replaced with a color per category - done |
|   16 | 2023- 2- 5 | have a color per category |
|      | 2023- 2-19 | done |

---
P. Wieser
- Created on 2023, Jan. 18th
- Last updated on 2023, Jan. 26th
