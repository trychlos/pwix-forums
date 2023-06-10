# pwix:forums - maintainer/README

A thread is a list (hierchical in another life) of posts

Originally the first post is the thread leader: its post_id determines the thread identifier
    that all successive posts will also hold in their respective thread_id
    So, still originally:
    - the first post of the thread has:
        title: set
        threadId: unset
        replyTo: unset
        deletedAt: null

Then all replies to nay post of the thread will have:
        title: unset
        threadId: set to the post_id of the first post of the thread)
        replyTo: set to the post_id of the post the user has replied to
        deletedAt: null

All queries should ignore deleted posts which are kept in the DB for completeness only.

When the first post of the thread is deleted (resp. moderated), it doesn't disappear from the DB, is always available.
but all the research based of a null threadId to identify the thread leader become no more ok.

Designating another post as the new thread leader is possible, but what id the originated post become unmoderated ?
If older then set new first, else

