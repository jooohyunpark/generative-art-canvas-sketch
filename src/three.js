const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes/1000.json').slice(250);

random.setSeed(random.getRandomSeed());

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

const isometric = true;
const simplePalette = true;
const palette = simplePalette ? ['#efb3b3', '#a0d0e8'] : random.shuffle(random.pick(palettes)).slice(0, 2);

const settings = {
  dimensions: [1440, 1440],
  exportPixelRatio: 2,
  scaleToView: true,
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
  // animate: true,
  fps: 24,
  duration: 8,
  // Turn on MSAA
  attributes: { antialias: true },
  seed: random.getSeed()
};

const sketch = ({ context, update }) => {

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context
  });

  // WebGL background color
  renderer.setClearColor('#000', 1);

  // Setup a camera
  const camera = isometric
    ? new THREE.OrthographicCamera()
    : new THREE.PerspectiveCamera(45, 1, 0.01, 100);

  // Setup your scene
  const scene = new THREE.Scene();
  let array = [];

  const count = 10;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  for (let x = 0; x < count; x++) {
    for (let y = 0; y < count; y++) {
      const U = x / (count - 1);
      const V = y / (count - 1);
      const spacing = 1.9;
      const u = (U * 2 - 1) * spacing;
      const v = (V * 2 - 1) * spacing;

      const material = new THREE.MeshStandardMaterial({
        roughness: 0.75,
        metalness: 0.25,
        color: new THREE.Color(random.pick(palette))
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(
        random.gaussian(),
        random.gaussian(),
        random.gaussian()
      ).multiplyScalar(0.08 * random.gaussian());
      mesh.position.set(
        u,
        0,
        v
      );
      scene.add(mesh);
      array.push(mesh)
      console.log(u, v)
    }
  }

  // Specify an ambient/unlit colour
  // scene.add(new THREE.AmbientLight('#181818'));

  // Add some light
  const light = new THREE.DirectionalLight('white', 4);
  light.position.set(-1, 0, 1);
  light.lookAt(new THREE.Vector3());
  scene.add(light);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      if (isometric) {
        // Setup an isometric perspective
        const aspect = viewportWidth / viewportHeight;
        const zoom = 2.25;
        const offset = settings.animate ? 0.25 : 0.25;
        camera.left = -zoom * aspect;
        camera.right = zoom * aspect;
        camera.top = zoom + offset;
        camera.bottom = -zoom + offset;
        camera.near = -100;
        camera.far = 100;
        camera.position.set(0, zoom, 0);
        camera.lookAt(new THREE.Vector3());
      } else {
        camera.aspect = viewportWidth / viewportHeight;
      }
      camera.updateProjectionMatrix();
    },
    // And render events here
    render({ playhead, frame, width, height }) {

      // console.log(array)

      if (settings.animate) {
        for (let i = 0; i < count * count; i++) {
          array[i].rotation.z = Math.PI * 2 * loopNoise(array[i].scale.x, array[i].scale.y, array[i].scale.z, playhead)
        }
      }
      camera.setViewOffset(width, height, 0, 25, width, height);
      renderer.render(scene, camera);
    },
    // Dispose of WebGL context (optional)
    unload() {
      renderer.dispose();
    }
  };


  function loopNoise(x, y, z, t, scale = 1) {
    const duration = scale;
    const current = t * scale;
    return ((duration - current) * random.noise4D(x, y, z, current) + current * random.noise4D(x, y, z, current - duration)) / duration;
  }


};

canvasSketch(sketch, settings);