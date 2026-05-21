varying vec3 vWorldPos;
varying vec3 vLocalPos;

uniform float uExponent;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform float uSharpness;

#define PI 3.141592

void main() {
    vec3 dir = normalize(vLocalPos);
    float y = dir.y*0.5+0.5; // 0->1 scale
    float t = pow(smoothstep(0.5 - uSharpness, 0.5 + uSharpness, y), uExponent);
    float angle = atan(dir.z, dir.x) / (2.0*PI) + 0.5; // 0->1 scale for full circle
    
    vec3 color = mix(uBottomColor, uTopColor, t);
    gl_FragColor = vec4(color, 1.0);
}