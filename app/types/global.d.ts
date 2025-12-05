declare module 'https://esm.sh/three';
declare module 'https://esm.sh/globe.gl';
declare module 'https://esm.sh/solar-calculator*';

interface Airport {
	airport_id: number;
	name: string;
	city: string;
	country: string;
	iata: string;
	icao: string;
	latitude: number;
	longitude: number;
	altitude: number;
	timezone: number;
	dst: string;
	tz_db: string;
	type: string;
	source: string;
}
