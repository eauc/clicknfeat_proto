require_relative './model_collection'
require_relative './command_collection'
require_relative './message_collection'

class Game
  
  attr_reader :models
  attr_reader :commands
  attr_reader :messages

  def initialize i, data
    @id = i
    @new_model_id = 0
    @models = ModelCollection.new(data.key?('models') ? data['models'] : nil)
    @commands = CommandCollection.new(data.key?('commands') ? data['commands'] : nil)
    @messages = MessageCollection.new(data.key?('messages') ? data['messages'] : nil)
    
    @ruler = data.key?('ruler') ? data['ruler'] : nil
    @selection = data.key?('selection') ? data['selection'] : nil
    @layers = data.key?('layers') ? data['layers'] : nil
  end

  def to_json
    @new_model_id += 10000
    "{ \"id\": #{@id}, \"new_model_id\": #{@new_model_id}, \"ruler\": #{@ruler.to_json}, \"selection\": #{@selection.to_json}, \"layers\": #{@layers.to_json}, \"models\": #{@models.to_json}, \"commands\": #{@commands.to_json}, \"messages\": #{@messages.to_json} }"
  end
end
