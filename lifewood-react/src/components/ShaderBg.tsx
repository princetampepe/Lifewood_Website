/**
 * ShaderBg — GPU-accelerated animated background via raw WebGL.
 *
 * Features:
 * - Responsive, tied to viewport.
 * - Reads CSS custom properties for colour, respects data-theme="dark".
 * - Adjustable particle density & speed via props.
 * - Falls back to a static CSS gradient when WebGL isn't available.
 * - Respects prefers-reduced-motion.
 * - Low-power: capped DPR, small loops, requestAnimationFrame budget.
 */
import { useEffect, useRef, useState, type FC } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface ShaderBgProps {
  /** Animation speed multiplier. Default 1. */
  speed?: number;
  /** Particle / noise density. Default 1. */
  density?: number;
  /** Primary colour (hex). If not set, reads from --saffron. */
  colorA?: string;
  /** Secondary colour (hex). If not set, reads from --dark-serpent. */
  colorB?: string;
  /** Disable entirely. */
  enabled?: boolean;
  /** Extra className for the wrapper. */
  className?: string;
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
precision mediump float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec3  u_colorA;
uniform vec3  u_colorB;
uniform float u_density;
varying vec2  vUv;

// Simplex-style hash
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  vec2 u2=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u2.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u2.x),u2.y);
}
float fbm(vec2 p){
  float v=0.0,a=0.5;
  mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<4;i++){v+=a*noise(p);p=m*p*1.5;a*=0.5;}
  return v;
}

// Particle sparkles
float particles(vec2 uv,float t,float density){
  float acc=0.0;
  for(float i=0.0;i<32.0;i++){
    if(i>=density*32.0) break;
    vec2 seed=vec2(hash(vec2(i,0.0)),hash(vec2(0.0,i)));
    vec2 pos=seed+vec2(sin(t*0.3+i)*0.15,cos(t*0.2+i*1.3)*0.15);
    float d=distance(uv,pos);
    acc+=smoothstep(0.015,0.0,d)*0.35;
  }
  return acc;
}

void main(){
  vec2 uv=vUv;
  vec2 scaled=uv*u_resolution/min(u_resolution.x,u_resolution.y);
  float t=u_time;

  // Flowing silk noise
  float n1=fbm((scaled+vec2(0.0,t*0.12))*1.2);
  float n2=fbm((scaled*1.3+vec2(12.0,-t*0.08))*0.8);
  float v=mix(n1,n2,0.5);
  v=smoothstep(0.2,0.8,v);

  // Particle sparkle layer
  float p=particles(uv,t,u_density);

  // Mix colours
  vec3 base=mix(u_colorB,u_colorA,v*0.6+p);

  // Vignette
  float dist=distance(uv,vec2(0.5));
  base*=mix(1.0,0.55,pow(dist,1.4));

  gl_FragColor=vec4(base,0.85);
}`;

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

function getCSSVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('ShaderBg compile error:', gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

const ShaderBg: FC<ShaderBgProps> = ({
  speed = 1,
  density = 1,
  colorA,
  colorB,
  enabled = true,
  className = '',
}) => {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglOk, setWebglOk] = useState(true);
  const rafRef = useRef(0);

  const active = enabled && !reduced;

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    if (!gl) {
      setWebglOk(false);
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { setWebglOk(false); return; }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setWebglOk(false); return; }
    gl.useProgram(prog);

    // Quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uColorA = gl.getUniformLocation(prog, 'u_colorA');
    const uColorB = gl.getUniformLocation(prog, 'u_colorB');
    const uDensity = gl.getUniformLocation(prog, 'u_density');

    // Resolve colours from props or CSS vars
    const cA = hexToVec3(colorA ?? getCSSVar('--saffron', '#D4A017'));
    const cB = hexToVec3(colorB ?? getCSSVar('--dark-serpent', '#1A3A2A'));
    gl.uniform3f(uColorA, cA[0], cA[1], cA[2]);
    gl.uniform3f(uColorB, cB[0], cB[1], cB[2]);
    gl.uniform1f(uDensity, Math.max(0, Math.min(1, density)));

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const render = (now: number) => {
      gl.uniform1f(uTime, now * 0.001 * speed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    // Watch data-theme changes and update colours
    const observer = new MutationObserver(() => {
      const newA = hexToVec3(colorA ?? getCSSVar('--saffron', '#D4A017'));
      const newB = hexToVec3(colorB ?? getCSSVar('--dark-serpent', '#1A3A2A'));
      gl.uniform3f(uColorA, newA[0], newA[1], newA[2]);
      gl.uniform3f(uColorB, newB[0], newB[1], newB[2]);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      observer.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, colorA, colorB, density, speed]);

  if (!active) {
    // Static CSS gradient fallback
    return (
      <div
        className={`shader-bg shader-bg--fallback ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (!webglOk) {
    return (
      <div
        className={`shader-bg shader-bg--fallback ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`shader-bg ${className}`}
      aria-hidden="true"
    />
  );
};

export default ShaderBg;
