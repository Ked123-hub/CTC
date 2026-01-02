import axios from 'axios';

const root = async () => {
  try {
    const r = await axios.get('http://localhost:3000/');
    console.log('ROOT', r.status);
  } catch (e) {
    console.error('ROOT ERR');
    console.dir(e, { depth: 4 });
  }
};

const geofenceValidate = async () => {
  try {
    const r = await axios.post('http://localhost:3000/api/projects/00000000-0000-0000-0000-000000000000/geofence/validate', {
      latitude: 12.34,
      longitude: 56.78,
    }, { validateStatus: () => true });
    console.log('GEOFENCE', r.status, r.data);
  } catch (e) {
    console.error('GEOFENCE ERR');
    console.dir(e, { depth: 4 });
  }
};

(async () => {
  await root();
  await geofenceValidate();
})();
