Package.describe({
    name: 'pwix:forums',
    version: '0.90.0',  // pre-release version number
    summary: 'A forum solution for Meteor',
    git: 'https://github.com/trychlos/pwix-forums',
    documentation: 'README.md'
});

Package.onUse( function( api ){
    configure( api );
    api.export([
        'pwiForums'
    ]);
    api.mainModule( 'src/client/js/index.js', 'client' );
    api.mainModule( 'src/server/js/index.js', 'server' );
});

Package.onTest( function( api ){
    configure( api );
    api.use( 'tinytest' );
    api.use( 'pwix:forums' );
    api.mainModule( 'test/js/index.js' );
});

function configure( api ){
    api.versionsFrom( '1.8.1' );
    api.use( 'blaze-html-templates@2.0.0', 'client' );
    api.use( 'ecmascript' );
    api.use( 'less@4.0.0', 'client' );
    api.use( 'pwix:accounts-tools@0.1.0' );
    api.use( 'pwix:bootbox@1.0.0', 'client' );
    api.use( 'pwix:editor', 'client' );
    api.use( 'pwix:i18n@1.0.0' );
    api.use( 'pwix:modal@1.1.0', 'client' );
    api.use( 'pwix:modal-info@1.0.0', 'client' );
    api.use( 'pwix:options@1.0.0' );
    api.use( 'pwix:roles' );
    api.use( 'pwix:tolert@1.0.0', 'client' );
    api.use( 'tmeasday:check-npm-versions@1.0.2', 'server' );
    api.use( 'webapp', 'server' );
    api.addFiles( 'src/client/components/frsAllPosts/frsAllPosts.js', 'client' );
    api.addFiles( 'src/client/components/frsForums/frsForums.js', 'client' );
    api.addFiles( 'src/client/components/frsManager/frsManager.js', 'client' );
    api.addFiles( 'src/client/components/frsModerate/frsModerate.js', 'client' );
    api.addFiles( 'src/client/components/frsPosts/frsPosts.js', 'client' );
    api.addFiles( 'src/client/components/frsThreads/frsThreads.js', 'client' );
}

// NPM dependencies are checked in /src/server/js/check_npms.js
// See also https://guide.meteor.com/writing-atmosphere-packages.html#npm-dependencies
