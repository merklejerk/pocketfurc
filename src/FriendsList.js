var _ = require( "underscore" );
var ListenerHost = require( "./jsfurc/ListenerHost" );
var Util = require( "./jsfurc/Util" );

module.exports = function( client )
{
   var _this = this;
   var _events = new ListenerHost( this );
   var _onlineCursor = 0;
   var _friends = {};

   this.reload = function( )
   {
      _load( );
   }

   this.getClient = function( )
   {
      return client;
   }

   var _onTick = function( )
   {
      var keys = _.keys( _friends );
      if (keys.length > 0)
      {
         _onlineCursor = (++_onlineCursor) % keys.length;
         if (_onlineCursor < keys.length)
         {
            var name = keys[_onlineCursor];
            client.checkOnline( name, _.partial( _onOnlineResult, name ) );
         }
      }
   }

   var _onOnlineResult = function( key, name, isOnline )
   {
      if (key in _friends)
      {
         var friend = _friends[key];
         friend.name = name;
         _this.setStatus( key, isOnline );
      }
   }

   this.getFriends = function( )
   {
      return _.map( _friends, function( friend ) {
         return _.extend( {}, friend );
      } );
   }

   var _createKeyFromName = function( name )
   {
      return Util.createCanonicalPlayerName( name );
   }

   this.isOnline = function( name )
   {
      var key = _createKeyFromName( name );
      if (key in _friends)
         return _friends[key].online;
      return false;
   }

   this.setStatus = function( name, online )
   {
      var key = _createKeyFromName( name );
      if (key in _friends)
      {
         var friend = _friends[key];
         if (friend.online != online)
         {
            friend.online = online;
            _events.raise( "onFriendStatus", friend.name, friend.online );
         }
      }
   }

   this.addFriend = function( name, online )
   {
      var key = _createKeyFromName( name );
      _friends[key] = {
         "name": name,
         "online": false,
         "lastSeen": null
      };
      _save( );
      if (online)
         _this.setStatus( name, online );
   }

   this.removeFriend = function( name )
   {
      var key = _createKeyFromName( name );
      if (key in _friends)
         delete _friends[key];
      _save( );
   }

   this.isFriend = function( name )
   {
      var key = _createKeyFromName( name );
      return key in _friends;
   }

   this.reset = function( )
   {
      for (key in _friends)
         _this.setStatus( key, false );
   }

   var _save = function( )
   {
      chrome.storage.sync.set( { "friends": _serializeList( ) } );
   }

   var _serializeList = function( )
   {
      var serialized = {};
      _.each( _friends,
         function( friend, key ) {
         serialized[key] = { "name": friend.name, "lastSeen": friend.lastSeen };
      } );
      return serialized;
   }

   var _load = function( )
   {
      chrome.storage.sync.get( "friends",
         function( items ) {
         _deserializeList( items["friends"] );
      } );
   }

   var _deserializeList = function( serialized )
   {
      if (serialized)
      {
         var list = {};
         _.each( serialized, function( friend, key ) {
            list[key] = _.extend( {
               "online": _this.isOnline( key )
            }, friend );
         } );
         _friends = list;
      }
   }

   _load( );
   var _tickInterval = setInterval( _onTick, 5000 );
};
