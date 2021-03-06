TodoListPage = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData() {
    // Get list ID from ReactRouter
    const listId = this.props.params.listId;
    var lists = Lists.find().fetch();

    // Subscribe to the tasks we need to render this component
    const tasksSubHandle = Meteor.subscribe("todos", listId);
    const listTasksSubHandle = Meteor.subscribe("lists");

    return {
      lists,
      tasks: Todos.find({ listId: listId }, {sort: {createdAt : -1}}).fetch(),
      list: Lists.findOne({ _id: listId }),
      tasksLoading: !(tasksSubHandle.ready() && listTasksSubHandle.ready())
    };
  },

  render() {
    const {list, lists} = this.data;
    const tasks = this.data.tasks;
    if (! list) {
      return <AppNotFound />;
    }

    return (
      <div className="page lists-show">
        <TodoListHeader
          list={list}
          lists={lists}
          showLoadingIndicator={this.data.tasksLoading} />

        <TodoListItems tasks={this.data.tasks} />
      </div>
    );
  }
});
