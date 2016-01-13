TodoListHeader = React.createClass({
  mixins: [ReactRouter.Navigation],

  propTypes: {
    list: React.PropTypes.object.isRequired,
    lists: React.PropTypes.array.isRequired,
    tasksLoading: React.PropTypes.bool
  },

  getInitialState() {
    return {
      editingTitle: false,
    };
  },

  startEditingTitle() {
    this.setState({
      editingTitle: true,
      nameInputValue: this.props.list.name
    }, () => {
      ReactDOM.findDOMNode(this.refs.nameInput).focus();
    });
  },

  stopEditingTitle(event) {
    event.preventDefault();

    this.setState({
      editingTitle: false,
      nameInputValue: undefined
    });

    Meteor.call("/lists/updateName",
      this.props.list._id, this.state.nameInputValue);
  },

  titleChanged(event) {
    this.setState({
      nameInputValue: event.target.value
    });
  },

  deleteList() {
    const errorMessages = {
      "not-logged-in": "Please sign in or create an account to make private lists.",
      "final-list-delete": "Sorry, you cannot delete the final public list!",
    };

    const message = `Are you sure you want to restart Room: ${this.props.list.roomID}?`;
    if (confirm(message)) {
      Meteor.call("/lists/delete", this.props.list._id, (err, res) => {
        if (err) {
          alert(errorMessages[err.error]);
          return;
        }

        // Now that this list doesn't exist, redirect to the first list
        this.transitionTo("root");
      })
    }
  },

  toggleListPrivacy() {
    const errorMessages = {
      "not-logged-in": "Please sign in or create an account to make private lists.",
      "final-list-private": "Sorry, you cannot make the final public list private!",
    };

    Meteor.call("/lists/togglePrivate", this.props.list._id, (err, res) => {
      if (err) {
        alert(errorMessages[err.error]);
      }
    });
  },

  _isBlack(value) {
    return value % 2 === 0;
  },

  _isMyTurn() {
    const {list, lists} = this.props;

    const opponent = this._getOpponent();
    if (opponent.checkedOrderList.length === 0 && list.checkedOrderList.length === 0) {
      return list._id > opponent._id;
    }

    if (opponent.checkedOrderList.length > list.checkedOrderList.length) {
      return true;
    }

    if (opponent.checkedOrderList.length === list.checkedOrderList.length) {
      let [myScore, opponentScore] = this._getScores();
      if (myScore === opponentScore) {
        return list._id > opponent._id;
      }
      return myScore > opponentScore;
    }

    return false;
  },

  _getScores() {
    const {list, lists} = this.props;

    const opponent = this._getOpponent();
    var myScore = 0;
    var opponentScore = 0;

    var round = this._getRound()
    for (var i = 0; i < round; i ++) {
      if (list.checkedOrderList[i] > opponent.checkedOrderList[i]) {
        myScore ++;
      } else if (list.checkedOrderList[i] < opponent.checkedOrderList[i]) {
        opponentScore ++;
      }
    }
    return [myScore, opponentScore];
  },

  _getOpponent() {
    const {list, lists} = this.props;
    return lists.find(obj => obj._id !== list._id && obj.roomID === list.roomID);
  },

  _getLastOpponentColor() {
    const opponent = this._getOpponent();
    if (opponent.checkedOrderList.length === 0) {
      return "* * *";
    }
    return this._isBlack(opponent.checkedOrderList[opponent.checkedOrderList.length - 1])
      ? " * Black * " :  " * White * ";
  },

  _getRound() {
    const {list, lists} = this.props;
    const opponent = this._getOpponent();
    return Math.min(opponent.checkedOrderList.length, list.checkedOrderList.length);
  },

  _renderScores() {
    const {list, lists} = this.props;

    const opponent = this._getOpponent();
    if (opponent == null || opponent.checkedOrderList == null || list.checkedOrderList == null) {
      return null;
    }

    let [myScore, opponentScore] = this._getScores();

    var round = this._getRound();
    if (round === 9 && !this._alerted) {

      var result;
      if (myScore === opponentScore) {
        result = 'DRAW!!!! \n';
      } else if (myScore > opponentScore) {
        result = 'WIN!!!! \n';
      } else {
        result = 'LOSE!!!! \n';
      }

      for (var i = 0; i < 9; i++) {
        result += "Me: " + list.checkedOrderList[i] + " - Opponent: " + opponent.checkedOrderList[i] + "\n";
      }
      this._alerted = true;
      alert(result);
    }

    var midLabel = this._getLastOpponentColor();
    if (this._isMyTurn()) {
      midLabel += "(MY TURN)";
    }

    var oppenentUsedBlackCount =
      opponent.checkedOrderList.filter(this._isBlack).length;

    var oppenentUsedWhiteCount =
      opponent.checkedOrderList.length - oppenentUsedBlackCount;
    return (
      <span className="todo-new input-symbol">
        Me: {myScore} - Opponent: {opponentScore}
        {midLabel}
        B: {4 - oppenentUsedBlackCount} - W: {5 - oppenentUsedWhiteCount}
      </span>
    );
  },

  render() {
    const {list, lists} = this.props;

    const newTaskForm = this._renderScores();

    let nav;
    if (this.state.editingTitle) {
      nav = (
        <nav>
          <form className="list-edit-form" onSubmit={ this.stopEditingTitle }>
            <input type="text" name="name"
              ref="nameInput"
              defaultValue={ list.name }
              onChange={ this.titleChanged }
              onBlur={ this.stopEditingTitle } />
            <div className="nav-group right">
              <a className="nav-item">
                <span className="icon-close" title="Cancel" />
              </a>
            </div>
          </form>
          { newTaskForm }
        </nav>
      );
    } else if (list && ! this.props.tasksLoading) {
      nav = (
        <nav>
          <MenuOpenToggle />
          <h1 className="title-page" onClick={ this.startEditingTitle }>
            <span className="title-wrapper">{ list.name }</span>
            <span className="count-list">{ this._getRound() }</span>
          </h1>
          <div className="nav-group right">
            <div className="nav-item options-mobile">
              <a className="nav-item" onClick={ this.deleteList }>
                <span className="icon-trash" title="Delete list"></span>
              </a>
            </div>
            <div className="options-web">
              <a className="nav-item" onClick={ this.deleteList }>
                <span className="icon-trash" title="Delete list"></span>
              </a>
            </div>
          </div>
          { newTaskForm }
        </nav>
      );
    } else if (list) {
      nav = (
        <nav>
          <div className="wrapper-message">
            <div className="title-message">Loading tasks...</div>
          </div>
        </nav>
      );
    }

    return nav;
  }
});
