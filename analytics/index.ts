// import * as message from "./message";
import * as highcharts from "highcharts";

function insertChart(): void {
    highcharts.chart("container", {
        chart: {
            type: "bar",
        },
        title: {
            text: "Fruit Consumption",
        },
        xAxis: {
            categories: ["Apples", "Bananas", "Oranges"],
        },
        yAxis: {
            title: {
                text: "Fruit eaten",
            },
        },
        series: [{
            name: "Jane",
            data: [1, 0, 4],
        }, {
            name: "John",
            data: [5, 7, 3],
        }],
    });
}

window.onload = () => {
    insertChart();
};
