import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Panel from './components/Panel';
import GridUtils from './utils/GridUtils';
import ErrorBoundary from './error/ErrorBoundary';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <Panel
          grid={GridUtils.generateDefaultGrid()}
        />
      </ErrorBoundary>
    </div>
  );
}

export default App;
