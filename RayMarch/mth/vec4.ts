export class _vec3 {
    x: number;
    y: number;
    z: number;

    constructor(a: number, b: number, c: number) {
        this.x = a;
        this.y = b;
        this.z = c;        
    }

    // Add two vectors function
    add(vec: _vec3): _vec3 {
        return new _vec3(
            this.x + vec.x,
            this.y + vec.y,
            this.z + vec.z,            
        );
    }
    // Subtract two vectors function
    sub(vec: _vec3): _vec3 {
        return new _vec3(
            this.x - vec.x,
            this.y - vec.y,
            this.z - vec.z,            
        );
    }
    // Multiply function
    mul(v: _vec3 | number): _vec3 {
        if (typeof v == "number")
            return new _vec3(this.x * v, this.y * v, this.z * v);
        return new _vec3(this.x * v.x, this.y * v.y, this.z * v.z);
    }

    div(d: number): _vec3 {
        let v = 1.0 / d;        
        return new _vec3(this.x * v, this.y * v, this.z * v);        
    }

    // Two vectors dot product function
    dot(vec: _vec3): number {
        return (
            this.x * vec.x + this.y * vec.y + this.z * vec.z
        );
    }

    cross(V: _vec3) {
        return new _vec3(this.y * V.z - this.z * V.y,
            -(this.x * V.z - this.z * V.x),
            this.x * V.y - this.y * V.x);
    }

    normalize() {
        let len = this.dot(this);

        if (len == 1 || len == 0) return this;
        return this.mul(1.0 / Math.sqrt(len));
    }

    getLength() {
        let len = Math.sqrt(this.dot(this));

        return len;
    }

}