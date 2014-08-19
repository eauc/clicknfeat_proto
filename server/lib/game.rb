require_relative './model_collection'

class Game
  
  attr_reader :models

  def initialize id
    @id = id
    @models = ModelCollection.new
  end

  def generate_id
    id = SecureRandom.random_number(ID_MAX).to_s
    i = 0
    until not @games.has_key? id or i >= ID_MAX
      id = (id + 1) % ID_MAX
    end
    id
  end

  def create
    i = generate_id
    @games[i] = new Game i
  end

  def exists? i
    @games.has_key? i
  end

  def [] i
    @games[i]
  end

  def to_json
    "{ \"id\": #{@id}, \"models\": #{@models.to_json} }"
  end
end
