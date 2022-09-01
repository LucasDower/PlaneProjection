import * as THREE from 'three';

export function projectPointOnPlane(point: THREE.Vector3, plane: { origin: THREE.Vector3, normal: THREE.Vector3 }) {
    // p' = p - (n ⋅ (p - o)) × n
    return point.clone().sub(plane.normal.clone().multiplyScalar(point.clone().sub(plane.origin).dot(plane.normal)));
}

export function eulerToNormal(euler: THREE.Euler) {
	const yaw = -euler.y;
	const pitch = -euler.x;
	const rot = new THREE.Vector3(
		Math.sin(yaw),
		-(Math.sin(pitch) * Math.cos(yaw)),
		-(Math.cos(pitch) * Math.cos(yaw))
	);
	rot.normalize();
    return rot;
}