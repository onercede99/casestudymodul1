let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let startButton = document.getElementById("startButton");
let resetButton = document.getElementById("resetButton");

let backgroundImage = new Image();
backgroundImage.src = "backgroundnen.png";
let beerBottleImage = new Image();
beerBottleImage.src = "beerbottle.png";
let beerBoxImage = new Image();
beerBoxImage.src = "beerbox.png";

let backgroundImageLoaded = false;
let beerBottleImageLoaded = false;
let beerBoxImageLoaded = false;

let Box = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 80,
    width: 90,
    height: 60,
    speed: 2
};
let beerBottle = [];
let countBeer = 0;
let missedBeer = 0;
let gameOver = false;
let gameStarted = false;

let leftPressed = false;
let rightPressed = false;

let leaderboard = JSON.parse(localStorage.getItem('hứngBiaLeaderboard')) || [];

function handlekeyPress() {
    document.addEventListener("keydown", function(e) {
        if (e.key === "ArrowLeft") {
            leftPressed = true;
        } else if (e.key === "ArrowRight") {
            rightPressed = true;
        }
    });
    document.addEventListener("keyup", function(e) {
        if (e.key === "ArrowLeft") {
            leftPressed = false;
        } else if (e.key === "ArrowRight") {
            rightPressed = false;
        }
    });
}

function createBeerBottle() {
    let bottle = {
        x: Math.random() * (canvas.width - 50),
        y: -30,
        width: 80,
        height: 120,
        speed: 2
    };
    beerBottle.push(bottle);
}

function drawBackGround() {
    if (backgroundImageLoaded) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawBeerBox() {
    if (beerBoxImageLoaded) {
        ctx.drawImage(beerBoxImage, Box.x, Box.y, Box.width, Box.height);
    } else {
        ctx.fillStyle = "blue";
        ctx.fillRect(Box.x, Box.y, Box.width, Box.height);
    }
}

function drawBeerBottle() {
    for (let i = 0; i < beerBottle.length; i++) {
        let bottle = beerBottle[i];
        if (beerBottleImageLoaded) {
            ctx.drawImage(beerBottleImage, bottle.x, bottle.y, bottle.width, bottle.height);
        } else {
            ctx.fillStyle = "brown";
            ctx.fillRect(bottle.x, bottle.y, bottle.width, bottle.height);
        }
    }
}

function drawGame() {
    ctx.fillStyle = "black";
    ctx.font = "25px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + countBeer, 10, 30);
    ctx.fillText("Missed: " + missedBeer + "/3", 10, 60);
}

function drawStartGame() {
    // Vẽ nền mờ
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Vẽ hướng dẫn
    ctx.fillStyle = "black";
    ctx.font = "35px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME HỨNG BIA", canvas.width / 2, 100);

    // Vẽ container hướng dẫn
    const instructionsX = canvas.width / 2 - 250;
    const instructionsY = 150;
    const instructionsWidth = 500;
    const instructionsHeight = 500;

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(instructionsX, instructionsY, instructionsWidth, instructionsHeight);

    // Vẽ nội dung hướng dẫn
    ctx.fillStyle = "black";
    ctx.font = "25px Arial";
    ctx.textAlign = "center";
    ctx.fillText("HƯỚNG DẪN CHƠI", canvas.width / 2, instructionsY + 40);

    ctx.font = "18px Arial";
    ctx.textAlign = "left";

    // Mục tiêu
    ctx.fillText("🎯 Mục tiêu:", instructionsX + 20, instructionsY + 80);
    ctx.fillText("Hứng càng nhiều chai bia càng tốt!", instructionsX + 40, instructionsY + 110);

    // Điều khiển
    ctx.fillText("🎮 Điều khiển:", instructionsX + 20, instructionsY + 150);
    ctx.fillText("- Phím ← → để di chuyển thùng bia", instructionsX + 40, instructionsY + 180);

    // Luật chơi
    ctx.fillText("📊 Luật chơi:", instructionsX + 20, instructionsY + 220);
    ctx.fillText("- Hứng chai bia: +1 điểm", instructionsX + 40, instructionsY + 250);
    ctx.fillText("- Bỏ lỡ 3 chai: Game Over", instructionsX + 40, instructionsY + 280);

    // Mẹo chơi
    ctx.fillText("💡 Mẹo chơi:", instructionsX + 20, instructionsY + 320);
    ctx.fillText("- Di chuyển dự đoán hướng rơi", instructionsX + 40, instructionsY + 350);
    ctx.fillText("- Ưu tiên hứng chai ở giữa", instructionsX + 40, instructionsY + 380);

    // Nút bắt đầu
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Nhấn StartGame để bắt đầu", canvas.width / 2, instructionsY + 450);
}

function drawLoseGame() {
    ctx.fillStyle = "red";
    ctx.font = "35px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "25px Arial";
    ctx.fillText("Điểm của bạn: " + countBeer, canvas.width / 2, canvas.height / 2);
    ctx.fillText("Bấm nút ResetGame để chơi lại", canvas.width / 2, canvas.height / 2 + 40);

    // Hiển thị popup nhập tên khi game kết thúc
    if (!document.getElementById('namePromptShown')) {
        showNameInput(countBeer);
        let div = document.createElement('div');
        div.id = 'namePromptShown';
        document.body.appendChild(div);
    }
}

function update() {
    if (gameOver) {
        return;
    }
    if (rightPressed && Box.x < canvas.width - Box.width) {
        Box.x = Box.x + Box.speed;
    }
    if (leftPressed && Box.x > 0) {
        Box.x = Box.x - Box.speed;
    }
    for (let i = 0; i < beerBottle.length; i++) {
        let bottle = beerBottle[i];
        bottle.y = bottle.y + bottle.speed;
        if (bottle.y + bottle.height > Box.y && bottle.x + bottle.width > Box.x && bottle.x < Box.x + Box.width) {
            countBeer += 1;
            beerBottle.splice(i, 1);
            i -= 1;
        } else if (bottle.y > canvas.height) {
            missedBeer += 1;
            beerBottle.splice(i, 1);
            i -= 1;
            if (missedBeer >= 3) {
                gameOver = true;
                resetButton.style.display = "block";
            }
        }
    }
}
function resetGame() {
    beerBottle = [];
    countBeer = 0;
    missedBeer = 0;
    gameOver = false;
    gameStarted = true;
    Box.x = canvas.width / 2 - 40;
    resetButton.style.display = "none";

    let promptDiv = document.getElementById('namePromptShown');
    if (promptDiv) {
        promptDiv.remove();
    }
}

function addToLeaderboard(name, score) {
    const newEntry = {
        name: name || "Người chơi",
        score: score,
    };

    leaderboard.push(newEntry);

    leaderboard.sort((a, b) => b.score - a.score);

    if (leaderboard.length > 10) {
        leaderboard = leaderboard.slice(0, 10);
    }

    // Lưu vào localStorage
    localStorage.setItem('hứngBiaLeaderboard', JSON.stringify(leaderboard));

    // Cập nhật hiển thị
    updateLeaderboard();
}
function updateLeaderboard() {
    const scoreBody = document.getElementById('scoreBody');
    scoreBody.innerHTML = '';

    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.name}</td>
                    <td>${entry.score}</td>
                `;
        scoreBody.appendChild(row);
    });
}
function showNameInput(score) {
    const name = prompt(`Bạn đạt được ${score} điểm! Nhập tên của bạn để lưu vào bảng xếp hạng:`, "Người chơi");
    if (name !== null) {
        addToLeaderboard(name, score);
    }
}

function gameLoop() {
    drawBackGround();
    if (gameStarted === false) {
        drawStartGame();
    } else if (gameOver && missedBeer >= 3) {
        drawLoseGame();
    } else {
        drawBeerBox();
        drawBeerBottle();
        drawGame();
        update();
        if (Math.random() < 0.01) {
            createBeerBottle();
        }
    }
    requestAnimationFrame(gameLoop);
}

backgroundImage.onload = function() {
    backgroundImageLoaded = true;
};

beerBottleImage.onload = function() {
    beerBottleImageLoaded = true;
};

beerBoxImage.onload = function() {
    beerBoxImageLoaded = true;
};

startButton.addEventListener("click", function() {
    gameStarted = true;
    startButton.style.display = "none";
});

resetButton.addEventListener("click", function() {
    resetGame();
});

handlekeyPress();
document.addEventListener('DOMContentLoaded', function() {
    updateLeaderboard();
    gameLoop();
});