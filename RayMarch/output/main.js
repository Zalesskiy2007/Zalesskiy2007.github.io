var XXX = (function (exports) {
    'use strict';

    class _Timer {
        globalTime;
        globalDeltaTime;
        isPause;
        oldTime;
        pauseTime;
        localDeltaTime;
        localTime;
        startTime;
        frameCounter;
        oldTimeFPS;
        FPS;
        constructor() {
            this.globalTime = 0;
            this.globalDeltaTime = 0;
            this.isPause = false;
            this.oldTime = 0;
            this.pauseTime = 0;
            this.localDeltaTime = 0;
            this.localTime = 0;
            this.startTime = 0;
            this.frameCounter = 0;
            this.oldTimeFPS = 0;
            this.FPS = 30;
        }
        response() {
            const getTime = () => {
                const date = new Date();
                let t = date.getMilliseconds() / 1000.0 +
                    date.getSeconds() +
                    date.getMinutes() * 60;
                return t;
            };
            let t = getTime();
            // Global time
            this.globalTime = t;
            this.globalDeltaTime = t - this.oldTime;
            // Time with pause
            if (this.isPause) {
                this.localDeltaTime = 0;
                this.pauseTime += t - this.oldTime;
            }
            else {
                this.localDeltaTime = this.globalDeltaTime;
                this.localTime = t - this.pauseTime - this.startTime;
            }
            // FPS
            this.frameCounter++;
            if (t - this.oldTimeFPS > 3) {
                this.FPS = this.frameCounter / (t - this.oldTimeFPS);
                this.oldTimeFPS = t;
                this.frameCounter = 0;
            }
            this.oldTime = t;
        }
    }

    class _vec3 {
        x;
        y;
        z;
        constructor(a, b, c) {
            this.x = a;
            this.y = b;
            this.z = c;
        }
        // Add two vectors function
        add(vec) {
            return new _vec3(this.x + vec.x, this.y + vec.y, this.z + vec.z);
        }
        // Subtract two vectors function
        sub(vec) {
            return new _vec3(this.x - vec.x, this.y - vec.y, this.z - vec.z);
        }
        // Multiply function
        mul(v) {
            if (typeof v == "number")
                return new _vec3(this.x * v, this.y * v, this.z * v);
            return new _vec3(this.x * v.x, this.y * v.y, this.z * v.z);
        }
        div(d) {
            let v = 1.0 / d;
            return new _vec3(this.x * v, this.y * v, this.z * v);
        }
        // Two vectors dot product function
        dot(vec) {
            return (this.x * vec.x + this.y * vec.y + this.z * vec.z);
        }
        cross(V) {
            return new _vec3(this.y * V.z - this.z * V.y, -(this.x * V.z - this.z * V.x), this.x * V.y - this.y * V.x);
        }
        normalize() {
            let len = this.dot(this);
            if (len == 1 || len == 0)
                return this;
            return this.mul(1.0 / Math.sqrt(len));
        }
        getLength() {
            let len = Math.sqrt(this.dot(this));
            return len;
        }
    }

    class _cam {
        rot;
        pos;
        input;
        color1;
        color2;
        count;
        constructor() {
            this.rot = new _vec3(0, 0, 0);
            this.pos = new _vec3(0, 0, -10);
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
            this.count = 0;
        }
        colorResponse() {
            let s1 = document.getElementById("ColorPicker1");
            let s2 = document.getElementById("ColorPicker2");
            let str1 = "#ffffff", str2 = "#ffffff";
            if (s2 != null)
                str2 = s2.value;
            if (s1 != null)
                str1 = s1.value;
            this.color1 = new _vec3(parseInt("0x" + str1[1] + str1[2]), parseInt("0x" + str1[3] + str1[4]), parseInt("0x" + str1[5] + str1[6])).div(255.0);
            this.color2 = new _vec3(parseInt("0x" + str2[1] + str2[2]), parseInt("0x" + str2[3] + str2[4]), parseInt("0x" + str2[5] + str2[6])).div(255.0);
        }
        inputResponse(dt) {
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

    // TODO: camera control, rotation of camera.
    let gl;
    function loadShader(type, source) {
        const shader = gl.createShader(type);
        if (!shader)
            return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    function initShaderProgram(vsSource, fsSource) {
        const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
        if (!vertexShader)
            return;
        const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
        if (!fragmentShader)
            return;
        const shaderProgram = gl.createProgram();
        if (!shaderProgram)
            return;
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
            return null;
        }
        return shaderProgram;
    }
    function initPositionBuffer() {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        return positionBuffer;
    }
    function initBuffers() {
        const positionBuffer = initPositionBuffer();
        return {
            position: positionBuffer
        };
    }
    function setPositionAttribute(buffers, programInfo) {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }
    function drawScene(programInfo, buffers) {
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
    async function main() {
        const vsText = `#version 300 es
    precision highp float;
    in highp vec4 in_pos;

    void main() {
        gl_Position = in_pos;
    } 
  `;
        const fsText = `#version 300 es
    precision highp float;
    out vec4 o_color;

    uniform float Time;
    uniform int Count;

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

    float map_the_world_sphere(vec3 p, vec3 c, float use)
    {
        float displacement = sin(5.0 * p.x * sin(Time)) * sin(5.0 * p.y * sin(Time)) * sin(5.0 * p.z * sin(Time)) * 0.25;
        float sphere_0 = distance_from_sphere(p, c, 1.0);

        if (use == 0.0)
          displacement = 0.0;

        return sphere_0 + displacement;
    }

    float map_the_world_plane(vec3 p)
    {
        return distance_from_plane(p, vec3(0, 1, 0), vec3(0, -2, 0));
    }

    float distance_from_blend( vec3 p )
    {
      float d1 = map_the_world_sphere(p, vec3(0.0) + vec3(0, 1, 0) * sin(Time) * 2.0, 1.0);
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

    vec3 calculate_normal_sphere(vec3 p, vec3 c, float use)
    {
        const vec3 small_step = vec3(0.001, 0.0, 0.0);

        float gradient_x = map_the_world_sphere(p + small_step.xyy, c, use) - map_the_world_sphere(p - small_step.xyy, c, use);
        float gradient_y = map_the_world_sphere(p + small_step.yxy, c, use) - map_the_world_sphere(p - small_step.yxy, c, use);
        float gradient_z = map_the_world_sphere(p + small_step.yyx, c, use) - map_the_world_sphere(p - small_step.yyx, c, use);

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
            float type = 1.0;
            vec3 sphPos = vec3(0.0);
            
            for (int i = 0; i < Count; i++)
            {
              vec3 d = vec3(float(i) * 2.2 - 10.0, 2.0, 2.0);
              float ds = map_the_world_sphere(current_position, d, 0.0);
              if (ds < distance_to_closest)
              {
                distance_to_closest = ds;
                type = 2.0;
                sphPos = d;
              }
            }

            if (distance_to_closest < MINIMUM_HIT_DISTANCE) 
            {
              if (type == 1.0)
              {
                  vec3 normal = calculate_normal_blend(current_position);

                  float len = length(current_position.xz - vec2(0, 0));
                  vec3 color = vec3(Color1R, Color1G, Color1B);

                  float n = floor(len / 4.0);
                
                  if (mod(n, 2.0) == 0.0)
                    color = vec3(Color2R, Color2G, Color2B);

                  return Shade(current_position, normal, color);      
              }
              else if (type == 2.0)
              {
                  vec3 normal = calculate_normal_sphere(current_position, sphPos, 0.0);                

                  return Shade(current_position, normal, vec3(0.2, 0.6, 0.4));      
              }
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
        const canvas = document.querySelector('#glcanvas');
        if (!canvas) {
            return;
        }
        gl = canvas.getContext('webgl2');
        if (gl === null) {
            alert('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const shaderProgram = initShaderProgram(vsText, fsText);
        if (!shaderProgram)
            return;
        const programInfo = {
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
                Count: gl.getUniformLocation(shaderProgram, "Count"),
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
            gl.uniform1i(programInfo.uniformLocations.Count, Camera.count);
            drawScene(programInfo, buffers);
            window.requestAnimationFrame(draw);
        };
        draw();
    }
    document.addEventListener('keydown', (event) => {
        Camera.input[event.code] = true;
        if (Camera.input['KeyP'])
            if (Camera.count < 10)
                Camera.count = Camera.count + 1;
        if (Camera.input['KeyM'])
            if (Camera.count > 0)
                Camera.count = Camera.count - 1;
    });
    document.addEventListener('keyup', (event) => {
        Camera.input[event.code] = false;
    });
    window.addEventListener('load', (event) => {
        main();
    });

    exports.main = main;

    return exports;

})({});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vdGltZXIudHMiLCIuLi9tdGgvdmVjNC50cyIsIi4uL2NhbWVyYS50cyIsIi4uL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOltudWxsLG51bGwsbnVsbCxudWxsXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O1VBQWEsTUFBTSxDQUFBO0lBQ2YsSUFBQSxVQUFVLENBQVM7SUFDbkIsSUFBQSxlQUFlLENBQVM7SUFDeEIsSUFBQSxPQUFPLENBQVU7SUFDakIsSUFBQSxPQUFPLENBQVM7SUFDaEIsSUFBQSxTQUFTLENBQVM7SUFDbEIsSUFBQSxjQUFjLENBQVM7SUFDdkIsSUFBQSxTQUFTLENBQVM7SUFDbEIsSUFBQSxTQUFTLENBQVM7SUFDbEIsSUFBQSxZQUFZLENBQVM7SUFDckIsSUFBQSxVQUFVLENBQVM7SUFDbkIsSUFBQSxHQUFHLENBQVM7SUFFWixJQUFBLFdBQUEsR0FBQTtJQUNJLFFBQUEsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDcEIsUUFBQSxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztJQUN6QixRQUFBLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLFFBQUEsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDakIsUUFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNuQixRQUFBLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO0lBQ3hCLFFBQUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDbkIsUUFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNuQixRQUFBLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCLFFBQUEsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDcEIsUUFBQSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztTQUNqQjtRQUVELFFBQVEsR0FB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
