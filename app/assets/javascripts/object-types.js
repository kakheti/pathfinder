var objectTypes = {
  tower: {
    zoom: 16,
    name: 'ანძა',
    plural: 'ანძები',
    cluster: 30
  },
  tp: {
    zoom: 16,
    name: '6-10კვ სატრ. ჯიხური',
    plural: '6-10კვ სატრ. ჯიხურები',
    cluster: 30
  },
  pole: {
    zoom: 16,
    name: '6-10კვ საყრდენი',
    plural: '6-10კვ საყრდენები',
    cluster: 50
  },
  fider: {
    zoom: 16,
    name: '6-10კვ ფიდერი',
    plural: '6-10კვ ფიდერები',
    marker: false,
    cluster: 100
  },
  substation: {
    zoom: 0,
    name: 'ქ/ს',
    plural: 'ქვესადგურები',
    cluster: 10
  },
  office: {
    zoom: 0,
    name: 'ოფისი',
    plural: 'ოფისები',
    cluster: 10
  },
  line: {
    zoom: 0,
    marker: false,
    name: 'გადამცემი ხაზი',
    plural: 'გადამცემი ხაზები',
    cluster: 100
  },
  fider04: {
    zoom: 17,
    name: '0.4კვ ხაზი',
    plural: '0.4კვ ხაზები',
    cluster: 50,
    marker: false
  },
  pole04: {
    zoom: 17,
    name: '0.4კვ ბოძი',
    plural: '0.4კვ ბოძები',
    cluster: 50
  }
};

module.exports = objectTypes;