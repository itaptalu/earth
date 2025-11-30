<template>
	<div class="h-screen bg-black text-white flex justify-center items-center relative">
		<div id="globeViz"></div>

		<div class="absolute left-6 right-6 bottom-6 flex justify-center">
			<div class="flex gap-4 items-center">
				<button
					@click="addHour(-1)"
					class="px-6 py-3 bg-gray-700 rounded hover:bg-gray-600 leading-5 font-medium"
				>
					-1 hour
				</button>
				<span>
					{{ new Date(dt).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }}
				</span>
				<button
					@click="addHour(+1)"
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
import { dayNightShader, getAltitude } from '~/constants';

const coords = reactive({
	lat: 0,
	lon: 0,
});
const dt = ref(+new Date());
const material = ref<ShaderMaterial | null>(null);

const sunPosAt = (dt: number) => {
	const day = new Date(+dt).setUTCHours(0, 0, 0, 0);
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
	dt.value += h * 3600_000; // 1 час = 3600 сек = 3.6e6 ms
	updateSun();
};

onMounted(async () => {
	await navigator.geolocation.getCurrentPosition(
		pos => {
			coords.lat = pos.coords.latitude;
			coords.lon = pos.coords.longitude;
		},
		err => {
			console.error(err);
		},
	);

	const world = new Globe(document.getElementById('globeViz'));

	Promise.all([new TextureLoader().loadAsync('/day.webp'), new TextureLoader().loadAsync('/night.webp')]).then(
		([dayTexture, nightTexture]) => {
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
				.onZoom(({ lng, lat }: { lng: number; lat: number }) =>
					material.value.uniforms.globeRotation.value.set(lng, lat),
				);

			if (coords.lat && coords.lon) {
				world.htmlElementsData([{ lat: coords.lat, lng: coords.lon }]).htmlElement(() => {
					const el = document.createElement('div');
					el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#780b16" d="M12 12q.825 0 1.413-.587T14 10t-.587-1.412T12 8t-1.412.588T10 10t.588 1.413T12 12m0 10q-4.025-3.425-6.012-6.362T4 10.2q0-3.75 2.413-5.975T12 2t5.588 2.225T20 10.2q0 2.5-1.987 5.438T12 22"/></svg>`;
					el.style.transform = 'translate(-50%, -50%)';
					return el;
				});
			}

			dt.value = Date.now();
			material.value.uniforms.sunPosition.value.set(...sunPosAt(dt.value));

			window.addEventListener('resize', () => {
				world.width([window.innerWidth]);
				world.height([window.innerHeight]);
			});
		},
	);
});
</script>
