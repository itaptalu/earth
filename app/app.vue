<template>
	<div class="h-screen w-screen bg-black text-white flex justify-center items-center relative">
		<div id="globeViz" class="w-full h-full"></div>

		<div class="fixed left-6 right-6 bottom-0 pb-6 flex justify-center background">
			<div class="flex gap-4 items-center relative z-10">
				<button
					@click="addHour(-1)"
					class="px-6 py-3 bg-gray-700 rounded hover:bg-gray-600 leading-5 font-medium"
				>
					-1 hour
				</button>
				<span>{{ getTime(dt) }}</span>
				<button
					@click="addHour(1)"
					class="px-6 py-3 bg-gray-700 rounded hover:bg-gray-600 leading-5 font-medium"
				>
					+1 hour
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { TextureLoader, ShaderMaterial, Vector2 } from 'https://esm.sh/three';
import * as solar from 'https://esm.sh/solar-calculator';
import Globe from 'https://esm.sh/globe.gl';
import { dayNightShader, getAltitude, getTime, getCoords } from '~/constants';

const dt = ref(Date.now());
const material = ref<any>(null);
let world: any = null;

const sunPosAt = (dt: number) => {
	const day = new Date(dt).setUTCHours(0, 0, 0, 0);
	const t = solar.century(dt);
	const longitude = ((day - dt) / 864e5) * 360 - 180;
	return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
};

const updateSun = () => {
	if (material.value) {
		material.value.uniforms.sunPosition.value.set(...sunPosAt(dt.value));
	}
};

const addHour = (h: number) => {
	dt.value += h * 3600_000;
};

const resize = () => {
	world.width(window.innerWidth);
	world.height(window.innerHeight);
};

watch(dt, updateSun);

onBeforeMount(async () => {
	const coords = await getCoords().catch(() => ({ lat: 0, lon: 0 }));

	world = new Globe(document.getElementById('globeViz'));

	const [dayTexture, nightTexture] = await Promise.all([
		new TextureLoader().loadAsync('/day.webp'),
		new TextureLoader().loadAsync('/night.webp'),
	]);

	material.value = new ShaderMaterial({
		uniforms: {
			dayTexture: { value: dayTexture },
			nightTexture: { value: nightTexture },
			sunPosition: { value: new Vector2() },
			globeRotation: { value: new Vector2() },
		},
		vertexShader: dayNightShader.vertexShader,
		fragmentShader: dayNightShader.fragmentShader,
	});

	world
		.globeMaterial(material.value)
		.backgroundImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png')
		.pointOfView({ lat: coords.lat, lng: coords.lon, altitude: getAltitude() }, 1500)
		.onZoom(({ lng, lat }: { lng: number; lat: number }) => {
			if (material.value) material.value.uniforms.globeRotation.value.set(lng, lat);
		});

	if (coords.lat != null && coords.lon != null) {
		world.htmlElementsData([{ lat: coords.lat, lng: coords.lon }]).htmlElement(() => {
			const el = document.createElement('div');
			el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#780b16" d="M12 12q.825 0 1.413-.587T14 10t-.587-1.412T12 8t-1.412.588T10 10t.588 1.413T12 12m0 10q-4.025-3.425-6.012-6.362T4 10.2q0-3.75 2.413-5.975T12 2t5.588 2.225T20 10.2q0 2.5-1.987 5.438T12 22"/></svg>`;
			el.style.transform = 'translate(-50%, -50%)';
			return el;
		});
	}

	updateSun();
});

onMounted(() => {
	window.addEventListener('resize', resize);
	resize();
});
</script>

<style>
.background::before {
	content: '';
	position: absolute;
	bottom: 0px;
	width: 500px;
	height: 150px;
	border-top-left-radius: 150px;
	border-top-right-radius: 150px;
	background-color: rgba(0, 0, 0, 0.5);
	filter: blur(20px);
}
</style>
