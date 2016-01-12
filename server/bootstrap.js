// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
  if (Lists.find().count() === 0) {
    var data = [
      {name: "Room 0: Player A",
       items: [1, 2, 3, 4, 5, 6, 7, 8, 9],
       roomID: 0,
      },
      {name: "Room 0: Player B",
       items: [1, 2, 3, 4, 5, 6, 7, 8, 9],
       roomID: 0,
      },
      {name: "Room 1: Player A",
       items: [1, 2, 3, 4, 5, 6, 7, 8, 9],
       roomID: 1,
      },
      {name: "Room 1: Player B",
       items: [1, 2, 3, 4, 5, 6, 7, 8, 9],
       roomID: 1,
      },
      {name: "Room 2: Player A",
       items: [1, 2, 3, 4, 5, 6, 7, 8, 9],
       roomID: 2,
      },
      {name: "Room 2: Player B",
       items: [1, 2, 3, 4, 5, 6, 7, 8, 9],
       roomID: 2,
      },
      {name: "Room 3: Player A",
       items: [1, 2, 3, 4, 5, 6, 7, 8, 9],
       roomID: 3,
      },
      {name: "Room 3: Player B",
       items: [1, 2, 3, 4, 5, 6, 7, 8, 9],
       roomID: 3,
      },
    ];

    var timestamp = (new Date()).getTime();
    _.each(data, function(list) {
      var list_id = Lists.insert({
        name: list.name,
        incompleteCount: list.items.length,
        roomID: list.roomID,
      });

      _.each(list.items, function(text) {
        Todos.insert({listId: list_id,
                      text: text,
                      createdAt: new Date(timestamp)});
        timestamp += 1; // ensure unique timestamp.
      });
    });
  }
});
