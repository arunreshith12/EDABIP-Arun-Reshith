/* =========================================
   SEARCH
========================================= */

const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const rows = document.querySelectorAll("#modelTable tr");


searchInput.addEventListener("input", function () {

    const searchValue =
        searchInput.value.toLowerCase();

    rows.forEach(function (row) {

        const rowText =
            row.innerText.toLowerCase();

        if (rowText.includes(searchValue)) {

            row.style.display = "";

        } else {

            row.style.display = "none";

        }

    });

});


/* Clear Search */

clearSearch.addEventListener("click", function () {

    searchInput.value = "";

    rows.forEach(function (row) {

        row.style.display = "";

    });

});


/* =========================================
   REFRESH BUTTON
========================================= */

const refreshBtn =
    document.getElementById("refreshBtn");

refreshBtn.addEventListener("click", function () {

    refreshBtn.innerHTML = "↻ Refreshing...";

    setTimeout(function () {

        refreshBtn.innerHTML = "↻ Refresh";

        alert("Dashboard refreshed successfully!");

    }, 1000);

});


/* =========================================
   REVENUE CHART
========================================= */

const revenueCanvas =
    document.getElementById("revenueChart");

const revenueCtx =
    revenueCanvas.getContext("2d");


function drawRevenueChart() {

    const width = revenueCanvas.clientWidth;
    const height = revenueCanvas.clientHeight;

    const dpr = window.devicePixelRatio || 1;

    revenueCanvas.width = width * dpr;
    revenueCanvas.height = height * dpr;

    revenueCtx.scale(dpr, dpr);

    revenueCtx.clearRect(0, 0, width, height);


    /* Data */

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep"
    ];

    const values = [
        27000,
        34000,
        30000,
        47000,
        53000,
        50000,
        62000,
        74000,
        80000
    ];


    const paddingLeft = 55;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 40;

    const chartWidth =
        width - paddingLeft - paddingRight;

    const chartHeight =
        height - paddingTop - paddingBottom;


    /* Grid */

    revenueCtx.strokeStyle = "#e5e5e5";
    revenueCtx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {

        const y =
            paddingTop +
            (chartHeight / 4) * i;

        revenueCtx.beginPath();

        revenueCtx.setLineDash([3, 3]);

        revenueCtx.moveTo(
            paddingLeft,
            y
        );

        revenueCtx.lineTo(
            width - paddingRight,
            y
        );

        revenueCtx.stroke();

    }

    revenueCtx.setLineDash([]);


    /* Y-axis labels */

    revenueCtx.fillStyle = "#9299a5";
    revenueCtx.font = "11px Arial";

    const labels = [
        "$100K",
        "$75K",
        "$50K",
        "$25K",
        "$0"
    ];

    labels.forEach(function (label, index) {

        const y =
            paddingTop +
            (chartHeight / 4) * index;

        revenueCtx.fillText(
            label,
            5,
            y + 4
        );

    });


    /* Create points */

    const points = [];

    values.forEach(function (value, index) {

        const x =
            paddingLeft +
            (chartWidth / (values.length - 1)) *
            index;

        const y =
            paddingTop +
            chartHeight -
            (value / 100000) * chartHeight;

        points.push({
            x: x,
            y: y
        });

    });


    /* Fill area */

    revenueCtx.beginPath();

    revenueCtx.moveTo(
        points[0].x,
        paddingTop + chartHeight
    );

    points.forEach(function (point) {

        revenueCtx.lineTo(
            point.x,
            point.y
        );

    });

    revenueCtx.lineTo(
        points[points.length - 1].x,
        paddingTop + chartHeight
    );

    revenueCtx.closePath();

    const gradient =
        revenueCtx.createLinearGradient(
            0,
            0,
            0,
            height
        );

    gradient.addColorStop(
        0,
        "#a5eff0"
    );

    gradient.addColorStop(
        1,
        "#789292"
    );

    revenueCtx.fillStyle = gradient;

    revenueCtx.fill();


    /* Line */

    revenueCtx.beginPath();

    points.forEach(function (point, index) {

        if (index === 0) {

            revenueCtx.moveTo(
                point.x,
                point.y
            );

        } else {

            const previous =
                points[index - 1];

            const controlX =
                (previous.x + point.x) / 2;

            revenueCtx.bezierCurveTo(
                controlX,
                previous.y,
                controlX,
                point.y,
                point.x,
                point.y
            );

        }

    });

    revenueCtx.strokeStyle = "#173f3d";

    revenueCtx.lineWidth = 3;

    revenueCtx.stroke();


    /* Points */

    points.forEach(function (point) {

        revenueCtx.beginPath();

        revenueCtx.arc(
            point.x,
            point.y,
            4,
            0,
            Math.PI * 2
        );

        revenueCtx.fillStyle = "#6bd4d5";

        revenueCtx.fill();

        revenueCtx.strokeStyle = "#173f3d";

        revenueCtx.lineWidth = 2;

        revenueCtx.stroke();

    });


    /* X-axis labels */

    revenueCtx.fillStyle = "#9299a5";

    revenueCtx.font = "11px Arial";

    months.forEach(function (month, index) {

        const x =
            paddingLeft +
            (chartWidth / (months.length - 1)) *
            index;

        revenueCtx.fillText(
            month,
            x - 8,
            height - 15
        );

    });

}


drawRevenueChart();


/* =========================================
   DEMAND BAR CHART
========================================= */

const demandCanvas =
    document.getElementById("demandChart");

const demandCtx =
    demandCanvas.getContext("2d");


function drawDemandChart() {

    const width =
        demandCanvas.clientWidth;

    const height =
        demandCanvas.clientHeight;

    const dpr =
        window.devicePixelRatio || 1;

    demandCanvas.width =
        width * dpr;

    demandCanvas.height =
        height * dpr;

    demandCtx.scale(dpr, dpr);

    demandCtx.clearRect(
        0,
        0,
        width,
        height
    );


    const days = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ];

    const values = [
        23000,
        35000,
        65000,
        95000,
        55000,
        45000,
        60000
    ];


    const paddingLeft = 50;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 40;

    const chartWidth =
        width - paddingLeft - paddingRight;

    const chartHeight =
        height - paddingTop - paddingBottom;


    /* Grid lines */

    demandCtx.strokeStyle = "#e5e5e5";

    demandCtx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {

        const y =
            paddingTop +
            (chartHeight / 4) * i;

        demandCtx.beginPath();

        demandCtx.setLineDash([3, 3]);

        demandCtx.moveTo(
            paddingLeft,
            y
        );

        demandCtx.lineTo(
            width - paddingRight,
            y
        );

        demandCtx.stroke();

    }

    demandCtx.setLineDash([]);


    /* Y labels */

    demandCtx.fillStyle = "#9299a5";

    demandCtx.font = "11px Arial";

    const labels = [
        "100K",
        "75K",
        "50K",
        "25K",
        "0"
    ];

    labels.forEach(function (label, index) {

        const y =
            paddingTop +
            (chartHeight / 4) * index;

        demandCtx.fillText(
            label,
            10,
            y + 4
        );

    });


    /* Bars */

    const barWidth = 38;

    const gap =
        chartWidth / days.length;


    const barColors = [
        "#9be5dc",
        "#c6a5e8",
        "#b6caf0",
        "#376966",
        "#8aa3a2",
        "#8bb8b9",
        "#e6a0a4"
    ];


    values.forEach(function (value, index) {

        const x =
            paddingLeft +
            gap * index +
            (gap - barWidth) / 2;

        const barHeight =
            (value / 100000) *
            chartHeight;

        const y =
            paddingTop +
            chartHeight -
            barHeight;


        /* Bar */

        demandCtx.fillStyle =
            barColors[index];

        demandCtx.beginPath();

        demandCtx.roundRect(
            x,
            y,
            barWidth,
            barHeight,
            4
        );

        demandCtx.fill();


        /* Value */

        demandCtx.fillStyle = "#555";

        demandCtx.font =
            "11px Arial";

        demandCtx.textAlign =
            "center";

        demandCtx.fillText(
            value.toLocaleString(),
            x + barWidth / 2,
            y - 7
        );


        /* Day */

        demandCtx.fillStyle =
            "#9299a5";

        demandCtx.fillText(
            days[index],
            x + barWidth / 2,
            height - 15
        );

    });

    demandCtx.textAlign = "left";

}


drawDemandChart();


/* =========================================
   RESPONSIVE CHART
========================================= */

window.addEventListener(
    "resize",
    function () {

        drawRevenueChart();

        drawDemandChart();

    }
);


/* =========================================
   TABLE VIEW BUTTON
========================================= */

const viewButtons =
    document.querySelectorAll(".view-btn");


viewButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            const row =
                button.closest("tr");

            const modelName =
                row.children[0].innerText;

            alert(
                "You selected: " +
                modelName
            );

        }
    );

});