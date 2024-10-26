import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import gsap from "gsap";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.z = 3.5;

let model;

// HDRI ko load karne ke liye loader create kiya
const rgbeLoader = new RGBELoader();

// HDRI ko load karne ka function
function loadHDRI() {
  rgbeLoader.load(
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr",
    function (texture) {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      pmremGenerator.dispose();

      scene.environment = envMap;
    }
  );
}

// HDRI ko load karne ke liye function call kiya
loadHDRI();

// GLTF model ko load karne ke liye loader create kiya
const loader = new GLTFLoader();

// Model ko load karne ka function
function loadModel() {
  loader.load(
    "./DamagedHelmet.gltf",
    function (gltf) {
      model = gltf.scene;
      scene.add(model);
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      console.error("Error loading model:", error);
    }
  );
}

// Model ko load karne ke liye function call kiya
loadModel();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
  alpha: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Postprocessing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// RGB Shift effect ko add kiya
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms["amount"].value = 0.003;
composer.addPass(rgbShiftPass);

window.addEventListener("mousemove", (e) => {
  if (model) {
    const rotationX = (e.clientY / window.innerHeight - 0.5) * (Math.PI * .3);
    const rotationY = (e.clientX / window.innerWidth - 0.5) * (Math.PI * .3);
    gsap.to(model.rotation, {
      x: rotationX,
      y: rotationY,
      duration: 1.8,
      ease: "power3.out"
    });
  }
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  window.requestAnimationFrame(animate);
  composer.render();
}

animate();
