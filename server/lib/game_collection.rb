require 'securerandom'
require_relative './game'

class GameCollection
  
  ID_MAX = 1000000

  def initialize
    @ids = {}
    @games = {}
    @public_games = {}
    @connections = []
  end

  def generate_id
    id = SecureRandom.random_number(ID_MAX)
    i = 0
    until not @ids.has_key? id or i >= ID_MAX
      id = (id + 1) % ID_MAX
    end
    @ids[id] = true
    id
  end

  def create data
    id = {
      private: generate_id,
      public: generate_id
    }
    @games[id[:private]] = Game.new id, data
    @public_games[id[:public]] = @games[id[:private]]

    self.signalConnections

    @games[id[:private]]
  end

  def exist? i
    @games.has_key? i
  end
  def public_exist? i
    @public_games.has_key? i
  end

  def [] i
    @games[i]
  end
  def public i
    @public_games[i]
  end

  def list
    @games.values.map do |game|
      {
        public_id: game.public_id,
        player1: game.player1,
        player2: game.player2
      }
    end
  end
    
  def connections
    @connections.reject! do |conn|
      (not conn[:out].respond_to?('closed?')) or conn[:out].closed?
    end
    @connections
  end

  def addConnection out, close
    connections << { out: out, close: close }

    if not close
      data = self.list.to_json
      out << "retry:100\ndata:#{data}\n\n"
    end
  end

  def signalConnections
    data = self.list.to_json
    connections.each do |conn|
      conn[:out] << "retry:100\ndata:#{data}\n\n"
      if conn[:close] and conn[:out].respond_to? 'close'
        conn[:out].close
      end
    end
  end

end
