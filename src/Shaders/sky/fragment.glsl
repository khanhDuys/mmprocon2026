varying vec3 vWorldPos;
varying vec3 vLocalPos;

uniform float uExponent;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform float uSharpness;

uniform float uTime;
uniform float uSinceLastBeat;
uniform float uBeatDuration;
uniform float uCurBPM;

uniform float uBarHeight;
uniform float uBarCount;
uniform float uBarThickness;
uniform float uBarRevolutions;
uniform float uBarSpeed;
uniform float uRevolutionWeight;
uniform vec3 uBarColor;

uniform float uCloudScale;
uniform float uCloudThreshold;
uniform float uCloudSmoothness;
uniform vec3 uCloudColor;

uniform float uSunSize;
uniform float uSunGlow;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;

#define PI 3.141592
#define EPS 0.0001

#define PIXEL_SIZE = 4.

// fbm functions

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = smoothstep(0.0, 1.0, f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.; a *= 0.5; }
    return v;
}

//

void main() {
    vec3 dir = normalize(vLocalPos);
    float y = dir.y*0.5+0.5; // 0->1 scale
    float t = pow(smoothstep(0.5 - uSharpness, 0.5 + uSharpness, y), uExponent);
    vec3 color = mix(uBottomColor, uTopColor, t);

    float rawAngleBars = fract((atan(dir.x, dir.z) / (PI * 2.0)) + (uBarCount)) * uBarCount;
    
    float barIntId = floor(rawAngleBars+0.5);
    float barAngleGrad = barIntId / uBarCount;
    float barRamp = fract(rawAngleBars);
    float barGrad = abs(barRamp*2.-1.);
    float barShape = step(1.-uBarThickness, barGrad);


    float beatLevel = step(0., dir.y+0.05)-max(0., dir.y);
    float beatProgress = uBeatDuration > 0.0 ? clamp(uSinceLastBeat / uBeatDuration, 0.0, 1.0) : fract(uTime);
    
    float decay = smoothstep(0.65, 0.0, beatProgress);
    
    float rise = pow(smoothstep(0.9, 1.0, beatProgress), 4.0);
    
    float beatHeight = max(decay, rise) * uBarHeight;    float beatLimit = step( 1.0-uBarHeight-beatHeight-sin(barAngleGrad*PI*2.*uBarRevolutions-uTime*(uBarSpeed+uCurBPM*0.01))*uRevolutionWeight , beatLevel);
    float beatBar = barShape*beatLimit*0.25; // combine
    float sunPos = dot(dir, normalize(uSunDirection));
    //color = vec3(sunPos);
    float sunCircle = smoothstep(1.-uSunSize, 1.-uSunSize+EPS, sunPos);
    float glow =  pow(max(sunPos, 0.), 64.) * uSunGlow;
    float sun = max(sunCircle, glow);

    color = mix(color, uSunColor, sun);

    color = mix(color, uBarColor, beatBar);
    //color = vec3(sun);

    vec2 uv = dir.xz / (dir.y + 0.05);
    
    vec2 movement = vec2(uTime * 0.05, uTime * 0.4);
    float n = fbm(uv * 3. + movement) * 0.6;    
    
    float cloudShape = smoothstep(uCloudThreshold, uCloudThreshold+uCloudSmoothness, n);
    
    cloudShape *= smoothstep(0., 0.2, dir.y);

    color = mix(color, uCloudColor, cloudShape);
    
    gl_FragColor = vec4(vec3(color), 1.);
}