module.exports = function (grunt) {
  'use strict';
  // Project configuration.
  grunt.initConfig({

    jshint: {
      all: ['src'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    browserify: {
      dist: {
        files: {
          'build/imagebone.js': ['src/build.js'],
        }
      }
    },
    uglify: {
      dist: {
        options: {
          sourceMap: true,
          sourceMapName: 'build/imagebone.map'
        },
        files: {
          'build/imagebone.min.js': ['build/imagebone.js']
        }
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');

  // Default task.
  grunt.registerTask('default', ['jshint', 'browserify']);
  grunt.registerTask('release', ['jshint', 'browserify', 'uglify']);

};
