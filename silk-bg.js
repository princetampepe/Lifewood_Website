// silk-bg.js — uses global THREE from CDN

(function(){
    // Wait for THREE to be available
    if (typeof THREE === 'undefined') {
        console.error('THREE.js not loaded yet');
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.id = 'silk-canvas';
    document.body.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_color: { value: new THREE.Color('#89ff29') },
        u_scale: { value: 1.0 },
        u_noiseIntensity: { value: 1.5 }
    };

    const vertex = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
    `;

    const fragment = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec3 u_color;
    uniform float u_scale;
    uniform float u_noiseIntensity;
    varying vec2 vUv;

    // IQ's hash / noise
    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
    }
    float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        float a = hash(i+vec2(0.0,0.0));
        float b = hash(i+vec2(1.0,0.0));
        float c = hash(i+vec2(0.0,1.0));
        float d = hash(i+vec2(1.0,1.0));
        return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
    }
    float fbm(vec2 p){
        float v = 0.0;
        float a = 0.5;
        mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
        for(int i=0;i<5;i++){
            v += a * noise(p);
            p = m * p * 1.7;
            a *= 0.5;
        }
        return v;
    }

    void main(){
        vec2 uv = vUv * u_resolution.xy / min(u_resolution.x, u_resolution.y);
        vec2 q = uv;
        float t = u_time * 0.2;

        // layered fbm to imitate flowing silk
        float n1 = fbm((q + vec2(0.0, t*0.6)) * (1.0 * u_scale));
        float n2 = fbm((q*1.3 + vec2(12.0, -t*0.4)) * (0.6 * u_scale));
        float n3 = fbm((q*2.0 + vec2(-7.0, t*0.8)) * (0.35 * u_scale));

        float v = mix(n1, n2, 0.5) * 0.7 + n3 * 0.4;
        v = smoothstep(0.15, 0.85, v * u_noiseIntensity);

        // soft bands for silk effect
        float bands = sin((q.x + v*0.8 + t*0.3) * 6.0) * 0.5 + 0.5;
        float shimmer = pow(bands * v, 1.6);

        vec3 color = mix(vec3(0.02, 0.02, 0.02), u_color, shimmer);
        // gentle vignette
        float dist = distance(vUv, vec2(0.5));
        color *= mix(1.0, 0.6, pow(dist, 1.5));

        gl_FragColor = vec4(color, 1.0);
    }
    `;

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    function resize(){
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        uniforms.u_resolution.value.set(w, h);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    let last = performance.now();
    function render(now){
        const dt = now - last;
        last = now;
        uniforms.u_time.value = now * 0.001;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

})();
