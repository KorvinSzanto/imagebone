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
          'build/imgbone.js': ['src/build.js'],
        }
      }
    },
    uglify: {
      dist: {
        options: {
          sourceMap: true,
          sourceMapName: 'build/imgbone.map'
        },
        files: {
          'build/imgbone.min.js': ['build/imgbone.js']
        }
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');

  // Default task.
  grunt.registerTask('default', ['jshint', 'browserify']);
  grunt.registerTask('production', ['jshint', 'browserify', 'uglify']);

};
