/**
 * Réorganise les données afin de combiner les résultats pour une même ligne.
 *
 *                  [
 *                    {
 *                      ligne: string,           // La couleur (le nom) de la ligne
 *                      count: number,           // Nombre total d'incidents incluant un enclenchement du frein d'urgence.
 *                      stoptime: number         // Temps total d'arrêt de service dû à un incident incluant un enclenchement du frein d'urgence'.
 *                    }
 *                  ]
 */
function createSources(data) {
  // Retourner l'objet selon le format énoncé ci-haut.
  
    // on recupère la liste des couleurs des lignes
    var line_set = d3.set(data.map(row => row.line)).values();

    // pour chaque ligne, on réalise le traitement
    return line_set.map(id => {
        return {
            ligne: data.find(row => row.line ===id).line,
            // on compte le nombre d'incidents à la station
            count: d3.sum(data.filter(row=>row.line ===id).map(d => d.incidents.length)),
            // on filtre les résultats qui correspond uniquement à la circonscription
            stoptime: d3.sum(data.filter(row=>row.line ===id).map(d => d.total_stop_time)),

            // on classe en fonction du nombre d'arrêt de services
            };
        })
}

function createAxes(g, data, height, width) {
  // Dessiner les axes X et Y du graphique. Assurez-vous d'indiquer un titre pour l'axe Y.
    // ajout du l'axe X
    var x = d3.scaleBand().range([0, width]).round(0.05)
                 .domain(data.map(d => d.ligne));

    var y = d3.scaleLinear().range([height, 0])
                 .domain([0, d3.max(data.map(d => d.count))]);

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);

    g.append("g")

        .attr("transform", `translate(0,${height - 1})`)
        .call(xAxis)
    .selectAll("text")
        .attr("y", 20)
        .attr("transform", "rotate(30)")
        .style("text-anchor", "start");

    // ajout de l'axe Y
    //g.append("g")
    //   .attr("transform", `translate(0,0)`)
    //   .call(yAxis);
      


}


/**
 * Crée le graphique à bandes.
 *
 * g             Le groupe SVG dans lequel le graphique à bandes doit être dessiné.
 * 
 * data          Les données à utiliser.
 * x             L'échelle pour l'axe X.
 * y             L'échelle pour l'axe Y.
 * tip           L'infobulle à afficher lorsqu'une barre est survolée.
 * height        La hauteur du graphique.
 * width         La largeur du graphique
 */

function create_bar_count(g, sources, data, tip, height, width) {
    var x = d3.scaleBand().range([0, width]).round(0.05)
                 .domain(sources.map(d => d.ligne));

    var y = d3.scaleLinear().range([height, 0])
                 .domain([0, d3.max(sources.map(d => d.count))]);
  
    var sclBand  = d3.scaleBand()
      .domain(x.domain())
      .range(x.range())
      .paddingInner(0.05)
      .paddingOuter(0.05);
  
    g.selectAll("rect")
      .data(sources)
      .enter()
      .append("rect")
      .attr("x", d => x(d.ligne) + sclBand.step() * 0.05)
      .attr("y", d => y(d.count))
      .attr("width", sclBand.bandwidth())
      .attr("height", d => height-y(d.count))
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);   
      
    g.selectAll(".text")        
      .data(sources)
      .enter()
      .append("text")
      .attr("class","label")
      .attr("x", d => 0.48*sclBand.bandwidth() + x(d.ligne))
      .attr("y", d => y(d.count)-20)
      .attr("dy", ".75em")
      .text(d => d.count); 

}



function getToolTipText(d, data) {
    // Retourner le texte à afficher dans l'infobulle selon le format demandé.
    // Assurez-vous d'utiliser la fonction "formatPercent" pour formater le pourcentage correctement.

    
  
      var total = data.map(d=>d.count);
      //var percent = d.count/total;
      return "<span>"+ "test: " +  total + ")</span>";
  
}
  
function showPanel(panel, stationId, data) {
    var station = data.find(d => stationId === d.id);
    panel.style("display", "block");

    panel.select("#station-name")
        .text(`${station.name} (ligne ${frenchLine(station.line)})`);
    panel.select("#nb-incidents")
        .text(`Incidents sur l'année 2019: ${station.incidents.length}`);
    panel.select("#tps-moy-arret")
        .text(`temps moyen d'un incident sur l'année 2019: ${parseInt(station.total_stop_time / station.incidents.length)} minutes`);
    panel.select("#tps-tot-arret")
        .text(`temps total d'arret sur l'année 2019: ${parseInt(station.total_stop_time)} minutes`);
}
  