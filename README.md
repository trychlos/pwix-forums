# pwix:forums - README

## What is it ?

A forum solution for Meteor.

In `pwix:forums`, a forum can be public or private:

- A public forum is readable by anybody, even a non-connected, anonymous, visitor.

- Who is able to write into a public forum is determined by the '`publicWriter`' parameter which qualifies a user topology (say for example logged-in users). A default value is configurable at the package level for all public forums, but each forum can have its own value.

- Who can moderate a public forum is determined by either the '`FRS_PUBLIC_MODERATOR`' role, or a list of users able to moderate this particular forum.

- Contrarily, a private forum is only accessible to an extensive and limitative set of users. So a readers and a writers lists are associated to each private forum.

- Who can moderate a private forum is determined by either the '`FRS_PRIVATE_MODERATOR`' role, or a list of users able to moderate this particular forum.

- A forum may be archived: it is still visible and readable, but can no more host any new posts.

- Forums can be organized in categories.

- Forums host threads, and threads host posts.

- The first post of a new thread gives its title to the thread.

### Moderation

Forums can be moderated. This is a configuration parameter which says:

- whether a forum is not moderated at all (which is not advisable anyway)
- whether a forum is moderated _a priori_, _i.e._ posts are only visible after having been validated by a moderator
- whether a forum is moderated _a posteriori_, _i.e._ posts are visible as soon as the user has published it, but can be moderated later.

### Users management

The package doesn't care about user authentification, and delegates all identification to the standard [Meteor Accounts system](https://docs.meteor.com/api/accounts.html). The package is only interested in some standard user fields :

- a user identifier
- a user name
- an email address, and whether it is verified or not.

For these, it relies on '`pwix:accounts-tools`' package.

## Usage

### Installation

As simple as

```
    meteor add pwix:forums
```

### Roles

`pwix:forums` relies on `pwix:roles` to manager roles.

The roles hierarchy is predefined in the `Forums.roles` object:

```
    FRS_ADMIN                           do anything anywhere
     |
     +- FRS_CATEGORY_MANAGER            authorized to manage (create, update,delete) categories
     |   |
     |   +- FRS_CATEGORY_CREATE         authorized to create categories
     |   |
     |   +- FRS_CATEGORY_UPDATE         authorized to update existing categories
     |   |
     |   +- FRS_CATEGORY_DELETE         authorized to delete categories
     |
     +- FRS_FORUM_MANAGER               authorized to manage (create, update,delete) forums
     |   |
     |   +- FRS_FORUM_CREATE            authorized to create forums
     |   |
     |   +- FRS_FORUM_UPDATE            authorized to update forums
     |   |
     |   +- FRS_FORUM_DELETE            authorized to delete forums
     |
     +- FRS_MODERATOR_MANAGER           the moderators manager
     |   |
     |   +- FRS_MODERATOR               moderate all forums
     |   |   |                          Each forum may define an extensive list of moderators who may moderate this particular forum without having this general role
     |   |   |
     |   |   +- FRS_PUBLIC_MODERATOR    moderate public forums
     |   |   |
     |   |   +- FRS_PRIVATE_MODERATOR   moderate private forums
     |
     +- FRS_PRIVATE_EDIT                can participate to all private forums
         |                              this role acts as an addendum to the list of writers of the private forums
         |
         +- FRS_PRIVATE_VIEW            can view all private forums
                                        this role acts as an addendum to the list of readers of the private forums
```
The application should use this predefined object and merge it with its own roles at configuration time.

### General configuration

General configuration is available through the `Forums.configure()` method, and providing an object with the keys you want override.

The method should be called in same terms both in client and server sides, and from the top-level application code, _i.e._ before `Meteor.startup()`.

- `collections.prefix`

    The prefix of the collection's names, used by `pwix:forums` to prevent any risk of collision in the namespace of the database collections.

    Default to '`frs_`'.

    Do not use a dash here as the code is not prepared to that.

- `routes.forums`

    The route to the list of forums, displayed by categories.

    Defaults to '`/forums`'.

- `routes.threads`

    The route to the list of threads of a forum, displayed in reverse last post date order, _i.e._ the threads with the most recent posts appear first.

    Defaults to '`/forums/t/:forumId`'.

- `routes.posts`

    The route to the list of posts of a thread, displayed in post date order, _i.e._ from the oldest to the newest.

    Defaults to '`/forums/p/:threadId`'.

- `routes.admin`

    The route to the forums manager.

    Defaults to '`/forums/admin`'.

- `forums.access`

    Provide a default value for new forums `access` parameter, defaulting to `FRS_FORUM_PUBLIC`.

- `forums.publicWriter`

    Provide a default value for new forums `publicWriter` parameter, defaulting to `FRS_USER_EMAILVERIFIED`.

- `forums.publicWriterAppFn`

    An application-provided function to determine if a logged-in user is allowed to participate to a public forum.

    The `forum` object is provided as single argument; the function must return `true` to allow the currently logged-in user is allowed to write in the forum.

    This parameter is only considered when `publicWriter` is `FRS_USER_APPFN` for the considered forum.

    Default is a function which returns `false`.

- `forums.moderation`

    Provide a default value for new forums `moderation` parameter, defaulting to `FRS_MODERATE_APRIORI`.

    Known values are:

    - `FRS_MODERATE_NONE`
    - `FRS_MODERATE_APRIORI`
    - `FRS_MODERATE_APOSTERIORI`.

- `forums.inform`

    Provide a default value for new forums `information` parameter, defaulting to `FRS_INFORM_MUST`.

    Known values are:

    - `FRS_INFORM_NONE`

        The author is not informed of the moderation of his/her post.

    - `FRS_INFORM_MAY`

        The moderator may choose to inform, or not the author.

    - `FRS_INFORM_MUST`.

        The author must be informed.

- `verbosity`

    Configure the verbosity level of the package.

    Accepted value is an OR-ed result of the followings:

    - `FRS_VERBOSE_NONE`
    - `FRS_VERBOSE_CONFIGURE`
    - `FRS_VERBOSE_STARTUP`
    - `FRS_VERBOSE_READY`
    - `FRS_VERBOSE_COLLECTIONS`

    Default value is `FRS_VERBOSE_CONFIGURE|FRS_VERBOSE_READY`.

Thanks to the `pwix:options` package, all these configuration parameters accept either a value, or a function which will return the expected value at run time.

### Forum configuration

Per forum configuration is available through the forums manager page.

- `access` with values:

    - `FRS_FORUM_PUBLIC`
    - `FRS_FORUM_PRIVATE`

    defaulting to the value of `forums.access` general configuration parameter

- `publicWriter`

    Who is able to participate to public forums ? By participation, we mean posting in the forum, as reading public forums is always allowed.

    Possible values are:

    - `FRS_USER_ANYBODY`

        Anybody is able to participate to public forums without even being connected.

        This option is provided for completeness, but we strongly advise against it

    - `FRS_USER_LOGGEDIN`

        Being connected to the application is enough to participate to the public forums.

    - `FRS_USER_EMAILADDRESS`

        Public forum participation is allowed as soon as an email address is registered in the user account.

    - `FRS_USER_EMAILVERIFIED`

        Public forum participation is allowed as soon as a verified email address is registered in the user account.

        This is the default.

    - `FRS_USER_APPFN`

        Whether a connected user is allowed to participate to a public forum is determined at runtime by an application-provided function.

        This is the way for an application to fully override the authorization mechanisms in `pwix:forums`.

- `moderation`

    Possible values are:

    - `FRS_MODERATE_NONE`
    
        No moderation at all (not advisable).

    - `FRS_MODERATE_APRIORI`
    
        Moderation _a priori_, posts are published after validation.

        This is the default.

    - `FRS_MODERATE_APOSTERIORI`
    
        Moderation _a posteriori_, posts are visible as soon as published by the user.

- `moderators`

    The list of users which are allowed to moderate this particular forum, even if they do not have any MODERATOR role.

Private forums also have:

- `readers`: the list of user's identifiers allowed to see and read the private forum

- `writers`: the list of user's identifiers allowed to post into the private forum

## What does it provide ?

### Globally exported object

The `pwix:forums` package exports a single `Forums` object which holds all necessary data and functions.

### Blaze templates

#### `frsForums`

The `frsForums` Blaze template let the application display the available forums.

Whether a user is connected or not, all public forums are visible here.

A private forum is only displayed if the logged-in user has a read access on it, either because it is explicitely listed in the readers list, or because he/she has a `FRS_PRIVATE_VIEW` role.

---

    
    Post
        Created by a forum user, maybe in response to another post
        Hierarchy of posts and their replies form a thread
        May be moderated by a forum admin
        The forum admin may decide to pin some posts which will be displayed always on top.
        Obviously, the count of pinned posts should be kept rather small, but forums doesn't force that in any case.
        The creator of the post is its owner.
        A post may be edited only by its owner.
        A post may be deleted by its owner or by a forum admin.
        
        Note: this is a design decision that the post cannot be edited by anyone, but its owner.
        And this is also a design decision that the application admin cannot manage/edit/delete the posts.

## NPM peer dependencies

In accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#npm-dependencies), we do not hardcode NPM dependencies in `package.js`. Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 1.0.0:

```
    '@popperjs/core': '^2.11.6',
    'bootstrap': '^5.2.1',
    'dotdotdot': '^1.1.0',
    'lodash': '^4.17.0',
    'printf': '^0.6.1'
```

## Translations

New and updated translations are willingly accepted, and more than welcome. Just be kind enough to submit a PR on the [Github repository](https://github.com/trychlos/pwix-options/pulls).

---
P. Wieser
- Last updated on 2023, Feb. 17th
