console.log("Arrancamos el script");
d3.json("https://gist.githubusercontent.com/double-thinker/817b155fd4fa5fc865f7b32007bd8744/raw/13068b32f82cc690fb352f405c69c156529ca464/partidos2.json").then(function (datosCompletos) {

    var datosPartidos = datosCompletos.partidos;

    var width = 400;
    var height = 600;

    var margen = {
        arriba: 60,
        abajo: 35,
        izquierda: 40,
        derecha: 50
    };

    var escalaY = d3.scaleLinear()
        .domain(d3.extent(datosPartidos, function(d){ return d.votantes; }))
        .range([height - margen.abajo, margen.arriba]);

    var escalaX = d3.scaleLinear()
        .domain([0, 10])
        .range([margen.izquierda, width - margen.derecha]);

    var escalaTamano = d3.scaleLinear()
        .domain(d3.extent(datosPartidos, function(d){ return d.votantes; }))
        .range([5, 50]);

    var escalaColor = d3.scaleLinear()
        .domain(d3.extent(datosPartidos, function(d){ return d.mediaAutoubicacion; }))
        .range(["red", "blue"]);

    var dibujoSVG = d3.select("body")
        .append("svg")
        .attr("id", "miSVG_D3")
        .attr("width", width)
        .attr("height", height);

    dibujoSVG.selectAll("circle")
        .data(datosPartidos)
        .join("circle")
        .attr("r", function(d){ return escalaTamano(d.votantes); })
        .attr("cx", function(d){ return escalaX(d.mediaAutoubicacion); })
        .attr("cy", function(d){ return escalaY(d.votantes); })
        .attr("fill", function(d){ return escalaColor(d.mediaAutoubicacion); })
        .on("click", (event, d) => pintarHistograma(d.partido))
        .on("mouseover", (event, d) => pintarTooltip(event, d))
        .on("mouseout", borrarTooltip);

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    var ejeY = d3.axisLeft(escalaY);
    dibujoSVG.append("g")
        .attr("transform", "translate(" + margen.izquierda + ",0)")
        .call(ejeY);

    var ejeX = d3.axisBottom(escalaX);
    dibujoSVG.append("g")
        .attr("transform", "translate(0," + (height - margen.arriba / 2) + ")")
        .call(ejeX);

    var svgHistograma = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var ejeXHistograma = d3.axisBottom(escalaX)
        .ticks(5)
        .tickFormat(d3.format(".3s"));

    svgHistograma.append("g")
        .attr("transform", "translate(0," + (height - margen.arriba / 2) + ")")
        .call(ejeXHistograma);

    var gEjeYHistograma = svgHistograma.append("g")
        .attr("transform", "translate(" + margen.izquierda + ",0)");

    function pintarHistograma(partidoseleccionado) {
        var datosHistograma = datosCompletos.histogramas[partidoseleccionado];

        var escalaYHistograma = d3.scaleLinear()
            .domain(d3.extent(datosHistograma, d => d.y))
            .range([height - margen.abajo, 0 + margen.arriba]);

        var ejeYHistograma = d3.axisLeft(escalaYHistograma)
            .ticks(5)
            .tickFormat(d3.format(".3s"));

        gEjeYHistograma
            .transition()
            .duration(1500)
            .delay(200)
            .ease(d3.easeBounce)
            .call(ejeYHistograma);

        svgHistograma
            .selectAll("circle")
            .data(datosHistograma)
            .join("circle")
            .transition()
            .duration(1000)
            .ease(d3.easeElastic.period(0.4))
            .attr("r", d => escalaTamano(d.y))
            .attr("cx", d => escalaX(d.x))
            .attr("cy", d => escalaYHistograma(d.y))
            .attr("fill", d => escalaColor(d.x));

        svgHistograma.select(".title-label").remove();

        svgHistograma.append("text")
            .attr("class", "title-label")
            .attr("x", (width / 2))
            .attr("y", height)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text(partidoseleccionado);
    }

    function borrarTooltip() {
        tooltip.style("opacity", 0);
    }

    function pintarTooltip(event, d) {
        tooltip.text(d.partido + ": " + d.mediaAutoubicacion)
            .style("top", (event.clientY + "px"))
            .style("left", (event.clientX + "px"))
            .style("opacity", 1);
    }
});
