import React from 'react';

export default function App(props) {
  const {children} = props;
  return (
    <div>
      <h1>My App</h1>
      {children}
    </div>
  );
}

