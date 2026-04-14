// blog.js — Antigravity particle animation for blog hero
// Matches the React Antigravity component: magnetRadius=6, ringRadius=7
// Particles float freely; those near the cursor form a ring around it.
(function () {
  if (typeof THREE === 'undefined') return;

  // Mirror the React component props exactly
  const CONFIG = {
    count:          300,
    magnetRadius:   6,    // only particles within 6 world-units of cursor are attracted
    ringRadius:     7,    // ring radius in world units
    waveSpeed:      0.4,
    waveAmplitude:  1,
    particleSize:   1.5,
    lerpSpeed:      0.05,
    color:          '#4AAEE4',
    autoAnimate:    true,
    particleVariance: 1,
    pulseSpeed:     3,
    fieldStrength:  10,
    depthFactor:    1,
  };

  function init() {
    const hero = document.querySelector('header.masthead');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'antigravity-canvas';
    hero.insertBefore(canvas, hero.firstChild);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
      canvas.remove();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    // Camera matches the React Canvas default: position z=50, fov=35
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
    camera.position.set(0, 0, 50);

    function getVP() {
      const dist  = camera.position.z;
      const vFov  = (camera.fov * Math.PI) / 180;
      const h     = 2 * Math.tan(vFov / 2) * dist;
      return { width: h * camera.aspect, height: h };
    }

    function resize() {
      const w = hero.offsetWidth  || window.innerWidth;
      const h = hero.offsetHeight || 380;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    // Spawn particles spread across the full viewport (same as React useMemo)
    const vp = getVP();
    const particles = [];
    for (let i = 0; i < CONFIG.count; i++) {
      const x = (Math.random() - 0.5) * vp.width;
      const y = (Math.random() - 0.5) * vp.height;
      const z = (Math.random() - 0.5) * 20;
      particles.push({
        t:  Math.random() * 100,
        speed: 0.01 + Math.random() / 200,
        mx: x, my: y, mz: z,   // resting position
        cx: x, cy: y, cz: z,   // current position
        randomRadiusOffset: (Math.random() - 0.5) * 2,
      });
    }

    const geometry = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
    const material = new THREE.MeshBasicMaterial({ color: CONFIG.color });
    const mesh     = new THREE.InstancedMesh(geometry, material, CONFIG.count);
    scene.add(mesh);

    const dummy = new THREE.Object3D();
    const mouse = { x: 0, y: 0 };
    const virtualMouse  = { x: 0, y: 0 };
    let lastMouseMoveTime = 0;

    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      const ndcX =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      const ndcY = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      const v = getVP();
      mouse.x = (ndcX * v.width)  / 2;
      mouse.y = (ndcY * v.height) / 2;
      lastMouseMoveTime = Date.now();
    });

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // After 500 ms idle, auto-animate target in a Lissajous path (same as React)
      let destX = mouse.x, destY = mouse.y;
      if (CONFIG.autoAnimate && Date.now() - lastMouseMoveTime > 500) {
        const v = getVP();
        destX = Math.sin(elapsed * 0.5)       * (v.width  / 4);
        destY = Math.cos(elapsed * 0.5 * 2)   * (v.height / 4);
      }

      // Smooth the virtual-mouse position (smoothFactor=0.05 from React)
      virtualMouse.x += (destX - virtualMouse.x) * 0.05;
      virtualMouse.y += (destY - virtualMouse.y) * 0.05;

      const vmx = virtualMouse.x;
      const vmy = virtualMouse.y;

      particles.forEach((p, i) => {
        p.t += p.speed / 2;

        // Distance from particle's REST position to the virtual mouse
        const dx   = p.mx - vmx;
        const dy   = p.my - vmy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Default: particle drifts back to its rest position
        let tx = p.mx, ty = p.my, tz = p.mz * CONFIG.depthFactor;

        // If within magnetRadius: pull into the ring (same logic as React)
        if (dist < CONFIG.magnetRadius) {
          const angle = Math.atan2(dy, dx);
          const wave  = Math.sin(p.t * CONFIG.waveSpeed + angle) * 0.5 * CONFIG.waveAmplitude;
          const dev   = p.randomRadiusOffset * (5 / (CONFIG.fieldStrength + 0.1));
          const r     = CONFIG.ringRadius + wave + dev;

          tx = vmx + r * Math.cos(angle);
          ty = vmy + r * Math.sin(angle);
          tz = p.mz * CONFIG.depthFactor + Math.sin(p.t) * CONFIG.waveAmplitude * CONFIG.depthFactor;
        }

        p.cx += (tx - p.cx) * CONFIG.lerpSpeed;
        p.cy += (ty - p.cy) * CONFIG.lerpSpeed;
        p.cz += (tz - p.cz) * CONFIG.lerpSpeed;

        dummy.position.set(p.cx, p.cy, p.cz);
        dummy.lookAt(vmx, vmy, p.cz);
        dummy.rotateX(Math.PI / 2);

        // Scale logic from React: fade out particles far from the ring,
        // but use min 0.08 so drifting particles are still faintly visible
        const distToMouse  = Math.sqrt((p.cx - vmx) ** 2 + (p.cy - vmy) ** 2);
        const distFromRing = Math.abs(distToMouse - CONFIG.ringRadius);
        const ringFade     = Math.max(0, Math.min(1, 1 - distFromRing / 10));
        const pulse        = 0.8 + Math.sin(p.t * CONFIG.pulseSpeed) * 0.2 * CONFIG.particleVariance;
        // Particles in ring → full size; drifting particles → small sparks (min 0.08)
        const finalScale   = (0.08 + ringFade * 0.92) * pulse * CONFIG.particleSize;

        dummy.scale.setScalar(Math.max(0.04, finalScale));
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });

      mesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    }

    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
