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
    data = JSON.parse request.body.read
    @games.create(data).to_json
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

    # puts params.inspect
    last = if params.key? 'last'
             params['last'].to_i
           else
             nil
           end
    # puts last.inspect
    stream(:keep_open) do |out| 
      # out.callback { @models.removeConnection out }
      out << "retry:100\n\n"
      game.commands.addConnection out, last
    end
  end

  put "/api/games/:game_id/commands/undo" do
    game_id = params[:game_id].to_i
    return status 404 unless @games.exist? game_id
    game = @games[game_id]

    data = JSON.parse request.body.read
    cmd = game.undoCommand data['stamp']
    if cmd
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
    game.addCommand data
    status 200
  end

  get "/api/games/:game_id/messages/subscribe", :provides => 'text/event-stream' do
    game_id = params[:game_id].to_i
    return status 404 unless @games.exist? game_id
    game = @games[game_id]

    # puts params.inspect
    last = if params.key? 'last'
             params['last'].to_i
           else
             nil
           end
    # puts last.inspect
    stream(:keep_open) do |out| 
      # out.callback { @models.removeConnection out }
      out << "retry:100\n\n"
      game.messages.addConnection out, last
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
