import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Panel from './components/Panel';
import GridUtils from './utils/GridUtils';

function App() {
  return (
    <div className="App">
      <Panel
        grid={GridUtils.generateDefaultGrid()}
      />
    </div>
  );
}

export default App;
