(function() {

  $(window).keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      if($('#msgInput').is(':focus') || $('#sendMsg').is(':focus')){
        $('#sendMsg').trigger('click');
      }
      else{
        return false;       
      }
    }
  });

  $("#msgInput").keyup(function () {
      if ($("#msgInput").val().length > 0) {
        $("#sendMsg").removeAttr('disabled');
      }
      else {
        $("#sendMsg").attr('disabled', 'disabled');        
      }
  });

  var app = angular.module('webChat', ['indexedDB','ngWebSocket'])
  .config(function ($indexedDBProvider) {
    $indexedDBProvider
      .connection('myIndexedDB')
      .upgradeDatabase(2, function(event, db, tx){
        db.createObjectStore('users', {keyPath: 'ssn'});
        // objStore.createIndex('name_idx', 'name', {unique: false});
        // objStore.createIndex('age_idx', 'age', {unique: false});
      });
  });

  if(!localStorage.getItem('allUsers')){
    localStorage.setItem('allUsers', JSON.stringify(users));
  }
  else {
    localStorage.setItem('allUsers', localStorage.getItem('allUsers'));
  }

  app.controller('ChatController', function($scope, $indexedDB, $websocket) {
    var allUsers = localStorage.getItem('allUsers');
    $scope.users = JSON.parse(allUsers);
    $scope.searchQuery = '';

    this.clearSearchField = function(){
      $scope.searchQuery = '';
    };

    this.openChat = function(user, $index){
      this.selectedUser = user;
      $scope.selectedIndex = $index;
      $('a[href="#chats"]').tab('show');
      $('.chat-footer input').focus();
    };

    this.updateChatHistory = function(user, $index){
      $scope.selectedIndex = $index;
      var ws = $websocket('ws://echo.websocket.org/');
      var new_message = $('#msgInput').val();
      if (!new_message) { return; }

      var outMsg = {
        text: new_message,
        seq: "msg-out"
      }
    
      ws.onOpen(function() {
      });
      
      ws.send(new_message);
      user.messages.push(outMsg);
      users[user.id - 1].messages.push(outMsg);
      localStorage.setItem('allUsers', JSON.stringify(users));

      ws.onMessage(function(event) {
        var message = event.data;
        var inMsg = {
          text: message,
          seq: "msg-in"
        }
        ws.close();
        user.messages.push(inMsg);
        users[user.id - 1].messages.push(inMsg);
        localStorage.setItem('allUsers', JSON.stringify(users));
      });
      
      $('#msgInput').val('');
    };
  });
  
})();
