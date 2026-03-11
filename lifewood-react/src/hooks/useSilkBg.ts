/**
 * useSilkBg — port of silk-bg.js into a typed React hook.
 * Renders the flowing-silk GLSL shader onto a <canvas> passed via ref.
 * Respects prefers-reduced-motion and handles resize / cleanup.
 */
import { useEffect, useRef, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

export interface SilkBgOptions {
  /** Main silk colour (CSS hex/rgb). Default '#89ff29'. */
  color?: string;
  /** FBM noise scale. Default 1.0. */
  scale?: number;
  /** Noise intensity. Default 1.5. */
  noiseIntensity?: number;
  /** Animation speed multiplier. Default 1.0. */
  speed?: number;
}

/* ── Shaders ── */
const VERT = `
attribute vec2 a_position;
varying vec2 vUv;
void main(){
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec3  u_color;
uniform float u_scale;
uniform float u_noiseIntensity;
varying vec2  vUv;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  vec2 u2=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u2.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u2.x),u2.y);
}
float fbm(vec2 p){
  float v=0.0,a=0.5;
  mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){v+=a*noise(p);p=m*p*1.7;a*=0.5;}
  return v;
}
void main(){
  vec2 uv=vUv*u_resolution/min(u_resolution.x,u_resolution.y);
  float t=u_time*0.2;
  float n1=fbm((uv+vec2(0,t*0.6))*(1.0*u_scale));
  float n2=fbm((uv*1.3+vec2(12,-t*0.4))*(0.6*u_scale));
  float n3=fbm((uv*2.0+vec2(-7,t*0.8))*(0.35*u_scale));
  float v=mix(n1,n2,0.5)*0.7+n3*0.4;
  v=smoothstep(0.15,0.85,v*u_noiseIntensity);
  float bands=sin((uv.x+v*0.8+t*0.3)*6.0)*0.5+0.5;
  float shimmer=pow(bands*v,1.6);
  vec3 col=mix(vec3(0.02),u_color,shimmer);
  float dist=distance(vUv,vec2(0.5));
  col*=mix(1.0,0.6,pow(dist,1.5));
  gl_FragColor=vec4(col,1.0);
}`;

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Silk shader error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function useSilkBg(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: SilkBgOptions = {},
) {
  const reduced = useReducedMotion();
  const rafRef = useRef(0);
  const speedRef = useRef(options.speed ?? 1);

  // Allow dynamic speed updates
  useEffect(() => {
    speedRef.current = options.speed ?? 1;
  }, [options.speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
    if (!gl) return; // WebGL not available — silent fallback

    // Compile program
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uColor = gl.getUniformLocation(program, 'u_color');
    const uScale = gl.getUniformLocation(program, 'u_scale');
    const uNoise = gl.getUniformLocation(program, 'u_noiseIntensity');

    const color = hexToVec3(options.color ?? '#89ff29');
    gl.uniform3f(uColor, color[0], color[1], color[2]);
    gl.uniform1f(uScale, options.scale ?? 1.0);
    gl.uniform1f(uNoise, options.noiseIntensity ?? 1.5);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 1.5); // cap for perf
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    function render(now: number) {
      gl!.uniform1f(uTime, now * 0.001 * speedRef.current);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, reduced, options.color, options.scale, options.noiseIntensity]);
}
