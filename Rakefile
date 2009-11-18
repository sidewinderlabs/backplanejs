require 'rake'
require 'rake/packagetask'
require 'yaml'

module Helper
  ROOT_DIR      = File.expand_path(File.dirname(__FILE__))
  yaml_constants = YAML.load(IO.read(File.join(ROOT_DIR, 'constants.yml')))

  SRC_DIR       = File.join(ROOT_DIR, yaml_constants['SRC'])
  DIST_DIR      = File.join(ROOT_DIR, yaml_constants['DIST'])
  ASSETS_DIR		= File.join(DIST_DIR, "assets")
  DOC_DIR       = File.join(ROOT_DIR, 'doc')
  TEMPLATES_DIR = File.join(ROOT_DIR, 'templates')
  PKG_DIR       = File.join(ROOT_DIR, 'pkg')
  TEST_DIR      = File.join(ROOT_DIR, 'test')
  TEST_UNIT_DIR = File.join(TEST_DIR, 'unit')
  TMP_DIR       = File.join(TEST_UNIT_DIR, 'tmp')

  VERSION       = yaml_constants['VERSION']
  MAIN_FILE     = yaml_constants['MAIN_FILE']
 
	Dir::mkdir(DIST_DIR) unless FileTest::directory?(DIST_DIR)
	Dir::mkdir(ASSETS_DIR) unless FileTest::directory?(ASSETS_DIR)
  
  def self.sprocketize(path, source, destination = nil, strip_comments = true)
    require_sprockets

		secretary = Sprockets::Secretary.new(
      :root           => File.join(ROOT_DIR, path),
      :asset_root     => ASSETS_DIR,
      :load_path      => [SRC_DIR, ROOT_DIR],
      :source_files   => [source],
      :strip_comments => strip_comments
    )
    
    destination = File.join(DIST_DIR, source) unless destination
		secretary.concatenation.save_to(destination)
    secretary.install_assets
  end
  
  def self.require_sprockets
    require_submodule('Sprockets', 'sprockets')
  end
  
  def self.require_submodule(name, path)
    begin
      require path
    rescue LoadError => e
      missing_file = e.message.sub('no such file to load -- ', '')
      if missing_file == path
        puts "\nIt looks like you're missing #{name}. Just run:\n\n"
        puts "  $ git submodule init"
        puts "  $ git submodule update vendor/#{path}"
        puts "\nand you should be all set.\n\n"
      else
        puts "\nIt looks like #{name} is missing the '#{missing_file}' gem. Just run:\n\n"
        puts "  $ gem install #{missing_file}"
        puts "\nand you should be all set.\n\n"
      end
      exit
    end
  end
end

task :default => [:dist, :unit, :package, :clean_package_source]

desc "Builds the distribution."
task :dist do
  Helper.sprocketize("build", Helper::MAIN_FILE)
end

desc "Builds the unit-test files."
task :unit do
  Helper.sprocketize("xforms/src/lib/backplane/_unit-tests", "*.js", "_unit-tests/backplane/unit-tests.js")
  Helper.sprocketize("rdfa/_unit-tests", "*.js", "_unit-tests/rdfa/unit-tests.js")
end

Rake::PackageTask.new('backplane', Helper::VERSION) do |package|
  package.need_tar_gz = true
  package.package_dir = Helper::PKG_DIR
  package.package_files.include(
    '[A-Z]*',
    'dist/prototype.js',
    'lib/**',
    'src/**',
    'test/**'
  )
end

task :clean_package_source do
  rm_rf File.join(Helper::PKG_DIR, "backplane-#{Helper::VERSION}")
end
