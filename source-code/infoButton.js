d3.button = function() {

  var dispatch = d3.dispatch('press', 'release');

  var padding = 10,
      r = 10,
      sd = 5,
      offsetX = 2,
      offsetY = 4;

  function my(selection) {
    selection.each(function(d, i) {
      var g = d3.select(this)
          .attr('id', 'd3-button' + i)
          .attr('transform', 'translate(' + d.x + ',' + d.y + ')');

      var text = g.append('text').text(d.label);
      var defs = g.append('defs');
      var bBox = text.node().getBBox();
      var rect = g.insert('rect', 'text')
          .attr("x", bBox.x - padding)
          .attr("y", bBox.y - padding)
          .attr("width", bBox.width + 2 * padding)
          .attr("height", bBox.height + 2 * padding)
          .attr('rx', r)
          .attr('ry', r)
          .on('mouseover', trigger)
          .on('mouseout', triggerOff)
          .on('click', toggle)

       addShade.call(g.node(), d, i);
       addGrad.call(g.node(), d, i);
    });
  }

  function addGrad(d, i) {
    var defs = d3.select(this).select('defs');
    var gradient = defs.append('linearGradient')
        .attr('id', 'gradient' + i)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

    gradient.append('stop')
        .attr('id', 'gradient-start')
        .attr('offset', '0%')

    gradient.append('stop')
        .attr('id', 'gradient-stop')
        .attr('offset', '100%')

    d3.select(this).select('rect').attr('fill', 'url(#gradient' + i + ")" );
  }

  function addShade(d, i) {
    var defs = d3.select(this).select('defs');
    var rect = d3.select(this).select('rect').attr('filter', 'url(#dropShadow' + i + ")" );
    var shadow = defs.append('filter')
        .attr('id', 'dropShadow' + i)
        .attr('x', rect.attr('x'))
        .attr('y', rect.attr('y'))
        .attr('width', rect.attr('width') + offsetX)
        .attr('height', rect.attr('height') + offsetY)

    shadow.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 2)

    shadow.append('feOffset')
        .attr('dx', offsetX)
        .attr('dy', offsetY);

    var combine = shadow.append('feMerge');

    combine.append('feMergeNode');
    combine.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  function trigger() {
    var gradient = d3.select(this.parentNode).select('linearGradient')
    d3.select(this.parentNode).select("rect").classed('active', true)
    if (!gradient.node()) return;
    gradient.select('#gradient-start').classed('active', true)
    gradient.select('#gradient-stop').classed('active', true)
  }

  function triggerOff() {
    var gradient = d3.select(this.parentNode).select('linearGradient')
    d3.select(this.parentNode).select("rect").classed('active', false)
    if (!gradient.node()) return;
    gradient.select('#gradient-start').classed('active', false);
    gradient.select('#gradient-stop').classed('active', false);
  }

  function toggle(d, i) {
    if (d3.select(this).classed('pressed')) {
        release.call(this, d, i);
        triggerOff.call(this, d, i);
    } else {
        press.call(this, d, i);
        trigger.call(this, d, i);
    }
  }

  function press(d, i) {
    dispatch.call('press', this, d, i)
    d3.select(this).classed('pressed', true);
    var shadow = d3.select(this.parentNode).select('filter')
    if (!shadow.node()) return;
    shadow.select('feOffset').attr('dx', 0).attr('dy', 0);
    shadow.select('feGaussianBlur').attr('stdDeviation', 0);
    my.clear.call(this, d, i);
  }

  function release(d, i) {
    dispatch.call('release', this, d, i)
    my.clear.call(this, d, i);
  }

  my.clear = function(d, i) {
    d3.select(this).classed('pressed', false);
    var shadow = d3.select(this.parentNode).select('filter')
    if (!shadow.node()) return;
    shadow.select('feOffset').attr('dx', offsetX).attr('dy', offsetY);
    shadow.select('feGaussianBlur').attr('stdDeviation', sd);
  }

  my.on = function() {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}