require 'sinatra/base'
require 'json'

require_relative './lib/game_collection'

class VassalApp < Sinatra::Base

  def initialize
    super
    @games = GameCollection.new
  end

  set :server, :thin
  set :public_folder, File.join(File.dirname(__FILE__), '..', 'client')
  set :views, File.join(File.dirname(__FILE__), '..', 'client')

  get '/' do
    redirect '/index.html'
  end

  get "/api/games" do
    content_type 'text/json'
    @games.list.to_json
  end

  post "/api/games" do
    content_type 'text/json'
    @games.create.to_json
  end

  get "/api/games/:game_id" do
    game_id = params[:game_id].to_i
    return status 404 unless @games.exist? game_id

    content_type 'text/json'
    @games[game_id].to_json
  end

  get "/api/games/:game_id/commands/subscribe", :provides => 'text/event-stream' do
    game_id = params[:game_id].to_i
    return status 404 unless @games.exist? game_id
    game = @games[game_id]

    stream(:keep_open) do |out| 
      # out.callback { @models.removeConnection out }
      out << "retry:100\n\n"
      game.commands.addConnection out
    end
  end

  put "/api/games/:game_id/commands/undo" do
    game_id = params[:game_id].to_i
    return status 404 unless @games.exist? game_id
    game = @games[game_id]

    data = JSON.parse request.body.read
    if game.commands.undo data['stamp']
      status 200
    else
      status 400
    end
  end

  post "/api/games/:game_id/commands" do
    game_id = params[:game_id].to_i
    return status 404 unless @games.exist? game_id
    game = @games[game_id]

    data = JSON.parse request.body.read
    game.commands.add data
    status 200
  end

  get "/api/games/:game_id/messages/subscribe", :provides => 'text/event-stream' do
    game_id = params[:game_id].to_i
    return status 404 unless @games.exist? game_id
    game = @games[game_id]

    stream(:keep_open) do |out| 
      # out.callback { @models.removeConnection out }
      out << "retry:100\n\n"
      game.messages.addConnection out
    end
  end

  post "/api/games/:game_id/messages" do
    game_id = params[:game_id].to_i
    return status 404 unless @games.exist? game_id
    game = @games[game_id]

    data = JSON.parse request.body.read
    game.messages.add data
    status 200
  end
end
