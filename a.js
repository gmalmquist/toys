class Vec {
  constructor(x=0, y=0, z=0) {
    this.store = [x, y, z];
  }

  get x() { return this.store[0]; }
  get y() { return this.store[1]; }
  get z() { return this.store[2]; }

  set x(x) { this.store[0] = x; }
  set y(y) { this.store[1] = y; }
  set z(z) { this.store[2] = z; }

  get ix() { return Math.floor(this.store[0]); }
  get iy() { return Math.floor(this.store[1]); }
  get iz() { return Math.floor(this.store[2]); }

  get d() { return new Vec(...this.store); }

  get norm2() { return this.dot(this); }
  get norm() { return Math.sqrt(this.norm2); }
  
  get normalized() {
    if (this.norm2 < 0.00001) return new Vec(0,0,0);
    return this.scale(1.0 / this.norm);
  }

  scale(s) {
    return new Vec(...this.store.map(v => v*s));
  }

  add(v) {
    let c = this.d;
    v.store.forEach((value, index) => c.store[index] += value);
    return c;
  }

  sub(v) {
    return v.scale(-1).add(this);
  }

  r90() {
    return new Vec(-this.y, this.x, this.z);
  }

  dot(v) {
    return this.store.map((x, i) => x*v.store[i]).reduce((a,b) => a+b);
  }

  toString() {
    return `<${this.store.map(x => x.toString()).join(', ')}>`;
  }
}

Vec.scalarLerp = function(a, b, s) {
  return (1.0-s) * a + s * b;
}

Vec.lerp = function(a, b, s) {
  return a.scale(1.0-s).add(b.scale(s));
}

Vec.B1 = function(a, b, s) {
  return Vec.lerp(a, b, s);
}

Vec.B2 = function(a, b, c, s) {
  return Vec.B1(Vec.B1(a, b, s), Vec.B1(b, c, s), s);
}

function V(x=0, y=0, z=0) { return new Vec(x, y, z); }

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
      let sink = Vec.scalarLerp(1, 15, f);
      let M = Vec.lerp(A, B, 0.5).add(B.sub(A).r90().normalized.scale(sink));
      let count = Math.round(Vec.scalarLerp(1, 15, f));
      for (let j = 0; j < count; j++) {
        let s = (j+1.0)/(count+1.0);
        if (i%2 == 0) s = 1-s;
        this.inner_nodes.push(Vec.B2(A, M, B, s));
      }
    }
  }

  draw() {
    noStroke();

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
      let r = Vec.scalarLerp(2, 5, (index / this.flakes.length));
      ellipse(p.ix, p.iy, r, r);
    });

    this.flakes = this.flakes.map((p, index) => {
      p = p.add(V(0, 10 * this.delta));
      if (p.y > this.height + 10) {
        p = V(random(width), -10);
      }
      return p;
    });
  }
}

let tree = new XmasTree();
let snow = null;

function setup() {
  createCanvas(640, 480);
  snow = new Snow(width, height);
}

function draw() {
  background(0);

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



