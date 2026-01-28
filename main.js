var room = "";
var player = "";
playerCount = 0;

const firebaseConfig = {
  apiKey: "AIzaSyALeqVEk8nRUaaOjfZs8XPnMrLMH3rH-9I",
  authDomain: "cat-meooww-simplegames.firebaseapp.com",
  databaseURL: "https://cat-meooww-simplegames-default-rtdb.firebaseio.com",
  projectId: "cat-meooww-simplegames",
  storageBucket: "cat-meooww-simplegames.appspot.com",
  messagingSenderId: "326771151835",
  appId: "1:326771151835:web:f551cd3e7e98c6b5694dfe"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function startGame() {
  if (playerCount >= 2) {
    firebase.database().ref("/JetRacer/" + room).update({
      game: "playing"
    })
  } else {
    document.getElementById("joinlog").innerHTML = "At least 2 player required to start";
  }
}

function lobby() {
  document.getElementById("lobby").innerHTML = "<h2>Waiting - " + room + "</h2><div id='playerslog'></div><button onclick='startGame()'>Start</button><br><br>";
  firebase.database().ref("/JetRacer/" + room + "/players/").on('value', function (snapshot) {
    playerCount = 0;
    document.getElementById("playerslog").innerHTML = "";
    snapshot.forEach(function (childSnapshot) {
      childKey = childSnapshot.key; childData = childSnapshot.val();
      playerCount += 1;
      document.getElementById("playerslog").innerHTML += "<p>" + childKey + " - " + childData['plane'] + "</p>";
    });
  });
  firebase.database().ref("/JetRacer/" + room + "/game/").on('value', data => {
    if (data.val() == "playing") {
      localStorage.setItem("gameroom", room);
      localStorage.setItem("gameplayer", player);
      window.location = "./game.html";
    }
  })
}

function joinRoom() {
  room = document.getElementById("roomid").value;
  player = document.getElementById("playerid").value;
  if (room != "") {
    if (player != "") {
      firebase.database().ref("/JetRacer/" + room + "/players/" + player).update({
        x: 0,
        y: Math.floor(Math.random() * 20) - 10,
        z: 0,
        plane: "default"
      });
      lobby();
    } else {
      document.getElementById("joinlog").innerHTML = "Username Required to join";
    }
  } else {
    document.getElementById("joinlog").innerHTML = "Room Id Required";
  }
}

//game
var players = [];
var level = [];
var terrain = "";
var isPlaying = true;
function runGame() {
  room = localStorage.getItem("gameroom");
  player = localStorage.getItem("gameplayer");
  if (room && player) {
    SimpleCubes.start(document.getElementById('game'));
    firebase.database().ref("/JetRacer/" + room + "/players/").once('value', function (snapshot) {
      playerCount = 0;
      snapshot.forEach(function (childSnapshot) {
        childKey = childSnapshot.key; childData = childSnapshot.val();
        playerCount += 1;
        thisPlayer = childKey;
        thisPlane = childData['plane'];
        if (thisPlane == "default") {
          thisObject = SimpleCubes.createCube({
            x: childData["x"], y: childData["y"], z: childData["z"], width: 2, height: 2, length: 2, color: '#aaaaaa', physics: true,
            model: "./planes/default.obj", mtl: "./planes/default.mtl"
          });
          thisObject.setOpacity(0.1);
        }
        players.push({
          "name": thisPlayer,
          "plane": thisPlane,
          "obj": thisObject
        })
      });
      loadLevel();
      requestAnimationFrame(gameLoop);
    });
  } else {
    window.location = "./index.html";
  }
}

function loadLevel() {
  firebase.database().ref("/JetRacer/" + room + "/level/").once('value', data => {
    terrain = data.val();
    if (terrain == "dunes") {
      //dunes level (to-do)
    } else {
      //rings level
      level = [SimpleCubes.createCube({
        x: 10, y: 170, z: -20, width: 200, height: 200, length: 200, color: '#aaaaaa', physics: false,
        model: "./terrain/rings.obj", mtl: "./terrain/rings.mtl"
      }),
      SimpleCubes.createCube({
        x: 0, y: 0, z: -8, width: 40, height: 40, length: 5, color: '#aaaaaa', physics: true,
      }),
      SimpleCubes.createCube({
        x: 0, y: 370, z: -8, width: 40, height: 40, length: 5, color: '#aaaaaa', physics: true,
      }),
      SimpleCubes.createCube({
        x: 0, y: 45, z: 0, width: 40, height: 5, length: 40, color: '#aaaaaa', physics: false,
      }),
      SimpleCubes.createCube({
        x: -16, y: 125, z: 0, width: 40, height: 5, length: 40, color: '#aaaaaa', physics: false,
      }),
      SimpleCubes.createCube({
        x: 13, y: 185, z: 0, width: 40, height: 5, length: 40, color: '#aaaaaa', physics: false,
      }),
      SimpleCubes.createCube({
        x: 20, y: 245, z: 0, width: 40, height: 5, length: 40, color: '#aaaaaa', physics: false,
      }),
      SimpleCubes.createCube({
        x: 8, y: 305, z: 0, width: 40, height: 5, length: 40, color: '#aaaaaa', physics: false,
      }),
      ]
      level[0].setOpacity(0);
      level[3].setOpacity(0.2);
      level[4].setOpacity(0.2);
      level[5].setOpacity(0.2);
      level[6].setOpacity(0.2);
      level[7].setOpacity(0.2);
    }
  })
}

check = 0
function gameLoop() {
  try {
    SimpleCubes.background("#88aaff");
    for (pobj of players) {
      if (pobj["name"] == player) {
        if (isPlaying) {
          SimpleCubes.camera.position([pobj['obj'].position.x, pobj['obj'].position.y - 3, pobj['obj'].position.z + 3]);
          SimpleCubes.camera.rotation([55, 0, 0]);
          if (SimpleCubes.keyPressed("w")) {
            if (pobj['obj'].velocityY < 1) {
              pobj['obj'].velocityY += 0.1;
            }
          } else if (SimpleCubes.keyPressed("s")) {
            if (pobj['obj'].velocityY > -0.5) {
              pobj['obj'].velocityY -= 0.1;
            }
          }
          if (SimpleCubes.keyPressed("a")) {
            pobj['obj'].velocityX -= 0.01;
          } else if (SimpleCubes.keyPressed("d")) {
            pobj['obj'].velocityX += 0.01;
          } else {
            pobj['obj'].velocityX = 0;
          }
          if (SimpleCubes.keyPressed("Shift")) {
            pobj['obj'].velocityZ -= 0.01;
          } else if (SimpleCubes.keyPressed(" ")) {
            pobj['obj'].velocityZ += 0.01;
          } else {
            pobj['obj'].velocityZ = 0;
          }
          firebase.database().ref("/JetRacer/" + room + "/players/" + player).update({
            x: pobj['obj'].position.x,
            y: pobj['obj'].position.y,
            z: pobj['obj'].position.z
          })
          if (terrain == "dunes") {
            // to do
          } else {
            if (SimpleCubes.isTouching(pobj['obj'], level[3])) {
              check = 1;
            } else if (SimpleCubes.isTouching(pobj['obj'], level[4])) {
              check = 2;
            } else if (SimpleCubes.isTouching(pobj['obj'], level[5])) {
              check = 3;
            } else if (SimpleCubes.isTouching(pobj['obj'], level[6])) {
              check = 4;
            } else if (SimpleCubes.isTouching(pobj['obj'], level[7])) {
              isPlaying = false;
              check = 5;
              firebase.database().ref("/JetRacer/" + room + "/finalists/").once('value', function (snapshot) {
                finalistCount = 0;
                snapshot.forEach(function (childSnapshot) {
                  childKey = childSnapshot.key;
                  finalistCount += 1;
                });
                firebase.database().ref("/JetRacer/" + room + "/finalists/").update({
                  [finalistCount + 1]: player
                });
              });
            }
          }
          firebase.database().ref("/JetRacer/" + room + "/players/" + player).update({
            checkpoint: check
          });
          document.getElementById("menu").innerHTML = "<label>" + room + " - " + pobj["name"] + " | " + check + "</label>";
        } else {
          firebase.database().ref("/JetRacer/" + room + "/finalists/").once('value', function (snapshot) {
            finalHolder = "";
            snapshot.forEach(function (childSnapshot) {
              childKey = childSnapshot.key; childData = childSnapshot.val();
              finalHolder += "<p>" + childKey + "° - " + childData + "</p><br>";
            });
            document.getElementById("menu").innerHTML = "<div id='end'><h1>Game Finalists</h1><br><div id='finalists'>" + finalHolder + "</div><br><button onclick='end()'>return</button><br><br></div>"
          });
        }
      } else if (pobj["name"] != player) {
        firebase.database().ref("/JetRacer/" + room + "/players/" + pobj["name"]).once('value', data => {
          playerData = data.val();
          pobj['obj'].setPosition(playerData["x"], playerData["y"], playerData["z"]);
        })
      }
    }
  } catch (error) {
    console.warn("Frame Update Error: ", error)
  }
  requestAnimationFrame(gameLoop);
}

function end(){
  window.location = "./index.html"
}