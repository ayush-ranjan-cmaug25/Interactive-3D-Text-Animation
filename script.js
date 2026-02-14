let scene, camera, renderer, particles;
const count = 12000;
let currentState = 'sphere';
let currentTheme = { hBase: 0.6, hVar: 0.1, s: 0.7, lBase: 0.4, lVar: 0.3 };
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.getElementById('container').appendChild(renderer.domElement);
    camera.position.z = 25;
    createParticles();
    setupEventListeners();
    setupColorPicker();
    setupInteraction();
    animate();
}
function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    function sphericalDistribution(i) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        return {
            x: 8 * Math.cos(theta) * Math.sin(phi),
            y: 8 * Math.sin(theta) * Math.sin(phi),
            z: 8 * Math.cos(phi)
        };
    }
    for (let i = 0; i < count; i++) {
        const point = sphericalDistribution(i);
        positions[i * 3] = point.x + (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.5;
        const color = new THREE.Color();
        const depth = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z) / 8;
        color.setHSL(currentTheme.hBase + depth * currentTheme.hVar, currentTheme.s, currentTheme.lBase + depth * currentTheme.lVar);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    if (particles) scene.remove(particles);
    particles = new THREE.Points(geometry, material);
    particles.rotation.x = 0;
    particles.rotation.y = 0;
    particles.rotation.z = 0;
    scene.add(particles);
}
function setupEventListeners() {
    const typeBtn = document.getElementById('typeBtn');
    const resetBtn = document.getElementById('resetBtn');
    const input = document.getElementById('morphText');
    typeBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) {
            morphToText(text);
        }
    });
    resetBtn.addEventListener('click', () => {
        if (currentState !== 'sphere') {
            morphToCircle();
        }
    });
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = input.value.trim();
            if (text) {
                morphToText(text);
            }
        }
    });
    window.addEventListener('resize', onWindowResize, false);
}
function setupColorPicker() {
    const colorPicker = document.getElementById('colorPicker');
    const typeBtn = document.getElementById('typeBtn');
    colorPicker.addEventListener('input', (e) => {
        const hex = e.target.value;
        const color = new THREE.Color(hex);
        const hsl = {};
        color.getHSL(hsl);
        currentTheme = {
            hBase: hsl.h,
            hVar: 0.05,
            s: hsl.s,
            lBase: hsl.l,
            lVar: 0.2
        };
        const color1 = `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${hsl.l * 100}%)`;
        const color2 = `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${(hsl.l - 0.1) * 100}%)`;
        typeBtn.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
        if (hsl.l > 0.5) {
            typeBtn.style.color = '#000000';
        } else {
            typeBtn.style.color = '#ffffff';
        }
        updateParticleColors(true);
    });
}
function setupInteraction() {
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    document.addEventListener('touchend', onDocumentMouseUp, false);
}
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;
    if (currentState === 'sphere' && isDragging) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        particles.rotation.y += deltaX * 0.005;
        particles.rotation.x += deltaY * 0.005;
        previousMousePosition = { x: event.clientX, y: event.clientY };
    }
}
function onDocumentMouseDown(event) {
    if (currentState === 'sphere') {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
    }
}
function onDocumentMouseUp() {
    isDragging = false;
}
function onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
        if (currentState === 'sphere') {
            isDragging = true;
            previousMousePosition = { x: event.touches[0].pageX, y: event.touches[0].pageY };
        }
    }
}
function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        mouseX = (event.touches[0].pageX - windowHalfX) / windowHalfX;
        mouseY = (event.touches[0].pageY - windowHalfY) / windowHalfY;
        if (currentState === 'sphere' && isDragging) {
            const deltaX = event.touches[0].pageX - previousMousePosition.x;
            const deltaY = event.touches[0].pageY - previousMousePosition.y;
            particles.rotation.y += deltaX * 0.005;
            particles.rotation.x += deltaY * 0.005;
            previousMousePosition = { x: event.touches[0].pageX, y: event.touches[0].pageY };
        }
    }
}
function updateParticleColors(immediate = false) {
    if (!particles) return;
    const colors = particles.geometry.attributes.color.array;
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];
        const depth = Math.sqrt(x * x + y * y + z * z) / 8;
        const color = new THREE.Color();
        color.setHSL(
            currentTheme.hBase + depth * currentTheme.hVar, 
            currentTheme.s, 
            currentTheme.lBase + depth * currentTheme.lVar
        );
        if (immediate) {
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        } else {
            gsap.to(colors, {
                [i * 3]: color.r,
                [i * 3 + 1]: color.g,
                [i * 3 + 2]: color.b,
                duration: 1,
                onUpdate: () => {
                    particles.geometry.attributes.color.needsUpdate = true;
                }
            });
        }
    }
    if (immediate) {
        particles.geometry.attributes.color.needsUpdate = true;
    }
}
function createTextPoints(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fontSize = 100;
    const padding = 20;
    ctx.font = `bold ${fontSize}px Arial`;
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;
    canvas.width = textWidth + padding * 2;
    canvas.height = textHeight + padding * 2;
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const points = [];
    const threshold = 128;
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > threshold) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);
                if (Math.random() < 0.3) {
                points.push({
                    x: (x - canvas.width / 2) / (fontSize / 10),
                    y: -(y - canvas.height / 2) / (fontSize / 10)
                });
            }
        }
    }
    return points;
}
function morphToText(text) {
    currentState = 'text';
    const textPoints = createTextPoints(text);
    const positions = particles.geometry.attributes.position.array;
    const targetPositions = new Float32Array(count * 3);
    gsap.to(particles.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5
    });
    for (let i = 0; i < count; i++) {
        if (i < textPoints.length) {
            targetPositions[i * 3] = textPoints[i].x;
            targetPositions[i * 3 + 1] = textPoints[i].y;
            targetPositions[i * 3 + 2] = 0;
        } else {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 20 + 10;
            targetPositions[i * 3] = Math.cos(angle) * radius;
            targetPositions[i * 3 + 1] = Math.sin(angle) * radius;
            targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
    }
    for (let i = 0; i < positions.length; i += 3) {
        gsap.to(particles.geometry.attributes.position.array, {
            [i]: targetPositions[i],
            [i + 1]: targetPositions[i + 1],
            [i + 2]: targetPositions[i + 2],
            duration: 2,
            ease: "power2.inOut",
            onUpdate: () => {
                particles.geometry.attributes.position.needsUpdate = true;
            }
        });
    }
}
function morphToCircle() {
    currentState = 'sphere';
    const positions = particles.geometry.attributes.position.array;
    const targetPositions = new Float32Array(count * 3);
    const colors = particles.geometry.attributes.color.array;
    function sphericalDistribution(i) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        return {
            x: 8 * Math.cos(theta) * Math.sin(phi),
            y: 8 * Math.sin(theta) * Math.sin(phi),
            z: 8 * Math.cos(phi)
        };
    }
    for (let i = 0; i < count; i++) {
        const point = sphericalDistribution(i);
        targetPositions[i * 3] = point.x + (Math.random() - 0.5) * 0.5;
        targetPositions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.5;
        targetPositions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.5;
        const depth = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z) / 8;
        const color = new THREE.Color();
        color.setHSL(currentTheme.hBase + depth * currentTheme.hVar, currentTheme.s, currentTheme.lBase + depth * currentTheme.lVar);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    for (let i = 0; i < positions.length; i += 3) {
        gsap.to(particles.geometry.attributes.position.array, {
            [i]: targetPositions[i],
            [i + 1]: targetPositions[i + 1],
            [i + 2]: targetPositions[i + 2],
            duration: 2,
            ease: "power2.inOut",
            onUpdate: () => {
                particles.geometry.attributes.position.needsUpdate = true;
            }
        });
    }
    for (let i = 0; i < colors.length; i += 3) {
        gsap.to(particles.geometry.attributes.color.array, {
            [i]: colors[i],
            [i + 1]: colors[i + 1],
            [i + 2]: colors[i + 2],
            duration: 2,
            ease: "power2.inOut",
            onUpdate: () => {
                particles.geometry.attributes.color.needsUpdate = true;
            }
        });
    }
}
function animate() {
    requestAnimationFrame(animate);
    if (currentState === 'sphere') {
        if (!isDragging) {
            particles.rotation.y += 0.002;
        }
    } else if (currentState === 'text') {
        const targetRotationX = mouseY * 0.5;
        const targetRotationY = mouseX * 0.5;
        particles.rotation.x += (targetRotationX - particles.rotation.x) * 0.05;
        particles.rotation.y += (targetRotationY - particles.rotation.y) * 0.05;
    }
    renderer.render(scene, camera);
}
init();
