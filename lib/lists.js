Lists = new Mongo.Collection('lists');

// Calculate a default name for a list in the form of 'List A'
Lists.defaultName = function() {
  var nextLetter = 'A', nextName = 'Player ' + nextLetter;
  while (Lists.findOne({name: nextName})) {
    // not going to be too smart here, can go past Z
    nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
    nextName = 'Player ' + nextLetter;
  }

  return nextName;
};

Lists.getNewRoomID = function() {
  var roomID = 0;
  while (Lists.find({roomID: roomID}).length === 2) {
    roomID ++;
  }

  return roomID;
};

Meteor.methods({
  '/lists/add': function () {
    // NOT USED
    var list = {
      name: Lists.defaultName(),
      roomID: Lists.getNewRoomID(),
      incompleteCount: 0,
      createdAt: new Date(),
      checkedOrderList: [],
    };

    var listId = Lists.insert(list);
    for (var i = 1; i<= 9; i++) {
      Todos.insert({
        listId: listId,
        text: i,
        checked: false,
        createdAt: new Date()
      });
    }

    return listId;
  },
  '/lists/updateName': function (listId, newName) {
    Lists.update(listId, {
      $set: { name: newName }
    });
  },
  '/lists/togglePrivate': function (listId) {
    var list = Lists.findOne(listId);

    if (! Meteor.user()) {
      throw new Meteor.Error("not-logged-in");
    }

    if (list.userId) {
      Lists.update(list._id, {$unset: {userId: true}});
    } else {
      // ensure the last public list cannot be made private
      if (Lists.find({userId: {$exists: false}}).count() === 1) {
        throw new Meteor.Error("final-list-private");
      }

      Lists.update(list._id, {$set: {userId: Meteor.userId()}});
    }
  },
  '/lists/delete': function (listId) {
    var deleteList = Lists.findOne(listId);
    var pairLists = Lists.find({roomID: deleteList.roomID}).fetch();
    Todos.remove({listId: pairLists[0]._id});
    Todos.remove({listId: pairLists[1]._id});

    for (var i = 1; i<= 9; i++) {
      Todos.insert({
        listId: pairLists[0]._id,
        text: i,
        checked: false,
        createdAt: new Date()
      });
      Todos.insert({
        listId: pairLists[1]._id,
        text: i,
        checked: false,
        createdAt: new Date()
      });
    }
  },
  '/lists/addTask': function (listId, newTaskText) {
    Todos.insert({
      listId: listId,
      text: newTaskText,
      checked: false,
      createdAt: new Date()
    });

    Lists.update(listId, {$inc: {incompleteCount: 1}});
  }
});
