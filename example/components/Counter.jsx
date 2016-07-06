import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';

function Counter(props) {
  const {dispatch, count} = props;
  return (
    <div>
      <h2>Counter</h2>

      <b>{count}</b>

      <br/><br/>

      <button onClick={() => dispatch({type: 'decrement'})}>⇩</button>
      {' '}
      <button onClick={() => dispatch({type: 'increment'})}>⇧</button>

      <br/><br/>

      <button onClick={() => dispatch(push('/page-1'))}>Go to Page #1</button>
      {' '}
      <button onClick={() => dispatch(push('/page-2'))}>Go to Page #2</button>
    </div>
  );
}

export default connect(state => ({count: state.count}))(Counter);
