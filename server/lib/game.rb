require_relative './command_collection'

class Game
  
  attr_reader :commands
  attr_reader :id
  attr_reader :public_id
  attr_reader :player1
  attr_reader :player2

  def initialize id, data
    @id = id[:private]
    @public_id = id[:public]
    @new_model_id = 0
    if data.key?('models')
      max_id = data['models'].keys.max
      puts max_id.inspect
      @new_model_id = 10000*((max_id.to_i/10000).floor)
    end
    @commands = CommandCollection.new(data.key?('commands') ? data['commands'] : nil)
    
    @replay_commands = data.key?('replay_commands') ? data['replay_commands'] : []
    @player1 = data.key?('player1') ? data['player1'] : {}
    @player2 = { name: 'John Doe'}
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

  def player2= data
    return nil if @player2.key?('id')
    @player2 = data
    @commands.signalGameUpdate self
  end

  def to_json priv, *a
    @new_model_id += 10000 if priv
    view = {
      public_id: @public_id,
      new_model_id: @new_model_id,
      replay_commands: @replay_commands,
      player1: @player1,
      player2: @player2
    }
    view[:id] = @id if priv
    view.to_json *a
  end
end
