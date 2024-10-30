// Fetching or Requiring the following libraries/modeules
const express = require('express');  //Builds a web server
const bodyParser = require('body-parser');  //Handles form or JSON data
const cors = require('cors');  // Allows requests from other websites
const fs = require('fs');  // Reads and writes to the server
const path = require('path');  // Manages the file paths

const app = express();
const PORT = process.env.PORT || 5000;

/*
    Middleware
    Enables CORS, allowing your frontend (React app) to make requests to this backend 
    even if they are hosted on different origins (domains or ports).
*/ 
app.use(cors());
/*
    Ensures the server can parse incoming JSON data 
    from POST/PUT requests, which is what I will be parsing
*/
app.use(bodyParser.json());

/*
    Add a new player onto an existing JSON file
*/
const addPlayer = async (data, res, dataPath) => {
    try {
      console.log('Processing server side request to add a new player...');
  
      // Validate incoming data
      const requiredKeys = ['id', 'firstName', 'lastName', 'clubSide', 'positions', 'availability'];
      /*
        Creating a list of requiredKeys do not match the keys in the supplied 'data'
        If all done correctly then that requiredKeys list should be empty
      */ 
      const missingKeys = requiredKeys.filter(key => !data.hasOwnProperty(key));
      if (missingKeys.length > 0) {
        console.error('Missing required keys:', missingKeys);
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingKeys.join(', ')}`
        });
      }
  
      /*
        'Data' must only contain information to add one new player therefore
        should NOT be in an array format
      */ 
      if (Array.isArray(data)) {
        console.error('Data must contain information for only one player.');
        return res.status(400).json({
          success: false,
          message: 'Data must contain information for only one player.'
        });
      }
  
      // Read the main players JSON file
      const existingData = await fs.promises.readFile(dataPath, 'utf8');
      // Convert to an array format
      const players = JSON.parse(existingData || '[]'); 
      
      /*
        Check if a player with the same ID already exists
        If true then we return and do add this player
        I should never get this as ID is created with nanoid however will add this code just encase
      */ 
      const playerExists = players.some(player => player.id === data.id);
      if (playerExists) {
        console.error('Player with this ID already exists:', data.id);
        return res.status(409).json({
          success: false,
          message: 'Player with this ID already exists.'
        });
      }
  
      players.push(data); // Add the new player data
  
      /*
        Write back the updated data
            - 'null' as a replacer where currently I am not altering, removing or adding any keys
            - 2 : indention when writing to the JSON file
      */ 
      await fs.promises.writeFile(dataPath, JSON.stringify(players, null, 2));
  
      console.log('Request completed successfully.');
      res.json({ success: true, message: 'Player added successfully!', data }); // Respond with success message
    } catch (err) {
      console.error('ERROR SERVER SIDE: adding a new player to main JSON request:', err.message);
      res.status(500).json({ success: false, message: 'Failed to add player', error: err.message });
    }
};

// Updating certain information pertaining to one existing player
const updatePlayer = async (data, res, dataPath) => {
    console.log("\n\nIn the section of code to update a player");
    const { id, firstName, lastName, clubSide, positions, availability } = data;
  
    try {
      // Read the current data from the JSON file
      const existingData = await fs.promises.readFile(dataPath, 'utf8');
      // Convert to arrary format
      const players = JSON.parse(existingData || '[]'); // Parse the data
  
      // Find the index of the player by id
      const playerIndex = players.findIndex(player => player.id === id);
  
      if (playerIndex === -1) {
        return res.status(404).json({ success: false, message: 'Player not found on server side' });
      }
  
      /*
        Update the existing player's information
            - ...existingPlayer[playerIndex] will open up this array giving me access 
            to id, first, last, cludside, positions[], and availability
            - after that we override certain key:value pairs with updated key:value pairs of 
            'firstName', 'lastName', 'clubSide', 'positions', 'availability' creating an updated player
      */ 
      players[playerIndex] = {
        ...players[playerIndex],
        firstName,
        lastName,
        clubSide,
        positions,
        availability
      };
  
      // Write the updated data back to the JSON file
      await fs.promises.writeFile(dataPath, JSON.stringify(players, null, 2));
  
      console.log(`SUCCESS: Player with id ${id} updated`);
      res.status(200).json({ success: true, message: 'Player updated successfully', data });
  
    } catch (err) {
      console.error('ERROR updating player:', err.message);
      res.status(500).json({ success: false, message: 'Failed to update player', error: err.message });
    }
};

// Delete a player from the players list
const deletePlayer = async (data, res, dataPath) => {
    try {
      // Data only contains the ID value of the player
      const { id } = data;
  
      // Read the current data from the JSON file
      const existingData = await fs.promises.readFile(dataPath, 'utf8');
      // Adapt the JSON information into an array
      const players = JSON.parse(existingData || '[]');
  
      // Find the index of the player by ID
      const playerIndex = players.findIndex(player => player.id === id);
  
      if (playerIndex === -1) {
        return res.status(404).json({ success: false, message: 'Player not found' });
      }

      // Store the player data before deleting
      const deletedPlayer = players[playerIndex];
  
      // Remove the player from the array
      players.splice(playerIndex, 1);
  
      // Write the updated data back to the JSON file
      await fs.promises.writeFile(dataPath, JSON.stringify(players, null, 2));
  
      console.log(`SUCCESS: Player with id ${id} deleted`);
      res.status(200).json({ success: true, message: 'Player deleted successfully', deletedPlayer });
  
    } catch (err) {
      console.error('ERROR deleting player:', err.message);
      res.status(500).json({ success: false, message: 'Failed to delete player', error: err.message });
    }
};

const updateSelectorsSelection = (user, opposition, date, selections, res, filePath) => {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error("Error reading file userSelection: ", err);
      return res.status(500).json({ error: "Unable to read userSelection file" });
    }

    const parsedData = JSON.parse(data);

    // Ensure structure exists in the JSON
    if (!parsedData[user]) parsedData[user] = {};
    if (!parsedData[user][opposition]) parsedData[user][opposition] = {};
    parsedData[user][opposition][date] = selections;

    // Write updated data back to file
    fs.writeFile(filePath, JSON.stringify(parsedData, null, 2), 'utf-8', (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return res.status(500).json({ error: "Unable to write file" });
      }

      res.status(200).json({ success: true, message: "Selections updated successfully" });
    });
  });
};

   
/*
    Define the path to the JSON file
    _dirname define current root level
    ../  will move us up one level from __dirname then we can find our destination
*/ 
const dataPlayersPath = path.join(__dirname, '../squad/public/assets/data/players.json');
const dataSelectorsSelectionsPath = path.join(__dirname, '../squad/public/assets/data/userSelection.json');
/*
    req = HTTP request (header/body)
    res = response (status code / data / messages)
    '/serverURL' is listening for anything POSTED to that local URL address
*/
app.post('/serverURL', (req, res) => {
  const { action, data } = req.body; // action and data come from the body
  switch (action) {
    case 'addNewPlayerMainList':
      console.log("\n\nSERVER : new player case option");
      addPlayer(data, res, dataPlayersPath);
      break;
    default:
      console.log("SERVER: Action log is wrong. Why?");
      res.status(400).json({ error: 'Invalid action' });
  }
  });

// Handle PUT requests for modifying a player
app.put('/serverURL', (req, res) => {
  const { action, data } = req.body;

  console.log("\nSERVER: Confirming we are handling a PUT request");

  switch (action) {
      case 'modifyMainPlayerList':
          console.log("\n\nSERVER : Adjust player details case option");
          updatePlayer(data, res, dataPlayersPath);
          break;
      case 'UpdateSelectorSelections':
        const { user, opposition, date, selections } = data;
        console.log("SERVER: Updating selection for user:", user, "opponent:", opposition, "date:", date);
        updateSelectorsSelection(user, opposition, date, selections, res, dataSelectorsSelectionsPath);
        break;
      default:
          res.status(400).json({ error: 'Invalid action for PUT' });
  }
});

// Handle PUT requests for modifying a player
app.delete('/serverURL', (req, res) => {
  const { action, data } = req.body;

  console.log("\nSERVER: Confirming we are handling a DELETE request");

  switch (action) {
    case 'deletePlayer':
        console.log("SERVER: Delete case option");
        deletePlayer(data, res, dataPlayersPath);
        break;
      // Handle other PUT actions as necessary
      default:
          res.status(400).json({ error: 'Invalid action for PUT' });
  }
});
  
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
