const dayNightShader = {
	vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
	fragmentShader: `
        #define PI 3.141592653589793
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec2 sunPosition;
        uniform vec2 globeRotation;
        varying vec3 vNormal;
        varying vec2 vUv;

        float toRad(in float a) {
            return a * PI / 180.0;
        }

        vec3 Polar2Cartesian(in vec2 c) { // [lng, lat]
            float theta = toRad(90.0 - c.x);
            float phi = toRad(90.0 - c.y);
            return vec3( // x,y,z
                sin(phi) * cos(theta),
                cos(phi),
                sin(phi) * sin(theta)
            );
        }

        void main() {
            float invLon = toRad(globeRotation.x);
            float invLat = -toRad(globeRotation.y);
            mat3 rotX = mat3(
                1, 0, 0,
                0, cos(invLat), -sin(invLat),
                0, sin(invLat), cos(invLat)
            );
            mat3 rotY = mat3(
                cos(invLon), 0, sin(invLon),
                0, 1, 0,
                -sin(invLon), 0, cos(invLon)
            );
            vec3 rotatedSunDirection = rotX * rotY * Polar2Cartesian(sunPosition);
            float intensity = dot(normalize(vNormal), normalize(rotatedSunDirection));
            vec4 dayColor = texture2D(dayTexture, vUv);
            vec4 nightColor = texture2D(nightTexture, vUv);
            float blendFactor = smoothstep(-0.1, 0.1, intensity);
            gl_FragColor = mix(nightColor, dayColor, blendFactor);
        }
    `,
};

const fieldNames = [
	'airport_id',
	'name',
	'city',
	'country',
	'iata',
	'icao',
	'latitude',
	'longitude',
	'altitude',
	'timezone',
	'dst',
	'tz_db',
	'type',
	'source',
];

const getAltitude = () => {
	const baseAlt = 1.5;
	return window.innerWidth < 600 ? 5 : baseAlt;
};

const getTime = (dt: number) => {
	return new Date(dt).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

const getCoords = () =>
	new Promise<{ lat: number; lng: number }>(resolve => {
		navigator.geolocation.getCurrentPosition(
			pos => {
				console.log(pos);
				resolve({
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
				});
			},

			() => resolve({ lat: 43, lng: 76 }), // если ошибка — ставим 0 0
		);
	});
const parseCSVLine = (line: string) => {
	const result = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		const nextChar = line[i + 1];

		if (char === '"') {
			// Handle escaped quotes ("")
			if (inQuotes && nextChar === '"') {
				current += '"';
				i++; // Skip next quote
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === ',' && !inQuotes) {
			result.push(current);
			current = '';
		} else {
			current += char;
		}
	}

	result.push(current); // Add last field
	return result;
};
function csvToAirportObject(csvLine: string) {
	const fields = parseCSVLine(csvLine);
	const result = {} as Airport;

	fieldNames.forEach((fieldName: string, index: number) => {
		const value = fields[index]!;
		const key = fieldName as keyof Airport;

		// Преобразование типов данных
		switch (key) {
			case 'airport_id':
			case 'altitude':
			case 'timezone':
				result[key] = parseInt(value, 10);
				break;
			case 'latitude':
			case 'longitude':
				result[key] = parseFloat(value);
				break;
			default:
				result[key] = value as string;
		}
	});

	return result;
}
export { dayNightShader, getAltitude, getTime, getCoords, csvToAirportObject };
