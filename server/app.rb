require 'sinatra/base'
require 'json'

require_relative './lib/game_collection'
require_relative './lib/user_collection'

class VassalApp < Sinatra::Base

  def initialize
    super
    @games = GameCollection.new
    @users = UserCollection.new
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

  get "/api/games/subscribe", :provides => 'text/event-stream' do
    stream(:keep_open) do |out| 
      out << "retry:100\n\n"
      @games.addConnection out
    end
  end

  post "/api/games" do
    content_type 'text/json'
    data = JSON.parse request.body.read
    @games.create(data).to_json true
  end

  get "/api/games/:game_id" do
    game_id = params[:game_id].to_i
    return status 404 unless @games.exist? game_id

    content_type 'text/json'
    @games[game_id].to_json true
  end

  get "/api/games/public/:game_id" do
    game_id = params[:game_id].to_i
    return status 404 unless @games.public_exist? game_id

    content_type 'text/json'
    @games.public(game_id).to_json false
  end

  put "/api/games/:game_id/player2" do
    game_id = params[:game_id].to_i
    return status 404 unless @games.exist? game_id
    game = @games[game_id]

    data = JSON.parse request.body.read
    game.player2=data
    @games.signalConnections
    game.to_json true
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

  get "/api/games/public/:game_id/commands/subscribe", :provides => 'text/event-stream' do
    game_id = params[:game_id].to_i
    return status 404 unless @games.public_exist? game_id
    game = @games.public(game_id)

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

  get "/api/users" do
    content_type 'text/json'
    @users.list.to_json
  end

  get "/api/users/subscribe", :provides => 'text/event-stream' do
    stream(:keep_open) do |out| 
      out << "retry:100\n\n"
      @users.addConnection out
    end
  end

  post "/api/users" do
    content_type 'text/json'
    data = JSON.parse request.body.read
    @users.create(data).to_json
  end

  post "/api/users/chat" do
    data = JSON.parse request.body.read
    @users.chatMsg data
    status 200
  end

  get "/api/users/:user_id" do
    user_id = params[:user_id].to_i
    return status 404 unless @users.exist? user_id

    content_type 'text/json'
    @users[user_id].to_json
  end

  put "/api/users/:user_id" do
    user_id = params[:user_id].to_i
    return status 404 unless @users.exist? user_id
    data = JSON.parse request.body.read
    return status 400 unless data['stamp'] == @users[user_id]['stamp']
    @users[user_id] = data
    status 200
  end

  get "/api/users/:user_id/subscribe", :provides => 'text/event-stream' do
    user_id = params[:user_id].to_i
    return status 404 unless @users.exist? user_id

    stream(:keep_open) do |out|
      out << "retry:100\n\n"
      @users.addUserConnection user_id, out
    end
  end

end
