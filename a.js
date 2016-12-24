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

Vec.lerp = function(a, b, s) {
  return a.scale(1.0-s).add(b.scale(s));
}

function V(x=0, y=0, z=0) { return new Vec(x, y, z); }

function setup() {
  createCanvas(640, 480);
}

function draw() {
  background(0);

  let tree = {
    width: 200,
    height: 300,
    border_nodes: [],
    inner_nodes: [],
  };

  let N = 20;
  for (let i = 0; i < N; i++) {
    tree.border_nodes.push(Vec.lerp(
      V(width/2 - tree.width/2, height/2 + tree.height/2),
      V(width/2, height/2 - tree.height/2),
      i/(N - 1.0)
    ));
  }
  for (let i = N-1; i >= 0; i--) {
    let n = tree.border_nodes[i];
    let c = V(width/2, n.y);
    tree.border_nodes.push(n.scale(-1).add(c).add(c));
  }

  noStroke();

  fill('green');
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

  fill('yellow');
  drawTinsel(tree.border_nodes);
}

function drawTinsel(nodes) {
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



