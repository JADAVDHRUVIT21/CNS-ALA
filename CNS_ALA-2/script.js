/* =========================================================
   MALWARE BEHAVIOR SIMULATOR
   SAFE / EDUCATIONAL SIMULATION
========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let currentThreat = null;

let infectedPCs = new Set();

let simulationTimers = [];

const totalPCs = 14;


/* =========================================================
   THREAT DATA
========================================================= */

const threats = {

    virus: {

        name: "VIRUS",

        icon: "🦠",

        color: "#ff315a",

        description:
            "A computer virus is simulated as malware that depends on a host. In this safe environment, selected virtual PCs become infected and the simulated infection gradually moves to other connected nodes.",

        type:
            "HOST DEPENDENT",

        mode:
            "Selective propagation"

    },


    worm: {

        name: "WORM",

        icon: "🪱",

        color: "#00eaff",

        description:
            "A computer worm is simulated as self-replicating malware. Once the simulation starts, the worm automatically propagates through the virtual network and attempts to reach every available PC node.",

        type:
            "SELF REPLICATING",

        mode:
            "Automatic network propagation"

    },


    trojan: {

        name: "TROJAN",

        icon: "🐴",

        color: "#a855f7",

        description:
            "A Trojan is simulated as malicious software disguised as legitimate software. In this controlled environment, only selected virtual PCs become affected to demonstrate targeted behavior.",

        type:
            "DISGUISED THREAT",

        mode:
            "Selective targeting"

    }

};


/* =========================================================
   SELECT THREAT
========================================================= */

function selectThreat(type) {

    currentThreat = type;

    infectedPCs.clear();

    clearTimers();

    showSimulationPage();

}


/* =========================================================
   SHOW SIMULATION PAGE
========================================================= */

function showSimulationPage() {

    document
        .getElementById("homePage")
        .classList.remove("active");

    document
        .getElementById("simulationPage")
        .classList.add("active");

    updateThreatUI();

    createNetwork();

    resetStats();


    /*
        Automatically start after 2 seconds.
        No start button required.
    */

    const timer = setTimeout(() => {

        startSimulation();

    }, 2000);

    simulationTimers.push(timer);
}


/* =========================================================
   GO HOME
========================================================= */

function goHome() {

    clearTimers();

    infectedPCs.clear();

    document
        .getElementById("simulationPage")
        .classList.remove("active");

    document
        .getElementById("homePage")
        .classList.add("active");
}


/* =========================================================
   UPDATE THREAT UI
========================================================= */

function updateThreatUI() {

    const data = threats[currentThreat];

    document
        .getElementById("profileIcon")
        .textContent = data.icon;

    document
        .getElementById("profileName")
        .textContent = data.name;

    document
        .getElementById("threatDescription")
        .textContent = data.description;

    document
        .getElementById("simulationSubtitle")
        .textContent =
            data.name + " • " + data.type;

    document
        .getElementById("simulationStatus")
        .textContent =
            "READY";

    document
        .getElementById("activityStatus")
        .textContent =
            "READY";
}


/* =========================================================
   CREATE 14 PC NETWORK
========================================================= */

function createNetwork() {

    const network =
        document.getElementById("network");

    network.innerHTML = "";

    createConnections();


    for (
        let i = 1;
        i <= totalPCs;
        i++
    ) {

        const pc =
            document.createElement("div");

        pc.className =
            "pc healthy";

        pc.id =
            `pc-${i}`;

        pc.innerHTML = `

            <div class="pc-screen"></div>

            <div class="pc-name">
                PC-${String(i).padStart(2, "0")}
            </div>

            <div class="pc-status">
                HEALTHY
            </div>

        `;

        network.appendChild(pc);
    }
}


/* =========================================================
   NETWORK CONNECTIONS
========================================================= */

function createConnections() {

    const network =
        document.getElementById("network");

    setTimeout(() => {

        const pcs =
            document.querySelectorAll(".pc");

        if (!pcs.length)
            return;


        for (
            let i = 0;
            i < pcs.length - 1;
            i++
        ) {

            if (
                Math.floor(i / 7) ===
                Math.floor((i + 1) / 7)
            ) {

                drawLine(
                    network,
                    pcs[i],
                    pcs[i + 1]
                );
            }
        }


        for (
            let i = 0;
            i < 7;
            i++
        ) {

            drawLine(
                network,
                pcs[i],
                pcs[i + 7]
            );
        }

    }, 50);
}


/* =========================================================
   DRAW NETWORK LINE
========================================================= */

function drawLine(
    container,
    element1,
    element2
) {

    const line =
        document.createElement("div");

    line.className =
        "connection";

    const containerRect =
        container.getBoundingClientRect();

    const rect1 =
        element1.getBoundingClientRect();

    const rect2 =
        element2.getBoundingClientRect();


    const x1 =
        rect1.left +
        rect1.width / 2 -
        containerRect.left;

    const y1 =
        rect1.top +
        rect1.height / 2 -
        containerRect.top;

    const x2 =
        rect2.left +
        rect2.width / 2 -
        containerRect.left;

    const y2 =
        rect2.top +
        rect2.height / 2 -
        containerRect.top;


    const dx = x2 - x1;

    const dy = y2 - y1;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    const angle =
        Math.atan2(dy, dx) *
        180 /
        Math.PI;


    line.style.width =
        `${distance}px`;

    line.style.left =
        `${x1}px`;

    line.style.top =
        `${y1}px`;

    line.style.transform =
        `rotate(${angle}deg)`;


    container.appendChild(line);
}


/* =========================================================
   RESET STATS
========================================================= */

function resetStats() {

    document
        .getElementById("infectedCount")
        .textContent = "0";

    document
        .getElementById("healthyCount")
        .textContent =
            totalPCs;

    document
        .getElementById("progressValue")
        .textContent = "0%";

    document
        .getElementById("progressText")
        .textContent =
            `0 / ${totalPCs}`;

    document
        .getElementById("progressBar")
        .style.width = "0%";


    document
        .getElementById("activityLog")
        .innerHTML = `

            <div class="log-item system-log">

                <span class="log-time">
                    SYSTEM
                </span>

                <span>
                    Simulation environment initialized.
                </span>

            </div>

            <div class="log-item">

                <span class="log-time">
                    NETWORK
                </span>

                <span>
                    14 virtual nodes detected.
                </span>

            </div>

        `;
}


/* =========================================================
   START SIMULATION
========================================================= */

function startSimulation() {

    const data =
        threats[currentThreat];


    document
        .getElementById("simulationStatus")
        .textContent =
            "SIMULATION ACTIVE";


    document
        .getElementById("activityStatus")
        .textContent =
            "LIVE";


    addLog(
        "THREAT",
        `${data.name} simulation started.`,
        "system-log"
    );


    if (currentThreat === "virus") {

        runVirusSimulation();

    }

    else if (currentThreat === "worm") {

        runWormSimulation();

    }

    else if (currentThreat === "trojan") {

        runTrojanSimulation();

    }
}


/* =========================================================
   VIRUS SIMULATION
========================================================= */

function runVirusSimulation() {

    const first =
        randomPC();


    processPC(first, () => {

        const spreadSequence =
            shuffle(
                Array.from(
                    { length: totalPCs },
                    (_, i) => i + 1
                )
            );


        let index = 0;


        /*
            Virus affects selected PCs only.
            Every PC finishes its process before
            the next PC starts.
        */

        function nextVirusPC() {

            if (
                infectedPCs.size >= 6 ||
                index >= spreadSequence.length
            ) {

                finishSimulation();

                return;
            }


            const pc =
                spreadSequence[index++];


            if (
                infectedPCs.has(pc)
            ) {

                nextVirusPC();

                return;
            }


            processPC(
                pc,
                nextVirusPC
            );
        }


        nextVirusPC();

    });
}


/* =========================================================
   WORM SIMULATION
========================================================= */

function runWormSimulation() {

    const sequence =
        shuffle(
            Array.from(
                { length: totalPCs },
                (_, i) => i + 1
            )
        );


    let index = 0;


    /*
        Worm processes ALL 14 PCs.
        One PC completes before next starts.
    */

    function nextWormPC() {

        if (
            index >= sequence.length
        ) {

            finishSimulation();

            return;
        }


        const pc =
            sequence[index++];


        processPC(
            pc,
            nextWormPC
        );
    }


    nextWormPC();
}


/* =========================================================
   TROJAN SIMULATION
========================================================= */

function runTrojanSimulation() {

    const targetCount =
        randomNumber(3, 5);


    const targets =
        shuffle(
            Array.from(
                { length: totalPCs },
                (_, i) => i + 1
            )
        ).slice(
            0,
            targetCount
        );


    let index = 0;


    /*
        Trojan processes only selected PCs.
    */

    function nextTrojanPC() {

        if (
            index >= targets.length
        ) {

            finishSimulation();

            return;
        }


        const pc =
            targets[index++];


        processPC(
            pc,
            nextTrojanPC
        );
    }


    nextTrojanPC();
}


/* =========================================================
   PROCESS PC
========================================================= */

function processPC(
    number,
    onComplete
) {

    if (
        infectedPCs.has(number)
    ) {

        onComplete();

        return;
    }


    const pc =
        document.getElementById(
            `pc-${number}`
        );


    if (!pc) {

        onComplete();

        return;
    }


    /*
        -----------------------------------------------------
        STEP 1 : SCANNING
        -----------------------------------------------------
    */

    pc.classList.remove(
        "healthy",
        "infected"
    );

    pc.classList.add(
        "spreading"
    );


    pc.querySelector(
        ".pc-status"
    ).textContent =
        "SCANNING";


    addLog(
        "SCAN",
        `PC-${String(number).padStart(2, "0")} is being scanned.`,
        "system-log"
    );


    /*
        -----------------------------------------------------
        STEP 2 : PROCESSING
        -----------------------------------------------------
    */

    const processingTimer =
        setTimeout(() => {

            pc.querySelector(
                ".pc-status"
            ).textContent =
                "PROCESSING...";


            addLog(
                "PROCESS",
                `PC-${String(number).padStart(2, "0")} infection process started.`,
                "system-log"
            );


            /*
                Small processing animation.
            */

            pc.classList.add(
                "spreading"
            );


        }, 650);


    simulationTimers.push(
        processingTimer
    );


    /*
        -----------------------------------------------------
        STEP 3 : INFECTED
        -----------------------------------------------------
    */

    const infectedTimer =
        setTimeout(() => {

            infectedPCs.add(number);


            pc.classList.remove(
                "spreading"
            );

            pc.classList.add(
                "infected"
            );


            pc.querySelector(
                ".pc-status"
            ).textContent =
                "INFECTED";


            addLog(
                "ALERT",
                `PC-${String(number).padStart(2, "0")} is now infected in simulation.`,
                "infected-log"
            );


            updateStats();


        }, 1500);


    simulationTimers.push(
        infectedTimer
    );


    /*
        -----------------------------------------------------
        STEP 4 : PROCESS DONE
        -----------------------------------------------------
    */

    const doneTimer =
        setTimeout(() => {

            pc.querySelector(
                ".pc-status"
            ).textContent =
                "PROCESS DONE";


            addLog(
                "DONE",
                `PC-${String(number).padStart(2, "0")} process completed.`,
                "system-log"
            );


            updateStats();


            /*
                IMPORTANT:
                Next PC starts ONLY after
                current PC says PROCESS DONE.
            */

            if (
                typeof onComplete === "function"
            ) {

                onComplete();

            }


        }, 2200);


    simulationTimers.push(
        doneTimer
    );
}


/* =========================================================
   UPDATE STATS
========================================================= */

function updateStats() {

    const infected =
        infectedPCs.size;


    const healthy =
        totalPCs - infected;


    const percentage =
        Math.round(
            infected /
            totalPCs *
            100
        );


    document
        .getElementById("infectedCount")
        .textContent =
            infected;


    document
        .getElementById("healthyCount")
        .textContent =
            healthy;


    document
        .getElementById("progressValue")
        .textContent =
            percentage + "%";


    document
        .getElementById("progressText")
        .textContent =
            `${infected} / ${totalPCs}`;


    document
        .getElementById("progressBar")
        .style.width =
            percentage + "%";
}


/* =========================================================
   FINISH SIMULATION
========================================================= */

function finishSimulation() {

    const timer =
        setTimeout(() => {

            updateStats();


            document
                .getElementById("simulationStatus")
                .textContent =
                    "SIMULATION COMPLETE";


            document
                .getElementById("activityStatus")
                .textContent =
                    "COMPLETE";


            addLog(
                "SYSTEM",
                `${threats[currentThreat].name} behavior simulation completed.`,
                "system-log"
            );


            addLog(
                "SAFE",
                "No real computers or files were affected.",
                "system-log"
            );


        }, 500);


    simulationTimers.push(timer);
}


/* =========================================================
   ADD ACTIVITY LOG
========================================================= */

function addLog(
    type,
    message,
    className = ""
) {

    const log =
        document.getElementById(
            "activityLog"
        );


    const item =
        document.createElement("div");


    item.className =
        `log-item ${className}`;


    const time =
        new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    item.innerHTML = `

        <span class="log-time">
            ${time}
        </span>

        <span>
            [${type}] ${message}
        </span>

    `;


    log.appendChild(item);


    while (
        log.children.length > 8
    ) {

        log.removeChild(
            log.firstChild
        );
    }


    log.scrollTop =
        log.scrollHeight;
}


/* =========================================================
   RANDOM PC
========================================================= */

function randomPC() {

    return randomNumber(
        1,
        totalPCs
    );
}


/* =========================================================
   RANDOM NUMBER
========================================================= */

function randomNumber(
    min,
    max
) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;
}


/* =========================================================
   SHUFFLE ARRAY
========================================================= */

function shuffle(array) {

    const result =
        [...array];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]
        ] =
        [
            result[j],
            result[i]
        ];
    }


    return result;
}


/* =========================================================
   CLEAR TIMERS
========================================================= */

function clearTimers() {

    simulationTimers.forEach(
        timer => {

            clearTimeout(timer);

            clearInterval(timer);

        }
    );


    simulationTimers = [];
}


/* =========================================================
   INITIAL PAGE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .getElementById("homePage")
            .classList.add("active");

    }
);