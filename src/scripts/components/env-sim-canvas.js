/**
 * Urban Intersection Simulation (`#env-canvas`) with multi-vehicle kinematics
 * and autonomous PPO agent lidar perception.
 */
export function initEnvSimCanvas(canvas, options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isAgentSim = Boolean(options.isAgentSim);

  let width = 0;
  let height = 0;
  let visible = true;
  const startTime = performance.now();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(160, rect.width);
    height = Math.max(180, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  const rayAngles = [
    -0.65, -0.45, -0.28, -0.14, 0, 0.14, 0.28, 0.45, 0.65, 0.95, -0.95
  ];

  const CYCLE_DURATION = 14.0;
  const carLen = 24;
  const carWid = 13;

  function drawCar(x, y, heading, isEgo = false, isBraking = false, isBlinking = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(heading);

    if (isEgo) {
      // Ego Vehicle (Teal Autonomous Agent)
      ctx.fillStyle = '#2dd4bf';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(45, 212, 191, 0.6)';
      ctx.beginPath();
      ctx.roundRect(-carLen / 2, -carWid / 2, carLen, carWid, 4);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Windshield
      ctx.fillStyle = '#06101e';
      ctx.beginPath();
      ctx.roundRect(1, -carWid / 2 + 2.5, 6, carWid - 5, 1.5);
      ctx.fill();

      // Taillights
      ctx.fillStyle = isBraking ? '#f43f5e' : 'rgba(244, 63, 94, 0.4)';
      ctx.fillRect(-carLen / 2, -carWid / 2 + 1.5, 2, 2.5);
      ctx.fillRect(-carLen / 2, carWid / 2 - 4, 2, 2.5);
    } else {
      // Traffic Vehicle (Dark Slate Body with Outline)
      ctx.fillStyle = 'rgba(30, 41, 59, 0.96)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-carLen / 2, -carWid / 2, carLen, carWid, 3.5);
      ctx.fill();
      ctx.stroke();

      // Windshield
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(1, -carWid / 2 + 2.5, 5, carWid - 5, 1.5);
      ctx.fill();

      // Taillights
      ctx.fillStyle = isBraking ? '#f43f5e' : 'rgba(244, 63, 94, 0.35)';
      if (isBraking) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#f43f5e';
      }
      ctx.fillRect(-carLen / 2, -carWid / 2 + 1.5, 2, 2.5);
      ctx.fillRect(-carLen / 2, carWid / 2 - 4, 2, 2.5);
      ctx.shadowBlur = 0;

      // Turn indicator (Left front & rear)
      if (isBlinking) {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f59e0b';
        ctx.fillRect(-carLen / 2, -carWid / 2, 2.5, 2.5);
        ctx.fillRect(carLen / 2 - 2.5, -carWid / 2, 2.5, 2.5);
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }

  function drawCat(x, y, heading, runPhase) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(heading);

    // Warm amber ginger cat
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 0.8;

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.5, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(4.5, 0, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pointed ears
    ctx.beginPath();
    ctx.moveTo(4.8, -2.4);
    ctx.lineTo(6.4, -4.4);
    ctx.lineTo(3.2, -2.6);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(4.8, 2.4);
    ctx.lineTo(6.4, 4.4);
    ctx.lineTo(3.2, 2.6);
    ctx.closePath();
    ctx.fill();

    // Animated swishing tail
    const tailWiggle = Math.sin(runPhase * 3) * 2.8;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.quadraticCurveTo(-9, tailWiggle * 0.8, -11, tailWiggle);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    const now = performance.now();
    const cycleTime = ((now - startTime) / 1000) % CYCLE_DURATION;

    const cx = width * 0.5;
    const cy = height * 0.5;
    const roadHalf = 32;

    // -------------------------------------------------------------------------
    // 1. Roadway Asphalt & Intersection Geometry
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#0a1020';
    ctx.fillRect(0, cy - roadHalf, width, roadHalf * 2);
    ctx.fillRect(cx - roadHalf, 0, roadHalf * 2, height);

    // Kerb lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Horizontal kerbs
    ctx.moveTo(0, cy - roadHalf); ctx.lineTo(cx - roadHalf, cy - roadHalf);
    ctx.moveTo(cx + roadHalf, cy - roadHalf); ctx.lineTo(width, cy - roadHalf);
    ctx.moveTo(0, cy + roadHalf); ctx.lineTo(cx - roadHalf, cy + roadHalf);
    ctx.moveTo(cx + roadHalf, cy + roadHalf); ctx.lineTo(width, cy + roadHalf);
    // Vertical kerbs
    ctx.moveTo(cx - roadHalf, 0); ctx.lineTo(cx - roadHalf, cy - roadHalf);
    ctx.moveTo(cx - roadHalf, cy + roadHalf); ctx.lineTo(cx - roadHalf, height);
    ctx.moveTo(cx + roadHalf, 0); ctx.lineTo(cx + roadHalf, cy - roadHalf);
    ctx.moveTo(cx + roadHalf, cy + roadHalf); ctx.lineTo(cx + roadHalf, height);
    ctx.stroke();

    // Center divider markings
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(cx - roadHalf, cy);
    ctx.moveTo(cx + roadHalf, cy); ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, cy - roadHalf);
    ctx.moveTo(cx, cy + roadHalf); ctx.lineTo(cx, height);
    ctx.stroke();
    ctx.restore();

    // Stop lines
    const hStopX = cx - roadHalf - 6;
    const vStopY = cy - roadHalf - 6;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    // Eastbound stop line
    ctx.beginPath();
    ctx.moveTo(hStopX, cy - roadHalf);
    ctx.lineTo(hStopX, cy);
    ctx.stroke();

    // Southbound stop line
    ctx.beginPath();
    ctx.moveTo(cx, vStopY);
    ctx.lineTo(cx + roadHalf, vStopY);
    ctx.stroke();

    // -------------------------------------------------------------------------
    // 2. Traffic Signals
    // Horizontal: RED 0.0s - 5.2s, GREEN 5.2s - 11.4s, RED 11.4s - 14.0s
    // Vertical:   GREEN 0.0s - 4.6s, RED 4.6s - 12.0s, GREEN 12.0s - 14.0s
    // -------------------------------------------------------------------------
    const hGreen = cycleTime >= 5.2 && cycleTime < 11.4;
    const vGreen = cycleTime < 4.6 || cycleTime >= 12.0;

    // Horizontal signal head
    const hLightX = hStopX - 4;
    const hLightY = cy - roadHalf - 10;
    ctx.beginPath();
    ctx.arc(hLightX, hLightY, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = hGreen ? '#2dd4bf' : '#f43f5e';
    ctx.shadowBlur = 9;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Vertical signal head
    const vLightX = cx + roadHalf + 10;
    const vLightY = vStopY - 4;
    ctx.beginPath();
    ctx.arc(vLightX, vLightY, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = vGreen ? '#2dd4bf' : '#f43f5e';
    ctx.shadowBlur = 9;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
    ctx.shadowBlur = 0;

    // -------------------------------------------------------------------------
    // 3. Multi-Vehicle Simulation Kinematics (Continuous Toroidal Loop)
    // -------------------------------------------------------------------------
    const vehicles = [];

    // --- VULNERABLE ROAD USER: Cat darting across Eastbound lane ---
    let catX = -999;
    let catY = -999;
    let catActive = false;
    if (cycleTime >= 4.6 && cycleTime <= 7.2) {
      catActive = true;
      const u = (cycleTime - 4.6) / 2.6;
      catX = cx + 96 + u * 12;
      catY = (cy - roadHalf - 8) + u * (roadHalf * 2 + 16);
    }

    // --- CAR 1: Vertical Southbound Car 1 (Queues on red, crosses on green across boundary) ---
    const vQueueStopY1 = vStopY - carLen / 2 - 6;
    if (cycleTime >= 4.4 && cycleTime < 12.0) {
      // Approach and stop on red
      let y = -999;
      let braking = false;
      if (cycleTime < 6.4) {
        const u = (cycleTime - 4.4) / 2.0;
        const ease = 1 - Math.pow(1 - u, 2.5);
        y = -40 + ease * (vQueueStopY1 - (-40));
        braking = u > 0.4;
      } else {
        y = vQueueStopY1;
        braking = true;
      }
      vehicles.push({ x: cx + 16, y, heading: Math.PI / 2, braking, blinking: false });
    } else if (cycleTime >= 12.0 || cycleTime < 2.4) {
      // Accelerates smoothly through junction across the 14.0s / 0.0s boundary
      const elapsed = cycleTime >= 12.0 ? (cycleTime - 12.0) : (cycleTime + CYCLE_DURATION - 12.0);
      const u = elapsed / 4.4;
      const ease = u * u * (3 - 2 * u);
      const y = vQueueStopY1 + ease * (height + 50 - vQueueStopY1);
      vehicles.push({ x: cx + 16, y, heading: Math.PI / 2, braking: false, blinking: false });
    }

    // --- CAR 2: Vertical Southbound Car 2 (Queues behind Car 1, follows across boundary) ---
    const vQueueStopY2 = vQueueStopY1 - 32;
    if (cycleTime >= 5.2 && cycleTime < 12.5) {
      let y = -999;
      let braking = false;
      if (cycleTime < 7.4) {
        const u = (cycleTime - 5.2) / 2.2;
        const ease = 1 - Math.pow(1 - u, 2.5);
        y = -40 + ease * (vQueueStopY2 - (-40));
        braking = u > 0.5;
      } else {
        y = vQueueStopY2;
        braking = true;
      }
      vehicles.push({ x: cx + 16, y, heading: Math.PI / 2, braking, blinking: false });
    } else if (cycleTime >= 12.5 || cycleTime < 3.2) {
      const elapsed = cycleTime >= 12.5 ? (cycleTime - 12.5) : (cycleTime + CYCLE_DURATION - 12.5);
      const u = elapsed / 4.7;
      const ease = u * u * (3 - 2 * u);
      const y = vQueueStopY2 + ease * (height + 50 - vQueueStopY2);
      vehicles.push({ x: cx + 16, y, heading: Math.PI / 2, braking: false, blinking: false });
    }

    // --- CAR 3: Northbound Straight (x = cx - 16, South to North during vertical green) ---
    if (cycleTime >= 0.6 && cycleTime < 3.6) {
      const u = (cycleTime - 0.6) / 3.0;
      const y = height + 40 - u * (height + 80);
      vehicles.push({ x: cx - 16, y, heading: -Math.PI / 2, braking: false, blinking: false });
    }

    // --- CAR 4: Turning Lead Car (enters from top, turns East, yields to cat, accelerates off-screen) ---
    let leadX = -999;
    let leadY = -999;
    let leadHeading = 0;
    let leadBraking = false;
    let leadBlinking = false;

    if (cycleTime >= 1.0 && cycleTime < 11.2) {
      const blinkState = Math.sin(now * 0.015) > 0;
      if (cycleTime < 2.6) {
        // Enters from off-screen top (y = -40), travels South down vertical road towards junction
        const u = (cycleTime - 1.0) / 1.6;
        leadX = cx + 16;
        leadY = -40 + u * (cy - 32 - (-40));
        leadHeading = Math.PI / 2;
        leadBraking = u > 0.6;
        leadBlinking = blinkState;
      } else if (cycleTime < 4.2) {
        // Smooth 90-degree left turn arc into Eastbound lane cy - 16
        const u = (cycleTime - 2.6) / 1.6;
        const ease = u * u * (3 - 2 * u);
        const phi = Math.PI - ease * (Math.PI / 2);
        leadX = (cx + 32) + 16 * Math.cos(phi);
        leadY = (cy - 32) + 16 * Math.sin(phi);
        leadHeading = phi - Math.PI / 2;
        leadBraking = true;
        leadBlinking = blinkState;
      } else if (cycleTime < 5.2) {
        // Rolls into Eastbound lane, spots crossing cat ahead and brakes
        const u = (cycleTime - 4.2) / 1.0;
        const ease = 1 - Math.pow(1 - u, 2);
        leadX = (cx + 32) + ease * 46; // cx + 32 to cx + 78
        leadY = cy - 16;
        leadHeading = 0;
        leadBraking = u > 0.4;
        leadBlinking = false;
      } else if (cycleTime < 7.5) {
        // Yielding to crossing cat! Full halt with brake lights illuminated
        leadX = cx + 78;
        leadY = cy - 16;
        leadHeading = 0;
        leadBraking = true;
        leadBlinking = false;
      } else {
        // Hazard cleared: accelerates forward off-screen right
        const u = (cycleTime - 7.5) / 3.7;
        const clampedU = Math.min(1.0, u);
        const ease = clampedU * clampedU;
        leadX = (cx + 78) + ease * (width + 80 - (cx + 78));
        leadY = cy - 16;
        leadHeading = 0;
        leadBraking = false;
        leadBlinking = false;
      }
      vehicles.push({ x: leadX, y: leadY, heading: leadHeading, braking: leadBraking, blinking: leadBlinking });
    }

    // --- CAR 5: Opposing Westbound Traffic 1 (Bottom lane cy + 16, yields for cat) ---
    if (cycleTime >= 5.2 && cycleTime < 10.0) {
      let x = -999;
      let braking = false;
      if (cycleTime < 6.4) {
        // Approaches from right, spots cat crossing lane cy + 16 and brakes
        const u = (cycleTime - 5.2) / 1.2;
        const ease = 1 - Math.pow(1 - u, 2.2);
        x = (width + 40) - ease * (width + 40 - (cx + 135));
        braking = u > 0.4;
      } else if (cycleTime < 7.4) {
        // Halted before cat crossing path with brake lights on
        x = cx + 135;
        braking = true;
      } else {
        // Cat safely reached bottom sidewalk: accelerates Westward through junction
        const u = (cycleTime - 7.4) / 2.6;
        const ease = u * u;
        x = (cx + 135) - ease * (cx + 135 - (-40));
        braking = false;
      }
      vehicles.push({ x, y: cy + 16, heading: Math.PI, braking, blinking: false });
    }

    // --- CAR 6: Opposing Westbound Traffic 2 (Follows behind Car 5) ---
    if (cycleTime >= 8.2 && cycleTime < 11.6) {
      const u = (cycleTime - 8.2) / 3.4;
      const x = width + 40 - u * (width + 80);
      vehicles.push({ x, y: cy + 16, heading: Math.PI, braking: false, blinking: false });
    }

    // -------------------------------------------------------------------------
    // 4. EGO AGENT CAR (Cyan, PPO Autonomous Policy, Seamless Loop)
    // Active only in Phase 05: The Agent simulation
    // -------------------------------------------------------------------------
    let egoX = -999;
    let egoBraking = false;
    let policyText = 'PPO: DECELERATING';
    let policyColor = '#f59e0b';

    if (isAgentSim) {
      const egoStopX = hStopX - carLen / 2 - 8;
      const egoY = cy - 16;
      const egoHaltX = cx + 22; // Safe stop behind halted lead car (56px center distance)

      // Approach phase seamlessly spans across the 14.0s / 0.0s boundary: 12.0s to 1.8s
      const isApproach = cycleTime >= 12.0 || cycleTime < 1.8;
      if (isApproach) {
        const elapsed = cycleTime >= 12.0 ? (cycleTime - 12.0) : (cycleTime + CYCLE_DURATION - 12.0);
        const u = elapsed / 3.8;
        const ease = 1 - Math.pow(1 - u, 2.4);
        egoX = -40 + ease * (egoStopX - (-40));
        egoBraking = u > 0.4;
        policyText = 'PPO: DECELERATING';
        policyColor = '#f59e0b';
      } else if (cycleTime < 5.2) {
        // Holds at stop line observing cross-traffic and lead car
        egoX = egoStopX;
        egoBraking = true;
        policyText = 'PPO: YIELD (RED)';
        policyColor = '#f43f5e';
      } else if (cycleTime < 7.5) {
        // Green signal: accelerates, spots stopped lead car & crossing cat, halts safely behind!
        const u = (cycleTime - 5.2) / 2.0;
        const clampedU = Math.min(1.0, u);
        const ease = 1 - Math.pow(1 - clampedU, 2);
        egoX = egoStopX + ease * (egoHaltX - egoStopX);
        egoBraking = u > 0.65;
        policyText = u > 0.65 ? 'PPO: OBSTACLE YIELD' : 'PPO: ACCELERATING';
        policyColor = u > 0.65 ? '#f43f5e' : '#2dd4bf';
      } else if (cycleTime < 11.6) {
        // Hazard cleared: resumes adaptive following maintaining safe headway
        const u = (cycleTime - 7.5) / 3.8;
        const clampedU = Math.min(1.0, u);
        const ease = clampedU * clampedU;
        const freeCruiseX = egoHaltX + ease * (width + 80 - egoHaltX);
        const safeGap = 56;
        egoX = Math.min(freeCruiseX, leadX - safeGap);
        egoBraking = false;
        policyText = 'PPO: FOLLOWING';
        policyColor = '#2dd4bf';
      }

      // -------------------------------------------------------------------------
      // 5. Lidar Ray-Casting from Front Bumper of Ego Car
      // -------------------------------------------------------------------------
      if (egoX > -30 && egoX < width + 30) {
        const bumperX = egoX + carLen / 2;
        const bumperY = egoY;
        const maxRange = 135;

        rayAngles.forEach((angle) => {
          let bestDist = maxRange;
          let hitType = 'none';

          for (let d = 6; d <= maxRange; d += 3) {
            const rx = bumperX + Math.cos(angle) * d;
            const ry = bumperY + Math.sin(angle) * d;

            // Check hit against crossing cat
            if (catActive) {
              const dx = rx - catX;
              const dy = ry - catY;
              if (dx * dx + dy * dy < 9 * 9) {
                bestDist = d;
                hitType = 'obstacle';
                break;
              }
            }

            // Check hit against all other vehicles
            for (const v of vehicles) {
              const dx = rx - v.x;
              const dy = ry - v.y;
              const distSq = dx * dx + dy * dy;
              if (distSq < (carLen / 2 + 3) * (carLen / 2 + 3)) {
                bestDist = d;
                hitType = 'car';
                break;
              }
            }
            if (hitType !== 'none') break;

            // Check red signal boundary hit if red light is active
            if (!hGreen && egoX <= hStopX && rx >= hStopX - 2 && rx <= hStopX + 4 && ry >= cy - roadHalf && ry <= cy) {
              bestDist = d;
              hitType = 'signal';
              break;
            }

            // Check road kerb boundaries outside junction box
            const inH = ry >= cy - roadHalf && ry <= cy + roadHalf;
            const inV = rx >= cx - roadHalf && rx <= cx + roadHalf;
            if (!inH && !inV) {
              bestDist = d;
              hitType = 'kerb';
              break;
            }
          }

          const endX = bumperX + Math.cos(angle) * bestDist;
          const endY = bumperY + Math.sin(angle) * bestDist;
          const isHit = hitType !== 'none';

          ctx.beginPath();
          ctx.moveTo(bumperX, bumperY);
          ctx.lineTo(endX, endY);
          if (hitType === 'car' || hitType === 'obstacle') {
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.88)';
            ctx.lineWidth = 1.6;
          } else if (hitType === 'signal') {
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.75)';
            ctx.lineWidth = 1.4;
          } else {
            ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
            ctx.lineWidth = 1;
          }
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(endX, endY, isHit ? 3.2 : 1.8, 0, Math.PI * 2);
          ctx.fillStyle = hitType === 'car' || hitType === 'obstacle' ? '#f59e0b' : hitType === 'signal' ? '#f43f5e' : '#2dd4bf';
          ctx.fill();
        });
      }
    }

    // -------------------------------------------------------------------------
    // 6. Render Obstacles & Vehicles
    // -------------------------------------------------------------------------
    // Crossing cat
    if (catActive && catX > -20 && catX < width + 20) {
      drawCat(catX, catY, Math.PI / 2, now * 0.015);
    }

    // NPC vehicles
    vehicles.forEach((v) => {
      drawCar(v.x, v.y, v.heading, false, v.braking, v.blinking);
    });

    // Ego agent vehicle (Phase 05 only)
    if (isAgentSim && egoX > -30 && egoX < width + 30) {
      drawCar(egoX, cy - 16, 0, true, egoBraking, false);
    }

    // -------------------------------------------------------------------------
    // 7. HUD Telemetry Readout
    // -------------------------------------------------------------------------
    if (isAgentSim) {
      ctx.font = '500 10.5px "JetBrains Mono Variable", monospace';
      ctx.fillStyle = policyColor;
      ctx.textAlign = 'left';
      ctx.fillText(policyText, 14, 20);
    } else {
      ctx.font = '500 9.5px "JetBrains Mono Variable", monospace';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'left';
      ctx.fillText('SIMULATION EXAMPLE: INTERSECTIONS · REALISTIC TRAFFIC FLOW', 14, 20);
    }
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        visible = e.isIntersecting;
      });
    });
    io.observe(canvas);
  }

  function loop() {
    if (visible) {
      drawFrame();
    }
    requestAnimationFrame(loop);
  }
  loop();
}
