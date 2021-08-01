async function loadAllData() {
    return await d3.csv("./data/Summer-Olympic-medals.csv");
}

function hover(svg, path, click ) {

    if ("ontouchstart" in document) svg
        .style("-webkit-tap-highlight-color", "transparent")
        .on("touchmove", moved)
        .on("touchstart", entered)
        .on("touchend", left)
    else svg
        .on("mousemove", moved)
        .on("mouseenter", entered)
        .on("mouseleave", left)
        .on("click", click);

    const dot = svg.append("g")
        .attr("display", "none");

    dot.append("circle")
        .attr("r", 2.5);

    dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", -20);

    let annotation = svg
        .append("g")
        .attr("class", "annotation-test");

    function moved(event) {
        event.preventDefault();
        const pointer = d3.pointer(event, this);
        const xm = x.invert(pointer[0]);
        const ym = y.invert(pointer[1]);
        let i = d3.bisectCenter(year_dates_arr, xm);
        const s = d3.least(final_array, d => Math.abs(d.values[i] - ym));
        path.style("stroke", function( d, j) {
            return d === s ? colors(j) : "#ddd"
        }).filter(d => d === s).raise();

        dot.attr("transform", `translate(${x(year_dates_arr[i])},${y(s.values[i])})`);

        annotation.attr("transform", `translate(${x(year_dates_arr[i])},${y(s.values[i])})`)
            .call(d3.annotation()
                .type(d3.annotationLabel)
                .annotations([{
                    note: {
                        label: 'medals=' + s.values[i],
                        title: s.name
                    }
                }]))


    }

    function entered(event) {
        path.style("mix-blend-mode", null).attr("stroke", "#ddd");
        svg.selectAll("g.annotation-connector, g.annotation-note")
            .style("display", null)
        dot.attr("display", null);
    }

    function left(event) {
        path.style("mix-blend-mode", "multiply").attr("stroke", null);
        path.style("stroke", function( d, j) {
            return colors(j);
        });
        svg.selectAll("g.annotation-connector, g.annotation-note")
            .style("display", "none")
        dot.attr("display", "none");
    }
}

function getSetValueByIndex(setObj, index) {
    return [...setObj][index]
}

function getUniqueRecordsBkup(records) {
    return records.filter((v,i,a)=>a.findIndex(t=>(t.City === v.City && t.Year===v.Year && t.Sport === v.Sport && t.Discipline===v.Discipline &&
        t.Event === v.Event && t.Gender===v.Gender && t.Country_Code === v.Country_Code && t.Country===v.Country && t.Event_gender === v.Event_gender && t.Medal===v.Medal ))===i)
}

function getUniqueRecords(records) {
    let recordCountByCountry = {};

    records = records.filter((v,i,a)=>a.findIndex(t=>(t.City === v.City && t.Year===v.Year && t.Sport === v.Sport && t.Discipline===v.Discipline &&
        t.Event === v.Event && t.Gender===v.Gender && t.Country_Code === v.Country_Code && t.Country===v.Country && t.Event_gender === v.Event_gender && t.Medal===v.Medal ))===i);

    records.forEach(record => {
        let medals = recordCountByCountry[record.Country];
        medals = medals ? medals : [];
        medals.push(record);
        recordCountByCountry[record.Country] = medals;
    })

    recordCountByCountryArray = [];
    for (const [key, value] of Object.entries(recordCountByCountry)) {
        recordCountByCountryArray.push({ [key] : value});
    }

    recordCountByCountrySorted = recordCountByCountryArray.sort(function (a, b) {
        return Object.entries(b)[0][1].length - Object.entries(a)[0][1].length;
    }).slice(0, 10);

    let topTenCountryRecords = [];
    for (index in recordCountByCountrySorted) {
        topTenCountryRecords.push(...Object.entries(recordCountByCountrySorted[index])[0][1]);
    }

    return topTenCountryRecords;
}

function getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

let colors = d3.scaleLinear().domain([1,5])
    .range(["#007AFF", '#FFF500', '#FCBA03', '#FC2403', '#1CFC03', '#FC035A', '#BF7B6C', '#D39419']);
