/* ---------- A1: a queue absorbs a burst (the shape to copy) ----------
   Figure files are plain statements inside one shared IIFE that helpers.js opens.
   Always guard on the host element: a page may not be in this build.           */
(function(){
  var host = $("qFig"); if(!host) return;
  var burst = 6, rate = 1, TICKS = 6;

  function sim(){                                    // the model, separate from the drawing
    var q = 0, peak = 0, rows = [];
    for (var t = 0; t < TICKS; t++){
      var arrive = (t === 0) ? burst : (t === 3 ? 1 : 0);
      q += arrive;
      var done = Math.min(rate, q);
      q -= done;
      peak = Math.max(peak, q);
      rows.push({t:t, arrive:arrive, done:done, q:q});
    }
    return {rows:rows, peak:peak};
  }

  function draw(){
    var r = sim();
    var s = svgRoot(host, 980, 390, "A burst of six requests fills a queue that drains at a steady rate");
    var ar = arrowDef(s, aid(), "var(--ink)");
    var x0 = 150, y0 = 86, colW = 128, slot = 26, gut = 134;   // gut = right edge of the label gutter

    st(1);                                            // everything created now belongs to step 1
    T(s, gut, y0 - 30, "arriving", {size:11, anchor:"end", fill:"var(--ink3)"});
    r.rows.forEach(function(row, i){
      var x = x0 + i * colW;
      T(s, x + 34, y0 - 14, "tick " + row.t, {size:11, anchor:"middle", fill:"var(--ink3)"});
      for (var k = 0; k < row.arrive; k++)
        R(s, x + 8 + k * 9, y0 - 40, 7, 16, "var(--wire)", {rx:2});
    });

    st(2);                                            // the queue itself
    T(s, gut, y0 + 70, "waiting", {size:11, anchor:"end", fill:"var(--ink3)"});
    r.rows.forEach(function(row, i){
      var x = x0 + i * colW;
      R(s, x, y0, 68, 5 * slot + 8, "var(--wash)", {rx:12, stroke:"var(--hair)"});
      for (var k = 0; k < Math.min(row.q, 5); k++){
        var cell = R(s, x + 10, y0 + 5 * slot - 18 - k * slot, 48, 20, "var(--move)", {rx:6});
        hover(cell, "tick " + row.t + ": " + row.q + " waiting");
      }
      if (row.q > 5) T(s, x + 34, y0 - 2 + 4, "+" + (row.q - 5), {size:11, anchor:"middle"});
      T(s, x + 34, y0 + 5 * slot + 26, String(row.q), {size:13, anchor:"middle", weight:700});
    });

    st(3);                                            // the worker, draining at its own rate
    T(s, gut, y0 + 243, "done this tick", {size:11, anchor:"end", fill:"var(--ink3)"});
    r.rows.forEach(function(row, i){
      var x = x0 + i * colW;
      for (var k = 0; k < row.done; k++)
        R(s, x + 10 + k * 26, y0 + 232, 22, 14, "var(--good)", {rx:4});
      L(s, x + 34, y0 + 5 * slot + 36, x + 34, y0 + 228, "var(--hair)", {sw:1.5, dash:"3 4", arrow:ar});
    });

    st(4);                                            // the point of the page
    var px = x0 + (r.rows.findIndex(function(o){ return o.q === r.peak; })) * colW;
    L(s, px + 34, y0 - 4, px + 34, y0 + 6, "var(--bad)", {sw:2});
    R(s, px - 26, y0 + 268, 190, 30, "var(--bad-soft)", {rx:10});
    T(s, px - 14, y0 + 288, "peak " + r.peak + " = burst " + burst + " − rate " + rate, {size:13});

    $("qRead").textContent = burst + " in one tick, " + rate + " done per tick → peak " + r.peak;
    $("qPeak").textContent = r.peak;
  }

  $("qBurst").oninput = function(){ burst = +this.value; draw(); };
  seg("qRate", function(d){ rate = +d.v; draw(); });   // seg() calls back once on load, which draws
})();
