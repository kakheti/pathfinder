var objectTypes = {
  tower: {
    zoom: 18,
    name: 'ანძა',
    plural: 'ანძები',
    cluster: 30,
    active: false
  },
  tp: {
    zoom: 14,
    name: '6-10კვ სატრ. ჯიხური',
    plural: '6-10კვ სატრ. ჯიხურები',
    cluster: 30,
    active: true
  },
  pole: {
    zoom: 18,
    name: '6-10კვ საყრდენი',
    plural: '6-10კვ საყრდენები',
    cluster: 50,
    active: false
  },
  fider: {
    zoom: 14,
    name: '6-10კვ ფიდერი',
    plural: '6-10კვ ფიდერები',
    marker: false,
    cluster: 100,
    active: true
  },
  substation: {
    zoom: 0,
    name: 'ქ/ს',
    plural: 'ქვესადგურები',
    cluster: 10,
    active: true
  },
  office: {
    zoom: 0,
    name: 'ოფისი',
    plural: 'ოფისები',
    cluster: 10,
    active: true
  },
  line: {
    zoom: 0,
    marker: false,
    name: 'გადამცემი ხაზი',
    plural: 'გადამცემი ხაზები',
    cluster: 100,
    active: true
  },
  fider04: {
    zoom: 16,
    name: '0.4კვ ხაზი',
    plural: '0.4კვ ხაზები',
    cluster: 50,
    marker: false,
    active: true
  },
  pole04: {
    zoom: 18,
    name: '0.4კვ ბოძი',
    plural: '0.4კვ ბოძები',
    cluster: 50,
    active: false
  }
};

module.exports = objectTypes;