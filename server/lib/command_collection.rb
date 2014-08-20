class CommandCollection
  
  def initialize
    @commands = []
    @connections = []
  end

  def add data
    @commands << data
    signalConnections @commands.length-1
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

  def addConnection out
    connections << out
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

  def signalConnections i
    data = @commands[i].to_json
    connections.each do |out|
      out << "retry:100\ndata:#{data}\n\n"
      # out.close
    end
  end

  def to_json
    @commands.to_json
  end
end
