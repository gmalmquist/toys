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

  fill('white');
  noStroke();
  tree.border_nodes.forEach(p => ellipse(p.ix, p.iy, 5, 5));

  fill('yellow');
  noStroke();
  tree.border_nodes.forEach((p0, index) => {
    if (index >= tree.border_nodes.length-1) return;
    let p1 = tree.border_nodes[index + 1];
    let vT = p1.sub(p0);
    let vN = vT.r90().scale(index%2==0 ? -1 : 1);
    let N = 5;
    let r = 8;
    for (let i = 0; i < N; i++) {
      let q = V()
        .add(vT.scale(cos(-i*PI/N)))
        .add(vN.scale(sin(i*PI/N)))
        .scale(0.5)
        .add(p0);
      ellipse(q.ix, q.iy, 1, 1);
    }
  });
}




