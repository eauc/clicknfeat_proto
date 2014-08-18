require 'sinatra/base'
require 'json'

require_relative './lib/model_collection'

class VassalApp < Sinatra::Base

  # class << self
  #   attr_accessor :styles, :scripts, :manifest
  #   attr_accessor :resources
  # end

  # @resources = {}
  # @resources[:root] = {
  #   href: 'api',
  #   type: 'resource/api',
  #   link: []
  # }
  # @resources[:status] = {
  #   href: "#{@resources[:root][:href]}/status",
  #   type: 'resource/status'
  # }
  # @resources[:root][:link] << {
  #   rel: 'resource/status',
  #   href: @resources[:status][:href]
  # }
  # @resources[:log_collection] = {
  #   href: "#{@resources[:root][:href]}/log",
  #   type: 'collection/logs'
  # }
  # @resources[:root][:link] << {
  #   rel: 'collection/logs',
  #   href: @resources[:log_collection][:href]
  # }

  # configure do
  #   mime_type :manifest, 'text/cache-manifest'
  # end

  # @styles = []
  # @scripts = []

  # configure :production, :test do
  #   @styles << 'lib/bootstrap/css/bootstrap.min.css'
  #   @styles << 'css/app.css'

  #   @scripts << 'lib/underscore/underscore.min.js'
  #   @scripts << 'lib/angular/angular.min.js'
  #   @scripts << 'lib/angular/angular-ui-router.min.js'
  #   @scripts << 'js/app.min.js'
  # end

  # configure :development do
  #   @styles << 'lib/bootstrap/css/bootstrap.css'
  #   @styles << 'css/app.css'

  #   @scripts << 'lib/underscore/underscore.js'
  #   @scripts << 'js/mixins/deepExtend.js'
  #   @scripts << 'lib/angular/angular.js'
  #   @scripts << 'lib/angular/angular-ui-router.js'
  #   @scripts << 'js/app.js'
  #   @scripts << 'js/controllers/backupCtrl.js' 
  #   @scripts << 'js/controllers/listCtrl.js' 
  #   @scripts << 'js/controllers/listEditCtrl.js' 
  #   @scripts << 'js/controllers/listViewCtrl.js' 
  #   @scripts << 'js/controllers/filterEditCtrl.js' 
  #   @scripts << 'js/controllers/mainCtrl.js' 
  #   @scripts << 'js/controllers/statsCtrl.js' 
  #   @scripts << 'js/services/backup.js' 
  #   @scripts << 'js/services/battle.js' 
  #   @scripts << 'js/services/battleDisplay.js' 
  #   @scripts << 'js/services/events.js' 
  #   @scripts << 'js/services/export.js' 
  #   @scripts << 'js/services/factions.js' 
  #   @scripts << 'js/services/filter.js' 
  #   @scripts << 'js/services/opponents.js' 
  #   @scripts << 'js/services/scenarios.js' 
  #   @scripts << 'js/services/scores.js' 
  #   @scripts << 'js/services/selection.js' 
  #   @scripts << 'js/services/sort.js' 
  #   @scripts << 'js/services/statEntry.js' 
  #   @scripts << 'js/services/statSelector.js' 
  #   @scripts << 'js/services/stats.js' 
  #   @scripts << 'js/services/storage.js' 
  #   @scripts << 'js/services/tags.js' 
  #   @scripts << 'js/directives/collapse.js' 
  #   @scripts << 'js/directives/pieChart.js' 
  #   @scripts << 'js/directives/export_link.js' 
  #   @scripts << 'js/directives/sortBy.js' 
  #   @scripts << 'js/directives/statBar.js' 
  #   @scripts << 'js/directives/whenScrolled.js' 
  #   @scripts << 'js/directives/appCacheProgressBar.js' 
  #   @scripts << 'js/filters/battleFilter.js'
  #   @scripts << 'js/filters/capitaliseFilter.js'
  #   @scripts << 'js/filters/initiativeFilter.js'
  #   @scripts << 'js/filters/scoreResultColorFilter.js'
  # end

  # attr_reader :logs

  def initialize
    super
    @models = ModelCollection.new
  end

  set :server, :thin
  set :public_folder, File.join(File.dirname(__FILE__), '..', 'client')
  # set :static_cache_control, [:no_cache]
  set :views, File.join(File.dirname(__FILE__), '..', 'client')

  # before do
  #   expires 0
  #   cache_control :no_cache, :must_revalidate
  # end

  # get "/" do
  #   erb :index
  # end

  # get "/index.html" do
  #   erb :index
  # end

  # get '/manifest.appcache' do
  #   content_type :manifest
  #   erb :manifest_appcache
  # end

  get "/api/models" do
    @models.all.to_json
  end

  get "/api/models/subscribe", :provides => 'text/event-stream' do
    stream(:keep_open) do |out| 
      out.callback { @models.removeConnection out }
      out << "retry:0\n\n"
      @models.addConnection out
    end
  end

  put "/api/models/:id" do
    data = JSON.parse request.body.read
    id = params[:id].to_i
    if @models.exists? id
      @models[id] = data
      status 200
    else
      status 404
    end
  end
end
