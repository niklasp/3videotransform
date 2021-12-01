uniform vec2 u_resolution;  // Canvas size (width,height)
uniform vec2 u_mouse;       // mouse position in screen pixels
uniform float u_time;       // Time in seconds since load
uniform float u_circleScale;
uniform sampler2D u_video;
uniform sampler2D u_image;
uniform vec2 u_viewport;
varying vec2 vUv;
varying vec3 vNormal;

float circle(vec2 uv, float radius, float sharpness ) {
  vec2 tempUV = uv - vec2(0.5);
  return smoothstep(
    radius - radius * sharpness,
    radius + radius * sharpness,
    dot( tempUV, tempUV ) * 4.
  );
}

// 2D Random
float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
  float videoAspect = 1920./1080.;
  float screenAspect = u_viewport.x / u_viewport.y;

  vec2 multiplier = vec2(1.0);
  vec2 distanceUV = vUv - vec2(0.5);

  if ( videoAspect > screenAspect ) {
    multiplier = vec2(screenAspect/videoAspect, 1.);
  }

  vec2 noiseUV = vUv - vec2(0.5);
  float distance = circle( vUv, u_circleScale, 0.2 + u_circleScale );
  float swirl = noise( vec2( noise( vec2( length(noiseUV) - u_time / 3.) * 4.), length(noiseUV) ));
  vec2 swirlDistort = swirl * noiseUV * 2.5;

  vec2 newUv = (vUv - vec2( 0.5 )) * multiplier + vec2( 0.5 );
  newUv += swirlDistort * .2;

  vec4 video = texture2D( u_video, newUv );
  vec4 image = texture2D( u_image, newUv );

  vec4 final = mix( video, vec4(0.), swirl);

  gl_FragColor = final;
  // gl_FragColor = vec4( swirlDistort, 0., 1.);
}