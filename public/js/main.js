$(function () {
  var socket = io(window.location.href);
  let chatForm = document.getElementById('chat-form');
  var player1 = document.getElementById('player-1');
  var player2 = document.getElementById('player-2');
  var player1Score = document.getElementById('player-one-score');
  var player2Score = document.getElementById('player-two-score');
  var item = document.getElementById('item');
  var score = 0;
  var movementSpeed = 5;

  socket.on('message', function (msg) {
    $('#messages').append($('<li>').text(msg));
  });

  socket.on('player move', function (position) {
    movePlayerTwo(position);
  });

  socket.on('player scored', function (position) {
    setNewItemPosition(position);
    setPlayerTwoScoreBoard(position);
  });

  socket.on('player hit', function (scoreData) {
    setPlayerTwoScoreBoard(scoreData);
  });

  function getPixelCount(style) {
    var pixelCount = style.split('px')[0];
    return parseInt(pixelCount);
  }

  function movePlayerDown(el, topPixelCount) {
    if (nextMoveInBounds(getPixelCount(topPixelCount) + movementSpeed))
      el.style.top = getPixelCount(topPixelCount) + movementSpeed;
  }

  function movePlayerUp(el, bottomPixelCount) {
    if (nextMoveInBounds(getPixelCount(bottomPixelCount) - movementSpeed))
      el.style.top = getPixelCount(bottomPixelCount) - movementSpeed;
  }

  function movePlayerRight(el, rightPixelCount) {
    if (nextMoveInBounds(getPixelCount(rightPixelCount) + movementSpeed))
      el.style.left = getPixelCount(rightPixelCount) + movementSpeed;
  }

  function movePlayerLeft(el, leftPixelCount) {
    if (nextMoveInBounds(getPixelCount(leftPixelCount) - movementSpeed))
      el.style.left = getPixelCount(leftPixelCount) - movementSpeed;
  }

  function nextMoveInBounds(nextMovePixelCount) {
    return nextMovePixelCount >= 0 && nextMovePixelCount <= 600;
  }

  function movePlayerTwo(position) {
    player2.style.top = position['top'];
    player2.style.left = 600 - position['left'];
  }

  function getTop() {
    return player1.style.top;
  }

  function getLeft() {
    return player1.style.left;
  }

  function getItemTop() {
    return item.style.top;
  }

  function getItemLeft() {
    return item.style.left;
  }

  function getPlayerPosition() {
    var top = getPixelCount(getTop());
    var left = getPixelCount(getLeft());
    return {
      'top': top,
      'left': left
    }
  }

  function getItemPosition() {
    var top = getPixelCount(getItemTop());
    var left = getPixelCount(getItemLeft());
    return {
      'top': top,
      'left': left
    }
  }

  function getElementPosition(el) {
    return {
      'top': getPixelCount(el.style.top),
      'left': getPixelCount(el.style.left)
    }
  }

  function playerHasScored() {
    var playerPosition = getPlayerPosition();
    var itemPosition = getItemPosition();

    var topScoringRange = playerPosition['top'] <= itemPosition['top'] + 40
      && playerPosition['top'] >= itemPosition['top'] - 40;

    var leftScoringRange = playerPosition['left'] <= itemPosition['left'] + 40
      && playerPosition['left'] >= itemPosition['left'] - 40;

    return topScoringRange && leftScoringRange;
  }

  function checkForScore() {
    if (playerHasScored()) {
      var newItemPosition = getRandomPosition();
      setNewItemPosition(newItemPosition);
      var opponentItemPosition = mirrorLeftPosition(newItemPosition);
      score++;
      setPlayerOneScoreBoard();
      setMovementSpeed();
      opponentItemPosition['score'] = score;
      socket.emit('player scored', opponentItemPosition);
    }
  }

  function setPlayerOneScoreBoard() {
    player1Score.innerText = score.toString();
  }

  function setPlayerTwoScoreBoard(scoreData) {
    console.log(scoreData['score'].toString());
    player2Score.innerText = scoreData['score'].toString();
  }

  function getRandomPosition() {
    var top = Math.floor(Math.random() * Math.floor(600));
    var left = Math.floor(Math.random() * Math.floor(600));
    return {
      'top': top,
      'left': left
    }
  }

  function setNewItemPosition(position) {
    item.style.top = position['top'];
    item.style.left = position['left'];
  }

  function mirrorLeftPosition(position) {
    position['left'] = 600 - position['left'];
    return position;
  }

  function setMovementSpeed() {
    movementSpeed = (score + 1) * 5
  }

  function createShot() {
    var shot = document.createElement('div');
    shot.classList.add('shot');
    shot.style.left = getLeft();
    shot.style.top = getTop();
    shot.style.position = 'absolute';
    document.getElementsByClassName('arena')[0].appendChild(shot);
    return shot;
  }

  function playerHit(shot) {
    var shotPosition = getElementPosition(shot);
    var p2Position = getElementPosition(player2);
    return shotPosition['top'] >= p2Position['top']
      && shotPosition['top'] <= (p2Position['top'] + 40)
      && shotPosition['left'] >= p2Position['left']
      && shotPosition['left'] <= (p2Position['left'] + 40);
  }

  function decrementScore() {
    return {'score': parseInt(player2Score.innerText) - 1}
  }

  function animateShot(shot) {
    if (playerHit(shot)) {
      shot.remove();
      socket.emit('player hit', decrementScore());
      return;
    }
    if (getPixelCount(shot.style.left) !== 640) {
      setTimeout(function () {
        shot.style.left = (getPixelCount(shot.style.left) + 5).toString() + 'px';
        animateShot(shot);
      }, 10);
    }
    else {
      shot.remove();
      return;
    }
  }

  // document.addEventListener('DOMContentLoaded', function (event) {

  chatForm.addEventListener('submit', function (event) {
    event.preventDefault();
    let input = document.getElementById('message').value;
    socket.emit('message', input);
    document.getElementById('message').value = '';
  });

  // Move down.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') {
      var topPixels = player1.style.top;
      topPixels === '' ? topPixels = '5px' : '';
      movePlayerDown(player1, topPixels);
      socket.emit('player move', getPlayerPosition());
      checkForScore();
    }
  });

  // Move up
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') {
      var bottomPixels = player1.style.top;
      bottomPixels === '' ? bottomPixels = '5px' : '';
      movePlayerUp(player1, bottomPixels);
      socket.emit('player move', getPlayerPosition());
      checkForScore();
    }
  });

  // Move left
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') {
      var leftPixels = player1.style.left;
      leftPixels === '' ? leftPixels = '5px' : '';
      movePlayerLeft(player1, leftPixels);
      socket.emit('player move', getPlayerPosition());
      checkForScore();
    }
  });

  // Move right
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') {
      var rightPixels = player1.style.left;
      rightPixels === '' ? rightPixels = '5px' : '';
      movePlayerRight(player1, rightPixels);
      socket.emit('player move', getPlayerPosition());
      checkForScore();
    }
  });

  // Fire
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space') {
      var shot = createShot();
      animateShot(shot);
    }
  });
  // });
});