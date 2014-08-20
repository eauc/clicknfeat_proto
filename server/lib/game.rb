require_relative './model_collection'
require_relative './command_collection'
require_relative './message_collection'

class Game
  
  attr_reader :models
  attr_reader :commands
  attr_reader :messages

  def initialize id
    @id = id
    @models = ModelCollection.new
    @commands = CommandCollection.new
    @messages = MessageCollection.new
  end

  def to_json
    "{ \"id\": #{@id}, \"models\": #{@models.to_json}, \"commands\": #{@commands.to_json}, \"messages\": #{@messages.to_json} }"
  end
end
