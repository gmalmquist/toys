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

  mul(v) {
    return new Vec(...this.store.map((x, i) => x * v.store[i]));
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

  v() {
    vertex(this.x, this.y, this.z);
  }
}

Vec.X = new Vec(1, 0, 0);
Vec.Y = new Vec(0, 1, 0);
Vec.Z = new Vec(0, 0, 1);

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


class Sca {
}

Sca.lerp = function(a, b, s) {
  return (1.0-s) * a + s * b;
};