<template>
	<div class="h-screen w-screen bg-black text-white flex justify-center items-center relative">
		<div id="globeViz" class="w-full h-full"></div>
		<div class="absolute left-6 top-6 flex gap-3">
			<input type="number" v-model="coords.lat" class="bg-white text-black" />
			<input type="number" v-model="coords.lng" class="bg-white text-black" />
			<button @click="addMarker()">Add</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { TextureLoader, MeshPhongMaterial } from 'https://esm.sh/three';
import Globe from 'https://esm.sh/globe.gl';
import { getAltitude, getCoords } from '~/constants';

const storeAirports = useStoreAirports();

let world: any = null;
const coords = reactive({ lat: 0, lng: 0 });
const markers = reactive<{ lat: number; lng: number }[]>([]);

const addMarker = () => {
	markers.push({ lat: coords.lat, lng: coords.lng });

	world.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: getAltitude() }, 1500);
};

// Watch для HTML-маркеров
watch(markers, () => {
	world.htmlElementsData(markers).htmlElement(() => {
		const el = document.createElement('div');
		el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#780b16" d="M12 12q.825 0 1.413-.587T14 10t-.587-1.412T12 8t-1.412.588T10 10t.588 1.413T12 12m0 10q-4.025-3.425-6.012-6.362T4 10.2q0-3.75 2.413-5.975T12 2t5.588 2.225T20 10.2q0 2.5-1.987 5.438T12 22"/></svg>`;
		el.style.transform = 'translate(-50%, -50%)';
		return el;
	});
});

const resize = () => {
	world.width(window.innerWidth);
	world.height(window.innerHeight);
};

onBeforeMount(async () => {
	const coords = await getCoords();

	world = new Globe(document.getElementById('globeViz'));

	const dayTexture = await new TextureLoader().loadAsync('/day.webp');
	const material = new MeshPhongMaterial({ map: dayTexture });

	world
		.globeMaterial(material)
		.backgroundImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png')
		.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: getAltitude() }, 1500);

	window.addEventListener('resize', resize);
	resize();
});

onMounted(async () => {
	storeAirports.fetchAirports();
});
</script>

<style>
.background::before {
	content: '';
	position: absolute;
	bottom: 0px;
	width: 500px;
	height: 160px;
	border-top-left-radius: 200px;
	border-top-right-radius: 200px;
	background-color: rgba(0, 0, 0, 0.5);
	filter: blur(20px);
	transform: scale(1.25);
}
</style>
