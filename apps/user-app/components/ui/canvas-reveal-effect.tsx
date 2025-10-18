"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

export const CanvasRevealEffect = ({
  animationSpeed = 0.4,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  containerClassName,
  dotSize = 3,
  showGradient = true,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const uniforms = useMemo(() => {
    let colorsArray = [
      colors[0],
      colors[0],
      colors[0],
      colors[0],
      colors[0],
      colors[0],
    ];
    if (colors.length === 2) {
      colorsArray = [
        colors[0],
        colors[0],
        colors[0],
        colors[1],
        colors[1],
        colors[1],
      ];
    } else if (colors.length === 3) {
      colorsArray = [
        colors[0],
        colors[0],
        colors[1],
        colors[1],
        colors[2],
        colors[2],
      ];
    }

    return {
      u_colors: colorsArray.map((color) => [
        (color?.[0] ?? 0) / 255,
        (color?.[1] ?? 0) / 255,
        (color?.[2] ?? 0) / 255,
      ]),
      u_opacities: opacities,
      u_total_size: 4,
      u_dot_size: dotSize,
      u_animation_speed: animationSpeed,
    };
  }, [colors, opacities, dotSize, animationSpeed]);

  const shaderSource = `
    precision mediump float;
    attribute vec2 a_position;
    varying vec2 v_fragCoord;
    uniform vec2 u_resolution;
    
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_fragCoord = (a_position.xy + vec2(1.0)) * 0.5 * u_resolution;
      v_fragCoord.y = u_resolution.y - v_fragCoord.y;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    uniform float u_time;
    uniform float u_opacities[10];
    uniform vec3 u_colors[6];
    uniform float u_total_size;
    uniform float u_dot_size;
    uniform vec2 u_resolution;
    uniform float u_animation_speed;
    varying vec2 v_fragCoord;
    
    float PHI = 1.61803398874989484820459;
    float random(vec2 xy) {
        return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
    }
    
    float map(float value, float min1, float max1, float min2, float max2) {
        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
    }
    
    void main() {
      vec2 st = v_fragCoord;
      
      // Center alignment
      st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
      st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));
      
      float opacity = step(0.0, st.x);
      opacity *= step(0.0, st.y);
      
      vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));
      
      float frequency = 5.0;
      float show_offset = random(st2);
      float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency) + 1.0);
      opacity *= u_opacities[int(rand * 10.0)];
      opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
      opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));
      
      // Animation intro
      float intro_offset = distance(u_resolution / 2.0 / u_total_size, st2) * 0.01 + (random(st2) * 0.15);
      opacity *= step(intro_offset, u_time * u_animation_speed);
      opacity *= clamp((1.0 - step(intro_offset + 0.1, u_time * u_animation_speed)) * 1.25, 1.0, 1.25);
      
      vec3 color = u_colors[int(show_offset * 6.0)];
      
      gl_FragColor = vec4(color, opacity);
      gl_FragColor.rgb *= gl_FragColor.a;
    }
  `;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    // Vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, shaderSource);
    gl.compileShader(vertexShader);

    // Fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Attributes
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution")!;
    const timeLocation = gl.getUniformLocation(program, "u_time")!;
    const opacitiesLocation = gl.getUniformLocation(program, "u_opacities")!;
    const totalSizeLocation = gl.getUniformLocation(program, "u_total_size")!;
    const dotSizeLocation = gl.getUniformLocation(program, "u_dot_size")!;
    const animationSpeedLocation = gl.getUniformLocation(program, "u_animation_speed")!;

    let startTime = performance.now();

    const render = () => {
      const currentTime = (performance.now() - startTime) / 1000;

      // Resize canvas
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, currentTime);
      gl.uniform1fv(opacitiesLocation, new Float32Array(uniforms.u_opacities));
      gl.uniform1f(totalSizeLocation, uniforms.u_total_size);
      gl.uniform1f(dotSizeLocation, uniforms.u_dot_size);
      gl.uniform1f(animationSpeedLocation, uniforms.u_animation_speed);

      // Set colors uniform (array of vec3)
      for (let i = 0; i < 6; i++) {
        const loc = gl.getUniformLocation(program, `u_colors[${i}]`);
        const color = uniforms.u_colors[i] ?? [0, 0, 0];
        if (loc) {
          gl.uniform3fv(loc, new Float32Array(color));
        }
      }

      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(render);
    };

    render();

    return () => {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [uniforms]);

  return (
    <div className={cn("h-full relative w-full", containerClassName)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: "transparent" }}
      />
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-[84%]" />
      )}
    </div>
  );
};