import {_Timer} from "./timer";
import {_mat4} from "./mth/mat4";
import {_vec3} from "./mth/vec4";
import { _camera, _cam } from "./camera";

// TODO: camera control, rotation of camera.

let gl: WebGL2RenderingContext;

interface ProgramInfo {
  program: WebGLProgram,
  attribLocations: {
    vertexPosition: number,
  };
  uniformLocations: {
    Time: any,
    CamPosX: any,
    CamPosY: any,
    CamPosZ: any,

    CamDirX: any,
    CamDirY: any,
    CamDirZ: any,

    Color1R: any,
    Color1G: any,
    Color1B: any,

    Color2R: any,
    Color2G: any,
    Color2B: any,
   },
}

function loadShader(type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);

  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initShaderProgram(vsSource: string, fsSource: string) {
  const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
  if (!vertexShader) return;
  const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
  if (!fragmentShader) return;

  const shaderProgram = gl.createProgram();
  if (!shaderProgram) return;
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
    return null;
  }

  return shaderProgram;
}

function initPositionBuffer(): WebGLBuffer | null {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}

interface Buffers {
  position: WebGLBuffer | null;
}

function initBuffers(): Buffers {
  const positionBuffer = initPositionBuffer();

  return {
    position: positionBuffer
  };
}

function setPositionAttribute(buffers: Buffers, programInfo: ProgramInfo) {
  const numComponents = 2; 
  const type = gl.FLOAT;
  const normalize = false; 
  const stride = 0; 
  const offset = 0; 
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

function drawScene(programInfo: ProgramInfo, buffers: Buffers) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  setPositionAttribute(buffers, programInfo);

  gl.useProgram(programInfo.program);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

let Timer = new _Timer();
let Camera = new _cam();

export async function main() {  
  const vsText = 
  `#version 300 es
    precision highp float;
    in highp vec4 in_pos;

    void main() {
        gl_Position = in_pos;
    } 
  `;

  const fsText = 
  `#version 300 es
    precision highp float;
    out vec4 o_color;

    uniform float Time;

    uniform float CamPosX;
    uniform float CamPosY;
    uniform float CamPosZ;

    uniform float CamDirX;
    uniform float CamDirY;
    uniform float CamDirZ;

    uniform float Color1R;
    uniform float Color1G;
    uniform float Color1B;

    uniform float Color2R;
    uniform float Color2G;
    uniform float Color2B;

    float smin( float a, float b, float k )
    {
        k *= 2.0;
        float x = b-a;
        return 0.5*( a+b-sqrt(x*x+k*k) );
    }

    float distance_from_sphere(vec3 p, vec3 c, float r)
    {
        return length(p - c) - r;
    }

    float distance_from_plane( vec3 p, vec3 n, vec3 q )
    {
      vec3 n1 = normalize(n);

      return dot(n1, p) - dot(n1, q);
    }

    float map_the_world_sphere(vec3 p)
    {
        float displacement = sin(5.0 * p.x * sin(Time)) * sin(5.0 * p.y * sin(Time)) * sin(5.0 * p.z * sin(Time)) * 0.25;
        float sphere_0 = distance_from_sphere(p, vec3(0.0) + vec3(0, 1, 0) * sin(Time) * 2.0, 1.0);

        return sphere_0 + displacement;
    }

    float map_the_world_plane(vec3 p)
    {
        return distance_from_plane(p, vec3(0, 1, 0), vec3(0, -2, 0));
    }

    float distance_from_blend( vec3 p )
    {
      float d1 = map_the_world_sphere(p);
      float d2 = map_the_world_plane(p);
      return smin( d1, d2, 0.3);
    }

    float map_the_world_blend(vec3 p)
    {
        return distance_from_blend(p);
    }

    vec3 calculate_normal_blend(vec3 p)
    {
        const vec3 small_step = vec3(0.001, 0.0, 0.0);

        float gradient_x = map_the_world_blend(p + small_step.xyy) - map_the_world_blend(p - small_step.xyy);
        float gradient_y = map_the_world_blend(p + small_step.yxy) - map_the_world_blend(p - small_step.yxy);
        float gradient_z = map_the_world_blend(p + small_step.yyx) - map_the_world_blend(p - small_step.yyx);

        vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

        return normalize(normal);
    }

    vec3 calculate_normal_sphere(vec3 p)
    {
        const vec3 small_step = vec3(0.001, 0.0, 0.0);

        float gradient_x = map_the_world_sphere(p + small_step.xyy) - map_the_world_sphere(p - small_step.xyy);
        float gradient_y = map_the_world_sphere(p + small_step.yxy) - map_the_world_sphere(p - small_step.yxy);
        float gradient_z = map_the_world_sphere(p + small_step.yyx) - map_the_world_sphere(p - small_step.yyx);

        vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

        return normalize(normal);
    }

    vec3 calculate_normal_plane()
    {
        return vec3(0, 1, 0);
    }

    vec3 Shade( vec3 P, vec3 N, vec3 color_id)
    {
      vec3 L = normalize(vec3(-1.0, 4.0, -3.0));
      vec3 LC = vec3(1.0);
      vec3 color = vec3(0.0);
      vec3 V = normalize(P - vec3(CamPosX, CamPosY, CamPosZ));
    
      // Ambient
      vec3 color_default = color_id;

      color = color_default * 0.1;
    
      N = faceforward(N, V, N);

      vec3 diff = color_id;

      // Diffuse
      color += max(0.0, dot(N, L)) * diff * LC;
    
      // Specular
      vec3 R = reflect(V, N);
      color += pow(max(0.0, dot(R, L)), 30.0) * color_default * 1.8 * LC;
    
      return color;
    }

    vec3 ray_march(in vec3 ro, in vec3 rd)
    {
        float total_distance_traveled = 0.0;
        const int NUMBER_OF_STEPS = 512;
        const float MINIMUM_HIT_DISTANCE = 0.0001;
        const float MAXIMUM_TRACE_DISTANCE = 10000.0;

        for (int i = 0; i < NUMBER_OF_STEPS; ++i)
        {
            vec3 current_position = ro + total_distance_traveled * rd;
             
            float distance_to_closest = map_the_world_blend(current_position);

            if (distance_to_closest < MINIMUM_HIT_DISTANCE) 
            {
                vec3 normal = calculate_normal_blend(current_position);

                float len = length(current_position.xz - vec2(0, 0));
                vec3 color = vec3(Color1R, Color1G, Color1B);

                float n = floor(len / 4.0);
                
                if (mod(n, 2.0) == 0.0)
                  color = vec3(Color2R, Color2G, Color2B);

                return Shade(current_position, normal, color);      
            }

            if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
            {
                break;
            }
            total_distance_traveled += distance_to_closest;
        }
        return vec3(0.199, 0.226, 0.238);
    }

    mat4 RotX( float A )
    {
      float r = A * 3.1415 / 180.0;
      float si = sin(r);
      float co = cos(r);
      mat4 m = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

      m[1][1] = co;
      m[1][2] = si;
      m[2][1] = -si;
      m[2][2] = co;
      
      return m;
    }

    mat4 RotY( float A )
    {
      float r = A * 3.1415 / 180.0;
      float si = sin(r);
      float co = cos(r);
      mat4 m = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

      m[0][0] = co;
      m[0][2] = -si;
      m[2][0] = si;
      m[2][2] = co;      
      
      return m;
    }

    void main()
    {
        vec2 uv = vec2(-1.0, -1.0) + 2.0 * gl_FragCoord.xy / 800.0;

        vec3 camera_position = vec3(CamPosX, CamPosY, CamPosZ);
        vec3 ro = camera_position;
        vec3 rd = normalize(vec3(vec4(uv, 1, 1) * RotX(CamDirX) * RotY(CamDirY)).xyz);

        vec3 shaded_color = ray_march(ro, rd);

        o_color = vec4(shaded_color, 1.0);
    }
  `;

  const canvas = document.querySelector('#glcanvas') as HTMLCanvasElement;
  if (!canvas) {
    return;
  }

  gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

  if (gl === null) {
    alert(
      'Unable to initialize WebGL. Your browser or machine may not support it.'
    );
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const shaderProgram = initShaderProgram(vsText, fsText);
  if (!shaderProgram) return;

  const programInfo: ProgramInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'in_pos')
    },
    uniformLocations: {
      Time: gl.getUniformLocation(shaderProgram, "Time"),
      CamPosX: gl.getUniformLocation(shaderProgram, "CamPosX"),
      CamPosY: gl.getUniformLocation(shaderProgram, "CamPosY"),
      CamPosZ: gl.getUniformLocation(shaderProgram, "CamPosZ"),

      CamDirX: gl.getUniformLocation(shaderProgram, "CamDirX"),
      CamDirY: gl.getUniformLocation(shaderProgram, "CamDirY"),
      CamDirZ: gl.getUniformLocation(shaderProgram, "CamDirZ"),

      Color1R: gl.getUniformLocation(shaderProgram, "Color1R"),
      Color1G: gl.getUniformLocation(shaderProgram, "Color1G"),
      Color1B: gl.getUniformLocation(shaderProgram, "Color1B"),

      Color2R: gl.getUniformLocation(shaderProgram, "Color2R"),
      Color2G: gl.getUniformLocation(shaderProgram, "Color2G"),
      Color2B: gl.getUniformLocation(shaderProgram, "Color2B"),
    },
  };

  const buffers = initBuffers();
  
  const draw = () => {
    Timer.response();
    Camera.inputResponse(Timer.globalDeltaTime);
    Camera.colorResponse();

    gl.uniform1f(programInfo.uniformLocations.Time, Timer.globalTime);

    gl.uniform1f(programInfo.uniformLocations.CamPosX, Camera.pos.x);
    gl.uniform1f(programInfo.uniformLocations.CamPosY, Camera.pos.y);
    gl.uniform1f(programInfo.uniformLocations.CamPosZ, Camera.pos.z);

    gl.uniform1f(programInfo.uniformLocations.CamDirX, Camera.rot.x);
    gl.uniform1f(programInfo.uniformLocations.CamDirY, Camera.rot.y);
    gl.uniform1f(programInfo.uniformLocations.CamDirZ, Camera.rot.z);

    gl.uniform1f(programInfo.uniformLocations.Color1R, Camera.color1.x);
    gl.uniform1f(programInfo.uniformLocations.Color1G, Camera.color1.y);
    gl.uniform1f(programInfo.uniformLocations.Color1B, Camera.color1.z);

    gl.uniform1f(programInfo.uniformLocations.Color2R, Camera.color2.x);
    gl.uniform1f(programInfo.uniformLocations.Color2G, Camera.color2.y);
    gl.uniform1f(programInfo.uniformLocations.Color2B, Camera.color2.z);

    drawScene(programInfo, buffers);
    window.requestAnimationFrame(draw);
  }

  draw();
}

document.addEventListener('keydown', (event) => {
  Camera.input[event.code] = true;
});

document.addEventListener('keyup', (event) => {
  Camera.input[event.code] = false;
});

window.addEventListener('load', (event) => {
  main();
});