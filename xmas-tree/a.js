class XmasTree {
  constructor() {
    this.width = 200;
    this.height = 300;
    this.init();
  }

  init() {
    this.border_nodes = [];
    this.inner_nodes = [];

    let N = 20;

    // left side
    for (let i = 0; i < N; i++) {
      this.border_nodes.push(Vec.lerp(
        V(-this.width/2, this.height/2),
        V(0, -this.height/2),
        i/(N - 1.0)
      ));
    }

    // right side
    for (let i = N-1; i >= 0; i--) {
      let n = this.border_nodes[i];
      let c = V(0, n.y);
      this.border_nodes.push(n.scale(-1).add(c).add(c));
    }

    // middle
    for (let i = 0; i < N-1; i++) {
      let f = 1.0 - i/(N-2.0);
      let A = this.border_nodes[i];
      let B = this.border_nodes[this.border_nodes.length - i - 1];
      let sink = Sca.lerp(1, 15, f);
      let M = Vec.lerp(A, B, 0.5).add(B.sub(A).r90().normalized.scale(sink));
      let count = Math.round(Sca.lerp(1, 15, f));
      for (let j = 0; j < count; j++) {
        let s = (j+1.0)/(count+1.0);
        if (i%2 == 0) s = 1-s;
        this.inner_nodes.push(Vec.B2(A, M, B, s));
      }
    }
  }

  draw() {
    noStroke();

    this.drawTrunk();
    this.drawBackground();
    this.drawOrnaments();

    fill('yellow');
    this.drawTinsel(tree.border_nodes);
    this.drawTinsel(tree.inner_nodes);
  }

  drawBackground() {
    fill('#002200');
    beginShape();
    let BL = V(-this.width/2, this.height/2);
    let BR = V(this.width/2, this.height/2);
    let TC = V(0, -this.height/2);
    vertex(BL.ix, BL.iy);
    let N = 10;
    let BC = Vec.lerp(BL, BR, 0.5)
      .add(BR.sub(BL).r90().normalized.scale(20));
    for (let i = 0; i < N; i++) {
      let p = Vec.B2(BL, BC, BR, (i+1.0)/(N+1.0));
      vertex(p.ix, p.iy);
    }
    vertex(BR.ix, BR.iy);
    vertex(TC.ix, TC.iy);
    endShape(CLOSE);
  }

  drawOrnaments() {
    tree.border_nodes.forEach((p, index, array) => {
      if ((index%2 == 1) == (index < array.length/2)) {
        fill('green');
      } else {
        fill('red');
      }
      if (index == array.length/2) {
        fill('yellow');
      }
      ellipse(p.ix, p.iy, 5, 5);
    });

    tree.inner_nodes.forEach((p, index) => {
      if (index%3 == 0) {
        fill('red');
        if (index % 2 == 0) {
          fill('magenta');
        }
      } else {
        fill('lightgreen');
        if (index % 5 == 0) {
          fill('yellow');
        }
      }
      ellipse(p.ix, p.iy, 5, 5);
    });
  }

  drawTrunk() {
    fill('#662200');
    beginShape();
    let w = this.width;
    let h = this.height;
    V(-w*0.25, h/2 + 20).v();
    V(+w*0.25, h/2 + 20).v();
    V(+w*0.20, h/2).v();
    V(-w*0.20, h/2).v();
    endShape(CLOSE);
  }

  drawTinsel(nodes) {
    nodes.forEach((p0, index, array) => {
      let p1 = array[index + 1];
      if (index >= array.length - 1) {
        // For the last node, pretend the line just keeps going.
        p1 = array[index];
        p0 = array[index-1];
        let diff = p1.sub(p0);
        p0 = p1;
        p1 = p0.add(diff);
      }
      let parity = index%2==0 ? -1 : 1;
      if (index > array.length/2) {
        parity = -parity;
      }
      let vT = p1.sub(p0);
      let vN = vT.r90().scale(parity);
      let N = 5;
      let r = 8;
      let domain = PI;

      if (index >= array.length/2-2 && index <= array.length/2+1) {
        domain *= 2;
        N *= 2;
      }

      let offset = millis() / 1000.0;
      offset = sin(offset) * 0.1;

      for (let i = 0; i < N; i++) {
        let q = V()
          .add(vT.scale(cos(-i*domain/N + offset)))
          .add(vN.scale(sin(i*domain/N + offset)))
          .scale(0.5)
          .add(p0);
        ellipse(q.ix, q.iy, 1, 1);
      }
    });
  }
}

class Snow {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.lastTime = millis();

    this.flakes = [];
    for (let i = 0; i < 50; i++) {
      this.flakes.push(V(random(width), random(height)));
    }
  }

  draw() {
    this.now = millis();
    this.delta = (this.now - this.lastTime)/1000.0;
    this.lastTime = this.now;

    this.flakes.forEach((p, index) => {
      noStroke();
      fill('#0088FF');
      let r = Sca.lerp(2, 5, (index / this.flakes.length));
      this.drawFlake(p, r, index);
    });

    this.flakes = this.flakes.map((p, index) => {
      p = p.add(V(0, 10 * this.delta));
      if (p.y > this.height + 10) {
        p = V(random(width), p.y - this.height - 30);
      }
      return p;
    });
  }

  drawFlake(p, size, index) {
    ellipse(p.x, p.y, size, size);
    let spokes = round(Sca.lerp(3, 7, index/this.flakes.length));
    let spin = sin(2*PI*40*index/this.flakes.length) * 0.5;
    for (let i = 0; i < spokes; i++) {
      let a = 2*PI*(i/spokes + spin*millis()/1000.0);
      let q = p.add(V(cos(a), sin(a)).scale(size*1.5));
      stroke('#0088FF');
      line(p.x, p.y, q.x, q.y);

      let I = q.sub(p);
      let J = I.r90();

      let m0 = Vec.lerp(p, q, 0.6);
      let m1 = m0
        .add(J.scale(0.5))
        .add(I.scale(0.5 + 0.5*sin(PI*2*8*index/this.flakes.length)));

      line(m0.x, m0.y, m1.x, m1.y);

      let m2 = m1.sub(J);
      line(m0.x, m0.y, m2.x, m2.y);
    }
  }
}

class Stars {
  constructor(width, height) {
    this.stars = [];

    let N = 100;
    for (let i = 0; i < N; i++) {
      this.stars.push({
        pt: V(random(width), random(height)),
        size: random(2, 8),
        pulseRate: 4*PI*random(100)/100.0
      });
    }
  }

  draw() {
    noStroke();
    this.stars.forEach((star, index, array) => {
      let pulse = Sca.lerp(0.25, 0.8, sin(2*PI*index/array.length + star.pulseRate*millis()/1000.0)/2+0.5);
      fill(`rgba(255, 255, 0, ${pulse})`);
      beginShape();
      star.pt.sub(Vec.X.scale(star.size)).v();
      star.pt.sub(Vec.X.scale(star.size/3)).sub(Vec.Y.scale(star.size/3)).v();
      star.pt.sub(Vec.Y.scale(star.size)).v();
      star.pt.add(Vec.X.scale(star.size/3)).sub(Vec.Y.scale(star.size/3)).v();
      star.pt.add(Vec.X.scale(star.size)).v();
      star.pt.add(Vec.X.scale(star.size/3)).add(Vec.Y.scale(star.size/3)).v();
      star.pt.add(Vec.Y.scale(star.size)).v();
      star.pt.sub(Vec.X.scale(star.size/3)).add(Vec.Y.scale(star.size/3)).v();
      endShape(CLOSE);
      fill('white');
      ellipse(star.pt.x, star.pt.y, star.size/2., star.size/2.);
    });
  }
}

let tree = new XmasTree();
let snow = null;
let stars = null;

function setup() {
  createCanvas(640, 480);
  snow = new Snow(width, height);
  stars = new Stars(width, height/2);
}

function draw() {
  background(0);

  stars.draw();
  snowDrifts();

  push();
  translate(width/2, height/2);
  tree.draw();
  pop();

  snow.draw(width, height);
}

function snowDrifts() {
  let N = 10;
  let R = 200;
  let A = V(0, height);
  let B = V(width, height);
  fill('white');
  noStroke();
  for (let i = 0; i < N; i++) {
    let s = i/(N-1.0);
    let r = abs(sin(s*PI*3.5))*50 + R;
    let pt = Vec.lerp(A, B, s);
    ellipse(pt.ix, pt.iy, r, r);
  }
}



