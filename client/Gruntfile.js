module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-browserify');

  grunt.initConfig({

    browserify: {
      client: {
        src: './main.js',
        dest: '../public/bundle.js',
        options: {
          alias: ['./main.js:kedmaps']
        }
      }
    }

  });

};
