module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({

    browserify: {
      client: {
        src: './main.js',
        dest: '../public/bundle.js',
        options: {
          alias: ['./main.js:kedmaps']
        }
      }
    },

    watch: {
      files: '**/*.js',
      tasks: 'browserify'
    },

  });

};
