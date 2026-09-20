/** One persistent point pool; all formation interpolation happens on the GPU. */
const vertexSource = `
  precision highp float;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 aSeed;
  uniform vec2 uResolution;
  uniform vec2 uOrigin;
  uniform vec2 uPointer;
  uniform float uScale;
  uniform float uMorph;
  uniform float uTime;
  uniform float uDpr;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float t = smoothstep(0.0, 1.0, uMorph);
    float scatter = sin(t * 3.14159265);
    vec3 p = mix(aFrom, aTo, t);
    // The same seed follows a point through every formation and in reverse.
    p.xy += scatter * .32 * vec2(
      sin(aSeed.x * 19.0 + t * 4.0), cos(aSeed.y * 17.0 + t * 4.0));
    p.z += scatter * .4 * sin(aSeed.z * 12.0);
    float angle = sin(uTime * .23) * .045 + uPointer.x * .08;
    p.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xz;
    p.xy += vec2(sin(uTime * .48 + aSeed.x * 6.28), cos(uTime * .38 + aSeed.y * 6.28)) * .005;
    p.xy += uPointer * .015 * (p.z + .4);
    vec2 pixel = uOrigin + vec2(p.x, -p.y) * uScale;
    vec2 clip = pixel / uResolution * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = (1.3 + aSeed.z * 1.5) * uDpr;
    vColor = mix(vec3(.65, .55, 1.0), vec3(.52, .79, .64), aSeed.x);
    vColor = mix(vColor, vec3(.9, .9, 1.0), aSeed.z * .22);
    vAlpha = (.28 + aSeed.y * .6) * uOpacity;
  }
`
const fragmentSource = `
  precision highp float;
  varying vec3 vColor;
  varying float vAlpha;
  uniform vec4 uMasks[16];
  uniform vec2 uResolution;
  uniform float uDpr;
  void main() {
    vec2 pixel = vec2(gl_FragCoord.x / uDpr, uResolution.y - gl_FragCoord.y / uDpr);
    float visibility = 1.0;
    for (int i = 0; i < 16; i++) {
      vec2 d = abs(pixel - uMasks[i].xy) - uMasks[i].zw;
      float edge = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
      visibility = min(visibility, mix(.1, 1.0, smoothstep(0.0, 12.0, edge)));
    }
    float radius = length(gl_PointCoord - .5) * 2.0;
    float alpha = (1.0 - smoothstep(.25, 1.0, radius)) * vAlpha;
    gl_FragColor = vec4(vColor, alpha * visibility);
  }
`

export type ParticleFrame = {
  from: number
  to: number
  morph: number
  time: number
  width: number
  height: number
  x: number
  y: number
  scale: number
  opacity: number
  pointerX: number
  pointerY: number
  dpr: number
  pointCount: number
  masks: Float32Array
}

export function createParticleRenderer(canvas: HTMLCanvasElement, formations: Float32Array[]) {
  const gl = canvas.getContext('webgl', {alpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power'})
  if (!gl) return null
  const shaders: WebGLShader[] = []
  const buffers: WebGLBuffer[] = []
  const program = gl.createProgram()
  if (!program) return null
  const dispose = () => {
    buffers.forEach(buffer => gl.deleteBuffer(buffer))
    shaders.forEach(shader => gl.deleteShader(shader))
    gl.deleteProgram(program)
  }
  for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
    const shader = gl.createShader(type)
    if (!shader) {dispose(); return null}
    shaders.push(shader)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {dispose(); return null}
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {dispose(); return null}
  gl.useProgram(program)
  const attributes = ['aFrom', 'aTo', 'aSeed'].map(name => gl.getAttribLocation(program, name))
  for (let index = 0; index < attributes.length; index++) {
    const buffer = gl.createBuffer()
    if (!buffer || attributes[index] < 0) {dispose(); return null}
    buffers.push(buffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(attributes[index])
    gl.vertexAttribPointer(attributes[index], 3, gl.FLOAT, false, 0, 0)
  }
  const count = formations[0].length / 3
  const seeds = new Float32Array(count * 3)
  for (let i = 0; i < seeds.length; i++) seeds[i] = ((i * 16807 + 97) % 65521) / 65521
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[2])
  gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW)
  const uniforms = Object.fromEntries(['Resolution', 'Origin', 'Pointer', 'Scale', 'Morph', 'Time', 'Dpr', 'Opacity', 'Masks'].map(name => [name, gl.getUniformLocation(program, name === 'Masks' ? 'uMasks[0]' : `u${name}`)]))
  gl.enable(gl.BLEND)
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)
  let previousFrom = -1
  let previousTo = -1
  return {
    dispose,
    draw(frame: ParticleFrame) {
      const width = Math.round(frame.width * frame.dpr)
      const height = Math.round(frame.height * frame.dpr)
      if (canvas.width !== width || canvas.height !== height) {canvas.width = width; canvas.height = height}
      gl.viewport(0, 0, width, height)
      gl.useProgram(program)
      for (const [slot, index, previous] of [[0, frame.from, previousFrom], [1, frame.to, previousTo]]) {
        if (index === previous) continue
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[slot])
        gl.bufferData(gl.ARRAY_BUFFER, formations[index], gl.STATIC_DRAW)
      }
      previousFrom = frame.from
      previousTo = frame.to
      gl.uniform2f(uniforms.Resolution, frame.width, frame.height)
      gl.uniform2f(uniforms.Origin, frame.x, frame.y)
      gl.uniform2f(uniforms.Pointer, frame.pointerX, frame.pointerY)
      gl.uniform1f(uniforms.Scale, frame.scale)
      gl.uniform1f(uniforms.Morph, frame.morph)
      gl.uniform1f(uniforms.Time, frame.time)
      gl.uniform1f(uniforms.Dpr, frame.dpr)
      gl.uniform1f(uniforms.Opacity, frame.opacity)
      gl.uniform4fv(uniforms.Masks, frame.masks)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.POINTS, 0, Math.min(count, frame.pointCount))
    },
  }
}
