import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import data from '../data.json';
import { groupBy } from '../utils/objectUtils';
import './chart.css';

const margin = {top: 10, right: 30, bottom: 100, left: 100};
const width = 460 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;
const groupedData = groupBy(data, 'Year');
const keys = Object.keys(groupedData);

const formattedData = keys.map(k => {
  let res = { year: groupedData[k][0].Year }

  groupedData[k].forEach((c) => {
    res[c.City] = c.Value;
  });

  return res;
})

export const Chart = () => {
  const ref = useRef();

  useEffect(() => {
    const years = data.map(d => (d.Year));
    const city = [...new Set(data.map(d => (d.City)))];

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

    // Add X axis
    const x = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding([0.1])
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));


    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 2500000])
      .range([ height, 0 ])
      .nice()
    svg.append("g")
      .call(d3.axisLeft(y))


    const color = d3.scaleOrdinal()
      .domain(city)
      .range(['#ff9640','#377eb8','#9be2fa', '#d19bfa'])

    const stackedData = d3.stack()
      .keys(city)(formattedData);


    // Create a tooltip

    const tooltip = d3.select(ref.current)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")

    const mouseover = function(event, d) {
      const subgroupName = d3.select(this.parentNode).datum().key;
      const subgroupValue = d.data[subgroupName];
      tooltip
        .html(subgroupName + "<br>" + subgroupValue)
        .style("opacity", 1)
    }

    const mousemove = function(event, d) {
      tooltip
        .style("left",(event.x + 10)+"px")
        .style("position", "absolute")
        .style("top",(event.y)+"px")
    }

    const mouseleave = function(event, d) {
      tooltip
        .style("opacity", 0)
    }

    svg.append("g")
      .selectAll("g")
      .data(stackedData)
      .join("g")
      .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", d => x(d.data.year))
      .attr("y", d => y(d[1]))
      .attr("height", d => height - y(0))
      .attr("width",x.bandwidth())
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)

    svg.selectAll("rect")
      .transition()
      .duration(200)
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .delay((d,i) => i*10)


    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(0, 320)');


    // legend
    legend.selectAll('rect')
      .data(city)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => (i * 18))
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', (d, i) => color(i));

    legend.selectAll('text')
      .data(city)
      .enter()
      .append('text')
      .text((d) => d)
      .attr('x', 18)
      .attr('y', (d, i) => (i * 18))
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'hanging');
  }, [])

    return (
      <div ref={ref} />
  );
};
