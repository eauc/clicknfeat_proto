class MessageCollection
  
  def initialize
    @messages = []
    @connections = []
  end

  def add data
    @messages << data
    signalConnections @messages.length-1
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
    data = @messages[i].to_json
    connections.each do |out|
      out << "retry:100\ndata:#{data}\n\n"
      # out.close
    end
  end

  def to_json
    @messages.to_json
  end
end
