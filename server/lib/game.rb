require_relative './command_collection'

class Game
  
  attr_reader :commands

  def initialize i, data
    @id = i
    @new_model_id = 0
    @commands = CommandCollection.new(data.key?('commands') ? data['commands'] : nil)
    
    @replay_commands = data.key?('replay_commands') ? data['replay_commands'] : []
  end

  def undoCommand stamp
    cmd = @commands.undo stamp
    if cmd
      @replay_commands << cmd
    end
    cmd
  end

  def addCommand data
    @replay_commands.delete_if { |cmd| cmd['stamp'] === data['stamp'] }
    @commands.add data
  end

  def to_json
    @new_model_id += 10000
    "{ \"id\": #{@id}, \"new_model_id\": #{@new_model_id}, \"commands\": #{@commands.to_json}, \"replay_commands\": #{@replay_commands.to_json} }"
  end
end
