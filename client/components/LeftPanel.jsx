LeftPanel = React.createClass({
  propTypes: {
    currentUser: React.PropTypes.object,
    onAddList: React.PropTypes.func,
    lists: React.PropTypes.array.isRequired,
    activeListId: React.PropTypes.string,
  },
  render() {
    var {lists} = this.props;
    lists.sort((a, b) => a.name > b.name);
    return (
      <section id="menu">
        <UserSidebarSection user={ this.props.currentUser } />
        <div className="list-todos">
          <TodoLists
            lists={lists}
            activeListId={this.props.activeListId} />
        </div>
      </section>
    );
  }
});
