multiLevelCircleChart = function(bandList, bandNivel) {
  const width      = 500;
  const height     = 500;
  const bandLength = bandList.length;
  const bandSize   = 100 / bandLength;
  const maxRadius  = width / 2;
  const color      = d3.scaleOrdinal(d3.schemeCategory20);
  const score      = [];
  const rtn        = {};
  let svg = d3.select('body').append('svg')
      .attr('id', 'multipleCircleChart')
      .attr('width', 800)
      .attr('height', 800)
      .append('g')
      .attr('transform', 'translate(' +  380 + ',' + 350 + ')');
  let multilevelChart = [];
  let svgUri;

  // PRODUZ O ARRAY QUE CONTEM TODOS OS NIVEIS DO GRAFICO
  // (cada item do array eh um arco completo)
  this.setMultilevelChart = function(list) {
    for (let i = 0; i < bandNivel; i++) {
      const layer = [];
      let id = 0;
      list.forEach(label => {
        layer.push({id, label});
        id++;
      });
      multilevelChart.push(layer);
    }
  };
  this.setMultilevelChart(bandList);
  const pieWidth  = parseInt(maxRadius / multilevelChart.length) - multilevelChart.length;

  const scorePush = newScore => {
    let foundScoredItem = -1;

    score.filter((x, i) => {
      if(x.id === newScore.id) foundScoredItem = i;
    });

    if(foundScoredItem > -1) {
      let teste = score.splice(foundScoredItem, 1);
      console.log(teste);
    }

    score.push(newScore);

    this.enablePrint();
  };
  // CONSTROI UM NIVEL(ARCO/DONUT CHART) DO GRAFICO
  this.drawChart = function(_data, index) {
    this.pie = d3.pie()
          .sort(null)
          .value(() => bandSize);

    let arc = d3.arc()
          .outerRadius((index + 1) * pieWidth - 1)
          .innerRadius(index * pieWidth);

    this.g = svg.selectAll('.arc' + index)
          .data(this.pie(_data))
          .enter().append('g')
          .attr('class', 'arc' + index)
          .attr('id', d => 'band' + d.data.id)
          .on('click', function(d) {
            const idObject = $(this).attr('id');
            const bandItems = d3.selectAll('#' + idObject)._groups[0];
            // const indexName = d.data.id
            bandItems.forEach((item, i) => {
              if(i <= index) {
                d3.select(item)
                    .select('path')
                    .transition().duration(500)
                    .style('fill', j => d3.rgb(color(j.data.id)).brighter(0.5));
              }else{
                d3.select(item)
                    .select('path')
                    .transition().duration(500)
                    .style('fill', j => d3.rgb(color(j.data.id)).darker(1.5));
              }
            });
            setTimeout(() => scorePush({id: d.data.id, value: index + 1})
              , 550);
          });

    this.g.append('path').attr('d', arc).style('fill', d => color(d.data.id));

    this.g.append('text').attr('transform', d => 'translate(' + arc.centroid(d) + ')')
      .attr('dy', '.35em').style('text-anchor', 'middle')
      .text(() => index + 1);
  };

  this.drawTextChart = function(posY, posX, titles, index) {
    let labelArc = d3.arc()
              .outerRadius(maxRadius + 100)
              .innerRadius(maxRadius);

    const g = svg.selectAll('.arcLabel' + index)
          .data(this.pie(titles))
          .enter().append('g')
          .attr('class', 'arcLabel' + index);

    g.append('text')
        .attr('transform', d => 'translate(' + labelArc.centroid(d) + ')')
        .attr('dy', posY + 'em')
        .attr('dx', '-3em')
        .text(d => d.data);
  };


  this.addTextLabel = function() {
    const arBandList    = [];
    const arMultiLineTexts = [];
    const multiLineTexts = function(item, index) {
      if(!arMultiLineTexts[index]) arMultiLineTexts[index] = [];

      arMultiLineTexts[index].push(item);
    };
    let paddingLine;
    // PROCURA POR QUEBRA DE LINHA
    bandList.map(x => arBandList.push(x.split('\n')));
    // AGRUPA AS LINHAS POR SUA ORDEM, EX:
    // array[0] = TODAS AS PRIMEIRAS LINHAS
    arBandList.map(x => x.map((i, j) => multiLineTexts(i, j)));

    rtn.arBandList = arBandList;
    rtn.arMultiLineTexts = arMultiLineTexts;

    arMultiLineTexts.forEach((i, j, k) => {
      if(k.length < 2) {
        paddingLine = 0;
      } else if (k.length < 3) {
        paddingLine = j;
      } else {
        paddingLine = j - 1;
      }
      // console.log(j,k);
      this.drawTextChart(paddingLine, maxRadius, i, j);
    });
  };

  const chartToURI = () => {
    console.log('print chart');
    const svgChart = document.getElementById('multipleCircleChart');

    // SERIALIZA O GRAFICO
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgChart);

    // ADICIONA NAMESPACE
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // DECLARACAO XML
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    // CONVERTE SVG EM URI
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);

    // ADICIONA A URI AO BOTAO DE DOWLOAD
    
    // A IMAGEM PODE SER BAIXADA COM O BOTAO ESQUERDO DO MOUSE
  };

  this.enablePrint = function() {
    if(score.length === bandLength) {
      rtn.svgUri = chartToURI();
      TESTE = chartToURI();
      console.log('enablePrint', score);
      document.getElementById('downloadLink').href = rtn.svgUri;
      this.svgImage();
    }
  };

  this.svgImage = function() {
    console.log('svg image');
    const image = new Image();
    image.src = rtn.svgUri;
    document.body.appendChild(image);
    console.log('image', image);
  };

  rtn.create = () => {
    for(let i = 0; i < multilevelChart.length; i++) {
      const _cData = multilevelChart[i];
      this.drawChart(_cData, i);
    }

    this.addTextLabel();

    // for(let i = 0; i < bandLength; i++) {

    // }
  };

  rtn.remove = () => {
    $('g').remove();

    multilevelChart = [];
  };

  // rtn.printChart = this.enablePrint;

  // rtn.svgUri = this.svgUri;

  rtn.bandList = bandList;
  rtn.bandLength = bandLength;
  rtn.score = score;

  return rtn;
};
