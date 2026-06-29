varying vec3 vLocalPos;

uniform float uExponent;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform vec3 uSunsetColor;
uniform vec3 uHorizonColor;
uniform float uSharpness;

uniform float uTime;
uniform float uSinceLastBeat;
uniform float uBeatDuration;
uniform float uCurBPM;
uniform float uBPMCount;

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
uniform vec3 uDarkCloudColor;

uniform float uSunSize;
uniform float uSunGlow;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uSunSunsetColor;

uniform float uPixelSize;
uniform float uCloudDitherScale; 
uniform float uDitherBands;
uniform vec2 uDitherOffset; 

#define PI 3.141592
#define EPS 0.0001


const int bayer8[64] = int[64](
     0, 48, 12, 60,  3, 51, 15, 63,
    32, 16, 44, 28, 35, 19, 47, 31,
     8, 56,  4, 52, 11, 59,  7, 55,
    40, 24, 36, 20, 43, 27, 39, 23,
     2, 50, 14, 62,  1, 49, 13, 61,
    34, 18, 46, 30, 33, 17, 45, 29,
    10, 58,  6, 54,  9, 57,  5, 53,
    42, 26, 38, 22, 41, 25, 37, 21
);

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
    for (int i = 0; i < 2; i++) { v += a * noise(p); p *= 2.; a *= 0.5; } 
    return v;
}

float bayerValue8(vec2 pixelCoord) {
    int idx = int(mod(pixelCoord.x, 8.0)) + int(mod(pixelCoord.y, 8.0)) * 8;
    return float(bayer8[idx]) / 64.0;
}

vec3 ditherQuantize(vec3 c, vec2 cellCoord, float bands) {
    float jitter = bayerValue8(cellCoord) - 0.5;
    return floor(c * bands + jitter) / bands;
}

vec3 doubleDither(vec3 c, vec2 cellCoord, float bands) {
    vec3 a = ditherQuantize(c, cellCoord, bands);
    vec3 b = ditherQuantize(c, cellCoord - uDitherOffset, bands);
    return max(a, b);
}

void main() {
    vec3 dir = normalize(vLocalPos);
    float y = dir.y * 0.5 + 0.5; 


    float t = pow(smoothstep(0.5 - uSharpness, 0.5 + uSharpness, y), uExponent);
    vec3 color = mix(uBottomColor, uTopColor, t);

    float sunHeight = normalize(uSunDirection).y;
    float sunsetAmt = 1.0 - smoothstep(0.0, 0.35, abs(sunHeight)); 

    vec2 dirFlat = normalize(dir.xz);
    vec2 sunFlat = normalize(uSunDirection.xz);
    float azimuthal = dot(dirFlat, sunFlat) * 0.5 + 0.5; 

    float horizonBand = exp(-abs(y - 0.5) * 5.0);
    color = mix(color, uHorizonColor, horizonBand * sunsetAmt);

    float sunGlowBand = exp(-abs(y - 0.5) * 8.0) * pow(azimuthal, 3.0);
    color = mix(color, uSunSunsetColor, sunGlowBand * sunsetAmt);

    color = mix(color, uSunsetColor, t * sunsetAmt * 0.5);

    float rawAngleBars = fract((atan(dir.x, dir.z) / (PI * 2.0)) + (uBarCount)) * uBarCount;
    float barIntId = floor(rawAngleBars + 0.5);
    float barAngleGrad = barIntId / uBarCount;
    float barRamp = fract(rawAngleBars);
    float barGrad = abs(barRamp * 2. - 1.);
    float barShape = step(1. - uBarThickness, barGrad);

    float beatLevel = step(0., dir.y + 0.05) - max(0., dir.y);
    float beatProgress = uBeatDuration > 0.0 ? clamp(uSinceLastBeat / uBeatDuration, 0.0, 1.0) : fract(uTime);
    float decay = smoothstep(0.65, 0.0, beatProgress);
    float rise = pow(smoothstep(0.9, 1.0, beatProgress), 4.0);
    float beatHeight = max(decay, rise) * uBarHeight;
    float beatLimit = step(1.0 - uBarHeight - beatHeight - sin(barAngleGrad * PI * 2. * uBarRevolutions - uTime * uBarSpeed - uBPMCount * 0.0001) * uRevolutionWeight, beatLevel);
    float beatBar = barShape * beatLimit * 0.25;

    float sunPos = dot(dir, normalize(uSunDirection));
    float sunCircle = smoothstep(1. - uSunSize, 1. - uSunSize + EPS, sunPos);
    float glow = pow(max(sunPos, 0.), 64.) * uSunGlow;
    float sun = max(sunCircle, glow);
    color = mix(color, mix(uSunColor, uSunSunsetColor, sunsetAmt), sun);
    color = mix(color, uBarColor, beatBar);

    vec2 cellCoord = floor(gl_FragCoord.xy / uPixelSize);
    color = doubleDither(color, cellCoord, uDitherBands);

    vec2 uv = dir.xz / (dir.y + 0.05);
    vec2 movement = vec2(uTime * 0.05, uTime * 0.4);
    float cloudEdge = max(uCloudSmoothness, 0.18); 

    float n = fbm(uv * uCloudScale + movement) * 0.6;
    float cloudShape = smoothstep(uCloudThreshold, uCloudThreshold + cloudEdge, n);
    cloudShape *= smoothstep(0., 0.2, dir.y);


    vec2 sunXZ = uSunDirection.xz;
    float sunHoriz = length(sunXZ);
    vec2 lightDir = sunHoriz > 1e-4 ? sunXZ / sunHoriz : vec2(0.0);
    vec2 lightShift = lightDir * 0.12 * smoothstep(0.0, 0.15, sunHoriz);
    float nLit = fbm((uv + lightShift) * uCloudScale + movement) * 0.6;
    float litShape = smoothstep(uCloudThreshold, uCloudThreshold + cloudEdge, nLit);
    float cloudShadow = cloudShape * (1.0 - litShape);

    float cloudCore = smoothstep(uCloudThreshold + cloudEdge * 0.4, uCloudThreshold + cloudEdge * 1.4, n);
    float cloudRim = clamp(cloudShape - cloudCore, 0.0, 1.0);

    vec3 cloudLitColor = mix(uCloudColor, uSunSunsetColor, sunsetAmt * 0.5);
    vec3 cloudColor = cloudLitColor;
    cloudColor = mix(cloudColor, uDarkCloudColor, cloudShadow * 0.85); // shadowed underside
    cloudColor = mix(cloudColor, vec3(1.0), cloudRim * 0.45);    // bright edge rim


    vec2 cloudCell = floor(uv * uCloudDitherScale);
    cloudColor = doubleDither(cloudColor, cloudCell, uDitherBands);

    color = mix(color, cloudColor, cloudShape);

    gl_FragColor = vec4(color, 1.);
}
