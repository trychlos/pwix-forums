# pwix:forums

## What is it ?

A forum solution for Meteor.

In `pwix:forums`, a forum can be public or private:

- A public forum is readable by anybody, even a non-connected, anonymous, visitor.

- Who is able to write into a public forum is determined by the '`publicWriter`' parameter which qualifies a user topology (say for example logged-in users). A default value is configurable at the package level for all public forums, but each forum can have its own value.

- Who can moderate a public forum is determined by either the '`Forums.C.Access.MODERATOR`' role, or a list of users able to moderate this particular forum.

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
     +- Forums.C.Access.MANAGER               authorized to manage (create, update,delete) forums
     |   |
     |   +- Forums.C.Access.CREATE            authorized to create forums
     |   |
     |   +- Forums.C.Access.UPDATE            authorized to update forums
     |   |
     |   +- Forums.C.Access.DELETE            authorized to delete forums
     |
     +- FRS_MODERATOR_MANAGER           the moderators manager
     |   |
     |   +- FRS_MODERATOR               moderate all forums
     |   |   |                          Each forum may define an extensive list of moderators who may moderate this particular forum without having this general role
     |   |   |
     |   |   +- Forums.C.Access.MODERATOR    moderate public forums
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

### Configuration

The package's behavior can be configured through a call to the `Forums.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

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

    Provide a default value for new forums `access` parameter, defaulting to `Forums.C.Access.PUBLIC`.

- `forums.publicWriter`

    Provide a default value for new forums `publicWriter` parameter, defaulting to `Forums.C.Participation.EMAILVERIFIED`.

- `forums.publicWriterAppFn`

    An application-provided function to determine if a logged-in user is allowed to participate to a public forum.

    The `forum` object is provided as single argument; the function must return `true` to allow the currently logged-in user is allowed to write in the forum.

    This parameter is only considered when `publicWriter` is `Forums.C.Participation.APPFN` for the considered forum.

    Default is a function which returns `false`.

- `forums.moderation`

    Provide a default value for new forums `moderation` parameter, defaulting to `Forums.C.Moderation.APRIORI`.

    Known values are:

    - `Forums.C.Moderation.NONE`
    - `Forums.C.Moderation.APRIORI`
    - `Forums.C.Moderation.APOSTERIORI`.

- `forums.inform`

    Provide a default value for new forums `information` parameter, defaulting to `Forums.C.Information.MUST`.

    Known values are:

    - `Forums.C.Information.NONE`

        The author is not informed of the moderation of his/her post.

    - `Forums.C.Information.MAY`

        The moderator may choose to inform, or not the author.

    - `Forums.C.Information.MUST`.

        The author must be informed.

- `verbosity`

    Configure the verbosity level of the package.

    Accepted value is an OR-ed result of the followings:

    - `Forums.C.Verbose.NONE`
    - `Forums.C.Verbose.CONFIGURE`
    - `Forums.C.Verbose.STARTUP`
    - `Forums.C.Verbose.READY`
    - `Forums.C.Verbose.COLLECTIONS`

    Default value is `Forums.C.Verbose.NONE`.

Thanks to the `pwix:options` package, all these configuration parameters accept either a value, or a function which will return the expected value at run time.

### Forum configuration

Per forum configuration is available through the forums manager page.

- `access` with values:

    - `Forums.C.Access.PUBLIC`
    - `Forums.C.Access.PRIVATE`

    defaulting to the value of `forums.access` general configuration parameter

- `publicWriter`

    Who is able to participate to public forums ? By participation, we mean posting in the forum, as reading public forums is always allowed.

    Possible values are:

    - `Forums.C.Participation.ANYBODY`

        Anybody is able to participate to public forums without even being connected.

        This option is provided for completeness, but we strongly advise against it

    - `Forums.C.Participation.LOGGEDIN`

        Being connected to the application is enough to participate to the public forums.

    - `Forums.C.Participation.EMAILADDRESS`

        Public forum participation is allowed as soon as an email address is registered in the user account.

    - `Forums.C.Participation.EMAILVERIFIED`

        Public forum participation is allowed as soon as a verified email address is registered in the user account.

        This is the default.

    - `Forums.C.Participation.APPFN`

        Whether a connected user is allowed to participate to a public forum is determined at runtime by an application-provided function.

        This is the way for an application to fully override the authorization mechanisms in `pwix:forums`.

- `moderation`

    Possible values are:

    - `Forums.C.Moderation.NONE`
    
        No moderation at all (not advisable).

    - `Forums.C.Moderation.APRIORI`
    
        Moderation _a priori_, posts are published after validation.

        This is the default.

    - `Forums.C.Moderation.APOSTERIORI`
    
        Moderation _a posteriori_, posts are visible as soon as published by the user.

- `moderators`

    The list of users which are allowed to moderate this particular forum, even if they do not have any MODERATOR role.

Private forums also have:

- `readers`: the list of user's identifiers allowed to see and read the private forum

- `writers`: the list of user's identifiers allowed to post into the private forum

## What does it provide ?

### Globally exported object

The `pwix:forums` package exports a single `Forums` object which holds all necessary data and functions.

### Methods

#### `Forums.ready()`

A client-only reactive data source, which becomes true when the package is ready (at startup).

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
- Last updated on 2023, Oct. 11th
