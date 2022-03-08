require('dotenv').config()

module.exports = function(grunt) {
    
    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: {
                email: 'accounts@justonh.art',
                //token provided in .env file
                token: process.env.token,
                branch: 'default',
            },
            dist: {
                src: ['src/*.js']
            }
        }
    });
}