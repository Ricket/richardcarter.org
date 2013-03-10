/* constants */
var WIDTH = 800,
    HEIGHT = 600,
    BALLDIAMETER = 11,
    PADDLEWIDTH = 12,
    PADDLEHEIGHT = 80,
    PADDLEOFFSET = 4, // distance from edge of field
    PADDLEMAXSPEED = 1000 / 1000, // in pixels per millisecond
    MAXBOUNCEANGLE = Math.PI / 12;

/* global variables */
var score1 = 0,
    score2 = 0,
    lastTime,
    ballX, ballY, // position
    ballVx, ballVy, // velocity & direction
    paddle1Y,
    paddle1Vy = 0,
    paddle2Y,
    paddle2Vy = 0;
/*** Velocities are in pixels/ms ***/

/* elements */
var page,
    pongtable,
    content,
    ball,
    paddle1,
    paddle2;

window.requestFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback, element) {
        return window.setTimeout(callback, 1000 / 60);
    };

window.onload = function () {
    // cache element references
    page = document.getElementById("page");
    pongtable = document.getElementById("pong_table");
    content = document.getElementById("content");
    ball = document.getElementById("pong_ball");
    paddle1 = document.getElementById("pong_paddle1");
    paddle2 = document.getElementById("pong_paddle2");

    // clear the field
    UpdateScores();
    ResetBall();
    ResetPaddles();
    SetBallPos();
    ResetPaddles();
    SetPaddlePos();

    // start the frame loop
    lastTime = new Date();
    window.requestFrame(Frame);

    // bind keypress event
    document.onmousedown = MouseDown;
    document.onmouseup = MouseUp;

    // and return
    page.style.display = "block";
    return true;
};

function Frame() {
    var currTime = new Date(),
        millis = currTime.getTime() - lastTime.getTime();

    lastTime = currTime;

    ProcessAI1();
    ProcessAI2();
    UpdatePaddlePos(millis, 0);

    UpdateBallPos(millis);

    SetBallPos();
    SetPaddlePos();

    window.requestFrame(Frame);
}

function UpdateBallPos(ms) {
    var newBallX = ballX + ballVx * ms,
        newBallY = ballY + ballVy * ms;

    // Top and bottom edges, simply bounce
    if (newBallY < 0) {
        newBallY = -newBallY;
        ballVy = -ballVy;
    } else if (newBallY + BALLDIAMETER > (HEIGHT - 1)) {
        newBallY -= 2 * ((newBallY + BALLDIAMETER) - (HEIGHT - 1));
        ballVy = -ballVy;
    }

    var intersectX,
        intersectY,
        relativeIntersectY,
        bounceAngle,
        ballSpeed,
        ballTravelLeft;

    // Left paddle (paddle1)
    if (newBallX < PADDLEOFFSET + PADDLEWIDTH && ballX >= PADDLEOFFSET + PADDLEWIDTH) {
        intersectX = PADDLEOFFSET + PADDLEWIDTH; // (duh)
        intersectY = ballY - ((ballX - (PADDLEOFFSET + PADDLEWIDTH)) * (ballY - newBallY)) / (ballX - newBallX);
        if (intersectY >= paddle1Y && intersectY <= paddle1Y + PADDLEHEIGHT) {
            relativeIntersectY = (paddle1Y + (PADDLEHEIGHT / 2)) - intersectY;
            bounceAngle = (relativeIntersectY / (PADDLEHEIGHT / 2)) * (Math.PI / 2 - MAXBOUNCEANGLE);
            ballSpeed = Math.sqrt(ballVx * ballVx + ballVy * ballVy);
            ballTravelLeft = (newBallY - intersectY) / (newBallY - ballY);
            ballVx = ballSpeed * Math.cos(bounceAngle);
            ballVy = ballSpeed * -Math.sin(bounceAngle);
            newBallX = intersectX + ballTravelLeft * ballSpeed * Math.cos(bounceAngle);
            newBallY = intersectY + ballTravelLeft * ballSpeed * Math.sin(bounceAngle);
        }
    }

    // Right paddle (paddle2)
    if (newBallX > WIDTH - PADDLEOFFSET - PADDLEWIDTH && ballX <= WIDTH - PADDLEOFFSET - PADDLEWIDTH) {
        intersectX = WIDTH - PADDLEOFFSET - PADDLEWIDTH; // (duh)
        intersectY = ballY - ((ballX - (WIDTH - PADDLEOFFSET - PADDLEWIDTH)) * (ballY - newBallY)) / (ballX - newBallX);
        if (intersectY >= paddle2Y && intersectY <= paddle2Y + PADDLEHEIGHT) {
            relativeIntersectY = (paddle2Y + (PADDLEHEIGHT / 2)) - intersectY;
            bounceAngle = (relativeIntersectY / (PADDLEHEIGHT / 2)) * (Math.PI / 2 - MAXBOUNCEANGLE);
            ballSpeed = Math.sqrt(ballVx * ballVx + ballVy * ballVy);
            ballTravelLeft = (newBallY - intersectY) / (newBallY - ballY);
            ballVx = ballSpeed * Math.cos(bounceAngle) * -1;
            ballVy = ballSpeed * Math.sin(bounceAngle) * -1;
            newBallX = intersectX - ballTravelLeft * ballSpeed * Math.cos(bounceAngle);
            newBallY = intersectY - ballTravelLeft * ballSpeed * Math.sin(bounceAngle);
        }
    }

    // Left and right edges, add to the score and reset the ball
    if (newBallX < 0) {
        PlayerLost(1);
        return;
    } else if (newBallX + BALLDIAMETER > (WIDTH - 1)) {
        PlayerLost(2);
        return;
    }

    // Finally, copy newBall to ball
    ballX = newBallX;
    ballY = newBallY;
}

function PlayerLost(player) {
    if (player < 1 || player > 2) {
        throw new Error("Invalid player number: " + player);
    }

    if (player == 1) {
        score2++;
    } else {
        score1++;
    }

    UpdateScores();
    ResetBall();
    ResetPaddles();
    SetBallPos();
}

function ResetBall() {
    // TODO randomize the ball's location and velocity
    ballX = 200;
    ballY = 300;
    ballVx = 800 / 1000;
    ballVy = 1 / 1000;
}

function ResetPaddles() {
    var y = Math.floor((HEIGHT - PADDLEHEIGHT) / 2);
    if (controllingPaddle != 1) {
        paddle1Y = y;
    }
    if (controllingPaddle != 2) {
        paddle2Y = y;
    }
}

function SetBallPos() {
    // update the ball element to match the ballX & ballY variables
    ball.style.left = ballX + "px";
    ball.style.top = ballY + "px";
}

function UpdatePaddlePos(ms, paddle) {
    if (paddle < 1 || paddle > 2) {
        paddle = 0;
    }
    if (paddle <= 1) {
        paddle1Y += paddle1Vy * ms;
    }
    if (paddle % 2 === 0) {
        paddle2Y += paddle2Vy * ms;
    }

    if (paddle1Y < 0) {
        paddle1Y = 0;
        paddle1Vy = 0;
    } else if (paddle1Y + PADDLEHEIGHT > HEIGHT - 1) {
        paddle1Y = (HEIGHT - 1) - PADDLEHEIGHT;
        paddle1Vy = 0;
    }
    if (paddle2Y < 0) {
        paddle2Y = 0;
        paddle2Vy = 0;
    } else if (paddle2Y + PADDLEHEIGHT > HEIGHT - 1) {
        paddle2Y = (HEIGHT - 1) - PADDLEHEIGHT;
        paddle2Vy = 0;
    }
}

function SetPaddlePos() {
    // update the paddle elements to match the paddle Y variables
    paddle1.style.top = paddle1Y + "px";
    paddle2.style.top = paddle2Y + "px";
}

function UpdateScores() {
    UpdateScore(1);
    UpdateScore(2);
}

function UpdateScore(player) {
    if (player < 1 || player > 2) {
        throw new Error("Invalid player num: " + player);
    }

    var score;
    if (player == 1) {
        score = score1;
    } else {
        score = score2;
    }

    if (score < 0) {
        throw new Error("Invalid score: " + score);
    } else if (score > 99) {
        score = 99;
    }

    var number1, number2;
    if (player == 1) {
        number1 = document.getElementById("pong_number1");
        number2 = document.getElementById("pong_number2");
    } else {
        number1 = document.getElementById("pong_number3");
        number2 = document.getElementById("pong_number4");
    }

    var onesPieces, tensPieces;
    // top, tl, tr, mid, bl, br, bot
    var GetPiecesArray = function (num) {
        var pieces;
        switch (num) {
            case 0:
                pieces = new Array(1, 1, 1, 0, 1, 1, 1);
                break;
            case 1:
                pieces = new Array(0, 0, 1, 0, 0, 1, 0);
                break;
            case 2:
                pieces = new Array(1, 0, 1, 1, 1, 0, 1);
                break;
            case 3:
                pieces = new Array(1, 0, 1, 1, 0, 1, 1);
                break;
            case 4:
                pieces = new Array(0, 1, 1, 1, 0, 1, 0);
                break;
            case 5:
                pieces = new Array(1, 1, 0, 1, 0, 1, 1);
                break;
            case 6:
                pieces = new Array(1, 1, 0, 1, 1, 1, 1);
                break;
            case 7:
                pieces = new Array(1, 0, 1, 0, 0, 1, 0);
                break;
            case 8:
                pieces = new Array(1, 1, 1, 1, 1, 1, 1);
                break;
            case 9:
                pieces = new Array(1, 1, 1, 1, 0, 1, 1);
                break;
            default:
                pieces = new Array(0, 0, 0, 0, 0, 0, 0);
                break;
        }
        return pieces;
    };

    onesPieces = GetPiecesArray(score % 10);
    tensPieces = GetPiecesArray((score >= 10) ? Math.floor(score / 10) : -1);

    var UpdateNumber = function (elem, piecesArr) {
        var childIdx = 0;
        for (var i = 0; i < piecesArr.length; i++) {
            while (elem.childNodes[childIdx] && elem.childNodes[childIdx].nodeName.toUpperCase() != "IMG") {
                childIdx++;
            }
            if (!elem.childNodes[childIdx]) {
                break;
            }
            if (piecesArr[i]) {
                elem.childNodes[childIdx].style.display = "inline";
            } else {
                elem.childNodes[childIdx].style.display = "none";
            }
            childIdx++;
        }
    };

    UpdateNumber(number1, tensPieces);
    UpdateNumber(number2, onesPieces);
}
