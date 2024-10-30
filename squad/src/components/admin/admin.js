import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid'; // Used to create unique IDs
import './admin.css'; // You can create a specific CSS file for the admin section

function Admin({ backButton }) {
  console.log("Have passed to the admin function:");
  // Input options
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [clubSide, setClubSide] = useState('');
  const [positions, setPositions] = useState([]);
  const [availability, setAvailability] = useState('Available');
  // All rugby players
  const [players, setPlayers] = useState([]);
  /*
    Last player added, updated or deleted
    Need to add "\U00A0" to force an empty cell to appear in the UI
  */ 
  const [lastPlayer, setLastPlayer] = useState({
    lastEntryFirstName: "\u00A0",
    lastEntryLastName: "\u00A0",
    lastEntryAvailability: "\u00A0" ,
    lastEntryClubSide: "\u00A0",
    lastEntryPositions: ["\u00A0"]});
  // State to track the table index selected row
  const [selectedRow, setSelectedRow] = useState(null);
  // Used to sorting
  const [sortConfig, setSortConfig] = useState({ key: 'firstName', order: 'asc' });

  /*
    Runs after a useState has been envoked BUT ONLY ONCE
      - I do not need to add a dependency like [players] to update setPlayers(data) below
      as 'setPlayers' is updated in later code blocks after every new player, update or deletion.
      I guess you can think of the 'players' object being updated via cache memory rather than JSON
      in the later code blocks
  */ 
  useEffect(() => {
    console.log("Admin useEffect() declared");
    // Fetch the players from the JSON file
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/assets/data/players.json');
        if (!response.ok) {
          console.log('ERROR: Network response was not ok: ', response.statusText);
          throw new Error('ERROR: Network response was not ok: ', response.statusText);
        }
    
        // Check if the response body is empty
        const text = await response.text();
        if (!text) {
          console.log('No player data found. Starting fresh.');
          setPlayers([]); // Initialize with an empty array if the response body is empty
          return;
        }
    
        const data = JSON.parse(text); // Parse the response text as JSON
        /*
          Validate the fetched JSON player data to ensure no malicious code
          If there is a problem then we will throw an error in the vaidatePlayerData function
        */ 
        validatePlayerData(data);
    
        // console.log('Accessed the players JSON object');
        setPlayers(data); // Set players with the fetched data
    
      } catch (error) {
        console.error('Error fetching player data:', error);
      }
    };

    fetchPlayers();

  }, []);  // Runs only once after the component mounts

  // Function to handle sorting only by firstName
  const handleSort = () => {
    setSortConfig((prevConfig) => {
      // Toggle order if the current sort key is 'firstName'
      return {
        key: 'firstName',
        order: prevConfig.order === 'asc' ? 'desc' : 'asc'
      };
    });
  };

  // Sort players based on firstName and the current sort order
  const sortedPlayers = [...players].sort((a, b) => {
    if (sortConfig.order === 'asc') {
      return a.firstName.localeCompare(b.firstName);
    } else {
      return b.firstName.localeCompare(a.firstName);
    }
  });

  // Helper function to check if a property exists on the player object (relates to validatePlayerData)
  const checkPropertyExists = (player, property, index) => {
    if (!player.hasOwnProperty(property)) {
      console.error(`ERROR: Player at index ${index} does not have '${property}' property.`);
      throw new Error(`Player at index ${index} is missing '${property}' property.`);
    }
  };

  // Helper function to validate property type and log errors (relates to validatePlayerData)
  const validatePropertyType = (player, property, expectedType, index) => {
    if (typeof player[property] !== expectedType) {
      console.error(`ERROR: Player at index ${index} has invalid '${property}' type. Contents: ${String(player[property])}. TypeOf: ${typeof player[property]}`);
      throw new Error(`Player at index ${index} has invalid '${property}' type. Contents: ${String(player[property])}. TypeOf: ${typeof player[property]}`);
    }
  };
 
  /*
      Validate the incoming data from the JSON file to ensure that there is no malicious code
      If the data is not valid (string types) then we will throw an error in this function
  */ 
  const validatePlayerData = (data) => {
    try {
      // Check if data is an array
      if (!Array.isArray(data)) {
        throw new Error('Data is not an array');
      }
  
      // Validate each player object
      data.forEach((player, index) => {
        // console.log(`Validating player at index ${index}:`, player);
  
        // Validate 'id'
        checkPropertyExists(player, 'id', index);
        validatePropertyType(player, 'id', 'string', index)

        // Validate 'firstName'
        checkPropertyExists(player, 'firstName', index);
        validatePropertyType(player, 'firstName', 'string', index)
  
        // Validate 'lastName'
        checkPropertyExists(player, 'lastName', index);
        validatePropertyType(player, 'lastName', 'string', index)
  
        // Validate 'clubSide'
        checkPropertyExists(player, 'clubSide', index);
        validatePropertyType(player, 'clubSide', 'string', index)
  
        // Validate 'positions'
        checkPropertyExists(player, 'positions', index);
        if (!Array.isArray(player.positions)) {
          console.error(`ERROR: Player at index ${index} has invalid 'positions'. Expected an object but instead have . ${typeof(player.positions)}`);
          throw new Error(`Player at index ${index} has invalid 'positions'. Expected an object but instead have . ${typeof(player.positions)}`);
        }
        
        // Check if 'positions' is a non-empty array of strings
        if (player.positions.length > 0 && !player.positions.every(pos => typeof pos === 'string')) {
          console.error(`ERROR: Player at index ${index} has invalid 'positions'. Expected array of strings when not empty.`);
          throw new Error(`Player at index ${index} has invalid 'positions'. Expected array of strings when not empty.`);
        }
  
        // Validate 'availability'
        checkPropertyExists(player, 'availability', index);
        validatePropertyType(player, 'availability', 'string', index)
 
        // Log success for each valid player
        // console.log(`SUCCESS: Player values at index ${index} is valid.`);
      });
  
    } catch (error) {
      console.error('ERROR: Validation failed:', error.message);
    }
  };
      
  const clubSides = [
    { id: "bluesRadioBtn", value: "Blues", label: "Blues" },
    { id: "chiefsRadioBtn", value: "Chiefs", label: "Chiefs" },
    { id: "crusadersRadioBtn", value: "Crusaders", label: "Crusaders" },
    { id: "highlandersRadioBtn", value: "Highlanders", label: "Highlanders" },
    { id: "hurricanesRadioBtn", value: "Hurricanes", label: "Hurricanes" }
  ];

  const playerPositionForwards = [
    { type: "Forward", id: "propCheckBox", value: "Prop", label: "Prop" },
    { type: "Forward", id: "hookerCheckBox", value: "Hooker", label: "Hooker" },
    { type: "Forward", id: "lockCheckBox", value: "Lock", label: "Lock" },
    { type: "Forward", id: "looseForwardCheckBox", value: "Loose Forward", label: "Loose Forward" },
  ];

  const playerPositionBacks = [
    { type: "Back", id: "halfBackCheckBox", value: "Half Back", label: "Half Back" },
    { type: "Back", id: "1stFiveEightsCheckBox", value: "1st Five Eighths", label: "1st Five Eighths" },
    { type: "Back", id: "midfielderCheckBox", value: "Midfielder", label: "Midfielder" },
    { type: "Back", id: "WingerCheckBox", value: "Winger", label: "Winger" },
    { type: "Back", id: "fullBackCheckBox", value: "Full Back", label: "Full Back" }
  ];

  const availabilityArray = [  
    "Available",
    "Injured",
    "Retired",
    "Needs Work"
  ];

  // Display all radio options for clubside
  const renderRadioButtons = () => {
    try {
      // console.log('Creating radio buttons for club sides...');
      
      return clubSides.map((side) => {
        const uniqueId = nanoid(); // Generate a unique ID for each radio button
  
        return (
          <div className="clubSideRadioButtonItem" key={uniqueId}>
            <input 
              type="radio" 
              id={uniqueId} // Use the generated unique ID
              value={side.value} 
              checked={clubSide === side.value} 
              onChange={() => setClubSide(side.value)} 
            />
            <label htmlFor={uniqueId}>{side.label}</label>
          </div>
        );
      });
    } catch (error) {
      console.error('Error while creating radio buttons:', error.message);
    }
  };

  // Display all checkboxes for player positions
  const renderPositionCheckboxes = (positionsArray) => {
    try {
      // console.log('Creating position checkboxes...');
  
      return positionsArray.map((position) => {
        const uniqueId = nanoid(); // Generate a unique ID for each checkbox
  
        return (
          <div className="checkboxItem" key={uniqueId}>
            <input 
              type="checkbox" 
              id={uniqueId} // Use the generated unique ID
              value={position.value} 
              checked={positions.includes(position.value)} 
              onChange={() => handlePositionChange(position.value)} 
            />
            <label htmlFor={uniqueId}>{position.label}</label>
          </div>
        );
      });
    } catch (error) {
      console.error('Error while creating position checkboxes:', error.message);
    }
  };

  // Handler for availability change
  const handleAvailabilityChange = (e) => {
    setAvailability(e.target.value); // Update the availability state with the selected value
  };

  /*
    Each player can potentially be choosen for more than one position so will be tracked 
    what checkbox options the user selects.
    Either adding or removing those user selected optoins
  */
  const handlePositionChange = (position) => {
    if (positions.includes(position)) {
      // Removing that 'position' from the 'position' variable/array
      setPositions(positions.filter(p => p !== position));
    } else {
      // Adding to the variable/array
      setPositions([...positions, position]);
    }
  };

  const truncatePositions = (positions, limit = 10) => {
    const joinedPositions = positions.join(', ');
    if (joinedPositions.length > limit) {
      return `${joinedPositions.slice(0, limit)}...`;
    }
    return joinedPositions;
  };

  const truncateString = (text, limit = 15) => {
    try {
      if (text.length > limit) {
        return `${text.slice(0, limit)}...`;
      }
      return text;
    } catch (error) {
      console.error("Error truncating string:", error.message);
      return "Invalid input"; // Fallback message in case of an error
    }
  };

  // Function to update what table row was clicked
  const handleRowClick = (id) => {
    setSelectedRow(id); 
    // Find the player object by matching the id
    const player = players.find(p => p.id === id);
    
    // Check if the player exists
    if (player) {
      setCurrentPlayerId(id);
      setFirstName(player.firstName);
      setLastName(player.lastName);
      setClubSide(player.clubSide);
      setPositions(player.positions);
      setAvailability(player.availability);
    } else {
      console.error('Player not found:', id);
    }
  };

  /*
    Add a new player to the list.
    Check that the first and last name are not currently in the players list
      - If true (are already in the current list), then we need to check whether we are altering any pre-existing information.
        - If true (are making updates to the current player's information) then we update that data
        - else just return to the user and do nothing
    If first and last name are not the same then add the new player
  */ 
  const handleSubmit = (event) => {

    try {
      event.preventDefault();
      console.log('\nStarting the process to add or update a player...');

      /*
        Bare minimum to proceed is having a first and last name 
      */ 
      if (!firstName.trim() || !lastName.trim()) {
        alert('Both first name and last name are required!');
        return; // Stop submission if either field is empty
      }

      // Capitalize the first letter of both first and last name
      const formattedFirstName = capitalize(firstName.trim());
      const formattedLastName = capitalize(lastName.trim());

      /*
        Check if the player already exists
        The currentPlayerID (setCurrentPlayerId) value will be found in the players.id list
      */ 
      const existingPlayer = players.find(player => 
        player.id === currentPlayerId
      );

      // If a duplicate is found check whether the rest of information is different or not
      if (existingPlayer) {
        console.log("\n\nEXISTING: We are updating existing");
        // Check if the other fields are different
        const hasChanged =
          existingPlayer.firstName !== firstName ||
          existingPlayer.lastName !== lastName ||
          existingPlayer.clubSide !== clubSide ||
          !arraysEqual(existingPlayer.positions, positions) ||
          existingPlayer.availability !== availability;

        // Information has been changed so we need to update the information
        if (hasChanged) {
          console.log("EXISTING: Confirmed one of the values has changed");
          /*
            Update the existing player's information
              - ...existingPlayer will open up this array giving me access 
              to id, first, last, clubside, positions[], and availability
              - after that we override certain key:value pairs with updated key:value pairs of 
              'firstName', 'lastName', clubSide', 'positions', 'availability' creating an updated player
          */ 
          const existingPlayerUpdated = { 
            ...existingPlayer, 
            firstName,
            lastName,
            clubSide, 
            positions, 
            availability 
          };

          /*
            Reforms the players object/array that will have an updated item relating to one player
            When the player id matches then we add the new updated information
          */ 
          const updatedPlayers = players.map(player => 
            player.id === existingPlayer.id 
              ? existingPlayerUpdated 
              : player
          );

          // Update the players object array
          setPlayers(updatedPlayers);
          console.log('LOCAL useSTATE(); Player updated successfully:', { ...existingPlayer, firstName, lastName, clubSide, positions, availability });

          /*
            Call the function to update the JSON file. 
            Method "PUT" to update just one player
          */ 
          updateJsonFile(existingPlayerUpdated, "PUT", "modifyMainPlayerList");
          
          resetFields();    
        } else {
          // If the values are the same, just return without alert
          console.log(`No changes made for ${firstName} ${lastName}.`);
          return;
        }
      } else {
        // If no duplicate exists, create a new player
        const newPlayer = { 
          id: nanoid(), // Generate a unique ID using nanoid
          firstName: formattedFirstName,
          lastName: formattedLastName,
          clubSide, 
          positions, 
          availability 
        };

        setPlayers([...players, newPlayer]);
        console.log('SUCCESS: Player added successfully:', newPlayer);

        // Call the function to update the JSON file with the new players information
        updateJsonFile(newPlayer, "POST", "addNewPlayerMainList");
        
        // Reset the fields after successful submission
        resetFields();
      }
    } catch (error) {
      console.error('Error while adding/updating the player:', error.message);
    }
  };

  // Function to reset input fields
  const resetFields = () => {
    setFirstName('');
    setLastName('');
    setClubSide('');
    setPositions([]);
    setAvailability('');
    setCurrentPlayerId('');
  };

  /*
    Utility function to capitalize the first letter of each word in a string and make the rest lowercase.
      - It also handles double-barrel names like 'Lienert-Brown'
      - It will also handle edge cases where someone enters 'John Smith' as one input value
      instead of just 'John'
  */
  const capitalize = (name) => {
    return name
      .split(' ') // Split by spaces for multi-word names
      .map(part =>
        part
          .split('-') // Split by hyphens for double-barrel names
          .map(subPart => subPart.charAt(0).toUpperCase() + subPart.slice(1).toLowerCase())
          .join('-')
      )
      .join(' ');
  };

  // Displaying to the user the player either added, updated or deleted 
  const displayLastChange = (data) =>{
        const { firstName, lastName, availability, clubSide, positions } = data;
        setLastPlayer({
            lastEntryFirstName: firstName,
            lastEntryLastName: lastName,
            lastEntryAvailability: availability,
            lastEntryClubSide: clubSide,
            lastEntryPositions: positions
        });
  }

  /*
    Utility function to check if two arrays are equal
      - Current set up just to explore the positions array with relation to using 'PUT'
  */ 
  const arraysEqual = (arr1, arr2) => {
    return Array.isArray(arr1) && Array.isArray(arr2) &&
      arr1.length === arr2.length && arr1.every((val, index) => val === arr2[index]);
  };

  const deletePlayer = async (event, playerId) => {
    console.log("Delete btn was pressed and now in section to fetch server file");
    try {
      event.preventDefault();
      const response = await fetch('http://192.168.20.42:5000/serverURL', {
        method: 'DELETE', // Use DELETE method
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deletePlayer', 
          data: { id: playerId }, 
        }),
      });

      if (!response.ok) {
        console.log('Failed to delete player: ', response.statusText)
        throw new Error('Failed to delete player: ', response.statusText);
      }

      const responseData = await response.json();
      if (responseData.success) {
        console.log(`SUCCESS: ${responseData.message}`, responseData);
        // If the JSON update was successful, updateUI display to user about what was just deleted 
        displayLastChange(responseData.deletedPlayer);
        resetFields();

      } else {
        console.warn(`WARNING: Operation completed, but there may be issues: ${responseData.message}`);
      }
      
    } catch (error) {
      console.error('ERROR: deleting player:', error.message);
      alert('Unable to delete the player. Please try again later.');
    }
  };
  
  /*
    Update information in the players.JSON file
    'http://localhost:5000/serverURL' will either receive a POST or PUT
    as depenedent on 'method' parameter
  */ 
  const updateJsonFile = async (newData, method, action) => {
    console.log("UPDATE JSON SERVER REQUEST: method= ", method, " action = ", action, ' data= ' , newData);
    try {
      const response = await fetch('http://192.168.20.42:5000/serverURL', {
        method: method, 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action, // Include action in the request body
          data: newData   // The new player or update data
        }),
      });

      if (!response.ok) {
        console.log('Failed to update JSON file: ', response.statusText)
        throw new Error('Failed to update JSON file: ', response.statusText);
      }
      console.log("\n\nPassed the response.ok section");
      const responseData = await response.json(); 
      if (responseData.success) {
        console.log(`SUCCESS: ${responseData.message}`, responseData);

        // If the JSON update was successful, confirm to the user the details of that player
        displayLastChange(responseData.data);
  
      } else {
        console.warn(`WARNING: Operation completed, but there may be issues: ${responseData.message}`);
      }
      
      // Consider providing user feedback here, e.g., alerting the user.
    } catch (error) {
      console.error('ERROR: updating JSON file:', error.message);
      alert('Unable to update the JSON file. Please try again later.'); // Alert user about the error
    }
  };
  
  return (
    <div id="adminContainer">
      <div id="adminHeadingContainer">
        { backButton }
        <h2>Admin Section</h2>
      </div>
      {/* Admin Form */}
      <form id="adminFormContainer" onSubmit={handleSubmit}>
        <div id="adminNameClubContainer">
          <div id="adminNameAvailabilityContainer">
            <input 
              type="text" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              placeholder="First Name" 
            />
            <input 
              type="text" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              placeholder="Last Name" 
            />
            <div id="adminAvailabilityContainer">
              <label htmlFor="availability">Player Availability:</label>
              <select 
                id="availability" 
                name="availability" 
                value={availability} 
                onChange={handleAvailabilityChange}
              >
                {availabilityArray.map((status, index) => (
                  <option key={index} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div id="clubSideContainer">
            <h4>Club Side:</h4>
            <div id="clubSideRadioButtons">
              {renderRadioButtons()}
            </div>
          </div>
        </div>

        <div id="positionContainer">
          <h4>Position:</h4>
          <div id="positionsTwoContainer">
            <div id="positionForContainer">
              <h5>Forwards:</h5>
              <div className="positionCheckboxes">
                {renderPositionCheckboxes(playerPositionForwards)}
              </div>
            </div>

            <div id="positionBacContainer">
              <h5>Backs:</h5>
              <div className="positionCheckboxes">
                {renderPositionCheckboxes(playerPositionBacks)}
              </div>   
            </div>
          </div>
        </div>

        <div id="addNewPlayerBtnContainer">
          <button type="button" className="resetPlayerBtn" onClick={resetFields}>Reset</button>
          <button type="submit" id="adminSubmitBtn">Accept</button> {/* Submit button */}
        </div>
      </form>

      {/* Last Player Update Table */}
      <div id="adminLastPlayerTableContainer">
        <table id="adminTableLastPlayer">
          <caption>Last Player Updated</caption>
          <thead>
            <tr>
              <th className="nameColumn">Name</th>
              <th className="clubsideColumn">Club Side</th>
              <th className="positionColumn">Position</th>
              <th className="availableColumn">Available</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{truncateString(`${lastPlayer.lastEntryFirstName} ${lastPlayer.lastEntryLastName}`)}</td>
              <td>{lastPlayer.lastEntryClubSide}</td>
              <td>{truncatePositions(lastPlayer.lastEntryPositions)}</td>
              <td>{lastPlayer.lastEntryAvailability}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Admin Table */}
      <div id="adminTableContainer">
        <table id="adminTable">
          <caption>Player Information Table</caption>
          <thead>
            <tr>
              <th
                className="nameColumn"
                onClick={handleSort} // Only sorts by firstName
                style={{ cursor: 'pointer' }}
              >
                First Name {sortConfig.order === 'asc' ? '▲' : '▼'}
              </th>
              <th className="clubsideColumn">Club Side</th>
              <th className="positionColumn">Position</th>
              <th className="availableColumn">Available</th>
              <th className="removeColumn">Remove</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => {
              if (!player.id) {
                console.error('Player does not have a unique ID:', player);
                return null; // Skip rendering this player if no ID
              }
              return (
                <tr
                  key={player.id}
                  onClick={() => handleRowClick(player.id)}
                  className={selectedRow === player.id ? 'selected' : ''}
                >
                  <td>{truncateString(`${player.firstName} ${player.lastName}`)}</td>
                  <td>{player.clubSide}</td>
                  <td>{truncatePositions(player.positions)}</td>
                  <td>{player.availability}</td>
                  <td><button onClick={(event) => deletePlayer(event, player.id)}>Delete</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;
