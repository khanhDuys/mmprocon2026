varying vec3 vWorldPos;
varying vec3 vLocalPos;

uniform float uExponent;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform float uSharpness;

uniform float uTime;
uniform float uCloudScale;
uniform float uCloudThreshold;
uniform float uCloudSmoothness;
uniform vec3 uCloudColor;

uniform float uSunSize;
uniform float uSunGlow;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;

#define PI 3.141592

// fbm functions

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // smoothstep
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
}

//

void main() {
    vec3 dir = normalize(vLocalPos);
    float y = dir.y*0.5+0.5; // 0->1 scale
    float t = pow(smoothstep(0.5 - uSharpness, 0.5 + uSharpness, y), uExponent);
    vec3 color = mix(uBottomColor, uTopColor, t);

    float sunPos = dot(dir, normalize(uSunDirection));
    //color = vec3(sunPos);
    float sunCircle = smoothstep(1.0-uSunSize, 1.0-uSunSize+0.0001, sunPos);
    float glow =  pow(max(sunPos, 0.0), 64.0) * uSunGlow;
    float sun = max(sunCircle, glow);

    color = mix(color, uSunColor, sun);
    //color = vec3(sun);

    vec2 uv = dir.xz / (dir.y + 0.05);
    
    vec2 movement = vec2(uTime * 0.05, uTime * 0.4);
    float n = fbm(uv * 3.0 + movement) * 0.6 + fbm(uv * 6.0 + movement * 1.5) * 0.4;
    
    float cloudShape = smoothstep(uCloudThreshold, uCloudThreshold+uCloudSmoothness, n);
    
    cloudShape *= smoothstep(0.0, 0.2, dir.y);

    color = mix(color, uCloudColor, cloudShape);
    
    gl_FragColor = vec4(color, 1.0);
}