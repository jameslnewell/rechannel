import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';

function Page2(props) {
  const {dispatch} = props;
  return (
    <div>
      <h2>Page #2</h2>
      <button onClick={() => dispatch(push('/page-1'))}>Go to Page #1</button>
    </div>
  );
}

export default connect()(Page2);