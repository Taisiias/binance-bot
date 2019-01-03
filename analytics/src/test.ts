import * as d3 from "d3";

const dataset = [80, 230, 50, 120, 180, 30, 40, 120, 160, 70];

const svgWidth = 500;
const svgHeight = 300;
const barPadding = 5;
const barWidth = (svgWidth / dataset.length);

const svg = d3.select("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// const barChart =
svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("y",  (d) => {
        return svgHeight - d;
    })
    .attr("height",  (d) => {
        return d;
    })
    .attr("width", barWidth - barPadding)
    .attr("transform",  (i) => {
        const translate = [barWidth * i, 0];
        return "translate(" + translate + ")";
    });
// const text =
svg.selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .text((d) => {
        return d;
    })
    .attr("y", (d) => {
        return svgHeight - d - 2;
    })
    .attr("x", (d) => {
        return barWidth * d;
    })
    .attr("fill", "#A64C38");
