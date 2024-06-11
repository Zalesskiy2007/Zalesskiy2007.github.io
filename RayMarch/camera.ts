import {_vec3} from './mth/vec4';
import {_mat4, R2D, D2R} from './mth/mat4';

export class _cam {
  rot: _vec3;
  pos: _vec3;
  input: any;
  color1: _vec3;
  color2: _vec3;
  
  constructor() {
    this.rot = new _vec3(0, 0, 0);
    this.pos = new _vec3(0, 0, -5);
    this.input = [];
    this.input["ArrowDown"] = false;
    this.input["ArrowUp"] = false;
    this.input["ArrowLeft"] = false;
    this.input["ArrowRight"] = false;
    this.input["KeyW"] = false;
    this.input["KeyA"] = false;
    this.input["KeyS"] = false;
    this.input["KeyD"] = false;

    this.color1 = new _vec3(255, 0, 255);
    this.color2 = new _vec3(255, 0, 255);
  }

  colorResponse(){
    let s1 = document.getElementById("ColorPicker1") as HTMLInputElement;
    let s2 = document.getElementById("ColorPicker2") as HTMLInputElement;

    let str1: string | null = "#ffffff", str2: string | null = "#ffffff";
      
    if (s2 != null)
        str2 = s2.value;
    if (s1 != null)
        str1 = s1.value;

    this.color1 = new _vec3(parseInt("0x" + str1[1] + str1[2]), parseInt("0x" + str1[3] + str1[4]), parseInt("0x" + str1[5] + str1[6])).div(255.0);
    this.color2 = new _vec3(parseInt("0x" + str2[1] + str2[2]), parseInt("0x" + str2[3] + str2[4]), parseInt("0x" + str2[5] + str2[6])).div(255.0);
  }

  inputResponse(dt : number) {
    if (this.input['ArrowUp'])
        this.rot.x += 200 * dt;
    if (this.input['ArrowDown'])
        this.rot.x -= 200 * dt;
    if (this.input['ArrowLeft'])
        this.rot.y += 200 * dt;
    if (this.input['ArrowRight'])
        this.rot.y -= 200 * dt;

    if (this.input['KeyW'])
        this.pos.z += 10 * dt;
    if (this.input['KeyS'])
        this.pos.z -= 10 * dt;
    if (this.input['KeyA'])
        this.pos.x -= 10 * dt;
    if (this.input['KeyD'])
        this.pos.x += 10 * dt;
  }

}

export class _camera{
    Loc: _vec3;
    At: _vec3;
    Right: _vec3;
    Up: _vec3;
    Dir: _vec3;

    constructor() {
        this.Loc = new _vec3(0, 0, -5);
        this.At = new _vec3(0, 0, 0);
        this.Right = new _vec3(1, 0, 0);
        this.Up = new _vec3(0, 1, 0);
        this.Dir = new _vec3(0, 0, 1);
    }

    camSet(newLoc: _vec3, newAt: _vec3, newUp: _vec3): void {
        this.Loc = newLoc;
        this.At = newAt;

        this.Dir = (this.At.sub(this.Loc)).normalize(),
        this.Right = (this.Dir.cross(newUp)).normalize(),
        this.Up = (this.Right.cross(this.Dir)).normalize();
    }

    response(button: string, dt: number): void {
        let Dist = (this.At.sub(this.Loc)).getLength(),
        cosT = (this.Loc.y - this.At.y) / Dist,
        sinT = Math.sqrt(1 - cosT * cosT),
        plen = Dist * sinT,
        cosP = (this.Loc.z - this.At.z) / plen,
        sinP = (this.Loc.x - this.At.x) / plen,
        Azimuth = R2D(Math.atan2(sinP, cosP)),
        Elevator = R2D(Math.atan2(sinT, cosT));

        if (Elevator < 0.08)
            Elevator = 0.08;
        else if (Elevator > 178.90)
            Elevator = 178.90;

        if (button === "s")
            Dist += dt * 53;
        else if (button === "w")
            Dist -= dt * 53;

        if (Dist < 0.1)
            Dist = 0.1;

        let newAt: _vec3 = new _vec3(0, 0, 0);
        let newLoc: _vec3 = new _vec3(0, 0, 0);
        
        if (button === "d") {
            newAt = this.At.add(this.Right.mul(0.102));
            newLoc = this.Loc.add(this.Right.mul(0.102));
        }
        else if (button === "a") {
            newAt = this.At.add(this.Right.mul(-0.102));
            newLoc = this.Loc.add(this.Right.mul(-0.102)); 
        }

        let m1: _mat4 = new _mat4().rotateX(Elevator);
        let m2: _mat4 = new _mat4().rotateY(Azimuth);
        let m3: _mat4 = new _mat4().translate(newAt);

        this.camSet(m1.mul(m2.m).mul(m3.m).transformPoint(new _vec3(0, Dist, 0)), newAt, new _vec3(0, 1, 0));
    }
}