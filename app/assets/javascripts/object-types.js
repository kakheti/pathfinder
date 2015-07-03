var objectTypes = {
  tower: {
    zoom: 16,
    name: 'ანძა',
    plural: 'ანძები',
    cluster: 30
  },
  tp: {
    zoom: 18,
    name: 'ჯიხური',
    plural: '6-10კვ სატრ. ჯიხურები',
    cluster: 30
  },
  pole: {
    zoom: 18,
    name: 'საყრდენი',
    plural: '6-10კვ საყრდენები',
    cluster: 50
  },
  fider: {
    zoom: 16,
    name: 'ფიდერი',
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
    marker: false,
    name: 'ხაზი',
    plural: 'გადამცემი ხაზები',
    cluster: 100
  }
};

module.exports = objectTypes;