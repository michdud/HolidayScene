"use strict";
/* exported Scene */
class Scene extends UniformProvider {
  constructor(gl) {
    super("scene");
    this.programs = [];
    this.gameObjects = [];

    this.createFragmentShaders(gl);
    this.createVertexShaders(gl);
    this.createPrograms(gl);
    this.createGeometries(gl);    

    this.timeAtFirstFrame = new Date().getTime();
    this.timeAtLastFrame = this.timeAtFirstFrame;

    this.traceMaterial = new Material(this.traceProgram);
    this.envTexture = new TextureCube(gl, [
      "media/posx.jpg",
      "media/negx.jpg",
      "media/posy.jpg",
      "media/negy.jpg",
      "media/posz.jpg",
      "media/negz.jpg",]
      );
    this.traceMaterial.envTexture.set(this.envTexture);
    this.traceMesh = new Mesh(this.traceMaterial, this.texturedQuadGeometry);
    this.infiniteMesh = new Mesh(this.traceMaterial, this.infinitePlaneGeometry);

    this.traceQuad = new GameObject(this.traceMesh);
    this.infiniteMesh = new GameObject(this.infiniteMesh);
    this.gameObjects.push(this.traceQuad);

    this.clippedQuadrics = [];
    for(let i = 0; i < 15; i++) {
        this.makeClippedQuadric();
    } 

    this.clippedQuadrics[0].transform(
        new Mat4(1, 0, 0, 0,
                 0, 1, 0, 0,
                 0, 0, 1, 0,
                 3, 10, 0, 1));
    
    this.clippedQuadrics[0].specularColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[1].specularColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[2].specularColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[3].specularColor = new Vec3(1.0, 1.0, 1.0);

    this.createSnowman();

    this.createInfiniteSurface();

    this.createFir();

    this.createLights();

    this.createBaubles();

    this.camera = new PerspectiveCamera(...this.programs); 
    this.camera.position.set(0, 5, 25);
    this.camera.update();
    this.addComponentsAndGatherUniforms(...this.programs);

    gl.enable(gl.DEPTH_TEST);
  }

  makeClippedQuadric() {
    this.clippedQuadrics.push(new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
  }

  createFragmentShaders(gl) {
    this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured-fs.glsl");
    this.fsTrace = new Shader(gl, gl.FRAGMENT_SHADER, "trace-fs.glsl");
    this.fsShow = new Shader(gl, gl.FRAGMENT_SHADER, "show-fs.glsl");
  }

  createVertexShaders(gl) {
    this.vsTextured = new Shader(gl, gl.VERTEX_SHADER, "textured-vs.glsl");
    this.vsQuad = new Shader(gl, gl.VERTEX_SHADER, "quad-vs.glsl");
  }

  createPrograms(gl) {
    this.programs.push( 
        this.texturedProgram = new TexturedProgram(gl, this.vsTextured, this.fsTextured));    
    this.programs.push( 
        this.traceProgram = new TexturedProgram(gl, this.vsQuad, this.fsTrace));
    this.programs.push( 
      this.showProgram = new TexturedProgram(gl, this.vsQuad, this.fsShow));
  }

  createGeometries(gl) {
    this.texturedQuadGeometry = new TexturedQuadGeometry(gl);
    this.infinitePlaneGeometry = new InfinitePlaneGeometry(gl);
  }

  createSnowman() {
    this.clippedQuadrics[1].makeUnitSphere();
    this.clippedQuadrics[1].transform(
        new Mat4().translate(0, 2, 0));
    this.clippedQuadrics[1].shininess = 0.0;
    this.clippedQuadrics[1].materialColor = new Vec3(1.0, 1.0, 1.0);

    this.clippedQuadrics[2].makeUnitSphere();
    this.clippedQuadrics[2].transform(new Mat4().scale(0.8, 0.8, 0.8).translate(0, 3, 0));
    this.clippedQuadrics[2].materialColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[2].shininess = 0.0;

    this.clippedQuadrics[0].makeUnitSphere();
    this.clippedQuadrics[0].shininess = 0.0;
    this.clippedQuadrics[0].transform(new Mat4().scale(0.6, 0.6, 0.6).translate(0, 4, 0));
    this.clippedQuadrics[0].materialColor = new Vec3(1.0, 1.0, 1.0);

    this.clippedQuadrics[8].specularColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[9].specularColor = new Vec3(1.0, 1.0, 1.0);

    this.clippedQuadrics[8].makeUnitSphere();
    this.clippedQuadrics[8].shininess = 0.0;
    this.clippedQuadrics[8].transform(new Mat4().scale(0.1, 0.1, 0.1).translate(-0.2, 4.2, 0.5));
    this.clippedQuadrics[8].materialColor = new Vec3(0.0, 0.0, 0.0);

    this.clippedQuadrics[9].makeUnitSphere();
    this.clippedQuadrics[9].shininess = 0.0;
    this.clippedQuadrics[9].transform(new Mat4().scale(0.1, 0.1, 0.1).translate(0.2, 4.2, 0.5));
    this.clippedQuadrics[9].materialColor = new Vec3(0.0, 0.0, 0.0);

    this.clippedQuadrics[10].specularColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[10].makeUnitCone();
    this.clippedQuadrics[10].shininess = 0.0;
    this.clippedQuadrics[10].transform(new Mat4().rotate(Math.PI, new Vec3(0, -1, 1)).scale(0.05, 0.05, 0.24).translate(0.0, 4.0, 1.0));
    this.clippedQuadrics[10].materialColor = new Vec3(1.0, 0.58, 0.0);
  }

  createInfiniteSurface() {
    this.makeClippedQuadric();
    this.clippedQuadrics[3].makeInfiniteSurface();
    this.clippedQuadrics[3].shininess = 10.0;
    this.clippedQuadrics[3].materialColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[3].reflectance = 1.0;
  }

  createFir() {
    for (let i = 4; i <= 7; i++) {
        this.clippedQuadrics[i].specularColor = new Vec3(1.0, 1.0, 1.0);
    }

    this.clippedQuadrics[4].makeUnitCone();
    this.clippedQuadrics[4].transform(new Mat4().rotate(Math.PI).scale(0.8, 1.0, 0.8).translate(10, 4, 0));
    this.clippedQuadrics[4].materialColor = new Vec3(0.0, 1.0, 0.0);
    this.clippedQuadrics[4].shininess = 0.0;

    this.clippedQuadrics[5].makeUnitCone();
    this.clippedQuadrics[5].transform(new Mat4().rotate(Math.PI).scale(0.7, 0.7, 0.7).translate(10, 4.6, 0));
    this.clippedQuadrics[5].materialColor = new Vec3(0.0, 1.0, 0.0);
    this.clippedQuadrics[5].shininess = 0.0;

    this.clippedQuadrics[6].makeUnitCone();
    this.clippedQuadrics[6].transform(new Mat4().rotate(Math.PI).scale(0.5, 0.5, 0.5).translate(10, 5.1, 0));
    this.clippedQuadrics[6].materialColor = new Vec3(0.0, 1.0, 0.0);
    this.clippedQuadrics[6].shininess = 0.0;

    this.clippedQuadrics[7].makeUnitCylinder();
    this.clippedQuadrics[7].transform(new Mat4().scale(0.3, 1.0, 0.3).translate(10, 1, 0));
    this.clippedQuadrics[7].shininess = 0.0;
    this.clippedQuadrics[7].materialColor = new Vec3(0.89, 0.62, 0.06);
  }

  createLights() {
    this.lights = [];
    this.lights.push(new Light(this.lights.length, ...this.programs));
    this.lights[0].position.set(10, 8.0, 0.0, 1).normalize();
    this.lights[0].powerDensity.set(0.02, 0.02, 0.02);

    this.lights.push(new Light(this.lights.length, ...this.programs));
    this.lights[1].position.set(1, 1, 1, 0).normalize();
    this.lights[1].powerDensity.set(0.4, 0.46, 0.5);
  }

  createBaubles() {
    this.clippedQuadrics[11].makeUnitSphere();
    this.clippedQuadrics[11].transform(new Mat4().scale(0.3, 0.5, 0.3).translate(5, 5.5, 1, 1));
    this.clippedQuadrics[11].shininess = 1.0;
    this.clippedQuadrics[11].materialColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[11].reflectance = 1.0;

    this.clippedQuadrics[12].makeUnitSphere();
    this.clippedQuadrics[12].transform(new Mat4().scale(0.4, 0.3, 0.1).translate(3, 7, 2, 1));
    this.clippedQuadrics[12].shininess = 1.0;
    this.clippedQuadrics[12].materialColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[12].reflectance = 1.0;

    this.clippedQuadrics[13].makeUnitSphere();
    this.clippedQuadrics[13].transform(new Mat4().scale(0.1, 0.8, 0.1).translate(2, 6, 1, 1));
    this.clippedQuadrics[13].shininess = 1.0;
    this.clippedQuadrics[13].materialColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[13].reflectance = 1.0;

    this.clippedQuadrics[14].makeUnitSphere();
    this.clippedQuadrics[14].transform(new Mat4().scale(0.1, 0.1, 0.1).translate(10, 5.3, 0, 1));
    this.clippedQuadrics[14].shininess = 1.0;
    this.clippedQuadrics[14].materialColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[14].reflectance = 1.0;
  }

  updateBaubles(t) {
    this.clippedQuadrics[11].makeUnitSphere();
    this.clippedQuadrics[11].transform(new Mat4().scale(0.3, 0.5, 0.3).rotate(t, 1, 1, 1).translate(5, 5.5, 1, 1));
    this.clippedQuadrics[11].shininess = 1.0;
    this.clippedQuadrics[11].materialColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[11].reflectance = 1.0;


    this.clippedQuadrics[12].makeUnitSphere();
    this.clippedQuadrics[12].transform(new Mat4().scale(0.4, 0.3, 0.1).rotate(-t*2, 0, 1, 1).translate(3, 7, 2, 1));
    this.clippedQuadrics[12].shininess = 1.0;
    this.clippedQuadrics[12].materialColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[12].reflectance = 1.0;

    this.clippedQuadrics[13].makeUnitSphere();
    this.clippedQuadrics[13].transform(new Mat4().scale(0.1, 0.8, 0.1).rotate(t*5, 1, 0, 1).translate(2, 6, 1, 1));
    this.clippedQuadrics[13].shininess = 1.0;
    this.clippedQuadrics[13].materialColor = new Vec3(1.0, 1.0, 1.0);
    this.clippedQuadrics[13].reflectance = 1.0;
  }

  updateFir(t) {
    this.clippedQuadrics[6].makeUnitCone();
    this.clippedQuadrics[6].transform(new Mat4().rotate(Math.PI).scale(0.5, 0.5, 0.5).rotate(Math.cos(t) / 10).translate(10, 5.1, 0));
    this.clippedQuadrics[6].materialColor = new Vec3(0.0, 1.0, 0.0);
    this.clippedQuadrics[6].shininess = 0.0;

    this.clippedQuadrics[5].makeUnitCone();
    this.clippedQuadrics[5].transform(new Mat4().rotate(Math.PI).scale(0.7, 0.7, 0.7).rotate(-Math.cos(t) / 20).translate(10, 4.6, 0));
    this.clippedQuadrics[5].materialColor = new Vec3(0.0, 1.0, 0.0);
    this.clippedQuadrics[5].shininess = 0.0;

    this.clippedQuadrics[4].makeUnitCone();
    this.clippedQuadrics[4].transform(new Mat4().rotate(Math.PI).scale(0.8, 1.0, 0.8).rotate(Math.cos(t) / 23).translate(10, 4, 0));
    this.clippedQuadrics[4].materialColor = new Vec3(0.0, 1.0, 0.0);
    this.clippedQuadrics[4].shininess = 0.0;
  }

  resize(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    this.camera.setAspectRatio(canvas.width / canvas.height);
  }

  update(gl, keysPressed) {
    //jshint bitwise:false
    //jshint unused:false
    const timeAtThisFrame = new Date().getTime();
    const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
    const t = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0; 
    this.timeAtLastFrame = timeAtThisFrame;

    this.time = t;

    this.updateBaubles(t);

    this.updateFir(t);

    // clear the screen
    gl.clearColor(0.3, 0.0, 0.3, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.camera.move(dt, keysPressed);

    for(const gameObject of this.gameObjects) {
        gameObject.update();
    }
    for(const gameObject of this.gameObjects) {
        gameObject.draw(this, this.camera, ...this.clippedQuadrics, ...this.lights);
    }
  }
}
