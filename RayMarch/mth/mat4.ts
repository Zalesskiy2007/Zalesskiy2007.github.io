import {_vec3} from './vec4';

export function D2R(a: number): number {
    return a * (Math.PI / 180.0);
}

export function R2D(a: number): number {
  return a * (180.0 / Math.PI);
}
  
export class _mat4{
    m: any;

    constructor(){
        this.m = 
        [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }

    rotateY(angleDeg: number) {
        const si = Math.sin(D2R(angleDeg));
        const co = Math.cos(D2R(angleDeg));
        this.m = [
            [co, 0, -si, 0],
            [0, 1, 0, 0],
            [si, 0, co, 0],
            [0, 0, 0, 1],
        ];       
        
        return this;
    }

    rotateX(angleDeg: number) {
      const si = Math.sin(D2R(angleDeg));
      const co = Math.cos(D2R(angleDeg));
      this.m = [
          [1, 0, 0, 0],
          [0, co, si, 0],
          [0, -si, co, 0],
          [0, 0, 0, 1],
      ];       
      
      return this;
    }

    rotateZ(angleDeg: number) {
      const si = Math.sin(D2R(angleDeg));
      const co = Math.cos(D2R(angleDeg));
      this.m = [
          [co, si, 0, 0],
          [-si, co, 0, 0],
          [0, 0, 1, 0],
          [0, 0, 0, 1],
      ];       
      
      return this;
    }

    translate(t: _vec3) {
      this.m = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [t.x, t.y, t.z, 1]
      ];

      return this;
    }

    transformPoint(V: _vec3) {
      return new _vec3(V.x * this.m[0][0] + V.y * this.m[1][0] + V.z * this.m[2][0] + this.m[3][0],
                       V.x * this.m[0][1] + V.y * this.m[1][1] + V.z * this.m[2][1] + this.m[3][1],
                       V.x * this.m[0][2] + V.y * this.m[1][2] + V.z * this.m[2][2] + this.m[3][2],    
       );
    }


    mul(m: number[][]): _mat4 {
        let matr = m;
    
        this.m = [
          [
            this.m[0][0] * matr[0][0] +
              this.m[0][1] * matr[1][0] +
              this.m[0][2] * matr[2][0] +
              this.m[0][3] * matr[3][0],
            this.m[0][0] * matr[0][1] +
              this.m[0][1] * matr[1][1] +
              this.m[0][2] * matr[2][1] +
              this.m[0][3] * matr[3][1],
            this.m[0][0] * matr[0][2] +
              this.m[0][1] * matr[1][2] +
              this.m[0][2] * matr[2][2] +
              this.m[0][3] * matr[3][2],
            this.m[0][0] * matr[0][3] +
              this.m[0][1] * matr[1][3] +
              this.m[0][2] * matr[2][3] +
              this.m[0][3] * matr[3][3],
          ],
          [
            this.m[1][0] * matr[0][0] +
              this.m[1][1] * matr[1][0] +
              this.m[1][2] * matr[2][0] +
              this.m[1][3] * matr[3][0],
            this.m[1][0] * matr[0][1] +
              this.m[1][1] * matr[1][1] +
              this.m[1][2] * matr[2][1] +
              this.m[1][3] * matr[3][1],
            this.m[1][0] * matr[0][2] +
              this.m[1][1] * matr[1][2] +
              this.m[1][2] * matr[2][2] +
              this.m[1][3] * matr[3][2],
            this.m[1][0] * matr[0][3] +
              this.m[1][1] * matr[1][3] +
              this.m[1][2] * matr[2][3] +
              this.m[1][3] * matr[3][3],
          ],
          [
            this.m[2][0] * matr[0][0] +
              this.m[2][1] * matr[1][0] +
              this.m[2][2] * matr[2][0] +
              this.m[2][3] * matr[3][0],
            this.m[2][0] * matr[0][1] +
              this.m[2][1] * matr[1][1] +
              this.m[2][2] * matr[2][1] +
              this.m[2][3] * matr[3][1],
            this.m[2][0] * matr[0][2] +
              this.m[2][1] * matr[1][2] +
              this.m[2][2] * matr[2][2] +
              this.m[2][3] * matr[3][2],
            this.m[2][0] * matr[0][3] +
              this.m[2][1] * matr[1][3] +
              this.m[2][2] * matr[2][3] +
              this.m[2][3] * matr[3][3],
          ],
          [
            this.m[3][0] * matr[0][0] +
              this.m[3][1] * matr[1][0] +
              this.m[3][2] * matr[2][0] +
              this.m[3][3] * matr[3][0],
            this.m[3][0] * matr[0][1] +
              this.m[3][1] * matr[1][1] +
              this.m[3][2] * matr[2][1] +
              this.m[3][3] * matr[3][1],
            this.m[3][0] * matr[0][2] +
              this.m[3][1] * matr[1][2] +
              this.m[3][2] * matr[2][2] +
              this.m[3][3] * matr[3][2],
            this.m[3][0] * matr[0][3] +
              this.m[3][1] * matr[1][3] +
              this.m[3][2] * matr[2][3] +
              this.m[3][3] * matr[3][3],
          ],
        ];
        return this;
    }
}