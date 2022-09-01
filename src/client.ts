import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { eulerToNormal, projectPointOnPlane } from './math';
import { ASSERT } from './util';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

const orbitControls = new OrbitControls(camera, renderer.domElement);
const transformControls = new TransformControls(camera, renderer.domElement);

const stats = Stats();

const POINT_SIZE = 0.01;

const objs: { [id: string]: THREE.Mesh } = {};
const lines: { [id: string]: THREE.Line } = {};

function init() {
	//scene.add(new THREE.AxesHelper(1.0));

	for (let i = 0; i < 10; ++i) {
		// POINT TO PROJECT
		{
			const id = `point_${i}`;
			const point = new THREE.SphereGeometry(POINT_SIZE);
			const material = new THREE.MeshBasicMaterial({
				color: new THREE.Color('red')
			});
			objs[id] = new THREE.Mesh(point, material);
			objs[id].position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
			scene.add(objs[id]);
		}

		// PROJECTED POINT
		{
			const id = `proj_${i}`;
			const point = new THREE.SphereGeometry(POINT_SIZE);
			const material = new THREE.MeshBasicMaterial({
				color: new THREE.Color('white')
			});
			objs[id] = new THREE.Mesh(point, material);
			scene.add(objs[id]);
		}

		// Line
		{	
			const id = `line_${i}`;
			const geometry = new THREE.BufferGeometry().setFromPoints([]);
			const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
			lines[id] = new THREE.Line( geometry, material );
			scene.add(lines[id]);
		}
	}

	// PLANE
	{
		const cube = new THREE.CircleGeometry(Math.SQRT2, 64);
		const material = new THREE.MeshBasicMaterial({
			color: new THREE.Color('gray'),
			side: THREE.DoubleSide
		});
		objs.plane = new THREE.Mesh(cube, material);
		scene.add(objs.plane);
	}

	transformControls.mode = 'rotate';
  	transformControls.addEventListener('change', render);
	transformControls.attach(objs.plane);
	transformControls.setSize(0.5);
	scene.add(transformControls);

	const grid = new THREE.GridHelper(10, 2);
	grid.position.y -= 0.001;
	//scene.add(grid);

	const light = new THREE.PointLight();
	light.position.set(0.8, 1.4, 1.0);
	scene.add(light);

	const ambientLight = new THREE.AmbientLight();
	scene.add(ambientLight);

	camera.position.set(1.0, 1.0, 1.0);
	camera.lookAt(0.0, 0.0, 0.0);

	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	orbitControls.target.set(0, 0, 0);

	document.body.appendChild(stats.dom);

	const onWindowResize = () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
		render();
	};
	window.addEventListener('resize', onWindowResize, false);
}

function animate() {
	const planeNormal = eulerToNormal(objs['plane'].rotation);

	for (let i = 0; i < 10; ++i) {
		const pointId = `point_${i}`;
		const projection = projectPointOnPlane(objs[pointId].position, { origin: new THREE.Vector3(0, 0, 0), normal: planeNormal });

		const projectionId = `proj_${i}`;
		objs[projectionId].position.copy(projection);

		const lineId = `line_${i}`;
		const startPos = objs[pointId].position;
		const endPos = objs[projectionId].position;
		const vertices = new Float32Array( [
			startPos.x, startPos.y, startPos.z,
			endPos.x, endPos.y, endPos.z
		] );
		lines[lineId].geometry.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ) );
	}
	
	orbitControls.enabled = !transformControls.dragging;
	orbitControls.update();
	stats.update();
	
	render();
	requestAnimationFrame(animate);
}

function render() {
	renderer.render(scene, camera);
}

init();
animate();