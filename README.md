# pwix:forums - README

## What is it ?

A forum solution for Meteor.

##  Technical considerations

`pwix:forums` makes use of the application database.

In order to be kept safe of any risk of collision, the collections name is prefixed.
The used prefix is configurable, defaulting to `frs_`.

## Usage

### Installation

```
    meteor add pwi:forums
```
    
    Exported object
        The 'pwi-forums' package exports a single 'pwiForums' object which holds all necessary data and functions.

    Configuration.
        The configuration is only available in the server-side of the code.
        It may be overriden via the 'pwiForums.config()' function which takes an object which is expected to contains the overriden values, for example in your startup server code.

Model
    Forums relies on the Meteors users accounts collection.
    We are considering following entities-relations model:
    
    Forum
        A forum may be public or private.
        Where a public forum is visible and readable by anyone, a private forum is only visible by a limitative set of users.
        A forum may be archived: it is still visible and readable, but can no more host any new posts

        (in a future version, forums may have subforums, but such parent forums should not be able to host any post).

    Users
        A non-identified user may see each and every post in each and every public form, but cannot post himself.
        After identification (aud authentification), a user is able to post in public forums and in private forums he is allowed to.

    Roles
        Identified roles are:
            (none)
                Is able to see each and every non-deleted post in each and every public visible forum
            'frsAllForumsAdmin'
                forum management: creation, deletion, forum admin management
            'frsForumAdmin'
                post management: moderation, user management in private forums
            'frsForumUser'
                post creation in public forums and in private forums he is allowed to
                this role is given to any identified user
        Forums relies on 'alanning:roles' package for roles management.
    
    Post
        Created by a forum user, maybe in response to another post
        Hierarchy of posts and their repllies form a thread
        May be moderated by a forum admin
        The forum admin may decide to pin some posts which will be displayed always on top.
        Obviously, the count of pinned posts should be kept rather small, but forums doesn't force that in any case.
        The creator of the post is its owner.
        A post may be edited only by its owner.
        A post may be deleted by its owner or by a forum admin.
        
        Note: this is a design decision that the post cannot be edited by anyone, but its owner.
        And this is also a design decision that the application admin cannot manage/edit/delete the posts.

