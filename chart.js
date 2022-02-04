import * as d3 from "d3";

// 스캐터 플롯은 높이와 너비가 같음.
const dimensions = {
  width: d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]),
  height: d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]),
  margin: {
    top: 10,
    right: 10,
    bottom: 50,
    left: 60
  },
  get boundedWidth() {
    return this.width - this.margin.left - this.margin.right;
  },
  get boundedHeight() {
    return this.height - this.margin.top - this.margin.bottom;
  }
};
async function drawScatter() {
  // 1. Access data
  let dataset = await d3.csv("./data/seoul_2021_precipitation_humidity.csv");
  // Some Data Clensing.
  dataset = dataset.filter(
    (d) =>
      !!parseInt(d.precipitation || 0, 10) && !!parseInt(d.humidity || 0, 10)
  );
  console.log(dataset);
  const xAccessor = (d) => Number(d.precipitation || 0);
  const yAccessor = (d) => Number(d.humidity || 0);
  const dateTransformer = (datestring) => {
    const [year, monthPlusOne, date] = datestring.split(".").map(Number);
    return new Date(year, monthPlusOne - 1);
  };
  const colorAccessor = (d) => dateTransformer(d.date);

  // 2. Create chart dimensions

  // 3. Draw canvas
  // attr이냐 style이냐는 취향 문제.
  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .style("width", dimensions.width)
    .style("height", dimensions.height);

  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // Step 4: Create scales
  const xScale = d3
    .scaleLinear()
    // 최소, 최대 범위 값(정의역)을
    .domain(d3.extent(dataset, xAccessor))
    // 선형 매핑(치역 - 그래프 높이)
    .range([0, dimensions.boundedWidth])
    // 정의역~치역을 0의 자리에서 반올림해서 사람들이 보기에 nice 하게..
    // [0.27, 0.97] to [0.2, 1]
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  // Step 5: Draw data
  // very naive way
  // : nesting
  // : dots can be drew multiple time.
  // dataset.forEach((d) => {
  //   bounds
  //     .append("circle")
  //     .attr("cx", xScale(xAccessor(d)))
  //     .attr("cy", yScale(yAccessor(d)))
  //     .attr("r", 5);
  // });

  const colorScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, colorAccessor))
    .range(["hotpink", "black"]);
  const dots = bounds
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(xAccessor(d)))
    .attr("cy", (d) => yScale(yAccessor(d)))
    .attr("r", 4)
    // .attr("fill", "#A50034");
    .attr("fill", (d) => colorScale(colorAccessor(d)));

  // Step 6: Draw peripherals

  // 데이터 값에 비례하여 x축 스케일.
  const xAxisGenerator = d3.axisBottom().scale(xScale);
  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator)
    .style("color", "#6b6b6b")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);
  // x 축에 라벨 - x축 중심 및 약간 아래로
  const xAxisLabel = xAxis
    .append("text")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margin.bottom - 5)
    .attr("fill", "#6b6b6b")
    .style("font-size", "1.2rem")
    .html("Precipitation (mm)");
  // 4개의 틱이지만, 추천이지 실제 4개는 아님.
  // 배열 등 다른 방법으로 틱을 설정할 수도 있음.
  const yAxisGenerator = d3.axisLeft().scale(yScale).ticks(4);

  const yAxis = bounds.append("g").call(yAxisGenerator);

  const yAxisLabel = yAxis
    .append("text")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 20)
    .attr("fill", "#6b6b6b")
    .style("font-size", "1rem")
    .text("Humidity (%)")
    // 원래 각도는 0도가 아니라 180도임. 시계 반대 방향으로 회전.
    .style("transform", "rotate(-90deg)")
    .style("text-anchor", "middle");
}
drawScatter();
