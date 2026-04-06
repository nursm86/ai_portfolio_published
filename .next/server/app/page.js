(()=>{var e={};e.id=974,e.ids=[974],e.modules={798:(e,t,r)=>{Promise.resolve().then(r.bind(r,6991))},846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},886:(e,t,r)=>{Promise.resolve().then(r.bind(r,1204))},1204:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>i});let i=(0,r(2907).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/Users/nursm/Downloads/P/ai_portfolio/src/app/page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/nursm/Downloads/P/ai_portfolio/src/app/page.tsx","default")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3873:e=>{"use strict";e.exports=require("path")},6991:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>N});var i=r(687),o=r(3210);let a=()=>{let e,t,r,i,o;let a=document.getElementById("fluid");H();let n={SIM_RESOLUTION:128,DYE_RESOLUTION:1440,DENSITY_DISSIPATION:.5,VELOCITY_DISSIPATION:3,PRESSURE:.1,PRESSURE_ITERATIONS:20,CURL:3,SPLAT_RADIUS:.2,SPLAT_FORCE:6e3,SHADING:!0,COLOR_UPDATE_SPEED:10},l=[];l.push(new function(){this.id=-1,this.texcoordX=0,this.texcoordY=0,this.prevTexcoordX=0,this.prevTexcoordY=0,this.deltaX=0,this.deltaY=0,this.down=!1,this.moved=!1,this.color=[0,0,0]});let{gl:s,ext:u}=function(e){let t,r,i,o,a;let n={alpha:!0,depth:!1,stencil:!1,antialias:!1,preserveDrawingBuffer:!1},l=e.getContext("webgl2",n),s=!!l;s||(l=e.getContext("webgl",n)||e.getContext("experimental-webgl",n)),s?(l.getExtension("EXT_color_buffer_float"),r=l.getExtension("OES_texture_float_linear")):(t=l.getExtension("OES_texture_half_float"),r=l.getExtension("OES_texture_half_float_linear")),l.clearColor(0,0,0,1);let u=s?l.HALF_FLOAT:t.HALF_FLOAT_OES;return s?(i=c(l,l.RGBA16F,l.RGBA,u),o=c(l,l.RG16F,l.RG,u),a=c(l,l.R16F,l.RED,u)):(i=c(l,l.RGBA,l.RGBA,u),o=c(l,l.RGBA,l.RGBA,u),a=c(l,l.RGBA,l.RGBA,u)),{gl:l,ext:{formatRGBA:i,formatRG:o,formatR:a,halfFloatTexType:u,supportLinearFiltering:r}}}(a);function c(e,t,r,i){if(!function(e,t,r,i){let o=e.createTexture();e.bindTexture(e.TEXTURE_2D,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,t,4,4,0,r,i,null);let a=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,a),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o,0),e.checkFramebufferStatus(e.FRAMEBUFFER)==e.FRAMEBUFFER_COMPLETE}(e,t,r,i))switch(t){case e.R16F:return c(e,e.RG16F,e.RG,i);case e.RG16F:return c(e,e.RGBA16F,e.RGBA,i);default:return null}return{internalFormat:t,format:r}}u.supportLinearFiltering||(n.DYE_RESOLUTION=256,n.SHADING=!1);class d{constructor(e,t){this.vertexShader=e,this.fragmentShaderSource=t,this.programs=[],this.activeProgram=null,this.uniforms=[]}setKeywords(e){let t=0;for(let r=0;r<e.length;r++)t+=function(e){if(0==e.length)return 0;let t=0;for(let r=0;r<e.length;r++)t=(t<<5)-t+e.charCodeAt(r)|0;return t}(e[r]);let r=this.programs[t];if(null==r){let i=h(s.FRAGMENT_SHADER,this.fragmentShaderSource,e);r=m(this.vertexShader,i),this.programs[t]=r}r!=this.activeProgram&&(this.uniforms=f(r),this.activeProgram=r)}bind(){s.useProgram(this.activeProgram)}}class v{constructor(e,t){this.uniforms={},this.program=m(e,t),this.uniforms=f(this.program)}bind(){s.useProgram(this.program)}}function m(e,t){let r=s.createProgram();return s.attachShader(r,e),s.attachShader(r,t),s.linkProgram(r),s.getProgramParameter(r,s.LINK_STATUS)||console.trace(s.getProgramInfoLog(r)),r}function f(e){let t=[],r=s.getProgramParameter(e,s.ACTIVE_UNIFORMS);for(let i=0;i<r;i++){let r=s.getActiveUniform(e,i).name;t[r]=s.getUniformLocation(e,r)}return t}function h(e,t,r){t=function(e,t){if(null==t)return e;let r="";return t.forEach(e=>{r+="#define "+e+"\n"}),r+e}(t,r);let i=s.createShader(e);return s.shaderSource(i,t),s.compileShader(i),s.getShaderParameter(i,s.COMPILE_STATUS)||console.trace(s.getShaderInfoLog(i)),i}let x=h(s.VERTEX_SHADER,`
       precision highp float;
   
       attribute vec2 aPosition;
       varying vec2 vUv;
       varying vec2 vL;
       varying vec2 vR;
       varying vec2 vT;
       varying vec2 vB;
       uniform vec2 texelSize;
   
       void main () {
           vUv = aPosition * 0.5 + 0.5;
           vL = vUv - vec2(texelSize.x, 0.0);
           vR = vUv + vec2(texelSize.x, 0.0);
           vT = vUv + vec2(0.0, texelSize.y);
           vB = vUv - vec2(0.0, texelSize.y);
           gl_Position = vec4(aPosition, 0.0, 1.0);
       }
   `);h(s.VERTEX_SHADER,`
       precision highp float;
   
       attribute vec2 aPosition;
       varying vec2 vUv;
       varying vec2 vL;
       varying vec2 vR;
       uniform vec2 texelSize;
   
       void main () {
           vUv = aPosition * 0.5 + 0.5;
           float offset = 1.33333333;
           vL = vUv - texelSize * offset;
           vR = vUv + texelSize * offset;
           gl_Position = vec4(aPosition, 0.0, 1.0);
       }
   `),h(s.FRAGMENT_SHADER,`
       precision mediump float;
       precision mediump sampler2D;
   
       varying vec2 vUv;
       varying vec2 vL;
       varying vec2 vR;
       uniform sampler2D uTexture;
   
       void main () {
           vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
           sum += texture2D(uTexture, vL) * 0.35294117;
           sum += texture2D(uTexture, vR) * 0.35294117;
           gl_FragColor = sum;
       }
   `);let p=h(s.FRAGMENT_SHADER,`
       precision mediump float;
       precision mediump sampler2D;
   
       varying highp vec2 vUv;
       uniform sampler2D uTexture;
   
       void main () {
           gl_FragColor = texture2D(uTexture, vUv);
       }
   `),g=h(s.FRAGMENT_SHADER,`
       precision mediump float;
       precision mediump sampler2D;
   
       varying highp vec2 vUv;
       uniform sampler2D uTexture;
       uniform float value;
   
       void main () {
           gl_FragColor = value * texture2D(uTexture, vUv);
       }
   `);h(s.FRAGMENT_SHADER,`
       precision mediump float;
   
       uniform vec4 color;
   
       void main () {
           gl_FragColor = color;
       }
   `);let E=`
       precision highp float;
       precision highp sampler2D;
   
       varying vec2 vUv;
       varying vec2 vL;
       varying vec2 vR;
       varying vec2 vT;
       varying vec2 vB;
       uniform sampler2D uTexture;
       uniform sampler2D uDithering;
       uniform vec2 ditherScale;
       uniform vec2 texelSize;
   
       vec3 linearToGamma (vec3 color) {
           color = max(color, vec3(0));
           return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
       }
   
       void main () {
           vec3 c = texture2D(uTexture, vUv).rgb;
   
       #ifdef SHADING
           vec3 lc = texture2D(uTexture, vL).rgb;
           vec3 rc = texture2D(uTexture, vR).rgb;
           vec3 tc = texture2D(uTexture, vT).rgb;
           vec3 bc = texture2D(uTexture, vB).rgb;
   
           float dx = length(rc) - length(lc);
           float dy = length(tc) - length(bc);
   
           vec3 n = normalize(vec3(dx, dy, length(texelSize)));
           vec3 l = vec3(0.0, 0.0, 1.0);
   
           float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
           c *= diffuse;
       #endif
   
           float a = max(c.r, max(c.g, c.b));
           gl_FragColor = vec4(c, a);
       }
   `,y=h(s.FRAGMENT_SHADER,`
       precision highp float;
       precision highp sampler2D;
   
       varying vec2 vUv;
       uniform sampler2D uTarget;
       uniform float aspectRatio;
       uniform vec3 color;
       uniform vec2 point;
       uniform float radius;
   
       void main () {
           vec2 p = vUv - point.xy;
           p.x *= aspectRatio;
           vec3 splat = exp(-dot(p, p) / radius) * color;
           vec3 base = texture2D(uTarget, vUv).xyz;
           gl_FragColor = vec4(base + splat, 1.0);
       }
   `),T=h(s.FRAGMENT_SHADER,`
       precision highp float;
       precision highp sampler2D;
   
       varying vec2 vUv;
       uniform sampler2D uVelocity;
       uniform sampler2D uSource;
       uniform vec2 texelSize;
       uniform vec2 dyeTexelSize;
       uniform float dt;
       uniform float dissipation;
   
       vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
           vec2 st = uv / tsize - 0.5;
   
           vec2 iuv = floor(st);
           vec2 fuv = fract(st);
   
           vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
           vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
           vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
           vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
   
           return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
       }
   
       void main () {
       #ifdef MANUAL_FILTERING
           vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
           vec4 result = bilerp(uSource, coord, dyeTexelSize);
       #else
           vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
           vec4 result = texture2D(uSource, coord);
       #endif
           float decay = 1.0 + dissipation * dt;
           gl_FragColor = result / decay;
       }`,u.supportLinearFiltering?null:["MANUAL_FILTERING"]),R=h(s.FRAGMENT_SHADER,`
       precision mediump float;
       precision mediump sampler2D;
   
       varying highp vec2 vUv;
       varying highp vec2 vL;
       varying highp vec2 vR;
       varying highp vec2 vT;
       varying highp vec2 vB;
       uniform sampler2D uVelocity;
   
       void main () {
           float L = texture2D(uVelocity, vL).x;
           float R = texture2D(uVelocity, vR).x;
           float T = texture2D(uVelocity, vT).y;
           float B = texture2D(uVelocity, vB).y;
   
           vec2 C = texture2D(uVelocity, vUv).xy;
           if (vL.x < 0.0) { L = -C.x; }
           if (vR.x > 1.0) { R = -C.x; }
           if (vT.y > 1.0) { T = -C.y; }
           if (vB.y < 0.0) { B = -C.y; }
   
           float div = 0.5 * (R - L + T - B);
           gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
       }
   `),b=h(s.FRAGMENT_SHADER,`
       precision mediump float;
       precision mediump sampler2D;
   
       varying highp vec2 vUv;
       varying highp vec2 vL;
       varying highp vec2 vR;
       varying highp vec2 vT;
       varying highp vec2 vB;
       uniform sampler2D uVelocity;
   
       void main () {
           float L = texture2D(uVelocity, vL).y;
           float R = texture2D(uVelocity, vR).y;
           float T = texture2D(uVelocity, vT).x;
           float B = texture2D(uVelocity, vB).x;
           float vorticity = R - L - T + B;
           gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
       }
   `),w=h(s.FRAGMENT_SHADER,`
       precision highp float;
       precision highp sampler2D;
   
       varying vec2 vUv;
       varying vec2 vL;
       varying vec2 vR;
       varying vec2 vT;
       varying vec2 vB;
       uniform sampler2D uVelocity;
       uniform sampler2D uCurl;
       uniform float curl;
       uniform float dt;
   
       void main () {
           float L = texture2D(uCurl, vL).x;
           float R = texture2D(uCurl, vR).x;
           float T = texture2D(uCurl, vT).x;
           float B = texture2D(uCurl, vB).x;
           float C = texture2D(uCurl, vUv).x;
   
           vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
           force /= length(force) + 0.0001;
           force *= curl * C;
           force.y *= -1.0;
   
           vec2 velocity = texture2D(uVelocity, vUv).xy;
           velocity += force * dt;
           velocity = min(max(velocity, -1000.0), 1000.0);
           gl_FragColor = vec4(velocity, 0.0, 1.0);
       }
   `),S=h(s.FRAGMENT_SHADER,`
       precision mediump float;
       precision mediump sampler2D;
   
       varying highp vec2 vUv;
       varying highp vec2 vL;
       varying highp vec2 vR;
       varying highp vec2 vT;
       varying highp vec2 vB;
       uniform sampler2D uPressure;
       uniform sampler2D uDivergence;
   
       void main () {
           float L = texture2D(uPressure, vL).x;
           float R = texture2D(uPressure, vR).x;
           float T = texture2D(uPressure, vT).x;
           float B = texture2D(uPressure, vB).x;
           float C = texture2D(uPressure, vUv).x;
           float divergence = texture2D(uDivergence, vUv).x;
           float pressure = (L + R + B + T - divergence) * 0.25;
           gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
       }
   `),D=h(s.FRAGMENT_SHADER,`
       precision mediump float;
       precision mediump sampler2D;
   
       varying highp vec2 vUv;
       varying highp vec2 vL;
       varying highp vec2 vR;
       varying highp vec2 vT;
       varying highp vec2 vB;
       uniform sampler2D uPressure;
       uniform sampler2D uVelocity;
   
       void main () {
           float L = texture2D(uPressure, vL).x;
           float R = texture2D(uPressure, vR).x;
           float T = texture2D(uPressure, vT).x;
           float B = texture2D(uPressure, vB).x;
           vec2 velocity = texture2D(uVelocity, vUv).xy;
           velocity.xy -= vec2(R - L, T - B);
           gl_FragColor = vec4(velocity, 0.0, 1.0);
       }
   `),A=(s.bindBuffer(s.ARRAY_BUFFER,s.createBuffer()),s.bufferData(s.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),s.STATIC_DRAW),s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,s.createBuffer()),s.bufferData(s.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),s.STATIC_DRAW),s.vertexAttribPointer(0,2,s.FLOAT,!1,0,0),s.enableVertexAttribArray(0),(e,t=!1)=>{null==e?(s.viewport(0,0,s.drawingBufferWidth,s.drawingBufferHeight),s.bindFramebuffer(s.FRAMEBUFFER,null)):(s.viewport(0,0,e.width,e.height),s.bindFramebuffer(s.FRAMEBUFFER,e.fbo)),t&&(s.clearColor(0,0,0,1),s.clear(s.COLOR_BUFFER_BIT)),s.drawElements(s.TRIANGLES,6,s.UNSIGNED_SHORT,0)}),_=new v(x,p),F=new v(x,g),U=new v(x,y),P=new v(x,T),N=new v(x,R),L=new v(x,b),k=new v(x,w),B=new v(x,S),C=new v(x,D),I=new d(x,E);function z(){let a=Z(n.SIM_RESOLUTION),l=Z(n.DYE_RESOLUTION),c=u.halfFloatTexType,d=u.formatRGBA,v=u.formatRG,m=u.formatR,f=u.supportLinearFiltering?s.LINEAR:s.NEAREST;s.disable(s.BLEND),e=null==e?M(l.width,l.height,d.internalFormat,d.format,c,f):X(e,l.width,l.height,d.internalFormat,d.format,c,f),t=null==t?M(a.width,a.height,v.internalFormat,v.format,c,f):X(t,a.width,a.height,v.internalFormat,v.format,c,f),r=j(a.width,a.height,m.internalFormat,m.format,c,s.NEAREST),i=j(a.width,a.height,m.internalFormat,m.format,c,s.NEAREST),o=M(a.width,a.height,m.internalFormat,m.format,c,s.NEAREST)}function j(e,t,r,i,o,a){s.activeTexture(s.TEXTURE0);let n=s.createTexture();s.bindTexture(s.TEXTURE_2D,n),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,a),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MAG_FILTER,a),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE),s.texImage2D(s.TEXTURE_2D,0,r,e,t,0,i,o,null);let l=s.createFramebuffer();s.bindFramebuffer(s.FRAMEBUFFER,l),s.framebufferTexture2D(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,n,0),s.viewport(0,0,e,t),s.clear(s.COLOR_BUFFER_BIT);let u=1/e,c=1/t;return{texture:n,fbo:l,width:e,height:t,texelSizeX:u,texelSizeY:c,attach:e=>(s.activeTexture(s.TEXTURE0+e),s.bindTexture(s.TEXTURE_2D,n),e)}}function M(e,t,r,i,o,a){let n=j(e,t,r,i,o,a),l=j(e,t,r,i,o,a);return{width:e,height:t,texelSizeX:n.texelSizeX,texelSizeY:n.texelSizeY,get read(){return n},set read(value){n=value},get write(){return l},set write(value){l=value},swap(){let e=n;n=l,l=e}}}function X(e,t,r,i,o,a,n){var l;let u;return e.width==t&&e.height==r?e:(l=e.read,u=j(t,r,i,o,a,n),_.bind(),s.uniform1i(_.uniforms.uTexture,l.attach(0)),A(u),e.read=u,e.write=j(t,r,i,o,a,n),e.width=t,e.height=r,e.texelSizeX=1/t,e.texelSizeY=1/r,e)}(function(){let e=[];n.SHADING&&e.push("SHADING"),I.setKeywords(e)})(),z();let O=Date.now(),G=0;function Y(){var a,c;let d,v,m,f;let h=(v=Math.min(v=((d=Date.now())-O)/1e3,.016666),O=d,v);H()&&z(),(G+=h*n.COLOR_UPDATE_SPEED)>=1&&(G=function(e,t,r){let i=1;return 0==i?t:(e-t)%i+t}(G,0,1),l.forEach(e=>{e.color=K()})),l.forEach(e=>{var t;let r,i;e.moved&&(e.moved=!1,r=(t=e).deltaX*n.SPLAT_FORCE,i=t.deltaY*n.SPLAT_FORCE,V(t.texcoordX,t.texcoordY,r,i,t.color))}),function(a){s.disable(s.BLEND),L.bind(),s.uniform2f(L.uniforms.texelSize,t.texelSizeX,t.texelSizeY),s.uniform1i(L.uniforms.uVelocity,t.read.attach(0)),A(i),k.bind(),s.uniform2f(k.uniforms.texelSize,t.texelSizeX,t.texelSizeY),s.uniform1i(k.uniforms.uVelocity,t.read.attach(0)),s.uniform1i(k.uniforms.uCurl,i.attach(1)),s.uniform1f(k.uniforms.curl,n.CURL),s.uniform1f(k.uniforms.dt,a),A(t.write),t.swap(),N.bind(),s.uniform2f(N.uniforms.texelSize,t.texelSizeX,t.texelSizeY),s.uniform1i(N.uniforms.uVelocity,t.read.attach(0)),A(r),F.bind(),s.uniform1i(F.uniforms.uTexture,o.read.attach(0)),s.uniform1f(F.uniforms.value,n.PRESSURE),A(o.write),o.swap(),B.bind(),s.uniform2f(B.uniforms.texelSize,t.texelSizeX,t.texelSizeY),s.uniform1i(B.uniforms.uDivergence,r.attach(0));for(let e=0;e<n.PRESSURE_ITERATIONS;e++)s.uniform1i(B.uniforms.uPressure,o.read.attach(1)),A(o.write),o.swap();C.bind(),s.uniform2f(C.uniforms.texelSize,t.texelSizeX,t.texelSizeY),s.uniform1i(C.uniforms.uPressure,o.read.attach(0)),s.uniform1i(C.uniforms.uVelocity,t.read.attach(1)),A(t.write),t.swap(),P.bind(),s.uniform2f(P.uniforms.texelSize,t.texelSizeX,t.texelSizeY),u.supportLinearFiltering||s.uniform2f(P.uniforms.dyeTexelSize,t.texelSizeX,t.texelSizeY);let l=t.read.attach(0);s.uniform1i(P.uniforms.uVelocity,l),s.uniform1i(P.uniforms.uSource,l),s.uniform1f(P.uniforms.dt,a),s.uniform1f(P.uniforms.dissipation,n.VELOCITY_DISSIPATION),A(t.write),t.swap(),u.supportLinearFiltering||s.uniform2f(P.uniforms.dyeTexelSize,e.texelSizeX,e.texelSizeY),s.uniform1i(P.uniforms.uVelocity,t.read.attach(0)),s.uniform1i(P.uniforms.uSource,e.read.attach(1)),s.uniform1f(P.uniforms.dissipation,n.DENSITY_DISSIPATION),A(e.write),e.swap()}(h),a=null,s.blendFunc(s.ONE,s.ONE_MINUS_SRC_ALPHA),s.enable(s.BLEND),m=(c=null,s.drawingBufferWidth),f=null==c?s.drawingBufferHeight:c.height,I.bind(),n.SHADING&&s.uniform2f(I.uniforms.texelSize,1/m,1/f),s.uniform1i(I.uniforms.uTexture,e.read.attach(0)),A(c),requestAnimationFrame(Y)}function H(){let e=$(a.clientWidth),t=$(a.clientHeight);return(a.width!=e||a.height!=t)&&(a.width=e,a.height=t,!0)}function V(r,i,o,l,u){var c;let d;U.bind(),s.uniform1i(U.uniforms.uTarget,t.read.attach(0)),s.uniform1f(U.uniforms.aspectRatio,a.width/a.height),s.uniform2f(U.uniforms.point,r,i),s.uniform3f(U.uniforms.color,o,l,0),s.uniform1f(U.uniforms.radius,(c=n.SPLAT_RADIUS/100,(d=a.width/a.height)>1&&(c*=d),c)),A(t.write),t.swap(),s.uniform1i(U.uniforms.uTarget,e.read.attach(0)),s.uniform3f(U.uniforms.color,u.r,u.g,u.b),A(e.write),e.swap()}function W(e,t,r,i){e.id=t,e.down=!0,e.moved=!1,e.texcoordX=r/a.width,e.texcoordY=1-i/a.height,e.prevTexcoordX=e.texcoordX,e.prevTexcoordY=e.texcoordY,e.deltaX=0,e.deltaY=0,e.color=K()}function q(e,t,r,i){var o,n;let l,s;e.prevTexcoordX=e.texcoordX,e.prevTexcoordY=e.texcoordY,e.texcoordX=t/a.width,e.texcoordY=1-r/a.height,o=e.texcoordX-e.prevTexcoordX,(l=a.width/a.height)<1&&(o*=l),e.deltaX=o,n=e.texcoordY-e.prevTexcoordY,(s=a.width/a.height)>1&&(n/=s),e.deltaY=n,e.moved=Math.abs(e.deltaX)>0||Math.abs(e.deltaY)>0,e.color=i}function K(){let e=function(e,t,r){let i,o,a,n,l,s,u,c;switch(n=Math.floor(6*e),l=6*e-n,s=0,u=r*(1-l*t),c=r*(1-(1-l)*t),n%6){case 0:i=r,o=c,a=s;break;case 1:i=u,o=r,a=s;break;case 2:i=s,o=r,a=c;break;case 3:i=s,o=u,a=r;break;case 4:i=c,o=s,a=r;break;case 5:i=r,o=s,a=u}return{r:i,g:o,b:a}}(Math.random(),1,1);return e.r*=.15,e.g*=.15,e.b*=.15,e}function Z(e){let t=s.drawingBufferWidth/s.drawingBufferHeight;t<1&&(t=1/t);let r=Math.round(e),i=Math.round(e*t);return s.drawingBufferWidth>s.drawingBufferHeight?{width:i,height:r}:{width:r,height:i}}function $(e){return Math.floor(e*(window.devicePixelRatio||1))}window.addEventListener("mousedown",e=>{let t=l[0];W(t,-1,$(e.clientX),$(e.clientY)),function(e){let t=K();t.r*=10,t.g*=10,t.b*=10;let r=10*(Math.random()-.5),i=30*(Math.random()-.5);V(e.texcoordX,e.texcoordY,r,i,t)}(t)}),document.body.addEventListener("mousemove",function e(t){let r=l[0],i=$(t.clientX),o=$(t.clientY),a=K();Y(),q(r,i,o,a),document.body.removeEventListener("mousemove",e)}),window.addEventListener("mousemove",e=>{let t=l[0],r=$(e.clientX),i=$(e.clientY),o=t.color;q(t,r,i,o)}),document.body.addEventListener("touchstart",function e(t){let r=t.targetTouches,i=l[0];for(let e=0;e<r.length;e++){let t=$(r[e].clientX),o=$(r[e].clientY);Y(),W(i,r[e].identifier,t,o)}document.body.removeEventListener("touchstart",e)}),window.addEventListener("touchstart",e=>{let t=e.targetTouches,r=l[0];for(let e=0;e<t.length;e++){let i=$(t[e].clientX),o=$(t[e].clientY);W(r,t[e].identifier,i,o)}}),window.addEventListener("touchmove",e=>{let t=e.targetTouches,r=l[0];for(let e=0;e<t.length;e++)q(r,$(t[e].clientX),$(t[e].clientY),r.color)},!1),window.addEventListener("touchend",e=>{let t=e.changedTouches,r=l[0];for(let e=0;e<t.length;e++)r.down=!1})},n=()=>((0,o.useEffect)(()=>{a()},[]),(0,i.jsx)("div",{className:"fixed top-0 left-0 z-0",children:(0,i.jsx)("canvas",{id:"fluid",className:"h-screen w-screen"})}));var l=r(9523),s=r(8213),u=r(7686),c=r(909),d=r(2688);let v=(0,d.A)("Cloud",[["path",{d:"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",key:"p7xjir"}]]);var m=r(1437),f=r(6085);let h=(0,d.A)("Car",[["path",{d:"M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",key:"5owen"}],["circle",{cx:"7",cy:"17",r:"2",key:"u2ysq9"}],["path",{d:"M9 17h6",key:"r8uit2"}],["circle",{cx:"17",cy:"17",r:"2",key:"axvx0g"}]]);var x=r(897),p=r(659),g=r(6919),E=r(2133);let y=(0,d.A)("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]),T=(0,d.A)("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]),R=(0,d.A)("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);var b=r(218),w=r(474),S=r(6189),D=r(8920);let A=["Full-Stack Developer","AI Enthusiast","Problem Solver"];function _(){let[e,t]=(0,o.useState)(0);return(0,i.jsx)("div",{className:"relative overflow-hidden",children:(0,i.jsx)(D.N,{mode:"wait",children:(0,i.jsx)(c.P.h1,{className:"inline-block leading-tight text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl",initial:{y:"100%"},animate:{y:"0%"},exit:{y:"-100%"},transition:{duration:.5,ease:"easeInOut"},children:A[e]},A[e])})})}let F=[{label:"Preparing for AWS Solutions Architect Associate exam",icon:v,color:"#F59E0B"},{label:"Building globalpsychicsassociation.com platform",icon:m.A,color:"#3B82F6"},{label:"Working with open source AI models",icon:f.A,color:"#A855F7"},{label:"V2V Negotiation research for autonomous vehicles at WSU",icon:h,color:"#10B981"}],U={Me:"Who are you? I want to know more about you.",Projects:"What are your projects? What are you working on right now?",Skills:"What are your skills? Give me a list of your soft and hard skills.",Contact:"How can I contact you?"},P=[{key:"Me",color:"#329696",icon:x.A},{key:"Projects",color:"#3E9858",icon:p.A},{key:"Skills",color:"#856ED9",icon:g.A},{key:"Contact",color:"#C19433",icon:E.A}];function N(){let[e,t]=(0,o.useState)(""),r=(0,S.useRouter)(),a=(0,o.useRef)(null),{theme:d,setTheme:v}=(0,b.D)(),m=e=>r.push(`/chat?query=${encodeURIComponent(e)}`);return(0,i.jsxs)("div",{className:"relative flex h-screen flex-col items-center justify-center overflow-hidden px-4",children:[(0,i.jsx)("div",{className:"pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden",children:(0,i.jsx)("div",{className:"hidden bg-gradient-to-b from-neutral-500/10 to-neutral-500/0 bg-clip-text text-[10rem] leading-none font-black text-transparent select-none sm:block lg:text-[16rem]",style:{marginBottom:"-2.5rem"},children:"Nur Islam"})}),(0,i.jsxs)("div",{className:"absolute top-6 right-8 z-20 flex items-center gap-3",children:[(0,i.jsxs)("button",{onClick:()=>v("dark"===d?"light":"dark"),className:"flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white/30 shadow-md backdrop-blur-lg transition hover:bg-white/60 dark:border-white/50 dark:hover:bg-neutral-800","aria-label":"Toggle theme",children:[(0,i.jsx)(y,{className:"h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0"}),(0,i.jsx)(T,{className:"absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100 dark:text-white"})]}),(0,i.jsx)(s.W,{animationDuration:1.5,label:"Star",size:"sm",repoUrl:"https://github.com/nursm86/ai_portfolio_published"})]}),(0,i.jsx)("div",{className:"absolute top-6 left-6 z-20",children:(0,i.jsxs)("button",{onClick:()=>m("Are you looking for an internship?"),className:"relative flex cursor-pointer items-center gap-2 rounded-full border bg-white/30 px-4 py-1.5 text-sm font-medium text-black shadow-md backdrop-blur-lg transition hover:bg-white/60 dark:border-white dark:text-white dark:hover:bg-neutral-800",children:[(0,i.jsxs)("span",{className:"relative flex h-2 w-2",children:[(0,i.jsx)("span",{className:"absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"}),(0,i.jsx)("span",{className:"relative inline-flex h-2 w-2 rounded-full bg-green-500"})]}),"Looking for a talent?"]})}),(0,i.jsxs)(c.P.div,{className:"z-1 mt-16 mb-4 flex flex-col items-center text-center md:mt-4 md:mb-6",variants:{hidden:{opacity:0,y:-60},visible:{opacity:1,y:0,transition:{type:"tween",duration:.8}}},initial:"hidden",animate:"visible",children:[(0,i.jsx)("div",{className:"z-100",children:(0,i.jsx)(u.A,{})}),(0,i.jsx)("h2",{className:"text-secondary-foreground mt-1 text-xl font-semibold md:text-2xl",children:"Hey, I'm Nur \uD83D\uDC4B"}),(0,i.jsx)(_,{})]}),(0,i.jsx)("div",{className:"relative z-10 h-40 w-40 overflow-hidden sm:h-52 sm:w-52",children:(0,i.jsx)(w.default,{src:"/landing-memojis.png",alt:"Hero memoji",width:2e3,height:2e3,priority:!0,className:"translate-y-14 scale-[2] object-cover"})}),(0,i.jsxs)(c.P.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{type:"tween",duration:.6,delay:.4},className:"z-10 mt-2 w-full max-w-2xl px-2",children:[(0,i.jsx)("p",{className:"mb-2 text-center text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400",children:"What I'm up to"}),(0,i.jsx)("div",{className:"flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide",children:F.map(({label:e,icon:t,color:r},o)=>(0,i.jsxs)(c.P.div,{initial:{opacity:0,y:12},animate:{opacity:1,y:0},transition:{delay:.5+.08*o},className:"flex min-w-[160px] max-w-[200px] shrink-0 items-center gap-2.5 rounded-xl border border-neutral-200 bg-white/30 px-3 py-2.5 backdrop-blur-lg dark:border-neutral-700 dark:bg-neutral-800/50",children:[(0,i.jsx)(t,{size:16,strokeWidth:2,color:r,className:"shrink-0"}),(0,i.jsx)("span",{className:"text-[11px] leading-tight font-medium text-neutral-700 dark:text-neutral-300",children:e})]},e))})]}),(0,i.jsxs)(c.P.div,{variants:{hidden:{opacity:0,y:80},visible:{opacity:1,y:0,transition:{type:"tween",duration:.8,delay:.2}}},initial:"hidden",animate:"visible",className:"z-10 mt-4 flex w-full flex-col items-center justify-center md:px-0",children:[(0,i.jsx)("form",{onSubmit:t=>{t.preventDefault(),e.trim()&&m(e.trim())},className:"relative w-full max-w-lg",children:(0,i.jsxs)("div",{className:"mx-auto flex items-center rounded-full border border-neutral-200 bg-white/30 py-2.5 pr-2 pl-6 backdrop-blur-lg transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600",children:[(0,i.jsx)("input",{ref:a,type:"text",value:e,onChange:e=>t(e.target.value),placeholder:"Ask me anything…",className:"w-full border-none bg-transparent text-base text-neutral-800 placeholder:text-neutral-500 focus:outline-none dark:text-neutral-200 dark:placeholder:text-neutral-500"}),(0,i.jsx)("button",{type:"submit",disabled:!e.trim(),"aria-label":"Submit question",className:"flex items-center justify-center rounded-full bg-[#0171E3] p-2.5 text-white transition-colors hover:bg-blue-600 disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-700",children:(0,i.jsx)(R,{className:"h-5 w-5"})})]})}),(0,i.jsx)("div",{className:"mt-4 flex w-full max-w-2xl justify-center gap-3",children:P.map(({key:e,color:t,icon:r})=>(0,i.jsx)(l.$,{onClick:()=>m(U[e]),variant:"outline",className:"border-border hover:bg-border/30 aspect-square w-24 cursor-pointer rounded-2xl border bg-white/30 py-8 shadow-none backdrop-blur-lg active:scale-95 dark:bg-neutral-800/50 dark:border-neutral-700 dark:hover:bg-neutral-700/50 md:w-28 md:p-10",children:(0,i.jsxs)("div",{className:"flex h-full flex-col items-center justify-center gap-1 text-gray-700 dark:text-gray-300",children:[(0,i.jsx)(r,{size:22,strokeWidth:2,color:t}),(0,i.jsx)("span",{className:"text-xs font-medium sm:text-sm",children:e})]})},e))})]}),(0,i.jsx)(n,{})]})}},7274:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>n.a,__next_app__:()=>d,pages:()=>c,routeModule:()=>v,tree:()=>u});var i=r(5239),o=r(8088),a=r(8170),n=r.n(a),l=r(893),s={};for(let e in l)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(s[e]=()=>l[e]);r.d(t,s);let u=["",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,1204)),"/Users/nursm/Downloads/P/ai_portfolio/src/app/page.tsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,1137)),"/Users/nursm/Downloads/P/ai_portfolio/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,7398,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(r.t.bind(r,9999,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(r.t.bind(r,5284,23)),"next/dist/client/components/unauthorized-error"]}],c=["/Users/nursm/Downloads/P/ai_portfolio/src/app/page.tsx"],d={require:r,loadChunk:()=>Promise.resolve()},v=new i.AppPageRouteModule({definition:{kind:o.RouteKind.APP_PAGE,page:"/page",pathname:"/",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:u}})},9121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")}};var t=require("../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[719,948,459,600,918],()=>r(7274));module.exports=i})();