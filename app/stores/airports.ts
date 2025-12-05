import { defineStore } from 'pinia';
import { csvToAirportObject } from '~/constants';

export const useStoreAirports = defineStore('airports', {
	state: () => ({
		airports: [] as Airport[],
	}),
	getters: {
		getCoordsById: state => {
			return (id: number) => {
				const airport = state.airports.find(el => el.airport_id === id);

				if (airport) {
					return {
						lat: airport.latitude, // предположительно так должно быть
						lng: airport.longitude,
					};
				}
				return undefined;
			};
		},
	},
	actions: {
		async fetchAirports() {
			try {
				const res = await $fetch<string>(
					'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat',
				);

				res.split('\n').forEach((el: string) => {
					this.airports.push(csvToAirportObject(el));
				});
			} catch (error) {
				console.error(error);
			}
		},
	},
});
