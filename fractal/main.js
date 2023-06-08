function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("!!!");
    }

    return shader;
}

let statX = 0;
let deltaX = 0, deltaY = 0;
let startTime = new Date().getTime();
let flagFrac = 1;

function myHandle(el) {
  let txt = document.getElementById("txt");
  if (flagFrac === 1) {
    flagFrac = 0;
    txt.innerText = "Julia";
  } else {
    flagFrac = 1;
    txt.innerText = "Mandelbrot";
  }
}


function initGL() {
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl2");
    let zoomX0 = -2, zoomX1 = 2, zoomY0 = -2, zoomY1 = 2;
 
    gl.clearColor(0.6, 0.1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vs = `#version 300 es
        in highp vec4 in_pos;
        
        void main() {
            gl_Position = in_pos;
        }
    `;

    const fs = `#version 300 es
        out highp vec4 o_color;

        uniform highp float x0;
        uniform highp float x1;
        uniform highp float y0;
        uniform highp float y1;
        uniform highp float col;
        uniform highp float flag;
        uniform highp float time;

        highp vec2 CmplSet( highp float a, highp float b )
        {
          highp vec2 res;

          res.x = a;
          res.y = b;

          return res;
        }

        highp vec2 CmplAddCmpl( highp vec2 a, highp vec2 b )
        {
          highp vec2 res;

          res.x = a.x + b.x;
          res.y = a.y + b.y;

          return res;
        }

        highp vec2 CmplMulCmpl( highp vec2 a, highp vec2 b )
        {
          highp vec2 res;

          res.x = a.x * b.x - a.y * b.y;
          res.y = a.x * b.y + b.x * a.y;

          return res;
        }


        highp float CmplNorm2( highp vec2 a )
        {
          highp float res;

          res = a.x * a.x + a.y * a.y;

          return res;
        }

        highp float MandelbrotJul( highp vec2 z, highp vec2 c )
        {
          highp float n = 0.0;

          while(n < 255.0 && CmplNorm2(z) < 4.0)
          {
            z = CmplAddCmpl(CmplMulCmpl(z, z), c);
            n = n + 1.0;
          }

          return n;
        }


        void main() {
         highp float n = 0.0;
         highp vec2 z;

         z = CmplSet(x0 + gl_FragCoord.x * (x1 - x0) / 800.0, y0 + gl_FragCoord.y * (y1 - y0) / 800.0);
         if (flag == 1.0)
          n = MandelbrotJul(z, z);
         else
          n = MandelbrotJul(z, CmplSet(0.35 + 0.08 * sin(time + 3.0), 0.39 + 0.08 * sin(1.1 * time)));

         o_color = vec4(n / 255.0, n / (col * 255.0), n * col / 255.0, 1);
        }
    `;

    const vertexSh = loadShader(gl, gl.VERTEX_SHADER, vs);
    const fragmentSh = loadShader(gl, gl.FRAGMENT_SHADER, fs);

    const program = gl.createProgram();
    gl.attachShader(program, vertexSh);
    gl.attachShader(program, fragmentSh);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("!!!!");
    }
    const pos = [-1, 1, 0, 1,   -1, -1, 0, 1,    1, 1, 0, 1,    1, -1, 0, 1];


    const draw = () => {
      const posLoc = gl.getAttribLocation(program, "in_pos");
      const posX0 = gl.getUniformLocation(program, "x0");
      const posX1 = gl.getUniformLocation(program, "x1");
      const posY0 = gl.getUniformLocation(program, "y0");
      const posY1 = gl.getUniformLocation(program, "y1");
      const posCol = gl.getUniformLocation(program, "col");
      const posFlag = gl.getUniformLocation(program, "flag");
      const posTime = gl.getUniformLocation(program, "time");
      const posBuf = gl.createBuffer();

      let curTime = new Date().getTime();
      let time = curTime - startTime;
      
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
      gl.vertexAttribPointer(posLoc, 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(posLoc);
      gl.useProgram(program);

      let fracCol = document.getElementById("slider").value;
      document.getElementById("sliderValue").innerText = fracCol;

      gl.uniform1f(posX0, zoomX0);
      gl.uniform1f(posX1, zoomX1);
      gl.uniform1f(posY0, zoomY0);
      gl.uniform1f(posY1, zoomY1);
      gl.uniform1f(posCol, fracCol);
      gl.uniform1f(posFlag, flagFrac);
      gl.uniform1f(posTime, time);

      //    c = CmplSet(0.35 + 0.08 * sin(SyncTime + 3), 0.39 + 0.08 * sin(1.1 * SyncTime));

      let myCalculateMousePosition = (canvas, event) => {
               let rect = canvas.getBoundingClientRect();
               return {
                    x: event.clientX - Math.trunc(rect.left),
                    y: event.clientY - Math.trunc(rect.top)
               };
      };

      window.addEventListener("wheel", (event) => {

          let mousePos = myCalculateMousePosition(canvas, event);
          let mouseWheel = 0;
          mouseWheel -= event.deltaY;

          mousePos.x = (mousePos.x / canvas.width - 0.5) * 2 * zoomX1;
          mousePos.y = (mousePos.y / canvas.height - 0.5) * 2 * zoomY1;

          statX += mouseWheel;

          if (mousePos.x >= -zoomX1 && mousePos.x <= zoomX1 && mousePos.y >= -zoomY1 && mousePos.y <= zoomY1) {
            let x = 2.0 / Math.pow(10.0, statX * 0.000001);

            deltaX += (mousePos.x - deltaX) / 1000;
            deltaY += (mousePos.y - deltaY) / 1000;

            zoomX0 = -x;
            zoomY0 = -x;
            zoomX1 = x;
            zoomY1 = x;

            zoomX0 += deltaX;
            zoomX1 += deltaX;
            zoomY0 -= deltaY;
            zoomY1 -= deltaY;
          }
      });

     /* let delta = 0.05;
      document.body.onkeydown = function(e) {
        if (e.code == "ArrowUp") {
          zoomY1 += delta;
          zoomY0 += delta;
        }
        if (e.code == "ArrowDown") {
          zoomY1 -= delta;
          zoomY0 -= delta;
        }
        if (e.code == "ArrowRight") {
          zoomX1 += delta;
          zoomX0 += delta;
        }
        if (e.code == "ArrowLeft") {
          zoomX1 -= delta;
          zoomX0 -= delta;
        } 
      }*/

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      window.requestAnimationFrame(draw);
    }

    draw();
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

window.addEventListener("load", () => {
            
            initGL();
        }
);