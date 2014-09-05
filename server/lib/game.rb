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
    # @models = ModelCollection.new(data.key?('models') ? data['models'] : nil)
    @commands = CommandCollection.new(data.key?('commands') ? data['commands'] : nil)
    @messages = MessageCollection.new(data.key?('messages') ? data['messages'] : nil)
    
    @replay_commands = data.key?('replay_commands') ? data['replay_commands'] : []
    # @ruler = data.key?('ruler') ? data['ruler'] : nil
    # @selection = data.key?('selection') ? data['selection'] : nil
    # @layers = data.key?('layers') ? data['layers'] : nil
  end

  def to_json
    @new_model_id += 10000
    "{ \"id\": #{@id}, \"new_model_id\": #{@new_model_id}, \"commands\": #{@commands.to_json}, \"messages\": #{@messages.to_json}, \"replay_commands\": #{@replay_commands.to_json} }"
  end
end
