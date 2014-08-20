require_relative './model_collection'
require_relative './command_collection'

class Game
  
  attr_reader :models
  attr_reader :commands

  def initialize id
    @id = id
    @models = ModelCollection.new
    @commands = CommandCollection.new
  end

  def to_json
    "{ \"id\": #{@id}, \"models\": #{@models.to_json}, \"commands\": #{@commands.to_json} }"
  end
end
