class CommandCollection
  
  def initialize data
    @commands = data || []
    @connections = []
  end

  def add data
    @commands << data unless data.key?('do_not_log') and data['do_not_log']
    signalConnections data
  end

  def undo stamp
    return false if @commands.empty? or @commands[-1]['stamp'] != stamp
    cmd = @commands.pop
    
    data = cmd.to_json
    connections.each do |out|
      out << "retry:100\nevent:undo\ndata:#{data}\n\n"
      # out.close
    end
  end
    
  def connections
    @connections.reject!(&:closed?)
    @connections
  end

  def addConnection out, last
    connections << out
    first = @commands.index do |c|
      c['stamp'] == last
    end
    first = first || -1
    # puts first.inspect
    @commands.each_with_index do |command, index|
      if index > first
        # puts command.inspect
        data = command.to_json
        out << "retry:100\ndata:#{data}\n\n"
      end
    end
  end

  def removeConnection out
    connections.delete(out)
  end

  def closeAllConnections
    connections.each do |out|
      out.close
    end
    @connections = []
  end

  def signalConnections data
    data = data.to_json
    connections.each do |out|
      out << "retry:100\ndata:#{data}\n\n"
      # out.close
    end
  end

  def to_json
    @commands.to_json
  end
end
