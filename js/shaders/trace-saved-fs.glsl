Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es 
  precision highp float;

  out vec4 fragmentColor;
  in vec4 rayDir;
  in vec4 texCoord;

  uniform struct {
  	samplerCube envTexture;
  } material;

  uniform struct {
    mat4 viewProjMatrix;  
    mat4 rayDirMatrix;
    vec3 position;
    vec4 worldPosition;
  } camera;

  uniform struct {
    mat4 surface;
    mat4 clipper;
    vec3 specularColor;
    float shininess;
    vec3 materialColor;
  } clippedQuadrics[16];

  uniform struct{
    vec4 position;
    vec3 powerDensity;
  } lights[8];

  vec3 shade(vec3 normal, vec3 lightDir, vec3 viewDir, vec3 powerDensity, vec3 materialColor, vec3 specularColor, float shininess) {
    float cosa = clamp(dot(lightDir, normal), 0.0, 1.0);
    float cosb = clamp(dot(viewDir, normal), 0.0, 1.0);
    vec3 halfway = normalize(viewDir + lightDir);
    float cosDelta = clamp(dot(halfway, normal), 0.0, 1.0);
    return powerDensity * materialColor * cosa + powerDensity * specularColor * pow(cosDelta, shininess) * cosa / max(cosb, cosa);
  }

  float intersectQuadric(mat4 A, vec4 e, vec4 d) {
    float a = dot(d * A, d);
    float b = dot(d * A, e) + dot(e * A, d);
    float c = dot(e * A, e);
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0.0) {
      return -1.0;
    } else {
      float t1 = (-b + sqrt(discriminant)) / (2.0 * a);
      float t2 = (-b - sqrt(discriminant)) / (2.0 * a);
      return (t1 < 0.0)?t2:((t2 < 0.0)?t1:min(t1, t2));
    }
  }

  float intersectClippedQuadric(mat4 A, mat4 B, vec4 e, vec4 d) {
    float a = dot(d * A, d);
    float b = dot(d * A, e) + dot(e * A, d);
    float c = dot(e * A, e);
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0.0) {
      return -1.0;
    } else {
      float t1 = (-b + sqrt(discriminant)) / (2.0 * a);
      float t2 = (-b - sqrt(discriminant)) / (2.0 * a);
      vec4 r1 = e + d * t1;
      vec4 r2 = e + d * t2;
      float q1 = dot(r1 * B, r1);
      float q2 = dot(r2 * B, r2);
      if (q1 > 0.0) {
        t1 = -1.0;
      }
      if (q2 > 0.0) {
        t2 = -1.0;
      }
      return (t1 < 0.0)?t2:((t2 < 0.0)?t1:min(t1, t2));
    }
  }

  float snoise(vec3 r) {
    vec3 s = vec3(7502, 22777, 4767);
    float f = 0.0;
    for(int i=0; i<16; i++) {
      f += sin( dot(s - vec3(32768, 32768, 32768), r)
                                   / 65536.0);
      s = mod(s, 32768.0) * 2.0 + floor(s / 32768.0);
    }
    return f / 32.0 + 0.5;
  }

  bool findBestHit(vec4 e, vec4 d, out float bestT, out int bestIndex) {
    // find the surface where the eye ray hits first
    float localBestT = 1000000.0;
    int localBestIndex = 0;
    for(int i = 0; i < clippedQuadrics.length(); i++) {
      mat4 A = clippedQuadrics[i].surface;
      mat4 B = clippedQuadrics[i].clipper;
      float t = intersectClippedQuadric(A, B, e, d);
      if (t >= 0.0 && t < localBestT) {
        localBestT = t;
        localBestIndex = i;
      }
    }
    bestT = localBestT;
    bestIndex = localBestIndex;
    return localBestT != 1000000.0;
  }

  void main(void) {
	  vec4 e = vec4(camera.position, 1.0);		 //< ray origin
  	vec4 d = vec4(normalize(rayDir).xyz, 0.0); //< ray direction
    float bestT = 1000000.0;
    int bestIndex = 0;

    bool wasHit = findBestHit(e, d, bestT, bestIndex);

    // computing depth from world space hit coordinates 
    vec4 hit = e + d * bestT;
    vec4 ndcHit = hit * camera.viewProjMatrix;
    gl_FragDepth = ndcHit.z / ndcHit.w * 0.5 + 0.5;

    // nothing hit by ray, return enviroment color
    if (!wasHit) {
	    fragmentColor = texture(material.envTexture, d.xyz );
    }
    mat4 A = clippedQuadrics[bestIndex].surface;
    vec3 normal = normalize((hit * A + A * hit).xyz);
    if (wasHit) {
      float freq = 2.0;
      float noiseFreq = 15.0;
      float noiseExp = 2.0;
      float noiseAmp = 5.0;
      vec3 colorOne = vec3(0.46, 0.32, 0.03);
      vec3 colorTwo = vec3(0.9, 0.79, 0.49);
      float w = fract(hit.z * freq + pow(snoise(hit.xyz * noiseFreq), noiseExp) * noiseAmp);
      //vec3 color = mix(colorOne, colorTwo, w);
      vec3 color = vec3(1.0, 1.0, 1.0);
      color = clippedQuadrics[bestIndex].materialColor;
      //ragmentColor = vec4(color, 1.0);
      if (bestIndex == 3) {
        color = mix(colorOne, colorTwo, w);
      //fragmentColor.xyz = mix(normal, colorOne, w);
      }

      fragmentColor.xyz = vec3(0, 0, 0);

      for (int i = 0; i < lights.length(); i++) {
        vec3 lightDiff = lights[i].position.xyz - hit.xyz * lights[i].position.w;
        vec3 lightDir = normalize(lightDiff);
        float bestShadowT = 1000000.0;
        int bestShadowIndex = 0;
        
        bool shadowRayHitSomething = findBestHit(hit + vec4(normal  * 0.01, 0.0), vec4(lightDir, 0), bestShadowT, bestShadowIndex);
        if (!shadowRayHitSomething || bestShadowT * lights[i].position.w > sqrt(dot(lightDiff, lightDiff))) {
          float distanceSquared = dot(lightDiff, lightDiff);
          vec3 powerDensity = lights[i].powerDensity / distanceSquared;
          if (dot(normal, d.xyz) > 0.0) normal = -normal;
          fragmentColor.rgb += shade(normal, lightDir, -d.xyz, powerDensity, color, clippedQuadrics[bestIndex].specularColor, clippedQuadrics[bestIndex].shininess);
        }
        
      }
    }

    

    gl_FragDepth = 0.9999999;
  }

`;