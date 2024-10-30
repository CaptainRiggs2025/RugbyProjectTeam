import React, { useState, useEffect } from 'react';
import './user.css'; // You can create a specific CSS file for the admin section

const initialStartingSelections = () => {
  return {
    1: { prop: { firstName: "", lastName: "" } },
    2: { hooker: { firstName: "", lastName: "" } },
    3: { prop: { firstName: "", lastName: "" } },
    4: { lock: { firstName: "", lastName: "" } },
    5: { lock: { firstName: "", lastName: "" } },
    6: { looseForward: { firstName: "", lastName: "" } },
    7: { looseForward: { firstName: "", lastName: "" } },
    8: { looseForward: { firstName: "", lastName: "" } },
    9: { halfBack: { firstName: "", lastName: "" } },
    10: { fiveEighths: { firstName: "", lastName: "" } },
    11: { winger: { firstName: "", lastName: "" } },
    12: { midFielder: { firstName: "", lastName: "" } },
    13: { midFielder: { firstName: "", lastName: "" } },
    14: { winger: { firstName: "", lastName: "" } },
    15: { fullBack: { firstName: "", lastName: "" } }
  };
};

const initialBenchSelections = () => {
  return {
    16: { benchPosition: { firstName: "", lastName: "" } },
    17: { benchPosition: { firstName: "", lastName: "" } },
    18: { benchPosition: { firstName: "", lastName: "" } },
    19: { benchPosition: { firstName: "", lastName: "" } },
    20: { benchPosition: { firstName: "", lastName: "" } },
    21: { benchPosition: { firstName: "", lastName: "" } },
    22: { benchPosition: { firstName: "", lastName: "" } },
    23: { benchPosition: { firstName: "", lastName: "" } }
  };
};

const SelectorsChoice = ({ backButton, selectedUser }) => {
  /*
    Layout of data is important to note
      Key of selectors name
        {key of Opposition team}
          {key of Date of the game}
            {key of number from 1 to 23}
              {key of position like prop, etc}
                {key:value of firstName}
                {key:value of lastName}
      Example: {'Ryan': {'England':{'2024-Oct-02': {1: {'prop': {firstName: 'Fetcher', lastNAme: 'Newall'}}}}}}
      {
        'Ryan': {
          'England': {
            '2024-Oct-02': {
              1: {
                'prop': {
                  'firstName': 'Fetcher',
                  'lastName': 'Newall'
                }
              }
            }
          }
        }
      }
  */ 
  
  const [user, setUser] = useState(selectedUser); // Holds the current user
  const [players, setPlayers] = useState([]); // Holds all 'available' players from players.json
  const [currentOpposition, setCurrentOpposition] = useState({ England: "2024-Nov-02" }); // Sets opposition and date

  // User selections
  // Combing using the spread operator
  const combinedSelections = () => {
    return { ...userSelectionsStarting, ...userSelectionsBench };
  };
  const [userSelectionsStarting, setUserSelectionsStarting] = useState(initialStartingSelections());
  const [userSelectionsBench, setUserSelectionsBench] = useState(initialBenchSelections())
  const [userSelections, setUserSelections] = useState(combinedSelections());

  const [props, setProps] = useState([]); // Holds 'available' props
  const [hookers, setHookers] = useState([]); // Holds 'available' hookers
  const [locks, setLocks] = useState([]); // Holds 'available' locks
  const [looseForwards, setLooseForwards] = useState([]); // Holds 'available' looseForwards
  const [halfBacks, setHalfBacks] = useState([]); // Holds 'available' halfBacks
  const [fiveEighths, setFiveEighths] = useState([]); // Holds 'available' fiveEighths
  const [midFielders, setMidFielder] = useState([]); // Holds 'available' midFielders
  const [wingers, setWingers] = useState([]); // Holds 'available' wingers
  const [fullBacks, setFullBacks] = useState([]); // Holds 'available' fullBacks

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Trying to add halloween bats
        const script = document.createElement('script');
        script.src = '/assets/data/jsbat.js'; 
        script.async = true; // Load asynchronously

        // Append the script to the body
        document.body.appendChild(script);
        // Fetch player data
        const playerResponse = await fetch('/assets/data/players.json');
        const playerData = await playerResponse.json();

        console.log("The number of players that have been loaded in the player list whether available or not are ", playerData.length);

        // Filter only available players and set to state
        const availablePlayers = playerData.filter(player => player.availability === 'Available');
        setPlayers(availablePlayers);

        console.log("Number of players that are actually 'available' for selection are: ", availablePlayers.length);

        // Organize 'available' players by position
        setProps(availablePlayers.filter(player => player.positions.includes('Prop')));
        setHookers(availablePlayers.filter(player => player.positions.includes('Hooker')));
        setLocks(availablePlayers.filter(player => player.positions.includes('Lock')));
        setLooseForwards(availablePlayers.filter(player => player.positions.includes('Loose Forward')));
        setHalfBacks(availablePlayers.filter(player => player.positions.includes('Half Back')));
        setFiveEighths(availablePlayers.filter(player => player.positions.includes('1st Five Eighths')));
        setMidFielder(availablePlayers.filter(player => player.positions.includes('MidFielder')));
        setWingers(availablePlayers.filter(player => player.positions.includes('Winger')));
        setFullBacks(availablePlayers.filter(player => player.positions.includes('Full Back')));

        // Fetch user selections
        const userResponse = await fetch(`/assets/data/userSelection.json`);
        // Check if the file is accessible and if it contains data
        if (!userResponse.ok) {
          console.error(`File /assets/data/userSelection.json not found or could not be accessed`);
          return; // Exit function if file does not exist
        }  
        const userData = await userResponse.json();
      
        // Ensure userData is not empty
        if (!userData) {
          console.log('No user data found in userSelection.json');
          return; // Exit if file is empty as this user has not made an selections yet
        }

        // Extract opposition and date from currentOpposition
        const opposition = Object.keys(currentOpposition)[0];
        const date = currentOpposition[opposition];

        const { selectionData, dataModified } = checkUserSelectionsStructure(userData, selectedUser.name, opposition, date);

        console.log("dataModified: ", dataModified, " and selectedData contents: ", selectionData);
        if (dataModified) {
          // Only update JSON if dataModified is true
          console.log("About to update the JSON file with default values:");
          updateJsonFile(selectionData, "PUT", "UpdateSelectorSelections" )
        }

        const selectorSelections = selectionData.selections;
        
        /*
          Check if there is player data to parse over
            - Was undecided whether to have this code because the 'checkUserSelectionsStructure' should 
              have ensured that 'selectorSelections' is True
        */ 
        if (!selectorSelections) {
          console.log(`No pre-existing selection choices found for, ${user}, and specified opposition and date of : ${currentOpposition}`);
          return; // Exit as no previous selection choices have been made
        }

        // Readjust the preexisting user selections to ensure that only players listed as 'available' remain in the selection
        const startingSelection = {};
        const benchSelection = {};
        for (const [index, playerData] of Object.entries(selectorSelections)) {
          const { firstName, lastName } = playerData; // Extract names from playerData
          const positionKey = Object.keys(playerData)[0]; // Get the position key, like 'prop', 'hooker', etc.

          /*
            We need to now update the Selectors Starting 15 and there Bench to ensure that their current selections still
            holds players that are current 'Available'. If not then the player is replaced with an empty selection
              - Therefore updating 'startingSelection' and 'benchSelection'  
          */
          if (parseInt(index) <= 15) {
            // Starting players (1-15)
            startingSelection[index] = availablePlayers.some(
              player => player.firstName === firstName &&
                        player.lastName === lastName &&
                        player.positions.includes(positionKey)
            ) ? playerData : { [positionKey]: { firstName: "", lastName: "" } };
          } else {
            // Bench players (16-23)
            benchSelection[index] = availablePlayers.some(
              player => player.firstName === firstName &&
                        player.lastName === lastName
            ) ? { [positionKey]: playerData } : { [positionKey]: { firstName: "", lastName: "" } };
          }
        }
        setUserSelectionsStarting(startingSelection);
        setUserSelectionsBench(benchSelection);

        // Combine and update
        setUserSelections(combinedSelections());
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    /*
      On loading app.js the user.js file will run and pass a 'null' user name 
      which will cause problems if I do not deal with it here.
    */ 
    if (!selectedUser) {
      console.log("No user selected, exiting fetchData.");
      return; // Exit early if the user is null
    } else {
      console.log("User or Selector is: ", selectedUser);
      fetchData();
    }
    
  }, [selectedUser]);

  /*
    Ensuring the a selector/user has a preexisting JSON structure for 'opposition' and 'date'
    to update information to 
  */
  const checkUserSelectionsStructure = (userData, user, opposition, date) => {
    let dataModified = false; // Flag to track if any data changes
  
    // Ensure user exists
    if (!userData[user]) {
      userData[user] = {};
      dataModified = true; // Mark as modified
    }
  
    // Ensure opposition exists for user
    if (!userData[user][opposition]) {
      userData[user][opposition] = {};
      dataModified = true; // Mark as modified
    }
  
    // Ensure date exists for opposition
    if (!userData[user][opposition][date]) {
      userData[user][opposition][date] = {
        ...initialStartingSelections(),
        ...initialBenchSelections()
      };
      dataModified = true; // Mark as modified
    }
  
    return {
      selectionData: {user, opposition, date, selections: userData[user][opposition][date]
      }, dataModified
    };
  };

  // Create the <select> values and display then alphabetically for positions 1 to 15
  const createSelectOptions = (availablePlayers, position, number) => {
    try {
      // Sort players alphabetically by firstName
      return availablePlayers
        .sort((a, b) => a.firstName.localeCompare(b.firstName))
        .map((player, index) => (
          <option key={index} value={`${player.firstName}, ${player.lastName}, ${position}, ${number}`}>
            {player.firstName} {player.lastName}
          </option>
        ));
    } catch (error) {
      console.error('Error creating select options:', error);
      return null; // Return null or a fallback value if an error occurs
    }
  };

  /*
    Sort and create <select> options for each player on the bench, accounting for multiple positions
      - Used flatmap with map by player.positions
  */ 
  const createBenchOptions = (players, number) => {
    try {
      // Step 1: Sort players alphabetically by firstName
      const sortedPlayers = players.sort((a, b) => a.firstName.localeCompare(b.firstName));
      
      // Step 2: Map each player to multiple options if they have multiple positions
      return sortedPlayers.flatMap((player, index) => 
        player.positions.map((position) => (
          <option key={`${index}-${position}`} value={`${player.firstName}, ${player.lastName}, ${position}, ${number}`}>
            {player.firstName} {player.lastName} ({position})
          </option>
        ))
      );
    } catch (error) {
      console.error('Error creating bench options:', error);
      return null; // Fallback in case of an error
    }
  };

  /*
    Update information in the players.JSON file
    'http://192.168.20.42:5000/serverURL' will either receive a POST or PUT
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
    <div id="selectorContainer">
      <div id="selectorMainTitle" style={{ display: 'flex' }}>
        {/* Render the backButton prop here */}
        {backButton}
        <h4>Selections</h4>
      </div>

      <div id="selectorPlayersContainer">
        {/* Forwards Container */}
        <div id="selectorForwardsContainer">
          <h4>Forwards</h4>
          
          <div className="selectionTitleOptions" id="Prop-1">
            <h4>(1) Prop:</h4>
            <select >{createSelectOptions(props, 'Prop', '1')}</select>
          </div>

          <div className="selectionTitleOptions" id="Hooker-2">
            <h4>(2) Hooker:</h4>
            <select>{createSelectOptions(hookers, 'Hooker', '2')}</select>
          </div>

          <div className="selectionTitleOptions"  id="Prop-3">
            <h4>(3) Prop:</h4>
            <select>{createSelectOptions(props, 'Prop', '3')}</select>
          </div>

          <div className="selectionTitleOptions" id="Lock-4">
            <h4>(4) Lock:</h4>
            <select>{createSelectOptions(locks, 'Lock', '4')}</select>
          </div>

          <div className="selectionTitleOptions" id="Lock-5">
            <h4>(5) Lock:</h4>
            <select>{createSelectOptions(locks, 'Lock', '5')}</select>
          </div>

          <div className="selectionTitleOptions" id="LooseForward-6">
            <h4>(6) Loose Forward:</h4>
            <select>{createSelectOptions(looseForwards, 'Loose Forward', '6')}</select>
          </div>

          <div className="selectionTitleOptions"  id="LooseForward-7">
            <h4>(7) Loose Forward:</h4>
            <select>{createSelectOptions(looseForwards, 'Loose Forward', '7')}</select>
          </div>

          <div className="selectionTitleOptions"  id="LooseForward-8">
            <h4>(8) Loose Forward:</h4>
            <select>{createSelectOptions(looseForwards, 'Loose Forward', '8')}</select>
          </div>
        </div>

        {/* Backs Container */}
        <div id="selectorBacksContainer">
          <h4>Backs</h4>

          <div className="selectionTitleOptions"  id="HalfBack-9">
            <h4>(9) Half Back:</h4>
            <select>{createSelectOptions(halfBacks, 'Half Back', '9')}</select>
          </div>

          <div className="selectionTitleOptions"  id="FiveEighths-10">
            <h4>(10) 1st Five Eighths:</h4>
            <select>{createSelectOptions(fiveEighths, '1st Five Eighths', '10')}</select>
          </div>

          <div className="selectionTitleOptions"  id="MidFielder-12">
            <h4>(12) Midfielder:</h4>
            <select>{createSelectOptions(midFielders, 'Midfielder', '12')}</select>
          </div>

          <div className="selectionTitleOptions"  id="MidFielder-13">
            <h4>(13) Midfielder:</h4>
            <select>{createSelectOptions(midFielders, 'Midfielders', '13')}</select>
          </div>

          <div className="selectionTitleOptions"  id="Winger-11">
            <h4>(11) Winger:</h4>
            <select>{createSelectOptions(wingers, 'Wingers', '11')}</select>
          </div>

          <div className="selectionTitleOptions"  id="Winger-14">
            <h4>(14) Winger:</h4>
            <select>{createSelectOptions(wingers, 'Wingers', '14')}</select>
          </div>

          <div className="selectionTitleOptions"  id="FullBack-15">
            <h4>(15) Full Back:</h4>
            <select>{createSelectOptions(fullBacks, 'Full Back', '15')}</select>
          </div>
        </div>

        {/* Bench Container */}
        <div id="selectorBenchContainer">
          <h4>Bench</h4>

          <div className="selectionTitleOptions" id="Bench-16">
            <h4>(16) Bench:</h4>
            <select>{createBenchOptions(players, '16')}</select>
          </div>

          <div className="selectionTitleOptions" id="Bench-17">
            <h4>(17) Bench:</h4>
            <select>{createBenchOptions(players, '17')}</select>
          </div>

          <div className="selectionTitleOptions" id="Bench-18">
            <h4>(18) Bench:</h4>
            <select>{createBenchOptions(players, '18')}</select>
          </div>

          <div className="selectionTitleOptions" id="Bench-19">
            <h4>(19) Bench:</h4>
            <select>{createBenchOptions(players, '19')}</select>
          </div>

          <div className="selectionTitleOptions" id="Bench-20">
            <h4>(20) Bench:</h4>
            <select>{createBenchOptions(players, '20')}</select>
          </div>

          <div className="selectionTitleOptions" id="Bench-21">
            <h4>(21) Bench:</h4>
            <select >{createBenchOptions(players, '21')}</select>
          </div>

          <div className="selectionTitleOptions" id="Bench-22">
            <h4>(22) Bench:</h4>
            <select>{createBenchOptions(players, '22')}</select>
          </div>
        </div>
      </div>
  </div>

  );
};

export default SelectorsChoice;
