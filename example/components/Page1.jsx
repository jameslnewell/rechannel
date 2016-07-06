import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';

function Page1(props) {
  const {dispatch} = props;
  return (
    <div>
      <h2>Page #1</h2>
      <button onClick={() => dispatch(push('/page-2'))}>Go to Page #2</button>
    </div>
  );
}

export default connect()(Page1);
