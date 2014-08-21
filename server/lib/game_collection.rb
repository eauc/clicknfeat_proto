require 'securerandom'
require_relative './game'

class GameCollection
  
  ID_MAX = 1000000

  def initialize
    @games = {}
  end

  def generate_id
    id = SecureRandom.random_number(ID_MAX)
    i = 0
    until not @games.has_key? id or i >= ID_MAX
      id = (id + 1) % ID_MAX
    end
    id
  end

  def create data
    i = generate_id
    @games[i] = Game.new i, data
  end

  def exist? i
    @games.has_key? i
  end

  def [] i
    @games[i]
  end

  def list
    @games.keys
  end
end
