const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// GET API1 List all players of cricket_team.
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id;`;
  const playersArray = await db.all(getAllPlayersQuery);
  const ans = (playersArray) => {
    return {
      playerId: playersArray.player_id,
      playerName: playersArray.player_name,
      jerseyNumber: playersArray.jersey_number,
      role: playersArray.role,
    };
  };
  response.send(playersArray.map((eachPlayer) => ans(eachPlayer)));
});

// POST API2 Adding player of cricket_team.
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  //console.log(playerDetails);
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = ` 
    INSERT INTO cricket_team 
    (player_name, jersey_number, role) 
    VALUES ( '${playerName}', ${jerseyNumber}, '${role}' );`;
  const dbResponse = await db.run(addPlayerQuery);
  //console.log(dbResponse);
  const player_id = dbResponse.lastID;
  //response.send({ playerId: player_id });
  response.send("Player Added to Team");
});

// GET API3 List player of cricket_team.
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const playersArray = await db.get(getPlayerQuery);
  //console.log(playerDetails);
  response.send({
    playerId: playersArray.player_id,
    playerName: playersArray.player_name,
    jerseyNumber: playersArray.jersey_number,
    role: playersArray.role,
  });
});

// PUT API4 Updating player of cricket_team.
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  //console.log(playerId);
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  //console.log(`${playerName}, ${jerseyNumber}, ${role}`);
  const updatePlayerDetails = ` 
    UPDATE cricket_team 
    SET player_name = '${playerName}', jersey_number = ${jerseyNumber}, role = '${role}' 
    WHERE player_id = ${playerId};`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

// DELETE API5 Deleting a player of cricket_team.
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
