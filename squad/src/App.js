import React, { useState, useEffect } from 'react';
import './App.css';
import Admin from './components/admin/admin.js'; // Import Admin component
import SelectorsChoice from './components/users/users.js'; // Import Admin component

function App() {

  const [currentView, setCurrentView] = useState('home'); // Default View
  const [selectedUser, setSelectedUser] = useState(null); // State to store selected user
  // Users/Selectors array
  const selectors = [
    { id: 1, name: 'Ryan' },
    { id: 2, name: 'Michelle' },
    { id: 3, name: 'Lincoln' },
  ];

  useEffect(() => {
    const backgroundImage = {
      home: 'url(/assets/images/darkTree.jpg)',
      admin: 'url(/assets/images/forest.jpg)',
      users: 'url(/assets/images/water.jpg)',
    };
    console.log("Background url: ", backgroundImage[currentView]);
    console.log("\n\nCurrent View: ", currentView);
    document.body.style.backgroundImage = backgroundImage[currentView];
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.height = '100vh';

  }, [currentView]); // Only depend on currentView

  const handleSelectorClick = (selector) => {
    setSelectedUser(selector); // Set the selected user details
    setCurrentView('aSelector'); // Move to the 'aSelector' view
  };

  return (
    <div className="App">
      {/* Home View */}
      <div className={`mainViewContainer ${currentView === 'home' ? 'active' : ''}`} >
        <div id="homeViewContainer">
          <button onClick={() => 
            setCurrentView('admin')} className="big-btn" aria-label="Go to Admin Section">Admin</button>
          <button onClick={() => 
            setCurrentView('selectors')} className="big-btn" aria-label="Go to Users Section">Selectors</button>
        </div>
      </div>

      {/* Admin View */}
      <div className={`mainViewContainer ${currentView === 'admin' ? 'active' : ''}`}>
        <div id="adminViewContainer">
          <Admin backButton={
            <button 
              onClick={() => setCurrentView('home')} 
              className="mainBackBtn" 
              aria-label="Go back to Home">← Back
            </button>
          }/>
        </div>  
      </div>

      {/* Selectors Available */}
      <div className={`mainViewContainer ${currentView === 'selectors' ? 'active' : ''}`}>
        <div id="adminUsersSelectionContainer">
          <button onClick={() => 
            setCurrentView('home')} className="big-btn" aria-label="Back to the home section">
              Home
          </button>

          {selectors.map((selector) => (
            <button
              key={selector.id}
              onClick={() => handleSelectorClick(selector)}
              className="big-btn"
              aria-label={`Go to ${selector.name}'s Selection Section`}
            >
              {selector.name}
            </button>
          ))}
        </div>  
      </div>

      {/* A Selector's Players Selection */}
      <div className={`mainViewContainer ${currentView === 'aSelector' ? 'active' : ''}`}>
        <div id="adminUsersContainer">
          <SelectorsChoice
            backButton={
              <button 
                onClick={() => setCurrentView('selectors')} 
                className="mainBackBtn" 
                aria-label="Go back to Selectors"
              >
                ← Back
              </button>
            }
            selectedUser={selectedUser} // Pass selected user as a prop
          />
        </div>
      </div>
    </div>
  );
}

export default App;
