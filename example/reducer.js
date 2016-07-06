
export default {
  count: function(state = 0, action = {}) {
    const {type} = action;

    switch (type) {

        case 'increment':
          return state + 1;
          break;

        case 'decrement':
          return state - 1;
          break;

        default:
          return state;

    }

  }
}
