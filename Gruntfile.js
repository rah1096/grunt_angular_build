module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-browserify');

    var userConfig = require('./build.config.js');

    var taskConfig = {
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            jssrc: {
                files: [
                    '<%= app_files.js %>'
                ],
                tasks: ['copy', 'index']
            },
            gruntfile: {
                files: 'Gruntfile.js',
                tasks: [],
                options: {
                    livereload: false
                }
            },
            html: {
                files: ['<%= app_files.html %>'],
                tasks: ['index: build']
            },
            modules: {
                files: 'src/modules/**/*.js',
                tasks: ['browserify']
            },

            less: {
                files: 'src/less/**/*.less',
                tasks: [ 'less: build' ]
            }
        },

        index: {
            build: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.js %>',
                    '<%= build_dir %>/src/**/*.js',
                    '<%= html2js.app.dest %>',
                    '<%= build_dir %>/bundle.js',
                    '<%= build_dir %>/assets/**/*.css'
                ]
            }
        },

        clean: [
          '<%= build_dir %>'
        ],

        copy: {
            appjs: {
                files: [
                    {
                        src: [ '<%= app_files.js %>', '<%= app_files.atpl %>', '<%= vendor_files.js %>'],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }
                ],
                tasks: []
            }
        },

        nodemon: {
            dev: {
                script: 'server/server.js',
                options: {
                    watch: ['server']
                }
            }
        },

        concurrent: {
            dev: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        html2js: {
            app: {
                options: {
                    base: 'src/app'
                },
                src: [ '<%= app_files.atpl %>' ],
                dest: '<%= build_dir %>/templates-app.js'
            }
        },

        browserify: {
            build: {
                src: ['src/modules/modules.js'],
                dest: '<%= build_dir %>/bundle.js',
                options: {
                    debug: true
                }
            }
        },

        less: {
            build: {
                files: {
                    '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css': 'src/less/main.less'
                }
            }
        }
    };

    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

    grunt.registerTask('default', ['build', 'concurrent']);

    grunt.registerTask('build', ['clean', 'copy', 'html2js', 'browserify', 'less', 'index']);

    function filterForExtensions(extension, files) {
        var regex = new RegExp('\\.' + extension + '$'),
            dirRE = new RegExp('^(' + grunt.config('build_dir') + ')\/', 'g');
        return files.filter(function(file) {
            return file.match(regex);
        }).map(function(file) {
            return file.replace(dirRE, '');
        });
    }

    grunt.registerMultiTask('index', 'Process index.html template', function() {

        var jsFiles = filterForExtensions('js', this.filesSrc),
            cssFiles = filterForExtensions('css', this.filesSrc);

        grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
            process: function(contents, path) {
                return grunt.template.process(contents, {
                    data: {
                        scripts: jsFiles,
                        styles: cssFiles,
                        version: grunt.config('pkg.version')
                    }
                });
            }
        });
    });
};
