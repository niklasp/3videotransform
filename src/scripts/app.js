import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { monitorScroll, loadModels } from './util';

//import shaders
import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';
import videoShader from '../shaders/videoshader.glsl';

import image from '../../public/img1.jpeg';
import dat from 'dat.gui';

//import your models
import model from '../models/model.glb';
export default class Sketch {
  constructor( options ) {

    this.time = 0;
    this.container = options.dom;
    this.scrollPercentage = 0.0;

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    const fov = 40;
    const near = 0.01;
    const far = 100;

    const frustumSize = 1;

    this.scene = new THREE.Scene();
    // this.camera = new THREE.PerspectiveCamera( fov, this.width / this.height, near, far );
    
    this.camera = new THREE.OrthographicCamera( - frustumSize / 2, frustumSize / 2, frustumSize / 2, - frustumSize / 2 );
    this.camera.position.z = -1;

    // const gridHelper = new THREE.GridHelper( 100, 100 );
    // this.scene.add( gridHelper );

    this.renderer = new THREE.WebGLRenderer( {
      antialias: false,
      autoClear: true,
      alpha: true,
      powerPreference: "high-performance",
    } );

    this.renderer.setSize( this.width, this.height );
    this.renderer.setClearColor( 0x000000, 0 ); // the default
    this.container.appendChild( this.renderer.domElement );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.settings();
    this.setupListeners();
    this.addObjects();
    this.render();
    this.resize();
  }

  setupListeners() {
    window.addEventListener( 'resize', this.resize.bind( this ) );
    monitorScroll(ratio => {
      this.scrollPercentage = (ratio).toFixed(3);
    });
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize( this.width, this.height );
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  settings() {
    this.settings = {
      progress: 0.0,
      scale: 0.5,
    };
    this.gui = new dat.GUI();
    this.gui.add( this.settings, "progress", 0, 1, 0.01 );
    this.gui.add( this.settings, "scale", 0, 2, 0.01 );
  }

  addObjects() {

    // this.mesh = new THREE.Mesh( this.geometry, this.material );
    // this.scene.add( this.mesh );

    // loadModels(
    //   model,
    //   ( gltf ) => {
    //     console.log( 'hello', gltf );
    //     this.scene.add( gltf.scene );
    //     gltf.scene.scale.set( 0.5, 0.5, 0.5 );

    //     gltf.scene.traverse( o => {
    //       if ( o.isMesh ) {
    //         o.geometry.center();
    //         o.material = this.material;
    //       }
    //     });
    //   }
    // );

    this.videoDOM = document.getElementById('video-background');
    this.video = new THREE.VideoTexture( this.videoDOM );
    this.video.needsUpdate = true;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_circleScale: { value: 0.5 },
        u_video: { value: this.video },
        u_viewport: { value: new THREE.Vector2( this.width, this.height ) },
        u_image: { value: new THREE.TextureLoader().load( image ) },
      },
      side: THREE.DoubleSide,
      fragmentShader: videoShader,
      vertexShader,
    });

    this.geometry = new THREE.PlaneGeometry(1,1,1,1);
    this.plane = new THREE.Mesh( this.geometry, this.material );
    this.scene.add( this.plane );
  }

  render() {
    this.time += 0.05;
    this.material.uniforms.u_time.value = this.time;
    this.material.uniforms.u_circleScale.value = this.settings.scale;
    // this.mesh.rotation.x = this.time / 20;
    // this.mesh.rotation.y = this.time / 10;

    this.renderer.render( this.scene, this.camera );
    window.requestAnimationFrame( this.render.bind( this ) );
  }
}