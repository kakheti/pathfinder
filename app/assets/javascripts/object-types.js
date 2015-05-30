var objectTypes = {
  tower: {
    zoom: 16,
    name: 'ანძა',
    cluster: 30
  },
  tp: {
    zoom: 18,
    name: 'ჯიხური',
    cluster: 30
  },
  pole: {
    zoom: 18,
    name: 'ბოძი',
    cluster: 50
  },
  fider: {
    zoom: 16,
    name: 'ფიდერი',
    marker: false,
    cluster: 100
  },
  substation: {
    zoom: 0,
    name: 'ქ/ს',
    cluster: 10
  },
  office: {
    zoom: 0,
    name: 'ოფისი',
    cluster: 10
  },
  line: {
    marker: false,
    name: 'ხაზი',
    cluster: 100
  }
};

module.exports = objectTypes;