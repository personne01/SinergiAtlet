# KYS Computer Vision Engine Architecture

This document describes the production-grade motion analysis engine built on top of MediaPipe Pose Landmarker for the KYS (Kenali & Yakin Skill) platform.

## 1. Algorithm Architecture

The pipeline processes raw landmarks into high-level athletic scoring metrics:

1.  **Raw Ingestion**: MediaPipe Pose emits 33 3D landmarks (x, y normalized; z relative depth).
2.  **Temporal Smoothing**: A One Euro Filter (or SMA) removes high-frequency jitter from coordinate streams.
3.  **Spatial Normalization**: We scale coordinates based on a reference bone (e.g., shoulder-to-hip or torso length) to estimate real-world metrics (meters/sec) regardless of camera distance.
4.  **Kinematics Extraction**: Compute first and second-order derivatives (velocity and acceleration) of key joints and the Center of Gravity (CG).
5.  **Biomechanics Extraction**: Calculate 3D joint angles, limb symmetry, and CG stability.
6.  **Heuristic Scoring**: Compare extracted features against sport-specific thresholds and ideal movement curves.

## 2. Mathematical Calculations

### Distance & Normalization
Since MediaPipe x,y are [0,1], we define a reference vector $\vec{T}$ (Torso, usually mid-shoulder to mid-hip). We assume an average human torso is $\approx 0.5$ meters.
$$Scale = \frac{0.5}{|\vec{T}|}$$
Real-world distance between $P_1$ and $P_2$: 
$$D_{real} = Scale \times \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$$

### Velocity & Acceleration
For a point $P$ at time $t$ and $t-1$:
- **Velocity ($v$)**: $\frac{D_{real}(P_{t}, P_{t-1})}{\Delta t}$
- **Acceleration ($a$)**: $\frac{v_t - v_{t-1}}{\Delta t}$

### 3D Joint Angles
For three points A, B (vertex), and C, the angle $\theta$:
$$\theta = \arccos \left( \frac{\vec{BA} \cdot \vec{BC}}{|\vec{BA}||\vec{BC}|} \right) \times \frac{180}{\pi}$$

## 3. Temporal Smoothing Strategy

Raw tracking data contains jitter. For low-latency real-time applications, a **One Euro Filter** is superior, but for post-processing of recorded video (our primary use case), a **Simple Moving Average (SMA)** or **Savitzky-Golay filter** over a short window (e.g., 3-5 frames) is highly effective and computationally cheap.

We implement a simple 3-frame SMA for spatial coordinates before derivative calculations to prevent noise amplification in acceleration.

## 4. Feature Extraction Pipeline

- **Speed/Agility**: Peak Velocity of the Center of Gravity (CG).
- **Explosiveness**: Peak Acceleration of the CG and tracking feet liftoff.
- **Symmetry**: Difference in average knee flexion and elbow flexion between left and right sides during the movement.
- **Stability**: Standard deviation of the CG's lateral (X-axis) displacement relative to the mid-point of the feet constraint base.

## 5. Performance Optimization Strategy

1.  **Web Worker Offloading**: Moving all MediaPipe processing and heavy math array iterations off the main UI thread.
2.  **Typed Arrays**: Using `Float32Array` for coordinates internally if possible, though plain JS arrays are often sufficiently optimized by V8 for this scale.
3.  **Frame Rate Throttling**: Running MediaPipe at 15-30 FPS instead of 60 FPS. 15-24 FPS is the sweet spot for capturing human athletic motion without thermal throttling mobile devices.
4.  **Garbage Collection Minimization**: Reusing objects and arrays where possible in the validation loop instead of allocating new ones per frame. Closing `ImageBitmap` immediately after use.
