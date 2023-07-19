var canvas = document.querySelector("canvas");
var statusText = document.querySelector("#statusText");
var grab = document.querySelector("#container");

const btn = document.getElementById("btn");
if (target.requestPictureInPicture) {
    btn.onclick = (e) => {
        const target = document.getElementById("target");
        const source = document.createElement("canvas");
        source.width = 640;
        source.height = 360;
        const ctx = source.getContext("2d", { willReadFrequently: true });
        cur = document.createElement("canvas");

        async function getStream() {
            setTimeout(() => {
                html2canvas(grab, {
                    width: 640,
                    height: 360,
                    scale: 1,
                }).then((canvas) => {
                    cur = canvas;
                    getStream();
                });
            }, 3000);
        }
        function anim() {
            ctx.drawImage(cur, 0, 0);
            requestAnimationFrame(anim);
        }

        getStream();
        anim();

        const stream = source.captureStream();
        target.srcObject = stream;
        setTimeout(() => {
            target.requestPictureInPicture();
        }, 2000);
    };
} else {
    btn.disabled = true;
}

statusText.addEventListener("click", function () {
    statusText.textContent = "Breathe...";
    heartRates = [];
    heartRateSensor
        .connect()
        .then(() =>
            heartRateSensor
                .startNotificationsHeartRateMeasurement()
                .then(handleHeartRateMeasurement)
        )
        .catch((error) => {
            statusText.textContent = error;
        });
});

function handleHeartRateMeasurement(heartRateMeasurement) {
    heartRateMeasurement.addEventListener(
        "characteristicvaluechanged",
        (event) => {
            var heartRateMeasurement = heartRateSensor.parseHeartRate(
                event.target.value
            );
            statusText.innerHTML = heartRateMeasurement.heartRate + " &#x2764;";
            heartRates.push(heartRateMeasurement.heartRate);
            drawWaves();
        }
    );
}

var heartRates = [];
var mode = "bar";

canvas.addEventListener("click", (event) => {
    mode = mode === "bar" ? "line" : "bar";
    drawWaves();
});

function drawWaves() {
    requestAnimationFrame(() => {
        canvas.width =
            parseInt(getComputedStyle(canvas).width.slice(0, -2)) *
            devicePixelRatio;
        canvas.height =
            parseInt(getComputedStyle(canvas).height.slice(0, -2)) *
            devicePixelRatio;

        var context = canvas.getContext("2d");
        var margin = 2;
        var max = Math.max(0, Math.round(canvas.width / 11));
        var offset = Math.max(0, heartRates.length - max);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = "#00796B";
        if (mode === "bar") {
            for (var i = 0; i < Math.max(heartRates.length, max); i++) {
                var barHeight = Math.round(
                    (heartRates[i + offset] * canvas.height) / 200
                );
                context.rect(
                    11 * i + margin,
                    canvas.height - barHeight,
                    margin,
                    Math.max(0, barHeight - margin)
                );
                context.stroke();
            }
        } else if (mode === "line") {
            context.beginPath();
            context.lineWidth = 6;
            context.lineJoin = "round";
            context.shadowBlur = "1";
            context.shadowColor = "#333";
            context.shadowOffsetY = "1";
            for (var i = 0; i < Math.max(heartRates.length, max); i++) {
                var lineHeight = Math.round(
                    (heartRates[i + offset] * canvas.height) / 200
                );
                if (i === 0) {
                    context.moveTo(11 * i, canvas.height - lineHeight);
                } else {
                    context.lineTo(11 * i, canvas.height - lineHeight);
                }
                context.stroke();
            }
        }
    });
}

window.onresize = drawWaves;

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        drawWaves();
    }
});
